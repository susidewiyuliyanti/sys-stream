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

// Blind Box minimum lock is fixed at $4 USD and displayed in the user's selected global currency.
export const MIN_BLINDBOX_LOCK_USD = 4;
export const USD_TO_IDR = 17937;
export const MIN_BLINDBOX_LOCK_IDR = Math.round(MIN_BLINDBOX_LOCK_USD * USD_TO_IDR);

export function getMinimumBlindBoxLockIdr(language: LanguageCode): number {
  return MIN_BLINDBOX_LOCK_IDR;
}

export function formatMinimumBlindBoxLock(language: LanguageCode): string {
  const idrPerUnit = IDR_PER_CURRENCY_UNIT[language] ?? USD_TO_IDR;
  const amount = MIN_BLINDBOX_LOCK_IDR / idrPerUnit;
  return formatLocalizedCurrency(amount, language, getLocaleConfig(language).currency);
}

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
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Siaran langsung, komunitas, dan postingan pengguna SYS STREAM.',
    'Production data is used for all content and activity on this page.': 'Konten dan aktivitas di halaman ini menggunakan data produksi.',
    'Every user can share posts and updates.': 'Setiap pengguna dapat membagikan postingan dan pembaruan.',
    'Community Posts': 'Postingan Komunitas',
    'Claim Bonus': 'Klaim Bonus',
    'Registration Bonus': 'Bonus Pendaftaran',
    Locked: 'Terkunci',
    Available: 'Tersedia',
    'Upload / Create': 'Unggah / Buat',
    Airdrop: 'Airdrop',
    Games: 'Permainan',
    'Live Now': 'Live Sekarang',
    Workspace: 'Ruang Kerja',
    Home: 'Beranda', Earn: 'Dapatkan', Board: 'Papan Peringkat', Profile: 'Profil', Language: 'Bahasa',
    Login: 'Masuk', Register: 'Daftar', 'Welcome Back': 'Selamat Datang Kembali',
    'Create SYS Account': 'Buat Akun SYS', 'Username or Email': 'Username atau Email',
    Email: 'Email', Password: 'Kata Sandi', 'Remember me': 'Ingat saya',
    'Edit Profile & Avatar': 'Kelola Profil & Foto', 'Display Username': 'Nama Pengguna',
    'Profile Photo': 'Foto Profil', 'Upload photo from device': 'Unggah foto dari perangkat',
    'Change photo from device': 'Ganti foto dari perangkat', Cancel: 'Batal',
    'Save Changes': 'Simpan Perubahan', 'Locked Balance': 'Saldo Terkunci',
    'Total Earnings': 'Total Pendapatan', 'Deposit Crypto': 'Deposit Kripto',
    'Lock History': 'Riwayat Lock', 'Log Out': 'Keluar', Notifications: 'Notifikasi',
    'No unread notifications at this time.': 'Tidak ada notifikasi baru saat ini.',
    '30 DAYS': '30 HARI', '60 DAYS': '60 HARI', '90 DAYS': '90 HARI',
  },
  en: {
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Live streams, communities, and posts from SYS STREAM users.',
    'Production data is used for all content and activity on this page.': 'Production data is used for all content and activity on this page.',
    'Every user can share posts and updates.': 'Every user can share posts and updates.',
    'Community Posts': 'Community Posts', 'Claim Bonus': 'Claim Bonus', 'Registration Bonus': 'Registration Bonus',
    Locked: 'Locked', Available: 'Available', 'Upload / Create': 'Upload / Create',
    Airdrop: 'Airdrop', Games: 'Games', 'Live Now': 'Live Now', Workspace: 'Workspace',
    Home: 'Home', Earn: 'Earn', Board: 'Leaderboard', Profile: 'Profile', Language: 'Language',
    Login: 'Login', Register: 'Register', 'Welcome Back': 'Welcome Back',
    'Create SYS Account': 'Create SYS Account', 'Username or Email': 'Username or Email',
    Email: 'Email', Password: 'Password', 'Remember me': 'Remember me',
    'Edit Profile & Avatar': 'Edit Profile & Avatar', 'Display Username': 'Display Username',
    'Profile Photo': 'Profile Photo', 'Upload photo from device': 'Upload photo from device',
    'Change photo from device': 'Change photo from device', Cancel: 'Cancel',
    'Save Changes': 'Save Changes', 'Locked Balance': 'Locked Balance',
    'Total Earnings': 'Total Earnings', 'Deposit Crypto': 'Deposit Crypto',
    'Lock History': 'Lock History', 'Log Out': 'Log Out', Notifications: 'Notifications',
    'No unread notifications at this time.': 'No unread notifications at this time.',
    '30 DAYS': '30 DAYS', '60 DAYS': '60 DAYS', '90 DAYS': '90 DAYS',
  },
  es: {
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Transmisiones en vivo, comunidades y publicaciones de usuarios de SYS STREAM.',
    'Production data is used for all content and activity on this page.': 'Los datos de producción se utilizan para todo el contenido y la actividad de esta página.',
    'Every user can share posts and updates.': 'Cada usuario puede compartir publicaciones y actualizaciones.',
    'Community Posts': 'Publicaciones de la comunidad', 'Claim Bonus': 'Reclamar bono', 'Registration Bonus': 'Bono de registro',
    Locked: 'Bloqueado', Available: 'Disponible', 'Upload / Create': 'Subir / Crear',
    Airdrop: 'Airdrop', Games: 'Juegos', 'Live Now': 'En directo', Workspace: 'Espacio de trabajo',
    Home: 'Inicio', Earn: 'Ganar', Board: 'Clasificación', Profile: 'Perfil', Language: 'Idioma',
    Login: 'Iniciar sesión', Register: 'Registrarse', 'Welcome Back': 'Bienvenido de nuevo',
    'Create SYS Account': 'Crear cuenta SYS', 'Username or Email': 'Usuario o correo electrónico',
    Email: 'Correo electrónico', Password: 'Contraseña', 'Remember me': 'Recordarme',
    'Edit Profile & Avatar': 'Gestionar perfil y foto', 'Display Username': 'Nombre de usuario',
    'Profile Photo': 'Foto de perfil', 'Upload photo from device': 'Subir foto del dispositivo',
    'Change photo from device': 'Cambiar foto del dispositivo', Cancel: 'Cancelar',
    'Save Changes': 'Guardar cambios', 'Locked Balance': 'Saldo bloqueado',
    'Total Earnings': 'Ganancias totales', 'Deposit Crypto': 'Depositar criptomonedas',
    'Lock History': 'Historial de bloqueo', 'Log Out': 'Cerrar sesión', Notifications: 'Notificaciones',
    'No unread notifications at this time.': 'No hay notificaciones nuevas en este momento.',
    '30 DAYS': '30 DÍAS', '60 DAYS': '60 DÍAS', '90 DAYS': '90 DÍAS',
  },
  pt: {
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Transmissões ao vivo, comunidades e publicações de usuários do SYS STREAM.',
    'Production data is used for all content and activity on this page.': 'Os dados de produção são usados para todo o conteúdo e atividade desta página.',
    'Every user can share posts and updates.': 'Cada usuário pode compartilhar publicações e atualizações.',
    'Community Posts': 'Publicações da comunidade', 'Claim Bonus': 'Resgatar bônus', 'Registration Bonus': 'Bônus de cadastro',
    Locked: 'Bloqueado', Available: 'Disponível', 'Upload / Create': 'Enviar / Criar',
    Airdrop: 'Airdrop', Games: 'Jogos', 'Live Now': 'Ao vivo agora', Workspace: 'Espaço de trabalho',
    Home: 'Início', Earn: 'Ganhar', Board: 'Classificação', Profile: 'Perfil', Language: 'Idioma',
    Login: 'Entrar', Register: 'Registrar', 'Welcome Back': 'Bem-vindo de volta',
    'Create SYS Account': 'Criar conta SYS', 'Username or Email': 'Usuário ou e-mail',
    Email: 'E-mail', Password: 'Senha', 'Remember me': 'Lembrar de mim',
    'Edit Profile & Avatar': 'Gerenciar perfil e foto', 'Display Username': 'Nome de usuário',
    'Profile Photo': 'Foto do perfil', 'Upload photo from device': 'Enviar foto do dispositivo',
    'Change photo from device': 'Alterar foto do dispositivo', Cancel: 'Cancelar',
    'Save Changes': 'Salvar alterações', 'Locked Balance': 'Saldo bloqueado',
    'Total Earnings': 'Ganhos totais', 'Deposit Crypto': 'Depositar cripto',
    'Lock History': 'Histórico de bloqueios', 'Log Out': 'Sair', Notifications: 'Notificações',
    'No unread notifications at this time.': 'Não há novas notificações no momento.',
    '30 DAYS': '30 DIAS', '60 DAYS': '60 DIAS', '90 DAYS': '90 DIAS',
  },
  zh: {
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'SYS STREAM 用户的直播、社区和帖子。',
    'Production data is used for all content and activity on this page.': '此页面的所有内容和活动均使用生产数据。',
    'Every user can share posts and updates.': '每位用户都可以分享帖子和动态。',
    'Community Posts': '社区帖子', 'Claim Bonus': '领取奖励', 'Registration Bonus': '注册奖励',
    Locked: '已锁定', Available: '可用', 'Upload / Create': '上传 / 创建',
    Airdrop: '空投', Games: '游戏', 'Live Now': '正在直播', Workspace: '工作区',
    Home: '首页', Earn: '赚取', Board: '排行榜', Profile: '个人资料', Language: '语言',
    Login: '登录', Register: '注册', 'Welcome Back': '欢迎回来',
    'Create SYS Account': '创建 SYS 账户', 'Username or Email': '用户名或邮箱',
    Email: '邮箱', Password: '密码', 'Remember me': '记住我',
    'Edit Profile & Avatar': '管理个人资料和头像', 'Display Username': '显示用户名',
    'Profile Photo': '头像', 'Upload photo from device': '从设备上传照片',
    'Change photo from device': '从设备更换照片', Cancel: '取消',
    'Save Changes': '保存更改', 'Locked Balance': '锁定余额',
    'Total Earnings': '总收益', 'Deposit Crypto': '充值加密货币',
    'Lock History': '锁定记录', 'Log Out': '退出登录', Notifications: '通知',
    'No unread notifications at this time.': '目前没有未读通知。',
    '30 DAYS': '30 天', '60 DAYS': '60 天', '90 DAYS': '90 天',
  },
  ja: {
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'SYS STREAM ユーザーのライブ配信、コミュニティ、投稿。',
    'Production data is used for all content and activity on this page.': 'このページのすべてのコンテンツとアクティビティには本番データが使用されます。',
    'Every user can share posts and updates.': 'すべてのユーザーが投稿や更新を共有できます。',
    'Community Posts': 'コミュニティ投稿', 'Claim Bonus': 'ボーナスを受け取る', 'Registration Bonus': '登録ボーナス',
    Locked: 'ロック済み', Available: '利用可能', 'Upload / Create': 'アップロード / 作成',
    Airdrop: 'エアドロップ', Games: 'ゲーム', 'Live Now': 'ライブ中', Workspace: 'ワークスペース',
    Home: 'ホーム', Earn: '獲得', Board: 'ランキング', Profile: 'プロフィール', Language: '言語',
    Login: 'ログイン', Register: '登録', 'Welcome Back': 'おかえりなさい',
    'Create SYS Account': 'SYSアカウントを作成', 'Username or Email': 'ユーザー名またはメール',
    Email: 'メール', Password: 'パスワード', 'Remember me': 'ログイン情報を保存',
    'Edit Profile & Avatar': 'プロフィールと写真を管理', 'Display Username': 'ユーザー名',
    'Profile Photo': 'プロフィール写真', 'Upload photo from device': '端末から写真をアップロード',
    'Change photo from device': '端末から写真を変更', Cancel: 'キャンセル',
    'Save Changes': '変更を保存', 'Locked Balance': 'ロック残高',
    'Total Earnings': '総収益', 'Deposit Crypto': '暗号資産を入金',
    'Lock History': 'ロック履歴', 'Log Out': 'ログアウト', Notifications: '通知',
    'No unread notifications at this time.': '現在、未読の通知はありません。',
    '30 DAYS': '30日', '60 DAYS': '60日', '90 DAYS': '90日',
  },
  ko: {
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'SYS STREAM 사용자의 라이브 방송, 커뮤니티, 게시물입니다.',
    'Production data is used for all content and activity on this page.': '이 페이지의 모든 콘텐츠와 활동에는 운영 데이터가 사용됩니다.',
    'Every user can share posts and updates.': '모든 사용자는 게시물과 업데이트를 공유할 수 있습니다.',
    'Community Posts': '커뮤니티 게시물', 'Claim Bonus': '보너스 받기', 'Registration Bonus': '가입 보너스',
    Locked: '잠김', Available: '사용 가능', 'Upload / Create': '업로드 / 만들기',
    Airdrop: '에어드롭', Games: '게임', 'Live Now': '지금 라이브', Workspace: '워크스페이스',
    Home: '홈', Earn: '수익', Board: '순위표', Profile: '프로필', Language: '언어',
    Login: '로그인', Register: '가입', 'Welcome Back': '다시 오신 것을 환영합니다',
    'Create SYS Account': 'SYS 계정 만들기', 'Username or Email': '사용자 이름 또는 이메일',
    Email: '이메일', Password: '비밀번호', 'Remember me': '로그인 상태 유지',
    'Edit Profile & Avatar': '프로필 및 사진 관리', 'Display Username': '사용자 이름',
    'Profile Photo': '프로필 사진', 'Upload photo from device': '기기에서 사진 업로드',
    'Change photo from device': '기기에서 사진 변경', Cancel: '취소',
    'Save Changes': '변경 사항 저장', 'Locked Balance': '잠금 잔액',
    'Total Earnings': '총 수익', 'Deposit Crypto': '암호화폐 입금',
    'Lock History': '잠금 기록', 'Log Out': '로그아웃', Notifications: '알림',
    'No unread notifications at this time.': '현재 읽지 않은 알림이 없습니다.',
    '30 DAYS': '30일', '60 DAYS': '60일', '90 DAYS': '90일',
  },
  ar: {
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'البث المباشر والمجتمع ومنشورات مستخدمي SYS STREAM.',
    'Production data is used for all content and activity on this page.': 'تُستخدم بيانات الإنتاج لجميع المحتويات والأنشطة في هذه الصفحة.',
    'Every user can share posts and updates.': 'يمكن لكل مستخدم مشاركة المنشورات والتحديثات.',
    'Community Posts': 'منشورات المجتمع', 'Claim Bonus': 'استلام المكافأة', 'Registration Bonus': 'مكافأة التسجيل',
    Locked: 'مقفل', Available: 'متاح', 'Upload / Create': 'رفع / إنشاء',
    Airdrop: 'الإيردروب', Games: 'الألعاب', 'Live Now': 'مباشر الآن', Workspace: 'مساحة العمل',
    Home: 'الرئيسية', Earn: 'اربح', Board: 'المتصدرون', Profile: 'الملف الشخصي', Language: 'اللغة',
    Login: 'تسجيل الدخول', Register: 'إنشاء حساب', 'Welcome Back': 'مرحباً بعودتك',
    'Create SYS Account': 'إنشاء حساب SYS', 'Username or Email': 'اسم المستخدم أو البريد الإلكتروني',
    Email: 'البريد الإلكتروني', Password: 'كلمة المرور', 'Remember me': 'تذكرني',
    'Edit Profile & Avatar': 'إدارة الملف والصورة', 'Display Username': 'اسم المستخدم',
    'Profile Photo': 'صورة الملف الشخصي', 'Upload photo from device': 'رفع صورة من الجهاز',
    'Change photo from device': 'تغيير الصورة من الجهاز', Cancel: 'إلغاء',
    'Save Changes': 'حفظ التغييرات', 'Locked Balance': 'الرصيد المقفل',
    'Total Earnings': 'إجمالي الأرباح', 'Deposit Crypto': 'إيداع العملات الرقمية',
    'Lock History': 'سجل القفل', 'Log Out': 'تسجيل الخروج', Notifications: 'الإشعارات',
    'No unread notifications at this time.': 'لا توجد إشعارات غير مقروءة حالياً.',
    '30 DAYS': '30 يوماً', '60 DAYS': '60 يوماً', '90 DAYS': '90 يوماً',
  },
};
Object.assign(translations.id, {
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'Tersedia dengan lock aktif minimum. Reward harian diproses oleh server dan ditambahkan ke saldo tersedia.'
});
Object.assign(translations.en, {
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.'
});
Object.assign(translations.es, {
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'Disponible con el bloqueo activo mínimo. Las recompensas diarias son procesadas por el servidor y añadidas a tu saldo disponible.'
});
Object.assign(translations.pt, {
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'Disponível com o bloqueio ativo mínimo. As recompensas diárias são processadas pelo servidor e adicionadas ao seu saldo disponível.'
});
Object.assign(translations.zh, {
  "Wallet Identity": "钱包身份",
  "CONNECTING WALLET...": "正在连接钱包…",
  "Wallet Connected": "钱包已连接",
  "Connect Wallet for Registration": "连接钱包进行注册",
  "Register Now": "立即注册",
  "Forgot Password?": "忘记密码？",
  "Verify your email": "验证您的邮箱",
  "or Connect with Crypto Wallet": "或连接加密钱包"
});
Object.assign(translations.ja, {
  "Wallet Identity": "ウォレットID",
  "CONNECTING WALLET...": "ウォレット接続中…",
  "Wallet Connected": "ウォレット接続済み",
  "Connect Wallet for Registration": "登録用ウォレットを接続",
  "Register Now": "今すぐ登録",
  "Forgot Password?": "パスワードを忘れましたか？",
  "Verify your email": "メールを確認",
  "or Connect with Crypto Wallet": "または暗号資産ウォレットを接続"
});
Object.assign(translations.ko, {
  "Wallet Identity": "지갑 ID",
  "CONNECTING WALLET...": "지갑 연결 중...",
  "Wallet Connected": "지갑 연결됨",
  "Connect Wallet for Registration": "가입용 지갑 연결",
  "Register Now": "지금 가입",
  "Forgot Password?": "비밀번호를 잊으셨나요?",
  "Verify your email": "이메일 인증",
  "or Connect with Crypto Wallet": "또는 암호화폐 지갑 연결"
});
Object.assign(translations.ar, {
  "Wallet Identity": "هوية المحفظة",
  "CONNECTING WALLET...": "جارٍ ربط المحفظة...",
  "Wallet Connected": "تم ربط المحفظة",
  "Connect Wallet for Registration": "ربط المحفظة للتسجيل",
  "Register Now": "سجّل الآن",
  "Forgot Password?": "هل نسيت كلمة المرور؟",
  "Verify your email": "تحقق من بريدك الإلكتروني",
  "or Connect with Crypto Wallet": "أو الاتصال بمحفظة العملات الرقمية"
});

/* BLIND_BOX_8_LANGUAGE_TRANSLATIONS */

// Blind Box UI — explicit 8-language translations.
// These entries intentionally use stable English keys so page.tsx
// can call t() consistently regardless of the selected locale.

Object.assign(translations.id, {
  'Daily reward credited to balance': 'Reward harian masuk ke saldo',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.',
  'Daily claim limit remains 1 box per day.': 'Aturan claim tetap 1 kali per hari.',
  'Server is determining your reward...': 'Server sedang menentukan reward...',
  'Daily Blind Box Reward': 'Reward Blind Box Harian',
  'Lock Balance Now': 'Lock Saldo Sekarang',
  'Opening Mystery Vault!': 'Membuka Mystery Vault!',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.',
});

Object.assign(translations.en, {
  'Daily reward credited to balance': 'Daily reward credited to balance',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'Higher lock tier with rare collectibles. Financial rewards are determined by the server.',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'High lock tier with rare collectibles. Financial rewards are determined by the server.',
  'Daily claim limit remains 1 box per day.': 'Daily claim limit remains 1 box per day.',
  'Server is determining your reward...': 'Server is determining your reward...',
  'Daily Blind Box Reward': 'Daily Blind Box Reward',
  'Lock Balance Now': 'Lock Balance Now',
  'Opening Mystery Vault!': 'Opening Mystery Vault!',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.',
});

Object.assign(translations.es, {
  'Daily reward credited to balance': 'Recompensa diaria acreditada al saldo',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'Nivel de bloqueo superior con coleccionables raros. Las recompensas financieras son determinadas por el servidor.',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'Nivel de bloqueo alto con coleccionables raros. Las recompensas financieras son determinadas por el servidor.',
  'Daily claim limit remains 1 box per day.': 'El límite de reclamación diaria sigue siendo 1 caja por día.',
  'Server is determining your reward...': 'El servidor está determinando tu recompensa...',
  'Daily Blind Box Reward': 'Recompensa diaria de Blind Box',
  'Lock Balance Now': 'Bloquear saldo ahora',
  'Opening Mystery Vault!': '¡Abriendo Mystery Vault!',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'Disponible con el bloqueo activo mínimo. Las recompensas diarias son procesadas por el servidor y añadidas a tu saldo disponible.',
});

Object.assign(translations.pt, {
  'Daily reward credited to balance': 'Recompensa diária creditada ao saldo',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'Nível de bloqueio superior com colecionáveis raros. As recompensas financeiras são determinadas pelo servidor.',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'Nível de bloqueio alto com colecionáveis raros. As recompensas financeiras são determinadas pelo servidor.',
  'Daily claim limit remains 1 box per day.': 'O limite de resgate diário continua sendo 1 caixa por dia.',
  'Server is determining your reward...': 'O servidor está determinando sua recompensa...',
  'Daily Blind Box Reward': 'Recompensa diária da Blind Box',
  'Lock Balance Now': 'Bloquear saldo agora',
  'Opening Mystery Vault!': 'Abrindo o Mystery Vault!',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'Disponível com o bloqueio ativo mínimo. As recompensas diárias são processadas pelo servidor e adicionadas ao seu saldo disponível.',
});

Object.assign(translations.zh, {
  'Daily reward credited to balance': '每日奖励已计入余额',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': '更高锁定等级，包含稀有收藏品。财务奖励由服务器决定。',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': '高级锁定等级，包含稀有收藏品。财务奖励由服务器决定。',
  'Daily claim limit remains 1 box per day.': '每日领取限制仍为每天 1 个盲盒。',
  'Server is determining your reward...': '服务器正在确定您的奖励……',
  'Daily Blind Box Reward': '每日 Blind Box 奖励',
  'Lock Balance Now': '立即锁定余额',
  'Opening Mystery Vault!': '正在打开神秘宝库！',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': '满足最低有效锁定即可使用。每日奖励由服务器处理并加入您的可用余额。',
});

Object.assign(translations.ja, {
  'Daily reward credited to balance': 'デイリー報酬が残高に加算されました',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'レアコレクションを含む上位ロックティア。金銭的報酬はサーバーによって決定されます。',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'レアコレクションを含む高ロックティア。金銭的報酬はサーバーによって決定されます。',
  'Daily claim limit remains 1 box per day.': 'デイリー受取上限は1日1ボックスです。',
  'Server is determining your reward...': 'サーバーが報酬を決定しています……',
  'Daily Blind Box Reward': 'デイリーBlind Box報酬',
  'Lock Balance Now': '今すぐ残高をロック',
  'Opening Mystery Vault!': 'ミステリーボルトを開いています！',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': '最低アクティブロックで利用できます。デイリー報酬はサーバーで処理され、利用可能残高に追加されます。',
});

Object.assign(translations.ko, {
  'Daily reward credited to balance': '일일 보상이 잔액에 적립되었습니다',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': '희귀 수집품이 포함된 상위 락 티어입니다. 금융 보상은 서버에서 결정합니다.',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': '희귀 수집품이 포함된 높은 락 티어입니다. 금융 보상은 서버에서 결정합니다.',
  'Daily claim limit remains 1 box per day.': '일일 수령 한도는 하루 1박스로 유지됩니다.',
  'Server is determining your reward...': '서버가 보상을 결정하고 있습니다...',
  'Daily Blind Box Reward': '일일 Blind Box 보상',
  'Lock Balance Now': '지금 잔액 잠금',
  'Opening Mystery Vault!': '미스터리 볼트를 여는 중!',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': '최소 활성 락으로 이용할 수 있습니다. 일일 보상은 서버에서 처리되어 사용 가능한 잔액에 추가됩니다.',
});

Object.assign(translations.ar, {
  'Daily reward credited to balance': 'تمت إضافة المكافأة اليومية إلى الرصيد',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'مستوى قفل أعلى مع مقتنيات نادرة. يتم تحديد المكافآت المالية بواسطة الخادم.',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'مستوى قفل مرتفع مع مقتنيات نادرة. يتم تحديد المكافآت المالية بواسطة الخادم.',
  'Daily claim limit remains 1 box per day.': 'يظل حد المطالبة اليومية صندوقًا واحدًا في اليوم.',
  'Server is determining your reward...': 'الخادم يحدد مكافأتك...',
  'Daily Blind Box Reward': 'مكافأة Blind Box اليومية',
  'Lock Balance Now': 'قفل الرصيد الآن',
  'Opening Mystery Vault!': 'جارٍ فتح الخزنة الغامضة!',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'متاح مع الحد الأدنى من القفل النشط. تتم معالجة المكافآت اليومية بواسطة الخادم وإضافتها إلى رصيدك المتاح.',
});


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



// Auth registration strings
Object.assign(translations.id, {
  'Wallet Identity': 'Identitas Wallet','CONNECTING WALLET...': 'MENGHUBUNGKAN WALLET...','Wallet Connected': 'Wallet Terhubung',
  'Connect Wallet for Registration': 'Hubungkan Wallet untuk Registrasi','Register Now': 'Daftar Sekarang','Forgot Password?': 'Lupa Kata Sandi?',
  'Verify your email': 'Verifikasi email Anda','or Connect with Crypto Wallet': 'atau Hubungkan dengan Crypto Wallet',
  'Install MetaMask atau wallet Web3 terlebih dahulu.': 'Install MetaMask atau wallet Web3 terlebih dahulu.',
  'Wallet address tidak ditemukan.': 'Alamat wallet tidak ditemukan.','Gagal menghubungkan wallet.': 'Gagal menghubungkan wallet.',
  'Wallet ini akan menjadi identitas User ID dan referral link akun Anda.': 'Wallet ini akan menjadi identitas User ID dan referral link akun Anda.',
  'Akun dibuat. Silakan verifikasi email sebelum login.': 'Akun dibuat. Silakan verifikasi email sebelum login.'
});
Object.assign(translations.en, {
  'Wallet Identity': 'Wallet Identity','CONNECTING WALLET...': 'CONNECTING WALLET...','Wallet Connected': 'Wallet Connected',
  'Connect Wallet for Registration': 'Connect Wallet for Registration','Register Now': 'Register Now','Forgot Password?': 'Forgot Password?',
  'Verify your email': 'Verify your email','or Connect with Crypto Wallet': 'or Connect with Crypto Wallet',
  'Install MetaMask atau wallet Web3 terlebih dahulu.': 'Install MetaMask or a Web3 wallet first.',
  'Wallet address tidak ditemukan.': 'Wallet address was not found.','Gagal menghubungkan wallet.': 'Failed to connect wallet.',
  'Wallet ini akan menjadi identitas User ID dan referral link akun Anda.': 'This wallet will be your User ID identity and account referral link.',
  'Akun dibuat. Silakan verifikasi email sebelum login.': 'Account created. Please verify your email before logging in.'
});
Object.assign(translations.es, {
  'Wallet Identity': 'Identidad de la wallet','CONNECTING WALLET...': 'CONECTANDO WALLET...','Wallet Connected': 'Wallet conectada',
  'Connect Wallet for Registration': 'Conectar wallet para registrarse','Register Now': 'Registrarse ahora','Forgot Password?': '¿Olvidaste la contraseña?',
  'Verify your email': 'Verifica tu correo','or Connect with Crypto Wallet': 'o conectar con una wallet'
});
Object.assign(translations.pt, {
  'Wallet Identity': 'Identidade da carteira','CONNECTING WALLET...': 'CONECTANDO CARTEIRA...','Wallet Connected': 'Carteira conectada',
  'Connect Wallet for Registration': 'Conectar carteira para cadastro','Register Now': 'Registrar agora','Forgot Password?': 'Esqueceu a senha?',
  'Verify your email': 'Verifique seu e-mail','or Connect with Crypto Wallet': 'ou conectar com carteira cripto'
});
Object.assign(translations.zh, {
  'Wallet Identity': '钱包身份','CONNECTING WALLET...': '正在连接钱包…','Wallet Connected': '钱包已连接',
  'Connect Wallet for Registration': '连接钱包进行注册','Register Now': '立即注册','Forgot Password?': '忘记密码？',
  'Verify your email': '验证您的邮箱','or Connect with Crypto Wallet': '或连接加密钱包'
});
Object.assign(translations.ja, {
  'Wallet Identity': 'ウォレットID','CONNECTING WALLET...': 'ウォレット接続中…','Wallet Connected': 'ウォレット接続済み',
  'Connect Wallet for Registration': '登録用ウォレットを接続','Register Now': '今すぐ登録','Forgot Password?': 'パスワードを忘れましたか？',
  'Verify your email': 'メールを確認','or Connect with Crypto Wallet': 'または暗号資産ウォレットを接続'
});
Object.assign(translations.ko, {
  'Wallet Identity': '지갑 ID','CONNECTING WALLET...': '지갑 연결 중...','Wallet Connected': '지갑 연결됨',
  'Connect Wallet for Registration': '가입용 지갑 연결','Register Now': '지금 가입','Forgot Password?': '비밀번호를 잊으셨나요?',
  'Verify your email': '이메일 인증','or Connect with Crypto Wallet': '또는 암호화폐 지갑 연결'
});
Object.assign(translations.ar, {
  'Wallet Identity': 'هوية المحفظة','CONNECTING WALLET...': 'جارٍ ربط المحفظة...','Wallet Connected': 'تم ربط المحفظة',
  'Connect Wallet for Registration': 'ربط المحفظة للتسجيل','Register Now': 'سجّل الآن','Forgot Password?': 'هل نسيت كلمة المرور؟',
  'Verify your email': 'تحقق من بريدك الإلكتروني','or Connect with Crypto Wallet': 'أو ربط محفظة العملات الرقمية'
});



const AUTH_EXTRA_UI: Record<LanguageCode, Record<string,string>> = {
 id:{"Don't have an account?": "Belum punya akun?","Secured with Web3": "Diamankan dengan Web3","Biometric Login Available": "Login biometrik tersedia","Register Now": "Generate Wallet"},
 en:{"Don't have an account?": "Don't have an account?","Secured with Web3": "Secured with Web3","Biometric Login Available": "Biometric Login Available","Register Now": "Generate Wallet"},
 es:{"Don't have an account?": "¿No tienes una cuenta?","Secured with Web3": "Protegido con Web3","Biometric Login Available": "Inicio de sesión biométrico disponible","Register Now": "Generar wallet"},
 pt:{"Don't have an account?": "Ainda não tem uma conta?","Secured with Web3": "Protegido com Web3","Biometric Login Available": "Login biométrico disponível","Register Now": "Gerar carteira"},
 zh:{"Don't have an account?": "还没有账户？","Secured with Web3": "Web3 安全保护","Biometric Login Available": "支持生物识别登录","Register Now": "生成钱包"},
 ja:{"Don't have an account?": "アカウントをお持ちではありませんか？","Secured with Web3": "Web3で保護されています","Biometric Login Available": "生体認証ログイン対応","Register Now": "ウォレットを生成"},
 ko:{"Don't have an account?": "계정이 없으신가요?","Secured with Web3": "Web3로 보호됨","Biometric Login Available": "생체 인증 로그인 지원","Register Now": "지갑 생성"},
 ar:{"Don't have an account?": "ليس لديك حساب؟","Secured with Web3": "مؤمّن بواسطة Web3","Biometric Login Available": "تسجيل الدخول البيومتري متاح","Register Now": "إنشاء محفظة"}
};
for (const lang of Object.keys(AUTH_EXTRA_UI) as LanguageCode[]) Object.assign(translations[lang], AUTH_EXTRA_UI[lang]);

const WALLET_AUTH_UI: Record<LanguageCode, Record<string,string>> = {
 id:{'Generate Wallet': 'Generate Wallet','Create SYS Account': 'Buat Akun SYS','Welcome Back': 'Selamat Datang Kembali','Login menggunakan wallet Anda.': 'Login menggunakan wallet Anda.','Buat wallet baru langsung dari perangkat Anda.': 'Buat wallet baru langsung dari perangkat Anda.','Login dengan Wallet': 'Login dengan Wallet','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': 'Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.','Buat Wallet Baru': 'Buat Wallet Baru','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.': 'Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.': 'Saya menyetujui Terms & Conditions dan pembuatan wallet baru.','Simpan Recovery Phrase': 'Simpan Recovery Phrase','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.': 'Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.': 'Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.','BUAT AKUN DENGAN WALLET INI': 'BUAT AKUN DENGAN WALLET INI','GENERATE WALLET': 'GENERATE WALLET','LOGIN WITH WALLET': 'LOGIN DENGAN WALLET','Already have a wallet?': 'Sudah punya wallet?','Login with Wallet': 'Login dengan Wallet','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.': 'Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.','Registrasi gagal diproses di server.': 'Registrasi gagal diproses di server.','Gagal membuat wallet baru.': 'Gagal membuat wallet baru.','Recovery phrase gagal dibuat.': 'Recovery phrase gagal dibuat.'},
 en:{'Generate Wallet': 'Generate Wallet','Create SYS Account': 'Create SYS Account','Welcome Back': 'Welcome Back','Login menggunakan wallet Anda.': 'Login using your wallet.','Buat wallet baru langsung dari perangkat Anda.': 'Create a new wallet directly on your device.','Login dengan Wallet': 'Login with Wallet','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': 'Connect MetaMask or another EVM wallet, then sign the login message.','Buat Wallet Baru': 'Create New Wallet','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.': 'No email, username, or password required. Your wallet is created directly on your device.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.': 'I agree to the Terms & Conditions and creation of a new wallet.','Simpan Recovery Phrase': 'Save Recovery Phrase','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.': 'The recovery phrase is created on your device. SYS STREAM never receives or stores it.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.': 'I have saved the recovery phrase and understand that SYS STREAM cannot recover it.','BUAT AKUN DENGAN WALLET INI': 'CREATE ACCOUNT WITH THIS WALLET','GENERATE WALLET': 'GENERATE WALLET','LOGIN WITH WALLET': 'LOGIN WITH WALLET','Already have a wallet?': 'Already have a wallet?','Login with Wallet': 'Login with Wallet','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.': 'Wallet created on this device. Save the recovery phrase before creating your account.','Registrasi gagal diproses di server.': 'Registration could not be processed by the server.','Gagal membuat wallet baru.': 'Failed to create a new wallet.','Recovery phrase gagal dibuat.': 'Failed to create the recovery phrase.'},
 es:{'Generate Wallet': 'Generar wallet','Create SYS Account': 'Crear cuenta SYS','Welcome Back': 'Bienvenido de nuevo','Login menggunakan wallet Anda.': 'Inicia sesión con tu wallet.','Buat wallet baru langsung dari perangkat Anda.': 'Crea una nueva wallet directamente en tu dispositivo.','Login dengan Wallet': 'Iniciar sesión con wallet','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': 'Conecta MetaMask u otra wallet EVM y firma el mensaje de inicio de sesión.','Buat Wallet Baru': 'Crear nueva wallet','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.': 'No necesitas correo, usuario ni contraseña. La wallet se crea directamente en tu dispositivo.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.': 'Acepto los Términos y condiciones y la creación de una nueva wallet.','Simpan Recovery Phrase': 'Guardar frase de recuperación','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.': 'La frase de recuperación se crea en tu dispositivo. SYS STREAM no la recibe ni la almacena.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.': 'He guardado la frase de recuperación y entiendo que SYS STREAM no puede recuperarla.','BUAT AKUN DENGAN WALLET INI': 'CREAR CUENTA CON ESTA WALLET','GENERATE WALLET': 'GENERAR WALLET','LOGIN WITH WALLET': 'INICIAR SESIÓN CON WALLET','Already have a wallet?': '¿Ya tienes una wallet?','Login with Wallet': 'Iniciar sesión con wallet','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.': 'Wallet creada en este dispositivo. Guarda la frase de recuperación antes de crear tu cuenta.','Registrasi gagal diproses di server.': 'No se pudo procesar el registro en el servidor.','Gagal membuat wallet baru.': 'No se pudo crear la nueva wallet.','Recovery phrase gagal dibuat.': 'No se pudo crear la frase de recuperación.'},
 pt:{'Generate Wallet': 'Gerar carteira','Create SYS Account': 'Criar conta SYS','Welcome Back': 'Bem-vindo de volta','Login menggunakan wallet Anda.': 'Entre usando sua carteira.','Buat wallet baru langsung dari perangkat Anda.': 'Crie uma nova carteira diretamente no seu dispositivo.','Login dengan Wallet': 'Entrar com carteira','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': 'Conecte a MetaMask ou outra carteira EVM e assine a mensagem de login.','Buat Wallet Baru': 'Criar nova carteira','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.': 'Não é necessário e-mail, usuário ou senha. A carteira é criada diretamente no seu dispositivo.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.': 'Aceito os Termos e Condições e a criação de uma nova carteira.','Simpan Recovery Phrase': 'Salvar frase de recuperação','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.': 'A frase de recuperação é criada no seu dispositivo. A SYS STREAM não a recebe nem armazena.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.': 'Salvei a frase de recuperação e entendo que a SYS STREAM não pode recuperá-la.','BUAT AKUN DENGAN WALLET INI': 'CRIAR CONTA COM ESTA CARTEIRA','GENERATE WALLET': 'GERAR CARTEIRA','LOGIN WITH WALLET': 'ENTRAR COM CARTEIRA','Already have a wallet?': 'Já tem uma carteira?','Login with Wallet': 'Entrar com carteira','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.': 'Carteira criada neste dispositivo. Salve a frase de recuperação antes de criar sua conta.','Registrasi gagal diproses di server.': 'Não foi possível processar o cadastro no servidor.','Gagal membuat wallet baru.': 'Falha ao criar uma nova carteira.','Recovery phrase gagal dibuat.': 'Falha ao criar a frase de recuperação.'},
 zh:{'Generate Wallet': '生成钱包','Create SYS Account': '创建 SYS 账户','Welcome Back': '欢迎回来','Login menggunakan wallet Anda.': '使用您的钱包登录。','Buat wallet baru langsung dari perangkat Anda.': '直接在您的设备上创建新钱包。','Login dengan Wallet': '使用钱包登录','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': '连接 MetaMask 或其他 EVM 钱包，然后签署登录消息。','Buat Wallet Baru': '创建新钱包','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.': '无需邮箱、用户名或密码。钱包将在您的设备上创建。','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.': '我同意条款与条件以及创建新钱包。','Simpan Recovery Phrase': '保存恢复短语','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.': '恢复短语在您的设备上生成。SYS STREAM 不会接收或存储它。','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.': '我已保存恢复短语，并了解 SYS STREAM 无法恢复它。','BUAT AKUN DENGAN WALLET INI': '使用此钱包创建账户','GENERATE WALLET': '生成钱包','LOGIN WITH WALLET': '使用钱包登录','Already have a wallet?': '已经有钱包？','Login with Wallet': '使用钱包登录','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.': '钱包已在此设备上创建。请先保存恢复短语。','Registrasi gagal diproses di server.': '服务器无法处理注册。','Gagal membuat wallet baru.': '创建新钱包失败。','Recovery phrase gagal dibuat.': '创建恢复短语失败。'},
 ja:{'Generate Wallet': 'ウォレットを生成','Create SYS Account': 'SYSアカウントを作成','Welcome Back': 'おかえりなさい','Login menggunakan wallet Anda.': 'ウォレットでログインします。','Buat wallet baru langsung dari perangkat Anda.': '端末上で新しいウォレットを作成します。','Login dengan Wallet': 'ウォレットでログイン','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': 'MetaMaskなどのEVMウォレットを接続し、ログインメッセージに署名してください。','Buat Wallet Baru': '新しいウォレットを作成','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.': 'メール、ユーザー名、パスワードは不要です。ウォレットは端末上で作成されます。','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.': '利用規約に同意し、新しいウォレットを作成します。','Simpan Recovery Phrase': 'リカバリーフレーズを保存','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.': 'リカバリーフレーズは端末上で作成されます。SYS STREAMは受け取りも保存もしません。','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.': 'リカバリーフレーズを保存し、SYS STREAMでは復元できないことを理解しました。','BUAT AKUN DENGAN WALLET INI': 'このウォレットでアカウントを作成','GENERATE WALLET': 'ウォレットを生成','LOGIN WITH WALLET': 'ウォレットでログイン','Already have a wallet?': 'すでにウォレットをお持ちですか？','Login with Wallet': 'ウォレットでログイン','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.': 'ウォレットをこの端末で作成しました。リカバリーフレーズを保存してください。','Registrasi gagal diproses di server.': 'サーバーで登録を処理できませんでした。','Gagal membuat wallet baru.': '新しいウォレットの作成に失敗しました。','Recovery phrase gagal dibuat.': 'リカバリーフレーズの作成に失敗しました。'},
 ko:{'Generate Wallet': '지갑 생성','Create SYS Account': 'SYS 계정 만들기','Welcome Back': '다시 오신 것을 환영합니다','Login menggunakan wallet Anda.': '지갑으로 로그인하세요.','Buat wallet baru langsung dari perangkat Anda.': '기기에서 새 지갑을 직접 생성합니다.','Login dengan Wallet': '지갑으로 로그인','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': 'MetaMask 또는 다른 EVM 지갑을 연결하고 로그인 메시지에 서명하세요.','Buat Wallet Baru': '새 지갑 만들기','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.': '이메일, 사용자 이름 또는 비밀번호가 필요하지 않습니다. 지갑은 기기에서 직접 생성됩니다.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.': '이용약관에 동의하고 새 지갑을 생성합니다.','Simpan Recovery Phrase': '복구 문구 저장','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.': '복구 문구는 기기에서 생성됩니다. SYS STREAM은 이를 받거나 저장하지 않습니다.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.': '복구 문구를 저장했으며 SYS STREAM에서 복구할 수 없음을 이해합니다.','BUAT AKUN DENGAN WALLET INI': '이 지갑으로 계정 만들기','GENERATE WALLET': '지갑 생성','LOGIN WITH WALLET': '지갑으로 로그인','Already have a wallet?': '이미 지갑이 있나요?','Login with Wallet': '지갑으로 로그인','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.': '이 기기에서 지갑이 생성되었습니다. 복구 문구를 저장하세요.','Registrasi gagal diproses di server.': '서버에서 가입을 처리할 수 없습니다.','Gagal membuat wallet baru.': '새 지갑 생성에 실패했습니다.','Recovery phrase gagal dibuat.': '복구 문구 생성에 실패했습니다.'},
 ar:{'Generate Wallet': 'إنشاء محفظة','Create SYS Account': 'إنشاء حساب SYS','Welcome Back': 'مرحباً بعودتك','Login menggunakan wallet Anda.': 'سجّل الدخول باستخدام محفظتك.','Buat wallet baru langsung dari perangkat Anda.': 'أنشئ محفظة جديدة مباشرة على جهازك.','Login dengan Wallet': 'تسجيل الدخول بالمحفظة','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': 'اربط MetaMask أو محفظة EVM أخرى ثم وقّع رسالة تسجيل الدخول.','Buat Wallet Baru': 'إنشاء محفظة جديدة','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.': 'لا تحتاج إلى بريد إلكتروني أو اسم مستخدم أو كلمة مرور. سيتم إنشاء المحفظة على جهازك.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.': 'أوافق على الشروط والأحكام وإنشاء محفظة جديدة.','Simpan Recovery Phrase': 'احفظ عبارة الاسترداد','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.': 'يتم إنشاء عبارة الاسترداد على جهازك. لا تستلمها SYS STREAM ولا تخزنها.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.': 'لقد حفظت عبارة الاسترداد وأفهم أن SYS STREAM لا يستطيع استعادتها.','BUAT AKUN DENGAN WALLET INI': 'إنشاء حساب بهذه المحفظة','GENERATE WALLET': 'إنشاء محفظة','LOGIN WITH WALLET': 'تسجيل الدخول بالمحفظة','Already have a wallet?': 'لديك محفظة بالفعل؟','Login with Wallet': 'تسجيل الدخول بالمحفظة','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.': 'تم إنشاء المحفظة على هذا الجهاز. احفظ عبارة الاسترداد قبل إنشاء الحساب.','Registrasi gagal diproses di server.': 'تعذر معالجة التسجيل على الخادم.','Gagal membuat wallet baru.': 'تعذر إنشاء محفظة جديدة.','Recovery phrase gagal dibuat.': 'تعذر إنشاء عبارة الاسترداد.'}
};
for (const lang of Object.keys(WALLET_AUTH_UI) as LanguageCode[]) Object.assign(translations[lang], WALLET_AUTH_UI[lang]);

// Cross-page exact UI labels used by the runtime translator.
const CROSS_PAGE_UI: Record<LanguageCode, Record<string,string>> = {
 id: {
  'Profile': 'Profil','Kelola akun, wallet, dan aktivitas kamu.': 'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address': 'ID Pengguna = Alamat Wallet','Member': 'Anggota','USDT Account': 'Akun USDT','EVM Wallet': 'Wallet EVM','Available': 'Tersedia','Locked': 'Terkunci','Wallet': 'Wallet','Withdraw': 'Tarik Dana','Ajukan penarikan': 'Ajukan penarikan','Registration Bonus': 'Bonus Registrasi','Bonus tersedia dan belum diklaim.': 'Bonus tersedia dan belum diklaim.','Claim Bonus': 'Klaim Bonus','Available Balance': 'Saldo Tersedia','Referral Link': 'Tautan Referral','Transaction History': 'Riwayat Transaksi','Refresh': 'Muat Ulang','Loading...': 'Memuat...','Belum ada transaksi.': 'Belum ada transaksi.','Live Now': 'Live Sekarang','Buka Live Room →': 'Buka Live Room →','Upload / Create Post': 'Unggah / Buat Postingan','Community': 'Komunitas','Tulis sesuatu untuk dibagikan ke komunitas...': 'Tulis sesuatu untuk dibagikan ke komunitas...','URL media (opsional)': 'URL media (opsional)','Terbitkan Postingan': 'Terbitkan Postingan','Minimum withdrawal': 'Penarikan minimum','Copy wallet address': 'Salin alamat wallet','Copy referral link': 'Salin tautan referral','Back': 'Kembali','Legal': 'Hukum','Version': 'Versi','Important': 'Penting','Terms & Conditions': 'Syarat & Ketentuan','Privacy Policy': 'Kebijakan Privasi','Last updated': 'Terakhir diperbarui'
 },
 en: {},
 es: {
  'Profile': 'Perfil','User ID = Wallet Address': 'ID de usuario = dirección de wallet','Member': 'Miembro','USDT Account': 'Cuenta USDT','EVM Wallet': 'Wallet EVM','Available': 'Disponible','Locked': 'Bloqueado','Withdraw': 'Retirar','Registration Bonus': 'Bono de registro','Claim Bonus': 'Reclamar bono','Available Balance': 'Saldo disponible','Referral Link': 'Enlace de referidos','Transaction History': 'Historial de transacciones','Refresh': 'Actualizar','Loading...': 'Cargando...','Live Now': 'En vivo','Upload / Create Post': 'Subir / crear publicación','Community': 'Comunidad','Terbitkan Postingan': 'Publicar','Back': 'Volver','Legal': 'Legal','Version': 'Versión','Important': 'Importante','Terms & Conditions': 'Términos y condiciones','Privacy Policy': 'Política de privacidad'
 },
 pt: {
  'Profile': 'Perfil','User ID = Wallet Address': 'ID do usuário = endereço da carteira','Member': 'Membro','USDT Account': 'Conta USDT','EVM Wallet': 'Carteira EVM','Available': 'Disponível','Locked': 'Bloqueado','Withdraw': 'Sacar','Registration Bonus': 'Bônus de registro','Claim Bonus': 'Resgatar bônus','Available Balance': 'Saldo disponível','Referral Link': 'Link de indicação','Transaction History': 'Histórico de transações','Refresh': 'Atualizar','Loading...': 'Carregando...','Live Now': 'Ao vivo','Upload / Create Post': 'Enviar / criar publicação','Community': 'Comunidade','Terbitkan Postingan': 'Publicar','Back': 'Voltar','Legal': 'Legal','Version': 'Versão','Important': 'Importante','Terms & Conditions': 'Termos e condições','Privacy Policy': 'Política de privacidade'
 },
 zh: {
  'Profile': '个人资料','User ID = Wallet Address': '用户ID = 钱包地址','Member': '会员','USDT Account': 'USDT账户','EVM Wallet': 'EVM钱包','Available': '可用','Locked': '已锁定','Withdraw': '提现','Registration Bonus': '注册奖励','Claim Bonus': '领取奖励','Available Balance': '可用余额','Referral Link': '推荐链接','Transaction History': '交易记录','Refresh': '刷新','Loading...': '加载中…','Live Now': '正在直播','Upload / Create Post': '上传 / 创建帖子','Community': '社区','Terbitkan Postingan': '发布','Back': '返回','Legal': '法律','Version': '版本','Important': '重要：','Terms & Conditions': '条款与条件','Privacy Policy': '隐私政策'
 },
 ja: {
  'Profile': 'プロフィール','User ID = Wallet Address': 'ユーザーID = ウォレットアドレス','Member': 'メンバー','USDT Account': 'USDTアカウント','EVM Wallet': 'EVMウォレット','Available': '利用可能','Locked': 'ロック済み','Withdraw': '出金','Registration Bonus': '登録ボーナス','Claim Bonus': 'ボーナスを受け取る','Available Balance': '利用可能残高','Referral Link': '紹介リンク','Transaction History': '取引履歴','Refresh': '更新','Loading...': '読み込み中…','Live Now': 'ライブ中','Upload / Create Post': '投稿をアップロード / 作成','Community': 'コミュニティ','Terbitkan Postingan': '投稿する','Back': '戻る','Legal': '法務','Version': 'バージョン','Important': '重要：','Terms & Conditions': '利用規約','Privacy Policy': 'プライバシーポリシー'
 },
 ko: {
  'Profile': '프로필','User ID = Wallet Address': '사용자 ID = 지갑 주소','Member': '회원','USDT Account': 'USDT 계정','EVM Wallet': 'EVM 지갑','Available': '사용 가능','Locked': '잠김','Withdraw': '출금','Registration Bonus': '가입 보너스','Claim Bonus': '보너스 받기','Available Balance': '사용 가능 잔액','Referral Link': '추천 링크','Transaction History': '거래 내역','Refresh': '새로고침','Loading...': '로드 중...','Live Now': '라이브','Upload / Create Post': '게시물 업로드 / 만들기','Community': '커뮤니티','Terbitkan Postingan': '게시','Back': '뒤로','Legal': '법률','Version': '버전','Important': '중요','Terms & Conditions': '이용약관','Privacy Policy': '개인정보 처리방침'
 },
 ar: {
  'Profile': 'الملف الشخصي','User ID = Wallet Address': 'معرّف المستخدم = عنوان المحفظة','Member': 'عضو','USDT Account': 'حساب USDT','EVM Wallet': 'محفظة EVM','Available': 'متاح','Locked': 'مقفل','Withdraw': 'سحب','Registration Bonus': 'مكافأة التسجيل','Claim Bonus': 'استلام المكافأة','Available Balance': 'الرصيد المتاح','Referral Link': 'رابط الإحالة','Transaction History': 'سجل المعاملات','Refresh': 'تحديث','Loading...': 'جارٍ التحميل...','Live Now': 'مباشر الآن','Upload / Create Post': 'رفع / إنشاء منشور','Community': 'المجتمع','Terbitkan Postingan': 'نشر','Back': 'رجوع','Legal': 'قانوني','Version': 'الإصدار','Important': 'Ù…Ù‡Ù…','Terms & Conditions': 'الشروط والأحكام','Privacy Policy': 'سياسة الخصوصية'
 }
};
for (const lang of Object.keys(CROSS_PAGE_UI) as LanguageCode[]) {
  Object.assign(translations[lang], CROSS_PAGE_UI[lang]);
}
// Shared production UI translations. Every supported language gets an explicit value;
// unknown keys still fall back to English, never to a mixed-language label.
Object.assign(translations.en, { 'Workspace': 'Workspace', 'Upload / Create': 'Upload / Create', 'Available': 'Available', 'Locked': 'Locked',
  'Registration Bonus': 'Registration Bonus', 'Claim Bonus': 'Claim Bonus', 'Community Posts': 'Community Posts',
  'Production data is used for all content and activity on this page.': 'Production data is used for all content and activity on this page.',
  'Every user can share posts and updates.': 'Every user can share posts and updates.',
});
Object.assign(translations.es, { 'Workspace': 'Espacio de trabajo', 'Home': 'Inicio', 'Live Now': 'En vivo', 'Games': 'Juegos', 'Airdrop': 'Airdrop', 'Profile': 'Perfil',
  'Upload / Create': 'Subir / Crear', 'Available': 'Disponible', 'Locked': 'Bloqueado', 'Registration Bonus': 'Bono de registro',
  'Claim Bonus': 'Reclamar bono', 'Community Posts': 'Publicaciones de la comunidad',
  'Production data is used for all content and activity on this page.': 'Esta página utiliza datos de producción para todo el contenido y la actividad.',
  'Every user can share posts and updates.': 'Cada usuario puede compartir publicaciones y actualizaciones.',
});
Object.assign(translations.pt, { 'Workspace': 'Área de trabalho', 'Home': 'Início', 'Live Now': 'Ao vivo', 'Games': 'Jogos', 'Airdrop': 'Airdrop', 'Profile': 'Perfil',
  'Upload / Create': 'Enviar / Criar', 'Available': 'Disponível', 'Locked': 'Bloqueado', 'Registration Bonus': 'Bônus de registro',
  'Claim Bonus': 'Resgatar bônus', 'Community Posts': 'Publicações da comunidade',
  'Production data is used for all content and activity on this page.': 'Esta página usa dados de produção para todo o conteúdo e atividade.',
  'Every user can share posts and updates.': 'Cada usuário pode compartilhar publicações e atualizações.',
});
Object.assign(translations.zh, { 'Workspace': '工作区', 'Home': '首页', 'Live Now': '正在直播', 'Games': '游戏', 'Airdrop': '空投', 'Profile': '个人资料',
  'Upload / Create': '上传 / 创建', 'Available': '可用', 'Locked': '已锁定', 'Registration Bonus': '注册奖励',
  'Claim Bonus': '领取奖励', 'Community Posts': '社区帖子',
  'Production data is used for all content and activity on this page.': '本页面所有内容和活动均使用生产数据。',
  'Every user can share posts and updates.': '每位用户都可以分享帖子和动态。',
});
Object.assign(translations.ja, { 'Workspace': 'ワークスペース', 'Home': 'ホーム', 'Live Now': 'ライブ中', 'Games': 'ゲーム', 'Airdrop': 'エアドロップ', 'Profile': 'プロフィール',
  'Upload / Create': 'アップロード / 作成', 'Available': '利用可能', 'Locked': 'ロック済み', 'Registration Bonus': '登録ボーナス',
  'Claim Bonus': 'ボーナスを受け取る', 'Community Posts': 'コミュニティ投稿',
  'Production data is used for all content and activity on this page.': 'このページのコンテンツとアクティビティは本番データを使用します。',
  'Every user can share posts and updates.': 'すべてのユーザーが投稿や更新を共有できます。',
});
Object.assign(translations.ko, { 'Workspace': '워크스페이스', 'Home': '홈', 'Live Now': '라이브', 'Games': '게임', 'Airdrop': '에어드롭', 'Profile': '프로필',
  'Upload / Create': '업로드 / 만들기', 'Available': '사용 가능', 'Locked': '잠김', 'Registration Bonus': '가입 보너스',
  'Claim Bonus': '보너스 받기', 'Community Posts': '커뮤니티 게시물',
  'Production data is used for all content and activity on this page.': '이 페이지의 모든 콘텐츠와 활동은 운영 데이터를 사용합니다.',
  'Every user can share posts and updates.': '모든 사용자가 게시물과 업데이트를 공유할 수 있습니다.',
});
Object.assign(translations.ar, { 'Workspace': 'مساحة العمل', 'Home': 'الرئيسية', 'Live Now': 'مباشر الآن', 'Games': 'الألعاب', 'Airdrop': 'الإيردروب', 'Profile': 'الملف الشخصي',
  'Upload / Create': 'رفع / إنشاء', 'Available': 'متاح', 'Locked': 'مقفل', 'Registration Bonus': 'مكافأة التسجيل',
  'Claim Bonus': 'استلام المكافأة', 'Community Posts': 'منشورات المجتمع',
  'Production data is used for all content and activity on this page.': 'تستخدم هذه الصفحة بيانات الإنتاج لجميع المحتويات والأنشطة.',
  'Every user can share posts and updates.': 'يمكن لكل مستخدم مشاركة المنشورات والتحديثات.',
});



const PAGE_UI_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {},
  en: {
    'Masuk untuk bergabung ke Live Room': 'Login to join the Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Each account has its own profile and identity in the room.','LOGIN / REGISTER': 'LOGIN / REGISTER',
    'Live Room Aktif': 'Live Room Active','Live belum aktif': 'Live is not active','Peserta Live': 'Live Participants','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Only accounts that actually joined are displayed.','Peserta': 'Participants','CHAT': 'CHAT','Memuat peserta...': 'Loading participants...','Belum ada peserta lain.': 'No other participants yet.','Belum ada peserta.': 'No participants yet.','Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.': 'No messages yet. Be the first user to contribute to this room.','Tulis sebagai': 'Write as','Anda': 'You','Profil akun Anda': 'Your account profile',
    'Cyber Daily Mystery Box': 'Cyber Daily Mystery Box','Apex High-Roller Crate': 'Apex High-Roller Crate','Reward harian diproses server dan masuk ke saldo tersedia.': 'Daily rewards are processed by the server and added to your available balance.','Nominal Lock (IDR)': 'Lock Amount (IDR)','Lock Saldo Sekarang': 'Lock Balance Now','Claim Blind Box Harian': 'Claim Daily Blind Box','Lock Aktif': 'Active Lock','Daily Active Reward': 'Daily Active Reward','Enhanced Lock Tier': 'Enhanced Lock Tier','Premium Lock Tier': 'Premium Lock Tier','Reward harian masuk ke saldo': 'Daily reward is added to balance','Memproses Reward Blind Box...': 'Processing Blind Box Reward...','Reward Blind Box Harian': 'Daily Blind Box Reward','Reward dikreditkan ke saldo tersedia': 'Reward credited to available balance','Durasi Lock': 'Lock Duration','30 HARI': '30 DAYS','60 HARI': '60 DAYS','90 HARI': '90 DAYS',
    'Viewer Username Raffle Spinner': 'Spinner Undian Username Penonton','Live Participants Only': 'Hanya Peserta Live','Spinning for Winner...': 'Sedang memutar untuk menentukan pemenang...','Current Viewers on Wheel': 'Penonton saat ini di spinner','Recent Raffle Winners': 'Pemenang Undian Terbaru',
    'Interaction Challenge — No Financial Stake': 'Interaction Challenge — No Financial Stake','Mode Interaksi': 'Interaction Mode','Challenge ini tidak menggunakan saldo pengguna. Tidak ada deposit, lock, pemotongan saldo, atau payout finansial.': 'This challenge does not use user balance. There is no deposit, lock, balance deduction, or financial payout.','Verify Challenge': 'Verify Challenge','Verifying Cryptographic Seed...': 'Verifying Cryptographic Seed...','Provably Fair Verification': 'Provably Fair Verification'
  },
  es: {
    'Masuk untuk bergabung ke Live Room': 'Inicia sesión para unirte a la sala en vivo','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Cada cuenta tiene su propio perfil e identidad en la sala.','Live Room Aktif': 'Sala en vivo activa','Live belum aktif': 'La sala en vivo no está activa','Peserta Live': 'Participantes en vivo','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Solo se muestran las cuentas que realmente se han unido.','Memuat peserta...': 'Cargando participantes...','Belum ada peserta lain.': 'Aún no hay otros participantes.','Belum ada peserta.': 'Aún no hay participantes.','CHAT': 'CHAT','Peserta': 'PARTICIPANTES','Profil akun Anda': 'Perfil de tu cuenta',
    'Nominal Lock (IDR)': 'Importe del bloqueo (IDR)','Lock Saldo Sekarang': 'Bloquear saldo ahora','Claim Blind Box Harian': 'Reclamar Blind Box diario','Lock Aktif': 'Bloqueo activo','Reward harian masuk ke saldo': 'La recompensa diaria se añade al saldo','Durasi Lock': 'Duración del bloqueo','30 HARI': '30 DÍAS','60 HARI': '60 DÍAS','90 HARI': '90 DÍAS',
    'Mode Interaksi': 'Modo de interacción','Verify Challenge': 'Verificar desafío','Provably Fair Verification': 'Verificación demostrablemente justa'
  },
  pt: {
    'Masuk untuk bergabung ke Live Room': 'Entre para participar da Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Cada conta tem seu próprio perfil e identidade na sala.','Live Room Aktif': 'Live Room ativa','Live belum aktif': 'A Live Room não está ativa','Peserta Live': 'Participantes da live','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Apenas contas que realmente entraram são exibidas.','Memuat peserta...': 'Carregando participantes...','Belum ada peserta lain.': 'Ainda não há outros participantes.','Belum ada peserta.': 'Ainda não há participantes.','Peserta': 'PARTICIPANTES','Profil akun Anda': 'Perfil da sua conta',
    'Nominal Lock (IDR)': 'Valor do bloqueio (IDR)','Lock Saldo Sekarang': 'Bloquear saldo agora','Claim Blind Box Harian': 'Resgatar Blind Box diário','Lock Aktif': 'Bloqueio ativo','Reward harian masuk ke saldo': 'A recompensa diária é adicionada ao saldo','Durasi Lock': 'Duração do bloqueio','30 HARI': '30 DIAS','60 HARI': '60 DIAS','90 HARI': '90 DIAS',
    'Mode Interaksi': 'Modo de interação','Verify Challenge': 'Verificar desafio','Provably Fair Verification': 'Verificação comprovadamente justa'
  },
  zh: {
    'Masuk untuk bergabung ke Live Room': '登录以加入直播间','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': '每个账户在直播间都有独立的个人资料和身份。','Live Room Aktif': '直播间已开启','Live belum aktif': '直播尚未开启','Peserta Live': '直播参与者','Hanya akun yang benar-benar bergabung yang ditampilkan.': '仅显示实际加入的账户。','Memuat peserta...': '正在加载参与者…','Belum ada peserta lain.': '暂无其他参与者。','Belum ada peserta.': '暂无参与者。','Peserta': '参与者','Profil akun Anda': '您的账户资料',
    'Nominal Lock (IDR)': '锁定金额（IDR）','Lock Saldo Sekarang': '立即锁定余额','Claim Blind Box Harian': '领取每日盲盒','Lock Aktif': '锁定中','Reward harian masuk ke saldo': '每日奖励将加入余额','Durasi Lock': '锁定期限','30 HARI': '30天','60 HARI': '60天','90 HARI': '90天',
    'Mode Interaksi': '互动模式','Verify Challenge': '验证挑战','Provably Fair Verification': '公平验证'
  },
  ja: {
    'Masuk untuk bergabung ke Live Room': 'ログインしてライブルームに参加','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': '各アカウントにはルーム内で固有のプロフィールとIDがあります。','Live Room Aktif': 'ライブルームが有効です','Live belum aktif': 'ライブはまだ開始されていません','Peserta Live': 'ライブ参加者','Hanya akun yang benar-benar bergabung yang ditampilkan.': '実際に参加したアカウントのみ表示されます。','Memuat peserta...': '参加者を読み込み中…','Belum ada peserta lain.': '他の参加者はいません。','Belum ada peserta.': '参加者はいません。','Peserta': '参加者','Profil akun Anda': 'あなたのアカウントプロフィール',
    'Nominal Lock (IDR)': 'ロック金額（IDR）','Lock Saldo Sekarang': '残高をロック','Claim Blind Box Harian': '毎日のブラインドボックスを受け取る','Lock Aktif': 'ロック中','Reward harian masuk ke saldo': '毎日の報酬は残高に追加されます','Durasi Lock': 'ロック期間','30 HARI': '30日','60 HARI': '60日','90 HARI': '90日',
    'Mode Interaksi': 'インタラクションモード','Verify Challenge': 'チャレンジを確認','Provably Fair Verification': '公平性の検証'
  },
  ko: {
    'Masuk untuk bergabung ke Live Room': '로그인하여 라이브 룸에 참여하세요','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': '각 계정은 룸에서 고유한 프로필과 신원을 가집니다.','Live Room Aktif': '라이브 룸 활성','Live belum aktif': '라이브가 아직 시작되지 않았습니다','Peserta Live': '라이브 참가자','Hanya akun yang benar-benar bergabung yang ditampilkan.': '실제로 참여한 계정만 표시됩니다.','Memuat peserta...': '참가자 불러오는 중…','Belum ada peserta lain.': '아직 다른 참가자가 없습니다.','Belum ada peserta.': '참가자가 없습니다.','Peserta': '참가자','Profil akun Anda': '내 계정 프로필',
    'Nominal Lock (IDR)': '잠금 금액(IDR)','Lock Saldo Sekarang': '잔액 잠금','Claim Blind Box Harian': '일일 블라인드 박스 받기','Lock Aktif': '잠금 활성','Reward harian masuk ke saldo': '일일 보상이 잔액에 추가됩니다','Durasi Lock': '잠금 기간','30 HARI': '30일','60 HARI': '60일','90 HARI': '90일',
    'Mode Interaksi': '상호작용 모드','Verify Challenge': '챌린지 확인','Provably Fair Verification': '공정성 검증'
  },
  ar: {
    'Masuk untuk bergabung ke Live Room': 'سجّل الدخول للانضمام إلى الغرفة المباشرة','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'لكل حساب ملف وهوية خاصة به داخل الغرفة.','Live Room Aktif': 'الغرفة المباشرة نشطة','Live belum aktif': 'البث المباشر غير نشط','Peserta Live': 'المشاركون في البث','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'تظهر فقط الحسابات التي انضمت فعليًا.','Memuat peserta...': 'جارٍ تحميل المشاركين…','Belum ada peserta lain.': 'لا يوجد مشاركون آخرون بعد.','Belum ada peserta.': 'لا يوجد مشاركون.','Peserta': 'المشاركون','Profil akun Anda': 'ملف حسابك',
    'Nominal Lock (IDR)': 'مبلغ القفل (IDR)','Lock Saldo Sekarang': 'قفل الرصيد الآن','Claim Blind Box Harian': 'استلام الصندوق اليومي','Lock Aktif': 'القفل نشط','Reward harian masuk ke saldo': 'تُضاف المكافأة اليومية إلى الرصيد','Durasi Lock': 'مدة القفل','30 HARI': '30 يومًا','60 HARI': '60 يومًا','90 HARI': '90 يومًا',
    'Mode Interaksi': 'وضع التفاعل','Verify Challenge': 'تحقق من التحدي','Provably Fair Verification': 'تحقق من العدالة'
  },
};

const ORIGINAL_TEXT_NODES = new WeakMap<Text, string>();

/* Comprehensive fallback translations for visible page text that is not yet migrated
   to t(). The MutationObserver below applies these exact labels to dynamically rendered UI. */
const COMMON_PAGE_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Viewer Username Raffle Spinner': 'Spinner Undian Username Penonton','Live Participants Only': 'Hanya Peserta Live','Recent Raffle Winners': 'Pemenang Undian Terbaru',
    'Digital Crypto Card Number Guess': 'Tebak Nomor Kartu Kripto Digital','Streamer Card Settings': 'Pengaturan Kartu Streamer','Streamer Card Configurator': 'Konfigurator Kartu Streamer','Card Title': 'Judul Kartu','Serial Number': 'Nomor Seri','Concealed': 'Tersembunyi','Revealed': 'Terbuka','Verify Challenge': 'Verifikasi Tantangan','Provably Fair Verification': 'Verifikasi Provably Fair',
    'Affiliate Partner Program': 'Program Mitra Afiliasi','Your Personal Affiliate Link': 'Link Afiliasi Pribadi Anda','Direct Invitations': 'Undangan Langsung','Network Invites': 'Undangan Jaringan','Deep Ecosystem': 'Ekosistem Mendalam','Affiliate Income Calculator': 'Kalkulator Pendapatan Afiliasi','Estimated Monthly Earnings': 'Perkiraan Pendapatan Bulanan','Live Referral Feed': 'Feed Referral Live','Referee Handle': 'Nama Referee','Date Joined': 'Tanggal Bergabung','Commission Tier': 'Tingkat Komisi','Wager Volume': 'Volume Aktivitas','Commission Earned': 'Komisi Diperoleh',
    'NOWPayments Crypto Deposit': 'Deposit Kripto NOWPayments','Instant deposit with zero platform fees': 'Deposit instan tanpa biaya platform','Create NOWPayments Invoice': 'Buat Invoice NOWPayments',
    'Available Balance': 'Saldo Tersedia','Transaction History': 'Riwayat Transaksi','Withdraw USDT': 'Tarik USDT','Submit Withdrawal': 'Ajukan Penarikan','Withdrawal': 'Penarikan','Wallet': 'Dompet','Referral Link': 'Link Referral','Event Participation Status': 'Status Partisipasi Event','Refresh': 'Segarkan','Loading...': 'Memuat...','Belum ada transaksi.': 'Belum ada transaksi.','Processing...': 'Memproses...','Edit': 'Edit','Logout': 'Keluar','Member': 'Anggota','USDT Account': 'Akun USDT',
    'Live': 'Live','Join Live Room': 'Gabung Live Room','Login to join the Live Room': 'Masuk untuk bergabung ke Live Room','Chat': 'Chat','Send': 'Kirim','Type a message': 'Tulis pesan','No participants yet.': 'Belum ada peserta.','No messages yet.': 'Belum ada pesan.','Loading participants...': 'Memuat peserta...'
  },
  en: {
    'Masuk untuk bergabung ke Live Room': 'Login to join the Live Room','Peserta Live': 'Live Participants','Profil akun Anda': 'Your account profile','Viewer Username Raffle Spinner': 'Viewer Username Raffle Spinner','Live Participants Only': 'Live Participants Only','Recent Raffle Winners': 'Recent Raffle Winners',
    'Digital Crypto Card Number Guess': 'Digital Crypto Card Number Guess','Streamer Card Settings': 'Streamer Card Settings','Streamer Card Configurator': 'Streamer Card Configurator','Card Title': 'Card Title','Serial Number': 'Serial Number','Concealed': 'Concealed','Revealed': 'Revealed','Mode Interaksi': 'Interaction Mode','Verify Challenge': 'Verify Challenge','Provably Fair Verification': 'Provably Fair Verification',
    'Affiliate Partner Program': 'Affiliate Partner Program','Your Personal Affiliate Link': 'Your Personal Affiliate Link','Direct Invitations': 'Direct Invitations','Network Invites': 'Network Invites','Deep Ecosystem': 'Deep Ecosystem','Affiliate Income Calculator': 'Affiliate Income Calculator','Estimated Monthly Earnings': 'Estimated Monthly Earnings','Live Referral Feed': 'Live Referral Feed','Referee Handle': 'Referee Handle','Date Joined': 'Date Joined','Commission Tier': 'Commission Tier','Wager Volume': 'Wager Volume','Commission Earned': 'Commission Earned',
    'NOWPayments Crypto Deposit': 'NOWPayments Crypto Deposit','Instant deposit with zero platform fees': 'Instant deposit with zero platform fees','Create NOWPayments Invoice': 'Create NOWPayments Invoice',
    'Available Balance': 'Available Balance','Transaction History': 'Transaction History','Withdraw USDT': 'Withdraw USDT','Submit Withdrawal': 'Submit Withdrawal','Withdrawal': 'Withdrawal','Wallet': 'Wallet','Referral Link': 'Referral Link','Event Participation Status': 'Event Participation Status','Refresh': 'Refresh','Loading...': 'Loading...','Processing...': 'Processing...','Edit': 'Edit','Logout': 'Logout','Member': 'Member','USDT Account': 'USDT Account','Live': 'Live','Join Live Room': 'Join Live Room','Chat': 'Chat','Send': 'Send','Type a message': 'Type a message','No participants yet.': 'No participants yet.','No messages yet.': 'No messages yet.','Loading participants...': 'Loading participants...'
  },
  es: {
    'Viewer Username Raffle Spinner': 'Ruleta de nombres de espectadores','Live Participants Only': 'Solo participantes en vivo','Recent Raffle Winners': 'Ganadores recientes',
    'Digital Crypto Card Number Guess': 'Adivina el número de tarjeta cripto','Streamer Card Settings': 'Configuración de tarjeta del streamer','Streamer Card Configurator': 'Configurador de tarjeta','Card Title': 'Título de tarjeta','Serial Number': 'Número de serie','Concealed': 'Oculto','Revealed': 'Revelado','Verify Challenge': 'Verificar desafío','Provably Fair Verification': 'Verificación demostrablemente justa',
    'Affiliate Partner Program': 'Programa de socios afiliados','Your Personal Affiliate Link': 'Tu enlace de afiliado personal','Direct Invitations': 'Invitaciones directas','Network Invites': 'Invitaciones de red','Deep Ecosystem': 'Ecosistema profundo','Affiliate Income Calculator': 'Calculadora de ingresos de afiliados','Estimated Monthly Earnings': 'Ingresos mensuales estimados','Live Referral Feed': 'Actividad de referidos en vivo','Referee Handle': 'Usuario referido','Date Joined': 'Fecha de registro','Commission Tier': 'Nivel de comisión','Wager Volume': 'Volumen de actividad','Commission Earned': 'Comisión obtenida',
    'NOWPayments Crypto Deposit': 'Depósito cripto de NOWPayments','Instant deposit with zero platform fees': 'Depósito instantáneo sin comisiones de plataforma','Create NOWPayments Invoice': 'Crear factura de NOWPayments',
    'Available Balance': 'Saldo disponible','Transaction History': 'Historial de transacciones','Withdraw USDT': 'Retirar USDT','Submit Withdrawal': 'Enviar retiro','Wallet': 'Billetera','Referral Link': 'Enlace de referido','Event Participation Status': 'Estado de participación','Refresh': 'Actualizar','Loading...': 'Cargando...','Processing...': 'Procesando...','Edit': 'Editar','Logout': 'Cerrar sesión','Member': 'Miembro','USDT Account': 'Cuenta USDT','Join Live Room': 'Unirse a la sala en vivo','Chat': 'Chat','Send': 'Enviar','Type a message': 'Escribe un mensaje'
  },
  pt: {
    'Viewer Username Raffle Spinner': 'Roleta de nomes dos espectadores','Live Participants Only': 'Apenas participantes da live','Recent Raffle Winners': 'Vencedores recentes',
    'Digital Crypto Card Number Guess': 'Adivinhe o número do cartão cripto','Streamer Card Settings': 'Configurações do cartão do streamer','Streamer Card Configurator': 'Configurador do cartão','Card Title': 'Título do cartão','Serial Number': 'Número de série','Concealed': 'Oculto','Revealed': 'Revelado','Verify Challenge': 'Verificar desafio','Provably Fair Verification': 'Verificação comprovadamente justa',
    'Affiliate Partner Program': 'Programa de parceiros afiliados','Your Personal Affiliate Link': 'Seu link de afiliado pessoal','Direct Invitations': 'Convites diretos','Network Invites': 'Convites da rede','Deep Ecosystem': 'Ecossistema profundo','Affiliate Income Calculator': 'Calculadora de ganhos de afiliados','Estimated Monthly Earnings': 'Ganhos mensais estimados','Live Referral Feed': 'Feed de indicações ao vivo','Referee Handle': 'Usuário indicado','Date Joined': 'Data de entrada','Commission Tier': 'Nível de comissão','Wager Volume': 'Volume de atividade','Commission Earned': 'Comissão recebida',
    'NOWPayments Crypto Deposit': 'Depósito cripto NOWPayments','Instant deposit with zero platform fees': 'Depósito instantâneo sem taxas da plataforma','Create NOWPayments Invoice': 'Criar fatura NOWPayments',
    'Available Balance': 'Saldo disponível','Transaction History': 'Histórico de transações','Withdraw USDT': 'Sacar USDT','Submit Withdrawal': 'Enviar saque','Wallet': 'Carteira','Referral Link': 'Link de indicação','Event Participation Status': 'Status de participação','Refresh': 'Atualizar','Loading...': 'Carregando...','Processing...': 'Processando...','Edit': 'Editar','Logout': 'Sair','Member': 'Membro','USDT Account': 'Conta USDT','Join Live Room': 'Entrar na Live Room','Chat': 'Chat','Send': 'Enviar','Type a message': 'Digite uma mensagem'
  },
  zh: {
    'Viewer Username Raffle Spinner': '观众用户名抽奖转盘','Live Participants Only': '仅限直播参与者','Recent Raffle Winners': '最近中奖者','Digital Crypto Card Number Guess': '数字加密卡号码竞猜','Streamer Card Settings': '主播卡片设置','Streamer Card Configurator': '主播卡片配置器','Card Title': '卡片标题','Serial Number': '序列号','Concealed': '隐藏','Revealed': '已揭示','Verify Challenge': '验证挑战','Provably Fair Verification': '公平性验证',
    'Affiliate Partner Program': '联盟合作伙伴计划','Your Personal Affiliate Link': '您的专属推广链接','Direct Invitations': '直接邀请','Network Invites': '网络邀请','Deep Ecosystem': '深度生态','Affiliate Income Calculator': '联盟收益计算器','Estimated Monthly Earnings': '预计月收益','Live Referral Feed': '实时推荐动态','Referee Handle': '被推荐用户','Date Joined': '加入日期','Commission Tier': '佣金等级','Wager Volume': '活动量','Commission Earned': '获得佣金',
    'NOWPayments Crypto Deposit': 'NOWPayments 加密货币充值','Instant deposit with zero platform fees': '即时充值，平台零手续费','Create NOWPayments Invoice': '创建 NOWPayments 发票','Available Balance': '可用余额','Transaction History': '交易记录','Withdraw USDT': '提现 USDT','Submit Withdrawal': '提交提现','Wallet': '钱包','Referral Link': '推荐链接','Event Participation Status': '活动参与状态','Refresh': '刷新','Loading...': '加载中...','Processing...': '处理中...','Edit': '编辑','Logout': '退出登录','Member': '会员','USDT Account': 'USDT 账户','Join Live Room': '加入直播间','Chat': '聊天','Send': '发送','Type a message': '输入消息'
  },
  ja: {
    'Viewer Username Raffle Spinner': '視聴者ユーザー名抽選スピナー','Live Participants Only': 'ライブ参加者のみ','Recent Raffle Winners': '最近の抽選当選者','Digital Crypto Card Number Guess': 'デジタル暗号カード番号当て','Streamer Card Settings': '配信者カード設定','Streamer Card Configurator': '配信者カード設定ツール','Card Title': 'カードタイトル','Serial Number': 'シリアル番号','Concealed': '非公開','Revealed': '公開','Verify Challenge': 'チャレンジを確認','Provably Fair Verification': '公平性の検証',
    'Affiliate Partner Program': 'アフィリエイトパートナープログラム','Your Personal Affiliate Link': 'あなた専用のアフィリエイトリンク','Direct Invitations': '直接招待','Network Invites': 'ネットワーク招待','Deep Ecosystem': '深いエコシステム','Affiliate Income Calculator': 'アフィリエイト収益計算機','Estimated Monthly Earnings': '月間予想収益','Live Referral Feed': 'ライブ紹介フィード','Referee Handle': '紹介ユーザー','Date Joined': '参加日','Commission Tier': 'コミッションレベル','Wager Volume': 'アクティビティ量','Commission Earned': '獲得コミッション',
    'NOWPayments Crypto Deposit': 'NOWPayments暗号資産入金','Instant deposit with zero platform fees': 'プラットフォーム手数料なしの即時入金','Create NOWPayments Invoice': 'NOWPayments請求書を作成','Available Balance': '利用可能残高','Transaction History': '取引履歴','Withdraw USDT': 'USDTを出金','Submit Withdrawal': '出金を申請','Wallet': 'ウォレット','Referral Link': '紹介リンク','Event Participation Status': 'イベント参加状況','Refresh': '更新','Loading...': '読み込み中...','Processing...': '処理中...','Edit': '編集','Logout': 'ログアウト','Member': 'メンバー','USDT Account': 'USDTアカウント','Join Live Room': 'ライブルームに参加','Chat': 'チャット','Send': '送信','Type a message': 'メッセージを入力'
  },
  ko: {
    'Viewer Username Raffle Spinner': '시청자 사용자명 추첨 스피너','Live Participants Only': '라이브 참가자만','Recent Raffle Winners': '최근 추첨 당첨자','Digital Crypto Card Number Guess': '디지털 암호 카드 번호 맞히기','Streamer Card Settings': '스트리머 카드 설정','Streamer Card Configurator': '스트리머 카드 구성기','Card Title': '카드 제목','Serial Number': '일련번호','Concealed': '숨김','Revealed': '공개','Verify Challenge': '챌린지 확인','Provably Fair Verification': '공정성 검증',
    'Affiliate Partner Program': '제휴 파트너 프로그램','Your Personal Affiliate Link': '개인 제휴 링크','Direct Invitations': '직접 초대','Network Invites': '네트워크 초대','Deep Ecosystem': '확장 생태계','Affiliate Income Calculator': '제휴 수익 계산기','Estimated Monthly Earnings': '예상 월 수익','Live Referral Feed': '실시간 추천 피드','Referee Handle': '추천 사용자','Date Joined': '가입일','Commission Tier': '커미션 등급','Wager Volume': '활동량','Commission Earned': '획득 커미션',
    'NOWPayments Crypto Deposit': 'NOWPayments 암호화폐 입금','Instant deposit with zero platform fees': '플랫폼 수수료 없는 즉시 입금','Create NOWPayments Invoice': 'NOWPayments 인보이스 생성','Available Balance': '사용 가능 잔액','Transaction History': '거래 내역','Withdraw USDT': 'USDT 출금','Submit Withdrawal': '출금 신청','Wallet': '지갑','Referral Link': '추천 링크','Event Participation Status': '이벤트 참여 상태','Refresh': '새로고침','Loading...': '불러오는 중...','Processing...': '처리 중...','Edit': '편집','Logout': '로그아웃','Member': '회원','USDT Account': 'USDT 계정','Join Live Room': '라이브 룸 참여','Chat': '채팅','Send': '전송','Type a message': '메시지 입력'
  },
  ar: {
    'Viewer Username Raffle Spinner': 'عجلة سحب أسماء المشاهدين','Live Participants Only': 'المشاركون في البث فقط','Recent Raffle Winners': 'الفائزون في السحب الأخير','Digital Crypto Card Number Guess': 'تخمين رقم البطاقة الرقمية المشفرة','Streamer Card Settings': 'إعدادات بطاقة البث','Streamer Card Configurator': 'مُكوّن بطاقة البث','Card Title': 'عنوان البطاقة','Serial Number': 'الرقم التسلسلي','Concealed': 'مخفي','Revealed': 'مكشوف','Verify Challenge': 'تحقق من التحدي','Provably Fair Verification': 'التحقق من العدالة',
    'Affiliate Partner Program': 'برنامج شركاء الإحالة','Your Personal Affiliate Link': 'رابط الإحالة الشخصي','Direct Invitations': 'الدعوات المباشرة','Network Invites': 'دعوات الشبكة','Deep Ecosystem': 'النظام البيئي المتكامل','Affiliate Income Calculator': 'حاسبة دخل الإحالة','Estimated Monthly Earnings': 'الأرباح الشهرية المقدرة','Live Referral Feed': 'تغذية الإحالات المباشرة','Referee Handle': 'المستخدم المُحال','Date Joined': 'تاريخ الانضمام','Commission Tier': 'مستوى العمولة','Wager Volume': 'حجم النشاط','Commission Earned': 'العمولة المكتسبة',
    'NOWPayments Crypto Deposit': 'إيداع العملات المشفرة عبر NOWPayments','Instant deposit with zero platform fees': 'إيداع فوري بدون رسوم منصة','Create NOWPayments Invoice': 'إنشاء فاتورة NOWPayments','Available Balance': 'الرصيد المتاح','Transaction History': 'سجل المعاملات','Withdraw USDT': 'سحب USDT','Submit Withdrawal': 'إرسال طلب السحب','Wallet': 'المحفظة','Referral Link': 'رابط الإحالة','Event Participation Status': 'حالة المشاركة في الفعالية','Refresh': 'تحديث','Loading...': 'جارٍ التحميل...','Processing...': 'جارٍ المعالجة...','Edit': 'تعديل','Logout': 'تسجيل الخروج','Member': 'عضو','USDT Account': 'حساب USDT','Join Live Room': 'الانضمام إلى الغرفة المباشرة','Chat': 'الدردشة','Send': 'إرسال','Type a message': 'اكتب رسالة'
  },
};

// Global UI coverage for all application pages. These keys are also used by
// the DOM fallback so pages that still contain legacy hardcoded labels follow the
// selected language immediately.

// Expanded legacy-label coverage: keeps remaining hardcoded UI labels localized
// until individual components are migrated to the typed translation helper.
const EXPANDED_LEGACY_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  "id": {
    "Terms & Conditions": "Syarat & Ketentuan",
    "Don't have an account?": "Belum punya akun?",
    "Secured with Web3": "Diamankan dengan Web3",
    "Biometric Login Available": "Login Biometrik Tersedia",
    "Edit": "Edit",
    "Logout": "Keluar",
    "Yield": "Yield",
    "Locked Balance Policy": "Kebijakan Saldo Terkunci",
    "Locked USDT earns passive daily yield...": "USDT yang dikunci memperoleh imbal hasil pasif harian...",
    "Earn Passive Crypto & Gold Coins": "Dapatkan Crypto & Gold Coins Secara Pasif",
    "Invite fellow gamers to NEXUS...": "Undang sesama gamer ke NEXUS...",
    "Anyone registering with your link receives...": "Siapa pun yang mendaftar melalui link Anda menerima...",
    "+500 Gold Coins": "+500 Gold Coins",
    "Unclaimed Commission Balance": "Saldo Komisi Belum Diklaim",
    "Tier 1 (Direct)": "Tingkat 1 (Langsung)",
    "Tier 2 (Sub-Affiliate)": "Tingkat 2 (Sub-Afiliasi)",
    "Tier 3 (Extended)": "Tingkat 3 (Lanjutan)",
    "14 Players": "14 Pemain",
    "Slide to project your estimated monthly passive revenue...": "Geser untuk memproyeksikan estimasi pendapatan pasif bulanan Anda...",
    "Belum ada data referral produksi untuk wallet ini.": "Belum ada data referral produksi untuk wallet ini.",
    "Reward harian masuk ke saldo": "Reward harian masuk ke saldo",
    "Buka Blind Box harian berdasarkan saldo...": "Buka Blind Box harian berdasarkan saldo...",
    "Daily Boxes": "Kotak Harian",
    "Durasi lock tersedia": "Durasi lock tersedia",
    "Lock Amount": "Jumlah Lock",
    "Durasi Lock": "Durasi Lock",
    "Lock Aktif": "Lock Aktif",
    "Daily Claim": "Klaim Harian",
    "Reward dikreditkan ke saldo tersedia": "Reward dikreditkan ke saldo tersedia",
    "Power Stat": "Stat Power",
    "Select Mystery Crate Tier": "Pilih Tier Mystery Crate",
    "30 Days Term": "Jangka 30 Hari",
    "60 Days Term": "Jangka 60 Hari",
    "90 Days Term": "Jangka 90 Hari",
    "Streamer raffle wheel containing live viewer usernames...": "Roda undian streamer berisi username penonton live...",
    "WIN": "MENANG",
    "Streamer Username Manager": "Pengelola Username Streamer",
    "Add": "Tambah",
    "Clear All": "Hapus Semua",
    "Predict the concealed cryptographic serial digits...": "Prediksi digit serial kriptografi yang tersembunyi...",
    "Close": "Tutup",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "Digit Kartu (Tepat 4 Digit) & Sakelar Sembunyikan",
    "Cancel": "Batal",
    "Save & Publish Card": "Simpan & Publikasikan Kartu",
    "Serial No": "No. Seri",
    "Digital Crypto Verification Code (4 Digits)": "Kode Verifikasi Kripto Digital (4 Digit)",
    "The 4-digit code is tied to serial number...": "Kode 4 digit terkait dengan nomor seri...",
    "LOGIN / REGISTER": "MASUK / DAFTAR",
    "CHAT": "CHAT",
    "PESERTA": "PESERTA",
    "Sign in to continue streaming and gaming": "Masuk untuk melanjutkan streaming dan bermain",
    "Remember me": "Ingat saya",
    "Forgot Password?": "Lupa Kata Sandi?",
    "or Connect with Crypto Wallet": "atau Hubungkan dengan Crypto Wallet",
    "Connect Wallet": "Hubungkan Wallet",
    "Register Now": "Daftar Sekarang",
    "ADMIN PANEL": "PANEL ADMIN",
    "Secure administrator access": "Akses administrator aman",
    "Admin Email": "Email Admin",
    "Password / Owner Key": "Kata Sandi / Kunci Owner",
    "Production": "Produksi",
    "Overview": "Ringkasan",
    "Users": "Pengguna",
    "Transactions": "Transaksi",
    "Jackpot Grants": "Pemberian Jackpot",
    "Admin Accounts": "Akun Admin",
    "Admin isolation": "Isolasi admin",
    "Production data only": "Hanya data produksi",
    "Select User": "Pilih Pengguna",
    "Choose user...": "Pilih pengguna...",
    "Jackpot Value (USDT)": "Nilai Jackpot (USDT)",
    "Reason / Audit Note": "Alasan / Catatan Audit",
    "Task": "Tugas",
    "Category": "Kategori",
    "Reward": "Reward",
    "Status": "Status",
    "Action": "Aksi",
    "Checking admin session...": "Memeriksa sesi admin..."
  },
  "en": {
    "Terms & Conditions": "Terms & Conditions",
    "Don't have an account?": "Don't have an account?",
    "Secured with Web3": "Secured with Web3",
    "Biometric Login Available": "Biometric Login Available",
    "Edit": "Edit",
    "Logout": "Logout",
    "Yield": "Yield",
    "Locked Balance Policy": "Locked Balance Policy",
    "Locked USDT earns passive daily yield...": "Locked USDT earns passive daily yield...",
    "Earn Passive Crypto & Gold Coins": "Earn Passive Crypto & Gold Coins",
    "Invite fellow gamers to NEXUS...": "Invite fellow gamers to NEXUS...",
    "Anyone registering with your link receives...": "Anyone registering with your link receives...",
    "+500 Gold Coins": "+500 Gold Coins",
    "Unclaimed Commission Balance": "Unclaimed Commission Balance",
    "Tier 1 (Direct)": "Tier 1 (Direct)",
    "Tier 2 (Sub-Affiliate)": "Tier 2 (Sub-Affiliate)",
    "Tier 3 (Extended)": "Tier 3 (Extended)",
    "14 Players": "14 Players",
    "Slide to project your estimated monthly passive revenue...": "Slide to project your estimated monthly passive revenue...",
    "Belum ada data referral produksi untuk wallet ini.": "No production referral data is available for this wallet.",
    "Reward harian masuk ke saldo": "Daily reward is added to your balance",
    "Buka Blind Box harian berdasarkan saldo...": "Open daily Blind Boxes based on your balance...",
    "Daily Boxes": "Daily Boxes",
    "Durasi lock tersedia": "Available lock durations",
    "Lock Amount": "Lock Amount",
    "Durasi Lock": "Lock Duration",
    "Lock Aktif": "Active Lock",
    "Daily Claim": "Daily Claim",
    "Reward dikreditkan ke saldo tersedia": "Reward is credited to available balance",
    "Power Stat": "Power Stat",
    "Select Mystery Crate Tier": "Select Mystery Crate Tier",
    "30 Days Term": "30 Days Term",
    "60 Days Term": "60 Days Term",
    "90 Days Term": "90 Days Term",
    "Streamer raffle wheel containing live viewer usernames...": "Streamer raffle wheel containing live viewer usernames...",
    "WIN": "WIN",
    "Streamer Username Manager": "Streamer Username Manager",
    "Add": "Add",
    "Clear All": "Clear All",
    "Predict the concealed cryptographic serial digits...": "Predict the concealed cryptographic serial digits...",
    "Close": "Close",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "Card Digits (Exactly 4 Digits) & Conceal Toggle",
    "Cancel": "Cancel",
    "Save & Publish Card": "Save & Publish Card",
    "Serial No": "Serial No",
    "Digital Crypto Verification Code (4 Digits)": "Digital Crypto Verification Code (4 Digits)",
    "The 4-digit code is tied to serial number...": "The 4-digit code is tied to serial number...",
    "LOGIN / REGISTER": "LOGIN / REGISTER",
    "CHAT": "CHAT",
    "PESERTA": "PARTICIPANTS",
    "Sign in to continue streaming and gaming": "Sign in to continue streaming and gaming",
    "Remember me": "Remember me",
    "Forgot Password?": "Forgot Password?",
    "or Connect with Crypto Wallet": "or Connect with Crypto Wallet",
    "Connect Wallet": "Connect Wallet",
    "Register Now": "Register Now",
    "ADMIN PANEL": "ADMIN PANEL",
    "Secure administrator access": "Secure administrator access",
    "Admin Email": "Admin Email",
    "Password / Owner Key": "Password / Owner Key",
    "Production": "Production",
    "Overview": "Overview",
    "Users": "Users",
    "Transactions": "Transactions",
    "Jackpot Grants": "Jackpot Grants",
    "Admin Accounts": "Admin Accounts",
    "Admin isolation": "Admin isolation",
    "Production data only": "Production data only",
    "Select User": "Select User",
    "Choose user...": "Choose user...",
    "Jackpot Value (USDT)": "Jackpot Value (USDT)",
    "Reason / Audit Note": "Reason / Audit Note",
    "Task": "Task",
    "Category": "Category",
    "Reward": "Reward",
    "Status": "Status",
    "Action": "Action",
    "Checking admin session...": "Checking admin session..."
  },
  "es": {
    "Terms & Conditions": "Términos y condiciones",
    "Don't have an account?": "¿No tienes una cuenta?",
    "Secured with Web3": "Protegido con Web3",
    "Biometric Login Available": "Inicio de sesión biométrico disponible",
    "Edit": "Editar",
    "Logout": "Cerrar sesión",
    "Yield": "Rendimiento",
    "Locked Balance Policy": "Política de saldo bloqueado",
    "Locked USDT earns passive daily yield...": "El USDT bloqueado genera rendimiento pasivo diario...",
    "Earn Passive Crypto & Gold Coins": "Gana criptomonedas y monedas de oro de forma pasiva",
    "Invite fellow gamers to NEXUS...": "Invita a otros jugadores a NEXUS...",
    "Anyone registering with your link receives...": "Cualquiera que se registre con tu enlace recibe...",
    "+500 Gold Coins": "+500 monedas de oro",
    "Unclaimed Commission Balance": "Saldo de comisiones sin reclamar",
    "Tier 1 (Direct)": "Nivel 1 (Directo)",
    "Tier 2 (Sub-Affiliate)": "Nivel 2 (Subafiliado)",
    "Tier 3 (Extended)": "Nivel 3 (Extendido)",
    "14 Players": "14 jugadores",
    "Slide to project your estimated monthly passive revenue...": "Desliza para proyectar tus ingresos pasivos mensuales estimados...",
    "Belum ada data referral produksi untuk wallet ini.": "No hay datos de referidos de producción para esta wallet.",
    "Reward harian masuk ke saldo": "La recompensa diaria se añade al saldo",
    "Buka Blind Box harian berdasarkan saldo...": "Abre las Blind Boxes diarias según tu saldo...",
    "Daily Boxes": "Cajas diarias",
    "Durasi lock tersedia": "Duraciones de bloqueo disponibles",
    "Lock Amount": "Cantidad bloqueada",
    "Durasi Lock": "Duración del bloqueo",
    "Lock Aktif": "Bloqueo activo",
    "Daily Claim": "Reclamo diario",
    "Reward dikreditkan ke saldo tersedia": "La recompensa se acredita al saldo disponible",
    "Power Stat": "Estadística de poder",
    "Select Mystery Crate Tier": "Selecciona el nivel de Mystery Crate",
    "30 Days Term": "Plazo de 30 días",
    "60 Days Term": "Plazo de 60 días",
    "90 Days Term": "Plazo de 90 días",
    "Streamer raffle wheel containing live viewer usernames...": "Ruleta del streamer con nombres de espectadores en vivo...",
    "WIN": "GANAR",
    "Streamer Username Manager": "Gestor de nombres de usuario del streamer",
    "Add": "Añadir",
    "Clear All": "Borrar todo",
    "Predict the concealed cryptographic serial digits...": "Predice los dígitos seriales criptográficos ocultos...",
    "Close": "Cerrar",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "Dígitos de tarjeta (exactamente 4) y control de ocultación",
    "Cancel": "Cancelar",
    "Save & Publish Card": "Guardar y publicar tarjeta",
    "Serial No": "N.º de serie",
    "Digital Crypto Verification Code (4 Digits)": "Código de verificación cripto digital (4 dígitos)",
    "The 4-digit code is tied to serial number...": "El código de 4 dígitos está vinculado al número de serie...",
    "LOGIN / REGISTER": "INICIAR SESIÓN / REGISTRARSE",
    "CHAT": "CHAT",
    "PESERTA": "PARTICIPANTES",
    "Sign in to continue streaming and gaming": "Inicia sesión para continuar transmitiendo y jugando",
    "Remember me": "Recuérdame",
    "Forgot Password?": "¿Olvidaste la contraseña?",
    "or Connect with Crypto Wallet": "o conectar con una wallet cripto",
    "Connect Wallet": "Conectar wallet",
    "Register Now": "Registrarse ahora",
    "ADMIN PANEL": "PANEL DE ADMIN",
    "Secure administrator access": "Acceso seguro de administrador",
    "Admin Email": "Correo del administrador",
    "Password / Owner Key": "Contraseña / clave del propietario",
    "Production": "Producción",
    "Overview": "Resumen",
    "Users": "Usuarios",
    "Transactions": "Transacciones",
    "Jackpot Grants": "Premios jackpot",
    "Admin Accounts": "Cuentas de administrador",
    "Admin isolation": "Aislamiento del administrador",
    "Production data only": "Solo datos de producción",
    "Select User": "Seleccionar usuario",
    "Choose user...": "Elegir usuario...",
    "Jackpot Value (USDT)": "Valor del jackpot (USDT)",
    "Reason / Audit Note": "Motivo / nota de auditoría",
    "Task": "Tarea",
    "Category": "Categoría",
    "Reward": "Recompensa",
    "Status": "Estado",
    "Action": "Acción",
    "Checking admin session...": "Comprobando sesión de administrador..."
  },
  "pt": {
    "Terms & Conditions": "Termos e condições",
    "Don't have an account?": "Não tem uma conta?",
    "Secured with Web3": "Protegido com Web3",
    "Biometric Login Available": "Login biométrico disponível",
    "Edit": "Editar",
    "Logout": "Sair",
    "Yield": "Rendimento",
    "Locked Balance Policy": "Política de saldo bloqueado",
    "Locked USDT earns passive daily yield...": "USDT bloqueado gera rendimento passivo diário...",
    "Earn Passive Crypto & Gold Coins": "Ganhe cripto e moedas de ouro passivamente",
    "Invite fellow gamers to NEXUS...": "Convide outros jogadores para o NEXUS...",
    "Anyone registering with your link receives...": "Quem se registrar com seu link recebe...",
    "+500 Gold Coins": "+500 moedas de ouro",
    "Unclaimed Commission Balance": "Saldo de comissão não resgatado",
    "Tier 1 (Direct)": "Nível 1 (Direto)",
    "Tier 2 (Sub-Affiliate)": "Nível 2 (Subafiliado)",
    "Tier 3 (Extended)": "Nível 3 (Estendido)",
    "14 Players": "14 jogadores",
    "Slide to project your estimated monthly passive revenue...": "Deslize para projetar sua receita passiva mensal estimada...",
    "Belum ada data referral produksi untuk wallet ini.": "Não há dados de indicação de produção para esta carteira.",
    "Reward harian masuk ke saldo": "A recompensa diária é adicionada ao saldo",
    "Buka Blind Box harian berdasarkan saldo...": "Abra as Blind Boxes diárias com base no seu saldo...",
    "Daily Boxes": "Caixas diárias",
    "Durasi lock tersedia": "Durações de bloqueio disponíveis",
    "Lock Amount": "Valor do bloqueio",
    "Durasi Lock": "Duração do bloqueio",
    "Lock Aktif": "Bloqueio ativo",
    "Daily Claim": "Resgate diário",
    "Reward dikreditkan ke saldo tersedia": "A recompensa é creditada no saldo disponível",
    "Power Stat": "Status de poder",
    "Select Mystery Crate Tier": "Selecione o nível da Mystery Crate",
    "30 Days Term": "Prazo de 30 dias",
    "60 Days Term": "Prazo de 60 dias",
    "90 Days Term": "Prazo de 90 dias",
    "Streamer raffle wheel containing live viewer usernames...": "Roleta do streamer com nomes de espectadores ao vivo...",
    "WIN": "VENCER",
    "Streamer Username Manager": "Gerenciador de nomes do streamer",
    "Add": "Adicionar",
    "Clear All": "Limpar tudo",
    "Predict the concealed cryptographic serial digits...": "Preveja os dígitos seriais criptográficos ocultos...",
    "Close": "Fechar",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "Dígitos do cartão (exatamente 4) e controle de ocultação",
    "Cancel": "Cancelar",
    "Save & Publish Card": "Salvar e publicar cartão",
    "Serial No": "Nº de série",
    "Digital Crypto Verification Code (4 Digits)": "Código de verificação cripto digital (4 dígitos)",
    "The 4-digit code is tied to serial number...": "O código de 4 dígitos está vinculado ao número de série...",
    "LOGIN / REGISTER": "ENTRAR / REGISTRAR",
    "CHAT": "CHAT",
    "PESERTA": "PARTICIPANTES",
    "Sign in to continue streaming and gaming": "Entre para continuar transmitindo e jogando",
    "Remember me": "Lembrar de mim",
    "Forgot Password?": "Esqueceu a senha?",
    "or Connect with Crypto Wallet": "ou conectar carteira cripto",
    "Connect Wallet": "Conectar carteira",
    "Register Now": "Registrar agora",
    "ADMIN PANEL": "PAINEL ADMIN",
    "Secure administrator access": "Acesso seguro do administrador",
    "Admin Email": "E-mail do administrador",
    "Password / Owner Key": "Senha / chave do proprietário",
    "Production": "Produção",
    "Overview": "Visão geral",
    "Users": "Usuários",
    "Transactions": "Transações",
    "Jackpot Grants": "Prêmios jackpot",
    "Admin Accounts": "Contas de administrador",
    "Admin isolation": "Isolamento do administrador",
    "Production data only": "Somente dados de produção",
    "Select User": "Selecionar usuário",
    "Choose user...": "Escolher usuário...",
    "Jackpot Value (USDT)": "Valor do jackpot (USDT)",
    "Reason / Audit Note": "Motivo / nota de auditoria",
    "Task": "Tarefa",
    "Category": "Categoria",
    "Reward": "Recompensa",
    "Status": "Status",
    "Action": "Ação",
    "Checking admin session...": "Verificando sessão do administrador..."
  },
  "zh": {
    "Terms & Conditions": "条款与条件",
    "Don't have an account?": "还没有账户？",
    "Secured with Web3": "使用 Web3 安全保护",
    "Biometric Login Available": "生物识别登录可用",
    "Edit": "编辑",
    "Logout": "退出登录",
    "Yield": "收益：",
    "Locked Balance Policy": "锁定余额政策",
    "Locked USDT earns passive daily yield...": "锁定的 USDT 每日获得被动收益...",
    "Earn Passive Crypto & Gold Coins": "被动赚取加密货币和金币",
    "Invite fellow gamers to NEXUS...": "邀请其他玩家加入 NEXUS...",
    "Anyone registering with your link receives...": "通过你的链接注册的用户可获得...",
    "+500 Gold Coins": "+500 金币",
    "Unclaimed Commission Balance": "未领取的佣金余额",
    "Tier 1 (Direct)": "第1级（直接）",
    "Tier 2 (Sub-Affiliate)": "第2级（子联盟）",
    "Tier 3 (Extended)": "第3级（扩展）",
    "14 Players": "14 名玩家",
    "Slide to project your estimated monthly passive revenue...": "拖动以预估您的每月被动收入...",
    "Belum ada data referral produksi untuk wallet ini.": "该钱包暂无生产环境推荐数据。",
    "Reward harian masuk ke saldo": "每日奖励加入余额",
    "Buka Blind Box harian berdasarkan saldo...": "根据余额开启每日盲盒...",
    "Daily Boxes": "每日宝箱",
    "Durasi lock tersedia": "可用锁定期限",
    "Lock Amount": "锁定金额",
    "Durasi Lock": "锁定期限",
    "Lock Aktif": "锁定中",
    "Daily Claim": "每日领取",
    "Reward dikreditkan ke saldo tersedia": "奖励将计入可用余额",
    "Power Stat": "能量属性",
    "Select Mystery Crate Tier": "选择神秘宝箱等级",
    "30 Days Term": "30天期限",
    "60 Days Term": "60天期限",
    "90 Days Term": "90天期限",
    "Streamer raffle wheel containing live viewer usernames...": "包含直播观众用户名的主播抽奖转盘...",
    "WIN": "获胜",
    "Streamer Username Manager": "主播用户名管理器",
    "Add": "添加",
    "Clear All": "全部清除",
    "Predict the concealed cryptographic serial digits...": "预测隐藏的加密序列数字...",
    "Close": "关闭",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "卡片数字（恰好4位）及隐藏开关",
    "Cancel": "取消",
    "Save & Publish Card": "保存并发布卡片",
    "Serial No": "序列号：",
    "Digital Crypto Verification Code (4 Digits)": "数字加密验证代码（4位）",
    "The 4-digit code is tied to serial number...": "4位代码与序列号绑定...",
    "LOGIN / REGISTER": "登录 / 注册",
    "CHAT": "聊天",
    "PESERTA": "参与者",
    "Sign in to continue streaming and gaming": "登录后继续直播和游戏",
    "Remember me": "记住我",
    "Forgot Password?": "忘记密码？",
    "or Connect with Crypto Wallet": "或连接加密钱包",
    "Connect Wallet": "连接钱包",
    "Register Now": "立即注册",
    "ADMIN PANEL": "管理员面板",
    "Secure administrator access": "安全的管理员访问",
    "Admin Email": "管理员邮箱",
    "Password / Owner Key": "密码 / 所有者密钥",
    "Production": "生产环境",
    "Overview": "概览",
    "Users": "用户",
    "Transactions": "交易",
    "Jackpot Grants": "Jackpot 发放",
    "Admin Accounts": "管理员账户",
    "Admin isolation": "管理员隔离",
    "Production data only": "仅生产数据",
    "Select User": "选择用户",
    "Choose user...": "选择用户...",
    "Jackpot Value (USDT)": "Jackpot 金额（USDT）",
    "Reason / Audit Note": "原因 / 审计备注",
    "Task": "任务",
    "Category": "类别",
    "Reward": "奖励",
    "Status": "状态",
    "Action": "操作",
    "Checking admin session...": "正在检查管理员会话..."
  },
  "ja": {
    "Terms & Conditions": "利用規約",
    "Don't have an account?": "アカウントをお持ちではありませんか？",
    "Secured with Web3": "Web3で保護されています",
    "Biometric Login Available": "生体認証ログインを利用できます",
    "Edit": "編集",
    "Logout": "ログアウト",
    "Yield": "利回り：",
    "Locked Balance Policy": "ロック残高ポリシー",
    "Locked USDT earns passive daily yield...": "ロックしたUSDTは毎日パッシブ利回りを獲得します...",
    "Earn Passive Crypto & Gold Coins": "暗号資産とゴールドコインをパッシブに獲得",
    "Invite fellow gamers to NEXUS...": "他のゲーマーをNEXUSに招待...",
    "Anyone registering with your link receives...": "あなたのリンクで登録すると...",
    "+500 Gold Coins": "+500ゴールドコイン",
    "Unclaimed Commission Balance": "未請求コミッション残高",
    "Tier 1 (Direct)": "ティア1（直接）",
    "Tier 2 (Sub-Affiliate)": "ティア2（サブアフィリエイト）",
    "Tier 3 (Extended)": "ティア3（拡張）",
    "14 Players": "14人のプレイヤー",
    "Slide to project your estimated monthly passive revenue...": "スライダーで推定月間パッシブ収益を表示...",
    "Belum ada data referral produksi untuk wallet ini.": "このウォレットの本番リファラルデータはありません。",
    "Reward harian masuk ke saldo": "デイリー報酬が残高に追加されます",
    "Buka Blind Box harian berdasarkan saldo...": "残高に基づいて毎日のブラインドボックスを開きます...",
    "Daily Boxes": "デイリーボックス",
    "Durasi lock tersedia": "利用可能なロック期間",
    "Lock Amount": "ロック額",
    "Durasi Lock": "ロック期間",
    "Lock Aktif": "ロック中",
    "Daily Claim": "デイリー受取",
    "Reward dikreditkan ke saldo tersedia": "報酬は利用可能残高に加算されます",
    "Power Stat": "パワーステータス",
    "Select Mystery Crate Tier": "ミステリークレートのティアを選択",
    "30 Days Term": "30日間",
    "60 Days Term": "60日間",
    "90 Days Term": "90日間",
    "Streamer raffle wheel containing live viewer usernames...": "ライブ視聴者ユーザー名のストリーマー抽選ホイール...",
    "WIN": "WIN",
    "Streamer Username Manager": "ストリーマーユーザー名管理",
    "Add": "追加",
    "Clear All": "すべてクリア",
    "Predict the concealed cryptographic serial digits...": "隠された暗号シリアル数字を予測...",
    "Close": "閉じる",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "カード数字（4桁）と非表示切替",
    "Cancel": "キャンセル",
    "Save & Publish Card": "カードを保存して公開",
    "Serial No": "シリアル番号：",
    "Digital Crypto Verification Code (4 Digits)": "デジタル暗号検証コード（4桁）",
    "The 4-digit code is tied to serial number...": "4桁コードはシリアル番号に紐付いています...",
    "LOGIN / REGISTER": "ログイン / 登録",
    "CHAT": "チャット",
    "PESERTA": "参加者",
    "Sign in to continue streaming and gaming": "ログインして配信とゲームを続ける",
    "Remember me": "ログイン状態を保持",
    "Forgot Password?": "パスワードをお忘れですか？",
    "or Connect with Crypto Wallet": "または暗号資産ウォレットを接続",
    "Connect Wallet": "ウォレットを接続",
    "Register Now": "今すぐ登録",
    "ADMIN PANEL": "管理者パネル",
    "Secure administrator access": "安全な管理者アクセス",
    "Admin Email": "管理者メール",
    "Password / Owner Key": "パスワード / オーナーキー",
    "Production": "本番環境",
    "Overview": "概要",
    "Users": "ユーザー",
    "Transactions": "取引",
    "Jackpot Grants": "ジャックポット付与",
    "Admin Accounts": "管理者アカウント",
    "Admin isolation": "管理者分離",
    "Production data only": "本番データのみ",
    "Select User": "ユーザーを選択",
    "Choose user...": "ユーザーを選択...",
    "Jackpot Value (USDT)": "ジャックポット金額（USDT）",
    "Reason / Audit Note": "理由 / 監査メモ",
    "Task": "タスク",
    "Category": "カテゴリ",
    "Reward": "報酬",
    "Status": "ステータス",
    "Action": "操作",
    "Checking admin session...": "管理者セッションを確認中..."
  },
  "ko": {
    "Terms & Conditions": "약관",
    "Don't have an account?": "계정이 없으신가요?",
    "Secured with Web3": "Web3로 보호됨",
    "Biometric Login Available": "생체 인증 로그인 사용 가능",
    "Edit": "편집",
    "Logout": "로그아웃",
    "Yield": "수익률",
    "Locked Balance Policy": "잠금 잔액 정책",
    "Locked USDT earns passive daily yield...": "잠금된 USDT는 매일 패시브 수익을 얻습니다...",
    "Earn Passive Crypto & Gold Coins": "암호화폐와 골드 코인을 패시브하게 획득",
    "Invite fellow gamers to NEXUS...": "다른 게이머를 NEXUS에 초대...",
    "Anyone registering with your link receives...": "링크로 가입한 사용자는...",
    "+500 Gold Coins": "+500 골드 코인",
    "Unclaimed Commission Balance": "미청구 커미션 잔액",
    "Tier 1 (Direct)": "1단계 (직접)",
    "Tier 2 (Sub-Affiliate)": "2단계 (서브 제휴)",
    "Tier 3 (Extended)": "3단계 (확장)",
    "14 Players": "14명",
    "Slide to project your estimated monthly passive revenue...": "슬라이드하여 예상 월간 패시브 수익을 확인...",
    "Belum ada data referral produksi untuk wallet ini.": "이 지갑의 프로덕션 추천 데이터가 없습니다.",
    "Reward harian masuk ke saldo": "일일 보상이 잔액에 추가됩니다",
    "Buka Blind Box harian berdasarkan saldo...": "잔액에 따라 매일 블라인드 박스를 엽니다...",
    "Daily Boxes": "일일 상자",
    "Durasi lock tersedia": "사용 가능한 잠금 기간",
    "Lock Amount": "잠금 금액",
    "Durasi Lock": "잠금 기간",
    "Lock Aktif": "잠금 활성",
    "Daily Claim": "일일 수령",
    "Reward dikreditkan ke saldo tersedia": "보상이 사용 가능 잔액에 적립됩니다",
    "Power Stat": "파워 스탯",
    "Select Mystery Crate Tier": "미스터리 크레이트 등급 선택",
    "30 Days Term": "30일 기간",
    "60 Days Term": "60일 기간",
    "90 Days Term": "90일 기간",
    "Streamer raffle wheel containing live viewer usernames...": "라이브 시청자 사용자명이 포함된 스트리머 추첨 휠...",
    "WIN": "당첨",
    "Streamer Username Manager": "스트리머 사용자명 관리",
    "Add": "추가",
    "Clear All": "모두 지우기",
    "Predict the concealed cryptographic serial digits...": "숨겨진 암호 시리얼 숫자를 예측...",
    "Close": "닫기",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "카드 숫자(정확히 4자리) 및 숨김 전환",
    "Cancel": "취소",
    "Save & Publish Card": "카드 저장 및 게시",
    "Serial No": "일련번호",
    "Digital Crypto Verification Code (4 Digits)": "디지털 암호 검증 코드(4자리)",
    "The 4-digit code is tied to serial number...": "4자리 코드는 일련번호에 연결됩니다...",
    "LOGIN / REGISTER": "로그인 / 회원가입",
    "CHAT": "채팅",
    "PESERTA": "참가자",
    "Sign in to continue streaming and gaming": "로그인하여 스트리밍과 게임을 계속하세요",
    "Remember me": "로그인 상태 유지",
    "Forgot Password?": "비밀번호를 잊으셨나요?",
    "or Connect with Crypto Wallet": "또는 암호화폐 지갑 연결",
    "Connect Wallet": "지갑 연결",
    "Register Now": "지금 가입",
    "ADMIN PANEL": "관리자 패널",
    "Secure administrator access": "안전한 관리자 접근",
    "Admin Email": "관리자 이메일",
    "Password / Owner Key": "비밀번호 / 소유자 키",
    "Production": "프로덕션",
    "Overview": "개요",
    "Users": "사용자",
    "Transactions": "거래",
    "Jackpot Grants": "잭팟 지급",
    "Admin Accounts": "관리자 계정",
    "Admin isolation": "관리자 격리",
    "Production data only": "프로덕션 데이터만",
    "Select User": "사용자 선택",
    "Choose user...": "사용자 선택...",
    "Jackpot Value (USDT)": "잭팟 금액 (USDT)",
    "Reason / Audit Note": "사유 / 감사 메모",
    "Task": "작업",
    "Category": "카테고리",
    "Reward": "보상",
    "Status": "상태",
    "Action": "작업",
    "Checking admin session...": "관리자 세션 확인 중..."
  },
  "ar": {
    "Terms & Conditions": "الشروط والأحكام",
    "Don't have an account?": "ليس لديك حساب؟",
    "Secured with Web3": "محمي بواسطة Web3",
    "Biometric Login Available": "تسجيل الدخول بالبصمة متاح",
    "Edit": "تعديل",
    "Logout": "تسجيل الخروج",
    "Yield": "العائد",
    "Locked Balance Policy": "سياسة الرصيد المقفل",
    "Locked USDT earns passive daily yield...": "USDT المقفل يحقق عائداً سلبياً يومياً...",
    "Earn Passive Crypto & Gold Coins": "اربح العملات الرقمية والعملات الذهبية بشكل سلبي",
    "Invite fellow gamers to NEXUS...": "ادعُ لاعبين آخرين إلى NEXUS...",
    "Anyone registering with your link receives...": "أي شخص يسجل عبر رابطك يحصل على...",
    "+500 Gold Coins": "+500 عملة ذهبية",
    "Unclaimed Commission Balance": "رصيد العمولة غير المطالب به",
    "Tier 1 (Direct)": "المستوى 1 (مباشر)",
    "Tier 2 (Sub-Affiliate)": "المستوى 2 (فرعي)",
    "Tier 3 (Extended)": "المستوى 3 (ممتد)",
    "14 Players": "14 لاعباً",
    "Slide to project your estimated monthly passive revenue...": "اسحب لتقدير إيراداتك الشهرية السلبية...",
    "Belum ada data referral produksi untuk wallet ini.": "لا توجد بيانات إحالة إنتاجية لهذه المحفظة.",
    "Reward harian masuk ke saldo": "تُضاف المكافأة اليومية إلى الرصيد",
    "Buka Blind Box harian berdasarkan saldo...": "افتح الصناديق اليومية حسب رصيدك...",
    "Daily Boxes": "الصناديق اليومية",
    "Durasi lock tersedia": "مدد القفل المتاحة",
    "Lock Amount": "مبلغ القفل",
    "Durasi Lock": "مدة القفل",
    "Lock Aktif": "القفل نشط",
    "Daily Claim": "المطالبة اليومية",
    "Reward dikreditkan ke saldo tersedia": "تُضاف المكافأة إلى الرصيد المتاح",
    "Power Stat": "إحصائية القوة",
    "Select Mystery Crate Tier": "اختر مستوى الصندوق الغامض",
    "30 Days Term": "مدة 30 يوماً",
    "60 Days Term": "مدة 60 يوماً",
    "90 Days Term": "مدة 90 يوماً",
    "Streamer raffle wheel containing live viewer usernames...": "عجلة سحب للستريمر تحتوي على أسماء مشاهدي البث المباشر...",
    "WIN": "فوز",
    "Streamer Username Manager": "مدير أسماء مستخدمي الستريمر",
    "Add": "إضافة",
    "Clear All": "مسح الكل",
    "Predict the concealed cryptographic serial digits...": "توقع أرقام التسلسل المشفرة المخفية...",
    "Close": "إغلاق",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "أرقام البطاقة (4 أرقام بالضبط) ومفتاح الإخفاء",
    "Cancel": "إلغاء",
    "Save & Publish Card": "حفظ ونشر البطاقة",
    "Serial No": "رقم التسلسل",
    "Digital Crypto Verification Code (4 Digits)": "رمز التحقق الرقمي المشفر (4 أرقام)",
    "The 4-digit code is tied to serial number...": "الرمز المكون من 4 أرقام مرتبط برقم التسلسل...",
    "LOGIN / REGISTER": "تسجيل الدخول / التسجيل",
    "CHAT": "الدردشة",
    "PESERTA": "المشاركون",
    "Sign in to continue streaming and gaming": "سجّل الدخول لمتابعة البث والألعاب",
    "Remember me": "تذكرني",
    "Forgot Password?": "هل نسيت كلمة المرور؟",
    "or Connect with Crypto Wallet": "أو ربط محفظة العملات الرقمية",
    "Connect Wallet": "ربط المحفظة",
    "Register Now": "سجّل الآن",
    "ADMIN PANEL": "لوحة الإدارة",
    "Secure administrator access": "وصول آمن للمسؤول",
    "Admin Email": "بريد المسؤول",
    "Password / Owner Key": "كلمة المرور / مفتاح المالك",
    "Production": "الإنتاج",
    "Overview": "نظرة عامة",
    "Users": "المستخدمون",
    "Transactions": "المعاملات",
    "Jackpot Grants": "منح الجاكبوت",
    "Admin Accounts": "حسابات المسؤولين",
    "Admin isolation": "عزل المسؤول",
    "Production data only": "بيانات الإنتاج فقط",
    "Select User": "اختر مستخدماً",
    "Choose user...": "اختر مستخدماً...",
    "Jackpot Value (USDT)": "قيمة الجاكبوت (USDT)",
    "Reason / Audit Note": "السبب / ملاحظة التدقيق",
    "Task": "المهمة",
    "Category": "الفئة",
    "Reward": "المكافأة",
    "Status": "الحالة",
    "Action": "الإجراء",
    "Checking admin session...": "جارٍ التحقق من جلسة المسؤول..."
  }
};
(Object.keys(EXPANDED_LEGACY_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...EXPANDED_LEGACY_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

const CORE_PAGE_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Profile': 'Profil','Kelola akun, wallet, dan aktivitas kamu.': 'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address': 'ID Pengguna = Alamat Wallet','Available': 'Tersedia','Locked': 'Terkunci','Withdraw': 'Penarikan','Ajukan penarikan': 'Ajukan penarikan','Registration Bonus': 'Bonus Pendaftaran','Bonus tersedia dan belum diklaim.': 'Bonus tersedia dan belum diklaim.','Available Balance': 'Saldo Tersedia','Bagikan link ini untuk mengundang user baru.': 'Bagikan link ini untuk mengundang user baru.','Event Participation Status': 'Status Partisipasi Event','Belum ada event yang diikuti.': 'Belum ada event yang diikuti.','Deposit, withdrawal, lock, reward & bonus': 'Deposit, penarikan, lock, reward & bonus','Belum ada transaksi.': 'Belum ada transaksi.','Submit Withdrawal': 'Ajukan Penarikan','Upload / Create Post': 'Upload / Buat Post',
    'TOP USERS RANKED': 'PERINGKAT PENGGUNA TERATAS','TOTAL REFERRALS': 'TOTAL REFERRAL','BONUS BALANCE': 'SALDO BONUS','INVITE FRIENDS — EARN NOW': 'UNDANG TEMAN — DAPATKAN REWARD','Privacy Policy': 'Kebijakan Privasi','Last updated: October 1, 2026': 'Terakhir diperbarui: 1 Oktober 2026','Terms & Conditions': 'Syarat & Ketentuan','Please read these terms before creating your SYS STREAM account.': 'Baca ketentuan ini sebelum membuat akun SYS STREAM.','Remember me': 'Ingat saya','or Connect with Crypto Wallet': 'atau Hubungkan dengan Crypto Wallet','Connect Wallet': 'Hubungkan Wallet',"Don't have an account? ": 'Belum punya akun? ','EVM Wallet Recovery Phrase': 'Recovery Phrase EVM Wallet','Wallet Address': 'Alamat Wallet','Recovery Phrase': 'Recovery Phrase','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': 'Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.'
  },
  en: {
    'Profile': 'Profile','Kelola akun, wallet, dan aktivitas kamu.': 'Manage your account, wallet, and activity.','User ID = Wallet Address': 'User ID = Wallet Address','Available': 'Available','Locked': 'Locked','Withdraw': 'Withdraw','Ajukan penarikan': 'Request Withdrawal','Registration Bonus': 'Registration Bonus','Bonus tersedia dan belum diklaim.': 'Bonus is available and has not been claimed.','Available Balance': 'Available Balance','Bagikan link ini untuk mengundang user baru.': 'Share this link to invite new users.','Event Participation Status': 'Event Participation Status','Belum ada event yang diikuti.': 'No events joined yet.','Deposit, withdrawal, lock, reward & bonus': 'Deposit, withdrawal, lock, reward & bonus','Belum ada transaksi.': 'No transactions yet.','Submit Withdrawal': 'Submit Withdrawal','Upload / Create Post': 'Upload / Create Post','TOP USERS RANKED': 'TOP USERS RANKED','TOTAL REFERRALS': 'TOTAL REFERRALS','BONUS BALANCE': 'BONUS BALANCE','INVITE FRIENDS — EARN NOW': 'INVITE FRIENDS — EARN NOW','Privacy Policy': 'Privacy Policy','Last updated: October 1, 2026': 'Last updated: October 1, 2026','Terms & Conditions': 'Terms & Conditions','Please read these terms before creating your SYS STREAM account.': 'Please read these terms before creating your SYS STREAM account.','Remember me': 'Remember me','or Connect with Crypto Wallet': 'or Connect with Crypto Wallet','Connect Wallet': 'Connect Wallet',"Don't have an account? ": "Don't have an account? ",'EVM Wallet Recovery Phrase': 'EVM Wallet Recovery Phrase','Wallet Address': 'Wallet Address','Recovery Phrase': 'Recovery Phrase'
  },
  es: {'Profile': 'Perfil','Kelola akun, wallet, dan aktivitas kamu.': 'Administra tu cuenta, billetera y actividad.','User ID = Wallet Address': 'ID de usuario = dirección de billetera','Available': 'Disponible','Locked': 'Bloqueado','Withdraw': 'Retirar','Registration Bonus': 'Bono de registro','Available Balance': 'Saldo disponible','Event Participation Status': 'Estado de participación en eventos','Transaction History': 'Historial de transacciones','Privacy Policy': 'Política de privacidad','Terms & Conditions': 'Términos y condiciones','Remember me': 'Recuérdame','Connect Wallet': 'Conectar billetera','Wallet Address': 'Dirección de billetera','Recovery Phrase': 'Frase de recuperación'},
  pt: {'Profile': 'Perfil','Kelola akun, wallet, dan aktivitas kamu.': 'Gerencie sua conta, carteira e atividade.','User ID = Wallet Address': 'ID do usuário = endereço da carteira','Available': 'Disponível','Locked': 'Bloqueado','Withdraw': 'Saque','Registration Bonus': 'Bônus de registro','Available Balance': 'Saldo disponível','Event Participation Status': 'Status de participação no evento','Transaction History': 'Histórico de transações','Privacy Policy': 'Política de privacidade','Terms & Conditions': 'Termos e condições','Remember me': 'Lembrar de mim','Connect Wallet': 'Conectar carteira','Wallet Address': 'Endereço da carteira','Recovery Phrase': 'Frase de recuperação'},
  zh: {'Profile': '个人资料','Kelola akun, wallet, dan aktivitas kamu.': '管理您的账户、钱包和活动。','User ID = Wallet Address': '用户 ID = 钱包地址','Available': '可用','Locked': '已锁定','Withdraw': '提现','Registration Bonus': '注册奖励','Available Balance': '可用余额','Event Participation Status': '活动参与状态','Transaction History': '交易记录','Privacy Policy': '隐私政策','Terms & Conditions': '条款与条件','Remember me': '记住我','Connect Wallet': '连接钱包','Wallet Address': '钱包地址','Recovery Phrase': '助记词'},
  ja: {'Profile': 'プロフィール','Kelola akun, wallet, dan aktivitas kamu.': 'アカウント、ウォレット、アクティビティを管理します。','User ID = Wallet Address': 'ユーザーID = ウォレットアドレス','Available': '利用可能','Locked': 'ロック済み','Withdraw': '出金','Registration Bonus': '登録ボーナス','Available Balance': '利用可能残高','Event Participation Status': 'イベント参加状況','Transaction History': '取引履歴','Privacy Policy': 'プライバシーポリシー','Terms & Conditions': '利用規約','Remember me': 'ログイン状態を保持','Connect Wallet': 'ウォレットを接続','Wallet Address': 'ウォレットアドレス','Recovery Phrase': 'リカバリーフレーズ'},
  ko: {'Profile': '프로필','Kelola akun, wallet, dan aktivitas kamu.': '계정, 지갑 및 활동을 관리하세요.','User ID = Wallet Address': '사용자 ID = 지갑 주소','Available': '사용 가능','Locked': '잠김','Withdraw': '출금','Registration Bonus': '가입 보너스','Available Balance': '사용 가능 잔액','Event Participation Status': '이벤트 참여 상태','Transaction History': '거래 내역','Privacy Policy': '개인정보 보호정책','Terms & Conditions': '이용약관','Remember me': '로그인 상태 유지','Connect Wallet': '지갑 연결','Wallet Address': '지갑 주소','Recovery Phrase': '복구 문구'},
  ar: {'Profile': 'الملف الشخصي','Kelola akun, wallet, dan aktivitas kamu.': 'إدارة حسابك ومحفظتك ونشاطك.','User ID = Wallet Address': 'معرّف المستخدم = عنوان المحفظة','Available': 'متاح','Locked': 'مقفل','Withdraw': 'سحب','Registration Bonus': 'مكافأة التسجيل','Available Balance': 'الرصيد المتاح','Event Participation Status': 'حالة المشاركة في الفعاليات','Transaction History': 'سجل المعاملات','Privacy Policy': 'سياسة الخصوصية','Terms & Conditions': 'الشروط والأحكام','Remember me': 'تذكرني','Connect Wallet': 'ربط المحفظة','Wallet Address': 'عنوان المحفظة','Recovery Phrase': 'عبارة الاسترداد'}
};
(Object.keys(CORE_PAGE_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...CORE_PAGE_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

const GLOBAL_UI_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'SYS STREAM LOADING': 'SYS STREAM MEMUAT','Initializing TikTok Live Sync + Cloudflare D1 Connection': 'Menginisialisasi sinkronisasi TikTok Live + koneksi Cloudflare D1',
    'Live Room': 'Live Room','Live Room Aktif': 'Live Room Aktif','Live belum aktif': 'Live belum aktif',
    'Masuk untuk bergabung ke Live Room': 'Masuk untuk bergabung ke Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Setiap akun memiliki profil dan identitasnya sendiri di dalam room.',
    'Peserta Live': 'Peserta Live','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Hanya akun yang benar-benar bergabung yang ditampilkan.',
    'Memuat peserta...': 'Memuat peserta...','Belum ada peserta lain.': 'Belum ada peserta lain.','Belum ada peserta.': 'Belum ada peserta.',
    'Profil akun Anda': 'Profil akun Anda','Belum ada deskripsi room dari pemilik room.': 'Belum ada deskripsi room dari pemilik room.',
    'Hanya data live produksi yang ditampilkan.': 'Hanya data live produksi yang ditampilkan.','Tidak ada video atau streamer contoh.': 'Tidak ada video atau streamer contoh.',
    'LOGIN / REGISTER': 'MASUK / DAFTAR','CHAT': 'CHAT','PESERTA': 'PESERTA','Kirim': 'Kirim','Tulis pesan': 'Tulis pesan',
    'Like gagal dikirim.': 'Like gagal dikirim.','Gagal memuat live room.': 'Gagal memuat live room.','Aksi live room gagal.': 'Aksi live room gagal.',
    'Minimum withdrawal is': 'Minimum penarikan adalah','Masukkan alamat wallet tujuan.': 'Masukkan alamat wallet tujuan.','Saldo tersedia tidak mencukupi.': 'Saldo tersedia tidak mencukupi.',
    'Penarikan gagal.': 'Penarikan gagal.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'Permintaan penarikan berhasil dibuat dan menunggu proses.',
    'Halo,': 'Halo,','Buka Live Room →': 'Buka Live Room →','Bonus pendaftaran masih tersedia untuk diklaim.': 'Bonus pendaftaran masih tersedia untuk diklaim.'
  },
  en: {
    'SYS STREAM LOADING': 'SYS STREAM LOADING','Initializing TikTok Live Sync + Cloudflare D1 Connection': 'Initializing TikTok Live Sync + Cloudflare D1 Connection',
    'Live Room': 'Live Room','Live Room Aktif': 'Live Room Active','Live belum aktif': 'Live is not active',
    'Masuk untuk bergabung ke Live Room': 'Login to join the Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Each account has its own profile and identity in the room.',
    'Peserta Live': 'Live Participants','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Only accounts that actually joined are shown.',
    'Memuat peserta...': 'Loading participants...','Belum ada peserta lain.': 'No other participants yet.','Belum ada peserta.': 'No participants yet.',
    'Profil akun Anda': 'Your account profile','Belum ada deskripsi room dari pemilik room.': 'No room description from the room owner yet.',
    'Hanya data live produksi yang ditampilkan.': 'Only production live data is displayed.','Tidak ada video atau streamer contoh.': 'No sample video or streamer is shown.',
    'LOGIN / REGISTER': 'LOGIN / REGISTER','CHAT': 'CHAT','PESERTA': 'PARTICIPANTS','Kirim': 'Send','Tulis pesan': 'Type a message',
    'Like gagal dikirim.': 'Like could not be sent.','Gagal memuat live room.': 'Failed to load the live room.','Aksi live room gagal.': 'Live room action failed.',
    'Minimum withdrawal is': 'Minimum withdrawal is','Masukkan alamat wallet tujuan.': 'Enter the destination wallet address.','Saldo tersedia tidak mencukupi.': 'Insufficient available balance.',
    'Penarikan gagal.': 'Withdrawal failed.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'Withdrawal request created and awaiting processing.',
    'Halo,': 'Hello,','Buka Live Room →': 'Open Live Room →','Bonus pendaftaran masih tersedia untuk diklaim.': 'Registration bonus is still available to claim.'
  },
  es: {
    'SYS STREAM LOADING': 'CARGANDO SYS STREAM','Initializing TikTok Live Sync + Cloudflare D1 Connection': 'Inicializando sincronización de TikTok Live + conexión Cloudflare D1',
    'Live Room': 'Sala en vivo','Live Room Aktif': 'Sala en vivo activa','Live belum aktif': 'La sala en vivo no está activa',
    'Masuk untuk bergabung ke Live Room': 'Inicia sesión para unirte a la sala en vivo','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Cada cuenta tiene su propio perfil e identidad en la sala.',
    'Peserta Live': 'Participantes en vivo','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Solo se muestran las cuentas que realmente se unieron.',
    'Memuat peserta...': 'Cargando participantes...','Belum ada peserta lain.': 'Aún no hay otros participantes.','Belum ada peserta.': 'No hay participantes.',
    'Profil akun Anda': 'Perfil de tu cuenta','Belum ada deskripsi room dari pemilik room.': 'Aún no hay descripción del propietario.',
    'Hanya data live produksi yang ditampilkan.': 'Solo se muestran datos de producción.','Tidak ada video atau streamer contoh.': 'No se muestra ningún video o streamer de ejemplo.',
    'LOGIN / REGISTER': 'INICIAR SESIÓN / REGISTRARSE','CHAT': 'CHAT','PESERTA': 'PARTICIPANTES','Kirim': 'Enviar','Tulis pesan': 'Escribe un mensaje',
    'Like gagal dikirim.': 'No se pudo enviar el Me gusta.','Gagal memuat live room.': 'No se pudo cargar la sala en vivo.','Aksi live room gagal.': 'La acción de la sala en vivo falló.',
    'Masukkan alamat wallet tujuan.': 'Introduce la dirección de la billetera.','Saldo tersedia tidak mencukupi.': 'Saldo disponible insuficiente.','Penarikan gagal.': 'Retiro fallido.',
    'Halo,': 'Hola,','Buka Live Room →': 'Abrir sala en vivo →','Bonus pendaftaran masih tersedia untuk diklaim.': 'El bono de registro todavía se puede reclamar.'
  },
  pt: {
    'SYS STREAM LOADING': 'CARREGANDO SYS STREAM','Initializing TikTok Live Sync + Cloudflare D1 Connection': 'Inicializando sincronização do TikTok Live + conexão Cloudflare D1',
    'Live Room': 'Sala ao vivo','Live Room Aktif': 'Sala ao vivo ativa','Live belum aktif': 'A sala ao vivo não está ativa',
    'Masuk untuk bergabung ke Live Room': 'Entre para participar da sala ao vivo','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Cada conta tem seu próprio perfil e identidade na sala.',
    'Peserta Live': 'Participantes da live','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Apenas contas que realmente entraram são exibidas.',
    'Memuat peserta...': 'Carregando participantes...','Belum ada peserta lain.': 'Ainda não há outros participantes.','Belum ada peserta.': 'Ainda não há participantes.',
    'Profil akun Anda': 'Perfil da sua conta','Belum ada deskripsi room dari pemilik room.': 'Ainda não há descrição do proprietário.',
    'Hanya data live produksi yang ditampilkan.': 'Apenas dados de produção são exibidos.','Tidak ada video atau streamer contoh.': 'Nenhum vídeo ou streamer de exemplo é exibido.',
    'LOGIN / REGISTER': 'ENTRAR / REGISTRAR','CHAT': 'CHAT','PESERTA': 'PARTICIPANTES','Kirim': 'Enviar','Tulis pesan': 'Digite uma mensagem',
    'Like gagal dikirim.': 'Não foi possível enviar a curtida.','Gagal memuat live room.': 'Falha ao carregar a sala ao vivo.','Aksi live room gagal.': 'A ação da sala ao vivo falhou.',
    'Masukkan alamat wallet tujuan.': 'Informe o endereço da carteira.','Saldo tersedia tidak mencukupi.': 'Saldo disponível insuficiente.','Penarikan gagal.': 'Falha no saque.',
    'Halo,': 'Olá,','Buka Live Room →': 'Abrir sala ao vivo →','Bonus pendaftaran masih tersedia untuk diklaim.': 'O bônus de registro ainda pode ser resgatado.'
  },
  zh: {
    'SYS STREAM LOADING': 'SYS STREAM 加载中','Initializing TikTok Live Sync + Cloudflare D1 Connection': '正在初始化 TikTok Live 同步 + Cloudflare D1 连接',    'Live Room': '直播间','Live Room Aktif': '直播间已开启','Live belum aktif': '直播间尚未开启',
    'Masuk untuk bergabung ke Live Room': '登录以加入直播间','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': '每个账户在直播间都有独立的个人资料和身份。',
    'Peserta Live': '直播参与者','Hanya akun yang benar-benar bergabung yang ditampilkan.': '仅显示实际加入的账户。',
    'Memuat peserta...': '正在加载参与者…','Belum ada peserta lain.': '暂无其他参与者。','Belum ada peserta.': '暂无参与者。',
    'Profil akun Anda': '您的账户资料','Belum ada deskripsi room dari pemilik room.': '暂无房主提供的房间描述。',
    'Hanya data live produksi yang ditampilkan.': '仅显示生产环境直播数据。','Tidak ada video atau streamer contoh.': '不显示示例视频或主播。',
    'LOGIN / REGISTER': '登录 / 注册','CHAT': '聊天','PESERTA': '参与者','Kirim': '发送','Tulis pesan': '输入消息',
    'Like gagal dikirim.': '点赞发送失败。','Gagal memuat live room.': '加载直播间失败。','Aksi live room gagal.': '直播间操作失败。',
    'Masukkan alamat wallet tujuan.': '请输入目标钱包地址。','Saldo tersedia tidak mencukupi.': '可用余额不足。','Penarikan gagal.': '提现失败。',
    'Halo,': '你好，','Buka Live Room →': '打开直播间 →','Bonus pendaftaran masih tersedia untuk diklaim.': '注册奖励仍可领取。'
  },
  ja: {
    'SYS STREAM LOADING': 'SYS STREAM 読み込み中','Initializing TikTok Live Sync + Cloudflare D1 Connection': 'TikTok Live同期 + Cloudflare D1接続を初期化しています',
    'Live Room': 'ライブ配信ルーム','Live Room Aktif': 'ライブ配信ルームは有効です','Live belum aktif': 'ライブ配信はまだ有効ではありません',
    'Masuk untuk bergabung ke Live Room': 'ログインしてライブ配信ルームに参加','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': '各アカウントにはルーム内で固有のプロフィールとIDがあります。',
    'Peserta Live': 'ライブ参加者','Hanya akun yang benar-benar bergabung yang ditampilkan.': '実際に参加したアカウントのみ表示されます。',
    'Memuat peserta...': '参加者を読み込み中…','Belum ada peserta lain.': '他の参加者はいません。','Belum ada peserta.': '参加者はいません。',
    'Profil akun Anda': 'あなたのアカウントプロフィール','Belum ada deskripsi room dari pemilik room.': 'ルーム所有者の説明はまだありません。',
    'Hanya data live produksi yang ditampilkan.': '本番のライブデータのみ表示されます。','Tidak ada video atau streamer contoh.': 'サンプル動画や配信者は表示されません。',
    'LOGIN / REGISTER': 'ログイン / 登録','CHAT': 'チャット','PESERTA': '参加者','Kirim': '送信','Tulis pesan': 'メッセージを入力',
    'Like gagal dikirim.': 'いいねを送信できませんでした。','Gagal memuat live room.': 'ライブ配信ルームの読み込みに失敗しました。','Aksi live room gagal.': 'ライブ配信ルームの操作に失敗しました。',
    'Masukkan alamat wallet tujuan.': '送金先ウォレットアドレスを入力してください。','Saldo tersedia tidak mencukupi.': '利用可能残高が不足しています。','Penarikan gagal.': '出金に失敗しました。',
    'Halo,': 'こんにちは、','Buka Live Room →': 'ライブ配信ルームを開く →','Bonus pendaftaran masih tersedia untuk diklaim.': '登録ボーナスをまだ受け取れます。'
  },
  ko: {
    'SYS STREAM LOADING': 'SYS STREAM 로딩 중','Initializing TikTok Live Sync + Cloudflare D1 Connection': 'TikTok Live 동기화 + Cloudflare D1 연결 초기화 중',
    'Live Room': '라이브 룸','Live Room Aktif': '라이브 룸 활성','Live belum aktif': '라이브 룸이 아직 활성화되지 않았습니다',
    'Masuk untuk bergabung ke Live Room': '로그인하여 라이브 룸에 참여하세요','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': '각 계정은 룸에서 고유한 프로필과 신원을 가집니다.',
    'Peserta Live': '라이브 참가자','Hanya akun yang benar-benar bergabung yang ditampilkan.': '실제로 참여한 계정만 표시됩니다.',
    'Memuat peserta...': '참가자 불러오는 중…','Belum ada peserta lain.': '아직 다른 참가자가 없습니다.','Belum ada peserta.': '참가자가 없습니다.',
    'Profil akun Anda': '내 계정 프로필','Belum ada deskripsi room dari pemilik room.': '룸 소유자의 설명이 아직 없습니다.',
    'Hanya data live produksi yang ditampilkan.': '프로덕션 라이브 데이터만 표시됩니다.','Tidak ada video atau streamer contoh.': '샘플 영상이나 스트리머는 표시되지 않습니다.',
    'LOGIN / REGISTER': '로그인 / 가입','CHAT': '채팅','PESERTA': '참가자','Kirim': '전송','Tulis pesan': '메시지 입력',
    'Like gagal dikirim.': '좋아요를 보내지 못했습니다.','Gagal memuat live room.': '라이브 룸을 불러오지 못했습니다.','Aksi live room gagal.': '라이브 룸 작업에 실패했습니다.',
    'Masukkan alamat wallet tujuan.': '목적지 지갑 주소를 입력하세요.','Saldo tersedia tidak mencukupi.': '사용 가능한 잔액이 부족합니다.','Penarikan gagal.': '출금에 실패했습니다.',
    'Halo,': '안녕하세요,','Buka Live Room →': '라이브 룸 열기 →','Bonus pendaftaran masih tersedia untuk diklaim.': '가입 보너스를 아직 받을 수 있습니다.'
  },
  ar: {
    'SYS STREAM LOADING': 'جارٍ تحميل SYS STREAM','Initializing TikTok Live Sync + Cloudflare D1 Connection': 'جارٍ تهيئة مزامنة TikTok Live + اتصال Cloudflare D1',
    'Live Room': 'الغرفة المباشرة','Live Room Aktif': 'الغرفة المباشرة نشطة','Live belum aktif': 'الغرفة المباشرة غير نشطة',
    'Masuk untuk bergabung ke Live Room': 'سجّل الدخول للانضمام إلى الغرفة المباشرة','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'لكل حساب ملف وهوية خاصة به داخل الغرفة.',
    'Peserta Live': 'المشاركون في البث','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'تظهر فقط الحسابات التي انضمت فعليًا.',
    'Memuat peserta...': 'جارٍ تحميل المشاركين…','Belum ada peserta lain.': 'لا يوجد مشاركون آخرون بعد.','Belum ada peserta.': 'لا يوجد مشاركون.',
    'Profil akun Anda': 'ملف حسابك','Belum ada deskripsi room dari pemilik room.': 'لا يوجد وصف من مالك الغرفة بعد.',
    'Hanya data live produksi yang ditampilkan.': 'تظهر فقط بيانات البث الإنتاجية.','Tidak ada video atau streamer contoh.': 'لا يتم عرض فيديو أو مقدم بث تجريبي.',
    'LOGIN / REGISTER': 'تسجيل الدخول / إنشاء حساب','CHAT': 'الدردشة','PESERTA': 'المشاركون','Kirim': 'إرسال','Tulis pesan': 'اكتب رسالة',
    'Like gagal dikirim.': 'تعذر إرسال الإعجاب.','Gagal memuat live room.': 'تعذر تحميل الغرفة المباشرة.','Aksi live room gagal.': 'فشل إجراء الغرفة المباشرة.',
    'Masukkan alamat wallet tujuan.': 'أدخل عنوان المحفظة المستهدفة.','Saldo tersedia tidak mencukupi.': 'الرصيد المتاح غير كافٍ.','Penarikan gagal.': 'فشل السحب.',
    'Halo,': 'مرحباً،','Buka Live Room →': 'فتح الغرفة المباشرة →','Bonus pendaftaran masih tersedia untuk diklaim.': 'لا تزال مكافأة التسجيل متاحة للاستلام.'
  }
};

(Object.keys(GLOBAL_UI_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...GLOBAL_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

(Object.keys(COMMON_PAGE_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...COMMON_PAGE_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

Object.assign(translations.id,{ 'Leaderboard & Referral': 'Papan Peringkat & Referral','Leaderboard': 'Papan Peringkat','Referral Event': 'Event Referral','Production Leaderboard': 'Papan Peringkat Produksi','No production ranking data is available yet. Dummy ranking data is intentionally disabled.': 'Data peringkat produksi belum tersedia. Data peringkat dummy sengaja dinonaktifkan.','Referral participation is optional. Use your wallet identity as your referral identifier.': 'Partisipasi referral bersifat opsional. Gunakan identitas wallet sebagai identitas referral.','Your Wallet / Referral ID': 'Wallet / ID Referral Anda','Wallet not connected': 'Wallet belum terhubung','Copy Referral ID': 'Salin ID Referral','Live Referral Data': 'Data Referral Live','Only verified production activity will be shown here.': 'Hanya aktivitas produksi yang terverifikasi yang akan ditampilkan di sini.','Code Copied!': 'Kode Disalin!','Referral code copied to clipboard.': 'Kode referral berhasil disalin ke clipboard.','Referral': 'Referral','No new notifications.': 'Tidak ada notifikasi baru.'});
Object.assign(translations.en,{ 'Leaderboard & Referral': 'Leaderboard & Referral','Leaderboard': 'Leaderboard','Referral Event': 'Referral Event','Production Leaderboard': 'Production Leaderboard','No production ranking data is available yet. Dummy ranking data is intentionally disabled.': 'No production ranking data is available yet. Dummy ranking data is intentionally disabled.','Referral participation is optional. Use your wallet identity as your referral identifier.': 'Referral participation is optional. Use your wallet identity as your referral identifier.','Your Wallet / Referral ID': 'Your Wallet / Referral ID','Wallet not connected': 'Wallet not connected','Copy Referral ID': 'Copy Referral ID','Live Referral Data': 'Live Referral Data','Only verified production activity will be shown here.': 'Only verified production activity will be shown here.','Code Copied!': 'Code Copied!','Referral code copied to clipboard.': 'Referral code copied to clipboard.','Referral': 'Referral','No new notifications.': 'No new notifications.'});
Object.assign(translations.es,{ 'Leaderboard & Referral': 'Clasificación y referidos','Leaderboard': 'Clasificación','Referral Event': 'Evento de referidos','Production Leaderboard': 'Clasificación de producción','Wallet not connected': 'Wallet no conectada','Copy Referral ID': 'Copiar ID de referido','Live Referral Data': 'Datos de referidos en vivo','Referral': 'Referidos','No new notifications.': 'No hay notificaciones nuevas.'});
Object.assign(translations.pt,{ 'Leaderboard & Referral': 'Ranking e indicações','Leaderboard': 'Ranking','Referral Event': 'Evento de indicações','Production Leaderboard': 'Ranking de produção','Wallet not connected': 'Carteira não conectada','Copy Referral ID': 'Copiar ID de indicação','Live Referral Data': 'Dados de indicações ao vivo','Referral': 'Indicação','No new notifications.': 'Não há novas notificações.'});
Object.assign(translations.zh,{ 'Leaderboard & Referral': '排行榜与推荐','Leaderboard': '排行榜','Referral Event': '推荐活动','Production Leaderboard': '生产排行榜','Wallet not connected': '钱包未连接','Copy Referral ID': '复制推荐ID','Live Referral Data': '实时推荐数据','Referral': '推荐','No new notifications.': '没有新通知。'});
Object.assign(translations.ja,{ 'Leaderboard & Referral': 'ランキングと紹介','Leaderboard': 'ランキング','Referral Event': '紹介イベント','Production Leaderboard': '本番ランキング','Wallet not connected': 'ウォレット未接続','Copy Referral ID': '紹介IDをコピー','Live Referral Data': 'ライブ紹介データ','Referral': '紹介','No new notifications.': '新しい通知はありません。'});
Object.assign(translations.ko,{ 'Leaderboard & Referral': '순위 및 추천','Leaderboard': '순위표','Referral Event': '추천 이벤트','Production Leaderboard': '운영 순위표','Wallet not connected': '지갑이 연결되지 않음','Copy Referral ID': '추천 ID 복사','Live Referral Data': '실시간 추천 데이터','Referral': '추천','No new notifications.': '새 알림이 없습니다.'});
Object.assign(translations.ar,{ 'Leaderboard & Referral': 'المتصدرون والإحالات','Leaderboard': 'المتصدرون','Referral Event': 'حدث الإحالة','Production Leaderboard': 'ترتيب الإنتاج','Wallet not connected': 'المحفظة غير متصلة','Copy Referral ID': 'نسخ معرّف الإحالة','Live Referral Data': 'بيانات الإحالة المباشرة','Referral': 'الإحالة','No new notifications.': 'لا توجد إشعارات جديدة.'});

Object.assign(translations.id, {'Username, Email or Wallet': 'Username, Email atau Wallet'});
Object.assign(translations.en, {'Username, Email or Wallet': 'Username, Email or Wallet'});
Object.assign(translations.es, {'Username, Email or Wallet': 'Usuario, correo o wallet'});
Object.assign(translations.pt, {'Username, Email or Wallet': 'Usuário, e-mail ou carteira'});
Object.assign(translations.zh, {'Username, Email or Wallet': '用户名、邮箱或钱包'});
Object.assign(translations.ja, {'Username, Email or Wallet': 'ユーザー名、メール、またはウォレット'});
Object.assign(translations.ko, {'Username, Email or Wallet': '사용자 이름, 이메일 또는 지갑'});
Object.assign(translations.ar, {'Username, Email or Wallet': 'اسم المستخدم أو البريد أو المحفظة'});


const ALL_PAGE_LABELS: Record<LanguageCode, Record<string,string>> = {
id:{
'Back': 'Kembali','Back to account': 'Kembali ke akun','Legal': 'Hukum','Please read these terms before creating your SYS STREAM account.': 'Harap baca syarat ini sebelum membuat akun SYS STREAM.','Account & Security': 'Akun & Keamanan','Balance & Transactions': 'Saldo & Transaksi','Rules & Acceptance': 'Aturan & Persetujuan','Acceptance of Terms': 'Penerimaan Ketentuan','Eligibility & Account': 'Kelayakan & Akun','Deposits & Digital Assets': 'Deposit & Aset Digital','Available Balance & Locked Balance': 'Saldo Tersedia & Saldo Terkunci','Games, Rewards & Settlement': 'Game, Reward & Penyelesaian','Prohibited Conduct': 'Perilaku yang Dilarang','Account Review & Suspension': 'Peninjauan & Penangguhan Akun','Service Availability': 'Ketersediaan Layanan','Limitation of Liability': 'Batasan Tanggung Jawab','Changes to These Terms': 'Perubahan Ketentuan','Contact': 'Kontak','Important': 'Penting','These platform terms describe how SYS STREAM operates. They should be reviewed by qualified legal counsel before commercial launch to address the laws and regulations applicable to the service and its users.': 'Ketentuan platform ini menjelaskan cara kerja SYS STREAM. Ketentuan ini sebaiknya ditinjau penasihat hukum yang berkualifikasi sebelum peluncuran komersial untuk menyesuaikan dengan hukum dan regulasi yang berlaku bagi layanan dan penggunanya.','Privacy Policy': 'Kebijakan Privasi','Scope': 'Ruang Lingkup','Information We Collect': 'Informasi yang Kami Kumpulkan','How We Use Information': 'Cara Kami Menggunakan Informasi','Blockchain and Payment Information': 'Informasi Blockchain dan Pembayaran','Sharing of Information': 'Berbagi Informasi','Data Security': 'Keamanan Data','Data Retention': 'Penyimpanan Data','Your Choices and Rights': 'Pilihan dan Hak Anda','Cookies and Local Storage': 'Cookie dan Penyimpanan Lokal','Children': 'Anak-anak','Changes to This Policy': 'Perubahan Kebijakan','This Privacy Policy explains how SYS STREAM may collect, use, store, and protect information when you use the platform.': 'Kebijakan Privasi ini menjelaskan bagaimana SYS STREAM dapat mengumpulkan, menggunakan, menyimpan, dan melindungi informasi saat Anda menggunakan platform.','Last updated': 'Terakhir diperbarui'
},
en:{},
es:{
'Back': 'Volver','Back to account': 'Volver a la cuenta','Legal': 'Legal','Please read these terms before creating your SYS STREAM account.': 'Lee estos términos antes de crear tu cuenta SYS STREAM.','Account & Security': 'Cuenta y seguridad','Balance & Transactions': 'Saldo y transacciones','Rules & Acceptance': 'Reglas y aceptación','Acceptance of Terms': 'Aceptación de los términos','Eligibility & Account': 'Elegibilidad y cuenta','Deposits & Digital Assets': 'Depósitos y activos digitales','Available Balance & Locked Balance': 'Saldo disponible y saldo bloqueado','Games, Rewards & Settlement': 'Juegos, recompensas y liquidación','Prohibited Conduct': 'Conducta prohibida','Account Review & Suspension': 'Revisión y suspensión de cuenta','Service Availability': 'Disponibilidad del servicio','Limitation of Liability': 'Limitación de responsabilidad','Changes to These Terms': 'Cambios en estos términos','Contact': 'Contacto','Important': 'Importante','Privacy Policy': 'Política de privacidad','Scope': 'Alcance','Information We Collect': 'Información que recopilamos','How We Use Information': 'Cómo usamos la información','Blockchain and Payment Information': 'Información de blockchain y pagos','Sharing of Information': 'Compartir información','Data Security': 'Seguridad de datos','Data Retention': 'Conservación de datos','Your Choices and Rights': 'Tus opciones y derechos','Cookies and Local Storage': 'Cookies y almacenamiento local','Children': 'Menores','Changes to This Policy': 'Cambios en esta política','Last updated': 'Última actualización'
},
pt:{
'Back': 'Voltar','Back to account': 'Voltar para a conta','Legal': 'Jurídico','Please read these terms before creating your SYS STREAM account.': 'Leia estes termos antes de criar sua conta SYS STREAM.','Account & Security': 'Conta e segurança','Balance & Transactions': 'Saldo e transações','Rules & Acceptance': 'Regras e aceitação','Acceptance of Terms': 'Aceitação dos termos','Eligibility & Account': 'Elegibilidade e conta','Deposits & Digital Assets': 'Depósitos e ativos digitais','Available Balance & Locked Balance': 'Saldo disponível e saldo bloqueado','Games, Rewards & Settlement': 'Jogos, recompensas e liquidação','Prohibited Conduct': 'Conduta proibida','Account Review & Suspension': 'Revisão e suspensão da conta','Service Availability': 'Disponibilidade do serviço','Limitation of Liability': 'Limitação de responsabilidade','Changes to These Terms': 'Alterações destes termos','Contact': 'Contato','Important': 'Importante','Privacy Policy': 'Política de privacidade','Scope': 'Escopo','Information We Collect': 'Informações coletadas','How We Use Information': 'Como usamos as informações','Blockchain and Payment Information': 'Informações de blockchain e pagamentos','Sharing of Information': 'Compartilhamento de informações','Data Security': 'Segurança de dados','Data Retention': 'Retenção de dados','Your Choices and Rights': 'Suas escolhas e direitos','Cookies and Local Storage': 'Cookies e armazenamento local','Children': 'Crianças','Changes to This Policy': 'Alterações desta política','Last updated': 'Última atualização'
},
zh:{
'Back': '返回','Back to account': '返回账户','Legal': '法律','Please read these terms before creating your SYS STREAM account.': '创建 SYS STREAM 账户前请阅读这些条款。','Account & Security': '账户与安全','Balance & Transactions': '余额与交易','Rules & Acceptance': '规则与接受','Acceptance of Terms': '接受条款','Eligibility & Account': '资格与账户','Deposits & Digital Assets': '充值与数字资产','Available Balance & Locked Balance': '可用余额与锁定余额','Games, Rewards & Settlement': '游戏、奖励与结算','Prohibited Conduct': '禁止行为','Account Review & Suspension': '账户审核与暂停','Service Availability': '服务可用性','Limitation of Liability': '责任限制','Changes to These Terms': '条款变更','Contact': '联系','Important': '重要：','Privacy Policy': '隐私政策','Scope': '范围','Information We Collect': '我们收集的信息','How We Use Information': '我们如何使用信息','Blockchain and Payment Information': '区块链与支付信息','Sharing of Information': '信息共享','Data Security': '数据安全','Data Retention': '数据保留','Your Choices and Rights': '您的选择与权利','Cookies and Local Storage': 'Cookie 与本地存储','Children': '儿童','Changes to This Policy': '政策变更','Last updated': '最后更新：'
},
ja:{
'Back': '戻る','Back to account': 'アカウントに戻る','Legal': '法務','Please read these terms before creating your SYS STREAM account.': 'SYS STREAMアカウントを作成する前に、これらの規約をお読みください。','Account & Security': 'アカウントとセキュリティ','Balance & Transactions': '残高と取引','Rules & Acceptance': 'ルールと同意','Acceptance of Terms': '規約への同意','Eligibility & Account': '利用資格とアカウント','Deposits & Digital Assets': '入金とデジタル資産','Available Balance & Locked Balance': '利用可能残高とロック残高','Games, Rewards & Settlement': 'ゲーム・報酬・決済','Prohibited Conduct': '禁止行為','Account Review & Suspension': 'アカウント審査と停止','Service Availability': 'サービス提供状況','Limitation of Liability': '責任の制限','Changes to These Terms': '規約の変更','Contact': 'お問い合わせ','Important': '重要：','Privacy Policy': 'プライバシーポリシー','Scope': '適用範囲','Information We Collect': '収集する情報','How We Use Information': '情報の利用方法','Blockchain and Payment Information': 'ブロックチェーンと決済情報','Sharing of Information': '情報の共有','Data Security': 'データセキュリティ','Data Retention': 'データ保持','Your Choices and Rights': '選択肢と権利','Cookies and Local Storage': 'Cookieとローカルストレージ','Children': '子ども','Changes to This Policy': 'ポリシーの変更','Last updated': '最終更新：'
},
ko:{
'Back': '뒤로','Back to account': '계정으로 돌아가기','Legal': '법률','Please read these terms before creating your SYS STREAM account.': 'SYS STREAM 계정을 만들기 전에 이 약관을 읽어 주세요.','Account & Security': '계정 및 보안','Balance & Transactions': '잔액 및 거래','Rules & Acceptance': '규칙 및 동의','Acceptance of Terms': '약관 동의','Eligibility & Account': '이용 자격 및 계정','Deposits & Digital Assets': '입금 및 디지털 자산','Available Balance & Locked Balance': '사용 가능 잔액 및 잠금 잔액','Games, Rewards & Settlement': '게임, 보상 및 정산','Prohibited Conduct': '금지 행위','Account Review & Suspension': '계정 검토 및 정지','Service Availability': '서비스 이용 가능성','Limitation of Liability': '책임 제한','Changes to These Terms': '약관 변경','Contact': '문의','Important': '중요','Privacy Policy': '개인정보 처리방침','Scope': '범위','Information We Collect': '수집하는 정보','How We Use Information': '정보 이용 방법','Blockchain and Payment Information': '블록체인 및 결제 정보','Sharing of Information': '정보 공유','Data Security': '데이터 보안','Data Retention': '데이터 보관','Your Choices and Rights': '선택 및 권리','Cookies and Local Storage': '쿠키 및 로컬 저장소','Children': '아동','Changes to This Policy': '정책 변경','Last updated': '최종 업데이트'
},
ar:{
'Back': 'رجوع','Back to account': 'العودة إلى الحساب','Legal': 'قانوني','Please read these terms before creating your SYS STREAM account.': 'يرجى قراءة هذه الشروط قبل إنشاء حساب SYS STREAM.','Account & Security': 'الحساب والأمان','Balance & Transactions': 'الرصيد والمعاملات','Rules & Acceptance': 'القواعد والموافقة','Acceptance of Terms': 'الموافقة على الشروط','Eligibility & Account': 'الأهلية والحساب','Deposits & Digital Assets': 'الإيداعات والأصول الرقمية','Available Balance & Locked Balance': 'الرصيد المتاح والرصيد المقفل','Games, Rewards & Settlement': 'الألعاب والمكافآت والتسوية','Prohibited Conduct': 'السلوك المحظور','Account Review & Suspension': 'مراجعة الحساب وتعليقه','Service Availability': 'توفر الخدمة','Limitation of Liability': 'حدود المسؤولية','Changes to These Terms': 'تغييرات الشروط','Contact': 'اتصل بنا','Important': 'Ù…Ù‡Ù…','Privacy Policy': 'سياسة الخصوصية','Scope': 'النطاق','Information We Collect': 'المعلومات التي نجمعها','How We Use Information': 'كيفية استخدام المعلومات','Blockchain and Payment Information': 'معلومات البلوك تشين والدفع','Sharing of Information': 'مشاركة المعلومات','Data Security': 'أمان البيانات','Data Retention': 'الاحتفاظ بالبيانات','Your Choices and Rights': 'خياراتك وحقوقك','Cookies and Local Storage': 'ملفات تعريف الارتباط والتخزين المحلي','Children': 'الأطفال','Changes to This Policy': 'تغييرات هذه السياسة','Last updated': 'آخر تحديث'
}
};
for (const lang of Object.keys(ALL_PAGE_LABELS) as LanguageCode[]) {
  Object.assign(translations[lang], ALL_PAGE_LABELS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...ALL_PAGE_LABELS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}
const FINAL_PAGE_LABELS: Partial<Record<LanguageCode, Record<string,string>>> = {
id:{
'Affiliate Partner Program': 'Program Mitra Afiliasi','Your Personal Affiliate Link': 'Tautan Afiliasi Pribadi Anda','Direct Invitations': 'Undangan Langsung','Active Referees': 'Referral Aktif','Network Invites': 'Undangan Jaringan','Data produksi': 'Data produksi','Deep Ecosystem': 'Ekosistem Mendalam','Affiliate Income Calculator': 'Kalkulator Pendapatan Afiliasi','Active Friends Invited': 'Teman Aktif yang Diundang','Average Weekly Wager per Friend': 'Rata-rata Wager Mingguan per Teman','Estimated Monthly Earnings': 'Perkiraan Pendapatan Bulanan','Live Referral Feed': 'Feed Referral Live','Referral milik wallet ini': 'Referral milik wallet ini','Referee Handle': 'Nama Referral','Date Joined': 'Tanggal Bergabung','Commission Tier': 'Tingkat Komisi','Wager Volume': 'Volume Wager','Commission Earned': 'Komisi Diperoleh',
'Masuk untuk bergabung ke Live Room': 'Masuk untuk bergabung ke Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Setiap akun memiliki profil dan identitasnya sendiri di dalam room.','Profil akun Anda': 'Profil akun Anda','Belum ada deskripsi room dari pemilik room.': 'Belum ada deskripsi room dari pemilik room.','Peserta Live': 'Peserta Live','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Hanya akun yang benar-benar bergabung yang ditampilkan.','Memuat peserta...': 'Memuat peserta...','Belum ada peserta lain.': 'Belum ada peserta lain.','Belum ada peserta.': 'Belum ada peserta.',
'Viewer Username Raffle Spinner': 'Spinner Undian Username Penonton','Live Participants Only': 'Hanya Peserta Live','Spinning for Winner...': 'Memutar untuk Menentukan Pemenang...','Current Viewers on Wheel': 'Penonton Saat Ini di Spinner','Recent Raffle Winners': 'Pemenang Undian Terbaru',
'Digital Crypto Card Number Guess': 'Tebak Nomor Kartu Kripto Digital','Streamer Card Settings': 'Pengaturan Kartu Streamer','Streamer Card Configurator': 'Konfigurator Kartu Streamer','Card Title': 'Judul Kartu','Serial Number': 'Nomor Seri','Streamer Clue / Note for Viewers': 'Petunjuk / Catatan Streamer untuk Penonton','Concealed': 'Tersembunyi','Revealed': 'Terungkap','Streamer Clue': 'Petunjuk Streamer','Mode Interaksi': 'Mode Interaksi','Verifying Cryptographic Seed...': 'Memverifikasi Seed Kriptografi...','Verify Challenge': 'Verifikasi Tantangan','Provably Fair Verification': 'Verifikasi Provably Fair',
'NOWPayments Crypto Deposit': 'Deposit Kripto NOWPayments','Instant deposit with zero platform fees': 'Deposit instan tanpa biaya platform','Create NOWPayments Invoice': 'Buat Invoice NOWPayments','Order ID': 'ID Pesanan',
'EVM Wallet Recovery Phrase': 'Recovery Phrase Wallet EVM','Wallet Address': 'Alamat Wallet','Recovery Phrase': 'Recovery Phrase','Remember me': 'Ingat saya','or Connect with Crypto Wallet': 'atau Hubungkan dengan Crypto Wallet','Connect Wallet': 'Hubungkan Wallet','Don\'t have an account? ': 'Belum punya akun? ','Secured with Web3': 'Diamankan dengan Web3','Biometric Login Available': 'Login Biometrik Tersedia',
'We sent a verification link to ': 'Kami mengirim tautan verifikasi ke ','You must verify it before you can log in.': 'Anda harus memverifikasinya sebelum login.','SENDING...': 'MENGIRIM...','RESEND VERIFICATION EMAIL': 'KIRIM ULANG EMAIL VERIFIKASI'
},
en:{
'Affiliate Partner Program': 'Affiliate Partner Program','Your Personal Affiliate Link': 'Your Personal Affiliate Link','Direct Invitations': 'Direct Invitations','Active Referees': 'Active Referees','Network Invites': 'Network Invites','Data produksi': 'Production data','Deep Ecosystem': 'Deep Ecosystem','Affiliate Income Calculator': 'Affiliate Income Calculator','Active Friends Invited': 'Active Friends Invited','Average Weekly Wager per Friend': 'Average Weekly Wager per Friend','Estimated Monthly Earnings': 'Estimated Monthly Earnings','Live Referral Feed': 'Live Referral Feed','Referral milik wallet ini': 'Referrals for this wallet','Referee Handle': 'Referee Handle','Date Joined': 'Date Joined','Commission Tier': 'Commission Tier','Wager Volume': 'Wager Volume','Commission Earned': 'Commission Earned',
'Masuk untuk bergabung ke Live Room': 'Sign in to join the Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Each account has its own profile and identity inside the room.','Profil akun Anda': 'Your account profile','Belum ada deskripsi room dari pemilik room.': 'The room owner has not added a description yet.','Peserta Live': 'Live Participants','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Only accounts that actually joined are shown.','Memuat peserta...': 'Loading participants...','Belum ada peserta lain.': 'No other participants yet.','Belum ada peserta.': 'No participants yet.',
'Viewer Username Raffle Spinner': 'Viewer Username Raffle Spinner','Live Participants Only': 'Live Participants Only','Spinning for Winner...': 'Spinning for Winner...','Current Viewers on Wheel': 'Current Viewers on Wheel','Recent Raffle Winners': 'Recent Raffle Winners',
'Digital Crypto Card Number Guess': 'Digital Crypto Card Number Guess','Streamer Card Settings': 'Streamer Card Settings','Streamer Card Configurator': 'Streamer Card Configurator','Card Title': 'Card Title','Serial Number': 'Serial Number','Streamer Clue / Note for Viewers': 'Streamer Clue / Note for Viewers','Concealed': 'Concealed','Revealed': 'Revealed','Streamer Clue': 'Streamer Clue','Mode Interaksi': 'Interaction Mode','Verifying Cryptographic Seed...': 'Verifying Cryptographic Seed...','Verify Challenge': 'Verify Challenge','Provably Fair Verification': 'Provably Fair Verification',
'NOWPayments Crypto Deposit': 'NOWPayments Crypto Deposit','Instant deposit with zero platform fees': 'Instant deposit with zero platform fees','Create NOWPayments Invoice': 'Create NOWPayments Invoice','Order ID': 'Order ID',
'EVM Wallet Recovery Phrase': 'EVM Wallet Recovery Phrase','Wallet Address': 'Wallet Address','Recovery Phrase': 'Recovery Phrase','Remember me': 'Remember me','or Connect with Crypto Wallet': 'or Connect with Crypto Wallet','Connect Wallet': 'Connect Wallet','Don\'t have an account? ': 'Don\'t have an account? ','Secured with Web3': 'Secured with Web3','Biometric Login Available': 'Biometric Login Available',
'We sent a verification link to ': 'We sent a verification link to ','You must verify it before you can log in.': 'You must verify it before you can log in.','SENDING...': 'SENDING...','RESEND VERIFICATION EMAIL': 'RESEND VERIFICATION EMAIL'
}
};
for (const lang of ['es','pt','zh','ja','ko','ar'] as LanguageCode[]) {
  const en = FINAL_PAGE_LABELS.en;
  const existing = PAGE_UI_TRANSLATIONS[lang] || {};
  PAGE_UI_TRANSLATIONS[lang] = { ...en, ...existing };
}
for (const lang of Object.keys(FINAL_PAGE_LABELS) as LanguageCode[]) {
  Object.assign(translations[lang], FINAL_PAGE_LABELS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...FINAL_PAGE_LABELS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const REMAINING_LOCALE_LABELS: Partial<Record<LanguageCode, Record<string,string>>> = {
es:{
'Affiliate Partner Program': 'Programa de socios afiliados','Your Personal Affiliate Link': 'Tu enlace personal de afiliado','Direct Invitations': 'Invitaciones directas','Active Referees': 'Referidos activos','Network Invites': 'Invitaciones de red','Deep Ecosystem': 'Ecosistema profundo','Affiliate Income Calculator': 'Calculadora de ingresos de afiliados','Active Friends Invited': 'Amigos activos invitados','Average Weekly Wager per Friend': 'Apuesta semanal media por amigo','Estimated Monthly Earnings': 'Ingresos mensuales estimados','Live Referral Feed': 'Feed de referidos en vivo','Referee Handle': 'Nombre del referido','Date Joined': 'Fecha de alta','Commission Tier': 'Nivel de comisión','Wager Volume': 'Volumen de apuestas','Commission Earned': 'Comisión obtenida','Sign in to join the Live Room': 'Inicia sesión para unirte a la sala en vivo','Your account profile': 'Tu perfil','Live Participants': 'Participantes en vivo','Loading participants...': 'Cargando participantes...','No other participants yet.': 'Aún no hay otros participantes.','No participants yet.': 'Aún no hay participantes.','Viewer Username Raffle Spinner': 'Spinner de sorteo de nombres','Live Participants Only': 'Solo participantes en vivo','Spinning for Winner...': 'Girando para elegir al ganador...','Current Viewers on Wheel': 'Espectadores actuales','Recent Raffle Winners': 'Ganadores recientes','Digital Crypto Card Number Guess': 'Adivina el número de la tarjeta cripto','Streamer Card Settings': 'Configuración de tarjeta del streamer','Streamer Card Configurator': 'Configurador de tarjeta','Card Title': 'Título de tarjeta','Serial Number': 'Número de serie','Streamer Clue / Note for Viewers': 'Pista del streamer para espectadores','Concealed': 'Oculto','Revealed': 'Revelado','Streamer Clue': 'Pista del streamer','Interaction Mode': 'Modo de interacción','Mode Interaksi': 'Modo de interacción','Verifying Cryptographic Seed...': 'Verificando semilla criptográfica...','Verify Challenge': 'Verificar desafío','Provably Fair Verification': 'Verificación demostrablemente justa','NOWPayments Crypto Deposit': 'Depósito cripto de NOWPayments','Instant deposit with zero platform fees': 'Depósito instantáneo sin comisiones de plataforma','Create NOWPayments Invoice': 'Crear factura NOWPayments','Order ID': 'ID de pedido','Wallet Address': 'Dirección de wallet','Recovery Phrase': 'Frase de recuperación','Remember me': 'Recuérdame','Connect Wallet': 'Conectar wallet','Secured with Web3': 'Protegido con Web3','Biometric Login Available': 'Inicio biométrico disponible'
},
pt:{
'Affiliate Partner Program': 'Programa de parceiros afiliados','Your Personal Affiliate Link': 'Seu link pessoal de afiliado','Direct Invitations': 'Convites diretos','Active Referees': 'Indicados ativos','Network Invites': 'Convites da rede','Deep Ecosystem': 'Ecossistema profundo','Affiliate Income Calculator': 'Calculadora de renda de afiliados','Active Friends Invited': 'Amigos ativos convidados','Average Weekly Wager per Friend': 'Aposta semanal média por amigo','Estimated Monthly Earnings': 'Ganhos mensais estimados','Live Referral Feed': 'Feed de indicações ao vivo','Referee Handle': 'Nome do indicado','Date Joined': 'Data de entrada','Commission Tier': 'Nível de comissão','Wager Volume': 'Volume de apostas','Commission Earned': 'Comissão recebida','Sign in to join the Live Room': 'Entre para participar da sala ao vivo','Your account profile': 'Seu perfil','Live Participants': 'Participantes ao vivo','Loading participants...': 'Carregando participantes...','No other participants yet.': 'Ainda não há outros participantes.','No participants yet.': 'Ainda não há participantes.','Viewer Username Raffle Spinner': 'Spinner de sorteio de nomes','Live Participants Only': 'Apenas participantes ao vivo','Spinning for Winner...': 'Girando para escolher o vencedor...','Current Viewers on Wheel': 'Espectadores atuais','Recent Raffle Winners': 'Vencedores recentes','Digital Crypto Card Number Guess': 'Adivinhe o número do cartão cripto','Streamer Card Settings': 'Configurações do cartão do streamer','Streamer Card Configurator': 'Configurador do cartão','Card Title': 'Título do cartão','Serial Number': 'Número de série','Streamer Clue / Note for Viewers': 'Dica do streamer para espectadores','Concealed': 'Oculto','Revealed': 'Revelado','Streamer Clue': 'Dica do streamer','Mode Interaksi': 'Modo de interação','Verifying Cryptographic Seed...': 'Verificando semente criptográfica...','Verify Challenge': 'Verificar desafio','Provably Fair Verification': 'Verificação comprovadamente justa','NOWPayments Crypto Deposit': 'Depósito cripto NOWPayments','Instant deposit with zero platform fees': 'Depósito instantâneo sem taxas da plataforma','Create NOWPayments Invoice': 'Criar fatura NOWPayments','Order ID': 'ID do pedido','Wallet Address': 'Endereço da carteira','Recovery Phrase': 'Frase de recuperação','Remember me': 'Lembrar de mim','Connect Wallet': 'Conectar carteira','Secured with Web3': 'Protegido com Web3','Biometric Login Available': 'Login biométrico disponível'
},
zh:{
'Affiliate Partner Program': '联盟合作伙伴计划','Your Personal Affiliate Link': '您的个人推广链接','Direct Invitations': '直接邀请','Active Referees': '活跃推荐用户：','Network Invites': '网络邀请','Deep Ecosystem': '深度生态','Affiliate Income Calculator': '联盟收益计算器','Active Friends Invited': '已邀请活跃好友：','Average Weekly Wager per Friend': '每位好友平均每周投注：','Estimated Monthly Earnings': '预计月收益','Live Referral Feed': '实时推荐动态','Referee Handle': '被推荐人','Date Joined': '加入日期','Commission Tier': '佣金等级','Wager Volume': '投注量','Commission Earned': '已获得佣金','Sign in to join the Live Room': '登录以加入直播间','Your account profile': '您的账户资料','Live Participants': '直播参与者','Loading participants...': '正在加载参与者…','No other participants yet.': '暂无其他参与者。','No participants yet.': '暂无参与者。','Viewer Username Raffle Spinner': '观众用户名抽奖转盘','Live Participants Only': '仅限直播参与者','Spinning for Winner...': '正在抽取获胜者…','Current Viewers on Wheel': '当前转盘观众：','Recent Raffle Winners': '最近抽奖获胜者','Digital Crypto Card Number Guess': '数字加密卡号码竞猜','Streamer Card Settings': '主播卡片设置','Streamer Card Configurator': '主播卡片配置器','Card Title': '卡片标题','Serial Number': '序列号','Streamer Clue / Note for Viewers': '主播给观众的提示','Concealed': '隐藏','Revealed': '已揭示','Streamer Clue': '主播提示：','Mode Interaksi': '互动模式','Verifying Cryptographic Seed...': '正在验证加密种子…','Verify Challenge': '验证挑战','Provably Fair Verification': '可验证公平性验证','NOWPayments Crypto Deposit': 'NOWPayments 加密货币充值','Instant deposit with zero platform fees': '即时充值，平台零手续费','Create NOWPayments Invoice': '创建 NOWPayments 发票','Order ID': '订单ID：','Wallet Address': '钱包地址','Recovery Phrase': '恢复短语','Remember me': '记住我','Connect Wallet': '连接钱包','Secured with Web3': '由 Web3 保护','Biometric Login Available': '支持生物识别登录'
},
ja:{
'Affiliate Partner Program': 'アフィリエイトパートナープログラム','Your Personal Affiliate Link': 'あなたのアフィリエイトリンク','Direct Invitations': '直接招待','Active Referees': 'アクティブ紹介者：','Network Invites': 'ネットワーク招待','Deep Ecosystem': '深いエコシステム','Affiliate Income Calculator': 'アフィリエイト収益計算機','Active Friends Invited': '招待したアクティブな友達：','Average Weekly Wager per Friend': '友達1人あたり平均週間ベット：','Estimated Monthly Earnings': '推定月間収益','Live Referral Feed': 'ライブ紹介フィード','Referee Handle': '紹介ユーザー名','Date Joined': '参加日','Commission Tier': 'コミッションレベル','Wager Volume': 'ベット総額','Commission Earned': '獲得コミッション','Sign in to join the Live Room': 'ログインしてライブルームに参加','Your account profile': 'あなたのプロフィール','Live Participants': 'ライブ参加者','Loading participants...': '参加者を読み込み中…','No other participants yet.': '他の参加者はいません。','No participants yet.': '参加者はいません。','Viewer Username Raffle Spinner': '視聴者ユーザー名抽選スピナー','Live Participants Only': 'ライブ参加者のみ','Spinning for Winner...': '当選者を抽選中…','Current Viewers on Wheel': '現在のスピナー参加者：','Recent Raffle Winners': '最近の当選者','Digital Crypto Card Number Guess': 'デジタル暗号カード番号当て','Streamer Card Settings': 'ストリーマーカード設定','Streamer Card Configurator': 'ストリーマーカード設定ツール','Card Title': 'カードタイトル','Serial Number': 'シリアル番号','Streamer Clue / Note for Viewers': '視聴者へのストリーマーヒント','Concealed': '非表示','Revealed': '公開','Streamer Clue': 'ストリーマーヒント：','Mode Interaksi': 'インタラクションモード','Verifying Cryptographic Seed...': '暗号シードを検証中…','Verify Challenge': 'チャレンジを検証','Provably Fair Verification': '検証可能な公平性','NOWPayments Crypto Deposit': 'NOWPayments暗号資産入金','Instant deposit with zero platform fees': 'プラットフォーム手数料なしの即時入金','Create NOWPayments Invoice': 'NOWPayments請求書を作成','Order ID': '注文ID：','Wallet Address': 'ウォレットアドレス','Recovery Phrase': 'リカバリーフレーズ','Remember me': 'ログイン状態を保持','Connect Wallet': 'ウォレットを接続','Secured with Web3': 'Web3で保護','Biometric Login Available': '生体認証ログイン対応'
},
ko:{
'Affiliate Partner Program': '제휴 파트너 프로그램','Your Personal Affiliate Link': '개인 제휴 링크','Direct Invitations': '직접 초대','Active Referees': '활성 추천인','Network Invites': '네트워크 초대','Deep Ecosystem': '심층 생태계','Affiliate Income Calculator': '제휴 수익 계산기','Active Friends Invited': '초대한 활성 친구','Average Weekly Wager per Friend': '친구당 주간 평균 베팅','Estimated Monthly Earnings': '예상 월 수익','Live Referral Feed': '실시간 추천 피드','Referee Handle': '추천 사용자','Date Joined': '가입일','Commission Tier': '커미션 등급','Wager Volume': '베팅 규모','Commission Earned': '획득 커미션','Sign in to join the Live Room': '로그인하여 라이브룸 참여','Your account profile': '내 계정 프로필','Live Participants': '라이브 참가자','Loading participants...': '참가자 로드 중...','No other participants yet.': '아직 다른 참가자가 없습니다.','No participants yet.': '참가자가 없습니다.','Viewer Username Raffle Spinner': '시청자 사용자명 추첨 스피너','Live Participants Only': '라이브 참가자만','Spinning for Winner...': '당첨자 추첨 중...','Current Viewers on Wheel': '현재 스피너 참가자','Recent Raffle Winners': '최근 추첨 당첨자','Digital Crypto Card Number Guess': '디지털 크립토 카드 번호 맞히기','Streamer Card Settings': '스트리머 카드 설정','Streamer Card Configurator': '스트리머 카드 구성기','Card Title': '카드 제목','Serial Number': '일련번호','Streamer Clue / Note for Viewers': '시청자용 스트리머 힌트','Concealed': '숨김','Revealed': '공개','Streamer Clue': '스트리머 힌트','Mode Interaksi': '상호작용 모드','Verifying Cryptographic Seed...': '암호 시드 확인 중...','Verify Challenge': '챌린지 확인','Provably Fair Verification': '검증 가능한 공정성','NOWPayments Crypto Deposit': 'NOWPayments 암호화폐 입금','Instant deposit with zero platform fees': '플랫폼 수수료 없는 즉시 입금','Create NOWPayments Invoice': 'NOWPayments 인보이스 생성','Order ID': '주문 ID','Wallet Address': '지갑 주소','Recovery Phrase': '복구 문구','Remember me': '로그인 기억하기','Connect Wallet': '지갑 연결','Secured with Web3': 'Web3로 보호됨','Biometric Login Available': '생체 인증 로그인 지원'
},
ar:{
'Affiliate Partner Program': 'برنامج الشركاء بالعمولة','Your Personal Affiliate Link': 'رابط الإحالة الشخصي','Direct Invitations': 'الدعوات المباشرة','Active Referees': 'الإحالات النشطة','Network Invites': 'دعوات الشبكة','Deep Ecosystem': 'النظام البيئي المتكامل','Affiliate Income Calculator': 'حاسبة دخل الإحالة','Active Friends Invited': 'الأصدقاء النشطون المدعوون','Average Weekly Wager per Friend': 'متوسط الرهان الأسبوعي لكل صديق','Estimated Monthly Earnings': 'الأرباح الشهرية المقدرة','Live Referral Feed': 'تغذية الإحالات المباشرة','Referee Handle': 'اسم المُحال','Date Joined': 'تاريخ الانضمام','Commission Tier': 'مستوى العمولة','Wager Volume': 'حجم الرهان','Commission Earned': 'العمولة المكتسبة','Sign in to join the Live Room': 'سجّل الدخول للانضمام إلى الغرفة المباشرة','Your account profile': 'ملف حسابك','Live Participants': 'المشاركون المباشرون','Loading participants...': 'جارٍ تحميل المشاركين...','No other participants yet.': 'لا يوجد مشاركون آخرون بعد.','No participants yet.': 'لا يوجد مشاركون بعد.','Viewer Username Raffle Spinner': 'عجلة سحب أسماء المشاهدين','Live Participants Only': 'المشاركون المباشرون فقط','Spinning for Winner...': 'جارٍ اختيار الفائز...','Current Viewers on Wheel': 'المشاهدون الحاليون على العجلة','Recent Raffle Winners': 'الفائزون الأخيرون','Digital Crypto Card Number Guess': 'تخمين رقم بطاقة العملات الرقمية','Streamer Card Settings': 'إعدادات بطاقة البث','Streamer Card Configurator': 'مكوّن بطاقة البث','Card Title': 'عنوان البطاقة','Serial Number': 'الرقم التسلسلي','Streamer Clue / Note for Viewers': 'تلميح البث للمشاهدين','Concealed': 'مخفي','Revealed': 'مكشوف','Streamer Clue': 'تلميح البث','Mode Interaksi': 'وضع التفاعل','Verifying Cryptographic Seed...': 'جارٍ التحقق من البذرة المشفرة...','Verify Challenge': 'تحقق من التحدي','Provably Fair Verification': 'تحقق من العدالة القابلة للإثبات','NOWPayments Crypto Deposit': 'إيداع العملات الرقمية عبر NOWPayments','Instant deposit with zero platform fees': 'إيداع فوري بدون رسوم منصة','Create NOWPayments Invoice': 'إنشاء فاتورة NOWPayments','Order ID': 'معرّف الطلب','Wallet Address': 'عنوان المحفظة','Recovery Phrase': 'عبارة الاسترداد','Remember me': 'تذكرني','Connect Wallet': 'ربط المحفظة','Secured with Web3': 'محمي بواسطة Web3','Biometric Login Available': 'تسجيل دخول بيومتري متاح'
}
};
for (const lang of Object.keys(REMAINING_LOCALE_LABELS) as LanguageCode[]) {
  Object.assign(translations[lang], REMAINING_LOCALE_LABELS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...REMAINING_LOCALE_LABELS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}
const PROFILE_ACTION_TRANSLATIONS: Record<LanguageCode,Record<string,string>>={
id:{'Referral link berhasil disalin.': 'Referral link berhasil disalin.','Withdrawal': 'Penarikan','Minimum withdrawal is': 'Penarikan minimum adalah','Masukkan alamat wallet tujuan.': 'Masukkan alamat wallet tujuan.','Saldo tersedia tidak mencukupi.': 'Saldo tersedia tidak mencukupi.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'Permintaan penarikan berhasil dibuat dan menunggu proses.','Penarikan gagal.': 'Penarikan gagal.'},
en:{'Referral link berhasil disalin.': 'Referral link copied successfully.','Withdrawal': 'Withdrawal','Minimum withdrawal is': 'Minimum withdrawal is','Masukkan alamat wallet tujuan.': 'Enter the destination wallet address.','Saldo tersedia tidak mencukupi.': 'Available balance is insufficient.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'Withdrawal request created and awaiting processing.','Penarikan gagal.': 'Withdrawal failed.'},
es:{'Referral link berhasil disalin.': 'Enlace de referidos copiado.','Withdrawal': 'Retiro','Minimum withdrawal is': 'El retiro mínimo es','Masukkan alamat wallet tujuan.': 'Introduce la dirección de la wallet de destino.','Saldo tersedia tidak mencukupi.': 'El saldo disponible es insuficiente.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'Solicitud de retiro creada y pendiente de procesamiento.','Penarikan gagal.': 'El retiro falló.'},
pt:{'Referral link berhasil disalin.': 'Link de indicação copiado.','Withdrawal': 'Saque','Minimum withdrawal is': 'O saque mínimo é','Masukkan alamat wallet tujuan.': 'Informe o endereço da carteira de destino.','Saldo tersedia tidak mencukupi.': 'O saldo disponível é insuficiente.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'Solicitação de saque criada e aguardando processamento.','Penarikan gagal.': 'O saque falhou.'},
zh:{'Referral link berhasil disalin.': '推荐链接已复制。','Withdrawal': '提现','Minimum withdrawal is': '最低提现金额为','Masukkan alamat wallet tujuan.': '请输入目标钱包地址。','Saldo tersedia tidak mencukupi.': '可用余额不足。','Permintaan penarikan berhasil dibuat dan menunggu proses.': '提现请求已创建，等待处理。','Penarikan gagal.': '提现失败。'},
ja:{'Referral link berhasil disalin.': '紹介リンクをコピーしました。','Withdrawal': '出金','Minimum withdrawal is': '最低出金額は','Masukkan alamat wallet tujuan.': '送金先ウォレットアドレスを入力してください。','Saldo tersedia tidak mencukupi.': '利用可能残高が不足しています。','Permintaan penarikan berhasil dibuat dan menunggu proses.': '出金リクエストを作成しました。処理待ちです。','Penarikan gagal.': '出金に失敗しました。'},
ko:{'Referral link berhasil disalin.': '추천 링크가 복사되었습니다.','Withdrawal': '출금','Minimum withdrawal is': '최소 출금액은','Masukkan alamat wallet tujuan.': '대상 지갑 주소를 입력하세요.','Saldo tersedia tidak mencukupi.': '사용 가능 잔액이 부족합니다.','Permintaan penarikan berhasil dibuat dan menunggu proses.': '출금 요청이 생성되었으며 처리 대기 중입니다.','Penarikan gagal.': '출금에 실패했습니다.'},
ar:{'Referral link berhasil disalin.': 'تم نسخ رابط الإحالة.','Withdrawal': 'السحب','Minimum withdrawal is': 'الحد الأدنى للسحب هو','Masukkan alamat wallet tujuan.': 'أدخل عنوان المحفظة المستهدفة.','Saldo tersedia tidak mencukupi.': 'الرصيد المتاح غير كافٍ.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'تم إنشاء طلب السحب وهو قيد المعالجة.','Penarikan gagal.': 'فشل السحب.'}
};
for(const lang of Object.keys(PROFILE_ACTION_TRANSLATIONS) as LanguageCode[]){Object.assign(translations[lang],PROFILE_ACTION_TRANSLATIONS[lang]);PAGE_UI_TRANSLATIONS[lang]={...PROFILE_ACTION_TRANSLATIONS[lang],...PAGE_UI_TRANSLATIONS[lang]};}

const EXHAUSTIVE_UI_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Live Room': 'Live Room','Gagal memuat live room.': 'Gagal memuat live room.','Chat': 'Chat','Pesan gagal dikirim.': 'Pesan gagal dikirim.','Live': 'Live','Like gagal dikirim.': 'Gagal mengirim like.','Masuk untuk bergabung ke Live Room': 'Masuk untuk bergabung ke Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.': 'Setiap akun memiliki profil dan identitasnya sendiri di dalam room.','Profil akun Anda': 'Profil akun Anda','Belum ada deskripsi room dari pemilik room.': 'Belum ada deskripsi room dari pemilik room.','Peserta Live': 'Peserta Live','Hanya akun yang benar-benar bergabung yang ditampilkan.': 'Hanya akun yang benar-benar bergabung yang ditampilkan.','Memuat peserta...': 'Memuat peserta...','Belum ada peserta lain.': 'Belum ada peserta lain.','Belum ada peserta.': 'Belum ada peserta.','Need More Viewers': 'Penonton Belum Cukup','Add at least 2 viewer usernames to spin the raffle wheel.': 'Tambahkan minimal 2 nama penonton untuk memutar roda undian.','Winner Picked!': 'Pemenang Dipilih!','Congratulations': 'Selamat','Selected as Lucky Viewer!': 'Dipilih sebagai Penonton Beruntung!','Live Chat': 'Chat Live','Tambahkan peserta yang benar-benar masuk dari live room.': 'Tambahkan peserta yang benar-benar masuk dari live room.','Enter viewer username (e.g. TikTok_User)': 'Masukkan username penonton (mis. TikTok_User)','Spinning for Winner...': 'Memilih Pemenang...','Current Viewers on Wheel': 'Penonton Saat Ini di Roda','Recent Raffle Winners': 'Pemenang Undian Terbaru','Digital Crypto Card Number Guess': 'Tebak Nomor Kartu Kripto Digital','Streamer Card Settings': 'Pengaturan Kartu Streamer','Streamer Card Configurator': 'Konfigurator Kartu Streamer','Card Title': 'Judul Kartu','Serial Number': 'Nomor Seri','Streamer Clue / Note for Viewers': 'Petunjuk Streamer / Catatan untuk Penonton','Concealed': 'Tersembunyi','Revealed': 'Terbuka','Streamer Clue: ': 'Petunjuk Streamer: ','Mode Interaksi': 'Mode Interaksi','Verifying Cryptographic Seed...': 'Memverifikasi Seed Kriptografi...','Verify Challenge': 'Verifikasi Tantangan','Provably Fair Verification': 'Verifikasi Keadilan yang Dapat Dibuktikan','Affiliate Partner Program': 'Program Mitra Afiliasi','Your Personal Affiliate Link': 'Link Afiliasi Pribadi Anda','User ID / Wallet': 'ID User / Wallet','Direct Invitations': 'Undangan Langsung','Active Referees': 'Referral Aktif','Network Invites': 'Undangan Jaringan','Data produksi': 'Data produksi','Deep Ecosystem': 'Ekosistem Mendalam','Affiliate Income Calculator': 'Kalkulator Pendapatan Afiliasi','Active Friends Invited': 'Teman Aktif yang Diundang','Average Weekly Wager per Friend': 'Rata-rata Wager Mingguan per Teman','Estimated Monthly Earnings': 'Estimasi Pendapatan Bulanan','Live Referral Feed': 'Feed Referral Live','Referral milik wallet ini': 'Referral milik wallet ini','Referee Handle': 'Handle Referral','Date Joined': 'Tanggal Bergabung','Commission Tier': 'Tier Komisi','Wager Volume': 'Volume Wager','Commission Earned': 'Komisi Diperoleh','Copied Link': 'Link Disalin','Referral link copied to clipboard!': 'Link referral berhasil disalin!','No Pending Rewards': 'Tidak Ada Reward Tertunda','All referral commissions have already been transferred.': 'Semua komisi referral sudah ditransfer.','Minimum Deposit': 'Deposit Minimum','Minimum deposit is $5.00 USD': 'Deposit minimum adalah $5,00 USD','Error': 'Error','Failed to generate invoice': 'Gagal membuat invoice','NOWPayments Crypto Deposit': 'Deposit Crypto NOWPayments','Instant deposit with zero platform fees': 'Deposit instan tanpa biaya platform','Create NOWPayments Invoice': 'Buat Invoice NOWPayments','Order ID: ': 'ID Pesanan: '
  },
  en: {},
  es: {
    'Live Room': 'Sala en vivo','Gagal memuat live room.': 'No se pudo cargar la sala en vivo.','Pesan gagal dikirim.': 'No se pudo enviar el mensaje.','Like gagal dikirim.': 'No se pudo enviar el Me gusta.','Masuk untuk bergabung ke Live Room': 'Inicia sesión para unirte a la sala en vivo','Peserta Live': 'Participantes en vivo','Memuat peserta...': 'Cargando participantes...','Belum ada peserta lain.': 'Aún no hay otros participantes.','Belum ada peserta.': 'Aún no hay participantes.','Need More Viewers': 'Faltan espectadores','Add at least 2 viewer usernames to spin the raffle wheel.': 'Añade al menos 2 nombres de espectadores para girar la rueda.','Winner Picked!': '¡Ganador seleccionado!','Congratulations': '¡Felicidades','Selected as Lucky Viewer!': '¡Seleccionado como espectador afortunado!','Enter viewer username (e.g. TikTok_User)': 'Introduce el usuario del espectador (p. ej., TikTok_User)','Spinning for Winner...': 'Seleccionando ganador...','Current Viewers on Wheel': 'Espectadores actuales en la rueda','Recent Raffle Winners': 'Ganadores recientes','Digital Crypto Card Number Guess': 'Adivina el número de la tarjeta cripto','Streamer Card Settings': 'Configuración de tarjeta del streamer','Streamer Card Configurator': 'Configurador de tarjeta del streamer','Card Title': 'Título de tarjeta','Serial Number': 'Número de serie','Concealed': 'Oculto','Revealed': 'Revelado','Verify Challenge': 'Verificar desafío','Provably Fair Verification': 'Verificación de equidad demostrable','Affiliate Partner Program': 'Programa de afiliados','Your Personal Affiliate Link': 'Tu enlace personal de afiliado','Direct Invitations': 'Invitaciones directas','Network Invites': 'Invitaciones de red','Deep Ecosystem': 'Ecosistema profundo','Affiliate Income Calculator': 'Calculadora de ingresos de afiliados','Estimated Monthly Earnings': 'Ingresos mensuales estimados','Live Referral Feed': 'Actividad de referidos en vivo','Referee Handle': 'Usuario referido','Date Joined': 'Fecha de registro','Commission Tier': 'Nivel de comisión','Wager Volume': 'Volumen de apuestas','Commission Earned': 'Comisión obtenida','Copied Link': 'Enlace copiado','Referral link copied to clipboard!': '¡Enlace de referidos copiado!','No Pending Rewards': 'Sin recompensas pendientes','All referral commissions have already been transferred.': 'Todas las comisiones de referidos ya fueron transferidas.','Minimum Deposit': 'Depósito mínimo','Minimum deposit is $5.00 USD': 'El depósito mínimo es de 5,00 USD','Failed to generate invoice': 'No se pudo generar la factura','Create NOWPayments Invoice': 'Crear factura de NOWPayments','Order ID: ': 'ID del pedido: '
  },
  pt: {
    'Live Room': 'Sala ao vivo','Gagal memuat live room.': 'Não foi possível carregar a sala ao vivo.','Pesan gagal dikirim.': 'Não foi possível enviar a mensagem.','Like gagal dikirim.': 'Não foi possível enviar a curtida.','Masuk untuk bergabung ke Live Room': 'Entre para participar da sala ao vivo','Peserta Live': 'Participantes ao vivo','Memuat peserta...': 'Carregando participantes...','Belum ada peserta lain.': 'Ainda não há outros participantes.','Belum ada peserta.': 'Ainda não há participantes.','Need More Viewers': 'Mais espectadores necessários','Add at least 2 viewer usernames to spin the raffle wheel.': 'Adicione pelo menos 2 nomes de espectadores para girar a roda.','Winner Picked!': 'Vencedor escolhido!','Congratulations': 'Parabéns','Selected as Lucky Viewer!': 'Selecionado como espectador sortudo!','Enter viewer username (e.g. TikTok_User)': 'Digite o usuário do espectador (ex.: TikTok_User)','Spinning for Winner...': 'Sorteando vencedor...','Current Viewers on Wheel': 'Espectadores atuais na roda','Recent Raffle Winners': 'Vencedores recentes','Digital Crypto Card Number Guess': 'Adivinhe o número do cartão cripto','Streamer Card Settings': 'Configurações do cartão do streamer','Streamer Card Configurator': 'Configurador do cartão do streamer','Card Title': 'Título do cartão','Serial Number': 'Número de série','Concealed': 'Oculto','Revealed': 'Revelado','Verify Challenge': 'Verificar desafio','Provably Fair Verification': 'Verificação de justiça comprovável','Affiliate Partner Program': 'Programa de afiliados','Your Personal Affiliate Link': 'Seu link pessoal de afiliado','Direct Invitations': 'Convites diretos','Network Invites': 'Convites de rede','Deep Ecosystem': 'Ecossistema profundo','Affiliate Income Calculator': 'Calculadora de ganhos de afiliados','Estimated Monthly Earnings': 'Ganhos mensais estimados','Live Referral Feed': 'Feed de indicações ao vivo','Referee Handle': 'Usuário indicado','Date Joined': 'Data de entrada','Commission Tier': 'Nível de comissão','Wager Volume': 'Volume de apostas','Commission Earned': 'Comissão recebida','Copied Link': 'Link copiado','Referral link copied to clipboard!': 'Link de indicação copiado!','No Pending Rewards': 'Sem recompensas pendentes','All referral commissions have already been transferred.': 'Todas as comissões de indicação já foram transferidas.','Minimum Deposit': 'Depósito mínimo','Minimum deposit is $5.00 USD': 'O depósito mínimo é US$ 5,00','Failed to generate invoice': 'Falha ao gerar a fatura','Create NOWPayments Invoice': 'Criar fatura NOWPayments','Order ID: ': 'ID do pedido: '
  },
  zh: {
    'Live Room': '直播间','Gagal memuat live room.': '无法加载直播间。','Pesan gagal dikirim.': '消息发送失败。','Like gagal dikirim.': '点赞发送失败。','Masuk untuk bergabung ke Live Room': '登录后加入直播间','Peserta Live': '直播参与者','Memuat peserta...': '正在加载参与者…','Belum ada peserta lain.': '暂无其他参与者。','Belum ada peserta.': '暂无参与者。','Need More Viewers': '需要更多观众','Add at least 2 viewer usernames to spin the raffle wheel.': '至少添加2个观众用户名才能开始抽奖。','Winner Picked!': '已选出获胜者！','Congratulations': '恭喜','Selected as Lucky Viewer!': '被选为幸运观众！','Enter viewer username (e.g. TikTok_User)': '输入观众用户名（例如 TikTok_User）','Spinning for Winner...': '正在抽取获胜者…','Current Viewers on Wheel': '当前转盘观众：','Recent Raffle Winners': '最近抽奖获胜者','Digital Crypto Card Number Guess': '数字加密卡号码竞猜','Streamer Card Settings': '主播卡片设置','Streamer Card Configurator': '主播卡片配置器','Card Title': '卡片标题','Serial Number': '序列号','Concealed': '隐藏','Revealed': '已揭示','Verify Challenge': '验证挑战','Provably Fair Verification': '可验证公平性','Affiliate Partner Program': '联盟合作伙伴计划','Your Personal Affiliate Link': '您的个人推广链接','Direct Invitations': '直接邀请','Network Invites': '网络邀请','Deep Ecosystem': '深度生态','Affiliate Income Calculator': '联盟收益计算器','Estimated Monthly Earnings': '预计月收益','Live Referral Feed': '实时推荐动态','Referee Handle': '被推荐人','Date Joined': '加入日期','Commission Tier': '佣金等级','Wager Volume': '投注量','Commission Earned': '已获得佣金','Copied Link': '链接已复制','Referral link copied to clipboard!': '推荐链接已复制！','No Pending Rewards': '没有待处理奖励','All referral commissions have already been transferred.': '所有推荐佣金均已转移。','Minimum Deposit': '最低充值','Minimum deposit is $5.00 USD': '最低充值金额为5.00美元','Failed to generate invoice': '生成发票失败','Create NOWPayments Invoice': '创建 NOWPayments 发票','Order ID: ': '订单ID：'
  },
  ja: {
    'Live Room': 'ライブ配信ルーム','Gagal memuat live room.': 'ライブ配信ルームを読み込めませんでした。','Pesan gagal dikirim.': 'メッセージを送信できませんでした。','Like gagal dikirim.': 'いいねを送信できませんでした。','Masuk untuk bergabung ke Live Room': 'ログインしてライブ配信ルームに参加','Peserta Live': 'ライブ参加者','Memuat peserta...': '参加者を読み込み中…','Belum ada peserta lain.': '他の参加者はいません。','Belum ada peserta.': '参加者はいません。','Need More Viewers': '視聴者が足りません','Add at least 2 viewer usernames to spin the raffle wheel.': '抽選を回すには2人以上の視聴者名を追加してください。','Winner Picked!': '当選者が決まりました！','Congratulations': 'おめでとうございます','Selected as Lucky Viewer!': 'ラッキー視聴者に選ばれました！','Enter viewer username (e.g. TikTok_User)': '視聴者名を入力（例：TikTok_User）','Spinning for Winner...': '当選者を抽選中…','Current Viewers on Wheel': '現在の参加者：','Recent Raffle Winners': '最近の当選者','Digital Crypto Card Number Guess': 'デジタル暗号カード番号当て','Streamer Card Settings': 'ストリーマーカード設定','Streamer Card Configurator': 'ストリーマーカード設定ツール','Card Title': 'カードタイトル','Serial Number': 'シリアル番号','Concealed': '非表示','Revealed': '公開','Verify Challenge': 'チャレンジを検証','Provably Fair Verification': '検証可能な公平性','Affiliate Partner Program': 'アフィリエイトパートナープログラム','Your Personal Affiliate Link': 'あなたのアフィリエイトリンク','Direct Invitations': '直接招待','Network Invites': 'ネットワーク招待','Deep Ecosystem': '深いエコシステム','Affiliate Income Calculator': 'アフィリエイト収益計算機','Estimated Monthly Earnings': '推定月間収益','Live Referral Feed': 'ライブ紹介フィード','Referee Handle': '紹介ユーザー名','Date Joined': '参加日','Commission Tier': 'コミッションレベル','Wager Volume': 'ベット総額','Commission Earned': '獲得コミッション','Copied Link': 'リンクをコピーしました','Referral link copied to clipboard!': '紹介リンクをコピーしました！','No Pending Rewards': '保留中の報酬はありません','All referral commissions have already been transferred.': '紹介コミッションはすべて移行済みです。','Minimum Deposit': '最低入金額','Minimum deposit is $5.00 USD': '最低入金額は5.00米ドルです','Failed to generate invoice': '請求書の生成に失敗しました','Create NOWPayments Invoice': 'NOWPayments請求書を作成','Order ID: ': '注文ID：'
  },
  ko: {
    'Live Room': '라이브 룸','Gagal memuat live room.': '라이브 룸을 불러오지 못했습니다.','Pesan gagal dikirim.': '메시지를 보내지 못했습니다.','Like gagal dikirim.': '좋아요를 보내지 못했습니다.','Masuk untuk bergabung ke Live Room': '로그인하여 라이브 룸에 참여','Peserta Live': '라이브 참가자','Memuat peserta...': '참가자 로드 중...','Belum ada peserta lain.': '아직 다른 참가자가 없습니다.','Belum ada peserta.': '참가자가 없습니다.','Need More Viewers': '시청자가 더 필요합니다','Add at least 2 viewer usernames to spin the raffle wheel.': '추첨을 돌리려면 시청자 이름을 2명 이상 추가하세요.','Winner Picked!': '당첨자 선정!','Congratulations': '축하합니다','Selected as Lucky Viewer!': '행운의 시청자로 선정되었습니다!','Enter viewer username (e.g. TikTok_User)': '시청자 사용자명 입력(예: TikTok_User)','Spinning for Winner...': '당첨자 추첨 중...','Current Viewers on Wheel': '현재 스피너 참가자','Recent Raffle Winners': '최근 추첨 당첨자','Digital Crypto Card Number Guess': '디지털 크립토 카드 번호 맞히기','Streamer Card Settings': '스트리머 카드 설정','Streamer Card Configurator': '스트리머 카드 구성기','Card Title': '카드 제목','Serial Number': '일련번호','Concealed': '숨김','Revealed': '공개','Verify Challenge': '챌린지 확인','Provably Fair Verification': '검증 가능한 공정성','Affiliate Partner Program': '제휴 파트너 프로그램','Your Personal Affiliate Link': '개인 제휴 링크','Direct Invitations': '직접 초대','Network Invites': '네트워크 초대','Deep Ecosystem': '심층 생태계','Affiliate Income Calculator': '제휴 수익 계산기','Estimated Monthly Earnings': '예상 월 수익','Live Referral Feed': '실시간 추천 피드','Referee Handle': '추천 사용자','Date Joined': '가입일','Commission Tier': '커미션 등급','Wager Volume': '베팅 규모','Commission Earned': '획득 커미션','Copied Link': '링크 복사됨','Referral link copied to clipboard!': '추천 링크가 복사되었습니다!','No Pending Rewards': '대기 중인 보상이 없습니다','All referral commissions have already been transferred.': '모든 추천 커미션이 이미 이전되었습니다.','Minimum Deposit': '최소 입금','Minimum deposit is $5.00 USD': '최소 입금액은 5.00 USD입니다','Failed to generate invoice': '인보이스 생성 실패','Create NOWPayments Invoice': 'NOWPayments 인보이스 생성','Order ID: ': '주문 ID: '
  },
  ar: {
    'Live Room': 'الغرفة المباشرة','Gagal memuat live room.': 'تعذر تحميل الغرفة المباشرة.','Pesan gagal dikirim.': 'تعذر إرسال الرسالة.','Like gagal dikirim.': 'تعذر إرسال الإعجاب.','Masuk untuk bergabung ke Live Room': 'سجّل الدخول للانضمام إلى الغرفة المباشرة','Peserta Live': 'المشاركون المباشرون','Memuat peserta...': 'جارٍ تحميل المشاركين...','Belum ada peserta lain.': 'لا يوجد مشاركون آخرون بعد.','Belum ada peserta.': 'لا يوجد مشاركون بعد.','Need More Viewers': 'نحتاج إلى مزيد من المشاهدين','Add at least 2 viewer usernames to spin the raffle wheel.': 'أضف اسمَي مشاهدين على الأقل لتدوير عجلة السحب.','Winner Picked!': 'تم اختيار الفائز!','Congratulations': 'تهانينا','Selected as Lucky Viewer!': 'تم اختيارك كمشاهد محظوظ!','Enter viewer username (e.g. TikTok_User)': 'أدخل اسم المستخدم للمشاهد (مثال: TikTok_User)','Spinning for Winner...': 'جارٍ اختيار الفائز...','Current Viewers on Wheel': 'المشاهدون الحاليون على العجلة','Recent Raffle Winners': 'الفائزون الأخيرون','Digital Crypto Card Number Guess': 'تخمين رقم بطاقة العملات الرقمية','Streamer Card Settings': 'إعدادات بطاقة البث','Streamer Card Configurator': 'مكوّن بطاقة البث','Card Title': 'عنوان البطاقة','Serial Number': 'الرقم التسلسلي','Concealed': 'مخفي','Revealed': 'مكشوف','Verify Challenge': 'تحقق من التحدي','Provably Fair Verification': 'تحقق من العدالة القابلة للإثبات','Affiliate Partner Program': 'برنامج الشركاء بالعمولة','Your Personal Affiliate Link': 'رابط الإحالة الشخصي','Direct Invitations': 'الدعوات المباشرة','Network Invites': 'دعوات الشبكة','Deep Ecosystem': 'النظام البيئي المتكامل','Affiliate Income Calculator': 'حاسبة دخل الإحالة','Estimated Monthly Earnings': 'الأرباح الشهرية المقدرة','Live Referral Feed': 'تغذية الإحالات المباشرة','Referee Handle': 'اسم المُحال','Date Joined': 'تاريخ الانضمام','Commission Tier': 'مستوى العمولة','Wager Volume': 'حجم الرهان','Commission Earned': 'العمولة المكتسبة','Copied Link': 'تم نسخ الرابط','Referral link copied to clipboard!': 'تم نسخ رابط الإحالة!','No Pending Rewards': 'لا توجد مكافآت معلقة','All referral commissions have already been transferred.': 'تم تحويل جميع عمولات الإحالة بالفعل.','Minimum Deposit': 'الحد الأدنى للإيداع','Minimum deposit is $5.00 USD': 'الحد الأدنى للإيداع هو 5.00 دولار أمريكي','Failed to generate invoice': 'فشل إنشاء الفاتورة','Create NOWPayments Invoice': 'إنشاء فاتورة NOWPayments','Order ID: ': 'معرّف الطلب: '
  }
};
for (const lang of Object.keys(EXHAUSTIVE_UI_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], EXHAUSTIVE_UI_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...EXHAUSTIVE_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}


const DASHBOARD_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Setiap user dapat membagikan tulisan dan postingan.': 'Setiap pengguna dapat membagikan tulisan dan postingan.',
    'Belum ada postingan': 'Belum ada postingan','Jadilah pengguna pertama yang membagikan sesuatu.': 'Jadilah pengguna pertama yang membagikan sesuatu.',
    'Buat Postingan': 'Buat Postingan','Belum ada data live aktif': 'Belum ada data live aktif',
    'Room live akan tampil di sini setelah tersedia dari backend produksi.': 'Room live akan tampil di sini setelah tersedia dari backend produksi.',
    'Live': 'Live','Buka Live Room →': 'Buka Live Room →','Tebak Nomor': 'Tebak Nomor','Ikuti permainan live.': 'Ikuti permainan live.',
    'Spinner': 'Spinner','Masuk ke event spinner.': 'Masuk ke event spinner.','Blind Box': 'Blind Box','Buka Blind Box dengan saldo akun.': 'Buka Blind Box dengan saldo akun.',
    'Upload / Create Post': 'Unggah / Buat Postingan','Tulis sesuatu untuk dibagikan ke komunitas...': 'Tulis sesuatu untuk dibagikan ke komunitas...',
    'URL media (opsional)': 'URL media (opsional)','Menerbitkan...': 'Menerbitkan...','Terbitkan Postingan': 'Terbitkan Postingan',
    'Refresh balance': 'Muat ulang saldo','Refresh posts': 'Muat ulang postingan','Claim Bonus': 'Klaim Bonus'
  },
  en: {
    'Setiap user dapat membagikan tulisan dan postingan.': 'Every user can share posts and updates.',
    'Belum ada postingan': 'No posts yet','Jadilah pengguna pertama yang membagikan sesuatu.': 'Be the first user to share something.',
    'Buat Postingan': 'Create Post','Belum ada data live aktif': 'No active live data',
    'Room live akan tampil di sini setelah tersedia dari backend produksi.': 'Live rooms will appear here when available from the production backend.',
    'Live': 'Live','Buka Live Room →': 'Open Live Room →','Tebak Nomor': 'Guess the Number','Ikuti permainan live.': 'Join the live game.',
    'Spinner': 'Spinner','Masuk ke event spinner.': 'Enter the spinner event.','Blind Box': 'Blind Box','Buka Blind Box dengan saldo akun.': 'Open Blind Box using your account balance.',
    'Upload / Create Post': 'Upload / Create Post','Tulis sesuatu untuk dibagikan ke komunitas...': 'Write something to share with the community...',
    'URL media (opsional)': 'Media URL (optional)','Menerbitkan...': 'Publishing...','Terbitkan Postingan': 'Publish Post',
    'Refresh balance': 'Refresh balance','Refresh posts': 'Refresh posts','Claim Bonus': 'Claim Bonus'
  },
  es: {
    'Setiap user dapat membagikan tulisan dan postingan.': 'Cada usuario puede compartir publicaciones y actualizaciones.','Belum ada postingan': 'Aún no hay publicaciones','Jadilah pengguna pertama yang membagikan sesuatu.': 'Sé el primero en compartir algo.','Buat Postingan': 'Crear publicación','Belum ada data live aktif': 'No hay datos de transmisiones activas','Room live akan tampil di sini setelah tersedia dari backend produksi.': 'Las salas en vivo aparecerán cuando estén disponibles desde el backend de producción.','Live': 'En vivo','Buka Live Room →': 'Abrir sala en vivo →','Tebak Nomor': 'Adivina el número','Ikuti permainan live.': 'Participa en el juego en vivo.','Spinner': 'Spinner','Masuk ke event spinner.': 'Entrar al evento spinner.','Blind Box': 'Blind Box','Buka Blind Box dengan saldo akun.': 'Abrir Blind Box con el saldo de la cuenta.','Upload / Create Post': 'Subir / crear publicación','Tulis sesuatu untuk dibagikan ke komunitas...': 'Escribe algo para compartir con la comunidad...','URL media (opsional)': 'URL multimedia (opcional)','Menerbitkan...': 'Publicando...','Terbitkan Postingan': 'Publicar','Refresh balance': 'Actualizar saldo','Refresh posts': 'Actualizar publicaciones','Claim Bonus': 'Reclamar bono'
  },
  pt: {
    'Setiap user dapat membagikan tulisan dan postingan.': 'Cada usuário pode compartilhar publicações e atualizações.','Belum ada postingan': 'Ainda não há publicações','Jadilah pengguna pertama yang membagikan sesuatu.': 'Seja o primeiro a compartilhar algo.','Buat Postingan': 'Criar publicação','Belum ada data live aktif': 'Não há dados de live ativos','Room live akan tampil di sini setelah tersedia dari backend produksi.': 'As salas ao vivo aparecerão quando estiverem disponíveis no backend de produção.','Live': 'Ao vivo','Buka Live Room →': 'Abrir sala ao vivo →','Tebak Nomor': 'Adivinhe o número','Ikuti permainan live.': 'Participe do jogo ao vivo.','Spinner': 'Spinner','Masuk ke event spinner.': 'Entrar no evento spinner.','Blind Box': 'Blind Box','Buka Blind Box dengan saldo akun.': 'Abrir Blind Box usando o saldo da conta.','Upload / Create Post': 'Enviar / criar publicação','Tulis sesuatu untuk dibagikan ke komunitas...': 'Escreva algo para compartilhar com a comunidade...','URL media (opsional)': 'URL de mídia (opcional)','Menerbitkan...': 'Publicando...','Terbitkan Postingan': 'Publicar','Refresh balance': 'Atualizar saldo','Refresh posts': 'Atualizar publicações','Claim Bonus': 'Resgatar bônus'
  },
  zh: {
    'Setiap user dapat membagikan tulisan dan postingan.': '每位用户都可以分享帖子和动态。','Belum ada postingan': '暂无帖子','Jadilah pengguna pertama yang membagikan sesuatu.': '成为第一个分享内容的用户。','Buat Postingan': '创建帖子','Belum ada data live aktif': '暂无活跃直播数据','Room live akan tampil di sini setelah tersedia dari backend produksi.': '生产后端提供数据后，直播间会显示在这里。','Live': '直播','Buka Live Room →': '打开直播间 →','Tebak Nomor': '猜数字','Ikuti permainan live.': '参与直播游戏。','Spinner': '转盘','Masuk ke event spinner.': '进入转盘活动。','Blind Box': '盲盒','Buka Blind Box dengan saldo akun.': '使用账户余额打开盲盒。','Upload / Create Post': '上传 / 创建帖子','Tulis sesuatu untuk dibagikan ke komunitas...': '写下要与社区分享的内容...','URL media (opsional)': '媒体链接（可选）','Menerbitkan...': '发布中...','Terbitkan Postingan': '发布帖子','Refresh balance': '刷新余额','Refresh posts': '刷新帖子','Claim Bonus': '领取奖励'
  },
  ja: {
    'Setiap user dapat membagikan tulisan dan postingan.': 'すべてのユーザーが投稿や更新を共有できます。','Belum ada postingan': '投稿はまだありません','Jadilah pengguna pertama yang membagikan sesuatu.': '最初に何かを共有しましょう。','Buat Postingan': '投稿を作成','Belum ada data live aktif': 'アクティブなライブデータはありません','Room live akan tampil di sini setelah tersedia dari backend produksi.': '本番バックエンドから利用可能になるとライブルームがここに表示されます。','Live': 'ライブ','Buka Live Room →': 'ライブルームを開く →','Tebak Nomor': '数字を当てる','Ikuti permainan live.': 'ライブゲームに参加する。','Spinner': 'スピナー','Masuk ke event spinner.': 'スピナーイベントに入る。','Blind Box': 'ブラインドボックス','Buka Blind Box dengan saldo akun.': 'アカウント残高でブラインドボックスを開く。','Upload / Create Post': 'アップロード / 投稿を作成','Tulis sesuatu untuk dibagikan ke komunitas...': 'コミュニティで共有する内容を入力...','URL media (opsional)': 'メディアURL（任意）','Menerbitkan...': '公開中...','Terbitkan Postingan': '投稿を公開','Refresh balance': '残高を更新','Refresh posts': '投稿を更新','Claim Bonus': 'ボーナスを受け取る'
  },
  ko: {
    'Setiap user dapat membagikan tulisan dan postingan.': '모든 사용자는 게시물과 업데이트를 공유할 수 있습니다.','Belum ada postingan': '게시물이 없습니다','Jadilah pengguna pertama yang membagikan sesuatu.': '가장 먼저 콘텐츠를 공유해 보세요.','Buat Postingan': '게시물 만들기','Belum ada data live aktif': '활성 라이브 데이터가 없습니다','Room live akan tampil di sini setelah tersedia dari backend produksi.': '프로덕션 백엔드에서 제공되면 라이브 룸이 여기에 표시됩니다.','Live': '라이브','Buka Live Room →': '라이브 룸 열기 →','Tebak Nomor': '숫자 맞히기','Ikuti permainan live.': '라이브 게임에 참여하세요.','Spinner': '스피너','Masuk ke event spinner.': '스피너 이벤트 입장','Blind Box': '블라인드 박스','Buka Blind Box dengan saldo akun.': '계정 잔액으로 블라인드 박스 열기','Upload / Create Post': '업로드 / 게시물 만들기','Tulis sesuatu untuk dibagikan ke komunitas...': '커뮤니티에 공유할 내용을 작성하세요...','URL media (opsional)': '미디어 URL(선택 사항)','Menerbitkan...': '게시 중...','Terbitkan Postingan': '게시물 게시','Refresh balance': '잔액 새로고침','Refresh posts': '게시물 새로고침','Claim Bonus': '보너스 받기'
  },
  ar: {
    'Setiap user dapat membagikan tulisan dan postingan.': 'يمكن لكل مستخدم مشاركة المنشورات والتحديثات.','Belum ada postingan': 'لا توجد منشورات بعد','Jadilah pengguna pertama yang membagikan sesuatu.': 'كن أول مستخدم يشارك شيئًا.','Buat Postingan': 'إنشاء منشور','Belum ada data live aktif': 'لا توجد بيانات بث مباشر نشطة','Room live akan tampil di sini setelah tersedia dari backend produksi.': 'ستظهر غرف البث المباشر هنا عند توفرها من الواجهة الخلفية للإنتاج.','Live': 'مباشر','Buka Live Room →': 'فتح غرفة البث المباشر →','Tebak Nomor': 'خمن الرقم','Ikuti permainan live.': 'شارك في اللعبة المباشرة.','Spinner': 'العجلة','Masuk ke event spinner.': 'الدخول إلى فعالية العجلة.','Blind Box': 'الصندوق الغامض','Buka Blind Box dengan saldo akun.': 'افتح الصندوق الغامض باستخدام رصيد حسابك.','Upload / Create Post': 'رفع / إنشاء منشور','Tulis sesuatu untuk dibagikan ke komunitas...': 'اكتب شيئًا لمشاركته مع المجتمع...','URL media (opsional)': 'رابط الوسائط (اختياري)','Menerbitkan...': 'جارٍ النشر...','Terbitkan Postingan': 'نشر المنشور','Refresh balance': 'تحديث الرصيد','Refresh posts': 'تحديث المنشورات','Claim Bonus': 'استلام المكافأة'
  }
};
for (const lang of Object.keys(DASHBOARD_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], DASHBOARD_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...DASHBOARD_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const AUDIT_UI_TRANSLATIONS: Partial<Record<LanguageCode, Record<string,string>>> = {
  id: {'Profile': 'Profil','Kelola akun, wallet, dan aktivitas kamu.': 'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address': 'User ID = Alamat Wallet','Member': 'Anggota','USDT Account': 'Akun USDT','EVM Wallet': 'Wallet EVM','Wallet belum terhubung': 'Wallet belum terhubung','Alamat wallet berhasil disalin.': 'Alamat wallet berhasil disalin.','Available': 'Tersedia','Locked': 'Terkunci','Withdraw': 'Tarik Dana','Ajukan penarikan': 'Ajukan penarikan','Registration Bonus': 'Bonus Registrasi','Bonus tersedia dan belum diklaim.': 'Bonus tersedia dan belum diklaim.','Available Balance': 'Saldo Tersedia','Locked Balance': 'Saldo Terkunci','Referral Link': 'Link Referral','Bagikan link ini untuk mengundang user baru.': 'Bagikan link ini untuk mengundang user baru.','Event Participation Status': 'Status Partisipasi Event','Belum ada event yang diikuti.': 'Belum ada event yang diikuti.','Transaction History': 'Riwayat Transaksi','Deposit, withdrawal, lock, reward & bonus': 'Deposit, penarikan, lock, reward & bonus','Refresh': 'Muat Ulang','Loading...': 'Memuat...','Belum ada transaksi.': 'Belum ada transaksi.','Withdraw USDT': 'Tarik USDT','Submit Withdrawal': 'Ajukan Penarikan','JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • foto tetap tersimpan di perangkat Anda','Daily Mystery Blind Box': 'Blind Box Misteri Harian','Lock minimal $4 equivalent untuk membuka Blind Box': 'Lock minimal setara $4 untuk membuka Blind Box','Lock aktif': 'Lock aktif','Aturan claim tetap 1 kali per hari.': 'Klaim tetap 1 kali per hari.','LOCK SALDO DIBUTUHKAN': 'LOCK SALDO DIBUTUHKAN','1 Box/Day': '1 Box/Hari','Lock Saldo Sekarang': 'Lock Saldo Sekarang','Server sedang menentukan reward...': 'Server sedang menentukan reward...','Reward Blind Box Harian': 'Reward Blind Box Harian','Keep in Vault': 'Simpan di Vault','Done': 'Selesai','Active Selection': 'Pilihan Aktif','Jadwal Durasi Lock': 'Jadwal Durasi Lock','Reward harian sesuai pengaturan server': 'Reward harian sesuai pengaturan server','Verifying Email': 'Memverifikasi Email','Email Verified': 'Email Terverifikasi','Verification Failed': 'Verifikasi Gagal','SYS STREAM LOADING': 'SYS STREAM MEMUAT...','Live Room Aktif': 'Live Room Aktif','Live belum aktif': 'Live belum aktif'},
  en: {'Profile': 'Profile','Kelola akun, wallet, dan aktivitas kamu.': 'Manage your account, wallet, and activity.','User ID = Wallet Address': 'User ID = Wallet Address','Member': 'Member','USDT Account': 'USDT Account','EVM Wallet': 'EVM Wallet','Wallet belum terhubung': 'Wallet not connected','Alamat wallet berhasil disalin.': 'Wallet address copied successfully.','Available': 'Available','Locked': 'Locked','Withdraw': 'Withdraw','Ajukan penarikan': 'Request withdrawal','Registration Bonus': 'Registration Bonus','Bonus tersedia dan belum diklaim.': 'Bonus is available and has not been claimed.','Available Balance': 'Available Balance','Locked Balance': 'Locked Balance','Referral Link': 'Referral Link','Bagikan link ini untuk mengundang user baru.': 'Share this link to invite a new user.','Event Participation Status': 'Event Participation Status','Belum ada event yang diikuti.': 'No events joined yet.','Transaction History': 'Transaction History','Deposit, withdrawal, lock, reward & bonus': 'Deposits, withdrawals, locks, rewards & bonuses','Refresh': 'Refresh','Loading...': 'Loading...','Belum ada transaksi.': 'No transactions yet.','Withdraw USDT': 'Withdraw USDT','Submit Withdrawal': 'Submit Withdrawal','JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • photo stays on your device','Daily Mystery Blind Box': 'Daily Mystery Blind Box','Lock minimal $4 equivalent untuk membuka Blind Box': 'Lock at least the $4 equivalent to open Blind Box','Lock aktif': 'Lock active','Aturan claim tetap 1 kali per hari.': 'Claim remains limited to once per day.','LOCK SALDO DIBUTUHKAN': 'BALANCE LOCK REQUIRED','1 Box/Day': '1 Box/Day','Lock Saldo Sekarang': 'Lock Balance Now','Server sedang menentukan reward...': 'Server is determining the reward...','Reward Blind Box Harian': 'Daily Blind Box Reward','Keep in Vault': 'Keep in Vault','Done': 'Done','Active Selection': 'Active Selection','Jadwal Durasi Lock': 'Lock Duration Schedule','Reward harian sesuai pengaturan server': 'Daily reward according to server settings','Verifying Email': 'Verifying Email','Email Verified': 'Email Verified','Verification Failed': 'Verification Failed','SYS STREAM LOADING': 'SYS STREAM LOADING','Live Room Aktif': 'Live Room Active','Live belum aktif': 'Live is not active'}
};
for (const lang of Object.keys(AUDIT_UI_TRANSLATIONS) as LanguageCode[]) { Object.assign(translations[lang], AUDIT_UI_TRANSLATIONS[lang]); PAGE_UI_TRANSLATIONS[lang] = { ...AUDIT_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] }; }


const DEPOSIT_UI_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'NOWPayments Crypto Deposit': 'Deposit Crypto NOWPayments','Instant deposit with zero platform fees': 'Deposit instan tanpa biaya platform',
    'Deposit Amount (USD)': 'Nominal Deposit (USD)','Or enter custom USD amount': 'Atau masukkan nominal USD sendiri',
    'Minimum deposit': 'Minimum deposit','Rate is checked live by NOWPayments when the payment is created.': 'Kurs diperiksa langsung oleh NOWPayments saat pembayaran dibuat.',
    'Deposit is credited to your real account balance after payment confirmation.': 'Deposit masuk ke saldo akun nyata setelah pembayaran dikonfirmasi.',
    'Select Cryptocurrency': 'Pilih Cryptocurrency','Minimum Deposit': 'Minimum Deposit','Minimum deposit is': 'Minimum deposit adalah',
    'Error': 'Error','Failed to generate invoice': 'Gagal membuat invoice','Order ID: ': 'ID Pesanan: ','Awaiting Deposit': 'Menunggu Deposit',
    'Deposit QR Code': 'QR Code Deposit','Send exactly to deposit address': 'Kirim tepat ke alamat deposit','Open NOWPayments Payment Page': 'Buka Halaman Pembayaran NOWPayments',
    'Change Currency / Amount': 'Ubah Mata Uang / Nominal','Done': 'Selesai'
  },
  en: {
    'NOWPayments Crypto Deposit': 'NOWPayments Crypto Deposit','Instant deposit with zero platform fees': 'Instant deposit with zero platform fees',
    'Deposit Amount (USD)': 'Deposit Amount (USD)','Or enter custom USD amount': 'Or enter custom USD amount',
    'Minimum deposit': 'Minimum deposit','Rate is checked live by NOWPayments when the payment is created.': 'Rate is checked live by NOWPayments when the payment is created.',
    'Deposit is credited to your real account balance after payment confirmation.': 'Deposit is credited to your real account balance after payment confirmation.',
    'Select Cryptocurrency': 'Select Cryptocurrency','Minimum Deposit': 'Minimum Deposit','Minimum deposit is': 'Minimum deposit is',
    'Error': 'Error','Failed to generate invoice': 'Failed to generate invoice','Order ID: ': 'Order ID: ','Awaiting Deposit': 'Awaiting Deposit',
    'Deposit QR Code': 'Deposit QR Code','Send exactly to deposit address': 'Send exactly to deposit address','Open NOWPayments Payment Page': 'Open NOWPayments Payment Page',
    'Change Currency / Amount': 'Change Currency / Amount','Done': 'Done'
  },
  es: {
    'NOWPayments Crypto Deposit': 'Depósito cripto NOWPayments','Instant deposit with zero platform fees': 'Depósito instantáneo sin comisiones de plataforma',
    'Deposit Amount (USD)': 'Importe del depósito (USD)','Or enter custom USD amount': 'O introduce un importe USD personalizado',
    'Minimum deposit': 'Depósito mínimo','Rate is checked live by NOWPayments when the payment is created.': 'NOWPayments comprueba el tipo de cambio en tiempo real al crear el pago.',
    'Deposit is credited to your real account balance after payment confirmation.': 'El depósito se acredita en tu saldo real tras confirmar el pago.',
    'Select Cryptocurrency': 'Selecciona criptomoneda','Minimum Deposit': 'Depósito mínimo','Minimum deposit is': 'El depósito mínimo es',
    'Error': 'Error','Failed to generate invoice': 'No se pudo crear la factura','Order ID: ': 'ID de pedido: ','Awaiting Deposit': 'Esperando depósito',
    'Deposit QR Code': 'Código QR del depósito','Send exactly to deposit address': 'Envía exactamente a la dirección de depósito','Open NOWPayments Payment Page': 'Abrir página de pago de NOWPayments',
    'Change Currency / Amount': 'Cambiar moneda / importe','Done': 'Listo'
  },
  pt: {
    'NOWPayments Crypto Deposit': 'Depósito cripto NOWPayments','Instant deposit with zero platform fees': 'Depósito instantâneo sem taxas da plataforma',
    'Deposit Amount (USD)': 'Valor do depósito (USD)','Or enter custom USD amount': 'Ou informe um valor USD personalizado',
    'Minimum deposit': 'Depósito mínimo','Rate is checked live by NOWPayments when the payment is created.': 'A cotação é verificada em tempo real pela NOWPayments ao criar o pagamento.',
    'Deposit is credited to your real account balance after payment confirmation.': 'O depósito é creditado no saldo real após a confirmação do pagamento.',
    'Select Cryptocurrency': 'Selecionar criptomoeda','Minimum Deposit': 'Depósito mínimo','Minimum deposit is': 'O depósito mínimo é',
    'Error': 'Erro','Failed to generate invoice': 'Falha ao criar a fatura','Order ID: ': 'ID do pedido: ','Awaiting Deposit': 'Aguardando depósito',
    'Deposit QR Code': 'QR Code do depósito','Send exactly to deposit address': 'Envie exatamente para o endereço de depósito','Open NOWPayments Payment Page': 'Abrir página de pagamento NOWPayments',
    'Change Currency / Amount': 'Alterar moeda / valor','Done': 'Concluído'
  },
  zh: {
    'NOWPayments Crypto Deposit': 'NOWPayments 加密货币充值','Instant deposit with zero platform fees': '即时充值，平台零手续费',
    'Deposit Amount (USD)': '充值金额（USD）','Or enter custom USD amount': '或输入自定义 USD 金额',
    'Minimum deposit': '最低充值','Rate is checked live by NOWPayments when the payment is created.': '创建付款时由 NOWPayments 实时检查汇率。',
    'Deposit is credited to your real account balance after payment confirmation.': '付款确认后，充值金额会进入您的真实账户余额。',
    'Select Cryptocurrency': '选择加密货币','Minimum Deposit': '最低充值','Minimum deposit is': '最低充值金额为',
    'Error': '错误','Failed to generate invoice': '创建账单失败','Order ID: ': '订单ID：','Awaiting Deposit': '等待充值',
    'Deposit QR Code': '充值二维码','Send exactly to deposit address': '请准确发送到充值地址：','Open NOWPayments Payment Page': '打开 NOWPayments 支付页面',
    'Change Currency / Amount': '更改货币 / 金额','Done': '完成'
  },
  ja: {
    'NOWPayments Crypto Deposit': 'NOWPayments暗号資産入金','Instant deposit with zero platform fees': 'プラットフォーム手数料なしの即時入金',
    'Deposit Amount (USD)': '入金額（USD）','Or enter custom USD amount': 'またはUSD金額を入力',
    'Minimum deposit': '最低入金額','Rate is checked live by NOWPayments when the payment is created.': '支払い作成時にNOWPaymentsがレートをリアルタイム確認します。',
    'Deposit is credited to your real account balance after payment confirmation.': '支払い確認後、入金額が実際のアカウント残高に反映されます。',
    'Select Cryptocurrency': '暗号資産を選択','Minimum Deposit': '最低入金額','Minimum deposit is': '最低入金額は',
    'Error': 'エラー','Failed to generate invoice': '請求書の作成に失敗しました','Order ID: ': '注文ID：','Awaiting Deposit': '入金待ち',
    'Deposit QR Code': '入金QRコード','Send exactly to deposit address': '入金アドレスへ正確に送信してください：','Open NOWPayments Payment Page': 'NOWPayments支払いページを開く',
    'Change Currency / Amount': '通貨 / 金額を変更','Done': '完了'
  },
  ko: {
    'NOWPayments Crypto Deposit': 'NOWPayments 암호화폐 입금','Instant deposit with zero platform fees': '플랫폼 수수료 없는 즉시 입금',
    'Deposit Amount (USD)': '입금 금액(USD)','Or enter custom USD amount': '또는 사용자 지정 USD 금액 입력',
    'Minimum deposit': '최소 입금','Rate is checked live by NOWPayments when the payment is created.': '결제 생성 시 NOWPayments가 환율을 실시간 확인합니다.',
    'Deposit is credited to your real account balance after payment confirmation.': '결제 확인 후 입금액이 실제 계정 잔액에 반영됩니다.',
    'Select Cryptocurrency': '암호화폐 선택','Minimum Deposit': '최소 입금','Minimum deposit is': '최소 입금액은',
    'Error': '오류','Failed to generate invoice': '인보이스 생성 실패','Order ID: ': '주문 ID: ','Awaiting Deposit': '입금 대기',
    'Deposit QR Code': '입금 QR 코드','Send exactly to deposit address': '입금 주소로 정확히 보내세요','Open NOWPayments Payment Page': 'NOWPayments 결제 페이지 열기',
    'Change Currency / Amount': '통화 / 금액 변경','Done': '완료'
  },
  ar: {
    'NOWPayments Crypto Deposit': 'إيداع العملات الرقمية عبر NOWPayments','Instant deposit with zero platform fees': 'إيداع فوري بدون رسوم منصة',
    'Deposit Amount (USD)': 'مبلغ الإيداع (USD)','Or enter custom USD amount': 'أو أدخل مبلغ USD مخصصًا',
    'Minimum deposit': 'الحد الأدنى للإيداع','Rate is checked live by NOWPayments when the payment is created.': 'يتم التحقق من السعر مباشرة عبر NOWPayments عند إنشاء الدفع.',
    'Deposit is credited to your real account balance after payment confirmation.': 'يُضاف الإيداع إلى رصيد حسابك الحقيقي بعد تأكيد الدفع.',
    'Select Cryptocurrency': 'اختر العملة الرقمية','Minimum Deposit': 'الحد الأدنى للإيداع','Minimum deposit is': 'الحد الأدنى للإيداع هو',
    'Error': 'خطأ','Failed to generate invoice': 'فشل إنشاء الفاتورة','Order ID: ': 'معرّف الطلب: ','Awaiting Deposit': 'بانتظار الإيداع',
    'Deposit QR Code': 'رمز QR للإيداع','Send exactly to deposit address': 'أرسل المبلغ إلى عنوان الإيداع بالضبط','Open NOWPayments Payment Page': 'فتح صفحة دفع NOWPayments',
    'Change Currency / Amount': 'تغيير العملة / المبلغ','Done': 'تم'
  }
};
for (const lang of Object.keys(DEPOSIT_UI_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], DEPOSIT_UI_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...DEPOSIT_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}



const FINAL_MISSING_PAGE_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Login': 'Masuk','Register': 'Daftar','We sent a verification link to ': 'Kami mengirim tautan verifikasi ke ','You must verify it before you can log in.': 'Anda harus memverifikasi email sebelum login.','Terms & Conditions': 'Syarat & Ketentuan',
    'LOGIN / REGISTER': 'MASUK / DAFTAR','Streamer Username Manager': 'Pengelola Username Streamer','WIN': 'MENANG','Close': 'Tutup',
    'Earn Passive Crypto & Gold Coins': 'Dapatkan Crypto & Gold Coins','Anyone registering with your link receives a free ': 'Setiap orang yang mendaftar melalui link Anda menerima ',' starter bonus.': ' bonus awal gratis.','Unclaimed Commission Balance': 'Saldo Komisi Belum Diklaim',
    'Upload / Create': 'Unggah / Buat','Live Room': 'Live Room','Login Required': 'Login Diperlukan','Loading...': 'Memuat...'
  },
  en: {
    'Login': 'Login','Register': 'Register','We sent a verification link to ': 'We sent a verification link to ','You must verify it before you can log in.': 'You must verify it before you can log in.','Terms & Conditions': 'Terms & Conditions',
    'LOGIN / REGISTER': 'LOGIN / REGISTER','Streamer Username Manager': 'Streamer Username Manager','WIN': 'WIN','Close': 'Close',
    'Earn Passive Crypto & Gold Coins': 'Earn Passive Crypto & Gold Coins','Anyone registering with your link receives a free ': 'Anyone registering with your link receives a free ',' starter bonus.': ' starter bonus.','Unclaimed Commission Balance': 'Unclaimed Commission Balance',
    'Upload / Create': 'Upload / Create','Live Room': 'Live Room','Login Required': 'Login Required','Loading...': 'Loading...'
  },
  es: {
    'Login': 'Iniciar sesión','Register': 'Registrarse','We sent a verification link to ': 'Enviamos un enlace de verificación a ','You must verify it before you can log in.': 'Debes verificarlo antes de iniciar sesión.','Terms & Conditions': 'Términos y condiciones',
    'LOGIN / REGISTER': 'INICIAR SESIÓN / REGISTRARSE','Streamer Username Manager': 'Gestor de nombres de usuario del streamer','WIN': 'GANAR','Close': 'Cerrar',
    'Earn Passive Crypto & Gold Coins': 'Gana criptomonedas y monedas de oro','Anyone registering with your link receives a free ': 'Quien se registre con tu enlace recibe ',' starter bonus.': ' de bonificación inicial gratis.','Unclaimed Commission Balance': 'Saldo de comisiones no reclamado',
    'Upload / Create': 'Subir / crear','Live Room': 'Sala en vivo','Login Required': 'Inicio de sesión requerido','Loading...': 'Cargando...'
  },
  pt: {
    'Login': 'Entrar','Register': 'Registrar','We sent a verification link to ': 'Enviamos um link de verificação para ','You must verify it before you can log in.': 'Você precisa verificar antes de entrar.','Terms & Conditions': 'Termos e condições',
    'LOGIN / REGISTER': 'ENTRAR / REGISTRAR','Streamer Username Manager': 'Gerenciador de nome do streamer','WIN': 'VENCER','Close': 'Fechar',
    'Earn Passive Crypto & Gold Coins': 'Ganhe cripto e moedas de ouro','Anyone registering with your link receives a free ': 'Quem se registrar pelo seu link recebe ',' starter bonus.': ' de bônus inicial grátis.','Unclaimed Commission Balance': 'Saldo de comissão não resgatado',
    'Upload / Create': 'Enviar / criar','Live Room': 'Sala ao vivo','Login Required': 'Login necessário','Loading...': 'Carregando...'
  },
  zh: {
    'Login': '登录','Register': '注册','We sent a verification link to ': '我们已将验证链接发送至 ','You must verify it before you can log in.': '登录前必须完成验证。','Terms & Conditions': '条款与条件',
    'LOGIN / REGISTER': '登录 / 注册','Streamer Username Manager': '主播用户名管理','WIN': '获胜','Close': '关闭',
    'Earn Passive Crypto & Gold Coins': '赚取加密货币和金币','Anyone registering with your link receives a free ': '通过您的链接注册的用户可获得 ',' starter bonus.': ' 新手奖励。','Unclaimed Commission Balance': '未领取的佣金余额',
    'Upload / Create': '上传 / 创建','Live Room': '直播间','Login Required': '需要登录','Loading...': '加载中...'
  },
  ja: {
    'Login': 'ログイン','Register': '登録','We sent a verification link to ': '確認リンクを送信しました：','You must verify it before you can log in.': 'ログインする前に確認が必要です。','Terms & Conditions': '利用規約',
    'LOGIN / REGISTER': 'ログイン / 登録','Streamer Username Manager': 'ストリーマーユーザー名管理','WIN': '勝利','Close': '閉じる',
    'Earn Passive Crypto & Gold Coins': '暗号資産とゴールドコインを獲得','Anyone registering with your link receives a free ': 'あなたのリンクから登録した人には無料の ',' starter bonus.': ' スターターボーナス。','Unclaimed Commission Balance': '未請求コミッション残高',
    'Upload / Create': 'アップロード / 作成','Live Room': 'ライブルーム','Login Required': 'ログインが必要です','Loading...': '読み込み中...'
  },
  ko: {
    'Login': '로그인','Register': '가입','We sent a verification link to ': '인증 링크를 보냈습니다: ','You must verify it before you can log in.': '로그인하기 전에 이메일을 인증해야 합니다.','Terms & Conditions': '이용약관',
    'LOGIN / REGISTER': '로그인 / 가입','Streamer Username Manager': '스트리머 사용자명 관리','WIN': '승리','Close': '닫기',
    'Earn Passive Crypto & Gold Coins': '암호화폐 및 골드 코인 수익','Anyone registering with your link receives a free ': '회원가입한 사용자는 무료 ',' starter bonus.': ' 시작 보너스를 받습니다.','Unclaimed Commission Balance': '미청구 커미션 잔액',
    'Upload / Create': '업로드 / 만들기','Live Room': '라이브 룸','Login Required': '로그인 필요','Loading...': '로드 중...'
  },
  ar: {
    'Login': 'تسجيل الدخول','Register': 'إنشاء حساب','We sent a verification link to ': 'أرسلنا رابط التحقق إلى ','You must verify it before you can log in.': 'يجب التحقق قبل تسجيل الدخول.','Terms & Conditions': 'الشروط والأحكام',
    'LOGIN / REGISTER': 'تسجيل الدخول / التسجيل','Streamer Username Manager': 'إدارة اسم مستخدم البث','WIN': 'فوز','Close': 'إغلاق',
    'Earn Passive Crypto & Gold Coins': 'اكسب العملات الرقمية والعملات الذهبية','Anyone registering with your link receives a free ': 'يحصل كل من يسجل عبر رابطك على ',' starter bonus.': ' كمكافأة بداية مجانية.','Unclaimed Commission Balance': 'رصيد العمولة غير المطالب به',
    'Upload / Create': 'رفع / إنشاء','Live Room': 'الغرفة المباشرة','Login Required': 'تسجيل الدخول مطلوب','Loading...': 'جارٍ التحميل...'
  }
};
for (const lang of Object.keys(FINAL_MISSING_PAGE_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], FINAL_MISSING_PAGE_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...FINAL_MISSING_PAGE_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}


const ADDITIONAL_UI_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Sign in to continue streaming and gaming': 'Masuk untuk melanjutkan streaming dan bermain',
    'Username or Email': 'Username atau Email','Connect Wallet': 'Hubungkan Wallet','Forgot Password?': 'Lupa Kata Sandi?',
    "Don't have an account?": "Belum punya akun?",'Register Now': 'Daftar Sekarang','Secured with Web3': 'Diamankan dengan Web3','Biometric Login Available': 'Login biometrik tersedia',
    'CREATE ACCOUNT': 'BUAT AKUN','LOGIN': 'MASUK','or Connect with Crypto Wallet': 'atau Hubungkan dengan Crypto Wallet',
    'EVM Wallet Recovery Phrase': 'Frasa Pemulihan Wallet EVM','Wallet Address': 'Alamat Wallet','Recovery Phrase': 'Frasa Pemulihan',
    'Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.': 'Wajib membaca dan menyetujui Syarat & Ketentuan sebelum membuat akun.',
    'I have read and agree to the': 'Saya telah membaca dan menyetujui','Terms & Conditions': 'Syarat & Ketentuan',
    'Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.': 'Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan frasa pemulihan ini.',
    'Simpan offline sebelum menutup halaman.': 'Simpan secara offline sebelum menutup halaman.',
    'Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': 'Saya sudah menyimpan frasa pemulihan di tempat yang aman dan memahami bahwa frasa tersebut tidak dapat dipulihkan oleh SYS STREAM.',
    'Loading active tasks...': 'Memuat tugas aktif...','Submitting...': 'Mengirim...','Open Task': 'Buka Tugas',
    'Task': 'Tugas','Save Wallet': 'Simpan Wallet','Proof link is required.': 'Link bukti wajib diisi.','Submission failed': 'Pengajuan gagal',
    'Login to continue': 'Masuk untuk melanjutkan'
  },
  en: {
    'Sign in to continue streaming and gaming': 'Sign in to continue streaming and gaming','Username or Email': 'Username or Email','Connect Wallet': 'Connect Wallet','Forgot Password?': 'Forgot Password?',
    "Don't have an account?": "Don't have an account?",'Register Now': 'Register Now','Secured with Web3': 'Secured with Web3','Biometric Login Available': 'Biometric Login Available',
    'CREATE ACCOUNT': 'CREATE ACCOUNT','LOGIN': 'LOGIN','or Connect with Crypto Wallet': 'or Connect with Crypto Wallet','EVM Wallet Recovery Phrase': 'EVM Wallet Recovery Phrase',
    'Wallet Address': 'Wallet Address','Recovery Phrase': 'Recovery Phrase','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.': 'You must read and agree to the Terms & Conditions before creating an account.',
    'I have read and agree to the': 'I have read and agree to the','Terms & Conditions': 'Terms & Conditions',
    'Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.': 'The wallet is created on your device. SYS STREAM does not receive or store this recovery phrase.',
    'Simpan offline sebelum menutup halaman.': 'Save it offline before closing this page.',
    'Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': 'I have saved the recovery phrase in a safe place and understand that SYS STREAM cannot recover it.',
    'Loading active tasks...': 'Loading active tasks...','Submitting...': 'Submitting...','Open Task': 'Open Task','Task': 'Task','Save Wallet': 'Save Wallet',
    'Proof link is required.': 'Proof link is required.','Submission failed': 'Submission failed','Login to continue': 'Login to continue'
  },
  es: {
    'Sign in to continue streaming and gaming': 'Inicia sesión para continuar con el streaming y los juegos','Username or Email': 'Usuario o correo electrónico','Connect Wallet': 'Conectar wallet','Forgot Password?': '¿Olvidaste la contraseña?',
    "Don't have an account?": "¿No tienes una cuenta?",'Register Now': 'Registrarse ahora','Secured with Web3': 'Protegido con Web3','Biometric Login Available': 'Inicio de sesión biométrico disponible',
    'CREATE ACCOUNT': 'CREAR CUENTA','LOGIN': 'INICIAR SESIÓN','or Connect with Crypto Wallet': 'o conectar con una wallet','EVM Wallet Recovery Phrase': 'Frase de recuperación de la wallet EVM',
    'Wallet Address': 'Dirección de wallet','Recovery Phrase': 'Frase de recuperación','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.': 'Debes leer y aceptar los Términos y condiciones antes de crear una cuenta.',
    'I have read and agree to the': 'He leído y acepto los','Terms & Conditions': 'Términos y condiciones','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.': 'La wallet se crea en tu dispositivo. SYS STREAM no recibe ni almacena esta frase de recuperación.',
    'Simpan offline sebelum menutup halaman.': 'Guárdala sin conexión antes de cerrar la página.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': 'He guardado la frase de recuperación en un lugar seguro y entiendo que SYS STREAM no puede recuperarla.',
    'Loading active tasks...': 'Cargando tareas activas...','Submitting...': 'Enviando...','Open Task': 'Abrir tarea','Task': 'Tarea','Save Wallet': 'Guardar wallet','Proof link is required.': 'El enlace de prueba es obligatorio.','Submission failed': 'Error al enviar','Login to continue': 'Inicia sesión para continuar'
  },
  pt: {
    'Sign in to continue streaming and gaming': 'Entre para continuar no streaming e nos jogos','Username or Email': 'Usuário ou e-mail','Connect Wallet': 'Conectar carteira','Forgot Password?': 'Esqueceu a senha?',
    "Don't have an account?": "Não tem uma conta?",'Register Now': 'Registrar agora','Secured with Web3': 'Protegido com Web3','Biometric Login Available': 'Login biométrico disponível',
    'CREATE ACCOUNT': 'CRIAR CONTA','LOGIN': 'ENTRAR','or Connect with Crypto Wallet': 'ou conectar carteira cripto','EVM Wallet Recovery Phrase': 'Frase de recuperação da carteira EVM',
    'Wallet Address': 'Endereço da carteira','Recovery Phrase': 'Frase de recuperação','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.': 'Você deve ler e aceitar os Termos e condições antes de criar uma conta.',
    'I have read and agree to the': 'Li e concordo com os','Terms & Conditions': 'Termos e condições','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.': 'A carteira é criada no seu dispositivo. A SYS STREAM não recebe nem armazena esta frase de recuperação.',
    'Simpan offline sebelum menutup halaman.': 'Guarde-a offline antes de fechar a página.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': 'Guardei a frase de recuperação em local seguro e entendo que a SYS STREAM não pode recuperá-la.',
    'Loading active tasks...': 'Carregando tarefas ativas...','Submitting...': 'Enviando...','Open Task': 'Abrir tarefa','Task': 'Tarefa','Save Wallet': 'Salvar carteira','Proof link is required.': 'O link de prova é obrigatório.','Submission failed': 'Falha no envio','Login to continue': 'Entre para continuar'
  },
  zh: {
    'Sign in to continue streaming and gaming': '登录后继续直播和游戏','Username or Email': '用户名或邮箱','Connect Wallet': '连接钱包','Forgot Password?': '忘记密码？',
    "Don't have an account?": "还没有账户？",'Register Now': '立即注册','Secured with Web3': '由 Web3 安全保护','Biometric Login Available': '支持生物识别登录',
    'CREATE ACCOUNT': '创建账户','LOGIN': '登录','or Connect with Crypto Wallet': '或连接加密钱包','EVM Wallet Recovery Phrase': 'EVM 钱包恢复短语',
    'Wallet Address': '钱包地址','Recovery Phrase': '恢复短语','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.': '创建账户前必须阅读并同意条款与条件。',
    'I have read and agree to the': '我已阅读并同意','Terms & Conditions': '条款与条件','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.': '钱包在您的设备上创建。SYS STREAM 不会接收或存储此恢复短语。',
    'Simpan offline sebelum menutup halaman.': '请在关闭页面前离线保存。','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': '我已将恢复短语保存在安全位置，并了解 SYS STREAM 无法恢复该短语。',
    'Loading active tasks...': '正在加载活动任务…','Submitting...': '正在提交…','Open Task': '打开任务','Task': '任务','Save Wallet': '保存钱包','Proof link is required.': '必须提供证明链接。','Submission failed': '提交失败','Login to continue': '登录后继续'
  },
  ja: {
    'Sign in to continue streaming and gaming': 'ログインして配信とゲームを続ける','Username or Email': 'ユーザー名またはメール','Connect Wallet': 'ウォレットを接続','Forgot Password?': 'パスワードを忘れましたか？',
    "Don't have an account?": "アカウントをお持ちではありませんか？",'Register Now': '今すぐ登録','Secured with Web3': 'Web3で保護されています','Biometric Login Available': '生体認証ログイン対応',
    'CREATE ACCOUNT': 'アカウントを作成','LOGIN': 'ログイン','or Connect with Crypto Wallet': 'または暗号資産ウォレットを接続','EVM Wallet Recovery Phrase': 'EVMウォレットのリカバリーフレーズ',
    'Wallet Address': 'ウォレットアドレス','Recovery Phrase': 'リカバリーフレーズ','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.': 'アカウント作成前に利用規約を読み、同意してください。',
    'I have read and agree to the': '以下を読み、同意します：','Terms & Conditions': '利用規約','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.': 'ウォレットは端末上で作成されます。SYS STREAMはこのリカバリーフレーズを受信・保存しません。',
    'Simpan offline sebelum menutup halaman.': 'ページを閉じる前にオフラインで保存してください。','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': 'リカバリーフレーズを安全な場所に保存し、SYS STREAMでは復元できないことを理解しました。',
    'Loading active tasks...': 'アクティブなタスクを読み込み中…','Submitting...': '送信中…','Open Task': 'タスクを開く','Task': 'タスク','Save Wallet': 'ウォレットを保存','Proof link is required.': '証拠リンクが必要です。','Submission failed': '送信に失敗しました','Login to continue': 'ログインして続行'
  },
  ko: {
    'Sign in to continue streaming and gaming': '로그인하여 스트리밍과 게임을 계속하세요','Username or Email': '사용자 이름 또는 이메일','Connect Wallet': '지갑 연결','Forgot Password?': '비밀번호를 잊으셨나요?',
    "Don't have an account?": "계정이 없으신가요?",'Register Now': '지금 가입','Secured with Web3': 'Web3로 보안됨','Biometric Login Available': '생체 인증 로그인 지원',
    'CREATE ACCOUNT': '계정 만들기','LOGIN': '로그인','or Connect with Crypto Wallet': '또는 암호화폐 지갑 연결','EVM Wallet Recovery Phrase': 'EVM 지갑 복구 문구',
    'Wallet Address': '지갑 주소','Recovery Phrase': '복구 문구','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.': '계정을 만들기 전에 이용약관을 읽고 동의해야 합니다.',
    'I have read and agree to the': '다음을 읽고 동의합니다','Terms & Conditions': '이용약관','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.': '지갑은 기기에서 생성됩니다. SYS STREAM은 이 복구 문구를 받거나 저장하지 않습니다.',
    'Simpan offline sebelum menutup halaman.': '페이지를 닫기 전에 오프라인으로 안전하게 저장하세요.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': '복구 문구를 안전한 곳에 저장했으며 SYS STREAM에서 복구할 수 없음을 이해합니다.',
    'Loading active tasks...': '활성 작업을 불러오는 중...','Submitting...': '제출 중...','Open Task': '작업 열기','Task': '작업','Save Wallet': '지갑 저장','Proof link is required.': '증빙 링크가 필요합니다.','Submission failed': '제출 실패','Login to continue': '로그인하여 계속'
  },
  ar: {
    'Sign in to continue streaming and gaming': 'سجّل الدخول لمتابعة البث والألعاب','Username or Email': 'اسم المستخدم أو البريد الإلكتروني','Connect Wallet': 'ربط المحفظة','Forgot Password?': 'هل نسيت كلمة المرور؟',
    "Don't have an account?": "ليس لديك حساب؟",'Register Now': 'سجّل الآن','Secured with Web3': 'محمي بواسطة Web3','Biometric Login Available': 'تسجيل الدخول البيومتري متاح',
    'CREATE ACCOUNT': 'إنشاء حساب','LOGIN': 'تسجيل الدخول','or Connect with Crypto Wallet': 'أو ربط محفظة العملات الرقمية','EVM Wallet Recovery Phrase': 'عبارة استرداد محفظة EVM',
    'Wallet Address': 'عنوان المحفظة','Recovery Phrase': 'عبارة الاسترداد','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.': 'يجب قراءة الشروط والأحكام والموافقة عليها قبل إنشاء الحساب.',
    'I have read and agree to the': 'لقد قرأت وأوافق على','Terms & Conditions': 'الشروط والأحكام','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.': 'يتم إنشاء المحفظة على جهازك. لا تستقبل SYS STREAM عبارة الاسترداد هذه ولا تخزنها.',
    'Simpan offline sebelum menutup halaman.': 'احفظها دون اتصال قبل إغلاق الصفحة.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.': 'لقد حفظت عبارة الاسترداد في مكان آمن وأفهم أن SYS STREAM لا يمكنه استعادتها.',
    'Loading active tasks...': 'جارٍ تحميل المهام النشطة...','Submitting...': 'جارٍ الإرسال...','Open Task': 'فتح المهمة','Task': 'مهمة','Save Wallet': 'حفظ المحفظة','Proof link is required.': 'رابط الإثبات مطلوب.','Submission failed': 'فشل الإرسال','Login to continue': 'سجّل الدخول للمتابعة'
  }
};

for (const lang of Object.keys(ADDITIONAL_UI_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], ADDITIONAL_UI_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...ADDITIONAL_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}


const AUTH_EXTRA_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
 id:{'Initializing TikTok Live Sync + Cloudflare D1 Connection': 'Menginisialisasi Sinkronisasi TikTok Live + Koneksi Cloudflare D1','RESEND VERIFICATION EMAIL': 'KIRIM ULANG EMAIL VERIFIKASI','SENDING...': 'MENGIRIM...','We sent a verification link to': 'Kami mengirim tautan verifikasi ke','You must verify it before you can log in.': 'Anda harus memverifikasi email sebelum dapat masuk.','and understand that my acceptance will be recorded with the current Terms version.': 'dan memahami bahwa persetujuan saya dicatat dengan versi Syarat & Ketentuan saat ini.'},
 en:{'Initializing TikTok Live Sync + Cloudflare D1 Connection': 'Initializing TikTok Live Sync + Cloudflare D1 Connection','RESEND VERIFICATION EMAIL': 'RESEND VERIFICATION EMAIL','SENDING...': 'SENDING...','We sent a verification link to': 'We sent a verification link to','You must verify it before you can log in.': 'You must verify it before you can log in.','and understand that my acceptance will be recorded with the current Terms version.': 'and understand that my acceptance will be recorded with the current Terms version.'},
 es:{'Initializing TikTok Live Sync + Cloudflare D1 Connection': 'Inicializando la sincronización de TikTok Live + conexión de Cloudflare D1','RESEND VERIFICATION EMAIL': 'REENVIAR EMAIL DE VERIFICACIÓN','SENDING...': 'ENVIANDO...','We sent a verification link to': 'Enviamos un enlace de verificación a','You must verify it before de iniciar sesión.': 'Debes verificarlo antes de iniciar sesión.','You must verify it before you can log in.': 'Debes verificarlo antes de iniciar sesión.','and understand that my acceptance will be recorded with the current Terms version.': 'y entiendo que mi aceptación se registrará con la versión actual de los Términos.'},
 pt:{'Initializing TikTok Live Sync + Cloudflare D1 Connection': 'Inicializando a sincronização do TikTok Live + conexão do Cloudflare D1','RESEND VERIFICATION EMAIL': 'REENVIAR E-MAIL DE VERIFICAÇÃO','SENDING...': 'ENVIANDO...','We sent a verification link to': 'Enviamos um link de verificação para','You must verify it before you can log in.': 'Você precisa verificá-lo antes de entrar.','and understand that my acceptance will be recorded with the current Terms version.': 'e entendo que minha aceitação será registrada com a versão atual dos Termos.'},
 zh:{'Initializing TikTok Live Sync + Cloudflare D1 Connection': '正在初始化 TikTok Live 同步 + Cloudflare D1 连接','RESEND VERIFICATION EMAIL': '重新发送验证邮件','SENDING...': '发送中...','We sent a verification link to': '我们已发送验证链接至','You must verify it before you can log in.': '登录前必须完成验证。','and understand that my acceptance will be recorded with the current Terms version.': '并了解我的同意将记录在当前条款版本中。'},
 ja:{'Initializing TikTok Live Sync + Cloudflare D1 Connection': 'TikTok Live同期 + Cloudflare D1接続を初期化しています','RESEND VERIFICATION EMAIL': '確認メールを再送信','SENDING...': '送信中...','We sent a verification link to': '確認リンクを送信しました：','You must verify it before you can log in.': 'ログインする前に確認してください。','and understand that my acceptance will be recorded with the current Terms version.': '同意内容が現在の利用規約バージョンに記録されることを理解します。'},
 ko:{'Initializing TikTok Live Sync + Cloudflare D1 Connection': 'TikTok Live 동기화 + Cloudflare D1 연결 초기화 중','RESEND VERIFICATION EMAIL': '인증 이메일 다시 보내기','SENDING...': '전송 중...','We sent a verification link to': '인증 링크를 다음 주소로 보냈습니다','You must verify it before you can log in.': '로그인하기 전에 이메일을 인증해야 합니다.','and understand that my acceptance will be recorded with the current Terms version.': '동의 내용이 현재 이용약관 버전에 기록됨을 이해합니다.'},
 ar:{'Initializing TikTok Live Sync + Cloudflare D1 Connection': 'جارٍ تهيئة مزامنة TikTok Live + اتصال Cloudflare D1','RESEND VERIFICATION EMAIL': 'إعادة إرسال بريد التحقق','SENDING...': 'جارٍ الإرسال...','We sent a verification link to': 'أرسلنا رابط التحقق إلى','You must verify it before you can log in.': 'يجب التحقق قبل تسجيل الدخول.','and understand that my acceptance will be recorded with the current Terms version.': 'وأفهم أن موافقتي ستُسجل مع إصدار الشروط الحالي.'}
};
for (const lang of Object.keys(AUTH_EXTRA_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], AUTH_EXTRA_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...AUTH_EXTRA_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const GAME_EXTRA_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
 id:{'USDT wallet address': 'Alamat wallet USDT','Photo too large': 'Foto terlalu besar','Maximum profile photo size is 5 MB.': 'Ukuran foto profil maksimal 5 MB.','Incomplete Prediction': 'Prediksi belum lengkap','Please enter a digit for Slot': 'Masukkan angka untuk Slot','Card Cracked!': 'Kartu berhasil dipecahkan!','All concealed digits matched!': 'Semua angka tersembunyi cocok!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': 'Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.','Guess Missed': 'Tebakan tidak cocok','Matched digits. Try another prediction!': 'Angka cocok. Coba prediksi lain!'},
 en:{'USDT wallet address': 'USDT wallet address','Photo too large': 'Photo too large','Maximum profile photo size is 5 MB.': 'Maximum profile photo size is 5 MB.','Incomplete Prediction': 'Incomplete Prediction','Please enter a digit for Slot': 'Please enter a digit for Slot','Card Cracked!': 'Card Cracked!','All concealed digits matched!': 'All concealed digits matched!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': 'Challenge successful. No balance was deducted or paid.','Guess Missed': 'Guess Missed','Matched digits. Try another prediction!': 'Matched digits. Try another prediction!'},
 es:{'USDT wallet address': 'Dirección de wallet USDT','Photo too large': 'Foto demasiado grande','Maximum profile photo size is 5 MB.': 'El tamaño máximo de la foto es de 5 MB.','Incomplete Prediction': 'Predicción incompleta','Please enter a digit for Slot': 'Introduce un dígito para el espacio','Card Cracked!': '¡Tarjeta descifrada!','All concealed digits matched!': '¡Todos los dígitos ocultos coinciden!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': 'Desafío completado. No se descontó ni pagó saldo.','Guess Missed': 'Adivinanza fallida','Matched digits. Try another prediction!': 'Dígitos coincidentes. ¡Prueba otra predicción!'},
 pt:{'USDT wallet address': 'Endereço da carteira USDT','Photo too large': 'Foto muito grande','Maximum profile photo size is 5 MB.': 'O tamanho máximo da foto é 5 MB.','Incomplete Prediction': 'Previsão incompleta','Please enter a digit for Slot': 'Digite um dígito para o slot','Card Cracked!': 'Cartão decifrado!','All concealed digits matched!': 'Todos os dígitos ocultos coincidem!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': 'Desafio concluído. Nenhum saldo foi descontado ou pago.','Guess Missed': 'Palpite não corresponde','Matched digits. Try another prediction!': 'Dígitos correspondentes. Tente outra previsão!'},
 zh:{'USDT wallet address': 'USDT 钱包地址','Photo too large': '照片过大','Maximum profile photo size is 5 MB.': '头像照片最大为 5 MB。','Incomplete Prediction': '预测不完整','Please enter a digit for Slot': '请为槽位输入一个数字','Card Cracked!': '卡片破解成功！','All concealed digits matched!': '所有隐藏数字都匹配！','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': '挑战成功。未扣除或支付余额。','Guess Missed': '猜测未命中','Matched digits. Try another prediction!': '匹配了数字。请尝试其他预测！'},
 ja:{'USDT wallet address': 'USDTウォレットアドレス','Photo too large': '写真が大きすぎます','Maximum profile photo size is 5 MB.': 'プロフィール写真は最大5MBです。','Incomplete Prediction': '予測が未完成です','Please enter a digit for Slot': 'スロットに数字を入力してください','Card Cracked!': 'カード解除成功！','All concealed digits matched!': 'すべての隠し数字が一致しました！','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': 'チャレンジ成功。残高の引き落としや支払いはありません。','Guess Missed': '予測不一致','Matched digits. Try another prediction!': '一致した数字があります。別の予測を試してください！'},
 ko:{'USDT wallet address': 'USDT 지갑 주소','Photo too large': '사진이 너무 큽니다','Maximum profile photo size is 5 MB.': '프로필 사진은 최대 5MB입니다.','Incomplete Prediction': '예측이 완료되지 않았습니다','Please enter a digit for Slot': '슬롯에 숫자를 입력하세요','Card Cracked!': '카드 해독 성공!','All concealed digits matched!': '숨겨진 숫자가 모두 일치했습니다!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': '챌린지 성공. 잔액이 차감되거나 지급되지 않았습니다.','Guess Missed': '예측 실패','Matched digits. Try another prediction!': '일치하는 숫자가 있습니다. 다른 예측을 시도하세요!'},
 ar:{'USDT wallet address': 'عنوان محفظة USDT','Photo too large': 'الصورة كبيرة جدًا','Maximum profile photo size is 5 MB.': 'الحد الأقصى لصورة الملف الشخصي 5 ميجابايت.','Incomplete Prediction': 'التوقع غير مكتمل','Please enter a digit for Slot': 'أدخل رقمًا للخانة','Card Cracked!': 'تم حل البطاقة!','All concealed digits matched!': 'تطابقت جميع الأرقام المخفية!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': 'نجح التحدي. لم يتم خصم أو دفع أي رصيد.','Guess Missed': 'التخمين غير مطابق','Matched digits. Try another prediction!': 'الأرقام المتطابقة. جرّب توقعًا آخر!'}
};
for (const lang of Object.keys(GAME_EXTRA_TRANSLATIONS) as LanguageCode[]) {
 Object.assign(translations[lang], GAME_EXTRA_TRANSLATIONS[lang]);
 PAGE_UI_TRANSLATIONS[lang] = { ...GAME_EXTRA_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const FINAL_GAME_LABELS: Record<LanguageCode, Record<string,string>> = {
 id:{'Vault Updated': 'Vault diperbarui','Added to your Inventory!': 'ditambahkan ke Inventori Anda!','Lock amount': 'Jumlah lock','Quota': 'Kuota','Lock': 'Lock','Enter viewer username (e.g. TikTok_User)': 'Masukkan username penonton (contoh: TikTok_User)','Close': 'Tutup'},
 en:{'Vault Updated': 'Vault Updated','Added to your Inventory!': 'added to your Inventory!','Lock amount': 'Lock amount','Quota': 'Quota','Lock': 'Lock','Enter viewer username (e.g. TikTok_User)': 'Enter viewer username (e.g. TikTok_User)','Close': 'Close'},
 es:{'Vault Updated': 'Bóveda actualizada','Added to your Inventory!': 'añadido a tu inventario','Lock amount': 'Cantidad de bloqueo','Quota': 'Cuota','Lock': 'Bloquear','Enter viewer username (e.g. TikTok_User)': 'Introduce el nombre del espectador (ej.: TikTok_User)','Close': 'Cerrar'},
 pt:{'Vault Updated': 'Cofre atualizado','Added to your Inventory!': 'adicionado ao seu inventário','Lock amount': 'Valor do bloqueio','Quota': 'Cota','Lock': 'Bloquear','Enter viewer username (e.g. TikTok_User)': 'Digite o nome do espectador (ex.: TikTok_User)','Close': 'Fechar'},
 zh:{'Vault Updated': '保险库已更新','Added to your Inventory!': '已添加到您的库存！','Lock amount': '锁定金额','Quota': '配额：','Lock': '锁定','Enter viewer username (e.g. TikTok_User)': '输入观众用户名（例如：TikTok_User）','Close': '关闭'},
 ja:{'Vault Updated': 'Vaultを更新しました','Added to your Inventory!': 'インベントリに追加しました！','Lock amount': 'ロック金額','Quota': 'クォータ：','Lock': 'ロック','Enter viewer username (e.g. TikTok_User)': '視聴者ユーザー名を入力（例：TikTok_User）','Close': '閉じる'},
 ko:{'Vault Updated': 'Vault 업데이트됨','Added to your Inventory!': '인벤토리에 추가되었습니다!','Lock amount': '잠금 금액','Quota': '할당량','Lock': '잠금','Enter viewer username (e.g. TikTok_User)': '시청자 사용자명을 입력하세요 (예: TikTok_User)','Close': '닫기'},
 ar:{'Vault Updated': 'تم تحديث الخزنة','Added to your Inventory!': 'تمت الإضافة إلى مخزونك!','Lock amount': 'مبلغ القفل','Quota': 'الحصة','Lock': 'قفل','Enter viewer username (e.g. TikTok_User)': 'أدخل اسم مستخدم المشاهد (مثال: TikTok_User)','Close': 'إغلاق'}
};
for(const lang of Object.keys(FINAL_GAME_LABELS) as LanguageCode[]){Object.assign(translations[lang],FINAL_GAME_LABELS[lang]);PAGE_UI_TRANSLATIONS[lang]={...FINAL_GAME_LABELS[lang],...PAGE_UI_TRANSLATIONS[lang]};}

const DASHBOARD_FINAL_UI: Record<LanguageCode, Record<string,string>> = {
 id:{'Upload / Create': 'Upload / Buat','Claim Bonus': 'Klaim Bonus','Buka media terlampir →': 'Buka media terlampir →','Buka Live Room': 'Buka Live Room','User ID': 'ID Pengguna','Wallet belum terhubung': 'Wallet belum terhubung'},
 en:{'Upload / Create': 'Upload / Create','Claim Bonus': 'Claim Bonus','Buka media terlampir →': 'Open attached media →','Buka Live Room': 'Open Live Room','User ID': 'User ID','Wallet belum terhubung': 'Wallet not connected'},
 es:{'Upload / Create': 'Subir / Crear','Claim Bonus': 'Reclamar bono','Buka media terlampir →': 'Abrir medio adjunto →','Buka Live Room': 'Abrir sala en vivo','User ID': 'ID de usuario','Wallet belum terhubung': 'Wallet no conectado'},
 pt:{'Upload / Create': 'Carregar / Criar','Claim Bonus': 'Resgatar bônus','Buka media terlampir →': 'Abrir mídia anexada →','Buka Live Room': 'Abrir sala ao vivo','User ID': 'ID do usuário','Wallet belum terhubung': 'Carteira não conectada'},
 zh:{'Upload / Create': '上传 / 创建','Claim Bonus': '领取奖励','Buka media terlampir →': '打开附件媒体 →','Buka Live Room': '打开直播间','User ID': '用户 ID：','Wallet belum terhubung': '钱包未连接'},
 ja:{'Upload / Create': 'アップロード / 作成','Claim Bonus': 'ボーナスを受け取る','Buka media terlampir →': '添付メディアを開く →','Buka Live Room': 'ライブルームを開く','User ID': 'ユーザーID：','Wallet belum terhubung': 'ウォレット未接続'},
 ko:{'Upload / Create': '업로드 / 만들기','Claim Bonus': '보너스 받기','Buka media terlampir →': '첨부 미디어 열기 →','Buka Live Room': '라이브 룸 열기','User ID': '사용자 ID','Wallet belum terhubung': '지갑이 연결되지 않음'},
 ar:{'Upload / Create': 'رفع / إنشاء','Claim Bonus': 'المطالبة بالمكافأة','Buka media terlampir →': 'فتح الوسائط المرفقة →','Buka Live Room': 'فتح الغرفة المباشرة','User ID': 'معرف المستخدم','Wallet belum terhubung': 'المحفظة غير متصلة'}
};
for(const lang of Object.keys(DASHBOARD_FINAL_UI) as LanguageCode[])Object.assign(translations[lang],DASHBOARD_FINAL_UI[lang]);
const EXTRA_GAME_UI: Record<LanguageCode, Record<string,string>> = {
 id:{'Remove': 'Hapus','Added to your Inventory!': 'Ditambahkan ke Inventaris!'},
 en:{'Remove': 'Remove','Added to your Inventory!': 'Added to your Inventory!'},
 es:{'Remove': 'Eliminar','Added to your Inventory!': '¡Añadido a tu inventario!'},
 pt:{'Remove': 'Remover','Added to your Inventory!': 'Adicionado ao seu inventário!'},
 zh:{'Remove': '移除','Added to your Inventory!': '已添加到您的库存！'},
 ja:{'Remove': '削除','Added to your Inventory!': 'インベントリに追加しました！'},
 ko:{'Remove': '삭제','Added to your Inventory!': '인벤토리에 추가되었습니다!'},
 ar:{'Remove': 'إزالة','Added to your Inventory!': 'تمت الإضافة إلى مخزونك!'}
};
for(const lang of Object.keys(EXTRA_GAME_UI) as LanguageCode[])Object.assign(translations[lang],EXTRA_GAME_UI[lang]);
const FINAL_HARDCODED_UI: Record<LanguageCode, Record<string,string>> = {
 id:{'Close': 'Tutup','Lock Amount': 'Jumlah Lock','Quota': 'Kuota','Durasi Lock': 'Durasi Lock','Lock Aktif': 'Lock Aktif','Notifications': 'Notifikasi','Edit avatar': 'Edit avatar','Submit': 'Kirim','Wallet': 'Wallet','Minimum withdrawal is': 'Minimum penarikan adalah'},
 en:{'Close': 'Close','Lock Amount': 'Lock Amount','Quota': 'Quota','Durasi Lock': 'Lock Duration','Lock Aktif': 'Lock Active','Notifications': 'Notifications','Edit avatar': 'Edit avatar','Submit': 'Submit','Wallet': 'Wallet','Minimum withdrawal is': 'Minimum withdrawal is'},
 es:{'Close': 'Cerrar','Lock Amount': 'Monto de bloqueo','Quota': 'Cuota','Durasi Lock': 'Duración del bloqueo','Lock Aktif': 'Bloqueo activo','Notifications': 'Notificaciones','Edit avatar': 'Editar avatar','Submit': 'Enviar','Wallet': 'Billetera','Minimum withdrawal is': 'El retiro mínimo es'},
 pt:{'Close': 'Fechar','Lock Amount': 'Valor do bloqueio','Quota': 'Cota','Durasi Lock': 'Duração do bloqueio','Lock Aktif': 'Bloqueio ativo','Notifications': 'Notificações','Edit avatar': 'Editar avatar','Submit': 'Enviar','Wallet': 'Carteira','Minimum withdrawal is': 'O saque mínimo é'},
 zh:{'Close': '关闭','Lock Amount': '锁定金额','Quota': '额度：','Durasi Lock': '锁定时长','Lock Aktif': '锁定已启用','Notifications': '通知','Edit avatar': '编辑头像','Submit': '提交','Wallet': '钱包','Minimum withdrawal is': '最低提现金额为'},
 ja:{'Close': '閉じる','Lock Amount': 'ロック額','Quota': '上限：','Durasi Lock': 'ロック期間','Lock Aktif': 'ロック有効','Notifications': '通知','Edit avatar': 'アバターを編集','Submit': '送信','Wallet': 'ウォレット','Minimum withdrawal is': '最低出金額は'},
 ko:{'Close': '닫기','Lock Amount': '잠금 금액','Quota': '한도','Durasi Lock': '잠금 기간','Lock Aktif': '잠금 활성','Notifications': '알림','Edit avatar': '아바타 편집','Submit': '제출','Wallet': '지갑','Minimum withdrawal is': '최소 출금액은'},
 ar:{'Close': 'إغلاق','Lock Amount': 'مبلغ القفل','Quota': 'الحصة','Durasi Lock': 'مدة القفل','Lock Aktif': 'القفل نشط','Notifications': 'الإشعارات','Edit avatar': 'تعديل الصورة','Submit': 'إرسال','Wallet': 'المحفظة','Minimum withdrawal is': 'الحد الأدنى للسحب هو'}
};
for(const lang of Object.keys(FINAL_HARDCODED_UI) as LanguageCode[])Object.assign(translations[lang],FINAL_HARDCODED_UI[lang]);
const AIRDROP_STATUS_LABELS: Record<LanguageCode, Record<string,string>> = {
 id:{'Task': 'Tugas','Open Task': 'Buka Tugas','Pending': 'Menunggu','Approved': 'Disetujui','Rejected': 'Ditolak','Paid': 'Dibayar'},
 en:{'Task': 'Task','Open Task': 'Open Task','Pending': 'Pending','Approved': 'Approved','Rejected': 'Rejected','Paid': 'Paid'},
 es:{'Task': 'Tarea','Open Task': 'Abrir tarea','Pending': 'Pendiente','Approved': 'Aprobado','Rejected': 'Rechazado','Paid': 'Pagado'},
 pt:{'Task': 'Tarefa','Open Task': 'Abrir tarefa','Pending': 'Pendente','Approved': 'Aprovado','Rejected': 'Rejeitado','Paid': 'Pago'},
 zh:{'Task': '任务','Open Task': '打开任务','Pending': '待审核','Approved': '已通过','Rejected': '已拒绝','Paid': '已支付'},
 ja:{'Task': 'タスク','Open Task': 'タスクを開く','Pending': '審査待ち','Approved': '承認済み','Rejected': '却下','Paid': '支払い済み'},
 ko:{'Task': '작업','Open Task': '작업 열기','Pending': '대기 중','Approved': '승인됨','Rejected': '거부됨','Paid': '지급됨'},
 ar:{'Task': 'مهمة','Open Task': 'فتح المهمة','Pending': 'قيد المراجعة','Approved': 'تمت الموافقة','Rejected': 'مرفوض','Paid': 'تم الدفع'}
};
for(const lang of Object.keys(AIRDROP_STATUS_LABELS) as LanguageCode[])Object.assign(translations[lang],AIRDROP_STATUS_LABELS[lang]);
const AIRDROP_FINAL_LABELS: Record<LanguageCode, Record<string,string>> = {
 id:{'Loading active tasks...': 'Memuat tugas aktif...','Submitting...': 'Mengirim...','Menu': 'Menu','Close': 'Tutup','https://...': 'https://...'},
 en:{'Loading active tasks...': 'Loading active tasks...','Submitting...': 'Submitting...','Menu': 'Menu','Close': 'Close','https://...': 'https://...'},
 es:{'Loading active tasks...': 'Cargando tareas activas...','Submitting...': 'Enviando...','Menu': 'Menú','Close': 'Cerrar','https://...': 'https://...'},
 pt:{'Loading active tasks...': 'Carregando tarefas ativas...','Submitting...': 'Enviando...','Menu': 'Menu','Close': 'Fechar','https://...': 'https://...'},
 zh:{'Loading active tasks...': '正在加载活动任务...','Submitting...': '提交中...','Menu': '菜单','Close': '关闭','https://...': 'https://...'},
 ja:{'Loading active tasks...': 'アクティブなタスクを読み込んでいます...','Submitting...': '送信中...','Menu': 'メニュー','Close': '閉じる','https://...': 'https://...'},
 ko:{'Loading active tasks...': '활성 작업을 불러오는 중...','Submitting...': '제출 중...','Menu': '메뉴','Close': '닫기','https://...': 'https://...'},
 ar:{'Loading active tasks...': 'جارٍ تحميل المهام النشطة...','Submitting...': 'جارٍ الإرسال...','Menu': 'القائمة','Close': 'إغلاق','https://...': 'https://...'}
};
for(const lang of Object.keys(AIRDROP_FINAL_LABELS) as LanguageCode[]){Object.assign(translations[lang],AIRDROP_FINAL_LABELS[lang]);PAGE_UI_TRANSLATIONS[lang]={...AIRDROP_FINAL_LABELS[lang],...PAGE_UI_TRANSLATIONS[lang]};}


/* Final UI translation audit coverage for legacy hardcoded labels. */
const UI_AUDIT_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.': 'Tulis sesuatu atau masukkan media terlebih dahulu.',
    'Posting gagal dibuat.': 'Posting gagal dibuat.','Koneksi gagal. Silakan coba lagi.': 'Koneksi gagal. Silakan coba lagi.',
    'Konten dan aktivitas di halaman ini menggunakan data produksi.': 'Konten dan aktivitas di halaman ini menggunakan data produksi.',
    'Wallet belum terhubung': 'Wallet belum terhubung','Refresh balance': 'Segarkan saldo','Registration Bonus': 'Bonus Pendaftaran','Bonus pendaftaran masih tersedia untuk diklaim.': 'Bonus pendaftaran masih tersedia untuk diklaim.','Claim Bonus': 'Klaim Bonus','Buka Live Room →': 'Buka Live Room →','Community Posts': 'Postingan Komunitas','Setiap user dapat membagikan tulisan dan postingan.': 'Setiap pengguna dapat membagikan tulisan dan postingan.','Refresh posts': 'Segarkan postingan','Memuat postingan...': 'Memuat postingan...','Belum ada postingan': 'Belum ada postingan','Jadilah pengguna pertama yang membagikan sesuatu.': 'Jadilah pengguna pertama yang membagikan sesuatu.','Buka media terlampir →': 'Buka media terlampir →','Belum ada data live aktif': 'Belum ada data live aktif','Room live akan tampil di sini setelah tersedia dari backend produksi.': 'Room live akan tampil di sini setelah tersedia dari backend produksi.','Buka Live Room': 'Buka Live Room','Tebak Nomor': 'Tebak Nomor','Ikuti permainan live.': 'Ikuti permainan live.','Spinner': 'Spinner','Masuk ke event spinner.': 'Masuk ke event spinner.','Blind Box': 'Blind Box','Buka Blind Box dengan saldo akun.': 'Buka Blind Box dengan saldo akun.','Community': 'Komunitas','Upload / Create Post': 'Unggah / Buat Postingan','Tulis sesuatu untuk dibagikan ke komunitas...': 'Tulis sesuatu untuk dibagikan ke komunitas...','Menerbitkan...': 'Menerbitkan...','Terbitkan Postingan': 'Terbitkan Postingan',
    'Referral link berhasil disalin.': 'Referral link berhasil disalin.','Masukkan alamat wallet tujuan.': 'Masukkan alamat wallet tujuan.','Saldo tersedia tidak mencukupi.': 'Saldo tersedia tidak mencukupi.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'Permintaan penarikan berhasil dibuat dan menunggu proses.','Belum ada transaksi.': 'Belum ada transaksi.','Loading...': 'Memuat...','Belum ada event yang diikuti.': 'Belum ada event yang diikuti.',
    'Need More Viewers': 'Butuh Lebih Banyak Penonton','Add at least 2 viewer usernames to spin the raffle wheel.': 'Tambahkan minimal 2 username penonton untuk memutar spinner.','Winner Picked!': 'Pemenang Terpilih!','Congratulations': 'Selamat!','Selected as Lucky Viewer!': 'Terpilih sebagai Penonton Beruntung!','Live Chat': 'Chat Live','Tambahkan peserta yang benar-benar masuk dari live room.': 'Tambahkan peserta yang benar-benar masuk dari live room.','Spinning for Winner...': 'Memutar untuk menentukan pemenang...','Remove': 'Hapus','Recent Raffle Winners': 'Pemenang Undian Terbaru',
    'Incomplete Prediction': 'Prediksi Belum Lengkap','Please enter a digit for Slot': 'Masukkan digit untuk Slot','Card Cracked!': 'Kartu Terpecahkan!','All concealed digits matched!': 'Semua digit tersembunyi cocok!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': 'Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.','Guess Missed': 'Tebakan Tidak Cocok','Matched digits. Try another prediction!': 'Digit cocok. Coba prediksi lain!','Crypto Card Number Guess': 'Tebak Nomor Kartu Kripto','Streamer Clue / Note for Viewers': 'Petunjuk Streamer untuk Penonton','Verify Challenge': 'Verifikasi Tantangan',
    'Server gagal memproses Blind Box.': 'Server gagal memproses Blind Box.','Vault Updated': 'Vault Diperbarui','Added to your Inventory!': 'Ditambahkan ke Inventory!','Daily Limit Reached': 'Batas Harian Tercapai','Staking Required': 'Staking Diperlukan'
  },
  en: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.': 'Write something or add media first.','Posting gagal dibuat.': 'Failed to create post.','Koneksi gagal. Silakan coba lagi.': 'Connection failed. Please try again.','Konten dan aktivitas di halaman ini menggunakan data produksi.': 'All content and activity on this page uses production data.','Wallet belum terhubung': 'Wallet not connected','Refresh balance': 'Refresh balance','Bonus pendaftaran masih tersedia untuk diklaim.': 'Your registration bonus is still available to claim.','Buka Live Room →': 'Open Live Room →','Setiap user dapat membagikan tulisan dan postingan.': 'Every user can share posts and updates.','Segarkan postingan': 'Refresh posts','Memuat postingan...': 'Loading posts...','Belum ada postingan': 'No posts yet','Jadilah pengguna pertama yang membagikan sesuatu.': 'Be the first user to share something.','Buka media terlampir →': 'Open attached media →','Belum ada data live aktif': 'No active live data','Room live akan tampil di sini setelah tersedia dari backend produksi.': 'Live rooms will appear here when available from the production backend.','Buka Live Room': 'Open Live Room','Ikuti permainan live.': 'Join the live game.','Masuk ke event spinner.': 'Enter the spinner event.','Buka Blind Box dengan saldo akun.': 'Open Blind Box using your account balance.','Community': 'Community','Upload / Create Post': 'Upload / Create Post','Tulis sesuatu untuk dibagikan ke komunitas...': 'Write something to share with the community...','Menerbitkan...': 'Publishing...','Terbitkan Postingan': 'Publish Post','Referral link berhasil disalin.': 'Referral link copied successfully.','Masukkan alamat wallet tujuan.': 'Enter the destination wallet address.','Saldo tersedia tidak mencukupi.': 'Available balance is insufficient.','Permintaan penarikan berhasil dibuat dan menunggu proses.': 'Withdrawal request created and awaiting processing.','Belum ada event yang diikuti.': 'No events joined yet.',
    'Need More Viewers': 'Need More Viewers','Add at least 2 viewer usernames to spin the raffle wheel.': 'Add at least 2 viewer usernames to spin the raffle wheel.','Winner Picked!': 'Winner Picked!','Congratulations': 'Congratulations','Selected as Lucky Viewer!': 'Selected as Lucky Viewer!','Tambahkan peserta yang benar-benar masuk dari live room.': 'Add participants who actually joined the live room.','Spinning for Winner...': 'Spinning for Winner...','Remove': 'Remove','Incomplete Prediction': 'Incomplete Prediction','Please enter a digit for Slot': 'Please enter a digit for Slot','Card Cracked!': 'Card Cracked!','All concealed digits matched!': 'All concealed digits matched!','Guess Missed': 'Guess Missed','Matched digits. Try another prediction!': 'Matched digits. Try another prediction!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.': 'Challenge completed. No balance was deducted or paid.','Server gagal memproses Blind Box.': 'The server failed to process the Blind Box.','Vault Updated': 'Vault Updated','Added to your Inventory!': 'Added to your Inventory!','Daily Limit Reached': 'Daily Limit Reached','Staking Required': 'Staking Required'
  },
  es: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.': 'Escribe algo o añade contenido multimedia primero.','Posting gagal dibuat.': 'No se pudo crear la publicación.','Koneksi gagal. Silakan coba lagi.': 'Error de conexión. Inténtalo de nuevo.','Konten dan aktivitas di halaman ini menggunakan data produksi.': 'Todo el contenido y la actividad de esta página usan datos de producción.','Wallet belum terhubung': 'Wallet no conectada','Refresh balance': 'Actualizar saldo','Bonus pendaftaran masih tersedia untuk diklaim.': 'Tu bono de registro sigue disponible para reclamar.','Buka Live Room →': 'Abrir Live Room →','Setiap user dapat membagikan tulisan dan postingan.': 'Cada usuario puede compartir publicaciones.','Memuat postingan...': 'Cargando publicaciones...','Belum ada postingan': 'Aún no hay publicaciones','Jadilah pengguna pertama yang membagikan sesuatu.': 'Sé el primero en compartir algo.','Buka Live Room': 'Abrir Live Room','Ikuti permainan live.': 'Participa en el juego en vivo.','Masuk ke event spinner.': 'Entrar al evento de spinner.','Buka Blind Box dengan saldo akun.': 'Abrir Blind Box con el saldo de la cuenta.','Upload / Create Post': 'Subir / Crear publicación','Tulis sesuatu untuk dibagikan ke komunitas...': 'Escribe algo para compartir con la comunidad...','Menerbitkan...': 'Publicando...','Terbitkan Postingan': 'Publicar','Referral link berhasil disalin.': 'Enlace de referidos copiado.','Masukkan alamat wallet tujuan.': 'Introduce la wallet de destino.','Saldo tersedia tidak mencukupi.': 'El saldo disponible es insuficiente.','Belum ada event yang diikuti.': 'Aún no hay eventos.','Need More Viewers': 'Se necesitan más espectadores','Winner Picked!': '¡Ganador seleccionado!','Congratulations': '¡Felicidades!','Selected as Lucky Viewer!': '¡Seleccionado como espectador afortunado!','Incomplete Prediction': 'Predicción incompleta','Please enter a digit for Slot': 'Introduce un dígito para la ranura','Card Cracked!': '¡Tarjeta descifrada!','Guess Missed': 'Predicción incorrecta','Matched digits. Try another prediction!': 'Dígitos coincidentes. Prueba otra predicción.','Daily Limit Reached': 'Límite diario alcanzado','Staking Required': 'Se requiere bloqueo'
  },
  pt: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.': 'Escreva algo ou adicione mídia primeiro.','Posting gagal dibuat.': 'Falha ao criar a publicação.','Koneksi gagal. Silakan coba lagi.': 'Falha de conexão. Tente novamente.','Konten dan aktivitas di halaman ini menggunakan data de produção.': 'Todo o conteúdo e atividade desta página usam dados de produção.','Wallet belum terhubung': 'Carteira não conectada','Refresh balance': 'Atualizar saldo','Bonus pendaftaran masih tersedia untuk diklaim.': 'Seu bônus de registro ainda está disponível.','Buka Live Room': 'Abrir Live Room','Ikuti permainan live.': 'Participar do jogo ao vivo.','Masuk ke event spinner.': 'Entrar no evento de spinner.','Buka Blind Box dengan saldo akun.': 'Abrir Blind Box com o saldo da conta.','Upload / Create Post': 'Enviar / Criar publicação','Tulis sesuatu untuk dibagikan ke komunitas...': 'Escreva algo para compartilhar com a comunidade...','Menerbitkan...': 'Publicando...','Terbitkan Postingan': 'Publicar','Referral link berhasil disalin.': 'Link de indicação copiado.','Masukkan alamat wallet tujuan.': 'Informe a carteira de destino.','Saldo tersedia tidak mencukupi.': 'O saldo disponível é insuficiente.','Belum ada event yang diikuti.': 'Nenhum evento participado ainda.','Need More Viewers': 'Mais espectadores necessários','Winner Picked!': 'Vencedor escolhido!','Congratulations': 'Parabéns!','Selected as Lucky Viewer!': 'Selecionado como espectador sortudo!','Incomplete Prediction': 'Previsão incompleta','Please enter a digit for Slot': 'Digite um dígito para o slot','Card Cracked!': 'Cartão desbloqueado!','Guess Missed': 'Palpite incorreto','Daily Limit Reached': 'Limite diário atingido','Staking Required': 'Bloqueio necessário'
  },
  zh: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.': '请先输入内容或添加媒体。','Posting gagal dibuat.': '发布失败。','Koneksi gagal. Silakan coba lagi.': '连接失败，请重试。','Konten dan aktivitas di halaman ini menggunakan data produksi.': '此页面的所有内容和活动均使用生产数据。','Wallet belum terhubung': '钱包未连接','Refresh balance': '刷新余额','Bonus pendaftaran masih tersedia untuk diklaim.': '您的注册奖励仍可领取。','Buka Live Room': '打开直播间','Ikuti permainan live.': '参加直播游戏。','Masuk ke event spinner.': '进入转盘活动。','Buka Blind Box dengan saldo akun.': '使用账户余额打开盲盒。','Upload / Create Post': '上传 / 创建帖子','Tulis sesuatu untuk dibagikan ke komunitas...': '写点内容分享给社区…','Menerbitkan...': '发布中…','Terbitkan Postingan': '发布帖子','Referral link berhasil disalin.': '推荐链接已复制。','Masukkan alamat wallet tujuan.': '请输入目标钱包地址。','Saldo tersedia tidak mencukupi.': '可用余额不足。','Belum ada event yang diikuti.': '暂无参加的活动。','Need More Viewers': '需要更多观众','Winner Picked!': '已选出获胜者！','Congratulations': '恭喜！','Selected as Lucky Viewer!': '已选为幸运观众！','Incomplete Prediction': '预测不完整','Please enter a digit for Slot': '请输入该位置的数字','Card Cracked!': '卡片已破解！','Guess Missed': '猜测错误','Daily Limit Reached': '已达到每日限制','Staking Required': '需要锁定余额'
  },
  ja: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.': 'まず内容を入力するかメディアを追加してください。','Posting gagal dibuat.': '投稿の作成に失敗しました。','Koneksi gagal. Silakan coba lagi.': '接続に失敗しました。もう一度お試しください。','Konten dan aktivitas di halaman ini menggunakan data produksi.': 'このページのコンテンツとアクティビティは本番データを使用します。','Wallet belum terhubung': 'ウォレット未接続','Refresh balance': '残高を更新','Bonus pendaftaran masih tersedia untuk diklaim.': '登録ボーナスをまだ受け取れます。','Buka Live Room': 'ライブルームを開く','Ikuti permainan live.': 'ライブゲームに参加','Masuk ke event spinner.': 'スピナーイベントに入る','Buka Blind Box dengan saldo akun.': 'アカウント残高でBlind Boxを開く','Upload / Create Post': 'アップロード / 投稿作成','Tulis sesuatu untuk dibagikan ke komunitas...': 'コミュニティに共有する内容を入力…','Menerbitkan...': '公開中…','Terbitkan Postingan': '投稿する','Referral link berhasil disalin.': '紹介リンクをコピーしました。','Masukkan alamat wallet tujuan.': '送金先ウォレットアドレスを入力してください。','Saldo tersedia tidak mencukupi.': '利用可能残高が不足しています。','Belum ada event yang diikuti.': '参加したイベントはありません。','Need More Viewers': 'さらに視聴者が必要です','Winner Picked!': '当選者が決まりました！','Congratulations': 'おめでとうございます！','Selected as Lucky Viewer!': 'ラッキー視聴者に選ばれました！','Incomplete Prediction': '予測が未入力です','Please enter a digit for Slot': 'スロットの数字を入力してください','Card Cracked!': 'カードが解読されました！','Guess Missed': '予測が外れました','Daily Limit Reached': '1日の上限に達しました','Staking Required': 'ロックが必要です'
  },
  ko: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.': '내용을 입력하거나 미디어를 추가하세요.','Posting gagal dibuat.': '게시물 생성에 실패했습니다.','Koneksi gagal. Silakan coba lagi.': '연결에 실패했습니다. 다시 시도하세요.','Konten dan aktivitas di halaman ini menggunakan data produksi.': '이 페이지의 모든 콘텐츠와 활동은 운영 데이터를 사용합니다.','Wallet belum terhubung': '지갑이 연결되지 않았습니다','Refresh balance': '잔액 새로고침','Bonus pendaftaran masih tersedia untuk diklaim.': '가입 보너스를 아직 받을 수 있습니다.','Buka Live Room': '라이브 룸 열기','Ikuti permainan live.': '라이브 게임 참여','Masuk ke event spinner.': '스피너 이벤트 입장','Buka Blind Box dengan saldo akun.': '계정 잔액으로 Blind Box 열기','Upload / Create Post': '업로드 / 게시물 만들기','Tulis sesuatu untuk dibagikan ke komunitas...': '커뮤니티에 공유할 내용을 입력하세요...','Menerbitkan...': '게시 중...','Terbitkan Postingan': '게시하기','Referral link berhasil disalin.': '추천 링크가 복사되었습니다.','Masukkan alamat wallet tujuan.': '대상 지갑 주소를 입력하세요.','Saldo tersedia tidak mencukupi.': '사용 가능 잔액이 부족합니다.','Belum ada event yang diikuti.': '참여한 이벤트가 없습니다.','Need More Viewers': '더 많은 시청자가 필요합니다','Winner Picked!': '당첨자가 선택되었습니다!','Congratulations': '축하합니다!','Selected as Lucky Viewer!': '행운의 시청자로 선정되었습니다!','Incomplete Prediction': '예측이 완전하지 않습니다','Please enter a digit for Slot': '슬롯의 숫자를 입력하세요','Card Cracked!': '카드가 해독되었습니다!','Guess Missed': '예측 실패','Daily Limit Reached': '일일 한도에 도달했습니다','Staking Required': 'Lock이 필요합니다'
  },
  ar: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.': 'اكتب شيئاً أو أضف وسائط أولاً.','Posting gagal dibuat.': 'فشل إنشاء المنشور.','Koneksi gagal. Silakan coba lagi.': 'فشل الاتصال. حاول مرة أخرى.','Konten dan aktivitas di halaman ini menggunakan data produksi.': 'تستخدم جميع محتويات وأنشطة هذه الصفحة بيانات الإنتاج.','Wallet belum terhubung': 'المحفظة غير متصلة','Refresh balance': 'تحديث الرصيد','Bonus pendaftaran masih tersedia untuk diklaim.': 'لا تزال مكافأة التسجيل متاحة للاستلام.','Buka Live Room': 'فتح الغرفة المباشرة','Ikuti permainan live.': 'انضم إلى اللعبة المباشرة','Masuk ke event spinner.': 'الدخول إلى فعالية العجلة','Buka Blind Box dengan saldo akun.': 'فتح Blind Box باستخدام رصيد الحساب','Upload / Create Post': 'رفع / إنشاء منشور','Tulis sesuatu untuk dibagikan ke komunitas...': 'اكتب شيئاً لمشاركته مع المجتمع...','Menerbitkan...': 'جارٍ النشر...','Terbitkan Postingan': 'نشر المنشور','Referral link berhasil disalin.': 'تم نسخ رابط الإحالة.','Masukkan alamat wallet tujuan.': 'أدخل عنوان المحفظة المستهدفة.','Saldo tersedia tidak mencukupi.': 'الرصيد المتاح غير كافٍ.','Belum ada event yang diikuti.': 'لا توجد فعاليات منضم إليها.','Need More Viewers': 'نحتاج إلى مزيد من المشاهدين','Winner Picked!': 'تم اختيار الفائز!','Congratulations': 'تهانينا!','Selected as Lucky Viewer!': 'تم اختيارك كمشاهد محظوظ!','Incomplete Prediction': 'التوقع غير مكتمل','Please enter a digit for Slot': 'أدخل رقماً للخانة','Card Cracked!': 'تم فك البطاقة!','Guess Missed': 'لم تنجح التخمينات','Daily Limit Reached': 'تم بلوغ الحد اليومي','Staking Required': 'يلزم القفل'
  }
};
const FINAL_AUDIT_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Reward dari Airdrop': 'Reward dari Airdrop','SYS Mining': 'SYS Mining','Mining SYS dari Blind Box Lock': 'Mining SYS dari Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.': 'Lock aktif minimal $10 dapat mengaktifkan reward mining harian.',
    'DAILY CHECK-IN': 'CHECK-IN HARIAN','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.': 'Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.',
    'Tanggal': 'Tanggal','Status': 'Status','Points': 'Points','Aksi': 'Aksi','TODAY': 'HARI INI','Belum check-in': 'Belum check-in','Check-in': 'Check-in',
    'AIRDROP POINTS': 'POIN AIRDROP','Points → SYS': 'Points → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.': 'Points hanya berasal dari task yang diproses server. Konversi dicatat sebagai ledger.',
    'Available': 'Tersedia','Pending': 'Menunggu','Converted': 'Dikonversi','Jumlah points': 'Jumlah points','Conversion gagal': 'Konversi gagal','Rate saat ini: 1 SYS = 1.000 points.': 'Rate saat ini: 1 SYS = 1.000 points.',
    'URL media (opsional)': 'URL media (opsional)','Memuat status Mining...': 'Memuat status Mining...'
  },
  en: {
    'Reward dari Airdrop': 'Airdrop reward','SYS Mining': 'SYS Mining','Mining SYS dari Blind Box Lock': 'Mine SYS from Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.': 'An active lock of at least $10 enables daily mining rewards.',
    'DAILY CHECK-IN': 'DAILY CHECK-IN','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.': 'Recurring daily check-in. Rewards are given in points and can be converted to SYS under the program rules.',
    'Tanggal': 'Date','Status': 'Status','Points': 'Points','Aksi': 'Action','TODAY': 'TODAY','Belum check-in': 'Not checked in','Check-in': 'Check in',
    'AIRDROP POINTS': 'AIRDROP POINTS','Points → SYS': 'Points → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.': 'Points come only from server-processed tasks. Conversions are recorded in the ledger.',
    'Available': 'Available','Pending': 'Pending','Converted': 'Converted','Jumlah points': 'Points amount','Conversion gagal': 'Conversion failed','Rate saat ini: 1 SYS = 1.000 points.': 'Current rate: 1 SYS = 1,000 points.',
    'URL media (opsional)': 'Media URL (optional)','Memuat status Mining...': 'Loading Mining status...'
  },
  es: {
    'Reward dari Airdrop': 'Recompensa de Airdrop','SYS Mining': 'Minería SYS','Mining SYS dari Blind Box Lock': 'Minar SYS con Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.': 'Un bloqueo activo de al menos $10 activa las recompensas diarias de minería.',
    'DAILY CHECK-IN': 'CHECK-IN DIARIO','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.': 'Check-in diario recurrente. Las recompensas se otorgan en puntos y pueden convertirse a SYS según las reglas del programa.',
    'Tanggal': 'Fecha','Status': 'Estado','Points': 'Puntos','Aksi': 'Acción','TODAY': 'HOY','Belum check-in': 'Sin check-in','Check-in': 'Registrar check-in',
    'AIRDROP POINTS': 'PUNTOS AIRDROP','Points → SYS': 'Puntos → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.': 'Los puntos provienen solo de tareas procesadas por el servidor. Las conversiones se registran en el libro mayor.',
    'Available': 'Disponible','Pending': 'Pendiente','Converted': 'Convertido','Jumlah points': 'Cantidad de puntos','Conversion gagal': 'Conversión fallida','Rate saat ini: 1 SYS = 1.000 points.': 'Tasa actual: 1 SYS = 1.000 puntos.',
    'URL media (opsional)': 'URL multimedia (opcional)','Memuat status Mining...': 'Cargando estado de minería...'
  },
  pt: {
    'Reward dari Airdrop': 'Recompensa do Airdrop','SYS Mining': 'Mineração SYS','Mining SYS dari Blind Box Lock': 'Minerar SYS com Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.': 'Um lock ativo de pelo menos $10 ativa recompensas diárias de mineração.',
    'DAILY CHECK-IN': 'CHECK-IN DIÁRIO','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.': 'Check-in diário recorrente. As recompensas são dadas em pontos e podem ser convertidas em SYS conforme as regras do programa.',
    'Tanggal': 'Data','Status': 'Status','Points': 'Pontos','Aksi': 'Ação','TODAY': 'HOJE','Belum check-in': 'Sem check-in','Check-in': 'Fazer check-in',
    'AIRDROP POINTS': 'PONTOS AIRDROP','Points → SYS': 'Pontos → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.': 'Os pontos vêm apenas de tarefas processadas pelo servidor. As conversões são registradas no livro razão.',
    'Available': 'Disponível','Pending': 'Pendente','Converted': 'Convertido','Jumlah points': 'Quantidade de pontos','Conversion gagal': 'Falha na conversão','Rate saat ini: 1 SYS = 1.000 points.': 'Taxa atual: 1 SYS = 1.000 pontos.',
    'URL media (opsional)': 'URL de mídia (opcional)','Memuat status Mining...': 'Carregando status da mineração...'
  },
  zh: {
    'Reward dari Airdrop': '空投奖励','SYS Mining': 'SYS 挖矿','Mining SYS dari Blind Box Lock': '通过 Blind Box Lock 挖矿 SYS','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.': '至少 $10 的有效锁定可开启每日挖矿奖励。',
    'DAILY CHECK-IN': '每日签到','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.': '每日重复签到。奖励以积分发放，并可按计划规则转换为 SYS。',
    'Tanggal': '日期','Status': '状态','Points': '积分','Aksi': '操作','TODAY': '今天','Belum check-in': '尚未签到','Check-in': '签到',
    'AIRDROP POINTS': '空投积分','Points → SYS': '积分 → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.': '积分仅来自服务器处理的任务，转换记录在账本中。',
    'Available': '可用','Pending': '待处理','Converted': '已转换','Jumlah points': '积分数量','Conversion gagal': '转换失败','Rate saat ini: 1 SYS = 1.000 points.': '当前汇率：1 SYS = 1,000 积分。',
    'URL media (opsional)': '媒体 URL（可选）','Memuat status Mining...': '正在加载挖矿状态…'
  },
  ja: {
    'Reward dari Airdrop': 'エアドロップ報酬','SYS Mining': 'SYSマイニング','Mining SYS dari Blind Box Lock': 'Blind Box LockでSYSをマイニング','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.': '10ドル以上の有効なロックで毎日のマイニング報酬が有効になります。',
    'DAILY CHECK-IN': 'デイリーチェックイン','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.': '毎日のチェックイン。報酬はポイントで付与され、プログラム規則に従ってSYSへ変換できます。',
    'Tanggal': '日付','Status': 'ステータス','Points': 'ポイント','Aksi': '操作','TODAY': '今日','Belum check-in': '未チェックイン','Check-in': 'チェックイン',
    'AIRDROP POINTS': 'エアドロップポイント','Points → SYS': 'ポイント → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.': 'ポイントはサーバーで処理されたタスクからのみ付与され、変換は台帳に記録されます。',
    'Available': '利用可能','Pending': '保留中','Converted': '変換済み','Jumlah points': 'ポイント数','Conversion gagal': '変換に失敗しました','Rate saat ini: 1 SYS = 1.000 points.': '現在のレート：1 SYS = 1,000ポイント。',
    'URL media (opsional)': 'メディアURL（任意）','Memuat status Mining...': 'マイニング状態を読み込み中…'
  },
  ko: {
    'Reward dari Airdrop': '에어드롭 보상','SYS Mining': 'SYS 채굴','Mining SYS dari Blind Box Lock': 'Blind Box Lock으로 SYS 채굴','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.': '최소 $10의 활성 Lock으로 일일 채굴 보상이 활성화됩니다.',
    'DAILY CHECK-IN': '일일 체크인','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.': '매일 반복되는 체크인입니다. 보상은 포인트로 지급되며 프로그램 규칙에 따라 SYS로 전환할 수 있습니다.',
    'Tanggal': '날짜','Status': '상태','Points': '포인트','Aksi': '작업','TODAY': '오늘','Belum check-in': '체크인하지 않음','Check-in': '체크인',
    'AIRDROP POINTS': '에어드롭 포인트','Points → SYS': '포인트 → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.': '포인트는 서버에서 처리된 작업에서만 발생하며 전환 내역은 원장에 기록됩니다.',
    'Available': '사용 가능','Pending': '대기 중','Converted': '전환됨','Jumlah points': '포인트 수량','Conversion gagal': '전환 실패','Rate saat ini: 1 SYS = 1.000 points.': '현재 비율: 1 SYS = 1,000 포인트.',
    'URL media (opsional)': '미디어 URL(선택 사항)','Memuat status Mining...': '채굴 상태를 불러오는 중...'
  },
  ar: {
    'Reward dari Airdrop': 'مكافأة الإيردروب','SYS Mining': 'تعدين SYS','Mining SYS dari Blind Box Lock': 'تعدين SYS عبر Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.': 'يؤدي القفل النشط بقيمة 10 دولارات على الأقل إلى تفعيل مكافآت التعدين اليومية.',
    'DAILY CHECK-IN': 'تسجيل الحضور اليومي','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.': 'تسجيل حضور يومي متكرر. تُمنح المكافآت بالنقاط ويمكن تحويلها إلى SYS وفق قواعد البرنامج.',
    'Tanggal': 'التاريخ','Status': 'الحالة','Points': 'النقاط','Aksi': 'الإجراء','TODAY': 'اليوم','Belum check-in': 'لم يتم التسجيل','Check-in': 'تسجيل الحضور',
    'AIRDROP POINTS': 'نقاط الإيردروب','Points → SYS': 'النقاط → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.': 'تأتي النقاط فقط من المهام التي يعالجها الخادم، وتُسجل التحويلات في دفتر الأستاذ.',
    'Available': 'متاح','Pending': 'معلق','Converted': 'تم التحويل','Jumlah points': 'عدد النقاط','Conversion gagal': 'فشل التحويل','Rate saat ini: 1 SYS = 1.000 points.': 'المعدل الحالي: 1 SYS = 1,000 نقطة.',
    'URL media (opsional)': 'رابط الوسائط (اختياري)','Memuat status Mining...': 'جارٍ تحميل حالة التعدين…'
  }
};
const USER_PAGE_FINAL_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  "id": {
    "Earns passive yield": "Menghasilkan imbal hasil pasif",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "Alamat wallet belum tersedia. Hubungkan wallet terlebih dahulu.",
    "Copied!": "Tersalin!",
    "Copy Link": "Salin Link",
    "All Claimed!": "Semua sudah diklaim!",
    "Claim Commission to Wallet": "Klaim komisi ke wallet",
    "You have opened all": "Anda sudah membuka semua",
    "box(es) for today. Quota resets in": "box hari ini. Kuota reset dalam",
    "Blind Box Failed": "Blind Box gagal",
    "Durasi lock tersedia": "Durasi lock tersedia",
    "30 hari": "30 hari",
    "60 hari": "60 hari",
    "90 hari": "90 hari"
  },
  "en": {
    "Earns passive yield": "Earns passive yield",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "Wallet address is not available. Connect your wallet first.",
    "Copied!": "Copied!",
    "Copy Link": "Copy Link",
    "All Claimed!": "All Claimed!",
    "Claim Commission to Wallet": "Claim Commission to Wallet",
    "You have opened all": "You have opened all",
    "box(es) for today. Quota resets in": "box(es) for today. Quota resets in",
    "Blind Box Failed": "Blind Box Failed",
    "Durasi lock tersedia": "Available lock durations",
    "30 hari": "30 days",
    "60 hari": "60 days",
    "90 hari": "90 days"
  },
  "es": {
    "Earns passive yield": "Genera rendimiento pasivo",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "La dirección de wallet no está disponible. Conecta tu wallet primero.",
    "Copied!": "¡Copiado!",
    "Copy Link": "Copiar enlace",
    "All Claimed!": "¡Todo reclamado!",
    "Claim Commission to Wallet": "Reclamar comisión a la wallet",
    "You have opened all": "Has abierto todas",
    "box(es) for today. Quota resets in": "caja(s) de hoy. La cuota se reinicia en",
    "Blind Box Failed": "Falló Blind Box",
    "Durasi lock tersedia": "Duraciones de bloqueo disponibles",
    "30 hari": "30 días",
    "60 hari": "60 días",
    "90 hari": "90 días"
  },
  "pt": {
    "Earns passive yield": "Gera rendimento passivo",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "O endereço da carteira não está disponível. Conecte sua carteira primeiro.",
    "Copied!": "Copiado!",
    "Copy Link": "Copiar link",
    "All Claimed!": "Tudo reivindicado!",
    "Claim Commission to Wallet": "Reivindicar comissão para a carteira",
    "You have opened all": "Você abriu todas",
    "box(es) for today. Quota resets in": "caixa(s) de hoje. A cota reinicia em",
    "Blind Box Failed": "Falha no Blind Box",
    "Durasi lock tersedia": "Durações de bloqueio disponíveis",
    "30 hari": "30 dias",
    "60 hari": "60 dias",
    "90 hari": "90 dias"
  },
  "zh": {
    "Earns passive yield": "产生被动收益",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "钱包地址不可用。请先连接钱包。",
    "Copied!": "已复制！",
    "Copy Link": "复制链接",
    "All Claimed!": "全部已领取！",
    "Claim Commission to Wallet": "领取佣金到钱包",
    "You have opened all": "你已打开全部",
    "box(es) for today. Quota resets in": "个今日盲盒，额度将在",
    "Blind Box Failed": "盲盒失败",
    "Durasi lock tersedia": "可用锁定期限：",
    "30 hari": "30天",
    "60 hari": "60天",
    "90 hari": "90天"
  },
  "ja": {
    "Earns passive yield": "パッシブ利回りを獲得",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "ウォレットアドレスがありません。先にウォレットを接続してください。",
    "Copied!": "コピーしました！",
    "Copy Link": "リンクをコピー",
    "All Claimed!": "すべて請求済み！",
    "Claim Commission to Wallet": "ウォレットへコミッションを請求",
    "You have opened all": "本日のすべての",
    "box(es) for today. Quota resets in": "個のボックスを開封しました。リセットまで",
    "Blind Box Failed": "Blind Boxに失敗しました",
    "Durasi lock tersedia": "利用可能なロック期間：",
    "30 hari": "30日",
    "60 hari": "60日",
    "90 hari": "90日"
  },
  "ko": {
    "Earns passive yield": "패시브 수익 발생",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "지갑 주소가 없습니다. 먼저 지갑을 연결하세요.",
    "Copied!": "복사됨!",
    "Copy Link": "링크 복사",
    "All Claimed!": "모두 클레임 완료!",
    "Claim Commission to Wallet": "지갑으로 커미션 받기",
    "You have opened all": "오늘의 모든",
    "box(es) for today. Quota resets in": "개 박스를 열었습니다. 재설정까지",
    "Blind Box Failed": "Blind Box 실패",
    "Durasi lock tersedia": "사용 가능한 Lock 기간",
    "30 hari": "30일",
    "60 hari": "60일",
    "90 hari": "90일"
  },
  "ar": {
    "Earns passive yield": "يحقق عائداً سلبياً",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "عنوان المحفظة غير متاح. يرجى ربط المحفظة أولاً.",
    "Copied!": "تم النسخ!",
    "Copy Link": "نسخ الرابط",
    "All Claimed!": "تمت المطالبة بالجميع!",
    "Claim Commission to Wallet": "المطالبة بالعمولة إلى المحفظة",
    "You have opened all": "لقد فتحت جميع",
    "box(es) for today. Quota resets in": "صندوق/صناديق اليوم. إعادة الحصة خلال",
    "Blind Box Failed": "فشل الصندوق الأعمى",
    "Durasi lock tersedia": "مدد القفل المتاحة",
    "30 hari": "30 يوماً",
    "60 hari": "60 يوماً",
    "90 hari": "90 يوماً"
  }
};
for (const lang of Object.keys(USER_PAGE_FINAL_TRANSLATIONS) as LanguageCode[]) Object.assign(UI_AUDIT_TRANSLATIONS[lang], USER_PAGE_FINAL_TRANSLATIONS[lang]);

for (const lang of Object.keys(FINAL_AUDIT_TRANSLATIONS) as LanguageCode[]) Object.assign(UI_AUDIT_TRANSLATIONS[lang], FINAL_AUDIT_TRANSLATIONS[lang]);

for (const lang of Object.keys(UI_AUDIT_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], UI_AUDIT_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...UI_AUDIT_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const LIVE_ROOM_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    "Live Room": "Live Room",
    "Masuk untuk bergabung ke Live Room": "Masuk untuk bergabung ke Live Room",
    "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.",
    "Room": "Room",
    "Room berhasil dibuat.": "Room berhasil dibuat.",
    "Gagal membuat room.": "Gagal membuat room.",
    "OFFICIAL STREAMER": "OFFICIAL STREAMER",
    "Buat Live Room": "Buat Live Room",
    "Room ini belum dibuat oleh Official Streamer.": "Room ini belum dibuat oleh Official Streamer.",
    "Room belum tersedia": "Room belum tersedia",
    "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.",
    "Judul Live Room": "Judul Live Room",
    "Deskripsi room (opsional)": "Deskripsi room (opsional)",
    "MEMBUAT ROOM...": "MEMBUAT ROOM...",
    "BUAT ROOM": "BUAT ROOM",
    "Streaming belum aktif": "Streaming belum aktif",
    "Belum ada video live produksi pada room ini.": "Belum ada video live produksi pada room ini.",
    "STREAMER CONTROL": "KONTROL STREAMER",
    "Streaming sedang berjalan": "Streaming sedang berjalan",
    "Kirim video dari OBS ke server": "Kirim video dari OBS ke server",
    "CHECK...": "PERIKSA...",
    "CHECK STATUS": "PERIKSA STATUS",
    "Status streaming gagal.": "Status streaming gagal.",
    "RTMPS SERVER": "SERVER RTMPS",
    "STREAM KEY": "KUNCI STREAM",
    "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.": "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.",
    "AKTIFKAN STREAMING": "AKTIFKAN STREAMING",
    "Buat Live Input Cloudflare untuk room ini.": "Buat Live Input Cloudflare untuk room ini.",
    "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.",
    "KHUSUS PEMILIK ROOM": "KHUSUS PEMILIK ROOM",
    "MEMBUAT...": "MEMBUAT...",
    "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.",
    "Gagal membuat Live Input.": "Gagal membuat Live Input.",
    "Gagal terhubung ke streaming server.": "Gagal terhubung ke server streaming.",
    "Profil akun Anda": "Profil akun Anda",
    "Belum ada deskripsi room dari pemilik room.": "Belum ada deskripsi room dari pemilik room.",
    "Peserta Live": "Peserta Live",
    "Hanya akun yang benar-benar bergabung yang ditampilkan.": "Hanya akun yang benar-benar bergabung yang ditampilkan.",
    "Memuat peserta...": "Memuat peserta...",
    "Belum ada peserta lain.": "Belum ada peserta lain.",
    "CHAT": "CHAT",
    "PESERTA": "PESERTA",
    "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.",
    "Tulis sebagai": "Tulis sebagai",
    "Belum ada peserta.": "Belum ada peserta.",
    "Anda": "Anda",
    "Aksi live room gagal.": "Aksi live room gagal.",
    "Chat": "Chat",
    "Pesan gagal dikirim.": "Pesan gagal dikirim.",
    "Live": "Live",
    "Like gagal dikirim.": "Like gagal dikirim."
  },
  en: {
    "Live Room": "Live Room",
    "Masuk untuk bergabung ke Live Room": "Sign in to join the Live Room",
    "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "Each account has its own profile and identity in the room.",
    "Room": "Room",
    "Room berhasil dibuat.": "Room created successfully.",
    "Gagal membuat room.": "Failed to create room.",
    "OFFICIAL STREAMER": "OFFICIAL STREAMER",
    "Buat Live Room": "Create Live Room",
    "Room ini belum dibuat oleh Official Streamer.": "This room has not been created by an Official Streamer.",
    "Room belum tersedia": "Room not available",
    "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "This room is not available yet. Create it to become its owner.",
    "Judul Live Room": "Live Room title",
    "Deskripsi room (opsional)": "Room description (optional)",
    "MEMBUAT ROOM...": "CREATING ROOM...",
    "BUAT ROOM": "CREATE ROOM",
    "Streaming belum aktif": "Streaming is not active",
    "Belum ada video live produksi pada room ini.": "There is no live production video in this room yet.",
    "STREAMER CONTROL": "STREAMER CONTROL",
    "Streaming sedang berjalan": "Streaming is running",
    "Kirim video dari OBS ke server": "Send video from OBS to the server",
    "CHECK...": "CHECKING...",
    "CHECK STATUS": "CHECK STATUS",
    "Status streaming gagal.": "Failed to check streaming status.",
    "RTMPS SERVER": "RTMPS SERVER",
    "STREAM KEY": "STREAM KEY",
    "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.": "In OBS: Settings → Stream → Service Custom → enter the RTMPS Server and Stream Key above.",
    "AKTIFKAN STREAMING": "ACTIVATE STREAMING",
    "Buat Live Input Cloudflare untuk room ini.": "Create a Cloudflare Live Input for this room.",
    "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "After creation, use the RTMPS Server + Stream Key in OBS.",
    "KHUSUS PEMILIK ROOM": "ROOM OWNER ONLY",
    "MEMBUAT...": "CREATING...",
    "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Live Input created. Use the OBS credentials below the video.",
    "Gagal membuat Live Input.": "Failed to create Live Input.",
    "Gagal terhubung ke streaming server.": "Failed to connect to the streaming server.",
    "Profil akun Anda": "Your account profile",
    "Belum ada deskripsi room dari pemilik room.": "No room description from the owner yet.",
    "Peserta Live": "Live participants",
    "Hanya akun yang benar-benar bergabung yang ditampilkan.": "Only accounts that have actually joined are shown.",
    "Memuat peserta...": "Loading participants...",
    "Belum ada peserta lain.": "No other participants yet.",
    "CHAT": "CHAT",
    "PESERTA": "PARTICIPANTS",
    "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "No messages yet. Be the first user to contribute to this room.",
    "Tulis sebagai": "Write as",
    "Belum ada peserta.": "No participants.",
    "Anda": "You",
    "Aksi live room gagal.": "Live room action failed.",
    "Chat": "Chat",
    "Pesan gagal dikirim.": "Failed to send message.",
    "Live": "Live",
    "Like gagal dikirim.": "Failed to send like."
  },
  es: {
  "Masuk untuk bergabung ke Live Room": "Inicia sesión para unirte a la sala en vivo",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "Cada cuenta tiene su propio perfil e identidad en la sala.",
  "Room berhasil dibuat.": "Sala creada correctamente.",
  "Gagal membuat room.": "No se pudo crear la sala.",
  "Buat Live Room": "Crear sala en vivo",
  "Room ini belum dibuat oleh Official Streamer.": "Esta sala aún no ha sido creada por un streamer oficial.",
  "Room belum tersedia": "Sala no disponible",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "Esta sala aún no está disponible. Créala para convertirte en su propietario.",
  "Judul Live Room": "Título de la sala en vivo",
  "Deskripsi room (opsional)": "Descripción de la sala (opcional)",
  "MEMBUAT ROOM...": "CREANDO SALA...",
  "BUAT ROOM": "CREAR SALA",
  "Streaming belum aktif": "La transmisión no está activa",
  "Belum ada video live produksi pada room ini.": "Aún no hay video en vivo de producción en esta sala.",
  "STREAMER CONTROL": "CONTROL DEL STREAMER",
  "Streaming sedang berjalan": "La transmisión está activa",
  "Kirim video dari OBS ke server": "Enviar video desde OBS al servidor",
  "CHECK...": "COMPROBANDO...",
  "CHECK STATUS": "COMPROBAR ESTADO",
  "Status streaming gagal.": "No se pudo comprobar el estado de la transmisión.",
  "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.": "En OBS: Settings → Stream → Service Custom → introduce el servidor RTMPS y la clave de stream anteriores.",
  "AKTIFKAN STREAMING": "ACTIVAR TRANSMISIÓN",
  "Buat Live Input Cloudflare untuk room ini.": "Crear una entrada Live de Cloudflare para esta sala.",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "Después de crearla, usa el servidor RTMPS y la clave de stream en OBS.",
  "KHUSUS PEMILIK ROOM": "SOLO PROPIETARIO DE LA SALA",
  "MEMBUAT...": "CREANDO...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Entrada Live creada. Usa las credenciales de OBS debajo del video.",
  "Gagal membuat Live Input.": "No se pudo crear la entrada Live.",
  "Gagal terhubung ke streaming server.": "No se pudo conectar al servidor de streaming.",
  "Profil akun Anda": "Tu perfil de cuenta",
  "Belum ada deskripsi room dari pemilik room.": "El propietario aún no ha añadido una descripción.",
  "Peserta Live": "Participantes en vivo",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "Solo se muestran las cuentas que realmente se han unido.",
  "Memuat peserta...": "Cargando participantes...",
  "Belum ada peserta lain.": "Aún no hay otros participantes.",
  "PESERTA": "PARTICIPANTES",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "Aún no hay mensajes. Sé el primer usuario en participar en esta sala.",
  "Tulis sebagai": "Escribir como",
  "Belum ada peserta.": "Aún no hay participantes.",
  "Anda": "Tú",
  "Aksi live room gagal.": "La acción de la sala en vivo falló.",
  "Pesan gagal dikirim.": "No se pudo enviar el mensaje.",
  "Like gagal dikirim.": "No se pudo enviar el Me gusta."
},
  pt: {
  "Masuk untuk bergabung ke Live Room": "Entre para participar da sala ao vivo",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "Cada conta tem seu próprio perfil e identidade na sala.",
  "Room berhasil dibuat.": "Sala criada com sucesso.",
  "Gagal membuat room.": "Falha ao criar a sala.",
  "Buat Live Room": "Criar sala ao vivo",
  "Room ini belum dibuat oleh Official Streamer.": "Esta sala ainda não foi criada por um streamer oficial.",
  "Room belum tersedia": "Sala indisponível",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "Esta sala ainda não está disponível. Crie-a para se tornar o proprietário.",
  "Judul Live Room": "Título da sala ao vivo",
  "Deskripsi room (opsional)": "Descrição da sala (opcional)",
  "MEMBUAT ROOM...": "CRIANDO SALA...",
  "BUAT ROOM": "CRIAR SALA",
  "Streaming belum aktif": "A transmissão não está ativa",
  "Belum ada video live produksi pada room ini.": "Ainda não há vídeo ao vivo de produção nesta sala.",
  "STREAMER CONTROL": "CONTROLE DO STREAMER",
  "Streaming sedang berjalan": "A transmissão está em andamento",
  "Kirim video dari OBS ke server": "Enviar vídeo do OBS para o servidor",
  "CHECK...": "VERIFICANDO...",
  "CHECK STATUS": "VERIFICAR STATUS",
  "Status streaming gagal.": "Falha ao verificar o status da transmissão.",
  "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.": "No OBS: Settings → Stream → Service Custom → insira o servidor RTMPS e a chave de stream acima.",
  "AKTIFKAN STREAMING": "ATIVAR TRANSMISSÃO",
  "Buat Live Input Cloudflare untuk room ini.": "Criar uma entrada Live da Cloudflare para esta sala.",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "Depois de criada, use o servidor RTMPS e a chave de stream no OBS.",
  "KHUSUS PEMILIK ROOM": "APENAS PROPRIETÁRIO DA SALA",
  "MEMBUAT...": "CRIANDO...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Entrada Live criada. Use as credenciais do OBS abaixo do vídeo.",
  "Gagal membuat Live Input.": "Falha ao criar a entrada Live.",
  "Gagal terhubung ke streaming server.": "Falha ao conectar ao servidor de streaming.",
  "Profil akun Anda": "Perfil da sua conta",
  "Belum ada deskripsi room dari pemilik room.": "O proprietário ainda não adicionou uma descrição.",
  "Peserta Live": "Participantes ao vivo",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "Somente contas que realmente entraram são exibidas.",
  "Memuat peserta...": "Carregando participantes...",
  "Belum ada peserta lain.": "Ainda não há outros participantes.",
  "PESERTA": "PARTICIPANTES",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "Ainda não há mensagens. Seja o primeiro a participar desta sala.",
  "Tulis sebagai": "Escrever como",
  "Belum ada peserta.": "Ainda não há participantes.",
  "Anda": "Você",
  "Aksi live room gagal.": "A ação da sala ao vivo falhou.",
  "Pesan gagal dikirim.": "Falha ao enviar a mensagem.",
  "Like gagal dikirim.": "Falha ao enviar a curtida."
},
  zh: {
  "Masuk untuk bergabung ke Live Room": "登录以加入直播间",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "每个账户在直播间都有自己的资料和身份。",
  "Room berhasil dibuat.": "直播间创建成功。",
  "Gagal membuat room.": "创建直播间失败。",
  "Buat Live Room": "创建直播间",
  "Room ini belum dibuat oleh Official Streamer.": "此直播间尚未由官方主播创建。",
  "Room belum tersedia": "直播间不可用",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "该直播间尚未创建。创建后你将成为其所有者。",
  "Judul Live Room": "直播间标题",
  "Deskripsi room (opsional)": "直播间描述（可选）",
  "MEMBUAT ROOM...": "正在创建直播间...",
  "BUAT ROOM": "创建直播间",
  "Streaming belum aktif": "直播尚未开始",
  "Belum ada video live produksi pada room ini.": "此直播间暂时没有生产环境直播视频。",
  "STREAMER CONTROL": "主播控制",
  "Streaming sedang berjalan": "直播正在进行",
  "Kirim video dari OBS ke server": "将 OBS 视频发送到服务器",
  "CHECK...": "检查中...",
  "CHECK STATUS": "检查状态",
  "Status streaming gagal.": "检查直播状态失败。",
  "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.": "在 OBS 中选择 Settings → Stream → Service Custom，并输入上方的 RTMPS 服务器和推流密钥。",
  "AKTIFKAN STREAMING": "启用直播",
  "Buat Live Input Cloudflare untuk room ini.": "为此直播间创建 Cloudflare Live Input。",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "创建后，在 OBS 中使用 RTMPS 服务器和推流密钥。",
  "KHUSUS PEMILIK ROOM": "仅限直播间所有者",
  "MEMBUAT...": "正在创建...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Live Input 创建成功。请使用视频下方的 OBS 凭据。",
  "Gagal membuat Live Input.": "创建 Live Input 失败。",
  "Gagal terhubung ke streaming server.": "无法连接到直播服务器。",
  "Profil akun Anda": "你的账户资料",
  "Belum ada deskripsi room dari pemilik room.": "所有者尚未添加直播间描述。",
  "Peserta Live": "直播参与者",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "仅显示实际加入的账户。",
  "Memuat peserta...": "正在加载参与者...",
  "Belum ada peserta lain.": "暂无其他参与者。",
  "PESERTA": "参与者",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "暂无消息。成为第一个在此直播间参与的用户。",
  "Tulis sebagai": "以此身份发言",
  "Belum ada peserta.": "暂无参与者。",
  "Anda": "你",
  "Aksi live room gagal.": "直播间操作失败。",
  "Pesan gagal dikirim.": "消息发送失败。",
  "Like gagal dikirim.": "点赞发送失败。"
},
  ja: {
  "Masuk untuk bergabung ke Live Room": "ライブ配信ルームに参加するにはログインしてください",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "各アカウントにはルーム内で固有のプロフィールとIDがあります。",
  "Room berhasil dibuat.": "ルームを作成しました。",
  "Gagal membuat room.": "ルームの作成に失敗しました。",
  "Buat Live Room": "ライブ配信ルームを作成",
  "Room ini belum dibuat oleh Official Streamer.": "このルームはまだ公式ストリーマーによって作成されていません。",
  "Room belum tersedia": "ルームは利用できません",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "このルームはまだありません。作成すると所有者になります。",
  "Judul Live Room": "ライブ配信ルームのタイトル",
  "Deskripsi room (opsional)": "ルームの説明（任意）",
  "MEMBUAT ROOM...": "ルームを作成中...",
  "BUAT ROOM": "ルームを作成",
  "Streaming belum aktif": "配信はまだ開始されていません",
  "Belum ada video live produksi pada room ini.": "このルームにはまだ本番ライブ映像がありません。",
  "STREAMER CONTROL": "ストリーマー管理",
  "Streaming sedang berjalan": "配信中",
  "Kirim video dari OBS ke server": "OBSからサーバーへ映像を送信",
  "CHECK...": "確認中...",
  "CHECK STATUS": "ステータスを確認",
  "Status streaming gagal.": "配信ステータスの確認に失敗しました。",
  "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.": "OBSのSettings → Stream → Service Customで、上記のRTMPSサーバーとストリームキーを入力してください。",
  "AKTIFKAN STREAMING": "配信を有効化",
  "Buat Live Input Cloudflare untuk room ini.": "このルーム用のCloudflare Live Inputを作成します。",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "作成後、OBSでRTMPSサーバーとストリームキーを使用してください。",
  "KHUSUS PEMILIK ROOM": "ルーム所有者のみ",
  "MEMBUAT...": "作成中...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Live Inputを作成しました。動画下のOBS認証情報を使用してください。",
  "Gagal membuat Live Input.": "Live Inputの作成に失敗しました。",
  "Gagal terhubung ke streaming server.": "配信サーバーへの接続に失敗しました。",
  "Profil akun Anda": "アカウントプロフィール",
  "Belum ada deskripsi room dari pemilik room.": "所有者によるルーム説明はまだありません。",
  "Peserta Live": "ライブ参加者",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "実際に参加したアカウントのみ表示されます。",
  "Memuat peserta...": "参加者を読み込み中...",
  "Belum ada peserta lain.": "他の参加者はまだいません。",
  "PESERTA": "参加者",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "まだメッセージはありません。このルームで最初に参加しましょう。",
  "Tulis sebagai": "次の名前で投稿",
  "Belum ada peserta.": "参加者はまだいません。",
  "Anda": "あなた",
  "Aksi live room gagal.": "ライブ配信ルームの操作に失敗しました。",
  "Pesan gagal dikirim.": "メッセージの送信に失敗しました。",
  "Like gagal dikirim.": "いいねの送信に失敗しました。"
},
  ko: {
  "Masuk untuk bergabung ke Live Room": "라이브 룸에 참여하려면 로그인하세요",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "각 계정은 룸에서 고유한 프로필과 신원을 가집니다.",
  "Room berhasil dibuat.": "룸이 생성되었습니다.",
  "Gagal membuat room.": "룸 생성에 실패했습니다.",
  "Buat Live Room": "라이브 룸 만들기",
  "Room ini belum dibuat oleh Official Streamer.": "이 룸은 아직 공식 스트리머가 만들지 않았습니다.",
  "Room belum tersedia": "룸을 사용할 수 없습니다",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "이 룸은 아직 없습니다. 생성하면 소유자가 됩니다.",
  "Judul Live Room": "라이브 룸 제목",
  "Deskripsi room (opsional)": "룸 설명(선택 사항)",
  "MEMBUAT ROOM...": "룸 생성 중...",
  "BUAT ROOM": "룸 만들기",
  "Streaming belum aktif": "스트리밍이 아직 시작되지 않았습니다",
  "Belum ada video live produksi pada room ini.": "이 룸에는 아직 프로덕션 라이브 영상이 없습니다.",
  "STREAMER CONTROL": "스트리머 제어",
  "Streaming sedang berjalan": "스트리밍 진행 중",
  "Kirim video dari OBS ke server": "OBS 영상을 서버로 전송",
  "CHECK...": "확인 중...",
  "CHECK STATUS": "상태 확인",
  "Status streaming gagal.": "스트리밍 상태 확인에 실패했습니다.",
  "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.": "OBS에서 Settings → Stream → Service Custom을 선택하고 위의 RTMPS 서버와 스트림 키를 입력하세요.",
  "AKTIFKAN STREAMING": "스트리밍 활성화",
  "Buat Live Input Cloudflare untuk room ini.": "이 룸의 Cloudflare Live Input을 생성합니다.",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "생성 후 OBS에서 RTMPS 서버와 스트림 키를 사용하세요.",
  "KHUSUS PEMILIK ROOM": "룸 소유자 전용",
  "MEMBUAT...": "생성 중...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Live Input이 생성되었습니다. 영상 아래의 OBS 인증 정보를 사용하세요.",
  "Gagal membuat Live Input.": "Live Input 생성에 실패했습니다.",
  "Gagal terhubung ke streaming server.": "스트리밍 서버 연결에 실패했습니다.",
  "Profil akun Anda": "내 계정 프로필",
  "Belum ada deskripsi room dari pemilik room.": "소유자가 아직 룸 설명을 추가하지 않았습니다.",
  "Peserta Live": "라이브 참가자",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "실제로 참여한 계정만 표시됩니다.",
  "Memuat peserta...": "참가자 로딩 중...",
  "Belum ada peserta lain.": "아직 다른 참가자가 없습니다.",
  "PESERTA": "참가자",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "아직 메시지가 없습니다. 이 룸에 첫 번째로 참여해 보세요.",
  "Tulis sebagai": "다음 이름으로 작성",
  "Belum ada peserta.": "참가자가 없습니다.",
  "Anda": "나",
  "Aksi live room gagal.": "라이브 룸 작업에 실패했습니다.",
  "Pesan gagal dikirim.": "메시지 전송에 실패했습니다.",
  "Like gagal dikirim.": "좋아요 전송에 실패했습니다."
},
  ar: {
  "Masuk untuk bergabung ke Live Room": "سجّل الدخول للانضمام إلى غرفة البث المباشر",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "لكل حساب ملف شخصي وهوية خاصة به داخل الغرفة.",
  "Room berhasil dibuat.": "تم إنشاء الغرفة بنجاح.",
  "Gagal membuat room.": "تعذر إنشاء الغرفة.",
  "Buat Live Room": "إنشاء غرفة بث مباشر",
  "Room ini belum dibuat oleh Official Streamer.": "لم ينشئ البث الرسمي هذه الغرفة بعد.",
  "Room belum tersedia": "الغرفة غير متاحة",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "هذه الغرفة غير متاحة بعد. أنشئها لتصبح مالكها.",
  "Judul Live Room": "عنوان غرفة البث المباشر",
  "Deskripsi room (opsional)": "وصف الغرفة (اختياري)",
  "MEMBUAT ROOM...": "جارٍ إنشاء الغرفة...",
  "BUAT ROOM": "إنشاء الغرفة",
  "Streaming belum aktif": "البث غير نشط",
  "Belum ada video live produksi pada room ini.": "لا يوجد بث مباشر إنتاجي في هذه الغرفة بعد.",
  "STREAMER CONTROL": "تحكم البث",
  "Streaming sedang berjalan": "البث قيد التشغيل",
  "Kirim video dari OBS ke server": "إرسال الفيديو من OBS إلى الخادم",
  "CHECK...": "جارٍ التحقق...",
  "CHECK STATUS": "التحقق من الحالة",
  "Status streaming gagal.": "تعذر التحقق من حالة البث.",
  "Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.": "في OBS اختر Settings → Stream → Service Custom وأدخل خادم RTMPS ومفتاح البث أعلاه.",
  "AKTIFKAN STREAMING": "تفعيل البث",
  "Buat Live Input Cloudflare untuk room ini.": "إنشاء Live Input من Cloudflare لهذه الغرفة.",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "بعد إنشائه، استخدم خادم RTMPS ومفتاح البث في OBS.",
  "KHUSUS PEMILIK ROOM": "لِمالك الغرفة فقط",
  "MEMBUAT...": "جارٍ الإنشاء...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "تم إنشاء Live Input. استخدم بيانات OBS أسفل الفيديو.",
  "Gagal membuat Live Input.": "تعذر إنشاء Live Input.",
  "Gagal terhubung ke streaming server.": "تعذر الاتصال بخادم البث.",
  "Profil akun Anda": "ملف حسابك",
  "Belum ada deskripsi room dari pemilik room.": "لم يضف المالك وصفاً للغرفة بعد.",
  "Peserta Live": "المشاركون في البث",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "تظهر فقط الحسابات التي انضمت فعلياً.",
  "Memuat peserta...": "جارٍ تحميل المشاركين...",
  "Belum ada peserta lain.": "لا يوجد مشاركون آخرون بعد.",
  "PESERTA": "المشاركون",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "لا توجد رسائل بعد. كن أول مستخدم يشارك في هذه الغرفة.",
  "Tulis sebagai": "اكتب باسم",
  "Belum ada peserta.": "لا يوجد مشاركون.",
  "Anda": "أنت",
  "Aksi live room gagal.": "فشل إجراء غرفة البث المباشر.",
  "Pesan gagal dikirim.": "تعذر إرسال الرسالة.",
  "Like gagal dikirim.": "تعذر إرسال الإعجاب."
}};

const LIVE_ROOM_COMMON_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    "LOGIN / REGISTER": "LOGIN / REGISTER","SYS STREAM Live": "SYS STREAM Live","LIVE": "LIVE",
    "Live": "Live","Chat": "Chat","Aksi live room gagal.": "Aksi live room gagal.","Status streaming gagal.": "Status streaming gagal."
  },
  en: {
    "LOGIN / REGISTER": "LOGIN / REGISTER","SYS STREAM Live": "SYS STREAM Live","LIVE": "LIVE",
    "Live": "Live","Chat": "Chat","Aksi live room gagal.": "Live room action failed.","Status streaming gagal.": "Failed to check streaming status."
  },
  es: {
    "LOGIN / REGISTER": "INICIAR SESIÓN / REGISTRARSE","SYS STREAM Live": "SYS STREAM Live","LIVE": "EN VIVO",
    "Live": "En vivo","Chat": "Chat","Aksi live room gagal.": "La acción de la sala en vivo falló.","Status streaming gagal.": "No se pudo comprobar el estado de la transmisión."
  },
  pt: {
    "LOGIN / REGISTER": "ENTRAR / REGISTRAR","SYS STREAM Live": "SYS STREAM Live","LIVE": "AO VIVO",
    "Live": "Ao vivo","Chat": "Chat","Aksi live room gagal.": "A ação da sala ao vivo falhou.","Status streaming gagal.": "Falha ao verificar o status da transmissão."
  },
  zh: {
    "LOGIN / REGISTER": "登录 / 注册","SYS STREAM Live": "SYS STREAM Live","LIVE": "直播",
    "Live": "直播","Chat": "聊天","Aksi live room gagal.": "直播间操作失败。","Status streaming gagal.": "检查直播状态失败。"
  },
  ja: {
    "LOGIN / REGISTER": "ログイン / 登録","SYS STREAM Live": "SYS STREAM Live","LIVE": "ライブ",
    "Live": "ライブ","Chat": "チャット","Aksi live room gagal.": "ライブ配信ルームの操作に失敗しました。","Status streaming gagal.": "配信ステータスの確認に失敗しました。"
  },
  ko: {
    "LOGIN / REGISTER": "로그인 / 회원가입","SYS STREAM Live": "SYS STREAM Live","LIVE": "라이브",
    "Live": "라이브","Chat": "채팅","Aksi live room gagal.": "라이브 룸 작업에 실패했습니다.","Status streaming gagal.": "스트리밍 상태 확인에 실패했습니다."
  },
  ar: {
    "LOGIN / REGISTER": "تسجيل الدخول / التسجيل","SYS STREAM Live": "SYS STREAM Live","LIVE": "مباشر",
    "Live": "مباشر","Chat": "دردشة","Aksi live room gagal.": "فشل إجراء غرفة البث المباشر.","Status streaming gagal.": "تعذر التحقق من حالة البث."
  }
};
for (const lang of Object.keys(LIVE_ROOM_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(LIVE_ROOM_TRANSLATIONS[lang], LIVE_ROOM_COMMON_TRANSLATIONS[lang]);
  Object.assign(translations[lang], LIVE_ROOM_TRANSLATIONS[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], LIVE_ROOM_TRANSLATIONS[lang]);
}


const TEBak_GAME_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.': 'Penonton mencoba menebak angka tersembunyi yang dipilih streamer. Game ini dibuat untuk interaksi live tanpa taruhan atau pembayaran.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle': 'Digit Kartu (Tepat 4 Digit) & Pengaturan Sembunyikan',
    'Serial No': 'No. Seri',
    'Digital Crypto Verification Code (4 Digits)': 'Kode Verifikasi Kripto Digital (4 Digit)',
    'Digit #': 'Digit #',
    'Challenge Successful! Verified code': 'Tantangan Berhasil! Kode terverifikasi',
    'All concealed digits matched!': 'Semua digit tersembunyi cocok!',
    'Prediction Missed. Secret Digits': 'Prediksi Tidak Cocok. Digit Rahasia',
    'Matched': 'Cocok',
    'The 4-digit code is tied to serial number': 'Kode 4 digit terkait dengan nomor seri',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.': 'Streamer menetapkan digit yang terlihat dan tersembunyi secara real-time. Penonton mencoba menebak digit yang disembunyikan. Tidak ada taruhan atau hadiah finansial dalam game ini.'
  },
  en: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.': 'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle': 'Card Digits (Exactly 4 Digits) & Conceal Toggle',
    'Serial No': 'Serial No',
    'Digital Crypto Verification Code (4 Digits)': 'Digital Crypto Verification Code (4 Digits)',
    'Digit #': 'Digit #',
    'Challenge Successful! Verified code': 'Challenge Successful! Verified code',
    'All concealed digits matched!': 'All concealed digits matched!',
    'Prediction Missed. Secret Digits': 'Prediction Missed. Secret Digits',
    'Matched': 'Matched',
    'The 4-digit code is tied to serial number': 'The 4-digit code is tied to serial number',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.': 'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.'
  },
  es: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.': 'Los espectadores intentan adivinar el número oculto elegido por el streamer. Este juego está diseñado para la interacción en vivo sin apuestas ni pagos.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle': 'Dígitos de la tarjeta (exactamente 4) y control de ocultación',
    'Serial No': 'N.º de serie',
    'Digital Crypto Verification Code (4 Digits)': 'Código de verificación criptográfico digital (4 dígitos)',
    'Digit #': 'Dígito n.º ',
    'Challenge Successful! Verified code': '¡Desafío completado! Código verificado',
    'All concealed digits matched!': '¡Todos los dígitos ocultos coinciden!',
    'Prediction Missed. Secret Digits': 'Predicción fallida. Dígitos secretos',
    'Matched': 'Coinciden',
    'The 4-digit code is tied to serial number': 'El código de 4 dígitos está vinculado al número de serie',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.': 'El streamer establece los dígitos visibles y ocultos en tiempo real. Los espectadores intentan adivinar los dígitos ocultos. No hay apuestas ni premios económicos en este juego.'
  },
  pt: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.': 'Os espectadores tentam adivinhar o número oculto escolhido pelo streamer. Este jogo foi criado para interação ao vivo sem apostas ou pagamentos.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle': 'Dígitos do cartão (exatamente 4) e controle de ocultação',
    'Serial No': 'Nº de série',
    'Digital Crypto Verification Code (4 Digits)': 'Código de verificação criptográfica digital (4 dígitos)',
    'Digit #': 'Dígito nº ',
    'Challenge Successful! Verified code': 'Desafio concluído! Código verificado',
    'All concealed digits matched!': 'Todos os dígitos ocultos coincidem!',
    'Prediction Missed. Secret Digits': 'Previsão incorreta. Dígitos secretos',
    'Matched': 'Correspondentes',
    'The 4-digit code is tied to serial number': 'O código de 4 dígitos está vinculado ao número de série',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.': 'O streamer define os dígitos visíveis e ocultos em tempo real. Os espectadores tentam adivinhar os dígitos ocultos. Não há apostas nem prêmios financeiros neste jogo.'
  },
  zh: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.': '观众尝试猜测主播选择的隐藏数字。本游戏仅用于直播互动，不涉及投注或付款。',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle': '卡片数字（恰好4位）和隐藏设置',
    'Serial No': '序列号：',
    'Digital Crypto Verification Code (4 Digits)': '数字加密验证代码（4位）',
    'Digit #': '数字 #',
    'Challenge Successful! Verified code': '挑战成功！验证代码：',
    'All concealed digits matched!': '所有隐藏数字均匹配！',
    'Prediction Missed. Secret Digits': '预测失败。秘密数字：',
    'Matched': '匹配',
    'The 4-digit code is tied to serial number': '4位代码与序列号绑定',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.': '主播实时设置可见和隐藏数字。观众尝试猜测隐藏数字。本游戏不涉及投注或现金奖励。'
  },
  ja: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.': '視聴者はストリーマーが選んだ隠し数字を予想します。このゲームは賭けや支払いを伴わないライブ交流向けです。',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle': 'カードの数字（4桁）と非表示設定',
    'Serial No': 'シリアル番号：',
    'Digital Crypto Verification Code (4 Digits)': 'デジタル暗号検証コード（4桁）',
    'Digit #': '数字 #',
    'Challenge Successful! Verified code': 'チャレンジ成功！検証コード：',
    'All concealed digits matched!': 'すべての非表示数字が一致しました！',
    'Prediction Missed. Secret Digits': '予想不一致。秘密の数字：',
    'Matched': '一致',
    'The 4-digit code is tied to serial number': '4桁コードはシリアル番号に紐付いています',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.': 'ストリーマーが表示・非表示の数字をリアルタイムで設定します。視聴者は非表示の数字を予想します。このゲームに賭けや金銭的な賞金はありません。'
  },
  ko: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.': '시청자는 스트리머가 선택한 숨겨진 숫자를 맞혀 봅니다. 이 게임은 베팅이나 결제 없이 라이브 상호작용을 위해 만들어졌습니다.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle': '카드 숫자(정확히 4자리) 및 숨김 설정',
    'Serial No': '일련번호',
    'Digital Crypto Verification Code (4 Digits)': '디지털 암호 검증 코드(4자리)',
    'Digit #': '숫자 #',
    'Challenge Successful! Verified code': '챌린지 성공! 확인된 코드',
    'All concealed digits matched!': '모든 숨겨진 숫자가 일치합니다!',
    'Prediction Missed. Secret Digits': '예측 실패. 비밀 숫자',
    'Matched': '일치',
    'The 4-digit code is tied to serial number': '4자리 코드는 일련번호에 연결됩니다',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.': '스트리머가 표시 및 숨김 숫자를 실시간으로 설정합니다. 시청자는 숨겨진 숫자를 맞힙니다. 이 게임에는 베팅이나 금전적 보상이 없습니다.'
  },
  ar: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.': 'يحاول المشاهدون تخمين الرقم المخفي الذي يختاره مقدم البث. صُممت هذه اللعبة للتفاعل المباشر دون مراهنات أو مدفوعات.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle': 'أرقام البطاقة (4 أرقام بالضبط) وإعداد الإخفاء',
    'Serial No': 'الرقم التسلسلي',
    'Digital Crypto Verification Code (4 Digits)': 'رمز التحقق الرقمي المشفر (4 أرقام)',
    'Digit #': 'الرقم #',
    'Challenge Successful! Verified code': 'نجح التحدي! الرمز المتحقق منه',
    'All concealed digits matched!': 'تطابقت جميع الأرقام المخفية!',
    'Prediction Missed. Secret Digits': 'فشل التخمين. الأرقام السرية',
    'Matched': 'المتطابق',
    'The 4-digit code is tied to serial number': 'يرتبط الرمز المكون من 4 أرقام بالرقم التسلسلي',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.': 'يحدد مقدم البث الأرقام الظاهرة والمخفية في الوقت الفعلي. يحاول المشاهدون تخمين الأرقام المخفية. لا توجد مراهنات أو جوائز مالية في هذه اللعبة.'
  }
};

for (const lang of Object.keys(TEBak_GAME_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], TEBak_GAME_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...TEBak_GAME_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}


const TEBak_FREE_PLAY_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Streamer & Viewer Interaction — Free to Play': 'Interaksi Streamer & Penonton — Gratis untuk Dimainkan',
    'Mode Interaksi': 'Mode Interaksi',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': 'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.',
    'Guess the 2 middle hidden digits! High payout on exact match.': 'Tebak 2 digit tersembunyi di tengah! Hadiah tinggi untuk tebakan yang tepat.'
  },
  en: {
    'Streamer & Viewer Interaction — Free to Play': 'Streamer & Viewer Interaction — Free to Play',
    'Mode Interaksi': 'Interaction Mode',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': 'This game is exclusively for streamer and viewer interaction. No coins, balance, deposits, locks, bets, or payments are required to play.',
    'Guess the 2 middle hidden digits! High payout on exact match.': 'Guess the 2 middle hidden digits! High payout on exact match.'
  },
  es: {
    'Streamer & Viewer Interaction — Free to Play': 'Interacción entre Streamer y Espectadores — Gratis',
    'Mode Interaksi': 'Modo de interacción',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': 'Este juego es exclusivamente para la interacción entre el streamer y los espectadores. No requiere monedas, saldo, depósitos, bloqueos, apuestas ni pagos para jugar.',
    'Guess the 2 middle hidden digits! High payout on exact match.': '¡Adivina los 2 dígitos ocultos del medio! Gran premio por acertar exactamente.'
  },
  pt: {
    'Streamer & Viewer Interaction — Free to Play': 'Interação entre Streamer e Espectadores — Grátis',
    'Mode Interaksi': 'Modo de interação',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': 'Este jogo é exclusivamente para interação entre streamer e espectadores. Não requer moedas, saldo, depósitos, bloqueios, apostas ou pagamentos para jogar.',
    'Guess the 2 middle hidden digits! High payout on exact match.': 'Adivinhe os 2 dígitos ocultos do meio! Grande prêmio ao acertar exatamente.'
  },
  zh: {
    'Streamer & Viewer Interaction — Free to Play': '主播与观众互动 — 免费参与',
    'Mode Interaksi': '互动模式',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': '本游戏仅用于主播与观众互动。参与游戏无需金币、余额、充值、锁定、投注或付款。',
    'Guess the 2 middle hidden digits! High payout on exact match.': '猜出中间隐藏的2位数字！完全匹配可获得高额奖励。'
  },
  ja: {
    'Streamer & Viewer Interaction — Free to Play': 'ストリーマーと視聴者の交流 — 無料プレイ',
    'Mode Interaksi': 'インタラクションモード',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': 'このゲームはストリーマーと視聴者の交流専用です。プレイにコイン、残高、入金、ロック、賭け、支払いは必要ありません。',
    'Guess the 2 middle hidden digits! High payout on exact match.': '中央の隠された2桁を当てよう！完全一致で高い報酬を獲得できます。'
  },
  ko: {
    'Streamer & Viewer Interaction — Free to Play': '스트리머 & 시청자 상호작용 — 무료 플레이',
    'Mode Interaksi': '상호작용 모드',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': '이 게임은 스트리머와 시청자의 상호작용을 위한 게임입니다. 플레이에 코인, 잔액, 입금, 락, 베팅 또는 결제가 필요하지 않습니다.',
    'Guess the 2 middle hidden digits! High payout on exact match.': '가운데 숨겨진 2자리를 맞혀보세요! 정확히 맞히면 높은 보상을 받을 수 있습니다.'
  },
  ar: {
    'Streamer & Viewer Interaction — Free to Play': 'تفاعل مقدم البث والمشاهدين — لعب مجاني',
    'Mode Interaksi': 'وضع التفاعل',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': 'هذه اللعبة مخصصة لتفاعل مقدم البث مع المشاهدين. لا تتطلب عملات أو رصيدًا أو إيداعًا أو قفلًا أو مراهنات أو مدفوعات للعب.',
    'Guess the 2 middle hidden digits! High payout on exact match.': 'خمن الرقمين المخفيين في المنتصف! مكافأة عالية عند التطابق التام.'
  }
};

for (const lang of Object.keys(TEBak_FREE_PLAY_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], TEBak_FREE_PLAY_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...TEBak_FREE_PLAY_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    /*
     * Language is explicitly controlled by SYS STREAM.
     * Never auto-switch from navigator.language: browser preferences can otherwise
     * change the UI language and create mixed-language screens during screening.
     * English is the fixed default until the user selects another supported language.
     */
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

    const translateValue = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || trimmed.length > 240) return value;
      /*
       * Translate only from the original source text captured for this node.
       * Do not reverse-map another language back into a source key: identical
       * labels such as "Live", "Profile", or "Chat" can exist in multiple
       * languages and reverse mapping causes cross-language contamination.
       */
      const source = trimmed;
      const translated = dict[source] || translations[language][source];
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
      const raw = textNode.nodeValue || ': ';
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
        const translated = dict[key] || translations[language][key];
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
    /*
     * Selected language is authoritative. English is the only intentional
     * fallback for missing keys; browser locale is never consulted.
     */
    t: (key: string) => {
      const selected = translations[language][key] ?? PAGE_UI_TRANSLATIONS[language]?.[key];
      if (selected !== undefined) return selected;
      if (import.meta.env?.DEV) {
        console.warn(`[SYS STREAM i18n] Missing ${language} translation for: ${key}`);
      }
      return translations.en[key] ?? PAGE_UI_TRANSLATIONS.en?.[key] ?? key;
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}

import { FOOTER_ABOUT_TRANSLATIONS, STREAMER_FOOTER_TRANSLATIONS } from './components/streamer/streamerTranslations';

for (const lang of Object.keys(FOOTER_ABOUT_TRANSLATIONS) as LanguageCode[]) Object.assign(translations[lang], FOOTER_ABOUT_TRANSLATIONS[lang]);
for (const lang of Object.keys(STREAMER_FOOTER_TRANSLATIONS) as LanguageCode[]) Object.assign(translations[lang], STREAMER_FOOTER_TRANSLATIONS[lang]);

// Additional user-facing Indonesian strings. Admin/Owner UI is intentionally excluded.
Object.assign(translations.id, {
  'Alamat wallet akun. Recovery phrase tidak disimpan di server.': 'Alamat wallet akun. Recovery phrase tidak disimpan di server.',
  'Available Today': 'Tersedia Hari Ini',
  'Deposit confirmed': 'Deposit berhasil dikonfirmasi',
  'EVM wallet tidak ditemukan. Install MetaMask atau wallet EVM yang kompatibel.': 'Wallet EVM tidak ditemukan. Instal MetaMask atau wallet EVM yang kompatibel.',
  'Gagal membuat challenge wallet.': 'Gagal membuat challenge wallet.',
  'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.': 'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.',
  'Gold Coins': 'Koin Gold',
  'Guest': 'Tamu',
  'Halo': 'Halo',
  'Hidden': 'Tersembunyi',
  'LOCK': 'KUNCI',
  'LOCKED': 'TERKUNCI',
  'Left': 'Tersisa',
  'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Siaran langsung, komunitas, dan postingan pengguna SYS STREAM.',
  'Lock minimum': 'Minimum Lock',
  'Lock saldo untuk mendapatkan hak claim Blind Box harian': 'Kunci saldo untuk mendapatkan hak klaim Blind Box harian',
  'Login wallet gagal.': 'Login wallet gagal.',
  'NOWPayments minimum for this network': 'Minimum NOWPayments untuk jaringan ini',
  'Open Daily Box': 'Buka Daily Box',
  'Payment creation failed': 'Pembuatan pembayaran gagal',
  'Platform minimum': 'Minimum platform',
  'Players invited by your Tier 1 direct referees.': 'Pemain yang diundang oleh referral langsung Tier 1 Anda.',
  'Players invited down the tree by your Tier 2 network.': 'Pemain yang diundang melalui jaringan Tier 2 Anda.',
  'Players who register directly via your personal link or referral code.': 'Pemain yang mendaftar langsung melalui link atau kode referral Anda.',
  'Quota resets in': 'Kuota direset dalam',
  'REMAINING': 'TERSISA',
  'Rate and minimum are checked live by NOWPayments when the payment is created.': 'Rate dan minimum diperiksa secara langsung oleh NOWPayments saat pembayaran dibuat.',
  'Room': 'Room',
  'Selected Winner': 'Pemenang Terpilih',
  'Spin Raffle Wheel': 'Putar Roda Raffle',
  'Streamer & Viewer Interaction — Free to Play': 'Interaksi Streamer & Penonton — Gratis untuk Bermain',
  'Tidak ada video atau streamer contoh. Tampilan ini hanya menampilkan data live yang benar-benar berasal dari room produksi.': 'Tidak ada video atau streamer contoh. Tampilan ini hanya menampilkan data live yang benar-benar berasal dari room produksi.',
  'UNLOCKED': 'TERBUKA',
  'Unboxing': 'Buka Kotak',
  'Use NOWPayments minimum': 'Gunakan minimum NOWPayments',
  'User': 'Pengguna',
  'Verifikasi tanda tangan wallet gagal.': 'Verifikasi tanda tangan wallet gagal.',
  'Viewers': 'Penonton',
  'Visible': 'Terlihat',
  'Your account balance has been updated.': 'Saldo akun Anda telah diperbarui.',
  'aktif': 'aktif',
  'to activate': 'untuk mengaktifkan'
});


/* Translation-only audit patch: user-facing hardcoded labels/messages.
   No application logic, routes, data, API, styling, or behavior is changed. */
const DASHBOARD_TAGLINE_TRANSLATIONS: Record<LanguageCode, string> = {
  id: "Siaran langsung, komunitas, dan postingan pengguna SYS STREAM.",
  en: "Live streams, communities, and posts from SYS STREAM users.",
  es: "Transmisiones en vivo, comunidades y publicaciones de usuarios de SYS STREAM.",
  pt: "Transmissões ao vivo, comunidades e publicações de usuários do SYS STREAM.",
  zh: "SYS STREAM 用户的直播、社区和帖子。",
  ja: "SYS STREAM ユーザーのライブ配信、コミュニティ、投稿。",
  ko: "SYS STREAM 사용자의 라이브 방송, 커뮤니티, 게시물입니다.",
  ar: "البث المباشر والمجتمع ومنشورات مستخدمي SYS STREAM."
};

for (const lang of Object.keys(DASHBOARD_TAGLINE_TRANSLATIONS) as LanguageCode[]) {
  translations[lang]["Dashboard community tagline"] = DASHBOARD_TAGLINE_TRANSLATIONS[lang];
}

const TRANSLATION_ONLY_USER_AUDIT: Record<LanguageCode, Record<string, string>> = {
  id: {
    "SYS STREAM LOADING": "SYS STREAM sedang dimuat",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "Menyiapkan sinkronisasi TikTok Live + koneksi Cloudflare D1",
    "Mining SYS dari Blind Box Lock": "Mining SYS dari Blind Box Lock",
    "Verify your email": "Verifikasi email Anda",
    "Privacy Policy": "Kebijakan Privasi",
    "Membuka SYS STREAM Airdrop...": "Membuka Airdrop SYS STREAM...",
    "Aplikasi gagal dimuat": "Aplikasi gagal dimuat",
    "Loading...": "Memuat...",
    "Mining": "Mining",
    "Wallet": "Wallet",
    "Menu": "Menu",
    "Masuk Akun SYS Utama": "Masuk ke Akun Utama SYS",
    "Menu Blind Box 3D": "Menu Blind Box 3D",
    "Pengaturan Akun & Dompet Game": "Pengaturan Akun & Dompet Game",
    "Keluar Akun": "Keluar Akun",
    "Masuk untuk Mulai Main Blind Box": "Masuk untuk mulai bermain Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!": "Anda sudah mengklaim Blind Box hari ini!",
    "Status Deposit Aktif": "Status Deposit Aktif",
    "Buka Kunci": "Buka Kunci",
    "Masa Kunci Berjalan": "Masa Kunci Berjalan",
    "Opsi Buka Kunci Saldo": "Opsi Buka Kunci Saldo",
    "Min. 50 Ribu": "Min. 50 Ribu",
    "Nominal minimal deposit adalah Rp 50.000!": "Nominal minimal deposit adalah Rp 50.000!",
    "Processing...": "Memproses...",
    "Claim Bonus": "Klaim Bonus",
    "Locked Balance": "Saldo Terkunci",
    "Remove": "Hapus",
    "Selected Winner": "Pemenang Terpilih",
    "Spin Raffle Wheel": "Putar Roda Undian",
    "Viewer Username Raffle Spinner": "Spinner Undian Username Penonton",
    "Live Participants Only": "Hanya Peserta Live",
    "Spinning for Winner...": "Memutar untuk menentukan pemenang...",
    "Recent Raffle Winners": "Pemenang Undian Terbaru",
    "Digital Crypto Card Number Guess": "Tebak Nomor Kartu Kripto",
    "Max 4": "Maks. 4",
    "Concealed": "Tersembunyi",
    "Streamer Card Settings": "Pengaturan Kartu Streamer",
    "Hidden": "Tersembunyi",
    "Visible": "Terlihat",
    "Serial Number": "Nomor Seri",
    "Withdrawal": "Penarikan",
    "Minimum withdrawal is": "Penarikan minimum adalah"
  },
  en: {
    "SYS STREAM LOADING": "SYS STREAM loading",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "Initializing TikTok Live Sync + Cloudflare D1 Connection",
    "Mining SYS dari Blind Box Lock": "Mine SYS from Blind Box Lock",
    "Verify your email": "Verify your email",
    "Privacy Policy": "Privacy Policy",
    "Membuka SYS STREAM Airdrop...": "Opening SYS STREAM Airdrop...",
    "Aplikasi gagal dimuat": "The application failed to load",
    "Loading...": "Loading...",
    "Mining": "Mining",
    "Wallet": "Wallet",
    "Menu": "Menu",
    "Masuk Akun SYS Utama": "Sign in to the main SYS account",
    "Menu Blind Box 3D": "Blind Box 3D Menu",
    "Pengaturan Akun & Dompet Game": "Game Account & Wallet Settings",
    "Keluar Akun": "Log Out",
    "Masuk untuk Mulai Main Blind Box": "Sign in to start playing Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!": "You have already claimed today's Blind Box!",
    "Status Deposit Aktif": "Active Deposit Status",
    "Buka Kunci": "Unlock",
    "Masa Kunci Berjalan": "Lock Period in Progress",
    "Opsi Buka Kunci Saldo": "Balance Unlock Options",
    "Min. 50 Ribu": "Min. 50 Thousand",
    "Nominal minimal deposit adalah Rp 50.000!": "The minimum deposit amount is Rp 50,000!",
    "Processing...": "Processing...",
    "Claim Bonus": "Claim Bonus",
    "Locked Balance": "Locked Balance",
    "Remove": "Remove",
    "Selected Winner": "Selected Winner",
    "Spin Raffle Wheel": "Spin Raffle Wheel",
    "Viewer Username Raffle Spinner": "Viewer Username Raffle Spinner",
    "Live Participants Only": "Live Participants Only",
    "Spinning for Winner...": "Spinning for Winner...",
    "Recent Raffle Winners": "Recent Raffle Winners",
    "Digital Crypto Card Number Guess": "Digital Crypto Card Number Guess",
    "Max 4": "Max 4",
    "Concealed": "Concealed",
    "Streamer Card Settings": "Streamer Card Settings",
    "Hidden": "Hidden",
    "Visible": "Visible",
    "Serial Number": "Serial Number",
    "Withdrawal": "Withdrawal",
    "Minimum withdrawal is": "Minimum withdrawal is"
  },
  es: {
    "SYS STREAM LOADING": "Cargando SYS STREAM",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "Inicializando la sincronización de TikTok Live + conexión Cloudflare D1",
    "Mining SYS dari Blind Box Lock": "Minar SYS con Blind Box Lock",
    "Verify your email": "Verifica tu correo electrónico",
    "Privacy Policy": "Política de privacidad",
    "Membuka SYS STREAM Airdrop...": "Abriendo el Airdrop de SYS STREAM...",
    "Aplikasi gagal dimuat": "No se pudo cargar la aplicación",
    "Loading...": "Cargando...",
    "Mining": "Minería",
    "Wallet": "Wallet",
    "Menu": "Menú",
    "Masuk Akun SYS Utama": "Iniciar sesión en la cuenta principal de SYS",
    "Menu Blind Box 3D": "Menú Blind Box 3D",
    "Pengaturan Akun & Dompet Game": "Configuración de cuenta y wallet del juego",
    "Keluar Akun": "Cerrar sesión",
    "Masuk untuk Mulai Main Blind Box": "Inicia sesión para jugar a Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!": "¡Ya has reclamado el Blind Box de hoy!",
    "Status Deposit Aktif": "Estado del depósito activo",
    "Buka Kunci": "Desbloquear",
    "Masa Kunci Berjalan": "Periodo de bloqueo en curso",
    "Opsi Buka Kunci Saldo": "Opciones para desbloquear el saldo",
    "Min. 50 Ribu": "Mín. 50 mil",
    "Nominal minimal deposit adalah Rp 50.000!": "El depósito mínimo es de Rp 50.000.",
    "Processing...": "Procesando...",
    "Claim Bonus": "Reclamar bono",
    "Locked Balance": "Saldo bloqueado",
    "Remove": "Eliminar",
    "Selected Winner": "Ganador seleccionado",
    "Spin Raffle Wheel": "Girar la ruleta",
    "Viewer Username Raffle Spinner": "Ruleta de nombres de espectadores",
    "Live Participants Only": "Solo participantes en vivo",
    "Spinning for Winner...": "Girando para elegir al ganador...",
    "Recent Raffle Winners": "Ganadores recientes",
    "Digital Crypto Card Number Guess": "Adivina el número de tarjeta cripto",
    "Max 4": "Máx. 4",
    "Concealed": "Oculto",
    "Streamer Card Settings": "Configuración de tarjeta del streamer",
    "Hidden": "Oculto",
    "Visible": "Visible",
    "Serial Number": "Número de serie",
    "Withdrawal": "Retiro",
    "Minimum withdrawal is": "El retiro mínimo es"
  },
  pt: {
    "SYS STREAM LOADING": "Carregando SYS STREAM",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "Inicializando a sincronização do TikTok Live + conexão Cloudflare D1",
    "Mining SYS dari Blind Box Lock": "Minerar SYS com Blind Box Lock",
    "Verify your email": "Verifique seu e-mail",
    "Privacy Policy": "Política de Privacidade",
    "Membuka SYS STREAM Airdrop...": "Abrindo o Airdrop SYS STREAM...",
    "Aplikasi gagal dimuat": "Falha ao carregar o aplicativo",
    "Loading...": "Carregando...",
    "Mining": "Mineração",
    "Wallet": "Carteira",
    "Menu": "Menu",
    "Masuk Akun SYS Utama": "Entrar na conta principal SYS",
    "Menu Blind Box 3D": "Menu Blind Box 3D",
    "Pengaturan Akun & Dompet Game": "Configurações da conta e carteira do jogo",
    "Keluar Akun": "Sair",
    "Masuk untuk Mulai Main Blind Box": "Entre para começar a jogar Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!": "Você já resgatou o Blind Box de hoje!",
    "Status Deposit Aktif": "Status do depósito ativo",
    "Buka Kunci": "Desbloquear",
    "Masa Kunci Berjalan": "Período de bloqueio em andamento",
    "Opsi Buka Kunci Saldo": "Opções para desbloquear o saldo",
    "Min. 50 Ribu": "Mín. 50 mil",
    "Nominal minimal deposit adalah Rp 50.000!": "O depósito mínimo é de Rp 50.000!",
    "Processing...": "Processando...",
    "Claim Bonus": "Resgatar bônus",
    "Locked Balance": "Saldo bloqueado",
    "Remove": "Remover",
    "Selected Winner": "Vencedor selecionado",
    "Spin Raffle Wheel": "Girar a roleta",
    "Viewer Username Raffle Spinner": "Roleta de nomes dos espectadores",
    "Live Participants Only": "Somente participantes ao vivo",
    "Spinning for Winner...": "Girando para escolher o vencedor...",
    "Recent Raffle Winners": "Vencedores recentes",
    "Digital Crypto Card Number Guess": "Adivinhe o número do cartão cripto",
    "Max 4": "Máx. 4",
    "Concealed": "Oculto",
    "Streamer Card Settings": "Configurações do cartão do streamer",
    "Hidden": "Oculto",
    "Visible": "Visível",
    "Serial Number": "Número de série",
    "Withdrawal": "Saque",
    "Minimum withdrawal is": "O saque mínimo é"
  },
  zh: {
    "SYS STREAM LOADING": "正在加载 SYS STREAM",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "正在初始化 TikTok Live 同步和 Cloudflare D1 连接",
    "Mining SYS dari Blind Box Lock": "通过 Blind Box Lock 挖矿 SYS",
    "Verify your email": "验证您的邮箱",
    "Privacy Policy": "隐私政策",
    "Membuka SYS STREAM Airdrop...": "正在打开 SYS STREAM 空投...",
    "Aplikasi gagal dimuat": "应用加载失败",
    "Loading...": "加载中...",
    "Mining": "挖矿",
    "Wallet": "钱包",
    "Menu": "菜单",
    "Masuk Akun SYS Utama": "登录 SYS 主账户",
    "Menu Blind Box 3D": "Blind Box 3D 菜单",
    "Pengaturan Akun & Dompet Game": "游戏账户和钱包设置",
    "Keluar Akun": "退出登录",
    "Masuk untuk Mulai Main Blind Box": "登录后开始玩 Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!": "您今天已经领取过 Blind Box！",
    "Status Deposit Aktif": "有效充值状态",
    "Buka Kunci": "解锁",
    "Masa Kunci Berjalan": "锁定期限进行中",
    "Opsi Buka Kunci Saldo": "余额解锁选项：",
    "Min. 50 Ribu": "最低 5 万",
    "Nominal minimal deposit adalah Rp 50.000!": "最低充值金额为 Rp 50,000！",
    "Processing...": "处理中...",
    "Claim Bonus": "领取奖励",
    "Locked Balance": "锁定余额",
    "Remove": "移除",
    "Selected Winner": "选中的获胜者",
    "Spin Raffle Wheel": "旋转抽奖转盘",
    "Viewer Username Raffle Spinner": "观众用户名抽奖转盘",
    "Live Participants Only": "仅限直播参与者",
    "Spinning for Winner...": "正在旋转选择获胜者...",
    "Recent Raffle Winners": "近期抽奖获胜者",
    "Digital Crypto Card Number Guess": "数字加密卡号码竞猜",
    "Max 4": "最多 4",
    "Concealed": "隐藏",
    "Streamer Card Settings": "主播卡片设置",
    "Hidden": "隐藏",
    "Visible": "可见",
    "Serial Number": "序列号",
    "Withdrawal": "提现",
    "Minimum withdrawal is": "最低提现金额为"
  },
  ja: {
    "SYS STREAM LOADING": "SYS STREAMを読み込み中",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "TikTok Live同期とCloudflare D1接続を初期化中",
    "Mining SYS dari Blind Box Lock": "Blind Box LockでSYSをマイニング",
    "Verify your email": "メールアドレスを確認してください",
    "Privacy Policy": "プライバシーポリシー",
    "Membuka SYS STREAM Airdrop...": "SYS STREAM Airdropを開いています...",
    "Aplikasi gagal dimuat": "アプリの読み込みに失敗しました",
    "Loading...": "読み込み中...",
    "Mining": "マイニング",
    "Wallet": "ウォレット",
    "Menu": "メニュー",
    "Masuk Akun SYS Utama": "SYSメインアカウントにログイン",
    "Menu Blind Box 3D": "Blind Box 3Dメニュー",
    "Pengaturan Akun & Dompet Game": "ゲームアカウントとウォレット設定",
    "Keluar Akun": "ログアウト",
    "Masuk untuk Mulai Main Blind Box": "ログインしてBlind Boxを開始",
    "Anda Sudah Mengklaim Blind Box Hari Ini!": "本日のBlind Boxはすでに受け取り済みです！",
    "Status Deposit Aktif": "有効な入金ステータス",
    "Buka Kunci": "ロック解除",
    "Masa Kunci Berjalan": "ロック期間進行中",
    "Opsi Buka Kunci Saldo": "残高ロック解除オプション：",
    "Min. 50 Ribu": "最低5万",
    "Nominal minimal deposit adalah Rp 50.000!": "最低入金額はRp 50,000です！",
    "Processing...": "処理中...",
    "Claim Bonus": "ボーナスを受け取る",
    "Locked Balance": "ロック残高",
    "Remove": "削除",
    "Selected Winner": "選ばれた当選者",
    "Spin Raffle Wheel": "抽選ホイールを回す",
    "Viewer Username Raffle Spinner": "視聴者ユーザー名抽選スピナー",
    "Live Participants Only": "ライブ参加者のみ",
    "Spinning for Winner...": "当選者を選ぶために回転中...",
    "Recent Raffle Winners": "最近の抽選当選者",
    "Digital Crypto Card Number Guess": "デジタル暗号カード番号当て",
    "Max 4": "最大4",
    "Concealed": "非表示",
    "Streamer Card Settings": "ストリーマーカード設定",
    "Hidden": "非表示",
    "Visible": "表示",
    "Serial Number": "シリアル番号",
    "Withdrawal": "出金",
    "Minimum withdrawal is": "最低出金額は"
  },
  ko: {
    "SYS STREAM LOADING": "SYS STREAM 로딩 중",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "TikTok Live 동기화 및 Cloudflare D1 연결 초기화 중",
    "Mining SYS dari Blind Box Lock": "Blind Box Lock으로 SYS 채굴",
    "Verify your email": "이메일을 인증하세요",
    "Privacy Policy": "개인정보 처리방침",
    "Membuka SYS STREAM Airdrop...": "SYS STREAM 에어드롭을 여는 중...",
    "Aplikasi gagal dimuat": "앱을 불러오지 못했습니다",
    "Loading...": "로딩 중...",
    "Mining": "채굴",
    "Wallet": "지갑",
    "Menu": "메뉴",
    "Masuk Akun SYS Utama": "SYS 기본 계정 로그인",
    "Menu Blind Box 3D": "Blind Box 3D 메뉴",
    "Pengaturan Akun & Dompet Game": "게임 계정 및 지갑 설정",
    "Keluar Akun": "로그아웃",
    "Masuk untuk Mulai Main Blind Box": "로그인하여 Blind Box 시작",
    "Anda Sudah Mengklaim Blind Box Hari Ini!": "오늘의 Blind Box를 이미 수령했습니다!",
    "Status Deposit Aktif": "활성 예치금 상태",
    "Buka Kunci": "잠금 해제",
    "Masa Kunci Berjalan": "잠금 기간 진행 중",
    "Opsi Buka Kunci Saldo": "잔액 잠금 해제 옵션",
    "Min. 50 Ribu": "최소 5만",
    "Nominal minimal deposit adalah Rp 50.000!": "최소 예치 금액은 Rp 50,000입니다!",
    "Processing...": "처리 중...",
    "Claim Bonus": "보너스 받기",
    "Locked Balance": "잠금 잔액",
    "Remove": "삭제",
    "Selected Winner": "선정된 당첨자",
    "Spin Raffle Wheel": "추첨 휠 돌리기",
    "Viewer Username Raffle Spinner": "시청자 사용자명 추첨 스피너",
    "Live Participants Only": "라이브 참가자만",
    "Spinning for Winner...": "당첨자를 선택하는 중...",
    "Recent Raffle Winners": "최근 추첨 당첨자",
    "Digital Crypto Card Number Guess": "디지털 암호 카드 번호 맞히기",
    "Max 4": "최대 4",
    "Concealed": "숨김",
    "Streamer Card Settings": "스트리머 카드 설정",
    "Hidden": "숨김",
    "Visible": "표시",
    "Serial Number": "일련 번호",
    "Withdrawal": "출금",
    "Minimum withdrawal is": "최소 출금액은"
  },
  ar: {
    "SYS STREAM LOADING": "جارٍ تحميل SYS STREAM",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "جارٍ تهيئة مزامنة TikTok Live واتصال Cloudflare D1",
    "Mining SYS dari Blind Box Lock": "تعدين SYS عبر Blind Box Lock",
    "Verify your email": "تحقق من بريدك الإلكتروني",
    "Privacy Policy": "سياسة الخصوصية",
    "Membuka SYS STREAM Airdrop...": "جارٍ فتح إيردروب SYS STREAM...",
    "Aplikasi gagal dimuat": "تعذر تحميل التطبيق",
    "Loading...": "جارٍ التحميل...",
    "Mining": "التعدين",
    "Wallet": "المحفظة",
    "Menu": "القائمة",
    "Masuk Akun SYS Utama": "تسجيل الدخول إلى حساب SYS الرئيسي",
    "Menu Blind Box 3D": "قائمة Blind Box 3D",
    "Pengaturan Akun & Dompet Game": "إعدادات حساب اللعبة والمحفظة",
    "Keluar Akun": "تسجيل الخروج",
    "Masuk untuk Mulai Main Blind Box": "سجّل الدخول لبدء لعب Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!": "لقد استلمت Blind Box اليوم بالفعل!",
    "Status Deposit Aktif": "حالة الإيداع النشط",
    "Buka Kunci": "فتح القفل",
    "Masa Kunci Berjalan": "فترة القفل جارية",
    "Opsi Buka Kunci Saldo": "خيارات فتح قفل الرصيد",
    "Min. 50 Ribu": "الحد الأدنى 50 ألف",
    "Nominal minimal deposit adalah Rp 50.000!": "الحد الأدنى للإيداع هو Rp 50,000!",
    "Processing...": "جارٍ المعالجة...",
    "Claim Bonus": "استلام المكافأة",
    "Locked Balance": "الرصيد المقفل",
    "Remove": "إزالة",
    "Selected Winner": "الفائز المختار",
    "Spin Raffle Wheel": "تدوير عجلة السحب",
    "Viewer Username Raffle Spinner": "عجلة سحب أسماء المشاهدين",
    "Live Participants Only": "المشاركون المباشرون فقط",
    "Spinning for Winner...": "جارٍ تدوير العجلة لاختيار الفائز...",
    "Recent Raffle Winners": "الفائزون الأخيرون في السحب",
    "Digital Crypto Card Number Guess": "تخمين رقم بطاقة العملات الرقمية",
    "Max 4": "الحد الأقصى 4",
    "Concealed": "مخفي",
    "Streamer Card Settings": "إعدادات بطاقة الستريمر",
    "Hidden": "مخفي",
    "Visible": "ظاهر",
    "Serial Number": "الرقم التسلسلي",
    "Withdrawal": "السحب",
    "Minimum withdrawal is": "الحد الأدنى للسحب هو"
  }
};


/*
 * Translation corrections only.
 * This block intentionally changes display text only.
 * No application logic, routes, data, API, styling, or behavior is changed.
 */
const TRANSLATION_CORRECTIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    "Mining SYS dari Blind Box Lock": "Menambang SYS dari Blind Box Lock",
    "Mining": "Penambangan",
    "Wallet": "Dompet",
    "Menu": "Menu",
    "Processing...": "Memproses...",
    "Claim Bonus": "Klaim Bonus",
    "Locked Balance": "Saldo Terkunci",
    "Remove": "Hapus",
    "Selected Winner": "Pemenang Terpilih",
    "Spin Raffle Wheel": "Putar Roda Undian",
    "Viewer Username Raffle Spinner": "Spinner Undian Nama Penonton",
    "Live Participants Only": "Hanya Peserta Live",
    "Spinning for Winner...": "Sedang memilih pemenang...",
    "Recent Raffle Winners": "Pemenang Undian Terbaru",
    "Digital Crypto Card Number Guess": "Tebak Nomor Kartu Kripto Digital",
    "Max 4": "Maks. 4",
    "Concealed": "Tersembunyi",
    "Streamer Card Settings": "Pengaturan Kartu Streamer",
    "Hidden": "Tersembunyi",
    "Visible": "Terlihat",
    "Serial Number": "Nomor Seri",
    "Withdrawal": "Penarikan",
    "Minimum withdrawal is": "Penarikan minimum adalah",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "Menyiapkan Sinkronisasi TikTok Live + Koneksi Cloudflare D1",
    "Verify your email": "Verifikasi email Anda",
    "Privacy Policy": "Kebijakan Privasi",
    "Loading...": "Memuat...",
    "Aplikasi gagal dimuat": "Aplikasi gagal dimuat",
    "Wallet Identity": "Identitas Dompet",
    "Wallet Connected": "Dompet Terhubung",
    "Connect Wallet": "Hubungkan Dompet",
    "Register Now": "Daftar Sekarang",
    "Remember me": "Ingat saya",
    "Forgot Password?": "Lupa Kata Sandi?",
    "Sign in to continue streaming and gaming": "Masuk untuk melanjutkan streaming dan bermain",
    "LOGIN / REGISTER": "MASUK / DAFTAR",
    "CHAT": "OBROLAN",
    "PESERTA": "PESERTA",
    "WIN": "MENANG",
    "Reward": "Hadiah",
    "Status": "Status",
    "Terms & Conditions": "Syarat & Ketentuan"
  },
  en: {},
  es: {
    "Mining SYS dari Blind Box Lock": "Minar SYS con Blind Box Lock",
    "Mining": "Minería",
    "Wallet": "Billetera",
    "Menu": "Menú",
    "Processing...": "Procesando...",
    "Claim Bonus": "Reclamar bono",
    "Locked Balance": "Saldo bloqueado",
    "Remove": "Eliminar",
    "Selected Winner": "Ganador seleccionado",
    "Spin Raffle Wheel": "Girar la ruleta",
    "Viewer Username Raffle Spinner": "Ruleta de nombres de espectadores",
    "Live Participants Only": "Solo participantes en directo",
    "Spinning for Winner...": "Girando para elegir al ganador...",
    "Recent Raffle Winners": "Ganadores recientes del sorteo",
    "Digital Crypto Card Number Guess": "Adivina el número de tarjeta criptográfica",
    "Max 4": "Máx. 4",
    "Concealed": "Oculto",
    "Streamer Card Settings": "Configuración de tarjeta del streamer",
    "Hidden": "Oculto",
    "Visible": "Visible",
    "Serial Number": "Número de serie",
    "Withdrawal": "Retiro",
    "Minimum withdrawal is": "El retiro mínimo es",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "Inicializando la sincronización de TikTok Live + conexión de Cloudflare D1",
    "Verify your email": "Verifica tu correo electrónico",
    "Privacy Policy": "Política de privacidad",
    "Loading...": "Cargando...",
    "Aplikasi gagal dimuat": "No se pudo cargar la aplicación",
    "Wallet Identity": "Identidad de la billetera",
    "Wallet Connected": "Billetera conectada",
    "Connect Wallet": "Conectar billetera",
    "Register Now": "Registrarse ahora",
    "Remember me": "Recordarme",
    "Forgot Password?": "¿Olvidaste la contraseña?",
    "Sign in to continue streaming and gaming": "Inicia sesión para continuar con el streaming y los juegos",
    "LOGIN / REGISTER": "INICIAR SESIÓN / REGISTRARSE",
    "CHAT": "CHAT",
    "PESERTA": "PARTICIPANTES",
    "WIN": "GANAR",
    "Reward": "Recompensa",
    "Status": "Estado",
    "Terms & Conditions": "Términos y condiciones"
  },
  pt: {
    "Mining SYS dari Blind Box Lock": "Minerar SYS com Blind Box Lock",
    "Mining": "Mineração",
    "Wallet": "Carteira",
    "Menu": "Menu",
    "Processing...": "Processando...",
    "Claim Bonus": "Resgatar bônus",
    "Locked Balance": "Saldo bloqueado",
    "Remove": "Remover",
    "Selected Winner": "Vencedor selecionado",
    "Spin Raffle Wheel": "Girar a roleta",
    "Viewer Username Raffle Spinner": "Roleta de nomes dos espectadores",
    "Live Participants Only": "Somente participantes ao vivo",
    "Spinning for Winner...": "Girando para escolher o vencedor...",
    "Recent Raffle Winners": "Vencedores recentes do sorteio",
    "Digital Crypto Card Number Guess": "Adivinhe o número do cartão criptográfico",
    "Max 4": "Máx. 4",
    "Concealed": "Oculto",
    "Streamer Card Settings": "Configurações do cartão do streamer",
    "Hidden": "Oculto",
    "Visible": "Visível",
    "Serial Number": "Número de série",
    "Withdrawal": "Saque",
    "Minimum withdrawal is": "O saque mínimo é",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "Inicializando a sincronização do TikTok Live + conexão do Cloudflare D1",
    "Verify your email": "Verifique seu e-mail",
    "Privacy Policy": "Política de Privacidade",
    "Loading...": "Carregando...",
    "Aplikasi gagal dimuat": "Falha ao carregar o aplicativo",
    "Wallet Identity": "Identidade da carteira",
    "Wallet Connected": "Carteira conectada",
    "Connect Wallet": "Conectar carteira",
    "Register Now": "Registrar agora",
    "Remember me": "Lembrar de mim",
    "Forgot Password?": "Esqueceu a senha?",
    "Sign in to continue streaming and gaming": "Entre para continuar o streaming e os jogos",
    "LOGIN / REGISTER": "ENTRAR / REGISTRAR",
    "CHAT": "CHAT",
    "PESERTA": "PARTICIPANTES",
    "WIN": "VENCER",
    "Reward": "Recompensa",
    "Status": "Status",
    "Terms & Conditions": "Termos e condições"
  },
  zh: {
    "Mining SYS dari Blind Box Lock": "通过 Blind Box Lock 挖掘 SYS",
    "Mining": "挖矿",
    "Wallet": "钱包",
    "Menu": "菜单",
    "Processing...": "处理中...",
    "Claim Bonus": "领取奖励",
    "Locked Balance": "锁定余额",
    "Remove": "删除",
    "Selected Winner": "选中的获胜者",
    "Spin Raffle Wheel": "旋转抽奖转盘",
    "Viewer Username Raffle Spinner": "观众用户名抽奖转盘",
    "Live Participants Only": "仅限直播参与者",
    "Spinning for Winner...": "正在选择获胜者...",
    "Recent Raffle Winners": "近期抽奖获胜者",
    "Digital Crypto Card Number Guess": "数字加密卡号码竞猜",
    "Max 4": "最多 4 位",
    "Concealed": "已隐藏",
    "Streamer Card Settings": "主播卡片设置",
    "Hidden": "隐藏",
    "Visible": "可见",
    "Serial Number": "序列号",
    "Withdrawal": "提现",
    "Minimum withdrawal is": "最低提现金额为",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "正在初始化 TikTok Live 同步和 Cloudflare D1 连接",
    "Verify your email": "验证您的邮箱",
    "Privacy Policy": "隐私政策",
    "Loading...": "加载中...",
    "Aplikasi gagal dimuat": "应用加载失败",
    "Wallet Identity": "钱包身份",
    "Wallet Connected": "钱包已连接",
    "Connect Wallet": "连接钱包",
    "Register Now": "立即注册",
    "Remember me": "记住我",
    "Forgot Password?": "忘记密码？",
    "Sign in to continue streaming and gaming": "登录以继续直播和游戏",
    "LOGIN / REGISTER": "登录 / 注册",
    "CHAT": "聊天",
    "PESERTA": "参与者",
    "WIN": "获胜",
    "Reward": "奖励",
    "Status": "状态",
    "Terms & Conditions": "条款与条件"
  },
  ja: {
    "Mining SYS dari Blind Box Lock": "Blind Box LockでSYSをマイニング",
    "Mining": "マイニング",
    "Wallet": "ウォレット",
    "Menu": "メニュー",
    "Processing...": "処理中...",
    "Claim Bonus": "ボーナスを受け取る",
    "Locked Balance": "ロック残高",
    "Remove": "削除",
    "Selected Winner": "選ばれた当選者",
    "Spin Raffle Wheel": "抽選ホイールを回す",
    "Viewer Username Raffle Spinner": "視聴者ユーザー名抽選スピナー",
    "Live Participants Only": "ライブ参加者のみ",
    "Spinning for Winner...": "当選者を選択中...",
    "Recent Raffle Winners": "最近の抽選当選者",
    "Digital Crypto Card Number Guess": "デジタル暗号カード番号当て",
    "Max 4": "最大4桁",
    "Concealed": "非表示",
    "Streamer Card Settings": "ストリーマーカード設定",
    "Hidden": "非表示",
    "Visible": "表示",
    "Serial Number": "シリアル番号",
    "Withdrawal": "出金",
    "Minimum withdrawal is": "最低出金額は",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "TikTok Live同期とCloudflare D1接続を初期化中",
    "Verify your email": "メールアドレスを確認してください",
    "Privacy Policy": "プライバシーポリシー",
    "Loading...": "読み込み中...",
    "Aplikasi gagal dimuat": "アプリの読み込みに失敗しました",
    "Wallet Identity": "ウォレットID",
    "Wallet Connected": "ウォレット接続済み",
    "Connect Wallet": "ウォレットを接続",
    "Register Now": "今すぐ登録",
    "Remember me": "ログイン情報を保存",
    "Forgot Password?": "パスワードをお忘れですか？",
    "Sign in to continue streaming and gaming": "ログインしてストリーミングとゲームを続ける",
    "LOGIN / REGISTER": "ログイン / 登録",
    "CHAT": "チャット",
    "PESERTA": "参加者",
    "WIN": "勝利",
    "Reward": "報酬",
    "Status": "ステータス",
    "Terms & Conditions": "利用規約"
  },
  ko: {
    "Mining SYS dari Blind Box Lock": "Blind Box Lock으로 SYS 채굴",
    "Mining": "채굴",
    "Wallet": "지갑",
    "Menu": "메뉴",
    "Processing...": "처리 중...",
    "Claim Bonus": "보너스 받기",
    "Locked Balance": "잠금 잔액",
    "Remove": "삭제",
    "Selected Winner": "선정된 당첨자",
    "Spin Raffle Wheel": "추첨 휠 돌리기",
    "Viewer Username Raffle Spinner": "시청자 사용자명 추첨 스피너",
    "Live Participants Only": "라이브 참가자만",
    "Spinning for Winner...": "당첨자를 선택하는 중...",
    "Recent Raffle Winners": "최근 추첨 당첨자",
    "Digital Crypto Card Number Guess": "디지털 암호 카드 번호 맞히기",
    "Max 4": "최대 4자리",
    "Concealed": "숨김",
    "Streamer Card Settings": "스트리머 카드 설정",
    "Hidden": "숨김",
    "Visible": "표시",
    "Serial Number": "일련 번호",
    "Withdrawal": "출금",
    "Minimum withdrawal is": "최소 출금액은",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "TikTok Live 동기화 및 Cloudflare D1 연결 초기화 중",
    "Verify your email": "이메일을 인증하세요",
    "Privacy Policy": "개인정보 처리방침",
    "Loading...": "로딩 중...",
    "Aplikasi gagal dimuat": "앱을 불러오지 못했습니다",
    "Wallet Identity": "지갑 ID",
    "Wallet Connected": "지갑 연결됨",
    "Connect Wallet": "지갑 연결",
    "Register Now": "지금 가입",
    "Remember me": "로그인 상태 유지",
    "Forgot Password?": "비밀번호를 잊으셨나요?",
    "Sign in to continue streaming and gaming": "로그인하여 스트리밍과 게임을 계속하세요",
    "LOGIN / REGISTER": "로그인 / 가입",
    "CHAT": "채팅",
    "PESERTA": "참가자",
    "WIN": "승리",
    "Reward": "보상",
    "Status": "상태",
    "Terms & Conditions": "이용약관"
  },
  ar: {
    "Mining SYS dari Blind Box Lock": "تعدين SYS عبر Blind Box Lock",
    "Mining": "التعدين",
    "Wallet": "المحفظة",
    "Menu": "القائمة",
    "Processing...": "جارٍ المعالجة...",
    "Claim Bonus": "استلام المكافأة",
    "Locked Balance": "الرصيد المقفل",
    "Remove": "إزالة",
    "Selected Winner": "الفائز المختار",
    "Spin Raffle Wheel": "تدوير عجلة السحب",
    "Viewer Username Raffle Spinner": "عجلة سحب أسماء المشاهدين",
    "Live Participants Only": "المشاركون المباشرون فقط",
    "Spinning for Winner...": "جارٍ اختيار الفائز...",
    "Recent Raffle Winners": "الفائزون الأخيرون في السحب",
    "Digital Crypto Card Number Guess": "تخمين رقم بطاقة العملات الرقمية",
    "Max 4": "الحد الأقصى 4 أرقام",
    "Concealed": "مخفي",
    "Streamer Card Settings": "إعدادات بطاقة الستريمر",
    "Hidden": "مخفي",
    "Visible": "ظاهر",
    "Serial Number": "الرقم التسلسلي",
    "Withdrawal": "السحب",
    "Minimum withdrawal is": "الحد الأدنى للسحب هو",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection": "جارٍ تهيئة مزامنة TikTok Live واتصال Cloudflare D1",
    "Verify your email": "تحقق من بريدك الإلكتروني",
    "Privacy Policy": "سياسة الخصوصية",
    "Loading...": "جارٍ التحميل...",
    "Aplikasi gagal dimuat": "تعذر تحميل التطبيق",
    "Wallet Identity": "هوية المحفظة",
    "Wallet Connected": "تم ربط المحفظة",
    "Connect Wallet": "ربط المحفظة",
    "Register Now": "سجّل الآن",
    "Remember me": "تذكرني",
    "Forgot Password?": "هل نسيت كلمة المرور؟",
    "Sign in to continue streaming and gaming": "سجّل الدخول لمتابعة البث والألعاب",
    "LOGIN / REGISTER": "تسجيل الدخول / التسجيل",
    "CHAT": "الدردشة",
    "PESERTA": "المشاركون",
    "WIN": "فوز",
    "Reward": "المكافأة",
    "Status": "الحالة",
    "Terms & Conditions": "الشروط والأحكام"
  }
};
for (const lang of Object.keys(TRANSLATION_ONLY_USER_AUDIT) as LanguageCode[]) {
  Object.assign(translations[lang], TRANSLATION_ONLY_USER_AUDIT[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], TRANSLATION_ONLY_USER_AUDIT[lang]);
}

for (const lang of Object.keys(TRANSLATION_CORRECTIONS) as LanguageCode[]) {
  Object.assign(translations[lang], TRANSLATION_CORRECTIONS[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], TRANSLATION_CORRECTIONS[lang]);
}

/* Locked UI translations: new user-facing text must be registered for every supported language. */
const CORE_SCREENING_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  "id": {
    "Membuka SYS STREAM Airdrop...": "Membuka SYS STREAM Airdrop...",
    "Mining SYS dari Blind Box Lock": "Mining SYS dari Blind Box Lock",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.",
    "Wallet": "Dompet",
    "Copy referral link": "Salin tautan referral",
    "Profile preview": "Pratinjau profil",
    "Mobile Live": "Live Seluler",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.",
    "SDP kamera tidak tersedia.": "SDP kamera tidak tersedia.",
    "Cloudflare menolak koneksi live dari browser.": "Cloudflare menolak koneksi live dari browser.",
    "Kamera dan mikrofon sudah LIVE.": "Kamera dan mikrofon sudah LIVE.",
    "Gagal memulai live dari HP.": "Gagal memulai live dari HP.",
    "Live dari HP sudah dihentikan.": "Live dari HP sudah dihentikan.",
    "Live langsung dari kamera HP": "Live langsung dari kamera HP",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.",
    "Kamera siap digunakan": "Kamera siap digunakan",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "Tekan tombol mulai untuk meminta izin kamera & mikrofon.",
    "MENGHUBUNGKAN KE CLOUDFARE...": "MENGHUBUNGKAN KE CLOUDFARE...",
    "UNMUTE": "NYALAKAN SUARA",
    "MIC": "MIK",
    "CAM OFF": "KAMERA MATI",
    "CAM": "KAMERA",
    "MULAI LIVE": "MULAI LIVE",
    "STOP LIVE": "HENTIKAN LIVE",
    "READY": "SIAP",
    "WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • latensi sangat rendah • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.",
    "Terms & Conditions": "Syarat & Ketentuan",
    "Privacy Policy": "Kebijakan Privasi"
  },
  "en": {
    "Membuka SYS STREAM Airdrop...": "Opening SYS STREAM Airdrop...",
    "Mining SYS dari Blind Box Lock": "Mining SYS from Blind Box Lock",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "An active lock of at least $10 enables the daily mining reward.",
    "Wallet": "Wallet",
    "Copy referral link": "Copy referral link",
    "Profile preview": "Profile preview",
    "Mobile Live": "Mobile Live",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "This browser does not support live camera/microphone access. Use the latest Chrome/Safari over HTTPS.",
    "SDP kamera tidak tersedia.": "Camera SDP is unavailable.",
    "Cloudflare menolak koneksi live dari browser.": "Cloudflare rejected the live connection from the browser.",
    "Kamera dan mikrofon sudah LIVE.": "Camera and microphone are now LIVE.",
    "Gagal memulai live dari HP.": "Failed to start mobile live.",
    "Live dari HP sudah dihentikan.": "Mobile live has been stopped.",
    "Live langsung dari kamera HP": "Go live directly from your phone camera",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "No OBS required. Allow camera and microphone access, then press START LIVE.",
    "Kamera siap digunakan": "Camera ready",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "Press start to request camera and microphone permission.",
    "MENGHUBUNGKAN KE CLOUDFARE...": "CONNECTING TO CLOUDFLARE...",
    "UNMUTE": "UNMUTE",
    "MIC": "MIC",
    "CAM OFF": "CAM OFF",
    "CAM": "CAM",
    "MULAI LIVE": "START LIVE",
    "STOP LIVE": "STOP LIVE",
    "READY": "READY",
    "WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • ultra-low latency • camera and microphone activate only after you press START LIVE.",
    "Terms & Conditions": "Terms & Conditions",
    "Privacy Policy": "Privacy Policy"
  },
  "es": {
    "Membuka SYS STREAM Airdrop...": "Abriendo SYS STREAM Airdrop...",
    "Mining SYS dari Blind Box Lock": "Minar SYS desde Blind Box Lock",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "Un bloqueo activo de al menos $10 activa la recompensa diaria de minería.",
    "Wallet": "Billetera",
    "Copy referral link": "Copiar enlace de referido",
    "Profile preview": "Vista previa del perfil",
    "Mobile Live": "Live móvil",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "Este navegador no admite cámara/micrófono en directo. Usa la versión más reciente de Chrome/Safari mediante HTTPS.",
    "SDP kamera tidak tersedia.": "El SDP de la cámara no está disponible.",
    "Cloudflare menolak koneksi live dari browser.": "Cloudflare rechazó la conexión en directo del navegador.",
    "Kamera dan mikrofon sudah LIVE.": "La cámara y el micrófono están EN DIRECTO.",
    "Gagal memulai live dari HP.": "No se pudo iniciar el live móvil.",
    "Live dari HP sudah dihentikan.": "El live móvil se ha detenido.",
    "Live langsung dari kamera HP": "Transmitir en directo desde la cámara del móvil",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "No necesitas OBS. Permite la cámara y el micrófono y pulsa INICIAR LIVE.",
    "Kamera siap digunakan": "Cámara lista",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "Pulsa iniciar para solicitar permiso de cámara y micrófono.",
    "MENGHUBUNGKAN KE CLOUDFARE...": "CONECTANDO A CLOUDFLARE...",
    "UNMUTE": "ACTIVAR SONIDO",
    "MIC": "MIC",
    "CAM OFF": "CÁMARA APAGADA",
    "CAM": "CÁMARA",
    "MULAI LIVE": "INICIAR LIVE",
    "STOP LIVE": "DETENER LIVE",
    "READY": "LISTO",
    "WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • latencia ultrabaja • la cámara y el micrófono solo se activan al pulsar INICIAR LIVE.",
    "Terms & Conditions": "Términos y condiciones",
    "Privacy Policy": "Política de privacidad"
  },
  "pt": {
    "Membuka SYS STREAM Airdrop...": "Abrindo o Airdrop da SYS STREAM...",
    "Mining SYS dari Blind Box Lock": "Minerar SYS a partir do Blind Box Lock",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "Um bloqueio ativo de pelo menos $10 ativa a recompensa diária de mineração.",
    "Wallet": "Carteira",
    "Copy referral link": "Copiar link de indicação",
    "Profile preview": "Pré-visualização do perfil",
    "Mobile Live": "Live móvel",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "Este navegador não suporta câmera/microfone ao vivo. Use a versão mais recente do Chrome/Safari via HTTPS.",
    "SDP kamera tidak tersedia.": "O SDP da câmera não está disponível.",
    "Cloudflare menolak koneksi live dari browser.": "O Cloudflare rejeitou a conexão ao vivo do navegador.",
    "Kamera dan mikrofon sudah LIVE.": "A câmera e o microfone estão AO VIVO.",
    "Gagal memulai live dari HP.": "Falha ao iniciar a live móvel.",
    "Live dari HP sudah dihentikan.": "A live móvel foi interrompida.",
    "Live langsung dari kamera HP": "Faça live diretamente pela câmera do celular",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "Não é necessário usar OBS. Permita câmera e microfone e toque em INICIAR LIVE.",
    "Kamera siap digunakan": "Câmera pronta",
    "Tekan tombol mulai untuk meminta izin kamera & microfon.": "Pressione iniciar para solicitar acesso à câmera e ao microfone.",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "Pressione iniciar para solicitar acesso à câmera e ao microfone.",
    "MENGHUBUNGKAN KE CLOUDFARE...": "CONECTANDO AO CLOUDFLARE...",
    "UNMUTE": "ATIVAR SOM",
    "MIC": "MIC",
    "CAM OFF": "CÃ‚MERA DESLIGADA",
    "CAM": "CÃ‚MERA",
    "MULAI LIVE": "INICIAR LIVE",
    "STOP LIVE": "PARAR LIVE",
    "READY": "PRONTO",
    "WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • latência ultrabaixa • câmera e microfone só ficam ativos após INICIAR LIVE.",
    "Terms & Conditions": "Termos e condições",
    "Privacy Policy": "Política de Privacidade"
  },
  "zh": {
    "Membuka SYS STREAM Airdrop...": "正在打开 SYS STREAM 空投页面…",
    "Mining SYS dari Blind Box Lock": "通过 Blind Box Lock 挖掘 SYS",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "至少 $10 的有效锁仓可启用每日挖矿奖励。",
    "Wallet": "钱包",
    "Copy referral link": "复制推荐链接",
    "Profile preview": "个人资料预览",
    "Mobile Live": "手机直播",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "此浏览器不支持直播摄像头/麦克风。请通过 HTTPS 使用最新版 Chrome/Safari。",
    "SDP kamera tidak tersedia.": "摄像头 SDP 不可用",
    "Cloudflare menolak koneksi live dari browser.": "Cloudflare 拒绝了浏览器的直播连接。",
    "Kamera dan mikrofon sudah LIVE.": "摄像头和麦克风已开始直播。",
    "Gagal memulai live dari HP.": "无法开始手机直播。",
    "Live dari HP sudah dihentikan.": "手机直播已停止。",
    "Live langsung dari kamera HP": "直接使用手机摄像头直播",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "无需 OBS。允许摄像头和麦克风权限，然后点击开始直播。",
    "Kamera siap digunakan": "摄像头已准备就绪",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "点击开始以请求摄像头和麦克风权限。",
    "MENGHUBUNGKAN KE CLOUDFARE...": "正在连接 CLOUDFLARE…",
    "UNMUTE": "取消静音",
    "MIC": "麦克风",
    "CAM OFF": "关闭摄像头",
    "CAM": "摄像头",
    "MULAI LIVE": "开始直播",
    "STOP LIVE": "停止直播",
    "READY": "就绪",
    "WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • 超低延迟 • 只有点击开始直播后摄像头和麦克风才会启用。",
    "Terms & Conditions": "条款与条件",
    "Privacy Policy": "隐私政策"
  },
  "ja": {
    "Membuka SYS STREAM Airdrop...": "SYS STREAM Airdropを開いています…",
    "Mining SYS dari Blind Box Lock": "Blind Box LockからSYSをマイニング",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "10ドル以上の有効なロックで毎日のマイニング報酬が有効になります。",
    "Wallet": "ウォレット",
    "Copy referral link": "紹介リンクをコピー",
    "Profile preview": "プロフィールプレビュー",
    "Mobile Live": "モバイルライブ",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "このブラウザはライブカメラ/マイクに対応していません。HTTPSで最新版のChrome/Safariを使用してください。",
    "SDP kamera tidak tersedia.": "カメラSDPを利用できません",
    "Cloudflare menolak koneksi live dari browser.": "Cloudflareがブラウザからのライブ接続を拒否しました。",
    "Kamera dan mikrofon sudah LIVE.": "カメラとマイクがLIVEになりました。",
    "Gagal memulai live dari HP.": "モバイルライブを開始できませんでした。",
    "Live dari HP sudah dihentikan.": "モバイルライブを停止しました。",
    "Live langsung dari kamera HP": "スマートフォンのカメラから直接ライブ配信",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "OBSは不要です。カメラとマイクを許可して「ライブ開始」を押してください。",
    "Kamera siap digunakan": "カメラの準備完了",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "開始を押してカメラとマイクの許可を求めます。",
    "MENGHUBUNGKAN KE CLOUDFARE...": "CLOUDFLAREに接続中…",
    "UNMUTE": "ミュート解除",
    "MIC": "マイク",
    "CAM OFF": "カメラOFF",
    "CAM": "カメラ",
    "MULAI LIVE": "ライブ開始",
    "STOP LIVE": "ライブ停止",
    "READY": "準備完了",
    "WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • 超低遅延 • 「ライブ開始」を押した後のみカメラとマイクが有効になります。",
    "Terms & Conditions": "利用規約",
    "Privacy Policy": "プライバシーポリシー"
  },
  "ko": {
    "Membuka SYS STREAM Airdrop...": "SYS STREAM 에어드롭을 여는 중...",
    "Mining SYS dari Blind Box Lock": "Blind Box Lock으로 SYS 채굴",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "최소 $10의 활성 잠금으로 일일 채굴 보상이 활성화됩니다.",
    "Wallet": "지갑",
    "Copy referral link": "추천 링크 복사",
    "Profile preview": "프로필 미리보기",
    "Mobile Live": "모바일 라이브",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "이 브라우저는 라이브 카메라/마이크를 지원하지 않습니다. HTTPS에서 최신 Chrome/Safari를 사용하세요.",
    "SDP kamera tidak tersedia.": "카메라 SDP를 사용할 수 없습니다.",
    "Cloudflare menolak koneksi live dari browser.": "Cloudflare가 브라우저의 라이브 연결을 거부했습니다.",
    "Kamera dan mikrofon sudah LIVE.": "카메라와 마이크가 LIVE 상태입니다.",
    "Gagal memulai live dari HP.": "모바일 라이브를 시작하지 못했습니다.",
    "Live dari HP sudah dihentikan.": "모바일 라이브가 중지되었습니다.",
    "Live langsung dari kamera HP": "휴대폰 카메라로 바로 라이브하기",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "OBS가 필요하지 않습니다. 카메라와 마이크를 허용한 후 라이브 시작을 누르세요.",
    "Kamera siap digunakan": "카메라 사용 준비 완료",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "시작을 눌러 카메라와 마이크 권한을 요청하세요.",
    "MENGHUBUNGKAN KE CLOUDFARE...": "CLOUDFLARE 연결 중...",
    "UNMUTE": "음소거 해제",
    "MIC": "마이크",
    "CAM OFF": "카메라 끄기",
    "CAM": "카메라",
    "MULAI LIVE": "라이브 시작",
    "STOP LIVE": "라이브 중지",
    "READY": "준비",
    "WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • 초저지연 • 라이브 시작을 누른 후에만 카메라와 마이크가 활성화됩니다.",
    "Terms & Conditions": "이용약관",
    "Privacy Policy": "개인정보 처리방침"
  },
  "ar": {
    "Membuka SYS STREAM Airdrop...": "جارٍ فتح SYS STREAM Airdrop...",
    "Mining SYS dari Blind Box Lock": "تعدين SYS عبر Blind Box Lock",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "يؤدي القفل النشط بقيمة 10 دولارات على الأقل إلى تفعيل مكافأة التعدين اليومية.",
    "Wallet": "المحفظة",
    "Copy referral link": "نسخ رابط الإحالة",
    "Profile preview": "معاينة الملف الشخصي",
    "Mobile Live": "البث المباشر عبر الهاتف",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "هذا المتصفح لا يدعم الكاميرا/الميكروفون للبث المباشر. استخدم أحدث Chrome/Safari عبر HTTPS.",
    "SDP kamera tidak tersedia.": "بيانات SDP للكاميرا غير متاحة.",
    "Cloudflare menolak koneksi live dari browser.": "رفض Cloudflare اتصال البث المباشر من المتصفح.",
    "Kamera dan mikrofon sudah LIVE.": "أصبحت الكاميرا والميكروفون في وضع البث المباشر.",
    "Gagal memulai live dari HP.": "تعذر بدء البث المباشر من الهاتف.",
    "Live dari HP sudah dihentikan.": "تم إيقاف البث المباشر من الهاتف.",
    "Live langsung dari kamera HP": "البث المباشر مباشرة من كاميرا الهاتف",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "لا تحتاج إلى OBS. اسمح بالكاميرا والميكروفون ثم اضغط بدء البث.",
    "Kamera siap digunakan": "الكاميرا جاهزة",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "اضغط بدء لطلب إذن الكاميرا والميكروفون.",
    "MENGHUBUNGKAN KE CLOUDFARE...": "جارٍ الاتصال بـ CLOUDFLARE...",
    "UNMUTE": "إلغاء كتم الصوت",
    "MIC": "الميكروفون",
    "CAM OFF": "إيقاف الكاميرا",
    "CAM": "الكاميرا",
    "MULAI LIVE": "بدء البث",
    "STOP LIVE": "إيقاف البث",
    "READY": "جاهز",
    "WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • زمن انتقال منخفض جدًا • لا يتم تفعيل الكاميرا والميكروفون إلا بعد الضغط على بدء البث.",
    "Terms & Conditions": "الشروط والأحكام",
    "Privacy Policy": "سياسة الخصوصية"
  }
};
for (const lang of Object.keys(CORE_SCREENING_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], CORE_SCREENING_TRANSLATIONS[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], CORE_SCREENING_TRANSLATIONS[lang]);
}

const PRODUCT_LABEL_TRANSLATIONS: Record<LanguageCode, string> = {
  id: 'Penambangan SYS', en: 'SYS Mining', es: 'Minería SYS', pt: 'Mineração SYS', zh: 'SYS 挖矿', ja: 'SYS マイニング', ko: 'SYS 채굴', ar: 'تعدين SYS'
};
for (const lang of Object.keys(PRODUCT_LABEL_TRANSLATIONS) as LanguageCode[]) {
  translations[lang]['SYS Mining'] = PRODUCT_LABEL_TRANSLATIONS[lang];
  PAGE_UI_TRANSLATIONS[lang]['SYS Mining'] = PRODUCT_LABEL_TRANSLATIONS[lang];
}

/*
 * Final UI synchronization:
 * the page fallback dictionary is assembled in several stages. Merge the
 * final typed translations last so an older legacy value cannot override the
 * selected language on dynamically rendered pages.
 */
for (const lang of Object.keys(translations) as LanguageCode[]) {
  PAGE_UI_TRANSLATIONS[lang] = {
    ...PAGE_UI_TRANSLATIONS[lang],
    ...translations[lang],
  };
}

/* Locked Live Room UI translations. Keys are stable so legacy source text is not shipped in the production bundle. */
const LIVE_ROOM_NOT_AVAILABLE_CREATE: Record<LanguageCode, string> = {
  id: "Room belum siap. Hanya Official Streamer yang dapat membuat room baru.",
  en: "The room is not available yet. Only an Official Streamer can create a new room.",
  es: "La sala aún no está disponible. Solo un streamer oficial puede crear una nueva sala.",
  pt: "A sala ainda não está disponível. Apenas um streamer oficial pode criar uma nova sala.",
  zh: "直播间尚未可用。只有官方主播可以创建新的直播间。",
  ja: "ルームはまだ利用できません。新しいルームを作成できるのは公式ストリーマーのみです。",
  ko: "룸을 아직 사용할 수 없습니다. 새 룸은 공식 스트리머만 만들 수 있습니다.",
  ar: "الغرفة غير متاحة بعد. لا يمكن إنشاء غرفة جديدة إلا بواسطة ستريمر رسمي.",
};
for (const lang of Object.keys(LIVE_ROOM_NOT_AVAILABLE_CREATE) as LanguageCode[]) {
  translations[lang]["LIVE_ROOM_NOT_AVAILABLE_CREATE"] = LIVE_ROOM_NOT_AVAILABLE_CREATE[lang];
  PAGE_UI_TRANSLATIONS[lang]["LIVE_ROOM_NOT_AVAILABLE_CREATE"] = LIVE_ROOM_NOT_AVAILABLE_CREATE[lang];
}


/* Dashboard UI lock: every visible dashboard label is translated in all supported languages. */
const DASHBOARD_UI_LOCK: Record<LanguageCode, Record<string, string>> = {
  id: {
    'SYS STREAM': 'SYS STREAM','Streaming Settings': 'Pengaturan Streaming','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.': 'Anda sudah menjadi Official Streamer. Buat atau buka room streaming Anda sendiri dan dapatkan RTMPS Server + Stream Key untuk OBS.','Open Streaming Studio': 'Buka Streaming Studio','SYS Coin': 'SYS Coin','Airdrop Reward': 'Reward Airdrop','Create Post': 'Buat Postingan','Open attached media →': 'Buka media terlampir →','user': 'pengguna'
  },
  en: {
    'SYS STREAM': 'SYS STREAM','Streaming Settings': 'Streaming Settings','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.': 'You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.','Open Streaming Studio': 'Open Streaming Studio','SYS Coin': 'SYS Coin','Airdrop Reward': 'Airdrop Reward','Create Post': 'Create Post','Open attached media →': 'Open attached media →','user': 'user'
  },
  es: {
    'SYS STREAM': 'SYS STREAM','Streaming Settings': 'Configuración de streaming','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.': 'Eres un streamer oficial. Crea o abre tu propia sala de streaming y obtén el servidor RTMPS y la Stream Key para OBS.','Open Streaming Studio': 'Abrir estudio de streaming','SYS Coin': 'Moneda SYS','Airdrop Reward': 'Recompensa del airdrop','Create Post': 'Crear publicación','Open attached media →': 'Abrir contenido multimedia adjunto →','user': 'usuario'
  },
  pt: {
    'SYS STREAM': 'SYS STREAM','Streaming Settings': 'Configuração de streaming','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.': 'Você é um Official Streamer. Crie ou abra sua própria sala de streaming e obtenha o servidor RTMPS e a Stream Key para OBS.','Open Streaming Studio': 'Abrir estúdio de streaming','SYS Coin': 'Moeda SYS','Airdrop Reward': 'Recompensa do Airdrop','Create Post': 'Criar publicação','Open attached media →': 'Abrir mídia anexada →','user': 'usuário'
  },
  zh: {
    'SYS STREAM': 'SYS STREAM','Streaming Settings': '直播设置','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.': '您是官方主播。创建或打开自己的直播间，并获取用于 OBS 的 RTMPS 服务器和 Stream Key。','Open Streaming Studio': '打开直播工作室','SYS Coin': 'SYS 币','Airdrop Reward': '空投奖励','Create Post': '创建帖子','Open attached media →': '打开附件媒体 →','user': '用户'
  },
  ja: {
    'SYS STREAM': 'SYS STREAM','Streaming Settings': '配信設定','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.': 'あなたは公式ストリーマーです。自分の配信ルームを作成または開き、OBS用のRTMPSサーバーとStream Keyを取得できます。','Open Streaming Studio': '配信スタジオを開く','SYS Coin': 'SYSコイン','Airdrop Reward': 'エアドロップ報酬','Create Post': '投稿を作成','Open attached media →': '添付メディアを開く →','user': 'ユーザー'
  },
  ko: {
    'SYS STREAM': 'SYS STREAM','Streaming Settings': '스트리밍 설정','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.': '공식 스트리머입니다. 자신의 스트리밍 룸을 만들거나 열고 OBS용 RTMPS 서버와 Stream Key를 받을 수 있습니다.','Open Streaming Studio': '스트리밍 스튜디오 열기','SYS Coin': 'SYS 코인','Airdrop Reward': '에어드롭 보상','Create Post': '게시물 작성','Open attached media →': '첨부 미디어 열기 →','user': '사용자'
  },
  ar: {
    'SYS STREAM': 'SYS STREAM','Streaming Settings': 'إعدادات البث','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.': 'أنت منشئ بث رسمي. أنشئ غرفة البث الخاصة بك أو افتحها واحصل على خادم RTMPS وStream Key لاستخدامهما مع OBS.','Open Streaming Studio': 'فتح استوديو البث','SYS Coin': 'عملة SYS','Airdrop Reward': 'مكافأة الإيردروب','Create Post': 'إنشاء منشور','Open attached media →': 'فتح الوسائط المرفقة ←','user': 'مستخدم'
  }
};
for (const lang of Object.keys(DASHBOARD_UI_LOCK) as LanguageCode[]) {
  Object.assign(translations[lang], DASHBOARD_UI_LOCK[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], DASHBOARD_UI_LOCK[lang]);
}


/* Final translation screening: Games (Blind Box/Spinner/Tebak) + Profile.
 * Translation-only layer. No game logic, layout, values, or transaction behavior is changed.
 */
const GAMES_PROFILE_TRANSLATION_SCREENING: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.': 'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.',
    'Daily Active Reward': 'Reward Harian Aktif',
    'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.',
    'Enhanced Lock Tier': 'Tier Lock Tingkat Lanjut',
    'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.',
    'Premium Lock Tier': 'Tier Lock Premium',
    'Reward harian masuk ke saldo': 'Reward harian masuk ke saldo',
    'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.': 'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.',
    'Available': 'Tersedia',
    'Quota resets in': 'Kuota direset dalam',
    'Lock minimal $4 equivalent untuk membuka Blind Box': 'Lock minimal setara $4 untuk membuka Blind Box',
    'Daily Boxes': 'Blind Box Harian',
    'Lock Amount (IDR)': 'Nominal Lock (IDR)',
    'Claim Daily Blind Box': 'Klaim Blind Box Harian',
    'Lock aktif': 'Lock aktif',
    'Aturan claim tetap 1 kali per hari.': 'Aturan klaim tetap 1 kali per hari.',
    'LOCK SALDO DIBUTUHKAN': 'LOCK SALDO DIBUTUHKAN',
    'Lock saldo untuk mendapatkan hak claim Blind Box harian': 'Lock saldo untuk mendapatkan hak klaim Blind Box harian',
    'Durasi lock tersedia': 'Durasi lock tersedia',
    '30 hari': '30 hari',
    '60 hari': '60 hari',
    '90 hari': '90 hari',
    'Lock amount': 'Nominal lock',
    'Nominal Lock (IDR)': 'Nominal Lock (IDR)',
    'Quota': 'Kuota',
    '1 Box/Day': '1 Box/Hari',
    'Lock Saldo Sekarang': 'Lock Saldo Sekarang',
    'Total Locked': 'Total Terkunci',
    'Daily Claim': 'Klaim Harian',
    'Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.': 'Klaim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.',
    'Lock minimum': 'Lock minimum',
    'to activate': 'untuk mengaktifkan',
    'Open Daily Box': 'Buka Blind Box Harian',
    'Available Today': 'Tersedia Hari Ini',
    'Unboxing': 'Membuka Box',
    'Server sedang menentukan reward...': 'Server sedang menentukan reward...',
    'Reward Blind Box Harian': 'Reward Blind Box Harian',
    'Keep in Vault': 'Simpan di Vault',
    'Done': 'Selesai',
    'Left': 'Tersisa',
    'Jadwal Durasi Lock': 'Jadwal Durasi Lock',
    '30 Days Term': 'Jangka 30 Hari',
    '60 Days Term': 'Jangka 60 Hari',
    '90 Days Term': 'Jangka 90 Hari',
    'Reward harian sesuai pengaturan server': 'Reward harian sesuai pengaturan server',
    'Viewers on Wheel': 'Penonton di Roda',
    'Clear All': 'Hapus Semua',
    'Selected Winner': 'Pemenang Terpilih',
    'Live Participants Only': 'Hanya Peserta Live',
    'Spinning for Winner...': 'Sedang memilih pemenang...',
    'Spin Raffle Wheel': 'Putar Roda Undian',
    'Current Viewers on Wheel': 'Penonton Saat Ini di Roda',
    'Recent Raffle Winners': 'Pemenang Undian Terbaru',
    'Edit': 'Edit',
    'Logout': 'Keluar',
    'USDT Account': 'Akun USDT',
    'Member': 'Anggota',
    'EVM Wallet': 'Wallet EVM',
    'Wallet belum terhubung': 'Wallet belum terhubung',
    'Alamat wallet akun. Recovery phrase tidak disimpan di server.': 'Alamat wallet akun. Recovery phrase tidak disimpan di server.',
    'WALLET REQUIRED': 'WALLET DIBUTUHKAN',
    'Minimum withdrawal': 'Penarikan minimum',
    'Minimum withdrawal is': 'Minimum penarikan adalah',
    'Started': 'Dimulai',
    'Deposit, withdrawal, lock, reward & bonus': 'Deposit, penarikan, lock, reward & bonus',
    'Locked Balance': 'Saldo Terkunci',
    'Earns passive yield': 'Menghasilkan imbal hasil pasif',
    'Change photo from device': 'Ganti foto dari perangkat',
    'Upload photo from device': 'Unggah foto dari perangkat',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • foto tetap tersimpan di perangkat Anda',
    'No unread notifications at this time.': 'Tidak ada notifikasi yang belum dibaca saat ini.',
    'Guest': 'Tamu',
    'Profile': 'Profil',
    'Kelola akun, wallet, dan aktivitas kamu.': 'Kelola akun, wallet, dan aktivitas kamu.'
  },
  en: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.': 'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.',
    'Daily Active Reward': 'Daily Active Reward',
    'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'Higher lock tier with rare collectibles. Financial rewards are determined by the server.',
    'Enhanced Lock Tier': 'Enhanced Lock Tier',
    'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'High lock tier with rare collectibles. Financial rewards are determined by the server.',
    'Premium Lock Tier': 'Premium Lock Tier',
    'Reward harian masuk ke saldo': 'Daily rewards are added to your balance',
    'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.': 'Open the daily Blind Box based on your locked balance. Daily claims follow server rules and reset at WIB.',
    'Available': 'Available',
    'Quota resets in': 'Quota resets in',
    'Lock minimal $4 equivalent untuk membuka Blind Box': 'Lock at least the $4 equivalent to open the Blind Box',
    'Daily Boxes': 'Daily Boxes',
    'Lock Amount (IDR)': 'Lock Amount (IDR)',
    'Claim Daily Blind Box': 'Claim Daily Blind Box',
    'Lock aktif': 'Active Lock',
    'You must lock at least $4 equivalent to open the daily Blind Box.': 'You must lock at least $4 equivalent to open the daily Blind Box.',
    'Open the daily Blind Box based on your currently locked balance. Daily claims follow server rules and reset at WIB.': 'Open the daily Blind Box based on your currently locked balance. Daily claims follow server rules and reset at WIB.',
'Lock at least $4 equivalent to open the Blind Box': 'Lock at least $4 equivalent to open the Blind Box',
        'LOCK BALANCE REQUIRED': 'LOCK BALANCE REQUIRED',
        'Lock your balance to unlock the daily Blind Box claim': 'Lock your balance to unlock the daily Blind Box claim',
        'Boxes/Day': 'Boxes/Day',
        'Claim using the Blind Box button below. The lock will complete automatically when the lock period ends.': 'Claim using the Blind Box button below. The lock will complete automatically when the lock period ends.',
        'Daily reward follows server settings': 'Daily reward follows server settings',
    'Aturan claim tetap 1 kali per hari.': 'The claim limit remains once per day.',
    'LOCK SALDO DIBUTUHKAN': 'BALANCE LOCK REQUIRED',
    'Lock saldo untuk mendapatkan hak claim Blind Box harian': 'Lock your balance to receive the right to claim the daily Blind Box',
    'Durasi lock tersedia': 'Available lock durations',
    '30 hari': '30 days',
    '60 hari': '60 days',
    '90 hari': '90 days',
    'Lock amount': 'Lock amount',
    'Nominal Lock (IDR)': 'Lock Amount (IDR)',
    'Quota': 'Quota',
    '1 Box/Day': '1 Box/Day',
    'Lock Saldo Sekarang': 'Lock Balance Now',
    'Total Locked': 'Total Locked',
    'Daily Claim': 'Daily Claim',
    'Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.': 'Claims are made through the Blind Box button below. The lock ends automatically when its duration expires.',
    'Lock minimum': 'Minimum lock',
    'to activate': 'to activate',
    'Open Daily Box': 'Open Daily Box',
    'Available Today': 'Available Today',
    'Unboxing': 'Unboxing',
    'Server sedang menentukan reward...': 'The server is determining the reward...',
    'Reward Blind Box Harian': 'Daily Blind Box Reward',
    'Keep in Vault': 'Keep in Vault',
    'Done': 'Done',
    'Left': 'Left',
    'Jadwal Durasi Lock': 'Lock Duration Schedule',
    '30 Days Term': '30-Day Term',
    '60 Days Term': '60-Day Term',
    '90 Days Term': '90-Day Term',
    'Reward harian sesuai pengaturan server': 'Daily reward according to server settings',
    'Viewers on Wheel': 'Viewers on Wheel',
    'Clear All': 'Clear All',
    'Selected Winner': 'Selected Winner',
    'Live Participants Only': 'Live Participants Only',
    'Spinning for Winner...': 'Spinning for Winner...',
    'Spin Raffle Wheel': 'Spin Raffle Wheel',
    'Current Viewers on Wheel': 'Current Viewers on Wheel',
    'Recent Raffle Winners': 'Recent Raffle Winners',
    'Edit': 'Edit',
    'Logout': 'Logout',
    'USDT Account': 'USDT Account',
    'Member': 'Member',
    'EVM Wallet': 'EVM Wallet',
    'Wallet belum terhubung': 'Wallet not connected',
    'Alamat wallet akun. Recovery phrase tidak disimpan di server.': 'Your account wallet address. The recovery phrase is not stored on the server.',
    'WALLET REQUIRED': 'WALLET REQUIRED',
    'Minimum withdrawal': 'Minimum withdrawal',
    'Minimum withdrawal is': 'Minimum withdrawal is',
    'Started': 'Started',
    'Deposit, withdrawal, lock, reward & bonus': 'Deposit, withdrawal, lock, reward & bonus',
    'Locked Balance': 'Locked Balance',
    'Earns passive yield': 'Earns passive yield',
    'Change photo from device': 'Change photo from device',
    'Upload photo from device': 'Upload photo from device',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • photo stays in your device storage',
    'No unread notifications at this time.': 'No unread notifications at this time.',
    'Guest': 'Guest',
    'Profile': 'Profile',
    'Kelola akun, wallet, dan aktivitas kamu.': 'Manage your account, wallet, and activity.'
  },
  es: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.': 'Disponible con el bloqueo activo mínimo. Las recompensas diarias son procesadas por el servidor y se añaden al saldo disponible.',
    'Daily Active Reward': 'Recompensa diaria activa',
    'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'Nivel de bloqueo superior con coleccionables raros. Las recompensas financieras las determina el servidor.',
    'Enhanced Lock Tier': 'Nivel de bloqueo avanzado',
    'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'Nivel de bloqueo alto con coleccionables raros. Las recompensas financieras las determina el servidor.',
    'Premium Lock Tier': 'Nivel de bloqueo premium',
    'Reward harian masuk ke saldo': 'Las recompensas diarias se añaden al saldo',
    'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.': 'Abre la Blind Box diaria según tu saldo bloqueado. Las reclamaciones diarias siguen las reglas del servidor y se reinician a las 00:00 WIB.',
    'Available': 'Disponible','Quota resets in': 'La cuota se reinicia en','Lock minimal $4 equivalent untuk membuka Blind Box': 'Bloquea al menos el equivalente a $4 para abrir la Blind Box','Daily Boxes': 'Cajas diarias','Lock Amount (IDR)': 'Importe bloqueado (IDR)','Claim Daily Blind Box': 'Reclamar Blind Box diaria','Lock aktif': 'Bloqueo activo','Aturan claim tetap 1 kali per hari.': 'El límite de reclamación sigue siendo una vez al día.','LOCK SALDO DIBUTUHKAN': 'SE REQUIERE BLOQUEO DE SALDO','Lock saldo untuk mendapatkan hak claim Blind Box harian': 'Bloquea tu saldo para obtener el derecho a reclamar la Blind Box diaria','Durasi lock tersedia': 'Duraciones de bloqueo disponibles','30 hari': '30 días','60 hari': '60 días','90 hari': '90 días','Lock amount': 'Importe del bloqueo','Nominal Lock (IDR)': 'Importe bloqueado (IDR)','Quota': 'Cuota','1 Box/Day': '1 caja/día','Lock Saldo Sekarang': 'Bloquear saldo ahora','Total Locked': 'Total bloqueado','Daily Claim': 'Reclamación diaria','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.': 'Las reclamaciones se realizan mediante el botón Blind Box. El bloqueo finaliza automáticamente cuando termina su duración.','Lock minimum': 'Bloqueo mínimo','to activate': 'para activar','Open Daily Box': 'Abrir caja diaria','Available Today': 'Disponible hoy','Unboxing': 'Abrir caja','Server sedang menentukan reward...': 'El servidor está determinando la recompensa...','Reward Blind Box Harian': 'Recompensa de Blind Box diaria','Keep in Vault': 'Guardar en la bóveda','Done': 'Listo','Left': 'Restantes','Jadwal Durasi Lock': 'Calendario de duración del bloqueo','30 Days Term': 'Plazo de 30 días','60 Days Term': 'Plazo de 60 días','90 Days Term': 'Plazo de 90 días','Reward harian sesuai pengaturan server': 'Recompensa diaria según la configuración del servidor','Viewers on Wheel': 'Espectadores en la rueda','Clear All': 'Borrar todo','Selected Winner': 'Ganador seleccionado','Live Participants Only': 'Solo participantes del directo','Spinning for Winner...': 'Girando para elegir al ganador...','Spin Raffle Wheel': 'Girar la rueda del sorteo','Current Viewers on Wheel': 'Espectadores actuales en la rueda','Recent Raffle Winners': 'Ganadores recientes del sorteo','Edit': 'Editar','Logout': 'Cerrar sesión','USDT Account': 'Cuenta USDT','Member': 'Miembro','EVM Wallet': 'Billetera EVM','Wallet belum terhubung': 'Billetera no conectada','Alamat wallet akun. Recovery phrase tidak disimpan di server.': 'Dirección de la billetera de la cuenta. La frase de recuperación no se almacena en el servidor.','WALLET REQUIRED': 'BILLETERA OBLIGATORIA','Minimum withdrawal': 'Retiro mínimo','Minimum withdrawal is': 'El retiro mínimo es','Started': 'Iniciado','Deposit, withdrawal, lock, reward & bonus': 'Depósito, retiro, bloqueo, recompensa y bono','Locked Balance': 'Saldo bloqueado','Earns passive yield': 'Genera rendimiento pasivo','Change photo from device': 'Cambiar foto desde el dispositivo','Upload photo from device': 'Subir foto desde el dispositivo','JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • la foto permanece en el almacenamiento del dispositivo','No unread notifications at this time.': 'No hay notificaciones sin leer en este momento.','Guest': 'Invitado','Profile': 'Perfil','Kelola akun, wallet, dan aktivitas kamu.': 'Gestiona tu cuenta, billetera y actividad.'
  },
  pt: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.': 'Disponível com o lock ativo mínimo. As recompensas diárias são processadas pelo servidor e adicionadas ao saldo disponível.','Daily Active Reward': 'Recompensa diária ativa','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'Nível de lock superior com itens raros. As recompensas financeiras são determinadas pelo servidor.','Enhanced Lock Tier': 'Nível de lock avançado','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'Nível de lock alto com itens raros. As recompensas financeiras são determinadas pelo servidor.','Premium Lock Tier': 'Nível de lock premium','Reward harian masuk ke saldo': 'As recompensas diárias são adicionadas ao saldo','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.': 'Abra a Blind Box diária com base no seu saldo bloqueado. Os resgates seguem as regras do servidor e são redefinidos às 00:00 WIB.','Available': 'Disponível','Quota resets in': 'A cota será redefinida em','Lock minimal $4 equivalent untuk membuka Blind Box': 'Faça lock de pelo menos o equivalente a $4 para abrir a Blind Box','Daily Boxes': 'Caixas diárias','Lock Amount (IDR)': 'Valor do lock (IDR)','Claim Daily Blind Box': 'Resgatar Blind Box diária','Lock aktif': 'Lock ativo','Aturan claim tetap 1 kali per hari.': 'O limite de resgate continua sendo uma vez por dia.','LOCK SALDO DIBUTUHKAN': 'LOCK DE SALDO NECESSÁRIO','Lock saldo untuk mendapatkan hak claim Blind Box harian': 'Faça lock do saldo para obter o direito de resgatar a Blind Box diária','Durasi lock tersedia': 'Durações de lock disponíveis','30 hari': '30 dias','60 hari': '60 dias','90 hari': '90 dias','Lock amount': 'Valor do lock','Nominal Lock (IDR)': 'Valor do lock (IDR)','Quota': 'Cota','1 Box/Day': '1 caixa/dia','Lock Saldo Sekarang': 'Fazer lock do saldo agora','Total Locked': 'Total bloqueado','Daily Claim': 'Resgate diário','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.': 'Os resgates são feitos pelo botão Blind Box abaixo. O lock termina automaticamente quando a duração acabar.','Lock minimum': 'Lock mínimo','to activate': 'para ativar','Open Daily Box': 'Abrir caixa diária','Available Today': 'Disponível hoje','Unboxing': 'Abrindo caixa','Server sedang menentukan reward...': 'O servidor está determinando a recompensa...','Reward Blind Box Harian': 'Recompensa da Blind Box diária','Keep in Vault': 'Guardar no cofre','Done': 'Concluído','Left': 'Restantes','Jadwal Durasi Lock': 'Cronograma de duração do lock','30 Days Term': 'Prazo de 30 dias','60 Days Term': 'Prazo de 60 dias','90 Days Term': 'Prazo de 90 dias','Reward harian sesuai pengaturan server': 'Recompensa diária conforme as configurações do servidor','Viewers on Wheel': 'Espectadores na roda','Clear All': 'Limpar tudo','Selected Winner': 'Vencedor selecionado','Live Participants Only': 'Somente participantes da live','Spinning for Winner...': 'Girando para escolher o vencedor...','Spin Raffle Wheel': 'Girar a roda do sorteio','Current Viewers on Wheel': 'Espectadores atuais na roda','Recent Raffle Winners': 'Vencedores recentes do sorteio','Edit': 'Editar','Logout': 'Sair','USDT Account': 'Conta USDT','Member': 'Membro','EVM Wallet': 'Carteira EVM','Wallet belum terhubung': 'Carteira não conectada','Alamat wallet akun. Recovery phrase tidak disimpan di server.': 'Endereço da carteira da conta. A frase de recuperação não é armazenada no servidor.','WALLET REQUIRED': 'CARTEIRA OBRIGATÓRIA','Minimum withdrawal': 'Saque mínimo','Minimum withdrawal is': 'O saque mínimo é','Started': 'Iniciado','Deposit, withdrawal, lock, reward & bonus': 'Depósito, saque, lock, recompensa e bônus','Locked Balance': 'Saldo bloqueado','Earns passive yield': 'Gera rendimento passivo','Change photo from device': 'Alterar foto do dispositivo','Upload photo from device': 'Enviar foto do dispositivo','JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • a foto permanece no armazenamento do dispositivo','No unread notifications at this time.': 'Não há notificações não lidas no momento.','Guest': 'Convidado','Profile': 'Perfil','Kelola akun, wallet, dan aktivitas kamu.': 'Gerencie sua conta, carteira e atividade.'
  },
  zh: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.': '满足最低有效锁定即可使用。每日奖励由服务器处理并加入可用余额。','Daily Active Reward': '每日活跃奖励','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': '更高锁定等级，包含稀有收藏品。财务奖励由服务器决定。','Enhanced Lock Tier': '高级锁定等级','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': '高锁定等级，包含稀有收藏品。财务奖励由服务器决定。','Premium Lock Tier': '高级锁定等级','Reward harian masuk ke saldo': '每日奖励加入余额','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.': '根据锁定余额开启每日盲盒。每日领取遵循服务器规则，并按 WIB 重置。','Available': '可用','Quota resets in': '配额重置倒计时','Lock minimal $4 equivalent untuk membuka Blind Box': '锁定至少等值 $4 才能开启盲盒','Daily Boxes': '每日盲盒','Lock Amount (IDR)': '锁定金额（IDR）','Claim Daily Blind Box': '领取每日盲盒','Lock aktif': '有效锁定','Aturan claim tetap 1 kali per hari.': '领取限制仍为每天一次。','LOCK SALDO DIBUTUHKAN': '需要锁定余额','Lock saldo untuk mendapatkan hak claim Blind Box harian': '锁定余额以获得领取每日盲盒的资格','Durasi lock tersedia': '可用锁定期限：','30 hari': '30天','60 hari': '60天','90 hari': '90天','Lock amount': '锁定金额','Nominal Lock (IDR)': '锁定金额（IDR）','Quota': '配额：','1 Box/Day': '每天1盒','Lock Saldo Sekarang': '立即锁定余额','Total Locked': '总锁定','Daily Claim': '每日领取：','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.': '通过下方盲盒按钮领取。锁定期限结束后将自动完成。','Lock minimum': '最低锁定','to activate': '以激活','Open Daily Box': '开启每日盲盒','Available Today': '今日可用','Unboxing': '开盒中','Server sedang menentukan reward...': '服务器正在确定奖励……','Reward Blind Box Harian': '每日盲盒奖励','Keep in Vault': '存入保险库','Done': '完成','Left': '剩余','Jadwal Durasi Lock': '锁定期限安排','30 Days Term': '30天期限','60 Days Term': '60天期限','90 Days Term': '90天期限','Reward harian sesuai pengaturan server': '每日奖励以服务器设置为准','Viewers on Wheel': '转盘上的观众','Clear All': '全部清除','Selected Winner': '选中的获胜者','Live Participants Only': '仅限直播参与者','Spinning for Winner...': '正在转动选择获胜者……','Spin Raffle Wheel': '旋转抽奖转盘','Current Viewers on Wheel': '当前转盘观众：','Recent Raffle Winners': '最近的抽奖获胜者','Edit': '编辑','Logout': '退出登录','USDT Account': 'USDT 账户','Member': '会员','EVM Wallet': 'EVM 钱包','Wallet belum terhubung': '钱包未连接','Alamat wallet akun. Recovery phrase tidak disimpan di server.': '账户钱包地址。恢复短语不会存储在服务器上。','WALLET REQUIRED': '需要钱包','Minimum withdrawal': '最低提现','Minimum withdrawal is': '最低提现金额为','Started': '开始于','Deposit, withdrawal, lock, reward & bonus': '充值、提现、锁定、奖励和奖金','Locked Balance': '锁定余额','Earns passive yield': '获得被动收益','Change photo from device': '从设备更换照片','Upload photo from device': '从设备上传照片','JPG, PNG, WEBP • photo stays from your device storage': 'JPG、PNG、WEBP • 照片保存在您的设备存储中','No unread notifications at this time.': '目前没有未读通知。','Guest': '访客','Profile': '个人资料','Kelola akun, wallet, dan aktivitas kamu.': '管理您的账户、钱包和活动。'
  },
  ja: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.': '最低限の有効なロックで利用できます。毎日の報酬はサーバーで処理され、利用可能残高に加算されます。','Daily Active Reward': 'デイリーアクティブ報酬','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': '希少コレクション付きの上位ロックティア。金銭的報酬はサーバーが決定します。','Enhanced Lock Tier': '強化ロックティア','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': '希少コレクション付きの高ロックティア。金銭的報酬はサーバーが決定します。','Premium Lock Tier': 'プレミアムロックティア','Reward harian masuk ke saldo': '毎日の報酬が残高に加算されます','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.': 'ロック中の残高に応じてデイリーブラインドボックスを開きます。毎日の受け取りはサーバー規則に従い、WIBでリセットされます。','Available': '利用可能','Quota resets in': 'クォータリセットまで','Lock minimal $4 equivalent untuk membuka Blind Box': 'ブラインドボックスを開くには少なくとも$4相当をロックしてください','Daily Boxes': 'デイリーボックス','Lock Amount (IDR)': 'ロック金額（IDR）','Claim Daily Blind Box': 'デイリーブラインドボックスを受け取る','Lock aktif': '有効なロック','Aturan claim tetap 1 kali per hari.': '受け取りは1日1回までです。','LOCK SALDO DIBUTUHKAN': '残高のロックが必要です','Lock saldo untuk mendapatkan hak claim Blind Box harian': '残高をロックしてデイリーブラインドボックスの受け取り権を取得します','Durasi lock tersedia': '利用可能なロック期間：','30 hari': '30日','60 hari': '60日','90 hari': '90日','Lock amount': 'ロック金額','Nominal Lock (IDR)': 'ロック金額（IDR）','Quota': 'クォータ：','1 Box/Day': '1箱/日','Lock Saldo Sekarang': '今すぐ残高をロック','Total Locked': 'ロック合計','Daily Claim': 'デイリー受取：','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.': '下のブラインドボックスボタンから受け取れます。期間終了後、ロックは自動的に完了します。','Lock minimum': '最低ロック','to activate': '有効化するには','Open Daily Box': 'デイリーボックスを開く','Available Today': '本日利用可能','Unboxing': '開封中','Server sedang menentukan reward...': 'サーバーが報酬を決定しています…','Reward Blind Box Harian': 'デイリーブラインドボックス報酬','Keep in Vault': '保管庫に保存','Done': '完了','Left': '残り','Jadwal Durasi Lock': 'ロック期間スケジュール','30 Days Term': '30日間','60 Days Term': '60日間','90 Days Term': '90日間','Reward harian sesuai pengaturan server': '毎日の報酬はサーバー設定に従います','Viewers on Wheel': 'ホイール上の視聴者','Clear All': 'すべてクリア','Selected Winner': '選ばれた勝者','Live Participants Only': 'ライブ参加者のみ','Spinning for Winner...': '勝者を選出中…','Spin Raffle Wheel': '抽選ホイールを回す','Current Viewers on Wheel': '現在ホイール上の視聴者：','Recent Raffle Winners': '最近の抽選当選者','Edit': '編集','Logout': 'ログアウト','USDT Account': 'USDTアカウント','Member': 'メンバー','EVM Wallet': 'EVMウォレット','Wallet belum terhubung': 'ウォレット未接続','Alamat wallet akun. Recovery phrase tidak disimpan di server.': 'アカウントのウォレットアドレス。リカバリーフレーズはサーバーに保存されません。','WALLET REQUIRED': 'ウォレットが必要です','Minimum withdrawal': '最低出金額','Minimum withdrawal is': '最低出金額は','Started': '開始','Deposit, withdrawal, lock, reward & bonus': '入金、出金、ロック、報酬、ボーナス','Locked Balance': 'ロック残高','Earns passive yield': 'パッシブ利回りを獲得','Change photo from device': '端末から写真を変更','Upload photo from device': '端末から写真をアップロード','JPG, PNG, WEBP • photo stays from your device storage': 'JPG、PNG、WEBP • 写真は端末ストレージに保存されます','No unread notifications at this time.': '現在、未読通知はありません。','Guest': 'ゲスト','Profile': 'プロフィール','Kelola akun, wallet, dan aktivitas kamu.': 'アカウント、ウォレット、アクティビティを管理します。'
  },
  ko: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.': '최소 활성 락에서 이용할 수 있습니다. 일일 보상은 서버에서 처리되어 사용 가능한 잔액에 추가됩니다.','Daily Active Reward': '일일 활성 보상','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': '희귀 컬렉션이 포함된 높은 락 등급입니다. 금융 보상은 서버에서 결정합니다.','Enhanced Lock Tier': '강화 락 등급','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': '희귀 컬렉션이 포함된 높은 락 등급입니다. 금융 보상은 서버에서 결정합니다.','Premium Lock Tier': '프리미엄 락 등급','Reward harian masuk ke saldo': '일일 보상이 잔액에 추가됩니다','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.': '잠긴 잔액을 기준으로 일일 블라인드 박스를 엽니다. 일일 수령은 서버 규칙을 따르며 WIB 기준으로 초기화됩니다.','Available': '사용 가능','Quota resets in': '할당량 초기화까지','Lock minimal $4 equivalent untuk membuka Blind Box': '블라인드 박스를 열려면 최소 $4 상당을 락하세요','Daily Boxes': '일일 박스','Lock Amount (IDR)': '락 금액 (IDR)','Claim Daily Blind Box': '일일 블라인드 박스 수령','Lock aktif': '활성 락','Aturan claim tetap 1 kali per hari.': '수령은 하루 한 번으로 유지됩니다.','LOCK SALDO DIBUTUHKAN': '잔액 락 필요','Lock saldo untuk mendapatkan hak claim Blind Box harian': '잔액을 락하여 일일 블라인드 박스 수령 권한을 얻으세요','Durasi lock tersedia': '사용 가능한 락 기간','30 hari': '30일','60 hari': '60일','90 hari': '90일','Lock amount': '락 금액','Nominal Lock (IDR)': '락 금액 (IDR)','Quota': '할당량','1 Box/Day': '하루 1박스','Lock Saldo Sekarang': '지금 잔액 락','Total Locked': '총 락 금액','Daily Claim': '일일 수령','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.': '아래 블라인드 박스 버튼으로 수령합니다. 기간이 끝나면 락이 자동으로 종료됩니다.','Lock minimum': '최소 락','to activate': '활성화하려면','Open Daily Box': '일일 박스 열기','Available Today': '오늘 사용 가능','Unboxing': '박스 개봉 중','Server sedang menentukan reward...': '서버가 보상을 결정하는 중입니다…','Reward Blind Box Harian': '일일 블라인드 박스 보상','Keep in Vault': '보관함에 보관','Done': '완료','Left': '남음','Jadwal Durasi Lock': '락 기간 일정','30 Days Term': '30일 기간','60 Days Term': '60일 기간','90 Days Term': '90일 기간','Reward harian sesuai pengaturan server': '일일 보상은 서버 설정에 따릅니다','Viewers on Wheel': '휠의 시청자','Clear All': '모두 지우기','Selected Winner': '선택된 당첨자','Live Participants Only': '라이브 참가자만','Spinning for Winner...': '당첨자를 선택하는 중…','Spin Raffle Wheel': '추첨 휠 돌리기','Current Viewers on Wheel': '현재 휠의 시청자','Recent Raffle Winners': '최근 추첨 당첨자','Edit': '편집','Logout': '로그아웃','USDT Account': 'USDT 계정','Member': '회원','EVM Wallet': 'EVM 지갑','Wallet belum terhubung': '지갑이 연결되지 않음','Alamat wallet akun. Recovery phrase tidak disimpan di server.': '계정 지갑 주소입니다. 복구 문구는 서버에 저장되지 않습니다.','WALLET REQUIRED': '지갑 필요','Minimum withdrawal': '최소 출금','Minimum withdrawal is': '최소 출금액은','Started': '시작됨','Deposit, withdrawal, lock, reward & bonus': '입금, 출금, 락, 보상 및 보너스','Locked Balance': '잠긴 잔액','Earns passive yield': '패시브 수익을 얻습니다','Change photo from device': '기기에서 사진 변경','Upload photo from device': '기기에서 사진 업로드','JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • 사진은 기기 저장소에 유지됩니다','No unread notifications at this time.': '현재 읽지 않은 알림이 없습니다.','Guest': '게스트','Profile': '프로필','Kelola akun, wallet, dan aktivitas kamu.': '계정, 지갑 및 활동을 관리합니다.'
  },
  ar: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.': 'متاح مع الحد الأدنى من القفل النشط. تتم معالجة المكافآت اليومية بواسطة الخادم وإضافتها إلى الرصيد المتاح.','Daily Active Reward': 'المكافأة اليومية النشطة','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'مستوى قفل أعلى مع مقتنيات نادرة. يحدد الخادم المكافآت المالية.','Enhanced Lock Tier': 'مستوى قفل متقدم','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.': 'مستوى قفل مرتفع مع مقتنيات نادرة. يحدد الخادم المكافآت المالية.','Premium Lock Tier': 'مستوى القفل المميز','Reward harian masuk ke saldo': 'تُضاف المكافآت اليومية إلى الرصيد','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.': 'افتح الصندوق الغامض اليومي بناءً على رصيدك المقفول. تتبع المطالبات اليومية قواعد الخادم ويتم إعادة ضبطها حسب توقيت WIB.','Available': 'متاح','Quota resets in': 'إعادة ضبط الحصة خلال','Lock minimal $4 equivalent untuk membuka Blind Box': 'اقفل ما لا يقل عن ما يعادل 4 دولارات لفتح الصندوق الغامض','Daily Boxes': 'الصناديق اليومية','Lock Amount (IDR)': 'مبلغ القفل (IDR)','Claim Daily Blind Box': 'المطالبة بالصندوق الغامض اليومي','Lock aktif': 'قفل نشط','Aturan claim tetap 1 kali per hari.': 'يبقى حد المطالبة مرة واحدة يوميًا.','LOCK SALDO DIBUTUHKAN': 'مطلوب قفل الرصيد','Lock saldo untuk mendapatkan hak claim Blind Box harian': 'اقفل رصيدك للحصول على حق المطالبة بالصندوق الغامض اليومي','Durasi lock tersedia': 'مدد القفل المتاحة','30 hari': '30 يومًا','60 hari': '60 يومًا','90 hari': '90 يومًا','Lock amount': 'مبلغ القفل','Nominal Lock (IDR)': 'مبلغ القفل (IDR)','Quota': 'الحصة','1 Box/Day': 'صندوق واحد/يوم','Lock Saldo Sekarang': 'اقفل الرصيد الآن','Total Locked': 'إجمالي المقفول','Daily Claim': 'المطالبة اليومية','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.': 'تتم المطالبة عبر زر الصندوق الغامض أدناه. ينتهي القفل تلقائيًا عند انتهاء مدته.','Lock minimum': 'الحد الأدنى للقفل','to activate': 'للتفعيل','Open Daily Box': 'فتح الصندوق اليومي','Available Today': 'متاح اليوم','Unboxing': 'فتح الصندوق','Server sedang menentukan reward...': 'الخادم يحدد المكافأة…','Reward Blind Box Harian': 'مكافأة الصندوق الغامض اليومية','Keep in Vault': 'حفظ في الخزنة','Done': 'تم','Left': 'متبقٍ','Jadwal Durasi Lock': 'جدول مدة القفل','30 Days Term': 'مدة 30 يومًا','60 Days Term': 'مدة 60 يومًا','90 Days Term': 'مدة 90 يومًا','Reward harian sesuai pengaturan server': 'المكافأة اليومية وفق إعدادات الخادم','Viewers on Wheel': 'المشاهدون على العجلة','Clear All': 'مسح الكل','Selected Winner': 'الفائز المختار','Live Participants Only': 'مشاركو البث المباشر فقط','Spinning for Winner...': 'جارٍ تدوير العجلة لاختيار الفائز…','Spin Raffle Wheel': 'تدوير عجلة السحب','Current Viewers on Wheel': 'المشاهدون الحاليون على العجلة','Recent Raffle Winners': 'الفائزون الأخيرون في السحب','Edit': 'تعديل','Logout': 'تسجيل الخروج','USDT Account': 'حساب USDT','Member': 'عضو','EVM Wallet': 'محفظة EVM','Wallet belum terhubung': 'المحفظة غير متصلة','Alamat wallet akun. Recovery phrase tidak disimpan di server.': 'عنوان محفظة الحساب. لا يتم تخزين عبارة الاسترداد على الخادم.','WALLET REQUIRED': 'المحفظة مطلوبة','Minimum withdrawal': 'الحد الأدنى للسحب','Minimum withdrawal is': 'الحد الأدنى للسحب هو','Started': 'بدأ','Deposit, withdrawal, lock, reward & bonus': 'الإيداع والسحب والقفل والمكافآت والمكافأة الإضافية','Locked Balance': 'الرصيد المقفول','Earns passive yield': 'يحقق عائدًا سلبيًا','Change photo from device': 'تغيير الصورة من الجهاز','Upload photo from device': 'رفع صورة من الجهاز','JPG, PNG, WEBP • photo stays from your device storage': 'JPG وPNG وWEBP • تبقى الصورة في مساحة تخزين جهازك','No unread notifications at this time.': 'لا توجد إشعارات غير مقروءة حاليًا.','Guest': 'زائر','Profile': 'الملف الشخصي','Kelola akun, wallet, dan aktivitas kamu.': 'إدارة حسابك ومحفظتك ونشاطك.'
  }
};

for (const lang of Object.keys(GAMES_PROFILE_TRANSLATION_SCREENING) as LanguageCode[]) {
  Object.assign(translations[lang], GAMES_PROFILE_TRANSLATION_SCREENING[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], GAMES_PROFILE_TRANSLATION_SCREENING[lang]);
}

/* Spinner raffle wheel translation completion */
const SPINNER_RAFFLE_DESCRIPTION_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!": "Roda undian streamer berisi nama pengguna penonton yang sedang live. Putar untuk memilih pemenang giveaway secara acak!"
  },
  en: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!": "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!"
  },
  es: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!": "Ruleta del streamer con los nombres de los espectadores en directo. ¡Gírala para elegir al azar al ganador del sorteo!"
  },
  pt: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!": "Roleta do streamer com os nomes de utilizadores dos espectadores ao vivo. Gire para escolher aleatoriamente o vencedor do sorteio!"
  },
  zh: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!": "主播抽奖转盘包含正在直播的观众用户名。转动转盘即可随机选出抽奖获胜者！"
  },
  ja: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!": "ライブ視聴者のユーザー名が入ったストリーマー抽選ホイールです。回してランダムにプレゼント企画の当選者を選びましょう！"
  },
  ko: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!": "라이브 시청자 사용자 이름이 포함된 스트리머 추첨 휠입니다. 돌려서 무작위로 경품 추첨 당첨자를 선택하세요!"
  },
  ar: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!": "عجلة سحب للستريمر تحتوي على أسماء مستخدمي المشاهدين المباشرين. أدر العجلة لاختيار فائز عشوائي بالهدية!"
  }
};

for (const lang of Object.keys(SPINNER_RAFFLE_DESCRIPTION_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], SPINNER_RAFFLE_DESCRIPTION_TRANSLATIONS[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], SPINNER_RAFFLE_DESCRIPTION_TRANSLATIONS[lang]);
}


/* Final game-page translation completion */
const GAME_PAGE_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  "id": {
    "$4 equivalent+ Lock": "Lock setara $4+",
    "Active Lock": "Lock Aktif",
    "Available lock durations": "Durasi lock yang tersedia",
    "30 days": "30 hari",
    "60 days": "60 hari",
    "90 days": "90 hari",
    "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.": "Lock hanya dapat diselesaikan setelah masa lock berakhir. Pembukaan lebih awal tidak tersedia melalui Blind Box.",
    "Lock Duration": "Durasi Lock",
    "Processing Blind Box Reward...": "Memproses Reward Blind Box...",
    "Reward credited to available balance": "Reward ditambahkan ke saldo tersedia",
    "Lock Duration Schedule": "Jadwal Durasi Lock",
    "Streamer & Viewer Interaction — Free to Play": "Interaksi Streamer & Penonton — Gratis untuk Bermain"
  },
  "en": {
    "$4 equivalent+ Lock": "$4 equivalent+ Lock",
    "Active Lock": "Active Lock",
    "Available lock durations": "Available lock durations",
    "30 days": "30 days",
    "60 days": "60 days",
    "90 days": "90 days",
    "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.": "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.",
    "Lock Duration": "Lock Duration",
    "Processing Blind Box Reward...": "Processing Blind Box Reward...",
    "Reward credited to available balance": "Reward credited to available balance",
    "Lock Duration Schedule": "Lock Duration Schedule",
    "Streamer & Viewer Interaction — Free to Play": "Streamer & Viewer Interaction — Free to Play"
  },
  "es": {
    "$4 equivalent+ Lock": "Lock equivalente a $4+",
    "Active Lock": "Lock activo",
    "Available lock durations": "Duraciones de lock disponibles",
    "30 days": "30 días",
    "60 days": "60 días",
    "90 days": "90 días",
    "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.": "El lock solo puede completarse cuando termine el periodo. No se permite desbloquearlo antes mediante Blind Box.",
    "Lock Duration": "Duración del lock",
    "Processing Blind Box Reward...": "Procesando la recompensa de Blind Box...",
    "Reward credited to available balance": "Recompensa añadida al saldo disponible",
    "Lock Duration Schedule": "Calendario de duración del lock",
    "Streamer & Viewer Interaction — Free to Play": "Interacción entre streamer y espectadores — Gratis"
  },
  "pt": {
    "$4 equivalent+ Lock": "Lock equivalente a $4+",
    "Active Lock": "Lock ativo",
    "Available lock durations": "Durações de lock disponíveis",
    "30 days": "30 dias",
    "60 days": "60 dias",
    "90 days": "90 dias",
    "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.": "O lock só pode ser concluído quando o período terminar. O desbloqueio antecipado não está disponível pelo Blind Box.",
    "Lock Duration": "Duração do lock",
    "Processing Blind Box Reward...": "Processando a recompensa do Blind Box...",
    "Reward credited to available balance": "Recompensa adicionada ao saldo disponível",
    "Lock Duration Schedule": "Cronograma de duração do lock",
    "Streamer & Viewer Interaction — Free to Play": "Interação entre streamer e espectadores — Grátis"
  },
  "zh": {
    "$4 equivalent+ Lock": "等值 $4+ 锁定",
    "Active Lock": "当前锁定",
    "Available lock durations": "可用锁定期限：",
    "30 days": "30 天",
    "60 days": "60 天",
    "90 days": "90 天",
    "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.": "锁定必须在期限结束后才能完成。Blind Box 不支持提前解锁。",
    "Lock Duration": "锁定期限",
    "Processing Blind Box Reward...": "正在处理 Blind Box 奖励……",
    "Reward credited to available balance": "奖励已计入可用余额",
    "Lock Duration Schedule": "锁定期限安排",
    "Streamer & Viewer Interaction — Free to Play": "主播与观众互动 — 免费参与"
  },
  "ja": {
    "$4 equivalent+ Lock": "4ドル相当以上をロック",
    "Active Lock": "アクティブなロック",
    "Available lock durations": "利用可能なロック期間：",
    "30 days": "30日",
    "60 days": "60日",
    "90 days": "90日",
    "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.": "ロックは期間終了後にのみ完了できます。Blind Boxからの早期解除には対応していません。",
    "Lock Duration": "ロック期間",
    "Processing Blind Box Reward...": "Blind Box報酬を処理中…",
    "Reward credited to available balance": "報酬を利用可能残高に追加しました",
    "Lock Duration Schedule": "ロック期間スケジュール",
    "Streamer & Viewer Interaction — Free to Play": "ストリーマーと視聴者の交流 — 無料プレイ"
  },
  "ko": {
    "$4 equivalent+ Lock": "$4 상당 이상 잠금",
    "Active Lock": "활성 잠금",
    "Available lock durations": "사용 가능한 잠금 기간",
    "30 days": "30일",
    "60 days": "60일",
    "90 days": "90일",
    "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.": "잠금은 기간이 종료된 후에만 완료할 수 있습니다. Blind Box에서는 조기 해제를 지원하지 않습니다.",
    "Lock Duration": "잠금 기간",
    "Processing Blind Box Reward...": "Blind Box 보상 처리 중...",
    "Reward credited to available balance": "보상이 사용 가능 잔액에 추가되었습니다",
    "Lock Duration Schedule": "잠금 기간 일정",
    "Streamer & Viewer Interaction — Free to Play": "스트리머와 시청자 상호작용 — 무료 플레이"
  },
  "ar": {
    "$4 equivalent+ Lock": "قفل بقيمة تعادل 4 دولارات أو أكثر",
    "Active Lock": "القفل النشط",
    "Available lock durations": "مدد القفل المتاحة",
    "30 days": "30 يومًا",
    "60 days": "60 يومًا",
    "90 days": "90 يومًا",
    "The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.": "لا يمكن إكمال القفل إلا بعد انتهاء مدته. لا يتوفر الفتح المبكر عبر Blind Box.",
    "Lock Duration": "مدة القفل",
    "Processing Blind Box Reward...": "جارٍ معالجة مكافأة Blind Box...",
    "Reward credited to available balance": "تمت إضافة المكافأة إلى الرصيد المتاح",
    "Lock Duration Schedule": "جدول مدة القفل",
    "Streamer & Viewer Interaction — Free to Play": "تفاعل مقدم البث والمشاهدين — لعب مجاني"
  }
};
for (const lang of Object.keys(GAME_PAGE_TRANSLATIONS) as LanguageCode[]) Object.assign(translations[lang], GAME_PAGE_TRANSLATIONS[lang]);

/* Blind Box daily description — explicit locale mapping */
const BLIND_BOX_DAILY_DESCRIPTION_TRANSLATIONS: Record<LanguageCode, string> = {
  id: 'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.',
  en: 'Open the daily Blind Box based on your currently locked balance. Daily claims follow server rules and reset at WIB.',
  es: 'Abre la Blind Box diaria según tu saldo actualmente bloqueado. Las reclamaciones diarias siguen las reglas del servidor y se reinician según WIB.',
  pt: 'Abra a Blind Box diária com base no seu saldo atualmente bloqueado. Os resgates diários seguem as regras do servidor e são redefinidos de acordo com o horário WIB.',
  zh: '根据您当前锁定的余额开启每日 Blind Box。每日领取遵循服务器规则，并按 WIB 重置。',
  ja: '現在ロックされている残高に基づいてデイリー Blind Box を開きます。毎日の受け取りはサーバーのルールに従い、WIB に基づいてリセットされます。',
  ko: '현재 잠긴 잔액을 기준으로 일일 Blind Box를 엽니다. 일일 수령은 서버 규칙을 따르며 WIB 기준으로 초기화됩니다.',
  ar: 'افتح Blind Box اليومية بناءً على رصيدك المقفول حاليًا. تتبع المطالبات اليومية قواعد الخادم ويتم إعادة ضبطها وفق توقيت WIB.',
};
for (const lang of Object.keys(BLIND_BOX_DAILY_DESCRIPTION_TRANSLATIONS) as LanguageCode[]) {
  translations[lang]['Open the daily Blind Box based on your currently locked balance. Daily claims follow server rules and reset at WIB.'] =
    BLIND_BOX_DAILY_DESCRIPTION_TRANSLATIONS[lang];
}


const ALL_EXPLORER_AND_UI_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Search by address, tx hash, block': 'Cari alamat, hash tx, block',
    'No transactions found': 'Belum ada transaksi',
    'Loading...': 'Memuat...',
    'Latest Blocks': 'Block Terbaru',
    'Failed to fetch': 'Gagal mengambil data',
    'Block list': 'Daftar Block',
    'Transaction detail': 'Detail Transaksi',
    'Address detail': 'Detail Alamat',
    'Go to SYS STREAM home': 'Ke beranda SYS STREAM',
    'Minimum Deposit': 'Deposit Minimum',
    'Minimum deposit is': 'Deposit minimum adalah',
    'Awaiting Deposit': 'Menunggu Deposit',
    'Deposit Amount (USD)': 'Nominal Deposit (USD)',
    'Select Cryptocurrency': 'Pilih Kripto',
    'Or enter custom USD amount': 'Atau masukkan nominal USD khusus',
    'Send exactly to deposit address:': 'Kirim tepat ke alamat deposit:',
    'Open NOWPayments Payment Page': 'Buka Halaman Pembayaran NOWPayments',
    'Change Currency / Amount': 'Ubah Kripto / Nominal',
    'Deposit QR Code': 'QR Code Deposit',
    'Leaderboard & Referral': 'Papan Peringkat & Referral',
    'Production Leaderboard': 'Papan Peringkat Produksi',
    'No production ranking data is available yet. Dummy ranking data is intentionally disabled.': 'Belum ada data peringkat produksi. Data peringkat sampel sengaja dinonaktifkan.',
    'Referral Event': 'Event Referral',
    'Referral participation is optional. Use your wallet identity as your referral identifier.': 'Partisipasi referral bersifat opsional. Gunakan identitas wallet Anda sebagai pengenal referral.',
    'Your Wallet / Referral ID': 'Wallet / ID Referral Anda',
    'Copy Referral ID': 'Salin ID Referral',
    'Live Referral Data': 'Data Referral Live',
    'Only verified production activity will be shown here.': 'Hanya aktivitas produksi terverifikasi yang akan ditampilkan di sini.',
    'Code Copied!': 'Kode Tersalin!',
    'Referral code copied to clipboard.': 'Kode referral tersalin ke papan klip.',
    'Photo too large': 'Foto Terlalu Besar',
    'Maximum profile photo size is 5 MB.': 'Ukuran maksimum foto profil adalah 5 MB.',
    'Login using your wallet.': 'Masuk menggunakan wallet Anda.',
    'Login menggunakan wallet Anda.': 'Masuk menggunakan wallet Anda.',
    'Connect MetaMask or another EVM wallet, then sign the login message.': 'Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.',
    'Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.': 'Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.',
    'Wallet Authentication': 'Autentikasi Wallet',
    'Edit Profile & Avatar': 'Kelola Profil & Foto',
    'Display Username': 'Nama Pengguna',
    'Profile Photo': 'Foto Profil',
    'Upload photo from device': 'Unggah foto dari perangkat',
    'Change photo from device': 'Ganti foto dari perangkat',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • foto tersimpan di penyimpanan perangkat Anda',
    'Save Changes': 'Simpan Perubahan'
  },
  en: {
    'Search by address, tx hash, block': 'Search by address, tx hash, block',
    'No transactions found': 'No transactions found',
    'Loading...': 'Loading...',
    'Latest Blocks': 'Latest Blocks',
    'Failed to fetch': 'Failed to fetch',
    'Block list': 'Block list',
    'Transaction detail': 'Transaction detail',
    'Address detail': 'Address detail',
    'Go to SYS STREAM home': 'Go to SYS STREAM home',
    'Minimum Deposit': 'Minimum Deposit',
    'Minimum deposit is': 'Minimum deposit is',
    'Awaiting Deposit': 'Awaiting Deposit',
    'Deposit Amount (USD)': 'Deposit Amount (USD)',
    'Select Cryptocurrency': 'Select Cryptocurrency',
    'Or enter custom USD amount': 'Or enter custom USD amount',
    'Send exactly to deposit address:': 'Send exactly to deposit address:',
    'Open NOWPayments Payment Page': 'Open NOWPayments Payment Page',
    'Change Currency / Amount': 'Change Currency / Amount',
    'Deposit QR Code': 'Deposit QR Code',
    'Leaderboard & Referral': 'Leaderboard & Referral',
    'Production Leaderboard': 'Production Leaderboard',
    'No production ranking data is available yet. Dummy ranking data is intentionally disabled.': 'No production ranking data is available yet. Dummy ranking data is intentionally disabled.',
    'Referral Event': 'Referral Event',
    'Referral participation is optional. Use your wallet identity as your referral identifier.': 'Referral participation is optional. Use your wallet identity as your referral identifier.',
    'Your Wallet / Referral ID': 'Your Wallet / Referral ID',
    'Copy Referral ID': 'Copy Referral ID',
    'Live Referral Data': 'Live Referral Data',
    'Only verified production activity will be shown here.': 'Only verified production activity will be shown here.',
    'Code Copied!': 'Code Copied!',
    'Referral code copied to clipboard.': 'Referral code copied to clipboard.',
    'Photo too large': 'Photo too large',
    'Maximum profile photo size is 5 MB.': 'Maximum profile photo size is 5 MB.',
    'Edit Profile & Avatar': 'Edit Profile & Avatar',
    'Display Username': 'Display Username',
    'Profile Photo': 'Profile Photo',
    'Upload photo from device': 'Upload photo from device',
    'Change photo from device': 'Change photo from device',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • photo stays in your device storage',
    'Save Changes': 'Save Changes'
  },
  es: {
    'Search by address, tx hash, block': 'Buscar por dirección, hash tx, bloque',
    'No transactions found': 'No se encontraron transacciones',
    'Loading...': 'Cargando...',
    'Latest Blocks': 'Últimos bloques',
    'Failed to fetch': 'Error al recuperar los datos',
    'Block list': 'Lista de bloques',
    'Transaction detail': 'Detalle de transacción',
    'Address detail': 'Detalle de dirección',
    'Go to SYS STREAM home': 'Ir al inicio de SYS STREAM',
    'Minimum Deposit': 'Depósito mínimo',
    'Minimum deposit is': 'El depósito mínimo es',
    'Awaiting Deposit': 'Esperando depósito',
    'Deposit Amount (USD)': 'Importe del depósito (USD)',
    'Select Cryptocurrency': 'Seleccionar criptomoneda',
    'Or enter custom USD amount': 'O introduce una cantidad personalizada en USD',
    'Send exactly to deposit address:': 'Enviar exactamente a la dirección de depósito:',
    'Open NOWPayments Payment Page': 'Abrir página de pago de NOWPayments',
    'Change Currency / Amount': 'Cambiar moneda / importe',
    'Deposit QR Code': 'Código QR de depósito',
    'Leaderboard & Referral': 'Clasificación y referidos',
    'Production Leaderboard': 'Clasificación de producción',
    'No production ranking data is available yet. Dummy ranking data is intentionally disabled.': 'Aún no hay datos de clasificación de producción. Los datos de prueba están desactivados.',
    'Referral Event': 'Evento de referidos',
    'Referral participation is optional. Use your wallet identity as your referral identifier.': 'La participación en referidos es opcional. Usa tu billetera como identificador de referido.',
    'Your Wallet / Referral ID': 'Tu billetera / ID de referido',
    'Copy Referral ID': 'Copiar ID de referido',
    'Live Referral Data': 'Datos de referidos en vivo',
    'Only verified production activity will be shown here.': 'Solo se mostrará aquí la actividad de producción verificada.',
    'Code Copied!': '¡Código copiado!',
    'Referral code copied to clipboard.': 'Código de referido copiado al portapapeles.',
    'Photo too large': 'Foto demasiado grande',
    'Maximum profile photo size is 5 MB.': 'El tamaño máximo de la foto de perfil es de 5 MB.',
    'Edit Profile & Avatar': 'Editar perfil y foto',
    'Display Username': 'Nombre de usuario',
    'Profile Photo': 'Foto de perfil',
    'Upload photo from device': 'Subir foto del dispositivo',
    'Change photo from device': 'Cambiar foto del dispositivo',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • la foto permanece en tu dispositivo',
    'Save Changes': 'Guardar cambios'
  },
  pt: {
    'Search by address, tx hash, block': 'Pesquisar por endereço, hash tx, bloco',
    'No transactions found': 'Nenhuma transação encontrada',
    'Loading...': 'Carregando...',
    'Latest Blocks': 'Últimos blocos',
    'Failed to fetch': 'Falha ao obter dados',
    'Block list': 'Lista de blocos',
    'Transaction detail': 'Detalhe da transação',
    'Address detail': 'Detalhes do endereço',
    'Go to SYS STREAM home': 'Ir para o início do SYS STREAM',
    'Minimum Deposit': 'Depósito mínimo',
    'Minimum deposit is': 'O depósito mínimo é',
    'Awaiting Deposit': 'Aguardando depósito',
    'Deposit Amount (USD)': 'Valor do depósito (USD)',
    'Select Cryptocurrency': 'Selecionar criptomoeda',
    'Or enter custom USD amount': 'Ou insira um valor personalizado em USD',
    'Send exactly to deposit address:': 'Envie exatamente para o endereço de depósito:',
    'Open NOWPayments Payment Page': 'Abrir página de pagamento do NOWPayments',
    'Change Currency / Amount': 'Alterar moeda / valor',
    'Deposit QR Code': 'QR Code de depósito',
    'Leaderboard & Referral': 'Classificação e indicações',
    'Production Leaderboard': 'Classificação de produção',
    'No production ranking data is available yet. Dummy ranking data is intentionally disabled.': 'Ainda não há dados de classificação de produção. Os dados de teste estão desativados.',
    'Referral Event': 'Evento de indicação',
    'Referral participation is optional. Use your wallet identity as your referral identifier.': 'A participação em indicações é opcional. Use sua carteira como identificador.',
    'Your Wallet / Referral ID': 'Sua carteira / ID de indicação',
    'Copy Referral ID': 'Copiar ID de indicação',
    'Live Referral Data': 'Dados de indicações ao vivo',
    'Only verified production activity will be shown here.': 'Apenas atividades de produção verificadas serão exibidas aqui.',
    'Code Copied!': 'Código copiado!',
    'Referral code copied to clipboard.': 'Código de indicação copiado para a área de transferência.',
    'Photo too large': 'Foto muito grande',
    'Maximum profile photo size is 5 MB.': 'O tamanho máximo da foto de perfil é de 5 MB.',
    'Edit Profile & Avatar': 'Editar perfil e foto',
    'Display Username': 'Nome de usuário',
    'Profile Photo': 'Foto de perfil',
    'Upload photo from device': 'Enviar foto do dispositivo',
    'Change photo from device': 'Alterar foto do dispositivo',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • a foto permanece no seu dispositivo',
    'Save Changes': 'Salvar alterações'
  },
  zh: {
    'Search by address, tx hash, block': '按地址、交易哈希或区块搜索',
    'No transactions found': '未找到交易',
    'Loading...': '加载中...',
    'Latest Blocks': '最新区块',
    'Failed to fetch': '获取数据失败',
    'Block list': '区块列表',
    'Transaction detail': '交易详情',
    'Address detail': '地址详情',
    'Go to SYS STREAM home': '前往 SYS STREAM 首页',
    'Minimum Deposit': '最低充值',
    'Minimum deposit is': '最低充值金额为',
    'Awaiting Deposit': '等待充值',
    'Deposit Amount (USD)': '充值金额 (USD)',
    'Select Cryptocurrency': '选择加密货币',
    'Or enter custom USD amount': '或输入自定义 USD 金额',
    'Send exactly to deposit address:': '请精准发送至此充值地址：',
    'Open NOWPayments Payment Page': '打开 NOWPayments 支付页面',
    'Change Currency / Amount': '更改币种 / 金额',
    'Deposit QR Code': '充值二维码',
    'Leaderboard & Referral': '排行榜与推荐',
    'Production Leaderboard': '生产环境排行榜',
    'No production ranking data is available yet. Dummy ranking data is intentionally disabled.': '暂无生产环境排名数据。测试排名数据已禁用。',
    'Referral Event': '推荐活动',
    'Referral participation is optional. Use your wallet identity as your referral identifier.': '参与推荐活动为可选项目。请使用您的钱包身份作为推荐标识符。',
    'Your Wallet / Referral ID': '您的钱包 / 推荐 ID',
    'Copy Referral ID': '复制推荐 ID',
    'Live Referral Data': '实时推荐数据',
    'Only verified production activity will be shown here.': '此处仅显示经过验证的生产环境活动。',
    'Code Copied!': '代码已复制！',
    'Referral code copied to clipboard.': '推荐代码已复制到剪贴板。',
    'Photo too large': '照片过大',
    'Maximum profile photo size is 5 MB.': '个人资料照片的最大大小为 5 MB。',
    'Edit Profile & Avatar': '管理个人资料和头像',
    'Display Username': '显示用户名',
    'Profile Photo': '头像',
    'Upload photo from device': '从设备上传照片',
    'Change photo from device': '从设备更换照片',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG、PNG、WEBP • 照片保存在您的设备存储中',
    'Save Changes': '保存更改'
  },
  ja: {
    'Search by address, tx hash, block': 'アドレス、txハッシュ、ブロックで検索',
    'No transactions found': '取引が見つかりません',
    'Loading...': '読み込み中...',
    'Latest Blocks': '最新のブロック',
    'Failed to fetch': 'データの取得に失敗しました',
    'Block list': 'ブロックリスト',
    'Transaction detail': '取引の詳細',
    'Address detail': 'アドレスの詳細',
    'Go to SYS STREAM home': 'SYS STREAM ホームへ',
    'Minimum Deposit': '最低入金額',
    'Minimum deposit is': '最低入金額は',
    'Awaiting Deposit': '入金待ち',
    'Deposit Amount (USD)': '入金額 (USD)',
    'Select Cryptocurrency': '暗号資産を選択',
    'Or enter custom USD amount': 'または指定のUSD金額を入力',
    'Send exactly to deposit address:': '指定の入金アドレスへ正確に送信してください：',
    'Open NOWPayments Payment Page': 'NOWPayments 決済ページを開く',
    'Change Currency / Amount': '通貨 / 金額を変更',
    'Deposit QR Code': '入金QRコード',
    'Leaderboard & Referral': 'ランキング＆紹介',
    'Production Leaderboard': '本番ランキング',
    'No production ranking data is available yet. Dummy ranking data is intentionally disabled.': '本番のランキングデータはまだありません。ダミーデータは無効化されています。',
    'Referral Event': '紹介イベント',
    'Referral participation is optional. Use your wallet identity as your referral identifier.': '紹介への参加は任意です。ウォレット識別子を紹介IDとして使用します。',
    'Your Wallet / Referral ID': 'あなたのウォレット / 紹介 ID',
    'Copy Referral ID': '紹介 ID をコピー',
    'Live Referral Data': 'リアルタイム紹介データ',
    'Only verified production activity will be shown here.': '検証済みの本番アクティビティのみ表示されます。',
    'Code Copied!': 'コードをコピーしました！',
    'Referral code copied to clipboard.': '紹介コードをクリップボードにコピーしました。',
    'Photo too large': '写真が大きすぎます',
    'Maximum profile photo size is 5 MB.': 'プロフィール写真の最大サイズは 5 MB です。',
    'Edit Profile & Avatar': 'プロフィールと写真を管理',
    'Display Username': 'ユーザー名',
    'Profile Photo': 'プロフィール写真',
    'Upload photo from device': '端末から写真をアップロード',
    'Change photo from device': '端末から写真を変更',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG、PNG、WEBP • 写真は端末ストレージに保存されます',
    'Save Changes': '変更を保存'
  },
  ko: {
    'Search by address, tx hash, block': '주소, tx 해시, 블록으로 검색',
    'No transactions found': '거래를 찾을 수 없습니다',
    'Loading...': '로딩 중...',
    'Latest Blocks': '최신 블록',
    'Failed to fetch': '데이터를 가져오지 못했습니다',
    'Block list': '블록 목록',
    'Transaction detail': '거래 상세',
    'Address detail': '주소 상세',
    'Go to SYS STREAM home': 'SYS STREAM 홈으로 이동',
    'Minimum Deposit': '최소 예치금',
    'Minimum deposit is': '최소 예치금은',
    'Awaiting Deposit': '예치 대기 중',
    'Deposit Amount (USD)': '예치 금액 (USD)',
    'Select Cryptocurrency': '암호화폐 선택',
    'Or enter custom USD amount': '또는 맞춤 USD 금액 입력',
    'Send exactly to deposit address:': '예치 주소로 정확히 전송하세요:',
    'Open NOWPayments Payment Page': 'NOWPayments 결제 페이지 열기',
    'Change Currency / Amount': '통화 / 금액 변경',
    'Deposit QR Code': '예치 QR 코드',
    'Leaderboard & Referral': '순위표 및 추천',
    'Production Leaderboard': '프로덕션 순위표',
    'No production ranking data is available yet. Dummy ranking data is intentionally disabled.': '프로덕션 순위 데이터가 아직 없습니다. 테스트 데이터는 비활성화되어 있습니다.',
    'Referral Event': '추천 이벤트',
    'Referral participation is optional. Use your wallet identity as your referral identifier.': '추천 참여는 선택 사항입니다. 지갑 식별자를 추천 ID로 사용하세요.',
    'Your Wallet / Referral ID': '내 지갑 / 추천 ID',
    'Copy Referral ID': '추천 ID 복사',
    'Live Referral Data': '실시간 추천 데이터',
    'Only verified production activity will be shown here.': '인증된 프로덕션 활동만 여기에 표시됩니다.',
    'Code Copied!': '코드 복사됨!',
    'Referral code copied to clipboard.': '추천 코드가 클립보드에 복사되었습니다.',
    'Photo too large': '사진이 너무 큽니다',
    'Maximum profile photo size is 5 MB.': '프로필 사진의 최대 크기는 5MB입니다.',
    'Edit Profile & Avatar': '프로필 및 사진 관리',
    'Display Username': '사용자 이름',
    'Profile Photo': '프로필 사진',
    'Upload photo from device': '기기에서 사진 업로드',
    'Change photo from device': '기기에서 사진 변경',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG, PNG, WEBP • 사진은 기기 저장소에 유지됩니다',
    'Save Changes': '변경 사항 저장'
  },
  ar: {
    'Search by address, tx hash, block': 'البحث حسب العنوان أو هاش المعاملة أو الكتلة',
    'No transactions found': 'لم يتم العثور على معاملات',
    'Loading...': 'جارٍ التحميل...',
    'Latest Blocks': 'أحدث الكتل',
    'Failed to fetch': 'تعذر جلب البيانات',
    'Block list': 'قائمة الكتل',
    'Transaction detail': 'تفاصيل المعاملة',
    'Address detail': 'تفاصيل العنوان',
    'Go to SYS STREAM home': 'الانتقال إلى الرئيسية SYS STREAM',
    'Minimum Deposit': 'الحد الأدنى للإيداع',
    'Minimum deposit is': 'الحد الأدنى للإيداع هو',
    'Awaiting Deposit': 'في انتظار الإيداع',
    'Deposit Amount (USD)': 'مبلغ الإيداع (USD)',
    'Select Cryptocurrency': 'اختر العملة المشفرة',
    'Or enter custom USD amount': 'أو أدخل مبلغًا مخصصًا بالدولار',
    'Send exactly to deposit address:': 'أرسل بالضبط إلى عنوان الإيداع:',
    'Open NOWPayments Payment Page': 'فتح صفحة دفع NOWPayments',
    'Change Currency / Amount': 'تغيير العملة / المبلغ',
    'Deposit QR Code': 'رمز QR للإيداع',
    'Leaderboard & Referral': 'المتصدرون والإحالات',
    'Production Leaderboard': 'لوحة المتصدرين الفعليين',
    'No production ranking data is available yet. Dummy ranking data is intentionally disabled.': 'لا تتوفر بيانات تصنيف فعلية بعد. تم إيقاف بيانات التصنيف الوهمية.',
    'Referral Event': 'فعالية الإحالة',
    'Referral participation is optional. Use your wallet identity as your referral identifier.': 'المشاركة في الإحالة اختيارية. استخدم عنوان محفظتك كمعرّف للإحالة.',
    'Your Wallet / Referral ID': 'محفظتك / معرّف الإحالة',
    'Copy Referral ID': 'نسخ معرّف الإحالة',
    'Live Referral Data': 'بيانات الإحالة المباشرة',
    'Only verified production activity will be shown here.': 'ستظهر النشاطات الموثقة فقط هنا.',
    'Code Copied!': 'تم نسخ الرمز!',
    'Referral code copied to clipboard.': 'تم نسخ رمز الإحالة إلى الحافظة.',
    'Photo too large': 'الصورة كبيرة جدًا',
    'Maximum profile photo size is 5 MB.': 'الحد الأقصى لحجم صورة الملف الشخصي هو 5 ميجابايت.',
    'Edit Profile & Avatar': 'إدارة الملف والصورة',
    'Display Username': 'اسم المستخدم',
    'Profile Photo': 'صورة الملف الشخصي',
    'Upload photo from device': 'رفع صورة من الجهاز',
    'Change photo from device': 'تغيير الصورة من الجهاز',
    'JPG, PNG, WEBP • photo stays from your device storage': 'JPG وPNG وWEBP • تبقى الصورة في مساحة تخزين جهازك',
    'Save Changes': 'حفظ التغييرات'
  }
};


Object.assign(translations.id, {
  'Miss SYS': 'Miss SYS',
  'Read-only account assistant': 'Asisten akun read-only',
  'Ask about your balance, airdrop rewards, or recent transactions.': 'Tanyakan tentang saldo, reward airdrop, atau transaksi terbaru Anda.',
  'Ask Miss SYS...': 'Tanya Miss SYS...',
  'AI is temporarily unavailable.': 'AI sedang tidak tersedia sementara.',
  Close: 'Tutup',
  Send: 'Kirim',
});
Object.assign(translations.en, {
  'Miss SYS': 'Miss SYS',
  'Read-only account assistant': 'Read-only account assistant',
  'Ask about your balance, airdrop rewards, or recent transactions.': 'Ask about your balance, airdrop rewards, or recent transactions.',
  'Ask Miss SYS...': 'Ask Miss SYS...',
  'AI is temporarily unavailable.': 'AI is temporarily unavailable.',
  Close: 'Close',
  Send: 'Send',
});
Object.assign(translations.es, {
  'Miss SYS': 'Miss SYS',
  'Read-only account assistant': 'Asistente de cuenta de solo lectura',
  'Ask about your balance, airdrop rewards, or recent transactions.': 'Pregunta sobre tu saldo, recompensas del airdrop o transacciones recientes.',
  'Ask Miss SYS...': 'Pregunta a Miss SYS...',
  'AI is temporarily unavailable.': 'La IA no está disponible temporalmente.',
  Close: 'Cerrar',
  Send: 'Enviar',
});
Object.assign(translations.pt, {
  'Miss SYS': 'Miss SYS',
  'Read-only account assistant': 'Assistente de conta somente leitura',
  'Ask about your balance, airdrop rewards, or recent transactions.': 'Pergunte sobre seu saldo, recompensas do airdrop ou transações recentes.',
  'Ask Miss SYS...': 'Pergunte ao Miss SYS...',
  'AI is temporarily unavailable.': 'A IA está temporariamente indisponível.',
  Close: 'Fechar',
  Send: 'Enviar',
});
Object.assign(translations.zh, {
  'Miss SYS': 'Miss SYS',
  'Read-only account assistant': '只读账户助手',
  'Ask about your balance, airdrop rewards, or recent transactions.': '可以询问余额、空投奖励或最近的交易。',
  'Ask Miss SYS...': '询问 Miss SYS...',
  'AI is temporarily unavailable.': 'AI 暂时不可用。',
  Close: '关闭',
  Send: '发送',
});
Object.assign(translations.ja, {
  'Miss SYS': 'Miss SYS',
  'Read-only account assistant': '読み取り専用アカウントアシスタント',
  'Ask about your balance, airdrop rewards, or recent transactions.': '残高、エアドロップ報酬、最近の取引について質問できます。',
  'Ask Miss SYS...': 'Miss SYS に質問…',
  'AI is temporarily unavailable.': 'AI は一時的に利用できません。',
  Close: '閉じる',
  Send: '送信',
});
Object.assign(translations.ko, {
  'Miss SYS': 'Miss SYS',
  'Read-only account assistant': '읽기 전용 계정 도우미',
  'Ask about your balance, airdrop rewards, or recent transactions.': '잔액, 에어드롭 보상 또는 최근 거래에 대해 질문하세요.',
  'Ask Miss SYS...': 'Miss SYS에게 질문...',
  'AI is temporarily unavailable.': 'AI를 일시적으로 사용할 수 없습니다.',
  Close: '닫기',
  Send: '보내기',
});
Object.assign(translations.ar, {
  'Miss SYS': 'Miss SYS',
  'Read-only account assistant': 'مساعد حساب للقراءة فقط',
  'Ask about your balance, airdrop rewards, or recent transactions.': 'اسأل عن رصيدك أو مكافآت الإيردروب أو معاملاتك الأخيرة.',
  'Ask Miss SYS...': 'اسأل Miss SYS...',
  'AI is temporarily unavailable.': 'الذكاء الاصطناعي غير متاح مؤقتًا.',
  Close: 'إغلاق',
  Send: 'إرسال',
});


Object.assign(translations.id, {
  'Balance History': 'Riwayat Saldo',
  'Recent balance changes and financial activity.': 'Perubahan saldo dan aktivitas keuangan terbaru.',
  'Refresh balance history': 'Segarkan riwayat saldo',
  'Loading balance history...': 'Memuat riwayat saldo...',
  'No balance history yet.': 'Belum ada riwayat saldo.',
  'Owner/Admin Balance Adjustment': 'Perubahan Saldo oleh Owner/Admin',
  'Transaction': 'Transaksi',
  'Previous Balance': 'Saldo Sebelumnya',
  'New Balance': 'Saldo Baru',
  'Owner Note': 'Catatan Owner',
});
Object.assign(translations.en, {
  'Balance History': 'Balance History',
  'Recent balance changes and financial activity.': 'Recent balance changes and financial activity.',
  'Refresh balance history': 'Refresh balance history',
  'Loading balance history...': 'Loading balance history...',
  'No balance history yet.': 'No balance history yet.',
  'Owner/Admin Balance Adjustment': 'Owner/Admin Balance Adjustment',
  'Transaction': 'Transaction',
  'Previous Balance': 'Previous Balance',
  'New Balance': 'New Balance',
  'Owner Note': 'Owner Note',
});
Object.assign(translations.es, {
  'Balance History': 'Historial de saldo',
  'Recent balance changes and financial activity.': 'Cambios recientes de saldo y actividad financiera.',
  'Refresh balance history': 'Actualizar historial de saldo',
  'Loading balance history...': 'Cargando historial de saldo...',
  'No balance history yet.': 'Aún no hay historial de saldo.',
  'Owner/Admin Balance Adjustment': 'Ajuste de saldo por Owner/Admin',
  'Transaction': 'Transacción',
  'Previous Balance': 'Saldo anterior',
  'New Balance': 'Nuevo saldo',
  'Owner Note': 'Nota del Owner',
});
Object.assign(translations.pt, {
  'Balance History': 'Histórico de saldo',
  'Recent balance changes and financial activity.': 'Alterações recentes de saldo e atividade financeira.',
  'Refresh balance history': 'Atualizar histórico de saldo',
  'Loading balance history...': 'Carregando histórico de saldo...',
  'No balance history yet.': 'Ainda não há histórico de saldo.',
  'Owner/Admin Balance Adjustment': 'Ajuste de saldo pelo Owner/Admin',
  'Transaction': 'Transação',
  'Previous Balance': 'Saldo anterior',
  'New Balance': 'Novo saldo',
  'Owner Note': 'Nota do Owner',
});
Object.assign(translations.zh, {
  'Balance History': '余额记录',
  'Recent balance changes and financial activity.': '最近的余额变更和财务活动。',
  'Refresh balance history': '刷新余额记录',
  'Loading balance history...': '正在加载余额记录...',
  'No balance history yet.': '暂无余额记录。',
  'Owner/Admin Balance Adjustment': 'Owner/Admin 余额调整',
  'Transaction': '交易',
  'Previous Balance': '调整前余额',
  'New Balance': '新余额',
  'Owner Note': 'Owner 备注',
});
Object.assign(translations.ja, {
  'Balance History': '残高履歴',
  'Recent balance changes and financial activity.': '最近の残高変更と金融アクティビティ。',
  'Refresh balance history': '残高履歴を更新',
  'Loading balance history...': '残高履歴を読み込み中...',
  'No balance history yet.': '残高履歴はまだありません。',
  'Owner/Admin Balance Adjustment': 'Owner/Admin による残高調整',
  'Transaction': '取引',
  'Previous Balance': '変更前残高',
  'New Balance': '新しい残高',
  'Owner Note': 'Owner メモ',
});
Object.assign(translations.ko, {
  'Balance History': '잔액 기록',
  'Recent balance changes and financial activity.': '최근 잔액 변경 및 금융 활동',
  'Refresh balance history': '잔액 기록 새로고침',
  'Loading balance history...': '잔액 기록을 불러오는 중...',
  'No balance history yet.': '아직 잔액 기록이 없습니다.',
  'Owner/Admin Balance Adjustment': 'Owner/Admin 잔액 조정',
  'Transaction': '거래',
  'Previous Balance': '이전 잔액',
  'New Balance': '새 잔액',
  'Owner Note': 'Owner 메모',
});
Object.assign(translations.ar, {
  'Balance History': 'سجل الرصيد',
  'Recent balance changes and financial activity.': 'أحدث تغييرات الرصيد والأنشطة المالية.',
  'Refresh balance history': 'تحديث سجل الرصيد',
  'Loading balance history...': 'جارٍ تحميل سجل الرصيد...',
  'No balance history yet.': 'لا يوجد سجل للرصيد بعد.',
  'Owner/Admin Balance Adjustment': 'تعديل الرصيد بواسطة Owner/Admin',
  'Transaction': 'معاملة',
  'Previous Balance': 'الرصيد السابق',
  'New Balance': 'الرصيد الجديد',
  'Owner Note': 'ملاحظة Owner',
});

for (const lang of Object.keys(ALL_EXPLORER_AND_UI_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], ALL_EXPLORER_AND_UI_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...ALL_EXPLORER_AND_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}
