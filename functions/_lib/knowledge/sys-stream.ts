export type KnowledgeItem = {
  id: string;
  category: string;
  title: string;
  content: string;
  verified: boolean;
};

export const SYS_STREAM_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "brand",
    category: "brand",
    title: "SYS STREAM",
    content:
      "SYS STREAM adalah platform live, community, campaign, dan Airdrop. Informasi publik harus menggunakan data resmi yang telah diverifikasi admin.",
    verified: true,
  },
  {
    id: "airdrop-required-tasks",
    category: "airdrop",
    title: "Required Airdrop Tasks",
    content:
      "Airdrop memiliki 7 task sosial wajib: YouTube @sysstreamer, YouTube Shorts @sysstreamer, TikTok @sysstreamer, Instagram @sysstreamer, Twitter/X @sysstreamer, Telegram @sysstreamer, dan Discord https://discord.com/users/1339958738051792976. Facebook bersifat optional dan bukan bagian dari gate 7/7.",
    verified: true,
  },
  {
    id: "airdrop-gate",
    category: "airdrop",
    title: "Airdrop Global Gate",
    content:
      "Semua task Airdrop utama hanya dapat digunakan setelah 7 dari 7 task wajib dinyatakan fulfilled. Jika baru 6/7 atau kurang, task Airdrop tetap terkunci.",
    verified: true,
  },
  {
    id: "profile",
    category: "user",
    title: "User Profile",
    content:
      "Identitas user yang ditampilkan pada profil menggunakan wallet yang digunakan ketika login atau registrasi. Referral link menggunakan wallet user.",
    verified: true,
  },
  {
    id: "registration-bonus",
    category: "reward",
    title: "Registration Bonus",
    content:
      "Bonus registrasi hanya dapat diklaim satu kali oleh setiap user.",
    verified: true,
  },
  {
    id: "live-room",
    category: "live",
    title: "Live Room",
    content:
      "Setiap user memiliki profil sendiri dan dapat berpartisipasi dalam live room. Data user antar akun harus tetap terpisah dan tidak boleh menggunakan data dummy.",
    verified: true,
  },
  {
    id: "ai-safety",
    category: "ai",
    title: "AI Safety",
    content:
      "AI Agent tidak boleh mengarang reward, saldo, tanggal campaign, eligibility, link resmi, status user, atau aturan Airdrop. Jika data tidak tersedia atau belum diverifikasi, AI harus meminta admin melakukan konfirmasi.",
    verified: true,
  },
];

export function getKnowledgeBase(): KnowledgeItem[] {
  return SYS_STREAM_KNOWLEDGE.filter((item) => item.verified);
}

export function formatKnowledgeBase(): string {
  return getKnowledgeBase()
    .map(
      (item) =>
        `[${item.category}] ${item.title}\n${item.content}`,
    )
    .join("\n\n");
}
