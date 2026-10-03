import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode = 'id' | 'en' | 'es' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';
export interface LocaleConfig {
  locale: string;
  currency: string;
  direction: 'ltr' | 'rtl';
}

export const LOCALE_CONFIG: Record<LanguageCode, LocaleConfig> = {
  id: { locale: 'id-ID', currency: 'IDR', direction: 'ltr' },
  en: { locale: 'en-US', currency: 'USD', direction: 'ltr' },
  es: { locale: 'es-ES', currency: 'EUR', direction: 'ltr' },
  pt: { locale: 'pt-PT', currency: 'EUR', direction: 'ltr' },
  zh: { locale: 'zh-CN', currency: 'CNY', direction: 'ltr' },
  ja: { locale: 'ja-JP', currency: 'JPY', direction: 'ltr' },
  ko: { locale: 'ko-KR', currency: 'KRW', direction: 'ltr' },
  ar: { locale: 'ar-SA', currency: 'SAR', direction: 'rtl' },
};

export function getLocaleConfig(language: LanguageCode): LocaleConfig {
  return LOCALE_CONFIG[language] ?? LOCALE_CONFIG.en;
}

export function formatLocalizedCurrency(amount: number, language: LanguageCode, currency = getLocaleConfig(language).currency): string {
  const config = getLocaleConfig(language);
  const value = Number.isFinite(amount) ? amount : 0;
  const zeroDecimal = currency === 'JPY' || currency === 'KRW';
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(value);
}

export function formatLocalizedNumber(amount: number, language: LanguageCode): string {
  const config = getLocaleConfig(language);
  return new Intl.NumberFormat(config.locale).format(Number.isFinite(amount) ? amount : 0);
}



// Registration bonus is stored canonically as IDR 15,000.
// The display value is localized for the user's selected language.
// Rates below are a presentation reference, not a payment/settlement rate.
export const REGISTRATION_BONUS_IDR = 15000;
export function formatIdrAsSelectedCurrency(amountIdr: number, language: LanguageCode): string {
  const currency = getLocaleConfig(language).currency;
  const idrPerUnit = IDR_PER_CURRENCY_UNIT[language] ?? 1;
  const amount = (Number.isFinite(amountIdr) ? amountIdr : 0) / idrPerUnit;
  return formatLocalizedCurrency(amount, language, currency);
}

export const IDR_PER_CURRENCY_UNIT: Record<LanguageCode, number> = {
  id: 1,
  en: 17937,
  es: 20154.04,
  pt: 20154.04,
  zh: 2675.35,
  ja: 113.5732,
  ko: 13.30,
  ar: 4767.08,
};

const REGISTRATION_BONUS_CURRENCY: Record<LanguageCode, string> = {
  id: 'IDR',
  en: 'USD',
  es: 'EUR',
  pt: 'EUR',
  zh: 'CNY',
  ja: 'JPY',
  ko: 'KRW',
  ar: 'SAR',
};

export function formatRegistrationBonus(language: LanguageCode): string {
  const currency = REGISTRATION_BONUS_CURRENCY[language];
  const idrPerUnit = IDR_PER_CURRENCY_UNIT[language];
  const amount = REGISTRATION_BONUS_IDR / idrPerUnit;
  const locale = language === 'id' ? 'id-ID'
    : language === 'en' ? 'en-US'
    : language === 'es' ? 'es-ES'
    : language === 'pt' ? 'pt-PT'
    : language === 'zh' ? 'zh-CN'
    : language === 'ja' ? 'ja-JP'
    : language === 'ko' ? 'ko-KR'
    : 'ar-SA';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: ['JPY','KRW'].includes(currency) ? 0 : 2,
    maximumFractionDigits: ['JPY','KRW'].includes(currency) ? 0 : 2,
  }).format(amount);
}

export const LANGUAGES: Array<{ code: LanguageCode; label: string; native: string }> = [
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'ko', label: 'Korean', native: '한국어' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

const translations: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Production data is used for all content and activity on this page.': 'Konten dan aktivitas di halaman ini menggunakan data produksi.',
    'Every user can share posts and updates.': 'Setiap pengguna dapat membagikan tulisan dan postingan.',
    'Community Posts': 'Postingan Komunitas',
    'Claim Bonus': 'Klaim Bonus',
    'Registration Bonus': 'Bonus Pendaftaran',
    'Locked': 'Terkunci',
    'Available': 'Tersedia',
    'Upload / Create': 'Unggah / Buat',
    'Airdrop': 'Airdrop',
    'Games': 'Permainan',
    'Live Now': 'Live Sekarang',
    'Workspace': 'Ruang Kerja',
    Home:'Beranda', Earn:'Dapatkan', Board:'Papan', Profile:'Profil', Language:'Bahasa',
    Login:'Masuk', Register:'Daftar', 'Welcome Back':'Selamat Datang Kembali',
    'Create SYS Account':'Buat Akun SYS', 'Username or Email':'Username atau Email',
    Email:'Email', Password:'Kata Sandi', 'Remember me':'Ingat saya',
    'Edit Profile & Avatar':'Kelola Profil & Foto', 'Display Username':'Nama Pengguna',
    'Profile Photo':'Foto Profil', 'Upload photo from device':'Upload foto dari perangkat',
    'Change photo from device':'Ganti foto dari perangkat', Cancel:'Batal',
    'Save Changes':'Simpan Perubahan', 'Locked Balance':'Saldo Terkunci',
    'Total Earnings':'Total Pendapatan', 'Deposit Crypto':'Deposit Crypto',
    'Lock History':'Riwayat Lock', 'Log Out':'Keluar', 'Notifications':'Notifikasi',
    'No unread notifications at this time.':'Tidak ada notifikasi baru saat ini.',
    '30 DAYS':'30 HARI', '60 DAYS':'60 HARI', '90 DAYS':'90 HARI',
  },
  en: {},
  es: {
    Home:'Inicio', Earn:'Ganar', Board:'Clasificación', Profile:'Perfil', Language:'Idioma',
    Login:'Iniciar sesión', Register:'Registrarse', 'Welcome Back':'Bienvenido de nuevo',
    'Create SYS Account':'Crear cuenta SYS', 'Username or Email':'Usuario o correo',
    Email:'Correo electrónico', Password:'Contraseña', 'Remember me':'Recordarme',
    'Edit Profile & Avatar':'Gestionar perfil y foto', 'Display Username':'Nombre de usuario',
    'Profile Photo':'Foto de perfil', 'Upload photo from device':'Subir foto del dispositivo',
    'Change photo from device':'Cambiar foto del dispositivo', Cancel:'Cancelar',
    'Save Changes':'Guardar cambios', 'Locked Balance':'Saldo bloqueado',
    'Total Earnings':'Ganancias totales', 'Deposit Crypto':'Depositar cripto',
    'Lock History':'Historial de bloqueo', 'Log Out':'Cerrar sesión', Notifications:'Notificaciones',
  },
  pt: {
    Home:'Início', Earn:'Ganhar', Board:'Ranking', Profile:'Perfil', Language:'Idioma',
    Login:'Entrar', Register:'Registrar', 'Welcome Back':'Bem-vindo de volta',
    'Create SYS Account':'Criar conta SYS', 'Username or Email':'Usuário ou e-mail',
    Email:'E-mail', Password:'Senha', 'Remember me':'Lembrar de mim',
    'Edit Profile & Avatar':'Gerenciar perfil e foto', 'Display Username':'Nome de usuário',
    'Profile Photo':'Foto do perfil', 'Upload photo from device':'Enviar foto do dispositivo',
    'Change photo from device':'Alterar foto do dispositivo', Cancel:'Cancelar',
    'Save Changes':'Salvar alterações', 'Locked Balance':'Saldo bloqueado',
    'Total Earnings':'Ganhos totais', 'Deposit Crypto':'Depositar cripto',
    'Lock History':'Histórico de bloqueios', 'Log Out':'Sair', Notifications:'Notificações',
  },
  zh: {
    Home:'首页', Earn:'赚取', Board:'排行榜', Profile:'个人资料', Language:'语言',
    Login:'登录', Register:'注册', 'Welcome Back':'欢迎回来', 'Create SYS Account':'创建 SYS 账户',
    'Username or Email':'用户名或邮箱', Email:'邮箱', Password:'密码', 'Remember me':'记住我',
    'Edit Profile & Avatar':'管理个人资料和照片', 'Display Username':'用户名',
    'Profile Photo':'头像', 'Upload photo from device':'从设备上传照片',
    'Change photo from device':'从设备更换照片', Cancel:'取消', 'Save Changes':'保存更改',
    'Locked Balance':'锁定余额', 'Total Earnings':'总收益', 'Deposit Crypto':'加密货币充值',
    'Lock History':'锁定记录', 'Log Out':'退出登录', Notifications:'通知',
  },
  ja: {
    Home:'ホーム', Earn:'獲得', Board:'ランキング', Profile:'プロフィール', Language:'言語',
    Login:'ログイン', Register:'登録', 'Welcome Back':'おかえりなさい', 'Create SYS Account':'SYSアカウントを作成',
    'Username or Email':'ユーザー名またはメール', Email:'メール', Password:'パスワード',
    'Remember me':'ログイン情報を保存', 'Edit Profile & Avatar':'プロフィールと写真を管理',
    'Display Username':'ユーザー名', 'Profile Photo':'プロフィール写真',
    'Upload photo from device':'端末から写真をアップロード', 'Change photo from device':'端末から写真を変更',
    Cancel:'キャンセル', 'Save Changes':'変更を保存', 'Locked Balance':'ロック残高',
    'Total Earnings':'総収益', 'Deposit Crypto':'暗号資産を入金', 'Lock History':'ロック履歴',
    'Log Out':'ログアウト', Notifications:'通知',
  },
  ko: {
    Home:'홈', Earn:'수익', Board:'순위표', Profile:'프로필', Language:'언어',
    Login:'로그인', Register:'가입', 'Welcome Back':'다시 오신 것을 환영합니다',
    'Create SYS Account':'SYS 계정 만들기', 'Username or Email':'사용자 이름 또는 이메일',
    Email:'이메일', Password:'비밀번호', 'Remember me':'로그인 상태 유지',
    'Edit Profile & Avatar':'프로필 및 사진 관리', 'Display Username':'사용자 이름',
    'Profile Photo':'프로필 사진', 'Upload photo from device':'기기에서 사진 업로드',
    'Change photo from device':'기기에서 사진 변경', Cancel:'취소', 'Save Changes':'변경 저장',
    'Locked Balance':'잠금 잔액', 'Total Earnings':'총 수익', 'Deposit Crypto':'암호화폐 입금',
    'Lock History':'잠금 기록', 'Log Out':'로그아웃', Notifications:'알림',
  },
  ar: {
    Home:'الرئيسية', Earn:'اربح', Board:'المتصدرين', Profile:'الملف الشخصي', Language:'اللغة',
    Login:'تسجيل الدخول', Register:'إنشاء حساب', 'Welcome Back':'مرحباً بعودتك',
    'Create SYS Account':'إنشاء حساب SYS', 'Username or Email':'اسم المستخدم أو البريد',
    Email:'البريد الإلكتروني', Password:'كلمة المرور', 'Remember me':'تذكرني',
    'Edit Profile & Avatar':'إدارة الملف والصورة', 'Display Username':'اسم المستخدم',
    'Profile Photo':'صورة الملف الشخصي', 'Upload photo from device':'رفع صورة من الجهاز',
    'Change photo from device':'تغيير الصورة من الجهاز', Cancel:'إلغاء', 'Save Changes':'حفظ التغييرات',
    'Locked Balance':'الرصيد المقفل', 'Total Earnings':'إجمالي الأرباح', 'Deposit Crypto':'إيداع العملات الرقمية',
    'Lock History':'سجل القفل', 'Log Out':'تسجيل الخروج', Notifications:'الإشعارات',
  },
};

translations.en = Object.fromEntries([
  ['Home','Home'],['Earn','Earn'],['Board','Board'],['Profile','Profile'],['Language','Language'],
  ['Login','Login'],['Register','Register'],['Welcome Back','Welcome Back'],['Create SYS Account','Create SYS Account'],
  ['Username or Email','Username or Email'],['Email','Email'],['Password','Password'],['Remember me','Remember me'],
  ['Edit Profile & Avatar','Manage Profile & Photo'],['Display Username','Display Username'],
  ['Profile Photo','Profile Photo'],['Upload photo from device','Upload photo from device'],
  ['Change photo from device','Change photo from device'],['Cancel','Cancel'],['Save Changes','Save Changes'],
  ['Locked Balance','Locked Balance'],['Total Earnings','Total Earnings'],['Deposit Crypto','Deposit Crypto'],
  ['Lock History','Lock History'],['Log Out','Log Out'],['Notifications','Notifications'],
]);


// Shared production UI translations. Every supported language gets an explicit value;
// unknown keys still fall back to English, never to a mixed-language label.
Object.assign(translations.en, {
  Workspace:'Workspace', 'Upload / Create':'Upload / Create', Available:'Available', Locked:'Locked',
  'Registration Bonus':'Registration Bonus', 'Claim Bonus':'Claim Bonus', 'Community Posts':'Community Posts',
  'Production data is used for all content and activity on this page.':'Production data is used for all content and activity on this page.',
  'Every user can share posts and updates.':'Every user can share posts and updates.',
});
Object.assign(translations.es, {
  Workspace:'Espacio de trabajo', Home:'Inicio', 'Live Now':'En vivo', Games:'Juegos', Airdrop:'Airdrop', Profile:'Perfil',
  'Upload / Create':'Subir / Crear', Available:'Disponible', Locked:'Bloqueado', 'Registration Bonus':'Bono de registro',
  'Claim Bonus':'Reclamar bono', 'Community Posts':'Publicaciones de la comunidad',
  'Production data is used for all content and activity on this page.':'Esta página utiliza datos de producción para todo el contenido y la actividad.',
  'Every user can share posts and updates.':'Cada usuario puede compartir publicaciones y actualizaciones.',
});
Object.assign(translations.pt, {
  Workspace:'Área de trabalho', Home:'Início', 'Live Now':'Ao vivo', Games:'Jogos', Airdrop:'Airdrop', Profile:'Perfil',
  'Upload / Create':'Enviar / Criar', Available:'Disponível', Locked:'Bloqueado', 'Registration Bonus':'Bônus de registro',
  'Claim Bonus':'Resgatar bônus', 'Community Posts':'Publicações da comunidade',
  'Production data is used for all content and activity on this page.':'Esta página usa dados de produção para todo o conteúdo e atividade.',
  'Every user can share posts and updates.':'Cada usuário pode compartilhar publicações e atualizações.',
});
Object.assign(translations.zh, {
  Workspace:'工作区', Home:'首页', 'Live Now':'正在直播', Games:'游戏', Airdrop:'空投', Profile:'个人资料',
  'Upload / Create':'上传 / 创建', Available:'可用', Locked:'已锁定', 'Registration Bonus':'注册奖励',
  'Claim Bonus':'领取奖励', 'Community Posts':'社区帖子',
  'Production data is used for all content and activity on this page.':'本页面所有内容和活动均使用生产数据。',
  'Every user can share posts and updates.':'每位用户都可以分享帖子和动态。',
});
Object.assign(translations.ja, {
  Workspace:'ワークスペース', Home:'ホーム', 'Live Now':'ライブ中', Games:'ゲーム', Airdrop:'エアドロップ', Profile:'プロフィール',
  'Upload / Create':'アップロード / 作成', Available:'利用可能', Locked:'ロック済み', 'Registration Bonus':'登録ボーナス',
  'Claim Bonus':'ボーナスを受け取る', 'Community Posts':'コミュニティ投稿',
  'Production data is used for all content and activity on this page.':'このページのコンテンツとアクティビティは本番データを使用します。',
  'Every user can share posts and updates.':'すべてのユーザーが投稿や更新を共有できます。',
});
Object.assign(translations.ko, {
  Workspace:'워크스페이스', Home:'홈', 'Live Now':'라이브', Games:'게임', Airdrop:'에어드롭', Profile:'프로필',
  'Upload / Create':'업로드 / 만들기', Available:'사용 가능', Locked:'잠김', 'Registration Bonus':'가입 보너스',
  'Claim Bonus':'보너스 받기', 'Community Posts':'커뮤니티 게시물',
  'Production data is used for all content and activity on this page.':'이 페이지의 모든 콘텐츠와 활동은 운영 데이터를 사용합니다.',
  'Every user can share posts and updates.':'모든 사용자가 게시물과 업데이트를 공유할 수 있습니다.',
});
Object.assign(translations.ar, {
  Workspace:'مساحة العمل', Home:'الرئيسية', 'Live Now':'مباشر الآن', Games:'الألعاب', Airdrop:'الإيردروب', Profile:'الملف الشخصي',
  'Upload / Create':'رفع / إنشاء', Available:'متاح', Locked:'مقفل', 'Registration Bonus':'مكافأة التسجيل',
  'Claim Bonus':'استلام المكافأة', 'Community Posts':'منشورات المجتمع',
  'Production data is used for all content and activity on this page.':'تستخدم هذه الصفحة بيانات الإنتاج لجميع المحتويات والأنشطة.',
  'Every user can share posts and updates.':'يمكن لكل مستخدم مشاركة المنشورات والتحديثات.',
});



const PAGE_UI_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {},
  en: {
    'Masuk untuk bergabung ke Live Room':'Login to join the Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Each account has its own profile and identity in the room.','LOGIN / REGISTER':'LOGIN / REGISTER',
    'Live Room Aktif':'Live Room Active','Live belum aktif':'Live is not active','Peserta Live':'Live Participants','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Only accounts that actually joined are displayed.','Peserta':'Participants','CHAT':'CHAT','Memuat peserta...':'Loading participants...','Belum ada peserta lain.':'No other participants yet.','Belum ada peserta.':'No participants yet.','Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.':'No messages yet. Be the first user to contribute to this room.','Tulis sebagai':'Write as','Anda':'You','Profil akun Anda':'Your account profile',
    'Cyber Daily Mystery Box':'Cyber Daily Mystery Box','Apex High-Roller Crate':'Apex High-Roller Crate','Reward harian diproses server dan masuk ke saldo tersedia.':'Daily rewards are processed by the server and added to your available balance.','Nominal Lock (IDR)':'Lock Amount (IDR)','Lock Saldo Sekarang':'Lock Balance Now','Claim Blind Box Harian':'Claim Daily Blind Box','Lock Aktif':'Active Lock','Daily Active Reward':'Daily Active Reward','Enhanced Lock Tier':'Enhanced Lock Tier','Premium Lock Tier':'Premium Lock Tier','Reward harian masuk ke saldo':'Daily reward is added to balance','Memproses Reward Blind Box...':'Processing Blind Box Reward...','Reward Blind Box Harian':'Daily Blind Box Reward','Reward dikreditkan ke saldo tersedia':'Reward credited to available balance','Durasi Lock':'Lock Duration','30 HARI':'30 DAYS','60 HARI':'60 DAYS','90 HARI':'90 DAYS',
    'Viewer Username Raffle Spinner':'Spinner Undian Username Penonton','Live Participants Only':'Hanya Peserta Live','Spinning for Winner...':'Sedang memutar untuk menentukan pemenang...','Current Viewers on Wheel:':'Penonton saat ini di spinner:','Recent Raffle Winners':'Pemenang Undian Terbaru',
    'Interaction Challenge — No Financial Stake':'Interaction Challenge — No Financial Stake','Mode Interaksi':'Interaction Mode','Challenge ini tidak menggunakan saldo pengguna. Tidak ada deposit, lock, pemotongan saldo, atau payout finansial.':'This challenge does not use user balance. There is no deposit, lock, balance deduction, or financial payout.','Verify Challenge':'Verify Challenge','Verifying Cryptographic Seed...':'Verifying Cryptographic Seed...','Provably Fair Verification':'Provably Fair Verification'
  },
  es: {
    'Masuk untuk bergabung ke Live Room':'Inicia sesión para unirte a la sala en vivo','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Cada cuenta tiene su propio perfil e identidad en la sala.','Live Room Aktif':'Sala en vivo activa','Live belum aktif':'La sala en vivo no está activa','Peserta Live':'Participantes en vivo','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Solo se muestran las cuentas que realmente se han unido.','Memuat peserta...':'Cargando participantes...','Belum ada peserta lain.':'Aún no hay otros participantes.','Belum ada peserta.':'Aún no hay participantes.','CHAT':'CHAT','Peserta':'PARTICIPANTES','Profil akun Anda':'Perfil de tu cuenta',
    'Nominal Lock (IDR)':'Importe del bloqueo (IDR)','Lock Saldo Sekarang':'Bloquear saldo ahora','Claim Blind Box Harian':'Reclamar Blind Box diario','Lock Aktif':'Bloqueo activo','Reward harian masuk ke saldo':'La recompensa diaria se añade al saldo','Durasi Lock':'Duración del bloqueo','30 HARI':'30 DÍAS','60 HARI':'60 DÍAS','90 HARI':'90 DÍAS',
    'Mode Interaksi':'Modo de interacción','Verify Challenge':'Verificar desafío','Provably Fair Verification':'Verificación demostrablemente justa'
  },
  pt: {
    'Masuk untuk bergabung ke Live Room':'Entre para participar da Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Cada conta tem seu próprio perfil e identidade na sala.','Live Room Aktif':'Live Room ativa','Live belum aktif':'A Live Room não está ativa','Peserta Live':'Participantes da live','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Apenas contas que realmente entraram são exibidas.','Memuat peserta...':'Carregando participantes...','Belum ada peserta lain.':'Ainda não há outros participantes.','Belum ada peserta.':'Ainda não há participantes.','Peserta':'PARTICIPANTES','Profil akun Anda':'Perfil da sua conta',
    'Nominal Lock (IDR)':'Valor do bloqueio (IDR)','Lock Saldo Sekarang':'Bloquear saldo agora','Claim Blind Box Harian':'Resgatar Blind Box diário','Lock Aktif':'Bloqueio ativo','Reward harian masuk ke saldo':'A recompensa diária é adicionada ao saldo','Durasi Lock':'Duração do bloqueio','30 HARI':'30 DIAS','60 HARI':'60 DIAS','90 HARI':'90 DIAS',
    'Mode Interaksi':'Modo de interação','Verify Challenge':'Verificar desafio','Provably Fair Verification':'Verificação comprovadamente justa'
  },
  zh: {
    'Masuk untuk bergabung ke Live Room':'登录以加入直播间','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'每个账户在直播间都有独立的个人资料和身份。','Live Room Aktif':'直播间已开启','Live belum aktif':'直播尚未开启','Peserta Live':'直播参与者','Hanya akun yang benar-benar bergabung yang ditampilkan.':'仅显示实际加入的账户。','Memuat peserta...':'正在加载参与者…','Belum ada peserta lain.':'暂无其他参与者。','Belum ada peserta.':'暂无参与者。','Peserta':'参与者','Profil akun Anda':'您的账户资料',
    'Nominal Lock (IDR)':'锁定金额（IDR）','Lock Saldo Sekarang':'立即锁定余额','Claim Blind Box Harian':'领取每日盲盒','Lock Aktif':'锁定中','Reward harian masuk ke saldo':'每日奖励将加入余额','Durasi Lock':'锁定期限','30 HARI':'30天','60 HARI':'60天','90 HARI':'90天',
    'Mode Interaksi':'互动模式','Verify Challenge':'验证挑战','Provably Fair Verification':'公平验证'
  },
  ja: {
    'Masuk untuk bergabung ke Live Room':'ログインしてライブルームに参加','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'各アカウントにはルーム内で固有のプロフィールとIDがあります。','Live Room Aktif':'ライブルームが有効です','Live belum aktif':'ライブはまだ開始されていません','Peserta Live':'ライブ参加者','Hanya akun yang benar-benar bergabung yang ditampilkan.':'実際に参加したアカウントのみ表示されます。','Memuat peserta...':'参加者を読み込み中…','Belum ada peserta lain.':'他の参加者はいません。','Belum ada peserta.':'参加者はいません。','Peserta':'参加者','Profil akun Anda':'あなたのアカウントプロフィール',
    'Nominal Lock (IDR)':'ロック金額（IDR）','Lock Saldo Sekarang':'残高をロック','Claim Blind Box Harian':'毎日のブラインドボックスを受け取る','Lock Aktif':'ロック中','Reward harian masuk ke saldo':'毎日の報酬は残高に追加されます','Durasi Lock':'ロック期間','30 HARI':'30日','60 HARI':'60日','90 HARI':'90日',
    'Mode Interaksi':'インタラクションモード','Verify Challenge':'チャレンジを確認','Provably Fair Verification':'公平性の検証'
  },
  ko: {
    'Masuk untuk bergabung ke Live Room':'로그인하여 라이브 룸에 참여하세요','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'각 계정은 룸에서 고유한 프로필과 신원을 가집니다.','Live Room Aktif':'라이브 룸 활성','Live belum aktif':'라이브가 아직 시작되지 않았습니다','Peserta Live':'라이브 참가자','Hanya akun yang benar-benar bergabung yang ditampilkan.':'실제로 참여한 계정만 표시됩니다.','Memuat peserta...':'참가자 불러오는 중…','Belum ada peserta lain.':'아직 다른 참가자가 없습니다.','Belum ada peserta.':'참가자가 없습니다.','Peserta':'참가자','Profil akun Anda':'내 계정 프로필',
    'Nominal Lock (IDR)':'잠금 금액(IDR)','Lock Saldo Sekarang':'잔액 잠금','Claim Blind Box Harian':'일일 블라인드 박스 받기','Lock Aktif':'잠금 활성','Reward harian masuk ke saldo':'일일 보상이 잔액에 추가됩니다','Durasi Lock':'잠금 기간','30 HARI':'30일','60 HARI':'60일','90 HARI':'90일',
    'Mode Interaksi':'상호작용 모드','Verify Challenge':'챌린지 확인','Provably Fair Verification':'공정성 검증'
  },
  ar: {
    'Masuk untuk bergabung ke Live Room':'سجّل الدخول للانضمام إلى الغرفة المباشرة','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'لكل حساب ملف وهوية خاصة به داخل الغرفة.','Live Room Aktif':'الغرفة المباشرة نشطة','Live belum aktif':'البث المباشر غير نشط','Peserta Live':'المشاركون في البث','Hanya akun yang benar-benar bergabung yang ditampilkan.':'تظهر فقط الحسابات التي انضمت فعليًا.','Memuat peserta...':'جارٍ تحميل المشاركين…','Belum ada peserta lain.':'لا يوجد مشاركون آخرون بعد.','Belum ada peserta.':'لا يوجد مشاركون.','Peserta':'المشاركون','Profil akun Anda':'ملف حسابك',
    'Nominal Lock (IDR)':'مبلغ القفل (IDR)','Lock Saldo Sekarang':'قفل الرصيد الآن','Claim Blind Box Harian':'استلام الصندوق اليومي','Lock Aktif':'القفل نشط','Reward harian masuk ke saldo':'تُضاف المكافأة اليومية إلى الرصيد','Durasi Lock':'مدة القفل','30 HARI':'30 يومًا','60 HARI':'60 يومًا','90 HARI':'90 يومًا',
    'Mode Interaksi':'وضع التفاعل','Verify Challenge':'تحقق من التحدي','Provably Fair Verification':'تحقق من العدالة'
  },
};

const ORIGINAL_TEXT_NODES = new WeakMap<Text, string>();

/* Comprehensive fallback translations for visible page text that is not yet migrated
   to t(). The MutationObserver below applies these exact labels to dynamically rendered UI. */
const COMMON_PAGE_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Viewer Username Raffle Spinner':'Spinner Undian Username Penonton','Live Participants Only':'Hanya Peserta Live','Recent Raffle Winners':'Pemenang Undian Terbaru',
    'Digital Crypto Card Number Guess':'Tebak Nomor Kartu Kripto Digital','Streamer Card Settings':'Pengaturan Kartu Streamer','Streamer Card Configurator':'Konfigurator Kartu Streamer','Card Title':'Judul Kartu','Serial Number':'Nomor Seri','Concealed':'Tersembunyi','Revealed':'Terbuka','Verify Challenge':'Verifikasi Tantangan','Provably Fair Verification':'Verifikasi Provably Fair',
    'Affiliate Partner Program':'Program Mitra Afiliasi','Your Personal Affiliate Link':'Link Afiliasi Pribadi Anda','Direct Invitations':'Undangan Langsung','Network Invites':'Undangan Jaringan','Deep Ecosystem':'Ekosistem Mendalam','Affiliate Income Calculator':'Kalkulator Pendapatan Afiliasi','Estimated Monthly Earnings':'Perkiraan Pendapatan Bulanan','Live Referral Feed':'Feed Referral Live','Referee Handle':'Nama Referee','Date Joined':'Tanggal Bergabung','Commission Tier':'Tingkat Komisi','Wager Volume':'Volume Aktivitas','Commission Earned':'Komisi Diperoleh',
    'NOWPayments Crypto Deposit':'Deposit Kripto NOWPayments','Instant deposit with zero platform fees':'Deposit instan tanpa biaya platform','Create NOWPayments Invoice':'Buat Invoice NOWPayments',
    'Available Balance':'Saldo Tersedia','Transaction History':'Riwayat Transaksi','Withdraw USDT':'Tarik USDT','Submit Withdrawal':'Ajukan Penarikan','Withdrawal':'Penarikan','Wallet':'Dompet','Referral Link':'Link Referral','Event Participation Status':'Status Partisipasi Event','Refresh':'Segarkan','Loading...':'Memuat...','Belum ada transaksi.':'Belum ada transaksi.','Processing...':'Memproses...','Edit':'Edit','Logout':'Keluar','Member':'Anggota','USDT Account':'Akun USDT',
    'Live':'Live','Join Live Room':'Gabung Live Room','Login to join the Live Room':'Masuk untuk bergabung ke Live Room','Chat':'Chat','Send':'Kirim','Type a message':'Tulis pesan','No participants yet.':'Belum ada peserta.','No messages yet.':'Belum ada pesan.','Loading participants...':'Memuat peserta...'
  },
  en: {
    'Masuk untuk bergabung ke Live Room':'Login to join the Live Room','Peserta Live':'Live Participants','Profil akun Anda':'Your account profile','Viewer Username Raffle Spinner':'Viewer Username Raffle Spinner','Live Participants Only':'Live Participants Only','Recent Raffle Winners':'Recent Raffle Winners',
    'Digital Crypto Card Number Guess':'Digital Crypto Card Number Guess','Streamer Card Settings':'Streamer Card Settings','Streamer Card Configurator':'Streamer Card Configurator','Card Title':'Card Title','Serial Number':'Serial Number','Concealed':'Concealed','Revealed':'Revealed','Mode Interaksi':'Interaction Mode','Verify Challenge':'Verify Challenge','Provably Fair Verification':'Provably Fair Verification',
    'Affiliate Partner Program':'Affiliate Partner Program','Your Personal Affiliate Link':'Your Personal Affiliate Link','Direct Invitations':'Direct Invitations','Network Invites':'Network Invites','Deep Ecosystem':'Deep Ecosystem','Affiliate Income Calculator':'Affiliate Income Calculator','Estimated Monthly Earnings':'Estimated Monthly Earnings','Live Referral Feed':'Live Referral Feed','Referee Handle':'Referee Handle','Date Joined':'Date Joined','Commission Tier':'Commission Tier','Wager Volume':'Wager Volume','Commission Earned':'Commission Earned',
    'NOWPayments Crypto Deposit':'NOWPayments Crypto Deposit','Instant deposit with zero platform fees':'Instant deposit with zero platform fees','Create NOWPayments Invoice':'Create NOWPayments Invoice',
    'Available Balance':'Available Balance','Transaction History':'Transaction History','Withdraw USDT':'Withdraw USDT','Submit Withdrawal':'Submit Withdrawal','Withdrawal':'Withdrawal','Wallet':'Wallet','Referral Link':'Referral Link','Event Participation Status':'Event Participation Status','Refresh':'Refresh','Loading...':'Loading...','Processing...':'Processing...','Edit':'Edit','Logout':'Logout','Member':'Member','USDT Account':'USDT Account','Live':'Live','Join Live Room':'Join Live Room','Chat':'Chat','Send':'Send','Type a message':'Type a message','No participants yet.':'No participants yet.','No messages yet.':'No messages yet.','Loading participants...':'Loading participants...'
  },
  es: {
    'Viewer Username Raffle Spinner':'Ruleta de nombres de espectadores','Live Participants Only':'Solo participantes en vivo','Recent Raffle Winners':'Ganadores recientes',
    'Digital Crypto Card Number Guess':'Adivina el número de tarjeta cripto','Streamer Card Settings':'Configuración de tarjeta del streamer','Streamer Card Configurator':'Configurador de tarjeta','Card Title':'Título de tarjeta','Serial Number':'Número de serie','Concealed':'Oculto','Revealed':'Revelado','Verify Challenge':'Verificar desafío','Provably Fair Verification':'Verificación demostrablemente justa',
    'Affiliate Partner Program':'Programa de socios afiliados','Your Personal Affiliate Link':'Tu enlace de afiliado personal','Direct Invitations':'Invitaciones directas','Network Invites':'Invitaciones de red','Deep Ecosystem':'Ecosistema profundo','Affiliate Income Calculator':'Calculadora de ingresos de afiliados','Estimated Monthly Earnings':'Ingresos mensuales estimados','Live Referral Feed':'Actividad de referidos en vivo','Referee Handle':'Usuario referido','Date Joined':'Fecha de registro','Commission Tier':'Nivel de comisión','Wager Volume':'Volumen de actividad','Commission Earned':'Comisión obtenida',
    'NOWPayments Crypto Deposit':'Depósito cripto de NOWPayments','Instant deposit with zero platform fees':'Depósito instantáneo sin comisiones de plataforma','Create NOWPayments Invoice':'Crear factura de NOWPayments',
    'Available Balance':'Saldo disponible','Transaction History':'Historial de transacciones','Withdraw USDT':'Retirar USDT','Submit Withdrawal':'Enviar retiro','Wallet':'Billetera','Referral Link':'Enlace de referido','Event Participation Status':'Estado de participación','Refresh':'Actualizar','Loading...':'Cargando...','Processing...':'Procesando...','Edit':'Editar','Logout':'Cerrar sesión','Member':'Miembro','USDT Account':'Cuenta USDT','Join Live Room':'Unirse a la sala en vivo','Chat':'Chat','Send':'Enviar','Type a message':'Escribe un mensaje'
  },
  pt: {
    'Viewer Username Raffle Spinner':'Roleta de nomes dos espectadores','Live Participants Only':'Apenas participantes da live','Recent Raffle Winners':'Vencedores recentes',
    'Digital Crypto Card Number Guess':'Adivinhe o número do cartão cripto','Streamer Card Settings':'Configurações do cartão do streamer','Streamer Card Configurator':'Configurador do cartão','Card Title':'Título do cartão','Serial Number':'Número de série','Concealed':'Oculto','Revealed':'Revelado','Verify Challenge':'Verificar desafio','Provably Fair Verification':'Verificação comprovadamente justa',
    'Affiliate Partner Program':'Programa de parceiros afiliados','Your Personal Affiliate Link':'Seu link de afiliado pessoal','Direct Invitations':'Convites diretos','Network Invites':'Convites da rede','Deep Ecosystem':'Ecossistema profundo','Affiliate Income Calculator':'Calculadora de ganhos de afiliados','Estimated Monthly Earnings':'Ganhos mensais estimados','Live Referral Feed':'Feed de indicações ao vivo','Referee Handle':'Usuário indicado','Date Joined':'Data de entrada','Commission Tier':'Nível de comissão','Wager Volume':'Volume de atividade','Commission Earned':'Comissão recebida',
    'NOWPayments Crypto Deposit':'Depósito cripto NOWPayments','Instant deposit with zero platform fees':'Depósito instantâneo sem taxas da plataforma','Create NOWPayments Invoice':'Criar fatura NOWPayments',
    'Available Balance':'Saldo disponível','Transaction History':'Histórico de transações','Withdraw USDT':'Sacar USDT','Submit Withdrawal':'Enviar saque','Wallet':'Carteira','Referral Link':'Link de indicação','Event Participation Status':'Status de participação','Refresh':'Atualizar','Loading...':'Carregando...','Processing...':'Processando...','Edit':'Editar','Logout':'Sair','Member':'Membro','USDT Account':'Conta USDT','Join Live Room':'Entrar na Live Room','Chat':'Chat','Send':'Enviar','Type a message':'Digite uma mensagem'
  },
  zh: {
    'Viewer Username Raffle Spinner':'观众用户名抽奖转盘','Live Participants Only':'仅限直播参与者','Recent Raffle Winners':'最近中奖者','Digital Crypto Card Number Guess':'数字加密卡号码竞猜','Streamer Card Settings':'主播卡片设置','Streamer Card Configurator':'主播卡片配置器','Card Title':'卡片标题','Serial Number':'序列号','Concealed':'隐藏','Revealed':'已揭示','Verify Challenge':'验证挑战','Provably Fair Verification':'公平性验证',
    'Affiliate Partner Program':'联盟合作伙伴计划','Your Personal Affiliate Link':'您的专属推广链接','Direct Invitations':'直接邀请','Network Invites':'网络邀请','Deep Ecosystem':'深度生态','Affiliate Income Calculator':'联盟收益计算器','Estimated Monthly Earnings':'预计月收益','Live Referral Feed':'实时推荐动态','Referee Handle':'被推荐用户','Date Joined':'加入日期','Commission Tier':'佣金等级','Wager Volume':'活动量','Commission Earned':'获得佣金',
    'NOWPayments Crypto Deposit':'NOWPayments 加密货币充值','Instant deposit with zero platform fees':'即时充值，平台零手续费','Create NOWPayments Invoice':'创建 NOWPayments 发票','Available Balance':'可用余额','Transaction History':'交易记录','Withdraw USDT':'提现 USDT','Submit Withdrawal':'提交提现','Wallet':'钱包','Referral Link':'推荐链接','Event Participation Status':'活动参与状态','Refresh':'刷新','Loading...':'加载中...','Processing...':'处理中...','Edit':'编辑','Logout':'退出登录','Member':'会员','USDT Account':'USDT 账户','Join Live Room':'加入直播间','Chat':'聊天','Send':'发送','Type a message':'输入消息'
  },
  ja: {
    'Viewer Username Raffle Spinner':'視聴者ユーザー名抽選スピナー','Live Participants Only':'ライブ参加者のみ','Recent Raffle Winners':'最近の抽選当選者','Digital Crypto Card Number Guess':'デジタル暗号カード番号当て','Streamer Card Settings':'配信者カード設定','Streamer Card Configurator':'配信者カード設定ツール','Card Title':'カードタイトル','Serial Number':'シリアル番号','Concealed':'非公開','Revealed':'公開','Verify Challenge':'チャレンジを確認','Provably Fair Verification':'公平性の検証',
    'Affiliate Partner Program':'アフィリエイトパートナープログラム','Your Personal Affiliate Link':'あなた専用のアフィリエイトリンク','Direct Invitations':'直接招待','Network Invites':'ネットワーク招待','Deep Ecosystem':'深いエコシステム','Affiliate Income Calculator':'アフィリエイト収益計算機','Estimated Monthly Earnings':'月間予想収益','Live Referral Feed':'ライブ紹介フィード','Referee Handle':'紹介ユーザー','Date Joined':'参加日','Commission Tier':'コミッションレベル','Wager Volume':'アクティビティ量','Commission Earned':'獲得コミッション',
    'NOWPayments Crypto Deposit':'NOWPayments暗号資産入金','Instant deposit with zero platform fees':'プラットフォーム手数料なしの即時入金','Create NOWPayments Invoice':'NOWPayments請求書を作成','Available Balance':'利用可能残高','Transaction History':'取引履歴','Withdraw USDT':'USDTを出金','Submit Withdrawal':'出金を申請','Wallet':'ウォレット','Referral Link':'紹介リンク','Event Participation Status':'イベント参加状況','Refresh':'更新','Loading...':'読み込み中...','Processing...':'処理中...','Edit':'編集','Logout':'ログアウト','Member':'メンバー','USDT Account':'USDTアカウント','Join Live Room':'ライブルームに参加','Chat':'チャット','Send':'送信','Type a message':'メッセージを入力'
  },
  ko: {
    'Viewer Username Raffle Spinner':'시청자 사용자명 추첨 스피너','Live Participants Only':'라이브 참가자만','Recent Raffle Winners':'최근 추첨 당첨자','Digital Crypto Card Number Guess':'디지털 암호 카드 번호 맞히기','Streamer Card Settings':'스트리머 카드 설정','Streamer Card Configurator':'스트리머 카드 구성기','Card Title':'카드 제목','Serial Number':'일련번호','Concealed':'숨김','Revealed':'공개','Verify Challenge':'챌린지 확인','Provably Fair Verification':'공정성 검증',
    'Affiliate Partner Program':'제휴 파트너 프로그램','Your Personal Affiliate Link':'개인 제휴 링크','Direct Invitations':'직접 초대','Network Invites':'네트워크 초대','Deep Ecosystem':'확장 생태계','Affiliate Income Calculator':'제휴 수익 계산기','Estimated Monthly Earnings':'예상 월 수익','Live Referral Feed':'실시간 추천 피드','Referee Handle':'추천 사용자','Date Joined':'가입일','Commission Tier':'커미션 등급','Wager Volume':'활동량','Commission Earned':'획득 커미션',
    'NOWPayments Crypto Deposit':'NOWPayments 암호화폐 입금','Instant deposit with zero platform fees':'플랫폼 수수료 없는 즉시 입금','Create NOWPayments Invoice':'NOWPayments 인보이스 생성','Available Balance':'사용 가능 잔액','Transaction History':'거래 내역','Withdraw USDT':'USDT 출금','Submit Withdrawal':'출금 신청','Wallet':'지갑','Referral Link':'추천 링크','Event Participation Status':'이벤트 참여 상태','Refresh':'새로고침','Loading...':'불러오는 중...','Processing...':'처리 중...','Edit':'편집','Logout':'로그아웃','Member':'회원','USDT Account':'USDT 계정','Join Live Room':'라이브 룸 참여','Chat':'채팅','Send':'전송','Type a message':'메시지 입력'
  },
  ar: {
    'Viewer Username Raffle Spinner':'عجلة سحب أسماء المشاهدين','Live Participants Only':'المشاركون في البث فقط','Recent Raffle Winners':'الفائزون في السحب الأخير','Digital Crypto Card Number Guess':'تخمين رقم البطاقة الرقمية المشفرة','Streamer Card Settings':'إعدادات بطاقة البث','Streamer Card Configurator':'مُكوّن بطاقة البث','Card Title':'عنوان البطاقة','Serial Number':'الرقم التسلسلي','Concealed':'مخفي','Revealed':'مكشوف','Verify Challenge':'تحقق من التحدي','Provably Fair Verification':'التحقق من العدالة',
    'Affiliate Partner Program':'برنامج شركاء الإحالة','Your Personal Affiliate Link':'رابط الإحالة الشخصي','Direct Invitations':'الدعوات المباشرة','Network Invites':'دعوات الشبكة','Deep Ecosystem':'النظام البيئي المتكامل','Affiliate Income Calculator':'حاسبة دخل الإحالة','Estimated Monthly Earnings':'الأرباح الشهرية المقدرة','Live Referral Feed':'تغذية الإحالات المباشرة','Referee Handle':'المستخدم المُحال','Date Joined':'تاريخ الانضمام','Commission Tier':'مستوى العمولة','Wager Volume':'حجم النشاط','Commission Earned':'العمولة المكتسبة',
    'NOWPayments Crypto Deposit':'إيداع العملات المشفرة عبر NOWPayments','Instant deposit with zero platform fees':'إيداع فوري بدون رسوم منصة','Create NOWPayments Invoice':'إنشاء فاتورة NOWPayments','Available Balance':'الرصيد المتاح','Transaction History':'سجل المعاملات','Withdraw USDT':'سحب USDT','Submit Withdrawal':'إرسال طلب السحب','Wallet':'المحفظة','Referral Link':'رابط الإحالة','Event Participation Status':'حالة المشاركة في الفعالية','Refresh':'تحديث','Loading...':'جارٍ التحميل...','Processing...':'جارٍ المعالجة...','Edit':'تعديل','Logout':'تسجيل الخروج','Member':'عضو','USDT Account':'حساب USDT','Join Live Room':'الانضمام إلى الغرفة المباشرة','Chat':'الدردشة','Send':'إرسال','Type a message':'اكتب رسالة'
  },
};

// Global UI coverage for all application pages. These keys are also used by the
// DOM fallback so pages that still contain legacy hardcoded labels follow the
// selected language immediately.
const GLOBAL_UI_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'SYS STREAM LOADING':'SYS STREAM MEMUAT','Initializing TikTok Live Sync + Cloudflare D1 Connection':'Menginisialisasi sinkronisasi TikTok Live + koneksi Cloudflare D1',
    'Live Room':'Live Room','Live Room Aktif':'Live Room Aktif','Live belum aktif':'Live belum aktif',
    'Masuk untuk bergabung ke Live Room':'Masuk untuk bergabung ke Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Setiap akun memiliki profil dan identitasnya sendiri di dalam room.',
    'Peserta Live':'Peserta Live','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Hanya akun yang benar-benar bergabung yang ditampilkan.',
    'Memuat peserta...':'Memuat peserta...','Belum ada peserta lain.':'Belum ada peserta lain.','Belum ada peserta.':'Belum ada peserta.',
    'Profil akun Anda':'Profil akun Anda','Belum ada deskripsi room dari pemilik room.':'Belum ada deskripsi room dari pemilik room.',
    'Hanya data live produksi yang ditampilkan.':'Hanya data live produksi yang ditampilkan.','Tidak ada video atau streamer contoh.':'Tidak ada video atau streamer contoh.',
    'LOGIN / REGISTER':'MASUK / DAFTAR','CHAT':'CHAT','PESERTA':'PESERTA','Kirim':'Kirim','Tulis pesan':'Tulis pesan',
    'Like gagal dikirim.':'Like gagal dikirim.','Gagal memuat live room.':'Gagal memuat live room.','Aksi live room gagal.':'Aksi live room gagal.',
    'Minimum withdrawal is':'Minimum penarikan adalah','Masukkan alamat wallet tujuan.':'Masukkan alamat wallet tujuan.','Saldo tersedia tidak mencukupi.':'Saldo tersedia tidak mencukupi.',
    'Penarikan gagal.':'Penarikan gagal.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'Permintaan penarikan berhasil dibuat dan menunggu proses.',
    'Halo,':'Halo,','Buka Live Room →':'Buka Live Room →','Bonus pendaftaran masih tersedia untuk diklaim.':'Bonus pendaftaran masih tersedia untuk diklaim.'
  },
  en: {
    'SYS STREAM LOADING':'SYS STREAM LOADING','Initializing TikTok Live Sync + Cloudflare D1 Connection':'Initializing TikTok Live Sync + Cloudflare D1 Connection',
    'Live Room':'Live Room','Live Room Aktif':'Live Room Active','Live belum aktif':'Live is not active',
    'Masuk untuk bergabung ke Live Room':'Login to join the Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Each account has its own profile and identity in the room.',
    'Peserta Live':'Live Participants','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Only accounts that actually joined are shown.',
    'Memuat peserta...':'Loading participants...','Belum ada peserta lain.':'No other participants yet.','Belum ada peserta.':'No participants yet.',
    'Profil akun Anda':'Your account profile','Belum ada deskripsi room dari pemilik room.':'No room description from the room owner yet.',
    'Hanya data live produksi yang ditampilkan.':'Only production live data is displayed.','Tidak ada video atau streamer contoh.':'No sample video or streamer is shown.',
    'LOGIN / REGISTER':'LOGIN / REGISTER','CHAT':'CHAT','PESERTA':'PARTICIPANTS','Kirim':'Send','Tulis pesan':'Type a message',
    'Like gagal dikirim.':'Like could not be sent.','Gagal memuat live room.':'Failed to load the live room.','Aksi live room gagal.':'Live room action failed.',
    'Minimum withdrawal is':'Minimum withdrawal is','Masukkan alamat wallet tujuan.':'Enter the destination wallet address.','Saldo tersedia tidak mencukupi.':'Insufficient available balance.',
    'Penarikan gagal.':'Withdrawal failed.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'Withdrawal request created and awaiting processing.',
    'Halo,':'Hello,','Buka Live Room →':'Open Live Room →','Bonus pendaftaran masih tersedia untuk diklaim.':'Registration bonus is still available to claim.'
  },
  es: {
    'SYS STREAM LOADING':'CARGANDO SYS STREAM','Initializing TikTok Live Sync + Cloudflare D1 Connection':'Inicializando sincronización de TikTok Live + conexión Cloudflare D1',
    'Live Room':'Sala en vivo','Live Room Aktif':'Sala en vivo activa','Live belum aktif':'La sala en vivo no está activa',
    'Masuk untuk bergabung ke Live Room':'Inicia sesión para unirte a la sala en vivo','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Cada cuenta tiene su propio perfil e identidad en la sala.',
    'Peserta Live':'Participantes en vivo','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Solo se muestran las cuentas que realmente se unieron.',
    'Memuat peserta...':'Cargando participantes...','Belum ada peserta lain.':'Aún no hay otros participantes.','Belum ada peserta.':'No hay participantes.',
    'Profil akun Anda':'Perfil de tu cuenta','Belum ada deskripsi room dari pemilik room.':'Aún no hay descripción del propietario.',
    'Hanya data live produksi yang ditampilkan.':'Solo se muestran datos de producción.','Tidak ada video atau streamer contoh.':'No se muestra ningún video o streamer de ejemplo.',
    'LOGIN / REGISTER':'INICIAR SESIÓN / REGISTRARSE','CHAT':'CHAT','PESERTA':'PARTICIPANTES','Kirim':'Enviar','Tulis pesan':'Escribe un mensaje',
    'Like gagal dikirim.':'No se pudo enviar el Me gusta.','Gagal memuat live room.':'No se pudo cargar la sala en vivo.','Aksi live room gagal.':'La acción de la sala en vivo falló.',
    'Masukkan alamat wallet tujuan.':'Introduce la dirección de la billetera.','Saldo tersedia tidak mencukupi.':'Saldo disponible insuficiente.','Penarikan gagal.':'Retiro fallido.',
    'Halo,':'Hola,','Buka Live Room →':'Abrir sala en vivo →','Bonus pendaftaran masih tersedia untuk diklaim.':'El bono de registro todavía se puede reclamar.'
  },
  pt: {
    'SYS STREAM LOADING':'CARREGANDO SYS STREAM','Initializing TikTok Live Sync + Cloudflare D1 Connection':'Inicializando sincronização do TikTok Live + conexão Cloudflare D1',
    'Live Room':'Sala ao vivo','Live Room Aktif':'Sala ao vivo ativa','Live belum aktif':'A sala ao vivo não está ativa',
    'Masuk untuk bergabung ke Live Room':'Entre para participar da sala ao vivo','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Cada conta tem seu próprio perfil e identidade na sala.',
    'Peserta Live':'Participantes da live','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Apenas contas que realmente entraram são exibidas.',
    'Memuat peserta...':'Carregando participantes...','Belum ada peserta lain.':'Ainda não há outros participantes.','Belum ada peserta.':'Ainda não há participantes.',
    'Profil akun Anda':'Perfil da sua conta','Belum ada deskripsi room dari pemilik room.':'Ainda não há descrição do proprietário.',
    'Hanya data live produksi yang ditampilkan.':'Apenas dados de produção são exibidos.','Tidak ada video atau streamer contoh.':'Nenhum vídeo ou streamer de exemplo é exibido.',
    'LOGIN / REGISTER':'ENTRAR / REGISTRAR','CHAT':'CHAT','PESERTA':'PARTICIPANTES','Kirim':'Enviar','Tulis pesan':'Digite uma mensagem',
    'Like gagal dikirim.':'Não foi possível enviar a curtida.','Gagal memuat live room.':'Falha ao carregar a sala ao vivo.','Aksi live room gagal.':'A ação da sala ao vivo falhou.',
    'Masukkan alamat wallet tujuan.':'Informe o endereço da carteira.','Saldo tersedia tidak mencukupi.':'Saldo disponível insuficiente.','Penarikan gagal.':'Falha no saque.',
    'Halo,':'Olá,','Buka Live Room →':'Abrir sala ao vivo →','Bonus pendaftaran masih tersedia untuk diklaim.':'O bônus de registro ainda pode ser resgatado.'
  },
  zh: {
    'SYS STREAM LOADING':'SYS STREAM 加载中','Initializing TikTok Live Sync + Cloudflare D1 Connection':'正在初始化 TikTok Live 同步 + Cloudflare D1 连接',
    'Live Room':'直播间','Live Room Aktif':'直播间已开启','Live belum aktif':'直播间尚未开启',
    'Masuk untuk bergabung ke Live Room':'登录以加入直播间','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'每个账户在直播间都有独立的个人资料和身份。',
    'Peserta Live':'直播参与者','Hanya akun yang benar-benar bergabung yang ditampilkan.':'仅显示实际加入的账户。',
    'Memuat peserta...':'正在加载参与者…','Belum ada peserta lain.':'暂无其他参与者。','Belum ada peserta.':'暂无参与者。',
    'Profil akun Anda':'您的账户资料','Belum ada deskripsi room dari pemilik room.':'暂无房主提供的房间描述。',
    'Hanya data live produksi yang ditampilkan.':'仅显示生产环境直播数据。','Tidak ada video atau streamer contoh.':'不显示示例视频或主播。',
    'LOGIN / REGISTER':'登录 / 注册','CHAT':'聊天','PESERTA':'参与者','Kirim':'发送','Tulis pesan':'输入消息',
    'Like gagal dikirim.':'点赞发送失败。','Gagal memuat live room.':'加载直播间失败。','Aksi live room gagal.':'直播间操作失败。',
    'Masukkan alamat wallet tujuan.':'请输入目标钱包地址。','Saldo tersedia tidak mencukupi.':'可用余额不足。','Penarikan gagal.':'提现失败。',
    'Halo,':'你好，','Buka Live Room →':'打开直播间 →','Bonus pendaftaran masih tersedia untuk diklaim.':'注册奖励仍可领取。'
  },
  ja: {
    'SYS STREAM LOADING':'SYS STREAM 読み込み中','Initializing TikTok Live Sync + Cloudflare D1 Connection':'TikTok Live同期 + Cloudflare D1接続を初期化しています',
    'Live Room':'ライブ配信ルーム','Live Room Aktif':'ライブ配信ルームは有効です','Live belum aktif':'ライブ配信はまだ有効ではありません',
    'Masuk untuk bergabung ke Live Room':'ログインしてライブ配信ルームに参加','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'各アカウントにはルーム内で固有のプロフィールとIDがあります。',
    'Peserta Live':'ライブ参加者','Hanya akun yang benar-benar bergabung yang ditampilkan.':'実際に参加したアカウントのみ表示されます。',
    'Memuat peserta...':'参加者を読み込み中…','Belum ada peserta lain.':'他の参加者はいません。','Belum ada peserta.':'参加者はいません。',
    'Profil akun Anda':'あなたのアカウントプロフィール','Belum ada deskripsi room dari pemilik room.':'ルーム所有者の説明はまだありません。',
    'Hanya data live produksi yang ditampilkan.':'本番のライブデータのみ表示されます。','Tidak ada video atau streamer contoh.':'サンプル動画や配信者は表示されません。',
    'LOGIN / REGISTER':'ログイン / 登録','CHAT':'チャット','PESERTA':'参加者','Kirim':'送信','Tulis pesan':'メッセージを入力',
    'Like gagal dikirim.':'いいねを送信できませんでした。','Gagal memuat live room.':'ライブ配信ルームの読み込みに失敗しました。','Aksi live room gagal.':'ライブ配信ルームの操作に失敗しました。',
    'Masukkan alamat wallet tujuan.':'送金先ウォレットアドレスを入力してください。','Saldo tersedia tidak mencukupi.':'利用可能残高が不足しています。','Penarikan gagal.':'出金に失敗しました。',
    'Halo,':'こんにちは、','Buka Live Room →':'ライブ配信ルームを開く →','Bonus pendaftaran masih tersedia untuk diklaim.':'登録ボーナスをまだ受け取れます。'
  },
  ko: {
    'SYS STREAM LOADING':'SYS STREAM 로딩 중','Initializing TikTok Live Sync + Cloudflare D1 Connection':'TikTok Live 동기화 + Cloudflare D1 연결 초기화 중',
    'Live Room':'라이브 룸','Live Room Aktif':'라이브 룸 활성','Live belum aktif':'라이브 룸이 아직 활성화되지 않았습니다',
    'Masuk untuk bergabung ke Live Room':'로그인하여 라이브 룸에 참여하세요','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'각 계정은 룸에서 고유한 프로필과 신원을 가집니다.',
    'Peserta Live':'라이브 참가자','Hanya akun yang benar-benar bergabung yang ditampilkan.':'실제로 참여한 계정만 표시됩니다.',
    'Memuat peserta...':'참가자 불러오는 중…','Belum ada peserta lain.':'아직 다른 참가자가 없습니다.','Belum ada peserta.':'참가자가 없습니다.',
    'Profil akun Anda':'내 계정 프로필','Belum ada deskripsi room dari pemilik room.':'룸 소유자의 설명이 아직 없습니다.',
    'Hanya data live produksi yang ditampilkan.':'프로덕션 라이브 데이터만 표시됩니다.','Tidak ada video atau streamer contoh.':'샘플 영상이나 스트리머는 표시되지 않습니다.',
    'LOGIN / REGISTER':'로그인 / 가입','CHAT':'채팅','PESERTA':'참가자','Kirim':'전송','Tulis pesan':'메시지 입력',
    'Like gagal dikirim.':'좋아요를 보내지 못했습니다.','Gagal memuat live room.':'라이브 룸을 불러오지 못했습니다.','Aksi live room gagal.':'라이브 룸 작업에 실패했습니다.',
    'Masukkan alamat wallet tujuan.':'목적지 지갑 주소를 입력하세요.','Saldo tersedia tidak mencukupi.':'사용 가능한 잔액이 부족합니다.','Penarikan gagal.':'출금에 실패했습니다.',
    'Halo,':'안녕하세요,','Buka Live Room →':'라이브 룸 열기 →','Bonus pendaftaran masih tersedia untuk diklaim.':'가입 보너스를 아직 받을 수 있습니다.'
  },
  ar: {
    'SYS STREAM LOADING':'جارٍ تحميل SYS STREAM','Initializing TikTok Live Sync + Cloudflare D1 Connection':'جارٍ تهيئة مزامنة TikTok Live + اتصال Cloudflare D1',
    'Live Room':'الغرفة المباشرة','Live Room Aktif':'الغرفة المباشرة نشطة','Live belum aktif':'الغرفة المباشرة غير نشطة',
    'Masuk untuk bergabung ke Live Room':'سجّل الدخول للانضمام إلى الغرفة المباشرة','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'لكل حساب ملف وهوية خاصة به داخل الغرفة.',
    'Peserta Live':'المشاركون في البث','Hanya akun yang benar-benar bergabung yang ditampilkan.':'تظهر فقط الحسابات التي انضمت فعليًا.',
    'Memuat peserta...':'جارٍ تحميل المشاركين…','Belum ada peserta lain.':'لا يوجد مشاركون آخرون بعد.','Belum ada peserta.':'لا يوجد مشاركون.',
    'Profil akun Anda':'ملف حسابك','Belum ada deskripsi room dari pemilik room.':'لا يوجد وصف من مالك الغرفة بعد.',
    'Hanya data live produksi yang ditampilkan.':'تظهر فقط بيانات البث الإنتاجية.','Tidak ada video atau streamer contoh.':'لا يتم عرض فيديو أو مقدم بث تجريبي.',
    'LOGIN / REGISTER':'تسجيل الدخول / إنشاء حساب','CHAT':'الدردشة','PESERTA':'المشاركون','Kirim':'إرسال','Tulis pesan':'اكتب رسالة',
    'Like gagal dikirim.':'تعذر إرسال الإعجاب.','Gagal memuat live room.':'تعذر تحميل الغرفة المباشرة.','Aksi live room gagal.':'فشل إجراء الغرفة المباشرة.',
    'Masukkan alamat wallet tujuan.':'أدخل عنوان المحفظة المستهدفة.','Saldo tersedia tidak mencukupi.':'الرصيد المتاح غير كافٍ.','Penarikan gagal.':'فشل السحب.',
    'Halo,':'مرحباً،','Buka Live Room →':'فتح الغرفة المباشرة →','Bonus pendaftaran masih tersedia untuk diklaim.':'لا تزال مكافأة التسجيل متاحة للاستلام.'
  }
};

(Object.keys(GLOBAL_UI_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...GLOBAL_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

(Object.keys(COMMON_PAGE_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...COMMON_PAGE_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('sys_stream_language_v2') as LanguageCode | null;
    return saved && LANGUAGES.some(l => l.code === saved) ? saved : 'en';
  });

  const setLanguage = (next: LanguageCode) => {
    const safeLanguage = LANGUAGES.some(l => l.code === next) ? next : 'en';
    setLanguageState(safeLanguage);
    localStorage.setItem('sys_stream_language_v2', safeLanguage);
  };

  useEffect(() => {
    const config = getLocaleConfig(language);
    document.documentElement.lang = config.locale;
    document.documentElement.dir = config.direction;
    document.documentElement.dataset.language = language;
    document.documentElement.dataset.currency = config.currency;
    document.documentElement.dataset.locale = config.locale;
  }, [language]);

  const translatePageText = React.useCallback(() => {
    const dict = PAGE_UI_TRANSLATIONS[language] || {};
    const reverse = Object.fromEntries(
      Object.entries(PAGE_UI_TRANSLATIONS).flatMap(([lang, values]) =>
        lang === language ? [] : Object.entries(values).map(([source, translated]) => [translated, source])
      )
    ) as Record<string, string>;

    const translateValue = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || trimmed.length > 240) return value;
      const source = trimmed;
      const original = reverse[source] || source;
      const translated = dict[original];
      if (!translated) return value;
      const leading = value.slice(0, value.indexOf(trimmed));
      const trailing = value.slice(value.indexOf(trimmed) + trimmed.length);
      return leading + translated + trailing;
    };

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) nodes.push(node as Text);

    nodes.forEach((textNode) => {
      const raw = textNode.nodeValue || '';
      if (!raw.trim()) return;
      const element = textNode.parentElement;
      if (element?.closest('script,style,noscript,textarea')) return;

      // Preserve the original source label so changing language never translates
      // an already-translated value and switching languages works repeatedly.
      const source = ORIGINAL_TEXT_NODES.get(textNode) ?? raw;
      if (!ORIGINAL_TEXT_NODES.has(textNode)) ORIGINAL_TEXT_NODES.set(textNode, raw);
      const translated = translateValue(source);
      if (translated !== raw) textNode.nodeValue = translated;
    });

    const elements = Array.from(document.querySelectorAll<HTMLElement>(
      '[placeholder],[title],[aria-label],[data-i18n]'
    ));
    elements.forEach((el) => {
      const attrs = ['placeholder', 'title', 'aria-label'] as const;
      attrs.forEach((attr) => {
        const current = el.getAttribute(attr);
        if (!current) return;
        const key = el.getAttribute(`data-i18n-${attr}`) || current;
        const translated = dict[key] || reverse[key] && dict[reverse[key]];
        if (translated) {
          el.setAttribute(`data-i18n-${attr}`, key);
          el.setAttribute(attr, translated);
        }
      });
    });
  }, [language]);

  useEffect(() => {
    translatePageText();
    const observer = new MutationObserver(() => translatePageText());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [translatePageText]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: string) => translations[language][key] ?? PAGE_UI_TRANSLATIONS[language]?.[key] ?? translations.en[key] ?? PAGE_UI_TRANSLATIONS.en?.[key] ?? key,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
