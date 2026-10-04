import { buildAgentPrompt } from "../functions/_lib/ai-agent";

const prompt = buildAgentPrompt({
  task: "content",
  language: "id",
  platform: "tiktok",
  prompt: "Buat caption promosi Airdrop SYS STREAM.",
  context: {
    verified_context_only: true,
    admin_approval_required_for_publication: true,
  },
});

const checks = [
  ["Knowledge Base included", prompt.includes("VERIFIED SYS STREAM KNOWLEDGE BASE")],
  ["7/7 rule included", prompt.includes("7 dari 7")],
  ["Facebook optional included", prompt.toLowerCase().includes("facebook")],
  ["No invention rule", prompt.includes("Never invent Airdrop rules")],
  ["Admin confirmation rule", prompt.includes("admin")],
  ["TikTok platform", prompt.includes("Platform: tiktok")],
  ["Indonesian language", prompt.includes("Language: id")],
];

let failed = false;

for (const [name, passed] of checks) {
  if (passed) {
    console.log(`PASS  ${name}`);
  } else {
    console.error(`FAIL  ${name}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("");
console.log("AI Agent Knowledge Base smoke test: PASS");
