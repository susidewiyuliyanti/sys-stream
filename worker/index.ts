/**
 * SYS STREAMER - CLOUDFLARE WORKER
 * Real-time Durable Object for Live Stream Chat (TikTok + App), Game Widgets,
 * NOWPayments Gateway, and D1 Database (users, payments, locks, leaderboard, rooms, referral).
 */

export interface Env {
  DB: D1Database;
  ROOM_DURABLE_OBJECT: DurableObjectNamespace;
  NOWPAYMENTS_API_KEY: string;
  NOWPAYMENTS_IPN_SECRET: string;
  ADMIN_API_KEY: string;
  BASE_URL: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  source?: 'app' | 'tiktok';
  gift?: string;
  timestamp: number;
}

export interface RoomState {
  roomId: string;
  streamerId: string;
  tiktokLiveId: string;
  title: string;
  chat: ChatMessage[];
  activeGame: 'idle' | 'tebak' | 'spinner';
  gameData?: any;
  viewersCount: number;
}

// -------------------------------------------------------------
// 1. DURABLE OBJECT: LIVE STREAM & CHAT (RoomDurableObject)
// -------------------------------------------------------------

export class RoomDurableObject {
  state: DurableObjectState;
  env: Env;
  sessions: Map<WebSocket, { user: string }>;
  roomData!: RoomState;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();

    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<RoomState>('roomData');
      if (stored) {
        this.roomData = stored;
      } else {
        this.roomData = {
          roomId: 'room_main',
          streamerId: 'streamer_neo_01',
          tiktokLiveId: '@neostreamer_live',
          title: 'ðŸ”¥ TIKTOK LIVE ARENA - TEBAK & SPINNER JACKPOT',
          chat: [
            { id: '1', user: 'TikTok_Viewer_44', text: 'Halo bang! Gaskeun spinnernya! ðŸ”¥', source: 'tiktok', timestamp: Date.now() - 40000 },
            { id: '2', user: 'App_CyberGamer', text: 'All in Tebak angka High nih!', source: 'app', timestamp: Date.now() - 25000 },
            { id: '3', user: 'TikTok_Budi', text: 'Sent 1x Rose ðŸŒ¹', source: 'tiktok', gift: 'Rose ðŸŒ¹', timestamp: Date.now() - 10000 },
          ],
          activeGame: 'idle',
          viewersCount: 248,
        };
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws' || url.pathname === '/websocket') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 400 });
      }

      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      await this.handleWebSocketSession(
        server,
        url.searchParams.get('user') || 'neo_user_922'
      );

      return new Response(null, { status: 101, webSocket: client } as any);
    }

    if (url.pathname === '/api/chat') {
      if (request.method === 'POST') {
        const body: any = await request.json();
        const newMsg: ChatMessage = {
          id: 'c_' + Date.now(),
          user: body.user || 'Anonymous',
          text: body.text || '',
          source: body.source || 'app',
          gift: body.gift,
          timestamp: Date.now(),
        };
        this.roomData.chat.push(newMsg);
        if (this.roomData.chat.length > 80) this.roomData.chat.shift();
        await this.state.storage.put('roomData', this.roomData);
        this.broadcastChat();
        return new Response(JSON.stringify({ success: true, message: newMsg }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(this.roomData.chat), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/api/room-state') {
      return new Response(JSON.stringify(this.roomData), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  async handleWebSocketSession(ws: WebSocket, user: string) {
    (ws as any).accept?.();
    this.sessions.set(ws, { user });
    this.roomData.viewersCount = Math.max(248, this.sessions.size + 240);

    // Initial message to the connected client
    ws.send(JSON.stringify({ type: 'init', chat: this.roomData.chat, roomState: this.roomData }));

    ws.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.type === 'chat') {
          const chatMsg: ChatMessage = {
            id: 'c_' + Date.now() + Math.random().toString(36).substring(2, 5),
            user: msg.user || user,
            text: msg.text || '',
            source: msg.source || 'app',
            gift: msg.gift,
            timestamp: Date.now(),
          };

          this.roomData.chat.push(chatMsg);
          if (this.roomData.chat.length > 80) this.roomData.chat.shift();
          await this.state.storage.put('roomData', this.roomData);

          this.broadcastChat();
        } else if (msg.type === 'game_event') {
          this.roomData.activeGame = msg.game;
          this.roomData.gameData = msg.data;
          await this.state.storage.put('roomData', this.roomData);
          this.broadcast({ type: 'game_event', game: msg.game, data: msg.data });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.addEventListener('close', () => {
      this.sessions.delete(ws);
      this.roomData.viewersCount = Math.max(248, this.sessions.size + 240);
    });
  }

  broadcastChat() {
    this.broadcast({ type: 'chat', chat: this.roomData.chat });
  }

  broadcast(payload: any) {
    const data = JSON.stringify(payload);
    for (const [ws] of this.sessions) {
      try {
        ws.send(data);
      } catch {
        this.sessions.delete(ws);
      }
    }
  }
}

// -------------------------------------------------------------
// 2. NOWPAYMENTS CRYPTO PAYMENT GATEWAY HELPERS
// -------------------------------------------------------------

async function createNowPaymentsInvoice(
  env: Env,
  params: {
    userId: string;
    orderId: string;
    priceAmountUsd: number;
    payCurrency: string;
    orderDescription: string;
  }
) {
  const endpoint = 'https://api.nowpayments.io/v1/payment';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': env.NOWPAYMENTS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_amount: params.priceAmountUsd,
      price_currency: 'usd',
      pay_currency: params.payCurrency.toLowerCase(),
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: `${env.BASE_URL}/api/payments/ipn`,
    }),
  });

  return await response.json();
}

async function getAuthenticatedUser(request: Request, env: Env) {
  const token = (request.headers.get('Authorization') || '')
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!token || !env.DB) return null;

  return await env.DB.prepare(
    `SELECT
       u.id,
       u.username,
       u.email,
       COALESCE(u.available_balance, 0) AS balance,
       COALESCE(u.total_locked, 0) AS lockedBalance
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ?
       AND s.expires_at > ?
     LIMIT 1`
  ).bind(token, Math.floor(Date.now() / 1000)).first<any>();
}

// -------------------------------------------------------------
// 3. WORKER FETCH HANDLER & ROUTER
// -------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await this.handleRequest(request, env, ctx);
    } catch (err: any) {
      return new Response(JSON.stringify({success:false,error:err?.message || 'Worker request failed'}), {
        status: 500,
        headers: {'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}
      });
    }
  },
  async handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        },
      });
    }

    // A. Forward WebSocket to RoomDurableObject
    if (url.pathname === '/ws' || url.pathname.startsWith('/api/room/ws')) {
      const id = env.ROOM_DURABLE_OBJECT.idFromName('main_room');
      const stub = env.ROOM_DURABLE_OBJECT.get(id);
      return stub.fetch(request);
    }

    // B. Protected game/account endpoints require a valid authenticated session.
    // The client cannot choose another user's identity.
    if (url.pathname === '/api/locks/create' && request.method === 'POST') {
      try {
        const authUser = await getAuthenticatedUser(request, env);
        if (!authUser) {
          return new Response(JSON.stringify({ error: 'Unauthorized: login required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const body: any = await request.json();
        body.userId = String(authUser.id);
        request = new Request(request, { body: JSON.stringify(body) });
      } catch {
        return new Response(JSON.stringify({ error: 'Unauthorized: login required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // GET AUTHENTICATED USER BALANCE + LOCKS
    if (url.pathname === '/api/locks' && request.method === 'GET') {
      const authUser = await getAuthenticatedUser(request, env);
      if (!authUser) {
        return new Response(JSON.stringify({ error: 'Unauthorized: login required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const locks = await env.DB.prepare(`
        SELECT id, user_id, amount, duration_days, multiplier, start_date, end_date,
               status, daily_claims, last_claim_at
        FROM locks
        WHERE user_id = ?
        ORDER BY start_date DESC
      `).bind(String(authUser.id)).all();

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: String(authUser.id),
          balance: Number(authUser.balance || 0),
          lockedBalance: Number(authUser.lockedBalance || 0)
        },
        locks: locks.results || []
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // EARLY/FULL UNLOCK: principal is returned by the server.
    if (url.pathname === '/api/locks/unlock' && request.method === 'POST') {
      try {
        const authUser = await getAuthenticatedUser(request, env);
        if (!authUser) {
          return new Response(JSON.stringify({ error: 'Unauthorized: login required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const body: any = await request.json();
        const lockId = String(body.lockId || '');
        if (!lockId) {
          return new Response(JSON.stringify({ error: 'lockId is required' }), { status: 400 });
        }

        const lock: any = await env.DB.prepare(`
          SELECT id, user_id, amount, multiplier, start_date, end_date, status
          FROM locks
          WHERE id = ? AND user_id = ?
          LIMIT 1
        `).bind(lockId, String(authUser.id)).first();

        if (!lock) {
          return new Response(JSON.stringify({ error: 'Lock not found' }), { status: 404 });
        }
        if (lock.status !== 'locked') {
          return new Response(JSON.stringify({ error: 'Lock is not active' }), { status: 400 });
        }

        const now = Date.now();
        const matured = now >= Number(lock.end_date);
        const principal = Number(lock.amount);
        const payout = matured
          ? Number((principal * Number(lock.multiplier)).toFixed(4))
          : principal;

        // The lock row is the source of truth. Only an active lock can be settled.
        await env.DB.batch([
          env.DB.prepare(`
            UPDATE locks
            SET status = 'unlocked'
            WHERE id = ? AND user_id = ? AND status = 'locked'
          `).bind(lockId, String(authUser.id)),
          env.DB.prepare(`
            UPDATE users
            SET available_balance = available_balance + ?,
                total_locked = MAX(0, total_locked - ?)
            WHERE id = ?
          `).bind(payout, principal, String(authUser.id))
        ]);

        const updated: any = await env.DB.prepare(`
          SELECT available_balance, total_locked
          FROM users WHERE id = ? LIMIT 1
        `).bind(String(authUser.id)).first();

        return new Response(JSON.stringify({
          success: true,
          lockId,
          matured,
          principal,
          payout,
          balance: Number(updated?.available_balance || 0),
          lockedBalance: Number(updated?.total_locked || 0)
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || 'Unlock failed' }), { status: 500 });
      }
    }

    // SERVER-SIDE BLIND BOX REWARD. The client never decides the payout amount.
    if (url.pathname === '/api/blindbox/claim' && request.method === 'POST') {
      try {
        const authUser = await getAuthenticatedUser(request, env);
        if (!authUser) {
          return new Response(JSON.stringify({ error: 'Unauthorized: login required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const body: any = await request.json();
        const boxId = String(body.boxId || 'cyber_daily');
        const todayKey = new Date().toISOString().slice(0, 10);
        const userId = String(authUser.id);

        const locked: any = await env.DB.prepare(`
          SELECT COALESCE(SUM(amount),0) AS total_locked
          FROM locks
          WHERE user_id = ? AND status = 'locked'
        `).bind(userId).first();

        const totalLocked = Number(locked?.total_locked || 0);
        if (totalLocked < 4) {
          return new Response(JSON.stringify({ error: 'Minimum active lock is 4.00 USDT' }), { status: 400 });
        }

        const quota =
          totalLocked >= 500 ? 10 :
          totalLocked >= 250 ? 5 :
          totalLocked >= 100 ? 3 :
          totalLocked >= 50 ? 2 : 1;

        const claimTable = `CREATE TABLE IF NOT EXISTS blindbox_claims (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          claim_date TEXT NOT NULL,
          box_id TEXT NOT NULL,
          reward_usdt REAL NOT NULL,
          item_id TEXT NOT NULL,
          item_name TEXT NOT NULL,
          rarity TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          claim_number INTEGER NOT NULL,
          UNIQUE(user_id, claim_date, claim_number)
        )`;
        await env.DB.prepare(claimTable).run();

        const countRow: any = await env.DB.prepare(`
          SELECT COUNT(*) AS count FROM blindbox_claims
          WHERE user_id = ? AND claim_date = ?
        `).bind(userId, todayKey).first();

        const nextClaimNumber = Number(countRow?.count || 0) + 1;
        if (nextClaimNumber > quota) {
          return new Response(JSON.stringify({ error: 'Daily Blind Box quota reached', quota }), { status: 409 });
        }

        const pools: Record<string, Array<{id:string,name:string,rarity:string,reward:number}>> = {
          cyber_daily: [
            {id:'bb_1',name:'Tactical Neon Visor',rarity:'common',reward:0.5},
            {id:'bb_2',name:'Nano-Blade Dagger',rarity:'common',reward:0.8},
            {id:'bb_3',name:'EMP Grenade Launcher',rarity:'rare',reward:1.5},
            {id:'bb_4',name:'Holo-Decoy Drone',rarity:'rare',reward:2.5},
          ],
          apex_lockbox: [
            {id:'bb_5',name:'Vortex Hoverbike',rarity:'rare',reward:3.5},
            {id:'bb_6',name:'Plasma Katana Mk.IV',rarity:'epic',reward:7.5},
            {id:'bb_7',name:'Quantum Core Reactor',rarity:'epic',reward:12},
            {id:'bb_8',name:'Solaris Battle Automaton',rarity:'legendary',reward:25},
          ],
          dragon_vault: [
            {id:'bb_9',name:'Obsidian Dreadnought',rarity:'epic',reward:15},
            {id:'bb_10',name:'Aegis of the Sun God',rarity:'legendary',reward:35},
            {id:'bb_11',name:'Chronos Time Fragment',rarity:'legendary',reward:50},
            {id:'bb_12',name:'Cyber Dragon Sovereign',rarity:'mythic',reward:100},
          ]
        };

        const pool = pools[boxId] || pools.cyber_daily;
        if (boxId === 'apex_lockbox' && totalLocked < 50) {
          return new Response(JSON.stringify({ error: 'Apex box requires 50.00 USDT locked' }), { status: 400 });
        }
        if (boxId === 'dragon_vault' && totalLocked < 100) {
          return new Response(JSON.stringify({ error: 'Dragon Vault requires 100.00 USDT locked' }), { status: 400 });
        }

        const selected = pool[Math.floor(Math.random() * pool.length)];
        const scalingFactor = Math.max(1, Math.min(8, 1 + (totalLocked - 4) / 50));
        const reward = Number((selected.reward * scalingFactor).toFixed(2));
        const claimId = 'bb_' + crypto.randomUUID();

        await env.DB.batch([
          env.DB.prepare(`
            INSERT INTO blindbox_claims
              (id,user_id,claim_date,box_id,reward_usdt,item_id,item_name,rarity,created_at,claim_number)
            VALUES (?,?,?,?,?,?,?,?,?,?)
          `).bind(
            claimId,userId,todayKey,boxId,reward,selected.id,selected.name,selected.rarity,Date.now(),nextClaimNumber
          ),
          env.DB.prepare(`
            UPDATE users
            SET available_balance = available_balance + ?
            WHERE id = ?
          `).bind(reward,userId)
        ]);

        const updated: any = await env.DB.prepare(`
          SELECT available_balance, total_locked FROM users WHERE id = ? LIMIT 1
        `).bind(userId).first();

        return new Response(JSON.stringify({
          success:true,
          claimId,
          boxId,
          item:{ id:selected.id, name:selected.name, rarity:selected.rarity },
          rewardUsdt:reward,
          balance:Number(updated?.available_balance || 0),
          lockedBalance:Number(updated?.total_locked || 0),
          dailyUsed:Number(countRow?.count || 0)+1,
          dailyQuota:quota
        }), {
          headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
        });
      } catch (err:any) {
        return new Response(JSON.stringify({error:err?.message || 'Blind Box claim failed'}), {status:500});
      }
    }

    // CREATE LOCK: amount >= 4, duration in (30,60,90)
    if (url.pathname === '/api/locks/create' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { userId, amount, durationDays } = body;

        const numAmount = Number(amount);
        const days = Number(durationDays);

        if (numAmount < 4) {
          return new Response(JSON.stringify({ error: 'Minimum lock amount is 4.00' }), { status: 400 });
        }
        if (![30, 60, 90].includes(days)) {
          return new Response(JSON.stringify({ error: 'Duration must be 30, 60, or 90 days' }), { status: 400 });
        }

        const multiplier = days === 30 ? 1.15 : days === 60 ? 1.35 : 1.65;
        const lockId = 'lock_' + Date.now() + Math.random().toString(36).substring(2, 6);
        const startDate = Date.now();
        const endDate = startDate + days * 86400000;

        if (env.DB) {
          // Check balance & debit
          const user: any = await env.DB.prepare('SELECT available_balance FROM users WHERE id = ?').bind(userId).first();
          if (user && user.available_balance < numAmount) {
            return new Response(JSON.stringify({ error: 'Insufficient available balance' }), { status: 400 });
          }

          await env.DB.batch([
            env.DB.prepare(
              `INSERT INTO locks (id, user_id, amount, duration_days, multiplier, start_date, end_date, status, daily_claims)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'locked', 0)`
            ).bind(lockId, userId, numAmount, days, multiplier, startDate, endDate),
            env.DB.prepare(
              `UPDATE users SET available_balance = available_balance - ?, total_locked = total_locked + ? WHERE id = ?`
            ).bind(numAmount, numAmount, userId),
          ]);
        }

        return new Response(JSON.stringify({
          success: true,
          lock: { id: lockId, userId, amount: numAmount, durationDays: days, multiplier, startDate, endDate, status: 'locked' }
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // C. Daily Claims for Active Locks
    if (url.pathname === '/api/locks/claim' && request.method === 'POST') {
      try {
        const authUser = await getAuthenticatedUser(request, env);
        if (!authUser) {
          return new Response(JSON.stringify({ error: 'Unauthorized: login required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const body: any = await request.json();
        const lockId = String(body.lockId || '');
        const userId = String(authUser.id);

        if (!lockId || !userId) {
          return new Response(JSON.stringify({
            error: 'lockId and userId are required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (!env.DB) {
          return new Response(JSON.stringify({
            error: 'Database unavailable'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const now = Date.now();

        const lock: any = await env.DB.prepare(`
          SELECT
            id,
            user_id,
            amount,
            multiplier,
            daily_claims,
            last_claim_at,
            start_date,
            end_date,
            status
          FROM locks
          WHERE id = ?
            AND user_id = ?
          LIMIT 1
        `).bind(lockId, userId).first();

        if (!lock) {
          return new Response(JSON.stringify({
            error: 'Lock not found'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (lock.status !== 'locked') {
          return new Response(JSON.stringify({
            error: 'Lock is not active',
            status: lock.status
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (now >= Number(lock.end_date)) {
          return new Response(JSON.stringify({
            error: 'Lock period has ended. Settle the lock first.'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        // One claim per calendar day (UTC).
        const todayKey = new Date(now).toISOString().slice(0, 10);
        const lastClaimKey = lock.last_claim_at
          ? new Date(Number(lock.last_claim_at)).toISOString().slice(0, 10)
          : null;

        if (lastClaimKey === todayKey) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Daily reward already claimed today',
            claimedAmount: 0,
            daily_claims: Number(lock.daily_claims || 0),
            last_claim_at: Number(lock.last_claim_at)
          }), {
            status: 409,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const claimedAmount = Number(
          ((Number(lock.amount) * (Number(lock.multiplier) - 1)) / 30).toFixed(4)
        );

        if (!Number.isFinite(claimedAmount) || claimedAmount <= 0) {
          return new Response(JSON.stringify({
            error: 'Invalid calculated reward'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const nextDailyClaims = Number(lock.daily_claims || 0) + 1;

        await env.DB.batch([
          env.DB.prepare(`
            UPDATE locks
            SET
              daily_claims = ?,
              last_claim_at = ?
            WHERE id = ?
              AND user_id = ?
              AND status = 'locked'
              AND (last_claim_at IS NULL OR substr(datetime(last_claim_at / 1000, 'unixepoch'), 1, 10) <> ?)
          `).bind(
            nextDailyClaims,
            now,
            lockId,
            userId,
            todayKey
          ),

          env.DB.prepare(`
            UPDATE users
            SET available_balance = available_balance + ?
            WHERE id = ?
          `).bind(claimedAmount, userId)
        ]);

        return new Response(JSON.stringify({
          success: true,
          lockId,
          userId,
          claimedAmount,
          daily_claims: nextDailyClaims,
          last_claim_at: now
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({
          error: err?.message || 'Daily claim failed'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // D0. NOWPayments diagnostic
    if (url.pathname === '/api/payments/status' && request.method === 'GET') {
  const adminKey = request.headers.get('x-admin-api-key');

  if (!adminKey || adminKey !== env.ADMIN_API_KEY) {
    return new Response(JSON.stringify({
      error: 'Unauthorized'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const paymentId = url.searchParams.get('payment_id');

  if (!paymentId) {
    return new Response(JSON.stringify({
      error: 'payment_id is required'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const payment = await env.DB.prepare(`
    SELECT
      payment_id,
      invoice_id,
      user_id,
      amount,
      status,
      credited,
      created_at,
      nowpayments_status,
      pay_currency,
      pay_amount,
      pay_address,
      order_id,
      approved_at,
      approved_by,
      rejected_at,
      rejected_by,
      rejection_reason
    FROM payments
    WHERE payment_id = ?
    LIMIT 1
  `).bind(paymentId).first();

  if (!payment) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Payment not found',
      payment_id: paymentId
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    payment
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
if (url.pathname === '/api/payments/nowpayments-diagnostic' && request.method === 'GET') {
      const adminKey = request.headers.get('x-admin-api-key');
      const configured = typeof env.ADMIN_API_KEY === 'string' && env.ADMIN_API_KEY.length > 0;
      const received = typeof adminKey === 'string' && adminKey.length > 0;

      if (!configured || !received || adminKey !== env.ADMIN_API_KEY) {
        return new Response(JSON.stringify({
          error: 'Unauthorized',
          diagnostic: {
            admin_key_configured: configured,
            admin_key_received: received,
            received_length: adminKey ? adminKey.length : 0,
            configured_length: configured ? env.ADMIN_API_KEY.length : 0
          }
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      try {
        const response = await fetch('https://api.nowpayments.io/v1/currencies', {
          method: 'GET',
          headers: {
            'x-api-key': env.NOWPAYMENTS_API_KEY
          }
        });

        const text = await response.text();

        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            raw: text
          };
        }

        return new Response(JSON.stringify({
          success: response.ok,
          nowpayments_status: response.status,
          has_api_key: Boolean(env.NOWPAYMENTS_API_KEY),
          usdttrc20_available: Array.isArray(data.currencies)
            ? data.currencies.includes('usdttrc20')
            : null,
          response: data
        }), {
          status: response.ok ? 200 : 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          error: 'NOWPayments diagnostic request failed',
          message: error?.message || String(error)
        }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
    // D. NOWPayments: Create Crypto Deposit Payment
    if (url.pathname === '/api/payments/create-invoice' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const authUser = await getAuthenticatedUser(request, env);
        if (!authUser) return new Response(JSON.stringify({success:false,error:'Unauthorized'}), {status:401,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});

        const userId = String(authUser.id);
        const amountUsd = Number(body.amountUsd ?? body.amount);
        const raw = String(body.currency ?? body.payCurrency ?? 'usdttrc20').trim().toLowerCase();
        const payCurrency = raw === 'usdt' ? 'usdttrc20' : raw === 'bitcoin' ? 'btc' : raw === 'ethereum' ? 'eth' : raw === 'solana' ? 'sol' : raw === 'tron' ? 'trx' : raw;

        if (!Number.isFinite(amountUsd) || amountUsd < 5) return new Response(JSON.stringify({success:false,error:'Minimum deposit is 5 USD.'}), {status:400,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
        if (!['usdttrc20','btc','eth','sol','trx'].includes(payCurrency)) return new Response(JSON.stringify({success:false,error:'Unsupported cryptocurrency/network.'}), {status:400,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
        if (!env.DB) throw new Error('D1 database binding is unavailable');

        const user: any = await env.DB.prepare('SELECT id FROM users WHERE id = ? LIMIT 1').bind(userId).first();
        if (!user) return new Response(JSON.stringify({success:false,error:'User not found'}), {status:404,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});

        const apiKey = String(env.NOWPAYMENTS_API_KEY || '').trim();
        if (!apiKey) return new Response(JSON.stringify({success:false,error:'NOWPayments API key is not configured.'}), {status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});

        const minResponse = await fetch('https://api.nowpayments.io/v1/min-amount?currency_from=usd&currency_to='+encodeURIComponent(payCurrency), {headers:{'x-api-key':apiKey,'Accept':'application/json'}});
        const minText = await minResponse.text();
        let minData:any = {}; try { minData = minText ? JSON.parse(minText) : {}; } catch { minData = {raw:minText.slice(0,500)}; }
        if (!minResponse.ok) return new Response(JSON.stringify({success:false,error:'NOWPayments minimum-amount check failed.',provider_status:minResponse.status,provider:minData}), {status:502,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});

        const minAmountUsd = Number(minData?.min_amount || 0);
        if (minAmountUsd > 0 && amountUsd < minAmountUsd) return new Response(JSON.stringify({success:false,error:'Nominal di bawah minimum NOWPayments untuk network yang dipilih.',minimum_usd:minAmountUsd,amount_usd:amountUsd,pay_currency:payCurrency}), {status:400,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});

        const orderId = 'DEP-'+userId+'-'+Date.now()+'-'+crypto.randomUUID().slice(0,8);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        let npResponse: Response; let npData:any = {};
        try {
          npResponse = await fetch('https://api.nowpayments.io/v1/payment', {
            method:'POST',
            headers:{'x-api-key':apiKey,'Content-Type':'application/json','Accept':'application/json'},
            body:JSON.stringify({
              price_amount:Number(amountUsd.toFixed(2)),
              price_currency:'usd',
              pay_currency:payCurrency,
              ipn_callback_url:'https://sysstreamer.asia/api/payments/ipn',
              order_id:orderId,
              order_description:'SYS STREAM account deposit'
            }),
            signal:controller.signal
          });
          const text = await npResponse.text();
          try { npData = text ? JSON.parse(text) : {}; } catch { npData = {raw:text.slice(0,1000)}; }
        } finally { clearTimeout(timeout); }

        if (!npResponse.ok) {
          const providerMessage = npData?.message || npData?.error?.message || (typeof npData?.error === 'string' ? npData.error : null) || npData?.description || 'Provider rejected the payment request.';
          return new Response(JSON.stringify({success:false,error:'NOWPayments menolak pembuatan payment.',provider_status:npResponse.status,provider_message:String(providerMessage),provider_code:npData?.code ?? null,provider_error:typeof npData?.error === 'string' ? npData.error : null,pay_currency:payCurrency,amount_usd:amountUsd,minimum_usd:minAmountUsd || null}), {status:npResponse.status >= 400 && npResponse.status < 500 ? npResponse.status : 502,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
        }

        const paymentId = String(npData.payment_id || '');
        if (!paymentId || !npData.pay_address) return new Response(JSON.stringify({success:false,error:'NOWPayments returned an incomplete payment response.',provider_status:npResponse.status,provider:npData}), {status:502,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});

        await env.DB.prepare(`INSERT INTO payments (payment_id,invoice_id,user_id,amount,status,credited,created_at,nowpayments_status,pay_currency,pay_amount,pay_address,order_id) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`).bind(paymentId,npData.invoice_id != null ? String(npData.invoice_id) : null,userId,amountUsd,'PENDING',Math.floor(Date.now()/1000),npData.payment_status || 'waiting',npData.pay_currency || payCurrency,npData.pay_amount ?? null,npData.pay_address,orderId).run();

        return new Response(JSON.stringify({success:true,invoice:{payment_id:paymentId,invoice_id:npData.invoice_id != null ? String(npData.invoice_id) : null,user_id:userId,amount_usd:amountUsd,pay_currency:String(npData.pay_currency || payCurrency).toUpperCase(),pay_amount:Number(npData.pay_amount || 0),pay_address:String(npData.pay_address),order_id:orderId,status:'PENDING',nowpayments_status:String(npData.payment_status || 'waiting'),invoice_url:String(npData.invoice_url || npData.payment_url || '')}}), {status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      } catch (err:any) {
        console.error('create-invoice worker error', err);
        return new Response(JSON.stringify({success:false,error:err?.name === 'AbortError' ? 'NOWPayments timeout. Silakan coba lagi.' : (err?.message || String(err) || 'Payment creation failed.')}), {status:500,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      }
    }
    // E. NOWPayments: IPN Webhook
    // IPN hanya mencatat status pembayaran.
    // SALDO USER TIDAK DI-CREDIT OTOMATIS.
    // Credit hanya dilakukan melalui endpoint admin approval.
    if (url.pathname === '/api/payments/ipn' && request.method === 'POST') {
      try {
        const rawBody = await request.text();

        const signature = request.headers.get('x-nowpayments-sig');

        if (!signature || !env.NOWPAYMENTS_IPN_SECRET) {
          return new Response(JSON.stringify({
            error: 'Missing IPN signature'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const encoder = new TextEncoder();

        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(env.NOWPAYMENTS_IPN_SECRET),
          {
            name: 'HMAC',
            hash: 'SHA-512'
          },
          false,
          ['sign']
        );

        const signed = await crypto.subtle.sign(
          'HMAC',
          key,
          encoder.encode(rawBody)
        );

        const expectedSignature = Array.from(
          new Uint8Array(signed)
        )
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
          return new Response(JSON.stringify({
            error: 'Invalid IPN signature'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const data: any = JSON.parse(rawBody);

        const orderId = data.order_id;

        if (!orderId) {
          return new Response(JSON.stringify({
            error: 'Missing order_id'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const paymentStatus = String(
          data.payment_status || ''
        ).toLowerCase();

        const pendingStatuses = [
          'waiting',
          'confirming',
          'confirmed',
          'sending'
        ];

        const terminalStatuses = [
          'finished',
          'failed',
          'refunded',
          'expired'
        ];

        let internalStatus = 'PENDING';

        if (terminalStatuses.includes(paymentStatus)) {
          if (paymentStatus === 'finished') {
            // Tetap PENDING sampai admin melakukan approval.
            internalStatus = 'PENDING';
          } else if (
            paymentStatus === 'failed' ||
            paymentStatus === 'expired'
          ) {
            internalStatus = 'EXPIRED';
          } else if (paymentStatus === 'refunded') {
            internalStatus = 'CANCELLED';
          }
        } else if (pendingStatuses.includes(paymentStatus)) {
          internalStatus = 'PENDING';
        }

        if (env.DB) {
          await env.DB.prepare(`
            UPDATE payments
            SET
              status = ?,
              nowpayments_status = ?,
              pay_currency = COALESCE(?, pay_currency),
              pay_amount = COALESCE(?, pay_amount),
              pay_address = COALESCE(?, pay_address)
            WHERE order_id = ?
          `).bind(
            internalStatus,
            paymentStatus || null,
            data.pay_currency || null,
            data.pay_amount != null ? Number(data.pay_amount) : null,
            data.pay_address || null,
            orderId
          ).run();
        }

        return new Response(JSON.stringify({
          success: true,
          status: internalStatus,
          nowpayments_status: paymentStatus,
          credited: false,
          message: 'IPN recorded. Admin approval required before balance credit.'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({
          error: err?.message || 'IPN processing failed'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // F. Admin/Owner: Approve Deposit
    // Atomic: hanya payment PENDING + credited=0 yang dapat dikredit.
    if (url.pathname === '/api/payments/approve' && request.method === 'POST') {
      try {
        const adminKey = request.headers.get('x-admin-api-key');

        if (!adminKey || adminKey !== env.ADMIN_API_KEY) {
          return new Response(JSON.stringify({
            error: 'Unauthorized'
          }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        const body: any = await request.json();
        const paymentId = String(body.payment_id || '');
        const approvedBy = String(body.approved_by || 'admin');

        if (!paymentId) {
          return new Response(JSON.stringify({
            error: 'payment_id is required'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        const payment: any = await env.DB.prepare(`
          SELECT
            payment_id,
            user_id,
            amount,
            status,
            credited
          FROM payments
          WHERE payment_id = ?
          LIMIT 1
        `).bind(paymentId).first();

        if (!payment) {
          return new Response(JSON.stringify({
            error: 'Payment not found'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        if (payment.credited === 1 || payment.status === 'APPROVED') {
          return new Response(JSON.stringify({
            success: true,
            already_approved: true,
            payment_id: paymentId,
            user_id: payment.user_id,
            amount: Number(payment.amount)
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        if (payment.status !== 'PENDING') {
          return new Response(JSON.stringify({
            error: 'Payment is not pending',
            current_status: payment.status
          }), {
            status: 409,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        const approvedAt = Date.now();

        // Kedua operasi berada dalam satu D1 batch transaction.
        // Payment hanya berubah jika masih PENDING dan belum credited.
        const results = await env.DB.batch([
          env.DB.prepare(`
            UPDATE payments
            SET
              status = 'APPROVED',
              credited = 1,
              approved_at = ?,
              approved_by = ?
            WHERE payment_id = ?
              AND status = 'PENDING'
              AND credited = 0
          `).bind(
            approvedAt,
            approvedBy,
            paymentId
          ),

          env.DB.prepare(`
            UPDATE users
            SET available_balance = available_balance + ?
            WHERE id = ?
              AND EXISTS (
                SELECT 1
                FROM payments
                WHERE payment_id = ?
                  AND status = 'APPROVED'
                  AND credited = 1
                  AND approved_at = ?
              )
          `).bind(
            Number(payment.amount),
            payment.user_id,
            paymentId,
            approvedAt
          )
        ]);

        const paymentUpdate: any = results[0];
        const userUpdate: any = results[1];

        if (
          !paymentUpdate ||
          paymentUpdate.meta?.changes !== 1 ||
          !userUpdate ||
          userUpdate.meta?.changes !== 1
        ) {
          return new Response(JSON.stringify({
            error: 'Payment approval was not applied',
            payment_id: paymentId
          }), {
            status: 409,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        const updatedUser: any = await env.DB.prepare(`
          SELECT id, available_balance, total_locked
          FROM users
          WHERE id = ?
          LIMIT 1
        `).bind(payment.user_id).first();

        return new Response(JSON.stringify({
          success: true,
          payment_id: paymentId,
          user_id: payment.user_id,
          amount_credited: Number(payment.amount),
          status: 'APPROVED',
          credited: 1,
          user_balance: updatedUser?.available_balance ?? null
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({
          error: err?.message || 'Approval failed'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    // G. Admin/Owner: Reject Deposit
    if (url.pathname === '/api/payments/reject' && request.method === 'POST') {
      try {
        const adminKey = request.headers.get('x-admin-api-key');

        if (!adminKey || adminKey !== env.ADMIN_API_KEY) {
          return new Response(JSON.stringify({
            error: 'Unauthorized'
          }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        const body: any = await request.json();
        const paymentId = String(body.payment_id || '');
        const rejectedBy = String(body.rejected_by || 'admin');
        const reason = String(
          body.reason || 'Deposit rejected by administrator'
        );

        if (!paymentId) {
          return new Response(JSON.stringify({
            error: 'payment_id is required'
          }), {
            status: 400
          });
        }

        const result: any = await env.DB.prepare(`
          UPDATE payments
          SET
            status = 'REJECTED',
            rejected_at = ?,
            rejected_by = ?,
            rejection_reason = ?
          WHERE payment_id = ?
            AND status = 'PENDING'
            AND credited = 0
        `).bind(
          Date.now(),
          rejectedBy,
          reason,
          paymentId
        ).run();

        if (result.meta?.changes !== 1) {
          return new Response(JSON.stringify({
            error: 'Payment cannot be rejected',
            payment_id: paymentId
          }), {
            status: 409,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          payment_id: paymentId,
          status: 'REJECTED',
          credited: 0
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({
          error: err?.message || 'Reject failed'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    // F. Leaderboard
    if (url.pathname === '/api/leaderboard') {
      return new Response(JSON.stringify([
        { user_id: 'u1', username: 'CyberWhale_88', points: 14850 },
        { user_id: 'u2', username: 'ValkyrieStrike', points: 11200 },
        { user_id: 'u3', username: 'NeonMatrix', points: 9400 },
      ]), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    return new Response(JSON.stringify({ message: 'SYS STREAMER API v1.0.0' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};







