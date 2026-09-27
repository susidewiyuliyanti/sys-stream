import QRCode from 'qrcode';
import { recordSuccessfulNowPaymentDeposit } from './firebase.ts';

export interface NowPaymentCurrency {
  id: string;
  symbol: string;
  network: string;
  name: string;
  approxRateIdr: number;
  decimals: number;
  badge: string;
  minDepositIdr: number;
  sampleAddressPrefix: string;
}

export const NOWPAYMENTS_CURRENCIES: NowPaymentCurrency[] = [
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
    badge: 'Gas Fee Nyaris Rp 0 • Min. Rp 10.000',
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
    badge: 'Standar ERC-20',
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
    badge: 'Cepat & Andal',
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
    badge: 'Binance Coin',
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
    badge: 'Komunitas Global',
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
    badge: 'Super Cepat',
    minDepositIdr: 15000,
    sampleAddressPrefix: 'Sol'
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
    badge: 'Major Coin',
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

export function getCurrencyMinDeposit(currencyId: string): number {
  const c = NOWPAYMENTS_CURRENCIES.find((coin) => coin.id === currencyId.toLowerCase());
  return c?.minDepositIdr || 10000;
}

export async function fetchCurrencyMinAmount(currencyId: string): Promise<{ minCrypto: number; minIdr: number } | null> {
  try {
    const res = await fetch(`/api/nowpayments/min-amount?currency=${encodeURIComponent(currencyId)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        minCrypto: data.minCrypto,
        minIdr: data.minIdr,
      };
    }
  } catch {
    // fallback
  }
  return null;
}

export interface CreatedPaymentData {
  payment_id: string;
  order_id: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  pay_address: string;
  payment_status: string;
  network?: string;
  created_at: string;
  qrCodeUrl?: string;
  isSandbox?: boolean;
}

export interface PaymentStatusData {
  payment_id: string;
  order_id: string;
  payment_status: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'finished' | 'failed' | 'refunded' | 'expired';
  is_completed: boolean;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  pay_address: string;
  updated_at: string;
  is_sandbox?: boolean;
}

/**
 * Generate QR code image data URL
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 256,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.warn('QR Code generation error:', err);
    return '';
  }
}

/**
 * Call backend to create a NOWPayments payment
 */
export async function createNowPaymentOrder(params: {
  nominalIdr: number;
  payCurrency: string;
  userId: string;
  userEmail: string;
  userName: string;
}): Promise<CreatedPaymentData> {
  const res = await fetch('/api/nowpayments/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: params.nominalIdr,
      pay_currency: params.payCurrency,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.payment) {
    throw new Error(data.error || 'Gagal membuat tagihan NOWPayments.');
  }

  const payment = data.payment as CreatedPaymentData;
  payment.isSandbox = data.isSandbox;

  // Generate QR Code for pay address
  if (payment.pay_address) {
    payment.qrCodeUrl = await generateQrCodeDataUrl(payment.pay_address);
  }

  return payment;
}

/**
 * Check payment status from backend
 */
export async function checkNowPaymentStatus(paymentId: string): Promise<PaymentStatusData> {
  const res = await fetch(`/api/nowpayments/status/${paymentId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengecek status pembayaran.');
  }
  return await res.json();
}

/**
 * Simulate blockchain confirmation for instant testing in sandbox/demo
 */
export async function simulatePaymentConfirmation(paymentId: string): Promise<any> {
  const res = await fetch('/api/nowpayments/simulate-confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memproses konfirmasi simulasi.');
  }
  return await res.json();
}

/**
 * Complete the deposit on the client & sync to Firestore
 */
export async function finalizeCompletedNowPayment(params: {
  userId: string;
  userEmail: string;
  userName: string;
  nominalIdr: number;
  payment: CreatedPaymentData | PaymentStatusData;
}): Promise<{ success: boolean; newBalance: number; orderId: string }> {
  return await recordSuccessfulNowPaymentDeposit({
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    nominalIdr: params.nominalIdr,
    paymentId: params.payment.payment_id,
    payAddress: params.payment.pay_address,
    payAmount: params.payment.pay_amount,
    payCurrency: params.payment.pay_currency,
    txHash: (params.payment as any).txHash || `np_${params.payment.payment_id}`,
    network: (params.payment as any).network,
  });
}
