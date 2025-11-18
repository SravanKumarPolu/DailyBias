package com.dailybias.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable WebView debugging (works in debug builds)
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
