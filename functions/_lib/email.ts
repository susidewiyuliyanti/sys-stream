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

export const BRAND_LOGO_URL = "https://sysstreamer.asia/sys-streamer-logo.svg";
export const BRAND_SITE_URL = "https://sysstreamer.asia";

export function brandedEmailHtml(content: string, preheader = ""): string {
  const safePreheader = String(preheader || "").trim();
  return "<!doctype html><html><body style='margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5'>" +
    "<div style='display:none;max-height:0;overflow:hidden;opacity:0'>" + safePreheader + "</div>" +
    "<div style='width:100%;background:#050505;padding:32px 12px'><div style='max-width:620px;margin:0 auto;background:#0a0a0a;border:1px solid #8a4b00;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(245,169,0,.12)'>" +
    "<div style='padding:26px 24px 18px;text-align:center;border-bottom:1px solid #2a1a05'><img src='" + BRAND_LOGO_URL + "' width='120' height='120' alt='SYS STREAMER' style='display:block;width:120px;height:120px;margin:0 auto 10px;border:0;outline:none;text-decoration:none'><div style='font-size:12px;letter-spacing:6px;color:#f5c451'>LIVE • GAMING • CREATOR</div></div>" +
    "<div style='padding:28px 24px 30px'>" + content + "</div>" +
    "<div style='padding:18px 24px;text-align:center;border-top:1px solid #2a1a05;color:#9ca3af;font-size:12px;line-height:1.6'><strong style='color:#f5c451'>SYS STREAMER</strong><br><a href='" + BRAND_SITE_URL + "' style='color:#f5c451;text-decoration:none'>sysstreamer.asia</a><br>This is an automated message. Please do not reply unless this mailbox is designated for support.</div>" +
    "</div></div></body></html>";
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
      html: brandedEmailHtml(`
        <h1 style="margin:0 0 12px;color:#f5c451;font-size:26px">Verify Your Email</h1>
        <p style="line-height:1.7;color:#e5e7eb">Please verify your email address to activate your SYS STREAMER account.</p>
        <p style="margin:28px 0">
          <a href="${verifyUrl}" style="display:inline-block;padding:14px 22px;background:#f5a900;color:#050505;text-decoration:none;font-weight:800;border-radius:10px">Verify Email</a>
        </p>
        <p style="font-size:13px;color:#9ca3af;line-height:1.7">
          This verification link expires in 24 hours and can only be used once.
          If you did not create this account, you can ignore this email.
        </p>
      `, "Verify your SYS STREAMER email address"),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Verification email provider error", response.status, detail.slice(0, 500));
    return { ok: false, error: "Email provider menolak pengiriman." };
  }

  return { ok: true };
}
