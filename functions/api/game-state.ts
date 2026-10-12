import { Env, json } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

type GameState = {
  inventory: unknown[];
  history: unknown[];
  cryptoCard: Record<string, unknown>;
  viewerList: string[];
};

const DEFAULT_CARD = {
  cardTitle: "CYBER SOLANA VAULT CARD",
  serialNumber: "SN-SOL-2026-8941",
  network: "Solana Virtual Machine L1",
  rarity: "Legendary",
  digits: [7, 4, 2, 9],
  concealed: [false, true, true, false],
  streamerNote: "Guess the 2 middle hidden digits! High payout on exact match.",
};

async function ensureGameState(env: Env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS user_game_state (
      user_id TEXT PRIMARY KEY,
      inventory_json TEXT NOT NULL DEFAULT '[]',
      history_json TEXT NOT NULL DEFAULT '[]',
      crypto_card_json TEXT NOT NULL DEFAULT '{}',
      viewer_list_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
  try {
    await ensureGameState(env);
    const row = await env.DB.prepare(`
      SELECT inventory_json AS inventory, history_json AS history,
             crypto_card_json AS cryptoCard, viewer_list_json AS viewerList
      FROM user_game_state WHERE user_id = ? LIMIT 1
    `).bind(String(auth.user.id)).first<any>();

    return json({
      success: true,
      state: row ? {
        inventory: parseJson(row.inventory, []),
        history: parseJson(row.history, []),
        cryptoCard: parseJson(row.cryptoCard, DEFAULT_CARD),
        viewerList: parseJson(row.viewerList, []),
      } : null,
    });
  } catch (error) {
    console.error("game state read error", error);
    return json({ success: false, error: "Gagal mengambil data game." }, 500);
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json().catch(() => null) as Partial<GameState> | null;
    if (!body || typeof body !== "object") {
      return json({ success: false, error: "Data game tidak valid." }, 400);
    }

    const inventory = Array.isArray(body.inventory) ? body.inventory.slice(0, 500) : [];
    const history = Array.isArray(body.history) ? body.history.slice(0, 100) : [];
    const viewerList = Array.isArray(body.viewerList)
      ? body.viewerList.map((v) => String(v).trim()).filter(Boolean).slice(0, 200)
      : [];
    const cryptoCard = body.cryptoCard && typeof body.cryptoCard === "object" && !Array.isArray(body.cryptoCard)
      ? body.cryptoCard
      : DEFAULT_CARD;

    const serialized = {
      inventory: JSON.stringify(inventory),
      history: JSON.stringify(history),
      cryptoCard: JSON.stringify(cryptoCard),
      viewerList: JSON.stringify(viewerList),
    };
    if (Object.values(serialized).some((value) => value.length > 80000)) {
      return json({ success: false, error: "Data game terlalu besar untuk disimpan." }, 413);
    }

    await ensureGameState(env);
    await env.DB.prepare(`
      INSERT INTO user_game_state
        (user_id, inventory_json, history_json, crypto_card_json, viewer_list_json, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        inventory_json = excluded.inventory_json,
        history_json = excluded.history_json,
        crypto_card_json = excluded.crypto_card_json,
        viewer_list_json = excluded.viewer_list_json,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      String(auth.user.id),
      serialized.inventory,
      serialized.history,
      serialized.cryptoCard,
      serialized.viewerList,
    ).run();

    return json({ success: true, saved: true });
  } catch (error) {
    console.error("game state save error", error);
    return json({ success: false, error: "Gagal menyimpan data game." }, 500);
  }
}
