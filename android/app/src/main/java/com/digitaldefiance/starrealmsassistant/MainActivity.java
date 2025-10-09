package com.digitaldefiance.starrealmsassistant;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  @SuppressWarnings("deprecation")
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Configure window for edge-to-edge display
    Window window = getWindow();
    window.setStatusBarColor(Color.TRANSPARENT);
    window.setNavigationBarColor(Color.BLACK);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      window.getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
    }

    // Keep screen on (optional - remove if not needed)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

    // Use modern window insets API instead of deprecated setSystemUiVisibility
    WindowCompat.setDecorFitsSystemWindows(window, false);
    WindowInsetsControllerCompat windowInsetsController = WindowCompat.getInsetsController(window, window.getDecorView());
    if (windowInsetsController != null) {
      windowInsetsController.hide(WindowInsetsCompat.Type.navigationBars());
      windowInsetsController.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
  }
}
