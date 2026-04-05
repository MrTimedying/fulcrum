mod encryption;
mod state;

use encryption::EncryptionManager;
use state::StateManager;
use serde_json::Value;
use tauri::{Manager, State, AppHandle, Runtime};
use std::sync::Mutex;

// Application state
pub struct AppState {
    #[allow(dead_code)]
    encryption_manager: Mutex<EncryptionManager>,
    state_manager: Mutex<StateManager>,
}

// Tauri commands
#[tauri::command]
async fn get_app_version<R: Runtime>(app: AppHandle<R>) -> Result<String, String> {
    Ok(app.package_info().version.to_string())
}

#[tauri::command]
async fn get_app_state(state: State<'_, AppState>) -> Result<Value, String> {
    // Clone the state file path to avoid holding the mutex across await
    let state_file_path = {
        let state_manager = state.state_manager.lock().unwrap();
        state_manager.get_state_file_path().clone()
    };
    
    // Perform file operations without holding the mutex
    match tokio::fs::read_to_string(&state_file_path).await {
        Ok(content) => {
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse state file: {}", e))
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            // Return empty object if file doesn't exist
            Ok(serde_json::json!({}))
        }
        Err(e) => Err(format!("Failed to read state file: {}", e)),
    }
}

#[tauri::command]
async fn save_app_state(state: State<'_, AppState>, app_state: Value) -> Result<(), String> {
    // Clone the state file path to avoid holding the mutex across await
    let state_file_path = {
        let state_manager = state.state_manager.lock().unwrap();
        state_manager.get_state_file_path().clone()
    };
    
    // Perform file operations without holding the mutex
    let content = serde_json::to_string_pretty(&app_state)
        .map_err(|e| format!("Failed to serialize state: {}", e))?;
    
    tokio::fs::write(&state_file_path, content).await
        .map_err(|e| format!("Failed to write state file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn check_for_updates<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    // This will be handled by the tauri-plugin-updater
    // For now, return a placeholder response
    Ok(serde_json::json!({
        "updateAvailable": false,
        "version": app.package_info().version.to_string()
    }))
}

#[tauri::command]
async fn download_update() -> Result<serde_json::Value, String> {
    // This will be handled by the tauri-plugin-updater
    Ok(serde_json::json!({
        "success": true
    }))
}

#[tauri::command]
async fn quit_and_install<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    // This will be handled by the tauri-plugin-updater
    app.exit(0);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::<tauri::Wry>::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize application state
            let encryption_manager = EncryptionManager::new();
            let state_manager = StateManager::new()
                .map_err(|e| format!("Failed to initialize state manager: {}", e))?;

            app.manage(AppState {
                encryption_manager: Mutex::new(encryption_manager),
                state_manager: Mutex::new(state_manager),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            get_app_state,
            save_app_state,
            check_for_updates,
            download_update,
            quit_and_install
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
