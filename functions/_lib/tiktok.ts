import { Env } from "./db";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

function base64Decode(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function encryptionKey(env: Env): Promise<CryptoKey> {
  const secret = String(env.TIKTOK_TOKEN_ENCRYPTION_KEY || env.AUTH_JWT_SECRET || "").trim();
  if (!secret) throw new Error("TIKTOK_TOKEN_ENCRYPTION_KEY_NOT_CONFIGURED");
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptToken(env: Env, value: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await encryptionKey(env);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, textEncoder.encode(value));
  return base64Encode(iv) + "." + base64Encode(new Uint8Array(encrypted));
}

export async function decryptToken(env: Env, value: string): Promise<string> {
  const [ivText, payloadText] = String(value || "").split(".");
  if (!ivText || !payloadText) throw new Error("TIKTOK_TOKEN_INVALID");
  const key = await encryptionKey(env);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64Decode(ivText) }, key, base64Decode(payloadText));
  return textDecoder.decode(decrypted);
}

export function tiktokRedirectUri(request: Request): string {
  const url = new URL(request.url);
  return url.origin + "/api/airdrop/tiktok/callback";
}

export async function ensureTikTokTables(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS airdrop_social_oauth_states (
    state TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    provider TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS airdrop_social_connections (
    wallet_address TEXT NOT NULL,
    platform TEXT NOT NULL,
    platform_user_id TEXT NOT NULL,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at INTEGER,
    scope TEXT,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY(wallet_address, platform)
  )`).run();
}

export async function randomState(): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64Encode(bytes).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
}
