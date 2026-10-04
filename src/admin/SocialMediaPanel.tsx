import React, { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Link2, RefreshCw, ShieldAlert, Unplug } from 'lucide-react';

type SocialPlatform = 'tiktok'|'youtube'|'instagram'|'x'|'telegram'|'discord';

type SocialConnection = {
  id: string|null;
  platform: SocialPlatform;
  accountId: string|null;
  accountName: string|null;
  status: string;
  scopes: string|null;
  connectedAt: number|null;
  updatedAt: number|null;
  oauthEnabled: boolean;
  oauthConfigured: boolean;
};

const API='/api/admin/social';

const PLATFORMS:Array<{id:SocialPlatform;name:string;description:string}>=[
  {id:'tiktok',name:'TikTok',description:'Konten dan integrasi akun TikTok resmi.'},
  {id:'youtube',name:'YouTube',description:'Channel YouTube dan YouTube Shorts.'},
  {id:'instagram',name:'Instagram',description:'Akun Instagram melalui API resmi Meta.'},
  {id:'x',name:'X',description:'Akun X melalui OAuth resmi.'},
  {id:'telegram',name:'Telegram',description:'Integrasi channel/bot Telegram.'},
  {id:'discord',name:'Discord',description:'Integrasi akun/bot Discord.'},
];

export default function SocialMediaPanel({adminRole}:{adminRole?:string}){
  const [connections,setConnections]=useState<SocialConnection[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState<SocialPlatform|null>(null);
  const [message,setMessage]=useState('');

  const load=async()=>{
    setLoading(true);setMessage('');
    try{
      const r=await fetch(API,{credentials:'same-origin'});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.success)throw new Error(d.error||'Gagal memuat koneksi social media.');
      setConnections(d.connections||[]);
    }catch(e:any){setMessage(e?.message||'Gagal memuat koneksi social media.');}
    finally{setLoading(false);}
  };

  useEffect(()=>{void load();},[]);

  const connect=async(platform:SocialPlatform)=>{
    setBusy(platform);setMessage('');
    try{
      const r=await fetch(API,{
        method:'POST',
        credentials:'same-origin',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'prepare',platform}),
      });
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.success)throw new Error(d.error||'Gagal menyiapkan koneksi.');
      if(!d.authorizationUrl){
        setMessage(d.message||'Provider belum dikonfigurasi.');
        return;
      }
      window.location.href=d.authorizationUrl;
    }catch(e:any){setMessage(e?.message||'Gagal menyiapkan koneksi.');}
    finally{setBusy(null);}
  };

  const disconnect=async(platform:SocialPlatform)=>{
    if(adminRole!=='OWNER'){setMessage('Hanya OWNER yang dapat memutus koneksi.');return;}
    if(!window.confirm('Putuskan koneksi '+platform.toUpperCase()+' dan hapus token terenkripsi dari vault?'))return;
    setBusy(platform);setMessage('');
    try{
      const r=await fetch(API,{
        method:'POST',
        credentials:'same-origin',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'disconnect',platform}),
      });
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.success)throw new Error(d.error||'Gagal memutus koneksi.');
      setMessage(platform.toUpperCase()+' berhasil diputus.');
      await load();
    }catch(e:any){setMessage(e?.message||'Gagal memutus koneksi.');}
    finally{setBusy(null);}
  };

  const map=new Map(connections.map(c=>[c.platform,c]));

  return <div className="space-y-6">
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0"/>
        <div>
          <h2 className="font-bold">Social Media Control</h2>
          <p className="text-xs leading-5 text-slate-400 mt-1">
            AI Agent hanya dapat menggunakan akun yang terhubung melalui API/OAuth resmi. Token tidak ditampilkan di Admin Panel.
            Publication dan automation tetap berada di bawah kontrol admin.
          </p>
        </div>
      </div>
    </section>

    {message&&<div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">{message}</div>}

    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold">Connected Accounts</h2>
          <p className="text-[11px] text-slate-500 mt-1">Status koneksi production.</p>
        </div>
        <button onClick={()=>void load()} disabled={loading} className="p-2 rounded-lg border border-slate-700 hover:border-slate-500 disabled:opacity-50">
          <RefreshCw className={'w-4 h-4 '+(loading?'animate-spin':'')}/>
        </button>
      </div>

      <div className="divide-y divide-slate-800">
        {PLATFORMS.map(p=>{
          const c=map.get(p.id);
          const connected=c?.status==='CONNECTED';
          const configured=Boolean(c?.oauthConfigured);
          const enabled=Boolean(c?.oauthEnabled);

          return <div key={p.id} className="p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{p.name}</h3>
                {connected&&<span className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="w-3 h-3"/> CONNECTED</span>}
                {!connected&&<span className="text-[10px] rounded-full px-2 py-1 bg-slate-800 text-slate-500">DISCONNECTED</span>}
              </div>
              <p className="text-xs text-slate-500 mt-1">{p.description}</p>
              <div className="text-[11px] text-slate-600 mt-2">
                Provider: {enabled?'enabled':'disabled'} · Config: {configured?'ready':'not configured'}
                {connected&&c?.accountName?' · Account: '+c.accountName:''}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {connected ? <button onClick={()=>void disconnect(p.id)} disabled={busy===p.id||adminRole!=='OWNER'} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40 text-xs font-bold">
                <Unplug className="w-4 h-4"/>{busy===p.id?'Processing...':'Disconnect'}
              </button> : <button onClick={()=>void connect(p.id)} disabled={busy===p.id||adminRole!=='OWNER'||!enabled||!configured} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 text-xs font-extrabold">
                <Link2 className="w-4 h-4"/>{busy===p.id?'Preparing...':'Connect'}
              </button>}
              {configured&&<span title="Provider configured"><ExternalLink className="w-4 h-4 text-slate-700"/></span>}
            </div>
          </div>;
        })}
      </div>
    </section>
  </div>;
}
