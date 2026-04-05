use std::path::PathBuf;
use anyhow::{Result, anyhow};
use dirs;

pub struct StateManager {
    state_file_path: PathBuf,
}

impl StateManager {
    pub fn new() -> Result<Self> {
        let app_data_dir = dirs::data_dir()
            .ok_or_else(|| anyhow!("Failed to get app data directory"))?
            .join("fulcrum");
        
        // Ensure the directory exists
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| anyhow!("Failed to create app data directory: {}", e))?;
        
        let state_file_path = app_data_dir.join("app_state.json");
        
        Ok(Self { state_file_path })
    }

    pub fn get_state_file_path(&self) -> &PathBuf {
        &self.state_file_path
    }
} 