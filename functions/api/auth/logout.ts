import { Env, json } from "../../_lib/db";
import { createClearAuthCookie } from "../../_lib/auth";

export async function onRequestPost({ env }: { request: Request; env: Env }) {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": createClearAuthCookie(),
    },
  });
}
