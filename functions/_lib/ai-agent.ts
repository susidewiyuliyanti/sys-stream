export type AgentTask =
  | "content"
  | "reply"
  | "campaign"
  | "video_script"
  | "strategy";

export interface AgentRequest {
  task: AgentTask;
  prompt: string;
  context?: Record<string, unknown>;
  language?: string;
  platform?: string;
}

export interface AgentResponse {
  success: boolean;
  task: AgentTask;
  output?: string;
  model?: string;
  error?: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are SYS Stream AI Agent, the official marketing and community assistant for SYS Stream.

Your job is to help create accurate, useful marketing content and community responses for SYS Stream.
Rules:
- Never invent Airdrop rules, rewards, balances, eligibility, dates, links, or user status.
- If required information is missing, say that it needs to be confirmed by SYS Stream admin.
- Do not impersonate users or claim to be a human.
- Do not generate spam, fake engagement, mass-following, mass-like, or deceptive engagement instructions.
- Keep crypto-related statements factual and avoid promises of profit or guaranteed returns.
- For public marketing content, use clear calls to action without misleading claims.
- Match the requested language and platform style.
- Return only the requested content unless a brief explanation is explicitly requested.`;

function clean(value: unknown, max = 12000): string {
  return String(value ?? "").trim().slice(0, max);
}

export function buildAgentPrompt(input: AgentRequest): string {
  const language = clean(input.language || "id", 40);
  const platform = clean(input.platform || "general", 40);
  const context = input.context ? JSON.stringify(input.context).slice(0, 12000) : "{}";

  return [
    DEFAULT_SYSTEM_PROMPT,
    "",
    `Task: ${input.task}`,
    `Language: ${language}`,
    `Platform: ${platform}`,
    `Verified context: ${context}`,
    "",
    "User instruction:",
    clean(input.prompt),
  ].join("\n");
}

export async function runAiAgent(
  env: { GEMINI_API_KEY?: string; AI_MODEL?: string },
  input: AgentRequest,
): Promise<AgentResponse> {
  const apiKey = clean(env.GEMINI_API_KEY, 300);
  if (!apiKey) {
    return {
      success: false,
      task: input.task,
      error: "AI agent belum dikonfigurasi. Tambahkan GEMINI_API_KEY pada environment server.",
    };
  }

  const model = clean(env.AI_MODEL || "gemini-2.5-flash", 100);
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: DEFAULT_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildAgentPrompt(input) }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1600,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("SYS Stream AI agent provider error", response.status, detail.slice(0, 1000));
    return {
      success: false,
      task: input.task,
      model,
      error: "AI provider gagal memproses permintaan.",
    };
  }

  const data = await response.json() as any;
  const output = data?.candidates?.[0]?.content?.parts
    ?.map((part: any) => String(part?.text || ""))
    .join("")
    .trim();

  if (!output) {
    return {
      success: false,
      task: input.task,
      model,
      error: "AI provider tidak mengembalikan konten.",
    };
  }

  return { success: true, task: input.task, output, model };
}
