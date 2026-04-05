use aes::Aes256;
use cbc::{Decryptor, Encryptor};
use cbc::cipher::{KeyIvInit, BlockModeEncrypt, BlockModeDecrypt};
use hex;
use keyring::Entry;
use rand::Rng;
use serde::{Deserialize, Serialize};
use anyhow::{Result, anyhow};

const SERVICE_NAME: &str = "fulcrum";
const ACCOUNT_NAME: &str = "user";

#[derive(Serialize, Deserialize)]
pub struct EncryptedData {
    pub iv: String,
    pub encrypted_data: String,
}

#[allow(dead_code)]
pub struct EncryptionManager {
    entry: Entry,
}

#[allow(dead_code)]
impl EncryptionManager {
    pub fn new() -> Self {
        let entry = Entry::new(SERVICE_NAME, ACCOUNT_NAME)
            .expect("Failed to create keyring entry");
        
        Self { entry }
    }

    pub async fn ensure_encryption_key(&self) -> Result<String> {
        match self.entry.get_password() {
            Ok(secret_key) => {
                log::info!("Secret key found, skipping initialization");
                Ok(secret_key)
            }
            Err(_) => {
                log::info!("No secret key found, creating a new one");
                
                // Generate a new 32-byte secret key
                let secret_key: [u8; 32] = rand::thread_rng().gen();
                let secret_key_hex = hex::encode(secret_key);
                
                self.entry.set_password(&secret_key_hex)
                    .map_err(|e| anyhow!("Failed to store secret key: {}", e))?;
                
                log::info!("New secret key correctly initialized");
                Ok(secret_key_hex)
            }
        }
    }

    pub fn encrypt(&self, text: &str, secret_key: &str) -> Result<EncryptedData> {
        let key = hex::decode(secret_key)
            .map_err(|e| anyhow!("Invalid secret key format: {}", e))?;
        
        if key.len() != 32 {
            return Err(anyhow!("Secret key must be 32 bytes"));
        }

        // Generate random IV
        let iv: [u8; 16] = rand::thread_rng().gen();
        
        // Pad the text to be a multiple of 16 bytes (PKCS7 padding)
        let mut data = text.as_bytes().to_vec();
        let padding_len = 16 - (data.len() % 16);
        for _ in 0..padding_len {
            data.push(padding_len as u8);
        }

        // Encrypt
        let cipher = Encryptor::<Aes256>::new_from_slices(&key, &iv)
            .map_err(|e| anyhow!("Failed to create cipher: {}", e))?;
        
        let len = data.len(); // Calculate length before mutable borrow
        let mut encrypted_data = data;
        cipher.encrypt_padded::<cbc::cipher::block_padding::NoPadding>(&mut encrypted_data, len)
            .map_err(|e| anyhow!("Encryption failed: {}", e))?;

        Ok(EncryptedData {
            iv: hex::encode(iv),
            encrypted_data: hex::encode(encrypted_data),
        })
    }

    pub fn decrypt(&self, encrypted_obj: &EncryptedData, secret_key: &str) -> Result<String> {
        let key = hex::decode(secret_key)
            .map_err(|e| anyhow!("Invalid secret key format: {}", e))?;
        
        if key.len() != 32 {
            return Err(anyhow!("Secret key must be 32 bytes"));
        }

        let iv = hex::decode(&encrypted_obj.iv)
            .map_err(|e| anyhow!("Invalid IV format: {}", e))?;
        
        let mut encrypted_data = hex::decode(&encrypted_obj.encrypted_data)
            .map_err(|e| anyhow!("Invalid encrypted data format: {}", e))?;

        // Decrypt
        let cipher = Decryptor::<Aes256>::new_from_slices(&key, &iv)
            .map_err(|e| anyhow!("Failed to create cipher: {}", e))?;
        
        let decrypted_data = cipher.decrypt_padded::<cbc::cipher::block_padding::Pkcs7>(&mut encrypted_data)
            .map_err(|e| anyhow!("Decryption failed: {}", e))?;

        String::from_utf8(decrypted_data.to_vec())
            .map_err(|e| anyhow!("Failed to convert decrypted data to string: {}", e))
    }
} 