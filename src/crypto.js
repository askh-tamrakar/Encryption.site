// Minimal AES-GCM encryption/decryption with PBKDF2 key derivation
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

async function deriveKeyFromPassword(password, salt, iterations = 100000) {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(password, salt);
  const data = textEncoder.encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const cipherBytes = new Uint8Array(cipherBuffer);
  const output = new Uint8Array(salt.length + iv.length + cipherBytes.length);
  output.set(salt, 0);
  output.set(iv, salt.length);
  output.set(cipherBytes, salt.length + iv.length);
  return output;
}

export async function decryptToText(packedBytes, password) {
  if (!(packedBytes instanceof Uint8Array)) throw new Error('Expected Uint8Array');
  if (packedBytes.length < 29) throw new Error('Data too short');
  const salt = packedBytes.slice(0, 16);
  const iv = packedBytes.slice(16, 28);
  const ciphertext = packedBytes.slice(28);
  const key = await deriveKeyFromPassword(password, salt);
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return textDecoder.decode(plainBuffer);
}

export function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, slice);
  }
  return btoa(binary);
}

export function base64ToBytes(base64) {
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}


