package com.nettuno.assedio;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private static final String START_URL = "file:///android_asset/www/index.html";
    private static final int BG = 0xFF050308;
    private FrameLayout root;
    private WebView webView;
    private boolean softwareFallback;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(5,3,8));
        getWindow().setNavigationBarColor(Color.rgb(5,3,8));
        root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        setContentView(root);
        createWebView(false);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView(boolean software) {
        softwareFallback = software;
        destroyWebView();
        try {
            WebView view = new WebView(this);
            view.setBackgroundColor(BG);
            view.setOverScrollMode(View.OVER_SCROLL_NEVER);
            view.setLayerType(software ? View.LAYER_TYPE_SOFTWARE : View.LAYER_TYPE_HARDWARE, null);
            WebSettings s = view.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
            s.setDatabaseEnabled(true);
            s.setAllowFileAccess(true);
            s.setAllowContentAccess(false);
            s.setAllowFileAccessFromFileURLs(true);
            s.setAllowUniversalAccessFromFileURLs(false);
            s.setMediaPlaybackRequiresUserGesture(true);
            s.setBuiltInZoomControls(false);
            s.setDisplayZoomControls(false);
            s.setSupportZoom(false);
            s.setTextZoom(100);
            s.setCacheMode(WebSettings.LOAD_DEFAULT);
            s.setSaveFormData(false);
            if (android.os.Build.VERSION.SDK_INT >= 26) {
                view.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
            }
            view.setWebChromeClient(new WebChromeClient());
            view.setWebViewClient(new WebViewClient() {
                @Override public boolean onRenderProcessGone(WebView dead, RenderProcessGoneDetail detail) {
                    if (dead.getParent() instanceof ViewGroup) ((ViewGroup) dead.getParent()).removeView(dead);
                    try { dead.destroy(); } catch (Throwable ignored) {}
                    if (webView == dead) webView = null;
                    if (!softwareFallback) root.post(() -> createWebView(true));
                    else root.post(() -> showError());
                    return true;
                }
            });
            webView = view;
            root.addView(view, new FrameLayout.LayoutParams(-1,-1));
            view.loadUrl(START_URL);
        } catch (Throwable error) {
            showError();
        }
    }

    private void showError() {
        destroyWebView();
        root.removeAllViews();
        TextView text = new TextView(this);
        text.setText("ASSEDIO non riesce ad avviare Android System WebView. Aggiorna Chrome/WebView e riapri l’app.");
        text.setTextColor(Color.WHITE);
        text.setTextSize(18f);
        text.setGravity(android.view.Gravity.CENTER);
        text.setPadding(48,48,48,48);
        root.addView(text,new FrameLayout.LayoutParams(-1,-1));
    }

    private void destroyWebView() {
        WebView old=webView; webView=null;
        if(old==null)return;
        try {
            if(old.getParent() instanceof ViewGroup)((ViewGroup)old.getParent()).removeView(old);
            old.stopLoading(); old.removeAllViews(); old.destroy();
        } catch(Throwable ignored) {}
    }

    @Override public void onBackPressed() {
        WebView view=webView;
        if(view==null){moveTaskToBack(true);return;}
        view.evaluateJavascript("(function(){try{return !!(window.androidBack&&window.androidBack());}catch(e){return false;}})()", value -> {
            WebView current=webView;
            if(!"true".equals(value)){
                if(current!=null&&current.canGoBack())current.goBack(); else moveTaskToBack(true);
            }
        });
    }

    @Override protected void onDestroy() { destroyWebView(); super.onDestroy(); }
}
