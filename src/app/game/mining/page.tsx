'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Pickaxe, LockKeyhole, Coins, Clock3, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage, formatIdrAsSelectedCurrency } from '../../../i18n';

// Fallback values referenced by locale entries below.
// Keep this outside the component so MINING_COPY is safe during module initialization.
const tx = {
  loading: 'Loading Mining status...', errorStatus: 'Failed to load Mining status.', claimFailed: 'Mining claim failed.',
  success: 'Successfully received {reward} SYS.', title: 'Mining', subtitle: 'Mining follows your active Blind Box Lock.',
  on: 'MINING ACTIVE', off: 'MINING INACTIVE', activeLock: 'Active Lock', dailySys: 'Daily SYS', sysBalance: 'SYS Balance',
  inactive: 'Mining is not active', inactiveDesc: 'Mining activates automatically when you have an active Blind Box Lock worth at least $10.',
  lock: 'Lock', perDay: '/ day', claimed: "Today's Mining reward has been claimed", todayReward: "Today's reward:",
  nextDay: 'The next claim is available on the following day.', available: 'Mining reward available', activeReward: 'Your active lock provides:',
  claim: 'Claim Mining Reward', processing: 'Processing...', rules: 'Mining Rules',
  rule1: 'Mining requires an active Blind Box Lock of at least $10.', rule2: '',
  rule3: 'Claims are limited to once per user per day by the server.', rule4: 'Rewards are determined by the server and credited to the user SYS balance.',
  rule5: 'Mining stops automatically when the Lock expires.',
};

const MINING_COPY: Record<string, Record<string,string>> = {
  id: {loading:tx.loading,errorStatus:tx.errorStatus,claimFailed:tx.claimFailed,success:'Berhasil mendapatkan {reward} SYS.',title:'Penambangan SYS',subtitle:'Penambangan mengikuti Blind Box Lock aktif.',on:tx.on,off:tx.off,activeLock:'Lock Aktif',dailySys:'SYS Harian',sysBalance:'Saldo SYS',inactive:tx.inactive,inactiveDesc:tx.inactiveDesc,lock:tx.lock,perDay:tx.perDay,claimed:tx.claimed,todayReward:tx.todayReward,nextDay:tx.nextDay,available:'Reward Mining tersedia',activeReward:tx.activeReward,claim:'Klaim Reward Mining',processing:'Memproses...',rules:tx.rules,rule1:'Mining membutuhkan Blind Box Lock aktif minimal $10.',rule2:'Setiap kelipatan $10 lock menghasilkan 1 SYS per hari.',rule3:'Claim dibatasi 1 kali per user per hari oleh server.',rule4:'Reward ditentukan server dan masuk ke saldo SYS user.',rule5:'Mining berhenti otomatis ketika Lock berakhir.'},
  en: {loading:'Loading Mining status...',errorStatus:'Failed to load Mining status.',claimFailed:'Mining claim failed.',success:'Successfully received {reward} SYS.',title:tx.title,subtitle:'Mining follows your active Blind Box Lock.',on:tx.on,off:tx.off,activeLock:tx.activeLock,dailySys:tx.dailySys,sysBalance:tx.sysBalance,inactive:'Mining is not active',inactiveDesc:'Mining activates automatically when you have an active Blind Box Lock worth at least $10.',lock:tx.lock,perDay:'/ day',claimed:'Today\'s Mining reward has been claimed',todayReward:'Today\'s reward:',nextDay:'The next claim is available on the following day.',available:'Mining reward available',activeReward:'Your active lock provides:',claim:tx.claim,processing:tx.processing,rules:'Mining Rules',rule1:'Mining requires an active Blind Box Lock of at least $10.',rule2:'Each $10 of lock earns 1 SYS per day.',rule3:'Claims are limited to once per user per day by the server.',rule4:'Rewards are determined by the server and credited to the user SYS balance.',rule5:'Mining stops automatically when the Lock expires.'},
  es: {loading:'Cargando estado de Mining...',errorStatus:'No se pudo cargar el estado de Mining.',claimFailed:'El claim de Mining falló.',success:'Has recibido {reward} SYS.',title:'Minería SYS',subtitle:'La minería sigue tu Blind Box Lock activo.',on:'MINING ACTIVO',off:'MINING INACTIVO',activeLock:'Lock activo',dailySys:'SYS diario',sysBalance:'Saldo SYS',inactive:'Mining no está activo',inactiveDesc:'Mining se activa automáticamente con un Blind Box Lock activo de al menos $10.',lock:tx.lock,perDay:'/ día',claimed:'El reward de Mining de hoy ya fue reclamado',todayReward:'Reward de hoy:',nextDay:'El próximo claim estará disponible mañana.',available:'Reward de Mining disponible',activeReward:'Tu lock activo genera:',claim:'Reclamar reward de Mining',processing:'Procesando...',rules:'Reglas de Mining',rule1:'Mining requiere un Blind Box Lock activo de al menos $10.',rule2:'Cada $10 de lock genera 1 SYS por día.',rule3:'El servidor limita el claim a una vez por usuario y día.',rule4:'El servidor determina el reward y lo acredita al saldo SYS.',rule5:'Mining se detiene automáticamente cuando termina el Lock.'},
  pt: {loading:'Carregando status de Mining...',errorStatus:'Falha ao carregar o status de Mining.',claimFailed:'O claim de Mining falhou.',success:'Você recebeu {reward} SYS.',title:'Mineração SYS',subtitle:'A mineração segue seu Blind Box Lock ativo.',on:'MINING ATIVO',off:'MINING INATIVO',activeLock:'Lock ativo',dailySys:'SYS diário',sysBalance:'Saldo SYS',inactive:'Mining não está ativo',inactiveDesc:'Mining é ativado automaticamente com um Blind Box Lock ativo de pelo menos $10.',lock:tx.lock,perDay:'/ dia',claimed:'O reward de Mining de hoje já foi reivindicado',todayReward:'Reward de hoje:',nextDay:'O próximo claim estará disponível amanhã.',available:'Reward de Mining disponível',activeReward:'Seu lock ativo gera:',claim:'Reivindicar reward de Mining',processing:'Processando...',rules:'Regras de Mining',rule1:'Mining requer um Blind Box Lock ativo de pelo menos $10.',rule2:'Cada $10 de lock gera 1 SYS por dia.',rule3:'O servidor limita o claim a uma vez por usuário por dia.',rule4:'O servidor determina o reward e credita o saldo SYS.',rule5:'Mining para automaticamente quando o Lock termina.'},
  zh: {loading:'正在加载 Mining 状态…',errorStatus:'无法加载 Mining 状态。',claimFailed:'Mining 领取失败。',success:'成功获得 {reward} SYS。',title:'SYS 挖矿',subtitle:'挖矿根据已激活的 Blind Box Lock 运行。',on:'MINING 已开启',off:'MINING 已关闭',activeLock:'当前 Lock',dailySys:'每日 SYS',sysBalance:'SYS 余额',inactive:'Mining 尚未开启',inactiveDesc:'拥有至少 $10的有效 Blind Box Lock 后，Mining 会自动开启。',lock:tx.lock,perDay:'/ 天',claimed:'今天的 Mining 奖励已领取',todayReward:'今日奖励：',nextDay:'下一次领取将在明天开放。',available:'Mining 奖励可领取',activeReward:'当前 Lock 可获得：',claim:'领取 Mining 奖励',processing:'处理中…',rules:'Mining 规则',rule1:'Mining 需要至少 $10 的有效 Blind Box Lock。',rule2:'每锁定 $10 每天获得 1 SYS。',rule3:'服务器限制每个用户每天领取一次。',rule4:'奖励由服务器计算并计入用户 SYS 余额。',rule5:'Lock 到期后 Mining 自动停止。'},
  ja: {loading:'Mining 状態を読み込み中…',errorStatus:'Mining 状態を取得できませんでした。',claimFailed:'Mining の受け取りに失敗しました。',success:'{reward} SYS を獲得しました。',title:'SYS マイニング',subtitle:'マイニングは有効な Blind Box Lock に連動します。',on:tx.on,off:tx.off,activeLock:'有効な Lock',dailySys:'1日の SYS',sysBalance:'SYS 残高',inactive:'Mining は未稼働です',inactiveDesc:'$10以上の有効な Blind Box Lock があると Mining が自動的に開始します。',lock:tx.lock,perDay:'/ 日',claimed:'本日の Mining 報酬は受け取り済みです',todayReward:'本日の報酬：',nextDay:'次回の受け取りは翌日に利用できます。',available:'Mining 報酬を受け取れます',activeReward:'有効な Lock の報酬：',claim:'Mining 報酬を受け取る',processing:'処理中…',rules:'Mining ルール',rule1:'Mining には $10 以上の有効な Blind Box Lock が必要です。',rule2:'$10 の Lock ごとに1日1 SYSを獲得します。',rule3:'サーバーにより1ユーザー1日1回に制限されます。',rule4:'報酬はサーバーで決定され SYS 残高に加算されます。',rule5:'Lock が終了すると Mining は自動停止します。'},
  ko: {loading:'Mining 상태를 불러오는 중...',errorStatus:'Mining 상태를 불러오지 못했습니다.',claimFailed:'Mining 보상 수령에 실패했습니다.',success:'{reward} SYS를 받았습니다.',title:'SYS 채굴',subtitle:'채굴은 활성 Blind Box Lock을 기준으로 작동합니다.',on:tx.on,off:tx.off,activeLock:'활성 Lock',dailySys:'일일 SYS',sysBalance:'SYS 잔액',inactive:'Mining이 활성화되지 않았습니다',inactiveDesc:'최소 $10의 활성 Blind Box Lock이 있으면 Mining이 자동으로 활성화됩니다.',lock:tx.lock,perDay:'/ 일',claimed:'오늘 Mining 보상은 이미 수령했습니다',todayReward:'오늘의 보상:',nextDay:'다음 수령은 다음 날 가능합니다.',available:'Mining 보상 수령 가능',activeReward:'활성 Lock 보상:',claim:'Mining 보상 받기',processing:'처리 중...',rules:'Mining 규칙',rule1:'Mining에는 최소 $10의 활성 Blind Box Lock이 필요합니다.',rule2:'$10 Lock마다 하루 1 SYS를 받습니다.',rule3:'서버에서 사용자당 하루 1회로 제한합니다.',rule4:'보상은 서버에서 결정되어 SYS 잔액에 반영됩니다.',rule5:'Lock이 종료되면 Mining이 자동으로 중지됩니다.'},
  ar: {loading:'جارٍ تحميل حالة التعدين…',errorStatus:'تعذر تحميل حالة التعدين.',claimFailed:'فشل استلام مكافأة التعدين.',success:'تم الحصول على {reward} SYS.',title:'تعدين SYS',subtitle:'التعدين يعتمد على Blind Box Lock النشط.',on:'التعدين مفعل',off:'التعدين متوقف',activeLock:'القفل النشط',dailySys:'SYS يومياً',sysBalance:'رصيد SYS',inactive:'التعدين غير مفعل',inactiveDesc:'يتفعل التعدين تلقائياً عند وجود Blind Box Lock نشط بقيمة لا تقل عن $10.',lock:'القفل',perDay:'/ يوم',claimed:'تم استلام مكافأة التعدين اليوم',todayReward:'مكافأة اليوم:',nextDay:'يتاح الاستلام التالي في اليوم التالي.',available:'مكافأة التعدين متاحة',activeReward:'القفل النشط يمنحك:',claim:'استلام مكافأة التعدين',processing:'جارٍ المعالجة…',rules:'قواعد التعدين',rule1:'يتطلب التعدين Blind Box Lock نشطاً بقيمة $10 على الأقل.',rule2:'كل $10 من القفل تمنح 1 SYS يومياً.',rule3:'يُسمح باستلام المكافأة مرة واحدة لكل مستخدم يومياً عبر الخادم.',rule4:'يحدد الخادم المكافأة ويضيفها إلى رصيد SYS.',rule5:'يتوقف التعدين تلقائياً عند انتهاء القفل.'}
};


interface MiningState {
  success?: boolean;
  miningActive: boolean;
  claimedToday: boolean;
  claimDate?: string;
  dailyReward: number;
  lock?: {
    id: number;
    amountIdr: number;
    amountUsd: number;
    durationDays: number;
    startDate: number;
    endDate: number;
  } | null;
  claim?: {
    id: number;
    rewardSys: number;
    createdAt: number;
  } | null;
  sysBalance: number;
  error?: string;
}

export default function MiningPage() {
  const { language } = useLanguage();
  const tx = MINING_COPY[language] || MINING_COPY.en;
  const localizedMinMining = formatIdrAsSelectedCurrency(10 * 17937, language);
  const [state, setState] = useState<MiningState | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState('');

  const loadMining = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/mining/claim', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || tx.errorStatus);
      }

      setState(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : tx.errorStatus
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMining();
  }, [loadMining]);

  const claimMining = async () => {
    if (!state?.miningActive || state.claimedToday || claiming) return;

    try {
      setClaiming(true);
      setMessage('');

      const response = await fetch('/api/mining/claim', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || tx.claimFailed);
      }

      setMessage(tx.success.replace('{reward}', String(Number(data.rewardSys || 0))));
      await loadMining();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : tx.claimFailed
      );
      await loadMining();
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
            <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-emerald-400" />
            <p className="text-slate-400">{tx.loading}</p>
          </div>
        </div>
      </main>
    );
  }

  const miningActive = Boolean(state?.miningActive);
  const claimedToday = Boolean(state?.claimedToday);
  const lockAmountIdr = Number(state?.lock?.amountIdr || 0);
  const lockAmountUsd = Number(state?.lock?.amountUsd || 0);
  const localizedLockAmount = formatIdrAsSelectedCurrency(lockAmountIdr, language);
  const dailyReward = Number(state?.dailyReward || 0);
  const sysBalance = Number(state?.sysBalance || 0);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-3">
                  <Pickaxe className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">{tx.title}</h1>
                  <p className="text-sm text-slate-400">
                    {tx.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                miningActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  miningActive ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              {miningActive ? tx.on : tx.off}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <LockKeyhole className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">{tx.activeLock}</span>
            </div>
            <div className="text-2xl font-black">{localizedLockAmount}</div>
            <div className="mt-1 text-xs text-slate-500">≈ {'$'}{lockAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <Coins className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">{tx.dailySys}</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {dailyReward.toLocaleString('en-US')} SYS
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <Coins className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">{tx.sysBalance}</span>
            </div>
            <div className="text-2xl font-black">
              {sysBalance.toLocaleString('en-US', {
                maximumFractionDigits: 8,
              })}{' '}
              SYS
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          {!miningActive ? (
            <div className="text-center py-8">
              <LockKeyhole className="mx-auto mb-4 h-10 w-10 text-slate-600" />
              <h2 className="text-xl font-black">{tx.inactive}</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
                {tx.inactiveDesc.replace(/\$10/g, localizedMinMining)}
              </p>

            </div>
          ) : claimedToday ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
              <h2 className="text-xl font-black">
                {tx.claimed}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {tx.todayReward}{' '}
                <strong className="text-emerald-400">
                  {Number(state?.claim?.rewardSys || dailyReward)} SYS
                </strong>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {tx.nextDay}
              </p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Pickaxe className="h-8 w-8 text-emerald-400" />
              </div>

              <h2 className="text-xl font-black">
                {tx.available}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {tx.activeReward}
              </p>

              <div className="my-5 text-4xl font-black text-emerald-400">
                +{dailyReward} SYS
              </div>

              <button
                type="button"
                onClick={claimMining}
                disabled={claiming}
                className="rounded-2xl bg-emerald-500 px-8 py-4 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {claiming ? tx.processing : tx.claim}
              </button>
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm text-slate-300">
              {message}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <h3 className="font-bold">{tx.rules}</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                <li>• {tx.rule1.replace(/\$10/g, localizedMinMining)}</li>
                <li>• {tx.rule3}</li>
                <li>• {tx.rule4}</li>
                <li>• {tx.rule5}</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
