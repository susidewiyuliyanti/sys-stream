import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2, CircleDollarSign, Clock3, FileVideo,
  Link2, Menu, ShieldCheck, Trophy, Upload, WalletCards, X, Youtube
} from 'lucide-react';
import { SysLogo } from '../components/SysLogo';

type Lang = 'id'|'en'|'es'|'pt'|'zh'|'ja'|'ko'|'ar';
type TaskType = 'youtube'|'tiktok'|'instagram'|'twitter'|'facebook'|'telegram'|'discord'|'shorts'|'social'|'review'|'deposit'|'withdrawal'|'profile'|'checkin';
type TaskKey = 'checkin'|'tiktok'|'instagram'|'twitter'|'facebook'|'telegram'|'discord'|'shorts'|'youtube'|'review'|'social'|'deposit'|'withdrawal'|'profile';
type Task = { id:string; key:TaskKey; type:TaskType; reward:string; estimated:string; daily?:boolean; priority?:boolean; title?:string; desc?:string };

const TASKS: Task[] = [
  {id:'daily-checkin',key:'checkin',type:'checkin',reward:'program',estimated:'30 seconds',daily:true},
  {id:'tiktok-upload',key:'tiktok',type:'tiktok',reward:'program',estimated:'10–20 minutes',daily:true},
  {id:'instagram-reel',key:'instagram',type:'instagram',reward:'program',estimated:'10–20 minutes',daily:true},
  {id:'youtube-shorts',key:'shorts',type:'shorts',reward:'program',estimated:'10–20 minutes',daily:true},
  {id:'youtube-upload',key:'youtube',type:'youtube',reward:'program',estimated:'15–30 minutes',daily:true,priority:true},
  {id:'youtube-review',key:'review',type:'youtube',reward:'program',estimated:'5–10 minutes',daily:true},
  {id:'social-daily',key:'social',type:'social',reward:'program',estimated:'2–5 minutes',daily:true},
  {id:'twitter-post',key:'twitter',type:'twitter',reward:'program',estimated:'5–10 minutes',daily:true},
  {id:'facebook-post',key:'facebook',type:'facebook',reward:'program',estimated:'5–10 minutes',daily:true},
  {id:'telegram-share',key:'telegram',type:'telegram',reward:'program',estimated:'2–5 minutes',daily:true},
  {id:'discord-activity',key:'discord',type:'discord',reward:'program',estimated:'5–10 minutes',daily:true},
  {id:'deposit',key:'deposit',type:'deposit',reward:'program',estimated:'5 minutes'},
  {id:'withdrawal',key:'withdrawal',type:'withdrawal',reward:'program',estimated:'5 minutes'},
  {id:'profile',key:'profile',type:'profile',reward:'program',estimated:'2 minutes'}
];

const COPY: Record<Lang, Record<string,string>> = {
  id:{
    tasks:'Tugas', submissions:'Pengajuan Saya', login:'Masuk', wallet:'Alamat Wallet', walletPlaceholder:'Masukkan alamat wallet', saveWallet:'Simpan Wallet', walletRequired:'Alamat wallet wajib diisi untuk mengikuti task.', hero:'Tugas harian. Buat konten. Kirim bukti. Dapatkan reward airdrop.',
    intro:'Selesaikan tugas campaign di YouTube, TikTok, dan Instagram. Kirim link bukti publik dan ikuti aturan setiap tugas.',
    daily:'MISI HARIAN HARI INI', dailySub:'Tugas harian dapat berubah sesuai campaign aktif.', available:'Tugas Tersedia',
    empty:'Belum ada pengajuan', emptySub:'Pengajuan yang kamu kirim akan tampil di sini setelah wallet digunakan.', proofRequired:'Link bukti wajib diisi untuk task ini.',
    instructions:'Instruksi tugas', live:'LANGSUNG', leaderboard:'PAPAN PERINGKAT REFERRAL', top:'Top Referral — Live',
    leaderboardSub:'Peringkat diperbarui otomatis setiap 10 detik dari data referral produksi.',
    successful:'Referral berhasil', refs:'REF', connecting:'MENGHUBUNGKAN', unavailable:'Papan peringkat belum tersedia.',
    dailyMissions:'misi harian', proof:'Bukti diperlukan', reward:'Reward', priority:'PRIORITAS',
    review:'Tinjau sebelum reward', proofSubmission:'Kirim bukti', instructionsBadge:'Instruksi per tugas',
    footer:'Reward tugas mengikuti proses review dan aturan program.', loginContinue:'Masuk untuk melanjutkan',
    noDb:'Database referral belum tersedia.', configured:'Diatur oleh program',
    checkinTitle:'Check-in Harian', checkinDesc:'Buka Airdrop Center setiap hari dan lakukan check-in untuk menjaga streak dan mengikuti reward campaign.', checkinAction:'Check-in',
    tiktokTitle:'Upload ke TikTok', tiktokDesc:'Buat dan upload video original SYS STREAM ke TikTok, lalu kirim URL publik sebagai bukti.', tiktokAction:'Mulai Tugas TikTok',
    instagramTitle:'Posting Instagram Reel', instagramDesc:'Buat Reel original SYS STREAM dan publikasikan di Instagram. Kirim URL Reel publik sebagai bukti.', instagramAction:'Mulai Tugas Instagram',
    shortsTitle:'Upload YouTube Short', shortsDesc:'Buat video vertikal original tentang SYS STREAM dan publikasikan sebagai YouTube Short. Kirim URL publik sebagai bukti.', shortsAction:'Mulai Tugas Shorts',
    youtubeTitle:'Upload Video ke YouTube', youtubeDesc:'Buat video original tentang SYS STREAM, upload ke channel YouTube, lalu kirim URL video sebagai bukti.', youtubeAction:'Mulai Tugas YouTube',
    reviewTitle:'Tonton & Berikan Review Jujur', reviewDesc:'Tonton konten campaign dan berikan feedback yang jujur. Tidak ada kewajiban memberikan rating positif.', reviewAction:'Buka Tugas Review',
    socialTitle:'Tugas Sosial Harian', socialDesc:'Selesaikan aktivitas sosial pada brief campaign. Jangan gunakan akun palsu atau otomatisasi.', socialAction:'Lihat Tugas',
    depositTitle:'Selesaikan Deposit', depositDesc:'Lakukan deposit nyata melalui halaman resmi SYS STREAM. Reward diproses jika transaksi memenuhi aturan campaign.', depositAction:'Buka Deposit',
    withdrawalTitle:'Selesaikan Withdrawal', withdrawalDesc:'Ajukan withdrawal sesuai saldo dan aturan. Periksa alamat wallet dan network sebelum konfirmasi.', withdrawalAction:'Buka Withdrawal',
    profileTitle:'Lengkapi Profil', profileDesc:'Lengkapi informasi profil dasar agar akun siap mengikuti campaign dan proses reward.', profileAction:'Buka Profil'
  },
  en:{
    tasks:'Tasks', submissions:'My Submissions', login:'Login', wallet:'Wallet Address', walletPlaceholder:'Enter wallet address', saveWallet:'Save Wallet', walletRequired:'Wallet address is required to join a task.', hero:'Daily tasks. Create content. Submit proof. Earn airdrop rewards.',
    intro:'Complete campaign tasks across YouTube, TikTok, and Instagram. Submit public proof links and follow each task rule.',
    daily:"TODAY'S DAILY MISSIONS", dailySub:'Daily tasks may change based on the active campaign.', available:'Available Tasks',
    empty:'No submissions yet', emptySub:'Your submissions will appear here after a wallet is used.', proofRequired:'A proof link is required for this task.',
    instructions:'Task instructions', live:'LIVE', leaderboard:'REFERRAL LEADERBOARD', top:'Top Referrers — Live',
    leaderboardSub:'Ranking updates automatically every 10 seconds from production referral data.',
    successful:'Successful referrals', refs:'REFS', connecting:'CONNECTING', unavailable:'Leaderboard is not available.',
    dailyMissions:'daily missions', proof:'Proof required', reward:'Reward', priority:'PRIORITY',
    review:'Review before reward', proofSubmission:'Proof submission', instructionsBadge:'Task instructions',
    footer:'Task rewards are subject to review and program rules.', loginContinue:'Login to continue',
    noDb:'Referral database is not available.', configured:'Configured by program',
    checkinTitle:'Daily Check-in', checkinDesc:'Open the Airdrop Center each day and complete your check-in to keep your streak active for campaign rewards.', checkinAction:'Check In',
    tiktokTitle:'Upload to TikTok', tiktokDesc:'Create and upload an original SYS STREAM video to TikTok, then submit the public URL as proof.', tiktokAction:'Start TikTok Task',
    instagramTitle:'Post an Instagram Reel', instagramDesc:'Create an original SYS STREAM Reel and publish it on Instagram. Submit the public Reel URL as proof.', instagramAction:'Start Instagram Task',
    shortsTitle:'Upload a YouTube Short', shortsDesc:'Create an original vertical SYS STREAM video and publish it as a YouTube Short. Submit the public URL as proof.', shortsAction:'Start Shorts Task',
    youtubeTitle:'Upload Video to YouTube', youtubeDesc:'Create an original SYS STREAM video, upload it to your YouTube channel, then submit the video URL as proof.', youtubeAction:'Start YouTube Task',
    reviewTitle:'Watch & Honest Review', reviewDesc:'Watch campaign content and provide honest feedback. There is no requirement to give a positive rating.', reviewAction:'Open Review Task',
    socialTitle:'Daily Social Task', socialDesc:'Complete the social activity listed in the campaign brief. Do not use fake accounts or automation.', socialAction:'View Task',
    depositTitle:'Complete a Deposit', depositDesc:'Make a real deposit through the official SYS STREAM page. Rewards are processed only when campaign rules are met.', depositAction:'Open Deposit',
    withdrawalTitle:'Complete a Withdrawal', withdrawalDesc:'Request a withdrawal according to your balance and the rules. Check the wallet address and network before confirming.', withdrawalAction:'Open Withdrawal',
    profileTitle:'Complete Your Profile', profileDesc:'Complete your basic profile information so your account is ready for campaigns and rewards.', profileAction:'Open Profile'
  },
  es:{
    tasks:'Tareas', submissions:'Mis envíos', login:'Iniciar sesión', hero:'Tareas diarias. Crea contenido. Envía pruebas. Obtén recompensas de airdrop.',
    intro:'Completa tareas de campaña en YouTube, TikTok e Instagram. Envía enlaces públicos como prueba y sigue las reglas de cada tarea.',
    daily:'MISIONES DIARIAS DE HOY', dailySub:'Las tareas diarias pueden cambiar según la campaña activa.', available:'Tareas disponibles',
    empty:'Aún no hay envíos', emptySub:'Tus envíos aparecerán aquí cuando conectes tu cuenta.', instructions:'Instrucciones', live:'EN VIVO',
    leaderboard:'CLASIFICACIÓN DE REFERIDOS', top:'Principales referidos — En vivo', leaderboardSub:'La clasificación se actualiza cada 10 segundos con datos de producción.',
    successful:'Referidos exitosos', refs:'REF', connecting:'CONECTANDO', unavailable:'La clasificación no está disponible.',
    dailyMissions:'misiones diarias', proof:'Prueba requerida', reward:'Recompensa', priority:'PRIORIDAD',
    review:'Revisión antes de la recompensa', proofSubmission:'Envío de prueba', instructionsBadge:'Instrucciones de la tarea',
    footer:'Las recompensas están sujetas a revisión y a las reglas del programa.', loginContinue:'Iniciar sesión para continuar',
    noDb:'La base de datos de referidos no está disponible.', configured:'Configurado por el programa',
    checkinTitle:'Check-in diario', checkinDesc:'Abre Airdrop Center cada día y completa el check-in para mantener tu racha.', checkinAction:'Hacer check-in',
    tiktokTitle:'Subir a TikTok', tiktokDesc:'Crea y sube un video original de SYS STREAM a TikTok y envía la URL pública como prueba.', tiktokAction:'Iniciar tarea de TikTok',
    instagramTitle:'Publicar un Reel de Instagram', instagramDesc:'Crea un Reel original de SYS STREAM y publícalo en Instagram. Envía la URL pública como prueba.', instagramAction:'Iniciar tarea de Instagram',
    shortsTitle:'Subir un YouTube Short', shortsDesc:'Crea un video vertical original de SYS STREAM y publícalo como YouTube Short. Envía la URL pública.', shortsAction:'Iniciar tarea de Shorts',
    youtubeTitle:'Subir video a YouTube', youtubeDesc:'Crea un video original de SYS STREAM, súbelo a YouTube y envía la URL como prueba.', youtubeAction:'Iniciar tarea de YouTube',
    reviewTitle:'Ver y dar una opinión honesta', reviewDesc:'Mira el contenido de la campaña y proporciona comentarios honestos. No se exige una valoración positiva.', reviewAction:'Abrir tarea de reseña',
    socialTitle:'Tarea social diaria', socialDesc:'Completa la actividad social indicada en el brief. No uses cuentas falsas ni automatización.', socialAction:'Ver tarea',
    depositTitle:'Completar un depósito', depositDesc:'Realiza un depósito real desde la página oficial de SYS STREAM. La recompensa depende de las reglas.', depositAction:'Abrir depósito',
    withdrawalTitle:'Completar un retiro', withdrawalDesc:'Solicita un retiro según tu saldo y las reglas. Comprueba la wallet y la red antes de confirmar.', withdrawalAction:'Abrir retiro',
    profileTitle:'Completar tu perfil', profileDesc:'Completa la información básica de tu perfil para participar en campañas y recompensas.', profileAction:'Abrir perfil'
  },
  pt:{
    tasks:'Tarefas', submissions:'Meus envios', login:'Entrar', hero:'Tarefas diárias. Crie conteúdo. Envie provas. Ganhe recompensas de airdrop.',
    intro:'Conclua tarefas de campanha no YouTube, TikTok e Instagram. Envie links públicos como prova e siga as regras de cada tarefa.',
    daily:'MISSÕES DIÁRIAS DE HOJE', dailySub:'As tarefas diárias podem mudar conforme a campanha ativa.', available:'Tarefas disponíveis',
    empty:'Nenhum envio ainda', emptySub:'Seus envios aparecerão aqui depois que sua conta estiver conectada.', instructions:'Instruções da tarefa', live:'AO VIVO',
    leaderboard:'RANKING DE INDICAÇÕES', top:'Principais indicados — Ao vivo', leaderboardSub:'O ranking é atualizado a cada 10 segundos com dados de produção.',
    successful:'Indicações bem-sucedidas', refs:'REF', connecting:'CONECTANDO', unavailable:'Ranking indisponível.',
    dailyMissions:'missões diárias', proof:'Prova obrigatória', reward:'Recompensa', priority:'PRIORIDADE',
    review:'Revisão antes da recompensa', proofSubmission:'Envio de prova', instructionsBadge:'Instruções da tarefa',
    footer:'As recompensas estão sujeitas à revisão e às regras do programa.', loginContinue:'Entrar para continuar',
    noDb:'Banco de indicações indisponível.', configured:'Definido pelo programa',
    checkinTitle:'Check-in diário', checkinDesc:'Abra o Airdrop Center todos os dias e faça o check-in para manter sua sequência.', checkinAction:'Fazer check-in',
    tiktokTitle:'Enviar para o TikTok', tiktokDesc:'Crie e envie um vídeo original do SYS STREAM ao TikTok e informe a URL pública como prova.', tiktokAction:'Iniciar tarefa do TikTok',
    instagramTitle:'Publicar Reel no Instagram', instagramDesc:'Crie um Reel original do SYS STREAM e publique no Instagram. Envie a URL pública como prova.', instagramAction:'Iniciar tarefa do Instagram',
    shortsTitle:'Enviar YouTube Short', shortsDesc:'Crie um vídeo vertical original do SYS STREAM e publique como YouTube Short. Envie a URL pública.', shortsAction:'Iniciar tarefa de Shorts',
    youtubeTitle:'Enviar vídeo ao YouTube', youtubeDesc:'Crie um vídeo original do SYS STREAM, envie ao YouTube e informe a URL como prova.', youtubeAction:'Iniciar tarefa do YouTube',
    reviewTitle:'Assistir e avaliar com honestidade', reviewDesc:'Assista ao conteúdo da campanha e dê feedback honesto. Não é necessário dar avaliação positiva.', reviewAction:'Abrir tarefa de avaliação',
    socialTitle:'Tarefa social diária', socialDesc:'Conclua a atividade social indicada no briefing. Não use contas falsas ou automação.', socialAction:'Ver tarefa',
    depositTitle:'Concluir um depósito', depositDesc:'Faça um depósito real pela página oficial do SYS STREAM. A recompensa depende das regras da campanha.', depositAction:'Abrir depósito',
    withdrawalTitle:'Concluir um saque', withdrawalDesc:'Solicite um saque conforme seu saldo e as regras. Verifique a carteira e a rede antes de confirmar.', withdrawalAction:'Abrir saque',
    profileTitle:'Completar seu perfil', profileDesc:'Complete as informações básicas do perfil para participar de campanhas e receber recompensas.', profileAction:'Abrir perfil'
  },
  zh:{
    tasks:'任务', submissions:'我的提交', login:'登录', hero:'每日任务。创建内容。提交证明。获得空投奖励。',
    intro:'完成 YouTube、TikTok 和 Instagram 活动任务，提交公开证明链接并遵守任务规则。',
    daily:'今日每日任务', dailySub:'每日任务可能根据当前活动调整。', available:'可用任务',
    empty:'暂无提交', emptySub:'连接账户后，你的提交记录会显示在这里。', instructions:'任务说明', live:'直播',
    leaderboard:'推荐排行榜', top:'推荐人数排名 — 实时', leaderboardSub:'排行榜每 10 秒从生产环境推荐数据自动更新。',
    successful:'成功推荐', refs:'推荐', connecting:'连接中', unavailable:'排行榜暂不可用。',
    dailyMissions:'每日任务', proof:'需要证明', reward:'奖励', priority:'优先',
    review:'奖励前审核', proofSubmission:'提交证明', instructionsBadge:'任务说明',
    footer:'任务奖励需经过审核并遵守活动规则。', loginContinue:'登录后继续', noDb:'推荐数据库暂不可用。', configured:'由活动设置',
    checkinTitle:'每日签到', checkinDesc:'每天打开 Airdrop Center 并完成签到，以保持连续签到并参与活动奖励。', checkinAction:'签到',
    tiktokTitle:'上传到 TikTok', tiktokDesc:'创建并上传原创 SYS STREAM 视频到 TikTok，然后提交公开视频链接作为证明。', tiktokAction:'开始 TikTok 任务',
    instagramTitle:'发布 Instagram Reels', instagramDesc:'创建原创 SYS STREAM Reel 并发布到 Instagram，然后提交公开链接。', instagramAction:'开始 Instagram 任务',
    shortsTitle:'上传 YouTube Short', shortsDesc:'创建原创 SYS STREAM 竖屏视频并发布为 YouTube Short，然后提交公开链接。', shortsAction:'开始 Shorts 任务',
    youtubeTitle:'上传 YouTube 视频', youtubeDesc:'创建原创 SYS STREAM 视频并上传到 YouTube，然后提交视频链接作为证明。', youtubeAction:'开始 YouTube 任务',
    reviewTitle:'观看并诚实评价', reviewDesc:'观看活动内容并提供真实反馈，不要求给出正面评价。', reviewAction:'打开评价任务',
    socialTitle:'每日社交任务', socialDesc:'完成活动说明中的社交任务，不得使用虚假账号或自动化工具。', socialAction:'查看任务',
    depositTitle:'完成充值', depositDesc:'通过 SYS STREAM 官方页面进行真实充值。奖励仅在符合活动规则时处理。', depositAction:'打开充值',
    withdrawalTitle:'完成提现', withdrawalDesc:'根据余额和规则申请提现。确认前请检查钱包地址和网络。', withdrawalAction:'打开提现',
    profileTitle:'完善个人资料', profileDesc:'完善基本资料，让账户可以参与活动并处理奖励。', profileAction:'打开资料'
  },
  ja:{
    tasks:'タスク', submissions:'提出履歴', login:'ログイン', hero:'毎日のタスク。コンテンツを作成。証拠を提出。エアドロップ報酬を獲得。',
    intro:'YouTube、TikTok、Instagram のキャンペーンタスクを完了し、公開証拠リンクを提出してください。',
    daily:'本日のデイリーミッション', dailySub:'デイリータスクは開催中のキャンペーンにより変わる場合があります。', available:'利用可能なタスク',
    empty:'提出はまだありません', emptySub:'アカウント接続後、提出内容がここに表示されます。', instructions:'タスク説明', live:'ライブ',
    leaderboard:'紹介ランキング', top:'紹介者ランキング — ライブ', leaderboardSub:'本番の紹介データから10秒ごとに更新されます。',
    successful:'成功した紹介', refs:'紹介', connecting:'接続中', unavailable:'ランキングを利用できません。',
    dailyMissions:'デイリーミッション', proof:'証拠が必要', reward:'報酬', priority:'優先',
    review:'報酬前に審査', proofSubmission:'証拠を提出', instructionsBadge:'タスク説明',
    footer:'報酬は審査およびプログラム規則の対象です。', loginContinue:'ログインして続行', noDb:'紹介データベースを利用できません。', configured:'プログラム設定',
    checkinTitle:'デイリーチェックイン', checkinDesc:'毎日 Airdrop Center を開いてチェックインし、連続記録を維持してください。', checkinAction:'チェックイン',
    tiktokTitle:'TikTok にアップロード', tiktokDesc:'SYS STREAM のオリジナル動画を TikTok に投稿し、公開 URL を証拠として提出します。', tiktokAction:'TikTok タスク開始',
    instagramTitle:'Instagram Reel を投稿', instagramDesc:'SYS STREAM のオリジナル Reel を Instagram に公開し、URL を提出します。', instagramAction:'Instagram タスク開始',
    shortsTitle:'YouTube Short をアップロード', shortsDesc:'SYS STREAM のオリジナル縦動画を YouTube Short として公開し、URL を提出します。', shortsAction:'Shorts タスク開始',
    youtubeTitle:'YouTube に動画をアップロード', youtubeDesc:'SYS STREAM のオリジナル動画を YouTube に投稿し、URL を証拠として提出します。', youtubeAction:'YouTube タスク開始',
    reviewTitle:'視聴して正直なレビュー', reviewDesc:'キャンペーン内容を視聴して正直なフィードバックを提供します。高評価を求めるものではありません。', reviewAction:'レビュータスクを開く',
    socialTitle:'デイリーソーシャルタスク', socialDesc:'キャンペーン概要に記載された活動を行います。偽アカウントや自動化は禁止です。', socialAction:'タスクを見る',
    depositTitle:'入金を完了', depositDesc:'SYS STREAM 公式ページから実際に入金します。報酬はキャンペーン条件を満たした場合に処理されます。', depositAction:'入金を開く',
    withdrawalTitle:'出金を完了', withdrawalDesc:'残高とルールに従って出金を申請します。確認前にウォレットとネットワークを確認してください。', withdrawalAction:'出金を開く',
    profileTitle:'プロフィールを完成', profileDesc:'基本プロフィールを完成させ、キャンペーンと報酬に参加できる状態にします。', profileAction:'プロフィールを開く'
  },
  ko:{
    tasks:'작업', submissions:'내 제출', login:'로그인', hero:'매일의 작업. 콘텐츠를 만들고 증빙을 제출하여 에어드롭 보상을 받으세요.',
    intro:'YouTube, TikTok, Instagram 캠페인 작업을 완료하고 공개 증빙 링크를 제출하세요.', daily:'오늘의 일일 미션',
    dailySub:'일일 작업은 진행 중인 캠페인에 따라 변경될 수 있습니다.', available:'가능한 작업', empty:'제출 내역이 없습니다',
    emptySub:'계정이 연결되면 제출 내역이 여기에 표시됩니다.', instructions:'작업 안내', live:'라이브',
    leaderboard:'추천인 순위', top:'추천인 TOP — 실시간', leaderboardSub:'프로덕션 추천 데이터에서 10초마다 업데이트됩니다.',
    successful:'성공한 추천', refs:'추천', connecting:'연결 중', unavailable:'순위를 사용할 수 없습니다.',
    dailyMissions:'일일 미션', proof:'증빙 필요', reward:'보상', priority:'우선',
    review:'보상 전 검토', proofSubmission:'증빙 제출', instructionsBadge:'작업 안내',
    footer:'작업 보상은 검토 및 프로그램 규칙의 적용을 받습니다.', loginContinue:'로그인하여 계속', noDb:'추천 데이터베이스를 사용할 수 없습니다.', configured:'프로그램 설정',
    checkinTitle:'일일 체크인', checkinDesc:'매일 Airdrop Center를 열고 체크인하여 연속 기록을 유지하세요.', checkinAction:'체크인',
    tiktokTitle:'TikTok 업로드', tiktokDesc:'SYS STREAM 오리지널 영상을 TikTok에 업로드하고 공개 URL을 증빙으로 제출하세요.', tiktokAction:'TikTok 작업 시작',
    instagramTitle:'Instagram Reel 게시', instagramDesc:'SYS STREAM 오리지널 Reel을 Instagram에 게시하고 공개 URL을 제출하세요.', instagramAction:'Instagram 작업 시작',
    shortsTitle:'YouTube Short 업로드', shortsDesc:'SYS STREAM 오리지널 세로 영상을 YouTube Short로 게시하고 URL을 제출하세요.', shortsAction:'Shorts 작업 시작',
    youtubeTitle:'YouTube 영상 업로드', youtubeDesc:'SYS STREAM 오리지널 영상을 YouTube에 업로드하고 영상 URL을 증빙으로 제출하세요.', youtubeAction:'YouTube 작업 시작',
    reviewTitle:'시청 및 정직한 리뷰', reviewDesc:'캠페인 콘텐츠를 시청하고 솔직한 피드백을 남깁니다. 긍정적인 평가를 요구하지 않습니다.', reviewAction:'리뷰 작업 열기',
    socialTitle:'일일 소셜 작업', socialDesc:'캠페인 안내에 있는 소셜 활동을 완료하세요. 가짜 계정이나 자동화는 사용하지 마세요.', socialAction:'작업 보기',
    depositTitle:'입금 완료', depositDesc:'SYS STREAM 공식 페이지에서 실제 입금을 진행하세요. 캠페인 조건을 충족할 때만 보상이 처리됩니다.', depositAction:'입금 열기',
    withdrawalTitle:'출금 완료', withdrawalDesc:'잔액과 규칙에 따라 출금을 신청하세요. 확인 전에 지갑 주소와 네트워크를 확인하세요.', withdrawalAction:'출금 열기',
    profileTitle:'프로필 완성', profileDesc:'기본 프로필 정보를 입력하여 캠페인과 보상에 참여할 수 있게 하세요.', profileAction:'프로필 열기'
  },
  ar:{
    tasks:'المهام', submissions:'طلباتي', login:'تسجيل الدخول', hero:'مهام يومية. أنشئ المحتوى. أرسل الإثبات. احصل على مكافآت الإيردروب.',
    intro:'أكمل مهام الحملات على YouTube وTikTok وInstagram وأرسل روابط عامة كإثبات مع الالتزام بالقواعد.',
    daily:'المهام اليومية اليوم', dailySub:'قد تتغير المهام اليومية حسب الحملة النشطة.', available:'المهام المتاحة',
    empty:'لا توجد طلبات بعد', emptySub:'ستظهر طلباتك هنا بعد ربط حسابك.', instructions:'تعليمات المهمة', live:'مباشر',
    leaderboard:'ترتيب الإحالات', top:'أفضل المحيلين — مباشر', leaderboardSub:'يتم تحديث الترتيب كل 10 ثوانٍ من بيانات الإحالات في الإنتاج.',
    successful:'إحالات ناجحة', refs:'إحالة', connecting:'جارٍ الاتصال', unavailable:'الترتيب غير متاح.',
    dailyMissions:'مهام يومية', proof:'الإثبات مطلوب', reward:'المكافأة', priority:'أولوية',
    review:'مراجعة قبل المكافأة', proofSubmission:'إرسال الإثبات', instructionsBadge:'تعليمات المهمة',
    footer:'تخضع مكافآت المهام للمراجعة وقواعد البرنامج.', loginContinue:'تسجيل الدخول للمتابعة', noDb:'قاعدة بيانات الإحالات غير متاحة.', configured:'محدد بواسطة البرنامج',
    checkinTitle:'تسجيل الحضور اليومي', checkinDesc:'افتح Airdrop Center يومياً وأكمل تسجيل الحضور للحفاظ على سلسلة الحضور.', checkinAction:'تسجيل الحضور',
    tiktokTitle:'رفع إلى TikTok', tiktokDesc:'أنشئ فيديو أصلياً لـ SYS STREAM وارفعه إلى TikTok ثم أرسل الرابط العام كإثبات.', tiktokAction:'بدء مهمة TikTok',
    instagramTitle:'نشر Instagram Reel', instagramDesc:'أنشئ Reel أصلياً لـ SYS STREAM وانشره على Instagram ثم أرسل الرابط العام.', instagramAction:'بدء مهمة Instagram',
    shortsTitle:'رفع YouTube Short', shortsDesc:'أنشئ فيديو عمودياً أصلياً لـ SYS STREAM وانشره كـ YouTube Short ثم أرسل الرابط.', shortsAction:'بدء مهمة Shorts',
    youtubeTitle:'رفع فيديو إلى YouTube', youtubeDesc:'أنشئ فيديو أصلياً لـ SYS STREAM وارفعه إلى YouTube ثم أرسل الرابط كإثبات.', youtubeAction:'بدء مهمة YouTube',
    reviewTitle:'مشاهدة ومراجعة صادقة', reviewDesc:'شاهد محتوى الحملة وقدم ملاحظات صادقة. لا يُطلب منك تقديم تقييم إيجابي.', reviewAction:'فتح مهمة المراجعة',
    socialTitle:'مهمة اجتماعية يومية', socialDesc:'أكمل النشاط الاجتماعي الوارد في موجز الحملة. لا تستخدم حسابات وهمية أو أتمتة.', socialAction:'عرض المهمة',
    depositTitle:'إكمال الإيداع', depositDesc:'قم بإيداع حقيقي عبر صفحة SYS STREAM الرسمية. تتم معالجة المكافأة عند استيفاء قواعد الحملة.', depositAction:'فتح الإيداع',
    withdrawalTitle:'إكمال السحب', withdrawalDesc:'اطلب السحب وفقاً لرصيدك والقواعد. تحقق من عنوان المحفظة والشبكة قبل التأكيد.', withdrawalAction:'فتح السحب',
    profileTitle:'إكمال الملف الشخصي', profileDesc:'أكمل معلومات ملفك الأساسية ليصبح الحساب جاهزاً للحملات والمكافآت.', profileAction:'فتح الملف الشخصي'
  }
};

const TASK_TEXT: Record<TaskKey,{title:string;desc:string;action:string}> = {
  checkin:{title:'checkinTitle',desc:'checkinDesc',action:'checkinAction'},
  tiktok:{title:'tiktokTitle',desc:'tiktokDesc',action:'tiktokAction'},
  instagram:{title:'instagramTitle',desc:'instagramDesc',action:'instagramAction'},
  shorts:{title:'shortsTitle',desc:'shortsDesc',action:'shortsAction'},
  youtube:{title:'youtubeTitle',desc:'youtubeDesc',action:'youtubeAction'},
  review:{title:'reviewTitle',desc:'reviewDesc',action:'reviewAction'},
  social:{title:'socialTitle',desc:'socialDesc',action:'socialAction'},
  deposit:{title:'depositTitle',desc:'depositDesc',action:'depositAction'},
  withdrawal:{title:'withdrawalTitle',desc:'withdrawalDesc',action:'withdrawalAction'},
  profile:{title:'profileTitle',desc:'profileDesc',action:'profileAction'}
};

function typeIcon(type:TaskType) {
  if(type==='youtube'||type==='shorts') return <Youtube className="w-5 h-5"/>;
  if(type==='tiktok') return <span className="text-sm font-black">♪</span>;
  if(type==='instagram') return <span className="text-sm font-black">◎</span>;
  if(type==='twitter') return <span className="text-sm font-black">𝕏</span>;
  if(type==='facebook') return <span className="text-sm font-black">f</span>;
  if(type==='telegram') return <span className="text-sm font-black">✈</span>;
  if(type==='discord') return <span className="text-sm font-black">◈</span>;
  if(type==='checkin') return <Clock3 className="w-5 h-5"/>;
  if(type==='deposit') return <CircleDollarSign className="w-5 h-5"/>;
  if(type==='withdrawal') return <WalletCards className="w-5 h-5"/>;
  if(type==='profile') return <CheckCircle2 className="w-5 h-5"/>;
  return <Link2 className="w-5 h-5"/>;
}
function typeLabel(type:TaskType,tx:Record<string,string>) {
  const map:Record<TaskType,string>={review:'REVIEW',youtube:'YOUTUBE',shorts:'YOUTUBE SHORTS',tiktok:'TIKTOK',instagram:'INSTAGRAM',twitter:'X / TWITTER',facebook:'FACEBOOK',telegram:'TELEGRAM',discord:'DISCORD',checkin:'CHECK-IN',social:'SOCIAL',deposit:'DEPOSIT',withdrawal:'WITHDRAWAL',profile:'PROFILE'};
  return map[type]||'SOCIAL';
}

function statusLabel(status:string,tx:Record<string,string>) {
  const key=status.toLowerCase();
  const map:Record<string,string|undefined>={pending:tx.pending,approved:tx.approved,rejected:tx.rejected,paid:tx.paid};
  return map[key]||status;
}

export default function AirdropApp() {
  const [selectedTask,setSelectedTask]=useState<Task|null>(null);
  const [dbTasks,setDbTasks]=useState<any[]>([]);
  const [tasksLoading,setTasksLoading]=useState(true);
  const [walletAddress,setWalletAddress]=useState('');
  const [proofLink,setProofLink]=useState('');
  const [submissions,setSubmissions]=useState<Array<{id:number;task_id:number|string;task_title?:string;evidence_link:string;status:string;reward_points:number;created_at:string}>>([]);
  const [checkinMonth,setCheckinMonth]=useState<string>(()=>new Date().toISOString().slice(0,7));
  const [submissionLoading,setSubmissionLoading]=useState(false);
  const [submissionMessage,setSubmissionMessage]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const [tab,setTab]=useState<'tasks'|'submissions'>('tasks');
  const [taskCategory,setTaskCategory]=useState<'all'|'youtube'|'social'|'checkin'>('all');
  const [points,setPoints]=useState({approved:0,pending:0,paid:0,available:0});
  const [conversionPoints,setConversionPoints]=useState('');
  const [conversionMessage,setConversionMessage]=useState('');
  const [conversionLoading,setConversionLoading]=useState(false);
  const [leaders,setLeaders]=useState<Array<{rank:number;username:string;referrals:number}>>([]);
  const [leaderboardUpdated,setLeaderboardUpdated]=useState<number|null>(null);
  const [leaderboardError,setLeaderboardError]=useState('');
  const [lang,setLang]=useState<Lang>(() => {
    if(typeof window==='undefined') return 'id';
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('lang') as Lang|null;
    const saved=localStorage.getItem('sys_stream_language') as Lang|null;
    const browser = (navigator.language || 'id').toLowerCase();
    const detected: Lang = browser.startsWith('id') ? 'id'
      : browser.startsWith('es') ? 'es'
      : browser.startsWith('pt') ? 'pt'
      : browser.startsWith('zh') ? 'zh'
      : browser.startsWith('ja') ? 'ja'
      : browser.startsWith('ko') ? 'ko'
      : browser.startsWith('ar') ? 'ar'
      : 'en';
    const next = fromUrl && COPY[fromUrl] ? fromUrl
      : saved && COPY[saved] ? saved
      : detected;
    if (fromUrl && COPY[fromUrl]) localStorage.setItem('sys_stream_language', fromUrl);
    return next;
  });
  const tx=COPY[lang];

  useEffect(() => {
    let active = true;

    const loadAuthenticatedWallet = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const handoff = String(params.get('handoff') || '').trim();

        // Airdrop lives on a different origin. Exchange the short-lived
        // handoff code first so this origin receives its own auth cookie.
        if (handoff) {
          const exchange = await fetch('/api/auth/airdrop-exchange', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify({ code: handoff }),
          });
          const exchangeData = await exchange.json().catch(() => ({}));

          // Never keep a one-time handoff code in the URL after exchange.
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('handoff');
          window.history.replaceState({}, document.title, cleanUrl.toString());

          if (!exchange.ok || !exchangeData?.success) {
            throw new Error(exchangeData?.error || 'Airdrop handoff failed');
          }
        }

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        const wallet = String(data?.user?.walletAddress || '').trim().toLowerCase();

        if (active) {
          setWalletAddress(data?.success && wallet ? wallet : '');
          if (data?.success && wallet) {
            localStorage.setItem('sys_stream_airdrop_wallet', wallet);
          }
        }
      } catch {
        if (active) setWalletAddress('');
      }
    };

    void loadAuthenticatedWallet();
    return () => { active = false; };
  }, []);

  useEffect(()=>{ document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr'; },[lang]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedWallet = localStorage.getItem('sys_stream_airdrop_wallet') || '';
    if (savedWallet) setWalletAddress(savedWallet);
  }, []);


  useEffect(()=>{ setProofLink(''); setSubmissionMessage(''); },[selectedTask]);

  useEffect(()=>{
    let active=true;
    const loadTasks=async()=>{
      setTasksLoading(true);
      try{
        const res=await fetch('/api/airdrop/tasks',{cache:'no-store'});
        const data=await res.json().catch(()=>({}));
        if(active) setDbTasks(res.ok&&data.success&&Array.isArray(data.tasks)?data.tasks:[]);
      }catch{ if(active) setDbTasks([]); }
      finally{ if(active) setTasksLoading(false); }
    };
    loadTasks();
    const timer=window.setInterval(loadTasks,30000);
    return()=>{active=false;window.clearInterval(timer);};
  },[]);

  useEffect(()=>{
    let active=true;
    const loadSubmissions=async()=>{
      if(!walletAddress.trim()){if(active)setSubmissions([]);return;}
      try{
        const res=await fetch('/api/airdrop/submissions',{credentials:'include',cache:'no-store'});
        const data=await res.json().catch(()=>({}));
        if(active){
          setSubmissions(Array.isArray(data.submissions)?data.submissions:[]);
          if(data.points) setPoints({
            approved:Number(data.points.approved||0),
            pending:Number(data.points.pending||0),
            paid:Number(data.points.paid||0),
            available:Number(data.points.available||0)
          });
        }
      }catch{if(active)setSubmissions([]);}
    };
    loadSubmissions(); return()=>{active=false;};
  },[walletAddress]);

  const submitTask=async()=>{
    const wallet=walletAddress.trim(); if(!selectedTask||!wallet)return;
    if(selectedTask.type!=='checkin'&&!proofLink.trim()){setSubmissionMessage(tx.proofRequired||COPY.en.proofRequired||'Proof link is required.');return;}
    setSubmissionLoading(true);setSubmissionMessage('');
    try{
      const res=await fetch('/api/airdrop/submit',{
        method:'POST',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({taskKey:selectedTask.key,taskId:selectedTask.id,link:proofLink.trim()||'CHECKIN'})
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data.success)throw new Error(data.message||data.error||'Submission failed');
      setSelectedTask(null);
      setTab('submissions');
      const refreshed=await fetch('/api/airdrop/submissions',{credentials:'include',cache:'no-store'});
      const next=await refreshed.json().catch(()=>({}));
      setSubmissions(Array.isArray(next.submissions)?next.submissions:[]);
    }catch(e){setSubmissionMessage(e instanceof Error?e.message:'Submission failed');}
    finally{setSubmissionLoading(false);}
  };

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      try{
        const res=await fetch('/api/airdrop/referral-leaderboard',{cache:'no-store'});
        const data=await res.json().catch(()=>({}));
        if(!res.ok || !data.success) throw new Error(data.error || tx.unavailable);
        if(active){setLeaders(Array.isArray(data.leaderboard)?data.leaderboard:[]);setLeaderboardUpdated(Number(data.updatedAt||Date.now()/1000));setLeaderboardError('');}
      }catch(e){if(active)setLeaderboardError(e instanceof Error?e.message:tx.unavailable);}
    };
    load();
    const timer=window.setInterval(load,10000);
    return()=>{active=false;window.clearInterval(timer);};
  },[lang,tx.unavailable]);

  const availableTasks=useMemo<Task[]>(()=>{
    const configured=dbTasks.map((raw:any,index:number)=>{
      const category=String(raw.category||raw.type||'social').toLowerCase();
      const type:TaskType=(['youtube','tiktok','instagram','twitter','facebook','telegram','discord','shorts','social','review','deposit','withdrawal','profile','checkin'] as string[]).includes(category)?category as TaskType:'social';
      const key:TaskKey=type==='youtube'?'youtube':type as TaskKey;
      return {
        id:String(raw.id??`db-${index}`),
        key,
        type,
        reward:raw.reward!==undefined?String(raw.reward):String(raw.reward_points??'program'),
        estimated:String(raw.estimated||''),
        daily:Boolean(raw.daily),
        priority:Boolean(raw.priority),
        title:String(raw.title||'').trim(),
        desc:String(raw.description||raw.desc||'').trim()
      };
    });

    // TASKS is the complete campaign catalog. Database records override a
    // catalog item when the same task type exists, while missing categories
    // remain visible so users can see every supported task.
    const configuredTypes=new Set(configured.map(t=>t.type));
    const catalog=TASKS.filter(t=>!configuredTypes.has(t.type));
    return [...configured,...catalog];
  },[dbTasks]);
  const taskText=(task:Task)=>{if(task.title||task.desc)return {title:task.title||TASK_TEXT[task.key]?.title||tx.task,desc:task.desc||'',action:TASK_TEXT[task.key]?.action?tx[TASK_TEXT[task.key].action]:tx.openTask};const x=TASK_TEXT[task.key];return {title:tx[x.title],desc:tx[x.desc],action:tx[x.action]};};

  return <div className="min-h-screen bg-slate-950 text-slate-100">
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
        <a href="https://sysstreamer.asia"><SysLogo size="md" showText/></a>
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <select value={lang} onChange={e=>{const next=e.target.value as Lang;setLang(next);localStorage.setItem('sys_stream_language',next)}} className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs font-bold">
            {Object.entries({id:'ID',en:'EN',es:'ES',pt:'PT',zh:'中文',ja:'日本語',ko:'한국어',ar:'العربية'}).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={()=>setTab('tasks')} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900">{tx.tasks}</button>
          <button onClick={()=>setTab('submissions')} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900">{tx.submissions}</button>
        </nav>
        <button className="md:hidden p-2 rounded-lg" onClick={()=>setMenuOpen(v=>!v)} aria-label={tx.menu || "Menu"}>{menuOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
      </div>
      {menuOpen&&<div className="md:hidden border-t border-slate-800 px-4 py-3 space-y-2">
        <select value={lang} onChange={e=>{const next=e.target.value as Lang;setLang(next);localStorage.setItem('sys_stream_language',next)}} className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs font-bold">
          {Object.entries({id:'Bahasa Indonesia',en:'English',es:'Español',pt:'Português',zh:'中文',ja:'日本語',ko:'한국어',ar:'العربية'}).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={()=>{setTab('tasks');setMenuOpen(false)}} className="block w-full text-left px-3 py-2">{tx.tasks}</button>
        <button onClick={()=>{setTab('submissions');setMenuOpen(false)}} className="block w-full text-left px-3 py-2">{tx.submissions}</button>
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
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ {tx.instructionsBadge}</span>
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ {tx.proofSubmission}</span>
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ {tx.review}</span>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-amber-400"><Trophy className="w-4 h-4"/> {tx.leaderboard}</div>
            <h2 className="mt-1 text-xl font-black">{tx.top}</h2>
            <p className="mt-1 text-xs text-slate-500">{tx.leaderboardSub}</p>
          </div>
          <div className="text-right text-[10px] text-slate-500">{leaderboardUpdated ? tx.live : tx.connecting}</div>
        </div>
        {leaderboardError ? <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">{tx.unavailable} {tx.noDb}</div> :
          <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {leaders.map((leader,i)=>
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
          <div className="text-xs text-slate-400">{Math.min(availableTasks.length,3)} {tx.dailyMissions}</div>
        </div>
        <div className="mt-5 grid md:grid-cols-3 gap-3">
          {availableTasks.slice(0,3).map(t=>{const x=taskText(t);return <button key={t.id} onClick={()=>setSelectedTask(t)} className="text-left rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-amber-500/40">
            <div className="flex items-center justify-between"><span className="text-amber-400">{typeIcon(t.type)}</span>{t.priority&&<span className="text-[9px] font-black text-amber-300 bg-amber-400/10 px-2 py-1 rounded-full">{tx.priority}</span>}</div>
            <div className="mt-3 font-bold text-sm">{x.title}</div><div className="mt-1 text-xs text-slate-500">{t.estimated} · {tx.proof}</div>
          </button>})}
        </div>
      </section>

      {(() => {
        const checkinTask = availableTasks.find(t => t.type === 'checkin');
        if (!checkinTask) return null;
        const [year, month] = checkinMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const checkins = new Map<number, {status:string;points:number}>();
        submissions.filter(s => String(s.task_id) === String(checkinTask.id)).forEach(s => {
          const d = new Date(s.created_at);
          if (d.getFullYear() === year && d.getMonth()+1 === month) checkins.set(d.getDate(), {status:s.status,points:Number(s.reward_points||0)});
        });
        return <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs font-black tracking-wider text-amber-400">DAILY CHECK-IN</div>
              <h2 className="mt-1 text-xl font-black">{taskText(checkinTask).title}</h2>
              <p className="mt-1 text-xs text-slate-500">Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.</p>
            </div>
            <input type="month" value={checkinMonth} onChange={e=>setCheckinMonth(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr><th className="text-left px-4 py-3">Tanggal</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Points</th><th className="text-right px-4 py-3">Aksi</th></tr>
              </thead>
              <tbody>
                {Array.from({length:daysInMonth},(_,i)=>{
                  const day=i+1, item=checkins.get(day), isToday=checkinMonth===new Date().toISOString().slice(0,7)&&day===new Date().getDate();
                  return <tr key={day} className="border-t border-slate-800">
                    <td className="px-4 py-3 font-semibold">{String(day).padStart(2,'0')}-{String(month).padStart(2,'0')}-{year}{isToday?<span className="ml-2 text-[10px] text-amber-400">TODAY</span>:null}</td>
                    <td className="px-4 py-3">{item?<span className="text-emerald-400 font-bold">{item.status} </span>:<span className="text-slate-500">Belum check-in</span>}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{item?item.points:0} pts</td>
                    <td className="px-4 py-3 text-right">{isToday&&!item?<button onClick={()=>setSelectedTask(checkinTask)} className="px-3 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs">Check-in</button>:<span className="text-slate-600">—</span>}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>;
      })()}

      <section className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <div className="text-xs font-black tracking-wider text-amber-400">AIRDROP POINTS</div>
            <h2 className="mt-1 text-xl font-black">Points → SYS</h2>
            <p className="mt-1 text-xs text-slate-500">Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3"><div className="text-[10px] text-slate-500">Available</div><div className="font-black text-amber-400">{points.available}</div></div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3"><div className="text-[10px] text-slate-500">Pending</div><div className="font-black">{points.pending}</div></div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3"><div className="text-[10px] text-slate-500">Converted</div><div className="font-black">{points.paid}</div></div>
          </div>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input type="number" min="1" step="1" value={conversionPoints} onChange={e=>setConversionPoints(e.target.value)} placeholder="Jumlah points" className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm" />
          <button disabled={conversionLoading||!Number(conversionPoints)||Number(conversionPoints)>points.available} onClick={async()=>{
            setConversionLoading(true);setConversionMessage('');
            try{
              const res=await fetch('/api/airdrop/submissions',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'convert',points:Number(conversionPoints)})});
              const data=await res.json().catch(()=>({}));
              if(!res.ok||!data.success) throw new Error(data.message||data.error||'Conversion gagal');
              setConversionMessage(`Berhasil dicatat: ${data.convertedPoints} points = ${data.sysAmount} SYS.`);
              setConversionPoints('');
              const refreshed=await fetch('/api/airdrop/submissions',{credentials:'include',cache:'no-store'});
              const next=await refreshed.json().catch(()=>({}));
              if(next.points) setPoints({approved:Number(next.points.approved||0),pending:Number(next.points.pending||0),paid:Number(next.points.paid||0),available:Number(next.points.available||0)});
            }catch(e){setConversionMessage(e instanceof Error?e.message:'Conversion gagal');}
            finally{setConversionLoading(false);}
          }} className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-40">Convert to SYS</button>
        </div>
        <div className="mt-2 text-[10px] text-slate-500">Rate saat ini: 1 SYS = 1.000 points.</div>
        {conversionMessage&&<div className="mt-3 text-xs text-amber-300">{conversionMessage}</div>}
      </section>

      <div className="mt-8 flex items-center gap-2 border-b border-slate-800">
        <button onClick={()=>setTab('tasks')} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab==='tasks'?'border-amber-400 text-white':'border-transparent text-slate-500'}`}>{tx.available}</button>
        <button onClick={()=>setTab('submissions')} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab==='submissions'?'border-amber-400 text-white':'border-transparent text-slate-500'}`}>{tx.submissions}</button>
      </div>

      {tab==='tasks'?<section className="mt-6">
        <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['all','Semua'],['youtube','YouTube'],['social','Sosial Media'],['checkin','Daily Check-in']
          ].map(([key,label])=><button key={key} onClick={()=>setTaskCategory(key as 'all'|'youtube'|'social'|'checkin')} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-xs font-bold hover:border-amber-400/40">{label}</button>)}
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {tasksLoading?<div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-500">{tx.loadingTasks || "Loading active tasks..."}</div>:availableTasks.filter(t=>taskCategory==='all'||(taskCategory==='youtube'?(t.type==='youtube'||t.type==='shorts'):taskCategory==='social'?(['social','instagram','tiktok','twitter','facebook','telegram','discord'].includes(t.type)):t.type==='checkin')).map(t=>{const x=taskText(t);return <article key={t.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col">
          <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold text-slate-300">{typeIcon(t.type)} {typeLabel(t.type,tx)}</span><div className="flex gap-1">{t.daily&&<span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">{tx.daily}</span>}{t.priority&&<span className="text-[9px] font-black text-amber-300 bg-amber-400/10 px-2 py-1 rounded-full">{tx.priority}</span>}</div></div>
          <h2 className="mt-5 text-lg font-bold">{x.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400 flex-1">{x.desc}</p>
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3"><div><div className="text-xs text-slate-500">{tx.reward}</div><div className="font-bold text-amber-400">{t.reward==='program'?tx.configured:`${t.reward} pts`}</div></div><button onClick={()=>setSelectedTask(t)} className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm">{x.action}</button></div>
        </article>})}
        </div>
      </section>:<section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">{submissions.length===0?<div className="p-8 text-center"><FileVideo className="w-10 h-10 mx-auto text-slate-600"/><h2 className="mt-4 font-bold">{tx.empty}</h2><p className="mt-2 text-sm text-slate-500">{tx.emptySub}</p></div>:<div className="space-y-3">{submissions.map(s=><div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3"><div className="flex-1 min-w-0"><div className="font-bold truncate">{s.task_title||String(s.task_id)}</div><a href={s.evidence_link} target="_blank" rel="noreferrer" className="text-xs text-amber-400 break-all">{s.evidence_link}</a><div className="text-[10px] text-slate-500 mt-1">{s.created_at}</div></div><div className="text-xs font-black px-3 py-2 rounded-xl bg-slate-800 text-slate-200">{statusLabel(s.status,tx)}</div><div className="text-xs text-amber-400 font-bold">{s.reward_points} pts</div></div>)}</div>}</section>}
    </main>

    <footer className="border-t border-slate-800 mt-12"><div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-500 flex flex-wrap gap-3 justify-between"><span>SYS STREAM Airdrop &amp; Task Center</span><span>{tx.footer}</span></div></footer>

    {selectedTask&&(()=>{const x=taskText(selectedTask);return <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" onClick={()=>setSelectedTask(null)}>
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold text-amber-400">{typeLabel(selectedTask.type,tx)}</div><h2 className="mt-1 text-xl font-black">{x.title}</h2></div><button onClick={()=>setSelectedTask(null)} className="p-2 rounded-lg hover:bg-slate-800" aria-label={tx.close || "Close"}><X className="w-5 h-5"/></button></div>
        <div className="mt-6 rounded-xl bg-slate-950 border border-slate-800 p-4"><div className="text-xs text-slate-500">{tx.instructions}</div><p className="mt-2 text-sm text-slate-300">{x.desc}</p></div>
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-400 mb-2">{tx.wallet || COPY.en.wallet}</label>
          <input value={walletAddress} onChange={e=>setWalletAddress(e.target.value)} placeholder={tx.walletPlaceholder || COPY.en.walletPlaceholder} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400" />
          {!walletAddress.trim()&&<div className="mt-2 text-xs text-amber-300">{tx.walletRequired || COPY.en.walletRequired}</div>}
          {selectedTask.type!=='checkin'&&<><label className="block text-xs font-bold text-slate-400 mt-4 mb-2">{tx.proofSubmission}</label><input value={proofLink} onChange={e=>setProofLink(e.target.value)} placeholder={tx.proofPlaceholder || "https://..."} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400" /></>}
          {submissionMessage&&<div className="mt-3 text-xs text-amber-300">{submissionMessage}</div>}
          <button disabled={!walletAddress.trim()||submissionLoading||(selectedTask.type!=='checkin'&&!proofLink.trim())} onClick={submitTask} className="mt-3 w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed">{submissionLoading?(tx.submitting || 'Submitting...'):(tx.saveWallet || COPY.en.saveWallet)}</button>
        </div>
      </div>
    </div>})()}
  </div>;
}
