import React,{useMemo,useState} from 'react';
import {Copy,ExternalLink,Mail,Search,Check} from 'lucide-react';

type Contact={
  name:string;
  country:'Indonesia'|'India'|'Bangladesh'|'Global';
  email:string;
  channel:string;
  audience:string;
  source:string;
};

const CONTACTS:Contact[]=[
  {name:'Airdrop Sultan Indonesia',country:'Indonesia',email:'Adefebrianft@gmail.com',channel:'Telegram / YouTube',audience:'~37K Telegram',source:'https://t.me/s/airdropsultanindonesia'},
  {name:'Auto Sultan / Zamza Salim',country:'Indonesia',email:'helpautosultan@gmail.com',channel:'YouTube / Telegram',audience:'Crypto airdrop community',source:'https://autosultanofficial.ruclips.net/'},
  {name:'Wali Cryptometic',country:'Indonesia',email:'walicryptometic@gmail.com',channel:'YouTube / Telegram / X',audience:'Crypto/Web3 community',source:'https://linktr.ee/walicryptometic'},

  {name:'Aleem Drops',country:'India',email:'aleemkhanak0786@gmail.com',channel:'Telegram / YouTube',audience:'~19K Telegram',source:'https://tg.me/aleemdrops'},
  {name:'CRYPTO GURUJI',country:'India',email:'roshansahanicg@gmail.com',channel:'YouTube / Telegram / X',audience:'Crypto/airdrop audience',source:'https://linktr.ee/CryptoGurujiOG'},
  {name:'IITian In Crypto',country:'India',email:'team.iitianincrypto@gmail.com',channel:'YouTube / Telegram',audience:'Crypto audience',source:'https://www.digitalcano.com/2025/04/monad-testnet-complete-guide-in-5-min.html'},
  {name:'Airdrop Insider',country:'India',email:'contactairdropinsider@gmail.com',channel:'YouTube',audience:'~4K YouTube',source:'https://vling.net/en/channel/UC2mAe397MoMgRF092dcW7Ow/channel-info'},
  {name:'High Tek Earning',country:'India',email:'hightekbank@gmail.com',channel:'YouTube',audience:'~12K YouTube',source:'https://vling.net/en/channel/UCTdoQt1b2JLZAiwx9-wsbsQ/channel-info'},
  {name:'Crypto Hindustan',country:'India',email:'cryptohindustan123@gmail.com',channel:'YouTube / Telegram',audience:'~49K YouTube',source:'https://vling.net/channel/UCPTuAPlQR6KKSLjq5PYy-_g/channel-info'},
  {name:'Crypto Vinit',country:'India',email:'cryptovinit1@gmail.com',channel:'YouTube / Telegram',audience:'Crypto/airdrop audience',source:'https://t.me/s/cryptovinit1'},
  {name:'Keyur Rohit',country:'India',email:'techwithkeyur@gmail.com',channel:'Instagram / Crypto',audience:'Crypto audience',source:'https://checkbb.com/en/instagram/cryptokingkeyur'},
  {name:'Sonu Crypto',country:'India',email:'sonucrypto6@gmail.com',channel:'YouTube / Crypto',audience:'Crypto/airdrop audience',source:'https://howto.goit.science/ice-mining-app-withdrawal-ice-network-mining-withdrawal-ice-network-okx-exchange-listing-kyc/'},

  {name:'Crypto Bangla',country:'Bangladesh',email:'Cryptobangla.contract@gmail.com',channel:'Telegram / YouTube / X',audience:'~19K Telegram',source:'https://telemetr.me/content/cryptobangla33'},
  {name:'Airdrop Network',country:'Bangladesh',email:'rahathossain778899@gmail.com',channel:'YouTube / Telegram',audience:'~16K YouTube',source:'https://vling.net/en/channel/UC-24zJsKOi46raJTeiakUTQ/channel-info'},
  {name:'CryptoTech / AllEarning36',country:'Bangladesh',email:'allearning36business@gmail.com',channel:'YouTube / Telegram',audience:'Airdrop/earning audience',source:'https://rutube.ru/video/fdb670234eb8167531525d020f5fded7/'},

  {name:'AirdropAlert',country:'Global',email:'morten@airdropalert.com',channel:'Airdrop platform / media',audience:'25M+ site visits',source:'https://airdropalert.com/contact/'},
  {name:'AirdropBuzz',country:'Global',email:'editor@airdropbuzz.com',channel:'Airdrop platform / editorial',audience:'Crypto/Web3 audience',source:'https://airdropbuzz.com/contact'},
  {name:'Earning Fight 24',country:'Global',email:'abdussoburytofficial@gmail.com',channel:'YouTube / Telegram / X',audience:'10K+ community',source:'https://earningfight24.website/'},
  {name:'Crypto Global Network',country:'Global',email:'cryptoglobalnetwork00@gmail.com',channel:'Telegram',audience:'Crypto audience',source:'https://t.me/CryptoGlobalNetwork'},
  {name:'Finance LOOK',country:'Global',email:'financelookbusiness@gmail.com',channel:'Telegram',audience:'Crypto airdrop audience',source:'https://telemetr.io/en/channels/1207187971-financelookofficial'},
  {name:'Sidra Chain Update',country:'Global',email:'sidracoreteam844@gmail.com',channel:'Telegram',audience:'Crypto airdrop audience',source:'https://telemetr.io/en/channels/3598163065-sidracoreteam/posts'},
  {name:'Nazza Crypto News',country:'Global',email:'rikonazza@gmail.com',channel:'YouTube / Telegram',audience:'Crypto audience',source:'https://t.me/s/nazzanews'},
  {name:'Crypto With Lorenzo',country:'Global',email:'lorenzosilingardismma@gmail.com',channel:'YouTube / Crypto',audience:'Crypto audience',source:'https://videohighlight.com/v/MTflSemXLhY'},
  {name:'ATUL TECH',country:'Global',email:'atulanjna38@gmail.com',channel:'YouTube / Telegram',audience:'Crypto/airdrop audience',source:'https://t.me/s/Ytatultech'}
];

export default function InfluencerContactsPanel(){
  const [query,setQuery]=useState('');
  const [country,setCountry]=useState<'ALL'|Contact['country']>('ALL');
  const [copied,setCopied]=useState(false);
  const filtered=useMemo(()=>CONTACTS.filter(c=>{
    const q=query.trim().toLowerCase();
    return (country==='ALL'||c.country===country) && (!q||[c.name,c.email,c.channel,c.country].some(v=>v.toLowerCase().includes(q)));
  }),[query,country]);
  const copyEmails=async(list:Contact[])=>{
    await navigator.clipboard.writeText(list.map(c=>c.email).join('; '));
    setCopied(true);window.setTimeout(()=>setCopied(false),1800);
  };
  return <div className="space-y-6">
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex items-start gap-3"><Mail className="w-5 h-5 text-amber-400 mt-0.5"/><div><h2 className="font-bold">Airdrop Influencer Contacts</h2><p className="text-xs text-slate-400 mt-1 leading-5">Kontak business/promotion yang ditemukan dari sumber publik. Gunakan untuk outreach SYS STREAMER Airdrop. Verifikasi kembali alamat sebelum campaign dikirim.</p></div></div>
    </section>
    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold"><Mail className="w-4 h-4 text-amber-400"/>{filtered.length} contacts</div>
          <button onClick={()=>void copyEmails(filtered)} className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2">{copied?<Check className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}{copied?'Copied':'Copy filtered emails'}</button>
        </div>
        <div className="grid md:grid-cols-[1fr_auto] gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama, email, channel..." className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-10 pr-4 py-3 text-sm"/></div>
          <select value={country} onChange={e=>setCountry(e.target.value as any)} className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"><option value="ALL">Semua negara</option><option value="Indonesia">Indonesia</option><option value="India">India</option><option value="Bangladesh">Bangladesh</option><option value="Global">Global</option></select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 px-5">Target</th><th className="text-left py-3 px-3">Country</th><th className="text-left py-3 px-3">Email</th><th className="text-left py-3 px-3">Channel</th><th className="text-left py-3 px-3">Audience</th><th className="text-right py-3 px-5">Source</th></tr></thead>
        <tbody className="divide-y divide-slate-800">{filtered.map(c=><tr key={c.email} className="hover:bg-slate-950/60"><td className="py-3 px-5 font-semibold whitespace-nowrap">{c.name}</td><td className="py-3 px-3 text-slate-400">{c.country}</td><td className="py-3 px-3 font-mono text-xs text-amber-300 whitespace-nowrap">{c.email}</td><td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">{c.channel}</td><td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">{c.audience}</td><td className="py-3 px-5 text-right"><a href={c.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300"><ExternalLink className="w-3.5 h-3.5"/>Source</a></td></tr>)}</tbody></table>
      </div>
      {!filtered.length&&<div className="p-10 text-center text-sm text-slate-500">Tidak ada contact yang cocok.</div>}
    </section>
  </div>;
}
