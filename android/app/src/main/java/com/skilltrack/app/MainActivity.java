package com.skilltrack.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;
import com.getcapacitor.community.local.notifications.LocalNotifications;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LocalNotifications.class);
        super.onCreate(savedInstanceState);
    }
}
