import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { CryptoInvoice } from '../types';
import { X, Copy, CheckCircle, ExternalLink, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';
import { sound } from '../lib/sound';
import { useLanguage } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CryptoDepositModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createCryptoInvoice, showToast } = useGame();
  const { t } = useLanguage();
  const [selectedUsd, setSelectedUsd] = useState<number>(50);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDT');
  const [customUsd, setCustomUsd] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<CryptoInvoice | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [minAmountUsd, setMinAmountUsd] = useState<number>(5);
  const [estimatedCrypto, setEstimatedCrypto] = useState<number | null>(null);
  const [isCheckingRules, setIsCheckingRules] = useState<boolean>(false);

  if (!isOpen) return null;

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const amount = customUsd ? Number(customUsd) : selectedUsd;
    const currency = selectedCurrency === 'USDT' ? 'usdttrc20' : selectedCurrency.toLowerCase();
    setIsCheckingRules(true);
    fetch(`/api/payments/create-invoice?currency=${encodeURIComponent(currency)}&amount=${encodeURIComponent(String(Number.isFinite(amount) ? amount : 0))}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('sys_stream_auth_token') || ''}` },
    })
      .then(async r => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok || !data?.success) { setEstimatedCrypto(null); setMinAmountUsd(5); return; }
        setMinAmountUsd(Math.max(5, Number(data.min_amount_usd || 0)));
        setEstimatedCrypto(data.estimate == null ? null : Number(data.estimate));
      })
      .catch(() => { if (!cancelled) { setEstimatedCrypto(null); setMinAmountUsd(5); } })
      .finally(() => { if (!cancelled) setIsCheckingRules(false); });
    return () => { cancelled = true; };
  }, [isOpen, selectedCurrency, selectedUsd, customUsd]);

  const currencies = [
    { code: 'USDT', name: 'Tether (TRC20)', icon: '₮' },
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'SOL', name: 'Solana', icon: '◎' },
    { code: 'TRX', name: 'TRON', icon: 'T' },
  ];

  const presetAmounts = [10, 25, 50, 100, 250];

  const handleGenerateInvoice = async () => {
    sound.playClick();
    const finalAmount = customUsd ? parseFloat(customUsd) : selectedUsd;
    if (isNaN(finalAmount) || finalAmount < minAmountUsd) {
      showToast(t('Minimum Deposit'), `${t('Minimum deposit is')} ${minAmountUsd.toFixed(2)} USD`, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const inv = await createCryptoInvoice(finalAmount, selectedCurrency);
      setInvoice(inv);
    } catch (err: any) {
      showToast(t('Error'), err.message || t('Failed to generate invoice'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              NP
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{t('NOWPayments Crypto Deposit')}</h3>
              <p className="text-xs text-slate-400">{t('Instant deposit with zero platform fees')}</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!invoice ? (
          <div className="mt-5 space-y-5">
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {t('Deposit Amount (USD)')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedUsd(amt); setCustomUsd(''); sound.playClick(); }}
                    className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                      selectedUsd === amt && !customUsd
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="mt-2.5">
                <input
                  type="number"
                  placeholder={t('Or enter custom USD amount')}
                  value={customUsd}
                  onChange={(e) => setCustomUsd(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="mt-1.5 text-xs text-slate-500 space-y-1">
                <div>{t('Minimum deposit')}: <span className="text-slate-300">${minAmountUsd.toFixed(2)} USD</span></div>
                <div>{isCheckingRules ? t('Checking current NOWPayments limits...') : estimatedCrypto != null ? t('Current estimate available') : t('Rate is checked again when the payment is created.')}</div>
                <div>{t('Deposit is credited to your real account balance after payment confirmation.')}</div>
              </div>
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {t('Select Cryptocurrency')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {currencies.map(curr => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => { setSelectedCurrency(curr.code); sound.playClick(); }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                      selectedCurrency === curr.code
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center font-bold text-amber-400">
                      {curr.icon}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{curr.code}</div>
                      <div className="text-xs text-slate-400">{curr.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateInvoice}
              disabled={isLoading || isCheckingRules}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading || isCheckingRules ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isCheckingRules ? t('Checking payment rules...') : t('Create NOWPayments Invoice')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Invoice View */
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t('Order ID: ')}<span className="text-white font-mono">{invoice.orderId}</span></span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> {t('Awaiting Deposit')}
                </span>
              </div>

              <div className="text-center py-2">
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {invoice.payAmount} {invoice.payCurrency}
                </div>
                <div className="text-xs text-slate-400">
                  ≈ ${invoice.priceAmountUsd}.00 USD (Credits {invoice.coinsToCredit} Coins)
                </div>
              </div>

              {invoice.qrCodeUrl && (
                <div className="flex justify-center py-2">
                  <img src={invoice.qrCodeUrl} alt={t('Deposit QR Code')} className="w-40 h-40 rounded-lg bg-white p-2" />
                </div>
              )}

              {/* Deposit Address Box */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t('Send exactly to deposit address:')}
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="font-mono text-xs text-slate-200 truncate flex-1 select-all">
                    {invoice.payAddress}
                  </span>
                  <button
                    onClick={() => copyToClipboard(invoice.payAddress)}
                    className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {invoice.invoiceUrl && (
              <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {t('Open NOWPayments Payment Page')}
              </a>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setInvoice(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t('Change Currency / Amount')}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t('Done')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
