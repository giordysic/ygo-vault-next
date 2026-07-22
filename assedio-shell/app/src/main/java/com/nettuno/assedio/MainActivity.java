package com.nettuno.assedio;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String TAG = "ASSEDIO";
    private static final String START_URL = "file:///android_asset/www/index.html";
    private static final int BACKGROUND = 0xFF05020A;
    private static final int MAX_RENDERER_RECOVERIES = 2;

    private FrameLayout root;
    private WebView webView;
    private int rendererRecoveries;
    private boolean safeMode;
    private Thread.UncaughtExceptionHandler previousExceptionHandler;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        installCrashLogger();

        root = new FrameLayout(this);
        root.setBackgroundColor(BACKGROUND);
        setContentView(root);

        // WebView state is intentionally not restored. Serialized renderer state can become
        // invalid after WebView/System updates and has caused startup loops on some devices.
        createWebView(Build.VERSION.SDK_INT >= 36);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView(boolean useSafeMode) {
        safeMode = useSafeMode;
        destroyCurrentWebView();

        try {
            final WebView candidate = new WebView(MainActivity.this);
            candidate.setBackgroundColor(BACKGROUND);
            candidate.setOverScrollMode(View.OVER_SCROLL_NEVER);

            // Android 16/WebView GPU combinations can terminate the renderer during startup.
            // Software rendering is used as the default safety path on API 36+ and after a crash.
            if (safeMode) {
                candidate.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
            }

            WebSettings settings = candidate.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            settings.setAllowFileAccessFromFileURLs(false);
            settings.setAllowUniversalAccessFromFileURLs(false);
            settings.setMediaPlaybackRequiresUserGesture(true);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setSupportZoom(false);
            settings.setTextZoom(100);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setSaveFormData(false);

            if (Build.VERSION.SDK_INT >= 26) {
                candidate.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
                candidate.setWebViewClient(new RendererAwareClient());
            } else {
                candidate.setWebViewClient(new BasicClient());
            }
            candidate.setWebChromeClient(new WebChromeClient());

            webView = candidate;
            root.addView(candidate, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));
            candidate.loadUrl(START_URL);
        } catch (Throwable error) {
            writeCrashLog("createWebView", error);
            showNativeError("Avvio WebView non riuscito", error.getClass().getSimpleName());
        }
    }

    private class BasicClient extends WebViewClient {
        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            rendererRecoveries = 0;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            super.onReceivedError(view, request, error);
            if (request != null && request.isForMainFrame()) {
                writeTextLog("Main frame error: " + error);
            }
        }
    }

    private final class RendererAwareClient extends BasicClient {
        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            String reason = detail != null && detail.didCrash() ? "renderer crash" : "renderer killed";
            writeTextLog(reason + "; priority=" + (detail == null ? "unknown" : detail.rendererPriorityAtExit()));

            if (view != null && view.getParent() instanceof ViewGroup) {
                ((ViewGroup) view.getParent()).removeView(view);
            }
            try {
                if (view != null) view.destroy();
            } catch (Throwable ignored) {
                Log.w(TAG, "Renderer cleanup failed", ignored);
            }
            if (webView == view) webView = null;

            rendererRecoveries++;
            if (rendererRecoveries <= MAX_RENDERER_RECOVERIES) {
                root.postDelayed(() -> createWebView(true), 350L);
            } else {
                root.post(() -> showNativeError(
                    "Il componente WebView di Android si è arrestato",
                    "Aggiorna Android System WebView/Chrome e premi Riprova. L’app non verrà chiusa."
                ));
            }
            return true;
        }
    }

    private void showNativeError(String title, String detail) {
        destroyCurrentWebView();
        root.removeAllViews();

        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setGravity(Gravity.CENTER);
        panel.setPadding(dp(28), dp(28), dp(28), dp(28));
        panel.setBackgroundColor(BACKGROUND);

        TextView heading = new TextView(this);
        heading.setText(title);
        heading.setTextColor(Color.WHITE);
        heading.setTextSize(22f);
        heading.setGravity(Gravity.CENTER);

        TextView message = new TextView(this);
        message.setText(detail == null ? "Errore sconosciuto" : detail);
        message.setTextColor(0xFFCAC4D0);
        message.setTextSize(15f);
        message.setGravity(Gravity.CENTER);
        message.setPadding(0, dp(16), 0, dp(24));

        Button retry = new Button(this);
        retry.setText("RIPROVA IN MODALITÀ SICURA");
        retry.setOnClickListener(v -> {
            rendererRecoveries = 0;
            createWebView(true);
        });

        panel.addView(heading, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        panel.addView(message, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        panel.addView(retry, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        root.addView(panel, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void destroyCurrentWebView() {
        WebView current = webView;
        webView = null;
        if (current == null) return;

        try {
            if (current.getParent() instanceof ViewGroup) {
                ((ViewGroup) current.getParent()).removeView(current);
            }
            current.stopLoading();
            current.setWebChromeClient(null);
            current.setWebViewClient(new WebViewClient());
            current.removeAllViews();
            current.destroy();
        } catch (Throwable error) {
            writeCrashLog("destroyWebView", error);
        }
    }

    private void installCrashLogger() {
        previousExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, error) -> {
            writeCrashLog("uncaught-" + thread.getName(), error);
            if (previousExceptionHandler != null) {
                previousExceptionHandler.uncaughtException(thread, error);
            }
        });
    }

    private synchronized void writeCrashLog(String source, Throwable error) {
        StringWriter buffer = new StringWriter();
        error.printStackTrace(new PrintWriter(buffer));
        writeTextLog(source + "\n" + buffer);
    }

    private synchronized void writeTextLog(String text) {
        try {
            File file = new File(getFilesDir(), "assedio-crash.log");
            try (FileWriter writer = new FileWriter(file, true)) {
                String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.ITALY).format(new Date());
                writer.write("[" + timestamp + "] " + text + "\n\n");
            }
        } catch (Throwable ignored) {
            Log.e(TAG, "Unable to write crash log", ignored);
        }
    }

    @Override
    public void onBackPressed() {
        WebView current = webView;
        if (current == null) {
            moveTaskToBack(true);
            return;
        }

        try {
            current.evaluateJavascript(
                "(function(){try{return !!(window.androidBack&&window.androidBack());}catch(e){return false;}})()",
                value -> {
                    WebView active = webView;
                    if (!"true".equals(value)) {
                        if (active != null && active.canGoBack()) active.goBack();
                        else moveTaskToBack(true);
                    }
                }
            );
        } catch (Throwable error) {
            writeCrashLog("back", error);
            moveTaskToBack(true);
        }
    }

    @Override
    protected void onDestroy() {
        destroyCurrentWebView();
        if (Thread.getDefaultUncaughtExceptionHandler() != previousExceptionHandler) {
            Thread.setDefaultUncaughtExceptionHandler(previousExceptionHandler);
        }
        super.onDestroy();
    }
}