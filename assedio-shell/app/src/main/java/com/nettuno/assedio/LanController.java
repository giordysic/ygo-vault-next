package com.nettuno.assedio;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

final class LanController {
    interface Listener {
        void onStatus(String status, JSONObject data);
        void onMessage(String rawJson);
    }

    static final int PORT = 42424;
    private static final int PROTOCOL = 1;
    private static final int CONNECT_TIMEOUT_MS = 7000;
    private static final int HANDSHAKE_TIMEOUT_MS = 8000;
    private static final int MAX_MESSAGE_CHARS = 1_000_000;

    private final Listener listener;
    private final ExecutorService io;
    private final Object lock = new Object();
    private final SecureRandom random = new SecureRandom();

    private volatile ServerSocket serverSocket;
    private volatile Socket socket;
    private volatile BufferedWriter writer;
    private volatile String role = "none";
    private volatile int playerNumber;
    private volatile String pin = "";
    private volatile String hostAddress = "";
    private volatile boolean connected;
    private volatile boolean shuttingDown;

    LanController(Listener listener) {
        this.listener = listener;
        AtomicInteger index = new AtomicInteger(1);
        ThreadFactory factory = runnable -> {
            Thread thread = new Thread(runnable, "AssedioLan-" + index.getAndIncrement());
            thread.setDaemon(true);
            return thread;
        };
        io = Executors.newCachedThreadPool(factory);
    }

    void startHost() {
        disconnectInternal(false, "");
        role = "host";
        playerNumber = 1;
        pin = String.format(Locale.ITALY, "%04d", 1000 + random.nextInt(9000));
        hostAddress = findLocalIpv4();
        emit("starting", json("role", role, "player", playerNumber));

        io.execute(() -> {
            try {
                ServerSocket server = new ServerSocket();
                server.setReuseAddress(true);
                server.bind(new InetSocketAddress(PORT));
                serverSocket = server;
                emit("hosting", json("role", role, "player", playerNumber, "ip", hostAddress, "port", PORT, "pin", pin));

                while (!shuttingDown && serverSocket == server && !server.isClosed()) {
                    Socket candidate = server.accept();
                    candidate.setTcpNoDelay(true);
                    candidate.setKeepAlive(true);
                    if (acceptHostHandshake(candidate)) {
                        try { server.close(); } catch (IOException ignored) {}
                        if (serverSocket == server) serverSocket = null;
                        return;
                    }
                }
            } catch (Throwable error) {
                if (!shuttingDown && !isExpectedClose(error)) emitError("Impossibile creare la partita Wi-Fi", error);
            }
        });
    }

    void connect(String address, String enteredPin) {
        String cleanAddress = address == null ? "" : address.trim();
        String cleanPin = enteredPin == null ? "" : enteredPin.trim();
        if (cleanAddress.isEmpty()) {
            emitError("Inserisci l'indirizzo IP del dispositivo host", null);
            return;
        }
        if (!cleanPin.matches("\\d{4}")) {
            emitError("Il codice della stanza deve avere 4 cifre", null);
            return;
        }

        disconnectInternal(false, "");
        role = "client";
        playerNumber = 2;
        hostAddress = cleanAddress;
        pin = cleanPin;
        emit("connecting", json("role", role, "player", playerNumber, "ip", cleanAddress));

        io.execute(() -> {
            Socket candidate = new Socket();
            try {
                candidate.connect(new InetSocketAddress(cleanAddress, PORT), CONNECT_TIMEOUT_MS);
                candidate.setTcpNoDelay(true);
                candidate.setKeepAlive(true);
                candidate.setSoTimeout(HANDSHAKE_TIMEOUT_MS);
                BufferedReader reader = new BufferedReader(new InputStreamReader(candidate.getInputStream(), StandardCharsets.UTF_8));
                BufferedWriter candidateWriter = new BufferedWriter(new OutputStreamWriter(candidate.getOutputStream(), StandardCharsets.UTF_8));
                writeLine(candidateWriter, json("type", "hello", "protocol", PROTOCOL, "pin", cleanPin).toString());

                String line = reader.readLine();
                if (line == null) throw new IOException("Connessione chiusa durante l'accesso");
                JSONObject response = new JSONObject(line);
                if ("error".equals(response.optString("type"))) throw new IOException(response.optString("message", "Accesso rifiutato"));
                if (!"welcome".equals(response.optString("type")) || response.optInt("protocol") != PROTOCOL) {
                    throw new IOException("Versione di ASSEDIO non compatibile");
                }
                candidate.setSoTimeout(0);
                attachPeer(candidate, candidateWriter, reader, true);
            } catch (Throwable error) {
                try { candidate.close(); } catch (IOException ignored) {}
                if (!shuttingDown && !isExpectedClose(error)) {
                    emitError("Connessione alla partita non riuscita", error);
                    disconnectInternal(false, "");
                }
            }
        });
    }

    private boolean acceptHostHandshake(Socket candidate) {
        try {
            candidate.setSoTimeout(HANDSHAKE_TIMEOUT_MS);
            BufferedReader reader = new BufferedReader(new InputStreamReader(candidate.getInputStream(), StandardCharsets.UTF_8));
            BufferedWriter candidateWriter = new BufferedWriter(new OutputStreamWriter(candidate.getOutputStream(), StandardCharsets.UTF_8));
            String line = reader.readLine();
            if (line == null || line.length() > 4096) throw new IOException("Handshake non valido");
            JSONObject hello = new JSONObject(line);
            if (!"hello".equals(hello.optString("type")) || hello.optInt("protocol") != PROTOCOL) {
                sendHandshakeError(candidateWriter, "Versione di ASSEDIO non compatibile");
                candidate.close();
                return false;
            }
            if (!pin.equals(hello.optString("pin"))) {
                sendHandshakeError(candidateWriter, "Codice stanza errato");
                candidate.close();
                emit("rejected", json("message", "Tentativo rifiutato: codice errato"));
                return false;
            }
            writeLine(candidateWriter, json("type", "welcome", "protocol", PROTOCOL, "player", 2).toString());
            candidate.setSoTimeout(0);
            attachPeer(candidate, candidateWriter, reader, true);
            return true;
        } catch (Throwable error) {
            try { candidate.close(); } catch (IOException ignored) {}
            if (!isExpectedClose(error)) emit("rejected", json("message", "Dispositivo rifiutato"));
            return false;
        }
    }

    private void sendHandshakeError(BufferedWriter target, String message) {
        try { writeLine(target, json("type", "error", "message", message).toString()); } catch (Throwable ignored) {}
    }

    private void attachPeer(Socket newSocket, BufferedWriter newWriter, BufferedReader reader, boolean fresh) {
        synchronized (lock) {
            socket = newSocket;
            writer = newWriter;
            connected = true;
        }
        emit("connected", json("role", role, "player", playerNumber,
            "ip", role.equals("host") ? hostAddress : safeRemoteAddress(newSocket), "port", PORT, "fresh", fresh));
        io.execute(() -> readLoop(newSocket, reader));
    }

    private void readLoop(Socket activeSocket, BufferedReader reader) {
        try {
            String line;
            while (!shuttingDown && activeSocket == socket && (line = reader.readLine()) != null) {
                if (line.isEmpty()) continue;
                if (line.length() > MAX_MESSAGE_CHARS) throw new IOException("Messaggio di rete troppo grande");
                listener.onMessage(line);
            }
            if (!shuttingDown && activeSocket == socket) disconnectInternal(true, "L'altro giocatore ha lasciato la partita");
        } catch (Throwable error) {
            if (!shuttingDown && activeSocket == socket && !isExpectedClose(error)) disconnectInternal(true, "Connessione Wi-Fi interrotta");
        }
    }

    void send(String rawJson) {
        if (rawJson == null || rawJson.isEmpty() || rawJson.length() > MAX_MESSAGE_CHARS || rawJson.indexOf('\n') >= 0 || rawJson.indexOf('\r') >= 0) return;
        BufferedWriter currentWriter = writer;
        if (!connected || currentWriter == null) return;
        io.execute(() -> {
            try {
                synchronized (lock) {
                    if (currentWriter != writer || !connected) return;
                    writeLine(currentWriter, rawJson);
                }
            } catch (Throwable error) {
                if (!shuttingDown) disconnectInternal(true, "Invio non riuscito: connessione persa");
            }
        });
    }

    void disconnect() { disconnectInternal(true, "Partita Wi-Fi chiusa"); }

    void reannounce() {
        if (connected) {
            emit("connected", json("role", role, "player", playerNumber, "ip", hostAddress, "port", PORT, "fresh", false));
        } else if ("host".equals(role) && serverSocket != null && !serverSocket.isClosed()) {
            emit("hosting", json("role", role, "player", playerNumber, "ip", hostAddress, "port", PORT, "pin", pin));
        } else emit("idle", new JSONObject());
    }

    void shutdown() {
        shuttingDown = true;
        disconnectInternal(false, "");
        io.shutdownNow();
    }

    private void disconnectInternal(boolean notify, String reason) {
        Socket oldSocket;
        ServerSocket oldServer;
        synchronized (lock) {
            connected = false;
            writer = null;
            oldSocket = socket;
            socket = null;
            oldServer = serverSocket;
            serverSocket = null;
        }
        if (oldSocket != null) try { oldSocket.close(); } catch (IOException ignored) {}
        if (oldServer != null) try { oldServer.close(); } catch (IOException ignored) {}
        if (notify) emit("disconnected", json("message", reason));
    }

    private static void writeLine(BufferedWriter target, String line) throws IOException {
        target.write(line);
        target.write('\n');
        target.flush();
    }

    private static String safeRemoteAddress(Socket value) {
        InetAddress address = value.getInetAddress();
        return address == null ? "" : address.getHostAddress();
    }

    static String findLocalIpv4() {
        String fallback = "";
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            if (interfaces == null) return fallback;
            for (NetworkInterface network : Collections.list(interfaces)) {
                try { if (!network.isUp() || network.isLoopback()) continue; } catch (SocketException ignored) { continue; }
                String name = network.getName() == null ? "" : network.getName().toLowerCase(Locale.ROOT);
                for (InetAddress address : Collections.list(network.getInetAddresses())) {
                    if (!(address instanceof Inet4Address) || address.isLoopbackAddress() || !address.isSiteLocalAddress()) continue;
                    String host = address.getHostAddress();
                    if (name.startsWith("wlan") || name.startsWith("wifi") || name.startsWith("ap")) return host;
                    if (fallback.isEmpty()) fallback = host;
                }
            }
        } catch (Throwable ignored) {}
        return fallback;
    }

    private boolean isExpectedClose(Throwable error) {
        if (error instanceof SocketException) {
            String message = error.getMessage();
            return message != null && message.toLowerCase(Locale.ROOT).contains("closed");
        }
        return false;
    }

    private void emitError(String prefix, Throwable error) {
        String detail = error == null ? "" : error.getMessage();
        if (detail == null || detail.trim().isEmpty()) detail = error == null ? "" : error.getClass().getSimpleName();
        emit("error", json("message", detail.isEmpty() ? prefix : prefix + ": " + detail));
    }

    private void emit(String status, JSONObject data) { listener.onStatus(status, data == null ? new JSONObject() : data); }

    private static JSONObject json(Object... values) {
        JSONObject object = new JSONObject();
        for (int i = 0; i + 1 < values.length; i += 2) {
            try { object.put(String.valueOf(values[i]), values[i + 1]); } catch (Throwable ignored) {}
        }
        return object;
    }
}
