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
  return LOCALE_CONFIG[language] ?? LOCALE_CONFIG.id;
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
const REGISTRATION_BONUS_IDR_PER_UNIT: Record<LanguageCode, number> = {
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
  const idrPerUnit = REGISTRATION_BONUS_IDR_PER_UNIT[language];
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

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('sys_stream_language') as LanguageCode | null;
    return saved && LANGUAGES.some(l => l.code === saved) ? saved : 'id';
  });

  const setLanguage = (next: LanguageCode) => {
    const safeLanguage = LANGUAGES.some(l => l.code === next) ? next : 'id';
    setLanguageState(safeLanguage);
    localStorage.setItem('sys_stream_language', safeLanguage);
  };

  useEffect(() => {
    const config = getLocaleConfig(language);
    document.documentElement.lang = config.locale;
    document.documentElement.dir = config.direction;
    document.documentElement.dataset.language = language;
    document.documentElement.dataset.currency = config.currency;
    document.documentElement.dataset.locale = config.locale;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: string) => translations[language][key] ?? translations.en[key] ?? key,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
