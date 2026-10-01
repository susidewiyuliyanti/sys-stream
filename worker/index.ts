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
      'x-api-key': env.NOWPAYMENTS_API_KEY || 'DEMO_KEY',
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

// -------------------------------------------------------------
// 3. WORKER FETCH HANDLER & ROUTER
// -------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

    // B. Locks & Staking Endpoints (D1)
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
        const body: any = await request.json();
        const { lockId, userId } = body;

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

        const userId = String(body.userId || '').trim();
        const amountUsd = Number(body.amountUsd ?? body.amount);
        const currency = String(body.currency ?? body.payCurrency ?? 'usdttrc20').trim().toLowerCase();

        if (!userId) {
          return new Response(JSON.stringify({ error: 'userId is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
          return new Response(JSON.stringify({ error: 'amountUsd must be greater than 0' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (!currency) {
          return new Response(JSON.stringify({ error: 'currency is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        if (!env.DB) {
          throw new Error('D1 database binding is unavailable');
        }

        const user: any = await env.DB
          .prepare('SELECT id, username, available_balance, total_locked FROM users WHERE id = ?')
          .bind(userId)
          .first();

        if (!user) {
          return new Response(JSON.stringify({
            error: 'User not found',
            userId
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const orderId = `DEP_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

        const npResponse = await fetch('https://api.nowpayments.io/v1/payment', {
          method: 'POST',
          headers: {
            'x-api-key': env.NOWPAYMENTS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            price_amount: amountUsd,
            price_currency: 'usd',
            pay_currency: currency,
            ipn_callback_url: `${env.BASE_URL}/api/payments/ipn`,
            order_id: orderId,
            order_description: `SYS Streamer deposit for ${userId}`
          })
        });

        const npText = await npResponse.text();

        let npData: any;
        try {
          npData = JSON.parse(npText);
        } catch {
          npData = { raw: npText };
        }

        if (!npResponse.ok) {
          return new Response(JSON.stringify({
            error: 'NOWPayments create payment failed',
            nowpayments_status: npResponse.status,
            details: npData
          }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const paymentId = String(npData.payment_id || '');
        const invoiceId = npData.invoice_id != null
          ? String(npData.invoice_id)
          : null;

        if (!paymentId) {
          throw new Error('NOWPayments response did not contain payment_id');
        }

        await env.DB.prepare(
          `INSERT INTO payments (
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
            order_id
          ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`
        ).bind(
          paymentId,
          invoiceId,
          userId,
          amountUsd,
          'PENDING',
          Math.floor(Date.now() / 1000),
          npData.payment_status || 'waiting',
          npData.pay_currency || currency,
          npData.pay_amount ?? null,
          npData.pay_address ?? null,
          orderId
        ).run();

        return new Response(JSON.stringify({
          success: true,
          invoice: {
            payment_id: paymentId,
            invoice_id: invoiceId,
            user_id: userId,
            amount_usd: amountUsd,
            pay_currency: npData.pay_currency || currency,
            pay_amount: npData.pay_amount ?? null,
            pay_address: npData.pay_address ?? null,
            order_id: orderId,
            status: 'PENDING',
            nowpayments_status: npData.payment_status || 'waiting'
          }
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({
          error: err?.message || String(err)
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
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







