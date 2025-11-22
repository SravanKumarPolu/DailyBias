package com.dailybias.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private boolean webViewConfigured = false;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable WebView debugging (works in debug builds)
        WebView.setWebContentsDebuggingEnabled(true);
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Configure WebView after it's fully initialized (Capacitor creates it after onCreate)
        // Use a handler to ensure WebView is ready, but only configure once to prevent flicker
        if (!webViewConfigured) {
            // Post to message queue to ensure WebView is initialized
            new Handler(Looper.getMainLooper()).post(() -> {
                configureWebView();
            });
        }
    }
    
    /**
     * Configure WebView settings once to prevent flicker.
     * This ensures settings are stable and prevents repeated reconfiguration that causes flicker.
     * The user agent is set to a stable Chrome mobile UA to prevent layout shifts.
     */
    private void configureWebView() {
        if (webViewConfigured) {
            return; // Already configured, avoid reconfiguration that causes flicker
        }
        
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            WebSettings settings = webView.getSettings();
            
            // Set a stable user agent to prevent layout shifts and re-renders
            // This matches a standard Chrome mobile user agent to ensure consistent rendering
            String defaultUA = settings.getUserAgentString();
            if (defaultUA != null && !defaultUA.contains("Chrome/")) {
                // Construct a proper Chrome mobile UA for consistent web app behavior
                // This prevents the web app from detecting WebView and serving different layouts
                String chromeUA = "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
                settings.setUserAgentString(chromeUA);
            }
            
            // Ensure JavaScript is enabled (should be by default in Capacitor)
            settings.setJavaScriptEnabled(true);
            
            // Enable DOM storage for localStorage and sessionStorage
            settings.setDomStorageEnabled(true);
            
            // Enable database storage for IndexedDB
            settings.setDatabaseEnabled(true);
            
            // Set database path for IndexedDB
            String databasePath = getApplicationContext().getDir("databases", MODE_PRIVATE).getPath();
            settings.setDatabasePath(databasePath);
            
            // Allow file access from file URLs (needed for Capacitor)
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            
            // Enable mixed content for development (if needed)
            // Note: BuildConfig.DEBUG is available but may need to be accessed differently
            // For now, we'll allow mixed content in all builds for Capacitor compatibility
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // Improve performance and prevent flicker
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            
            // Enable hardware acceleration for smoother rendering
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
            
            webViewConfigured = true;
        }
    }
}
