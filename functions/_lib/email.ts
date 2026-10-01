import { Env } from "./db";

const DEFAULT_FROM = "support@sysstreamer.asia";
const VERIFICATION_TTL_SECONDS = 24 * 60 * 60;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function createVerificationToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64Url(bytes);
}

export async function hashVerificationToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function verificationExpiry(): number {
  return Math.floor(Date.now() / 1000) + VERIFICATION_TTL_SECONDS;
}

export function verificationUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/#/verify-email?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(
  env: Env,
  to: string,
  token: string,
  origin: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const from = String(env.EMAIL_FROM || DEFAULT_FROM).trim() || DEFAULT_FROM;

  if (!apiKey) {
    console.error("Email provider is not configured: RESEND_API_KEY is missing.");
    return { ok: false, error: "Email service belum dikonfigurasi." };
  }

  const verifyUrl = verificationUrl(origin, token);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `SYS STREAM <${from}>`,
      to: [to],
      subject: "Verify your SYS STREAM email",
      html: `
        <div style="margin:0;padding:32px 16px;background:#060a14;font-family:Arial,sans-serif;color:#e2e8f0">
          <div style="max-width:560px;margin:0 auto;padding:28px;background:#0b1220;border:1px solid #164e63;border-radius:18px">
            <h1 style="margin:0 0 10px;color:#22d3ee;font-size:24px">SYS STREAM</h1>
            <p style="line-height:1.6">Please verify your email address to activate your account.</p>
            <p style="margin:28px 0">
              <a href="${verifyUrl}" style="display:inline-block;padding:13px 20px;background:#06b6d4;color:#001018;text-decoration:none;font-weight:700;border-radius:10px">Verify Email</a>
            </p>
            <p style="font-size:13px;color:#94a3b8;line-height:1.6">
              This verification link expires in 24 hours and can only be used once.
              If you did not create this account, you can ignore this email.
            </p>
            <p style="font-size:12px;color:#64748b;margin-top:24px">SYS STREAM • sysstreamer.asia</p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Verification email provider error", response.status, detail.slice(0, 500));
    return { ok: false, error: "Email provider menolak pengiriman." };
  }

  return { ok: true };
}
