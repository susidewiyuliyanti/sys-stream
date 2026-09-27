export interface CryptoWithdrawOption {
  id: string;
  coin: string;
  name: string;
  network: string;
  symbol: string;
  iconBg: string;
  badgeColor: string;
  approxRateIdr: number; // 1 Coin = X IDR
  decimals: number;
  category: 'stablecoin' | 'major' | 'altcoin';
  placeholderAddress: string;
  addressRegexHint: string;
  requiresMemo?: boolean;
  memoLabel?: string;
  tagline: string;
  networkGasFeeIdr?: number; // Blockchain network gas fee in IDR
}

export const CRYPTO_WITHDRAW_OPTIONS: CryptoWithdrawOption[] = [
  {
    id: 'USDT-TRC20',
    coin: 'USDT',
    name: 'Tether USD',
    network: 'TRC-20 (TRON)',
    symbol: 'USDT',
    iconBg: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    approxRateIdr: 16000,
    decimals: 2,
    category: 'stablecoin',
    placeholderAddress: 'TWMXfK8b5UKej3jGkSStYgW8cT8x9x3q7Z',
    addressRegexHint: 'Dimulai huruf "T", 34 karakter',
    tagline: 'Fee transfer terendah & paling cepat masuk (Rekomendasi)'
  },
  {
    id: 'USDT-BEP20',
    coin: 'USDT',
    name: 'Tether USD',
    network: 'BEP-20 (BNB Smart Chain)',
    symbol: 'USDT',
    iconBg: 'from-yellow-500 to-amber-600',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    approxRateIdr: 16000,
    decimals: 2,
    category: 'stablecoin',
    placeholderAddress: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    addressRegexHint: 'Format 0x... (42 karakter BSC)',
    tagline: 'Gas fee terjangkau di Binance Smart Chain'
  },
  {
    id: 'USDT-POLYGON',
    coin: 'USDT',
    name: 'Tether USD',
    network: 'Polygon (PoS)',
    symbol: 'USDT',
    iconBg: 'from-purple-500 to-indigo-600',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    approxRateIdr: 16000,
    decimals: 2,
    category: 'stablecoin',
    placeholderAddress: '0x71C... (Polygon Network)',
    addressRegexHint: 'Format 0x... (42 karakter)',
    tagline: 'Jaringan Polygon PoS cepat & stabil'
  },
  {
    id: 'USDT-TON',
    coin: 'USDT',
    name: 'Tether USD',
    network: 'TON (The Open Network)',
    symbol: 'USDT',
    iconBg: 'from-sky-500 to-blue-600',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    approxRateIdr: 16000,
    decimals: 2,
    category: 'stablecoin',
    placeholderAddress: 'EQBvW8Z5huBkMJYdn3PBRnKKQb463mfe0PcwFuOW4NVI9Rbp',
    addressRegexHint: 'Alamat TON (EQ... / UQ...)',
    requiresMemo: true,
    memoLabel: 'Memo / Comment (Wajib jika wallet exchange/Telegram)',
    tagline: 'Langsung masuk ke Telegram Wallet / TON Space'
  },
  {
    id: 'USDT-ERC20',
    coin: 'USDT',
    name: 'Tether USD',
    network: 'ERC-20 (Ethereum)',
    symbol: 'USDT',
    iconBg: 'from-slate-600 to-blue-700',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    approxRateIdr: 16000,
    decimals: 2,
    category: 'stablecoin',
    placeholderAddress: '0x71C... (Ethereum Mainnet)',
    addressRegexHint: 'Format 0x... (42 karakter)',
    tagline: 'Jaringan standar industri Ethereum ERC-20'
  },
  {
    id: 'USDC-SOL',
    coin: 'USDC',
    name: 'USD Coin',
    network: 'Solana (SPL)',
    symbol: 'USDC',
    iconBg: 'from-blue-500 to-cyan-600',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    approxRateIdr: 16000,
    decimals: 2,
    category: 'stablecoin',
    placeholderAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    addressRegexHint: 'Alamat Solana Base58',
    tagline: 'Stablecoin teratur resmi di ekosistem Solana'
  },
  {
    id: 'BTC-MAINNET',
    coin: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Mainnet',
    symbol: 'BTC',
    iconBg: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    approxRateIdr: 1050000000,
    decimals: 8,
    category: 'major',
    placeholderAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    addressRegexHint: 'SegWit (bc1...), Legacy (1...), atau Nested (3...)',
    tagline: 'Crypto #1 dunia (Est. 1 BTC ≈ Rp 1.050.000.000)'
  },
  {
    id: 'ETH-MAINNET',
    coin: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum (ERC-20)',
    symbol: 'ETH',
    iconBg: 'from-slate-700 to-indigo-800',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    approxRateIdr: 55000000,
    decimals: 6,
    category: 'major',
    placeholderAddress: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    addressRegexHint: 'Format 0x... (42 karakter)',
    tagline: 'Smart Contract Network (Est. 1 ETH ≈ Rp 55.000.000)'
  },
  {
    id: 'SOL-NATIVE',
    coin: 'SOL',
    name: 'Solana',
    network: 'Solana Network',
    symbol: 'SOL',
    iconBg: 'from-purple-500 to-teal-400',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    approxRateIdr: 2400000,
    decimals: 4,
    category: 'major',
    placeholderAddress: '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaTue3qYzG45HSZnC',
    addressRegexHint: 'Alamat Base58 Solana (Phantom, Solflare)',
    tagline: 'Kecepatan sub-detik (Est. 1 SOL ≈ Rp 2.400.000)'
  },
  {
    id: 'BNB-CHAIN',
    coin: 'BNB',
    name: 'BNB',
    network: 'BNB Smart Chain (BEP-20)',
    symbol: 'BNB',
    iconBg: 'from-yellow-400 to-amber-500',
    badgeColor: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
    approxRateIdr: 9500000,
    decimals: 4,
    category: 'major',
    placeholderAddress: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    addressRegexHint: 'Format 0x... (BEP-20)',
    tagline: 'Koin Binance Smart Chain (Est. 1 BNB ≈ Rp 9.500.000)'
  },
  {
    id: 'TON-NATIVE',
    coin: 'TON',
    name: 'Toncoin',
    network: 'The Open Network',
    symbol: 'TON',
    iconBg: 'from-blue-500 to-sky-500',
    badgeColor: 'bg-blue-400/20 text-blue-300 border-blue-400/40',
    approxRateIdr: 85000,
    decimals: 3,
    category: 'altcoin',
    placeholderAddress: 'EQBvW8Z5huBkMJYdn3PBRnKKQb463mfe0PcwFuOW4NVI9Rbp',
    addressRegexHint: 'Alamat TON (EQ... / UQ...)',
    requiresMemo: true,
    memoLabel: 'Memo / Tag',
    tagline: 'Koin resmi Telegram (Est. 1 TON ≈ Rp 85.000)'
  },
  {
    id: 'TRX-NATIVE',
    coin: 'TRX',
    name: 'TRON',
    network: 'TRON Mainnet',
    symbol: 'TRX',
    iconBg: 'from-red-500 to-rose-600',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    approxRateIdr: 2500,
    decimals: 2,
    category: 'altcoin',
    placeholderAddress: 'TWMXfK8b5UKej3jGkSStYgW8cT8x9x3q7Z',
    addressRegexHint: 'Alamat TRON berawalan T (34 karakter)',
    tagline: 'Koin utama TRON (Est. 1 TRX ≈ Rp 2.500)'
  },
  {
    id: 'DOGE-MAINNET',
    coin: 'DOGE',
    name: 'Dogecoin',
    network: 'Dogecoin Network',
    symbol: 'DOGE',
    iconBg: 'from-amber-400 to-yellow-600',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    approxRateIdr: 2200,
    decimals: 2,
    category: 'altcoin',
    placeholderAddress: 'D8vEhtMuGj8q9P5B7t7z3vD5p5Qv3c7Z9X',
    addressRegexHint: 'Alamat Doge berawalan huruf "D"',
    tagline: 'Meme coin terpopuler di dunia (Est. 1 DOGE ≈ Rp 2.200)'
  },
  {
    id: 'XRP-LEDGER',
    coin: 'XRP',
    name: 'Ripple',
    network: 'XRP Ledger',
    symbol: 'XRP',
    iconBg: 'from-slate-500 to-cyan-700',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    approxRateIdr: 9000,
    decimals: 2,
    category: 'altcoin',
    placeholderAddress: 'rEb8TK3gBgk5auZyyb67aRKsKhuAKwn56U',
    addressRegexHint: 'Alamat XRP berawalan "r"',
    requiresMemo: true,
    memoLabel: 'Destination Tag (Wajib jika dikirim ke Indodax/Tokocrypto/Binance)',
    tagline: 'Transfer lintas batas likuiditas tinggi (Est. 1 XRP ≈ Rp 9.000)'
  },
  {
    id: 'LTC-MAINNET',
    coin: 'LTC',
    name: 'Litecoin',
    network: 'Litecoin Network',
    symbol: 'LTC',
    iconBg: 'from-blue-400 to-slate-500',
    badgeColor: 'bg-slate-400/20 text-slate-300 border-slate-400/40',
    approxRateIdr: 1300000,
    decimals: 4,
    category: 'altcoin',
    placeholderAddress: 'ltc1qrgp0j9g0j7yq3z8f9j6k9g5k8y4g2g4x9v2x4k',
    addressRegexHint: 'Alamat LTC (ltc1... / L... / M...)',
    tagline: 'Perak digital dengan konfirmasi cepat (Est. 1 LTC ≈ Rp 1.300.000)'
  }
];

export function calculateCryptoEstimate(idrAmount: number, option: CryptoWithdrawOption): string {
  if (!idrAmount || idrAmount <= 0) return '0';
  const raw = idrAmount / option.approxRateIdr;
  if (option.decimals >= 6) {
    return raw.toFixed(option.decimals).replace(/\.?0+$/, '') || '0';
  }
  return raw.toFixed(option.decimals);
}

export function getCryptoGasFee(option: CryptoWithdrawOption): number {
  if (option.networkGasFeeIdr && option.networkGasFeeIdr > 0) {
    return option.networkGasFeeIdr;
  }
  if (option.coin === 'BTC') return 45000;
  if (option.coin === 'ETH') return 55000;
  if (option.network?.includes('TRC-20')) return 15000;
  if (option.network?.includes('BEP-20')) return 5000;
  if (option.network?.includes('Polygon')) return 3500;
  if (option.network?.includes('TON')) return 4000;
  if (option.coin === 'SOL') return 5000;
  if (option.coin === 'TRX') return 7500;
  if (option.coin === 'DOGE') return 6000;
  if (option.coin === 'LTC') return 5000;
  if (option.coin === 'XRP') return 5000;
  return 5000;
}
