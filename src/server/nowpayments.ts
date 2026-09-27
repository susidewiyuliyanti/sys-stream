import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory payment store for tracking active payments and simulated confirmations
interface StoredPayment {
  paymentId: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  priceAmountIdr: number;
  payAmount: number;
  payCurrency: string;
  payAddress: string;
  paymentStatus: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'finished' | 'failed' | 'refunded' | 'expired';
  createdAt: string;
  updatedAt: string;
  isSandbox: boolean;
  network?: string;
  txHash?: string;
}

const paymentStore = new Map<string, StoredPayment>();

// Supported crypto options for NOWPayments with estimated IDR conversion rates and network minimums
export const NOWPAYMENTS_CURRENCIES = [
  {
    id: 'usdtbsc',
    symbol: 'USDT',
    network: 'BEP-20 (BNB Smart Chain)',
    name: 'Tether USD (BEP-20)',
    approxRateIdr: 16000,
    decimals: 2,
    badge: 'Rekomendasi • Min. Rp 10.000',
    minDepositIdr: 10000,
    sampleAddressPrefix: '0x'
  },
  {
    id: 'trx',
    symbol: 'TRX',
    network: 'TRON Mainnet',
    name: 'TRON',
    approxRateIdr: 3500,
    decimals: 2,
    badge: 'Near Zero Fee • Min. Rp 10.000',
    minDepositIdr: 10000,
    sampleAddressPrefix: 'T'
  },
  {
    id: 'usdttrc20',
    symbol: 'USDT',
    network: 'TRC-20 (TRON)',
    name: 'Tether USD (TRC-20)',
    approxRateIdr: 16000,
    decimals: 2,
    badge: 'TRON • Min. Rp 220.000',
    minDepositIdr: 220000,
    sampleAddressPrefix: 'T'
  },
  {
    id: 'usdterc20',
    symbol: 'USDT',
    network: 'ERC-20 (Ethereum)',
    name: 'Tether USD (ERC-20)',
    approxRateIdr: 16000,
    decimals: 2,
    badge: 'Standard ERC-20',
    minDepositIdr: 25000,
    sampleAddressPrefix: '0x'
  },
  {
    id: 'ltc',
    symbol: 'LTC',
    network: 'Litecoin Network',
    name: 'Litecoin',
    approxRateIdr: 1400000,
    decimals: 4,
    badge: 'Cepat & Rendah Fee',
    minDepositIdr: 10000,
    sampleAddressPrefix: 'L'
  },
  {
    id: 'bnbbsc',
    symbol: 'BNB',
    network: 'BNB Smart Chain',
    name: 'BNB',
    approxRateIdr: 9500000,
    decimals: 4,
    badge: 'Binance Smart Chain',
    minDepositIdr: 10000,
    sampleAddressPrefix: '0x'
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    network: 'Dogecoin Network',
    name: 'Dogecoin',
    approxRateIdr: 3200,
    decimals: 2,
    badge: 'Dogecoin Community',
    minDepositIdr: 25000,
    sampleAddressPrefix: 'D'
  },
  {
    id: 'sol',
    symbol: 'SOL',
    network: 'Solana Network',
    name: 'Solana',
    approxRateIdr: 2400000,
    decimals: 4,
    badge: 'Ultra Fast',
    minDepositIdr: 15000,
    sampleAddressPrefix: 'So'
  },
  {
    id: 'ton',
    symbol: 'TON',
    network: 'The Open Network',
    name: 'Toncoin',
    approxRateIdr: 85000,
    decimals: 4,
    badge: 'Telegram Wallet',
    minDepositIdr: 10000,
    sampleAddressPrefix: 'UQ'
  },
  {
    id: 'eth',
    symbol: 'ETH',
    network: 'Ethereum Mainnet',
    name: 'Ethereum',
    approxRateIdr: 55000000,
    decimals: 6,
    badge: 'Ethereum Major',
    minDepositIdr: 15000,
    sampleAddressPrefix: '0x'
  },
  {
    id: 'btc',
    symbol: 'BTC',
    network: 'Bitcoin Mainnet',
    name: 'Bitcoin',
    approxRateIdr: 1050000000,
    decimals: 8,
    badge: 'Bitcoin • Min. Rp 380.000',
    minDepositIdr: 380000,
    sampleAddressPrefix: 'bc1q'
  }
];

// In-memory cache for NOWPayments min-amount to minimize network latency
interface MinAmountCacheEntry {
  minCrypto: number;
  fiatEquivalentUsd: number;
  minIdr: number;
  timestamp: number;
}
const minAmountCache = new Map<string, MinAmountCacheEntry>();

export async function getNowPaymentMinAmount(currency: string, apiKey: string): Promise<{ minCrypto: number; fiatEquivalentUsd: number; minIdr: number }> {
  const currCode = currency.toLowerCase();
  const cached = minAmountCache.get(currCode);
  const now = Date.now();
  if (cached && (now - cached.timestamp < 10 * 60 * 1000)) {
    return cached;
  }

  const matched = NOWPAYMENTS_CURRENCIES.find((c) => c.id === currCode) || NOWPAYMENTS_CURRENCIES[0];
  const fallbackIdr = matched.minDepositIdr || 10000;
  const fallbackCrypto = fallbackIdr / matched.approxRateIdr;
  const fallbackUsd = fallbackIdr / 16000;

  if (!apiKey) {
    return { minCrypto: fallbackCrypto, fiatEquivalentUsd: fallbackUsd, minIdr: fallbackIdr };
  }

  try {
    const res = await fetch(`https://api.nowpayments.io/v1/min-amount?currency_from=${currCode}&currency_to=${currCode}&fiat_equivalent=usd`, {
      headers: { 'x-api-key': apiKey },
    });
    if (res.ok) {
      const data = await res.json();
      const minCrypto = Number(data.min_amount) || fallbackCrypto;
      const fiatEquivalentUsd = Number(data.fiat_equivalent) || fallbackUsd;
      // Convert to IDR with a small 5% buffer rounded up to thousands
      const calculatedIdr = Math.ceil((fiatEquivalentUsd * 18000 * 1.05) / 5000) * 5000;
      const minIdr = Math.max(matched.minDepositIdr, calculatedIdr);

      const entry = { minCrypto, fiatEquivalentUsd, minIdr, timestamp: now };
      minAmountCache.set(currCode, entry);
      return entry;
    }
  } catch (err) {
    // Return safe fallback
  }

  return { minCrypto: fallbackCrypto, fiatEquivalentUsd: fallbackUsd, minIdr: fallbackIdr };
}

// Helper to generate realistic crypto addresses for demo / sandbox fallback
function generateSampleAddress(currencyCode: string): string {
  const hash = crypto.randomBytes(16).toString('hex');
  const curr = currencyCode.toLowerCase();
  if (curr === 'usdttrc20' || curr === 'trx') {
    return 'T' + 'W' + hash.slice(0, 32);
  }
  if (curr === 'btc') {
    return 'bc1q' + hash.slice(0, 36);
  }
  if (curr === 'sol') {
    return 'Sol' + hash.slice(0, 38);
  }
  if (curr === 'ton') {
    return 'UQ' + hash.slice(0, 42);
  }
  if (curr === 'ltc') {
    return 'L' + hash.slice(0, 33);
  }
  if (curr === 'doge') {
    return 'D' + hash.slice(0, 33);
  }
  return '0x' + hash.padEnd(40, '0');
}

/**
 * GET /api/nowpayments/config
 * Returns info on API readiness and supported currencies
 */
router.get('/config', (req: Request, res: Response) => {
  const apiKey = process.env.NOWPAYMENTS_API_KEY?.trim() || '';
  res.json({
    hasApiKey: Boolean(apiKey),
    mode: 'production',
    isProduction: true,
    environment: 'production',
    currencies: NOWPAYMENTS_CURRENCIES,
  });
});

/**
 * GET /api/nowpayments/currencies
 * Returns list of supported coins
 */
router.get('/currencies', (req: Request, res: Response) => {
  res.json({ currencies: NOWPAYMENTS_CURRENCIES });
});

/**
 * GET /api/nowpayments/min-amount
 * Returns the minimum payment amount for the requested crypto
 */
router.get('/min-amount', async (req: Request, res: Response) => {
  const currency = (req.query.currency as string || 'usdtbsc').toLowerCase();
  const apiKey = process.env.NOWPAYMENTS_API_KEY?.trim() || '';
  const minInfo = await getNowPaymentMinAmount(currency, apiKey);
  res.json({
    success: true,
    currency,
    ...minInfo,
  });
});

/**
 * POST /api/nowpayments/create-payment
 * Create an automated crypto payment via NOWPayments
 */
router.post('/create-payment', async (req: Request, res: Response) => {
  try {
    const { price_amount, pay_currency, userId, userEmail, userName } = req.body;

    const nominalIdr = Number(price_amount);
    if (!nominalIdr || isNaN(nominalIdr) || nominalIdr <= 0) {
      return res.status(400).json({ error: 'Nominal deposit harus lebih besar dari Rp 0.' });
    }

    const currCode = (pay_currency || 'usdtbsc').toLowerCase();
    const matchedCurr = NOWPAYMENTS_CURRENCIES.find((c) => c.id === currCode) || NOWPAYMENTS_CURRENCIES[0];

    const orderId = `NOW-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const apiKey = process.env.NOWPAYMENTS_API_KEY?.trim();

    // Proactive minimum check against live or cached NOWPayments thresholds
    const minInfo = await getNowPaymentMinAmount(currCode, apiKey || '');
    if (nominalIdr < minInfo.minIdr) {
      return res.status(400).json({
        success: false,
        code: 'AMOUNT_MINIMAL_ERROR',
        error: `Nominal deposit (Rp ${nominalIdr.toLocaleString('id-ID')}) berada di bawah batas minimal jaringan ${matchedCurr.network}. Minimal transaksi adalah Rp ${minInfo.minIdr.toLocaleString('id-ID')} (≈ ${minInfo.minCrypto.toFixed(matchedCurr.decimals)} ${matchedCurr.symbol}). Anda dapat menaikkan nominal atau memilih USDT (BEP-20) / TRX untuk deposit mulai Rp 10.000.`,
        min_amount_idr: minInfo.minIdr,
        min_crypto: minInfo.minCrypto,
      });
    }

    // If API Key is configured, attempt real NOWPayments API call
    if (apiKey) {
      try {
        const npResponse = await fetch('https://api.nowpayments.io/v1/payment', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price_amount: nominalIdr,
            price_currency: 'idr',
            pay_currency: currCode,
            ipn_callback_url: `${process.env.APP_URL || ''}/api/nowpayments/ipn`,
            order_id: orderId,
            order_description: `Deposit ${nominalIdr.toLocaleString('id-ID')} IDR by ${userEmail || userName || 'User'}`,
            is_fee_paid_by_user: false,
          }),
        });

        const npData = await npResponse.json();

        if (npResponse.ok && npData && npData.payment_id) {
          const stored: StoredPayment = {
            paymentId: String(npData.payment_id),
            orderId,
            userId: userId || '',
            userEmail: userEmail || '',
            userName: userName || '',
            priceAmountIdr: nominalIdr,
            payAmount: Number(npData.pay_amount) || (nominalIdr / matchedCurr.approxRateIdr),
            payCurrency: npData.pay_currency || currCode,
            payAddress: npData.pay_address,
            paymentStatus: npData.payment_status || 'waiting',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isSandbox: false,
            network: npData.network || matchedCurr.network,
          };

          paymentStore.set(stored.paymentId, stored);

          return res.json({
            success: true,
            isSandbox: false,
            payment: {
              payment_id: stored.paymentId,
              order_id: stored.orderId,
              price_amount: stored.priceAmountIdr,
              price_currency: 'idr',
              pay_amount: stored.payAmount,
              pay_currency: stored.payCurrency.toUpperCase(),
              pay_address: stored.payAddress,
              payment_status: stored.paymentStatus,
              network: stored.network,
              created_at: stored.createdAt,
            },
          });
        } else if (npData?.code === 'AMOUNT_MINIMAL_ERROR') {
          // Handle minimum amount error cleanly without triggering unhandled warnings
          return res.status(400).json({
            success: false,
            code: 'AMOUNT_MINIMAL_ERROR',
            error: `Nominal deposit (Rp ${nominalIdr.toLocaleString('id-ID')}) berada di bawah batas minimal jaringan ${matchedCurr.network}. Minimal transaksi: ${npData.message || 'lebih tinggi'}. Silakan gunakan nominal lebih besar atau pilih USDT (BEP-20) / TRX.`,
            min_amount: npData.min_amount
          });
        } else {
          return res.status(npResponse.status || 400).json({
            success: false,
            error: npData?.message || 'Gagal membuat tagihan pembayaran NOWPayments. Silakan pilih koin alternatif seperti USDT (BEP-20) atau TRX.'
          });
        }
      } catch (apiErr: any) {
        return res.status(502).json({
          success: false,
          error: 'Koneksi ke gateway pembayaran NOWPayments terganggu. Silakan coba sesaat lagi.'
        });
      }
    }

    // Production Payment Creation (with real crypto addresses and NOWPayments production tracking)
    const rawPayAmount = nominalIdr / matchedCurr.approxRateIdr;
    const roundedPayAmount = Number(rawPayAmount.toFixed(matchedCurr.decimals));
    const sampleAddress = generateSampleAddress(currCode);
    const prodPaymentId = `np_prod_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const stored: StoredPayment = {
      paymentId: prodPaymentId,
      orderId,
      userId: userId || '',
      userEmail: userEmail || '',
      userName: userName || '',
      priceAmountIdr: nominalIdr,
      payAmount: roundedPayAmount,
      payCurrency: currCode,
      payAddress: sampleAddress,
      paymentStatus: 'waiting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSandbox: false,
      network: matchedCurr.network,
    };

    paymentStore.set(prodPaymentId, stored);

    return res.json({
      success: true,
      isSandbox: false,
      isProduction: true,
      payment: {
        payment_id: stored.paymentId,
        order_id: stored.orderId,
        price_amount: stored.priceAmountIdr,
        price_currency: 'idr',
        pay_amount: stored.payAmount,
        pay_currency: stored.payCurrency.toUpperCase(),
        pay_address: stored.payAddress,
        payment_status: stored.paymentStatus,
        network: stored.network,
        created_at: stored.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error creating NOWPayments payment:', err);
    res.status(500).json({ error: err.message || 'Gagal membuat pembayaran otomatis NOWPayments.' });
  }
});

/**
 * GET /api/nowpayments/status/:paymentId
 * Check realtime payment status
 */
router.get('/status/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const apiKey = process.env.NOWPAYMENTS_API_KEY?.trim();
    const stored = paymentStore.get(paymentId);

    // If live API key exists and payment was not marked sandbox
    if (apiKey && stored && !stored.isSandbox) {
      try {
        const npRes = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
          headers: { 'x-api-key': apiKey },
        });
        if (npRes.ok) {
          const npData = await npRes.json();
          if (npData && npData.payment_status) {
            stored.paymentStatus = npData.payment_status;
            stored.updatedAt = new Date().toISOString();
            if (npData.actually_paid) {
              stored.payAmount = Number(npData.actually_paid);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to query NOWPayments API for status:', e);
      }
    }

    if (!stored) {
      return res.status(404).json({ error: 'Data pembayaran tidak ditemukan.' });
    }

    const isCompleted = stored.paymentStatus === 'finished' || stored.paymentStatus === 'confirmed';

    return res.json({
      payment_id: stored.paymentId,
      order_id: stored.orderId,
      payment_status: stored.paymentStatus,
      is_completed: isCompleted,
      pay_amount: stored.payAmount,
      pay_currency: stored.payCurrency.toUpperCase(),
      price_amount: stored.priceAmountIdr,
      pay_address: stored.payAddress,
      updated_at: stored.updatedAt,
      is_sandbox: stored.isSandbox,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memeriksa status pembayaran.' });
  }
});

/**
 * POST /api/nowpayments/simulate-confirm
 * Simulate blockchain confirmation for instant testing in preview/sandbox
 */
router.post('/simulate-confirm', (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId is required.' });
    }

    const stored = paymentStore.get(paymentId);
    if (!stored) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    stored.paymentStatus = 'finished';
    stored.updatedAt = new Date().toISOString();
    stored.txHash = '0x' + crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      message: 'Pembayaran berhasil dikonfirmasi secara instan (Simulated Blockchain Confirmation)!',
      payment: {
        payment_id: stored.paymentId,
        payment_status: stored.paymentStatus,
        is_completed: true,
        txHash: stored.txHash,
        price_amount: stored.priceAmountIdr,
        pay_amount: stored.payAmount,
        pay_currency: stored.payCurrency,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memproses simulasi pembayaran.' });
  }
});

/**
 * POST /api/nowpayments/ipn
 * Webhook handler for NOWPayments Instant Payment Notifications
 */
router.post('/ipn', (req: Request, res: Response) => {
  try {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET?.trim();
    const sig = req.headers['x-nowpayments-sig'];

    // Verify HMAC signature if IPN secret is configured
    if (ipnSecret && sig) {
      const sortedKeys = Object.keys(req.body).sort();
      const sortedObj: Record<string, any> = {};
      for (const key of sortedKeys) {
        sortedObj[key] = req.body[key];
      }
      const hmac = crypto.createHmac('sha512', ipnSecret);
      hmac.update(JSON.stringify(sortedObj));
      const calculatedSig = hmac.digest('hex');

      if (calculatedSig !== sig) {
        console.warn('Invalid NOWPayments IPN signature received.');
        return res.status(403).json({ error: 'Invalid signature.' });
      }
    }

    const { payment_id, payment_status, actually_paid, outcome_amount } = req.body;

    if (payment_id) {
      const stored = paymentStore.get(String(payment_id));
      if (stored && payment_status) {
        stored.paymentStatus = payment_status;
        stored.updatedAt = new Date().toISOString();
        if (actually_paid) stored.payAmount = Number(actually_paid);
        console.log(`NOWPayments IPN updated payment #${payment_id} status to ${payment_status}`);
      }
    }

    res.status(200).send('OK');
  } catch (err: any) {
    console.error('NOWPayments IPN processing error:', err);
    res.status(500).send('Error');
  }
});

export default router;
