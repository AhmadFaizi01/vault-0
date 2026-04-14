// Prevents an extra console window from appearing on Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Frameless + custom title bar feel on all platforms
            #[cfg(target_os = "macos")]
            {
                use tauri::TitleBarStyle;
                window.set_title_bar_style(TitleBarStyle::Overlay).ok();
            }

            window.show().ok();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running vault");
}
