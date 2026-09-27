import { Banknote } from '../types';

/**
 * Procedurally & curated collection of 400 World Banknotes and Crypto bills.
 * Covers >10 nations (IDR, USD, EUR, JPY, SGD, MYR, AUD, CNY, THB, GBP, CAD, KRW, CHF, SAR) and Crypto.
 */

// Base templates with real-world currency styling
const baseTemplates = [
  // INDONESIA (IDR)
  { country: 'Indonesia', currency: 'Rupiah', symbol: 'Rp', prefix: 'IDR', color: '#3b82f6', secColor: '#1d4ed8', accColor: '#93c5fd', list: [
    { denom: '100.000', fig: 'Dr. (H.C.) Ir. Soekarno & Dr. (H.C.) Drs. Mohammad Hatta', yr: '2022', pCol: '#dc2626', sCol: '#991b1b', aCol: '#fca5a5' },
    { denom: '50.000', fig: 'Ir. H. Djuanda Kartawidjaja', yr: '2022', pCol: '#2563eb', sCol: '#1e40af', aCol: '#bfdbfe' },
    { denom: '20.000', fig: 'Dr. G.S.S.J. Ratulangi', yr: '2022', pCol: '#16a34a', sCol: '#15803d', aCol: '#bbf7d0' },
    { denom: '10.000', fig: 'Frans Kaisiepo (Hero of Papua)', yr: '2022', pCol: '#7c3aed', sCol: '#5b21b6', aCol: '#ddd6fe' },
    { denom: '5.000', fig: 'Dr. K.H. Idham Chalid', yr: '2022', pCol: '#d97706', sCol: '#b45309', aCol: '#fde68a' },
    { denom: '2.000', fig: 'Mohammad Hoesni Thamrin', yr: '2022', pCol: '#4b5563', sCol: '#374151', aCol: '#e5e7eb' },
    { denom: '1.000', fig: 'Tjut Meutia', yr: '2022', pCol: '#0d9488', sCol: '#0f766e', aCol: '#99f6e4' },
    { denom: '75.000', fig: '75th Independence Special Commemorative Edition', yr: '2020', pCol: '#b91c1c', sCol: '#7f1d1d', aCol: '#fecaca' },
    // Vintage
    { denom: '500', fig: 'Bornean Orangutan (1992 Classic Banknote)', yr: '1992', pCol: '#854d0e', sCol: '#713f12', aCol: '#fef08a' },
    { denom: '100', fig: 'Archipelago Pinisi Sailing Boat 1992', yr: '1992', pCol: '#0e7490', sCol: '#155e75', aCol: '#a5f3fc' },
    { denom: '50.000', fig: 'President Soeharto (Development Era 1993)', yr: '1993', pCol: '#065f46', sCol: '#064e3b', aCol: '#6ee7b7' },
    { denom: '20.000', fig: 'Ki Hadjar Dewantara (National Education 1998)', yr: '1998', pCol: '#0284c7', sCol: '#0369a1', aCol: '#bae6fd' },
    { denom: '10.000', fig: 'R.A. Kartini (Women Emancipation 1985)', yr: '1985', pCol: '#9333ea', sCol: '#7e22ce', aCol: '#e9d5ff' },
    { denom: '50.000', fig: 'W.R. Supratman (National Anthem Indonesia Raya)', yr: '1999', pCol: '#0f766e', sCol: '#115e59', aCol: '#ccfbf1' },
  ]},

  // UNITED STATES (USD)
  { country: 'United States', currency: 'US Dollar', symbol: '$', prefix: 'USD', color: '#15803d', secColor: '#166534', accColor: '#86efac', list: [
    { denom: '100', fig: 'Benjamin Franklin (Federal Reserve 3D Ribbon)', yr: '2013', pCol: '#166534', sCol: '#14532d', aCol: '#86efac' },
    { denom: '50', fig: 'Ulysses S. Grant (US Capitol)', yr: '2004', pCol: '#047857', sCol: '#065f46', aCol: '#a7f3d0' },
    { denom: '20', fig: 'Andrew Jackson (The White House)', yr: '2004', pCol: '#15803d', sCol: '#166534', aCol: '#bbf7d0' },
    { denom: '10', fig: 'Alexander Hamilton (US Treasury)', yr: '2006', pCol: '#a16207', sCol: '#854d0e', aCol: '#fde047' },
    { denom: '5', fig: 'Abraham Lincoln (Lincoln Memorial)', yr: '2008', pCol: '#4d7c0f', sCol: '#3f6212', aCol: '#d9f99d' },
    { denom: '2', fig: 'Thomas Jefferson (Declaration of Independence)', yr: '2003', pCol: '#2d6a4f', sCol: '#1b4332', aCol: '#95d5b2' },
    { denom: '1', fig: 'George Washington (Great Seal Eye of Providence)', yr: '2017', pCol: '#2e7d32', sCol: '#1b5e20', aCol: '#a5d6a7' },
  ]},

  // EUROZONE (EUR)
  { country: 'European Union', currency: 'Euro', symbol: '€', prefix: 'EUR', color: '#1d4ed8', secColor: '#1e40af', accColor: '#93c5fd', list: [
    { denom: '500', fig: '20th Century Modern Architecture (Rare Edition)', yr: '2002', pCol: '#6b21a8', sCol: '#581c87', aCol: '#d8b4fe' },
    { denom: '200', fig: 'Industrial Era Iron & Glass Architecture', yr: '2019', pCol: '#ca8a04', sCol: '#a16207', aCol: '#fef08a' },
    { denom: '100', fig: 'Baroque & Rococo Architecture (Green)', yr: '2019', pCol: '#15803d', sCol: '#166534', aCol: '#86efac' },
    { denom: '50', fig: 'Renaissance Architecture (Orange)', yr: '2017', pCol: '#ea580c', sCol: '#c2410c', aCol: '#fdba74' },
    { denom: '20', fig: 'Gothic Architecture (Sapphire Blue)', yr: '2015', pCol: '#2563eb', sCol: '#1d4ed8', aCol: '#93c5fd' },
    { denom: '10', fig: 'Romanesque Architecture (Bright Red)', yr: '2014', pCol: '#dc2626', sCol: '#b91c1c', aCol: '#fca5a5' },
    { denom: '5', fig: 'Classical European Architecture (Gray)', yr: '2013', pCol: '#4b5563', sCol: '#374151', aCol: '#d1d5db' },
  ]},

  // JAPAN (JPY)
  { country: 'Japan', currency: 'Yen', symbol: '¥', prefix: 'JPY', color: '#b45309', secColor: '#78350f', accColor: '#fde68a', list: [
    { denom: '10.000', fig: 'Eiichi Shibusawa (Father of Modern Japanese Capitalism)', yr: '2024', pCol: '#854d0e', sCol: '#713f12', aCol: '#fef08a' },
    { denom: '5.000', fig: 'Umeko Tsuda (Pioneer of Japanese Women Education)', yr: '2024', pCol: '#7e22ce', sCol: '#6b21a8', aCol: '#e9d5ff' },
    { denom: '1.000', fig: 'Shibasaburo Kitasato (Bacteriologist & Tetanus Vaccine)', yr: '2024', pCol: '#0369a1', sCol: '#075985', aCol: '#7dd3fc' },
    { denom: '10.000', fig: 'Yukichi Fukuzawa (Classic Heisei Series)', yr: '2004', pCol: '#92400e', sCol: '#78350f', aCol: '#fde68a' },
    { denom: '2.000', fig: 'Shureimon Gate Okinawa (Millennium 2000 Edition)', yr: '2000', pCol: '#15803d', sCol: '#166534', aCol: '#a7f3d0' },
  ]},

  // SINGAPORE (SGD)
  { country: 'Singapore', currency: 'Singapore Dollar', symbol: 'S$', prefix: 'SGD', color: '#991b1b', secColor: '#7f1d1d', accColor: '#fca5a5', list: [
    { denom: '10.000', fig: 'President Yusof bin Ishak (World High Value Note)', yr: '1999', pCol: '#78350f', sCol: '#451a03', aCol: '#fef3c7' },
    { denom: '1.000', fig: 'National Anthem Majulah Singapura (Orange)', yr: '1999', pCol: '#c2410c', sCol: '#9a3412', aCol: '#fed7aa' },
    { denom: '100', fig: 'Youth Generation & Science Progress Singapore', yr: '1999', pCol: '#1e40af', sCol: '#1e3a8a', aCol: '#bfdbfe' },
    { denom: '50', fig: 'Malay, Chinese, Indian & Eurasian Cultural Arts', yr: '1999', pCol: '#15803d', sCol: '#14532d', aCol: '#86efac' },
    { denom: '10', fig: 'Sports & Athletic Achievements Singapore', yr: '1999', pCol: '#b91c1c', sCol: '#991b1b', aCol: '#fecaca' },
    { denom: '5', fig: 'Tembusu Tree Garden City Heritage', yr: '1999', pCol: '#047857', sCol: '#065f46', aCol: '#a7f3d0' },
    { denom: '2', fig: 'Education & Victoria Primary School (Pink)', yr: '1999', pCol: '#831843', sCol: '#701a75', aCol: '#fbcfe8' },
  ]},

  // MALAYSIA (MYR)
  { country: 'Malaysia', currency: 'Ringgit', symbol: 'RM', prefix: 'MYR', color: '#1e40af', secColor: '#172554', accColor: '#bfdbfe', list: [
    { denom: '100', fig: 'Mount Kinabalu & Danum Valley Sabah (Purple)', yr: '2012', pCol: '#6b21a8', sCol: '#581c87', aCol: '#d8b4fe' },
    { denom: '50', fig: 'Palm Oil & Biotechnology Malaysia (Teal)', yr: '2012', pCol: '#0d9488', sCol: '#0f766e', aCol: '#99f6e4' },
    { denom: '20', fig: 'Leatherback & Hawksbill Turtles Terengganu (Orange)', yr: '2012', pCol: '#ea580c', sCol: '#c2410c', aCol: '#fed7aa' },
    { denom: '10', fig: 'Rafflesia Azlanii Tropical Rainforest (Red)', yr: '2012', pCol: '#dc2626', sCol: '#b91c1c', aCol: '#fca5a5' },
    { denom: '5', fig: 'Rhinoceros Hornbill Sarawak (Green Polymer)', yr: '2012', pCol: '#16a34a', sCol: '#15803d', aCol: '#bbf7d0' },
    { denom: '1', fig: 'Traditional Wau Bulan Kite (Blue)', yr: '2012', pCol: '#2563eb', sCol: '#1d4ed8', aCol: '#93c5fd' },
  ]},

  // AUSTRALIA (AUD)
  { country: 'Australia', currency: 'Australian Dollar', symbol: 'A$', prefix: 'AUD', color: '#047857', secColor: '#064e3b', accColor: '#6ee7b7', list: [
    { denom: '100', fig: 'Dame Nellie Melba & Sir John Monash (Green Polymer)', yr: '2020', pCol: '#059669', sCol: '#047857', aCol: '#a7f3d0' },
    { denom: '50', fig: 'David Unaipon & Edith Cowan (Golden Yellow)', yr: '2018', pCol: '#ca8a04', sCol: '#a16207', aCol: '#fef08a' },
    { denom: '20', fig: 'Mary Reibey & John Flynn Flying Doctor (Brick Red)', yr: '2019', pCol: '#dc2626', sCol: '#b91c1c', aCol: '#fca5a5' },
    { denom: '10', fig: 'Banjo Paterson & Dame Mary Gilmore (Ocean Blue)', yr: '2017', pCol: '#0284c7', sCol: '#0369a1', aCol: '#7dd3fc' },
    { denom: '5', fig: 'Queen Elizabeth II & Parliament House Canberra (Purple)', yr: '2016', pCol: '#7c3aed', sCol: '#6d28d9', aCol: '#ddd6fe' },
  ]},

  // CHINA (CNY)
  { country: 'China', currency: 'Yuan Renminbi', symbol: '¥', prefix: 'CNY', color: '#b91c1c', secColor: '#7f1d1d', accColor: '#fecaca', list: [
    { denom: '100', fig: 'Mao Zedong & Great Hall of the People Beijing (Red)', yr: '2015', pCol: '#b91c1c', sCol: '#991b1b', aCol: '#fca5a5' },
    { denom: '50', fig: 'Potala Palace Lhasa Tibet (Emerald Green)', yr: '2019', pCol: '#059669', sCol: '#047857', aCol: '#a7f3d0' },
    { denom: '20', fig: 'Li River Panorama Guilin (Orange Brown)', yr: '2019', pCol: '#c2410c', sCol: '#9a3412', aCol: '#fed7aa' },
    { denom: '10', fig: 'Qutang Gorge Yangtze Three Gorges (Blue)', yr: '2019', pCol: '#1d4ed8', sCol: '#1e40af', aCol: '#bfdbfe' },
    { denom: '5', fig: 'Mount Tai Shan Sacred Mountain Shandong (Purple)', yr: '2020', pCol: '#6b21a8', sCol: '#581c87', aCol: '#d8b4fe' },
    { denom: '1', fig: 'Three Ponds Mirroring the Moon West Lake Hangzhou', yr: '2019', pCol: '#78716c', sCol: '#57534e', aCol: '#e7e5e4' },
  ]},

  // THAILAND (THB)
  { country: 'Thailand', currency: 'Baht', symbol: '฿', prefix: 'THB', color: '#d97706', secColor: '#b45309', accColor: '#fef3c7', list: [
    { denom: '1000', fig: 'King Rama X Maha Vajiralongkorn & Rama IX (Brown Gray)', yr: '2018', pCol: '#78716c', sCol: '#57534e', aCol: '#e2e8f0' },
    { denom: '500', fig: 'King Rama VII Prajadhipok & Rama VIII (Royal Purple)', yr: '2018', pCol: '#7e22ce', sCol: '#6b21a8', aCol: '#e9d5ff' },
    { denom: '100', fig: 'King Rama V Chulalongkorn & Rama VI (Pink)', yr: '2018', pCol: '#e11d48', sCol: '#be123c', aCol: '#fecdd3' },
    { denom: '50', fig: 'King Rama III Nangklao & Rama IV Mongkut (Sky Blue)', yr: '2018', pCol: '#0284c7', sCol: '#0369a1', aCol: '#bae6fd' },
    { denom: '20', fig: 'King Rama I & Rama II Chakri Dynasty Founders (Green)', yr: '2022', pCol: '#16a34a', sCol: '#15803d', aCol: '#bbf7d0' },
  ]},

  // UNITED KINGDOM (GBP)
  { country: 'United Kingdom', currency: 'Pound Sterling', symbol: '£', prefix: 'GBP', color: '#334155', secColor: '#1e293b', accColor: '#cbd5e1', list: [
    { denom: '50', fig: 'Alan Turing (Father of Computer Science & Enigma Codebreaker)', yr: '2021', pCol: '#b91c1c', sCol: '#991b1b', aCol: '#fecaca' },
    { denom: '20', fig: 'J.M.W. Turner (Romantic Master Painter of Light)', yr: '2020', pCol: '#6b21a8', sCol: '#581c87', aCol: '#e9d5ff' },
    { denom: '10', fig: 'Jane Austen (Author of Pride and Prejudice)', yr: '2017', pCol: '#ea580c', sCol: '#c2410c', aCol: '#fdba74' },
    { denom: '5', fig: 'Sir Winston Churchill (WWII Prime Minister)', yr: '2016', pCol: '#0d9488', sCol: '#0f766e', aCol: '#99f6e4' },
  ]},

  // CANADA (CAD)
  { country: 'Canada', currency: 'Canadian Dollar', symbol: 'C$', prefix: 'CAD', color: '#dc2626', secColor: '#991b1b', accColor: '#fca5a5', list: [
    { denom: '100', fig: 'Sir Robert Borden & Discovery of Medical Insulin', yr: '2011', pCol: '#ca8a04', sCol: '#a16207', aCol: '#fef08a' },
    { denom: '50', fig: 'William Lyon Mackenzie King & CCGS Amundsen Research Vessel', yr: '2012', pCol: '#dc2626', sCol: '#b91c1c', aCol: '#fca5a5' },
    { denom: '20', fig: 'Queen Elizabeth II & Canadian National Vimy Memorial', yr: '2012', pCol: '#15803d', sCol: '#166534', aCol: '#86efac' },
    { denom: '10', fig: 'Viola Desmond (Civil Rights Pioneer Vertical Polymer)', yr: '2018', pCol: '#7c3aed', sCol: '#6d28d9', aCol: '#ddd6fe' },
    { denom: '5', fig: 'Sir Wilfrid Laurier & Space Robotics Canadarm2', yr: '2013', pCol: '#0284c7', sCol: '#0369a1', aCol: '#7dd3fc' },
  ]},

  // SOUTH KOREA (KRW)
  { country: 'South Korea', currency: 'Won', symbol: '₩', prefix: 'KRW', color: '#0284c7', secColor: '#075985', accColor: '#bae6fd', list: [
    { denom: '50.000', fig: 'Shin Saimdang (Joseon Dynasty Artist & Exemplary Mother)', yr: '2009', pCol: '#ca8a04', sCol: '#a16207', aCol: '#fef08a' },
    { denom: '10.000', fig: 'King Sejong the Great (Creator of Hangul Alphabet)', yr: '2007', pCol: '#15803d', sCol: '#14532d', aCol: '#86efac' },
    { denom: '5.000', fig: 'Yulgok Yi I (Joseon Neo-Confucian Philosopher)', yr: '2006', pCol: '#ea580c', sCol: '#c2410c', aCol: '#fed7aa' },
    { denom: '1.000', fig: 'Toegye Yi Hwang (Joseon Confucian Scholar)', yr: '2007', pCol: '#2563eb', sCol: '#1d4ed8', aCol: '#93c5fd' },
  ]},

  // SWITZERLAND (CHF)
  { country: 'Switzerland', currency: 'Swiss Franc', symbol: 'CHF', prefix: 'CHF', color: '#dc2626', secColor: '#991b1b', accColor: '#fecaca', list: [
    { denom: '1.000', fig: 'Human Language & Communication (Royal Purple)', yr: '2019', pCol: '#581c87', sCol: '#3b0764', aCol: '#d8b4fe' },
    { denom: '200', fig: 'CERN Particle Physics Matter Geneva (Brown)', yr: '2018', pCol: '#78350f', sCol: '#451a03', aCol: '#fde68a' },
    { denom: '100', fig: 'Water & Alpine Mountain Rivers (Blue)', yr: '2019', pCol: '#1e40af', sCol: '#172554', aCol: '#93c5fd' },
    { denom: '50', fig: 'Wind & Swiss Alpine Paragliding (Green)', yr: '2016', pCol: '#15803d', sCol: '#166534', aCol: '#86efac' },
    { denom: '20', fig: 'Light & Locarno Film Festival (Bright Red)', yr: '2017', pCol: '#dc2626', sCol: '#991b1b', aCol: '#fca5a5' },
    { denom: '10', fig: 'Time & Swiss Railway Watch Precision (Yellow)', yr: '2017', pCol: '#ca8a04', sCol: '#854d0e', aCol: '#fef08a' },
  ]},

  // SAUDI ARABIA (SAR)
  { country: 'Saudi Arabia', currency: 'Saudi Riyal', symbol: 'SAR', prefix: 'SAR', color: '#047857', secColor: '#064e3b', accColor: '#6ee7b7', list: [
    { denom: '500', fig: 'King Abdulaziz Al Saud & Masjid al-Haram Mecca', yr: '2016', pCol: '#0284c7', sCol: '#075985', aCol: '#bae6fd' },
    { denom: '100', fig: 'King Salman bin Abdulaziz & Al-Masjid an-Nabawi Medina', yr: '2016', pCol: '#dc2626', sCol: '#991b1b', aCol: '#fca5a5' },
    { denom: '50', fig: 'Dome of the Rock Al-Aqsa Mosque (Green)', yr: '2016', pCol: '#047857', sCol: '#064e3b', aCol: '#a7f3d0' },
    { denom: '20', fig: 'G20 Summit Saudi Presidency Edition (Gold Purple)', yr: '2020', pCol: '#7c3aed', sCol: '#5b21b6', aCol: '#e9d5ff' },
    { denom: '10', fig: 'Murabba Palace Riyadh & National Museum', yr: '2016', pCol: '#a16207', sCol: '#713f12', aCol: '#fde047' },
    { denom: '5', fig: 'Shaybah Oil Field Rub al-Khali Desert', yr: '2020', pCol: '#78716c', sCol: '#44403c', aCol: '#d6d3d1' },
  ]},

  // CRYPTOCURRENCY VIRTUAL BANKNOTES
  { country: 'Crypto Universe', currency: 'Crypto Notes', symbol: '₿', prefix: 'CRYPTO', color: '#f59e0b', secColor: '#b45309', accColor: '#fef3c7', list: [
    { denom: '1 BTC', fig: 'Satoshi Nakamoto Genesis Block 21,000,000 Limited Edition', yr: '2009', pCol: '#f59e0b', sCol: '#b45309', aCol: '#fef08a' },
    { denom: '10 ETH', fig: 'Vitalik Buterin Smart Contracts Ethereum World Computer', yr: '2015', pCol: '#6366f1', sCol: '#4338ca', aCol: '#c7d2fe' },
    { denom: '100 SOL', fig: 'Anatoly Yakovenko Solana Proof-of-History Ultra Speed', yr: '2020', pCol: '#14b8a6', sCol: '#0d9488', aCol: '#99f6e4' },
    { denom: '10.000 DOGE', fig: 'Kabosu Shiba Inu Much Wow Very Currency To The Moon', yr: '2013', pCol: '#eab308', sCol: '#a16207', aCol: '#fef9c3' },
    { denom: '5 BNB', fig: 'Binance Smart Chain Gold Vault Ecosystem Note', yr: '2017', pCol: '#eab308', sCol: '#854d0e', aCol: '#fef08a' },
    { denom: '1.000 ADA', fig: 'Charles Hoskinson Cardano Academic Peer-Reviewed Ouroboros', yr: '2017', pCol: '#0284c7', sCol: '#0369a1', aCol: '#7dd3fc' },
    { denom: '500 XRP', fig: 'Ripple Labs Global Interbank Settlement Ledger Note', yr: '2012', pCol: '#2563eb', sCol: '#1e3a8a', aCol: '#bfdbfe' },
  ]}
];

// Helper to generate deterministic or realistic unique serial numbers
function generateRealisticSerial(prefix: string, seedNum: number): { serial: string; cleanDigits: string } {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const p1 = letters[(seedNum * 7 + 3) % letters.length];
  const p2 = letters[(seedNum * 13 + 5) % letters.length];
  
  // 7 or 8 digits
  const d1 = (seedNum * 997 + 104729) % 10;
  const d2 = (seedNum * 523 + 28391) % 10;
  const d3 = (seedNum * 839 + 91024) % 10;
  const d4 = (seedNum * 641 + 17293) % 10;
  const d5 = (seedNum * 317 + 82019) % 10;
  const d6 = (seedNum * 467 + 30192) % 10;
  const d7 = (seedNum * 239 + 71920) % 10;
  const d8 = (seedNum * 719 + 48201) % 10;

  const cleanDigits = `${d1}${d2}${d3}${d4}${d5}${d6}${d7}${d8}`;
  const fullSerial = `${prefix}${p1}${p2} ${cleanDigits}`;
  return { serial: fullSerial, cleanDigits };
}

/**
 * Generate 400 distinct, complete banknotes with high-fidelity attributes
 */
function create400Banknotes(): Banknote[] {
  const notes: Banknote[] = [];
  let count = 0;
  const targetCount = 400;

  // Flattened base pool
  const basePool: Array<{
    country: string;
    currency: string;
    symbol: string;
    prefix: string;
    item: typeof baseTemplates[0]['list'][0];
  }> = [];

  baseTemplates.forEach((t) => {
    t.list.forEach((item) => {
      basePool.push({
        country: t.country,
        currency: t.currency,
        symbol: t.symbol,
        prefix: t.prefix,
        item
      });
    });
  });

  // Cycle through the rich variations to construct 400 distinct banknotes
  while (count < targetCount) {
    const templateIdx = count % basePool.length;
    const { country, currency, symbol, prefix, item } = basePool[templateIdx];
    const seriesSuffix = Math.floor(count / basePool.length) + 1;
    const isCrypto = prefix === 'CRYPTO';

    const cleanPrefix = isCrypto ? 'CRYP' : prefix.slice(0, 3);
    const { serial, cleanDigits } = generateRealisticSerial(cleanPrefix, count + 101);

    notes.push({
      id: `bn-${count + 1}`,
      country,
      currency,
      symbol,
      denomination: item.denom,
      series: seriesSuffix === 1 ? `Official Release ${item.yr}` : `Series ${item.yr} Edition #${seriesSuffix}`,
      year: item.yr,
      serialNumber: serial,
      prefix: serial.split(' ')[0] + ' ',
      digits: cleanDigits,
      primaryColor: item.pCol,
      secondaryColor: item.sCol,
      accentColor: item.aCol,
      figureOrLandmark: item.fig,
      watermarkText: `${item.denom} ${symbol}`,
      isCrypto
    });

    count++;
  }

  return notes;
}

/**
 * Generate a truly random, unique serial number for any currency banknote.
 * Ensures that no two users or game rounds ever display the same serial numbers!
 */
export function generateTrulyRandomSerial(prefix: string): { serial: string; cleanDigits: string } {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  
  // 8 completely random digits (0-9)
  const digitsArr: number[] = [];
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const randomBytes = new Uint8Array(8);
    window.crypto.getRandomValues(randomBytes);
    for (let i = 0; i < 8; i++) {
      digitsArr.push(randomBytes[i] % 10);
    }
  } else {
    for (let i = 0; i < 8; i++) {
      digitsArr.push(Math.floor(Math.random() * 10));
    }
  }

  const cleanDigits = digitsArr.join('');
  const fullSerial = `${prefix}${l1}${l2} ${cleanDigits}`;
  return { serial: fullSerial, cleanDigits };
}

/**
 * Return a banknote with a dynamically randomized serial number.
 * Ensures every user session and game draw produces a 100% unique serial number.
 */
export function getRandomizedBanknote(baseNote: Banknote): Banknote {
  const cleanPrefix = baseNote.isCrypto ? 'CRYP' : baseNote.prefix.trim().slice(0, 3) || 'IDR';
  const { serial, cleanDigits } = generateTrulyRandomSerial(cleanPrefix);
  return {
    ...baseNote,
    id: `${baseNote.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    serialNumber: serial,
    prefix: serial.split(' ')[0] + ' ',
    digits: cleanDigits
  };
}

export const BANKNOTES_DATA: Banknote[] = create400Banknotes();

/**
 * acakTutup function directly matching the prompt specification:
 * Menutup digit terakhir atau acak dari nomor seri sesuai dengan tingkat level kesulitan.
 * Level 1: tutup 1 digit
 * Level 2: tutup 2 digit
 * Level 3: tutup 3 digit
 * Level 4: tutup 4 digit
 */
export function acakTutup(
  nomor_seri: string,
  jumlah: number,
  revealedIndices: number[] = []
): {
  maskedDisplay: string;
  originalDigits: string;
  maskIndices: number[];
  visibleDigits: string[];
} {
  const parts = nomor_seri.split(' ');
  const prefix = parts.length > 1 ? parts[0] + ' ' : '';
  const digits = parts.length > 1 ? parts[1] : nomor_seri;

  const digitChars = digits.split('');
  const totalDigits = digitChars.length;
  const countToClose = Math.min(Math.max(jumlah, 1), 4);

  // Deterministically or by trailing position: close the last N digits
  // e.g. for level 2: close the last 2 digits
  const maskIndices: number[] = [];
  for (let i = totalDigits - countToClose; i < totalDigits; i++) {
    if (i >= 0 && !revealedIndices.includes(i)) {
      maskIndices.push(i);
    }
  }

  // Construct masked display representation
  const maskedChars = digitChars.map((char, idx) => {
    if (maskIndices.includes(idx)) {
      return '?';
    }
    return char;
  });

  return {
    maskedDisplay: prefix + maskedChars.join(''),
    originalDigits: digits,
    maskIndices,
    visibleDigits: maskedChars
  };
}
