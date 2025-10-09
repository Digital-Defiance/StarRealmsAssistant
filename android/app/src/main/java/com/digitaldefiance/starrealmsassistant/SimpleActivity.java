package com.digitaldefiance.starrealmsassistant;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.TextView;
import android.view.Gravity;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class SimpleActivity extends Activity {
  private void log(String msg) {
    try {
      File f = new File(getExternalFilesDir(null), "simple.log");
      FileWriter fw = new FileWriter(f, true);
      fw.write(System.currentTimeMillis() + ": " + msg + "\n");
      fw.close();
    } catch (IOException ignored) { }
  }

  @Override protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    TextView tv = new TextView(this);
    tv.setText("SimpleActivity launcher... launching MainActivity shortly");
    tv.setGravity(Gravity.CENTER);
    setContentView(tv);
    log("SimpleActivity onCreate");
    new Handler(Looper.getMainLooper()).postDelayed(() -> {
      log("Starting MainActivity");
      try {
        startActivity(new Intent(this, MainActivity.class));
      } catch (Exception e) {
        log("Failed to start MainActivity: " + e);
      }
    }, 1200);
  }
}

