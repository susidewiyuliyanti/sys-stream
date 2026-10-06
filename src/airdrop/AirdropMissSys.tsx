import React, { useState } from 'react';

type Lang = 'id'|'en'|'es'|'pt'|'zh'|'ja'|'ko'|'ar';

const COPY: Record<Lang, {
  name:string; subtitle:string; welcome:string; placeholder:string; send:string; close:string;
  unavailable:string; authRequired:string;
}> = {
  id:{name:'Miss SYS',subtitle:'Asisten akun read-only',welcome:'Tanyakan tentang poin airdrop, saldo, atau transaksi terbaru.',placeholder:'Tanya Miss SYS...',send:'Kirim',close:'Tutup',unavailable:'Miss SYS sedang tidak tersedia.',authRequired:'Hubungkan akun terlebih dahulu untuk menggunakan Miss SYS.'},
  en:{name:'Miss SYS',subtitle:'Read-only account assistant',welcome:'Ask about your airdrop points, balance, or recent transactions.',placeholder:'Ask Miss SYS...',send:'Send',close:'Close',unavailable:'Miss SYS is temporarily unavailable.',authRequired:'Connect your account first to use Miss SYS.'},
  es:{name:'Miss SYS',subtitle:'Asistente de cuenta de solo lectura',welcome:'Pregunta por tus puntos de airdrop, saldo o transacciones recientes.',placeholder:'Pregunta a Miss SYS...',send:'Enviar',close:'Cerrar',unavailable:'Miss SYS no está disponible temporalmente.',authRequired:'Conecta tu cuenta primero para usar Miss SYS.'},
  pt:{name:'Miss SYS',subtitle:'Assistente de conta somente leitura',welcome:'Pergunte sobre seus pontos de airdrop, saldo ou transações recentes.',placeholder:'Pergunte à Miss SYS...',send:'Enviar',close:'Fechar',unavailable:'Miss SYS está temporariamente indisponível.',authRequired:'Conecte sua conta primeiro para usar a Miss SYS.'},
  zh:{name:'Miss SYS',subtitle:'只读账户助手',welcome:'可以询问空投积分、余额或最近的交易。',placeholder:'询问 Miss SYS...',send:'发送',close:'关闭',unavailable:'Miss SYS 暂时不可用。',authRequired:'请先连接账户以使用 Miss SYS。'},
  ja:{name:'Miss SYS',subtitle:'読み取り専用アカウントアシスタント',welcome:'エアドロップポイント、残高、最近の取引について質問できます。',placeholder:'Miss SYS に質問...',send:'送信',close:'閉じる',unavailable:'Miss SYS は一時的に利用できません。',authRequired:'Miss SYS を使用するには、先にアカウントを接続してください。'},
  ko:{name:'Miss SYS',subtitle:'읽기 전용 계정 도우미',welcome:'에어드롭 포인트, 잔액 또는 최근 거래에 대해 질문하세요.',placeholder:'Miss SYS에게 질문...',send:'보내기',close:'닫기',unavailable:'Miss SYS를 일시적으로 사용할 수 없습니다.',authRequired:'Miss SYS를 사용하려면 먼저 계정을 연결하세요.'},
  ar:{name:'Miss SYS',subtitle:'مساعد الحساب للقراءة فقط',welcome:'اسأل عن نقاط الإيردروب أو الرصيد أو المعاملات الأخيرة.',placeholder:'اسأل Miss SYS...',send:'إرسال',close:'إغلاق',unavailable:'Miss SYS غير متاحة مؤقتًا.',authRequired:'اربط حسابك أولًا لاستخدام Miss SYS.'}
};

export default function AirdropMissSys({ lang, enabled }: { lang: Lang; enabled: boolean }) {
  const tx = COPY[lang];
  const [open,setOpen] = useState(false);
  const [message,setMessage] = useState('');
  const [reply,setReply] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);

  if (!enabled) return null;

  const ask = async () => {
    const text = message.trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    setReply('');
    try {
      const response = await fetch('/api/ai/chat', {
        method:'POST',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:text,language:lang})
      });
      const data = await response.json().catch(()=>({}));
      if (!response.ok || !data.success) {
        if (response.status === 401) throw new Error(tx.authRequired);
        throw new Error(String(data.error || tx.unavailable));
      }
      setReply(String(data.message || ''));
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.unavailable);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div dir={lang==='ar'?'rtl':'ltr'} className="fixed bottom-20 inset-x-3 z-[60] mx-auto w-auto max-w-[390px] overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-2xl shadow-black/50 sm:inset-x-auto sm:right-4 sm:left-auto">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
            <div>
              <div className="text-sm font-black text-white">{tx.name}</div>
              <div className="text-[11px] text-slate-400">{tx.subtitle}</div>
            </div>
            <button type="button" onClick={()=>setOpen(false)} aria-label={tx.close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="max-h-[45vh] overflow-y-auto p-4">
            {!reply && !error && <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm leading-6 text-slate-300">{tx.welcome}</div>}
            {reply && <div className="whitespace-pre-wrap rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm leading-6 text-slate-200">{reply}</div>}
            {error && <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm leading-6 text-red-300">{error}</div>}
          </div>
          <div className="border-t border-slate-800 p-3">
            <div className="flex items-end gap-2">
              <textarea value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask();}}} rows={2} maxLength={2000} placeholder={tx.placeholder} className="min-w-0 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" />
              <button type="button" onClick={()=>void ask()} disabled={!message.trim()||loading} aria-label={tx.send} className="rounded-xl bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
                {loading ? '…' : '→'}
              </button>
            </div>
          </div>
        </div>
      )}
      <button type="button" onClick={()=>setOpen(v=>!v)} aria-label={tx.name} title={tx.name} className="fixed bottom-4 right-4 z-[55] inline-flex min-h-12 items-center rounded-full border border-cyan-400/40 bg-slate-900 px-4 py-3 text-sm font-black text-cyan-300 shadow-xl shadow-black/30 hover:border-cyan-300 hover:text-white">
        {tx.name}
      </button>
    </>
  );
}
