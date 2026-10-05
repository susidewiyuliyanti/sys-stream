import PostalMime from "postal-mime";

interface Env {
  DB: D1Database;
}

function clean(value: unknown, max = 500000): string {
  return String(value ?? "").trim().slice(0, max);
}

function emailAddress(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    const m = value.match(/<([^<>]+)>/);
    return (m ? m[1] : value).trim().toLowerCase();
  }

  if (Array.isArray(value)) {
    return emailAddress(value[0]);
  }

  return String(value.address || value.email || "").trim().toLowerCase();
}

function displayName(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    const m = value.match(/^(.*?)\s*<[^<>]+>$/);
    return m ? m[1].replace(/^["']|["']$/g, "").trim() : "";
  }

  if (Array.isArray(value)) {
    return displayName(value[0]);
  }

  return String(value.name || "").trim();
}

function headersToObject(headers: any): Record<string, string> {
  const out: Record<string, string> = {};

  if (!headers) return out;

  if (Array.isArray(headers)) {
    for (const item of headers) {
      const key = clean(item?.key || item?.name, 200);
      const value = clean(item?.value, 10000);

      if (key) out[key] = value;
    }

    return out;
  }

  if (typeof headers === "object") {
    for (const [key, value] of Object.entries(headers)) {
      out[key] = clean(value, 10000);
    }
  }

  return out;
}

function getHeader(
  headers: Record<string, string>,
  names: string[]
): string {
  for (const name of names) {
    const key = Object.keys(headers).find(
      (k) => k.toLowerCase() === name.toLowerCase()
    );

    if (key && headers[key]) {
      return headers[key];
    }
  }

  return "";
}

function attachmentMetadata(attachments: any[]): any[] {
  return (attachments || []).map((a: any) => ({
    filename: clean(a?.filename || a?.name || "", 500),
    mimeType: clean(a?.mimeType || a?.contentType || "", 200),
    disposition: clean(a?.disposition || "", 100),
    contentId: clean(a?.contentId || "", 500),
    size:
      typeof a?.content?.byteLength === "number"
        ? a.content.byteLength
        : typeof a?.size === "number"
          ? a.size
          : null
  }));
}

export default {
  async email(message: any, env: Env): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    try {
      const raw = await new Response(message.raw).arrayBuffer();
      const parsed: any = await PostalMime.parse(raw);

      const fromEmail =
        emailAddress(parsed.from) ||
        String(message.from || "").trim().toLowerCase();

      const fromName = displayName(parsed.from);

      const toEmail =
        emailAddress(parsed.to) ||
        String(message.to || "admin@sysstreamer.asia")
          .trim()
          .toLowerCase();

      const subject = clean(parsed.subject || "", 998);
      const textBody = clean(parsed.text || "");
      const htmlBody = clean(parsed.html || "");

      const headers = headersToObject(parsed.headers);

      const messageId = clean(
        getHeader(headers, ["Message-ID", "Message-Id"]) ||
          `cloudflare-${crypto.randomUUID()}`,
        1000
      );

      const inReplyTo = getHeader(headers, ["In-Reply-To"]);
      const references = getHeader(headers, ["References"]);

      let threadId = crypto.randomUUID();

      const parentRef =
        inReplyTo ||
        references
          .split(/\s+/)
          .filter(Boolean)
          .pop() ||
        "";

      if (parentRef) {
        const parent = await env.DB
          .prepare(
            "SELECT thread_id FROM email_inbox_messages WHERE message_id=? ORDER BY created_at DESC LIMIT 1"
          )
          .bind(parentRef)
          .first<any>();

        if (parent?.thread_id) {
          threadId = String(parent.thread_id);
        }
      }

      const id = crypto.randomUUID();

      /*
       * The existing table was originally designed around Resend.
       * We retain those columns for compatibility but use a Cloudflare
       * generated identifier in resend_email_id so the existing inbox
       * APIs can continue to work.
       */
      const inboundId = `cloudflare-${crypto.randomUUID()}`;

      const attachments = attachmentMetadata(parsed.attachments || []);

      await env.DB
        .prepare(
          `INSERT INTO email_inbox_messages
          (
            id,
            resend_email_id,
            message_id,
            thread_id,
            direction,
            mailbox,
            from_email,
            from_name,
            to_email,
            subject,
            text_body,
            html_body,
            headers_json,
            attachments_json,
            status,
            in_reply_to,
            references_header,
            received_at,
            created_at,
            updated_at
          )
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        )
        .bind(
          id,
          inboundId,
          messageId,
          threadId,
          "inbound",
          toEmail,
          fromEmail,
          fromName,
          toEmail,
          subject,
          textBody,
          htmlBody,
          JSON.stringify(headers),
          JSON.stringify(attachments),
          "unread",
          inReplyTo || null,
          references || null,
          now,
          now,
          now
        )
        .run();

      console.log(
        JSON.stringify({
          success: true,
          id,
          mailbox: toEmail,
          from: fromEmail,
          subject
        })
      );
    } catch (error: any) {
      console.error(
        JSON.stringify({
          success: false,
          error: String(error?.message || error)
        })
      );

      /*
       * Do not silently forward the email.
       * Throwing lets Cloudflare report the email handler failure.
       */
      throw error;
    }
  }
};
