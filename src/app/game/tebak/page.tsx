import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { useLanguage } from '../../../i18n';
import { sound } from '../../../lib/sound';
import {
  ShieldCheck,
  Play,
  RotateCcw,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  Coins,
  Trophy,
  CheckCircle,
  HelpCircle,
  Hash,
  Cpu,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TebakGamePage() {
  const { user, addGameHistory, cryptoCard, updateCryptoCard, showToast, requireAuth } = useGame();
  const { t } = useLanguage();

  const [playerGuesses, setPlayerGuesses] = useState<string[]>(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lastOutcome, setLastOutcome] = useState<{
    won: boolean;
    revealedDigits: [number, number, number, number];
    matchedCount: number;
    payout: number;
  } | null>(null);

  // Streamer Admin Panel Toggle
  const [isStreamerPanelOpen, setIsStreamerPanelOpen] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState(cryptoCard.cardTitle);
  const [editSerial, setEditSerial] = useState(cryptoCard.serialNumber);
  const [editDigits, setEditDigits] = useState<[number, number, number, number]>(cryptoCard.digits);
  const [editConcealed, setEditConcealed] = useState<[boolean, boolean, boolean, boolean]>(cryptoCard.concealed);
  const [editNote, setEditNote] = useState(cryptoCard.streamerNote);

  const concealedCount = cryptoCard.concealed.filter(Boolean).length;
  const winMultiplier = concealedCount === 1 ? 5.0 : concealedCount === 2 ? 15.0 : concealedCount === 3 ? 35.0 : 80.0;

  const handleDigitGuessChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const num = val.replace(/[^0-9]/g, '');
    const newGuesses = [...playerGuesses];
    newGuesses[index] = num;
    setPlayerGuesses(newGuesses);
    if (num) sound.playClick(500);
  };

  const handleVerifyGuess = () => {
    requireAuth(() => {
      if (isVerifying) return;

      // Check if player filled all concealed slots
      for (let i = 0; i < 4; i++) {
        if (cryptoCard.concealed[i] && (!playerGuesses[i] || playerGuesses[i].trim() === '')) {
          showToast('Incomplete Prediction', `Please enter a digit for Slot #${i + 1}`, 'error');
          return;
        }
      }

      setIsVerifying(true);
      setLastOutcome(null);
      sound.playDiceRoll();

      setTimeout(() => {
        // Check match for all concealed positions
        let allMatched = true;
        let matchedCount = 0;

        for (let i = 0; i < 4; i++) {
          if (cryptoCard.concealed[i]) {
            if (parseInt(playerGuesses[i]) === cryptoCard.digits[i]) {
              matchedCount++;
            } else {
              allMatched = false;
            }
          }
        }

        const payout = 0;

        if (allMatched) {
          sound.playJackpot();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
          showToast('Card Cracked!', `All ${concealedCount} concealed digits matched! Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.`, 'jackpot');
        } else {
          sound.playClick();
          showToast('Guess Missed', `Matched ${matchedCount}/${concealedCount} digits. Try another prediction!`, 'info');
        }

        setLastOutcome({
          won: allMatched,
          revealedDigits: cryptoCard.digits,
          matchedCount,
          payout,
        });

        addGameHistory({
          gameType: 'tebak',
          gameName: 'Crypto Card Number Guess',
          betAmount: 0,
          payoutAmount: 0,
          multiplier: 0,
          isWin: allMatched,
          details: `${cryptoCard.serialNumber} (${matchedCount}/${concealedCount} digits matched)`,
        });

        setIsVerifying(false);
      }, 1400);
    });
  };

  const handleSaveStreamerConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateCryptoCard({
      cardTitle: editTitle,
      serialNumber: editSerial,
      digits: editDigits,
      concealed: editConcealed,
      streamerNote: editNote,
    });
    setIsStreamerPanelOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>{t('Digital Crypto Card Number Guess')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Max 4 {t('Concealed')} Digits
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predict the concealed cryptographic serial digits set by the streamer to unlock high multiplier payouts.
          </p>
        </div>

        {/* Streamer Admin Settings Button */}
        <button
          onClick={() => {
            sound.playClick();
            setEditTitle(cryptoCard.cardTitle);
            setEditSerial(cryptoCard.serialNumber);
            setEditDigits([...cryptoCard.digits]);
            setEdit{t('Concealed')}([...cryptoCard.concealed]);
            setEditNote(cryptoCard.streamerNote);
            setIsStreamerPanelOpen(true);
          }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>{t('Streamer Card Settings')}</span>
        </button>
      </div>

      {/* STREAMER CONFIG MODAL */}
      {isStreamerPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">{t('Streamer Card Configurator')}</h3>
              </div>
              <button
                onClick={() => setIsStreamerPanelOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveStreamerConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">{t('Card Title')}</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">{t('Serial Number')}</label>
                <input
                  type="text"
                  value={editSerial}
                  onChange={(e) => setEditSerial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-mono font-bold"
                  required
                />
              </div>

              {/* Configure 4 Digits & Concealment */}
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">
                  Card Digits (Exactly 4 Digits) & Conceal Toggle
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-center">
                      <span className="text-[10px] text-slate-500 font-mono">Slot #{idx + 1}</span>
                      <input
                        type="number"
                        min="0"
                        max="9"
                        value={editDigits[idx]}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(9, parseInt(e.target.value) || 0));
                          const newD = [...editDigits] as [number, number, number, number];
                          newD[idx] = val;
                          setEditDigits(newD);
                        }}
                        className="w-full py-1 text-center font-mono font-black text-xl bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newC = [...editConcealed] as [boolean, boolean, boolean, boolean];
                          newC[idx] = !newC[idx];
                          setEdit{t('Concealed')}(newC);
                        }}
                        className={`w-full py-1 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${
                          editConcealed[idx]
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {editConcealed[idx] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{editConcealed[idx] ? 'Hidden' : 'Visible'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">{t('Streamer Clue / Note for Viewers')}</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStreamerPanelOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl"
                >
                  Save & Publish Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Holographic Digital Crypto Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-cyan-950/40 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Holographic Header Bar */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wider">{cryptoCard.cardTitle}</h3>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase">{cryptoCard.network}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                  {cryptoCard.rarity} NFT CARD
                </span>
              </div>
            </div>

            {/* {t('Serial Number')} Display */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                <Hash className="w-3.5 h-3.5 text-cyan-400" /> Serial No:
              </span>
              <span className="font-mono font-black text-amber-400 tracking-wider text-sm select-all">
                {cryptoCard.serialNumber}
              </span>
            </div>

            {/* 4 DIGITAL DIGIT SLOTS (MAX 4 NUMBERS) */}
            <div className="py-4">
              <div className="text-center text-xs font-semibold text-slate-400 mb-3">
                Digital Crypto Verification Code (4 Digits)
              </div>

              <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                {[0, 1, 2, 3].map((idx) => {
                  const is{t('Concealed')} = cryptoCard.concealed[idx];
                  const digitValue = cryptoCard.digits[idx];
                  const playerInput = playerGuesses[idx];

                  return (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all shadow-inner ${
                        is{t('Concealed')}
                          ? 'bg-slate-950/90 border-amber-500/70 shadow-amber-500/10'
                          : 'bg-cyan-950/20 border-cyan-500/40'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase text-slate-500 absolute top-1.5">
                        Digit #{idx + 1}
                      </span>

                      {is{t('Concealed')} ? (
                        <div className="flex flex-col items-center justify-center mt-2 w-full px-2">
                          <input
                            type="text"
                            maxLength={1}
                            placeholder="?"
                            value={playerInput}
                            onChange={(e) => handleDigitGuessChange(idx, e.target.value)}
                            className="w-full text-center font-mono font-black text-3xl sm:text-4xl text-amber-400 bg-transparent focus:outline-none placeholder-slate-600"
                          />
                          <span className="text-[9px] font-bold text-amber-500/80 uppercase">{t('Concealed')}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center mt-2">
                          <span className="font-mono font-black text-3xl sm:text-4xl text-white">
                            {digitValue}
                          </span>
                          <span className="text-[9px] font-bold text-cyan-400 uppercase">{t('Revealed')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streamer Clue Banner */}
            {cryptoCard.streamerNote && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">{t('Streamer Clue: ')}</span>
                  <span>{cryptoCard.streamerNote}</span>
                </div>
              </div>
            )}

            {/* Last Outcome Alert */}
            {lastOutcome && (
              <div
                className={`p-3 rounded-xl text-xs font-bold text-center border animate-in zoom-in-95 ${
                  lastOutcome.won
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500 text-rose-300'
                }`}
              >
                {lastOutcome.won
                  ? `WINNER! Verified Code: [${lastOutcome.revealedDigits.join(' ')}]. Paid +${lastOutcome.payout.toLocaleString()} Coins!`
                  : `Prediction Missed. Secret Digits: [${lastOutcome.revealedDigits.join(' ')}]. Matched ${lastOutcome.matchedCount}/${concealedCount}.`}
              </div>
            )}
          </div>
        </div>

        {/* Right: Betting Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interaction Challenge — No Financial Stake
            </h2>

            {/* Non-financial challenge notice */}
            <div className="p-4 bg-slate-950 border border-cyan-500/20 rounded-xl space-y-2 text-xs">
              <div className="font-black text-cyan-300">{t('Mode Interaksi')}</div>
              <p className="text-slate-400 leading-relaxed">
                Challenge ini tidak menggunakan saldo pengguna. Tidak ada deposit, lock, pemotongan saldo, atau payout finansial.
              </p>
            </div>

            {/* Submit Verification Button */}
            <button
              onClick={handleVerifyGuess}
              disabled={isVerifying}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t('Verifying Cryptographic Seed...')}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t('Verify Challenge')}</span>
                </>
              )}
            </button>
          </div>

          {/* Rules & Transparency */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('Provably Fair Verification')}</span>
            </div>
            <p className="leading-relaxed">
              The 4-digit code is tied to serial number <strong>{cryptoCard.serialNumber}</strong>. Streamer sets visible
              and concealed digits in real-time. Guess all concealed digits correctly to claim the jackpot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
