const crypto = require('crypto');
const keytar = require('keytar');

const serviceName = 'fulcrum';
const accountName = 'user';
const algorithm = 'aes-256-cbc';

// Ensure Encryption Key exists or create it
async function ensureEncryptionKey() {
  try {
    let secretKey = await keytar.getPassword(serviceName, accountName);
    
    if (secretKey === null) {
      console.log("No secret key found, creating a new one");
      
      // Generate a new secret key and convert it to a hexadecimal string
      secretKey = crypto.randomBytes(32).toString('hex');
      await keytar.setPassword(serviceName, accountName, secretKey);
      
      console.log("New secret key correctly initialized");
    } else {
      console.log("Secret key found, skipping initialization");
    }

    return secretKey;
  } catch (err) {
    console.error("There was an error in the encryption key initialization and retrieval process", err);
    throw err;
  }
}

// Encrypt function adjusted to receive secretKey as parameter
function encrypt(text, secretKey) {
  const iv = crypto.randomBytes(16); // IV is generated for each encryption
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypt function adjusted to receive secretKey as parameter
function decrypt(encryptedObj, secretKey) {
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const encryptedText = Buffer.from(encryptedObj.encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { ensureEncryptionKey, encrypt, decrypt };
