import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2, CircleDollarSign, Clock3, ExternalLink, FileVideo,
  Link2, Menu, ShieldCheck, Trophy, Upload, WalletCards, X, Youtube
} from 'lucide-react';
import { SysLogo } from '../components/SysLogo';
import { useLanguage, LanguageCode } from '../i18n';

type TaskType = 'youtube' | 'tiktok' | 'instagram' | 'shorts' | 'social' | 'deposit' | 'withdrawal' | 'profile' | 'checkin';
type Task = {
  id:string; type:TaskType; title:string; description:string; reward:string;
  estimated:string; daily?:boolean; priority?:boolean; action:string;
};
type Leader = { rank:number; username:string; referrals:number };

const BASE_TASKS: Array<Omit<Task,'title'|'description'|'estimated'|'action'>> = [
  {id:'daily-checkin',type:'checkin',reward:'Configured by program',daily:true},
  {id:'tiktok-upload',type:'tiktok',reward:'Configured by program',daily:true},
  {id:'instagram-reel',type:'instagram',reward:'Configured by program',daily:true},
  {id:'youtube-shorts',type:'shorts',reward:'Configured by program',daily:true},
  {id:'youtube-upload',type:'youtube',reward:'Configured by program',daily:true,priority:true},
  {id:'youtube-review',type:'youtube',reward:'Configured by program',daily:true},
  {id:'social-daily',type:'social',reward:'Configured by program',daily:true},
  {id:'deposit',type:'deposit',reward:'Configured by program'},
  {id:'withdrawal',type:'withdrawal',reward:'Configured by program'},
  {id:'profile',type:'profile',reward:'Configured by program'},
];

const TEXT: Record<LanguageCode, any> = {
  id:{
    tasks:'Tugas', submissions:'Pengajuan saya', login:'Masuk', hero:'Tugas harian. Buat konten. Kirim bukti. Dapatkan reward airdrop.',
    intro:'Selesaikan task campaign di YouTube, TikTok, dan Instagram. Kirim link bukti publik dan ikuti aturan setiap task.',
    daily:'MISI HARIAN HARI INI', dailySub:'Task harian dapat berubah sesuai campaign aktif.', available:'Task Tersedia',
    empty:'Belum ada submission', emptySub:'Submission yang kamu kirim akan tampil di sini setelah akun terhubung.',
    instructions:'Instruksi task', live:'LANGSUNG', connecting:'MENGHUBUNGKAN', leaderboard:'PAPAN PERINGKAT REFERRAL',
    top:'Top Referrer — Langsung', leaderSub:'Peringkat diperbarui otomatis setiap 10 detik dari data referral produksi.',
    unavailable:'Leaderboard belum tersedia. Database referral perlu diaktifkan.', successful:'Referral berhasil', refs:'REF',
    missions:'3 misi harian', proof:'Bukti diperlukan', priority:'PRIORITAS', dailyTag:'HARIAN', reward:'Reward',
    footer:'SYS STREAM Airdrop & Task Center', rules:'Reward task mengikuti proses review dan aturan program.', loginContinue:'Masuk untuk melanjutkan',
    instructionsShort:'Instruksi per task', proofShort:'Pengiriman bukti', reviewShort:'Review sebelum reward',
    task:{
      'daily-checkin':['Check-in Harian','Buka Airdrop Center setiap hari dan selesaikan check-in harian untuk menjaga streak campaign.','30 detik','Check In'],
      'tiktok-upload':['Upload ke TikTok','Buat dan upload video SYS STREAM original ke TikTok, lalu kirim URL video publik sebagai bukti.','10–20 menit','Mulai Task TikTok'],
      'instagram-reel':['Posting Instagram Reel','Buat Reel SYS STREAM original dan publikasikan di Instagram. Kirim URL Reel publik sebagai bukti.','10–20 menit','Mulai Task Instagram'],
      'youtube-shorts':['Upload YouTube Short','Buat video vertikal original tentang SYS STREAM dan publikasikan sebagai YouTube Short. Kirim URL publik.','10–20 menit','Mulai Task Shorts'],
      'youtube-upload':['Upload Video ke YouTube','Buat video original tentang SYS STREAM, upload ke channel YouTube, lalu kirim URL video sebagai bukti.','15–30 menit','Mulai Task YouTube'],
      'youtube-review':['Tonton & Review Jujur','Tonton konten campaign dan berikan feedback jujur. Tidak ada kewajiban memberikan rating positif.','5–10 menit','Buka Task Review'],
      'social-daily':['Task Sosial Harian','Selesaikan aktivitas sosial pada brief campaign. Jangan gunakan akun palsu atau otomatisasi.','2–5 menit','Lihat Task'],
      'deposit':['Selesaikan Deposit','Lakukan deposit nyata melalui halaman resmi SYS STREAM. Reward diproses sesuai aturan campaign.','5 menit','Buka Deposit'],
      'withdrawal':['Selesaikan Withdrawal','Ajukan withdrawal sesuai saldo dan aturan. Periksa alamat wallet dan network sebelum konfirmasi.','5 menit','Buka Withdrawal'],
      'profile':['Lengkapi Profil','Lengkapi informasi profil dasar agar akun siap mengikuti campaign dan proses reward.','2 menit','Buka Profil']
    }
  },
  en:{
    tasks:'Tasks', submissions:'My submissions', login:'Login', hero:'Daily tasks. Create content. Submit proof. Earn airdrop rewards.',
    intro:'Complete campaign tasks across YouTube, TikTok and Instagram. Submit public proof links and follow each task’s rules.',
    daily:"TODAY'S DAILY MISSIONS", dailySub:'Daily tasks may change based on the active campaign.', available:'Available Tasks',
    empty:'No submissions yet', emptySub:'Your submissions will appear here after your account is connected.',
    instructions:'Task instructions', live:'LIVE', connecting:'CONNECTING', leaderboard:'REFERRAL LEADERBOARD',
    top:'Top Referrers — Live', leaderSub:'Ranking updates automatically every 10 seconds from production referral data.',
    unavailable:'Leaderboard is not available yet. Referral database needs to be enabled.', successful:'Successful referrals', refs:'REFS',
    missions:'3 daily missions', proof:'Proof required', priority:'PRIORITY', dailyTag:'DAILY', reward:'Reward',
    footer:'SYS STREAM Airdrop & Task Center', rules:'Task rewards are subject to review and program rules.', loginContinue:'Login to continue',
    instructionsShort:'Task instructions', proofShort:'Proof submission', reviewShort:'Review before reward',
    task:{
      'daily-checkin':['Daily Check-in','Open the Airdrop Center each day and complete your daily check-in to keep your campaign streak active.','30 seconds','Check In'],
      'tiktok-upload':['Upload to TikTok','Create and upload an original SYS STREAM video to TikTok, then submit the public video URL as proof.','10–20 minutes','Start TikTok Task'],
      'instagram-reel':['Post an Instagram Reel','Create an original SYS STREAM Reel and publish it on Instagram. Submit the public Reel URL as proof.','10–20 minutes','Start Instagram Task'],
      'youtube-shorts':['Upload a YouTube Short','Create an original vertical SYS STREAM video and publish it as a YouTube Short. Submit the public URL.','10–20 minutes','Start Shorts Task'],
      'youtube-upload':['Upload Video to YouTube','Create an original SYS STREAM video, upload it to YouTube, then submit the video URL as proof.','15–30 minutes','Start YouTube Task'],
      'youtube-review':['Watch & Honest Review','Watch campaign content and provide honest feedback. You are not required to give a positive rating.','5–10 minutes','Open Review Task'],
      'social-daily':['Daily Social Task','Complete the social activity listed in the campaign brief. Do not use fake accounts or automation.','2–5 minutes','View Task'],
      'deposit':['Complete a Deposit','Make a real deposit through the official SYS STREAM page. Rewards follow campaign rules.','5 minutes','Open Deposit'],
      'withdrawal':['Complete a Withdrawal','Request a withdrawal according to your balance and the rules. Check wallet address and network first.','5 minutes','Open Withdrawal'],
      'profile':['Complete Your Profile','Complete your basic profile information so your account is ready for campaigns and rewards.','2 minutes','Open Profile']
    }
  },
  es:{
    tasks:'Tareas', submissions:'Mis envíos', login:'Iniciar sesión', hero:'Tareas diarias. Crea contenido. Envía pruebas. Gana recompensas de airdrop.',
    intro:'Completa tareas de campaña en YouTube, TikTok e Instagram. Envía enlaces públicos como prueba y sigue las reglas.',
    daily:'MISIONES DIARIAS DE HOY', dailySub:'Las tareas diarias pueden cambiar según la campaña activa.', available:'Tareas disponibles',
    empty:'Aún no hay envíos', emptySub:'Tus envíos aparecerán aquí cuando tu cuenta esté conectada.', instructions:'Instrucciones de la tarea',
    live:'EN VIVO', connecting:'CONECTANDO', leaderboard:'CLASIFICACIÓN DE REFERIDOS', top:'Mejores referidores — En vivo',
    leaderSub:'La clasificación se actualiza cada 10 segundos con datos de referidos de producción.', unavailable:'La clasificación aún no está disponible.',
    successful:'Referidos exitosos', refs:'REF', missions:'3 misiones diarias', proof:'Prueba requerida', priority:'PRIORIDAD', dailyTag:'DIARIA', reward:'Recompensa',
    footer:'SYS STREAM Centro de Airdrop y Tareas', rules:'Las recompensas están sujetas a revisión y reglas del programa.', loginContinue:'Iniciar sesión para continuar',
    instructionsShort:'Instrucciones', proofShort:'Envío de prueba', reviewShort:'Revisión antes de recompensa',
    task:{
      'daily-checkin':['Check-in diario','Abre el Centro de Airdrop cada día y completa el check-in para mantener tu racha.','30 segundos','Hacer check-in'],
      'tiktok-upload':['Subir a TikTok','Crea y sube un video original de SYS STREAM a TikTok y envía la URL pública como prueba.','10–20 minutos','Iniciar tarea TikTok'],
      'instagram-reel':['Publicar un Reel','Crea un Reel original de SYS STREAM y publícalo en Instagram. Envía la URL pública.','10–20 minutos','Iniciar tarea Instagram'],
      'youtube-shorts':['Subir un YouTube Short','Crea un video vertical original y publícalo como YouTube Short. Envía la URL pública.','10–20 minutos','Iniciar tarea Shorts'],
      'youtube-upload':['Subir video a YouTube','Crea un video original de SYS STREAM, súbelo a YouTube y envía la URL.','15–30 minutos','Iniciar tarea YouTube'],
      'youtube-review':['Ver y reseñar honestamente','Mira el contenido de campaña y da una opinión honesta. No se exige una valoración positiva.','5–10 minutos','Abrir reseña'],
      'social-daily':['Tarea social diaria','Completa la actividad social indicada en la campaña. No uses cuentas falsas ni automatización.','2–5 minutos','Ver tarea'],
      'deposit':['Completar depósito','Realiza un depósito real mediante la página oficial de SYS STREAM.','5 minutos','Abrir depósito'],
      'withdrawal':['Completar retiro','Solicita un retiro según tu saldo y las reglas. Comprueba la dirección y red de la wallet.','5 minutos','Abrir retiro'],
      'profile':['Completar perfil','Completa la información básica de tu perfil para participar en campañas y recompensas.','2 minutos','Abrir perfil']
    }
  },
  pt:{
    tasks:'Tarefas', submissions:'Meus envios', login:'Entrar', hero:'Tarefas diárias. Crie conteúdo. Envie provas. Ganhe recompensas de airdrop.',
    intro:'Conclua tarefas de campanha no YouTube, TikTok e Instagram. Envie links públicos como prova e siga as regras.',
    daily:'MISSÕES DIÁRIAS DE HOJE', dailySub:'As tarefas diárias podem mudar conforme a campanha ativa.', available:'Tarefas disponíveis',
    empty:'Nenhum envio ainda', emptySub:'Seus envios aparecerão aqui quando sua conta estiver conectada.', instructions:'Instruções da tarefa',
    live:'AO VIVO', connecting:'CONECTANDO', leaderboard:'RANKING DE INDICAÇÕES', top:'Top Indicadores — Ao vivo',
    leaderSub:'O ranking é atualizado a cada 10 segundos com dados de indicações de produção.', unavailable:'O ranking ainda não está disponível.',
    successful:'Indicações bem-sucedidas', refs:'REF', missions:'3 missões diárias', proof:'Prova necessária', priority:'PRIORIDADE', dailyTag:'DIÁRIA', reward:'Recompensa',
    footer:'SYS STREAM Central de Airdrop e Tarefas', rules:'As recompensas estão sujeitas à análise e às regras do programa.', loginContinue:'Entrar para continuar',
    instructionsShort:'Instruções', proofShort:'Envio de prova', reviewShort:'Revisão antes da recompensa',
    task:{
      'daily-checkin':['Check-in diário','Abra o Centro de Airdrop todos os dias e faça o check-in para manter sua sequência.','30 segundos','Fazer check-in'],
      'tiktok-upload':['Enviar para TikTok','Crie e envie um vídeo original do SYS STREAM ao TikTok e envie a URL pública como prova.','10–20 minutos','Iniciar tarefa TikTok'],
      'instagram-reel':['Publicar Reel no Instagram','Crie um Reel original do SYS STREAM e publique no Instagram. Envie a URL pública.','10–20 minutos','Iniciar tarefa Instagram'],
      'youtube-shorts':['Enviar YouTube Short','Crie um vídeo vertical original e publique como YouTube Short. Envie a URL pública.','10–20 minutos','Iniciar tarefa Shorts'],
      'youtube-upload':['Enviar vídeo ao YouTube','Crie um vídeo original do SYS STREAM, envie ao YouTube e depois envie a URL.','15–30 minutos','Iniciar tarefa YouTube'],
      'youtube-review':['Assistir e avaliar honestamente','Assista ao conteúdo da campanha e dê feedback honesto. Não é obrigatório dar avaliação positiva.','5–10 minutos','Abrir avaliação'],
      'social-daily':['Tarefa social diária','Conclua a atividade social indicada no briefing. Não use contas falsas ou automação.','2–5 minutos','Ver tarefa'],
      'deposit':['Concluir depósito','Faça um depósito real pela página oficial do SYS STREAM.','5 minutos','Abrir depósito'],
      'withdrawal':['Concluir saque','Solicite o saque conforme seu saldo e as regras. Confira endereço e rede da carteira.','5 minutos','Abrir saque'],
      'profile':['Completar perfil','Complete os dados básicos do perfil para participar de campanhas e receber recompensas.','2 minutos','Abrir perfil']
    }
  },
  zh:{
    tasks:'任务', submissions:'我的提交', login:'登录', hero:'每日任务。创建内容。提交证明。赚取空投奖励。',
    intro:'完成 YouTube、TikTok 和 Instagram 活动任务。提交公开证明链接并遵守任务规则。', daily:'今日每日任务',
    dailySub:'每日任务可能根据当前活动调整。', available:'可用任务', empty:'暂无提交', emptySub:'连接账户后，你的提交会显示在这里。',
    instructions:'任务说明', live:'直播', connecting:'连接中', leaderboard:'推荐排行榜', top:'推荐达人 — 实时',
    leaderSub:'排行榜每 10 秒根据生产环境推荐数据更新。', unavailable:'排行榜暂不可用。', successful:'成功推荐', refs:'推荐',
    missions:'3 个每日任务', proof:'需要证明', priority:'优先', dailyTag:'每日', reward:'奖励',
    footer:'SYS STREAM 空投与任务中心', rules:'任务奖励需经过审核并遵守活动规则。', loginContinue:'登录后继续',
    instructionsShort:'任务说明', proofShort:'提交证明', reviewShort:'奖励前审核',
    task:{
      'daily-checkin':['每日签到','每天打开空投中心并完成签到，保持活动连续记录。','30 秒','签到'],
      'tiktok-upload':['上传到 TikTok','创建并上传原创 SYS STREAM 视频到 TikTok，然后提交公开视频链接作为证明。','10–20 分钟','开始 TikTok 任务'],
      'instagram-reel':['发布 Instagram Reel','创建原创 SYS STREAM Reel 并发布到 Instagram，提交公开链接。','10–20 分钟','开始 Instagram 任务'],
      'youtube-shorts':['上传 YouTube Short','创建原创竖屏视频并作为 YouTube Short 发布，提交公开链接。','10–20 分钟','开始 Shorts 任务'],
      'youtube-upload':['上传 YouTube 视频','创建原创 SYS STREAM 视频并上传到 YouTube，然后提交视频链接。','15–30 分钟','开始 YouTube 任务'],
      'youtube-review':['观看并诚实评价','观看活动内容并提供真实反馈，不要求给出正面评价。','5–10 分钟','打开评价任务'],
      'social-daily':['每日社交任务','完成活动说明中的社交任务。不要使用虚假账户或自动化。','2–5 分钟','查看任务'],
      'deposit':['完成充值','通过 SYS STREAM 官方页面完成真实充值，奖励按活动规则处理。','5 分钟','打开充值'],
      'withdrawal':['完成提现','按照余额和规则申请提现。确认钱包地址和网络后再确认。','5 分钟','打开提现'],
      'profile':['完善个人资料','完善基本资料，使账户可以参加活动并处理奖励。','2 分钟','打开资料']
    }
  },
  ja:{
    tasks:'タスク', submissions:'提出履歴', login:'ログイン', hero:'毎日のタスク。コンテンツを作成。証明を提出。エアドロップ報酬を獲得。',
    intro:'YouTube、TikTok、Instagram のキャンペーンタスクを完了し、公開証明リンクを提出してください。', daily:'本日のデイリーミッション',
    dailySub:'デイリータスクはキャンペーンにより変更されます。', available:'利用可能なタスク', empty:'提出はまだありません', emptySub:'アカウント接続後、提出内容がここに表示されます。',
    instructions:'タスクの説明', live:'ライブ', connecting:'接続中', leaderboard:'紹介ランキング', top:'紹介者トップ — ライブ',
    leaderSub:'本番の紹介データに基づき10秒ごとに更新されます。', unavailable:'ランキングはまだ利用できません。', successful:'成功した紹介', refs:'紹介',
    missions:'3つのデイリーミッション', proof:'証明が必要', priority:'優先', dailyTag:'毎日', reward:'報酬',
    footer:'SYS STREAM エアドロップ＆タスクセンター', rules:'報酬は審査とプログラム規則に従います。', loginContinue:'ログインして続行',
    instructionsShort:'タスク説明', proofShort:'証明提出', reviewShort:'報酬前の審査',
    task:{
      'daily-checkin':['デイリーチェックイン','毎日エアドロップセンターを開き、チェックインしてキャンペーンの連続記録を維持します。','30秒','チェックイン'],
      'tiktok-upload':['TikTokへアップロード','オリジナルのSYS STREAM動画をTikTokへ投稿し、公開URLを証明として提出します。','10–20分','TikTokタスク開始'],
      'instagram-reel':['Instagram Reelを投稿','オリジナルのSYS STREAM ReelをInstagramへ投稿し、公開URLを提出します。','10–20分','Instagramタスク開始'],
      'youtube-shorts':['YouTube Shortを投稿','オリジナルの縦動画をYouTube Shortとして投稿し、公開URLを提出します。','10–20分','Shortsタスク開始'],
      'youtube-upload':['YouTubeへ動画を投稿','オリジナルのSYS STREAM動画をYouTubeへ投稿し、URLを提出します。','15–30分','YouTubeタスク開始'],
      'youtube-review':['視聴＆正直なレビュー','キャンペーン内容を視聴し、正直なフィードバックを提供します。高評価は必須ではありません。','5–10分','レビュータスクを開く'],
      'social-daily':['デイリーSNSタスク','キャンペーン概要のSNS活動を完了します。偽アカウントや自動化は禁止です。','2–5分','タスクを見る'],
      'deposit':['入金を完了','SYS STREAM公式ページから実際に入金します。報酬はキャンペーン規則に従います。','5分','入金を開く'],
      'withdrawal':['出金を完了','残高と規則に従って出金を申請し、ウォレットアドレスとネットワークを確認します。','5分','出金を開く'],
      'profile':['プロフィールを完成','基本プロフィールを完成させ、キャンペーンと報酬処理に備えます。','2分','プロフィールを開く']
    }
  },
  ko:{
    tasks:'작업', submissions:'내 제출', login:'로그인', hero:'매일의 작업. 콘텐츠를 만들고 증빙을 제출하여 에어드롭 보상을 받으세요.',
    intro:'YouTube, TikTok, Instagram 캠페인 작업을 완료하고 공개 증빙 링크를 제출하세요.', daily:'오늘의 일일 미션',
    dailySub:'일일 작업은 활성 캠페인에 따라 변경될 수 있습니다.', available:'사용 가능한 작업', empty:'제출 내역이 없습니다', emptySub:'계정 연결 후 제출 내역이 여기에 표시됩니다.',
    instructions:'작업 안내', live:'라이브', connecting:'연결 중', leaderboard:'추천인 순위', top:'추천인 TOP — 라이브',
    leaderSub:'운영 추천 데이터를 기준으로 10초마다 업데이트됩니다.', unavailable:'순위를 아직 사용할 수 없습니다.', successful:'성공한 추천', refs:'추천',
    missions:'일일 미션 3개', proof:'증빙 필요', priority:'우선', dailyTag:'일일', reward:'보상',
    footer:'SYS STREAM 에어드롭 & 작업 센터', rules:'작업 보상은 검토 및 프로그램 규칙에 따릅니다.', loginContinue:'로그인하여 계속',
    instructionsShort:'작업 안내', proofShort:'증빙 제출', reviewShort:'보상 전 검토',
    task:{
      'daily-checkin':['일일 체크인','매일 에어드롭 센터를 열고 체크인하여 캠페인 연속 기록을 유지하세요.','30초','체크인'],
      'tiktok-upload':['TikTok 업로드','SYS STREAM 오리지널 영상을 TikTok에 업로드하고 공개 URL을 증빙으로 제출하세요.','10–20분','TikTok 작업 시작'],
      'instagram-reel':['Instagram Reel 게시','SYS STREAM 오리지널 Reel을 Instagram에 게시하고 공개 URL을 제출하세요.','10–20분','Instagram 작업 시작'],
      'youtube-shorts':['YouTube Short 업로드','오리지널 세로 영상을 YouTube Short로 게시하고 공개 URL을 제출하세요.','10–20분','Shorts 작업 시작'],
      'youtube-upload':['YouTube 영상 업로드','SYS STREAM 오리지널 영상을 YouTube에 업로드하고 영상 URL을 제출하세요.','15–30분','YouTube 작업 시작'],
      'youtube-review':['시청 및 솔직한 리뷰','캠페인 콘텐츠를 시청하고 솔직한 의견을 주세요. 긍정적인 평가는 요구되지 않습니다.','5–10분','리뷰 작업 열기'],
      'social-daily':['일일 소셜 작업','캠페인 안내의 소셜 활동을 완료하세요. 가짜 계정이나 자동화를 사용하지 마세요.','2–5분','작업 보기'],
      'deposit':['입금 완료','SYS STREAM 공식 페이지에서 실제 입금을 진행하세요. 보상은 캠페인 규칙에 따릅니다.','5분','입금 열기'],
      'withdrawal':['출금 완료','잔액과 규칙에 따라 출금을 신청하고 지갑 주소와 네트워크를 확인하세요.','5분','출금 열기'],
      'profile':['프로필 완성','기본 프로필 정보를 완료하여 캠페인 및 보상 처리에 대비하세요.','2분','프로필 열기']
    }
  },
  ar:{
    tasks:'المهام', submissions:'إرسالياتي', login:'تسجيل الدخول', hero:'مهام يومية. أنشئ المحتوى. أرسل الإثبات. احصل على مكافآت الإيردروب.',
    intro:'أكمل مهام الحملات على YouTube وTikTok وInstagram وأرسل روابط إثبات عامة واتبع قواعد كل مهمة.',
    daily:'مهام اليوم اليومية', dailySub:'قد تتغير المهام اليومية حسب الحملة النشطة.', available:'المهام المتاحة',
    empty:'لا توجد إرساليات بعد', emptySub:'ستظهر إرسالياتك هنا بعد ربط حسابك.', instructions:'تعليمات المهمة',
    live:'مباشر', connecting:'جارٍ الاتصال', leaderboard:'لوحة ترتيب الإحالات', top:'أفضل المحيلين — مباشر',
    leaderSub:'يتم تحديث الترتيب كل 10 ثوانٍ من بيانات الإحالات الإنتاجية.', unavailable:'لوحة الترتيب غير متاحة بعد.',
    successful:'إحالات ناجحة', refs:'إحالة', missions:'3 مهام يومية', proof:'الإثبات مطلوب', priority:'أولوية', dailyTag:'يومي', reward:'المكافأة',
    footer:'SYS STREAM مركز الإيردروب والمهام', rules:'تخضع مكافآت المهام للمراجعة وقواعد البرنامج.', loginContinue:'تسجيل الدخول للمتابعة',
    instructionsShort:'تعليمات المهمة', proofShort:'إرسال الإثبات', reviewShort:'مراجعة قبل المكافأة',
    task:{
      'daily-checkin':['تسجيل يومي','افتح مركز الإيردروب كل يوم وأكمل التسجيل للحفاظ على سلسلة الحملة.','30 ثانية','تسجيل'],
      'tiktok-upload':['رفع إلى TikTok','أنشئ فيديو أصليًا لـ SYS STREAM وارفعه إلى TikTok ثم أرسل الرابط العام كإثبات.','10–20 دقيقة','بدء مهمة TikTok'],
      'instagram-reel':['نشر Instagram Reel','أنشئ Reel أصليًا لـ SYS STREAM وانشره على Instagram ثم أرسل الرابط العام.','10–20 دقيقة','بدء مهمة Instagram'],
      'youtube-shorts':['رفع YouTube Short','أنشئ فيديو عموديًا أصليًا وانشره كـ YouTube Short ثم أرسل الرابط العام.','10–20 دقيقة','بدء مهمة Shorts'],
      'youtube-upload':['رفع فيديو إلى YouTube','أنشئ فيديو أصليًا لـ SYS STREAM وارفعه إلى YouTube ثم أرسل الرابط.','15–30 دقيقة','بدء مهمة YouTube'],
      'youtube-review':['مشاهدة ومراجعة صادقة','شاهد محتوى الحملة وقدّم ملاحظات صادقة. لا يُطلب منك تقديم تقييم إيجابي.','5–10 دقائق','فتح مهمة المراجعة'],
      'social-daily':['مهمة اجتماعية يومية','أكمل النشاط الاجتماعي المذكور في الحملة. لا تستخدم حسابات مزيفة أو أتمتة.','2–5 دقائق','عرض المهمة'],
      'deposit':['إكمال الإيداع','أجرِ إيداعًا حقيقيًا عبر صفحة SYS STREAM الرسمية. تتبع المكافأة قواعد الحملة.','5 دقائق','فتح الإيداع'],
      'withdrawal':['إكمال السحب','قدّم طلب السحب وفق الرصيد والقواعد وتحقق من عنوان المحفظة والشبكة.','5 دقائق','فتح السحب'],
      'profile':['إكمال الملف الشخصي','أكمل معلومات ملفك الأساسية لتكون جاهزًا للحملات ومعالجة المكافآت.','دقيقتان','فتح الملف']
    }
  }
};

function typeIcon(type:TaskType){
  if(type==='youtube'||type==='shorts') return <Youtube className="w-5 h-5"/>;
  if(type==='tiktok') return <span className="text-sm font-black">♪</span>;
  if(type==='instagram') return <span className="text-sm font-black">◎</span>;
  if(type==='checkin') return <Clock3 className="w-5 h-5"/>;
  if(type==='deposit') return <CircleDollarSign className="w-5 h-5"/>;
  if(type==='withdrawal') return <WalletCards className="w-5 h-5"/>;
  if(type==='profile') return <CheckCircle2 className="w-5 h-5"/>;
  if(type==='social') return <Link2 className="w-5 h-5"/>;
  return <Upload className="w-5 h-5"/>;
}
function typeLabel(type:TaskType, t:any){
  const map:any={youtube:'YOUTUBE',shorts:'YOUTUBE SHORTS',tiktok:'TIKTOK',instagram:'INSTAGRAM',checkin:'CHECK-IN',social:'SOCIAL',deposit:'DEPOSIT',withdrawal:'WITHDRAWAL',profile:'PROFILE'};
  return map[type];
}
function localizedTasks(language:LanguageCode):Task[]{
  const tx=TEXT[language]||TEXT.en;
  return BASE_TASKS.map(base=>{
    const v=tx.task[base.id]||TEXT.en.task[base.id];
    return {...base,title:v[0],description:v[1],estimated:v[2],action:v[3]};
  });
}

export default function AirdropApp(){
  const {language}=useLanguage();
  const tx=TEXT[language]||TEXT.en;
  const [selectedTask,setSelectedTask]=useState<Task|null>(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const [tab,setTab]=useState<'tasks'|'submissions'>('tasks');
  const [leaders,setLeaders]=useState<Leader[]>([]);
  const [leaderboardUpdated,setLeaderboardUpdated]=useState<number|null>(null);
  const [leaderboardError,setLeaderboardError]=useState('');
  const tasks=useMemo(()=>localizedTasks(language),[language]);

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      try{
        const res=await fetch('/api/airdrop/referral-leaderboard',{cache:'no-store'});
        const data=await res.json().catch(()=>({}));
        if(!res.ok||!data.success) throw new Error(data.error||'Leaderboard unavailable');
        if(active){setLeaders(Array.isArray(data.leaderboard)?data.leaderboard:[]);setLeaderboardUpdated(Number(data.updatedAt||Date.now()/1000));setLeaderboardError('');}
      }catch(e){if(active)setLeaderboardError(e instanceof Error?e.message:'Leaderboard unavailable');}
    };
    load();
    const timer=window.setInterval(load,10000);
    return()=>{active=false;window.clearInterval(timer);};
  },[]);

  return <div className="min-h-screen bg-slate-950 text-slate-100">
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <a href="https://sysstreamer.asia"><SysLogo size="sm" showText/></a>
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <button onClick={()=>setTab('tasks')} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900">{tx.tasks}</button>
          <button onClick={()=>setTab('submissions')} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900">{tx.submissions}</button>
          <a href="https://sysstreamer.asia/login" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-950 font-bold">{tx.login}</a>
        </nav>
        <button className="md:hidden p-2 rounded-lg" onClick={()=>setMenuOpen(v=>!v)} aria-label={tx.tasks}>{menuOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
      </div>
      {menuOpen&&<div className="md:hidden border-t border-slate-800 px-4 py-3 space-y-2">
        <button onClick={()=>{setTab('tasks');setMenuOpen(false)}} className="block w-full text-left px-3 py-2">{tx.tasks}</button>
        <button onClick={()=>{setTab('submissions');setMenuOpen(false)}} className="block w-full text-left px-3 py-2">{tx.submissions}</button>
        <a href="https://sysstreamer.asia/login" className="block px-3 py-2 rounded-lg bg-slate-100 text-slate-950 font-bold">{tx.login}</a>
      </div>}
    </header>

    <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl"/>
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400"><ShieldCheck className="w-4 h-4"/> SYS STREAM TASK CENTER</div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">{tx.hero}</h1>
          <p className="mt-4 text-slate-400 max-w-2xl">{tx.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ {tx.instructionsShort}</span>
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ {tx.proofShort}</span>
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ {tx.reviewShort}</span>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-amber-400"><Trophy className="w-4 h-4"/> {tx.leaderboard}</div>
            <h2 className="mt-1 text-xl font-black">{tx.top}</h2>
            <p className="mt-1 text-xs text-slate-500">{tx.leaderSub}</p>
          </div>
          <div className="text-right text-[10px] text-slate-500">{leaderboardUpdated?tx.live:tx.connecting}</div>
        </div>
        {leaderboardError?<div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">{tx.unavailable}</div>:
          <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(leaders.length?leaders:Array.from({length:3},(_,i)=>({rank:i+1,username:'—',referrals:0}))).map((leader,i)=>
              <div key={leader.rank} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${i===0?'bg-amber-400 text-slate-950':'bg-slate-800 text-slate-300'}`}>#{leader.rank}</div>
                <div className="min-w-0 flex-1"><div className="font-bold truncate">{leader.username}</div><div className="text-[10px] text-slate-500">{tx.successful}</div></div>
                <div className="text-right"><div className="font-black text-amber-400">{leader.referrals}</div><div className="text-[9px] text-slate-500">{tx.refs}</div></div>
              </div>
            )}
          </div>}
      </section>

      <section className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><div className="text-xs font-black tracking-wider text-amber-400">{tx.daily}</div><h2 className="mt-1 text-xl font-black">{tx.daily}</h2><p className="mt-1 text-xs text-slate-500">{tx.dailySub}</p></div>
          <div className="text-xs text-slate-400">{tx.missions}</div>
        </div>
        <div className="mt-5 grid md:grid-cols-3 gap-3">
          {tasks.filter(t=>t.daily).map(t=><button key={t.id} onClick={()=>setSelectedTask(t)} className="text-left rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-amber-500/40">
            <div className="flex items-center justify-between"><span className="text-amber-400">{typeIcon(t.type)}</span>{t.priority&&<span className="text-[9px] font-black text-amber-300 bg-amber-400/10 px-2 py-1 rounded-full">{tx.priority}</span>}</div>
            <div className="mt-3 font-bold text-sm">{t.title}</div><div className="mt-1 text-xs text-slate-500">{t.estimated} · {tx.proof}</div>
          </button>)}
        </div>
      </section>

      <div className="mt-8 flex items-center gap-2 border-b border-slate-800">
        <button onClick={()=>setTab('tasks')} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab==='tasks'?'border-amber-400 text-white':'border-transparent text-slate-500'}`}>{tx.available}</button>
        <button onClick={()=>setTab('submissions')} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab==='submissions'?'border-amber-400 text-white':'border-transparent text-slate-500'}`}>{tx.submissions}</button>
      </div>

      {tab==='tasks'?<section className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {tasks.map(t=><article key={t.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col">
          <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold text-slate-300">{typeIcon(t.type)} {typeLabel(t.type,tx)}</span><div className="flex gap-1">{t.daily&&<span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">{tx.dailyTag}</span>}{t.priority&&<span className="text-[9px] font-black text-amber-300 bg-amber-400/10 px-2 py-1 rounded-full">{tx.priority}</span>}</div></div>
          <h2 className="mt-5 text-lg font-bold">{t.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400 flex-1">{t.description}</p>
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3"><div><div className="text-xs text-slate-500">{tx.reward}</div><div className="font-bold text-amber-400">{t.reward}</div></div><button onClick={()=>setSelectedTask(t)} className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm">{t.action}</button></div>
        </article>)}
      </section>:<section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center"><FileVideo className="w-10 h-10 mx-auto text-slate-600"/><h2 className="mt-4 font-bold">{tx.empty}</h2><p className="mt-2 text-sm text-slate-500">{tx.emptySub}</p></section>}
    </main>

    <footer className="border-t border-slate-800 mt-12"><div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-500 flex flex-wrap gap-3 justify-between"><span>{tx.footer}</span><span>{tx.rules}</span></div></footer>

    {selectedTask&&<div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" onClick={()=>setSelectedTask(null)}>
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold text-amber-400">{typeLabel(selectedTask.type,tx)}</div><h2 className="mt-1 text-xl font-black">{selectedTask.title}</h2></div><button onClick={()=>setSelectedTask(null)} className="p-2 rounded-lg hover:bg-slate-800"><X className="w-5 h-5"/></button></div>
        <div className="mt-6 rounded-xl bg-slate-950 border border-slate-800 p-4"><div className="text-xs text-slate-500">{tx.instructions}</div><p className="mt-2 text-sm text-slate-300">{selectedTask.description}</p></div>
        <a href="https://sysstreamer.asia/login" className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-bold"><ExternalLink className="w-4 h-4"/> {tx.loginContinue}</a>
      </div>
    </div>}
  </div>;
}
