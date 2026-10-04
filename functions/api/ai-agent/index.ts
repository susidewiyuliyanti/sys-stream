import { Env, json, readJson } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { AgentRequest, runAiAgent } from "../../_lib/ai-agent";

const TASKS = new Set(["content", "reply", "campaign", "video_script", "strategy"]);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  return json({
    success: true,
    agent: "sys-stream-ai-agent",
    phase: 1,
    status: env.GEMINI_API_KEY ? "configured" : "needs_configuration",
    capabilities: ["content", "reply", "campaign", "video_script", "strategy"],
  });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  try {
    const body = await readJson<Partial<AgentRequest>>(request);
    const task = String(body?.task || "").trim() as AgentRequest["task"];
    const prompt = String(body?.prompt || "").trim();

    if (!TASKS.has(task)) {
      return json({ success: false, error: "Task AI Agent tidak valid." }, 400);
    }

    if (!prompt) {
      return json({ success: false, error: "Instruksi AI Agent wajib diisi." }, 400);
    }

    if (prompt.length > 12000) {
      return json({ success: false, error: "Instruksi terlalu panjang." }, 400);
    }

    const result = await runAiAgent(env, {
      task,
      prompt,
      language: String(body?.language || "id"),
      platform: String(body?.platform || "general"),
      context: body?.context && typeof body.context === "object" ? body.context : {},
    });

    return json(result, result.success ? 200 : 502);
  } catch (error) {
    console.error("SYS Stream AI agent error", error);
    return json({ success: false, error: "AI Agent gagal memproses permintaan." }, 500);
  }
}
