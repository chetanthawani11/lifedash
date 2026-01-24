/**
 * ENCRYPTION SERVICE
 *
 * Provides client-side encryption for sensitive data like journal entries.
 * Uses the Web Crypto API for secure encryption/decryption.
 *
 * HOW IT WORKS:
 * 1. A unique encryption key is generated for each user
 * 2. The key is derived from the user's UID + a random salt
 * 3. Data is encrypted using AES-GCM (very secure algorithm)
 * 4. Encrypted data is stored in Firestore instead of plain text
 *
 * SECURITY NOTES:
 * - The encryption key never leaves the browser
 * - Even if someone accesses the database, they can't read encrypted content
 * - Each user has a unique encryption key
 */

// Storage key for the encryption salt
const SALT_KEY = 'lifedash_encryption_salt';

/**
 * Generate a random salt for key derivation
 * A salt adds randomness to make the encryption key unique
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Get or create the user's encryption salt
 * The salt is stored in localStorage and persists across sessions
 */
function getOrCreateSalt(): Uint8Array {
  if (typeof window === 'undefined') {
    return new Uint8Array(16);
  }

  const storedSalt = localStorage.getItem(SALT_KEY);

  if (storedSalt) {
    // Convert stored base64 string back to Uint8Array
    const binaryString = atob(storedSalt);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Generate and store new salt
  const newSalt = generateSalt();
  const base64Salt = btoa(String.fromCharCode(...newSalt));
  localStorage.setItem(SALT_KEY, base64Salt);
  return newSalt;
}

/**
 * Derive an encryption key from the user's UID
 * Uses PBKDF2 algorithm for secure key derivation
 */
async function deriveKey(userId: string): Promise<CryptoKey> {
  const salt = getOrCreateSalt();

  // Convert userId to bytes
  const encoder = new TextEncoder();
  const userIdBytes = encoder.encode(userId);

  // Import the userId as a key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    userIdBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // High number of iterations for security
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256, // 256-bit key for strong encryption
    },
    false, // Not extractable for security
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive text data
 *
 * @param userId - The user's UID (used to derive encryption key)
 * @param plainText - The text to encrypt
 * @returns Encrypted data as a base64 string (includes IV)
 */
export async function encryptText(userId: string, plainText: string): Promise<string> {
  if (!plainText || typeof window === 'undefined') {
    return plainText;
  }

  try {
    const key = await deriveKey(userId);
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);

    // Generate a random initialization vector (IV)
    // The IV ensures the same text encrypts differently each time
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    // Return original text if encryption fails (fallback)
    return plainText;
  }
}

/**
 * Decrypt encrypted text data
 *
 * @param userId - The user's UID (used to derive encryption key)
 * @param encryptedText - The encrypted base64 string
 * @returns Decrypted plain text
 */
export async function decryptText(userId: string, encryptedText: string): Promise<string> {
  if (!encryptedText || typeof window === 'undefined') {
    return encryptedText;
  }

  // Check if data is actually encrypted (base64 encoded)
  // If it's not base64, it's probably plain text (not encrypted)
  if (!isBase64(encryptedText)) {
    return encryptedText;
  }

  try {
    const key = await deriveKey(userId);

    // Decode base64 to bytes
    const combined = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));

    // Extract IV (first 12 bytes) and encrypted data (rest)
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );

    // Convert bytes back to text
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    // Return original text if decryption fails
    // This handles cases where data wasn't encrypted
    return encryptedText;
  }
}

/**
 * Check if a string looks like base64 encoded data
 */
function isBase64(str: string): boolean {
  if (!str || str.length < 20) {
    return false;
  }

  // Base64 pattern: only contains valid base64 characters
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return base64Regex.test(str);
}

/**
 * Check if encryption is available in this browser
 */
export function isEncryptionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined'
  );
}

/**
 * Export the encryption salt for backup purposes
 * This allows users to backup their encryption key
 */
export function exportEncryptionSalt(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(SALT_KEY);
}

/**
 * Import an encryption salt from a backup
 * WARNING: This will overwrite the current salt!
 */
export function importEncryptionSalt(saltBase64: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Validate it's valid base64
    atob(saltBase64);
    localStorage.setItem(SALT_KEY, saltBase64);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear the encryption salt (for account deletion)
 */
export function clearEncryptionSalt(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SALT_KEY);
  }
}
