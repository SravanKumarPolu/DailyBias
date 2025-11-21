package com.dailybias.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable WebView debugging (works in debug builds)
        WebView.setWebContentsDebuggingEnabled(true);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        // Ensure WebView is properly initialized with all necessary settings
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            WebSettings settings = webView.getSettings();
            
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
            
            // Improve performance
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            // Note: setAppCacheEnabled is deprecated and removed in newer Android versions
        }
    }
}
