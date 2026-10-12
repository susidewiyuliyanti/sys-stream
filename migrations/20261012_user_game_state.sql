-- Per-user game state is authoritative in D1; no game state is stored as a browser database.
CREATE TABLE IF NOT EXISTS user_game_state (
  user_id TEXT PRIMARY KEY,
  inventory_json TEXT NOT NULL DEFAULT '[]',
  history_json TEXT NOT NULL DEFAULT '[]',
  crypto_card_json TEXT NOT NULL DEFAULT '{}',
  viewer_list_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
