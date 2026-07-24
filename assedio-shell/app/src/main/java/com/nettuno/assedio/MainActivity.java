package com.nettuno.assedio;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

import org.json.JSONObject;

public final class MainActivity extends Activity {
    private static final String START_URL = "file:///android_asset/www/index.html";
    private static final String TRUSTED_PREFIX = "file:///android_asset/www/";
    private static final int BG = 0xFF050308;
    private static final int REQUEST_NEARBY_WIFI = 5101;

    private FrameLayout root;
    private WebView webView;
    private boolean softwareFallback;
    private LanController lanController;
    private Runnable pendingPermissionAction;
    private ConnectivityManager connectivityManager;
    private ConnectivityManager.NetworkCallback networkCallback;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(5, 3, 8));
        getWindow().setNavigationBarColor(Color.rgb(5, 3, 8));
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        lanController = new LanController(new LanController.Listener() {
            @Override public void onStatus(String status, JSONObject data) { emitLanStatus(status, data); }
            @Override public void onMessage(String rawJson) { emitLanMessage(rawJson); }
        });

        root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        setContentView(root);
        createWebView(false);
        registerNetworkWatcher();
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private void createWebView(boolean software) {
        softwareFallback = software;
        destroyWebView();
        try {
            WebView view = new WebView(this);
            view.setBackgroundColor(BG);
            view.setOverScrollMode(View.OVER_SCROLL_NEVER);
            view.setLayerType(software ? View.LAYER_TYPE_SOFTWARE : View.LAYER_TYPE_HARDWARE, null);

            WebSettings settings = view.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(false);
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(false);
            settings.setMediaPlaybackRequiresUserGesture(true);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setSupportZoom(false);
            settings.setTextZoom(100);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setSaveFormData(false);
            if (Build.VERSION.SDK_INT >= 26) view.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);

            view.addJavascriptInterface(new LanBridge(), "AssedioLan");
            view.setWebChromeClient(new WebChromeClient());
            view.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView current, WebResourceRequest request) {
                    Uri uri = request == null ? null : request.getUrl();
                    return uri == null || !uri.toString().startsWith(TRUSTED_PREFIX);
                }

                @Override
                public void onPageFinished(WebView current, String url) {
                    super.onPageFinished(current, url);
                    if (url != null && url.startsWith(TRUSTED_PREFIX)) lanController.reannounce();
                }

                @Override
                public boolean onRenderProcessGone(WebView dead, RenderProcessGoneDetail detail) {
                    if (dead.getParent() instanceof ViewGroup) ((ViewGroup) dead.getParent()).removeView(dead);
                    try { dead.destroy(); } catch (Throwable ignored) {}
                    if (webView == dead) webView = null;
                    if (!softwareFallback) root.post(() -> createWebView(true));
                    else root.post(MainActivity.this::showError);
                    return true;
                }
            });

            webView = view;
            root.addView(view, new FrameLayout.LayoutParams(-1, -1));
            view.loadUrl(START_URL);
        } catch (Throwable error) {
            showError();
        }
    }

    private final class LanBridge {
        @JavascriptInterface public void startHost() { runOnUiThread(() -> withLanPermission(lanController::startHost)); }
        @JavascriptInterface public void connect(String address, String pin) { runOnUiThread(() -> withLanPermission(() -> lanController.connect(address, pin))); }
        @JavascriptInterface public void send(String rawJson) { lanController.send(rawJson); }
        @JavascriptInterface public void disconnect() { lanController.disconnect(); }
        @JavascriptInterface public void ready() { lanController.reannounce(); }
        @JavascriptInterface public void recover() { lanController.onNetworkChanged(); }
        @JavascriptInterface public String localIp() { return LanController.findLocalIpv4(); }
    }

    private void registerNetworkWatcher() {
        try {
            connectivityManager = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
            if (connectivityManager == null) return;
            networkCallback = new ConnectivityManager.NetworkCallback() {
                @Override public void onAvailable(Network network) { notifyLanNetworkChanged(); }
                @Override public void onLost(Network network) { notifyLanNetworkChanged(); }
                @Override public void onCapabilitiesChanged(Network network, NetworkCapabilities capabilities) {
                    notifyLanNetworkChanged();
                }
            };
            NetworkRequest request = new NetworkRequest.Builder()
                .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
                .build();
            connectivityManager.registerNetworkCallback(request, networkCallback);
        } catch (Throwable ignored) {}
    }

    private void notifyLanNetworkChanged() {
        FrameLayout currentRoot = root;
        if (currentRoot == null) return;
        currentRoot.removeCallbacks(networkChangeRunnable);
        currentRoot.postDelayed(networkChangeRunnable, 250L);
    }

    private final Runnable networkChangeRunnable = () -> {
        LanController current = lanController;
        if (current != null) current.onNetworkChanged();
    };

    private void withLanPermission(Runnable action) {
        if (Build.VERSION.SDK_INT < 33 || checkSelfPermission(Manifest.permission.NEARBY_WIFI_DEVICES) == PackageManager.PERMISSION_GRANTED) {
            action.run();
            return;
        }
        pendingPermissionAction = action;
        requestPermissions(new String[]{Manifest.permission.NEARBY_WIFI_DEVICES}, REQUEST_NEARBY_WIFI);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != REQUEST_NEARBY_WIFI) return;
        Runnable action = pendingPermissionAction;
        pendingPermissionAction = null;
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            if (action != null) action.run();
        } else {
            JSONObject data = new JSONObject();
            try { data.put("message", "Consenti Dispositivi nelle vicinanze per giocare sulla rete Wi-Fi locale"); } catch (Throwable ignored) {}
            emitLanStatus("error", data);
        }
    }

    private void emitLanStatus(String status, JSONObject data) {
        String safeStatus = JSONObject.quote(status == null ? "" : status);
        String safeData = data == null ? "{}" : data.toString();
        runOnUiThread(() -> evaluateTrustedJavascript("window.onLanNativeStatus&&window.onLanNativeStatus(" + safeStatus + "," + safeData + ");"));
    }

    private void emitLanMessage(String rawJson) {
        String safePayload = JSONObject.quote(rawJson == null ? "" : rawJson);
        runOnUiThread(() -> evaluateTrustedJavascript("window.onLanNativeMessage&&window.onLanNativeMessage(" + safePayload + ");"));
    }

    private void evaluateTrustedJavascript(String script) {
        WebView current = webView;
        if (current == null) return;
        String url = current.getUrl();
        if (url == null || !url.startsWith(TRUSTED_PREFIX)) return;
        current.evaluateJavascript(script, null);
    }

    private void showError() {
        destroyWebView();
        root.removeAllViews();
        TextView text = new TextView(this);
        text.setText("ASSEDIO non riesce ad avviare Android System WebView. Aggiorna Chrome/WebView e riapri l’app.");
        text.setTextColor(Color.WHITE);
        text.setTextSize(18f);
        text.setGravity(android.view.Gravity.CENTER);
        text.setPadding(48, 48, 48, 48);
        root.addView(text, new FrameLayout.LayoutParams(-1, -1));
    }

    private void destroyWebView() {
        WebView old = webView;
        webView = null;
        if (old == null) return;
        try {
            if (old.getParent() instanceof ViewGroup) ((ViewGroup) old.getParent()).removeView(old);
            old.stopLoading();
            old.removeJavascriptInterface("AssedioLan");
            old.removeAllViews();
            old.destroy();
        } catch (Throwable ignored) {}
    }

    @Override
    protected void onResume() {
        super.onResume();
        WebView current = webView;
        if (current != null) current.onResume();
        notifyLanNetworkChanged();
    }

    @Override
    protected void onPause() {
        WebView current = webView;
        if (current != null) current.onPause();
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        WebView view = webView;
        if (view == null) { moveTaskToBack(true); return; }
        view.evaluateJavascript("(function(){try{return !!(window.androidBack&&window.androidBack());}catch(e){return false;}})()", value -> {
            WebView current = webView;
            if (!"true".equals(value)) {
                if (current != null && current.canGoBack()) current.goBack();
                else moveTaskToBack(true);
            }
        });
    }

    @Override
    protected void onDestroy() {
        if (connectivityManager != null && networkCallback != null) {
            try { connectivityManager.unregisterNetworkCallback(networkCallback); } catch (Throwable ignored) {}
        }
        if (root != null) root.removeCallbacks(networkChangeRunnable);
        if (lanController != null) lanController.shutdown();
        destroyWebView();
        super.onDestroy();
    }
}
