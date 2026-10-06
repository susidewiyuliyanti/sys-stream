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
  { code: 'zh', label: 'Chinese', native: 'ä¸­æ–‡' },
  { code: 'ja', label: 'Japanese', native: 'æ—¥æœ¬èªž' },
  { code: 'ko', label: 'Korean', native: 'í•œêµ­ì–´' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

const translations: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Live, komunitas, dan postingan dari pengguna SYS STREAM.',
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
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Live, community, and posts from SYS STREAM users.',
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
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Directos, comunidad y publicaciones de usuarios de SYS STREAM.',
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
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'Lives, comunidade e publicações dos usuários do SYS STREAM.',
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
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'SYS STREAMユーザーのライブ、コミュニティ、投稿。',
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
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'SYS STREAM 사용자의 라이브, 커뮤니티 및 게시물입니다.',
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
    'Live, komunitas, dan postingan dari pengguna SYS STREAM.': 'البث المباشر والمجتمع والمنشورات من مستخدمي SYS STREAM.',
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
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'æ»¡è¶³æœ€ä½Žæœ‰æ•ˆé”å®šæ¡ä»¶å³å¯ä½¿ç”¨ã€‚æ¯æ—¥å¥–åŠ±ç”±æœåŠ¡å™¨å¤„ç†å¹¶è®¡å…¥æ‚¨çš„å¯ç”¨ä½™é¢ã€‚'
});
Object.assign(translations.ja, {
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'æœ€ä½Žã‚¢ã‚¯ãƒ†ã‚£ãƒ–ãƒ­ãƒƒã‚¯ã§åˆ©ç”¨ã§ãã¾ã™ã€‚ãƒ‡ã‚¤ãƒªãƒ¼å ±é…¬ã¯ã‚µãƒ¼ãƒãƒ¼ã§å‡¦ç†ã•ã‚Œã€åˆ©ç”¨å¯èƒ½æ®‹é«˜ã«åŠ ç®—ã•ã‚Œã¾ã™ã€‚'
});
Object.assign(translations.ko, {
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'ìµœì†Œ í™œì„± ë½ ì¡°ê±´ì—ì„œ ì´ìš©í•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤. ì¼ì¼ ë³´ìƒì€ ì„œë²„ì—ì„œ ì²˜ë¦¬ë˜ì–´ ì‚¬ìš© ê°€ëŠ¥í•œ ìž”ì•¡ì— ì¶”ê°€ë©ë‹ˆë‹¤.'
});
Object.assign(translations.ar, {
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'متاح عند استيفاء الحد الأدنى للقفل النشط. تتم معالجة المكافآت اليومية بواسطة الخادم وإضافتها إلى رصيدك المتاح.'
});

/* BLIND_BOX_8_LANGUAGE_TRANSLATIONS */

// Blind Box UI â€” explicit 8-language translations.
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
  'Daily reward credited to balance': 'æ¯æ—¥å¥–åŠ±å·²è®¡å…¥ä½™é¢',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'æ›´é«˜é”å®šç­‰çº§ï¼ŒåŒ…å«ç¨€æœ‰æ”¶è—å“ã€‚è´¢åŠ¡å¥–åŠ±ç”±æœåŠ¡å™¨å†³å®šã€‚',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'é«˜çº§é”å®šç­‰çº§ï¼ŒåŒ…å«ç¨€æœ‰æ”¶è—å“ã€‚è´¢åŠ¡å¥–åŠ±ç”±æœåŠ¡å™¨å†³å®šã€‚',
  'Daily claim limit remains 1 box per day.': 'æ¯æ—¥é¢†å–é™åˆ¶ä»ä¸ºæ¯å¤© 1 ä¸ªç›²ç›’ã€‚',
  'Server is determining your reward...': '服务器正在确定您的奖励……',
  'Daily Blind Box Reward': 'æ¯æ—¥ Blind Box å¥–åŠ±',
  'Lock Balance Now': 'ç«‹å³é”å®šä½™é¢',
  'Opening Mystery Vault!': 'æ­£åœ¨æ‰“å¼€ç¥žç§˜å®åº“ï¼',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'æ»¡è¶³æœ€ä½Žæœ‰æ•ˆé”å®šå³å¯ä½¿ç”¨ã€‚æ¯æ—¥å¥–åŠ±ç”±æœåŠ¡å™¨å¤„ç†å¹¶åŠ å…¥æ‚¨çš„å¯ç”¨ä½™é¢ã€‚',
});

Object.assign(translations.ja, {
  'Daily reward credited to balance': 'ãƒ‡ã‚¤ãƒªãƒ¼å ±é…¬ãŒæ®‹é«˜ã«åŠ ç®—ã•ã‚Œã¾ã—ãŸ',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'ãƒ¬ã‚¢ã‚³ãƒ¬ã‚¯ã‚·ãƒ§ãƒ³ã‚’å«ã‚€ä¸Šä½ãƒ­ãƒƒã‚¯ãƒ†ã‚£ã‚¢ã€‚é‡‘éŠ­çš„å ±é…¬ã¯ã‚µãƒ¼ãƒãƒ¼ã«ã‚ˆã£ã¦æ±ºå®šã•ã‚Œã¾ã™ã€‚',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'ãƒ¬ã‚¢ã‚³ãƒ¬ã‚¯ã‚·ãƒ§ãƒ³ã‚’å«ã‚€é«˜ãƒ­ãƒƒã‚¯ãƒ†ã‚£ã‚¢ã€‚é‡‘éŠ­çš„å ±é…¬ã¯ã‚µãƒ¼ãƒãƒ¼ã«ã‚ˆã£ã¦æ±ºå®šã•ã‚Œã¾ã™ã€‚',
  'Daily claim limit remains 1 box per day.': 'ãƒ‡ã‚¤ãƒªãƒ¼å—å–ä¸Šé™ã¯1æ—¥1ãƒœãƒƒã‚¯ã‚¹ã§ã™ã€‚',
  'Server is determining your reward...': 'サーバーが報酬を決定しています……',
  'Daily Blind Box Reward': 'ãƒ‡ã‚¤ãƒªãƒ¼Blind Boxå ±é…¬',
  'Lock Balance Now': 'ä»Šã™ãæ®‹é«˜ã‚’ãƒ­ãƒƒã‚¯',
  'Opening Mystery Vault!': 'ãƒŸã‚¹ãƒ†ãƒªãƒ¼ãƒœãƒ«ãƒˆã‚’é–‹ã„ã¦ã„ã¾ã™ï¼',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'æœ€ä½Žã‚¢ã‚¯ãƒ†ã‚£ãƒ–ãƒ­ãƒƒã‚¯ã§åˆ©ç”¨ã§ãã¾ã™ã€‚ãƒ‡ã‚¤ãƒªãƒ¼å ±é…¬ã¯ã‚µãƒ¼ãƒãƒ¼ã§å‡¦ç†ã•ã‚Œã€åˆ©ç”¨å¯èƒ½æ®‹é«˜ã«è¿½åŠ ã•ã‚Œã¾ã™ã€‚',
});

Object.assign(translations.ko, {
  'Daily reward credited to balance': 'ì¼ì¼ ë³´ìƒì´ ìž”ì•¡ì— ì ë¦½ë˜ì—ˆìŠµë‹ˆë‹¤',
  'Higher lock tier with rare collectibles. Financial rewards are determined by the server.': 'í¬ê·€ ìˆ˜ì§‘í’ˆì´ í¬í•¨ëœ ìƒìœ„ ë½ í‹°ì–´ìž…ë‹ˆë‹¤. ê¸ˆìœµ ë³´ìƒì€ ì„œë²„ì—ì„œ ê²°ì •í•©ë‹ˆë‹¤.',
  'High lock tier with rare collectibles. Financial rewards are determined by the server.': 'í¬ê·€ ìˆ˜ì§‘í’ˆì´ í¬í•¨ëœ ë†’ì€ ë½ í‹°ì–´ìž…ë‹ˆë‹¤. ê¸ˆìœµ ë³´ìƒì€ ì„œë²„ì—ì„œ ê²°ì •í•©ë‹ˆë‹¤.',
  'Daily claim limit remains 1 box per day.': 'ì¼ì¼ ìˆ˜ë ¹ í•œë„ëŠ” í•˜ë£¨ 1ë°•ìŠ¤ë¡œ ìœ ì§€ë©ë‹ˆë‹¤.',
  'Server is determining your reward...': 'ì„œë²„ê°€ ë³´ìƒì„ ê²°ì •í•˜ê³  ìžˆìŠµë‹ˆë‹¤...',
  'Daily Blind Box Reward': 'ì¼ì¼ Blind Box ë³´ìƒ',
  'Lock Balance Now': 'ì§€ê¸ˆ ìž”ì•¡ ìž ê¸ˆ',
  'Opening Mystery Vault!': 'ë¯¸ìŠ¤í„°ë¦¬ ë³¼íŠ¸ë¥¼ ì—¬ëŠ” ì¤‘!',
  'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.': 'ìµœì†Œ í™œì„± ë½ìœ¼ë¡œ ì´ìš©í•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤. ì¼ì¼ ë³´ìƒì€ ì„œë²„ì—ì„œ ì²˜ë¦¬ë˜ì–´ ì‚¬ìš© ê°€ëŠ¥í•œ ìž”ì•¡ì— ì¶”ê°€ë©ë‹ˆë‹¤.',
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
  'Wallet Identity':'Identitas Wallet','CONNECTING WALLET...':'MENGHUBUNGKAN WALLET...','Wallet Connected':'Wallet Terhubung',
  'Connect Wallet for Registration':'Hubungkan Wallet untuk Registrasi','Register Now':'Daftar Sekarang','Forgot Password?':'Lupa Kata Sandi?',
  'Verify your email':'Verifikasi email Anda','or Connect with Crypto Wallet':'atau Hubungkan dengan Crypto Wallet',
  'Install MetaMask atau wallet Web3 terlebih dahulu.':'Install MetaMask atau wallet Web3 terlebih dahulu.',
  'Wallet address tidak ditemukan.':'Alamat wallet tidak ditemukan.','Gagal menghubungkan wallet.':'Gagal menghubungkan wallet.',
  'Wallet ini akan menjadi identitas User ID dan referral link akun Anda.':'Wallet ini akan menjadi identitas User ID dan referral link akun Anda.',
  'Akun dibuat. Silakan verifikasi email sebelum login.':'Akun dibuat. Silakan verifikasi email sebelum login.'
});
Object.assign(translations.en, {
  'Wallet Identity':'Wallet Identity','CONNECTING WALLET...':'CONNECTING WALLET...','Wallet Connected':'Wallet Connected',
  'Connect Wallet for Registration':'Connect Wallet for Registration','Register Now':'Register Now','Forgot Password?':'Forgot Password?',
  'Verify your email':'Verify your email','or Connect with Crypto Wallet':'or Connect with Crypto Wallet',
  'Install MetaMask atau wallet Web3 terlebih dahulu.':'Install MetaMask or a Web3 wallet first.',
  'Wallet address tidak ditemukan.':'Wallet address was not found.','Gagal menghubungkan wallet.':'Failed to connect wallet.',
  'Wallet ini akan menjadi identitas User ID dan referral link akun Anda.':'This wallet will be your User ID identity and account referral link.',
  'Akun dibuat. Silakan verifikasi email sebelum login.':'Account created. Please verify your email before logging in.'
});
Object.assign(translations.es, {
  'Wallet Identity':'Identidad de la wallet','CONNECTING WALLET...':'CONECTANDO WALLET...','Wallet Connected':'Wallet conectada',
  'Connect Wallet for Registration':'Conectar wallet para registrarse','Register Now':'Registrarse ahora','Forgot Password?':'¿Olvidaste la contraseña?',
  'Verify your email':'Verifica tu correo','or Connect with Crypto Wallet':'o conectar con una wallet'
});
Object.assign(translations.pt, {
  'Wallet Identity':'Identidade da carteira','CONNECTING WALLET...':'CONECTANDO CARTEIRA...','Wallet Connected':'Carteira conectada',
  'Connect Wallet for Registration':'Conectar carteira para cadastro','Register Now':'Registrar agora','Forgot Password?':'Esqueceu a senha?',
  'Verify your email':'Verifique seu e-mail','or Connect with Crypto Wallet':'ou conectar com carteira cripto'
});
Object.assign(translations.zh, {
  'Wallet Identity':'é’±åŒ…èº«ä»½','CONNECTING WALLET...':'正在连接钱包…','Wallet Connected':'é’±åŒ…å·²è¿žæŽ¥',
  'Connect Wallet for Registration':'è¿žæŽ¥é’±åŒ…è¿›è¡Œæ³¨å†Œ','Register Now':'ç«‹å³æ³¨å†Œ','Forgot Password?':'å¿˜è®°å¯†ç ï¼Ÿ',
  'Verify your email':'éªŒè¯æ‚¨çš„é‚®ç®±','or Connect with Crypto Wallet':'æˆ–è¿žæŽ¥åŠ å¯†é’±åŒ…'
});
Object.assign(translations.ja, {
  'Wallet Identity':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆID','CONNECTING WALLET...':'ウォレット接続中…','Wallet Connected':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆæŽ¥ç¶šæ¸ˆã¿',
  'Connect Wallet for Registration':'ç™»éŒ²ç”¨ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š','Register Now':'ä»Šã™ãç™»éŒ²','Forgot Password?':'ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ã‚’å¿˜ã‚Œã¾ã—ãŸã‹ï¼Ÿ',
  'Verify your email':'ãƒ¡ãƒ¼ãƒ«ã‚’ç¢ºèª','or Connect with Crypto Wallet':'ã¾ãŸã¯æš—å·è³‡ç”£ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š'
});
Object.assign(translations.ko, {
  'Wallet Identity':'ì§€ê°‘ ID','CONNECTING WALLET...':'ì§€ê°‘ ì—°ê²° ì¤‘...','Wallet Connected':'ì§€ê°‘ ì—°ê²°ë¨',
  'Connect Wallet for Registration':'ê°€ìž…ìš© ì§€ê°‘ ì—°ê²°','Register Now':'ì§€ê¸ˆ ê°€ìž…','Forgot Password?':'ë¹„ë°€ë²ˆí˜¸ë¥¼ ìžŠìœ¼ì…¨ë‚˜ìš”?',
  'Verify your email':'ì´ë©”ì¼ ì¸ì¦','or Connect with Crypto Wallet':'ë˜ëŠ” ì•”í˜¸í™”í ì§€ê°‘ ì—°ê²°'
});
Object.assign(translations.ar, {
  'Wallet Identity':'هوية المحفظة','CONNECTING WALLET...':'جارٍ ربط المحفظة...','Wallet Connected':'تم ربط المحفظة',
  'Connect Wallet for Registration':'ربط المحفظة للتسجيل','Register Now':'سجّل الآن','Forgot Password?':'هل نسيت كلمة المرور؟',
  'Verify your email':'تحقق من بريدك الإلكتروني','or Connect with Crypto Wallet':'أو ربط محفظة العملات الرقمية'
});



const AUTH_EXTRA_UI: Record<LanguageCode, Record<string,string>> = {
 id:{"Don't have an account?":"Belum punya akun?","Secured with Web3":"Diamankan dengan Web3","Biometric Login Available":"Login biometrik tersedia","Register Now":"Generate Wallet"},
 en:{"Don't have an account?":"Don't have an account?","Secured with Web3":"Secured with Web3","Biometric Login Available":"Biometric Login Available","Register Now":"Generate Wallet"},
 es:{"Don't have an account?":"¿No tienes una cuenta?","Secured with Web3":"Protegido con Web3","Biometric Login Available":"Inicio de sesión biométrico disponible","Register Now":"Generar wallet"},
 pt:{"Don't have an account?":"Ainda não tem uma conta?","Secured with Web3":"Protegido com Web3","Biometric Login Available":"Login biométrico disponível","Register Now":"Gerar carteira"},
 zh:{"Don't have an account?":"è¿˜æ²¡æœ‰è´¦æˆ·ï¼Ÿ","Secured with Web3":"Web3 å®‰å…¨ä¿æŠ¤","Biometric Login Available":"æ”¯æŒç”Ÿç‰©è¯†åˆ«ç™»å½•","Register Now":"ç”Ÿæˆé’±åŒ…"},
 ja:{"Don't have an account?":"ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ãŠæŒã¡ã§ã¯ã‚ã‚Šã¾ã›ã‚“ã‹ï¼Ÿ","Secured with Web3":"Web3ã§ä¿è­·ã•ã‚Œã¦ã„ã¾ã™","Biometric Login Available":"ç”Ÿä½“èªè¨¼ãƒ­ã‚°ã‚¤ãƒ³å¯¾å¿œ","Register Now":"ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ç”Ÿæˆ"},
 ko:{"Don't have an account?":"ê³„ì •ì´ ì—†ìœ¼ì‹ ê°€ìš”?","Secured with Web3":"Web3ë¡œ ë³´í˜¸ë¨","Biometric Login Available":"ìƒì²´ ì¸ì¦ ë¡œê·¸ì¸ ì§€ì›","Register Now":"ì§€ê°‘ ìƒì„±"},
 ar:{"Don't have an account?":"ليس لديك حساب؟","Secured with Web3":"مؤمّن بواسطة Web3","Biometric Login Available":"تسجيل الدخول البيومتري متاح","Register Now":"إنشاء محفظة"}
};
for (const lang of Object.keys(AUTH_EXTRA_UI) as LanguageCode[]) Object.assign(translations[lang], AUTH_EXTRA_UI[lang]);

const WALLET_AUTH_UI: Record<LanguageCode, Record<string,string>> = {
 id:{'Generate Wallet':'Generate Wallet','Create SYS Account':'Buat Akun SYS','Welcome Back':'Selamat Datang Kembali','Login menggunakan wallet Anda.':'Login menggunakan wallet Anda.','Buat wallet baru langsung dari perangkat Anda.':'Buat wallet baru langsung dari perangkat Anda.','Login dengan Wallet':'Login dengan Wallet','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.':'Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.','Buat Wallet Baru':'Buat Wallet Baru','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.':'Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.':'Saya menyetujui Terms & Conditions dan pembuatan wallet baru.','Simpan Recovery Phrase':'Simpan Recovery Phrase','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.':'Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.':'Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.','BUAT AKUN DENGAN WALLET INI':'BUAT AKUN DENGAN WALLET INI','GENERATE WALLET':'GENERATE WALLET','LOGIN WITH WALLET':'LOGIN DENGAN WALLET','Already have a wallet?':'Sudah punya wallet?','Login with Wallet':'Login dengan Wallet','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.':'Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.','Registrasi gagal diproses di server.':'Registrasi gagal diproses di server.','Gagal membuat wallet baru.':'Gagal membuat wallet baru.','Recovery phrase gagal dibuat.':'Recovery phrase gagal dibuat.'},
 en:{'Generate Wallet':'Generate Wallet','Create SYS Account':'Create SYS Account','Welcome Back':'Welcome Back','Login menggunakan wallet Anda.':'Login using your wallet.','Buat wallet baru langsung dari perangkat Anda.':'Create a new wallet directly on your device.','Login dengan Wallet':'Login with Wallet','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.':'Connect MetaMask or another EVM wallet, then sign the login message.','Buat Wallet Baru':'Create New Wallet','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.':'No email, username, or password required. Your wallet is created directly on your device.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.':'I agree to the Terms & Conditions and creation of a new wallet.','Simpan Recovery Phrase':'Save Recovery Phrase','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.':'The recovery phrase is created on your device. SYS STREAM never receives or stores it.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.':'I have saved the recovery phrase and understand that SYS STREAM cannot recover it.','BUAT AKUN DENGAN WALLET INI':'CREATE ACCOUNT WITH THIS WALLET','GENERATE WALLET':'GENERATE WALLET','LOGIN WITH WALLET':'LOGIN WITH WALLET','Already have a wallet?':'Already have a wallet?','Login with Wallet':'Login with Wallet','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.':'Wallet created on this device. Save the recovery phrase before creating your account.','Registrasi gagal diproses di server.':'Registration could not be processed by the server.','Gagal membuat wallet baru.':'Failed to create a new wallet.','Recovery phrase gagal dibuat.':'Failed to create the recovery phrase.'},
 es:{'Generate Wallet':'Generar wallet','Create SYS Account':'Crear cuenta SYS','Welcome Back':'Bienvenido de nuevo','Login menggunakan wallet Anda.':'Inicia sesión con tu wallet.','Buat wallet baru langsung dari perangkat Anda.':'Crea una nueva wallet directamente en tu dispositivo.','Login dengan Wallet':'Iniciar sesión con wallet','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.':'Conecta MetaMask u otra wallet EVM y firma el mensaje de inicio de sesión.','Buat Wallet Baru':'Crear nueva wallet','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.':'No necesitas correo, usuario ni contraseña. La wallet se crea directamente en tu dispositivo.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.':'Acepto los Términos y condiciones y la creación de una nueva wallet.','Simpan Recovery Phrase':'Guardar frase de recuperación','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.':'La frase de recuperación se crea en tu dispositivo. SYS STREAM no la recibe ni la almacena.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.':'He guardado la frase de recuperación y entiendo que SYS STREAM no puede recuperarla.','BUAT AKUN DENGAN WALLET INI':'CREAR CUENTA CON ESTA WALLET','GENERATE WALLET':'GENERAR WALLET','LOGIN WITH WALLET':'INICIAR SESIÓN CON WALLET','Already have a wallet?':'¿Ya tienes una wallet?','Login with Wallet':'Iniciar sesión con wallet','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.':'Wallet creada en este dispositivo. Guarda la frase de recuperación antes de crear tu cuenta.','Registrasi gagal diproses di server.':'No se pudo procesar el registro en el servidor.','Gagal membuat wallet baru.':'No se pudo crear la nueva wallet.','Recovery phrase gagal dibuat.':'No se pudo crear la frase de recuperación.'},
 pt:{'Generate Wallet':'Gerar carteira','Create SYS Account':'Criar conta SYS','Welcome Back':'Bem-vindo de volta','Login menggunakan wallet Anda.':'Entre usando sua carteira.','Buat wallet baru langsung dari perangkat Anda.':'Crie uma nova carteira diretamente no seu dispositivo.','Login dengan Wallet':'Entrar com carteira','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.':'Conecte a MetaMask ou outra carteira EVM e assine a mensagem de login.','Buat Wallet Baru':'Criar nova carteira','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.':'Não é necessário e-mail, usuário ou senha. A carteira é criada diretamente no seu dispositivo.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.':'Aceito os Termos e Condições e a criação de uma nova carteira.','Simpan Recovery Phrase':'Salvar frase de recuperação','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.':'A frase de recuperação é criada no seu dispositivo. A SYS STREAM não a recebe nem armazena.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.':'Salvei a frase de recuperação e entendo que a SYS STREAM não pode recuperá-la.','BUAT AKUN DENGAN WALLET INI':'CRIAR CONTA COM ESTA CARTEIRA','GENERATE WALLET':'GERAR CARTEIRA','LOGIN WITH WALLET':'ENTRAR COM CARTEIRA','Already have a wallet?':'Já tem uma carteira?','Login with Wallet':'Entrar com carteira','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.':'Carteira criada neste dispositivo. Salve a frase de recuperação antes de criar sua conta.','Registrasi gagal diproses di server.':'Não foi possível processar o cadastro no servidor.','Gagal membuat wallet baru.':'Falha ao criar uma nova carteira.','Recovery phrase gagal dibuat.':'Falha ao criar a frase de recuperação.'},
 zh:{'Generate Wallet':'ç”Ÿæˆé’±åŒ…','Create SYS Account':'åˆ›å»º SYS è´¦æˆ·','Welcome Back':'æ¬¢è¿Žå›žæ¥','Login menggunakan wallet Anda.':'ä½¿ç”¨æ‚¨çš„é’±åŒ…ç™»å½•ã€‚','Buat wallet baru langsung dari perangkat Anda.':'ç›´æŽ¥åœ¨æ‚¨çš„è®¾å¤‡ä¸Šåˆ›å»ºæ–°é’±åŒ…ã€‚','Login dengan Wallet':'ä½¿ç”¨é’±åŒ…ç™»å½•','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.':'è¿žæŽ¥ MetaMask æˆ–å…¶ä»– EVM é’±åŒ…ï¼Œç„¶åŽç­¾ç½²ç™»å½•æ¶ˆæ¯ã€‚','Buat Wallet Baru':'åˆ›å»ºæ–°é’±åŒ…','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.':'æ— éœ€é‚®ç®±ã€ç”¨æˆ·åæˆ–å¯†ç ã€‚é’±åŒ…å°†åœ¨æ‚¨çš„è®¾å¤‡ä¸Šåˆ›å»ºã€‚','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.':'æˆ‘åŒæ„æ¡æ¬¾ä¸Žæ¡ä»¶ä»¥åŠåˆ›å»ºæ–°é’±åŒ…ã€‚','Simpan Recovery Phrase':'ä¿å­˜æ¢å¤çŸ­è¯­','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.':'æ¢å¤çŸ­è¯­åœ¨æ‚¨çš„è®¾å¤‡ä¸Šç”Ÿæˆã€‚SYS STREAM ä¸ä¼šæŽ¥æ”¶æˆ–å­˜å‚¨å®ƒã€‚','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.':'æˆ‘å·²ä¿å­˜æ¢å¤çŸ­è¯­ï¼Œå¹¶äº†è§£ SYS STREAM æ— æ³•æ¢å¤å®ƒã€‚','BUAT AKUN DENGAN WALLET INI':'ä½¿ç”¨æ­¤é’±åŒ…åˆ›å»ºè´¦æˆ·','GENERATE WALLET':'ç”Ÿæˆé’±åŒ…','LOGIN WITH WALLET':'ä½¿ç”¨é’±åŒ…ç™»å½•','Already have a wallet?':'å·²ç»æœ‰é’±åŒ…ï¼Ÿ','Login with Wallet':'ä½¿ç”¨é’±åŒ…ç™»å½•','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.':'é’±åŒ…å·²åœ¨æ­¤è®¾å¤‡ä¸Šåˆ›å»ºã€‚è¯·å…ˆä¿å­˜æ¢å¤çŸ­è¯­ã€‚','Registrasi gagal diproses di server.':'æœåŠ¡å™¨æ— æ³•å¤„ç†æ³¨å†Œã€‚','Gagal membuat wallet baru.':'åˆ›å»ºæ–°é’±åŒ…å¤±è´¥ã€‚','Recovery phrase gagal dibuat.':'åˆ›å»ºæ¢å¤çŸ­è¯­å¤±è´¥ã€‚'},
 ja:{'Generate Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ç”Ÿæˆ','Create SYS Account':'SYSã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ä½œæˆ','Welcome Back':'ãŠã‹ãˆã‚Šãªã•ã„','Login menggunakan wallet Anda.':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã§ãƒ­ã‚°ã‚¤ãƒ³ã—ã¾ã™ã€‚','Buat wallet baru langsung dari perangkat Anda.':'ç«¯æœ«ä¸Šã§æ–°ã—ã„ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ä½œæˆã—ã¾ã™ã€‚','Login dengan Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã§ãƒ­ã‚°ã‚¤ãƒ³','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.':'MetaMaskãªã©ã®EVMã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶šã—ã€ãƒ­ã‚°ã‚¤ãƒ³ãƒ¡ãƒƒã‚»ãƒ¼ã‚¸ã«ç½²åã—ã¦ãã ã•ã„ã€‚','Buat Wallet Baru':'æ–°ã—ã„ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ä½œæˆ','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.':'ãƒ¡ãƒ¼ãƒ«ã€ãƒ¦ãƒ¼ã‚¶ãƒ¼åã€ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ã¯ä¸è¦ã§ã™ã€‚ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã¯ç«¯æœ«ä¸Šã§ä½œæˆã•ã‚Œã¾ã™ã€‚','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.':'åˆ©ç”¨è¦ç´„ã«åŒæ„ã—ã€æ–°ã—ã„ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ä½œæˆã—ã¾ã™ã€‚','Simpan Recovery Phrase':'ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚ºã‚’ä¿å­˜','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.':'ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚ºã¯ç«¯æœ«ä¸Šã§ä½œæˆã•ã‚Œã¾ã™ã€‚SYS STREAMã¯å—ã‘å–ã‚Šã‚‚ä¿å­˜ã‚‚ã—ã¾ã›ã‚“ã€‚','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.':'ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚ºã‚’ä¿å­˜ã—ã€SYS STREAMã§ã¯å¾©å…ƒã§ããªã„ã“ã¨ã‚’ç†è§£ã—ã¾ã—ãŸã€‚','BUAT AKUN DENGAN WALLET INI':'ã“ã®ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã§ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ä½œæˆ','GENERATE WALLET':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ç”Ÿæˆ','LOGIN WITH WALLET':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã§ãƒ­ã‚°ã‚¤ãƒ³','Already have a wallet?':'ã™ã§ã«ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ãŠæŒã¡ã§ã™ã‹ï¼Ÿ','Login with Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã§ãƒ­ã‚°ã‚¤ãƒ³','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ã“ã®ç«¯æœ«ã§ä½œæˆã—ã¾ã—ãŸã€‚ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚ºã‚’ä¿å­˜ã—ã¦ãã ã•ã„ã€‚','Registrasi gagal diproses di server.':'ã‚µãƒ¼ãƒãƒ¼ã§ç™»éŒ²ã‚’å‡¦ç†ã§ãã¾ã›ã‚“ã§ã—ãŸã€‚','Gagal membuat wallet baru.':'æ–°ã—ã„ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã®ä½œæˆã«å¤±æ•—ã—ã¾ã—ãŸã€‚','Recovery phrase gagal dibuat.':'ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚ºã®ä½œæˆã«å¤±æ•—ã—ã¾ã—ãŸã€‚'},
 ko:{'Generate Wallet':'ì§€ê°‘ ìƒì„±','Create SYS Account':'SYS ê³„ì • ë§Œë“¤ê¸°','Welcome Back':'ë‹¤ì‹œ ì˜¤ì‹  ê²ƒì„ í™˜ì˜í•©ë‹ˆë‹¤','Login menggunakan wallet Anda.':'ì§€ê°‘ìœ¼ë¡œ ë¡œê·¸ì¸í•˜ì„¸ìš”.','Buat wallet baru langsung dari perangkat Anda.':'ê¸°ê¸°ì—ì„œ ìƒˆ ì§€ê°‘ì„ ì§ì ‘ ìƒì„±í•©ë‹ˆë‹¤.','Login dengan Wallet':'ì§€ê°‘ìœ¼ë¡œ ë¡œê·¸ì¸','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.':'MetaMask ë˜ëŠ” ë‹¤ë¥¸ EVM ì§€ê°‘ì„ ì—°ê²°í•˜ê³  ë¡œê·¸ì¸ ë©”ì‹œì§€ì— ì„œëª…í•˜ì„¸ìš”.','Buat Wallet Baru':'ìƒˆ ì§€ê°‘ ë§Œë“¤ê¸°','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.':'ì´ë©”ì¼, ì‚¬ìš©ìž ì´ë¦„ ë˜ëŠ” ë¹„ë°€ë²ˆí˜¸ê°€ í•„ìš”í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤. ì§€ê°‘ì€ ê¸°ê¸°ì—ì„œ ì§ì ‘ ìƒì„±ë©ë‹ˆë‹¤.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.':'ì´ìš©ì•½ê´€ì— ë™ì˜í•˜ê³  ìƒˆ ì§€ê°‘ì„ ìƒì„±í•©ë‹ˆë‹¤.','Simpan Recovery Phrase':'ë³µêµ¬ ë¬¸êµ¬ ì €ìž¥','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.':'ë³µêµ¬ ë¬¸êµ¬ëŠ” ê¸°ê¸°ì—ì„œ ìƒì„±ë©ë‹ˆë‹¤. SYS STREAMì€ ì´ë¥¼ ë°›ê±°ë‚˜ ì €ìž¥í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.':'ë³µêµ¬ ë¬¸êµ¬ë¥¼ ì €ìž¥í–ˆìœ¼ë©° SYS STREAMì—ì„œ ë³µêµ¬í•  ìˆ˜ ì—†ìŒì„ ì´í•´í•©ë‹ˆë‹¤.','BUAT AKUN DENGAN WALLET INI':'ì´ ì§€ê°‘ìœ¼ë¡œ ê³„ì • ë§Œë“¤ê¸°','GENERATE WALLET':'ì§€ê°‘ ìƒì„±','LOGIN WITH WALLET':'ì§€ê°‘ìœ¼ë¡œ ë¡œê·¸ì¸','Already have a wallet?':'ì´ë¯¸ ì§€ê°‘ì´ ìžˆë‚˜ìš”?','Login with Wallet':'ì§€ê°‘ìœ¼ë¡œ ë¡œê·¸ì¸','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.':'ì´ ê¸°ê¸°ì—ì„œ ì§€ê°‘ì´ ìƒì„±ë˜ì—ˆìŠµë‹ˆë‹¤. ë³µêµ¬ ë¬¸êµ¬ë¥¼ ì €ìž¥í•˜ì„¸ìš”.','Registrasi gagal diproses di server.':'ì„œë²„ì—ì„œ ê°€ìž…ì„ ì²˜ë¦¬í•  ìˆ˜ ì—†ìŠµë‹ˆë‹¤.','Gagal membuat wallet baru.':'ìƒˆ ì§€ê°‘ ìƒì„±ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.','Recovery phrase gagal dibuat.':'ë³µêµ¬ ë¬¸êµ¬ ìƒì„±ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.'},
 ar:{'Generate Wallet':'إنشاء محفظة','Create SYS Account':'إنشاء حساب SYS','Welcome Back':'مرحباً بعودتك','Login menggunakan wallet Anda.':'سجّل الدخول باستخدام محفظتك.','Buat wallet baru langsung dari perangkat Anda.':'أنشئ محفظة جديدة مباشرة على جهازك.','Login dengan Wallet':'تسجيل الدخول بالمحفظة','Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.':'اربط MetaMask أو محفظة EVM أخرى ثم وقّع رسالة تسجيل الدخول.','Buat Wallet Baru':'إنشاء محفظة جديدة','Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.':'لا تحتاج إلى بريد إلكتروني أو اسم مستخدم أو كلمة مرور. سيتم إنشاء المحفظة على جهازك.','Saya menyetujui Terms & Conditions dan pembuatan wallet baru.':'أوافق على الشروط والأحكام وإنشاء محفظة جديدة.','Simpan Recovery Phrase':'احفظ عبارة الاسترداد','Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.':'يتم إنشاء عبارة الاسترداد على جهازك. لا تستلمها SYS STREAM ولا تخزنها.','Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.':'لقد حفظت عبارة الاسترداد وأفهم أن SYS STREAM لا يستطيع استعادتها.','BUAT AKUN DENGAN WALLET INI':'إنشاء حساب بهذه المحفظة','GENERATE WALLET':'إنشاء محفظة','LOGIN WITH WALLET':'تسجيل الدخول بالمحفظة','Already have a wallet?':'لديك محفظة بالفعل؟','Login with Wallet':'تسجيل الدخول بالمحفظة','Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.':'تم إنشاء المحفظة على هذا الجهاز. احفظ عبارة الاسترداد قبل إنشاء الحساب.','Registrasi gagal diproses di server.':'تعذر معالجة التسجيل على الخادم.','Gagal membuat wallet baru.':'تعذر إنشاء محفظة جديدة.','Recovery phrase gagal dibuat.':'تعذر إنشاء عبارة الاسترداد.'}
};
for (const lang of Object.keys(WALLET_AUTH_UI) as LanguageCode[]) Object.assign(translations[lang], WALLET_AUTH_UI[lang]);

// Cross-page exact UI labels used by the runtime translator.
const CROSS_PAGE_UI: Record<LanguageCode, Record<string,string>> = {
 id: {
  'Profile':'Profil','Kelola akun, wallet, dan aktivitas kamu.':'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address':'ID Pengguna = Alamat Wallet','Member':'Anggota','USDT Account':'Akun USDT','EVM Wallet':'Wallet EVM','Available':'Tersedia','Locked':'Terkunci','Wallet':'Wallet','Withdraw':'Tarik Dana','Ajukan penarikan':'Ajukan penarikan','Registration Bonus':'Bonus Registrasi','Bonus tersedia dan belum diklaim.':'Bonus tersedia dan belum diklaim.','Claim Bonus':'Klaim Bonus','Available Balance':'Saldo Tersedia','Referral Link':'Tautan Referral','Transaction History':'Riwayat Transaksi','Refresh':'Muat Ulang','Loading...':'Memuat...','Belum ada transaksi.':'Belum ada transaksi.','Live Now':'Live Sekarang','Buka Live Room â†’':'Buka Live Room â†’','Upload / Create Post':'Unggah / Buat Postingan','Community':'Komunitas','Tulis sesuatu untuk dibagikan ke komunitas...':'Tulis sesuatu untuk dibagikan ke komunitas...','URL media (opsional)':'URL media (opsional)','Terbitkan Postingan':'Terbitkan Postingan','Minimum withdrawal':'Penarikan minimum','Copy wallet address':'Salin alamat wallet','Copy referral link':'Salin tautan referral','Back':'Kembali','Legal':'Hukum','Version':'Versi','Important:':'Penting:','Terms & Conditions':'Syarat & Ketentuan','Privacy Policy':'Kebijakan Privasi','Last updated:':'Terakhir diperbarui:'
 },
 en: {},
 es: {
  'Profile':'Perfil','User ID = Wallet Address':'ID de usuario = dirección de wallet','Member':'Miembro','USDT Account':'Cuenta USDT','EVM Wallet':'Wallet EVM','Available':'Disponible','Locked':'Bloqueado','Withdraw':'Retirar','Registration Bonus':'Bono de registro','Claim Bonus':'Reclamar bono','Available Balance':'Saldo disponible','Referral Link':'Enlace de referidos','Transaction History':'Historial de transacciones','Refresh':'Actualizar','Loading...':'Cargando...','Live Now':'En vivo','Upload / Create Post':'Subir / crear publicación','Community':'Comunidad','Terbitkan Postingan':'Publicar','Back':'Volver','Legal':'Legal','Version':'Versión','Important:':'Importante:','Terms & Conditions':'Términos y condiciones','Privacy Policy':'Política de privacidad'
 },
 pt: {
  'Profile':'Perfil','User ID = Wallet Address':'ID do usuário = endereço da carteira','Member':'Membro','USDT Account':'Conta USDT','EVM Wallet':'Carteira EVM','Available':'Disponível','Locked':'Bloqueado','Withdraw':'Sacar','Registration Bonus':'Bônus de registro','Claim Bonus':'Resgatar bônus','Available Balance':'Saldo disponível','Referral Link':'Link de indicação','Transaction History':'Histórico de transações','Refresh':'Atualizar','Loading...':'Carregando...','Live Now':'Ao vivo','Upload / Create Post':'Enviar / criar publicação','Community':'Comunidade','Terbitkan Postingan':'Publicar','Back':'Voltar','Legal':'Legal','Version':'Versão','Important:':'Importante:','Terms & Conditions':'Termos e condições','Privacy Policy':'Política de privacidade'
 },
 zh: {
  'Profile':'ä¸ªäººèµ„æ–™','User ID = Wallet Address':'ç”¨æˆ·ID = é’±åŒ…åœ°å€','Member':'ä¼šå‘˜','USDT Account':'USDTè´¦æˆ·','EVM Wallet':'EVMé’±åŒ…','Available':'å¯ç”¨','Locked':'å·²é”å®š','Withdraw':'æçŽ°','Registration Bonus':'æ³¨å†Œå¥–åŠ±','Claim Bonus':'é¢†å–å¥–åŠ±','Available Balance':'å¯ç”¨ä½™é¢','Referral Link':'æŽ¨èé“¾æŽ¥','Transaction History':'äº¤æ˜“è®°å½•','Refresh':'åˆ·æ–°','Loading...':'加载中…','Live Now':'æ­£åœ¨ç›´æ’­','Upload / Create Post':'ä¸Šä¼  / åˆ›å»ºå¸–å­','Community':'ç¤¾åŒº','Terbitkan Postingan':'å‘å¸ƒ','Back':'è¿”å›ž','Legal':'æ³•å¾‹','Version':'ç‰ˆæœ¬','Important:':'é‡è¦ï¼š','Terms & Conditions':'æ¡æ¬¾ä¸Žæ¡ä»¶','Privacy Policy':'éšç§æ”¿ç­–'
 },
 ja: {
  'Profile':'ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«','User ID = Wallet Address':'ãƒ¦ãƒ¼ã‚¶ãƒ¼ID = ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹','Member':'ãƒ¡ãƒ³ãƒãƒ¼','USDT Account':'USDTã‚¢ã‚«ã‚¦ãƒ³ãƒˆ','EVM Wallet':'EVMã‚¦ã‚©ãƒ¬ãƒƒãƒˆ','Available':'åˆ©ç”¨å¯èƒ½','Locked':'ãƒ­ãƒƒã‚¯æ¸ˆã¿','Withdraw':'å‡ºé‡‘','Registration Bonus':'ç™»éŒ²ãƒœãƒ¼ãƒŠã‚¹','Claim Bonus':'ãƒœãƒ¼ãƒŠã‚¹ã‚’å—ã‘å–ã‚‹','Available Balance':'åˆ©ç”¨å¯èƒ½æ®‹é«˜','Referral Link':'ç´¹ä»‹ãƒªãƒ³ã‚¯','Transaction History':'å–å¼•å±¥æ­´','Refresh':'æ›´æ–°','Loading...':'読み込み中…','Live Now':'ãƒ©ã‚¤ãƒ–ä¸­','Upload / Create Post':'æŠ•ç¨¿ã‚’ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰ / ä½œæˆ','Community':'ã‚³ãƒŸãƒ¥ãƒ‹ãƒ†ã‚£','Terbitkan Postingan':'æŠ•ç¨¿ã™ã‚‹','Back':'æˆ»ã‚‹','Legal':'æ³•å‹™','Version':'ãƒãƒ¼ã‚¸ãƒ§ãƒ³','Important:':'é‡è¦ï¼š','Terms & Conditions':'åˆ©ç”¨è¦ç´„','Privacy Policy':'ãƒ—ãƒ©ã‚¤ãƒã‚·ãƒ¼ãƒãƒªã‚·ãƒ¼'
 },
 ko: {
  'Profile':'í”„ë¡œí•„','User ID = Wallet Address':'ì‚¬ìš©ìž ID = ì§€ê°‘ ì£¼ì†Œ','Member':'íšŒì›','USDT Account':'USDT ê³„ì •','EVM Wallet':'EVM ì§€ê°‘','Available':'ì‚¬ìš© ê°€ëŠ¥','Locked':'ìž ê¹€','Withdraw':'ì¶œê¸ˆ','Registration Bonus':'ê°€ìž… ë³´ë„ˆìŠ¤','Claim Bonus':'ë³´ë„ˆìŠ¤ ë°›ê¸°','Available Balance':'ì‚¬ìš© ê°€ëŠ¥ ìž”ì•¡','Referral Link':'ì¶”ì²œ ë§í¬','Transaction History':'ê±°ëž˜ ë‚´ì—­','Refresh':'ìƒˆë¡œê³ ì¹¨','Loading...':'ë¡œë“œ ì¤‘...','Live Now':'ë¼ì´ë¸Œ','Upload / Create Post':'ê²Œì‹œë¬¼ ì—…ë¡œë“œ / ë§Œë“¤ê¸°','Community':'ì»¤ë®¤ë‹ˆí‹°','Terbitkan Postingan':'ê²Œì‹œ','Back':'ë’¤ë¡œ','Legal':'ë²•ë¥ ','Version':'ë²„ì „','Important:':'ì¤‘ìš”:','Terms & Conditions':'ì´ìš©ì•½ê´€','Privacy Policy':'ê°œì¸ì •ë³´ ì²˜ë¦¬ë°©ì¹¨'
 },
 ar: {
  'Profile':'الملف الشخصي','User ID = Wallet Address':'معرّف المستخدم = عنوان المحفظة','Member':'عضو','USDT Account':'حساب USDT','EVM Wallet':'محفظة EVM','Available':'متاح','Locked':'مقفل','Withdraw':'سحب','Registration Bonus':'مكافأة التسجيل','Claim Bonus':'استلام المكافأة','Available Balance':'الرصيد المتاح','Referral Link':'رابط الإحالة','Transaction History':'سجل المعاملات','Refresh':'تحديث','Loading...':'جارٍ التحميل...','Live Now':'مباشر الآن','Upload / Create Post':'رفع / إنشاء منشور','Community':'المجتمع','Terbitkan Postingan':'نشر','Back':'رجوع','Legal':'قانوني','Version':'الإصدار','Important:':'Ù…Ù‡Ù…:','Terms & Conditions':'الشروط والأحكام','Privacy Policy':'سياسة الخصوصية'
 }
};
for (const lang of Object.keys(CROSS_PAGE_UI) as LanguageCode[]) {
  Object.assign(translations[lang], CROSS_PAGE_UI[lang]);
}
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
  Workspace:'å·¥ä½œåŒº', Home:'é¦–é¡µ', 'Live Now':'æ­£åœ¨ç›´æ’­', Games:'æ¸¸æˆ', Airdrop:'ç©ºæŠ•', Profile:'ä¸ªäººèµ„æ–™',
  'Upload / Create':'ä¸Šä¼  / åˆ›å»º', Available:'å¯ç”¨', Locked:'å·²é”å®š', 'Registration Bonus':'æ³¨å†Œå¥–åŠ±',
  'Claim Bonus':'é¢†å–å¥–åŠ±', 'Community Posts':'ç¤¾åŒºå¸–å­',
  'Production data is used for all content and activity on this page.':'æœ¬é¡µé¢æ‰€æœ‰å†…å®¹å’Œæ´»åŠ¨å‡ä½¿ç”¨ç”Ÿäº§æ•°æ®ã€‚',
  'Every user can share posts and updates.':'æ¯ä½ç”¨æˆ·éƒ½å¯ä»¥åˆ†äº«å¸–å­å’ŒåŠ¨æ€ã€‚',
});
Object.assign(translations.ja, {
  Workspace:'ãƒ¯ãƒ¼ã‚¯ã‚¹ãƒšãƒ¼ã‚¹', Home:'ãƒ›ãƒ¼ãƒ ', 'Live Now':'ãƒ©ã‚¤ãƒ–ä¸­', Games:'ã‚²ãƒ¼ãƒ ', Airdrop:'ã‚¨ã‚¢ãƒ‰ãƒ­ãƒƒãƒ—', Profile:'ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«',
  'Upload / Create':'ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰ / ä½œæˆ', Available:'åˆ©ç”¨å¯èƒ½', Locked:'ãƒ­ãƒƒã‚¯æ¸ˆã¿', 'Registration Bonus':'ç™»éŒ²ãƒœãƒ¼ãƒŠã‚¹',
  'Claim Bonus':'ãƒœãƒ¼ãƒŠã‚¹ã‚’å—ã‘å–ã‚‹', 'Community Posts':'ã‚³ãƒŸãƒ¥ãƒ‹ãƒ†ã‚£æŠ•ç¨¿',
  'Production data is used for all content and activity on this page.':'ã“ã®ãƒšãƒ¼ã‚¸ã®ã‚³ãƒ³ãƒ†ãƒ³ãƒ„ã¨ã‚¢ã‚¯ãƒ†ã‚£ãƒ“ãƒ†ã‚£ã¯æœ¬ç•ªãƒ‡ãƒ¼ã‚¿ã‚’ä½¿ç”¨ã—ã¾ã™ã€‚',
  'Every user can share posts and updates.':'ã™ã¹ã¦ã®ãƒ¦ãƒ¼ã‚¶ãƒ¼ãŒæŠ•ç¨¿ã‚„æ›´æ–°ã‚’å…±æœ‰ã§ãã¾ã™ã€‚',
});
Object.assign(translations.ko, {
  Workspace:'ì›Œí¬ìŠ¤íŽ˜ì´ìŠ¤', Home:'í™ˆ', 'Live Now':'ë¼ì´ë¸Œ', Games:'ê²Œìž„', Airdrop:'ì—ì–´ë“œë¡­', Profile:'í”„ë¡œí•„',
  'Upload / Create':'ì—…ë¡œë“œ / ë§Œë“¤ê¸°', Available:'ì‚¬ìš© ê°€ëŠ¥', Locked:'ìž ê¹€', 'Registration Bonus':'ê°€ìž… ë³´ë„ˆìŠ¤',
  'Claim Bonus':'ë³´ë„ˆìŠ¤ ë°›ê¸°', 'Community Posts':'ì»¤ë®¤ë‹ˆí‹° ê²Œì‹œë¬¼',
  'Production data is used for all content and activity on this page.':'ì´ íŽ˜ì´ì§€ì˜ ëª¨ë“  ì½˜í…ì¸ ì™€ í™œë™ì€ ìš´ì˜ ë°ì´í„°ë¥¼ ì‚¬ìš©í•©ë‹ˆë‹¤.',
  'Every user can share posts and updates.':'ëª¨ë“  ì‚¬ìš©ìžê°€ ê²Œì‹œë¬¼ê³¼ ì—…ë°ì´íŠ¸ë¥¼ ê³µìœ í•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤.',
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
    'Interaction Challenge â€” No Financial Stake':'Interaction Challenge — No Financial Stake','Mode Interaksi':'Interaction Mode','Challenge ini tidak menggunakan saldo pengguna. Tidak ada deposit, lock, pemotongan saldo, atau payout finansial.':'This challenge does not use user balance. There is no deposit, lock, balance deduction, or financial payout.','Verify Challenge':'Verify Challenge','Verifying Cryptographic Seed...':'Verifying Cryptographic Seed...','Provably Fair Verification':'Provably Fair Verification'
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
    'Masuk untuk bergabung ke Live Room':'ç™»å½•ä»¥åŠ å…¥ç›´æ’­é—´','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'æ¯ä¸ªè´¦æˆ·åœ¨ç›´æ’­é—´éƒ½æœ‰ç‹¬ç«‹çš„ä¸ªäººèµ„æ–™å’Œèº«ä»½ã€‚','Live Room Aktif':'ç›´æ’­é—´å·²å¼€å¯','Live belum aktif':'ç›´æ’­å°šæœªå¼€å¯','Peserta Live':'ç›´æ’­å‚ä¸Žè€…','Hanya akun yang benar-benar bergabung yang ditampilkan.':'ä»…æ˜¾ç¤ºå®žé™…åŠ å…¥çš„è´¦æˆ·ã€‚','Memuat peserta...':'正在加载参与者…','Belum ada peserta lain.':'æš‚æ— å…¶ä»–å‚ä¸Žè€…ã€‚','Belum ada peserta.':'æš‚æ— å‚ä¸Žè€…ã€‚','Peserta':'å‚ä¸Žè€…','Profil akun Anda':'æ‚¨çš„è´¦æˆ·èµ„æ–™',
    'Nominal Lock (IDR)':'é”å®šé‡‘é¢ï¼ˆIDRï¼‰','Lock Saldo Sekarang':'ç«‹å³é”å®šä½™é¢','Claim Blind Box Harian':'é¢†å–æ¯æ—¥ç›²ç›’','Lock Aktif':'é”å®šä¸­','Reward harian masuk ke saldo':'æ¯æ—¥å¥–åŠ±å°†åŠ å…¥ä½™é¢','Durasi Lock':'é”å®šæœŸé™','30 HARI':'30å¤©','60 HARI':'60å¤©','90 HARI':'90å¤©',
    'Mode Interaksi':'äº’åŠ¨æ¨¡å¼','Verify Challenge':'éªŒè¯æŒ‘æˆ˜','Provably Fair Verification':'å…¬å¹³éªŒè¯'
  },
  ja: {
    'Masuk untuk bergabung ke Live Room':'ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ã«å‚åŠ ','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'å„ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã«ã¯ãƒ«ãƒ¼ãƒ å†…ã§å›ºæœ‰ã®ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«ã¨IDãŒã‚ã‚Šã¾ã™ã€‚','Live Room Aktif':'ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ãŒæœ‰åŠ¹ã§ã™','Live belum aktif':'ãƒ©ã‚¤ãƒ–ã¯ã¾ã é–‹å§‹ã•ã‚Œã¦ã„ã¾ã›ã‚“','Peserta Live':'ãƒ©ã‚¤ãƒ–å‚åŠ è€…','Hanya akun yang benar-benar bergabung yang ditampilkan.':'å®Ÿéš›ã«å‚åŠ ã—ãŸã‚¢ã‚«ã‚¦ãƒ³ãƒˆã®ã¿è¡¨ç¤ºã•ã‚Œã¾ã™ã€‚','Memuat peserta...':'参加者を読み込み中…','Belum ada peserta lain.':'ä»–ã®å‚åŠ è€…ã¯ã„ã¾ã›ã‚“ã€‚','Belum ada peserta.':'å‚åŠ è€…ã¯ã„ã¾ã›ã‚“ã€‚','Peserta':'å‚åŠ è€…','Profil akun Anda':'ã‚ãªãŸã®ã‚¢ã‚«ã‚¦ãƒ³ãƒˆãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«',
    'Nominal Lock (IDR)':'ãƒ­ãƒƒã‚¯é‡‘é¡ï¼ˆIDRï¼‰','Lock Saldo Sekarang':'æ®‹é«˜ã‚’ãƒ­ãƒƒã‚¯','Claim Blind Box Harian':'æ¯Žæ—¥ã®ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹ã‚’å—ã‘å–ã‚‹','Lock Aktif':'ãƒ­ãƒƒã‚¯ä¸­','Reward harian masuk ke saldo':'æ¯Žæ—¥ã®å ±é…¬ã¯æ®‹é«˜ã«è¿½åŠ ã•ã‚Œã¾ã™','Durasi Lock':'ãƒ­ãƒƒã‚¯æœŸé–“','30 HARI':'30æ—¥','60 HARI':'60æ—¥','90 HARI':'90æ—¥',
    'Mode Interaksi':'ã‚¤ãƒ³ã‚¿ãƒ©ã‚¯ã‚·ãƒ§ãƒ³ãƒ¢ãƒ¼ãƒ‰','Verify Challenge':'ãƒãƒ£ãƒ¬ãƒ³ã‚¸ã‚’ç¢ºèª','Provably Fair Verification':'å…¬å¹³æ€§ã®æ¤œè¨¼'
  },
  ko: {
    'Masuk untuk bergabung ke Live Room':'ë¡œê·¸ì¸í•˜ì—¬ ë¼ì´ë¸Œ ë£¸ì— ì°¸ì—¬í•˜ì„¸ìš”','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'ê° ê³„ì •ì€ ë£¸ì—ì„œ ê³ ìœ í•œ í”„ë¡œí•„ê³¼ ì‹ ì›ì„ ê°€ì§‘ë‹ˆë‹¤.','Live Room Aktif':'ë¼ì´ë¸Œ ë£¸ í™œì„±','Live belum aktif':'ë¼ì´ë¸Œê°€ ì•„ì§ ì‹œìž‘ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤','Peserta Live':'ë¼ì´ë¸Œ ì°¸ê°€ìž','Hanya akun yang benar-benar bergabung yang ditampilkan.':'ì‹¤ì œë¡œ ì°¸ì—¬í•œ ê³„ì •ë§Œ í‘œì‹œë©ë‹ˆë‹¤.','Memuat peserta...':'참가자 불러오는 중…','Belum ada peserta lain.':'ì•„ì§ ë‹¤ë¥¸ ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.','Belum ada peserta.':'ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.','Peserta':'ì°¸ê°€ìž','Profil akun Anda':'ë‚´ ê³„ì • í”„ë¡œí•„',
    'Nominal Lock (IDR)':'ìž ê¸ˆ ê¸ˆì•¡(IDR)','Lock Saldo Sekarang':'ìž”ì•¡ ìž ê¸ˆ','Claim Blind Box Harian':'ì¼ì¼ ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ ë°›ê¸°','Lock Aktif':'ìž ê¸ˆ í™œì„±','Reward harian masuk ke saldo':'ì¼ì¼ ë³´ìƒì´ ìž”ì•¡ì— ì¶”ê°€ë©ë‹ˆë‹¤','Durasi Lock':'ìž ê¸ˆ ê¸°ê°„','30 HARI':'30ì¼','60 HARI':'60ì¼','90 HARI':'90ì¼',
    'Mode Interaksi':'ìƒí˜¸ìž‘ìš© ëª¨ë“œ','Verify Challenge':'ì±Œë¦°ì§€ í™•ì¸','Provably Fair Verification':'ê³µì •ì„± ê²€ì¦'
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
    'Viewer Username Raffle Spinner':'è§‚ä¼—ç”¨æˆ·åæŠ½å¥–è½¬ç›˜','Live Participants Only':'ä»…é™ç›´æ’­å‚ä¸Žè€…','Recent Raffle Winners':'æœ€è¿‘ä¸­å¥–è€…','Digital Crypto Card Number Guess':'æ•°å­—åŠ å¯†å¡å·ç ç«žçŒœ','Streamer Card Settings':'ä¸»æ’­å¡ç‰‡è®¾ç½®','Streamer Card Configurator':'ä¸»æ’­å¡ç‰‡é…ç½®å™¨','Card Title':'å¡ç‰‡æ ‡é¢˜','Serial Number':'åºåˆ—å·','Concealed':'éšè—','Revealed':'å·²æ­ç¤º','Verify Challenge':'éªŒè¯æŒ‘æˆ˜','Provably Fair Verification':'å…¬å¹³æ€§éªŒè¯',
    'Affiliate Partner Program':'è”ç›Ÿåˆä½œä¼™ä¼´è®¡åˆ’','Your Personal Affiliate Link':'æ‚¨çš„ä¸“å±žæŽ¨å¹¿é“¾æŽ¥','Direct Invitations':'ç›´æŽ¥é‚€è¯·','Network Invites':'ç½‘ç»œé‚€è¯·','Deep Ecosystem':'æ·±åº¦ç”Ÿæ€','Affiliate Income Calculator':'è”ç›Ÿæ”¶ç›Šè®¡ç®—å™¨','Estimated Monthly Earnings':'é¢„è®¡æœˆæ”¶ç›Š','Live Referral Feed':'å®žæ—¶æŽ¨èåŠ¨æ€','Referee Handle':'è¢«æŽ¨èç”¨æˆ·','Date Joined':'åŠ å…¥æ—¥æœŸ','Commission Tier':'ä½£é‡‘ç­‰çº§','Wager Volume':'æ´»åŠ¨é‡','Commission Earned':'èŽ·å¾—ä½£é‡‘',
    'NOWPayments Crypto Deposit':'NOWPayments åŠ å¯†è´§å¸å……å€¼','Instant deposit with zero platform fees':'å³æ—¶å……å€¼ï¼Œå¹³å°é›¶æ‰‹ç»­è´¹','Create NOWPayments Invoice':'åˆ›å»º NOWPayments å‘ç¥¨','Available Balance':'å¯ç”¨ä½™é¢','Transaction History':'äº¤æ˜“è®°å½•','Withdraw USDT':'æçŽ° USDT','Submit Withdrawal':'æäº¤æçŽ°','Wallet':'é’±åŒ…','Referral Link':'æŽ¨èé“¾æŽ¥','Event Participation Status':'æ´»åŠ¨å‚ä¸ŽçŠ¶æ€','Refresh':'åˆ·æ–°','Loading...':'åŠ è½½ä¸­...','Processing...':'å¤„ç†ä¸­...','Edit':'ç¼–è¾‘','Logout':'é€€å‡ºç™»å½•','Member':'ä¼šå‘˜','USDT Account':'USDT è´¦æˆ·','Join Live Room':'åŠ å…¥ç›´æ’­é—´','Chat':'èŠå¤©','Send':'å‘é€','Type a message':'è¾“å…¥æ¶ˆæ¯'
  },
  ja: {
    'Viewer Username Raffle Spinner':'è¦–è´è€…ãƒ¦ãƒ¼ã‚¶ãƒ¼åæŠ½é¸ã‚¹ãƒ”ãƒŠãƒ¼','Live Participants Only':'ãƒ©ã‚¤ãƒ–å‚åŠ è€…ã®ã¿','Recent Raffle Winners':'æœ€è¿‘ã®æŠ½é¸å½“é¸è€…','Digital Crypto Card Number Guess':'ãƒ‡ã‚¸ã‚¿ãƒ«æš—å·ã‚«ãƒ¼ãƒ‰ç•ªå·å½“ã¦','Streamer Card Settings':'é…ä¿¡è€…ã‚«ãƒ¼ãƒ‰è¨­å®š','Streamer Card Configurator':'é…ä¿¡è€…ã‚«ãƒ¼ãƒ‰è¨­å®šãƒ„ãƒ¼ãƒ«','Card Title':'ã‚«ãƒ¼ãƒ‰ã‚¿ã‚¤ãƒˆãƒ«','Serial Number':'ã‚·ãƒªã‚¢ãƒ«ç•ªå·','Concealed':'éžå…¬é–‹','Revealed':'å…¬é–‹','Verify Challenge':'ãƒãƒ£ãƒ¬ãƒ³ã‚¸ã‚’ç¢ºèª','Provably Fair Verification':'å…¬å¹³æ€§ã®æ¤œè¨¼',
    'Affiliate Partner Program':'ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆãƒ‘ãƒ¼ãƒˆãƒŠãƒ¼ãƒ—ãƒ­ã‚°ãƒ©ãƒ ','Your Personal Affiliate Link':'ã‚ãªãŸå°‚ç”¨ã®ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆãƒªãƒ³ã‚¯','Direct Invitations':'ç›´æŽ¥æ‹›å¾…','Network Invites':'ãƒãƒƒãƒˆãƒ¯ãƒ¼ã‚¯æ‹›å¾…','Deep Ecosystem':'æ·±ã„ã‚¨ã‚³ã‚·ã‚¹ãƒ†ãƒ ','Affiliate Income Calculator':'ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆåŽç›Šè¨ˆç®—æ©Ÿ','Estimated Monthly Earnings':'æœˆé–“äºˆæƒ³åŽç›Š','Live Referral Feed':'ãƒ©ã‚¤ãƒ–ç´¹ä»‹ãƒ•ã‚£ãƒ¼ãƒ‰','Referee Handle':'ç´¹ä»‹ãƒ¦ãƒ¼ã‚¶ãƒ¼','Date Joined':'å‚åŠ æ—¥','Commission Tier':'ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³ãƒ¬ãƒ™ãƒ«','Wager Volume':'ã‚¢ã‚¯ãƒ†ã‚£ãƒ“ãƒ†ã‚£é‡','Commission Earned':'ç²å¾—ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³',
    'NOWPayments Crypto Deposit':'NOWPaymentsæš—å·è³‡ç”£å…¥é‡‘','Instant deposit with zero platform fees':'ãƒ—ãƒ©ãƒƒãƒˆãƒ•ã‚©ãƒ¼ãƒ æ‰‹æ•°æ–™ãªã—ã®å³æ™‚å…¥é‡‘','Create NOWPayments Invoice':'NOWPaymentsè«‹æ±‚æ›¸ã‚’ä½œæˆ','Available Balance':'åˆ©ç”¨å¯èƒ½æ®‹é«˜','Transaction History':'å–å¼•å±¥æ­´','Withdraw USDT':'USDTã‚’å‡ºé‡‘','Submit Withdrawal':'å‡ºé‡‘ã‚’ç”³è«‹','Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆ','Referral Link':'ç´¹ä»‹ãƒªãƒ³ã‚¯','Event Participation Status':'ã‚¤ãƒ™ãƒ³ãƒˆå‚åŠ çŠ¶æ³','Refresh':'æ›´æ–°','Loading...':'èª­ã¿è¾¼ã¿ä¸­...','Processing...':'å‡¦ç†ä¸­...','Edit':'ç·¨é›†','Logout':'ãƒ­ã‚°ã‚¢ã‚¦ãƒˆ','Member':'ãƒ¡ãƒ³ãƒãƒ¼','USDT Account':'USDTã‚¢ã‚«ã‚¦ãƒ³ãƒˆ','Join Live Room':'ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ã«å‚åŠ ','Chat':'ãƒãƒ£ãƒƒãƒˆ','Send':'é€ä¿¡','Type a message':'ãƒ¡ãƒƒã‚»ãƒ¼ã‚¸ã‚’å…¥åŠ›'
  },
  ko: {
    'Viewer Username Raffle Spinner':'ì‹œì²­ìž ì‚¬ìš©ìžëª… ì¶”ì²¨ ìŠ¤í”¼ë„ˆ','Live Participants Only':'ë¼ì´ë¸Œ ì°¸ê°€ìžë§Œ','Recent Raffle Winners':'ìµœê·¼ ì¶”ì²¨ ë‹¹ì²¨ìž','Digital Crypto Card Number Guess':'ë””ì§€í„¸ ì•”í˜¸ ì¹´ë“œ ë²ˆí˜¸ ë§žížˆê¸°','Streamer Card Settings':'ìŠ¤íŠ¸ë¦¬ë¨¸ ì¹´ë“œ ì„¤ì •','Streamer Card Configurator':'ìŠ¤íŠ¸ë¦¬ë¨¸ ì¹´ë“œ êµ¬ì„±ê¸°','Card Title':'ì¹´ë“œ ì œëª©','Serial Number':'ì¼ë ¨ë²ˆí˜¸','Concealed':'ìˆ¨ê¹€','Revealed':'ê³µê°œ','Verify Challenge':'ì±Œë¦°ì§€ í™•ì¸','Provably Fair Verification':'ê³µì •ì„± ê²€ì¦',
    'Affiliate Partner Program':'ì œíœ´ íŒŒíŠ¸ë„ˆ í”„ë¡œê·¸ëž¨','Your Personal Affiliate Link':'ê°œì¸ ì œíœ´ ë§í¬','Direct Invitations':'ì§ì ‘ ì´ˆëŒ€','Network Invites':'ë„¤íŠ¸ì›Œí¬ ì´ˆëŒ€','Deep Ecosystem':'í™•ìž¥ ìƒíƒœê³„','Affiliate Income Calculator':'ì œíœ´ ìˆ˜ìµ ê³„ì‚°ê¸°','Estimated Monthly Earnings':'ì˜ˆìƒ ì›” ìˆ˜ìµ','Live Referral Feed':'ì‹¤ì‹œê°„ ì¶”ì²œ í”¼ë“œ','Referee Handle':'ì¶”ì²œ ì‚¬ìš©ìž','Date Joined':'ê°€ìž…ì¼','Commission Tier':'ì»¤ë¯¸ì…˜ ë“±ê¸‰','Wager Volume':'í™œë™ëŸ‰','Commission Earned':'íšë“ ì»¤ë¯¸ì…˜',
    'NOWPayments Crypto Deposit':'NOWPayments ì•”í˜¸í™”í ìž…ê¸ˆ','Instant deposit with zero platform fees':'í”Œëž«í¼ ìˆ˜ìˆ˜ë£Œ ì—†ëŠ” ì¦‰ì‹œ ìž…ê¸ˆ','Create NOWPayments Invoice':'NOWPayments ì¸ë³´ì´ìŠ¤ ìƒì„±','Available Balance':'ì‚¬ìš© ê°€ëŠ¥ ìž”ì•¡','Transaction History':'ê±°ëž˜ ë‚´ì—­','Withdraw USDT':'USDT ì¶œê¸ˆ','Submit Withdrawal':'ì¶œê¸ˆ ì‹ ì²­','Wallet':'ì§€ê°‘','Referral Link':'ì¶”ì²œ ë§í¬','Event Participation Status':'ì´ë²¤íŠ¸ ì°¸ì—¬ ìƒíƒœ','Refresh':'ìƒˆë¡œê³ ì¹¨','Loading...':'ë¶ˆëŸ¬ì˜¤ëŠ” ì¤‘...','Processing...':'ì²˜ë¦¬ ì¤‘...','Edit':'íŽ¸ì§‘','Logout':'ë¡œê·¸ì•„ì›ƒ','Member':'íšŒì›','USDT Account':'USDT ê³„ì •','Join Live Room':'ë¼ì´ë¸Œ ë£¸ ì°¸ì—¬','Chat':'ì±„íŒ…','Send':'ì „ì†¡','Type a message':'ë©”ì‹œì§€ ìž…ë ¥'
  },
  ar: {
    'Viewer Username Raffle Spinner':'عجلة سحب أسماء المشاهدين','Live Participants Only':'المشاركون في البث فقط','Recent Raffle Winners':'الفائزون في السحب الأخير','Digital Crypto Card Number Guess':'تخمين رقم البطاقة الرقمية المشفرة','Streamer Card Settings':'إعدادات بطاقة البث','Streamer Card Configurator':'مُكوّن بطاقة البث','Card Title':'عنوان البطاقة','Serial Number':'الرقم التسلسلي','Concealed':'مخفي','Revealed':'مكشوف','Verify Challenge':'تحقق من التحدي','Provably Fair Verification':'التحقق من العدالة',
    'Affiliate Partner Program':'برنامج شركاء الإحالة','Your Personal Affiliate Link':'رابط الإحالة الشخصي','Direct Invitations':'الدعوات المباشرة','Network Invites':'دعوات الشبكة','Deep Ecosystem':'النظام البيئي المتكامل','Affiliate Income Calculator':'حاسبة دخل الإحالة','Estimated Monthly Earnings':'الأرباح الشهرية المقدرة','Live Referral Feed':'تغذية الإحالات المباشرة','Referee Handle':'المستخدم المُحال','Date Joined':'تاريخ الانضمام','Commission Tier':'مستوى العمولة','Wager Volume':'حجم النشاط','Commission Earned':'العمولة المكتسبة',
    'NOWPayments Crypto Deposit':'إيداع العملات المشفرة عبر NOWPayments','Instant deposit with zero platform fees':'إيداع فوري بدون رسوم منصة','Create NOWPayments Invoice':'إنشاء فاتورة NOWPayments','Available Balance':'الرصيد المتاح','Transaction History':'سجل المعاملات','Withdraw USDT':'سحب USDT','Submit Withdrawal':'إرسال طلب السحب','Wallet':'المحفظة','Referral Link':'رابط الإحالة','Event Participation Status':'حالة المشاركة في الفعالية','Refresh':'تحديث','Loading...':'جارٍ التحميل...','Processing...':'جارٍ المعالجة...','Edit':'تعديل','Logout':'تسجيل الخروج','Member':'عضو','USDT Account':'حساب USDT','Join Live Room':'الانضمام إلى الغرفة المباشرة','Chat':'الدردشة','Send':'إرسال','Type a message':'اكتب رسالة'
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
    "Yield:": "Yield:",
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
    "Serial No:": "No. Seri:",
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
    "Yield:": "Yield:",
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
    "Serial No:": "Serial No:",
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
    "Yield:": "Rendimiento:",
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
    "Serial No:": "N.º de serie:",
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
    "Yield:": "Rendimento:",
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
    "Serial No:": "Nº de série:",
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
    "Terms & Conditions": "æ¡æ¬¾ä¸Žæ¡ä»¶",
    "Don't have an account?": "è¿˜æ²¡æœ‰è´¦æˆ·ï¼Ÿ",
    "Secured with Web3": "ä½¿ç”¨ Web3 å®‰å…¨ä¿æŠ¤",
    "Biometric Login Available": "ç”Ÿç‰©è¯†åˆ«ç™»å½•å¯ç”¨",
    "Edit": "ç¼–è¾‘",
    "Logout": "é€€å‡ºç™»å½•",
    "Yield:": "æ”¶ç›Šï¼š",
    "Locked Balance Policy": "é”å®šä½™é¢æ”¿ç­–",
    "Locked USDT earns passive daily yield...": "é”å®šçš„ USDT æ¯æ—¥èŽ·å¾—è¢«åŠ¨æ”¶ç›Š...",
    "Earn Passive Crypto & Gold Coins": "è¢«åŠ¨èµšå–åŠ å¯†è´§å¸å’Œé‡‘å¸",
    "Invite fellow gamers to NEXUS...": "é‚€è¯·å…¶ä»–çŽ©å®¶åŠ å…¥ NEXUS...",
    "Anyone registering with your link receives...": "é€šè¿‡ä½ çš„é“¾æŽ¥æ³¨å†Œçš„ç”¨æˆ·å¯èŽ·å¾—...",
    "+500 Gold Coins": "+500 é‡‘å¸",
    "Unclaimed Commission Balance": "æœªé¢†å–çš„ä½£é‡‘ä½™é¢",
    "Tier 1 (Direct)": "ç¬¬1çº§ï¼ˆç›´æŽ¥ï¼‰",
    "Tier 2 (Sub-Affiliate)": "ç¬¬2çº§ï¼ˆå­è”ç›Ÿï¼‰",
    "Tier 3 (Extended)": "ç¬¬3çº§ï¼ˆæ‰©å±•ï¼‰",
    "14 Players": "14 åçŽ©å®¶",
    "Slide to project your estimated monthly passive revenue...": "æ‹–åŠ¨ä»¥é¢„ä¼°æ‚¨çš„æ¯æœˆè¢«åŠ¨æ”¶å…¥...",
    "Belum ada data referral produksi untuk wallet ini.": "è¯¥é’±åŒ…æš‚æ— ç”Ÿäº§çŽ¯å¢ƒæŽ¨èæ•°æ®ã€‚",
    "Reward harian masuk ke saldo": "æ¯æ—¥å¥–åŠ±åŠ å…¥ä½™é¢",
    "Buka Blind Box harian berdasarkan saldo...": "æ ¹æ®ä½™é¢å¼€å¯æ¯æ—¥ç›²ç›’...",
    "Daily Boxes": "æ¯æ—¥å®ç®±",
    "Durasi lock tersedia": "å¯ç”¨é”å®šæœŸé™",
    "Lock Amount": "é”å®šé‡‘é¢",
    "Durasi Lock": "é”å®šæœŸé™",
    "Lock Aktif": "é”å®šä¸­",
    "Daily Claim": "æ¯æ—¥é¢†å–",
    "Reward dikreditkan ke saldo tersedia": "å¥–åŠ±å°†è®¡å…¥å¯ç”¨ä½™é¢",
    "Power Stat": "èƒ½é‡å±žæ€§",
    "Select Mystery Crate Tier": "é€‰æ‹©ç¥žç§˜å®ç®±ç­‰çº§",
    "30 Days Term": "30å¤©æœŸé™",
    "60 Days Term": "60å¤©æœŸé™",
    "90 Days Term": "90å¤©æœŸé™",
    "Streamer raffle wheel containing live viewer usernames...": "åŒ…å«ç›´æ’­è§‚ä¼—ç”¨æˆ·åçš„ä¸»æ’­æŠ½å¥–è½¬ç›˜...",
    "WIN": "èŽ·èƒœ",
    "Streamer Username Manager": "ä¸»æ’­ç”¨æˆ·åç®¡ç†å™¨",
    "Add": "æ·»åŠ ",
    "Clear All": "å…¨éƒ¨æ¸…é™¤",
    "Predict the concealed cryptographic serial digits...": "é¢„æµ‹éšè—çš„åŠ å¯†åºåˆ—æ•°å­—...",
    "Close": "å…³é—­",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "å¡ç‰‡æ•°å­—ï¼ˆæ°å¥½4ä½ï¼‰åŠéšè—å¼€å…³",
    "Cancel": "å–æ¶ˆ",
    "Save & Publish Card": "ä¿å­˜å¹¶å‘å¸ƒå¡ç‰‡",
    "Serial No:": "åºåˆ—å·ï¼š",
    "Digital Crypto Verification Code (4 Digits)": "æ•°å­—åŠ å¯†éªŒè¯ä»£ç ï¼ˆ4ä½ï¼‰",
    "The 4-digit code is tied to serial number...": "4ä½ä»£ç ä¸Žåºåˆ—å·ç»‘å®š...",
    "LOGIN / REGISTER": "ç™»å½• / æ³¨å†Œ",
    "CHAT": "èŠå¤©",
    "PESERTA": "å‚ä¸Žè€…",
    "Sign in to continue streaming and gaming": "ç™»å½•åŽç»§ç»­ç›´æ’­å’Œæ¸¸æˆ",
    "Remember me": "è®°ä½æˆ‘",
    "Forgot Password?": "å¿˜è®°å¯†ç ï¼Ÿ",
    "or Connect with Crypto Wallet": "æˆ–è¿žæŽ¥åŠ å¯†é’±åŒ…",
    "Connect Wallet": "è¿žæŽ¥é’±åŒ…",
    "Register Now": "ç«‹å³æ³¨å†Œ",
    "ADMIN PANEL": "ç®¡ç†å‘˜é¢æ¿",
    "Secure administrator access": "å®‰å…¨çš„ç®¡ç†å‘˜è®¿é—®",
    "Admin Email": "ç®¡ç†å‘˜é‚®ç®±",
    "Password / Owner Key": "å¯†ç  / æ‰€æœ‰è€…å¯†é’¥",
    "Production": "ç”Ÿäº§çŽ¯å¢ƒ",
    "Overview": "æ¦‚è§ˆ",
    "Users": "ç”¨æˆ·",
    "Transactions": "äº¤æ˜“",
    "Jackpot Grants": "Jackpot å‘æ”¾",
    "Admin Accounts": "ç®¡ç†å‘˜è´¦æˆ·",
    "Admin isolation": "ç®¡ç†å‘˜éš”ç¦»",
    "Production data only": "ä»…ç”Ÿäº§æ•°æ®",
    "Select User": "é€‰æ‹©ç”¨æˆ·",
    "Choose user...": "é€‰æ‹©ç”¨æˆ·...",
    "Jackpot Value (USDT)": "Jackpot é‡‘é¢ï¼ˆUSDTï¼‰",
    "Reason / Audit Note": "åŽŸå›  / å®¡è®¡å¤‡æ³¨",
    "Task": "ä»»åŠ¡",
    "Category": "ç±»åˆ«",
    "Reward": "å¥–åŠ±",
    "Status": "çŠ¶æ€",
    "Action": "æ“ä½œ",
    "Checking admin session...": "æ­£åœ¨æ£€æŸ¥ç®¡ç†å‘˜ä¼šè¯..."
  },
  "ja": {
    "Terms & Conditions": "åˆ©ç”¨è¦ç´„",
    "Don't have an account?": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ãŠæŒã¡ã§ã¯ã‚ã‚Šã¾ã›ã‚“ã‹ï¼Ÿ",
    "Secured with Web3": "Web3ã§ä¿è­·ã•ã‚Œã¦ã„ã¾ã™",
    "Biometric Login Available": "ç”Ÿä½“èªè¨¼ãƒ­ã‚°ã‚¤ãƒ³ã‚’åˆ©ç”¨ã§ãã¾ã™",
    "Edit": "ç·¨é›†",
    "Logout": "ãƒ­ã‚°ã‚¢ã‚¦ãƒˆ",
    "Yield:": "åˆ©å›žã‚Šï¼š",
    "Locked Balance Policy": "ãƒ­ãƒƒã‚¯æ®‹é«˜ãƒãƒªã‚·ãƒ¼",
    "Locked USDT earns passive daily yield...": "ãƒ­ãƒƒã‚¯ã—ãŸUSDTã¯æ¯Žæ—¥ãƒ‘ãƒƒã‚·ãƒ–åˆ©å›žã‚Šã‚’ç²å¾—ã—ã¾ã™...",
    "Earn Passive Crypto & Gold Coins": "æš—å·è³‡ç”£ã¨ã‚´ãƒ¼ãƒ«ãƒ‰ã‚³ã‚¤ãƒ³ã‚’ãƒ‘ãƒƒã‚·ãƒ–ã«ç²å¾—",
    "Invite fellow gamers to NEXUS...": "ä»–ã®ã‚²ãƒ¼ãƒžãƒ¼ã‚’NEXUSã«æ‹›å¾…...",
    "Anyone registering with your link receives...": "ã‚ãªãŸã®ãƒªãƒ³ã‚¯ã§ç™»éŒ²ã™ã‚‹ã¨...",
    "+500 Gold Coins": "+500ã‚´ãƒ¼ãƒ«ãƒ‰ã‚³ã‚¤ãƒ³",
    "Unclaimed Commission Balance": "æœªè«‹æ±‚ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³æ®‹é«˜",
    "Tier 1 (Direct)": "ãƒ†ã‚£ã‚¢1ï¼ˆç›´æŽ¥ï¼‰",
    "Tier 2 (Sub-Affiliate)": "ãƒ†ã‚£ã‚¢2ï¼ˆã‚µãƒ–ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆï¼‰",
    "Tier 3 (Extended)": "ãƒ†ã‚£ã‚¢3ï¼ˆæ‹¡å¼µï¼‰",
    "14 Players": "14äººã®ãƒ—ãƒ¬ã‚¤ãƒ¤ãƒ¼",
    "Slide to project your estimated monthly passive revenue...": "ã‚¹ãƒ©ã‚¤ãƒ€ãƒ¼ã§æŽ¨å®šæœˆé–“ãƒ‘ãƒƒã‚·ãƒ–åŽç›Šã‚’è¡¨ç¤º...",
    "Belum ada data referral produksi untuk wallet ini.": "ã“ã®ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã®æœ¬ç•ªãƒªãƒ•ã‚¡ãƒ©ãƒ«ãƒ‡ãƒ¼ã‚¿ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚",
    "Reward harian masuk ke saldo": "ãƒ‡ã‚¤ãƒªãƒ¼å ±é…¬ãŒæ®‹é«˜ã«è¿½åŠ ã•ã‚Œã¾ã™",
    "Buka Blind Box harian berdasarkan saldo...": "æ®‹é«˜ã«åŸºã¥ã„ã¦æ¯Žæ—¥ã®ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹ã‚’é–‹ãã¾ã™...",
    "Daily Boxes": "ãƒ‡ã‚¤ãƒªãƒ¼ãƒœãƒƒã‚¯ã‚¹",
    "Durasi lock tersedia": "åˆ©ç”¨å¯èƒ½ãªãƒ­ãƒƒã‚¯æœŸé–“",
    "Lock Amount": "ãƒ­ãƒƒã‚¯é¡",
    "Durasi Lock": "ãƒ­ãƒƒã‚¯æœŸé–“",
    "Lock Aktif": "ãƒ­ãƒƒã‚¯ä¸­",
    "Daily Claim": "ãƒ‡ã‚¤ãƒªãƒ¼å—å–",
    "Reward dikreditkan ke saldo tersedia": "å ±é…¬ã¯åˆ©ç”¨å¯èƒ½æ®‹é«˜ã«åŠ ç®—ã•ã‚Œã¾ã™",
    "Power Stat": "ãƒ‘ãƒ¯ãƒ¼ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹",
    "Select Mystery Crate Tier": "ãƒŸã‚¹ãƒ†ãƒªãƒ¼ã‚¯ãƒ¬ãƒ¼ãƒˆã®ãƒ†ã‚£ã‚¢ã‚’é¸æŠž",
    "30 Days Term": "30æ—¥é–“",
    "60 Days Term": "60æ—¥é–“",
    "90 Days Term": "90æ—¥é–“",
    "Streamer raffle wheel containing live viewer usernames...": "ãƒ©ã‚¤ãƒ–è¦–è´è€…ãƒ¦ãƒ¼ã‚¶ãƒ¼åã®ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼æŠ½é¸ãƒ›ã‚¤ãƒ¼ãƒ«...",
    "WIN": "WIN",
    "Streamer Username Manager": "ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ãƒ¦ãƒ¼ã‚¶ãƒ¼åç®¡ç†",
    "Add": "è¿½åŠ ",
    "Clear All": "ã™ã¹ã¦ã‚¯ãƒªã‚¢",
    "Predict the concealed cryptographic serial digits...": "éš ã•ã‚ŒãŸæš—å·ã‚·ãƒªã‚¢ãƒ«æ•°å­—ã‚’äºˆæ¸¬...",
    "Close": "é–‰ã˜ã‚‹",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "ã‚«ãƒ¼ãƒ‰æ•°å­—ï¼ˆ4æ¡ï¼‰ã¨éžè¡¨ç¤ºåˆ‡æ›¿",
    "Cancel": "ã‚­ãƒ£ãƒ³ã‚»ãƒ«",
    "Save & Publish Card": "ã‚«ãƒ¼ãƒ‰ã‚’ä¿å­˜ã—ã¦å…¬é–‹",
    "Serial No:": "ã‚·ãƒªã‚¢ãƒ«ç•ªå·ï¼š",
    "Digital Crypto Verification Code (4 Digits)": "ãƒ‡ã‚¸ã‚¿ãƒ«æš—å·æ¤œè¨¼ã‚³ãƒ¼ãƒ‰ï¼ˆ4æ¡ï¼‰",
    "The 4-digit code is tied to serial number...": "4æ¡ã‚³ãƒ¼ãƒ‰ã¯ã‚·ãƒªã‚¢ãƒ«ç•ªå·ã«ç´ä»˜ã„ã¦ã„ã¾ã™...",
    "LOGIN / REGISTER": "ãƒ­ã‚°ã‚¤ãƒ³ / ç™»éŒ²",
    "CHAT": "ãƒãƒ£ãƒƒãƒˆ",
    "PESERTA": "å‚åŠ è€…",
    "Sign in to continue streaming and gaming": "ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦é…ä¿¡ã¨ã‚²ãƒ¼ãƒ ã‚’ç¶šã‘ã‚‹",
    "Remember me": "ãƒ­ã‚°ã‚¤ãƒ³çŠ¶æ…‹ã‚’ä¿æŒ",
    "Forgot Password?": "ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ã‚’ãŠå¿˜ã‚Œã§ã™ã‹ï¼Ÿ",
    "or Connect with Crypto Wallet": "ã¾ãŸã¯æš—å·è³‡ç”£ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š",
    "Connect Wallet": "ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š",
    "Register Now": "ä»Šã™ãç™»éŒ²",
    "ADMIN PANEL": "ç®¡ç†è€…ãƒ‘ãƒãƒ«",
    "Secure administrator access": "å®‰å…¨ãªç®¡ç†è€…ã‚¢ã‚¯ã‚»ã‚¹",
    "Admin Email": "ç®¡ç†è€…ãƒ¡ãƒ¼ãƒ«",
    "Password / Owner Key": "ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ / ã‚ªãƒ¼ãƒŠãƒ¼ã‚­ãƒ¼",
    "Production": "æœ¬ç•ªç’°å¢ƒ",
    "Overview": "æ¦‚è¦",
    "Users": "ãƒ¦ãƒ¼ã‚¶ãƒ¼",
    "Transactions": "å–å¼•",
    "Jackpot Grants": "ã‚¸ãƒ£ãƒƒã‚¯ãƒãƒƒãƒˆä»˜ä¸Ž",
    "Admin Accounts": "ç®¡ç†è€…ã‚¢ã‚«ã‚¦ãƒ³ãƒˆ",
    "Admin isolation": "ç®¡ç†è€…åˆ†é›¢",
    "Production data only": "æœ¬ç•ªãƒ‡ãƒ¼ã‚¿ã®ã¿",
    "Select User": "ãƒ¦ãƒ¼ã‚¶ãƒ¼ã‚’é¸æŠž",
    "Choose user...": "ãƒ¦ãƒ¼ã‚¶ãƒ¼ã‚’é¸æŠž...",
    "Jackpot Value (USDT)": "ã‚¸ãƒ£ãƒƒã‚¯ãƒãƒƒãƒˆé‡‘é¡ï¼ˆUSDTï¼‰",
    "Reason / Audit Note": "ç†ç”± / ç›£æŸ»ãƒ¡ãƒ¢",
    "Task": "ã‚¿ã‚¹ã‚¯",
    "Category": "ã‚«ãƒ†ã‚´ãƒª",
    "Reward": "å ±é…¬",
    "Status": "ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹",
    "Action": "æ“ä½œ",
    "Checking admin session...": "ç®¡ç†è€…ã‚»ãƒƒã‚·ãƒ§ãƒ³ã‚’ç¢ºèªä¸­..."
  },
  "ko": {
    "Terms & Conditions": "ì•½ê´€",
    "Don't have an account?": "ê³„ì •ì´ ì—†ìœ¼ì‹ ê°€ìš”?",
    "Secured with Web3": "Web3ë¡œ ë³´í˜¸ë¨",
    "Biometric Login Available": "ìƒì²´ ì¸ì¦ ë¡œê·¸ì¸ ì‚¬ìš© ê°€ëŠ¥",
    "Edit": "íŽ¸ì§‘",
    "Logout": "ë¡œê·¸ì•„ì›ƒ",
    "Yield:": "ìˆ˜ìµë¥ :",
    "Locked Balance Policy": "ìž ê¸ˆ ìž”ì•¡ ì •ì±…",
    "Locked USDT earns passive daily yield...": "ìž ê¸ˆëœ USDTëŠ” ë§¤ì¼ íŒ¨ì‹œë¸Œ ìˆ˜ìµì„ ì–»ìŠµë‹ˆë‹¤...",
    "Earn Passive Crypto & Gold Coins": "ì•”í˜¸í™”íì™€ ê³¨ë“œ ì½”ì¸ì„ íŒ¨ì‹œë¸Œí•˜ê²Œ íšë“",
    "Invite fellow gamers to NEXUS...": "ë‹¤ë¥¸ ê²Œì´ë¨¸ë¥¼ NEXUSì— ì´ˆëŒ€...",
    "Anyone registering with your link receives...": "ë§í¬ë¡œ ê°€ìž…í•œ ì‚¬ìš©ìžëŠ”...",
    "+500 Gold Coins": "+500 ê³¨ë“œ ì½”ì¸",
    "Unclaimed Commission Balance": "ë¯¸ì²­êµ¬ ì»¤ë¯¸ì…˜ ìž”ì•¡",
    "Tier 1 (Direct)": "1ë‹¨ê³„ (ì§ì ‘)",
    "Tier 2 (Sub-Affiliate)": "2ë‹¨ê³„ (ì„œë¸Œ ì œíœ´)",
    "Tier 3 (Extended)": "3ë‹¨ê³„ (í™•ìž¥)",
    "14 Players": "14ëª…",
    "Slide to project your estimated monthly passive revenue...": "ìŠ¬ë¼ì´ë“œí•˜ì—¬ ì˜ˆìƒ ì›”ê°„ íŒ¨ì‹œë¸Œ ìˆ˜ìµì„ í™•ì¸...",
    "Belum ada data referral produksi untuk wallet ini.": "ì´ ì§€ê°‘ì˜ í”„ë¡œë•ì…˜ ì¶”ì²œ ë°ì´í„°ê°€ ì—†ìŠµë‹ˆë‹¤.",
    "Reward harian masuk ke saldo": "ì¼ì¼ ë³´ìƒì´ ìž”ì•¡ì— ì¶”ê°€ë©ë‹ˆë‹¤",
    "Buka Blind Box harian berdasarkan saldo...": "ìž”ì•¡ì— ë”°ë¼ ë§¤ì¼ ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ë¥¼ ì—½ë‹ˆë‹¤...",
    "Daily Boxes": "ì¼ì¼ ìƒìž",
    "Durasi lock tersedia": "ì‚¬ìš© ê°€ëŠ¥í•œ ìž ê¸ˆ ê¸°ê°„",
    "Lock Amount": "ìž ê¸ˆ ê¸ˆì•¡",
    "Durasi Lock": "ìž ê¸ˆ ê¸°ê°„",
    "Lock Aktif": "ìž ê¸ˆ í™œì„±",
    "Daily Claim": "ì¼ì¼ ìˆ˜ë ¹",
    "Reward dikreditkan ke saldo tersedia": "ë³´ìƒì´ ì‚¬ìš© ê°€ëŠ¥ ìž”ì•¡ì— ì ë¦½ë©ë‹ˆë‹¤",
    "Power Stat": "íŒŒì›Œ ìŠ¤íƒ¯",
    "Select Mystery Crate Tier": "ë¯¸ìŠ¤í„°ë¦¬ í¬ë ˆì´íŠ¸ ë“±ê¸‰ ì„ íƒ",
    "30 Days Term": "30ì¼ ê¸°ê°„",
    "60 Days Term": "60ì¼ ê¸°ê°„",
    "90 Days Term": "90ì¼ ê¸°ê°„",
    "Streamer raffle wheel containing live viewer usernames...": "ë¼ì´ë¸Œ ì‹œì²­ìž ì‚¬ìš©ìžëª…ì´ í¬í•¨ëœ ìŠ¤íŠ¸ë¦¬ë¨¸ ì¶”ì²¨ íœ ...",
    "WIN": "ë‹¹ì²¨",
    "Streamer Username Manager": "ìŠ¤íŠ¸ë¦¬ë¨¸ ì‚¬ìš©ìžëª… ê´€ë¦¬",
    "Add": "ì¶”ê°€",
    "Clear All": "ëª¨ë‘ ì§€ìš°ê¸°",
    "Predict the concealed cryptographic serial digits...": "ìˆ¨ê²¨ì§„ ì•”í˜¸ ì‹œë¦¬ì–¼ ìˆ«ìžë¥¼ ì˜ˆì¸¡...",
    "Close": "ë‹«ê¸°",
    "Card Digits (Exactly 4 Digits) & Conceal Toggle": "ì¹´ë“œ ìˆ«ìž(ì •í™•ížˆ 4ìžë¦¬) ë° ìˆ¨ê¹€ ì „í™˜",
    "Cancel": "ì·¨ì†Œ",
    "Save & Publish Card": "ì¹´ë“œ ì €ìž¥ ë° ê²Œì‹œ",
    "Serial No:": "ì¼ë ¨ë²ˆí˜¸:",
    "Digital Crypto Verification Code (4 Digits)": "ë””ì§€í„¸ ì•”í˜¸ ê²€ì¦ ì½”ë“œ(4ìžë¦¬)",
    "The 4-digit code is tied to serial number...": "4ìžë¦¬ ì½”ë“œëŠ” ì¼ë ¨ë²ˆí˜¸ì— ì—°ê²°ë©ë‹ˆë‹¤...",
    "LOGIN / REGISTER": "ë¡œê·¸ì¸ / íšŒì›ê°€ìž…",
    "CHAT": "ì±„íŒ…",
    "PESERTA": "ì°¸ê°€ìž",
    "Sign in to continue streaming and gaming": "ë¡œê·¸ì¸í•˜ì—¬ ìŠ¤íŠ¸ë¦¬ë°ê³¼ ê²Œìž„ì„ ê³„ì†í•˜ì„¸ìš”",
    "Remember me": "ë¡œê·¸ì¸ ìƒíƒœ ìœ ì§€",
    "Forgot Password?": "ë¹„ë°€ë²ˆí˜¸ë¥¼ ìžŠìœ¼ì…¨ë‚˜ìš”?",
    "or Connect with Crypto Wallet": "ë˜ëŠ” ì•”í˜¸í™”í ì§€ê°‘ ì—°ê²°",
    "Connect Wallet": "ì§€ê°‘ ì—°ê²°",
    "Register Now": "ì§€ê¸ˆ ê°€ìž…",
    "ADMIN PANEL": "ê´€ë¦¬ìž íŒ¨ë„",
    "Secure administrator access": "ì•ˆì „í•œ ê´€ë¦¬ìž ì ‘ê·¼",
    "Admin Email": "ê´€ë¦¬ìž ì´ë©”ì¼",
    "Password / Owner Key": "ë¹„ë°€ë²ˆí˜¸ / ì†Œìœ ìž í‚¤",
    "Production": "í”„ë¡œë•ì…˜",
    "Overview": "ê°œìš”",
    "Users": "ì‚¬ìš©ìž",
    "Transactions": "ê±°ëž˜",
    "Jackpot Grants": "ìž­íŒŸ ì§€ê¸‰",
    "Admin Accounts": "ê´€ë¦¬ìž ê³„ì •",
    "Admin isolation": "ê´€ë¦¬ìž ê²©ë¦¬",
    "Production data only": "í”„ë¡œë•ì…˜ ë°ì´í„°ë§Œ",
    "Select User": "ì‚¬ìš©ìž ì„ íƒ",
    "Choose user...": "ì‚¬ìš©ìž ì„ íƒ...",
    "Jackpot Value (USDT)": "ìž­íŒŸ ê¸ˆì•¡ (USDT)",
    "Reason / Audit Note": "ì‚¬ìœ  / ê°ì‚¬ ë©”ëª¨",
    "Task": "ìž‘ì—…",
    "Category": "ì¹´í…Œê³ ë¦¬",
    "Reward": "ë³´ìƒ",
    "Status": "ìƒíƒœ",
    "Action": "ìž‘ì—…",
    "Checking admin session...": "ê´€ë¦¬ìž ì„¸ì…˜ í™•ì¸ ì¤‘..."
  },
  "ar": {
    "Terms & Conditions": "الشروط والأحكام",
    "Don't have an account?": "ليس لديك حساب؟",
    "Secured with Web3": "محمي بواسطة Web3",
    "Biometric Login Available": "تسجيل الدخول بالبصمة متاح",
    "Edit": "تعديل",
    "Logout": "تسجيل الخروج",
    "Yield:": "العائد:",
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
    "Serial No:": "رقم التسلسل:",
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
    'Profile':'Profil','Kelola akun, wallet, dan aktivitas kamu.':'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address':'ID Pengguna = Alamat Wallet','Available':'Tersedia','Locked':'Terkunci','Withdraw':'Penarikan','Ajukan penarikan':'Ajukan penarikan','Registration Bonus':'Bonus Pendaftaran','Bonus tersedia dan belum diklaim.':'Bonus tersedia dan belum diklaim.','Available Balance':'Saldo Tersedia','Bagikan link ini untuk mengundang user baru.':'Bagikan link ini untuk mengundang user baru.','Event Participation Status':'Status Partisipasi Event','Belum ada event yang diikuti.':'Belum ada event yang diikuti.','Deposit, withdrawal, lock, reward & bonus':'Deposit, penarikan, lock, reward & bonus','Belum ada transaksi.':'Belum ada transaksi.','Submit Withdrawal':'Ajukan Penarikan','Upload / Create Post':'Upload / Buat Post',
    'TOP USERS RANKED':'PERINGKAT PENGGUNA TERATAS','TOTAL REFERRALS':'TOTAL REFERRAL','BONUS BALANCE':'SALDO BONUS','INVITE FRIENDS â€” EARN NOW':'UNDANG TEMAN — DAPATKAN REWARD','Privacy Policy':'Kebijakan Privasi','Last updated: October 1, 2026':'Terakhir diperbarui: 1 Oktober 2026','Terms & Conditions':'Syarat & Ketentuan','Please read these terms before creating your SYS STREAM account.':'Baca ketentuan ini sebelum membuat akun SYS STREAM.','Remember me':'Ingat saya','or Connect with Crypto Wallet':'atau Hubungkan dengan Crypto Wallet','Connect Wallet':'Hubungkan Wallet',"Don't have an account? ":'Belum punya akun? ','EVM Wallet Recovery Phrase':'Recovery Phrase EVM Wallet','Wallet Address':'Alamat Wallet','Recovery Phrase':'Recovery Phrase','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.'
  },
  en: {
    'Profile':'Profile','Kelola akun, wallet, dan aktivitas kamu.':'Manage your account, wallet, and activity.','User ID = Wallet Address':'User ID = Wallet Address','Available':'Available','Locked':'Locked','Withdraw':'Withdraw','Ajukan penarikan':'Request Withdrawal','Registration Bonus':'Registration Bonus','Bonus tersedia dan belum diklaim.':'Bonus is available and has not been claimed.','Available Balance':'Available Balance','Bagikan link ini untuk mengundang user baru.':'Share this link to invite new users.','Event Participation Status':'Event Participation Status','Belum ada event yang diikuti.':'No events joined yet.','Deposit, withdrawal, lock, reward & bonus':'Deposit, withdrawal, lock, reward & bonus','Belum ada transaksi.':'No transactions yet.','Submit Withdrawal':'Submit Withdrawal','Upload / Create Post':'Upload / Create Post','TOP USERS RANKED':'TOP USERS RANKED','TOTAL REFERRALS':'TOTAL REFERRALS','BONUS BALANCE':'BONUS BALANCE','INVITE FRIENDS â€” EARN NOW':'INVITE FRIENDS — EARN NOW','Privacy Policy':'Privacy Policy','Last updated: October 1, 2026':'Last updated: October 1, 2026','Terms & Conditions':'Terms & Conditions','Please read these terms before creating your SYS STREAM account.':'Please read these terms before creating your SYS STREAM account.','Remember me':'Remember me','or Connect with Crypto Wallet':'or Connect with Crypto Wallet','Connect Wallet':'Connect Wallet',"Don't have an account? ":"Don't have an account? ",'EVM Wallet Recovery Phrase':'EVM Wallet Recovery Phrase','Wallet Address':'Wallet Address','Recovery Phrase':'Recovery Phrase'
  },
  es: {'Profile':'Perfil','Kelola akun, wallet, dan aktivitas kamu.':'Administra tu cuenta, billetera y actividad.','User ID = Wallet Address':'ID de usuario = dirección de billetera','Available':'Disponible','Locked':'Bloqueado','Withdraw':'Retirar','Registration Bonus':'Bono de registro','Available Balance':'Saldo disponible','Event Participation Status':'Estado de participación en eventos','Transaction History':'Historial de transacciones','Privacy Policy':'Política de privacidad','Terms & Conditions':'Términos y condiciones','Remember me':'Recuérdame','Connect Wallet':'Conectar billetera','Wallet Address':'Dirección de billetera','Recovery Phrase':'Frase de recuperación'},
  pt: {'Profile':'Perfil','Kelola akun, wallet, dan aktivitas kamu.':'Gerencie sua conta, carteira e atividade.','User ID = Wallet Address':'ID do usuário = endereço da carteira','Available':'Disponível','Locked':'Bloqueado','Withdraw':'Saque','Registration Bonus':'Bônus de registro','Available Balance':'Saldo disponível','Event Participation Status':'Status de participação no evento','Transaction History':'Histórico de transações','Privacy Policy':'Política de privacidade','Terms & Conditions':'Termos e condições','Remember me':'Lembrar de mim','Connect Wallet':'Conectar carteira','Wallet Address':'Endereço da carteira','Recovery Phrase':'Frase de recuperação'},
  zh: {'Profile':'ä¸ªäººèµ„æ–™','Kelola akun, wallet, dan aktivitas kamu.':'ç®¡ç†æ‚¨çš„è´¦æˆ·ã€é’±åŒ…å’Œæ´»åŠ¨ã€‚','User ID = Wallet Address':'ç”¨æˆ· ID = é’±åŒ…åœ°å€','Available':'å¯ç”¨','Locked':'å·²é”å®š','Withdraw':'æçŽ°','Registration Bonus':'æ³¨å†Œå¥–åŠ±','Available Balance':'å¯ç”¨ä½™é¢','Event Participation Status':'æ´»åŠ¨å‚ä¸ŽçŠ¶æ€','Transaction History':'äº¤æ˜“è®°å½•','Privacy Policy':'éšç§æ”¿ç­–','Terms & Conditions':'æ¡æ¬¾ä¸Žæ¡ä»¶','Remember me':'è®°ä½æˆ‘','Connect Wallet':'è¿žæŽ¥é’±åŒ…','Wallet Address':'é’±åŒ…åœ°å€','Recovery Phrase':'åŠ©è®°è¯'},
  ja: {'Profile':'ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«','Kelola akun, wallet, dan aktivitas kamu.':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã€ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã€ã‚¢ã‚¯ãƒ†ã‚£ãƒ“ãƒ†ã‚£ã‚’ç®¡ç†ã—ã¾ã™ã€‚','User ID = Wallet Address':'ãƒ¦ãƒ¼ã‚¶ãƒ¼ID = ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹','Available':'åˆ©ç”¨å¯èƒ½','Locked':'ãƒ­ãƒƒã‚¯æ¸ˆã¿','Withdraw':'å‡ºé‡‘','Registration Bonus':'ç™»éŒ²ãƒœãƒ¼ãƒŠã‚¹','Available Balance':'åˆ©ç”¨å¯èƒ½æ®‹é«˜','Event Participation Status':'ã‚¤ãƒ™ãƒ³ãƒˆå‚åŠ çŠ¶æ³','Transaction History':'å–å¼•å±¥æ­´','Privacy Policy':'ãƒ—ãƒ©ã‚¤ãƒã‚·ãƒ¼ãƒãƒªã‚·ãƒ¼','Terms & Conditions':'åˆ©ç”¨è¦ç´„','Remember me':'ãƒ­ã‚°ã‚¤ãƒ³çŠ¶æ…‹ã‚’ä¿æŒ','Connect Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š','Wallet Address':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹','Recovery Phrase':'ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚º'},
  ko: {'Profile':'í”„ë¡œí•„','Kelola akun, wallet, dan aktivitas kamu.':'ê³„ì •, ì§€ê°‘ ë° í™œë™ì„ ê´€ë¦¬í•˜ì„¸ìš”.','User ID = Wallet Address':'ì‚¬ìš©ìž ID = ì§€ê°‘ ì£¼ì†Œ','Available':'ì‚¬ìš© ê°€ëŠ¥','Locked':'ìž ê¹€','Withdraw':'ì¶œê¸ˆ','Registration Bonus':'ê°€ìž… ë³´ë„ˆìŠ¤','Available Balance':'ì‚¬ìš© ê°€ëŠ¥ ìž”ì•¡','Event Participation Status':'ì´ë²¤íŠ¸ ì°¸ì—¬ ìƒíƒœ','Transaction History':'ê±°ëž˜ ë‚´ì—­','Privacy Policy':'ê°œì¸ì •ë³´ ë³´í˜¸ì •ì±…','Terms & Conditions':'ì´ìš©ì•½ê´€','Remember me':'ë¡œê·¸ì¸ ìƒíƒœ ìœ ì§€','Connect Wallet':'ì§€ê°‘ ì—°ê²°','Wallet Address':'ì§€ê°‘ ì£¼ì†Œ','Recovery Phrase':'ë³µêµ¬ ë¬¸êµ¬'},
  ar: {'Profile':'الملف الشخصي','Kelola akun, wallet, dan aktivitas kamu.':'إدارة حسابك ومحفظتك ونشاطك.','User ID = Wallet Address':'معرّف المستخدم = عنوان المحفظة','Available':'متاح','Locked':'مقفل','Withdraw':'سحب','Registration Bonus':'مكافأة التسجيل','Available Balance':'الرصيد المتاح','Event Participation Status':'حالة المشاركة في الفعاليات','Transaction History':'سجل المعاملات','Privacy Policy':'سياسة الخصوصية','Terms & Conditions':'الشروط والأحكام','Remember me':'تذكرني','Connect Wallet':'ربط المحفظة','Wallet Address':'عنوان المحفظة','Recovery Phrase':'عبارة الاسترداد'}
};
(Object.keys(CORE_PAGE_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...CORE_PAGE_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

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
    'Halo,':'Halo,','Buka Live Room â†’':'Buka Live Room â†’','Bonus pendaftaran masih tersedia untuk diklaim.':'Bonus pendaftaran masih tersedia untuk diklaim.'
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
    'Halo,':'Hello,','Buka Live Room â†’':'Open Live Room â†’','Bonus pendaftaran masih tersedia untuk diklaim.':'Registration bonus is still available to claim.'
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
    'Halo,':'Hola,','Buka Live Room â†’':'Abrir sala en vivo â†’','Bonus pendaftaran masih tersedia untuk diklaim.':'El bono de registro todavía se puede reclamar.'
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
    'Halo,':'Olá,','Buka Live Room â†’':'Abrir sala ao vivo â†’','Bonus pendaftaran masih tersedia untuk diklaim.':'O bônus de registro ainda pode ser resgatado.'
  },
  zh: {
    'SYS STREAM LOADING':'SYS STREAM åŠ è½½ä¸­','Initializing TikTok Live Sync + Cloudflare D1 Connection':'æ­£åœ¨åˆå§‹åŒ– TikTok Live åŒæ­¥ + Cloudflare D1 è¿žæŽ¥',    'Live Room':'ç›´æ’­é—´','Live Room Aktif':'ç›´æ’­é—´å·²å¼€å¯','Live belum aktif':'ç›´æ’­é—´å°šæœªå¼€å¯',
    'Masuk untuk bergabung ke Live Room':'ç™»å½•ä»¥åŠ å…¥ç›´æ’­é—´','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'æ¯ä¸ªè´¦æˆ·åœ¨ç›´æ’­é—´éƒ½æœ‰ç‹¬ç«‹çš„ä¸ªäººèµ„æ–™å’Œèº«ä»½ã€‚',
    'Peserta Live':'ç›´æ’­å‚ä¸Žè€…','Hanya akun yang benar-benar bergabung yang ditampilkan.':'ä»…æ˜¾ç¤ºå®žé™…åŠ å…¥çš„è´¦æˆ·ã€‚',
    'Memuat peserta...':'正在加载参与者…','Belum ada peserta lain.':'æš‚æ— å…¶ä»–å‚ä¸Žè€…ã€‚','Belum ada peserta.':'æš‚æ— å‚ä¸Žè€…ã€‚',
    'Profil akun Anda':'æ‚¨çš„è´¦æˆ·èµ„æ–™','Belum ada deskripsi room dari pemilik room.':'æš‚æ— æˆ¿ä¸»æä¾›çš„æˆ¿é—´æè¿°ã€‚',
    'Hanya data live produksi yang ditampilkan.':'ä»…æ˜¾ç¤ºç”Ÿäº§çŽ¯å¢ƒç›´æ’­æ•°æ®ã€‚','Tidak ada video atau streamer contoh.':'ä¸æ˜¾ç¤ºç¤ºä¾‹è§†é¢‘æˆ–ä¸»æ’­ã€‚',
    'LOGIN / REGISTER':'ç™»å½• / æ³¨å†Œ','CHAT':'èŠå¤©','PESERTA':'å‚ä¸Žè€…','Kirim':'å‘é€','Tulis pesan':'è¾“å…¥æ¶ˆæ¯',
    'Like gagal dikirim.':'ç‚¹èµžå‘é€å¤±è´¥ã€‚','Gagal memuat live room.':'åŠ è½½ç›´æ’­é—´å¤±è´¥ã€‚','Aksi live room gagal.':'ç›´æ’­é—´æ“ä½œå¤±è´¥ã€‚',
    'Masukkan alamat wallet tujuan.':'è¯·è¾“å…¥ç›®æ ‡é’±åŒ…åœ°å€ã€‚','Saldo tersedia tidak mencukupi.':'å¯ç”¨ä½™é¢ä¸è¶³ã€‚','Penarikan gagal.':'æçŽ°å¤±è´¥ã€‚',
    'Halo,':'ä½ å¥½ï¼Œ','Buka Live Room â†’':'æ‰“å¼€ç›´æ’­é—´ â†’','Bonus pendaftaran masih tersedia untuk diklaim.':'æ³¨å†Œå¥–åŠ±ä»å¯é¢†å–ã€‚'
  },
  ja: {
    'SYS STREAM LOADING':'SYS STREAM èª­ã¿è¾¼ã¿ä¸­','Initializing TikTok Live Sync + Cloudflare D1 Connection':'TikTok LiveåŒæœŸ + Cloudflare D1æŽ¥ç¶šã‚’åˆæœŸåŒ–ã—ã¦ã„ã¾ã™',
    'Live Room':'ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ','Live Room Aktif':'ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã¯æœ‰åŠ¹ã§ã™','Live belum aktif':'ãƒ©ã‚¤ãƒ–é…ä¿¡ã¯ã¾ã æœ‰åŠ¹ã§ã¯ã‚ã‚Šã¾ã›ã‚“',
    'Masuk untuk bergabung ke Live Room':'ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã«å‚åŠ ','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'å„ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã«ã¯ãƒ«ãƒ¼ãƒ å†…ã§å›ºæœ‰ã®ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«ã¨IDãŒã‚ã‚Šã¾ã™ã€‚',
    'Peserta Live':'ãƒ©ã‚¤ãƒ–å‚åŠ è€…','Hanya akun yang benar-benar bergabung yang ditampilkan.':'å®Ÿéš›ã«å‚åŠ ã—ãŸã‚¢ã‚«ã‚¦ãƒ³ãƒˆã®ã¿è¡¨ç¤ºã•ã‚Œã¾ã™ã€‚',
    'Memuat peserta...':'参加者を読み込み中…','Belum ada peserta lain.':'ä»–ã®å‚åŠ è€…ã¯ã„ã¾ã›ã‚“ã€‚','Belum ada peserta.':'å‚åŠ è€…ã¯ã„ã¾ã›ã‚“ã€‚',
    'Profil akun Anda':'ã‚ãªãŸã®ã‚¢ã‚«ã‚¦ãƒ³ãƒˆãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«','Belum ada deskripsi room dari pemilik room.':'ãƒ«ãƒ¼ãƒ æ‰€æœ‰è€…ã®èª¬æ˜Žã¯ã¾ã ã‚ã‚Šã¾ã›ã‚“ã€‚',
    'Hanya data live produksi yang ditampilkan.':'æœ¬ç•ªã®ãƒ©ã‚¤ãƒ–ãƒ‡ãƒ¼ã‚¿ã®ã¿è¡¨ç¤ºã•ã‚Œã¾ã™ã€‚','Tidak ada video atau streamer contoh.':'ã‚µãƒ³ãƒ—ãƒ«å‹•ç”»ã‚„é…ä¿¡è€…ã¯è¡¨ç¤ºã•ã‚Œã¾ã›ã‚“ã€‚',
    'LOGIN / REGISTER':'ãƒ­ã‚°ã‚¤ãƒ³ / ç™»éŒ²','CHAT':'ãƒãƒ£ãƒƒãƒˆ','PESERTA':'å‚åŠ è€…','Kirim':'é€ä¿¡','Tulis pesan':'ãƒ¡ãƒƒã‚»ãƒ¼ã‚¸ã‚’å…¥åŠ›',
    'Like gagal dikirim.':'ã„ã„ã­ã‚’é€ä¿¡ã§ãã¾ã›ã‚“ã§ã—ãŸã€‚','Gagal memuat live room.':'ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã®èª­ã¿è¾¼ã¿ã«å¤±æ•—ã—ã¾ã—ãŸã€‚','Aksi live room gagal.':'ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã®æ“ä½œã«å¤±æ•—ã—ã¾ã—ãŸã€‚',
    'Masukkan alamat wallet tujuan.':'é€é‡‘å…ˆã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„ã€‚','Saldo tersedia tidak mencukupi.':'åˆ©ç”¨å¯èƒ½æ®‹é«˜ãŒä¸è¶³ã—ã¦ã„ã¾ã™ã€‚','Penarikan gagal.':'å‡ºé‡‘ã«å¤±æ•—ã—ã¾ã—ãŸã€‚',
    'Halo,':'ã“ã‚“ã«ã¡ã¯ã€','Buka Live Room â†’':'ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã‚’é–‹ã â†’','Bonus pendaftaran masih tersedia untuk diklaim.':'ç™»éŒ²ãƒœãƒ¼ãƒŠã‚¹ã‚’ã¾ã å—ã‘å–ã‚Œã¾ã™ã€‚'
  },
  ko: {
    'SYS STREAM LOADING':'SYS STREAM ë¡œë”© ì¤‘','Initializing TikTok Live Sync + Cloudflare D1 Connection':'TikTok Live ë™ê¸°í™” + Cloudflare D1 ì—°ê²° ì´ˆê¸°í™” ì¤‘',
    'Live Room':'ë¼ì´ë¸Œ ë£¸','Live Room Aktif':'ë¼ì´ë¸Œ ë£¸ í™œì„±','Live belum aktif':'ë¼ì´ë¸Œ ë£¸ì´ ì•„ì§ í™œì„±í™”ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤',
    'Masuk untuk bergabung ke Live Room':'ë¡œê·¸ì¸í•˜ì—¬ ë¼ì´ë¸Œ ë£¸ì— ì°¸ì—¬í•˜ì„¸ìš”','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'ê° ê³„ì •ì€ ë£¸ì—ì„œ ê³ ìœ í•œ í”„ë¡œí•„ê³¼ ì‹ ì›ì„ ê°€ì§‘ë‹ˆë‹¤.',
    'Peserta Live':'ë¼ì´ë¸Œ ì°¸ê°€ìž','Hanya akun yang benar-benar bergabung yang ditampilkan.':'ì‹¤ì œë¡œ ì°¸ì—¬í•œ ê³„ì •ë§Œ í‘œì‹œë©ë‹ˆë‹¤.',
    'Memuat peserta...':'참가자 불러오는 중…','Belum ada peserta lain.':'ì•„ì§ ë‹¤ë¥¸ ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.','Belum ada peserta.':'ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.',
    'Profil akun Anda':'ë‚´ ê³„ì • í”„ë¡œí•„','Belum ada deskripsi room dari pemilik room.':'ë£¸ ì†Œìœ ìžì˜ ì„¤ëª…ì´ ì•„ì§ ì—†ìŠµë‹ˆë‹¤.',
    'Hanya data live produksi yang ditampilkan.':'í”„ë¡œë•ì…˜ ë¼ì´ë¸Œ ë°ì´í„°ë§Œ í‘œì‹œë©ë‹ˆë‹¤.','Tidak ada video atau streamer contoh.':'ìƒ˜í”Œ ì˜ìƒì´ë‚˜ ìŠ¤íŠ¸ë¦¬ë¨¸ëŠ” í‘œì‹œë˜ì§€ ì•ŠìŠµë‹ˆë‹¤.',
    'LOGIN / REGISTER':'ë¡œê·¸ì¸ / ê°€ìž…','CHAT':'ì±„íŒ…','PESERTA':'ì°¸ê°€ìž','Kirim':'ì „ì†¡','Tulis pesan':'ë©”ì‹œì§€ ìž…ë ¥',
    'Like gagal dikirim.':'ì¢‹ì•„ìš”ë¥¼ ë³´ë‚´ì§€ ëª»í–ˆìŠµë‹ˆë‹¤.','Gagal memuat live room.':'ë¼ì´ë¸Œ ë£¸ì„ ë¶ˆëŸ¬ì˜¤ì§€ ëª»í–ˆìŠµë‹ˆë‹¤.','Aksi live room gagal.':'ë¼ì´ë¸Œ ë£¸ ìž‘ì—…ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.',
    'Masukkan alamat wallet tujuan.':'ëª©ì ì§€ ì§€ê°‘ ì£¼ì†Œë¥¼ ìž…ë ¥í•˜ì„¸ìš”.','Saldo tersedia tidak mencukupi.':'ì‚¬ìš© ê°€ëŠ¥í•œ ìž”ì•¡ì´ ë¶€ì¡±í•©ë‹ˆë‹¤.','Penarikan gagal.':'ì¶œê¸ˆì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.',
    'Halo,':'ì•ˆë…•í•˜ì„¸ìš”,','Buka Live Room â†’':'ë¼ì´ë¸Œ ë£¸ ì—´ê¸° â†’','Bonus pendaftaran masih tersedia untuk diklaim.':'ê°€ìž… ë³´ë„ˆìŠ¤ë¥¼ ì•„ì§ ë°›ì„ ìˆ˜ ìžˆìŠµë‹ˆë‹¤.'
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
    'Halo,':'مرحباً،','Buka Live Room â†’':'فتح الغرفة المباشرة →','Bonus pendaftaran masih tersedia untuk diklaim.':'لا تزال مكافأة التسجيل متاحة للاستلام.'
  }
};

(Object.keys(GLOBAL_UI_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...GLOBAL_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

(Object.keys(COMMON_PAGE_TRANSLATIONS) as LanguageCode[]).forEach((lang) => {
  PAGE_UI_TRANSLATIONS[lang] = { ...COMMON_PAGE_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
});

Object.assign(translations.id,{ 'Leaderboard & Referral':'Papan Peringkat & Referral','Leaderboard':'Papan Peringkat','Referral Event':'Event Referral','Production Leaderboard':'Papan Peringkat Produksi','No production ranking data is available yet. Dummy ranking data is intentionally disabled.':'Data peringkat produksi belum tersedia. Data peringkat dummy sengaja dinonaktifkan.','Referral participation is optional. Use your wallet identity as your referral identifier.':'Partisipasi referral bersifat opsional. Gunakan identitas wallet sebagai identitas referral.','Your Wallet / Referral ID':'Wallet / ID Referral Anda','Wallet not connected':'Wallet belum terhubung','Copy Referral ID':'Salin ID Referral','Live Referral Data':'Data Referral Live','Only verified production activity will be shown here.':'Hanya aktivitas produksi yang terverifikasi yang akan ditampilkan di sini.','Code Copied!':'Kode Disalin!','Referral code copied to clipboard.':'Kode referral berhasil disalin ke clipboard.','Referral':'Referral','No new notifications.':'Tidak ada notifikasi baru.'});
Object.assign(translations.en,{ 'Leaderboard & Referral':'Leaderboard & Referral','Leaderboard':'Leaderboard','Referral Event':'Referral Event','Production Leaderboard':'Production Leaderboard','No production ranking data is available yet. Dummy ranking data is intentionally disabled.':'No production ranking data is available yet. Dummy ranking data is intentionally disabled.','Referral participation is optional. Use your wallet identity as your referral identifier.':'Referral participation is optional. Use your wallet identity as your referral identifier.','Your Wallet / Referral ID':'Your Wallet / Referral ID','Wallet not connected':'Wallet not connected','Copy Referral ID':'Copy Referral ID','Live Referral Data':'Live Referral Data','Only verified production activity will be shown here.':'Only verified production activity will be shown here.','Code Copied!':'Code Copied!','Referral code copied to clipboard.':'Referral code copied to clipboard.','Referral':'Referral','No new notifications.':'No new notifications.'});
Object.assign(translations.es,{ 'Leaderboard & Referral':'Clasificación y referidos','Leaderboard':'Clasificación','Referral Event':'Evento de referidos','Production Leaderboard':'Clasificación de producción','Wallet not connected':'Wallet no conectada','Copy Referral ID':'Copiar ID de referido','Live Referral Data':'Datos de referidos en vivo','Referral':'Referidos','No new notifications.':'No hay notificaciones nuevas.'});
Object.assign(translations.pt,{ 'Leaderboard & Referral':'Ranking e indicações','Leaderboard':'Ranking','Referral Event':'Evento de indicações','Production Leaderboard':'Ranking de produção','Wallet not connected':'Carteira não conectada','Copy Referral ID':'Copiar ID de indicação','Live Referral Data':'Dados de indicações ao vivo','Referral':'Indicação','No new notifications.':'Não há novas notificações.'});
Object.assign(translations.zh,{ 'Leaderboard & Referral':'æŽ’è¡Œæ¦œä¸ŽæŽ¨è','Leaderboard':'æŽ’è¡Œæ¦œ','Referral Event':'æŽ¨èæ´»åŠ¨','Production Leaderboard':'ç”Ÿäº§æŽ’è¡Œæ¦œ','Wallet not connected':'é’±åŒ…æœªè¿žæŽ¥','Copy Referral ID':'å¤åˆ¶æŽ¨èID','Live Referral Data':'å®žæ—¶æŽ¨èæ•°æ®','Referral':'æŽ¨è','No new notifications.':'æ²¡æœ‰æ–°é€šçŸ¥ã€‚'});
Object.assign(translations.ja,{ 'Leaderboard & Referral':'ãƒ©ãƒ³ã‚­ãƒ³ã‚°ã¨ç´¹ä»‹','Leaderboard':'ãƒ©ãƒ³ã‚­ãƒ³ã‚°','Referral Event':'ç´¹ä»‹ã‚¤ãƒ™ãƒ³ãƒˆ','Production Leaderboard':'æœ¬ç•ªãƒ©ãƒ³ã‚­ãƒ³ã‚°','Wallet not connected':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆæœªæŽ¥ç¶š','Copy Referral ID':'ç´¹ä»‹IDã‚’ã‚³ãƒ”ãƒ¼','Live Referral Data':'ãƒ©ã‚¤ãƒ–ç´¹ä»‹ãƒ‡ãƒ¼ã‚¿','Referral':'ç´¹ä»‹','No new notifications.':'æ–°ã—ã„é€šçŸ¥ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚'});
Object.assign(translations.ko,{ 'Leaderboard & Referral':'ìˆœìœ„ ë° ì¶”ì²œ','Leaderboard':'ìˆœìœ„í‘œ','Referral Event':'ì¶”ì²œ ì´ë²¤íŠ¸','Production Leaderboard':'ìš´ì˜ ìˆœìœ„í‘œ','Wallet not connected':'ì§€ê°‘ì´ ì—°ê²°ë˜ì§€ ì•ŠìŒ','Copy Referral ID':'ì¶”ì²œ ID ë³µì‚¬','Live Referral Data':'ì‹¤ì‹œê°„ ì¶”ì²œ ë°ì´í„°','Referral':'ì¶”ì²œ','No new notifications.':'ìƒˆ ì•Œë¦¼ì´ ì—†ìŠµë‹ˆë‹¤.'});
Object.assign(translations.ar,{ 'Leaderboard & Referral':'المتصدرون والإحالات','Leaderboard':'المتصدرون','Referral Event':'حدث الإحالة','Production Leaderboard':'ترتيب الإنتاج','Wallet not connected':'المحفظة غير متصلة','Copy Referral ID':'نسخ معرّف الإحالة','Live Referral Data':'بيانات الإحالة المباشرة','Referral':'الإحالة','No new notifications.':'لا توجد إشعارات جديدة.'});

Object.assign(translations.id, {'Username, Email or Wallet':'Username, Email atau Wallet'});
Object.assign(translations.en, {'Username, Email or Wallet':'Username, Email or Wallet'});
Object.assign(translations.es, {'Username, Email or Wallet':'Usuario, correo o wallet'});
Object.assign(translations.pt, {'Username, Email or Wallet':'Usuário, e-mail ou carteira'});
Object.assign(translations.zh, {'Username, Email or Wallet':'ç”¨æˆ·åã€é‚®ç®±æˆ–é’±åŒ…'});
Object.assign(translations.ja, {'Username, Email or Wallet':'ãƒ¦ãƒ¼ã‚¶ãƒ¼åã€ãƒ¡ãƒ¼ãƒ«ã€ã¾ãŸã¯ã‚¦ã‚©ãƒ¬ãƒƒãƒˆ'});
Object.assign(translations.ko, {'Username, Email or Wallet':'ì‚¬ìš©ìž ì´ë¦„, ì´ë©”ì¼ ë˜ëŠ” ì§€ê°‘'});
Object.assign(translations.ar, {'Username, Email or Wallet':'اسم المستخدم أو البريد أو المحفظة'});


const ALL_PAGE_LABELS: Record<LanguageCode, Record<string,string>> = {
id:{
'Back':'Kembali','Back to account':'Kembali ke akun','Legal':'Hukum','Please read these terms before creating your SYS STREAM account.':'Harap baca syarat ini sebelum membuat akun SYS STREAM.','Account & Security':'Akun & Keamanan','Balance & Transactions':'Saldo & Transaksi','Rules & Acceptance':'Aturan & Persetujuan','Acceptance of Terms':'Penerimaan Ketentuan','Eligibility & Account':'Kelayakan & Akun','Deposits & Digital Assets':'Deposit & Aset Digital','Available Balance & Locked Balance':'Saldo Tersedia & Saldo Terkunci','Games, Rewards & Settlement':'Game, Reward & Penyelesaian','Prohibited Conduct':'Perilaku yang Dilarang','Account Review & Suspension':'Peninjauan & Penangguhan Akun','Service Availability':'Ketersediaan Layanan','Limitation of Liability':'Batasan Tanggung Jawab','Changes to These Terms':'Perubahan Ketentuan','Contact':'Kontak','Important:':'Penting:','These platform terms describe how SYS STREAM operates. They should be reviewed by qualified legal counsel before commercial launch to address the laws and regulations applicable to the service and its users.':'Ketentuan platform ini menjelaskan cara kerja SYS STREAM. Ketentuan ini sebaiknya ditinjau penasihat hukum yang berkualifikasi sebelum peluncuran komersial untuk menyesuaikan dengan hukum dan regulasi yang berlaku bagi layanan dan penggunanya.','Privacy Policy':'Kebijakan Privasi','Scope':'Ruang Lingkup','Information We Collect':'Informasi yang Kami Kumpulkan','How We Use Information':'Cara Kami Menggunakan Informasi','Blockchain and Payment Information':'Informasi Blockchain dan Pembayaran','Sharing of Information':'Berbagi Informasi','Data Security':'Keamanan Data','Data Retention':'Penyimpanan Data','Your Choices and Rights':'Pilihan dan Hak Anda','Cookies and Local Storage':'Cookie dan Penyimpanan Lokal','Children':'Anak-anak','Changes to This Policy':'Perubahan Kebijakan','This Privacy Policy explains how SYS STREAM may collect, use, store, and protect information when you use the platform.':'Kebijakan Privasi ini menjelaskan bagaimana SYS STREAM dapat mengumpulkan, menggunakan, menyimpan, dan melindungi informasi saat Anda menggunakan platform.','Last updated:':'Terakhir diperbarui:'
},
en:{},
es:{
'Back':'Volver','Back to account':'Volver a la cuenta','Legal':'Legal','Please read these terms before creating your SYS STREAM account.':'Lee estos términos antes de crear tu cuenta SYS STREAM.','Account & Security':'Cuenta y seguridad','Balance & Transactions':'Saldo y transacciones','Rules & Acceptance':'Reglas y aceptación','Acceptance of Terms':'Aceptación de los términos','Eligibility & Account':'Elegibilidad y cuenta','Deposits & Digital Assets':'Depósitos y activos digitales','Available Balance & Locked Balance':'Saldo disponible y saldo bloqueado','Games, Rewards & Settlement':'Juegos, recompensas y liquidación','Prohibited Conduct':'Conducta prohibida','Account Review & Suspension':'Revisión y suspensión de cuenta','Service Availability':'Disponibilidad del servicio','Limitation of Liability':'Limitación de responsabilidad','Changes to These Terms':'Cambios en estos términos','Contact':'Contacto','Important:':'Importante:','Privacy Policy':'Política de privacidad','Scope':'Alcance','Information We Collect':'Información que recopilamos','How We Use Information':'Cómo usamos la información','Blockchain and Payment Information':'Información de blockchain y pagos','Sharing of Information':'Compartir información','Data Security':'Seguridad de datos','Data Retention':'Conservación de datos','Your Choices and Rights':'Tus opciones y derechos','Cookies and Local Storage':'Cookies y almacenamiento local','Children':'Menores','Changes to This Policy':'Cambios en esta política','Last updated:':'Última actualización:'
},
pt:{
'Back':'Voltar','Back to account':'Voltar para a conta','Legal':'Jurídico','Please read these terms before creating your SYS STREAM account.':'Leia estes termos antes de criar sua conta SYS STREAM.','Account & Security':'Conta e segurança','Balance & Transactions':'Saldo e transações','Rules & Acceptance':'Regras e aceitação','Acceptance of Terms':'Aceitação dos termos','Eligibility & Account':'Elegibilidade e conta','Deposits & Digital Assets':'Depósitos e ativos digitais','Available Balance & Locked Balance':'Saldo disponível e saldo bloqueado','Games, Rewards & Settlement':'Jogos, recompensas e liquidação','Prohibited Conduct':'Conduta proibida','Account Review & Suspension':'Revisão e suspensão da conta','Service Availability':'Disponibilidade do serviço','Limitation of Liability':'Limitação de responsabilidade','Changes to These Terms':'Alterações destes termos','Contact':'Contato','Important:':'Importante:','Privacy Policy':'Política de privacidade','Scope':'Escopo','Information We Collect':'Informações coletadas','How We Use Information':'Como usamos as informações','Blockchain and Payment Information':'Informações de blockchain e pagamentos','Sharing of Information':'Compartilhamento de informações','Data Security':'Segurança de dados','Data Retention':'Retenção de dados','Your Choices and Rights':'Suas escolhas e direitos','Cookies and Local Storage':'Cookies e armazenamento local','Children':'Crianças','Changes to This Policy':'Alterações desta política','Last updated:':'Última atualização:'
},
zh:{
'Back':'è¿”å›ž','Back to account':'è¿”å›žè´¦æˆ·','Legal':'æ³•å¾‹','Please read these terms before creating your SYS STREAM account.':'åˆ›å»º SYS STREAM è´¦æˆ·å‰è¯·é˜…è¯»è¿™äº›æ¡æ¬¾ã€‚','Account & Security':'è´¦æˆ·ä¸Žå®‰å…¨','Balance & Transactions':'ä½™é¢ä¸Žäº¤æ˜“','Rules & Acceptance':'è§„åˆ™ä¸ŽæŽ¥å—','Acceptance of Terms':'æŽ¥å—æ¡æ¬¾','Eligibility & Account':'èµ„æ ¼ä¸Žè´¦æˆ·','Deposits & Digital Assets':'å……å€¼ä¸Žæ•°å­—èµ„äº§','Available Balance & Locked Balance':'å¯ç”¨ä½™é¢ä¸Žé”å®šä½™é¢','Games, Rewards & Settlement':'æ¸¸æˆã€å¥–åŠ±ä¸Žç»“ç®—','Prohibited Conduct':'ç¦æ­¢è¡Œä¸º','Account Review & Suspension':'è´¦æˆ·å®¡æ ¸ä¸Žæš‚åœ','Service Availability':'æœåŠ¡å¯ç”¨æ€§','Limitation of Liability':'è´£ä»»é™åˆ¶','Changes to These Terms':'æ¡æ¬¾å˜æ›´','Contact':'è”ç³»','Important:':'é‡è¦ï¼š','Privacy Policy':'éšç§æ”¿ç­–','Scope':'èŒƒå›´','Information We Collect':'æˆ‘ä»¬æ”¶é›†çš„ä¿¡æ¯','How We Use Information':'æˆ‘ä»¬å¦‚ä½•ä½¿ç”¨ä¿¡æ¯','Blockchain and Payment Information':'åŒºå—é“¾ä¸Žæ”¯ä»˜ä¿¡æ¯','Sharing of Information':'ä¿¡æ¯å…±äº«','Data Security':'æ•°æ®å®‰å…¨','Data Retention':'æ•°æ®ä¿ç•™','Your Choices and Rights':'æ‚¨çš„é€‰æ‹©ä¸Žæƒåˆ©','Cookies and Local Storage':'Cookie ä¸Žæœ¬åœ°å­˜å‚¨','Children':'å„¿ç«¥','Changes to This Policy':'æ”¿ç­–å˜æ›´','Last updated:':'æœ€åŽæ›´æ–°ï¼š'
},
ja:{
'Back':'æˆ»ã‚‹','Back to account':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã«æˆ»ã‚‹','Legal':'æ³•å‹™','Please read these terms before creating your SYS STREAM account.':'SYS STREAMã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ä½œæˆã™ã‚‹å‰ã«ã€ã“ã‚Œã‚‰ã®è¦ç´„ã‚’ãŠèª­ã¿ãã ã•ã„ã€‚','Account & Security':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã¨ã‚»ã‚­ãƒ¥ãƒªãƒ†ã‚£','Balance & Transactions':'æ®‹é«˜ã¨å–å¼•','Rules & Acceptance':'ãƒ«ãƒ¼ãƒ«ã¨åŒæ„','Acceptance of Terms':'è¦ç´„ã¸ã®åŒæ„','Eligibility & Account':'åˆ©ç”¨è³‡æ ¼ã¨ã‚¢ã‚«ã‚¦ãƒ³ãƒˆ','Deposits & Digital Assets':'å…¥é‡‘ã¨ãƒ‡ã‚¸ã‚¿ãƒ«è³‡ç”£','Available Balance & Locked Balance':'åˆ©ç”¨å¯èƒ½æ®‹é«˜ã¨ãƒ­ãƒƒã‚¯æ®‹é«˜','Games, Rewards & Settlement':'ã‚²ãƒ¼ãƒ ãƒ»å ±é…¬ãƒ»æ±ºæ¸ˆ','Prohibited Conduct':'ç¦æ­¢è¡Œç‚º','Account Review & Suspension':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆå¯©æŸ»ã¨åœæ­¢','Service Availability':'ã‚µãƒ¼ãƒ“ã‚¹æä¾›çŠ¶æ³','Limitation of Liability':'è²¬ä»»ã®åˆ¶é™','Changes to These Terms':'è¦ç´„ã®å¤‰æ›´','Contact':'ãŠå•ã„åˆã‚ã›','Important:':'é‡è¦ï¼š','Privacy Policy':'ãƒ—ãƒ©ã‚¤ãƒã‚·ãƒ¼ãƒãƒªã‚·ãƒ¼','Scope':'é©ç”¨ç¯„å›²','Information We Collect':'åŽé›†ã™ã‚‹æƒ…å ±','How We Use Information':'æƒ…å ±ã®åˆ©ç”¨æ–¹æ³•','Blockchain and Payment Information':'ãƒ–ãƒ­ãƒƒã‚¯ãƒã‚§ãƒ¼ãƒ³ã¨æ±ºæ¸ˆæƒ…å ±','Sharing of Information':'æƒ…å ±ã®å…±æœ‰','Data Security':'ãƒ‡ãƒ¼ã‚¿ã‚»ã‚­ãƒ¥ãƒªãƒ†ã‚£','Data Retention':'ãƒ‡ãƒ¼ã‚¿ä¿æŒ','Your Choices and Rights':'é¸æŠžè‚¢ã¨æ¨©åˆ©','Cookies and Local Storage':'Cookieã¨ãƒ­ãƒ¼ã‚«ãƒ«ã‚¹ãƒˆãƒ¬ãƒ¼ã‚¸','Children':'å­ã©ã‚‚','Changes to This Policy':'ãƒãƒªã‚·ãƒ¼ã®å¤‰æ›´','Last updated:':'æœ€çµ‚æ›´æ–°ï¼š'
},
ko:{
'Back':'ë’¤ë¡œ','Back to account':'ê³„ì •ìœ¼ë¡œ ëŒì•„ê°€ê¸°','Legal':'ë²•ë¥ ','Please read these terms before creating your SYS STREAM account.':'SYS STREAM ê³„ì •ì„ ë§Œë“¤ê¸° ì „ì— ì´ ì•½ê´€ì„ ì½ì–´ ì£¼ì„¸ìš”.','Account & Security':'ê³„ì • ë° ë³´ì•ˆ','Balance & Transactions':'ìž”ì•¡ ë° ê±°ëž˜','Rules & Acceptance':'ê·œì¹™ ë° ë™ì˜','Acceptance of Terms':'ì•½ê´€ ë™ì˜','Eligibility & Account':'ì´ìš© ìžê²© ë° ê³„ì •','Deposits & Digital Assets':'ìž…ê¸ˆ ë° ë””ì§€í„¸ ìžì‚°','Available Balance & Locked Balance':'ì‚¬ìš© ê°€ëŠ¥ ìž”ì•¡ ë° ìž ê¸ˆ ìž”ì•¡','Games, Rewards & Settlement':'ê²Œìž„, ë³´ìƒ ë° ì •ì‚°','Prohibited Conduct':'ê¸ˆì§€ í–‰ìœ„','Account Review & Suspension':'ê³„ì • ê²€í†  ë° ì •ì§€','Service Availability':'ì„œë¹„ìŠ¤ ì´ìš© ê°€ëŠ¥ì„±','Limitation of Liability':'ì±…ìž„ ì œí•œ','Changes to These Terms':'ì•½ê´€ ë³€ê²½','Contact':'ë¬¸ì˜','Important:':'ì¤‘ìš”:','Privacy Policy':'ê°œì¸ì •ë³´ ì²˜ë¦¬ë°©ì¹¨','Scope':'ë²”ìœ„','Information We Collect':'ìˆ˜ì§‘í•˜ëŠ” ì •ë³´','How We Use Information':'ì •ë³´ ì´ìš© ë°©ë²•','Blockchain and Payment Information':'ë¸”ë¡ì²´ì¸ ë° ê²°ì œ ì •ë³´','Sharing of Information':'ì •ë³´ ê³µìœ ','Data Security':'ë°ì´í„° ë³´ì•ˆ','Data Retention':'ë°ì´í„° ë³´ê´€','Your Choices and Rights':'ì„ íƒ ë° ê¶Œë¦¬','Cookies and Local Storage':'ì¿ í‚¤ ë° ë¡œì»¬ ì €ìž¥ì†Œ','Children':'ì•„ë™','Changes to This Policy':'ì •ì±… ë³€ê²½','Last updated:':'ìµœì¢… ì—…ë°ì´íŠ¸:'
},
ar:{
'Back':'رجوع','Back to account':'العودة إلى الحساب','Legal':'قانوني','Please read these terms before creating your SYS STREAM account.':'يرجى قراءة هذه الشروط قبل إنشاء حساب SYS STREAM.','Account & Security':'الحساب والأمان','Balance & Transactions':'الرصيد والمعاملات','Rules & Acceptance':'القواعد والموافقة','Acceptance of Terms':'الموافقة على الشروط','Eligibility & Account':'الأهلية والحساب','Deposits & Digital Assets':'الإيداعات والأصول الرقمية','Available Balance & Locked Balance':'الرصيد المتاح والرصيد المقفل','Games, Rewards & Settlement':'الألعاب والمكافآت والتسوية','Prohibited Conduct':'السلوك المحظور','Account Review & Suspension':'مراجعة الحساب وتعليقه','Service Availability':'توفر الخدمة','Limitation of Liability':'حدود المسؤولية','Changes to These Terms':'تغييرات الشروط','Contact':'اتصل بنا','Important:':'Ù…Ù‡Ù…:','Privacy Policy':'سياسة الخصوصية','Scope':'النطاق','Information We Collect':'المعلومات التي نجمعها','How We Use Information':'كيفية استخدام المعلومات','Blockchain and Payment Information':'معلومات البلوك تشين والدفع','Sharing of Information':'مشاركة المعلومات','Data Security':'أمان البيانات','Data Retention':'الاحتفاظ بالبيانات','Your Choices and Rights':'خياراتك وحقوقك','Cookies and Local Storage':'ملفات تعريف الارتباط والتخزين المحلي','Children':'الأطفال','Changes to This Policy':'تغييرات هذه السياسة','Last updated:':'آخر تحديث:'
}
};
for (const lang of Object.keys(ALL_PAGE_LABELS) as LanguageCode[]) {
  Object.assign(translations[lang], ALL_PAGE_LABELS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...ALL_PAGE_LABELS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}
const FINAL_PAGE_LABELS: Partial<Record<LanguageCode, Record<string,string>>> = {
id:{
'Affiliate Partner Program':'Program Mitra Afiliasi','Your Personal Affiliate Link':'Tautan Afiliasi Pribadi Anda','Direct Invitations':'Undangan Langsung','Active Referees:':'Referral Aktif:','Network Invites':'Undangan Jaringan','Data produksi':'Data produksi','Deep Ecosystem':'Ekosistem Mendalam','Affiliate Income Calculator':'Kalkulator Pendapatan Afiliasi','Active Friends Invited:':'Teman Aktif yang Diundang:','Average Weekly Wager per Friend:':'Rata-rata Wager Mingguan per Teman:','Estimated Monthly Earnings':'Perkiraan Pendapatan Bulanan','Live Referral Feed':'Feed Referral Live','Referral milik wallet ini':'Referral milik wallet ini','Referee Handle':'Nama Referral','Date Joined':'Tanggal Bergabung','Commission Tier':'Tingkat Komisi','Wager Volume':'Volume Wager','Commission Earned':'Komisi Diperoleh',
'Masuk untuk bergabung ke Live Room':'Masuk untuk bergabung ke Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Setiap akun memiliki profil dan identitasnya sendiri di dalam room.','Profil akun Anda':'Profil akun Anda','Belum ada deskripsi room dari pemilik room.':'Belum ada deskripsi room dari pemilik room.','Peserta Live':'Peserta Live','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Hanya akun yang benar-benar bergabung yang ditampilkan.','Memuat peserta...':'Memuat peserta...','Belum ada peserta lain.':'Belum ada peserta lain.','Belum ada peserta.':'Belum ada peserta.',
'Viewer Username Raffle Spinner':'Spinner Undian Username Penonton','Live Participants Only':'Hanya Peserta Live','Spinning for Winner...':'Memutar untuk Menentukan Pemenang...','Current Viewers on Wheel:':'Penonton Saat Ini di Spinner:','Recent Raffle Winners':'Pemenang Undian Terbaru',
'Digital Crypto Card Number Guess':'Tebak Nomor Kartu Kripto Digital','Streamer Card Settings':'Pengaturan Kartu Streamer','Streamer Card Configurator':'Konfigurator Kartu Streamer','Card Title':'Judul Kartu','Serial Number':'Nomor Seri','Streamer Clue / Note for Viewers':'Petunjuk / Catatan Streamer untuk Penonton','Concealed':'Tersembunyi','Revealed':'Terungkap','Streamer Clue:':'Petunjuk Streamer:','Mode Interaksi':'Mode Interaksi','Verifying Cryptographic Seed...':'Memverifikasi Seed Kriptografi...','Verify Challenge':'Verifikasi Tantangan','Provably Fair Verification':'Verifikasi Provably Fair',
'NOWPayments Crypto Deposit':'Deposit Kripto NOWPayments','Instant deposit with zero platform fees':'Deposit instan tanpa biaya platform','Create NOWPayments Invoice':'Buat Invoice NOWPayments','Order ID:':'ID Pesanan:',
'EVM Wallet Recovery Phrase':'Recovery Phrase Wallet EVM','Wallet Address':'Alamat Wallet','Recovery Phrase':'Recovery Phrase','Remember me':'Ingat saya','or Connect with Crypto Wallet':'atau Hubungkan dengan Crypto Wallet','Connect Wallet':'Hubungkan Wallet','Don\'t have an account? ':'Belum punya akun? ','Secured with Web3':'Diamankan dengan Web3','Biometric Login Available':'Login Biometrik Tersedia',
'We sent a verification link to ':'Kami mengirim tautan verifikasi ke ','You must verify it before you can log in.':'Anda harus memverifikasinya sebelum login.','SENDING...':'MENGIRIM...','RESEND VERIFICATION EMAIL':'KIRIM ULANG EMAIL VERIFIKASI'
},
en:{
'Affiliate Partner Program':'Affiliate Partner Program','Your Personal Affiliate Link':'Your Personal Affiliate Link','Direct Invitations':'Direct Invitations','Active Referees:':'Active Referees:','Network Invites':'Network Invites','Data produksi':'Production data','Deep Ecosystem':'Deep Ecosystem','Affiliate Income Calculator':'Affiliate Income Calculator','Active Friends Invited:':'Active Friends Invited:','Average Weekly Wager per Friend:':'Average Weekly Wager per Friend:','Estimated Monthly Earnings':'Estimated Monthly Earnings','Live Referral Feed':'Live Referral Feed','Referral milik wallet ini':'Referrals for this wallet','Referee Handle':'Referee Handle','Date Joined':'Date Joined','Commission Tier':'Commission Tier','Wager Volume':'Wager Volume','Commission Earned':'Commission Earned',
'Masuk untuk bergabung ke Live Room':'Sign in to join the Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Each account has its own profile and identity inside the room.','Profil akun Anda':'Your account profile','Belum ada deskripsi room dari pemilik room.':'The room owner has not added a description yet.','Peserta Live':'Live Participants','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Only accounts that actually joined are shown.','Memuat peserta...':'Loading participants...','Belum ada peserta lain.':'No other participants yet.','Belum ada peserta.':'No participants yet.',
'Viewer Username Raffle Spinner':'Viewer Username Raffle Spinner','Live Participants Only':'Live Participants Only','Spinning for Winner...':'Spinning for Winner...','Current Viewers on Wheel:':'Current Viewers on Wheel:','Recent Raffle Winners':'Recent Raffle Winners',
'Digital Crypto Card Number Guess':'Digital Crypto Card Number Guess','Streamer Card Settings':'Streamer Card Settings','Streamer Card Configurator':'Streamer Card Configurator','Card Title':'Card Title','Serial Number':'Serial Number','Streamer Clue / Note for Viewers':'Streamer Clue / Note for Viewers','Concealed':'Concealed','Revealed':'Revealed','Streamer Clue:':'Streamer Clue:','Mode Interaksi':'Interaction Mode','Verifying Cryptographic Seed...':'Verifying Cryptographic Seed...','Verify Challenge':'Verify Challenge','Provably Fair Verification':'Provably Fair Verification',
'NOWPayments Crypto Deposit':'NOWPayments Crypto Deposit','Instant deposit with zero platform fees':'Instant deposit with zero platform fees','Create NOWPayments Invoice':'Create NOWPayments Invoice','Order ID:':'Order ID:',
'EVM Wallet Recovery Phrase':'EVM Wallet Recovery Phrase','Wallet Address':'Wallet Address','Recovery Phrase':'Recovery Phrase','Remember me':'Remember me','or Connect with Crypto Wallet':'or Connect with Crypto Wallet','Connect Wallet':'Connect Wallet','Don\'t have an account? ':'Don\'t have an account? ','Secured with Web3':'Secured with Web3','Biometric Login Available':'Biometric Login Available',
'We sent a verification link to ':'We sent a verification link to ','You must verify it before you can log in.':'You must verify it before you can log in.','SENDING...':'SENDING...','RESEND VERIFICATION EMAIL':'RESEND VERIFICATION EMAIL'
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
'Affiliate Partner Program':'Programa de socios afiliados','Your Personal Affiliate Link':'Tu enlace personal de afiliado','Direct Invitations':'Invitaciones directas','Active Referees:':'Referidos activos:','Network Invites':'Invitaciones de red','Deep Ecosystem':'Ecosistema profundo','Affiliate Income Calculator':'Calculadora de ingresos de afiliados','Active Friends Invited:':'Amigos activos invitados:','Average Weekly Wager per Friend:':'Apuesta semanal media por amigo:','Estimated Monthly Earnings':'Ingresos mensuales estimados','Live Referral Feed':'Feed de referidos en vivo','Referee Handle':'Nombre del referido','Date Joined':'Fecha de alta','Commission Tier':'Nivel de comisión','Wager Volume':'Volumen de apuestas','Commission Earned':'Comisión obtenida','Sign in to join the Live Room':'Inicia sesión para unirte a la sala en vivo','Your account profile':'Tu perfil','Live Participants':'Participantes en vivo','Loading participants...':'Cargando participantes...','No other participants yet.':'Aún no hay otros participantes.','No participants yet.':'Aún no hay participantes.','Viewer Username Raffle Spinner':'Spinner de sorteo de nombres','Live Participants Only':'Solo participantes en vivo','Spinning for Winner...':'Girando para elegir al ganador...','Current Viewers on Wheel:':'Espectadores actuales:','Recent Raffle Winners':'Ganadores recientes','Digital Crypto Card Number Guess':'Adivina el número de la tarjeta cripto','Streamer Card Settings':'Configuración de tarjeta del streamer','Streamer Card Configurator':'Configurador de tarjeta','Card Title':'Título de tarjeta','Serial Number':'Número de serie','Streamer Clue / Note for Viewers':'Pista del streamer para espectadores','Concealed':'Oculto','Revealed':'Revelado','Streamer Clue:':'Pista del streamer:','Interaction Mode':'Modo de interacción','Mode Interaksi':'Modo de interacción','Verifying Cryptographic Seed...':'Verificando semilla criptográfica...','Verify Challenge':'Verificar desafío','Provably Fair Verification':'Verificación demostrablemente justa','NOWPayments Crypto Deposit':'Depósito cripto de NOWPayments','Instant deposit with zero platform fees':'Depósito instantáneo sin comisiones de plataforma','Create NOWPayments Invoice':'Crear factura NOWPayments','Order ID:':'ID de pedido:','Wallet Address':'Dirección de wallet','Recovery Phrase':'Frase de recuperación','Remember me':'Recuérdame','Connect Wallet':'Conectar wallet','Secured with Web3':'Protegido con Web3','Biometric Login Available':'Inicio biométrico disponible'
},
pt:{
'Affiliate Partner Program':'Programa de parceiros afiliados','Your Personal Affiliate Link':'Seu link pessoal de afiliado','Direct Invitations':'Convites diretos','Active Referees:':'Indicados ativos:','Network Invites':'Convites da rede','Deep Ecosystem':'Ecossistema profundo','Affiliate Income Calculator':'Calculadora de renda de afiliados','Active Friends Invited:':'Amigos ativos convidados:','Average Weekly Wager per Friend:':'Aposta semanal média por amigo:','Estimated Monthly Earnings':'Ganhos mensais estimados','Live Referral Feed':'Feed de indicações ao vivo','Referee Handle':'Nome do indicado','Date Joined':'Data de entrada','Commission Tier':'Nível de comissão','Wager Volume':'Volume de apostas','Commission Earned':'Comissão recebida','Sign in to join the Live Room':'Entre para participar da sala ao vivo','Your account profile':'Seu perfil','Live Participants':'Participantes ao vivo','Loading participants...':'Carregando participantes...','No other participants yet.':'Ainda não há outros participantes.','No participants yet.':'Ainda não há participantes.','Viewer Username Raffle Spinner':'Spinner de sorteio de nomes','Live Participants Only':'Apenas participantes ao vivo','Spinning for Winner...':'Girando para escolher o vencedor...','Current Viewers on Wheel:':'Espectadores atuais:','Recent Raffle Winners':'Vencedores recentes','Digital Crypto Card Number Guess':'Adivinhe o número do cartão cripto','Streamer Card Settings':'Configurações do cartão do streamer','Streamer Card Configurator':'Configurador do cartão','Card Title':'Título do cartão','Serial Number':'Número de série','Streamer Clue / Note for Viewers':'Dica do streamer para espectadores','Concealed':'Oculto','Revealed':'Revelado','Streamer Clue:':'Dica do streamer:','Mode Interaksi':'Modo de interação','Verifying Cryptographic Seed...':'Verificando semente criptográfica...','Verify Challenge':'Verificar desafio','Provably Fair Verification':'Verificação comprovadamente justa','NOWPayments Crypto Deposit':'Depósito cripto NOWPayments','Instant deposit with zero platform fees':'Depósito instantâneo sem taxas da plataforma','Create NOWPayments Invoice':'Criar fatura NOWPayments','Order ID:':'ID do pedido:','Wallet Address':'Endereço da carteira','Recovery Phrase':'Frase de recuperação','Remember me':'Lembrar de mim','Connect Wallet':'Conectar carteira','Secured with Web3':'Protegido com Web3','Biometric Login Available':'Login biométrico disponível'
},
zh:{
'Affiliate Partner Program':'è”ç›Ÿåˆä½œä¼™ä¼´è®¡åˆ’','Your Personal Affiliate Link':'æ‚¨çš„ä¸ªäººæŽ¨å¹¿é“¾æŽ¥','Direct Invitations':'ç›´æŽ¥é‚€è¯·','Active Referees:':'æ´»è·ƒæŽ¨èç”¨æˆ·ï¼š','Network Invites':'ç½‘ç»œé‚€è¯·','Deep Ecosystem':'æ·±åº¦ç”Ÿæ€','Affiliate Income Calculator':'è”ç›Ÿæ”¶ç›Šè®¡ç®—å™¨','Active Friends Invited:':'å·²é‚€è¯·æ´»è·ƒå¥½å‹ï¼š','Average Weekly Wager per Friend:':'æ¯ä½å¥½å‹å¹³å‡æ¯å‘¨æŠ•æ³¨ï¼š','Estimated Monthly Earnings':'é¢„è®¡æœˆæ”¶ç›Š','Live Referral Feed':'å®žæ—¶æŽ¨èåŠ¨æ€','Referee Handle':'è¢«æŽ¨èäºº','Date Joined':'åŠ å…¥æ—¥æœŸ','Commission Tier':'ä½£é‡‘ç­‰çº§','Wager Volume':'æŠ•æ³¨é‡','Commission Earned':'å·²èŽ·å¾—ä½£é‡‘','Sign in to join the Live Room':'ç™»å½•ä»¥åŠ å…¥ç›´æ’­é—´','Your account profile':'æ‚¨çš„è´¦æˆ·èµ„æ–™','Live Participants':'ç›´æ’­å‚ä¸Žè€…','Loading participants...':'正在加载参与者…','No other participants yet.':'æš‚æ— å…¶ä»–å‚ä¸Žè€…ã€‚','No participants yet.':'æš‚æ— å‚ä¸Žè€…ã€‚','Viewer Username Raffle Spinner':'è§‚ä¼—ç”¨æˆ·åæŠ½å¥–è½¬ç›˜','Live Participants Only':'ä»…é™ç›´æ’­å‚ä¸Žè€…','Spinning for Winner...':'正在抽取获胜者…','Current Viewers on Wheel:':'å½“å‰è½¬ç›˜è§‚ä¼—ï¼š','Recent Raffle Winners':'æœ€è¿‘æŠ½å¥–èŽ·èƒœè€…','Digital Crypto Card Number Guess':'æ•°å­—åŠ å¯†å¡å·ç ç«žçŒœ','Streamer Card Settings':'ä¸»æ’­å¡ç‰‡è®¾ç½®','Streamer Card Configurator':'ä¸»æ’­å¡ç‰‡é…ç½®å™¨','Card Title':'å¡ç‰‡æ ‡é¢˜','Serial Number':'åºåˆ—å·','Streamer Clue / Note for Viewers':'ä¸»æ’­ç»™è§‚ä¼—çš„æç¤º','Concealed':'éšè—','Revealed':'å·²æ­ç¤º','Streamer Clue:':'ä¸»æ’­æç¤ºï¼š','Mode Interaksi':'äº’åŠ¨æ¨¡å¼','Verifying Cryptographic Seed...':'正在验证加密种子…','Verify Challenge':'éªŒè¯æŒ‘æˆ˜','Provably Fair Verification':'å¯éªŒè¯å…¬å¹³æ€§éªŒè¯','NOWPayments Crypto Deposit':'NOWPayments åŠ å¯†è´§å¸å……å€¼','Instant deposit with zero platform fees':'å³æ—¶å……å€¼ï¼Œå¹³å°é›¶æ‰‹ç»­è´¹','Create NOWPayments Invoice':'åˆ›å»º NOWPayments å‘ç¥¨','Order ID:':'è®¢å•IDï¼š','Wallet Address':'é’±åŒ…åœ°å€','Recovery Phrase':'æ¢å¤çŸ­è¯­','Remember me':'è®°ä½æˆ‘','Connect Wallet':'è¿žæŽ¥é’±åŒ…','Secured with Web3':'ç”± Web3 ä¿æŠ¤','Biometric Login Available':'æ”¯æŒç”Ÿç‰©è¯†åˆ«ç™»å½•'
},
ja:{
'Affiliate Partner Program':'ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆãƒ‘ãƒ¼ãƒˆãƒŠãƒ¼ãƒ—ãƒ­ã‚°ãƒ©ãƒ ','Your Personal Affiliate Link':'ã‚ãªãŸã®ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆãƒªãƒ³ã‚¯','Direct Invitations':'ç›´æŽ¥æ‹›å¾…','Active Referees:':'ã‚¢ã‚¯ãƒ†ã‚£ãƒ–ç´¹ä»‹è€…ï¼š','Network Invites':'ãƒãƒƒãƒˆãƒ¯ãƒ¼ã‚¯æ‹›å¾…','Deep Ecosystem':'æ·±ã„ã‚¨ã‚³ã‚·ã‚¹ãƒ†ãƒ ','Affiliate Income Calculator':'ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆåŽç›Šè¨ˆç®—æ©Ÿ','Active Friends Invited:':'æ‹›å¾…ã—ãŸã‚¢ã‚¯ãƒ†ã‚£ãƒ–ãªå‹é”ï¼š','Average Weekly Wager per Friend:':'å‹é”1äººã‚ãŸã‚Šå¹³å‡é€±é–“ãƒ™ãƒƒãƒˆï¼š','Estimated Monthly Earnings':'æŽ¨å®šæœˆé–“åŽç›Š','Live Referral Feed':'ãƒ©ã‚¤ãƒ–ç´¹ä»‹ãƒ•ã‚£ãƒ¼ãƒ‰','Referee Handle':'ç´¹ä»‹ãƒ¦ãƒ¼ã‚¶ãƒ¼å','Date Joined':'å‚åŠ æ—¥','Commission Tier':'ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³ãƒ¬ãƒ™ãƒ«','Wager Volume':'ãƒ™ãƒƒãƒˆç·é¡','Commission Earned':'ç²å¾—ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³','Sign in to join the Live Room':'ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ã«å‚åŠ ','Your account profile':'ã‚ãªãŸã®ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«','Live Participants':'ãƒ©ã‚¤ãƒ–å‚åŠ è€…','Loading participants...':'参加者を読み込み中…','No other participants yet.':'ä»–ã®å‚åŠ è€…ã¯ã„ã¾ã›ã‚“ã€‚','No participants yet.':'å‚åŠ è€…ã¯ã„ã¾ã›ã‚“ã€‚','Viewer Username Raffle Spinner':'è¦–è´è€…ãƒ¦ãƒ¼ã‚¶ãƒ¼åæŠ½é¸ã‚¹ãƒ”ãƒŠãƒ¼','Live Participants Only':'ãƒ©ã‚¤ãƒ–å‚åŠ è€…ã®ã¿','Spinning for Winner...':'当選者を抽選中…','Current Viewers on Wheel:':'ç¾åœ¨ã®ã‚¹ãƒ”ãƒŠãƒ¼å‚åŠ è€…ï¼š','Recent Raffle Winners':'æœ€è¿‘ã®å½“é¸è€…','Digital Crypto Card Number Guess':'ãƒ‡ã‚¸ã‚¿ãƒ«æš—å·ã‚«ãƒ¼ãƒ‰ç•ªå·å½“ã¦','Streamer Card Settings':'ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã‚«ãƒ¼ãƒ‰è¨­å®š','Streamer Card Configurator':'ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã‚«ãƒ¼ãƒ‰è¨­å®šãƒ„ãƒ¼ãƒ«','Card Title':'ã‚«ãƒ¼ãƒ‰ã‚¿ã‚¤ãƒˆãƒ«','Serial Number':'ã‚·ãƒªã‚¢ãƒ«ç•ªå·','Streamer Clue / Note for Viewers':'è¦–è´è€…ã¸ã®ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ãƒ’ãƒ³ãƒˆ','Concealed':'éžè¡¨ç¤º','Revealed':'å…¬é–‹','Streamer Clue:':'ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ãƒ’ãƒ³ãƒˆï¼š','Mode Interaksi':'ã‚¤ãƒ³ã‚¿ãƒ©ã‚¯ã‚·ãƒ§ãƒ³ãƒ¢ãƒ¼ãƒ‰','Verifying Cryptographic Seed...':'暗号シードを検証中…','Verify Challenge':'ãƒãƒ£ãƒ¬ãƒ³ã‚¸ã‚’æ¤œè¨¼','Provably Fair Verification':'æ¤œè¨¼å¯èƒ½ãªå…¬å¹³æ€§','NOWPayments Crypto Deposit':'NOWPaymentsæš—å·è³‡ç”£å…¥é‡‘','Instant deposit with zero platform fees':'ãƒ—ãƒ©ãƒƒãƒˆãƒ•ã‚©ãƒ¼ãƒ æ‰‹æ•°æ–™ãªã—ã®å³æ™‚å…¥é‡‘','Create NOWPayments Invoice':'NOWPaymentsè«‹æ±‚æ›¸ã‚’ä½œæˆ','Order ID:':'æ³¨æ–‡IDï¼š','Wallet Address':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹','Recovery Phrase':'ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚º','Remember me':'ãƒ­ã‚°ã‚¤ãƒ³çŠ¶æ…‹ã‚’ä¿æŒ','Connect Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š','Secured with Web3':'Web3ã§ä¿è­·','Biometric Login Available':'ç”Ÿä½“èªè¨¼ãƒ­ã‚°ã‚¤ãƒ³å¯¾å¿œ'
},
ko:{
'Affiliate Partner Program':'ì œíœ´ íŒŒíŠ¸ë„ˆ í”„ë¡œê·¸ëž¨','Your Personal Affiliate Link':'ê°œì¸ ì œíœ´ ë§í¬','Direct Invitations':'ì§ì ‘ ì´ˆëŒ€','Active Referees:':'í™œì„± ì¶”ì²œì¸:','Network Invites':'ë„¤íŠ¸ì›Œí¬ ì´ˆëŒ€','Deep Ecosystem':'ì‹¬ì¸µ ìƒíƒœê³„','Affiliate Income Calculator':'ì œíœ´ ìˆ˜ìµ ê³„ì‚°ê¸°','Active Friends Invited:':'ì´ˆëŒ€í•œ í™œì„± ì¹œêµ¬:','Average Weekly Wager per Friend:':'ì¹œêµ¬ë‹¹ ì£¼ê°„ í‰ê·  ë² íŒ…:','Estimated Monthly Earnings':'ì˜ˆìƒ ì›” ìˆ˜ìµ','Live Referral Feed':'ì‹¤ì‹œê°„ ì¶”ì²œ í”¼ë“œ','Referee Handle':'ì¶”ì²œ ì‚¬ìš©ìž','Date Joined':'ê°€ìž…ì¼','Commission Tier':'ì»¤ë¯¸ì…˜ ë“±ê¸‰','Wager Volume':'ë² íŒ… ê·œëª¨','Commission Earned':'íšë“ ì»¤ë¯¸ì…˜','Sign in to join the Live Room':'ë¡œê·¸ì¸í•˜ì—¬ ë¼ì´ë¸Œë£¸ ì°¸ì—¬','Your account profile':'ë‚´ ê³„ì • í”„ë¡œí•„','Live Participants':'ë¼ì´ë¸Œ ì°¸ê°€ìž','Loading participants...':'ì°¸ê°€ìž ë¡œë“œ ì¤‘...','No other participants yet.':'ì•„ì§ ë‹¤ë¥¸ ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.','No participants yet.':'ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.','Viewer Username Raffle Spinner':'ì‹œì²­ìž ì‚¬ìš©ìžëª… ì¶”ì²¨ ìŠ¤í”¼ë„ˆ','Live Participants Only':'ë¼ì´ë¸Œ ì°¸ê°€ìžë§Œ','Spinning for Winner...':'ë‹¹ì²¨ìž ì¶”ì²¨ ì¤‘...','Current Viewers on Wheel:':'í˜„ìž¬ ìŠ¤í”¼ë„ˆ ì°¸ê°€ìž:','Recent Raffle Winners':'ìµœê·¼ ì¶”ì²¨ ë‹¹ì²¨ìž','Digital Crypto Card Number Guess':'ë””ì§€í„¸ í¬ë¦½í†  ì¹´ë“œ ë²ˆí˜¸ ë§žížˆê¸°','Streamer Card Settings':'ìŠ¤íŠ¸ë¦¬ë¨¸ ì¹´ë“œ ì„¤ì •','Streamer Card Configurator':'ìŠ¤íŠ¸ë¦¬ë¨¸ ì¹´ë“œ êµ¬ì„±ê¸°','Card Title':'ì¹´ë“œ ì œëª©','Serial Number':'ì¼ë ¨ë²ˆí˜¸','Streamer Clue / Note for Viewers':'ì‹œì²­ìžìš© ìŠ¤íŠ¸ë¦¬ë¨¸ ížŒíŠ¸','Concealed':'ìˆ¨ê¹€','Revealed':'ê³µê°œ','Streamer Clue:':'ìŠ¤íŠ¸ë¦¬ë¨¸ ížŒíŠ¸:','Mode Interaksi':'ìƒí˜¸ìž‘ìš© ëª¨ë“œ','Verifying Cryptographic Seed...':'ì•”í˜¸ ì‹œë“œ í™•ì¸ ì¤‘...','Verify Challenge':'ì±Œë¦°ì§€ í™•ì¸','Provably Fair Verification':'ê²€ì¦ ê°€ëŠ¥í•œ ê³µì •ì„±','NOWPayments Crypto Deposit':'NOWPayments ì•”í˜¸í™”í ìž…ê¸ˆ','Instant deposit with zero platform fees':'í”Œëž«í¼ ìˆ˜ìˆ˜ë£Œ ì—†ëŠ” ì¦‰ì‹œ ìž…ê¸ˆ','Create NOWPayments Invoice':'NOWPayments ì¸ë³´ì´ìŠ¤ ìƒì„±','Order ID:':'ì£¼ë¬¸ ID:','Wallet Address':'ì§€ê°‘ ì£¼ì†Œ','Recovery Phrase':'ë³µêµ¬ ë¬¸êµ¬','Remember me':'ë¡œê·¸ì¸ ê¸°ì–µí•˜ê¸°','Connect Wallet':'ì§€ê°‘ ì—°ê²°','Secured with Web3':'Web3ë¡œ ë³´í˜¸ë¨','Biometric Login Available':'ìƒì²´ ì¸ì¦ ë¡œê·¸ì¸ ì§€ì›'
},
ar:{
'Affiliate Partner Program':'برنامج الشركاء بالعمولة','Your Personal Affiliate Link':'رابط الإحالة الشخصي','Direct Invitations':'الدعوات المباشرة','Active Referees:':'الإحالات النشطة:','Network Invites':'دعوات الشبكة','Deep Ecosystem':'النظام البيئي المتكامل','Affiliate Income Calculator':'حاسبة دخل الإحالة','Active Friends Invited:':'الأصدقاء النشطون المدعوون:','Average Weekly Wager per Friend:':'متوسط الرهان الأسبوعي لكل صديق:','Estimated Monthly Earnings':'الأرباح الشهرية المقدرة','Live Referral Feed':'تغذية الإحالات المباشرة','Referee Handle':'اسم المُحال','Date Joined':'تاريخ الانضمام','Commission Tier':'مستوى العمولة','Wager Volume':'حجم الرهان','Commission Earned':'العمولة المكتسبة','Sign in to join the Live Room':'سجّل الدخول للانضمام إلى الغرفة المباشرة','Your account profile':'ملف حسابك','Live Participants':'المشاركون المباشرون','Loading participants...':'جارٍ تحميل المشاركين...','No other participants yet.':'لا يوجد مشاركون آخرون بعد.','No participants yet.':'لا يوجد مشاركون بعد.','Viewer Username Raffle Spinner':'عجلة سحب أسماء المشاهدين','Live Participants Only':'المشاركون المباشرون فقط','Spinning for Winner...':'جارٍ اختيار الفائز...','Current Viewers on Wheel:':'المشاهدون الحاليون على العجلة:','Recent Raffle Winners':'الفائزون الأخيرون','Digital Crypto Card Number Guess':'تخمين رقم بطاقة العملات الرقمية','Streamer Card Settings':'إعدادات بطاقة البث','Streamer Card Configurator':'مكوّن بطاقة البث','Card Title':'عنوان البطاقة','Serial Number':'الرقم التسلسلي','Streamer Clue / Note for Viewers':'تلميح البث للمشاهدين','Concealed':'مخفي','Revealed':'مكشوف','Streamer Clue:':'تلميح البث:','Mode Interaksi':'وضع التفاعل','Verifying Cryptographic Seed...':'جارٍ التحقق من البذرة المشفرة...','Verify Challenge':'تحقق من التحدي','Provably Fair Verification':'تحقق من العدالة القابلة للإثبات','NOWPayments Crypto Deposit':'إيداع العملات الرقمية عبر NOWPayments','Instant deposit with zero platform fees':'إيداع فوري بدون رسوم منصة','Create NOWPayments Invoice':'إنشاء فاتورة NOWPayments','Order ID:':'معرّف الطلب:','Wallet Address':'عنوان المحفظة','Recovery Phrase':'عبارة الاسترداد','Remember me':'تذكرني','Connect Wallet':'ربط المحفظة','Secured with Web3':'محمي بواسطة Web3','Biometric Login Available':'تسجيل دخول بيومتري متاح'
}
};
for (const lang of Object.keys(REMAINING_LOCALE_LABELS) as LanguageCode[]) {
  Object.assign(translations[lang], REMAINING_LOCALE_LABELS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...REMAINING_LOCALE_LABELS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}
const PROFILE_ACTION_TRANSLATIONS: Record<LanguageCode,Record<string,string>>={
id:{'Referral link berhasil disalin.':'Referral link berhasil disalin.','Withdrawal':'Penarikan','Minimum withdrawal is':'Penarikan minimum adalah','Masukkan alamat wallet tujuan.':'Masukkan alamat wallet tujuan.','Saldo tersedia tidak mencukupi.':'Saldo tersedia tidak mencukupi.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'Permintaan penarikan berhasil dibuat dan menunggu proses.','Penarikan gagal.':'Penarikan gagal.'},
en:{'Referral link berhasil disalin.':'Referral link copied successfully.','Withdrawal':'Withdrawal','Minimum withdrawal is':'Minimum withdrawal is','Masukkan alamat wallet tujuan.':'Enter the destination wallet address.','Saldo tersedia tidak mencukupi.':'Available balance is insufficient.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'Withdrawal request created and awaiting processing.','Penarikan gagal.':'Withdrawal failed.'},
es:{'Referral link berhasil disalin.':'Enlace de referidos copiado.','Withdrawal':'Retiro','Minimum withdrawal is':'El retiro mínimo es','Masukkan alamat wallet tujuan.':'Introduce la dirección de la wallet de destino.','Saldo tersedia tidak mencukupi.':'El saldo disponible es insuficiente.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'Solicitud de retiro creada y pendiente de procesamiento.','Penarikan gagal.':'El retiro falló.'},
pt:{'Referral link berhasil disalin.':'Link de indicação copiado.','Withdrawal':'Saque','Minimum withdrawal is':'O saque mínimo é','Masukkan alamat wallet tujuan.':'Informe o endereço da carteira de destino.','Saldo tersedia tidak mencukupi.':'O saldo disponível é insuficiente.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'Solicitação de saque criada e aguardando processamento.','Penarikan gagal.':'O saque falhou.'},
zh:{'Referral link berhasil disalin.':'æŽ¨èé“¾æŽ¥å·²å¤åˆ¶ã€‚','Withdrawal':'æçŽ°','Minimum withdrawal is':'æœ€ä½ŽæçŽ°é‡‘é¢ä¸º','Masukkan alamat wallet tujuan.':'è¯·è¾“å…¥ç›®æ ‡é’±åŒ…åœ°å€ã€‚','Saldo tersedia tidak mencukupi.':'å¯ç”¨ä½™é¢ä¸è¶³ã€‚','Permintaan penarikan berhasil dibuat dan menunggu proses.':'æçŽ°è¯·æ±‚å·²åˆ›å»ºï¼Œç­‰å¾…å¤„ç†ã€‚','Penarikan gagal.':'æçŽ°å¤±è´¥ã€‚'},
ja:{'Referral link berhasil disalin.':'ç´¹ä»‹ãƒªãƒ³ã‚¯ã‚’ã‚³ãƒ”ãƒ¼ã—ã¾ã—ãŸã€‚','Withdrawal':'å‡ºé‡‘','Minimum withdrawal is':'æœ€ä½Žå‡ºé‡‘é¡ã¯','Masukkan alamat wallet tujuan.':'é€é‡‘å…ˆã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„ã€‚','Saldo tersedia tidak mencukupi.':'åˆ©ç”¨å¯èƒ½æ®‹é«˜ãŒä¸è¶³ã—ã¦ã„ã¾ã™ã€‚','Permintaan penarikan berhasil dibuat dan menunggu proses.':'å‡ºé‡‘ãƒªã‚¯ã‚¨ã‚¹ãƒˆã‚’ä½œæˆã—ã¾ã—ãŸã€‚å‡¦ç†å¾…ã¡ã§ã™ã€‚','Penarikan gagal.':'å‡ºé‡‘ã«å¤±æ•—ã—ã¾ã—ãŸã€‚'},
ko:{'Referral link berhasil disalin.':'ì¶”ì²œ ë§í¬ê°€ ë³µì‚¬ë˜ì—ˆìŠµë‹ˆë‹¤.','Withdrawal':'ì¶œê¸ˆ','Minimum withdrawal is':'ìµœì†Œ ì¶œê¸ˆì•¡ì€','Masukkan alamat wallet tujuan.':'ëŒ€ìƒ ì§€ê°‘ ì£¼ì†Œë¥¼ ìž…ë ¥í•˜ì„¸ìš”.','Saldo tersedia tidak mencukupi.':'ì‚¬ìš© ê°€ëŠ¥ ìž”ì•¡ì´ ë¶€ì¡±í•©ë‹ˆë‹¤.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'ì¶œê¸ˆ ìš”ì²­ì´ ìƒì„±ë˜ì—ˆìœ¼ë©° ì²˜ë¦¬ ëŒ€ê¸° ì¤‘ìž…ë‹ˆë‹¤.','Penarikan gagal.':'ì¶œê¸ˆì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.'},
ar:{'Referral link berhasil disalin.':'تم نسخ رابط الإحالة.','Withdrawal':'السحب','Minimum withdrawal is':'الحد الأدنى للسحب هو','Masukkan alamat wallet tujuan.':'أدخل عنوان المحفظة المستهدفة.','Saldo tersedia tidak mencukupi.':'الرصيد المتاح غير كافٍ.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'تم إنشاء طلب السحب وهو قيد المعالجة.','Penarikan gagal.':'فشل السحب.'}
};
for(const lang of Object.keys(PROFILE_ACTION_TRANSLATIONS) as LanguageCode[]){Object.assign(translations[lang],PROFILE_ACTION_TRANSLATIONS[lang]);PAGE_UI_TRANSLATIONS[lang]={...PROFILE_ACTION_TRANSLATIONS[lang],...PAGE_UI_TRANSLATIONS[lang]};}

const EXHAUSTIVE_UI_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Live Room':'Live Room','Gagal memuat live room.':'Gagal memuat live room.','Chat':'Chat','Pesan gagal dikirim.':'Pesan gagal dikirim.','Live':'Live','Like gagal dikirim.':'Gagal mengirim like.','Masuk untuk bergabung ke Live Room':'Masuk untuk bergabung ke Live Room','Setiap akun memiliki profil dan identitasnya sendiri di dalam room.':'Setiap akun memiliki profil dan identitasnya sendiri di dalam room.','Profil akun Anda':'Profil akun Anda','Belum ada deskripsi room dari pemilik room.':'Belum ada deskripsi room dari pemilik room.','Peserta Live':'Peserta Live','Hanya akun yang benar-benar bergabung yang ditampilkan.':'Hanya akun yang benar-benar bergabung yang ditampilkan.','Memuat peserta...':'Memuat peserta...','Belum ada peserta lain.':'Belum ada peserta lain.','Belum ada peserta.':'Belum ada peserta.','Need More Viewers':'Penonton Belum Cukup','Add at least 2 viewer usernames to spin the raffle wheel.':'Tambahkan minimal 2 nama penonton untuk memutar roda undian.','Winner Picked!':'Pemenang Dipilih!','Congratulations':'Selamat','Selected as Lucky Viewer!':'Dipilih sebagai Penonton Beruntung!','Live Chat':'Chat Live','Tambahkan peserta yang benar-benar masuk dari live room.':'Tambahkan peserta yang benar-benar masuk dari live room.','Enter viewer username (e.g. TikTok_User)':'Masukkan username penonton (mis. TikTok_User)','Spinning for Winner...':'Memilih Pemenang...','Current Viewers on Wheel:':'Penonton Saat Ini di Roda:','Recent Raffle Winners':'Pemenang Undian Terbaru','Digital Crypto Card Number Guess':'Tebak Nomor Kartu Kripto Digital','Streamer Card Settings':'Pengaturan Kartu Streamer','Streamer Card Configurator':'Konfigurator Kartu Streamer','Card Title':'Judul Kartu','Serial Number':'Nomor Seri','Streamer Clue / Note for Viewers':'Petunjuk Streamer / Catatan untuk Penonton','Concealed':'Tersembunyi','Revealed':'Terbuka','Streamer Clue: ':'Petunjuk Streamer: ','Mode Interaksi':'Mode Interaksi','Verifying Cryptographic Seed...':'Memverifikasi Seed Kriptografi...','Verify Challenge':'Verifikasi Tantangan','Provably Fair Verification':'Verifikasi Keadilan yang Dapat Dibuktikan','Affiliate Partner Program':'Program Mitra Afiliasi','Your Personal Affiliate Link':'Link Afiliasi Pribadi Anda','User ID / Wallet:':'ID User / Wallet:','Direct Invitations':'Undangan Langsung','Active Referees:':'Referral Aktif:','Network Invites':'Undangan Jaringan','Data produksi':'Data produksi','Deep Ecosystem':'Ekosistem Mendalam','Affiliate Income Calculator':'Kalkulator Pendapatan Afiliasi','Active Friends Invited:':'Teman Aktif yang Diundang:','Average Weekly Wager per Friend:':'Rata-rata Wager Mingguan per Teman:','Estimated Monthly Earnings':'Estimasi Pendapatan Bulanan','Live Referral Feed':'Feed Referral Live','Referral milik wallet ini':'Referral milik wallet ini','Referee Handle':'Handle Referral','Date Joined':'Tanggal Bergabung','Commission Tier':'Tier Komisi','Wager Volume':'Volume Wager','Commission Earned':'Komisi Diperoleh','Copied Link':'Link Disalin','Referral link copied to clipboard!':'Link referral berhasil disalin!','No Pending Rewards':'Tidak Ada Reward Tertunda','All referral commissions have already been transferred.':'Semua komisi referral sudah ditransfer.','Minimum Deposit':'Deposit Minimum','Minimum deposit is $5.00 USD':'Deposit minimum adalah $5,00 USD','Error':'Error','Failed to generate invoice':'Gagal membuat invoice','NOWPayments Crypto Deposit':'Deposit Crypto NOWPayments','Instant deposit with zero platform fees':'Deposit instan tanpa biaya platform','Create NOWPayments Invoice':'Buat Invoice NOWPayments','Order ID: ':'ID Pesanan: '
  },
  en: {},
  es: {
    'Live Room':'Sala en vivo','Gagal memuat live room.':'No se pudo cargar la sala en vivo.','Pesan gagal dikirim.':'No se pudo enviar el mensaje.','Like gagal dikirim.':'No se pudo enviar el Me gusta.','Masuk untuk bergabung ke Live Room':'Inicia sesión para unirte a la sala en vivo','Peserta Live':'Participantes en vivo','Memuat peserta...':'Cargando participantes...','Belum ada peserta lain.':'Aún no hay otros participantes.','Belum ada peserta.':'Aún no hay participantes.','Need More Viewers':'Faltan espectadores','Add at least 2 viewer usernames to spin the raffle wheel.':'Añade al menos 2 nombres de espectadores para girar la rueda.','Winner Picked!':'¡Ganador seleccionado!','Congratulations':'¡Felicidades','Selected as Lucky Viewer!':'¡Seleccionado como espectador afortunado!','Enter viewer username (e.g. TikTok_User)':'Introduce el usuario del espectador (p. ej., TikTok_User)','Spinning for Winner...':'Seleccionando ganador...','Current Viewers on Wheel:':'Espectadores actuales en la rueda:','Recent Raffle Winners':'Ganadores recientes','Digital Crypto Card Number Guess':'Adivina el número de la tarjeta cripto','Streamer Card Settings':'Configuración de tarjeta del streamer','Streamer Card Configurator':'Configurador de tarjeta del streamer','Card Title':'Título de tarjeta','Serial Number':'Número de serie','Concealed':'Oculto','Revealed':'Revelado','Verify Challenge':'Verificar desafío','Provably Fair Verification':'Verificación de equidad demostrable','Affiliate Partner Program':'Programa de afiliados','Your Personal Affiliate Link':'Tu enlace personal de afiliado','Direct Invitations':'Invitaciones directas','Network Invites':'Invitaciones de red','Deep Ecosystem':'Ecosistema profundo','Affiliate Income Calculator':'Calculadora de ingresos de afiliados','Estimated Monthly Earnings':'Ingresos mensuales estimados','Live Referral Feed':'Actividad de referidos en vivo','Referee Handle':'Usuario referido','Date Joined':'Fecha de registro','Commission Tier':'Nivel de comisión','Wager Volume':'Volumen de apuestas','Commission Earned':'Comisión obtenida','Copied Link':'Enlace copiado','Referral link copied to clipboard!':'¡Enlace de referidos copiado!','No Pending Rewards':'Sin recompensas pendientes','All referral commissions have already been transferred.':'Todas las comisiones de referidos ya fueron transferidas.','Minimum Deposit':'Depósito mínimo','Minimum deposit is $5.00 USD':'El depósito mínimo es de 5,00 USD','Failed to generate invoice':'No se pudo generar la factura','Create NOWPayments Invoice':'Crear factura de NOWPayments','Order ID: ':'ID del pedido: '
  },
  pt: {
    'Live Room':'Sala ao vivo','Gagal memuat live room.':'Não foi possível carregar a sala ao vivo.','Pesan gagal dikirim.':'Não foi possível enviar a mensagem.','Like gagal dikirim.':'Não foi possível enviar a curtida.','Masuk untuk bergabung ke Live Room':'Entre para participar da sala ao vivo','Peserta Live':'Participantes ao vivo','Memuat peserta...':'Carregando participantes...','Belum ada peserta lain.':'Ainda não há outros participantes.','Belum ada peserta.':'Ainda não há participantes.','Need More Viewers':'Mais espectadores necessários','Add at least 2 viewer usernames to spin the raffle wheel.':'Adicione pelo menos 2 nomes de espectadores para girar a roda.','Winner Picked!':'Vencedor escolhido!','Congratulations':'Parabéns','Selected as Lucky Viewer!':'Selecionado como espectador sortudo!','Enter viewer username (e.g. TikTok_User)':'Digite o usuário do espectador (ex.: TikTok_User)','Spinning for Winner...':'Sorteando vencedor...','Current Viewers on Wheel:':'Espectadores atuais na roda:','Recent Raffle Winners':'Vencedores recentes','Digital Crypto Card Number Guess':'Adivinhe o número do cartão cripto','Streamer Card Settings':'Configurações do cartão do streamer','Streamer Card Configurator':'Configurador do cartão do streamer','Card Title':'Título do cartão','Serial Number':'Número de série','Concealed':'Oculto','Revealed':'Revelado','Verify Challenge':'Verificar desafio','Provably Fair Verification':'Verificação de justiça comprovável','Affiliate Partner Program':'Programa de afiliados','Your Personal Affiliate Link':'Seu link pessoal de afiliado','Direct Invitations':'Convites diretos','Network Invites':'Convites de rede','Deep Ecosystem':'Ecossistema profundo','Affiliate Income Calculator':'Calculadora de ganhos de afiliados','Estimated Monthly Earnings':'Ganhos mensais estimados','Live Referral Feed':'Feed de indicações ao vivo','Referee Handle':'Usuário indicado','Date Joined':'Data de entrada','Commission Tier':'Nível de comissão','Wager Volume':'Volume de apostas','Commission Earned':'Comissão recebida','Copied Link':'Link copiado','Referral link copied to clipboard!':'Link de indicação copiado!','No Pending Rewards':'Sem recompensas pendentes','All referral commissions have already been transferred.':'Todas as comissões de indicação já foram transferidas.','Minimum Deposit':'Depósito mínimo','Minimum deposit is $5.00 USD':'O depósito mínimo é US$ 5,00','Failed to generate invoice':'Falha ao gerar a fatura','Create NOWPayments Invoice':'Criar fatura NOWPayments','Order ID: ':'ID do pedido: '
  },
  zh: {
    'Live Room':'ç›´æ’­é—´','Gagal memuat live room.':'æ— æ³•åŠ è½½ç›´æ’­é—´ã€‚','Pesan gagal dikirim.':'æ¶ˆæ¯å‘é€å¤±è´¥ã€‚','Like gagal dikirim.':'ç‚¹èµžå‘é€å¤±è´¥ã€‚','Masuk untuk bergabung ke Live Room':'ç™»å½•åŽåŠ å…¥ç›´æ’­é—´','Peserta Live':'ç›´æ’­å‚ä¸Žè€…','Memuat peserta...':'正在加载参与者…','Belum ada peserta lain.':'æš‚æ— å…¶ä»–å‚ä¸Žè€…ã€‚','Belum ada peserta.':'æš‚æ— å‚ä¸Žè€…ã€‚','Need More Viewers':'éœ€è¦æ›´å¤šè§‚ä¼—','Add at least 2 viewer usernames to spin the raffle wheel.':'è‡³å°‘æ·»åŠ 2ä¸ªè§‚ä¼—ç”¨æˆ·åæ‰èƒ½å¼€å§‹æŠ½å¥–ã€‚','Winner Picked!':'å·²é€‰å‡ºèŽ·èƒœè€…ï¼','Congratulations':'æ­å–œ','Selected as Lucky Viewer!':'è¢«é€‰ä¸ºå¹¸è¿è§‚ä¼—ï¼','Enter viewer username (e.g. TikTok_User)':'è¾“å…¥è§‚ä¼—ç”¨æˆ·åï¼ˆä¾‹å¦‚ TikTok_Userï¼‰','Spinning for Winner...':'正在抽取获胜者…','Current Viewers on Wheel:':'å½“å‰è½¬ç›˜è§‚ä¼—ï¼š','Recent Raffle Winners':'æœ€è¿‘æŠ½å¥–èŽ·èƒœè€…','Digital Crypto Card Number Guess':'æ•°å­—åŠ å¯†å¡å·ç ç«žçŒœ','Streamer Card Settings':'ä¸»æ’­å¡ç‰‡è®¾ç½®','Streamer Card Configurator':'ä¸»æ’­å¡ç‰‡é…ç½®å™¨','Card Title':'å¡ç‰‡æ ‡é¢˜','Serial Number':'åºåˆ—å·','Concealed':'éšè—','Revealed':'å·²æ­ç¤º','Verify Challenge':'éªŒè¯æŒ‘æˆ˜','Provably Fair Verification':'å¯éªŒè¯å…¬å¹³æ€§','Affiliate Partner Program':'è”ç›Ÿåˆä½œä¼™ä¼´è®¡åˆ’','Your Personal Affiliate Link':'æ‚¨çš„ä¸ªäººæŽ¨å¹¿é“¾æŽ¥','Direct Invitations':'ç›´æŽ¥é‚€è¯·','Network Invites':'ç½‘ç»œé‚€è¯·','Deep Ecosystem':'æ·±åº¦ç”Ÿæ€','Affiliate Income Calculator':'è”ç›Ÿæ”¶ç›Šè®¡ç®—å™¨','Estimated Monthly Earnings':'é¢„è®¡æœˆæ”¶ç›Š','Live Referral Feed':'å®žæ—¶æŽ¨èåŠ¨æ€','Referee Handle':'è¢«æŽ¨èäºº','Date Joined':'åŠ å…¥æ—¥æœŸ','Commission Tier':'ä½£é‡‘ç­‰çº§','Wager Volume':'æŠ•æ³¨é‡','Commission Earned':'å·²èŽ·å¾—ä½£é‡‘','Copied Link':'é“¾æŽ¥å·²å¤åˆ¶','Referral link copied to clipboard!':'æŽ¨èé“¾æŽ¥å·²å¤åˆ¶ï¼','No Pending Rewards':'æ²¡æœ‰å¾…å¤„ç†å¥–åŠ±','All referral commissions have already been transferred.':'æ‰€æœ‰æŽ¨èä½£é‡‘å‡å·²è½¬ç§»ã€‚','Minimum Deposit':'æœ€ä½Žå……å€¼','Minimum deposit is $5.00 USD':'æœ€ä½Žå……å€¼é‡‘é¢ä¸º5.00ç¾Žå…ƒ','Failed to generate invoice':'ç”Ÿæˆå‘ç¥¨å¤±è´¥','Create NOWPayments Invoice':'åˆ›å»º NOWPayments å‘ç¥¨','Order ID: ':'è®¢å•IDï¼š'
  },
  ja: {
    'Live Room':'ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ','Gagal memuat live room.':'ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã‚’èª­ã¿è¾¼ã‚ã¾ã›ã‚“ã§ã—ãŸã€‚','Pesan gagal dikirim.':'ãƒ¡ãƒƒã‚»ãƒ¼ã‚¸ã‚’é€ä¿¡ã§ãã¾ã›ã‚“ã§ã—ãŸã€‚','Like gagal dikirim.':'ã„ã„ã­ã‚’é€ä¿¡ã§ãã¾ã›ã‚“ã§ã—ãŸã€‚','Masuk untuk bergabung ke Live Room':'ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã«å‚åŠ ','Peserta Live':'ãƒ©ã‚¤ãƒ–å‚åŠ è€…','Memuat peserta...':'参加者を読み込み中…','Belum ada peserta lain.':'ä»–ã®å‚åŠ è€…ã¯ã„ã¾ã›ã‚“ã€‚','Belum ada peserta.':'å‚åŠ è€…ã¯ã„ã¾ã›ã‚“ã€‚','Need More Viewers':'è¦–è´è€…ãŒè¶³ã‚Šã¾ã›ã‚“','Add at least 2 viewer usernames to spin the raffle wheel.':'æŠ½é¸ã‚’å›žã™ã«ã¯2äººä»¥ä¸Šã®è¦–è´è€…åã‚’è¿½åŠ ã—ã¦ãã ã•ã„ã€‚','Winner Picked!':'å½“é¸è€…ãŒæ±ºã¾ã‚Šã¾ã—ãŸï¼','Congratulations':'ãŠã‚ã§ã¨ã†ã”ã–ã„ã¾ã™','Selected as Lucky Viewer!':'ãƒ©ãƒƒã‚­ãƒ¼è¦–è´è€…ã«é¸ã°ã‚Œã¾ã—ãŸï¼','Enter viewer username (e.g. TikTok_User)':'è¦–è´è€…åã‚’å…¥åŠ›ï¼ˆä¾‹ï¼šTikTok_Userï¼‰','Spinning for Winner...':'当選者を抽選中…','Current Viewers on Wheel:':'ç¾åœ¨ã®å‚åŠ è€…ï¼š','Recent Raffle Winners':'æœ€è¿‘ã®å½“é¸è€…','Digital Crypto Card Number Guess':'ãƒ‡ã‚¸ã‚¿ãƒ«æš—å·ã‚«ãƒ¼ãƒ‰ç•ªå·å½“ã¦','Streamer Card Settings':'ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã‚«ãƒ¼ãƒ‰è¨­å®š','Streamer Card Configurator':'ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã‚«ãƒ¼ãƒ‰è¨­å®šãƒ„ãƒ¼ãƒ«','Card Title':'ã‚«ãƒ¼ãƒ‰ã‚¿ã‚¤ãƒˆãƒ«','Serial Number':'ã‚·ãƒªã‚¢ãƒ«ç•ªå·','Concealed':'éžè¡¨ç¤º','Revealed':'å…¬é–‹','Verify Challenge':'ãƒãƒ£ãƒ¬ãƒ³ã‚¸ã‚’æ¤œè¨¼','Provably Fair Verification':'æ¤œè¨¼å¯èƒ½ãªå…¬å¹³æ€§','Affiliate Partner Program':'ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆãƒ‘ãƒ¼ãƒˆãƒŠãƒ¼ãƒ—ãƒ­ã‚°ãƒ©ãƒ ','Your Personal Affiliate Link':'ã‚ãªãŸã®ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆãƒªãƒ³ã‚¯','Direct Invitations':'ç›´æŽ¥æ‹›å¾…','Network Invites':'ãƒãƒƒãƒˆãƒ¯ãƒ¼ã‚¯æ‹›å¾…','Deep Ecosystem':'æ·±ã„ã‚¨ã‚³ã‚·ã‚¹ãƒ†ãƒ ','Affiliate Income Calculator':'ã‚¢ãƒ•ã‚£ãƒªã‚¨ã‚¤ãƒˆåŽç›Šè¨ˆç®—æ©Ÿ','Estimated Monthly Earnings':'æŽ¨å®šæœˆé–“åŽç›Š','Live Referral Feed':'ãƒ©ã‚¤ãƒ–ç´¹ä»‹ãƒ•ã‚£ãƒ¼ãƒ‰','Referee Handle':'ç´¹ä»‹ãƒ¦ãƒ¼ã‚¶ãƒ¼å','Date Joined':'å‚åŠ æ—¥','Commission Tier':'ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³ãƒ¬ãƒ™ãƒ«','Wager Volume':'ãƒ™ãƒƒãƒˆç·é¡','Commission Earned':'ç²å¾—ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³','Copied Link':'ãƒªãƒ³ã‚¯ã‚’ã‚³ãƒ”ãƒ¼ã—ã¾ã—ãŸ','Referral link copied to clipboard!':'ç´¹ä»‹ãƒªãƒ³ã‚¯ã‚’ã‚³ãƒ”ãƒ¼ã—ã¾ã—ãŸï¼','No Pending Rewards':'ä¿ç•™ä¸­ã®å ±é…¬ã¯ã‚ã‚Šã¾ã›ã‚“','All referral commissions have already been transferred.':'ç´¹ä»‹ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³ã¯ã™ã¹ã¦ç§»è¡Œæ¸ˆã¿ã§ã™ã€‚','Minimum Deposit':'æœ€ä½Žå…¥é‡‘é¡','Minimum deposit is $5.00 USD':'æœ€ä½Žå…¥é‡‘é¡ã¯5.00ç±³ãƒ‰ãƒ«ã§ã™','Failed to generate invoice':'è«‹æ±‚æ›¸ã®ç”Ÿæˆã«å¤±æ•—ã—ã¾ã—ãŸ','Create NOWPayments Invoice':'NOWPaymentsè«‹æ±‚æ›¸ã‚’ä½œæˆ','Order ID: ':'æ³¨æ–‡IDï¼š'
  },
  ko: {
    'Live Room':'ë¼ì´ë¸Œ ë£¸','Gagal memuat live room.':'ë¼ì´ë¸Œ ë£¸ì„ ë¶ˆëŸ¬ì˜¤ì§€ ëª»í–ˆìŠµë‹ˆë‹¤.','Pesan gagal dikirim.':'ë©”ì‹œì§€ë¥¼ ë³´ë‚´ì§€ ëª»í–ˆìŠµë‹ˆë‹¤.','Like gagal dikirim.':'ì¢‹ì•„ìš”ë¥¼ ë³´ë‚´ì§€ ëª»í–ˆìŠµë‹ˆë‹¤.','Masuk untuk bergabung ke Live Room':'ë¡œê·¸ì¸í•˜ì—¬ ë¼ì´ë¸Œ ë£¸ì— ì°¸ì—¬','Peserta Live':'ë¼ì´ë¸Œ ì°¸ê°€ìž','Memuat peserta...':'ì°¸ê°€ìž ë¡œë“œ ì¤‘...','Belum ada peserta lain.':'ì•„ì§ ë‹¤ë¥¸ ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.','Belum ada peserta.':'ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.','Need More Viewers':'ì‹œì²­ìžê°€ ë” í•„ìš”í•©ë‹ˆë‹¤','Add at least 2 viewer usernames to spin the raffle wheel.':'ì¶”ì²¨ì„ ëŒë¦¬ë ¤ë©´ ì‹œì²­ìž ì´ë¦„ì„ 2ëª… ì´ìƒ ì¶”ê°€í•˜ì„¸ìš”.','Winner Picked!':'ë‹¹ì²¨ìž ì„ ì •!','Congratulations':'ì¶•í•˜í•©ë‹ˆë‹¤','Selected as Lucky Viewer!':'í–‰ìš´ì˜ ì‹œì²­ìžë¡œ ì„ ì •ë˜ì—ˆìŠµë‹ˆë‹¤!','Enter viewer username (e.g. TikTok_User)':'ì‹œì²­ìž ì‚¬ìš©ìžëª… ìž…ë ¥(ì˜ˆ: TikTok_User)','Spinning for Winner...':'ë‹¹ì²¨ìž ì¶”ì²¨ ì¤‘...','Current Viewers on Wheel:':'í˜„ìž¬ ìŠ¤í”¼ë„ˆ ì°¸ê°€ìž:','Recent Raffle Winners':'ìµœê·¼ ì¶”ì²¨ ë‹¹ì²¨ìž','Digital Crypto Card Number Guess':'ë””ì§€í„¸ í¬ë¦½í†  ì¹´ë“œ ë²ˆí˜¸ ë§žížˆê¸°','Streamer Card Settings':'ìŠ¤íŠ¸ë¦¬ë¨¸ ì¹´ë“œ ì„¤ì •','Streamer Card Configurator':'ìŠ¤íŠ¸ë¦¬ë¨¸ ì¹´ë“œ êµ¬ì„±ê¸°','Card Title':'ì¹´ë“œ ì œëª©','Serial Number':'ì¼ë ¨ë²ˆí˜¸','Concealed':'ìˆ¨ê¹€','Revealed':'ê³µê°œ','Verify Challenge':'ì±Œë¦°ì§€ í™•ì¸','Provably Fair Verification':'ê²€ì¦ ê°€ëŠ¥í•œ ê³µì •ì„±','Affiliate Partner Program':'ì œíœ´ íŒŒíŠ¸ë„ˆ í”„ë¡œê·¸ëž¨','Your Personal Affiliate Link':'ê°œì¸ ì œíœ´ ë§í¬','Direct Invitations':'ì§ì ‘ ì´ˆëŒ€','Network Invites':'ë„¤íŠ¸ì›Œí¬ ì´ˆëŒ€','Deep Ecosystem':'ì‹¬ì¸µ ìƒíƒœê³„','Affiliate Income Calculator':'ì œíœ´ ìˆ˜ìµ ê³„ì‚°ê¸°','Estimated Monthly Earnings':'ì˜ˆìƒ ì›” ìˆ˜ìµ','Live Referral Feed':'ì‹¤ì‹œê°„ ì¶”ì²œ í”¼ë“œ','Referee Handle':'ì¶”ì²œ ì‚¬ìš©ìž','Date Joined':'ê°€ìž…ì¼','Commission Tier':'ì»¤ë¯¸ì…˜ ë“±ê¸‰','Wager Volume':'ë² íŒ… ê·œëª¨','Commission Earned':'íšë“ ì»¤ë¯¸ì…˜','Copied Link':'ë§í¬ ë³µì‚¬ë¨','Referral link copied to clipboard!':'ì¶”ì²œ ë§í¬ê°€ ë³µì‚¬ë˜ì—ˆìŠµë‹ˆë‹¤!','No Pending Rewards':'ëŒ€ê¸° ì¤‘ì¸ ë³´ìƒì´ ì—†ìŠµë‹ˆë‹¤','All referral commissions have already been transferred.':'ëª¨ë“  ì¶”ì²œ ì»¤ë¯¸ì…˜ì´ ì´ë¯¸ ì´ì „ë˜ì—ˆìŠµë‹ˆë‹¤.','Minimum Deposit':'ìµœì†Œ ìž…ê¸ˆ','Minimum deposit is $5.00 USD':'ìµœì†Œ ìž…ê¸ˆì•¡ì€ 5.00 USDìž…ë‹ˆë‹¤','Failed to generate invoice':'ì¸ë³´ì´ìŠ¤ ìƒì„± ì‹¤íŒ¨','Create NOWPayments Invoice':'NOWPayments ì¸ë³´ì´ìŠ¤ ìƒì„±','Order ID: ':'ì£¼ë¬¸ ID: '
  },
  ar: {
    'Live Room':'الغرفة المباشرة','Gagal memuat live room.':'تعذر تحميل الغرفة المباشرة.','Pesan gagal dikirim.':'تعذر إرسال الرسالة.','Like gagal dikirim.':'تعذر إرسال الإعجاب.','Masuk untuk bergabung ke Live Room':'سجّل الدخول للانضمام إلى الغرفة المباشرة','Peserta Live':'المشاركون المباشرون','Memuat peserta...':'جارٍ تحميل المشاركين...','Belum ada peserta lain.':'لا يوجد مشاركون آخرون بعد.','Belum ada peserta.':'لا يوجد مشاركون بعد.','Need More Viewers':'نحتاج إلى مزيد من المشاهدين','Add at least 2 viewer usernames to spin the raffle wheel.':'أضف اسمَي مشاهدين على الأقل لتدوير عجلة السحب.','Winner Picked!':'تم اختيار الفائز!','Congratulations':'تهانينا','Selected as Lucky Viewer!':'تم اختيارك كمشاهد محظوظ!','Enter viewer username (e.g. TikTok_User)':'أدخل اسم المستخدم للمشاهد (مثال: TikTok_User)','Spinning for Winner...':'جارٍ اختيار الفائز...','Current Viewers on Wheel:':'المشاهدون الحاليون على العجلة:','Recent Raffle Winners':'الفائزون الأخيرون','Digital Crypto Card Number Guess':'تخمين رقم بطاقة العملات الرقمية','Streamer Card Settings':'إعدادات بطاقة البث','Streamer Card Configurator':'مكوّن بطاقة البث','Card Title':'عنوان البطاقة','Serial Number':'الرقم التسلسلي','Concealed':'مخفي','Revealed':'مكشوف','Verify Challenge':'تحقق من التحدي','Provably Fair Verification':'تحقق من العدالة القابلة للإثبات','Affiliate Partner Program':'برنامج الشركاء بالعمولة','Your Personal Affiliate Link':'رابط الإحالة الشخصي','Direct Invitations':'الدعوات المباشرة','Network Invites':'دعوات الشبكة','Deep Ecosystem':'النظام البيئي المتكامل','Affiliate Income Calculator':'حاسبة دخل الإحالة','Estimated Monthly Earnings':'الأرباح الشهرية المقدرة','Live Referral Feed':'تغذية الإحالات المباشرة','Referee Handle':'اسم المُحال','Date Joined':'تاريخ الانضمام','Commission Tier':'مستوى العمولة','Wager Volume':'حجم الرهان','Commission Earned':'العمولة المكتسبة','Copied Link':'تم نسخ الرابط','Referral link copied to clipboard!':'تم نسخ رابط الإحالة!','No Pending Rewards':'لا توجد مكافآت معلقة','All referral commissions have already been transferred.':'تم تحويل جميع عمولات الإحالة بالفعل.','Minimum Deposit':'الحد الأدنى للإيداع','Minimum deposit is $5.00 USD':'الحد الأدنى للإيداع هو 5.00 دولار أمريكي','Failed to generate invoice':'فشل إنشاء الفاتورة','Create NOWPayments Invoice':'إنشاء فاتورة NOWPayments','Order ID: ':'معرّف الطلب: '
  }
};
for (const lang of Object.keys(EXHAUSTIVE_UI_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], EXHAUSTIVE_UI_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...EXHAUSTIVE_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}


const DASHBOARD_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Setiap user dapat membagikan tulisan dan postingan.':'Setiap pengguna dapat membagikan tulisan dan postingan.',
    'Belum ada postingan':'Belum ada postingan','Jadilah pengguna pertama yang membagikan sesuatu.':'Jadilah pengguna pertama yang membagikan sesuatu.',
    'Buat Postingan':'Buat Postingan','Belum ada data live aktif':'Belum ada data live aktif',
    'Room live akan tampil di sini setelah tersedia dari backend produksi.':'Room live akan tampil di sini setelah tersedia dari backend produksi.',
    'Live':'Live','Buka Live Room â†’':'Buka Live Room â†’','Tebak Nomor':'Tebak Nomor','Ikuti permainan live.':'Ikuti permainan live.',
    'Spinner':'Spinner','Masuk ke event spinner.':'Masuk ke event spinner.','Blind Box':'Blind Box','Buka Blind Box dengan saldo akun.':'Buka Blind Box dengan saldo akun.',
    'Upload / Create Post':'Unggah / Buat Postingan','Tulis sesuatu untuk dibagikan ke komunitas...':'Tulis sesuatu untuk dibagikan ke komunitas...',
    'URL media (opsional)':'URL media (opsional)','Menerbitkan...':'Menerbitkan...','Terbitkan Postingan':'Terbitkan Postingan',
    'Refresh balance':'Muat ulang saldo','Refresh posts':'Muat ulang postingan','Claim Bonus':'Klaim Bonus'
  },
  en: {
    'Setiap user dapat membagikan tulisan dan postingan.':'Every user can share posts and updates.',
    'Belum ada postingan':'No posts yet','Jadilah pengguna pertama yang membagikan sesuatu.':'Be the first user to share something.',
    'Buat Postingan':'Create Post','Belum ada data live aktif':'No active live data',
    'Room live akan tampil di sini setelah tersedia dari backend produksi.':'Live rooms will appear here when available from the production backend.',
    'Live':'Live','Buka Live Room â†’':'Open Live Room â†’','Tebak Nomor':'Guess the Number','Ikuti permainan live.':'Join the live game.',
    'Spinner':'Spinner','Masuk ke event spinner.':'Enter the spinner event.','Blind Box':'Blind Box','Buka Blind Box dengan saldo akun.':'Open Blind Box using your account balance.',
    'Upload / Create Post':'Upload / Create Post','Tulis sesuatu untuk dibagikan ke komunitas...':'Write something to share with the community...',
    'URL media (opsional)':'Media URL (optional)','Menerbitkan...':'Publishing...','Terbitkan Postingan':'Publish Post',
    'Refresh balance':'Refresh balance','Refresh posts':'Refresh posts','Claim Bonus':'Claim Bonus'
  },
  es: {
    'Setiap user dapat membagikan tulisan dan postingan.':'Cada usuario puede compartir publicaciones y actualizaciones.','Belum ada postingan':'Aún no hay publicaciones','Jadilah pengguna pertama yang membagikan sesuatu.':'Sé el primero en compartir algo.','Buat Postingan':'Crear publicación','Belum ada data live aktif':'No hay datos de transmisiones activas','Room live akan tampil di sini setelah tersedia dari backend produksi.':'Las salas en vivo aparecerán cuando estén disponibles desde el backend de producción.','Live':'En vivo','Buka Live Room â†’':'Abrir sala en vivo â†’','Tebak Nomor':'Adivina el número','Ikuti permainan live.':'Participa en el juego en vivo.','Spinner':'Spinner','Masuk ke event spinner.':'Entrar al evento spinner.','Blind Box':'Blind Box','Buka Blind Box dengan saldo akun.':'Abrir Blind Box con el saldo de la cuenta.','Upload / Create Post':'Subir / crear publicación','Tulis sesuatu untuk dibagikan ke komunitas...':'Escribe algo para compartir con la comunidad...','URL media (opsional)':'URL multimedia (opcional)','Menerbitkan...':'Publicando...','Terbitkan Postingan':'Publicar','Refresh balance':'Actualizar saldo','Refresh posts':'Actualizar publicaciones','Claim Bonus':'Reclamar bono'
  },
  pt: {
    'Setiap user dapat membagikan tulisan dan postingan.':'Cada usuário pode compartilhar publicações e atualizações.','Belum ada postingan':'Ainda não há publicações','Jadilah pengguna pertama yang membagikan sesuatu.':'Seja o primeiro a compartilhar algo.','Buat Postingan':'Criar publicação','Belum ada data live aktif':'Não há dados de live ativos','Room live akan tampil di sini setelah tersedia dari backend produksi.':'As salas ao vivo aparecerão quando estiverem disponíveis no backend de produção.','Live':'Ao vivo','Buka Live Room â†’':'Abrir sala ao vivo â†’','Tebak Nomor':'Adivinhe o número','Ikuti permainan live.':'Participe do jogo ao vivo.','Spinner':'Spinner','Masuk ke event spinner.':'Entrar no evento spinner.','Blind Box':'Blind Box','Buka Blind Box dengan saldo akun.':'Abrir Blind Box usando o saldo da conta.','Upload / Create Post':'Enviar / criar publicação','Tulis sesuatu untuk dibagikan ke komunitas...':'Escreva algo para compartilhar com a comunidade...','URL media (opsional)':'URL de mídia (opcional)','Menerbitkan...':'Publicando...','Terbitkan Postingan':'Publicar','Refresh balance':'Atualizar saldo','Refresh posts':'Atualizar publicações','Claim Bonus':'Resgatar bônus'
  },
  zh: {
    'Setiap user dapat membagikan tulisan dan postingan.':'æ¯ä½ç”¨æˆ·éƒ½å¯ä»¥åˆ†äº«å¸–å­å’ŒåŠ¨æ€ã€‚','Belum ada postingan':'æš‚æ— å¸–å­','Jadilah pengguna pertama yang membagikan sesuatu.':'æˆä¸ºç¬¬ä¸€ä¸ªåˆ†äº«å†…å®¹çš„ç”¨æˆ·ã€‚','Buat Postingan':'åˆ›å»ºå¸–å­','Belum ada data live aktif':'æš‚æ— æ´»è·ƒç›´æ’­æ•°æ®','Room live akan tampil di sini setelah tersedia dari backend produksi.':'ç”Ÿäº§åŽç«¯æä¾›æ•°æ®åŽï¼Œç›´æ’­é—´ä¼šæ˜¾ç¤ºåœ¨è¿™é‡Œã€‚','Live':'ç›´æ’­','Buka Live Room â†’':'æ‰“å¼€ç›´æ’­é—´ â†’','Tebak Nomor':'çŒœæ•°å­—','Ikuti permainan live.':'å‚ä¸Žç›´æ’­æ¸¸æˆã€‚','Spinner':'è½¬ç›˜','Masuk ke event spinner.':'è¿›å…¥è½¬ç›˜æ´»åŠ¨ã€‚','Blind Box':'ç›²ç›’','Buka Blind Box dengan saldo akun.':'ä½¿ç”¨è´¦æˆ·ä½™é¢æ‰“å¼€ç›²ç›’ã€‚','Upload / Create Post':'ä¸Šä¼  / åˆ›å»ºå¸–å­','Tulis sesuatu untuk dibagikan ke komunitas...':'å†™ä¸‹è¦ä¸Žç¤¾åŒºåˆ†äº«çš„å†…å®¹...','URL media (opsional)':'åª’ä½“é“¾æŽ¥ï¼ˆå¯é€‰ï¼‰','Menerbitkan...':'å‘å¸ƒä¸­...','Terbitkan Postingan':'å‘å¸ƒå¸–å­','Refresh balance':'åˆ·æ–°ä½™é¢','Refresh posts':'åˆ·æ–°å¸–å­','Claim Bonus':'é¢†å–å¥–åŠ±'
  },
  ja: {
    'Setiap user dapat membagikan tulisan dan postingan.':'ã™ã¹ã¦ã®ãƒ¦ãƒ¼ã‚¶ãƒ¼ãŒæŠ•ç¨¿ã‚„æ›´æ–°ã‚’å…±æœ‰ã§ãã¾ã™ã€‚','Belum ada postingan':'æŠ•ç¨¿ã¯ã¾ã ã‚ã‚Šã¾ã›ã‚“','Jadilah pengguna pertama yang membagikan sesuatu.':'æœ€åˆã«ä½•ã‹ã‚’å…±æœ‰ã—ã¾ã—ã‚‡ã†ã€‚','Buat Postingan':'æŠ•ç¨¿ã‚’ä½œæˆ','Belum ada data live aktif':'ã‚¢ã‚¯ãƒ†ã‚£ãƒ–ãªãƒ©ã‚¤ãƒ–ãƒ‡ãƒ¼ã‚¿ã¯ã‚ã‚Šã¾ã›ã‚“','Room live akan tampil di sini setelah tersedia dari backend produksi.':'æœ¬ç•ªãƒãƒƒã‚¯ã‚¨ãƒ³ãƒ‰ã‹ã‚‰åˆ©ç”¨å¯èƒ½ã«ãªã‚‹ã¨ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ãŒã“ã“ã«è¡¨ç¤ºã•ã‚Œã¾ã™ã€‚','Live':'ãƒ©ã‚¤ãƒ–','Buka Live Room â†’':'ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ã‚’é–‹ã â†’','Tebak Nomor':'æ•°å­—ã‚’å½“ã¦ã‚‹','Ikuti permainan live.':'ãƒ©ã‚¤ãƒ–ã‚²ãƒ¼ãƒ ã«å‚åŠ ã™ã‚‹ã€‚','Spinner':'ã‚¹ãƒ”ãƒŠãƒ¼','Masuk ke event spinner.':'ã‚¹ãƒ”ãƒŠãƒ¼ã‚¤ãƒ™ãƒ³ãƒˆã«å…¥ã‚‹ã€‚','Blind Box':'ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹','Buka Blind Box dengan saldo akun.':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆæ®‹é«˜ã§ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹ã‚’é–‹ãã€‚','Upload / Create Post':'ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰ / æŠ•ç¨¿ã‚’ä½œæˆ','Tulis sesuatu untuk dibagikan ke komunitas...':'ã‚³ãƒŸãƒ¥ãƒ‹ãƒ†ã‚£ã§å…±æœ‰ã™ã‚‹å†…å®¹ã‚’å…¥åŠ›...','URL media (opsional)':'ãƒ¡ãƒ‡ã‚£ã‚¢URLï¼ˆä»»æ„ï¼‰','Menerbitkan...':'å…¬é–‹ä¸­...','Terbitkan Postingan':'æŠ•ç¨¿ã‚’å…¬é–‹','Refresh balance':'æ®‹é«˜ã‚’æ›´æ–°','Refresh posts':'æŠ•ç¨¿ã‚’æ›´æ–°','Claim Bonus':'ãƒœãƒ¼ãƒŠã‚¹ã‚’å—ã‘å–ã‚‹'
  },
  ko: {
    'Setiap user dapat membagikan tulisan dan postingan.':'ëª¨ë“  ì‚¬ìš©ìžëŠ” ê²Œì‹œë¬¼ê³¼ ì—…ë°ì´íŠ¸ë¥¼ ê³µìœ í•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤.','Belum ada postingan':'ê²Œì‹œë¬¼ì´ ì—†ìŠµë‹ˆë‹¤','Jadilah pengguna pertama yang membagikan sesuatu.':'ê°€ìž¥ ë¨¼ì € ì½˜í…ì¸ ë¥¼ ê³µìœ í•´ ë³´ì„¸ìš”.','Buat Postingan':'ê²Œì‹œë¬¼ ë§Œë“¤ê¸°','Belum ada data live aktif':'í™œì„± ë¼ì´ë¸Œ ë°ì´í„°ê°€ ì—†ìŠµë‹ˆë‹¤','Room live akan tampil di sini setelah tersedia dari backend produksi.':'í”„ë¡œë•ì…˜ ë°±ì—”ë“œì—ì„œ ì œê³µë˜ë©´ ë¼ì´ë¸Œ ë£¸ì´ ì—¬ê¸°ì— í‘œì‹œë©ë‹ˆë‹¤.','Live':'ë¼ì´ë¸Œ','Buka Live Room â†’':'ë¼ì´ë¸Œ ë£¸ ì—´ê¸° â†’','Tebak Nomor':'ìˆ«ìž ë§žížˆê¸°','Ikuti permainan live.':'ë¼ì´ë¸Œ ê²Œìž„ì— ì°¸ì—¬í•˜ì„¸ìš”.','Spinner':'ìŠ¤í”¼ë„ˆ','Masuk ke event spinner.':'ìŠ¤í”¼ë„ˆ ì´ë²¤íŠ¸ ìž…ìž¥','Blind Box':'ë¸”ë¼ì¸ë“œ ë°•ìŠ¤','Buka Blind Box dengan saldo akun.':'ê³„ì • ìž”ì•¡ìœ¼ë¡œ ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ ì—´ê¸°','Upload / Create Post':'ì—…ë¡œë“œ / ê²Œì‹œë¬¼ ë§Œë“¤ê¸°','Tulis sesuatu untuk dibagikan ke komunitas...':'ì»¤ë®¤ë‹ˆí‹°ì— ê³µìœ í•  ë‚´ìš©ì„ ìž‘ì„±í•˜ì„¸ìš”...','URL media (opsional)':'ë¯¸ë””ì–´ URL(ì„ íƒ ì‚¬í•­)','Menerbitkan...':'ê²Œì‹œ ì¤‘...','Terbitkan Postingan':'ê²Œì‹œë¬¼ ê²Œì‹œ','Refresh balance':'ìž”ì•¡ ìƒˆë¡œê³ ì¹¨','Refresh posts':'ê²Œì‹œë¬¼ ìƒˆë¡œê³ ì¹¨','Claim Bonus':'ë³´ë„ˆìŠ¤ ë°›ê¸°'
  },
  ar: {
    'Setiap user dapat membagikan tulisan dan postingan.':'يمكن لكل مستخدم مشاركة المنشورات والتحديثات.','Belum ada postingan':'لا توجد منشورات بعد','Jadilah pengguna pertama yang membagikan sesuatu.':'كن أول مستخدم يشارك شيئًا.','Buat Postingan':'إنشاء منشور','Belum ada data live aktif':'لا توجد بيانات بث مباشر نشطة','Room live akan tampil di sini setelah tersedia dari backend produksi.':'ستظهر غرف البث المباشر هنا عند توفرها من الواجهة الخلفية للإنتاج.','Live':'مباشر','Buka Live Room â†’':'فتح غرفة البث المباشر →','Tebak Nomor':'خمن الرقم','Ikuti permainan live.':'شارك في اللعبة المباشرة.','Spinner':'العجلة','Masuk ke event spinner.':'الدخول إلى فعالية العجلة.','Blind Box':'الصندوق الغامض','Buka Blind Box dengan saldo akun.':'افتح الصندوق الغامض باستخدام رصيد حسابك.','Upload / Create Post':'رفع / إنشاء منشور','Tulis sesuatu untuk dibagikan ke komunitas...':'اكتب شيئًا لمشاركته مع المجتمع...','URL media (opsional)':'رابط الوسائط (اختياري)','Menerbitkan...':'جارٍ النشر...','Terbitkan Postingan':'نشر المنشور','Refresh balance':'تحديث الرصيد','Refresh posts':'تحديث المنشورات','Claim Bonus':'استلام المكافأة'
  }
};
for (const lang of Object.keys(DASHBOARD_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], DASHBOARD_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...DASHBOARD_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const AUDIT_UI_TRANSLATIONS: Partial<Record<LanguageCode, Record<string,string>>> = {
  id: {'Profile':'Profil','Kelola akun, wallet, dan aktivitas kamu.':'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address':'User ID = Alamat Wallet','Member':'Anggota','USDT Account':'Akun USDT','EVM Wallet':'Wallet EVM','Wallet belum terhubung':'Wallet belum terhubung','Alamat wallet berhasil disalin.':'Alamat wallet berhasil disalin.','Available':'Tersedia','Locked':'Terkunci','Withdraw':'Tarik Dana','Ajukan penarikan':'Ajukan penarikan','Registration Bonus':'Bonus Registrasi','Bonus tersedia dan belum diklaim.':'Bonus tersedia dan belum diklaim.','Available Balance':'Saldo Tersedia','Locked Balance':'Saldo Terkunci','Referral Link':'Link Referral','Bagikan link ini untuk mengundang user baru.':'Bagikan link ini untuk mengundang user baru.','Event Participation Status':'Status Partisipasi Event','Belum ada event yang diikuti.':'Belum ada event yang diikuti.','Transaction History':'Riwayat Transaksi','Deposit, withdrawal, lock, reward & bonus':'Deposit, penarikan, lock, reward & bonus','Refresh':'Muat Ulang','Loading...':'Memuat...','Belum ada transaksi.':'Belum ada transaksi.','Withdraw USDT':'Tarik USDT','Submit Withdrawal':'Ajukan Penarikan','JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG, PNG, WEBP • foto tetap tersimpan di perangkat Anda','Daily Mystery Blind Box':'Blind Box Misteri Harian','Lock minimal $4 equivalent untuk membuka Blind Box':'Lock minimal setara $4 untuk membuka Blind Box','Lock aktif':'Lock aktif','Aturan claim tetap 1 kali per hari.':'Klaim tetap 1 kali per hari.','LOCK SALDO DIBUTUHKAN':'LOCK SALDO DIBUTUHKAN','1 Box/Day':'1 Box/Hari','Lock Saldo Sekarang':'Lock Saldo Sekarang','Server sedang menentukan reward...':'Server sedang menentukan reward...','Reward Blind Box Harian':'Reward Blind Box Harian','Keep in Vault':'Simpan di Vault','Done':'Selesai','Active Selection':'Pilihan Aktif','Jadwal Durasi Lock':'Jadwal Durasi Lock','Reward harian sesuai pengaturan server':'Reward harian sesuai pengaturan server','Verifying Email':'Memverifikasi Email','Email Verified':'Email Terverifikasi','Verification Failed':'Verifikasi Gagal','SYS STREAM LOADING':'SYS STREAM MEMUAT...','Live Room Aktif':'Live Room Aktif','Live belum aktif':'Live belum aktif'},
  en: {'Profile':'Profile','Kelola akun, wallet, dan aktivitas kamu.':'Manage your account, wallet, and activity.','User ID = Wallet Address':'User ID = Wallet Address','Member':'Member','USDT Account':'USDT Account','EVM Wallet':'EVM Wallet','Wallet belum terhubung':'Wallet not connected','Alamat wallet berhasil disalin.':'Wallet address copied successfully.','Available':'Available','Locked':'Locked','Withdraw':'Withdraw','Ajukan penarikan':'Request withdrawal','Registration Bonus':'Registration Bonus','Bonus tersedia dan belum diklaim.':'Bonus is available and has not been claimed.','Available Balance':'Available Balance','Locked Balance':'Locked Balance','Referral Link':'Referral Link','Bagikan link ini untuk mengundang user baru.':'Share this link to invite a new user.','Event Participation Status':'Event Participation Status','Belum ada event yang diikuti.':'No events joined yet.','Transaction History':'Transaction History','Deposit, withdrawal, lock, reward & bonus':'Deposits, withdrawals, locks, rewards & bonuses','Refresh':'Refresh','Loading...':'Loading...','Belum ada transaksi.':'No transactions yet.','Withdraw USDT':'Withdraw USDT','Submit Withdrawal':'Submit Withdrawal','JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG, PNG, WEBP • photo stays on your device','Daily Mystery Blind Box':'Daily Mystery Blind Box','Lock minimal $4 equivalent untuk membuka Blind Box':'Lock at least the $4 equivalent to open Blind Box','Lock aktif':'Lock active','Aturan claim tetap 1 kali per hari.':'Claim remains limited to once per day.','LOCK SALDO DIBUTUHKAN':'BALANCE LOCK REQUIRED','1 Box/Day':'1 Box/Day','Lock Saldo Sekarang':'Lock Balance Now','Server sedang menentukan reward...':'Server is determining the reward...','Reward Blind Box Harian':'Daily Blind Box Reward','Keep in Vault':'Keep in Vault','Done':'Done','Active Selection':'Active Selection','Jadwal Durasi Lock':'Lock Duration Schedule','Reward harian sesuai pengaturan server':'Daily reward according to server settings','Verifying Email':'Verifying Email','Email Verified':'Email Verified','Verification Failed':'Verification Failed','SYS STREAM LOADING':'SYS STREAM LOADING','Live Room Aktif':'Live Room Active','Live belum aktif':'Live is not active'}
};
for (const lang of Object.keys(AUDIT_UI_TRANSLATIONS) as LanguageCode[]) { Object.assign(translations[lang], AUDIT_UI_TRANSLATIONS[lang]); PAGE_UI_TRANSLATIONS[lang] = { ...AUDIT_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] }; }


const DEPOSIT_UI_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'NOWPayments Crypto Deposit':'Deposit Crypto NOWPayments','Instant deposit with zero platform fees':'Deposit instan tanpa biaya platform',
    'Deposit Amount (USD)':'Nominal Deposit (USD)','Or enter custom USD amount':'Atau masukkan nominal USD sendiri',
    'Minimum deposit':'Minimum deposit','Rate is checked live by NOWPayments when the payment is created.':'Kurs diperiksa langsung oleh NOWPayments saat pembayaran dibuat.',
    'Deposit is credited to your real account balance after payment confirmation.':'Deposit masuk ke saldo akun nyata setelah pembayaran dikonfirmasi.',
    'Select Cryptocurrency':'Pilih Cryptocurrency','Minimum Deposit':'Minimum Deposit','Minimum deposit is':'Minimum deposit adalah',
    'Error':'Error','Failed to generate invoice':'Gagal membuat invoice','Order ID: ':'ID Pesanan: ','Awaiting Deposit':'Menunggu Deposit',
    'Deposit QR Code':'QR Code Deposit','Send exactly to deposit address:':'Kirim tepat ke alamat deposit:','Open NOWPayments Payment Page':'Buka Halaman Pembayaran NOWPayments',
    'Change Currency / Amount':'Ubah Mata Uang / Nominal','Done':'Selesai'
  },
  en: {
    'NOWPayments Crypto Deposit':'NOWPayments Crypto Deposit','Instant deposit with zero platform fees':'Instant deposit with zero platform fees',
    'Deposit Amount (USD)':'Deposit Amount (USD)','Or enter custom USD amount':'Or enter custom USD amount',
    'Minimum deposit':'Minimum deposit','Rate is checked live by NOWPayments when the payment is created.':'Rate is checked live by NOWPayments when the payment is created.',
    'Deposit is credited to your real account balance after payment confirmation.':'Deposit is credited to your real account balance after payment confirmation.',
    'Select Cryptocurrency':'Select Cryptocurrency','Minimum Deposit':'Minimum Deposit','Minimum deposit is':'Minimum deposit is',
    'Error':'Error','Failed to generate invoice':'Failed to generate invoice','Order ID: ':'Order ID: ','Awaiting Deposit':'Awaiting Deposit',
    'Deposit QR Code':'Deposit QR Code','Send exactly to deposit address:':'Send exactly to deposit address:','Open NOWPayments Payment Page':'Open NOWPayments Payment Page',
    'Change Currency / Amount':'Change Currency / Amount','Done':'Done'
  },
  es: {
    'NOWPayments Crypto Deposit':'Depósito cripto NOWPayments','Instant deposit with zero platform fees':'Depósito instantáneo sin comisiones de plataforma',
    'Deposit Amount (USD)':'Importe del depósito (USD)','Or enter custom USD amount':'O introduce un importe USD personalizado',
    'Minimum deposit':'Depósito mínimo','Rate is checked live by NOWPayments when the payment is created.':'NOWPayments comprueba el tipo de cambio en tiempo real al crear el pago.',
    'Deposit is credited to your real account balance after payment confirmation.':'El depósito se acredita en tu saldo real tras confirmar el pago.',
    'Select Cryptocurrency':'Selecciona criptomoneda','Minimum Deposit':'Depósito mínimo','Minimum deposit is':'El depósito mínimo es',
    'Error':'Error','Failed to generate invoice':'No se pudo crear la factura','Order ID: ':'ID de pedido: ','Awaiting Deposit':'Esperando depósito',
    'Deposit QR Code':'Código QR del depósito','Send exactly to deposit address:':'Envía exactamente a la dirección de depósito:','Open NOWPayments Payment Page':'Abrir página de pago de NOWPayments',
    'Change Currency / Amount':'Cambiar moneda / importe','Done':'Listo'
  },
  pt: {
    'NOWPayments Crypto Deposit':'Depósito cripto NOWPayments','Instant deposit with zero platform fees':'Depósito instantâneo sem taxas da plataforma',
    'Deposit Amount (USD)':'Valor do depósito (USD)','Or enter custom USD amount':'Ou informe um valor USD personalizado',
    'Minimum deposit':'Depósito mínimo','Rate is checked live by NOWPayments when the payment is created.':'A cotação é verificada em tempo real pela NOWPayments ao criar o pagamento.',
    'Deposit is credited to your real account balance after payment confirmation.':'O depósito é creditado no saldo real após a confirmação do pagamento.',
    'Select Cryptocurrency':'Selecionar criptomoeda','Minimum Deposit':'Depósito mínimo','Minimum deposit is':'O depósito mínimo é',
    'Error':'Erro','Failed to generate invoice':'Falha ao criar a fatura','Order ID: ':'ID do pedido: ','Awaiting Deposit':'Aguardando depósito',
    'Deposit QR Code':'QR Code do depósito','Send exactly to deposit address:':'Envie exatamente para o endereço de depósito:','Open NOWPayments Payment Page':'Abrir página de pagamento NOWPayments',
    'Change Currency / Amount':'Alterar moeda / valor','Done':'Concluído'
  },
  zh: {
    'NOWPayments Crypto Deposit':'NOWPayments åŠ å¯†è´§å¸å……å€¼','Instant deposit with zero platform fees':'å³æ—¶å……å€¼ï¼Œå¹³å°é›¶æ‰‹ç»­è´¹',
    'Deposit Amount (USD)':'å……å€¼é‡‘é¢ï¼ˆUSDï¼‰','Or enter custom USD amount':'æˆ–è¾“å…¥è‡ªå®šä¹‰ USD é‡‘é¢',
    'Minimum deposit':'æœ€ä½Žå……å€¼','Rate is checked live by NOWPayments when the payment is created.':'åˆ›å»ºä»˜æ¬¾æ—¶ç”± NOWPayments å®žæ—¶æ£€æŸ¥æ±‡çŽ‡ã€‚',
    'Deposit is credited to your real account balance after payment confirmation.':'ä»˜æ¬¾ç¡®è®¤åŽï¼Œå……å€¼é‡‘é¢ä¼šè¿›å…¥æ‚¨çš„çœŸå®žè´¦æˆ·ä½™é¢ã€‚',
    'Select Cryptocurrency':'é€‰æ‹©åŠ å¯†è´§å¸','Minimum Deposit':'æœ€ä½Žå……å€¼','Minimum deposit is':'æœ€ä½Žå……å€¼é‡‘é¢ä¸º',
    'Error':'é”™è¯¯','Failed to generate invoice':'åˆ›å»ºè´¦å•å¤±è´¥','Order ID: ':'è®¢å•IDï¼š','Awaiting Deposit':'ç­‰å¾…å……å€¼',
    'Deposit QR Code':'å……å€¼äºŒç»´ç ','Send exactly to deposit address:':'è¯·å‡†ç¡®å‘é€åˆ°å……å€¼åœ°å€ï¼š','Open NOWPayments Payment Page':'æ‰“å¼€ NOWPayments æ”¯ä»˜é¡µé¢',
    'Change Currency / Amount':'æ›´æ”¹è´§å¸ / é‡‘é¢','Done':'å®Œæˆ'
  },
  ja: {
    'NOWPayments Crypto Deposit':'NOWPaymentsæš—å·è³‡ç”£å…¥é‡‘','Instant deposit with zero platform fees':'ãƒ—ãƒ©ãƒƒãƒˆãƒ•ã‚©ãƒ¼ãƒ æ‰‹æ•°æ–™ãªã—ã®å³æ™‚å…¥é‡‘',
    'Deposit Amount (USD)':'å…¥é‡‘é¡ï¼ˆUSDï¼‰','Or enter custom USD amount':'ã¾ãŸã¯USDé‡‘é¡ã‚’å…¥åŠ›',
    'Minimum deposit':'æœ€ä½Žå…¥é‡‘é¡','Rate is checked live by NOWPayments when the payment is created.':'æ”¯æ‰•ã„ä½œæˆæ™‚ã«NOWPaymentsãŒãƒ¬ãƒ¼ãƒˆã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ç¢ºèªã—ã¾ã™ã€‚',
    'Deposit is credited to your real account balance after payment confirmation.':'æ”¯æ‰•ã„ç¢ºèªå¾Œã€å…¥é‡‘é¡ãŒå®Ÿéš›ã®ã‚¢ã‚«ã‚¦ãƒ³ãƒˆæ®‹é«˜ã«åæ˜ ã•ã‚Œã¾ã™ã€‚',
    'Select Cryptocurrency':'æš—å·è³‡ç”£ã‚’é¸æŠž','Minimum Deposit':'æœ€ä½Žå…¥é‡‘é¡','Minimum deposit is':'æœ€ä½Žå…¥é‡‘é¡ã¯',
    'Error':'ã‚¨ãƒ©ãƒ¼','Failed to generate invoice':'è«‹æ±‚æ›¸ã®ä½œæˆã«å¤±æ•—ã—ã¾ã—ãŸ','Order ID: ':'æ³¨æ–‡IDï¼š','Awaiting Deposit':'å…¥é‡‘å¾…ã¡',
    'Deposit QR Code':'å…¥é‡‘QRã‚³ãƒ¼ãƒ‰','Send exactly to deposit address:':'å…¥é‡‘ã‚¢ãƒ‰ãƒ¬ã‚¹ã¸æ­£ç¢ºã«é€ä¿¡ã—ã¦ãã ã•ã„ï¼š','Open NOWPayments Payment Page':'NOWPaymentsæ”¯æ‰•ã„ãƒšãƒ¼ã‚¸ã‚’é–‹ã',
    'Change Currency / Amount':'é€šè²¨ / é‡‘é¡ã‚’å¤‰æ›´','Done':'å®Œäº†'
  },
  ko: {
    'NOWPayments Crypto Deposit':'NOWPayments ì•”í˜¸í™”í ìž…ê¸ˆ','Instant deposit with zero platform fees':'í”Œëž«í¼ ìˆ˜ìˆ˜ë£Œ ì—†ëŠ” ì¦‰ì‹œ ìž…ê¸ˆ',
    'Deposit Amount (USD)':'ìž…ê¸ˆ ê¸ˆì•¡(USD)','Or enter custom USD amount':'ë˜ëŠ” ì‚¬ìš©ìž ì§€ì • USD ê¸ˆì•¡ ìž…ë ¥',
    'Minimum deposit':'ìµœì†Œ ìž…ê¸ˆ','Rate is checked live by NOWPayments when the payment is created.':'ê²°ì œ ìƒì„± ì‹œ NOWPaymentsê°€ í™˜ìœ¨ì„ ì‹¤ì‹œê°„ í™•ì¸í•©ë‹ˆë‹¤.',
    'Deposit is credited to your real account balance after payment confirmation.':'ê²°ì œ í™•ì¸ í›„ ìž…ê¸ˆì•¡ì´ ì‹¤ì œ ê³„ì • ìž”ì•¡ì— ë°˜ì˜ë©ë‹ˆë‹¤.',
    'Select Cryptocurrency':'ì•”í˜¸í™”í ì„ íƒ','Minimum Deposit':'ìµœì†Œ ìž…ê¸ˆ','Minimum deposit is':'ìµœì†Œ ìž…ê¸ˆì•¡ì€',
    'Error':'ì˜¤ë¥˜','Failed to generate invoice':'ì¸ë³´ì´ìŠ¤ ìƒì„± ì‹¤íŒ¨','Order ID: ':'ì£¼ë¬¸ ID: ','Awaiting Deposit':'ìž…ê¸ˆ ëŒ€ê¸°',
    'Deposit QR Code':'ìž…ê¸ˆ QR ì½”ë“œ','Send exactly to deposit address:':'ìž…ê¸ˆ ì£¼ì†Œë¡œ ì •í™•ížˆ ë³´ë‚´ì„¸ìš”:','Open NOWPayments Payment Page':'NOWPayments ê²°ì œ íŽ˜ì´ì§€ ì—´ê¸°',
    'Change Currency / Amount':'í†µí™” / ê¸ˆì•¡ ë³€ê²½','Done':'ì™„ë£Œ'
  },
  ar: {
    'NOWPayments Crypto Deposit':'إيداع العملات الرقمية عبر NOWPayments','Instant deposit with zero platform fees':'إيداع فوري بدون رسوم منصة',
    'Deposit Amount (USD)':'مبلغ الإيداع (USD)','Or enter custom USD amount':'أو أدخل مبلغ USD مخصصًا',
    'Minimum deposit':'الحد الأدنى للإيداع','Rate is checked live by NOWPayments when the payment is created.':'يتم التحقق من السعر مباشرة عبر NOWPayments عند إنشاء الدفع.',
    'Deposit is credited to your real account balance after payment confirmation.':'يُضاف الإيداع إلى رصيد حسابك الحقيقي بعد تأكيد الدفع.',
    'Select Cryptocurrency':'اختر العملة الرقمية','Minimum Deposit':'الحد الأدنى للإيداع','Minimum deposit is':'الحد الأدنى للإيداع هو',
    'Error':'خطأ','Failed to generate invoice':'فشل إنشاء الفاتورة','Order ID: ':'معرّف الطلب: ','Awaiting Deposit':'بانتظار الإيداع',
    'Deposit QR Code':'رمز QR للإيداع','Send exactly to deposit address:':'أرسل المبلغ إلى عنوان الإيداع بالضبط:','Open NOWPayments Payment Page':'فتح صفحة دفع NOWPayments',
    'Change Currency / Amount':'تغيير العملة / المبلغ','Done':'تم'
  }
};
for (const lang of Object.keys(DEPOSIT_UI_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], DEPOSIT_UI_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...DEPOSIT_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}



const FINAL_MISSING_PAGE_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Login':'Masuk','Register':'Daftar','We sent a verification link to ':'Kami mengirim tautan verifikasi ke ','You must verify it before you can log in.':'Anda harus memverifikasi email sebelum login.','Terms & Conditions':'Syarat & Ketentuan',
    'LOGIN / REGISTER':'MASUK / DAFTAR','Streamer Username Manager':'Pengelola Username Streamer','WIN':'MENANG','Close':'Tutup',
    'Earn Passive Crypto & Gold Coins':'Dapatkan Crypto & Gold Coins','Anyone registering with your link receives a free ':'Setiap orang yang mendaftar melalui link Anda menerima ',' starter bonus.':' bonus awal gratis.','Unclaimed Commission Balance':'Saldo Komisi Belum Diklaim',
    'Upload / Create':'Unggah / Buat','Live Room':'Live Room','Login Required':'Login Diperlukan','Loading...':'Memuat...'
  },
  en: {
    'Login':'Login','Register':'Register','We sent a verification link to ':'We sent a verification link to ','You must verify it before you can log in.':'You must verify it before you can log in.','Terms & Conditions':'Terms & Conditions',
    'LOGIN / REGISTER':'LOGIN / REGISTER','Streamer Username Manager':'Streamer Username Manager','WIN':'WIN','Close':'Close',
    'Earn Passive Crypto & Gold Coins':'Earn Passive Crypto & Gold Coins','Anyone registering with your link receives a free ':'Anyone registering with your link receives a free ',' starter bonus.':' starter bonus.','Unclaimed Commission Balance':'Unclaimed Commission Balance',
    'Upload / Create':'Upload / Create','Live Room':'Live Room','Login Required':'Login Required','Loading...':'Loading...'
  },
  es: {
    'Login':'Iniciar sesión','Register':'Registrarse','We sent a verification link to ':'Enviamos un enlace de verificación a ','You must verify it before you can log in.':'Debes verificarlo antes de iniciar sesión.','Terms & Conditions':'Términos y condiciones',
    'LOGIN / REGISTER':'INICIAR SESIÓN / REGISTRARSE','Streamer Username Manager':'Gestor de nombres de usuario del streamer','WIN':'GANAR','Close':'Cerrar',
    'Earn Passive Crypto & Gold Coins':'Gana criptomonedas y monedas de oro','Anyone registering with your link receives a free ':'Quien se registre con tu enlace recibe ',' starter bonus.':' de bonificación inicial gratis.','Unclaimed Commission Balance':'Saldo de comisiones no reclamado',
    'Upload / Create':'Subir / crear','Live Room':'Sala en vivo','Login Required':'Inicio de sesión requerido','Loading...':'Cargando...'
  },
  pt: {
    'Login':'Entrar','Register':'Registrar','We sent a verification link to ':'Enviamos um link de verificação para ','You must verify it before you can log in.':'Você precisa verificar antes de entrar.','Terms & Conditions':'Termos e condições',
    'LOGIN / REGISTER':'ENTRAR / REGISTRAR','Streamer Username Manager':'Gerenciador de nome do streamer','WIN':'VENCER','Close':'Fechar',
    'Earn Passive Crypto & Gold Coins':'Ganhe cripto e moedas de ouro','Anyone registering with your link receives a free ':'Quem se registrar pelo seu link recebe ',' starter bonus.':' de bônus inicial grátis.','Unclaimed Commission Balance':'Saldo de comissão não resgatado',
    'Upload / Create':'Enviar / criar','Live Room':'Sala ao vivo','Login Required':'Login necessário','Loading...':'Carregando...'
  },
  zh: {
    'Login':'ç™»å½•','Register':'æ³¨å†Œ','We sent a verification link to ':'æˆ‘ä»¬å·²å°†éªŒè¯é“¾æŽ¥å‘é€è‡³ ','You must verify it before you can log in.':'ç™»å½•å‰å¿…é¡»å®ŒæˆéªŒè¯ã€‚','Terms & Conditions':'æ¡æ¬¾ä¸Žæ¡ä»¶',
    'LOGIN / REGISTER':'ç™»å½• / æ³¨å†Œ','Streamer Username Manager':'ä¸»æ’­ç”¨æˆ·åç®¡ç†','WIN':'èŽ·èƒœ','Close':'å…³é—­',
    'Earn Passive Crypto & Gold Coins':'èµšå–åŠ å¯†è´§å¸å’Œé‡‘å¸','Anyone registering with your link receives a free ':'é€šè¿‡æ‚¨çš„é“¾æŽ¥æ³¨å†Œçš„ç”¨æˆ·å¯èŽ·å¾— ',' starter bonus.':' æ–°æ‰‹å¥–åŠ±ã€‚','Unclaimed Commission Balance':'æœªé¢†å–çš„ä½£é‡‘ä½™é¢',
    'Upload / Create':'ä¸Šä¼  / åˆ›å»º','Live Room':'ç›´æ’­é—´','Login Required':'éœ€è¦ç™»å½•','Loading...':'åŠ è½½ä¸­...'
  },
  ja: {
    'Login':'ãƒ­ã‚°ã‚¤ãƒ³','Register':'ç™»éŒ²','We sent a verification link to ':'ç¢ºèªãƒªãƒ³ã‚¯ã‚’é€ä¿¡ã—ã¾ã—ãŸï¼š','You must verify it before you can log in.':'ãƒ­ã‚°ã‚¤ãƒ³ã™ã‚‹å‰ã«ç¢ºèªãŒå¿…è¦ã§ã™ã€‚','Terms & Conditions':'åˆ©ç”¨è¦ç´„',
    'LOGIN / REGISTER':'ãƒ­ã‚°ã‚¤ãƒ³ / ç™»éŒ²','Streamer Username Manager':'ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ãƒ¦ãƒ¼ã‚¶ãƒ¼åç®¡ç†','WIN':'å‹åˆ©','Close':'é–‰ã˜ã‚‹',
    'Earn Passive Crypto & Gold Coins':'æš—å·è³‡ç”£ã¨ã‚´ãƒ¼ãƒ«ãƒ‰ã‚³ã‚¤ãƒ³ã‚’ç²å¾—','Anyone registering with your link receives a free ':'ã‚ãªãŸã®ãƒªãƒ³ã‚¯ã‹ã‚‰ç™»éŒ²ã—ãŸäººã«ã¯ç„¡æ–™ã® ',' starter bonus.':' ã‚¹ã‚¿ãƒ¼ã‚¿ãƒ¼ãƒœãƒ¼ãƒŠã‚¹ã€‚','Unclaimed Commission Balance':'æœªè«‹æ±‚ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³æ®‹é«˜',
    'Upload / Create':'ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰ / ä½œæˆ','Live Room':'ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ','Login Required':'ãƒ­ã‚°ã‚¤ãƒ³ãŒå¿…è¦ã§ã™','Loading...':'èª­ã¿è¾¼ã¿ä¸­...'
  },
  ko: {
    'Login':'ë¡œê·¸ì¸','Register':'ê°€ìž…','We sent a verification link to ':'ì¸ì¦ ë§í¬ë¥¼ ë³´ëƒˆìŠµë‹ˆë‹¤: ','You must verify it before you can log in.':'ë¡œê·¸ì¸í•˜ê¸° ì „ì— ì´ë©”ì¼ì„ ì¸ì¦í•´ì•¼ í•©ë‹ˆë‹¤.','Terms & Conditions':'ì´ìš©ì•½ê´€',
    'LOGIN / REGISTER':'ë¡œê·¸ì¸ / ê°€ìž…','Streamer Username Manager':'ìŠ¤íŠ¸ë¦¬ë¨¸ ì‚¬ìš©ìžëª… ê´€ë¦¬','WIN':'ìŠ¹ë¦¬','Close':'ë‹«ê¸°',
    'Earn Passive Crypto & Gold Coins':'ì•”í˜¸í™”í ë° ê³¨ë“œ ì½”ì¸ ìˆ˜ìµ','Anyone registering with your link receives a free ':'íšŒì›ê°€ìž…í•œ ì‚¬ìš©ìžëŠ” ë¬´ë£Œ ',' starter bonus.':' ì‹œìž‘ ë³´ë„ˆìŠ¤ë¥¼ ë°›ìŠµë‹ˆë‹¤.','Unclaimed Commission Balance':'ë¯¸ì²­êµ¬ ì»¤ë¯¸ì…˜ ìž”ì•¡',
    'Upload / Create':'ì—…ë¡œë“œ / ë§Œë“¤ê¸°','Live Room':'ë¼ì´ë¸Œ ë£¸','Login Required':'ë¡œê·¸ì¸ í•„ìš”','Loading...':'ë¡œë“œ ì¤‘...'
  },
  ar: {
    'Login':'تسجيل الدخول','Register':'إنشاء حساب','We sent a verification link to ':'أرسلنا رابط التحقق إلى ','You must verify it before you can log in.':'يجب التحقق قبل تسجيل الدخول.','Terms & Conditions':'الشروط والأحكام',
    'LOGIN / REGISTER':'تسجيل الدخول / التسجيل','Streamer Username Manager':'إدارة اسم مستخدم البث','WIN':'فوز','Close':'إغلاق',
    'Earn Passive Crypto & Gold Coins':'اكسب العملات الرقمية والعملات الذهبية','Anyone registering with your link receives a free ':'يحصل كل من يسجل عبر رابطك على ',' starter bonus.':' كمكافأة بداية مجانية.','Unclaimed Commission Balance':'رصيد العمولة غير المطالب به',
    'Upload / Create':'رفع / إنشاء','Live Room':'الغرفة المباشرة','Login Required':'تسجيل الدخول مطلوب','Loading...':'جارٍ التحميل...'
  }
};
for (const lang of Object.keys(FINAL_MISSING_PAGE_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], FINAL_MISSING_PAGE_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...FINAL_MISSING_PAGE_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}


const ADDITIONAL_UI_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Sign in to continue streaming and gaming':'Masuk untuk melanjutkan streaming dan bermain',
    'Username or Email':'Username atau Email','Connect Wallet':'Hubungkan Wallet','Forgot Password?':'Lupa Kata Sandi?',
    "Don't have an account?":"Belum punya akun?",'Register Now':'Daftar Sekarang','Secured with Web3':'Diamankan dengan Web3','Biometric Login Available':'Login biometrik tersedia',
    'CREATE ACCOUNT':'BUAT AKUN','LOGIN':'MASUK','or Connect with Crypto Wallet':'atau Hubungkan dengan Crypto Wallet',
    'EVM Wallet Recovery Phrase':'Frasa Pemulihan Wallet EVM','Wallet Address':'Alamat Wallet','Recovery Phrase':'Frasa Pemulihan',
    'Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'Wajib membaca dan menyetujui Syarat & Ketentuan sebelum membuat akun.',
    'I have read and agree to the':'Saya telah membaca dan menyetujui','Terms & Conditions':'Syarat & Ketentuan',
    'Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan frasa pemulihan ini.',
    'Simpan offline sebelum menutup halaman.':'Simpan secara offline sebelum menutup halaman.',
    'Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'Saya sudah menyimpan frasa pemulihan di tempat yang aman dan memahami bahwa frasa tersebut tidak dapat dipulihkan oleh SYS STREAM.',
    'Loading active tasks...':'Memuat tugas aktif...','Submitting...':'Mengirim...','Open Task':'Buka Tugas',
    'Task':'Tugas','Save Wallet':'Simpan Wallet','Proof link is required.':'Link bukti wajib diisi.','Submission failed':'Pengajuan gagal',
    'Login to continue':'Masuk untuk melanjutkan'
  },
  en: {
    'Sign in to continue streaming and gaming':'Sign in to continue streaming and gaming','Username or Email':'Username or Email','Connect Wallet':'Connect Wallet','Forgot Password?':'Forgot Password?',
    "Don't have an account?":"Don't have an account?",'Register Now':'Register Now','Secured with Web3':'Secured with Web3','Biometric Login Available':'Biometric Login Available',
    'CREATE ACCOUNT':'CREATE ACCOUNT','LOGIN':'LOGIN','or Connect with Crypto Wallet':'or Connect with Crypto Wallet','EVM Wallet Recovery Phrase':'EVM Wallet Recovery Phrase',
    'Wallet Address':'Wallet Address','Recovery Phrase':'Recovery Phrase','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'You must read and agree to the Terms & Conditions before creating an account.',
    'I have read and agree to the':'I have read and agree to the','Terms & Conditions':'Terms & Conditions',
    'Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'The wallet is created on your device. SYS STREAM does not receive or store this recovery phrase.',
    'Simpan offline sebelum menutup halaman.':'Save it offline before closing this page.',
    'Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'I have saved the recovery phrase in a safe place and understand that SYS STREAM cannot recover it.',
    'Loading active tasks...':'Loading active tasks...','Submitting...':'Submitting...','Open Task':'Open Task','Task':'Task','Save Wallet':'Save Wallet',
    'Proof link is required.':'Proof link is required.','Submission failed':'Submission failed','Login to continue':'Login to continue'
  },
  es: {
    'Sign in to continue streaming and gaming':'Inicia sesión para continuar con el streaming y los juegos','Username or Email':'Usuario o correo electrónico','Connect Wallet':'Conectar wallet','Forgot Password?':'¿Olvidaste la contraseña?',
    "Don't have an account?":"¿No tienes una cuenta?",'Register Now':'Registrarse ahora','Secured with Web3':'Protegido con Web3','Biometric Login Available':'Inicio de sesión biométrico disponible',
    'CREATE ACCOUNT':'CREAR CUENTA','LOGIN':'INICIAR SESIÓN','or Connect with Crypto Wallet':'o conectar con una wallet','EVM Wallet Recovery Phrase':'Frase de recuperación de la wallet EVM',
    'Wallet Address':'Dirección de wallet','Recovery Phrase':'Frase de recuperación','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'Debes leer y aceptar los Términos y condiciones antes de crear una cuenta.',
    'I have read and agree to the':'He leído y acepto los','Terms & Conditions':'Términos y condiciones','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'La wallet se crea en tu dispositivo. SYS STREAM no recibe ni almacena esta frase de recuperación.',
    'Simpan offline sebelum menutup halaman.':'Guárdala sin conexión antes de cerrar la página.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'He guardado la frase de recuperación en un lugar seguro y entiendo que SYS STREAM no puede recuperarla.',
    'Loading active tasks...':'Cargando tareas activas...','Submitting...':'Enviando...','Open Task':'Abrir tarea','Task':'Tarea','Save Wallet':'Guardar wallet','Proof link is required.':'El enlace de prueba es obligatorio.','Submission failed':'Error al enviar','Login to continue':'Inicia sesión para continuar'
  },
  pt: {
    'Sign in to continue streaming and gaming':'Entre para continuar no streaming e nos jogos','Username or Email':'Usuário ou e-mail','Connect Wallet':'Conectar carteira','Forgot Password?':'Esqueceu a senha?',
    "Don't have an account?":"Não tem uma conta?",'Register Now':'Registrar agora','Secured with Web3':'Protegido com Web3','Biometric Login Available':'Login biométrico disponível',
    'CREATE ACCOUNT':'CRIAR CONTA','LOGIN':'ENTRAR','or Connect with Crypto Wallet':'ou conectar carteira cripto','EVM Wallet Recovery Phrase':'Frase de recuperação da carteira EVM',
    'Wallet Address':'Endereço da carteira','Recovery Phrase':'Frase de recuperação','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'Você deve ler e aceitar os Termos e condições antes de criar uma conta.',
    'I have read and agree to the':'Li e concordo com os','Terms & Conditions':'Termos e condições','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'A carteira é criada no seu dispositivo. A SYS STREAM não recebe nem armazena esta frase de recuperação.',
    'Simpan offline sebelum menutup halaman.':'Guarde-a offline antes de fechar a página.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'Guardei a frase de recuperação em local seguro e entendo que a SYS STREAM não pode recuperá-la.',
    'Loading active tasks...':'Carregando tarefas ativas...','Submitting...':'Enviando...','Open Task':'Abrir tarefa','Task':'Tarefa','Save Wallet':'Salvar carteira','Proof link is required.':'O link de prova é obrigatório.','Submission failed':'Falha no envio','Login to continue':'Entre para continuar'
  },
  zh: {
    'Sign in to continue streaming and gaming':'ç™»å½•åŽç»§ç»­ç›´æ’­å’Œæ¸¸æˆ','Username or Email':'ç”¨æˆ·åæˆ–é‚®ç®±','Connect Wallet':'è¿žæŽ¥é’±åŒ…','Forgot Password?':'å¿˜è®°å¯†ç ï¼Ÿ',
    "Don't have an account?":"è¿˜æ²¡æœ‰è´¦æˆ·ï¼Ÿ",'Register Now':'ç«‹å³æ³¨å†Œ','Secured with Web3':'ç”± Web3 å®‰å…¨ä¿æŠ¤','Biometric Login Available':'æ”¯æŒç”Ÿç‰©è¯†åˆ«ç™»å½•',
    'CREATE ACCOUNT':'åˆ›å»ºè´¦æˆ·','LOGIN':'ç™»å½•','or Connect with Crypto Wallet':'æˆ–è¿žæŽ¥åŠ å¯†é’±åŒ…','EVM Wallet Recovery Phrase':'EVM é’±åŒ…æ¢å¤çŸ­è¯­',
    'Wallet Address':'é’±åŒ…åœ°å€','Recovery Phrase':'æ¢å¤çŸ­è¯­','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'åˆ›å»ºè´¦æˆ·å‰å¿…é¡»é˜…è¯»å¹¶åŒæ„æ¡æ¬¾ä¸Žæ¡ä»¶ã€‚',
    'I have read and agree to the':'æˆ‘å·²é˜…è¯»å¹¶åŒæ„','Terms & Conditions':'æ¡æ¬¾ä¸Žæ¡ä»¶','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'é’±åŒ…åœ¨æ‚¨çš„è®¾å¤‡ä¸Šåˆ›å»ºã€‚SYS STREAM ä¸ä¼šæŽ¥æ”¶æˆ–å­˜å‚¨æ­¤æ¢å¤çŸ­è¯­ã€‚',
    'Simpan offline sebelum menutup halaman.':'è¯·åœ¨å…³é—­é¡µé¢å‰ç¦»çº¿ä¿å­˜ã€‚','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'æˆ‘å·²å°†æ¢å¤çŸ­è¯­ä¿å­˜åœ¨å®‰å…¨ä½ç½®ï¼Œå¹¶äº†è§£ SYS STREAM æ— æ³•æ¢å¤è¯¥çŸ­è¯­ã€‚',
    'Loading active tasks...':'正在加载活动任务…','Submitting...':'正在提交…','Open Task':'æ‰“å¼€ä»»åŠ¡','Task':'ä»»åŠ¡','Save Wallet':'ä¿å­˜é’±åŒ…','Proof link is required.':'å¿…é¡»æä¾›è¯æ˜Žé“¾æŽ¥ã€‚','Submission failed':'æäº¤å¤±è´¥','Login to continue':'ç™»å½•åŽç»§ç»­'
  },
  ja: {
    'Sign in to continue streaming and gaming':'ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦é…ä¿¡ã¨ã‚²ãƒ¼ãƒ ã‚’ç¶šã‘ã‚‹','Username or Email':'ãƒ¦ãƒ¼ã‚¶ãƒ¼åã¾ãŸã¯ãƒ¡ãƒ¼ãƒ«','Connect Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š','Forgot Password?':'ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ã‚’å¿˜ã‚Œã¾ã—ãŸã‹ï¼Ÿ',
    "Don't have an account?":"ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ãŠæŒã¡ã§ã¯ã‚ã‚Šã¾ã›ã‚“ã‹ï¼Ÿ",'Register Now':'ä»Šã™ãç™»éŒ²','Secured with Web3':'Web3ã§ä¿è­·ã•ã‚Œã¦ã„ã¾ã™','Biometric Login Available':'ç”Ÿä½“èªè¨¼ãƒ­ã‚°ã‚¤ãƒ³å¯¾å¿œ',
    'CREATE ACCOUNT':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ä½œæˆ','LOGIN':'ãƒ­ã‚°ã‚¤ãƒ³','or Connect with Crypto Wallet':'ã¾ãŸã¯æš—å·è³‡ç”£ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š','EVM Wallet Recovery Phrase':'EVMã‚¦ã‚©ãƒ¬ãƒƒãƒˆã®ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚º',
    'Wallet Address':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹','Recovery Phrase':'ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚º','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆä½œæˆå‰ã«åˆ©ç”¨è¦ç´„ã‚’èª­ã¿ã€åŒæ„ã—ã¦ãã ã•ã„ã€‚',
    'I have read and agree to the':'ä»¥ä¸‹ã‚’èª­ã¿ã€åŒæ„ã—ã¾ã™ï¼š','Terms & Conditions':'åˆ©ç”¨è¦ç´„','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã¯ç«¯æœ«ä¸Šã§ä½œæˆã•ã‚Œã¾ã™ã€‚SYS STREAMã¯ã“ã®ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚ºã‚’å—ä¿¡ãƒ»ä¿å­˜ã—ã¾ã›ã‚“ã€‚',
    'Simpan offline sebelum menutup halaman.':'ãƒšãƒ¼ã‚¸ã‚’é–‰ã˜ã‚‹å‰ã«ã‚ªãƒ•ãƒ©ã‚¤ãƒ³ã§ä¿å­˜ã—ã¦ãã ã•ã„ã€‚','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚ºã‚’å®‰å…¨ãªå ´æ‰€ã«ä¿å­˜ã—ã€SYS STREAMã§ã¯å¾©å…ƒã§ããªã„ã“ã¨ã‚’ç†è§£ã—ã¾ã—ãŸã€‚',
    'Loading active tasks...':'アクティブなタスクを読み込み中…','Submitting...':'送信中…','Open Task':'ã‚¿ã‚¹ã‚¯ã‚’é–‹ã','Task':'ã‚¿ã‚¹ã‚¯','Save Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’ä¿å­˜','Proof link is required.':'è¨¼æ‹ ãƒªãƒ³ã‚¯ãŒå¿…è¦ã§ã™ã€‚','Submission failed':'é€ä¿¡ã«å¤±æ•—ã—ã¾ã—ãŸ','Login to continue':'ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦ç¶šè¡Œ'
  },
  ko: {
    'Sign in to continue streaming and gaming':'ë¡œê·¸ì¸í•˜ì—¬ ìŠ¤íŠ¸ë¦¬ë°ê³¼ ê²Œìž„ì„ ê³„ì†í•˜ì„¸ìš”','Username or Email':'ì‚¬ìš©ìž ì´ë¦„ ë˜ëŠ” ì´ë©”ì¼','Connect Wallet':'ì§€ê°‘ ì—°ê²°','Forgot Password?':'ë¹„ë°€ë²ˆí˜¸ë¥¼ ìžŠìœ¼ì…¨ë‚˜ìš”?',
    "Don't have an account?":"ê³„ì •ì´ ì—†ìœ¼ì‹ ê°€ìš”?",'Register Now':'ì§€ê¸ˆ ê°€ìž…','Secured with Web3':'Web3ë¡œ ë³´ì•ˆë¨','Biometric Login Available':'ìƒì²´ ì¸ì¦ ë¡œê·¸ì¸ ì§€ì›',
    'CREATE ACCOUNT':'ê³„ì • ë§Œë“¤ê¸°','LOGIN':'ë¡œê·¸ì¸','or Connect with Crypto Wallet':'ë˜ëŠ” ì•”í˜¸í™”í ì§€ê°‘ ì—°ê²°','EVM Wallet Recovery Phrase':'EVM ì§€ê°‘ ë³µêµ¬ ë¬¸êµ¬',
    'Wallet Address':'ì§€ê°‘ ì£¼ì†Œ','Recovery Phrase':'ë³µêµ¬ ë¬¸êµ¬','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'ê³„ì •ì„ ë§Œë“¤ê¸° ì „ì— ì´ìš©ì•½ê´€ì„ ì½ê³  ë™ì˜í•´ì•¼ í•©ë‹ˆë‹¤.',
    'I have read and agree to the':'ë‹¤ìŒì„ ì½ê³  ë™ì˜í•©ë‹ˆë‹¤:','Terms & Conditions':'ì´ìš©ì•½ê´€','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'ì§€ê°‘ì€ ê¸°ê¸°ì—ì„œ ìƒì„±ë©ë‹ˆë‹¤. SYS STREAMì€ ì´ ë³µêµ¬ ë¬¸êµ¬ë¥¼ ë°›ê±°ë‚˜ ì €ìž¥í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤.',
    'Simpan offline sebelum menutup halaman.':'íŽ˜ì´ì§€ë¥¼ ë‹«ê¸° ì „ì— ì˜¤í”„ë¼ì¸ìœ¼ë¡œ ì•ˆì „í•˜ê²Œ ì €ìž¥í•˜ì„¸ìš”.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'ë³µêµ¬ ë¬¸êµ¬ë¥¼ ì•ˆì „í•œ ê³³ì— ì €ìž¥í–ˆìœ¼ë©° SYS STREAMì—ì„œ ë³µêµ¬í•  ìˆ˜ ì—†ìŒì„ ì´í•´í•©ë‹ˆë‹¤.',
    'Loading active tasks...':'í™œì„± ìž‘ì—…ì„ ë¶ˆëŸ¬ì˜¤ëŠ” ì¤‘...','Submitting...':'ì œì¶œ ì¤‘...','Open Task':'ìž‘ì—… ì—´ê¸°','Task':'ìž‘ì—…','Save Wallet':'ì§€ê°‘ ì €ìž¥','Proof link is required.':'ì¦ë¹™ ë§í¬ê°€ í•„ìš”í•©ë‹ˆë‹¤.','Submission failed':'ì œì¶œ ì‹¤íŒ¨','Login to continue':'ë¡œê·¸ì¸í•˜ì—¬ ê³„ì†'
  },
  ar: {
    'Sign in to continue streaming and gaming':'سجّل الدخول لمتابعة البث والألعاب','Username or Email':'اسم المستخدم أو البريد الإلكتروني','Connect Wallet':'ربط المحفظة','Forgot Password?':'هل نسيت كلمة المرور؟',
    "Don't have an account?":"ليس لديك حساب؟",'Register Now':'سجّل الآن','Secured with Web3':'محمي بواسطة Web3','Biometric Login Available':'تسجيل الدخول البيومتري متاح',
    'CREATE ACCOUNT':'إنشاء حساب','LOGIN':'تسجيل الدخول','or Connect with Crypto Wallet':'أو ربط محفظة العملات الرقمية','EVM Wallet Recovery Phrase':'عبارة استرداد محفظة EVM',
    'Wallet Address':'عنوان المحفظة','Recovery Phrase':'عبارة الاسترداد','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'يجب قراءة الشروط والأحكام والموافقة عليها قبل إنشاء الحساب.',
    'I have read and agree to the':'لقد قرأت وأوافق على','Terms & Conditions':'الشروط والأحكام','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'يتم إنشاء المحفظة على جهازك. لا تستقبل SYS STREAM عبارة الاسترداد هذه ولا تخزنها.',
    'Simpan offline sebelum menutup halaman.':'احفظها دون اتصال قبل إغلاق الصفحة.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'لقد حفظت عبارة الاسترداد في مكان آمن وأفهم أن SYS STREAM لا يمكنه استعادتها.',
    'Loading active tasks...':'جارٍ تحميل المهام النشطة...','Submitting...':'جارٍ الإرسال...','Open Task':'فتح المهمة','Task':'مهمة','Save Wallet':'حفظ المحفظة','Proof link is required.':'رابط الإثبات مطلوب.','Submission failed':'فشل الإرسال','Login to continue':'سجّل الدخول للمتابعة'
  }
};

for (const lang of Object.keys(ADDITIONAL_UI_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], ADDITIONAL_UI_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...ADDITIONAL_UI_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}


const AUTH_EXTRA_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
 id:{'Initializing TikTok Live Sync + Cloudflare D1 Connection':'Menginisialisasi Sinkronisasi TikTok Live + Koneksi Cloudflare D1','RESEND VERIFICATION EMAIL':'KIRIM ULANG EMAIL VERIFIKASI','SENDING...':'MENGIRIM...','We sent a verification link to':'Kami mengirim tautan verifikasi ke','You must verify it before you can log in.':'Anda harus memverifikasi email sebelum dapat masuk.','and understand that my acceptance will be recorded with the current Terms version.':'dan memahami bahwa persetujuan saya dicatat dengan versi Syarat & Ketentuan saat ini.'},
 en:{'Initializing TikTok Live Sync + Cloudflare D1 Connection':'Initializing TikTok Live Sync + Cloudflare D1 Connection','RESEND VERIFICATION EMAIL':'RESEND VERIFICATION EMAIL','SENDING...':'SENDING...','We sent a verification link to':'We sent a verification link to','You must verify it before you can log in.':'You must verify it before you can log in.','and understand that my acceptance will be recorded with the current Terms version.':'and understand that my acceptance will be recorded with the current Terms version.'},
 es:{'Initializing TikTok Live Sync + Cloudflare D1 Connection':'Inicializando la sincronización de TikTok Live + conexión de Cloudflare D1','RESEND VERIFICATION EMAIL':'REENVIAR EMAIL DE VERIFICACIÓN','SENDING...':'ENVIANDO...','We sent a verification link to':'Enviamos un enlace de verificación a','You must verify it before de iniciar sesiÃ³n.':'Debes verificarlo antes de iniciar sesión.','You must verify it before you can log in.':'Debes verificarlo antes de iniciar sesión.','and understand that my acceptance will be recorded with the current Terms version.':'y entiendo que mi aceptación se registrará con la versión actual de los Términos.'},
 pt:{'Initializing TikTok Live Sync + Cloudflare D1 Connection':'Inicializando a sincronização do TikTok Live + conexão do Cloudflare D1','RESEND VERIFICATION EMAIL':'REENVIAR E-MAIL DE VERIFICAÇÃO','SENDING...':'ENVIANDO...','We sent a verification link to':'Enviamos um link de verificação para','You must verify it before you can log in.':'Você precisa verificá-lo antes de entrar.','and understand that my acceptance will be recorded with the current Terms version.':'e entendo que minha aceitação será registrada com a versão atual dos Termos.'},
 zh:{'Initializing TikTok Live Sync + Cloudflare D1 Connection':'æ­£åœ¨åˆå§‹åŒ– TikTok Live åŒæ­¥ + Cloudflare D1 è¿žæŽ¥','RESEND VERIFICATION EMAIL':'é‡æ–°å‘é€éªŒè¯é‚®ä»¶','SENDING...':'å‘é€ä¸­...','We sent a verification link to':'æˆ‘ä»¬å·²å‘é€éªŒè¯é“¾æŽ¥è‡³','You must verify it before you can log in.':'ç™»å½•å‰å¿…é¡»å®ŒæˆéªŒè¯ã€‚','and understand that my acceptance will be recorded with the current Terms version.':'å¹¶äº†è§£æˆ‘çš„åŒæ„å°†è®°å½•åœ¨å½“å‰æ¡æ¬¾ç‰ˆæœ¬ä¸­ã€‚'},
 ja:{'Initializing TikTok Live Sync + Cloudflare D1 Connection':'TikTok LiveåŒæœŸ + Cloudflare D1æŽ¥ç¶šã‚’åˆæœŸåŒ–ã—ã¦ã„ã¾ã™','RESEND VERIFICATION EMAIL':'ç¢ºèªãƒ¡ãƒ¼ãƒ«ã‚’å†é€ä¿¡','SENDING...':'é€ä¿¡ä¸­...','We sent a verification link to':'ç¢ºèªãƒªãƒ³ã‚¯ã‚’é€ä¿¡ã—ã¾ã—ãŸï¼š','You must verify it before you can log in.':'ãƒ­ã‚°ã‚¤ãƒ³ã™ã‚‹å‰ã«ç¢ºèªã—ã¦ãã ã•ã„ã€‚','and understand that my acceptance will be recorded with the current Terms version.':'åŒæ„å†…å®¹ãŒç¾åœ¨ã®åˆ©ç”¨è¦ç´„ãƒãƒ¼ã‚¸ãƒ§ãƒ³ã«è¨˜éŒ²ã•ã‚Œã‚‹ã“ã¨ã‚’ç†è§£ã—ã¾ã™ã€‚'},
 ko:{'Initializing TikTok Live Sync + Cloudflare D1 Connection':'TikTok Live ë™ê¸°í™” + Cloudflare D1 ì—°ê²° ì´ˆê¸°í™” ì¤‘','RESEND VERIFICATION EMAIL':'ì¸ì¦ ì´ë©”ì¼ ë‹¤ì‹œ ë³´ë‚´ê¸°','SENDING...':'ì „ì†¡ ì¤‘...','We sent a verification link to':'ì¸ì¦ ë§í¬ë¥¼ ë‹¤ìŒ ì£¼ì†Œë¡œ ë³´ëƒˆìŠµë‹ˆë‹¤:','You must verify it before you can log in.':'ë¡œê·¸ì¸í•˜ê¸° ì „ì— ì´ë©”ì¼ì„ ì¸ì¦í•´ì•¼ í•©ë‹ˆë‹¤.','and understand that my acceptance will be recorded with the current Terms version.':'ë™ì˜ ë‚´ìš©ì´ í˜„ìž¬ ì´ìš©ì•½ê´€ ë²„ì „ì— ê¸°ë¡ë¨ì„ ì´í•´í•©ë‹ˆë‹¤.'},
 ar:{'Initializing TikTok Live Sync + Cloudflare D1 Connection':'جارٍ تهيئة مزامنة TikTok Live + اتصال Cloudflare D1','RESEND VERIFICATION EMAIL':'إعادة إرسال بريد التحقق','SENDING...':'جارٍ الإرسال...','We sent a verification link to':'أرسلنا رابط التحقق إلى','You must verify it before you can log in.':'يجب التحقق قبل تسجيل الدخول.','and understand that my acceptance will be recorded with the current Terms version.':'وأفهم أن موافقتي ستُسجل مع إصدار الشروط الحالي.'}
};
for (const lang of Object.keys(AUTH_EXTRA_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], AUTH_EXTRA_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...AUTH_EXTRA_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const GAME_EXTRA_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
 id:{'USDT wallet address':'Alamat wallet USDT','Photo too large':'Foto terlalu besar','Maximum profile photo size is 5 MB.':'Ukuran foto profil maksimal 5 MB.','Incomplete Prediction':'Prediksi belum lengkap','Please enter a digit for Slot':'Masukkan angka untuk Slot','Card Cracked!':'Kartu berhasil dipecahkan!','All concealed digits matched!':'Semua angka tersembunyi cocok!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.','Guess Missed':'Tebakan tidak cocok','Matched digits. Try another prediction!':'Angka cocok. Coba prediksi lain!'},
 en:{'USDT wallet address':'USDT wallet address','Photo too large':'Photo too large','Maximum profile photo size is 5 MB.':'Maximum profile photo size is 5 MB.','Incomplete Prediction':'Incomplete Prediction','Please enter a digit for Slot':'Please enter a digit for Slot','Card Cracked!':'Card Cracked!','All concealed digits matched!':'All concealed digits matched!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'Challenge successful. No balance was deducted or paid.','Guess Missed':'Guess Missed','Matched digits. Try another prediction!':'Matched digits. Try another prediction!'},
 es:{'USDT wallet address':'Dirección de wallet USDT','Photo too large':'Foto demasiado grande','Maximum profile photo size is 5 MB.':'El tamaño máximo de la foto es de 5 MB.','Incomplete Prediction':'Predicción incompleta','Please enter a digit for Slot':'Introduce un dígito para el espacio','Card Cracked!':'¡Tarjeta descifrada!','All concealed digits matched!':'¡Todos los dígitos ocultos coinciden!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'Desafío completado. No se descontó ni pagó saldo.','Guess Missed':'Adivinanza fallida','Matched digits. Try another prediction!':'Dígitos coincidentes. ¡Prueba otra predicción!'},
 pt:{'USDT wallet address':'Endereço da carteira USDT','Photo too large':'Foto muito grande','Maximum profile photo size is 5 MB.':'O tamanho máximo da foto é 5 MB.','Incomplete Prediction':'Previsão incompleta','Please enter a digit for Slot':'Digite um dígito para o slot','Card Cracked!':'Cartão decifrado!','All concealed digits matched!':'Todos os dígitos ocultos coincidem!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'Desafio concluído. Nenhum saldo foi descontado ou pago.','Guess Missed':'Palpite não corresponde','Matched digits. Try another prediction!':'Dígitos correspondentes. Tente outra previsão!'},
 zh:{'USDT wallet address':'USDT é’±åŒ…åœ°å€','Photo too large':'ç…§ç‰‡è¿‡å¤§','Maximum profile photo size is 5 MB.':'å¤´åƒç…§ç‰‡æœ€å¤§ä¸º 5 MBã€‚','Incomplete Prediction':'é¢„æµ‹ä¸å®Œæ•´','Please enter a digit for Slot':'è¯·ä¸ºæ§½ä½è¾“å…¥ä¸€ä¸ªæ•°å­—','Card Cracked!':'å¡ç‰‡ç ´è§£æˆåŠŸï¼','All concealed digits matched!':'æ‰€æœ‰éšè—æ•°å­—éƒ½åŒ¹é…ï¼','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'æŒ‘æˆ˜æˆåŠŸã€‚æœªæ‰£é™¤æˆ–æ”¯ä»˜ä½™é¢ã€‚','Guess Missed':'çŒœæµ‹æœªå‘½ä¸­','Matched digits. Try another prediction!':'åŒ¹é…äº†æ•°å­—ã€‚è¯·å°è¯•å…¶ä»–é¢„æµ‹ï¼'},
 ja:{'USDT wallet address':'USDTã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹','Photo too large':'å†™çœŸãŒå¤§ãã™ãŽã¾ã™','Maximum profile photo size is 5 MB.':'ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«å†™çœŸã¯æœ€å¤§5MBã§ã™ã€‚','Incomplete Prediction':'äºˆæ¸¬ãŒæœªå®Œæˆã§ã™','Please enter a digit for Slot':'ã‚¹ãƒ­ãƒƒãƒˆã«æ•°å­—ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„','Card Cracked!':'ã‚«ãƒ¼ãƒ‰è§£é™¤æˆåŠŸï¼','All concealed digits matched!':'ã™ã¹ã¦ã®éš ã—æ•°å­—ãŒä¸€è‡´ã—ã¾ã—ãŸï¼','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'ãƒãƒ£ãƒ¬ãƒ³ã‚¸æˆåŠŸã€‚æ®‹é«˜ã®å¼•ãè½ã¨ã—ã‚„æ”¯æ‰•ã„ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚','Guess Missed':'äºˆæ¸¬ä¸ä¸€è‡´','Matched digits. Try another prediction!':'ä¸€è‡´ã—ãŸæ•°å­—ãŒã‚ã‚Šã¾ã™ã€‚åˆ¥ã®äºˆæ¸¬ã‚’è©¦ã—ã¦ãã ã•ã„ï¼'},
 ko:{'USDT wallet address':'USDT ì§€ê°‘ ì£¼ì†Œ','Photo too large':'ì‚¬ì§„ì´ ë„ˆë¬´ í½ë‹ˆë‹¤','Maximum profile photo size is 5 MB.':'í”„ë¡œí•„ ì‚¬ì§„ì€ ìµœëŒ€ 5MBìž…ë‹ˆë‹¤.','Incomplete Prediction':'ì˜ˆì¸¡ì´ ì™„ë£Œë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤','Please enter a digit for Slot':'ìŠ¬ë¡¯ì— ìˆ«ìžë¥¼ ìž…ë ¥í•˜ì„¸ìš”','Card Cracked!':'ì¹´ë“œ í•´ë… ì„±ê³µ!','All concealed digits matched!':'ìˆ¨ê²¨ì§„ ìˆ«ìžê°€ ëª¨ë‘ ì¼ì¹˜í–ˆìŠµë‹ˆë‹¤!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'ì±Œë¦°ì§€ ì„±ê³µ. ìž”ì•¡ì´ ì°¨ê°ë˜ê±°ë‚˜ ì§€ê¸‰ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤.','Guess Missed':'ì˜ˆì¸¡ ì‹¤íŒ¨','Matched digits. Try another prediction!':'ì¼ì¹˜í•˜ëŠ” ìˆ«ìžê°€ ìžˆìŠµë‹ˆë‹¤. ë‹¤ë¥¸ ì˜ˆì¸¡ì„ ì‹œë„í•˜ì„¸ìš”!'},
 ar:{'USDT wallet address':'عنوان محفظة USDT','Photo too large':'الصورة كبيرة جدًا','Maximum profile photo size is 5 MB.':'الحد الأقصى لصورة الملف الشخصي 5 ميجابايت.','Incomplete Prediction':'التوقع غير مكتمل','Please enter a digit for Slot':'أدخل رقمًا للخانة','Card Cracked!':'تم حل البطاقة!','All concealed digits matched!':'تطابقت جميع الأرقام المخفية!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'نجح التحدي. لم يتم خصم أو دفع أي رصيد.','Guess Missed':'التخمين غير مطابق','Matched digits. Try another prediction!':'الأرقام المتطابقة. جرّب توقعًا آخر!'}
};
for (const lang of Object.keys(GAME_EXTRA_TRANSLATIONS) as LanguageCode[]) {
 Object.assign(translations[lang], GAME_EXTRA_TRANSLATIONS[lang]);
 PAGE_UI_TRANSLATIONS[lang] = { ...GAME_EXTRA_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const FINAL_GAME_LABELS: Record<LanguageCode, Record<string,string>> = {
 id:{'Vault Updated':'Vault diperbarui','Added to your Inventory!':'ditambahkan ke Inventori Anda!','Lock amount':'Jumlah lock','Quota:':'Kuota:','Lock':'Lock','Enter viewer username (e.g. TikTok_User)':'Masukkan username penonton (contoh: TikTok_User)','Close':'Tutup'},
 en:{'Vault Updated':'Vault Updated','Added to your Inventory!':'added to your Inventory!','Lock amount':'Lock amount','Quota:':'Quota:','Lock':'Lock','Enter viewer username (e.g. TikTok_User)':'Enter viewer username (e.g. TikTok_User)','Close':'Close'},
 es:{'Vault Updated':'Bóveda actualizada','Added to your Inventory!':'añadido a tu inventario','Lock amount':'Cantidad de bloqueo','Quota:':'Cuota:','Lock':'Bloquear','Enter viewer username (e.g. TikTok_User)':'Introduce el nombre del espectador (ej.: TikTok_User)','Close':'Cerrar'},
 pt:{'Vault Updated':'Cofre atualizado','Added to your Inventory!':'adicionado ao seu inventário','Lock amount':'Valor do bloqueio','Quota:':'Cota:','Lock':'Bloquear','Enter viewer username (e.g. TikTok_User)':'Digite o nome do espectador (ex.: TikTok_User)','Close':'Fechar'},
 zh:{'Vault Updated':'ä¿é™©åº“å·²æ›´æ–°','Added to your Inventory!':'å·²æ·»åŠ åˆ°æ‚¨çš„åº“å­˜ï¼','Lock amount':'é”å®šé‡‘é¢','Quota:':'é…é¢ï¼š','Lock':'é”å®š','Enter viewer username (e.g. TikTok_User)':'è¾“å…¥è§‚ä¼—ç”¨æˆ·åï¼ˆä¾‹å¦‚ï¼šTikTok_Userï¼‰','Close':'å…³é—­'},
 ja:{'Vault Updated':'Vaultã‚’æ›´æ–°ã—ã¾ã—ãŸ','Added to your Inventory!':'ã‚¤ãƒ³ãƒ™ãƒ³ãƒˆãƒªã«è¿½åŠ ã—ã¾ã—ãŸï¼','Lock amount':'ãƒ­ãƒƒã‚¯é‡‘é¡','Quota:':'ã‚¯ã‚©ãƒ¼ã‚¿ï¼š','Lock':'ãƒ­ãƒƒã‚¯','Enter viewer username (e.g. TikTok_User)':'è¦–è´è€…ãƒ¦ãƒ¼ã‚¶ãƒ¼åã‚’å…¥åŠ›ï¼ˆä¾‹ï¼šTikTok_Userï¼‰','Close':'é–‰ã˜ã‚‹'},
 ko:{'Vault Updated':'Vault ì—…ë°ì´íŠ¸ë¨','Added to your Inventory!':'ì¸ë²¤í† ë¦¬ì— ì¶”ê°€ë˜ì—ˆìŠµë‹ˆë‹¤!','Lock amount':'ìž ê¸ˆ ê¸ˆì•¡','Quota:':'í• ë‹¹ëŸ‰:','Lock':'ìž ê¸ˆ','Enter viewer username (e.g. TikTok_User)':'ì‹œì²­ìž ì‚¬ìš©ìžëª…ì„ ìž…ë ¥í•˜ì„¸ìš” (ì˜ˆ: TikTok_User)','Close':'ë‹«ê¸°'},
 ar:{'Vault Updated':'تم تحديث الخزنة','Added to your Inventory!':'تمت الإضافة إلى مخزونك!','Lock amount':'مبلغ القفل','Quota:':'الحصة:','Lock':'قفل','Enter viewer username (e.g. TikTok_User)':'أدخل اسم مستخدم المشاهد (مثال: TikTok_User)','Close':'إغلاق'}
};
for(const lang of Object.keys(FINAL_GAME_LABELS) as LanguageCode[]){Object.assign(translations[lang],FINAL_GAME_LABELS[lang]);PAGE_UI_TRANSLATIONS[lang]={...FINAL_GAME_LABELS[lang],...PAGE_UI_TRANSLATIONS[lang]};}

const DASHBOARD_FINAL_UI: Record<LanguageCode, Record<string,string>> = {
 id:{'Upload / Create':'Upload / Buat','Claim Bonus':'Klaim Bonus','Buka media terlampir â†’':'Buka media terlampir â†’','Buka Live Room':'Buka Live Room','User ID:':'ID Pengguna:','Wallet belum terhubung':'Wallet belum terhubung'},
 en:{'Upload / Create':'Upload / Create','Claim Bonus':'Claim Bonus','Buka media terlampir â†’':'Open attached media â†’','Buka Live Room':'Open Live Room','User ID:':'User ID:','Wallet belum terhubung':'Wallet not connected'},
 es:{'Upload / Create':'Subir / Crear','Claim Bonus':'Reclamar bono','Buka media terlampir â†’':'Abrir medio adjunto â†’','Buka Live Room':'Abrir sala en vivo','User ID:':'ID de usuario:','Wallet belum terhubung':'Wallet no conectado'},
 pt:{'Upload / Create':'Carregar / Criar','Claim Bonus':'Resgatar bônus','Buka media terlampir â†’':'Abrir mídia anexada →','Buka Live Room':'Abrir sala ao vivo','User ID:':'ID do usuário:','Wallet belum terhubung':'Carteira não conectada'},
 zh:{'Upload / Create':'ä¸Šä¼  / åˆ›å»º','Claim Bonus':'é¢†å–å¥–åŠ±','Buka media terlampir â†’':'æ‰“å¼€é™„ä»¶åª’ä½“ â†’','Buka Live Room':'æ‰“å¼€ç›´æ’­é—´','User ID:':'ç”¨æˆ· IDï¼š','Wallet belum terhubung':'é’±åŒ…æœªè¿žæŽ¥'},
 ja:{'Upload / Create':'ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰ / ä½œæˆ','Claim Bonus':'ãƒœãƒ¼ãƒŠã‚¹ã‚’å—ã‘å–ã‚‹','Buka media terlampir â†’':'æ·»ä»˜ãƒ¡ãƒ‡ã‚£ã‚¢ã‚’é–‹ã â†’','Buka Live Room':'ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ã‚’é–‹ã','User ID:':'ãƒ¦ãƒ¼ã‚¶ãƒ¼IDï¼š','Wallet belum terhubung':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆæœªæŽ¥ç¶š'},
 ko:{'Upload / Create':'ì—…ë¡œë“œ / ë§Œë“¤ê¸°','Claim Bonus':'ë³´ë„ˆìŠ¤ ë°›ê¸°','Buka media terlampir â†’':'ì²¨ë¶€ ë¯¸ë””ì–´ ì—´ê¸° â†’','Buka Live Room':'ë¼ì´ë¸Œ ë£¸ ì—´ê¸°','User ID:':'ì‚¬ìš©ìž ID:','Wallet belum terhubung':'ì§€ê°‘ì´ ì—°ê²°ë˜ì§€ ì•ŠìŒ'},
 ar:{'Upload / Create':'رفع / إنشاء','Claim Bonus':'المطالبة بالمكافأة','Buka media terlampir â†’':'فتح الوسائط المرفقة →','Buka Live Room':'فتح الغرفة المباشرة','User ID:':'معرف المستخدم:','Wallet belum terhubung':'المحفظة غير متصلة'}
};
for(const lang of Object.keys(DASHBOARD_FINAL_UI) as LanguageCode[])Object.assign(translations[lang],DASHBOARD_FINAL_UI[lang]);
const EXTRA_GAME_UI: Record<LanguageCode, Record<string,string>> = {
 id:{'Remove':'Hapus','Added to your Inventory!':'Ditambahkan ke Inventaris!'},
 en:{'Remove':'Remove','Added to your Inventory!':'Added to your Inventory!'},
 es:{'Remove':'Eliminar','Added to your Inventory!':'¡Añadido a tu inventario!'},
 pt:{'Remove':'Remover','Added to your Inventory!':'Adicionado ao seu inventário!'},
 zh:{'Remove':'ç§»é™¤','Added to your Inventory!':'å·²æ·»åŠ åˆ°æ‚¨çš„åº“å­˜ï¼'},
 ja:{'Remove':'å‰Šé™¤','Added to your Inventory!':'ã‚¤ãƒ³ãƒ™ãƒ³ãƒˆãƒªã«è¿½åŠ ã—ã¾ã—ãŸï¼'},
 ko:{'Remove':'ì‚­ì œ','Added to your Inventory!':'ì¸ë²¤í† ë¦¬ì— ì¶”ê°€ë˜ì—ˆìŠµë‹ˆë‹¤!'},
 ar:{'Remove':'إزالة','Added to your Inventory!':'تمت الإضافة إلى مخزونك!'}
};
for(const lang of Object.keys(EXTRA_GAME_UI) as LanguageCode[])Object.assign(translations[lang],EXTRA_GAME_UI[lang]);
const FINAL_HARDCODED_UI: Record<LanguageCode, Record<string,string>> = {
 id:{'Close':'Tutup','Lock Amount':'Jumlah Lock','Quota:':'Kuota:','Durasi Lock':'Durasi Lock','Lock Aktif':'Lock Aktif','Notifications':'Notifikasi','Edit avatar':'Edit avatar','Submit':'Kirim','Wallet':'Wallet','Minimum withdrawal is':'Minimum penarikan adalah'},
 en:{'Close':'Close','Lock Amount':'Lock Amount','Quota:':'Quota:','Durasi Lock':'Lock Duration','Lock Aktif':'Lock Active','Notifications':'Notifications','Edit avatar':'Edit avatar','Submit':'Submit','Wallet':'Wallet','Minimum withdrawal is':'Minimum withdrawal is'},
 es:{'Close':'Cerrar','Lock Amount':'Monto de bloqueo','Quota:':'Cuota:','Durasi Lock':'Duración del bloqueo','Lock Aktif':'Bloqueo activo','Notifications':'Notificaciones','Edit avatar':'Editar avatar','Submit':'Enviar','Wallet':'Billetera','Minimum withdrawal is':'El retiro mínimo es'},
 pt:{'Close':'Fechar','Lock Amount':'Valor do bloqueio','Quota:':'Cota:','Durasi Lock':'Duração do bloqueio','Lock Aktif':'Bloqueio ativo','Notifications':'Notificações','Edit avatar':'Editar avatar','Submit':'Enviar','Wallet':'Carteira','Minimum withdrawal is':'O saque mínimo é'},
 zh:{'Close':'å…³é—­','Lock Amount':'é”å®šé‡‘é¢','Quota:':'é¢åº¦ï¼š','Durasi Lock':'é”å®šæ—¶é•¿','Lock Aktif':'é”å®šå·²å¯ç”¨','Notifications':'é€šçŸ¥','Edit avatar':'ç¼–è¾‘å¤´åƒ','Submit':'æäº¤','Wallet':'é’±åŒ…','Minimum withdrawal is':'æœ€ä½ŽæçŽ°é‡‘é¢ä¸º'},
 ja:{'Close':'é–‰ã˜ã‚‹','Lock Amount':'ãƒ­ãƒƒã‚¯é¡','Quota:':'ä¸Šé™ï¼š','Durasi Lock':'ãƒ­ãƒƒã‚¯æœŸé–“','Lock Aktif':'ãƒ­ãƒƒã‚¯æœ‰åŠ¹','Notifications':'é€šçŸ¥','Edit avatar':'ã‚¢ãƒã‚¿ãƒ¼ã‚’ç·¨é›†','Submit':'é€ä¿¡','Wallet':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆ','Minimum withdrawal is':'æœ€ä½Žå‡ºé‡‘é¡ã¯'},
 ko:{'Close':'ë‹«ê¸°','Lock Amount':'ìž ê¸ˆ ê¸ˆì•¡','Quota:':'í•œë„:','Durasi Lock':'ìž ê¸ˆ ê¸°ê°„','Lock Aktif':'ìž ê¸ˆ í™œì„±','Notifications':'ì•Œë¦¼','Edit avatar':'ì•„ë°”íƒ€ íŽ¸ì§‘','Submit':'ì œì¶œ','Wallet':'ì§€ê°‘','Minimum withdrawal is':'ìµœì†Œ ì¶œê¸ˆì•¡ì€'},
 ar:{'Close':'إغلاق','Lock Amount':'مبلغ القفل','Quota:':'الحصة:','Durasi Lock':'مدة القفل','Lock Aktif':'القفل نشط','Notifications':'الإشعارات','Edit avatar':'تعديل الصورة','Submit':'إرسال','Wallet':'المحفظة','Minimum withdrawal is':'الحد الأدنى للسحب هو'}
};
for(const lang of Object.keys(FINAL_HARDCODED_UI) as LanguageCode[])Object.assign(translations[lang],FINAL_HARDCODED_UI[lang]);
const AIRDROP_STATUS_LABELS: Record<LanguageCode, Record<string,string>> = {
 id:{'Task':'Tugas','Open Task':'Buka Tugas','Pending':'Menunggu','Approved':'Disetujui','Rejected':'Ditolak','Paid':'Dibayar'},
 en:{'Task':'Task','Open Task':'Open Task','Pending':'Pending','Approved':'Approved','Rejected':'Rejected','Paid':'Paid'},
 es:{'Task':'Tarea','Open Task':'Abrir tarea','Pending':'Pendiente','Approved':'Aprobado','Rejected':'Rechazado','Paid':'Pagado'},
 pt:{'Task':'Tarefa','Open Task':'Abrir tarefa','Pending':'Pendente','Approved':'Aprovado','Rejected':'Rejeitado','Paid':'Pago'},
 zh:{'Task':'ä»»åŠ¡','Open Task':'æ‰“å¼€ä»»åŠ¡','Pending':'å¾…å®¡æ ¸','Approved':'å·²é€šè¿‡','Rejected':'å·²æ‹’ç»','Paid':'å·²æ”¯ä»˜'},
 ja:{'Task':'ã‚¿ã‚¹ã‚¯','Open Task':'ã‚¿ã‚¹ã‚¯ã‚’é–‹ã','Pending':'å¯©æŸ»å¾…ã¡','Approved':'æ‰¿èªæ¸ˆã¿','Rejected':'å´ä¸‹','Paid':'æ”¯æ‰•ã„æ¸ˆã¿'},
 ko:{'Task':'ìž‘ì—…','Open Task':'ìž‘ì—… ì—´ê¸°','Pending':'ëŒ€ê¸° ì¤‘','Approved':'ìŠ¹ì¸ë¨','Rejected':'ê±°ë¶€ë¨','Paid':'ì§€ê¸‰ë¨'},
 ar:{'Task':'مهمة','Open Task':'فتح المهمة','Pending':'قيد المراجعة','Approved':'تمت الموافقة','Rejected':'مرفوض','Paid':'تم الدفع'}
};
for(const lang of Object.keys(AIRDROP_STATUS_LABELS) as LanguageCode[])Object.assign(translations[lang],AIRDROP_STATUS_LABELS[lang]);
const AIRDROP_FINAL_LABELS: Record<LanguageCode, Record<string,string>> = {
 id:{'Loading active tasks...':'Memuat tugas aktif...','Submitting...':'Mengirim...','Menu':'Menu','Close':'Tutup','https://...':'https://...'},
 en:{'Loading active tasks...':'Loading active tasks...','Submitting...':'Submitting...','Menu':'Menu','Close':'Close','https://...':'https://...'},
 es:{'Loading active tasks...':'Cargando tareas activas...','Submitting...':'Enviando...','Menu':'Menú','Close':'Cerrar','https://...':'https://...'},
 pt:{'Loading active tasks...':'Carregando tarefas ativas...','Submitting...':'Enviando...','Menu':'Menu','Close':'Fechar','https://...':'https://...'},
 zh:{'Loading active tasks...':'æ­£åœ¨åŠ è½½æ´»åŠ¨ä»»åŠ¡...','Submitting...':'æäº¤ä¸­...','Menu':'èœå•','Close':'å…³é—­','https://...':'https://...'},
 ja:{'Loading active tasks...':'ã‚¢ã‚¯ãƒ†ã‚£ãƒ–ãªã‚¿ã‚¹ã‚¯ã‚’èª­ã¿è¾¼ã‚“ã§ã„ã¾ã™...','Submitting...':'é€ä¿¡ä¸­...','Menu':'ãƒ¡ãƒ‹ãƒ¥ãƒ¼','Close':'é–‰ã˜ã‚‹','https://...':'https://...'},
 ko:{'Loading active tasks...':'í™œì„± ìž‘ì—…ì„ ë¶ˆëŸ¬ì˜¤ëŠ” ì¤‘...','Submitting...':'ì œì¶œ ì¤‘...','Menu':'ë©”ë‰´','Close':'ë‹«ê¸°','https://...':'https://...'},
 ar:{'Loading active tasks...':'جارٍ تحميل المهام النشطة...','Submitting...':'جارٍ الإرسال...','Menu':'القائمة','Close':'إغلاق','https://...':'https://...'}
};
for(const lang of Object.keys(AIRDROP_FINAL_LABELS) as LanguageCode[]){Object.assign(translations[lang],AIRDROP_FINAL_LABELS[lang]);PAGE_UI_TRANSLATIONS[lang]={...AIRDROP_FINAL_LABELS[lang],...PAGE_UI_TRANSLATIONS[lang]};}


/* Final UI translation audit coverage for legacy hardcoded labels. */
const UI_AUDIT_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.':'Tulis sesuatu atau masukkan media terlebih dahulu.',
    'Posting gagal dibuat.':'Posting gagal dibuat.','Koneksi gagal. Silakan coba lagi.':'Koneksi gagal. Silakan coba lagi.',
    'Konten dan aktivitas di halaman ini menggunakan data produksi.':'Konten dan aktivitas di halaman ini menggunakan data produksi.',
    'Wallet belum terhubung':'Wallet belum terhubung','Refresh balance':'Segarkan saldo','Registration Bonus':'Bonus Pendaftaran','Bonus pendaftaran masih tersedia untuk diklaim.':'Bonus pendaftaran masih tersedia untuk diklaim.','Claim Bonus':'Klaim Bonus','Buka Live Room â†’':'Buka Live Room â†’','Community Posts':'Postingan Komunitas','Setiap user dapat membagikan tulisan dan postingan.':'Setiap pengguna dapat membagikan tulisan dan postingan.','Refresh posts':'Segarkan postingan','Memuat postingan...':'Memuat postingan...','Belum ada postingan':'Belum ada postingan','Jadilah pengguna pertama yang membagikan sesuatu.':'Jadilah pengguna pertama yang membagikan sesuatu.','Buka media terlampir â†’':'Buka media terlampir â†’','Belum ada data live aktif':'Belum ada data live aktif','Room live akan tampil di sini setelah tersedia dari backend produksi.':'Room live akan tampil di sini setelah tersedia dari backend produksi.','Buka Live Room':'Buka Live Room','Tebak Nomor':'Tebak Nomor','Ikuti permainan live.':'Ikuti permainan live.','Spinner':'Spinner','Masuk ke event spinner.':'Masuk ke event spinner.','Blind Box':'Blind Box','Buka Blind Box dengan saldo akun.':'Buka Blind Box dengan saldo akun.','Community':'Komunitas','Upload / Create Post':'Unggah / Buat Postingan','Tulis sesuatu untuk dibagikan ke komunitas...':'Tulis sesuatu untuk dibagikan ke komunitas...','Menerbitkan...':'Menerbitkan...','Terbitkan Postingan':'Terbitkan Postingan',
    'Referral link berhasil disalin.':'Referral link berhasil disalin.','Masukkan alamat wallet tujuan.':'Masukkan alamat wallet tujuan.','Saldo tersedia tidak mencukupi.':'Saldo tersedia tidak mencukupi.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'Permintaan penarikan berhasil dibuat dan menunggu proses.','Belum ada transaksi.':'Belum ada transaksi.','Loading...':'Memuat...','Belum ada event yang diikuti.':'Belum ada event yang diikuti.',
    'Need More Viewers':'Butuh Lebih Banyak Penonton','Add at least 2 viewer usernames to spin the raffle wheel.':'Tambahkan minimal 2 username penonton untuk memutar spinner.','Winner Picked!':'Pemenang Terpilih!','Congratulations':'Selamat!','Selected as Lucky Viewer!':'Terpilih sebagai Penonton Beruntung!','Live Chat':'Chat Live','Tambahkan peserta yang benar-benar masuk dari live room.':'Tambahkan peserta yang benar-benar masuk dari live room.','Spinning for Winner...':'Memutar untuk menentukan pemenang...','Remove':'Hapus','Recent Raffle Winners':'Pemenang Undian Terbaru',
    'Incomplete Prediction':'Prediksi Belum Lengkap','Please enter a digit for Slot':'Masukkan digit untuk Slot','Card Cracked!':'Kartu Terpecahkan!','All concealed digits matched!':'Semua digit tersembunyi cocok!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.','Guess Missed':'Tebakan Tidak Cocok','Matched digits. Try another prediction!':'Digit cocok. Coba prediksi lain!','Crypto Card Number Guess':'Tebak Nomor Kartu Kripto','Streamer Clue / Note for Viewers':'Petunjuk Streamer untuk Penonton','Verify Challenge':'Verifikasi Tantangan',
    'Server gagal memproses Blind Box.':'Server gagal memproses Blind Box.','Vault Updated':'Vault Diperbarui','Added to your Inventory!':'Ditambahkan ke Inventory!','Daily Limit Reached':'Batas Harian Tercapai','Staking Required':'Staking Diperlukan'
  },
  en: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.':'Write something or add media first.','Posting gagal dibuat.':'Failed to create post.','Koneksi gagal. Silakan coba lagi.':'Connection failed. Please try again.','Konten dan aktivitas di halaman ini menggunakan data produksi.':'All content and activity on this page uses production data.','Wallet belum terhubung':'Wallet not connected','Refresh balance':'Refresh balance','Bonus pendaftaran masih tersedia untuk diklaim.':'Your registration bonus is still available to claim.','Buka Live Room â†’':'Open Live Room â†’','Setiap user dapat membagikan tulisan dan postingan.':'Every user can share posts and updates.','Segarkan postingan':'Refresh posts','Memuat postingan...':'Loading posts...','Belum ada postingan':'No posts yet','Jadilah pengguna pertama yang membagikan sesuatu.':'Be the first user to share something.','Buka media terlampir â†’':'Open attached media â†’','Belum ada data live aktif':'No active live data','Room live akan tampil di sini setelah tersedia dari backend produksi.':'Live rooms will appear here when available from the production backend.','Buka Live Room':'Open Live Room','Ikuti permainan live.':'Join the live game.','Masuk ke event spinner.':'Enter the spinner event.','Buka Blind Box dengan saldo akun.':'Open Blind Box using your account balance.','Community':'Community','Upload / Create Post':'Upload / Create Post','Tulis sesuatu untuk dibagikan ke komunitas...':'Write something to share with the community...','Menerbitkan...':'Publishing...','Terbitkan Postingan':'Publish Post','Referral link berhasil disalin.':'Referral link copied successfully.','Masukkan alamat wallet tujuan.':'Enter the destination wallet address.','Saldo tersedia tidak mencukupi.':'Available balance is insufficient.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'Withdrawal request created and awaiting processing.','Belum ada event yang diikuti.':'No events joined yet.',
    'Need More Viewers':'Need More Viewers','Add at least 2 viewer usernames to spin the raffle wheel.':'Add at least 2 viewer usernames to spin the raffle wheel.','Winner Picked!':'Winner Picked!','Congratulations':'Congratulations','Selected as Lucky Viewer!':'Selected as Lucky Viewer!','Tambahkan peserta yang benar-benar masuk dari live room.':'Add participants who actually joined the live room.','Spinning for Winner...':'Spinning for Winner...','Remove':'Remove','Incomplete Prediction':'Incomplete Prediction','Please enter a digit for Slot':'Please enter a digit for Slot','Card Cracked!':'Card Cracked!','All concealed digits matched!':'All concealed digits matched!','Guess Missed':'Guess Missed','Matched digits. Try another prediction!':'Matched digits. Try another prediction!','Challenge berhasil. Tidak ada saldo yang dipotong atau dibayarkan.':'Challenge completed. No balance was deducted or paid.','Server gagal memproses Blind Box.':'The server failed to process the Blind Box.','Vault Updated':'Vault Updated','Added to your Inventory!':'Added to your Inventory!','Daily Limit Reached':'Daily Limit Reached','Staking Required':'Staking Required'
  },
  es: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.':'Escribe algo o añade contenido multimedia primero.','Posting gagal dibuat.':'No se pudo crear la publicación.','Koneksi gagal. Silakan coba lagi.':'Error de conexión. Inténtalo de nuevo.','Konten dan aktivitas di halaman ini menggunakan data produksi.':'Todo el contenido y la actividad de esta página usan datos de producción.','Wallet belum terhubung':'Wallet no conectada','Refresh balance':'Actualizar saldo','Bonus pendaftaran masih tersedia untuk diklaim.':'Tu bono de registro sigue disponible para reclamar.','Buka Live Room â†’':'Abrir Live Room â†’','Setiap user dapat membagikan tulisan dan postingan.':'Cada usuario puede compartir publicaciones.','Memuat postingan...':'Cargando publicaciones...','Belum ada postingan':'Aún no hay publicaciones','Jadilah pengguna pertama yang membagikan sesuatu.':'Sé el primero en compartir algo.','Buka Live Room':'Abrir Live Room','Ikuti permainan live.':'Participa en el juego en vivo.','Masuk ke event spinner.':'Entrar al evento de spinner.','Buka Blind Box dengan saldo akun.':'Abrir Blind Box con el saldo de la cuenta.','Upload / Create Post':'Subir / Crear publicación','Tulis sesuatu untuk dibagikan ke komunitas...':'Escribe algo para compartir con la comunidad...','Menerbitkan...':'Publicando...','Terbitkan Postingan':'Publicar','Referral link berhasil disalin.':'Enlace de referidos copiado.','Masukkan alamat wallet tujuan.':'Introduce la wallet de destino.','Saldo tersedia tidak mencukupi.':'El saldo disponible es insuficiente.','Belum ada event yang diikuti.':'Aún no hay eventos.','Need More Viewers':'Se necesitan más espectadores','Winner Picked!':'¡Ganador seleccionado!','Congratulations':'¡Felicidades!','Selected as Lucky Viewer!':'¡Seleccionado como espectador afortunado!','Incomplete Prediction':'Predicción incompleta','Please enter a digit for Slot':'Introduce un dígito para la ranura','Card Cracked!':'¡Tarjeta descifrada!','Guess Missed':'Predicción incorrecta','Matched digits. Try another prediction!':'Dígitos coincidentes. Prueba otra predicción.','Daily Limit Reached':'Límite diario alcanzado','Staking Required':'Se requiere bloqueo'
  },
  pt: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.':'Escreva algo ou adicione mídia primeiro.','Posting gagal dibuat.':'Falha ao criar a publicação.','Koneksi gagal. Silakan coba lagi.':'Falha de conexão. Tente novamente.','Konten dan aktivitas di halaman ini menggunakan data de produÃ§Ã£o.':'Todo o conteúdo e atividade desta página usam dados de produção.','Wallet belum terhubung':'Carteira não conectada','Refresh balance':'Atualizar saldo','Bonus pendaftaran masih tersedia untuk diklaim.':'Seu bônus de registro ainda está disponível.','Buka Live Room':'Abrir Live Room','Ikuti permainan live.':'Participar do jogo ao vivo.','Masuk ke event spinner.':'Entrar no evento de spinner.','Buka Blind Box dengan saldo akun.':'Abrir Blind Box com o saldo da conta.','Upload / Create Post':'Enviar / Criar publicação','Tulis sesuatu untuk dibagikan ke komunitas...':'Escreva algo para compartilhar com a comunidade...','Menerbitkan...':'Publicando...','Terbitkan Postingan':'Publicar','Referral link berhasil disalin.':'Link de indicação copiado.','Masukkan alamat wallet tujuan.':'Informe a carteira de destino.','Saldo tersedia tidak mencukupi.':'O saldo disponível é insuficiente.','Belum ada event yang diikuti.':'Nenhum evento participado ainda.','Need More Viewers':'Mais espectadores necessários','Winner Picked!':'Vencedor escolhido!','Congratulations':'Parabéns!','Selected as Lucky Viewer!':'Selecionado como espectador sortudo!','Incomplete Prediction':'Previsão incompleta','Please enter a digit for Slot':'Digite um dígito para o slot','Card Cracked!':'Cartão desbloqueado!','Guess Missed':'Palpite incorreto','Daily Limit Reached':'Limite diário atingido','Staking Required':'Bloqueio necessário'
  },
  zh: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.':'è¯·å…ˆè¾“å…¥å†…å®¹æˆ–æ·»åŠ åª’ä½“ã€‚','Posting gagal dibuat.':'å‘å¸ƒå¤±è´¥ã€‚','Koneksi gagal. Silakan coba lagi.':'è¿žæŽ¥å¤±è´¥ï¼Œè¯·é‡è¯•ã€‚','Konten dan aktivitas di halaman ini menggunakan data produksi.':'æ­¤é¡µé¢çš„æ‰€æœ‰å†…å®¹å’Œæ´»åŠ¨å‡ä½¿ç”¨ç”Ÿäº§æ•°æ®ã€‚','Wallet belum terhubung':'é’±åŒ…æœªè¿žæŽ¥','Refresh balance':'åˆ·æ–°ä½™é¢','Bonus pendaftaran masih tersedia untuk diklaim.':'æ‚¨çš„æ³¨å†Œå¥–åŠ±ä»å¯é¢†å–ã€‚','Buka Live Room':'æ‰“å¼€ç›´æ’­é—´','Ikuti permainan live.':'å‚åŠ ç›´æ’­æ¸¸æˆã€‚','Masuk ke event spinner.':'è¿›å…¥è½¬ç›˜æ´»åŠ¨ã€‚','Buka Blind Box dengan saldo akun.':'ä½¿ç”¨è´¦æˆ·ä½™é¢æ‰“å¼€ç›²ç›’ã€‚','Upload / Create Post':'ä¸Šä¼  / åˆ›å»ºå¸–å­','Tulis sesuatu untuk dibagikan ke komunitas...':'写点内容分享给社区…','Menerbitkan...':'发布中…','Terbitkan Postingan':'å‘å¸ƒå¸–å­','Referral link berhasil disalin.':'æŽ¨èé“¾æŽ¥å·²å¤åˆ¶ã€‚','Masukkan alamat wallet tujuan.':'è¯·è¾“å…¥ç›®æ ‡é’±åŒ…åœ°å€ã€‚','Saldo tersedia tidak mencukupi.':'å¯ç”¨ä½™é¢ä¸è¶³ã€‚','Belum ada event yang diikuti.':'æš‚æ— å‚åŠ çš„æ´»åŠ¨ã€‚','Need More Viewers':'éœ€è¦æ›´å¤šè§‚ä¼—','Winner Picked!':'å·²é€‰å‡ºèŽ·èƒœè€…ï¼','Congratulations':'æ­å–œï¼','Selected as Lucky Viewer!':'å·²é€‰ä¸ºå¹¸è¿è§‚ä¼—ï¼','Incomplete Prediction':'é¢„æµ‹ä¸å®Œæ•´','Please enter a digit for Slot':'è¯·è¾“å…¥è¯¥ä½ç½®çš„æ•°å­—','Card Cracked!':'å¡ç‰‡å·²ç ´è§£ï¼','Guess Missed':'çŒœæµ‹é”™è¯¯','Daily Limit Reached':'å·²è¾¾åˆ°æ¯æ—¥é™åˆ¶','Staking Required':'éœ€è¦é”å®šä½™é¢'
  },
  ja: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.':'ã¾ãšå†…å®¹ã‚’å…¥åŠ›ã™ã‚‹ã‹ãƒ¡ãƒ‡ã‚£ã‚¢ã‚’è¿½åŠ ã—ã¦ãã ã•ã„ã€‚','Posting gagal dibuat.':'æŠ•ç¨¿ã®ä½œæˆã«å¤±æ•—ã—ã¾ã—ãŸã€‚','Koneksi gagal. Silakan coba lagi.':'æŽ¥ç¶šã«å¤±æ•—ã—ã¾ã—ãŸã€‚ã‚‚ã†ä¸€åº¦ãŠè©¦ã—ãã ã•ã„ã€‚','Konten dan aktivitas di halaman ini menggunakan data produksi.':'ã“ã®ãƒšãƒ¼ã‚¸ã®ã‚³ãƒ³ãƒ†ãƒ³ãƒ„ã¨ã‚¢ã‚¯ãƒ†ã‚£ãƒ“ãƒ†ã‚£ã¯æœ¬ç•ªãƒ‡ãƒ¼ã‚¿ã‚’ä½¿ç”¨ã—ã¾ã™ã€‚','Wallet belum terhubung':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆæœªæŽ¥ç¶š','Refresh balance':'æ®‹é«˜ã‚’æ›´æ–°','Bonus pendaftaran masih tersedia untuk diklaim.':'ç™»éŒ²ãƒœãƒ¼ãƒŠã‚¹ã‚’ã¾ã å—ã‘å–ã‚Œã¾ã™ã€‚','Buka Live Room':'ãƒ©ã‚¤ãƒ–ãƒ«ãƒ¼ãƒ ã‚’é–‹ã','Ikuti permainan live.':'ãƒ©ã‚¤ãƒ–ã‚²ãƒ¼ãƒ ã«å‚åŠ ','Masuk ke event spinner.':'ã‚¹ãƒ”ãƒŠãƒ¼ã‚¤ãƒ™ãƒ³ãƒˆã«å…¥ã‚‹','Buka Blind Box dengan saldo akun.':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆæ®‹é«˜ã§Blind Boxã‚’é–‹ã','Upload / Create Post':'ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰ / æŠ•ç¨¿ä½œæˆ','Tulis sesuatu untuk dibagikan ke komunitas...':'コミュニティに共有する内容を入力…','Menerbitkan...':'公開中…','Terbitkan Postingan':'æŠ•ç¨¿ã™ã‚‹','Referral link berhasil disalin.':'ç´¹ä»‹ãƒªãƒ³ã‚¯ã‚’ã‚³ãƒ”ãƒ¼ã—ã¾ã—ãŸã€‚','Masukkan alamat wallet tujuan.':'é€é‡‘å…ˆã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„ã€‚','Saldo tersedia tidak mencukupi.':'åˆ©ç”¨å¯èƒ½æ®‹é«˜ãŒä¸è¶³ã—ã¦ã„ã¾ã™ã€‚','Belum ada event yang diikuti.':'å‚åŠ ã—ãŸã‚¤ãƒ™ãƒ³ãƒˆã¯ã‚ã‚Šã¾ã›ã‚“ã€‚','Need More Viewers':'ã•ã‚‰ã«è¦–è´è€…ãŒå¿…è¦ã§ã™','Winner Picked!':'å½“é¸è€…ãŒæ±ºã¾ã‚Šã¾ã—ãŸï¼','Congratulations':'ãŠã‚ã§ã¨ã†ã”ã–ã„ã¾ã™ï¼','Selected as Lucky Viewer!':'ãƒ©ãƒƒã‚­ãƒ¼è¦–è´è€…ã«é¸ã°ã‚Œã¾ã—ãŸï¼','Incomplete Prediction':'äºˆæ¸¬ãŒæœªå…¥åŠ›ã§ã™','Please enter a digit for Slot':'ã‚¹ãƒ­ãƒƒãƒˆã®æ•°å­—ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„','Card Cracked!':'ã‚«ãƒ¼ãƒ‰ãŒè§£èª­ã•ã‚Œã¾ã—ãŸï¼','Guess Missed':'äºˆæ¸¬ãŒå¤–ã‚Œã¾ã—ãŸ','Daily Limit Reached':'1æ—¥ã®ä¸Šé™ã«é”ã—ã¾ã—ãŸ','Staking Required':'ãƒ­ãƒƒã‚¯ãŒå¿…è¦ã§ã™'
  },
  ko: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.':'ë‚´ìš©ì„ ìž…ë ¥í•˜ê±°ë‚˜ ë¯¸ë””ì–´ë¥¼ ì¶”ê°€í•˜ì„¸ìš”.','Posting gagal dibuat.':'ê²Œì‹œë¬¼ ìƒì„±ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.','Koneksi gagal. Silakan coba lagi.':'ì—°ê²°ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤. ë‹¤ì‹œ ì‹œë„í•˜ì„¸ìš”.','Konten dan aktivitas di halaman ini menggunakan data produksi.':'ì´ íŽ˜ì´ì§€ì˜ ëª¨ë“  ì½˜í…ì¸ ì™€ í™œë™ì€ ìš´ì˜ ë°ì´í„°ë¥¼ ì‚¬ìš©í•©ë‹ˆë‹¤.','Wallet belum terhubung':'ì§€ê°‘ì´ ì—°ê²°ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤','Refresh balance':'ìž”ì•¡ ìƒˆë¡œê³ ì¹¨','Bonus pendaftaran masih tersedia untuk diklaim.':'ê°€ìž… ë³´ë„ˆìŠ¤ë¥¼ ì•„ì§ ë°›ì„ ìˆ˜ ìžˆìŠµë‹ˆë‹¤.','Buka Live Room':'ë¼ì´ë¸Œ ë£¸ ì—´ê¸°','Ikuti permainan live.':'ë¼ì´ë¸Œ ê²Œìž„ ì°¸ì—¬','Masuk ke event spinner.':'ìŠ¤í”¼ë„ˆ ì´ë²¤íŠ¸ ìž…ìž¥','Buka Blind Box dengan saldo akun.':'ê³„ì • ìž”ì•¡ìœ¼ë¡œ Blind Box ì—´ê¸°','Upload / Create Post':'ì—…ë¡œë“œ / ê²Œì‹œë¬¼ ë§Œë“¤ê¸°','Tulis sesuatu untuk dibagikan ke komunitas...':'ì»¤ë®¤ë‹ˆí‹°ì— ê³µìœ í•  ë‚´ìš©ì„ ìž…ë ¥í•˜ì„¸ìš”...','Menerbitkan...':'ê²Œì‹œ ì¤‘...','Terbitkan Postingan':'ê²Œì‹œí•˜ê¸°','Referral link berhasil disalin.':'ì¶”ì²œ ë§í¬ê°€ ë³µì‚¬ë˜ì—ˆìŠµë‹ˆë‹¤.','Masukkan alamat wallet tujuan.':'ëŒ€ìƒ ì§€ê°‘ ì£¼ì†Œë¥¼ ìž…ë ¥í•˜ì„¸ìš”.','Saldo tersedia tidak mencukupi.':'ì‚¬ìš© ê°€ëŠ¥ ìž”ì•¡ì´ ë¶€ì¡±í•©ë‹ˆë‹¤.','Belum ada event yang diikuti.':'ì°¸ì—¬í•œ ì´ë²¤íŠ¸ê°€ ì—†ìŠµë‹ˆë‹¤.','Need More Viewers':'ë” ë§Žì€ ì‹œì²­ìžê°€ í•„ìš”í•©ë‹ˆë‹¤','Winner Picked!':'ë‹¹ì²¨ìžê°€ ì„ íƒë˜ì—ˆìŠµë‹ˆë‹¤!','Congratulations':'ì¶•í•˜í•©ë‹ˆë‹¤!','Selected as Lucky Viewer!':'í–‰ìš´ì˜ ì‹œì²­ìžë¡œ ì„ ì •ë˜ì—ˆìŠµë‹ˆë‹¤!','Incomplete Prediction':'ì˜ˆì¸¡ì´ ì™„ì „í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤','Please enter a digit for Slot':'ìŠ¬ë¡¯ì˜ ìˆ«ìžë¥¼ ìž…ë ¥í•˜ì„¸ìš”','Card Cracked!':'ì¹´ë“œê°€ í•´ë…ë˜ì—ˆìŠµë‹ˆë‹¤!','Guess Missed':'ì˜ˆì¸¡ ì‹¤íŒ¨','Daily Limit Reached':'ì¼ì¼ í•œë„ì— ë„ë‹¬í–ˆìŠµë‹ˆë‹¤','Staking Required':'Lockì´ í•„ìš”í•©ë‹ˆë‹¤'
  },
  ar: {
    'Tulis sesuatu atau masukkan media terlebih dahulu.':'اكتب شيئاً أو أضف وسائط أولاً.','Posting gagal dibuat.':'فشل إنشاء المنشور.','Koneksi gagal. Silakan coba lagi.':'فشل الاتصال. حاول مرة أخرى.','Konten dan aktivitas di halaman ini menggunakan data produksi.':'تستخدم جميع محتويات وأنشطة هذه الصفحة بيانات الإنتاج.','Wallet belum terhubung':'المحفظة غير متصلة','Refresh balance':'تحديث الرصيد','Bonus pendaftaran masih tersedia untuk diklaim.':'لا تزال مكافأة التسجيل متاحة للاستلام.','Buka Live Room':'فتح الغرفة المباشرة','Ikuti permainan live.':'انضم إلى اللعبة المباشرة','Masuk ke event spinner.':'الدخول إلى فعالية العجلة','Buka Blind Box dengan saldo akun.':'فتح Blind Box باستخدام رصيد الحساب','Upload / Create Post':'رفع / إنشاء منشور','Tulis sesuatu untuk dibagikan ke komunitas...':'اكتب شيئاً لمشاركته مع المجتمع...','Menerbitkan...':'جارٍ النشر...','Terbitkan Postingan':'نشر المنشور','Referral link berhasil disalin.':'تم نسخ رابط الإحالة.','Masukkan alamat wallet tujuan.':'أدخل عنوان المحفظة المستهدفة.','Saldo tersedia tidak mencukupi.':'الرصيد المتاح غير كافٍ.','Belum ada event yang diikuti.':'لا توجد فعاليات منضم إليها.','Need More Viewers':'نحتاج إلى مزيد من المشاهدين','Winner Picked!':'تم اختيار الفائز!','Congratulations':'تهانينا!','Selected as Lucky Viewer!':'تم اختيارك كمشاهد محظوظ!','Incomplete Prediction':'التوقع غير مكتمل','Please enter a digit for Slot':'أدخل رقماً للخانة','Card Cracked!':'تم فك البطاقة!','Guess Missed':'لم تنجح التخمينات','Daily Limit Reached':'تم بلوغ الحد اليومي','Staking Required':'يلزم القفل'
  }
};
const FINAL_AUDIT_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Reward dari Airdrop':'Reward dari Airdrop','SYS Mining':'SYS Mining','Mining SYS dari Blind Box Lock':'Mining SYS dari Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.':'Lock aktif minimal $10 dapat mengaktifkan reward mining harian.',
    'DAILY CHECK-IN':'CHECK-IN HARIAN','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.':'Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.',
    'Tanggal':'Tanggal','Status':'Status','Points':'Points','Aksi':'Aksi','TODAY':'HARI INI','Belum check-in':'Belum check-in','Check-in':'Check-in',
    'AIRDROP POINTS':'POIN AIRDROP','Points â†’ SYS':'Points â†’ SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.':'Points hanya berasal dari task yang diproses server. Konversi dicatat sebagai ledger.',
    'Available':'Tersedia','Pending':'Menunggu','Converted':'Dikonversi','Jumlah points':'Jumlah points','Conversion gagal':'Konversi gagal','Rate saat ini: 1 SYS = 1.000 points.':'Rate saat ini: 1 SYS = 1.000 points.',
    'URL media (opsional)':'URL media (opsional)','Memuat status Mining...':'Memuat status Mining...'
  },
  en: {
    'Reward dari Airdrop':'Airdrop reward','SYS Mining':'SYS Mining','Mining SYS dari Blind Box Lock':'Mine SYS from Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.':'An active lock of at least $10 enables daily mining rewards.',
    'DAILY CHECK-IN':'DAILY CHECK-IN','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.':'Recurring daily check-in. Rewards are given in points and can be converted to SYS under the program rules.',
    'Tanggal':'Date','Status':'Status','Points':'Points','Aksi':'Action','TODAY':'TODAY','Belum check-in':'Not checked in','Check-in':'Check in',
    'AIRDROP POINTS':'AIRDROP POINTS','Points â†’ SYS':'Points â†’ SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.':'Points come only from server-processed tasks. Conversions are recorded in the ledger.',
    'Available':'Available','Pending':'Pending','Converted':'Converted','Jumlah points':'Points amount','Conversion gagal':'Conversion failed','Rate saat ini: 1 SYS = 1.000 points.':'Current rate: 1 SYS = 1,000 points.',
    'URL media (opsional)':'Media URL (optional)','Memuat status Mining...':'Loading Mining status...'
  },
  es: {
    'Reward dari Airdrop':'Recompensa de Airdrop','SYS Mining':'Minería SYS','Mining SYS dari Blind Box Lock':'Minar SYS con Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.':'Un bloqueo activo de al menos $10 activa las recompensas diarias de minería.',
    'DAILY CHECK-IN':'CHECK-IN DIARIO','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.':'Check-in diario recurrente. Las recompensas se otorgan en puntos y pueden convertirse a SYS según las reglas del programa.',
    'Tanggal':'Fecha','Status':'Estado','Points':'Puntos','Aksi':'Acción','TODAY':'HOY','Belum check-in':'Sin check-in','Check-in':'Registrar check-in',
    'AIRDROP POINTS':'PUNTOS AIRDROP','Points â†’ SYS':'Puntos â†’ SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.':'Los puntos provienen solo de tareas procesadas por el servidor. Las conversiones se registran en el libro mayor.',
    'Available':'Disponible','Pending':'Pendiente','Converted':'Convertido','Jumlah points':'Cantidad de puntos','Conversion gagal':'Conversión fallida','Rate saat ini: 1 SYS = 1.000 points.':'Tasa actual: 1 SYS = 1.000 puntos.',
    'URL media (opsional)':'URL multimedia (opcional)','Memuat status Mining...':'Cargando estado de minería...'
  },
  pt: {
    'Reward dari Airdrop':'Recompensa do Airdrop','SYS Mining':'Mineração SYS','Mining SYS dari Blind Box Lock':'Minerar SYS com Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.':'Um lock ativo de pelo menos $10 ativa recompensas diárias de mineração.',
    'DAILY CHECK-IN':'CHECK-IN DIÁRIO','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.':'Check-in diário recorrente. As recompensas são dadas em pontos e podem ser convertidas em SYS conforme as regras do programa.',
    'Tanggal':'Data','Status':'Status','Points':'Pontos','Aksi':'Ação','TODAY':'HOJE','Belum check-in':'Sem check-in','Check-in':'Fazer check-in',
    'AIRDROP POINTS':'PONTOS AIRDROP','Points â†’ SYS':'Pontos â†’ SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.':'Os pontos vêm apenas de tarefas processadas pelo servidor. As conversões são registradas no livro razão.',
    'Available':'Disponível','Pending':'Pendente','Converted':'Convertido','Jumlah points':'Quantidade de pontos','Conversion gagal':'Falha na conversão','Rate saat ini: 1 SYS = 1.000 points.':'Taxa atual: 1 SYS = 1.000 pontos.',
    'URL media (opsional)':'URL de mídia (opcional)','Memuat status Mining...':'Carregando status da mineração...'
  },
  zh: {
    'Reward dari Airdrop':'ç©ºæŠ•å¥–åŠ±','SYS Mining':'SYS æŒ–çŸ¿','Mining SYS dari Blind Box Lock':'é€šè¿‡ Blind Box Lock æŒ–çŸ¿ SYS','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.':'è‡³å°‘ $10 çš„æœ‰æ•ˆé”å®šå¯å¼€å¯æ¯æ—¥æŒ–çŸ¿å¥–åŠ±ã€‚',
    'DAILY CHECK-IN':'æ¯æ—¥ç­¾åˆ°','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.':'æ¯æ—¥é‡å¤ç­¾åˆ°ã€‚å¥–åŠ±ä»¥ç§¯åˆ†å‘æ”¾ï¼Œå¹¶å¯æŒ‰è®¡åˆ’è§„åˆ™è½¬æ¢ä¸º SYSã€‚',
    'Tanggal':'æ—¥æœŸ','Status':'çŠ¶æ€','Points':'ç§¯åˆ†','Aksi':'æ“ä½œ','TODAY':'ä»Šå¤©','Belum check-in':'å°šæœªç­¾åˆ°','Check-in':'ç­¾åˆ°',
    'AIRDROP POINTS':'ç©ºæŠ•ç§¯åˆ†','Points â†’ SYS':'ç§¯åˆ† â†’ SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.':'ç§¯åˆ†ä»…æ¥è‡ªæœåŠ¡å™¨å¤„ç†çš„ä»»åŠ¡ï¼Œè½¬æ¢è®°å½•åœ¨è´¦æœ¬ä¸­ã€‚',
    'Available':'å¯ç”¨','Pending':'å¾…å¤„ç†','Converted':'å·²è½¬æ¢','Jumlah points':'ç§¯åˆ†æ•°é‡','Conversion gagal':'è½¬æ¢å¤±è´¥','Rate saat ini: 1 SYS = 1.000 points.':'å½“å‰æ±‡çŽ‡ï¼š1 SYS = 1,000 ç§¯åˆ†ã€‚',
    'URL media (opsional)':'åª’ä½“ URLï¼ˆå¯é€‰ï¼‰','Memuat status Mining...':'正在加载挖矿状态…'
  },
  ja: {
    'Reward dari Airdrop':'ã‚¨ã‚¢ãƒ‰ãƒ­ãƒƒãƒ—å ±é…¬','SYS Mining':'SYSãƒžã‚¤ãƒ‹ãƒ³ã‚°','Mining SYS dari Blind Box Lock':'Blind Box Lockã§SYSã‚’ãƒžã‚¤ãƒ‹ãƒ³ã‚°','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.':'10ãƒ‰ãƒ«ä»¥ä¸Šã®æœ‰åŠ¹ãªãƒ­ãƒƒã‚¯ã§æ¯Žæ—¥ã®ãƒžã‚¤ãƒ‹ãƒ³ã‚°å ±é…¬ãŒæœ‰åŠ¹ã«ãªã‚Šã¾ã™ã€‚',
    'DAILY CHECK-IN':'ãƒ‡ã‚¤ãƒªãƒ¼ãƒã‚§ãƒƒã‚¯ã‚¤ãƒ³','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.':'æ¯Žæ—¥ã®ãƒã‚§ãƒƒã‚¯ã‚¤ãƒ³ã€‚å ±é…¬ã¯ãƒã‚¤ãƒ³ãƒˆã§ä»˜ä¸Žã•ã‚Œã€ãƒ—ãƒ­ã‚°ãƒ©ãƒ è¦å‰‡ã«å¾“ã£ã¦SYSã¸å¤‰æ›ã§ãã¾ã™ã€‚',
    'Tanggal':'æ—¥ä»˜','Status':'ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹','Points':'ãƒã‚¤ãƒ³ãƒˆ','Aksi':'æ“ä½œ','TODAY':'ä»Šæ—¥','Belum check-in':'æœªãƒã‚§ãƒƒã‚¯ã‚¤ãƒ³','Check-in':'ãƒã‚§ãƒƒã‚¯ã‚¤ãƒ³',
    'AIRDROP POINTS':'ã‚¨ã‚¢ãƒ‰ãƒ­ãƒƒãƒ—ãƒã‚¤ãƒ³ãƒˆ','Points â†’ SYS':'ãƒã‚¤ãƒ³ãƒˆ â†’ SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.':'ãƒã‚¤ãƒ³ãƒˆã¯ã‚µãƒ¼ãƒãƒ¼ã§å‡¦ç†ã•ã‚ŒãŸã‚¿ã‚¹ã‚¯ã‹ã‚‰ã®ã¿ä»˜ä¸Žã•ã‚Œã€å¤‰æ›ã¯å°å¸³ã«è¨˜éŒ²ã•ã‚Œã¾ã™ã€‚',
    'Available':'åˆ©ç”¨å¯èƒ½','Pending':'ä¿ç•™ä¸­','Converted':'å¤‰æ›æ¸ˆã¿','Jumlah points':'ãƒã‚¤ãƒ³ãƒˆæ•°','Conversion gagal':'å¤‰æ›ã«å¤±æ•—ã—ã¾ã—ãŸ','Rate saat ini: 1 SYS = 1.000 points.':'ç¾åœ¨ã®ãƒ¬ãƒ¼ãƒˆï¼š1 SYS = 1,000ãƒã‚¤ãƒ³ãƒˆã€‚',
    'URL media (opsional)':'ãƒ¡ãƒ‡ã‚£ã‚¢URLï¼ˆä»»æ„ï¼‰','Memuat status Mining...':'マイニング状態を読み込み中…'
  },
  ko: {
    'Reward dari Airdrop':'ì—ì–´ë“œë¡­ ë³´ìƒ','SYS Mining':'SYS ì±„êµ´','Mining SYS dari Blind Box Lock':'Blind Box Lockìœ¼ë¡œ SYS ì±„êµ´','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.':'ìµœì†Œ $10ì˜ í™œì„± Lockìœ¼ë¡œ ì¼ì¼ ì±„êµ´ ë³´ìƒì´ í™œì„±í™”ë©ë‹ˆë‹¤.',
    'DAILY CHECK-IN':'ì¼ì¼ ì²´í¬ì¸','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.':'ë§¤ì¼ ë°˜ë³µë˜ëŠ” ì²´í¬ì¸ìž…ë‹ˆë‹¤. ë³´ìƒì€ í¬ì¸íŠ¸ë¡œ ì§€ê¸‰ë˜ë©° í”„ë¡œê·¸ëž¨ ê·œì¹™ì— ë”°ë¼ SYSë¡œ ì „í™˜í•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤.',
    'Tanggal':'ë‚ ì§œ','Status':'ìƒíƒœ','Points':'í¬ì¸íŠ¸','Aksi':'ìž‘ì—…','TODAY':'ì˜¤ëŠ˜','Belum check-in':'ì²´í¬ì¸í•˜ì§€ ì•ŠìŒ','Check-in':'ì²´í¬ì¸',
    'AIRDROP POINTS':'ì—ì–´ë“œë¡­ í¬ì¸íŠ¸','Points â†’ SYS':'í¬ì¸íŠ¸ â†’ SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.':'í¬ì¸íŠ¸ëŠ” ì„œë²„ì—ì„œ ì²˜ë¦¬ëœ ìž‘ì—…ì—ì„œë§Œ ë°œìƒí•˜ë©° ì „í™˜ ë‚´ì—­ì€ ì›ìž¥ì— ê¸°ë¡ë©ë‹ˆë‹¤.',
    'Available':'ì‚¬ìš© ê°€ëŠ¥','Pending':'ëŒ€ê¸° ì¤‘','Converted':'ì „í™˜ë¨','Jumlah points':'í¬ì¸íŠ¸ ìˆ˜ëŸ‰','Conversion gagal':'ì „í™˜ ì‹¤íŒ¨','Rate saat ini: 1 SYS = 1.000 points.':'í˜„ìž¬ ë¹„ìœ¨: 1 SYS = 1,000 í¬ì¸íŠ¸.',
    'URL media (opsional)':'ë¯¸ë””ì–´ URL(ì„ íƒ ì‚¬í•­)','Memuat status Mining...':'ì±„êµ´ ìƒíƒœë¥¼ ë¶ˆëŸ¬ì˜¤ëŠ” ì¤‘...'
  },
  ar: {
    'Reward dari Airdrop':'مكافأة الإيردروب','SYS Mining':'تعدين SYS','Mining SYS dari Blind Box Lock':'تعدين SYS عبر Blind Box Lock','Lock aktif minimal $10 dapat mengaktifkan reward mining harian.':'يؤدي القفل النشط بقيمة 10 دولارات على الأقل إلى تفعيل مكافآت التعدين اليومية.',
    'DAILY CHECK-IN':'تسجيل الحضور اليومي','Check-in harian berulang. Reward diberikan dalam points dan dapat dikonversi ke SYS sesuai aturan program.':'تسجيل حضور يومي متكرر. تُمنح المكافآت بالنقاط ويمكن تحويلها إلى SYS وفق قواعد البرنامج.',
    'Tanggal':'التاريخ','Status':'الحالة','Points':'النقاط','Aksi':'الإجراء','TODAY':'اليوم','Belum check-in':'لم يتم التسجيل','Check-in':'تسجيل الحضور',
    'AIRDROP POINTS':'نقاط الإيردروب','Points â†’ SYS':'النقاط → SYS','Points hanya berasal dari task yang diproses server. Conversion dicatat sebagai ledger.':'تأتي النقاط فقط من المهام التي يعالجها الخادم، وتُسجل التحويلات في دفتر الأستاذ.',
    'Available':'متاح','Pending':'معلق','Converted':'تم التحويل','Jumlah points':'عدد النقاط','Conversion gagal':'فشل التحويل','Rate saat ini: 1 SYS = 1.000 points.':'المعدل الحالي: 1 SYS = 1,000 نقطة.',
    'URL media (opsional)':'رابط الوسائط (اختياري)','Memuat status Mining...':'جارٍ تحميل حالة التعدين…'
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
    "Durasi lock tersedia:": "Durasi lock tersedia:",
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
    "Durasi lock tersedia:": "Available lock durations:",
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
    "Durasi lock tersedia:": "Duraciones de bloqueo disponibles:",
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
    "Durasi lock tersedia:": "Durações de bloqueio disponíveis:",
    "30 hari": "30 dias",
    "60 hari": "60 dias",
    "90 hari": "90 dias"
  },
  "zh": {
    "Earns passive yield": "äº§ç”Ÿè¢«åŠ¨æ”¶ç›Š",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "é’±åŒ…åœ°å€ä¸å¯ç”¨ã€‚è¯·å…ˆè¿žæŽ¥é’±åŒ…ã€‚",
    "Copied!": "å·²å¤åˆ¶ï¼",
    "Copy Link": "å¤åˆ¶é“¾æŽ¥",
    "All Claimed!": "å…¨éƒ¨å·²é¢†å–ï¼",
    "Claim Commission to Wallet": "é¢†å–ä½£é‡‘åˆ°é’±åŒ…",
    "You have opened all": "ä½ å·²æ‰“å¼€å…¨éƒ¨",
    "box(es) for today. Quota resets in": "ä¸ªä»Šæ—¥ç›²ç›’ï¼Œé¢åº¦å°†åœ¨",
    "Blind Box Failed": "ç›²ç›’å¤±è´¥",
    "Durasi lock tersedia:": "å¯ç”¨é”å®šæœŸé™ï¼š",
    "30 hari": "30å¤©",
    "60 hari": "60å¤©",
    "90 hari": "90å¤©"
  },
  "ja": {
    "Earns passive yield": "ãƒ‘ãƒƒã‚·ãƒ–åˆ©å›žã‚Šã‚’ç²å¾—",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹ãŒã‚ã‚Šã¾ã›ã‚“ã€‚å…ˆã«ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶šã—ã¦ãã ã•ã„ã€‚",
    "Copied!": "ã‚³ãƒ”ãƒ¼ã—ã¾ã—ãŸï¼",
    "Copy Link": "ãƒªãƒ³ã‚¯ã‚’ã‚³ãƒ”ãƒ¼",
    "All Claimed!": "ã™ã¹ã¦è«‹æ±‚æ¸ˆã¿ï¼",
    "Claim Commission to Wallet": "ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã¸ã‚³ãƒŸãƒƒã‚·ãƒ§ãƒ³ã‚’è«‹æ±‚",
    "You have opened all": "æœ¬æ—¥ã®ã™ã¹ã¦ã®",
    "box(es) for today. Quota resets in": "å€‹ã®ãƒœãƒƒã‚¯ã‚¹ã‚’é–‹å°ã—ã¾ã—ãŸã€‚ãƒªã‚»ãƒƒãƒˆã¾ã§",
    "Blind Box Failed": "Blind Boxã«å¤±æ•—ã—ã¾ã—ãŸ",
    "Durasi lock tersedia:": "åˆ©ç”¨å¯èƒ½ãªãƒ­ãƒƒã‚¯æœŸé–“ï¼š",
    "30 hari": "30æ—¥",
    "60 hari": "60æ—¥",
    "90 hari": "90æ—¥"
  },
  "ko": {
    "Earns passive yield": "íŒ¨ì‹œë¸Œ ìˆ˜ìµ ë°œìƒ",
    "Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.": "ì§€ê°‘ ì£¼ì†Œê°€ ì—†ìŠµë‹ˆë‹¤. ë¨¼ì € ì§€ê°‘ì„ ì—°ê²°í•˜ì„¸ìš”.",
    "Copied!": "ë³µì‚¬ë¨!",
    "Copy Link": "ë§í¬ ë³µì‚¬",
    "All Claimed!": "ëª¨ë‘ í´ë ˆìž„ ì™„ë£Œ!",
    "Claim Commission to Wallet": "ì§€ê°‘ìœ¼ë¡œ ì»¤ë¯¸ì…˜ ë°›ê¸°",
    "You have opened all": "ì˜¤ëŠ˜ì˜ ëª¨ë“ ",
    "box(es) for today. Quota resets in": "ê°œ ë°•ìŠ¤ë¥¼ ì—´ì—ˆìŠµë‹ˆë‹¤. ìž¬ì„¤ì •ê¹Œì§€",
    "Blind Box Failed": "Blind Box ì‹¤íŒ¨",
    "Durasi lock tersedia:": "ì‚¬ìš© ê°€ëŠ¥í•œ Lock ê¸°ê°„:",
    "30 hari": "30ì¼",
    "60 hari": "60ì¼",
    "90 hari": "90ì¼"
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
    "Durasi lock tersedia:": "مدد القفل المتاحة:",
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
    "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.": "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.",
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
    "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.": "In OBS: Settings â†’ Stream â†’ Service Custom â†’ enter the RTMPS Server and Stream Key above.",
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
  "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.": "En OBS: Settings â†’ Stream â†’ Service Custom â†’ introduce el servidor RTMPS y la clave de stream anteriores.",
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
  "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.": "No OBS: Settings â†’ Stream â†’ Service Custom â†’ insira o servidor RTMPS e a chave de stream acima.",
  "AKTIFKAN STREAMING": "ATIVAR TRANSMISSÃƒO",
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
  "Masuk untuk bergabung ke Live Room": "ç™»å½•ä»¥åŠ å…¥ç›´æ’­é—´",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "æ¯ä¸ªè´¦æˆ·åœ¨ç›´æ’­é—´éƒ½æœ‰è‡ªå·±çš„èµ„æ–™å’Œèº«ä»½ã€‚",
  "Room berhasil dibuat.": "ç›´æ’­é—´åˆ›å»ºæˆåŠŸã€‚",
  "Gagal membuat room.": "åˆ›å»ºç›´æ’­é—´å¤±è´¥ã€‚",
  "Buat Live Room": "åˆ›å»ºç›´æ’­é—´",
  "Room ini belum dibuat oleh Official Streamer.": "æ­¤ç›´æ’­é—´å°šæœªç”±å®˜æ–¹ä¸»æ’­åˆ›å»ºã€‚",
  "Room belum tersedia": "ç›´æ’­é—´ä¸å¯ç”¨",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "è¯¥ç›´æ’­é—´å°šæœªåˆ›å»ºã€‚åˆ›å»ºåŽä½ å°†æˆä¸ºå…¶æ‰€æœ‰è€…ã€‚",
  "Judul Live Room": "ç›´æ’­é—´æ ‡é¢˜",
  "Deskripsi room (opsional)": "ç›´æ’­é—´æè¿°ï¼ˆå¯é€‰ï¼‰",
  "MEMBUAT ROOM...": "æ­£åœ¨åˆ›å»ºç›´æ’­é—´...",
  "BUAT ROOM": "åˆ›å»ºç›´æ’­é—´",
  "Streaming belum aktif": "ç›´æ’­å°šæœªå¼€å§‹",
  "Belum ada video live produksi pada room ini.": "æ­¤ç›´æ’­é—´æš‚æ—¶æ²¡æœ‰ç”Ÿäº§çŽ¯å¢ƒç›´æ’­è§†é¢‘ã€‚",
  "STREAMER CONTROL": "ä¸»æ’­æŽ§åˆ¶",
  "Streaming sedang berjalan": "ç›´æ’­æ­£åœ¨è¿›è¡Œ",
  "Kirim video dari OBS ke server": "å°† OBS è§†é¢‘å‘é€åˆ°æœåŠ¡å™¨",
  "CHECK...": "æ£€æŸ¥ä¸­...",
  "CHECK STATUS": "æ£€æŸ¥çŠ¶æ€",
  "Status streaming gagal.": "æ£€æŸ¥ç›´æ’­çŠ¶æ€å¤±è´¥ã€‚",
  "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.": "åœ¨ OBS ä¸­é€‰æ‹© Settings â†’ Stream â†’ Service Customï¼Œå¹¶è¾“å…¥ä¸Šæ–¹çš„ RTMPS æœåŠ¡å™¨å’ŒæŽ¨æµå¯†é’¥ã€‚",
  "AKTIFKAN STREAMING": "å¯ç”¨ç›´æ’­",
  "Buat Live Input Cloudflare untuk room ini.": "ä¸ºæ­¤ç›´æ’­é—´åˆ›å»º Cloudflare Live Inputã€‚",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "åˆ›å»ºåŽï¼Œåœ¨ OBS ä¸­ä½¿ç”¨ RTMPS æœåŠ¡å™¨å’ŒæŽ¨æµå¯†é’¥ã€‚",
  "KHUSUS PEMILIK ROOM": "ä»…é™ç›´æ’­é—´æ‰€æœ‰è€…",
  "MEMBUAT...": "æ­£åœ¨åˆ›å»º...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Live Input åˆ›å»ºæˆåŠŸã€‚è¯·ä½¿ç”¨è§†é¢‘ä¸‹æ–¹çš„ OBS å‡­æ®ã€‚",
  "Gagal membuat Live Input.": "åˆ›å»º Live Input å¤±è´¥ã€‚",
  "Gagal terhubung ke streaming server.": "æ— æ³•è¿žæŽ¥åˆ°ç›´æ’­æœåŠ¡å™¨ã€‚",
  "Profil akun Anda": "ä½ çš„è´¦æˆ·èµ„æ–™",
  "Belum ada deskripsi room dari pemilik room.": "æ‰€æœ‰è€…å°šæœªæ·»åŠ ç›´æ’­é—´æè¿°ã€‚",
  "Peserta Live": "ç›´æ’­å‚ä¸Žè€…",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "ä»…æ˜¾ç¤ºå®žé™…åŠ å…¥çš„è´¦æˆ·ã€‚",
  "Memuat peserta...": "æ­£åœ¨åŠ è½½å‚ä¸Žè€…...",
  "Belum ada peserta lain.": "æš‚æ— å…¶ä»–å‚ä¸Žè€…ã€‚",
  "PESERTA": "å‚ä¸Žè€…",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "æš‚æ— æ¶ˆæ¯ã€‚æˆä¸ºç¬¬ä¸€ä¸ªåœ¨æ­¤ç›´æ’­é—´å‚ä¸Žçš„ç”¨æˆ·ã€‚",
  "Tulis sebagai": "ä»¥æ­¤èº«ä»½å‘è¨€",
  "Belum ada peserta.": "æš‚æ— å‚ä¸Žè€…ã€‚",
  "Anda": "ä½ ",
  "Aksi live room gagal.": "ç›´æ’­é—´æ“ä½œå¤±è´¥ã€‚",
  "Pesan gagal dikirim.": "æ¶ˆæ¯å‘é€å¤±è´¥ã€‚",
  "Like gagal dikirim.": "ç‚¹èµžå‘é€å¤±è´¥ã€‚"
},
  ja: {
  "Masuk untuk bergabung ke Live Room": "ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã«å‚åŠ ã™ã‚‹ã«ã¯ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦ãã ã•ã„",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "å„ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã«ã¯ãƒ«ãƒ¼ãƒ å†…ã§å›ºæœ‰ã®ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«ã¨IDãŒã‚ã‚Šã¾ã™ã€‚",
  "Room berhasil dibuat.": "ãƒ«ãƒ¼ãƒ ã‚’ä½œæˆã—ã¾ã—ãŸã€‚",
  "Gagal membuat room.": "ãƒ«ãƒ¼ãƒ ã®ä½œæˆã«å¤±æ•—ã—ã¾ã—ãŸã€‚",
  "Buat Live Room": "ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã‚’ä½œæˆ",
  "Room ini belum dibuat oleh Official Streamer.": "ã“ã®ãƒ«ãƒ¼ãƒ ã¯ã¾ã å…¬å¼ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã«ã‚ˆã£ã¦ä½œæˆã•ã‚Œã¦ã„ã¾ã›ã‚“ã€‚",
  "Room belum tersedia": "ãƒ«ãƒ¼ãƒ ã¯åˆ©ç”¨ã§ãã¾ã›ã‚“",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "ã“ã®ãƒ«ãƒ¼ãƒ ã¯ã¾ã ã‚ã‚Šã¾ã›ã‚“ã€‚ä½œæˆã™ã‚‹ã¨æ‰€æœ‰è€…ã«ãªã‚Šã¾ã™ã€‚",
  "Judul Live Room": "ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã®ã‚¿ã‚¤ãƒˆãƒ«",
  "Deskripsi room (opsional)": "ãƒ«ãƒ¼ãƒ ã®èª¬æ˜Žï¼ˆä»»æ„ï¼‰",
  "MEMBUAT ROOM...": "ãƒ«ãƒ¼ãƒ ã‚’ä½œæˆä¸­...",
  "BUAT ROOM": "ãƒ«ãƒ¼ãƒ ã‚’ä½œæˆ",
  "Streaming belum aktif": "é…ä¿¡ã¯ã¾ã é–‹å§‹ã•ã‚Œã¦ã„ã¾ã›ã‚“",
  "Belum ada video live produksi pada room ini.": "ã“ã®ãƒ«ãƒ¼ãƒ ã«ã¯ã¾ã æœ¬ç•ªãƒ©ã‚¤ãƒ–æ˜ åƒãŒã‚ã‚Šã¾ã›ã‚“ã€‚",
  "STREAMER CONTROL": "ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ç®¡ç†",
  "Streaming sedang berjalan": "é…ä¿¡ä¸­",
  "Kirim video dari OBS ke server": "OBSã‹ã‚‰ã‚µãƒ¼ãƒãƒ¼ã¸æ˜ åƒã‚’é€ä¿¡",
  "CHECK...": "ç¢ºèªä¸­...",
  "CHECK STATUS": "ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹ã‚’ç¢ºèª",
  "Status streaming gagal.": "é…ä¿¡ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹ã®ç¢ºèªã«å¤±æ•—ã—ã¾ã—ãŸã€‚",
  "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.": "OBSã®Settings â†’ Stream â†’ Service Customã§ã€ä¸Šè¨˜ã®RTMPSã‚µãƒ¼ãƒãƒ¼ã¨ã‚¹ãƒˆãƒªãƒ¼ãƒ ã‚­ãƒ¼ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„ã€‚",
  "AKTIFKAN STREAMING": "é…ä¿¡ã‚’æœ‰åŠ¹åŒ–",
  "Buat Live Input Cloudflare untuk room ini.": "ã“ã®ãƒ«ãƒ¼ãƒ ç”¨ã®Cloudflare Live Inputã‚’ä½œæˆã—ã¾ã™ã€‚",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "ä½œæˆå¾Œã€OBSã§RTMPSã‚µãƒ¼ãƒãƒ¼ã¨ã‚¹ãƒˆãƒªãƒ¼ãƒ ã‚­ãƒ¼ã‚’ä½¿ç”¨ã—ã¦ãã ã•ã„ã€‚",
  "KHUSUS PEMILIK ROOM": "ãƒ«ãƒ¼ãƒ æ‰€æœ‰è€…ã®ã¿",
  "MEMBUAT...": "ä½œæˆä¸­...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Live Inputã‚’ä½œæˆã—ã¾ã—ãŸã€‚å‹•ç”»ä¸‹ã®OBSèªè¨¼æƒ…å ±ã‚’ä½¿ç”¨ã—ã¦ãã ã•ã„ã€‚",
  "Gagal membuat Live Input.": "Live Inputã®ä½œæˆã«å¤±æ•—ã—ã¾ã—ãŸã€‚",
  "Gagal terhubung ke streaming server.": "é…ä¿¡ã‚µãƒ¼ãƒãƒ¼ã¸ã®æŽ¥ç¶šã«å¤±æ•—ã—ã¾ã—ãŸã€‚",
  "Profil akun Anda": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«",
  "Belum ada deskripsi room dari pemilik room.": "æ‰€æœ‰è€…ã«ã‚ˆã‚‹ãƒ«ãƒ¼ãƒ èª¬æ˜Žã¯ã¾ã ã‚ã‚Šã¾ã›ã‚“ã€‚",
  "Peserta Live": "ãƒ©ã‚¤ãƒ–å‚åŠ è€…",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "å®Ÿéš›ã«å‚åŠ ã—ãŸã‚¢ã‚«ã‚¦ãƒ³ãƒˆã®ã¿è¡¨ç¤ºã•ã‚Œã¾ã™ã€‚",
  "Memuat peserta...": "å‚åŠ è€…ã‚’èª­ã¿è¾¼ã¿ä¸­...",
  "Belum ada peserta lain.": "ä»–ã®å‚åŠ è€…ã¯ã¾ã ã„ã¾ã›ã‚“ã€‚",
  "PESERTA": "å‚åŠ è€…",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "ã¾ã ãƒ¡ãƒƒã‚»ãƒ¼ã‚¸ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚ã“ã®ãƒ«ãƒ¼ãƒ ã§æœ€åˆã«å‚åŠ ã—ã¾ã—ã‚‡ã†ã€‚",
  "Tulis sebagai": "æ¬¡ã®åå‰ã§æŠ•ç¨¿",
  "Belum ada peserta.": "å‚åŠ è€…ã¯ã¾ã ã„ã¾ã›ã‚“ã€‚",
  "Anda": "ã‚ãªãŸ",
  "Aksi live room gagal.": "ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã®æ“ä½œã«å¤±æ•—ã—ã¾ã—ãŸã€‚",
  "Pesan gagal dikirim.": "ãƒ¡ãƒƒã‚»ãƒ¼ã‚¸ã®é€ä¿¡ã«å¤±æ•—ã—ã¾ã—ãŸã€‚",
  "Like gagal dikirim.": "ã„ã„ã­ã®é€ä¿¡ã«å¤±æ•—ã—ã¾ã—ãŸã€‚"
},
  ko: {
  "Masuk untuk bergabung ke Live Room": "ë¼ì´ë¸Œ ë£¸ì— ì°¸ì—¬í•˜ë ¤ë©´ ë¡œê·¸ì¸í•˜ì„¸ìš”",
  "Setiap akun memiliki profil dan identitasnya sendiri di dalam room.": "ê° ê³„ì •ì€ ë£¸ì—ì„œ ê³ ìœ í•œ í”„ë¡œí•„ê³¼ ì‹ ì›ì„ ê°€ì§‘ë‹ˆë‹¤.",
  "Room berhasil dibuat.": "ë£¸ì´ ìƒì„±ë˜ì—ˆìŠµë‹ˆë‹¤.",
  "Gagal membuat room.": "ë£¸ ìƒì„±ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.",
  "Buat Live Room": "ë¼ì´ë¸Œ ë£¸ ë§Œë“¤ê¸°",
  "Room ini belum dibuat oleh Official Streamer.": "ì´ ë£¸ì€ ì•„ì§ ê³µì‹ ìŠ¤íŠ¸ë¦¬ë¨¸ê°€ ë§Œë“¤ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤.",
  "Room belum tersedia": "ë£¸ì„ ì‚¬ìš©í•  ìˆ˜ ì—†ìŠµë‹ˆë‹¤",
  "Room belum tersedia. Buat room ini untuk menjadi pemiliknya.": "ì´ ë£¸ì€ ì•„ì§ ì—†ìŠµë‹ˆë‹¤. ìƒì„±í•˜ë©´ ì†Œìœ ìžê°€ ë©ë‹ˆë‹¤.",
  "Judul Live Room": "ë¼ì´ë¸Œ ë£¸ ì œëª©",
  "Deskripsi room (opsional)": "ë£¸ ì„¤ëª…(ì„ íƒ ì‚¬í•­)",
  "MEMBUAT ROOM...": "ë£¸ ìƒì„± ì¤‘...",
  "BUAT ROOM": "ë£¸ ë§Œë“¤ê¸°",
  "Streaming belum aktif": "ìŠ¤íŠ¸ë¦¬ë°ì´ ì•„ì§ ì‹œìž‘ë˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤",
  "Belum ada video live produksi pada room ini.": "ì´ ë£¸ì—ëŠ” ì•„ì§ í”„ë¡œë•ì…˜ ë¼ì´ë¸Œ ì˜ìƒì´ ì—†ìŠµë‹ˆë‹¤.",
  "STREAMER CONTROL": "ìŠ¤íŠ¸ë¦¬ë¨¸ ì œì–´",
  "Streaming sedang berjalan": "ìŠ¤íŠ¸ë¦¬ë° ì§„í–‰ ì¤‘",
  "Kirim video dari OBS ke server": "OBS ì˜ìƒì„ ì„œë²„ë¡œ ì „ì†¡",
  "CHECK...": "í™•ì¸ ì¤‘...",
  "CHECK STATUS": "ìƒíƒœ í™•ì¸",
  "Status streaming gagal.": "ìŠ¤íŠ¸ë¦¬ë° ìƒíƒœ í™•ì¸ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.",
  "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.": "OBSì—ì„œ Settings â†’ Stream â†’ Service Customì„ ì„ íƒí•˜ê³  ìœ„ì˜ RTMPS ì„œë²„ì™€ ìŠ¤íŠ¸ë¦¼ í‚¤ë¥¼ ìž…ë ¥í•˜ì„¸ìš”.",
  "AKTIFKAN STREAMING": "ìŠ¤íŠ¸ë¦¬ë° í™œì„±í™”",
  "Buat Live Input Cloudflare untuk room ini.": "ì´ ë£¸ì˜ Cloudflare Live Inputì„ ìƒì„±í•©ë‹ˆë‹¤.",
  "Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.": "ìƒì„± í›„ OBSì—ì„œ RTMPS ì„œë²„ì™€ ìŠ¤íŠ¸ë¦¼ í‚¤ë¥¼ ì‚¬ìš©í•˜ì„¸ìš”.",
  "KHUSUS PEMILIK ROOM": "ë£¸ ì†Œìœ ìž ì „ìš©",
  "MEMBUAT...": "ìƒì„± ì¤‘...",
  "Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video.": "Live Inputì´ ìƒì„±ë˜ì—ˆìŠµë‹ˆë‹¤. ì˜ìƒ ì•„ëž˜ì˜ OBS ì¸ì¦ ì •ë³´ë¥¼ ì‚¬ìš©í•˜ì„¸ìš”.",
  "Gagal membuat Live Input.": "Live Input ìƒì„±ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.",
  "Gagal terhubung ke streaming server.": "ìŠ¤íŠ¸ë¦¬ë° ì„œë²„ ì—°ê²°ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.",
  "Profil akun Anda": "ë‚´ ê³„ì • í”„ë¡œí•„",
  "Belum ada deskripsi room dari pemilik room.": "ì†Œìœ ìžê°€ ì•„ì§ ë£¸ ì„¤ëª…ì„ ì¶”ê°€í•˜ì§€ ì•Šì•˜ìŠµë‹ˆë‹¤.",
  "Peserta Live": "ë¼ì´ë¸Œ ì°¸ê°€ìž",
  "Hanya akun yang benar-benar bergabung yang ditampilkan.": "ì‹¤ì œë¡œ ì°¸ì—¬í•œ ê³„ì •ë§Œ í‘œì‹œë©ë‹ˆë‹¤.",
  "Memuat peserta...": "ì°¸ê°€ìž ë¡œë”© ì¤‘...",
  "Belum ada peserta lain.": "ì•„ì§ ë‹¤ë¥¸ ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.",
  "PESERTA": "ì°¸ê°€ìž",
  "Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.": "ì•„ì§ ë©”ì‹œì§€ê°€ ì—†ìŠµë‹ˆë‹¤. ì´ ë£¸ì— ì²« ë²ˆì§¸ë¡œ ì°¸ì—¬í•´ ë³´ì„¸ìš”.",
  "Tulis sebagai": "ë‹¤ìŒ ì´ë¦„ìœ¼ë¡œ ìž‘ì„±",
  "Belum ada peserta.": "ì°¸ê°€ìžê°€ ì—†ìŠµë‹ˆë‹¤.",
  "Anda": "ë‚˜",
  "Aksi live room gagal.": "ë¼ì´ë¸Œ ë£¸ ìž‘ì—…ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.",
  "Pesan gagal dikirim.": "ë©”ì‹œì§€ ì „ì†¡ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.",
  "Like gagal dikirim.": "ì¢‹ì•„ìš” ì „ì†¡ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤."
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
  "Gunakan OBS: Settings â†’ Stream â†’ Service Custom â†’ masukkan RTMPS Server dan Stream Key di atas.": "في OBS اختر Settings → Stream → Service Custom وأدخل خادم RTMPS ومفتاح البث أعلاه.",
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
    "LOGIN / REGISTER":"LOGIN / REGISTER","SYS STREAM Live":"SYS STREAM Live","LIVE":"LIVE",
    "Live":"Live","Chat":"Chat","Aksi live room gagal.":"Aksi live room gagal.","Status streaming gagal.":"Status streaming gagal."
  },
  en: {
    "LOGIN / REGISTER":"LOGIN / REGISTER","SYS STREAM Live":"SYS STREAM Live","LIVE":"LIVE",
    "Live":"Live","Chat":"Chat","Aksi live room gagal.":"Live room action failed.","Status streaming gagal.":"Failed to check streaming status."
  },
  es: {
    "LOGIN / REGISTER":"INICIAR SESIÓN / REGISTRARSE","SYS STREAM Live":"SYS STREAM Live","LIVE":"EN VIVO",
    "Live":"En vivo","Chat":"Chat","Aksi live room gagal.":"La acción de la sala en vivo falló.","Status streaming gagal.":"No se pudo comprobar el estado de la transmisión."
  },
  pt: {
    "LOGIN / REGISTER":"ENTRAR / REGISTRAR","SYS STREAM Live":"SYS STREAM Live","LIVE":"AO VIVO",
    "Live":"Ao vivo","Chat":"Chat","Aksi live room gagal.":"A ação da sala ao vivo falhou.","Status streaming gagal.":"Falha ao verificar o status da transmissão."
  },
  zh: {
    "LOGIN / REGISTER":"ç™»å½• / æ³¨å†Œ","SYS STREAM Live":"SYS STREAM Live","LIVE":"ç›´æ’­",
    "Live":"ç›´æ’­","Chat":"èŠå¤©","Aksi live room gagal.":"ç›´æ’­é—´æ“ä½œå¤±è´¥ã€‚","Status streaming gagal.":"æ£€æŸ¥ç›´æ’­çŠ¶æ€å¤±è´¥ã€‚"
  },
  ja: {
    "LOGIN / REGISTER":"ãƒ­ã‚°ã‚¤ãƒ³ / ç™»éŒ²","SYS STREAM Live":"SYS STREAM Live","LIVE":"ãƒ©ã‚¤ãƒ–",
    "Live":"ãƒ©ã‚¤ãƒ–","Chat":"ãƒãƒ£ãƒƒãƒˆ","Aksi live room gagal.":"ãƒ©ã‚¤ãƒ–é…ä¿¡ãƒ«ãƒ¼ãƒ ã®æ“ä½œã«å¤±æ•—ã—ã¾ã—ãŸã€‚","Status streaming gagal.":"é…ä¿¡ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹ã®ç¢ºèªã«å¤±æ•—ã—ã¾ã—ãŸã€‚"
  },
  ko: {
    "LOGIN / REGISTER":"ë¡œê·¸ì¸ / íšŒì›ê°€ìž…","SYS STREAM Live":"SYS STREAM Live","LIVE":"ë¼ì´ë¸Œ",
    "Live":"ë¼ì´ë¸Œ","Chat":"ì±„íŒ…","Aksi live room gagal.":"ë¼ì´ë¸Œ ë£¸ ìž‘ì—…ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.","Status streaming gagal.":"ìŠ¤íŠ¸ë¦¬ë° ìƒíƒœ í™•ì¸ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤."
  },
  ar: {
    "LOGIN / REGISTER":"تسجيل الدخول / التسجيل","SYS STREAM Live":"SYS STREAM Live","LIVE":"مباشر",
    "Live":"مباشر","Chat":"دردشة","Aksi live room gagal.":"فشل إجراء غرفة البث المباشر.","Status streaming gagal.":"تعذر التحقق من حالة البث."
  }
};
for (const lang of Object.keys(LIVE_ROOM_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(LIVE_ROOM_TRANSLATIONS[lang], LIVE_ROOM_COMMON_TRANSLATIONS[lang]);
  Object.assign(translations[lang], LIVE_ROOM_TRANSLATIONS[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], LIVE_ROOM_TRANSLATIONS[lang]);
}


const TEBak_GAME_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.':'Penonton mencoba menebak angka tersembunyi yang dipilih streamer. Game ini dibuat untuk interaksi live tanpa taruhan atau pembayaran.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle':'Digit Kartu (Tepat 4 Digit) & Pengaturan Sembunyikan',
    'Serial No:':'No. Seri:',
    'Digital Crypto Verification Code (4 Digits)':'Kode Verifikasi Kripto Digital (4 Digit)',
    'Digit #':'Digit #',
    'Challenge Successful! Verified code:':'Tantangan Berhasil! Kode terverifikasi:',
    'All concealed digits matched!':'Semua digit tersembunyi cocok!',
    'Prediction Missed. Secret Digits:':'Prediksi Tidak Cocok. Digit Rahasia:',
    'Matched':'Cocok',
    'The 4-digit code is tied to serial number':'Kode 4 digit terkait dengan nomor seri',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.':'Streamer menetapkan digit yang terlihat dan tersembunyi secara real-time. Penonton mencoba menebak digit yang disembunyikan. Tidak ada taruhan atau hadiah finansial dalam game ini.'
  },
  en: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.':'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle':'Card Digits (Exactly 4 Digits) & Conceal Toggle',
    'Serial No:':'Serial No:',
    'Digital Crypto Verification Code (4 Digits)':'Digital Crypto Verification Code (4 Digits)',
    'Digit #':'Digit #',
    'Challenge Successful! Verified code:':'Challenge Successful! Verified code:',
    'All concealed digits matched!':'All concealed digits matched!',
    'Prediction Missed. Secret Digits:':'Prediction Missed. Secret Digits:',
    'Matched':'Matched',
    'The 4-digit code is tied to serial number':'The 4-digit code is tied to serial number',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.':'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.'
  },
  es: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.':'Los espectadores intentan adivinar el número oculto elegido por el streamer. Este juego está diseñado para la interacción en vivo sin apuestas ni pagos.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle':'Dígitos de la tarjeta (exactamente 4) y control de ocultación',
    'Serial No:':'N.º de serie:',
    'Digital Crypto Verification Code (4 Digits)':'Código de verificación criptográfico digital (4 dígitos)',
    'Digit #':'Dígito n.º ',
    'Challenge Successful! Verified code:':'¡Desafío completado! Código verificado:',
    'All concealed digits matched!':'¡Todos los dígitos ocultos coinciden!',
    'Prediction Missed. Secret Digits:':'Predicción fallida. Dígitos secretos:',
    'Matched':'Coinciden',
    'The 4-digit code is tied to serial number':'El código de 4 dígitos está vinculado al número de serie',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.':'El streamer establece los dígitos visibles y ocultos en tiempo real. Los espectadores intentan adivinar los dígitos ocultos. No hay apuestas ni premios económicos en este juego.'
  },
  pt: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.':'Os espectadores tentam adivinhar o número oculto escolhido pelo streamer. Este jogo foi criado para interação ao vivo sem apostas ou pagamentos.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle':'Dígitos do cartão (exatamente 4) e controle de ocultação',
    'Serial No:':'Nº de série:',
    'Digital Crypto Verification Code (4 Digits)':'Código de verificação criptográfica digital (4 dígitos)',
    'Digit #':'Dígito nº ',
    'Challenge Successful! Verified code:':'Desafio concluído! Código verificado:',
    'All concealed digits matched!':'Todos os dígitos ocultos coincidem!',
    'Prediction Missed. Secret Digits:':'Previsão incorreta. Dígitos secretos:',
    'Matched':'Correspondentes',
    'The 4-digit code is tied to serial number':'O código de 4 dígitos está vinculado ao número de série',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.':'O streamer define os dígitos visíveis e ocultos em tempo real. Os espectadores tentam adivinhar os dígitos ocultos. Não há apostas nem prêmios financeiros neste jogo.'
  },
  zh: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.':'è§‚ä¼—å°è¯•çŒœæµ‹ä¸»æ’­é€‰æ‹©çš„éšè—æ•°å­—ã€‚æœ¬æ¸¸æˆä»…ç”¨äºŽç›´æ’­äº’åŠ¨ï¼Œä¸æ¶‰åŠæŠ•æ³¨æˆ–ä»˜æ¬¾ã€‚',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle':'å¡ç‰‡æ•°å­—ï¼ˆæ°å¥½4ä½ï¼‰å’Œéšè—è®¾ç½®',
    'Serial No:':'åºåˆ—å·ï¼š',
    'Digital Crypto Verification Code (4 Digits)':'æ•°å­—åŠ å¯†éªŒè¯ä»£ç ï¼ˆ4ä½ï¼‰',
    'Digit #':'æ•°å­— #',
    'Challenge Successful! Verified code:':'æŒ‘æˆ˜æˆåŠŸï¼éªŒè¯ä»£ç ï¼š',
    'All concealed digits matched!':'æ‰€æœ‰éšè—æ•°å­—å‡åŒ¹é…ï¼',
    'Prediction Missed. Secret Digits:':'é¢„æµ‹å¤±è´¥ã€‚ç§˜å¯†æ•°å­—ï¼š',
    'Matched':'åŒ¹é…',
    'The 4-digit code is tied to serial number':'4ä½ä»£ç ä¸Žåºåˆ—å·ç»‘å®š',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.':'ä¸»æ’­å®žæ—¶è®¾ç½®å¯è§å’Œéšè—æ•°å­—ã€‚è§‚ä¼—å°è¯•çŒœæµ‹éšè—æ•°å­—ã€‚æœ¬æ¸¸æˆä¸æ¶‰åŠæŠ•æ³¨æˆ–çŽ°é‡‘å¥–åŠ±ã€‚'
  },
  ja: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.':'è¦–è´è€…ã¯ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ãŒé¸ã‚“ã éš ã—æ•°å­—ã‚’äºˆæƒ³ã—ã¾ã™ã€‚ã“ã®ã‚²ãƒ¼ãƒ ã¯è³­ã‘ã‚„æ”¯æ‰•ã„ã‚’ä¼´ã‚ãªã„ãƒ©ã‚¤ãƒ–äº¤æµå‘ã‘ã§ã™ã€‚',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle':'ã‚«ãƒ¼ãƒ‰ã®æ•°å­—ï¼ˆ4æ¡ï¼‰ã¨éžè¡¨ç¤ºè¨­å®š',
    'Serial No:':'ã‚·ãƒªã‚¢ãƒ«ç•ªå·ï¼š',
    'Digital Crypto Verification Code (4 Digits)':'ãƒ‡ã‚¸ã‚¿ãƒ«æš—å·æ¤œè¨¼ã‚³ãƒ¼ãƒ‰ï¼ˆ4æ¡ï¼‰',
    'Digit #':'æ•°å­— #',
    'Challenge Successful! Verified code:':'ãƒãƒ£ãƒ¬ãƒ³ã‚¸æˆåŠŸï¼æ¤œè¨¼ã‚³ãƒ¼ãƒ‰ï¼š',
    'All concealed digits matched!':'ã™ã¹ã¦ã®éžè¡¨ç¤ºæ•°å­—ãŒä¸€è‡´ã—ã¾ã—ãŸï¼',
    'Prediction Missed. Secret Digits:':'äºˆæƒ³ä¸ä¸€è‡´ã€‚ç§˜å¯†ã®æ•°å­—ï¼š',
    'Matched':'ä¸€è‡´',
    'The 4-digit code is tied to serial number':'4æ¡ã‚³ãƒ¼ãƒ‰ã¯ã‚·ãƒªã‚¢ãƒ«ç•ªå·ã«ç´ä»˜ã„ã¦ã„ã¾ã™',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.':'ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ãŒè¡¨ç¤ºãƒ»éžè¡¨ç¤ºã®æ•°å­—ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã§è¨­å®šã—ã¾ã™ã€‚è¦–è´è€…ã¯éžè¡¨ç¤ºã®æ•°å­—ã‚’äºˆæƒ³ã—ã¾ã™ã€‚ã“ã®ã‚²ãƒ¼ãƒ ã«è³­ã‘ã‚„é‡‘éŠ­çš„ãªè³žé‡‘ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚'
  },
  ko: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.':'ì‹œì²­ìžëŠ” ìŠ¤íŠ¸ë¦¬ë¨¸ê°€ ì„ íƒí•œ ìˆ¨ê²¨ì§„ ìˆ«ìžë¥¼ ë§ží˜€ ë´…ë‹ˆë‹¤. ì´ ê²Œìž„ì€ ë² íŒ…ì´ë‚˜ ê²°ì œ ì—†ì´ ë¼ì´ë¸Œ ìƒí˜¸ìž‘ìš©ì„ ìœ„í•´ ë§Œë“¤ì–´ì¡ŒìŠµë‹ˆë‹¤.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle':'ì¹´ë“œ ìˆ«ìž(ì •í™•ížˆ 4ìžë¦¬) ë° ìˆ¨ê¹€ ì„¤ì •',
    'Serial No:':'ì¼ë ¨ë²ˆí˜¸:',
    'Digital Crypto Verification Code (4 Digits)':'ë””ì§€í„¸ ì•”í˜¸ ê²€ì¦ ì½”ë“œ(4ìžë¦¬)',
    'Digit #':'ìˆ«ìž #',
    'Challenge Successful! Verified code:':'ì±Œë¦°ì§€ ì„±ê³µ! í™•ì¸ëœ ì½”ë“œ:',
    'All concealed digits matched!':'ëª¨ë“  ìˆ¨ê²¨ì§„ ìˆ«ìžê°€ ì¼ì¹˜í•©ë‹ˆë‹¤!',
    'Prediction Missed. Secret Digits:':'ì˜ˆì¸¡ ì‹¤íŒ¨. ë¹„ë°€ ìˆ«ìž:',
    'Matched':'ì¼ì¹˜',
    'The 4-digit code is tied to serial number':'4ìžë¦¬ ì½”ë“œëŠ” ì¼ë ¨ë²ˆí˜¸ì— ì—°ê²°ë©ë‹ˆë‹¤',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.':'ìŠ¤íŠ¸ë¦¬ë¨¸ê°€ í‘œì‹œ ë° ìˆ¨ê¹€ ìˆ«ìžë¥¼ ì‹¤ì‹œê°„ìœ¼ë¡œ ì„¤ì •í•©ë‹ˆë‹¤. ì‹œì²­ìžëŠ” ìˆ¨ê²¨ì§„ ìˆ«ìžë¥¼ ë§žíž™ë‹ˆë‹¤. ì´ ê²Œìž„ì—ëŠ” ë² íŒ…ì´ë‚˜ ê¸ˆì „ì  ë³´ìƒì´ ì—†ìŠµë‹ˆë‹¤.'
  },
  ar: {
    'Viewers try to guess the hidden number selected by the streamer. This game is designed for live interaction without betting or payment.':'يحاول المشاهدون تخمين الرقم المخفي الذي يختاره مقدم البث. صُممت هذه اللعبة للتفاعل المباشر دون مراهنات أو مدفوعات.',
    'Card Digits (Exactly 4 Digits) & Conceal Toggle':'أرقام البطاقة (4 أرقام بالضبط) وإعداد الإخفاء',
    'Serial No:':'الرقم التسلسلي:',
    'Digital Crypto Verification Code (4 Digits)':'رمز التحقق الرقمي المشفر (4 أرقام)',
    'Digit #':'الرقم #',
    'Challenge Successful! Verified code:':'نجح التحدي! الرمز المتحقق منه:',
    'All concealed digits matched!':'تطابقت جميع الأرقام المخفية!',
    'Prediction Missed. Secret Digits:':'فشل التخمين. الأرقام السرية:',
    'Matched':'المتطابق',
    'The 4-digit code is tied to serial number':'يرتبط الرمز المكون من 4 أرقام بالرقم التسلسلي',
    'Streamer sets visible and concealed digits in real-time. Viewers try to guess the hidden digits. There are no bets or financial prizes in this game.':'يحدد مقدم البث الأرقام الظاهرة والمخفية في الوقت الفعلي. يحاول المشاهدون تخمين الأرقام المخفية. لا توجد مراهنات أو جوائز مالية في هذه اللعبة.'
  }
};

for (const lang of Object.keys(TEBak_GAME_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], TEBak_GAME_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...TEBak_GAME_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}


const TEBak_FREE_PLAY_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    'Streamer & Viewer Interaction â€” Free to Play':'Interaksi Streamer & Penonton — Gratis untuk Dimainkan',
    'Mode Interaksi':'Mode Interaksi',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.',
    'Guess the 2 middle hidden digits! High payout on exact match.':'Tebak 2 digit tersembunyi di tengah! Hadiah tinggi untuk tebakan yang tepat.'
  },
  en: {
    'Streamer & Viewer Interaction â€” Free to Play':'Streamer & Viewer Interaction — Free to Play',
    'Mode Interaksi':'Interaction Mode',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'This game is exclusively for streamer and viewer interaction. No coins, balance, deposits, locks, bets, or payments are required to play.',
    'Guess the 2 middle hidden digits! High payout on exact match.':'Guess the 2 middle hidden digits! High payout on exact match.'
  },
  es: {
    'Streamer & Viewer Interaction â€” Free to Play':'Interacción entre Streamer y Espectadores — Gratis',
    'Mode Interaksi':'Modo de interacción',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'Este juego es exclusivamente para la interacción entre el streamer y los espectadores. No requiere monedas, saldo, depósitos, bloqueos, apuestas ni pagos para jugar.',
    'Guess the 2 middle hidden digits! High payout on exact match.':'¡Adivina los 2 dígitos ocultos del medio! Gran premio por acertar exactamente.'
  },
  pt: {
    'Streamer & Viewer Interaction â€” Free to Play':'Interação entre Streamer e Espectadores — Grátis',
    'Mode Interaksi':'Modo de interação',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'Este jogo é exclusivamente para interação entre streamer e espectadores. Não requer moedas, saldo, depósitos, bloqueios, apostas ou pagamentos para jogar.',
    'Guess the 2 middle hidden digits! High payout on exact match.':'Adivinhe os 2 dígitos ocultos do meio! Grande prêmio ao acertar exatamente.'
  },
  zh: {
    'Streamer & Viewer Interaction â€” Free to Play':'主播与观众互动 — 免费参与',
    'Mode Interaksi':'äº’åŠ¨æ¨¡å¼',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'æœ¬æ¸¸æˆä»…ç”¨äºŽä¸»æ’­ä¸Žè§‚ä¼—äº’åŠ¨ã€‚å‚ä¸Žæ¸¸æˆæ— éœ€é‡‘å¸ã€ä½™é¢ã€å……å€¼ã€é”å®šã€æŠ•æ³¨æˆ–ä»˜æ¬¾ã€‚',
    'Guess the 2 middle hidden digits! High payout on exact match.':'çŒœå‡ºä¸­é—´éšè—çš„2ä½æ•°å­—ï¼å®Œå…¨åŒ¹é…å¯èŽ·å¾—é«˜é¢å¥–åŠ±ã€‚'
  },
  ja: {
    'Streamer & Viewer Interaction â€” Free to Play':'ストリーマーと視聴者の交流 — 無料プレイ',
    'Mode Interaksi':'ã‚¤ãƒ³ã‚¿ãƒ©ã‚¯ã‚·ãƒ§ãƒ³ãƒ¢ãƒ¼ãƒ‰',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'ã“ã®ã‚²ãƒ¼ãƒ ã¯ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã¨è¦–è´è€…ã®äº¤æµå°‚ç”¨ã§ã™ã€‚ãƒ—ãƒ¬ã‚¤ã«ã‚³ã‚¤ãƒ³ã€æ®‹é«˜ã€å…¥é‡‘ã€ãƒ­ãƒƒã‚¯ã€è³­ã‘ã€æ”¯æ‰•ã„ã¯å¿…è¦ã‚ã‚Šã¾ã›ã‚“ã€‚',
    'Guess the 2 middle hidden digits! High payout on exact match.':'ä¸­å¤®ã®éš ã•ã‚ŒãŸ2æ¡ã‚’å½“ã¦ã‚ˆã†ï¼å®Œå…¨ä¸€è‡´ã§é«˜ã„å ±é…¬ã‚’ç²å¾—ã§ãã¾ã™ã€‚'
  },
  ko: {
    'Streamer & Viewer Interaction â€” Free to Play':'스트리머 & 시청자 상호작용 — 무료 플레이',
    'Mode Interaksi':'ìƒí˜¸ìž‘ìš© ëª¨ë“œ',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'ì´ ê²Œìž„ì€ ìŠ¤íŠ¸ë¦¬ë¨¸ì™€ ì‹œì²­ìžì˜ ìƒí˜¸ìž‘ìš©ì„ ìœ„í•œ ê²Œìž„ìž…ë‹ˆë‹¤. í”Œë ˆì´ì— ì½”ì¸, ìž”ì•¡, ìž…ê¸ˆ, ë½, ë² íŒ… ë˜ëŠ” ê²°ì œê°€ í•„ìš”í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤.',
    'Guess the 2 middle hidden digits! High payout on exact match.':'ê°€ìš´ë° ìˆ¨ê²¨ì§„ 2ìžë¦¬ë¥¼ ë§ží˜€ë³´ì„¸ìš”! ì •í™•ížˆ ë§žížˆë©´ ë†’ì€ ë³´ìƒì„ ë°›ì„ ìˆ˜ ìžˆìŠµë‹ˆë‹¤.'
  },
  ar: {
    'Streamer & Viewer Interaction â€” Free to Play':'تفاعل مقدم البث والمشاهدين — لعب مجاني',
    'Mode Interaksi':'وضع التفاعل',
    'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'هذه اللعبة مخصصة لتفاعل مقدم البث مع المشاهدين. لا تتطلب عملات أو رصيدًا أو إيداعًا أو قفلًا أو مراهنات أو مدفوعات للعب.',
    'Guess the 2 middle hidden digits! High payout on exact match.':'خمن الرقمين المخفيين في المنتصف! مكافأة عالية عند التطابق التام.'
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
  'Alamat wallet akun. Recovery phrase tidak disimpan di server.':'Alamat wallet akun. Recovery phrase tidak disimpan di server.',
  'Available Today':'Tersedia Hari Ini',
  'Deposit confirmed':'Deposit berhasil dikonfirmasi',
  'EVM wallet tidak ditemukan. Install MetaMask atau wallet EVM yang kompatibel.':'Wallet EVM tidak ditemukan. Instal MetaMask atau wallet EVM yang kompatibel.',
  'Gagal membuat challenge wallet.':'Gagal membuat challenge wallet.',
  'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.':'Game ini khusus untuk interaksi streamer dan penonton. Tidak membutuhkan koin, saldo, deposit, lock, taruhan, atau pembayaran untuk ikut bermain.',
  'Gold Coins':'Koin Gold',
  'Guest':'Tamu',
  'Halo':'Halo',
  'Hidden':'Tersembunyi',
  'LOCK':'KUNCI',
  'LOCKED':'TERKUNCI',
  'Left':'Tersisa',
  'Live, komunitas, dan postingan dari pengguna SYS STREAM.':'Live, komunitas, dan postingan dari pengguna SYS STREAM.',
  'Lock minimum':'Minimum Lock',
  'Lock saldo untuk mendapatkan hak claim Blind Box harian':'Kunci saldo untuk mendapatkan hak klaim Blind Box harian',
  'Login wallet gagal.':'Login wallet gagal.',
  'NOWPayments minimum for this network':'Minimum NOWPayments untuk jaringan ini',
  'Open Daily Box':'Buka Daily Box',
  'Payment creation failed':'Pembuatan pembayaran gagal',
  'Platform minimum':'Minimum platform',
  'Players invited by your Tier 1 direct referees.':'Pemain yang diundang oleh referral langsung Tier 1 Anda.',
  'Players invited down the tree by your Tier 2 network.':'Pemain yang diundang melalui jaringan Tier 2 Anda.',
  'Players who register directly via your personal link or referral code.':'Pemain yang mendaftar langsung melalui link atau kode referral Anda.',
  'Quota resets in':'Kuota direset dalam',
  'REMAINING':'TERSISA',
  'Rate and minimum are checked live by NOWPayments when the payment is created.':'Rate dan minimum diperiksa secara langsung oleh NOWPayments saat pembayaran dibuat.',
  'Room':'Room',
  'Selected Winner':'Pemenang Terpilih',
  'Spin Raffle Wheel':'Putar Roda Raffle',
  'Streamer & Viewer Interaction â€” Free to Play':'Interaksi Streamer & Penonton — Gratis untuk Bermain',
  'Tidak ada video atau streamer contoh. Tampilan ini hanya menampilkan data live yang benar-benar berasal dari room produksi.':'Tidak ada video atau streamer contoh. Tampilan ini hanya menampilkan data live yang benar-benar berasal dari room produksi.',
  'UNLOCKED':'TERBUKA',
  'Unboxing':'Buka Kotak',
  'Use NOWPayments minimum':'Gunakan minimum NOWPayments',
  'User':'Pengguna',
  'Verifikasi tanda tangan wallet gagal.':'Verifikasi tanda tangan wallet gagal.',
  'Viewers':'Penonton',
  'Visible':'Terlihat',
  'Your account balance has been updated.':'Saldo akun Anda telah diperbarui.',
  'aktif':'aktif',
  'to activate':'untuk mengaktifkan'
});


/* Translation-only audit patch: user-facing hardcoded labels/messages.
   No application logic, routes, data, API, styling, or behavior is changed. */
const TRANSLATION_ONLY_USER_AUDIT: Record<LanguageCode, Record<string, string>> = {
  id: {
    "SYS STREAM LOADING":"SYS STREAM sedang dimuat",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"Menyiapkan sinkronisasi TikTok Live + koneksi Cloudflare D1",
    "Mining SYS dari Blind Box Lock":"Mining SYS dari Blind Box Lock",
    "Verify your email":"Verifikasi email Anda",
    "Privacy Policy":"Kebijakan Privasi",
    "Membuka SYS STREAM Airdrop...":"Membuka Airdrop SYS STREAM...",
    "Aplikasi gagal dimuat":"Aplikasi gagal dimuat",
    "Loading...":"Memuat...",
    "Mining":"Mining",
    "Wallet":"Wallet",
    "Menu":"Menu",
    "Masuk Akun SYS Utama":"Masuk ke Akun Utama SYS",
    "Menu Blind Box 3D":"Menu Blind Box 3D",
    "Pengaturan Akun & Dompet Game":"Pengaturan Akun & Dompet Game",
    "Keluar Akun":"Keluar Akun",
    "Masuk untuk Mulai Main Blind Box":"Masuk untuk mulai bermain Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!":"Anda sudah mengklaim Blind Box hari ini!",
    "Status Deposit Aktif":"Status Deposit Aktif",
    "Buka Kunci":"Buka Kunci",
    "Masa Kunci Berjalan":"Masa Kunci Berjalan",
    "Opsi Buka Kunci Saldo:":"Opsi Buka Kunci Saldo:",
    "Min. 50 Ribu":"Min. 50 Ribu",
    "Nominal minimal deposit adalah Rp 50.000!":"Nominal minimal deposit adalah Rp 50.000!",
    "Processing...":"Memproses...",
    "Claim Bonus":"Klaim Bonus",
    "Locked Balance":"Saldo Terkunci",
    "Remove":"Hapus",
    "Selected Winner":"Pemenang Terpilih",
    "Spin Raffle Wheel":"Putar Roda Undian",
    "Viewer Username Raffle Spinner":"Spinner Undian Username Penonton",
    "Live Participants Only":"Hanya Peserta Live",
    "Spinning for Winner...":"Memutar untuk menentukan pemenang...",
    "Recent Raffle Winners":"Pemenang Undian Terbaru",
    "Digital Crypto Card Number Guess":"Tebak Nomor Kartu Kripto",
    "Max 4":"Maks. 4",
    "Concealed":"Tersembunyi",
    "Streamer Card Settings":"Pengaturan Kartu Streamer",
    "Hidden":"Tersembunyi",
    "Visible":"Terlihat",
    "Serial Number":"Nomor Seri",
    "Withdrawal":"Penarikan",
    "Minimum withdrawal is":"Penarikan minimum adalah"
  },
  en: {
    "SYS STREAM LOADING":"SYS STREAM loading",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"Initializing TikTok Live Sync + Cloudflare D1 Connection",
    "Mining SYS dari Blind Box Lock":"Mine SYS from Blind Box Lock",
    "Verify your email":"Verify your email",
    "Privacy Policy":"Privacy Policy",
    "Membuka SYS STREAM Airdrop...":"Opening SYS STREAM Airdrop...",
    "Aplikasi gagal dimuat":"The application failed to load",
    "Loading...":"Loading...",
    "Mining":"Mining",
    "Wallet":"Wallet",
    "Menu":"Menu",
    "Masuk Akun SYS Utama":"Sign in to the main SYS account",
    "Menu Blind Box 3D":"Blind Box 3D Menu",
    "Pengaturan Akun & Dompet Game":"Game Account & Wallet Settings",
    "Keluar Akun":"Log Out",
    "Masuk untuk Mulai Main Blind Box":"Sign in to start playing Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!":"You have already claimed today's Blind Box!",
    "Status Deposit Aktif":"Active Deposit Status",
    "Buka Kunci":"Unlock",
    "Masa Kunci Berjalan":"Lock Period in Progress",
    "Opsi Buka Kunci Saldo:":"Balance Unlock Options:",
    "Min. 50 Ribu":"Min. 50 Thousand",
    "Nominal minimal deposit adalah Rp 50.000!":"The minimum deposit amount is Rp 50,000!",
    "Processing...":"Processing...",
    "Claim Bonus":"Claim Bonus",
    "Locked Balance":"Locked Balance",
    "Remove":"Remove",
    "Selected Winner":"Selected Winner",
    "Spin Raffle Wheel":"Spin Raffle Wheel",
    "Viewer Username Raffle Spinner":"Viewer Username Raffle Spinner",
    "Live Participants Only":"Live Participants Only",
    "Spinning for Winner...":"Spinning for Winner...",
    "Recent Raffle Winners":"Recent Raffle Winners",
    "Digital Crypto Card Number Guess":"Digital Crypto Card Number Guess",
    "Max 4":"Max 4",
    "Concealed":"Concealed",
    "Streamer Card Settings":"Streamer Card Settings",
    "Hidden":"Hidden",
    "Visible":"Visible",
    "Serial Number":"Serial Number",
    "Withdrawal":"Withdrawal",
    "Minimum withdrawal is":"Minimum withdrawal is"
  },
  es: {
    "SYS STREAM LOADING":"Cargando SYS STREAM",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"Inicializando la sincronización de TikTok Live + conexión Cloudflare D1",
    "Mining SYS dari Blind Box Lock":"Minar SYS con Blind Box Lock",
    "Verify your email":"Verifica tu correo electrónico",
    "Privacy Policy":"Política de privacidad",
    "Membuka SYS STREAM Airdrop...":"Abriendo el Airdrop de SYS STREAM...",
    "Aplikasi gagal dimuat":"No se pudo cargar la aplicación",
    "Loading...":"Cargando...",
    "Mining":"Minería",
    "Wallet":"Wallet",
    "Menu":"Menú",
    "Masuk Akun SYS Utama":"Iniciar sesión en la cuenta principal de SYS",
    "Menu Blind Box 3D":"Menú Blind Box 3D",
    "Pengaturan Akun & Dompet Game":"Configuración de cuenta y wallet del juego",
    "Keluar Akun":"Cerrar sesión",
    "Masuk untuk Mulai Main Blind Box":"Inicia sesión para jugar a Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!":"¡Ya has reclamado el Blind Box de hoy!",
    "Status Deposit Aktif":"Estado del depósito activo",
    "Buka Kunci":"Desbloquear",
    "Masa Kunci Berjalan":"Periodo de bloqueo en curso",
    "Opsi Buka Kunci Saldo:":"Opciones para desbloquear el saldo:",
    "Min. 50 Ribu":"Mín. 50 mil",
    "Nominal minimal deposit adalah Rp 50.000!":"El depósito mínimo es de Rp 50.000.",
    "Processing...":"Procesando...",
    "Claim Bonus":"Reclamar bono",
    "Locked Balance":"Saldo bloqueado",
    "Remove":"Eliminar",
    "Selected Winner":"Ganador seleccionado",
    "Spin Raffle Wheel":"Girar la ruleta",
    "Viewer Username Raffle Spinner":"Ruleta de nombres de espectadores",
    "Live Participants Only":"Solo participantes en vivo",
    "Spinning for Winner...":"Girando para elegir al ganador...",
    "Recent Raffle Winners":"Ganadores recientes",
    "Digital Crypto Card Number Guess":"Adivina el número de tarjeta cripto",
    "Max 4":"Máx. 4",
    "Concealed":"Oculto",
    "Streamer Card Settings":"Configuración de tarjeta del streamer",
    "Hidden":"Oculto",
    "Visible":"Visible",
    "Serial Number":"Número de serie",
    "Withdrawal":"Retiro",
    "Minimum withdrawal is":"El retiro mínimo es"
  },
  pt: {
    "SYS STREAM LOADING":"Carregando SYS STREAM",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"Inicializando a sincronização do TikTok Live + conexão Cloudflare D1",
    "Mining SYS dari Blind Box Lock":"Minerar SYS com Blind Box Lock",
    "Verify your email":"Verifique seu e-mail",
    "Privacy Policy":"Política de Privacidade",
    "Membuka SYS STREAM Airdrop...":"Abrindo o Airdrop SYS STREAM...",
    "Aplikasi gagal dimuat":"Falha ao carregar o aplicativo",
    "Loading...":"Carregando...",
    "Mining":"Mineração",
    "Wallet":"Carteira",
    "Menu":"Menu",
    "Masuk Akun SYS Utama":"Entrar na conta principal SYS",
    "Menu Blind Box 3D":"Menu Blind Box 3D",
    "Pengaturan Akun & Dompet Game":"Configurações da conta e carteira do jogo",
    "Keluar Akun":"Sair",
    "Masuk untuk Mulai Main Blind Box":"Entre para começar a jogar Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!":"Você já resgatou o Blind Box de hoje!",
    "Status Deposit Aktif":"Status do depósito ativo",
    "Buka Kunci":"Desbloquear",
    "Masa Kunci Berjalan":"Período de bloqueio em andamento",
    "Opsi Buka Kunci Saldo:":"Opções para desbloquear o saldo:",
    "Min. 50 Ribu":"Mín. 50 mil",
    "Nominal minimal deposit adalah Rp 50.000!":"O depósito mínimo é de Rp 50.000!",
    "Processing...":"Processando...",
    "Claim Bonus":"Resgatar bônus",
    "Locked Balance":"Saldo bloqueado",
    "Remove":"Remover",
    "Selected Winner":"Vencedor selecionado",
    "Spin Raffle Wheel":"Girar a roleta",
    "Viewer Username Raffle Spinner":"Roleta de nomes dos espectadores",
    "Live Participants Only":"Somente participantes ao vivo",
    "Spinning for Winner...":"Girando para escolher o vencedor...",
    "Recent Raffle Winners":"Vencedores recentes",
    "Digital Crypto Card Number Guess":"Adivinhe o número do cartão cripto",
    "Max 4":"Máx. 4",
    "Concealed":"Oculto",
    "Streamer Card Settings":"Configurações do cartão do streamer",
    "Hidden":"Oculto",
    "Visible":"Visível",
    "Serial Number":"Número de série",
    "Withdrawal":"Saque",
    "Minimum withdrawal is":"O saque mínimo é"
  },
  zh: {
    "SYS STREAM LOADING":"æ­£åœ¨åŠ è½½ SYS STREAM",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"æ­£åœ¨åˆå§‹åŒ– TikTok Live åŒæ­¥å’Œ Cloudflare D1 è¿žæŽ¥",
    "Mining SYS dari Blind Box Lock":"é€šè¿‡ Blind Box Lock æŒ–çŸ¿ SYS",
    "Verify your email":"éªŒè¯æ‚¨çš„é‚®ç®±",
    "Privacy Policy":"éšç§æ”¿ç­–",
    "Membuka SYS STREAM Airdrop...":"æ­£åœ¨æ‰“å¼€ SYS STREAM ç©ºæŠ•...",
    "Aplikasi gagal dimuat":"åº”ç”¨åŠ è½½å¤±è´¥",
    "Loading...":"åŠ è½½ä¸­...",
    "Mining":"æŒ–çŸ¿",
    "Wallet":"é’±åŒ…",
    "Menu":"èœå•",
    "Masuk Akun SYS Utama":"ç™»å½• SYS ä¸»è´¦æˆ·",
    "Menu Blind Box 3D":"Blind Box 3D èœå•",
    "Pengaturan Akun & Dompet Game":"æ¸¸æˆè´¦æˆ·å’Œé’±åŒ…è®¾ç½®",
    "Keluar Akun":"é€€å‡ºç™»å½•",
    "Masuk untuk Mulai Main Blind Box":"ç™»å½•åŽå¼€å§‹çŽ© Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!":"æ‚¨ä»Šå¤©å·²ç»é¢†å–è¿‡ Blind Boxï¼",
    "Status Deposit Aktif":"æœ‰æ•ˆå……å€¼çŠ¶æ€",
    "Buka Kunci":"è§£é”",
    "Masa Kunci Berjalan":"é”å®šæœŸé™è¿›è¡Œä¸­",
    "Opsi Buka Kunci Saldo:":"ä½™é¢è§£é”é€‰é¡¹ï¼š",
    "Min. 50 Ribu":"æœ€ä½Ž 5 ä¸‡",
    "Nominal minimal deposit adalah Rp 50.000!":"æœ€ä½Žå……å€¼é‡‘é¢ä¸º Rp 50,000ï¼",
    "Processing...":"å¤„ç†ä¸­...",
    "Claim Bonus":"é¢†å–å¥–åŠ±",
    "Locked Balance":"é”å®šä½™é¢",
    "Remove":"ç§»é™¤",
    "Selected Winner":"é€‰ä¸­çš„èŽ·èƒœè€…",
    "Spin Raffle Wheel":"æ—‹è½¬æŠ½å¥–è½¬ç›˜",
    "Viewer Username Raffle Spinner":"è§‚ä¼—ç”¨æˆ·åæŠ½å¥–è½¬ç›˜",
    "Live Participants Only":"ä»…é™ç›´æ’­å‚ä¸Žè€…",
    "Spinning for Winner...":"æ­£åœ¨æ—‹è½¬é€‰æ‹©èŽ·èƒœè€…...",
    "Recent Raffle Winners":"è¿‘æœŸæŠ½å¥–èŽ·èƒœè€…",
    "Digital Crypto Card Number Guess":"æ•°å­—åŠ å¯†å¡å·ç ç«žçŒœ",
    "Max 4":"æœ€å¤š 4",
    "Concealed":"éšè—",
    "Streamer Card Settings":"ä¸»æ’­å¡ç‰‡è®¾ç½®",
    "Hidden":"éšè—",
    "Visible":"å¯è§",
    "Serial Number":"åºåˆ—å·",
    "Withdrawal":"æçŽ°",
    "Minimum withdrawal is":"æœ€ä½ŽæçŽ°é‡‘é¢ä¸º"
  },
  ja: {
    "SYS STREAM LOADING":"SYS STREAMã‚’èª­ã¿è¾¼ã¿ä¸­",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"TikTok LiveåŒæœŸã¨Cloudflare D1æŽ¥ç¶šã‚’åˆæœŸåŒ–ä¸­",
    "Mining SYS dari Blind Box Lock":"Blind Box Lockã§SYSã‚’ãƒžã‚¤ãƒ‹ãƒ³ã‚°",
    "Verify your email":"ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹ã‚’ç¢ºèªã—ã¦ãã ã•ã„",
    "Privacy Policy":"ãƒ—ãƒ©ã‚¤ãƒã‚·ãƒ¼ãƒãƒªã‚·ãƒ¼",
    "Membuka SYS STREAM Airdrop...":"SYS STREAM Airdropã‚’é–‹ã„ã¦ã„ã¾ã™...",
    "Aplikasi gagal dimuat":"ã‚¢ãƒ—ãƒªã®èª­ã¿è¾¼ã¿ã«å¤±æ•—ã—ã¾ã—ãŸ",
    "Loading...":"èª­ã¿è¾¼ã¿ä¸­...",
    "Mining":"ãƒžã‚¤ãƒ‹ãƒ³ã‚°",
    "Wallet":"ã‚¦ã‚©ãƒ¬ãƒƒãƒˆ",
    "Menu":"ãƒ¡ãƒ‹ãƒ¥ãƒ¼",
    "Masuk Akun SYS Utama":"SYSãƒ¡ã‚¤ãƒ³ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã«ãƒ­ã‚°ã‚¤ãƒ³",
    "Menu Blind Box 3D":"Blind Box 3Dãƒ¡ãƒ‹ãƒ¥ãƒ¼",
    "Pengaturan Akun & Dompet Game":"ã‚²ãƒ¼ãƒ ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã¨ã‚¦ã‚©ãƒ¬ãƒƒãƒˆè¨­å®š",
    "Keluar Akun":"ãƒ­ã‚°ã‚¢ã‚¦ãƒˆ",
    "Masuk untuk Mulai Main Blind Box":"ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦Blind Boxã‚’é–‹å§‹",
    "Anda Sudah Mengklaim Blind Box Hari Ini!":"æœ¬æ—¥ã®Blind Boxã¯ã™ã§ã«å—ã‘å–ã‚Šæ¸ˆã¿ã§ã™ï¼",
    "Status Deposit Aktif":"æœ‰åŠ¹ãªå…¥é‡‘ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹",
    "Buka Kunci":"ãƒ­ãƒƒã‚¯è§£é™¤",
    "Masa Kunci Berjalan":"ãƒ­ãƒƒã‚¯æœŸé–“é€²è¡Œä¸­",
    "Opsi Buka Kunci Saldo:":"æ®‹é«˜ãƒ­ãƒƒã‚¯è§£é™¤ã‚ªãƒ—ã‚·ãƒ§ãƒ³ï¼š",
    "Min. 50 Ribu":"æœ€ä½Ž5ä¸‡",
    "Nominal minimal deposit adalah Rp 50.000!":"æœ€ä½Žå…¥é‡‘é¡ã¯Rp 50,000ã§ã™ï¼",
    "Processing...":"å‡¦ç†ä¸­...",
    "Claim Bonus":"ãƒœãƒ¼ãƒŠã‚¹ã‚’å—ã‘å–ã‚‹",
    "Locked Balance":"ãƒ­ãƒƒã‚¯æ®‹é«˜",
    "Remove":"å‰Šé™¤",
    "Selected Winner":"é¸ã°ã‚ŒãŸå½“é¸è€…",
    "Spin Raffle Wheel":"æŠ½é¸ãƒ›ã‚¤ãƒ¼ãƒ«ã‚’å›žã™",
    "Viewer Username Raffle Spinner":"è¦–è´è€…ãƒ¦ãƒ¼ã‚¶ãƒ¼åæŠ½é¸ã‚¹ãƒ”ãƒŠãƒ¼",
    "Live Participants Only":"ãƒ©ã‚¤ãƒ–å‚åŠ è€…ã®ã¿",
    "Spinning for Winner...":"å½“é¸è€…ã‚’é¸ã¶ãŸã‚ã«å›žè»¢ä¸­...",
    "Recent Raffle Winners":"æœ€è¿‘ã®æŠ½é¸å½“é¸è€…",
    "Digital Crypto Card Number Guess":"ãƒ‡ã‚¸ã‚¿ãƒ«æš—å·ã‚«ãƒ¼ãƒ‰ç•ªå·å½“ã¦",
    "Max 4":"æœ€å¤§4",
    "Concealed":"éžè¡¨ç¤º",
    "Streamer Card Settings":"ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã‚«ãƒ¼ãƒ‰è¨­å®š",
    "Hidden":"éžè¡¨ç¤º",
    "Visible":"è¡¨ç¤º",
    "Serial Number":"ã‚·ãƒªã‚¢ãƒ«ç•ªå·",
    "Withdrawal":"å‡ºé‡‘",
    "Minimum withdrawal is":"æœ€ä½Žå‡ºé‡‘é¡ã¯"
  },
  ko: {
    "SYS STREAM LOADING":"SYS STREAM ë¡œë”© ì¤‘",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"TikTok Live ë™ê¸°í™” ë° Cloudflare D1 ì—°ê²° ì´ˆê¸°í™” ì¤‘",
    "Mining SYS dari Blind Box Lock":"Blind Box Lockìœ¼ë¡œ SYS ì±„êµ´",
    "Verify your email":"ì´ë©”ì¼ì„ ì¸ì¦í•˜ì„¸ìš”",
    "Privacy Policy":"ê°œì¸ì •ë³´ ì²˜ë¦¬ë°©ì¹¨",
    "Membuka SYS STREAM Airdrop...":"SYS STREAM ì—ì–´ë“œë¡­ì„ ì—¬ëŠ” ì¤‘...",
    "Aplikasi gagal dimuat":"ì•±ì„ ë¶ˆëŸ¬ì˜¤ì§€ ëª»í–ˆìŠµë‹ˆë‹¤",
    "Loading...":"ë¡œë”© ì¤‘...",
    "Mining":"ì±„êµ´",
    "Wallet":"ì§€ê°‘",
    "Menu":"ë©”ë‰´",
    "Masuk Akun SYS Utama":"SYS ê¸°ë³¸ ê³„ì • ë¡œê·¸ì¸",
    "Menu Blind Box 3D":"Blind Box 3D ë©”ë‰´",
    "Pengaturan Akun & Dompet Game":"ê²Œìž„ ê³„ì • ë° ì§€ê°‘ ì„¤ì •",
    "Keluar Akun":"ë¡œê·¸ì•„ì›ƒ",
    "Masuk untuk Mulai Main Blind Box":"ë¡œê·¸ì¸í•˜ì—¬ Blind Box ì‹œìž‘",
    "Anda Sudah Mengklaim Blind Box Hari Ini!":"ì˜¤ëŠ˜ì˜ Blind Boxë¥¼ ì´ë¯¸ ìˆ˜ë ¹í–ˆìŠµë‹ˆë‹¤!",
    "Status Deposit Aktif":"í™œì„± ì˜ˆì¹˜ê¸ˆ ìƒíƒœ",
    "Buka Kunci":"ìž ê¸ˆ í•´ì œ",
    "Masa Kunci Berjalan":"ìž ê¸ˆ ê¸°ê°„ ì§„í–‰ ì¤‘",
    "Opsi Buka Kunci Saldo:":"ìž”ì•¡ ìž ê¸ˆ í•´ì œ ì˜µì…˜:",
    "Min. 50 Ribu":"ìµœì†Œ 5ë§Œ",
    "Nominal minimal deposit adalah Rp 50.000!":"ìµœì†Œ ì˜ˆì¹˜ ê¸ˆì•¡ì€ Rp 50,000ìž…ë‹ˆë‹¤!",
    "Processing...":"ì²˜ë¦¬ ì¤‘...",
    "Claim Bonus":"ë³´ë„ˆìŠ¤ ë°›ê¸°",
    "Locked Balance":"ìž ê¸ˆ ìž”ì•¡",
    "Remove":"ì‚­ì œ",
    "Selected Winner":"ì„ ì •ëœ ë‹¹ì²¨ìž",
    "Spin Raffle Wheel":"ì¶”ì²¨ íœ  ëŒë¦¬ê¸°",
    "Viewer Username Raffle Spinner":"ì‹œì²­ìž ì‚¬ìš©ìžëª… ì¶”ì²¨ ìŠ¤í”¼ë„ˆ",
    "Live Participants Only":"ë¼ì´ë¸Œ ì°¸ê°€ìžë§Œ",
    "Spinning for Winner...":"ë‹¹ì²¨ìžë¥¼ ì„ íƒí•˜ëŠ” ì¤‘...",
    "Recent Raffle Winners":"ìµœê·¼ ì¶”ì²¨ ë‹¹ì²¨ìž",
    "Digital Crypto Card Number Guess":"ë””ì§€í„¸ ì•”í˜¸ ì¹´ë“œ ë²ˆí˜¸ ë§žížˆê¸°",
    "Max 4":"ìµœëŒ€ 4",
    "Concealed":"ìˆ¨ê¹€",
    "Streamer Card Settings":"ìŠ¤íŠ¸ë¦¬ë¨¸ ì¹´ë“œ ì„¤ì •",
    "Hidden":"ìˆ¨ê¹€",
    "Visible":"í‘œì‹œ",
    "Serial Number":"ì¼ë ¨ ë²ˆí˜¸",
    "Withdrawal":"ì¶œê¸ˆ",
    "Minimum withdrawal is":"ìµœì†Œ ì¶œê¸ˆì•¡ì€"
  },
  ar: {
    "SYS STREAM LOADING":"جارٍ تحميل SYS STREAM",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"جارٍ تهيئة مزامنة TikTok Live واتصال Cloudflare D1",
    "Mining SYS dari Blind Box Lock":"تعدين SYS عبر Blind Box Lock",
    "Verify your email":"تحقق من بريدك الإلكتروني",
    "Privacy Policy":"سياسة الخصوصية",
    "Membuka SYS STREAM Airdrop...":"جارٍ فتح إيردروب SYS STREAM...",
    "Aplikasi gagal dimuat":"تعذر تحميل التطبيق",
    "Loading...":"جارٍ التحميل...",
    "Mining":"التعدين",
    "Wallet":"المحفظة",
    "Menu":"القائمة",
    "Masuk Akun SYS Utama":"تسجيل الدخول إلى حساب SYS الرئيسي",
    "Menu Blind Box 3D":"قائمة Blind Box 3D",
    "Pengaturan Akun & Dompet Game":"إعدادات حساب اللعبة والمحفظة",
    "Keluar Akun":"تسجيل الخروج",
    "Masuk untuk Mulai Main Blind Box":"سجّل الدخول لبدء لعب Blind Box",
    "Anda Sudah Mengklaim Blind Box Hari Ini!":"لقد استلمت Blind Box اليوم بالفعل!",
    "Status Deposit Aktif":"حالة الإيداع النشط",
    "Buka Kunci":"فتح القفل",
    "Masa Kunci Berjalan":"فترة القفل جارية",
    "Opsi Buka Kunci Saldo:":"خيارات فتح قفل الرصيد:",
    "Min. 50 Ribu":"الحد الأدنى 50 ألف",
    "Nominal minimal deposit adalah Rp 50.000!":"الحد الأدنى للإيداع هو Rp 50,000!",
    "Processing...":"جارٍ المعالجة...",
    "Claim Bonus":"استلام المكافأة",
    "Locked Balance":"الرصيد المقفل",
    "Remove":"إزالة",
    "Selected Winner":"الفائز المختار",
    "Spin Raffle Wheel":"تدوير عجلة السحب",
    "Viewer Username Raffle Spinner":"عجلة سحب أسماء المشاهدين",
    "Live Participants Only":"المشاركون المباشرون فقط",
    "Spinning for Winner...":"جارٍ تدوير العجلة لاختيار الفائز...",
    "Recent Raffle Winners":"الفائزون الأخيرون في السحب",
    "Digital Crypto Card Number Guess":"تخمين رقم بطاقة العملات الرقمية",
    "Max 4":"الحد الأقصى 4",
    "Concealed":"مخفي",
    "Streamer Card Settings":"إعدادات بطاقة الستريمر",
    "Hidden":"مخفي",
    "Visible":"ظاهر",
    "Serial Number":"الرقم التسلسلي",
    "Withdrawal":"السحب",
    "Minimum withdrawal is":"الحد الأدنى للسحب هو"
  }
};


/*
 * Translation corrections only.
 * This block intentionally changes display text only.
 * No application logic, routes, data, API, styling, or behavior is changed.
 */
const TRANSLATION_CORRECTIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    "Mining SYS dari Blind Box Lock":"Menambang SYS dari Blind Box Lock",
    "Mining":"Penambangan",
    "Wallet":"Dompet",
    "Menu":"Menu",
    "Processing...":"Memproses...",
    "Claim Bonus":"Klaim Bonus",
    "Locked Balance":"Saldo Terkunci",
    "Remove":"Hapus",
    "Selected Winner":"Pemenang Terpilih",
    "Spin Raffle Wheel":"Putar Roda Undian",
    "Viewer Username Raffle Spinner":"Spinner Undian Nama Penonton",
    "Live Participants Only":"Hanya Peserta Live",
    "Spinning for Winner...":"Sedang memilih pemenang...",
    "Recent Raffle Winners":"Pemenang Undian Terbaru",
    "Digital Crypto Card Number Guess":"Tebak Nomor Kartu Kripto Digital",
    "Max 4":"Maks. 4",
    "Concealed":"Tersembunyi",
    "Streamer Card Settings":"Pengaturan Kartu Streamer",
    "Hidden":"Tersembunyi",
    "Visible":"Terlihat",
    "Serial Number":"Nomor Seri",
    "Withdrawal":"Penarikan",
    "Minimum withdrawal is":"Penarikan minimum adalah",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"Menyiapkan Sinkronisasi TikTok Live + Koneksi Cloudflare D1",
    "Verify your email":"Verifikasi email Anda",
    "Privacy Policy":"Kebijakan Privasi",
    "Loading...":"Memuat...",
    "Aplikasi gagal dimuat":"Aplikasi gagal dimuat",
    "Wallet Identity":"Identitas Dompet",
    "Wallet Connected":"Dompet Terhubung",
    "Connect Wallet":"Hubungkan Dompet",
    "Register Now":"Daftar Sekarang",
    "Remember me":"Ingat saya",
    "Forgot Password?":"Lupa Kata Sandi?",
    "Sign in to continue streaming and gaming":"Masuk untuk melanjutkan streaming dan bermain",
    "LOGIN / REGISTER":"MASUK / DAFTAR",
    "CHAT":"OBROLAN",
    "PESERTA":"PESERTA",
    "WIN":"MENANG",
    "Reward":"Hadiah",
    "Status":"Status",
    "Terms & Conditions":"Syarat & Ketentuan"
  },
  en: {},
  es: {
    "Mining SYS dari Blind Box Lock":"Minar SYS con Blind Box Lock",
    "Mining":"Minería",
    "Wallet":"Billetera",
    "Menu":"Menú",
    "Processing...":"Procesando...",
    "Claim Bonus":"Reclamar bono",
    "Locked Balance":"Saldo bloqueado",
    "Remove":"Eliminar",
    "Selected Winner":"Ganador seleccionado",
    "Spin Raffle Wheel":"Girar la ruleta",
    "Viewer Username Raffle Spinner":"Ruleta de nombres de espectadores",
    "Live Participants Only":"Solo participantes en directo",
    "Spinning for Winner...":"Girando para elegir al ganador...",
    "Recent Raffle Winners":"Ganadores recientes del sorteo",
    "Digital Crypto Card Number Guess":"Adivina el número de tarjeta criptográfica",
    "Max 4":"Máx. 4",
    "Concealed":"Oculto",
    "Streamer Card Settings":"Configuración de tarjeta del streamer",
    "Hidden":"Oculto",
    "Visible":"Visible",
    "Serial Number":"Número de serie",
    "Withdrawal":"Retiro",
    "Minimum withdrawal is":"El retiro mínimo es",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"Inicializando la sincronización de TikTok Live + conexión de Cloudflare D1",
    "Verify your email":"Verifica tu correo electrónico",
    "Privacy Policy":"Política de privacidad",
    "Loading...":"Cargando...",
    "Aplikasi gagal dimuat":"No se pudo cargar la aplicación",
    "Wallet Identity":"Identidad de la billetera",
    "Wallet Connected":"Billetera conectada",
    "Connect Wallet":"Conectar billetera",
    "Register Now":"Registrarse ahora",
    "Remember me":"Recordarme",
    "Forgot Password?":"¿Olvidaste la contraseña?",
    "Sign in to continue streaming and gaming":"Inicia sesión para continuar con el streaming y los juegos",
    "LOGIN / REGISTER":"INICIAR SESIÓN / REGISTRARSE",
    "CHAT":"CHAT",
    "PESERTA":"PARTICIPANTES",
    "WIN":"GANAR",
    "Reward":"Recompensa",
    "Status":"Estado",
    "Terms & Conditions":"Términos y condiciones"
  },
  pt: {
    "Mining SYS dari Blind Box Lock":"Minerar SYS com Blind Box Lock",
    "Mining":"Mineração",
    "Wallet":"Carteira",
    "Menu":"Menu",
    "Processing...":"Processando...",
    "Claim Bonus":"Resgatar bônus",
    "Locked Balance":"Saldo bloqueado",
    "Remove":"Remover",
    "Selected Winner":"Vencedor selecionado",
    "Spin Raffle Wheel":"Girar a roleta",
    "Viewer Username Raffle Spinner":"Roleta de nomes dos espectadores",
    "Live Participants Only":"Somente participantes ao vivo",
    "Spinning for Winner...":"Girando para escolher o vencedor...",
    "Recent Raffle Winners":"Vencedores recentes do sorteio",
    "Digital Crypto Card Number Guess":"Adivinhe o número do cartão criptográfico",
    "Max 4":"Máx. 4",
    "Concealed":"Oculto",
    "Streamer Card Settings":"Configurações do cartão do streamer",
    "Hidden":"Oculto",
    "Visible":"Visível",
    "Serial Number":"Número de série",
    "Withdrawal":"Saque",
    "Minimum withdrawal is":"O saque mínimo é",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"Inicializando a sincronização do TikTok Live + conexão do Cloudflare D1",
    "Verify your email":"Verifique seu e-mail",
    "Privacy Policy":"Política de Privacidade",
    "Loading...":"Carregando...",
    "Aplikasi gagal dimuat":"Falha ao carregar o aplicativo",
    "Wallet Identity":"Identidade da carteira",
    "Wallet Connected":"Carteira conectada",
    "Connect Wallet":"Conectar carteira",
    "Register Now":"Registrar agora",
    "Remember me":"Lembrar de mim",
    "Forgot Password?":"Esqueceu a senha?",
    "Sign in to continue streaming and gaming":"Entre para continuar o streaming e os jogos",
    "LOGIN / REGISTER":"ENTRAR / REGISTRAR",
    "CHAT":"CHAT",
    "PESERTA":"PARTICIPANTES",
    "WIN":"VENCER",
    "Reward":"Recompensa",
    "Status":"Status",
    "Terms & Conditions":"Termos e condições"
  },
  zh: {
    "Mining SYS dari Blind Box Lock":"é€šè¿‡ Blind Box Lock æŒ–æŽ˜ SYS",
    "Mining":"æŒ–çŸ¿",
    "Wallet":"é’±åŒ…",
    "Menu":"èœå•",
    "Processing...":"å¤„ç†ä¸­...",
    "Claim Bonus":"é¢†å–å¥–åŠ±",
    "Locked Balance":"é”å®šä½™é¢",
    "Remove":"åˆ é™¤",
    "Selected Winner":"é€‰ä¸­çš„èŽ·èƒœè€…",
    "Spin Raffle Wheel":"æ—‹è½¬æŠ½å¥–è½¬ç›˜",
    "Viewer Username Raffle Spinner":"è§‚ä¼—ç”¨æˆ·åæŠ½å¥–è½¬ç›˜",
    "Live Participants Only":"ä»…é™ç›´æ’­å‚ä¸Žè€…",
    "Spinning for Winner...":"æ­£åœ¨é€‰æ‹©èŽ·èƒœè€…...",
    "Recent Raffle Winners":"è¿‘æœŸæŠ½å¥–èŽ·èƒœè€…",
    "Digital Crypto Card Number Guess":"æ•°å­—åŠ å¯†å¡å·ç ç«žçŒœ",
    "Max 4":"æœ€å¤š 4 ä½",
    "Concealed":"å·²éšè—",
    "Streamer Card Settings":"ä¸»æ’­å¡ç‰‡è®¾ç½®",
    "Hidden":"éšè—",
    "Visible":"å¯è§",
    "Serial Number":"åºåˆ—å·",
    "Withdrawal":"æçŽ°",
    "Minimum withdrawal is":"æœ€ä½ŽæçŽ°é‡‘é¢ä¸º",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"æ­£åœ¨åˆå§‹åŒ– TikTok Live åŒæ­¥å’Œ Cloudflare D1 è¿žæŽ¥",
    "Verify your email":"éªŒè¯æ‚¨çš„é‚®ç®±",
    "Privacy Policy":"éšç§æ”¿ç­–",
    "Loading...":"åŠ è½½ä¸­...",
    "Aplikasi gagal dimuat":"åº”ç”¨åŠ è½½å¤±è´¥",
    "Wallet Identity":"é’±åŒ…èº«ä»½",
    "Wallet Connected":"é’±åŒ…å·²è¿žæŽ¥",
    "Connect Wallet":"è¿žæŽ¥é’±åŒ…",
    "Register Now":"ç«‹å³æ³¨å†Œ",
    "Remember me":"è®°ä½æˆ‘",
    "Forgot Password?":"å¿˜è®°å¯†ç ï¼Ÿ",
    "Sign in to continue streaming and gaming":"ç™»å½•ä»¥ç»§ç»­ç›´æ’­å’Œæ¸¸æˆ",
    "LOGIN / REGISTER":"ç™»å½• / æ³¨å†Œ",
    "CHAT":"èŠå¤©",
    "PESERTA":"å‚ä¸Žè€…",
    "WIN":"èŽ·èƒœ",
    "Reward":"å¥–åŠ±",
    "Status":"çŠ¶æ€",
    "Terms & Conditions":"æ¡æ¬¾ä¸Žæ¡ä»¶"
  },
  ja: {
    "Mining SYS dari Blind Box Lock":"Blind Box Lockã§SYSã‚’ãƒžã‚¤ãƒ‹ãƒ³ã‚°",
    "Mining":"ãƒžã‚¤ãƒ‹ãƒ³ã‚°",
    "Wallet":"ã‚¦ã‚©ãƒ¬ãƒƒãƒˆ",
    "Menu":"ãƒ¡ãƒ‹ãƒ¥ãƒ¼",
    "Processing...":"å‡¦ç†ä¸­...",
    "Claim Bonus":"ãƒœãƒ¼ãƒŠã‚¹ã‚’å—ã‘å–ã‚‹",
    "Locked Balance":"ãƒ­ãƒƒã‚¯æ®‹é«˜",
    "Remove":"å‰Šé™¤",
    "Selected Winner":"é¸ã°ã‚ŒãŸå½“é¸è€…",
    "Spin Raffle Wheel":"æŠ½é¸ãƒ›ã‚¤ãƒ¼ãƒ«ã‚’å›žã™",
    "Viewer Username Raffle Spinner":"è¦–è´è€…ãƒ¦ãƒ¼ã‚¶ãƒ¼åæŠ½é¸ã‚¹ãƒ”ãƒŠãƒ¼",
    "Live Participants Only":"ãƒ©ã‚¤ãƒ–å‚åŠ è€…ã®ã¿",
    "Spinning for Winner...":"å½“é¸è€…ã‚’é¸æŠžä¸­...",
    "Recent Raffle Winners":"æœ€è¿‘ã®æŠ½é¸å½“é¸è€…",
    "Digital Crypto Card Number Guess":"ãƒ‡ã‚¸ã‚¿ãƒ«æš—å·ã‚«ãƒ¼ãƒ‰ç•ªå·å½“ã¦",
    "Max 4":"æœ€å¤§4æ¡",
    "Concealed":"éžè¡¨ç¤º",
    "Streamer Card Settings":"ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã‚«ãƒ¼ãƒ‰è¨­å®š",
    "Hidden":"éžè¡¨ç¤º",
    "Visible":"è¡¨ç¤º",
    "Serial Number":"ã‚·ãƒªã‚¢ãƒ«ç•ªå·",
    "Withdrawal":"å‡ºé‡‘",
    "Minimum withdrawal is":"æœ€ä½Žå‡ºé‡‘é¡ã¯",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"TikTok LiveåŒæœŸã¨Cloudflare D1æŽ¥ç¶šã‚’åˆæœŸåŒ–ä¸­",
    "Verify your email":"ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹ã‚’ç¢ºèªã—ã¦ãã ã•ã„",
    "Privacy Policy":"ãƒ—ãƒ©ã‚¤ãƒã‚·ãƒ¼ãƒãƒªã‚·ãƒ¼",
    "Loading...":"èª­ã¿è¾¼ã¿ä¸­...",
    "Aplikasi gagal dimuat":"ã‚¢ãƒ—ãƒªã®èª­ã¿è¾¼ã¿ã«å¤±æ•—ã—ã¾ã—ãŸ",
    "Wallet Identity":"ã‚¦ã‚©ãƒ¬ãƒƒãƒˆID",
    "Wallet Connected":"ã‚¦ã‚©ãƒ¬ãƒƒãƒˆæŽ¥ç¶šæ¸ˆã¿",
    "Connect Wallet":"ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚’æŽ¥ç¶š",
    "Register Now":"ä»Šã™ãç™»éŒ²",
    "Remember me":"ãƒ­ã‚°ã‚¤ãƒ³æƒ…å ±ã‚’ä¿å­˜",
    "Forgot Password?":"ãƒ‘ã‚¹ãƒ¯ãƒ¼ãƒ‰ã‚’ãŠå¿˜ã‚Œã§ã™ã‹ï¼Ÿ",
    "Sign in to continue streaming and gaming":"ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦ã‚¹ãƒˆãƒªãƒ¼ãƒŸãƒ³ã‚°ã¨ã‚²ãƒ¼ãƒ ã‚’ç¶šã‘ã‚‹",
    "LOGIN / REGISTER":"ãƒ­ã‚°ã‚¤ãƒ³ / ç™»éŒ²",
    "CHAT":"ãƒãƒ£ãƒƒãƒˆ",
    "PESERTA":"å‚åŠ è€…",
    "WIN":"å‹åˆ©",
    "Reward":"å ±é…¬",
    "Status":"ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹",
    "Terms & Conditions":"åˆ©ç”¨è¦ç´„"
  },
  ko: {
    "Mining SYS dari Blind Box Lock":"Blind Box Lockìœ¼ë¡œ SYS ì±„êµ´",
    "Mining":"ì±„êµ´",
    "Wallet":"ì§€ê°‘",
    "Menu":"ë©”ë‰´",
    "Processing...":"ì²˜ë¦¬ ì¤‘...",
    "Claim Bonus":"ë³´ë„ˆìŠ¤ ë°›ê¸°",
    "Locked Balance":"ìž ê¸ˆ ìž”ì•¡",
    "Remove":"ì‚­ì œ",
    "Selected Winner":"ì„ ì •ëœ ë‹¹ì²¨ìž",
    "Spin Raffle Wheel":"ì¶”ì²¨ íœ  ëŒë¦¬ê¸°",
    "Viewer Username Raffle Spinner":"ì‹œì²­ìž ì‚¬ìš©ìžëª… ì¶”ì²¨ ìŠ¤í”¼ë„ˆ",
    "Live Participants Only":"ë¼ì´ë¸Œ ì°¸ê°€ìžë§Œ",
    "Spinning for Winner...":"ë‹¹ì²¨ìžë¥¼ ì„ íƒí•˜ëŠ” ì¤‘...",
    "Recent Raffle Winners":"ìµœê·¼ ì¶”ì²¨ ë‹¹ì²¨ìž",
    "Digital Crypto Card Number Guess":"ë””ì§€í„¸ ì•”í˜¸ ì¹´ë“œ ë²ˆí˜¸ ë§žížˆê¸°",
    "Max 4":"ìµœëŒ€ 4ìžë¦¬",
    "Concealed":"ìˆ¨ê¹€",
    "Streamer Card Settings":"ìŠ¤íŠ¸ë¦¬ë¨¸ ì¹´ë“œ ì„¤ì •",
    "Hidden":"ìˆ¨ê¹€",
    "Visible":"í‘œì‹œ",
    "Serial Number":"ì¼ë ¨ ë²ˆí˜¸",
    "Withdrawal":"ì¶œê¸ˆ",
    "Minimum withdrawal is":"ìµœì†Œ ì¶œê¸ˆì•¡ì€",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"TikTok Live ë™ê¸°í™” ë° Cloudflare D1 ì—°ê²° ì´ˆê¸°í™” ì¤‘",
    "Verify your email":"ì´ë©”ì¼ì„ ì¸ì¦í•˜ì„¸ìš”",
    "Privacy Policy":"ê°œì¸ì •ë³´ ì²˜ë¦¬ë°©ì¹¨",
    "Loading...":"ë¡œë”© ì¤‘...",
    "Aplikasi gagal dimuat":"ì•±ì„ ë¶ˆëŸ¬ì˜¤ì§€ ëª»í–ˆìŠµë‹ˆë‹¤",
    "Wallet Identity":"ì§€ê°‘ ID",
    "Wallet Connected":"ì§€ê°‘ ì—°ê²°ë¨",
    "Connect Wallet":"ì§€ê°‘ ì—°ê²°",
    "Register Now":"ì§€ê¸ˆ ê°€ìž…",
    "Remember me":"ë¡œê·¸ì¸ ìƒíƒœ ìœ ì§€",
    "Forgot Password?":"ë¹„ë°€ë²ˆí˜¸ë¥¼ ìžŠìœ¼ì…¨ë‚˜ìš”?",
    "Sign in to continue streaming and gaming":"ë¡œê·¸ì¸í•˜ì—¬ ìŠ¤íŠ¸ë¦¬ë°ê³¼ ê²Œìž„ì„ ê³„ì†í•˜ì„¸ìš”",
    "LOGIN / REGISTER":"ë¡œê·¸ì¸ / ê°€ìž…",
    "CHAT":"ì±„íŒ…",
    "PESERTA":"ì°¸ê°€ìž",
    "WIN":"ìŠ¹ë¦¬",
    "Reward":"ë³´ìƒ",
    "Status":"ìƒíƒœ",
    "Terms & Conditions":"ì´ìš©ì•½ê´€"
  },
  ar: {
    "Mining SYS dari Blind Box Lock":"تعدين SYS عبر Blind Box Lock",
    "Mining":"التعدين",
    "Wallet":"المحفظة",
    "Menu":"القائمة",
    "Processing...":"جارٍ المعالجة...",
    "Claim Bonus":"استلام المكافأة",
    "Locked Balance":"الرصيد المقفل",
    "Remove":"إزالة",
    "Selected Winner":"الفائز المختار",
    "Spin Raffle Wheel":"تدوير عجلة السحب",
    "Viewer Username Raffle Spinner":"عجلة سحب أسماء المشاهدين",
    "Live Participants Only":"المشاركون المباشرون فقط",
    "Spinning for Winner...":"جارٍ اختيار الفائز...",
    "Recent Raffle Winners":"الفائزون الأخيرون في السحب",
    "Digital Crypto Card Number Guess":"تخمين رقم بطاقة العملات الرقمية",
    "Max 4":"الحد الأقصى 4 أرقام",
    "Concealed":"مخفي",
    "Streamer Card Settings":"إعدادات بطاقة الستريمر",
    "Hidden":"مخفي",
    "Visible":"ظاهر",
    "Serial Number":"الرقم التسلسلي",
    "Withdrawal":"السحب",
    "Minimum withdrawal is":"الحد الأدنى للسحب هو",
    "Initializing TikTok Live Sync + Cloudflare D1 Connection":"جارٍ تهيئة مزامنة TikTok Live واتصال Cloudflare D1",
    "Verify your email":"تحقق من بريدك الإلكتروني",
    "Privacy Policy":"سياسة الخصوصية",
    "Loading...":"جارٍ التحميل...",
    "Aplikasi gagal dimuat":"تعذر تحميل التطبيق",
    "Wallet Identity":"هوية المحفظة",
    "Wallet Connected":"تم ربط المحفظة",
    "Connect Wallet":"ربط المحفظة",
    "Register Now":"سجّل الآن",
    "Remember me":"تذكرني",
    "Forgot Password?":"هل نسيت كلمة المرور؟",
    "Sign in to continue streaming and gaming":"سجّل الدخول لمتابعة البث والألعاب",
    "LOGIN / REGISTER":"تسجيل الدخول / التسجيل",
    "CHAT":"الدردشة",
    "PESERTA":"المشاركون",
    "WIN":"فوز",
    "Reward":"المكافأة",
    "Status":"الحالة",
    "Terms & Conditions":"الشروط والأحكام"
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
    "WebRTC/WHIP â€¢ ultra-low latency â€¢ kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • latensi sangat rendah • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.",
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
    "WebRTC/WHIP â€¢ ultra-low latency â€¢ kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • ultra-low latency • camera and microphone activate only after you press START LIVE.",
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
    "WebRTC/WHIP â€¢ ultra-low latency â€¢ kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • latencia ultrabaja • la cámara y el micrófono solo se activan al pulsar INICIAR LIVE.",
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
    "WebRTC/WHIP â€¢ ultra-low latency â€¢ kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • latência ultrabaixa • câmera e microfone só ficam ativos após INICIAR LIVE.",
    "Terms & Conditions": "Termos e condições",
    "Privacy Policy": "Política de Privacidade"
  },
  "zh": {
    "Membuka SYS STREAM Airdrop...": "正在打开 SYS STREAM 空投页面…",
    "Mining SYS dari Blind Box Lock": "é€šè¿‡ Blind Box Lock æŒ–æŽ˜ SYS",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "è‡³å°‘ $10 çš„æœ‰æ•ˆé”ä»“å¯å¯ç”¨æ¯æ—¥æŒ–çŸ¿å¥–åŠ±ã€‚",
    "Wallet": "é’±åŒ…",
    "Copy referral link": "å¤åˆ¶æŽ¨èé“¾æŽ¥",
    "Profile preview": "ä¸ªäººèµ„æ–™é¢„è§ˆ",
    "Mobile Live": "æ‰‹æœºç›´æ’­",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "æ­¤æµè§ˆå™¨ä¸æ”¯æŒç›´æ’­æ‘„åƒå¤´/éº¦å…‹é£Žã€‚è¯·é€šè¿‡ HTTPS ä½¿ç”¨æœ€æ–°ç‰ˆ Chrome/Safariã€‚",
    "SDP kamera tidak tersedia.": "æ‘„åƒå¤´ SDP ä¸å¯ç”¨",
    "Cloudflare menolak koneksi live dari browser.": "Cloudflare æ‹’ç»äº†æµè§ˆå™¨çš„ç›´æ’­è¿žæŽ¥ã€‚",
    "Kamera dan mikrofon sudah LIVE.": "æ‘„åƒå¤´å’Œéº¦å…‹é£Žå·²å¼€å§‹ç›´æ’­ã€‚",
    "Gagal memulai live dari HP.": "æ— æ³•å¼€å§‹æ‰‹æœºç›´æ’­ã€‚",
    "Live dari HP sudah dihentikan.": "æ‰‹æœºç›´æ’­å·²åœæ­¢ã€‚",
    "Live langsung dari kamera HP": "ç›´æŽ¥ä½¿ç”¨æ‰‹æœºæ‘„åƒå¤´ç›´æ’­",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "æ— éœ€ OBSã€‚å…è®¸æ‘„åƒå¤´å’Œéº¦å…‹é£Žæƒé™ï¼Œç„¶åŽç‚¹å‡»å¼€å§‹ç›´æ’­ã€‚",
    "Kamera siap digunakan": "æ‘„åƒå¤´å·²å‡†å¤‡å°±ç»ª",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "ç‚¹å‡»å¼€å§‹ä»¥è¯·æ±‚æ‘„åƒå¤´å’Œéº¦å…‹é£Žæƒé™ã€‚",
    "MENGHUBUNGKAN KE CLOUDFARE...": "正在连接 CLOUDFLARE…",
    "UNMUTE": "å–æ¶ˆé™éŸ³",
    "MIC": "éº¦å…‹é£Ž",
    "CAM OFF": "å…³é—­æ‘„åƒå¤´",
    "CAM": "æ‘„åƒå¤´",
    "MULAI LIVE": "å¼€å§‹ç›´æ’­",
    "STOP LIVE": "åœæ­¢ç›´æ’­",
    "READY": "å°±ç»ª",
    "WebRTC/WHIP â€¢ ultra-low latency â€¢ kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • 超低延迟 • 只有点击开始直播后摄像头和麦克风才会启用。",
    "Terms & Conditions": "æ¡æ¬¾ä¸Žæ¡ä»¶",
    "Privacy Policy": "éšç§æ”¿ç­–"
  },
  "ja": {
    "Membuka SYS STREAM Airdrop...": "SYS STREAM Airdropを開いています…",
    "Mining SYS dari Blind Box Lock": "Blind Box Lockã‹ã‚‰SYSã‚’ãƒžã‚¤ãƒ‹ãƒ³ã‚°",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "10ãƒ‰ãƒ«ä»¥ä¸Šã®æœ‰åŠ¹ãªãƒ­ãƒƒã‚¯ã§æ¯Žæ—¥ã®ãƒžã‚¤ãƒ‹ãƒ³ã‚°å ±é…¬ãŒæœ‰åŠ¹ã«ãªã‚Šã¾ã™ã€‚",
    "Wallet": "ã‚¦ã‚©ãƒ¬ãƒƒãƒˆ",
    "Copy referral link": "ç´¹ä»‹ãƒªãƒ³ã‚¯ã‚’ã‚³ãƒ”ãƒ¼",
    "Profile preview": "ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«ãƒ—ãƒ¬ãƒ“ãƒ¥ãƒ¼",
    "Mobile Live": "ãƒ¢ãƒã‚¤ãƒ«ãƒ©ã‚¤ãƒ–",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "ã“ã®ãƒ–ãƒ©ã‚¦ã‚¶ã¯ãƒ©ã‚¤ãƒ–ã‚«ãƒ¡ãƒ©/ãƒžã‚¤ã‚¯ã«å¯¾å¿œã—ã¦ã„ã¾ã›ã‚“ã€‚HTTPSã§æœ€æ–°ç‰ˆã®Chrome/Safariã‚’ä½¿ç”¨ã—ã¦ãã ã•ã„ã€‚",
    "SDP kamera tidak tersedia.": "ã‚«ãƒ¡ãƒ©SDPã‚’åˆ©ç”¨ã§ãã¾ã›ã‚“",
    "Cloudflare menolak koneksi live dari browser.": "CloudflareãŒãƒ–ãƒ©ã‚¦ã‚¶ã‹ã‚‰ã®ãƒ©ã‚¤ãƒ–æŽ¥ç¶šã‚’æ‹’å¦ã—ã¾ã—ãŸã€‚",
    "Kamera dan mikrofon sudah LIVE.": "ã‚«ãƒ¡ãƒ©ã¨ãƒžã‚¤ã‚¯ãŒLIVEã«ãªã‚Šã¾ã—ãŸã€‚",
    "Gagal memulai live dari HP.": "ãƒ¢ãƒã‚¤ãƒ«ãƒ©ã‚¤ãƒ–ã‚’é–‹å§‹ã§ãã¾ã›ã‚“ã§ã—ãŸã€‚",
    "Live dari HP sudah dihentikan.": "ãƒ¢ãƒã‚¤ãƒ«ãƒ©ã‚¤ãƒ–ã‚’åœæ­¢ã—ã¾ã—ãŸã€‚",
    "Live langsung dari kamera HP": "ã‚¹ãƒžãƒ¼ãƒˆãƒ•ã‚©ãƒ³ã®ã‚«ãƒ¡ãƒ©ã‹ã‚‰ç›´æŽ¥ãƒ©ã‚¤ãƒ–é…ä¿¡",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "OBSã¯ä¸è¦ã§ã™ã€‚ã‚«ãƒ¡ãƒ©ã¨ãƒžã‚¤ã‚¯ã‚’è¨±å¯ã—ã¦ã€Œãƒ©ã‚¤ãƒ–é–‹å§‹ã€ã‚’æŠ¼ã—ã¦ãã ã•ã„ã€‚",
    "Kamera siap digunakan": "ã‚«ãƒ¡ãƒ©ã®æº–å‚™å®Œäº†",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "é–‹å§‹ã‚’æŠ¼ã—ã¦ã‚«ãƒ¡ãƒ©ã¨ãƒžã‚¤ã‚¯ã®è¨±å¯ã‚’æ±‚ã‚ã¾ã™ã€‚",
    "MENGHUBUNGKAN KE CLOUDFARE...": "CLOUDFLAREに接続中…",
    "UNMUTE": "ãƒŸãƒ¥ãƒ¼ãƒˆè§£é™¤",
    "MIC": "ãƒžã‚¤ã‚¯",
    "CAM OFF": "ã‚«ãƒ¡ãƒ©OFF",
    "CAM": "ã‚«ãƒ¡ãƒ©",
    "MULAI LIVE": "ãƒ©ã‚¤ãƒ–é–‹å§‹",
    "STOP LIVE": "ãƒ©ã‚¤ãƒ–åœæ­¢",
    "READY": "æº–å‚™å®Œäº†",
    "WebRTC/WHIP â€¢ ultra-low latency â€¢ kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • 超低遅延 • 「ライブ開始」を押した後のみカメラとマイクが有効になります。",
    "Terms & Conditions": "åˆ©ç”¨è¦ç´„",
    "Privacy Policy": "ãƒ—ãƒ©ã‚¤ãƒã‚·ãƒ¼ãƒãƒªã‚·ãƒ¼"
  },
  "ko": {
    "Membuka SYS STREAM Airdrop...": "SYS STREAM ì—ì–´ë“œë¡­ì„ ì—¬ëŠ” ì¤‘...",
    "Mining SYS dari Blind Box Lock": "Blind Box Lockìœ¼ë¡œ SYS ì±„êµ´",
    "Lock aktif minimal $10 dapat mengaktifkan reward mining harian.": "ìµœì†Œ $10ì˜ í™œì„± ìž ê¸ˆìœ¼ë¡œ ì¼ì¼ ì±„êµ´ ë³´ìƒì´ í™œì„±í™”ë©ë‹ˆë‹¤.",
    "Wallet": "ì§€ê°‘",
    "Copy referral link": "ì¶”ì²œ ë§í¬ ë³µì‚¬",
    "Profile preview": "í”„ë¡œí•„ ë¯¸ë¦¬ë³´ê¸°",
    "Mobile Live": "ëª¨ë°”ì¼ ë¼ì´ë¸Œ",
    "Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS.": "ì´ ë¸Œë¼ìš°ì €ëŠ” ë¼ì´ë¸Œ ì¹´ë©”ë¼/ë§ˆì´í¬ë¥¼ ì§€ì›í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤. HTTPSì—ì„œ ìµœì‹  Chrome/Safarië¥¼ ì‚¬ìš©í•˜ì„¸ìš”.",
    "SDP kamera tidak tersedia.": "ì¹´ë©”ë¼ SDPë¥¼ ì‚¬ìš©í•  ìˆ˜ ì—†ìŠµë‹ˆë‹¤.",
    "Cloudflare menolak koneksi live dari browser.": "Cloudflareê°€ ë¸Œë¼ìš°ì €ì˜ ë¼ì´ë¸Œ ì—°ê²°ì„ ê±°ë¶€í–ˆìŠµë‹ˆë‹¤.",
    "Kamera dan mikrofon sudah LIVE.": "ì¹´ë©”ë¼ì™€ ë§ˆì´í¬ê°€ LIVE ìƒíƒœìž…ë‹ˆë‹¤.",
    "Gagal memulai live dari HP.": "ëª¨ë°”ì¼ ë¼ì´ë¸Œë¥¼ ì‹œìž‘í•˜ì§€ ëª»í–ˆìŠµë‹ˆë‹¤.",
    "Live dari HP sudah dihentikan.": "ëª¨ë°”ì¼ ë¼ì´ë¸Œê°€ ì¤‘ì§€ë˜ì—ˆìŠµë‹ˆë‹¤.",
    "Live langsung dari kamera HP": "íœ´ëŒ€í° ì¹´ë©”ë¼ë¡œ ë°”ë¡œ ë¼ì´ë¸Œí•˜ê¸°",
    "Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.": "OBSê°€ í•„ìš”í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤. ì¹´ë©”ë¼ì™€ ë§ˆì´í¬ë¥¼ í—ˆìš©í•œ í›„ ë¼ì´ë¸Œ ì‹œìž‘ì„ ëˆ„ë¥´ì„¸ìš”.",
    "Kamera siap digunakan": "ì¹´ë©”ë¼ ì‚¬ìš© ì¤€ë¹„ ì™„ë£Œ",
    "Tekan tombol mulai untuk meminta izin kamera & mikrofon.": "ì‹œìž‘ì„ ëˆŒëŸ¬ ì¹´ë©”ë¼ì™€ ë§ˆì´í¬ ê¶Œí•œì„ ìš”ì²­í•˜ì„¸ìš”.",
    "MENGHUBUNGKAN KE CLOUDFARE...": "CLOUDFLARE ì—°ê²° ì¤‘...",
    "UNMUTE": "ìŒì†Œê±° í•´ì œ",
    "MIC": "ë§ˆì´í¬",
    "CAM OFF": "ì¹´ë©”ë¼ ë„ê¸°",
    "CAM": "ì¹´ë©”ë¼",
    "MULAI LIVE": "ë¼ì´ë¸Œ ì‹œìž‘",
    "STOP LIVE": "ë¼ì´ë¸Œ ì¤‘ì§€",
    "READY": "ì¤€ë¹„",
    "WebRTC/WHIP â€¢ ultra-low latency â€¢ kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • 초저지연 • 라이브 시작을 누른 후에만 카메라와 마이크가 활성화됩니다.",
    "Terms & Conditions": "ì´ìš©ì•½ê´€",
    "Privacy Policy": "ê°œì¸ì •ë³´ ì²˜ë¦¬ë°©ì¹¨"
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
    "WebRTC/WHIP â€¢ ultra-low latency â€¢ kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.": "WebRTC/WHIP • زمن انتقال منخفض جدًا • لا يتم تفعيل الكاميرا والميكروفون إلا بعد الضغط على بدء البث.",
    "Terms & Conditions": "الشروط والأحكام",
    "Privacy Policy": "سياسة الخصوصية"
  }
};
for (const lang of Object.keys(CORE_SCREENING_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], CORE_SCREENING_TRANSLATIONS[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], CORE_SCREENING_TRANSLATIONS[lang]);
}

const PRODUCT_LABEL_TRANSLATIONS: Record<LanguageCode, string> = {
  id: 'Penambangan SYS', en: 'SYS Mining', es: 'Minería SYS', pt: 'Mineração SYS', zh: 'SYS æŒ–çŸ¿', ja: 'SYS ãƒžã‚¤ãƒ‹ãƒ³ã‚°', ko: 'SYS ì±„êµ´', ar: 'تعدين SYS'
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
  zh: "ç›´æ’­é—´å°šæœªå¯ç”¨ã€‚åªæœ‰å®˜æ–¹ä¸»æ’­å¯ä»¥åˆ›å»ºæ–°çš„ç›´æ’­é—´ã€‚",
  ja: "ãƒ«ãƒ¼ãƒ ã¯ã¾ã åˆ©ç”¨ã§ãã¾ã›ã‚“ã€‚æ–°ã—ã„ãƒ«ãƒ¼ãƒ ã‚’ä½œæˆã§ãã‚‹ã®ã¯å…¬å¼ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã®ã¿ã§ã™ã€‚",
  ko: "ë£¸ì„ ì•„ì§ ì‚¬ìš©í•  ìˆ˜ ì—†ìŠµë‹ˆë‹¤. ìƒˆ ë£¸ì€ ê³µì‹ ìŠ¤íŠ¸ë¦¬ë¨¸ë§Œ ë§Œë“¤ ìˆ˜ ìžˆìŠµë‹ˆë‹¤.",
  ar: "الغرفة غير متاحة بعد. لا يمكن إنشاء غرفة جديدة إلا بواسطة ستريمر رسمي.",
};
for (const lang of Object.keys(LIVE_ROOM_NOT_AVAILABLE_CREATE) as LanguageCode[]) {
  translations[lang]["LIVE_ROOM_NOT_AVAILABLE_CREATE"] = LIVE_ROOM_NOT_AVAILABLE_CREATE[lang];
  PAGE_UI_TRANSLATIONS[lang]["LIVE_ROOM_NOT_AVAILABLE_CREATE"] = LIVE_ROOM_NOT_AVAILABLE_CREATE[lang];
}


/* Dashboard UI lock: every visible dashboard label is translated in all supported languages. */
const DASHBOARD_UI_LOCK: Record<LanguageCode, Record<string, string>> = {
  id: {
    'SYS STREAM':'SYS STREAM','Streaming Settings':'Pengaturan Streaming','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.':'Anda sudah menjadi Official Streamer. Buat atau buka room streaming Anda sendiri dan dapatkan RTMPS Server + Stream Key untuk OBS.','Open Streaming Studio':'Buka Streaming Studio','SYS Coin':'SYS Coin','Airdrop Reward':'Reward Airdrop','Create Post':'Buat Postingan','Open attached media â†’':'Buka media terlampir â†’','user':'pengguna'
  },
  en: {
    'SYS STREAM':'SYS STREAM','Streaming Settings':'Streaming Settings','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.':'You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.','Open Streaming Studio':'Open Streaming Studio','SYS Coin':'SYS Coin','Airdrop Reward':'Airdrop Reward','Create Post':'Create Post','Open attached media â†’':'Open attached media â†’','user':'user'
  },
  es: {
    'SYS STREAM':'SYS STREAM','Streaming Settings':'Configuración de streaming','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.':'Eres un streamer oficial. Crea o abre tu propia sala de streaming y obtén el servidor RTMPS y la Stream Key para OBS.','Open Streaming Studio':'Abrir estudio de streaming','SYS Coin':'Moneda SYS','Airdrop Reward':'Recompensa del airdrop','Create Post':'Crear publicación','Open attached media â†’':'Abrir contenido multimedia adjunto â†’','user':'usuario'
  },
  pt: {
    'SYS STREAM':'SYS STREAM','Streaming Settings':'Configuração de streaming','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.':'Você é um Official Streamer. Crie ou abra sua própria sala de streaming e obtenha o servidor RTMPS e a Stream Key para OBS.','Open Streaming Studio':'Abrir estúdio de streaming','SYS Coin':'Moeda SYS','Airdrop Reward':'Recompensa do Airdrop','Create Post':'Criar publicação','Open attached media â†’':'Abrir mídia anexada →','user':'usuário'
  },
  zh: {
    'SYS STREAM':'SYS STREAM','Streaming Settings':'ç›´æ’­è®¾ç½®','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.':'æ‚¨æ˜¯å®˜æ–¹ä¸»æ’­ã€‚åˆ›å»ºæˆ–æ‰“å¼€è‡ªå·±çš„ç›´æ’­é—´ï¼Œå¹¶èŽ·å–ç”¨äºŽ OBS çš„ RTMPS æœåŠ¡å™¨å’Œ Stream Keyã€‚','Open Streaming Studio':'æ‰“å¼€ç›´æ’­å·¥ä½œå®¤','SYS Coin':'SYS å¸','Airdrop Reward':'ç©ºæŠ•å¥–åŠ±','Create Post':'åˆ›å»ºå¸–å­','Open attached media â†’':'æ‰“å¼€é™„ä»¶åª’ä½“ â†’','user':'ç”¨æˆ·'
  },
  ja: {
    'SYS STREAM':'SYS STREAM','Streaming Settings':'é…ä¿¡è¨­å®š','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.':'ã‚ãªãŸã¯å…¬å¼ã‚¹ãƒˆãƒªãƒ¼ãƒžãƒ¼ã§ã™ã€‚è‡ªåˆ†ã®é…ä¿¡ãƒ«ãƒ¼ãƒ ã‚’ä½œæˆã¾ãŸã¯é–‹ãã€OBSç”¨ã®RTMPSã‚µãƒ¼ãƒãƒ¼ã¨Stream Keyã‚’å–å¾—ã§ãã¾ã™ã€‚','Open Streaming Studio':'é…ä¿¡ã‚¹ã‚¿ã‚¸ã‚ªã‚’é–‹ã','SYS Coin':'SYSã‚³ã‚¤ãƒ³','Airdrop Reward':'ã‚¨ã‚¢ãƒ‰ãƒ­ãƒƒãƒ—å ±é…¬','Create Post':'æŠ•ç¨¿ã‚’ä½œæˆ','Open attached media â†’':'æ·»ä»˜ãƒ¡ãƒ‡ã‚£ã‚¢ã‚’é–‹ã â†’','user':'ãƒ¦ãƒ¼ã‚¶ãƒ¼'
  },
  ko: {
    'SYS STREAM':'SYS STREAM','Streaming Settings':'ìŠ¤íŠ¸ë¦¬ë° ì„¤ì •','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.':'ê³µì‹ ìŠ¤íŠ¸ë¦¬ë¨¸ìž…ë‹ˆë‹¤. ìžì‹ ì˜ ìŠ¤íŠ¸ë¦¬ë° ë£¸ì„ ë§Œë“¤ê±°ë‚˜ ì—´ê³  OBSìš© RTMPS ì„œë²„ì™€ Stream Keyë¥¼ ë°›ì„ ìˆ˜ ìžˆìŠµë‹ˆë‹¤.','Open Streaming Studio':'ìŠ¤íŠ¸ë¦¬ë° ìŠ¤íŠœë””ì˜¤ ì—´ê¸°','SYS Coin':'SYS ì½”ì¸','Airdrop Reward':'ì—ì–´ë“œë¡­ ë³´ìƒ','Create Post':'ê²Œì‹œë¬¼ ìž‘ì„±','Open attached media â†’':'ì²¨ë¶€ ë¯¸ë””ì–´ ì—´ê¸° â†’','user':'ì‚¬ìš©ìž'
  },
  ar: {
    'SYS STREAM':'SYS STREAM','Streaming Settings':'إعدادات البث','You are an Official Streamer. Create or open your own streaming room and get the RTMPS Server + Stream Key for OBS.':'أنت منشئ بث رسمي. أنشئ غرفة البث الخاصة بك أو افتحها واحصل على خادم RTMPS وStream Key لاستخدامهما مع OBS.','Open Streaming Studio':'فتح استوديو البث','SYS Coin':'عملة SYS','Airdrop Reward':'مكافأة الإيردروب','Create Post':'إنشاء منشور','Open attached media â†’':'فتح الوسائط المرفقة ←','user':'مستخدم'
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
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.':'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.',
    'Daily Active Reward':'Reward Harian Aktif',
    'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.',
    'Enhanced Lock Tier':'Tier Lock Tingkat Lanjut',
    'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.',
    'Premium Lock Tier':'Tier Lock Premium',
    'Reward harian masuk ke saldo':'Reward harian masuk ke saldo',
    'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.':'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.',
    'Available':'Tersedia',
    'Quota resets in':'Kuota direset dalam',
    'Lock minimal $4 equivalent untuk membuka Blind Box':'Lock minimal setara $4 untuk membuka Blind Box',
    'Daily Boxes':'Blind Box Harian',
    'Lock Amount (IDR)':'Nominal Lock (IDR)',
    'Claim Daily Blind Box':'Klaim Blind Box Harian',
    'Lock aktif':'Lock aktif',
    'Aturan claim tetap 1 kali per hari.':'Aturan klaim tetap 1 kali per hari.',
    'LOCK SALDO DIBUTUHKAN':'LOCK SALDO DIBUTUHKAN',
    'Lock saldo untuk mendapatkan hak claim Blind Box harian':'Lock saldo untuk mendapatkan hak klaim Blind Box harian',
    'Durasi lock tersedia:':'Durasi lock tersedia:',
    '30 hari':'30 hari',
    '60 hari':'60 hari',
    '90 hari':'90 hari',
    'Lock amount':'Nominal lock',
    'Nominal Lock (IDR)':'Nominal Lock (IDR)',
    'Quota:':'Kuota:',
    '1 Box/Day':'1 Box/Hari',
    'Lock Saldo Sekarang':'Lock Saldo Sekarang',
    'Total Locked':'Total Terkunci',
    'Daily Claim:':'Klaim Harian:',
    'Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.':'Klaim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.',
    'Lock minimum':'Lock minimum',
    'to activate':'untuk mengaktifkan',
    'Open Daily Box':'Buka Blind Box Harian',
    'Available Today':'Tersedia Hari Ini',
    'Unboxing':'Membuka Box',
    'Server sedang menentukan reward...':'Server sedang menentukan reward...',
    'Reward Blind Box Harian':'Reward Blind Box Harian',
    'Keep in Vault':'Simpan di Vault',
    'Done':'Selesai',
    'Left':'Tersisa',
    'Jadwal Durasi Lock':'Jadwal Durasi Lock',
    '30 Days Term':'Jangka 30 Hari',
    '60 Days Term':'Jangka 60 Hari',
    '90 Days Term':'Jangka 90 Hari',
    'Reward harian sesuai pengaturan server':'Reward harian sesuai pengaturan server',
    'Viewers on Wheel':'Penonton di Roda',
    'Clear All':'Hapus Semua',
    'Selected Winner':'Pemenang Terpilih',
    'Live Participants Only':'Hanya Peserta Live',
    'Spinning for Winner...':'Sedang memilih pemenang...',
    'Spin Raffle Wheel':'Putar Roda Undian',
    'Current Viewers on Wheel:':'Penonton Saat Ini di Roda:',
    'Recent Raffle Winners':'Pemenang Undian Terbaru',
    'Edit':'Edit',
    'Logout':'Keluar',
    'USDT Account':'Akun USDT',
    'Member':'Anggota',
    'EVM Wallet':'Wallet EVM',
    'Wallet belum terhubung':'Wallet belum terhubung',
    'Alamat wallet akun. Recovery phrase tidak disimpan di server.':'Alamat wallet akun. Recovery phrase tidak disimpan di server.',
    'WALLET REQUIRED':'WALLET DIBUTUHKAN',
    'Minimum withdrawal':'Penarikan minimum',
    'Minimum withdrawal is':'Minimum penarikan adalah',
    'Started':'Dimulai',
    'Deposit, withdrawal, lock, reward & bonus':'Deposit, penarikan, lock, reward & bonus',
    'Locked Balance':'Saldo Terkunci',
    'Earns passive yield':'Menghasilkan imbal hasil pasif',
    'Change photo from device':'Ganti foto dari perangkat',
    'Upload photo from device':'Unggah foto dari perangkat',
    'JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG, PNG, WEBP • foto tetap tersimpan di perangkat Anda',
    'No unread notifications at this time.':'Tidak ada notifikasi yang belum dibaca saat ini.',
    'Guest':'Tamu',
    'Profile':'Profil',
    'Kelola akun, wallet, dan aktivitas kamu.':'Kelola akun, wallet, dan aktivitas kamu.'
  },
  en: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.':'Available with the minimum active lock. Daily rewards are processed by the server and added to your available balance.',
    'Daily Active Reward':'Daily Active Reward',
    'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'Higher lock tier with rare collectibles. Financial rewards are determined by the server.',
    'Enhanced Lock Tier':'Enhanced Lock Tier',
    'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'High lock tier with rare collectibles. Financial rewards are determined by the server.',
    'Premium Lock Tier':'Premium Lock Tier',
    'Reward harian masuk ke saldo':'Daily rewards are added to your balance',
    'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.':'Open the daily Blind Box based on your locked balance. Daily claims follow server rules and reset at WIB.',
    'Available':'Available',
    'Quota resets in':'Quota resets in',
    'Lock minimal $4 equivalent untuk membuka Blind Box':'Lock at least the $4 equivalent to open the Blind Box',
    'Daily Boxes':'Daily Boxes',
    'Lock Amount (IDR)':'Lock Amount (IDR)',
    'Claim Daily Blind Box':'Claim Daily Blind Box',
    'Lock aktif':'Active Lock',
    'You must lock at least $4 equivalent to open the daily Blind Box.':'You must lock at least $4 equivalent to open the daily Blind Box.',
    'Open the daily Blind Box based on your currently locked balance. Daily claims follow server rules and reset at WIB.':'Open the daily Blind Box based on your currently locked balance. Daily claims follow server rules and reset at WIB.',
'Lock at least $4 equivalent to open the Blind Box':'Lock at least $4 equivalent to open the Blind Box',
        'LOCK BALANCE REQUIRED':'LOCK BALANCE REQUIRED',
        'Lock your balance to unlock the daily Blind Box claim':'Lock your balance to unlock the daily Blind Box claim',
        'Boxes/Day':'Boxes/Day',
        'Claim using the Blind Box button below. The lock will complete automatically when the lock period ends.':'Claim using the Blind Box button below. The lock will complete automatically when the lock period ends.',
        'Daily reward follows server settings':'Daily reward follows server settings',
    'Aturan claim tetap 1 kali per hari.':'The claim limit remains once per day.',
    'LOCK SALDO DIBUTUHKAN':'BALANCE LOCK REQUIRED',
    'Lock saldo untuk mendapatkan hak claim Blind Box harian':'Lock your balance to receive the right to claim the daily Blind Box',
    'Durasi lock tersedia:':'Available lock durations:',
    '30 hari':'30 days',
    '60 hari':'60 days',
    '90 hari':'90 days',
    'Lock amount':'Lock amount',
    'Nominal Lock (IDR)':'Lock Amount (IDR)',
    'Quota:':'Quota:',
    '1 Box/Day':'1 Box/Day',
    'Lock Saldo Sekarang':'Lock Balance Now',
    'Total Locked':'Total Locked',
    'Daily Claim:':'Daily Claim:',
    'Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.':'Claims are made through the Blind Box button below. The lock ends automatically when its duration expires.',
    'Lock minimum':'Minimum lock',
    'to activate':'to activate',
    'Open Daily Box':'Open Daily Box',
    'Available Today':'Available Today',
    'Unboxing':'Unboxing',
    'Server sedang menentukan reward...':'The server is determining the reward...',
    'Reward Blind Box Harian':'Daily Blind Box Reward',
    'Keep in Vault':'Keep in Vault',
    'Done':'Done',
    'Left':'Left',
    'Jadwal Durasi Lock':'Lock Duration Schedule',
    '30 Days Term':'30-Day Term',
    '60 Days Term':'60-Day Term',
    '90 Days Term':'90-Day Term',
    'Reward harian sesuai pengaturan server':'Daily reward according to server settings',
    'Viewers on Wheel':'Viewers on Wheel',
    'Clear All':'Clear All',
    'Selected Winner':'Selected Winner',
    'Live Participants Only':'Live Participants Only',
    'Spinning for Winner...':'Spinning for Winner...',
    'Spin Raffle Wheel':'Spin Raffle Wheel',
    'Current Viewers on Wheel:':'Current Viewers on Wheel:',
    'Recent Raffle Winners':'Recent Raffle Winners',
    'Edit':'Edit',
    'Logout':'Logout',
    'USDT Account':'USDT Account',
    'Member':'Member',
    'EVM Wallet':'EVM Wallet',
    'Wallet belum terhubung':'Wallet not connected',
    'Alamat wallet akun. Recovery phrase tidak disimpan di server.':'Your account wallet address. The recovery phrase is not stored on the server.',
    'WALLET REQUIRED':'WALLET REQUIRED',
    'Minimum withdrawal':'Minimum withdrawal',
    'Minimum withdrawal is':'Minimum withdrawal is',
    'Started':'Started',
    'Deposit, withdrawal, lock, reward & bonus':'Deposit, withdrawal, lock, reward & bonus',
    'Locked Balance':'Locked Balance',
    'Earns passive yield':'Earns passive yield',
    'Change photo from device':'Change photo from device',
    'Upload photo from device':'Upload photo from device',
    'JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG, PNG, WEBP • photo stays in your device storage',
    'No unread notifications at this time.':'No unread notifications at this time.',
    'Guest':'Guest',
    'Profile':'Profile',
    'Kelola akun, wallet, dan aktivitas kamu.':'Manage your account, wallet, and activity.'
  },
  es: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.':'Disponible con el bloqueo activo mínimo. Las recompensas diarias son procesadas por el servidor y se añaden al saldo disponible.',
    'Daily Active Reward':'Recompensa diaria activa',
    'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'Nivel de bloqueo superior con coleccionables raros. Las recompensas financieras las determina el servidor.',
    'Enhanced Lock Tier':'Nivel de bloqueo avanzado',
    'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'Nivel de bloqueo alto con coleccionables raros. Las recompensas financieras las determina el servidor.',
    'Premium Lock Tier':'Nivel de bloqueo premium',
    'Reward harian masuk ke saldo':'Las recompensas diarias se añaden al saldo',
    'Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.':'Abre la Blind Box diaria según tu saldo bloqueado. Las reclamaciones diarias siguen las reglas del servidor y se reinician a las 00:00 WIB.',
    'Available':'Disponible','Quota resets in':'La cuota se reinicia en','Lock minimal $4 equivalent untuk membuka Blind Box':'Bloquea al menos el equivalente a $4 para abrir la Blind Box','Daily Boxes':'Cajas diarias','Lock Amount (IDR)':'Importe bloqueado (IDR)','Claim Daily Blind Box':'Reclamar Blind Box diaria','Lock aktif':'Bloqueo activo','Aturan claim tetap 1 kali per hari.':'El límite de reclamación sigue siendo una vez al día.','LOCK SALDO DIBUTUHKAN':'SE REQUIERE BLOQUEO DE SALDO','Lock saldo untuk mendapatkan hak claim Blind Box harian':'Bloquea tu saldo para obtener el derecho a reclamar la Blind Box diaria','Durasi lock tersedia:':'Duraciones de bloqueo disponibles:','30 hari':'30 días','60 hari':'60 días','90 hari':'90 días','Lock amount':'Importe del bloqueo','Nominal Lock (IDR)':'Importe bloqueado (IDR)','Quota:':'Cuota:','1 Box/Day':'1 caja/día','Lock Saldo Sekarang':'Bloquear saldo ahora','Total Locked':'Total bloqueado','Daily Claim:':'Reclamación diaria:','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.':'Las reclamaciones se realizan mediante el botón Blind Box. El bloqueo finaliza automáticamente cuando termina su duración.','Lock minimum':'Bloqueo mínimo','to activate':'para activar','Open Daily Box':'Abrir caja diaria','Available Today':'Disponible hoy','Unboxing':'Abrir caja','Server sedang menentukan reward...':'El servidor está determinando la recompensa...','Reward Blind Box Harian':'Recompensa de Blind Box diaria','Keep in Vault':'Guardar en la bóveda','Done':'Listo','Left':'Restantes','Jadwal Durasi Lock':'Calendario de duración del bloqueo','30 Days Term':'Plazo de 30 días','60 Days Term':'Plazo de 60 días','90 Days Term':'Plazo de 90 días','Reward harian sesuai pengaturan server':'Recompensa diaria según la configuración del servidor','Viewers on Wheel':'Espectadores en la rueda','Clear All':'Borrar todo','Selected Winner':'Ganador seleccionado','Live Participants Only':'Solo participantes del directo','Spinning for Winner...':'Girando para elegir al ganador...','Spin Raffle Wheel':'Girar la rueda del sorteo','Current Viewers on Wheel:':'Espectadores actuales en la rueda:','Recent Raffle Winners':'Ganadores recientes del sorteo','Edit':'Editar','Logout':'Cerrar sesión','USDT Account':'Cuenta USDT','Member':'Miembro','EVM Wallet':'Billetera EVM','Wallet belum terhubung':'Billetera no conectada','Alamat wallet akun. Recovery phrase tidak disimpan di server.':'Dirección de la billetera de la cuenta. La frase de recuperación no se almacena en el servidor.','WALLET REQUIRED':'BILLETERA OBLIGATORIA','Minimum withdrawal':'Retiro mínimo','Minimum withdrawal is':'El retiro mínimo es','Started':'Iniciado','Deposit, withdrawal, lock, reward & bonus':'Depósito, retiro, bloqueo, recompensa y bono','Locked Balance':'Saldo bloqueado','Earns passive yield':'Genera rendimiento pasivo','Change photo from device':'Cambiar foto desde el dispositivo','Upload photo from device':'Subir foto desde el dispositivo','JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG, PNG, WEBP • la foto permanece en el almacenamiento del dispositivo','No unread notifications at this time.':'No hay notificaciones sin leer en este momento.','Guest':'Invitado','Profile':'Perfil','Kelola akun, wallet, dan aktivitas kamu.':'Gestiona tu cuenta, billetera y actividad.'
  },
  pt: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.':'Disponível com o lock ativo mínimo. As recompensas diárias são processadas pelo servidor e adicionadas ao saldo disponível.','Daily Active Reward':'Recompensa diária ativa','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'Nível de lock superior com itens raros. As recompensas financeiras são determinadas pelo servidor.','Enhanced Lock Tier':'Nível de lock avançado','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'Nível de lock alto com itens raros. As recompensas financeiras são determinadas pelo servidor.','Premium Lock Tier':'Nível de lock premium','Reward harian masuk ke saldo':'As recompensas diárias são adicionadas ao saldo','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.':'Abra a Blind Box diária com base no seu saldo bloqueado. Os resgates seguem as regras do servidor e são redefinidos às 00:00 WIB.','Available':'Disponível','Quota resets in':'A cota será redefinida em','Lock minimal $4 equivalent untuk membuka Blind Box':'Faça lock de pelo menos o equivalente a $4 para abrir a Blind Box','Daily Boxes':'Caixas diárias','Lock Amount (IDR)':'Valor do lock (IDR)','Claim Daily Blind Box':'Resgatar Blind Box diária','Lock aktif':'Lock ativo','Aturan claim tetap 1 kali per hari.':'O limite de resgate continua sendo uma vez por dia.','LOCK SALDO DIBUTUHKAN':'LOCK DE SALDO NECESSÁRIO','Lock saldo untuk mendapatkan hak claim Blind Box harian':'Faça lock do saldo para obter o direito de resgatar a Blind Box diária','Durasi lock tersedia:':'Durações de lock disponíveis:','30 hari':'30 dias','60 hari':'60 dias','90 hari':'90 dias','Lock amount':'Valor do lock','Nominal Lock (IDR)':'Valor do lock (IDR)','Quota:':'Cota:','1 Box/Day':'1 caixa/dia','Lock Saldo Sekarang':'Fazer lock do saldo agora','Total Locked':'Total bloqueado','Daily Claim:':'Resgate diário:','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.':'Os resgates são feitos pelo botão Blind Box abaixo. O lock termina automaticamente quando a duração acabar.','Lock minimum':'Lock mínimo','to activate':'para ativar','Open Daily Box':'Abrir caixa diária','Available Today':'Disponível hoje','Unboxing':'Abrindo caixa','Server sedang menentukan reward...':'O servidor está determinando a recompensa...','Reward Blind Box Harian':'Recompensa da Blind Box diária','Keep in Vault':'Guardar no cofre','Done':'Concluído','Left':'Restantes','Jadwal Durasi Lock':'Cronograma de duração do lock','30 Days Term':'Prazo de 30 dias','60 Days Term':'Prazo de 60 dias','90 Days Term':'Prazo de 90 dias','Reward harian sesuai pengaturan server':'Recompensa diária conforme as configurações do servidor','Viewers on Wheel':'Espectadores na roda','Clear All':'Limpar tudo','Selected Winner':'Vencedor selecionado','Live Participants Only':'Somente participantes da live','Spinning for Winner...':'Girando para escolher o vencedor...','Spin Raffle Wheel':'Girar a roda do sorteio','Current Viewers on Wheel:':'Espectadores atuais na roda:','Recent Raffle Winners':'Vencedores recentes do sorteio','Edit':'Editar','Logout':'Sair','USDT Account':'Conta USDT','Member':'Membro','EVM Wallet':'Carteira EVM','Wallet belum terhubung':'Carteira não conectada','Alamat wallet akun. Recovery phrase tidak disimpan di server.':'Endereço da carteira da conta. A frase de recuperação não é armazenada no servidor.','WALLET REQUIRED':'CARTEIRA OBRIGATÓRIA','Minimum withdrawal':'Saque mínimo','Minimum withdrawal is':'O saque mínimo é','Started':'Iniciado','Deposit, withdrawal, lock, reward & bonus':'Depósito, saque, lock, recompensa e bônus','Locked Balance':'Saldo bloqueado','Earns passive yield':'Gera rendimento passivo','Change photo from device':'Alterar foto do dispositivo','Upload photo from device':'Enviar foto do dispositivo','JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG, PNG, WEBP • a foto permanece no armazenamento do dispositivo','No unread notifications at this time.':'Não há notificações não lidas no momento.','Guest':'Convidado','Profile':'Perfil','Kelola akun, wallet, dan aktivitas kamu.':'Gerencie sua conta, carteira e atividade.'
  },
  zh: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.':'æ»¡è¶³æœ€ä½Žæœ‰æ•ˆé”å®šå³å¯ä½¿ç”¨ã€‚æ¯æ—¥å¥–åŠ±ç”±æœåŠ¡å™¨å¤„ç†å¹¶åŠ å…¥å¯ç”¨ä½™é¢ã€‚','Daily Active Reward':'æ¯æ—¥æ´»è·ƒå¥–åŠ±','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'æ›´é«˜é”å®šç­‰çº§ï¼ŒåŒ…å«ç¨€æœ‰æ”¶è—å“ã€‚è´¢åŠ¡å¥–åŠ±ç”±æœåŠ¡å™¨å†³å®šã€‚','Enhanced Lock Tier':'é«˜çº§é”å®šç­‰çº§','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'é«˜é”å®šç­‰çº§ï¼ŒåŒ…å«ç¨€æœ‰æ”¶è—å“ã€‚è´¢åŠ¡å¥–åŠ±ç”±æœåŠ¡å™¨å†³å®šã€‚','Premium Lock Tier':'é«˜çº§é”å®šç­‰çº§','Reward harian masuk ke saldo':'æ¯æ—¥å¥–åŠ±åŠ å…¥ä½™é¢','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.':'æ ¹æ®é”å®šä½™é¢å¼€å¯æ¯æ—¥ç›²ç›’ã€‚æ¯æ—¥é¢†å–éµå¾ªæœåŠ¡å™¨è§„åˆ™ï¼Œå¹¶æŒ‰ WIB é‡ç½®ã€‚','Available':'å¯ç”¨','Quota resets in':'é…é¢é‡ç½®å€’è®¡æ—¶','Lock minimal $4 equivalent untuk membuka Blind Box':'é”å®šè‡³å°‘ç­‰å€¼ $4 æ‰èƒ½å¼€å¯ç›²ç›’','Daily Boxes':'æ¯æ—¥ç›²ç›’','Lock Amount (IDR)':'é”å®šé‡‘é¢ï¼ˆIDRï¼‰','Claim Daily Blind Box':'é¢†å–æ¯æ—¥ç›²ç›’','Lock aktif':'æœ‰æ•ˆé”å®š','Aturan claim tetap 1 kali per hari.':'é¢†å–é™åˆ¶ä»ä¸ºæ¯å¤©ä¸€æ¬¡ã€‚','LOCK SALDO DIBUTUHKAN':'éœ€è¦é”å®šä½™é¢','Lock saldo untuk mendapatkan hak claim Blind Box harian':'é”å®šä½™é¢ä»¥èŽ·å¾—é¢†å–æ¯æ—¥ç›²ç›’çš„èµ„æ ¼','Durasi lock tersedia:':'å¯ç”¨é”å®šæœŸé™ï¼š','30 hari':'30å¤©','60 hari':'60å¤©','90 hari':'90å¤©','Lock amount':'é”å®šé‡‘é¢','Nominal Lock (IDR)':'é”å®šé‡‘é¢ï¼ˆIDRï¼‰','Quota:':'é…é¢ï¼š','1 Box/Day':'æ¯å¤©1ç›’','Lock Saldo Sekarang':'ç«‹å³é”å®šä½™é¢','Total Locked':'æ€»é”å®š','Daily Claim:':'æ¯æ—¥é¢†å–ï¼š','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.':'é€šè¿‡ä¸‹æ–¹ç›²ç›’æŒ‰é’®é¢†å–ã€‚é”å®šæœŸé™ç»“æŸåŽå°†è‡ªåŠ¨å®Œæˆã€‚','Lock minimum':'æœ€ä½Žé”å®š','to activate':'ä»¥æ¿€æ´»','Open Daily Box':'å¼€å¯æ¯æ—¥ç›²ç›’','Available Today':'ä»Šæ—¥å¯ç”¨','Unboxing':'å¼€ç›’ä¸­','Server sedang menentukan reward...':'服务器正在确定奖励……','Reward Blind Box Harian':'æ¯æ—¥ç›²ç›’å¥–åŠ±','Keep in Vault':'å­˜å…¥ä¿é™©åº“','Done':'å®Œæˆ','Left':'å‰©ä½™','Jadwal Durasi Lock':'é”å®šæœŸé™å®‰æŽ’','30 Days Term':'30å¤©æœŸé™','60 Days Term':'60å¤©æœŸé™','90 Days Term':'90å¤©æœŸé™','Reward harian sesuai pengaturan server':'æ¯æ—¥å¥–åŠ±ä»¥æœåŠ¡å™¨è®¾ç½®ä¸ºå‡†','Viewers on Wheel':'è½¬ç›˜ä¸Šçš„è§‚ä¼—','Clear All':'å…¨éƒ¨æ¸…é™¤','Selected Winner':'é€‰ä¸­çš„èŽ·èƒœè€…','Live Participants Only':'ä»…é™ç›´æ’­å‚ä¸Žè€…','Spinning for Winner...':'正在转动选择获胜者……','Spin Raffle Wheel':'æ—‹è½¬æŠ½å¥–è½¬ç›˜','Current Viewers on Wheel:':'å½“å‰è½¬ç›˜è§‚ä¼—ï¼š','Recent Raffle Winners':'æœ€è¿‘çš„æŠ½å¥–èŽ·èƒœè€…','Edit':'ç¼–è¾‘','Logout':'é€€å‡ºç™»å½•','USDT Account':'USDT è´¦æˆ·','Member':'ä¼šå‘˜','EVM Wallet':'EVM é’±åŒ…','Wallet belum terhubung':'é’±åŒ…æœªè¿žæŽ¥','Alamat wallet akun. Recovery phrase tidak disimpan di server.':'è´¦æˆ·é’±åŒ…åœ°å€ã€‚æ¢å¤çŸ­è¯­ä¸ä¼šå­˜å‚¨åœ¨æœåŠ¡å™¨ä¸Šã€‚','WALLET REQUIRED':'éœ€è¦é’±åŒ…','Minimum withdrawal':'æœ€ä½ŽæçŽ°','Minimum withdrawal is':'æœ€ä½ŽæçŽ°é‡‘é¢ä¸º','Started':'å¼€å§‹äºŽ','Deposit, withdrawal, lock, reward & bonus':'å……å€¼ã€æçŽ°ã€é”å®šã€å¥–åŠ±å’Œå¥–é‡‘','Locked Balance':'é”å®šä½™é¢','Earns passive yield':'èŽ·å¾—è¢«åŠ¨æ”¶ç›Š','Change photo from device':'ä»Žè®¾å¤‡æ›´æ¢ç…§ç‰‡','Upload photo from device':'ä»Žè®¾å¤‡ä¸Šä¼ ç…§ç‰‡','JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG、PNG、WEBP • 照片保存在您的设备存储中','No unread notifications at this time.':'ç›®å‰æ²¡æœ‰æœªè¯»é€šçŸ¥ã€‚','Guest':'è®¿å®¢','Profile':'ä¸ªäººèµ„æ–™','Kelola akun, wallet, dan aktivitas kamu.':'ç®¡ç†æ‚¨çš„è´¦æˆ·ã€é’±åŒ…å’Œæ´»åŠ¨ã€‚'
  },
  ja: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.':'æœ€ä½Žé™ã®æœ‰åŠ¹ãªãƒ­ãƒƒã‚¯ã§åˆ©ç”¨ã§ãã¾ã™ã€‚æ¯Žæ—¥ã®å ±é…¬ã¯ã‚µãƒ¼ãƒãƒ¼ã§å‡¦ç†ã•ã‚Œã€åˆ©ç”¨å¯èƒ½æ®‹é«˜ã«åŠ ç®—ã•ã‚Œã¾ã™ã€‚','Daily Active Reward':'ãƒ‡ã‚¤ãƒªãƒ¼ã‚¢ã‚¯ãƒ†ã‚£ãƒ–å ±é…¬','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'å¸Œå°‘ã‚³ãƒ¬ã‚¯ã‚·ãƒ§ãƒ³ä»˜ãã®ä¸Šä½ãƒ­ãƒƒã‚¯ãƒ†ã‚£ã‚¢ã€‚é‡‘éŠ­çš„å ±é…¬ã¯ã‚µãƒ¼ãƒãƒ¼ãŒæ±ºå®šã—ã¾ã™ã€‚','Enhanced Lock Tier':'å¼·åŒ–ãƒ­ãƒƒã‚¯ãƒ†ã‚£ã‚¢','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'å¸Œå°‘ã‚³ãƒ¬ã‚¯ã‚·ãƒ§ãƒ³ä»˜ãã®é«˜ãƒ­ãƒƒã‚¯ãƒ†ã‚£ã‚¢ã€‚é‡‘éŠ­çš„å ±é…¬ã¯ã‚µãƒ¼ãƒãƒ¼ãŒæ±ºå®šã—ã¾ã™ã€‚','Premium Lock Tier':'ãƒ—ãƒ¬ãƒŸã‚¢ãƒ ãƒ­ãƒƒã‚¯ãƒ†ã‚£ã‚¢','Reward harian masuk ke saldo':'æ¯Žæ—¥ã®å ±é…¬ãŒæ®‹é«˜ã«åŠ ç®—ã•ã‚Œã¾ã™','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.':'ãƒ­ãƒƒã‚¯ä¸­ã®æ®‹é«˜ã«å¿œã˜ã¦ãƒ‡ã‚¤ãƒªãƒ¼ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹ã‚’é–‹ãã¾ã™ã€‚æ¯Žæ—¥ã®å—ã‘å–ã‚Šã¯ã‚µãƒ¼ãƒãƒ¼è¦å‰‡ã«å¾“ã„ã€WIBã§ãƒªã‚»ãƒƒãƒˆã•ã‚Œã¾ã™ã€‚','Available':'åˆ©ç”¨å¯èƒ½','Quota resets in':'ã‚¯ã‚©ãƒ¼ã‚¿ãƒªã‚»ãƒƒãƒˆã¾ã§','Lock minimal $4 equivalent untuk membuka Blind Box':'ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹ã‚’é–‹ãã«ã¯å°‘ãªãã¨ã‚‚$4ç›¸å½“ã‚’ãƒ­ãƒƒã‚¯ã—ã¦ãã ã•ã„','Daily Boxes':'ãƒ‡ã‚¤ãƒªãƒ¼ãƒœãƒƒã‚¯ã‚¹','Lock Amount (IDR)':'ãƒ­ãƒƒã‚¯é‡‘é¡ï¼ˆIDRï¼‰','Claim Daily Blind Box':'ãƒ‡ã‚¤ãƒªãƒ¼ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹ã‚’å—ã‘å–ã‚‹','Lock aktif':'æœ‰åŠ¹ãªãƒ­ãƒƒã‚¯','Aturan claim tetap 1 kali per hari.':'å—ã‘å–ã‚Šã¯1æ—¥1å›žã¾ã§ã§ã™ã€‚','LOCK SALDO DIBUTUHKAN':'æ®‹é«˜ã®ãƒ­ãƒƒã‚¯ãŒå¿…è¦ã§ã™','Lock saldo untuk mendapatkan hak claim Blind Box harian':'æ®‹é«˜ã‚’ãƒ­ãƒƒã‚¯ã—ã¦ãƒ‡ã‚¤ãƒªãƒ¼ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹ã®å—ã‘å–ã‚Šæ¨©ã‚’å–å¾—ã—ã¾ã™','Durasi lock tersedia:':'åˆ©ç”¨å¯èƒ½ãªãƒ­ãƒƒã‚¯æœŸé–“ï¼š','30 hari':'30æ—¥','60 hari':'60æ—¥','90 hari':'90æ—¥','Lock amount':'ãƒ­ãƒƒã‚¯é‡‘é¡','Nominal Lock (IDR)':'ãƒ­ãƒƒã‚¯é‡‘é¡ï¼ˆIDRï¼‰','Quota:':'ã‚¯ã‚©ãƒ¼ã‚¿ï¼š','1 Box/Day':'1ç®±/æ—¥','Lock Saldo Sekarang':'ä»Šã™ãæ®‹é«˜ã‚’ãƒ­ãƒƒã‚¯','Total Locked':'ãƒ­ãƒƒã‚¯åˆè¨ˆ','Daily Claim:':'ãƒ‡ã‚¤ãƒªãƒ¼å—å–ï¼š','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.':'ä¸‹ã®ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹ãƒœã‚¿ãƒ³ã‹ã‚‰å—ã‘å–ã‚Œã¾ã™ã€‚æœŸé–“çµ‚äº†å¾Œã€ãƒ­ãƒƒã‚¯ã¯è‡ªå‹•çš„ã«å®Œäº†ã—ã¾ã™ã€‚','Lock minimum':'æœ€ä½Žãƒ­ãƒƒã‚¯','to activate':'æœ‰åŠ¹åŒ–ã™ã‚‹ã«ã¯','Open Daily Box':'ãƒ‡ã‚¤ãƒªãƒ¼ãƒœãƒƒã‚¯ã‚¹ã‚’é–‹ã','Available Today':'æœ¬æ—¥åˆ©ç”¨å¯èƒ½','Unboxing':'é–‹å°ä¸­','Server sedang menentukan reward...':'サーバーが報酬を決定しています…','Reward Blind Box Harian':'ãƒ‡ã‚¤ãƒªãƒ¼ãƒ–ãƒ©ã‚¤ãƒ³ãƒ‰ãƒœãƒƒã‚¯ã‚¹å ±é…¬','Keep in Vault':'ä¿ç®¡åº«ã«ä¿å­˜','Done':'å®Œäº†','Left':'æ®‹ã‚Š','Jadwal Durasi Lock':'ãƒ­ãƒƒã‚¯æœŸé–“ã‚¹ã‚±ã‚¸ãƒ¥ãƒ¼ãƒ«','30 Days Term':'30æ—¥é–“','60 Days Term':'60æ—¥é–“','90 Days Term':'90æ—¥é–“','Reward harian sesuai pengaturan server':'æ¯Žæ—¥ã®å ±é…¬ã¯ã‚µãƒ¼ãƒãƒ¼è¨­å®šã«å¾“ã„ã¾ã™','Viewers on Wheel':'ãƒ›ã‚¤ãƒ¼ãƒ«ä¸Šã®è¦–è´è€…','Clear All':'ã™ã¹ã¦ã‚¯ãƒªã‚¢','Selected Winner':'é¸ã°ã‚ŒãŸå‹è€…','Live Participants Only':'ãƒ©ã‚¤ãƒ–å‚åŠ è€…ã®ã¿','Spinning for Winner...':'勝者を選出中…','Spin Raffle Wheel':'æŠ½é¸ãƒ›ã‚¤ãƒ¼ãƒ«ã‚’å›žã™','Current Viewers on Wheel:':'ç¾åœ¨ãƒ›ã‚¤ãƒ¼ãƒ«ä¸Šã®è¦–è´è€…ï¼š','Recent Raffle Winners':'æœ€è¿‘ã®æŠ½é¸å½“é¸è€…','Edit':'ç·¨é›†','Logout':'ãƒ­ã‚°ã‚¢ã‚¦ãƒˆ','USDT Account':'USDTã‚¢ã‚«ã‚¦ãƒ³ãƒˆ','Member':'ãƒ¡ãƒ³ãƒãƒ¼','EVM Wallet':'EVMã‚¦ã‚©ãƒ¬ãƒƒãƒˆ','Wallet belum terhubung':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆæœªæŽ¥ç¶š','Alamat wallet akun. Recovery phrase tidak disimpan di server.':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã®ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã‚¢ãƒ‰ãƒ¬ã‚¹ã€‚ãƒªã‚«ãƒãƒªãƒ¼ãƒ•ãƒ¬ãƒ¼ã‚ºã¯ã‚µãƒ¼ãƒãƒ¼ã«ä¿å­˜ã•ã‚Œã¾ã›ã‚“ã€‚','WALLET REQUIRED':'ã‚¦ã‚©ãƒ¬ãƒƒãƒˆãŒå¿…è¦ã§ã™','Minimum withdrawal':'æœ€ä½Žå‡ºé‡‘é¡','Minimum withdrawal is':'æœ€ä½Žå‡ºé‡‘é¡ã¯','Started':'é–‹å§‹','Deposit, withdrawal, lock, reward & bonus':'å…¥é‡‘ã€å‡ºé‡‘ã€ãƒ­ãƒƒã‚¯ã€å ±é…¬ã€ãƒœãƒ¼ãƒŠã‚¹','Locked Balance':'ãƒ­ãƒƒã‚¯æ®‹é«˜','Earns passive yield':'ãƒ‘ãƒƒã‚·ãƒ–åˆ©å›žã‚Šã‚’ç²å¾—','Change photo from device':'ç«¯æœ«ã‹ã‚‰å†™çœŸã‚’å¤‰æ›´','Upload photo from device':'ç«¯æœ«ã‹ã‚‰å†™çœŸã‚’ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰','JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG、PNG、WEBP • 写真は端末ストレージに保存されます','No unread notifications at this time.':'ç¾åœ¨ã€æœªèª­é€šçŸ¥ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚','Guest':'ã‚²ã‚¹ãƒˆ','Profile':'ãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«','Kelola akun, wallet, dan aktivitas kamu.':'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã€ã‚¦ã‚©ãƒ¬ãƒƒãƒˆã€ã‚¢ã‚¯ãƒ†ã‚£ãƒ“ãƒ†ã‚£ã‚’ç®¡ç†ã—ã¾ã™ã€‚'
  },
  ko: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.':'ìµœì†Œ í™œì„± ë½ì—ì„œ ì´ìš©í•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤. ì¼ì¼ ë³´ìƒì€ ì„œë²„ì—ì„œ ì²˜ë¦¬ë˜ì–´ ì‚¬ìš© ê°€ëŠ¥í•œ ìž”ì•¡ì— ì¶”ê°€ë©ë‹ˆë‹¤.','Daily Active Reward':'ì¼ì¼ í™œì„± ë³´ìƒ','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'í¬ê·€ ì»¬ë ‰ì…˜ì´ í¬í•¨ëœ ë†’ì€ ë½ ë“±ê¸‰ìž…ë‹ˆë‹¤. ê¸ˆìœµ ë³´ìƒì€ ì„œë²„ì—ì„œ ê²°ì •í•©ë‹ˆë‹¤.','Enhanced Lock Tier':'ê°•í™” ë½ ë“±ê¸‰','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'í¬ê·€ ì»¬ë ‰ì…˜ì´ í¬í•¨ëœ ë†’ì€ ë½ ë“±ê¸‰ìž…ë‹ˆë‹¤. ê¸ˆìœµ ë³´ìƒì€ ì„œë²„ì—ì„œ ê²°ì •í•©ë‹ˆë‹¤.','Premium Lock Tier':'í”„ë¦¬ë¯¸ì—„ ë½ ë“±ê¸‰','Reward harian masuk ke saldo':'ì¼ì¼ ë³´ìƒì´ ìž”ì•¡ì— ì¶”ê°€ë©ë‹ˆë‹¤','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.':'ìž ê¸´ ìž”ì•¡ì„ ê¸°ì¤€ìœ¼ë¡œ ì¼ì¼ ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ë¥¼ ì—½ë‹ˆë‹¤. ì¼ì¼ ìˆ˜ë ¹ì€ ì„œë²„ ê·œì¹™ì„ ë”°ë¥´ë©° WIB ê¸°ì¤€ìœ¼ë¡œ ì´ˆê¸°í™”ë©ë‹ˆë‹¤.','Available':'ì‚¬ìš© ê°€ëŠ¥','Quota resets in':'í• ë‹¹ëŸ‰ ì´ˆê¸°í™”ê¹Œì§€','Lock minimal $4 equivalent untuk membuka Blind Box':'ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ë¥¼ ì—´ë ¤ë©´ ìµœì†Œ $4 ìƒë‹¹ì„ ë½í•˜ì„¸ìš”','Daily Boxes':'ì¼ì¼ ë°•ìŠ¤','Lock Amount (IDR)':'ë½ ê¸ˆì•¡ (IDR)','Claim Daily Blind Box':'ì¼ì¼ ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ ìˆ˜ë ¹','Lock aktif':'í™œì„± ë½','Aturan claim tetap 1 kali per hari.':'ìˆ˜ë ¹ì€ í•˜ë£¨ í•œ ë²ˆìœ¼ë¡œ ìœ ì§€ë©ë‹ˆë‹¤.','LOCK SALDO DIBUTUHKAN':'ìž”ì•¡ ë½ í•„ìš”','Lock saldo untuk mendapatkan hak claim Blind Box harian':'ìž”ì•¡ì„ ë½í•˜ì—¬ ì¼ì¼ ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ ìˆ˜ë ¹ ê¶Œí•œì„ ì–»ìœ¼ì„¸ìš”','Durasi lock tersedia:':'ì‚¬ìš© ê°€ëŠ¥í•œ ë½ ê¸°ê°„:','30 hari':'30ì¼','60 hari':'60ì¼','90 hari':'90ì¼','Lock amount':'ë½ ê¸ˆì•¡','Nominal Lock (IDR)':'ë½ ê¸ˆì•¡ (IDR)','Quota:':'í• ë‹¹ëŸ‰:','1 Box/Day':'í•˜ë£¨ 1ë°•ìŠ¤','Lock Saldo Sekarang':'ì§€ê¸ˆ ìž”ì•¡ ë½','Total Locked':'ì´ ë½ ê¸ˆì•¡','Daily Claim:':'ì¼ì¼ ìˆ˜ë ¹:','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.':'ì•„ëž˜ ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ ë²„íŠ¼ìœ¼ë¡œ ìˆ˜ë ¹í•©ë‹ˆë‹¤. ê¸°ê°„ì´ ëë‚˜ë©´ ë½ì´ ìžë™ìœ¼ë¡œ ì¢…ë£Œë©ë‹ˆë‹¤.','Lock minimum':'ìµœì†Œ ë½','to activate':'í™œì„±í™”í•˜ë ¤ë©´','Open Daily Box':'ì¼ì¼ ë°•ìŠ¤ ì—´ê¸°','Available Today':'ì˜¤ëŠ˜ ì‚¬ìš© ê°€ëŠ¥','Unboxing':'ë°•ìŠ¤ ê°œë´‰ ì¤‘','Server sedang menentukan reward...':'서버가 보상을 결정하는 중입니다…','Reward Blind Box Harian':'ì¼ì¼ ë¸”ë¼ì¸ë“œ ë°•ìŠ¤ ë³´ìƒ','Keep in Vault':'ë³´ê´€í•¨ì— ë³´ê´€','Done':'ì™„ë£Œ','Left':'ë‚¨ìŒ','Jadwal Durasi Lock':'ë½ ê¸°ê°„ ì¼ì •','30 Days Term':'30ì¼ ê¸°ê°„','60 Days Term':'60ì¼ ê¸°ê°„','90 Days Term':'90ì¼ ê¸°ê°„','Reward harian sesuai pengaturan server':'ì¼ì¼ ë³´ìƒì€ ì„œë²„ ì„¤ì •ì— ë”°ë¦…ë‹ˆë‹¤','Viewers on Wheel':'íœ ì˜ ì‹œì²­ìž','Clear All':'ëª¨ë‘ ì§€ìš°ê¸°','Selected Winner':'ì„ íƒëœ ë‹¹ì²¨ìž','Live Participants Only':'ë¼ì´ë¸Œ ì°¸ê°€ìžë§Œ','Spinning for Winner...':'당첨자를 선택하는 중…','Spin Raffle Wheel':'ì¶”ì²¨ íœ  ëŒë¦¬ê¸°','Current Viewers on Wheel:':'í˜„ìž¬ íœ ì˜ ì‹œì²­ìž:','Recent Raffle Winners':'ìµœê·¼ ì¶”ì²¨ ë‹¹ì²¨ìž','Edit':'íŽ¸ì§‘','Logout':'ë¡œê·¸ì•„ì›ƒ','USDT Account':'USDT ê³„ì •','Member':'íšŒì›','EVM Wallet':'EVM ì§€ê°‘','Wallet belum terhubung':'ì§€ê°‘ì´ ì—°ê²°ë˜ì§€ ì•ŠìŒ','Alamat wallet akun. Recovery phrase tidak disimpan di server.':'ê³„ì • ì§€ê°‘ ì£¼ì†Œìž…ë‹ˆë‹¤. ë³µêµ¬ ë¬¸êµ¬ëŠ” ì„œë²„ì— ì €ìž¥ë˜ì§€ ì•ŠìŠµë‹ˆë‹¤.','WALLET REQUIRED':'ì§€ê°‘ í•„ìš”','Minimum withdrawal':'ìµœì†Œ ì¶œê¸ˆ','Minimum withdrawal is':'ìµœì†Œ ì¶œê¸ˆì•¡ì€','Started':'ì‹œìž‘ë¨','Deposit, withdrawal, lock, reward & bonus':'ìž…ê¸ˆ, ì¶œê¸ˆ, ë½, ë³´ìƒ ë° ë³´ë„ˆìŠ¤','Locked Balance':'ìž ê¸´ ìž”ì•¡','Earns passive yield':'íŒ¨ì‹œë¸Œ ìˆ˜ìµì„ ì–»ìŠµë‹ˆë‹¤','Change photo from device':'ê¸°ê¸°ì—ì„œ ì‚¬ì§„ ë³€ê²½','Upload photo from device':'ê¸°ê¸°ì—ì„œ ì‚¬ì§„ ì—…ë¡œë“œ','JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG, PNG, WEBP • 사진은 기기 저장소에 유지됩니다','No unread notifications at this time.':'í˜„ìž¬ ì½ì§€ ì•Šì€ ì•Œë¦¼ì´ ì—†ìŠµë‹ˆë‹¤.','Guest':'ê²ŒìŠ¤íŠ¸','Profile':'í”„ë¡œí•„','Kelola akun, wallet, dan aktivitas kamu.':'ê³„ì •, ì§€ê°‘ ë° í™œë™ì„ ê´€ë¦¬í•©ë‹ˆë‹¤.'
  },
  ar: {
    'Tersedia untuk lock aktif minimum. Reward harian diproses server dan masuk ke saldo tersedia.':'متاح مع الحد الأدنى من القفل النشط. تتم معالجة المكافآت اليومية بواسطة الخادم وإضافتها إلى الرصيد المتاح.','Daily Active Reward':'المكافأة اليومية النشطة','Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'مستوى قفل أعلى مع مقتنيات نادرة. يحدد الخادم المكافآت المالية.','Enhanced Lock Tier':'مستوى قفل متقدم','Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.':'مستوى قفل مرتفع مع مقتنيات نادرة. يحدد الخادم المكافآت المالية.','Premium Lock Tier':'مستوى القفل المميز','Reward harian masuk ke saldo':'تُضاف المكافآت اليومية إلى الرصيد','Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.':'افتح الصندوق الغامض اليومي بناءً على رصيدك المقفول. تتبع المطالبات اليومية قواعد الخادم ويتم إعادة ضبطها حسب توقيت WIB.','Available':'متاح','Quota resets in':'إعادة ضبط الحصة خلال','Lock minimal $4 equivalent untuk membuka Blind Box':'اقفل ما لا يقل عن ما يعادل 4 دولارات لفتح الصندوق الغامض','Daily Boxes':'الصناديق اليومية','Lock Amount (IDR)':'مبلغ القفل (IDR)','Claim Daily Blind Box':'المطالبة بالصندوق الغامض اليومي','Lock aktif':'قفل نشط','Aturan claim tetap 1 kali per hari.':'يبقى حد المطالبة مرة واحدة يوميًا.','LOCK SALDO DIBUTUHKAN':'مطلوب قفل الرصيد','Lock saldo untuk mendapatkan hak claim Blind Box harian':'اقفل رصيدك للحصول على حق المطالبة بالصندوق الغامض اليومي','Durasi lock tersedia:':'مدد القفل المتاحة:','30 hari':'30 يومًا','60 hari':'60 يومًا','90 hari':'90 يومًا','Lock amount':'مبلغ القفل','Nominal Lock (IDR)':'مبلغ القفل (IDR)','Quota:':'الحصة:','1 Box/Day':'صندوق واحد/يوم','Lock Saldo Sekarang':'اقفل الرصيد الآن','Total Locked':'إجمالي المقفول','Daily Claim:':'المطالبة اليومية:','Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.':'تتم المطالبة عبر زر الصندوق الغامض أدناه. ينتهي القفل تلقائيًا عند انتهاء مدته.','Lock minimum':'الحد الأدنى للقفل','to activate':'للتفعيل','Open Daily Box':'فتح الصندوق اليومي','Available Today':'متاح اليوم','Unboxing':'فتح الصندوق','Server sedang menentukan reward...':'الخادم يحدد المكافأة…','Reward Blind Box Harian':'مكافأة الصندوق الغامض اليومية','Keep in Vault':'حفظ في الخزنة','Done':'تم','Left':'متبقٍ','Jadwal Durasi Lock':'جدول مدة القفل','30 Days Term':'مدة 30 يومًا','60 Days Term':'مدة 60 يومًا','90 Days Term':'مدة 90 يومًا','Reward harian sesuai pengaturan server':'المكافأة اليومية وفق إعدادات الخادم','Viewers on Wheel':'المشاهدون على العجلة','Clear All':'مسح الكل','Selected Winner':'الفائز المختار','Live Participants Only':'مشاركو البث المباشر فقط','Spinning for Winner...':'جارٍ تدوير العجلة لاختيار الفائز…','Spin Raffle Wheel':'تدوير عجلة السحب','Current Viewers on Wheel:':'المشاهدون الحاليون على العجلة:','Recent Raffle Winners':'الفائزون الأخيرون في السحب','Edit':'تعديل','Logout':'تسجيل الخروج','USDT Account':'حساب USDT','Member':'عضو','EVM Wallet':'محفظة EVM','Wallet belum terhubung':'المحفظة غير متصلة','Alamat wallet akun. Recovery phrase tidak disimpan di server.':'عنوان محفظة الحساب. لا يتم تخزين عبارة الاسترداد على الخادم.','WALLET REQUIRED':'المحفظة مطلوبة','Minimum withdrawal':'الحد الأدنى للسحب','Minimum withdrawal is':'الحد الأدنى للسحب هو','Started':'بدأ','Deposit, withdrawal, lock, reward & bonus':'الإيداع والسحب والقفل والمكافآت والمكافأة الإضافية','Locked Balance':'الرصيد المقفول','Earns passive yield':'يحقق عائدًا سلبيًا','Change photo from device':'تغيير الصورة من الجهاز','Upload photo from device':'رفع صورة من الجهاز','JPG, PNG, WEBP â€¢ photo stays from your device storage':'JPG وPNG وWEBP • تبقى الصورة في مساحة تخزين جهازك','No unread notifications at this time.':'لا توجد إشعارات غير مقروءة حاليًا.','Guest':'زائر','Profile':'الملف الشخصي','Kelola akun, wallet, dan aktivitas kamu.':'إدارة حسابك ومحفظتك ونشاطك.'
  }
};

for (const lang of Object.keys(GAMES_PROFILE_TRANSLATION_SCREENING) as LanguageCode[]) {
  Object.assign(translations[lang], GAMES_PROFILE_TRANSLATION_SCREENING[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], GAMES_PROFILE_TRANSLATION_SCREENING[lang]);
}

/* Spinner raffle wheel translation completion */
const SPINNER_RAFFLE_DESCRIPTION_TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  id: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!":
      "Roda undian streamer berisi nama pengguna penonton yang sedang live. Putar untuk memilih pemenang giveaway secara acak!"
  },
  en: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!":
      "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!"
  },
  es: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!":
      "Ruleta del streamer con los nombres de los espectadores en directo. ¡Gírala para elegir al azar al ganador del sorteo!"
  },
  pt: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!":
      "Roleta do streamer com os nomes de utilizadores dos espectadores ao vivo. Gire para escolher aleatoriamente o vencedor do sorteio!"
  },
  zh: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!":
      "主播抽奖转盘包含正在直播的观众用户名。转动转盘即可随机选出抽奖获胜者！"
  },
  ja: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!":
      "ライブ視聴者のユーザー名が入ったストリーマー抽選ホイールです。回してランダムにプレゼント企画の当選者を選びましょう！"
  },
  ko: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!":
      "라이브 시청자 사용자 이름이 포함된 스트리머 추첨 휠입니다. 돌려서 무작위로 경품 추첨 당첨자를 선택하세요!"
  },
  ar: {
    "Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!":
      "عجلة سحب للستريمر تحتوي على أسماء مستخدمي المشاهدين المباشرين. أدر العجلة لاختيار فائز عشوائي بالهدية!"
  }
};

for (const lang of Object.keys(SPINNER_RAFFLE_DESCRIPTION_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], SPINNER_RAFFLE_DESCRIPTION_TRANSLATIONS[lang]);
  Object.assign(PAGE_UI_TRANSLATIONS[lang], SPINNER_RAFFLE_DESCRIPTION_TRANSLATIONS[lang]);
}
