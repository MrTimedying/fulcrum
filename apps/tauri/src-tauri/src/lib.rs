mod encryption;
mod state;

use encryption::EncryptionManager;
use state::StateManager;
use serde_json::Value;
use serde::{Serialize, Deserialize};
use tauri::{Emitter, Manager, State, AppHandle, Runtime, WebviewUrl, WebviewWindowBuilder};
use std::sync::Mutex;

// POC State for multi-window sync validation
#[derive(Clone, Serialize, Deserialize)]
pub struct PocState {
    pub test_message: String,
}

// Application state
pub struct AppState {
    #[allow(dead_code)]
    encryption_manager: Mutex<EncryptionManager>,
    state_manager: Mutex<StateManager>,
    poc_state: Mutex<PocState>,
}

// Tauri commands
#[tauri::command]
async fn get_app_version<R: Runtime>(app: AppHandle<R>) -> Result<String, String> {
    Ok(app.package_info().version.to_string())
}

#[tauri::command]
async fn get_poc_state(state: State<'_, AppState>) -> Result<PocState, String> {
    let poc = state.poc_state.lock().unwrap();
    Ok(poc.clone())
}

#[tauri::command]
async fn update_poc_state<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, AppState>,
    test_message: String,
) -> Result<(), String> {
    // Collect everything we need, then let the guards drop
    let (poc_path, content) = {
        let mut poc = state.poc_state.lock().unwrap();
        poc.test_message = test_message;
        
        // Broadcast the update to all windows
        app.emit("poc-state-sync", poc.clone())
            .map_err(|e| format!("Failed to broadcast update: {}", e))?;
        
        let state_manager = state.state_manager.lock().unwrap();
        let poc_path = state_manager.get_state_file_path().with_file_name("poc_state.json");
        let content = serde_json::to_string_pretty(&*poc)
            .map_err(|e| format!("Failed to serialize POC state: {}", e))?;
        
        (poc_path, content)
        // Guards are dropped here
    };
    
    // Perform file operations without holding the mutex
    tokio::fs::write(poc_path, content).await
        .map_err(|e| format!("Failed to write POC state: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn spawn_poc_window<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let id = uuid::Uuid::new_v4().to_string();
    let label = format!("poc-{}", id);
    
    let _window = WebviewWindowBuilder::new(&app, label, WebviewUrl::App("index.html?window=poc".into()))
        .title("POC Sandbox")
        .inner_size(400.0, 300.0)
        .decorations(false) // Disable native decorations for custom frame
        .build()
        .map_err(|e| format!("Failed to spawn window: {}", e))?;
    
    Ok(())
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
        .plugin(tauri_plugin_dialog::init())
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

            // Load initial POC state if exists
            let poc_path = state_manager.get_state_file_path().with_file_name("poc_state.json");
            let poc_state = if poc_path.exists() {
                let content = std::fs::read_to_string(poc_path).unwrap_or_default();
                serde_json::from_str(&content).unwrap_or(PocState {
                    test_message: "Hello from Disk!".into(),
                })
            } else {
                PocState {
                    test_message: "Hello from Rust State!".into(),
                }
            };

            app.manage(AppState {
                encryption_manager: Mutex::new(encryption_manager),
                state_manager: Mutex::new(state_manager),
                poc_state: Mutex::new(poc_state),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            get_poc_state,
            update_poc_state,
            spawn_poc_window,
            get_app_state,
            save_app_state,
            check_for_updates,
            download_update,
            quit_and_install
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // If the "main" window is closing, exit the entire app
                if window.label() == "main" {
                    std::process::exit(0);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
