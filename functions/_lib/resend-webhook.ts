const MAX_SKEW_SECONDS = 5 * 60;

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export async function verifyResendWebhook(payload: string, headers: Headers, secret: string): Promise<boolean> {
  const svixId = headers.get("svix-id") || "";
  const svixTimestamp = headers.get("svix-timestamp") || "";
  const svixSignature = headers.get("svix-signature") || "";
  if (!svixId || !svixTimestamp || !svixSignature || !secret) return false;
  const timestamp = Number(svixTimestamp);
  if (!Number.isFinite(timestamp) || Math.abs(Math.floor(Date.now()/1000) - timestamp) > MAX_SKEW_SECONDS) return false;
  const secretValue = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: Uint8Array;
  try { keyBytes = base64ToBytes(secretValue); } catch { return false; }
  const key = await crypto.subtle.importKey("raw", keyBytes, {name:"HMAC",hash:"SHA-256"}, false, ["verify"]);
  const signed = new TextEncoder().encode(svixId + "." + svixTimestamp + "." + payload);
  for (const item of svixSignature.split(" ").map(v=>v.trim()).filter(Boolean)) {
    const parts = item.split(",",2);
    if (parts[0] !== "v1" || !parts[1]) continue;
    try { if (await crypto.subtle.verify("HMAC", key, base64ToBytes(parts[1]), signed)) return true; } catch {}
  }
  return false;
}

export function firstHeader(headers: any, names: string[]): string {
  if (!headers || typeof headers !== "object") return "";
  for (const name of names) {
    const key = Object.keys(headers).find(k=>k.toLowerCase()===name.toLowerCase());
    if (key && headers[key]) return String(headers[key]);
  }
  return "";
}
