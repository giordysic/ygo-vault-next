package com.nettuno.assedio;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

final class LanController {
    interface Listener {
        void onStatus(String status, JSONObject data);
        void onMessage(String rawJson);
    }

    static final int PORT = 42424;
    private static final int DISCOVERY_PORT = 42425;
    private static final int PROTOCOL = 1;
    private static final int CONNECT_TIMEOUT_MS = 3500;
    private static final int HANDSHAKE_TIMEOUT_MS = 6000;
    private static final int READ_POLL_MS = 1800;
    private static final int HEARTBEAT_INTERVAL_MS = 2500;
    private static final int PEER_TIMEOUT_MS = 11000;
    private static final int DISCOVERY_INTERVAL_MS = 1800;
    private static final int MAX_RECONNECT_DELAY_MS = 5000;
    private static final int MAX_MESSAGE_CHARS = 1_000_000;
    private static final String DISCOVERY_PREFIX = "ASSEDIO-LAN|1|";

    private final Listener listener;
    private final ExecutorService io;
    private final Object lock = new Object();
    private final Object reconnectWake = new Object();
    private final SecureRandom random = new SecureRandom();
    private final AtomicInteger sessionGeneration = new AtomicInteger(1);
    private final AtomicInteger peerGeneration = new AtomicInteger(1);
    private final AtomicBoolean hostServerLoopRunning = new AtomicBoolean();
    private final AtomicBoolean reconnectLoopRunning = new AtomicBoolean();
    private final AtomicBoolean beaconLoopRunning = new AtomicBoolean();
    private final AtomicBoolean discoveryLoopRunning = new AtomicBoolean();

    private volatile ServerSocket serverSocket;
    private volatile Socket socket;
    private volatile BufferedWriter writer;
    private volatile DatagramSocket discoverySocket;
    private volatile String role = "none";
    private volatile int playerNumber;
    private volatile String pin = "";
    private volatile String hostAddress = "";
    private volatile String localAddress = "";
    private volatile boolean connected;
    private volatile boolean shuttingDown;
    private volatile boolean manualDisconnect = true;
    private volatile boolean everConnected;
    private volatile long lastPeerSeen;

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
        stopSession(false, "");
        manualDisconnect = false;
        role = "host";
        playerNumber = 1;
        pin = String.format(Locale.ITALY, "%04d", 1000 + random.nextInt(9000));
        localAddress = findLocalIpv4();
        hostAddress = localAddress;
        everConnected = false;
        emit("starting", json("role", role, "player", playerNumber));
        ensureHostServer();
        startHostBeaconLoop();
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

        stopSession(false, "");
        manualDisconnect = false;
        role = "client";
        playerNumber = 2;
        hostAddress = cleanAddress;
        pin = cleanPin;
        localAddress = findLocalIpv4();
        everConnected = false;
        emit("connecting", json("role", role, "player", playerNumber, "ip", cleanAddress, "attempt", 1));
        startDiscoveryLoop();
        startClientReconnectLoop();
    }

    private void ensureHostServer() {
        if (!isActiveHost(sessionGeneration.get())) return;
        final int session = sessionGeneration.get();
        if (!hostServerLoopRunning.compareAndSet(false, true)) return;
        io.execute(() -> {
            try {
                while (isActiveHost(session)) {
                    ServerSocket server = null;
                    try {
                        server = new ServerSocket();
                        server.setReuseAddress(true);
                        server.bind(new InetSocketAddress(PORT));
                        synchronized (lock) {
                            if (!isActiveHost(session)) {
                                try { server.close(); } catch (IOException ignored) {}
                                return;
                            }
                            serverSocket = server;
                        }
                        refreshLocalAddress();
                        emitHostWaitingStatus();

                        while (isActiveHost(session) && serverSocket == server && !server.isClosed()) {
                            Socket candidate = server.accept();
                            configureSocket(candidate);
                            acceptHostHandshake(candidate, session);
                        }
                    } catch (Throwable error) {
                        if (isActiveHost(session) && !isExpectedClose(error)) {
                            emit("reconnecting", json("role", role, "player", playerNumber,
                                "message", "Ripristino server Wi-Fi locale…"));
                        }
                    } finally {
                        synchronized (lock) {
                            if (serverSocket == server) serverSocket = null;
                        }
                        if (server != null) try { server.close(); } catch (IOException ignored) {}
                    }
                    if (isActiveHost(session)) sleepQuietly(900);
                }
            } finally {
                hostServerLoopRunning.set(false);
                if (isActiveHost(session)) ensureHostServer();
            }
        });
    }

    private void emitHostWaitingStatus() {
        JSONObject data = json("role", role, "player", playerNumber, "ip", hostAddress,
            "port", PORT, "pin", pin, "resume", everConnected);
        if (everConnected && !connected) {
            try { data.put("message", "Stanza attiva: attendo il ritorno dell'avversario…"); } catch (Throwable ignored) {}
            emit("reconnecting", data);
        } else if (!connected) {
            emit("hosting", data);
        }
    }

    private void acceptHostHandshake(Socket candidate, int session) {
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
                return;
            }
            if (!pin.equals(hello.optString("pin"))) {
                sendHandshakeError(candidateWriter, "Codice stanza errato");
                candidate.close();
                emit("rejected", json("message", "Tentativo rifiutato: codice errato"));
                return;
            }
            if (!isActiveHost(session)) {
                candidate.close();
                return;
            }
            boolean fresh = !everConnected;
            writeLine(candidateWriter, json("type", "welcome", "protocol", PROTOCOL,
                "player", 2, "fresh", fresh).toString());
            candidate.setSoTimeout(READ_POLL_MS);
            attachPeer(candidate, candidateWriter, reader, fresh, session);
            everConnected = true;
        } catch (Throwable error) {
            try { candidate.close(); } catch (IOException ignored) {}
            if (isActiveHost(session) && !isExpectedClose(error)) {
                emit("rejected", json("message", "Dispositivo rifiutato"));
            }
        }
    }

    private void startClientReconnectLoop() {
        final int session = sessionGeneration.get();
        if (!isActiveClient(session) || connected) return;
        if (!reconnectLoopRunning.compareAndSet(false, true)) {
            wakeReconnectLoop();
            return;
        }
        io.execute(() -> {
            int attempt = 0;
            try {
                while (isActiveClient(session) && !connected) {
                    attempt++;
                    String target = hostAddress;
                    boolean firstAttempt = !everConnected && attempt == 1;
                    if (target == null || target.trim().isEmpty()) {
                        emit("reconnecting", json("role", role, "player", playerNumber,
                            "attempt", attempt, "message", "Cerco automaticamente il telefono host…"));
                    } else {
                        emit(firstAttempt ? "connecting" : "reconnecting",
                            json("role", role, "player", playerNumber, "ip", target,
                                "attempt", attempt, "message", firstAttempt
                                    ? "Connessione al telefono host…"
                                    : "Riconnessione automatica in corso…"));
                        try {
                            connectClientOnce(target, session);
                            if (connected) return;
                        } catch (Throwable error) {
                            if (isActiveClient(session) && !isExpectedClose(error)) {
                                emit("reconnecting", json("role", role, "player", playerNumber,
                                    "ip", target, "attempt", attempt,
                                    "message", "Segnale perso: continuo a cercare la stanza…"));
                            }
                        }
                    }
                    startDiscoveryLoop();
                    long delay = Math.min(MAX_RECONNECT_DELAY_MS,
                        700L * (1L << Math.min(3, Math.max(0, attempt - 1))));
                    delay += random.nextInt(350);
                    waitForReconnectSignal(delay);
                }
            } finally {
                reconnectLoopRunning.set(false);
                if (isActiveClient(session) && !connected) startClientReconnectLoop();
            }
        });
    }

    private void connectClientOnce(String address, int session) throws Exception {
        Socket candidate = new Socket();
        try {
            candidate.connect(new InetSocketAddress(address, PORT), CONNECT_TIMEOUT_MS);
            configureSocket(candidate);
            candidate.setSoTimeout(HANDSHAKE_TIMEOUT_MS);
            BufferedReader reader = new BufferedReader(new InputStreamReader(candidate.getInputStream(), StandardCharsets.UTF_8));
            BufferedWriter candidateWriter = new BufferedWriter(new OutputStreamWriter(candidate.getOutputStream(), StandardCharsets.UTF_8));
            writeLine(candidateWriter, json("type", "hello", "protocol", PROTOCOL,
                "pin", pin, "resume", everConnected).toString());

            String line = reader.readLine();
            if (line == null) throw new IOException("Connessione chiusa durante l'accesso");
            JSONObject response = new JSONObject(line);
            if ("error".equals(response.optString("type"))) {
                throw new IOException(response.optString("message", "Accesso rifiutato"));
            }
            if (!"welcome".equals(response.optString("type")) || response.optInt("protocol") != PROTOCOL) {
                throw new IOException("Versione di ASSEDIO non compatibile");
            }
            if (!isActiveClient(session)) throw new IOException("Sessione chiusa");
            candidate.setSoTimeout(READ_POLL_MS);
            boolean fresh = response.optBoolean("fresh", !everConnected);
            attachPeer(candidate, candidateWriter, reader, fresh, session);
            everConnected = true;
        } catch (Throwable error) {
            try { candidate.close(); } catch (IOException ignored) {}
            throw error;
        }
    }

    private void configureSocket(Socket candidate) throws SocketException {
        candidate.setTcpNoDelay(true);
        candidate.setKeepAlive(true);
        candidate.setReceiveBufferSize(256 * 1024);
        candidate.setSendBufferSize(256 * 1024);
    }

    private void sendHandshakeError(BufferedWriter target, String message) {
        try { writeLine(target, json("type", "error", "message", message).toString()); } catch (Throwable ignored) {}
    }

    private void attachPeer(Socket newSocket, BufferedWriter newWriter, BufferedReader reader, boolean fresh, int session) {
        Socket oldSocket;
        int generation;
        synchronized (lock) {
            if (session != sessionGeneration.get() || manualDisconnect || shuttingDown) {
                try { newSocket.close(); } catch (IOException ignored) {}
                return;
            }
            oldSocket = socket;
            socket = newSocket;
            writer = newWriter;
            connected = true;
            lastPeerSeen = System.currentTimeMillis();
            generation = peerGeneration.incrementAndGet();
        }
        if (oldSocket != null && oldSocket != newSocket) {
            try { oldSocket.close(); } catch (IOException ignored) {}
        }
        stopDiscoverySocket();
        emit("connected", json("role", role, "player", playerNumber,
            "ip", role.equals("host") ? hostAddress : safeRemoteAddress(newSocket),
            "port", PORT, "fresh", fresh, "recovered", everConnected));
        io.execute(() -> readLoop(newSocket, reader, generation, session));
        io.execute(() -> heartbeatLoop(newSocket, generation, session));
    }

    private void readLoop(Socket activeSocket, BufferedReader reader, int generation, int session) {
        try {
            while (isActivePeer(activeSocket, generation, session)) {
                try {
                    String line = reader.readLine();
                    if (line == null) throw new IOException("Connessione chiusa");
                    lastPeerSeen = System.currentTimeMillis();
                    if (line.isEmpty()) continue;
                    if (line.length() > MAX_MESSAGE_CHARS) throw new IOException("Messaggio di rete troppo grande");
                    JSONObject control = null;
                    try { control = new JSONObject(line); } catch (Throwable ignored) {}
                    String type = control == null ? "" : control.optString("type");
                    if ("ping".equals(type)) {
                        sendControl(activeSocket, json("type", "pong", "t", System.currentTimeMillis()).toString());
                        continue;
                    }
                    if ("pong".equals(type)) continue;
                    listener.onMessage(line);
                } catch (SocketTimeoutException timeout) {
                    if (System.currentTimeMillis() - lastPeerSeen > PEER_TIMEOUT_MS) {
                        throw new IOException("Timeout del collegamento Wi-Fi");
                    }
                }
            }
        } catch (Throwable error) {
            if (isActivePeer(activeSocket, generation, session)) {
                handleUnexpectedDisconnect(activeSocket, "Segnale Wi-Fi interrotto: riconnessione automatica…");
            }
        }
    }

    private void heartbeatLoop(Socket activeSocket, int generation, int session) {
        while (isActivePeer(activeSocket, generation, session)) {
            sleepQuietly(HEARTBEAT_INTERVAL_MS);
            if (!isActivePeer(activeSocket, generation, session)) return;
            if (System.currentTimeMillis() - lastPeerSeen > PEER_TIMEOUT_MS) {
                handleUnexpectedDisconnect(activeSocket, "L'altro dispositivo non risponde: riconnessione…");
                return;
            }
            try {
                sendControl(activeSocket, json("type", "ping", "t", System.currentTimeMillis()).toString());
            } catch (Throwable error) {
                handleUnexpectedDisconnect(activeSocket, "Segnale Wi-Fi perso: riconnessione…");
                return;
            }
        }
    }

    void send(String rawJson) {
        if (rawJson == null || rawJson.isEmpty() || rawJson.length() > MAX_MESSAGE_CHARS
            || rawJson.indexOf('\n') >= 0 || rawJson.indexOf('\r') >= 0) return;
        Socket currentSocket = socket;
        if (!connected || currentSocket == null) return;
        io.execute(() -> {
            try {
                sendControl(currentSocket, rawJson);
            } catch (Throwable error) {
                if (!shuttingDown) handleUnexpectedDisconnect(currentSocket,
                    "Invio non riuscito: riconnessione automatica…");
            }
        });
    }

    private void sendControl(Socket targetSocket, String rawJson) throws IOException {
        synchronized (lock) {
            if (!connected || targetSocket != socket || writer == null) throw new IOException("Socket non collegato");
            writeLine(writer, rawJson);
        }
    }

    private void handleUnexpectedDisconnect(Socket activeSocket, String reason) {
        Socket oldSocket;
        synchronized (lock) {
            if (activeSocket != socket) return;
            connected = false;
            writer = null;
            oldSocket = socket;
            socket = null;
            peerGeneration.incrementAndGet();
        }
        if (oldSocket != null) try { oldSocket.close(); } catch (IOException ignored) {}
        if (manualDisconnect || shuttingDown || "none".equals(role)) return;

        refreshLocalAddress();
        emit("reconnecting", json("role", role, "player", playerNumber,
            "ip", hostAddress, "port", PORT, "pin", pin, "message", reason));
        if ("client".equals(role)) {
            startDiscoveryLoop();
            startClientReconnectLoop();
        } else if ("host".equals(role)) {
            ensureHostServer();
            startHostBeaconLoop();
        }
    }

    void disconnect() {
        stopSession(true, "Partita Wi-Fi chiusa");
    }

    void reannounce() {
        if (connected) {
            emit("connected", json("role", role, "player", playerNumber,
                "ip", hostAddress, "port", PORT, "fresh", false, "recovered", true));
        } else if (!manualDisconnect && "host".equals(role)) {
            refreshLocalAddress();
            emitHostWaitingStatus();
            ensureHostServer();
            startHostBeaconLoop();
        } else if (!manualDisconnect && "client".equals(role)) {
            emit("reconnecting", json("role", role, "player", playerNumber,
                "ip", hostAddress, "attempt", 0,
                "message", "Ripristino automatico della partita Wi-Fi…"));
            startDiscoveryLoop();
            startClientReconnectLoop();
        } else {
            emit("idle", new JSONObject());
        }
    }

    void onNetworkChanged() {
        if (manualDisconnect || shuttingDown || "none".equals(role)) return;
        String previous = localAddress;
        String current = findLocalIpv4();
        localAddress = current;
        if ("host".equals(role) && !current.isEmpty()) hostAddress = current;

        boolean addressChanged = previous != null && !previous.isEmpty()
            && current != null && !current.isEmpty() && !previous.equals(current);
        boolean networkLost = current == null || current.isEmpty();
        Socket active = socket;
        if (connected && active != null && (networkLost || addressChanged)) {
            handleUnexpectedDisconnect(active, networkLost
                ? "Wi-Fi momentaneamente non disponibile: attendo il ritorno…"
                : "Rete Wi-Fi cambiata: riaggancio la partita…");
        }
        if ("host".equals(role)) {
            ensureHostServer();
            startHostBeaconLoop();
            if (!connected) emitHostWaitingStatus();
        } else {
            startDiscoveryLoop();
            startClientReconnectLoop();
        }
        wakeReconnectLoop();
    }

    void shutdown() {
        shuttingDown = true;
        stopSession(false, "");
        io.shutdownNow();
    }

    private void stopSession(boolean notify, String reason) {
        manualDisconnect = true;
        sessionGeneration.incrementAndGet();
        peerGeneration.incrementAndGet();
        Socket oldSocket;
        ServerSocket oldServer;
        DatagramSocket oldDiscovery;
        synchronized (lock) {
            connected = false;
            writer = null;
            oldSocket = socket;
            socket = null;
            oldServer = serverSocket;
            serverSocket = null;
            oldDiscovery = discoverySocket;
            discoverySocket = null;
        }
        if (oldSocket != null) try { oldSocket.close(); } catch (IOException ignored) {}
        if (oldServer != null) try { oldServer.close(); } catch (IOException ignored) {}
        if (oldDiscovery != null) oldDiscovery.close();
        wakeReconnectLoop();
        if (notify) emit("disconnected", json("message", reason));
        role = "none";
        playerNumber = 0;
        pin = "";
        hostAddress = "";
        localAddress = "";
        everConnected = false;
    }

    private void startHostBeaconLoop() {
        final int session = sessionGeneration.get();
        if (!isActiveHost(session)) return;
        if (!beaconLoopRunning.compareAndSet(false, true)) return;
        io.execute(() -> {
            try {
                while (isActiveHost(session)) {
                    refreshLocalAddress();
                    byte[] payload = (DISCOVERY_PREFIX + pin + "|" + PORT).getBytes(StandardCharsets.UTF_8);
                    try (DatagramSocket beacon = new DatagramSocket()) {
                        beacon.setBroadcast(true);
                        for (InetAddress target : broadcastAddresses()) {
                            try {
                                beacon.send(new DatagramPacket(payload, payload.length, target, DISCOVERY_PORT));
                            } catch (Throwable ignored) {}
                        }
                    } catch (Throwable ignored) {}
                    sleepQuietly(DISCOVERY_INTERVAL_MS);
                }
            } finally {
                beaconLoopRunning.set(false);
                if (isActiveHost(session)) startHostBeaconLoop();
            }
        });
    }

    private void startDiscoveryLoop() {
        final int session = sessionGeneration.get();
        if (!isActiveClient(session) || connected) return;
        if (!discoveryLoopRunning.compareAndSet(false, true)) return;
        io.execute(() -> {
            DatagramSocket listenerSocket = null;
            try {
                listenerSocket = new DatagramSocket(null);
                listenerSocket.setReuseAddress(true);
                listenerSocket.bind(new InetSocketAddress(DISCOVERY_PORT));
                listenerSocket.setSoTimeout(2000);
                synchronized (lock) {
                    if (!isActiveClient(session) || connected) return;
                    discoverySocket = listenerSocket;
                }
                byte[] buffer = new byte[256];
                while (isActiveClient(session) && !connected && !listenerSocket.isClosed()) {
                    try {
                        DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                        listenerSocket.receive(packet);
                        String message = new String(packet.getData(), packet.getOffset(), packet.getLength(), StandardCharsets.UTF_8);
                        String expected = DISCOVERY_PREFIX + pin + "|";
                        if (!message.startsWith(expected)) continue;
                        String discovered = packet.getAddress() == null ? "" : packet.getAddress().getHostAddress();
                        if (discovered == null || discovered.isEmpty()) continue;
                        boolean changed = !discovered.equals(hostAddress);
                        hostAddress = discovered;
                        emit("discovered", json("role", role, "player", playerNumber,
                            "ip", discovered, "changed", changed,
                            "message", "Telefono host ritrovato automaticamente"));
                        wakeReconnectLoop();
                    } catch (SocketTimeoutException ignored) {
                    }
                }
            } catch (Throwable ignored) {
            } finally {
                synchronized (lock) {
                    if (discoverySocket == listenerSocket) discoverySocket = null;
                }
                if (listenerSocket != null) listenerSocket.close();
                discoveryLoopRunning.set(false);
                if (isActiveClient(session) && !connected) startDiscoveryLoop();
            }
        });
    }

    private void stopDiscoverySocket() {
        DatagramSocket old;
        synchronized (lock) {
            old = discoverySocket;
            discoverySocket = null;
        }
        if (old != null) old.close();
    }

    private Set<InetAddress> broadcastAddresses() {
        Set<InetAddress> result = new LinkedHashSet<>();
        try { result.add(InetAddress.getByName("255.255.255.255")); } catch (Throwable ignored) {}
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            if (interfaces != null) {
                for (NetworkInterface network : Collections.list(interfaces)) {
                    try { if (!network.isUp() || network.isLoopback()) continue; } catch (Throwable ignored) { continue; }
                    for (InterfaceAddress entry : network.getInterfaceAddresses()) {
                        InetAddress broadcast = entry.getBroadcast();
                        if (broadcast != null) result.add(broadcast);
                    }
                }
            }
        } catch (Throwable ignored) {}
        return result;
    }

    private void refreshLocalAddress() {
        String current = findLocalIpv4();
        localAddress = current;
        if ("host".equals(role) && current != null && !current.isEmpty()) hostAddress = current;
    }

    private boolean isActiveHost(int session) {
        return !shuttingDown && !manualDisconnect && session == sessionGeneration.get() && "host".equals(role);
    }

    private boolean isActiveClient(int session) {
        return !shuttingDown && !manualDisconnect && session == sessionGeneration.get() && "client".equals(role);
    }

    private boolean isActivePeer(Socket candidate, int generation, int session) {
        return !shuttingDown && !manualDisconnect && connected && candidate != null
            && candidate == socket && generation == peerGeneration.get()
            && session == sessionGeneration.get();
    }

    private void waitForReconnectSignal(long millis) {
        synchronized (reconnectWake) {
            try { reconnectWake.wait(Math.max(1L, millis)); } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
        }
    }

    private void wakeReconnectLoop() {
        synchronized (reconnectWake) { reconnectWake.notifyAll(); }
    }

    private static void sleepQuietly(long millis) {
        try { Thread.sleep(millis); } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
    }

    private static void writeLine(BufferedWriter target, String line) throws IOException {
        target.write(line);
        target.write('\n');
        target.flush();
    }

    private static String safeRemoteAddress(Socket value) {
        InetAddress address = value == null ? null : value.getInetAddress();
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

    private void emit(String status, JSONObject data) {
        listener.onStatus(status, data == null ? new JSONObject() : data);
    }

    private static JSONObject json(Object... values) {
        JSONObject object = new JSONObject();
        for (int i = 0; i + 1 < values.length; i += 2) {
            try { object.put(String.valueOf(values[i]), values[i + 1]); } catch (Throwable ignored) {}
        }
        return object;
    }
}
