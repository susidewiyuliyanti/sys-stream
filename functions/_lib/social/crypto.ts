function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function getKey(secret: string): Promise<CryptoKey> {
  const raw = base64ToBytes(secret);

  if (raw.byteLength !== 32) {
    throw new Error(
      "SOCIAL_TOKEN_ENCRYPTION_KEY harus berupa base64 dari tepat 32 bytes.",
    );
  }

  return crypto.subtle.importKey(
    "raw",
    raw,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSocialToken(
  secret: string,
  plaintext: string,
): Promise<string> {
  const key = await getKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    new TextEncoder().encode(plaintext),
  );

  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), iv.length);

  return bytesToBase64(result);
}

export async function decryptSocialToken(
  secret: string,
  ciphertext: string,
): Promise<string> {
  const key = await getKey(secret);
  const data = base64ToBytes(ciphertext);

  if (data.byteLength <= 12) {
    throw new Error("Encrypted social token tidak valid.");
  }

  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encrypted,
  );

  return new TextDecoder().decode(decrypted);
}
