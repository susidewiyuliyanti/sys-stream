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
  'Wallet Identity':'钱包身份','CONNECTING WALLET...':'正在连接钱包…','Wallet Connected':'钱包已连接',
  'Connect Wallet for Registration':'连接钱包进行注册','Register Now':'立即注册','Forgot Password?':'忘记密码？',
  'Verify your email':'验证您的邮箱','or Connect with Crypto Wallet':'或连接加密钱包'
});
Object.assign(translations.ja, {
  'Wallet Identity':'ウォレットID','CONNECTING WALLET...':'ウォレット接続中…','Wallet Connected':'ウォレット接続済み',
  'Connect Wallet for Registration':'登録用ウォレットを接続','Register Now':'今すぐ登録','Forgot Password?':'パスワードを忘れましたか？',
  'Verify your email':'メールを確認','or Connect with Crypto Wallet':'または暗号資産ウォレットを接続'
});
Object.assign(translations.ko, {
  'Wallet Identity':'지갑 ID','CONNECTING WALLET...':'지갑 연결 중...','Wallet Connected':'지갑 연결됨',
  'Connect Wallet for Registration':'가입용 지갑 연결','Register Now':'지금 가입','Forgot Password?':'비밀번호를 잊으셨나요?',
  'Verify your email':'이메일 인증','or Connect with Crypto Wallet':'또는 암호화폐 지갑 연결'
});
Object.assign(translations.ar, {
  'Wallet Identity':'هوية المحفظة','CONNECTING WALLET...':'جارٍ ربط المحفظة...','Wallet Connected':'تم ربط المحفظة',
  'Connect Wallet for Registration':'ربط المحفظة للتسجيل','Register Now':'سجّل الآن','Forgot Password?':'هل نسيت كلمة المرور؟',
  'Verify your email':'تحقق من بريدك الإلكتروني','or Connect with Crypto Wallet':'أو ربط محفظة العملات الرقمية'
});


// Cross-page exact UI labels used by the runtime translator.
const CROSS_PAGE_UI: Record<LanguageCode, Record<string,string>> = {
 id: {
  'Profile':'Profil','Kelola akun, wallet, dan aktivitas kamu.':'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address':'ID Pengguna = Alamat Wallet','Member':'Anggota','USDT Account':'Akun USDT','EVM Wallet':'Wallet EVM','Available':'Tersedia','Locked':'Terkunci','Wallet':'Wallet','Withdraw':'Tarik Dana','Ajukan penarikan':'Ajukan penarikan','Registration Bonus':'Bonus Registrasi','Bonus tersedia dan belum diklaim.':'Bonus tersedia dan belum diklaim.','Claim Bonus':'Klaim Bonus','Available Balance':'Saldo Tersedia','Referral Link':'Tautan Referral','Transaction History':'Riwayat Transaksi','Refresh':'Muat Ulang','Loading...':'Memuat...','Belum ada transaksi.':'Belum ada transaksi.','Live Now':'Live Sekarang','Buka Live Room →':'Buka Live Room →','Upload / Create Post':'Unggah / Buat Postingan','Community':'Komunitas','Tulis sesuatu untuk dibagikan ke komunitas...':'Tulis sesuatu untuk dibagikan ke komunitas...','URL media (opsional)':'URL media (opsional)','Terbitkan Postingan':'Terbitkan Postingan','Minimum withdrawal':'Penarikan minimum','Copy wallet address':'Salin alamat wallet','Copy referral link':'Salin tautan referral','Back':'Kembali','Legal':'Hukum','Version':'Versi','Important:':'Penting:','Terms & Conditions':'Syarat & Ketentuan','Privacy Policy':'Kebijakan Privasi','Last updated:':'Terakhir diperbarui:'
 },
 en: {},
 es: {
  'Profile':'Perfil','User ID = Wallet Address':'ID de usuario = dirección de wallet','Member':'Miembro','USDT Account':'Cuenta USDT','EVM Wallet':'Wallet EVM','Available':'Disponible','Locked':'Bloqueado','Withdraw':'Retirar','Registration Bonus':'Bono de registro','Claim Bonus':'Reclamar bono','Available Balance':'Saldo disponible','Referral Link':'Enlace de referidos','Transaction History':'Historial de transacciones','Refresh':'Actualizar','Loading...':'Cargando...','Live Now':'En vivo','Upload / Create Post':'Subir / crear publicación','Community':'Comunidad','Terbitkan Postingan':'Publicar','Back':'Volver','Legal':'Legal','Version':'Versión','Important:':'Importante:','Terms & Conditions':'Términos y condiciones','Privacy Policy':'Política de privacidad'
 },
 pt: {
  'Profile':'Perfil','User ID = Wallet Address':'ID do usuário = endereço da carteira','Member':'Membro','USDT Account':'Conta USDT','EVM Wallet':'Carteira EVM','Available':'Disponível','Locked':'Bloqueado','Withdraw':'Sacar','Registration Bonus':'Bônus de registro','Claim Bonus':'Resgatar bônus','Available Balance':'Saldo disponível','Referral Link':'Link de indicação','Transaction History':'Histórico de transações','Refresh':'Atualizar','Loading...':'Carregando...','Live Now':'Ao vivo','Upload / Create Post':'Enviar / criar publicação','Community':'Comunidade','Terbitkan Postingan':'Publicar','Back':'Voltar','Legal':'Legal','Version':'Versão','Important:':'Importante:','Terms & Conditions':'Termos e condições','Privacy Policy':'Política de privacidade'
 },
 zh: {
  'Profile':'个人资料','User ID = Wallet Address':'用户ID = 钱包地址','Member':'会员','USDT Account':'USDT账户','EVM Wallet':'EVM钱包','Available':'可用','Locked':'已锁定','Withdraw':'提现','Registration Bonus':'注册奖励','Claim Bonus':'领取奖励','Available Balance':'可用余额','Referral Link':'推荐链接','Transaction History':'交易记录','Refresh':'刷新','Loading...':'加载中…','Live Now':'正在直播','Upload / Create Post':'上传 / 创建帖子','Community':'社区','Terbitkan Postingan':'发布','Back':'返回','Legal':'法律','Version':'版本','Important:':'重要：','Terms & Conditions':'条款与条件','Privacy Policy':'隐私政策'
 },
 ja: {
  'Profile':'プロフィール','User ID = Wallet Address':'ユーザーID = ウォレットアドレス','Member':'メンバー','USDT Account':'USDTアカウント','EVM Wallet':'EVMウォレット','Available':'利用可能','Locked':'ロック済み','Withdraw':'出金','Registration Bonus':'登録ボーナス','Claim Bonus':'ボーナスを受け取る','Available Balance':'利用可能残高','Referral Link':'紹介リンク','Transaction History':'取引履歴','Refresh':'更新','Loading...':'読み込み中…','Live Now':'ライブ中','Upload / Create Post':'投稿をアップロード / 作成','Community':'コミュニティ','Terbitkan Postingan':'投稿する','Back':'戻る','Legal':'法務','Version':'バージョン','Important:':'重要：','Terms & Conditions':'利用規約','Privacy Policy':'プライバシーポリシー'
 },
 ko: {
  'Profile':'프로필','User ID = Wallet Address':'사용자 ID = 지갑 주소','Member':'회원','USDT Account':'USDT 계정','EVM Wallet':'EVM 지갑','Available':'사용 가능','Locked':'잠김','Withdraw':'출금','Registration Bonus':'가입 보너스','Claim Bonus':'보너스 받기','Available Balance':'사용 가능 잔액','Referral Link':'추천 링크','Transaction History':'거래 내역','Refresh':'새로고침','Loading...':'로드 중...','Live Now':'라이브','Upload / Create Post':'게시물 업로드 / 만들기','Community':'커뮤니티','Terbitkan Postingan':'게시','Back':'뒤로','Legal':'법률','Version':'버전','Important:':'중요:','Terms & Conditions':'이용약관','Privacy Policy':'개인정보 처리방침'
 },
 ar: {
  'Profile':'الملف الشخصي','User ID = Wallet Address':'معرّف المستخدم = عنوان المحفظة','Member':'عضو','USDT Account':'حساب USDT','EVM Wallet':'محفظة EVM','Available':'متاح','Locked':'مقفل','Withdraw':'سحب','Registration Bonus':'مكافأة التسجيل','Claim Bonus':'استلام المكافأة','Available Balance':'الرصيد المتاح','Referral Link':'رابط الإحالة','Transaction History':'سجل المعاملات','Refresh':'تحديث','Loading...':'جارٍ التحميل...','Live Now':'مباشر الآن','Upload / Create Post':'رفع / إنشاء منشور','Community':'المجتمع','Terbitkan Postingan':'نشر','Back':'رجوع','Legal':'قانوني','Version':'الإصدار','Important:':'مهم:','Terms & Conditions':'الشروط والأحكام','Privacy Policy':'سياسة الخصوصية'
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

const CORE_PAGE_TRANSLATIONS: Record<LanguageCode, Record<string,string>> = {
  id: {
    'Profile':'Profil','Kelola akun, wallet, dan aktivitas kamu.':'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address':'ID Pengguna = Alamat Wallet','Available':'Tersedia','Locked':'Terkunci','Withdraw':'Penarikan','Ajukan penarikan':'Ajukan penarikan','Registration Bonus':'Bonus Pendaftaran','Bonus tersedia dan belum diklaim.':'Bonus tersedia dan belum diklaim.','Available Balance':'Saldo Tersedia','Bagikan link ini untuk mengundang user baru.':'Bagikan link ini untuk mengundang user baru.','Event Participation Status':'Status Partisipasi Event','Belum ada event yang diikuti.':'Belum ada event yang diikuti.','Deposit, withdrawal, lock, reward & bonus':'Deposit, penarikan, lock, reward & bonus','Belum ada transaksi.':'Belum ada transaksi.','Submit Withdrawal':'Ajukan Penarikan','Upload / Create Post':'Upload / Buat Post',
    'TOP USERS RANKED':'PERINGKAT PENGGUNA TERATAS','TOTAL REFERRALS':'TOTAL REFERRAL','BONUS BALANCE':'SALDO BONUS','INVITE FRIENDS — EARN NOW':'UNDANG TEMAN — DAPATKAN REWARD','Privacy Policy':'Kebijakan Privasi','Last updated: October 1, 2026':'Terakhir diperbarui: 1 Oktober 2026','Terms & Conditions':'Syarat & Ketentuan','Please read these terms before creating your SYS STREAM account.':'Baca ketentuan ini sebelum membuat akun SYS STREAM.','Remember me':'Ingat saya','or Connect with Crypto Wallet':'atau Hubungkan dengan Crypto Wallet','Connect Wallet':'Hubungkan Wallet',"Don't have an account? ":'Belum punya akun? ','EVM Wallet Recovery Phrase':'Recovery Phrase EVM Wallet','Wallet Address':'Alamat Wallet','Recovery Phrase':'Recovery Phrase','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.'
  },
  en: {
    'Profile':'Profile','Kelola akun, wallet, dan aktivitas kamu.':'Manage your account, wallet, and activity.','User ID = Wallet Address':'User ID = Wallet Address','Available':'Available','Locked':'Locked','Withdraw':'Withdraw','Ajukan penarikan':'Request Withdrawal','Registration Bonus':'Registration Bonus','Bonus tersedia dan belum diklaim.':'Bonus is available and has not been claimed.','Available Balance':'Available Balance','Bagikan link ini untuk mengundang user baru.':'Share this link to invite new users.','Event Participation Status':'Event Participation Status','Belum ada event yang diikuti.':'No events joined yet.','Deposit, withdrawal, lock, reward & bonus':'Deposit, withdrawal, lock, reward & bonus','Belum ada transaksi.':'No transactions yet.','Submit Withdrawal':'Submit Withdrawal','Upload / Create Post':'Upload / Create Post','TOP USERS RANKED':'TOP USERS RANKED','TOTAL REFERRALS':'TOTAL REFERRALS','BONUS BALANCE':'BONUS BALANCE','INVITE FRIENDS — EARN NOW':'INVITE FRIENDS — EARN NOW','Privacy Policy':'Privacy Policy','Last updated: October 1, 2026':'Last updated: October 1, 2026','Terms & Conditions':'Terms & Conditions','Please read these terms before creating your SYS STREAM account.':'Please read these terms before creating your SYS STREAM account.','Remember me':'Remember me','or Connect with Crypto Wallet':'or Connect with Crypto Wallet','Connect Wallet':'Connect Wallet',"Don't have an account? ":"Don't have an account? ",'EVM Wallet Recovery Phrase':'EVM Wallet Recovery Phrase','Wallet Address':'Wallet Address','Recovery Phrase':'Recovery Phrase'
  },
  es: {'Profile':'Perfil','Kelola akun, wallet, dan aktivitas kamu.':'Administra tu cuenta, billetera y actividad.','User ID = Wallet Address':'ID de usuario = dirección de billetera','Available':'Disponible','Locked':'Bloqueado','Withdraw':'Retirar','Registration Bonus':'Bono de registro','Available Balance':'Saldo disponible','Event Participation Status':'Estado de participación en eventos','Transaction History':'Historial de transacciones','Privacy Policy':'Política de privacidad','Terms & Conditions':'Términos y condiciones','Remember me':'Recuérdame','Connect Wallet':'Conectar billetera','Wallet Address':'Dirección de billetera','Recovery Phrase':'Frase de recuperación'},
  pt: {'Profile':'Perfil','Kelola akun, wallet, dan aktivitas kamu.':'Gerencie sua conta, carteira e atividade.','User ID = Wallet Address':'ID do usuário = endereço da carteira','Available':'Disponível','Locked':'Bloqueado','Withdraw':'Saque','Registration Bonus':'Bônus de registro','Available Balance':'Saldo disponível','Event Participation Status':'Status de participação no evento','Transaction History':'Histórico de transações','Privacy Policy':'Política de privacidade','Terms & Conditions':'Termos e condições','Remember me':'Lembrar de mim','Connect Wallet':'Conectar carteira','Wallet Address':'Endereço da carteira','Recovery Phrase':'Frase de recuperação'},
  zh: {'Profile':'个人资料','Kelola akun, wallet, dan aktivitas kamu.':'管理您的账户、钱包和活动。','User ID = Wallet Address':'用户 ID = 钱包地址','Available':'可用','Locked':'已锁定','Withdraw':'提现','Registration Bonus':'注册奖励','Available Balance':'可用余额','Event Participation Status':'活动参与状态','Transaction History':'交易记录','Privacy Policy':'隐私政策','Terms & Conditions':'条款与条件','Remember me':'记住我','Connect Wallet':'连接钱包','Wallet Address':'钱包地址','Recovery Phrase':'助记词'},
  ja: {'Profile':'プロフィール','Kelola akun, wallet, dan aktivitas kamu.':'アカウント、ウォレット、アクティビティを管理します。','User ID = Wallet Address':'ユーザーID = ウォレットアドレス','Available':'利用可能','Locked':'ロック済み','Withdraw':'出金','Registration Bonus':'登録ボーナス','Available Balance':'利用可能残高','Event Participation Status':'イベント参加状況','Transaction History':'取引履歴','Privacy Policy':'プライバシーポリシー','Terms & Conditions':'利用規約','Remember me':'ログイン状態を保持','Connect Wallet':'ウォレットを接続','Wallet Address':'ウォレットアドレス','Recovery Phrase':'リカバリーフレーズ'},
  ko: {'Profile':'프로필','Kelola akun, wallet, dan aktivitas kamu.':'계정, 지갑 및 활동을 관리하세요.','User ID = Wallet Address':'사용자 ID = 지갑 주소','Available':'사용 가능','Locked':'잠김','Withdraw':'출금','Registration Bonus':'가입 보너스','Available Balance':'사용 가능 잔액','Event Participation Status':'이벤트 참여 상태','Transaction History':'거래 내역','Privacy Policy':'개인정보 보호정책','Terms & Conditions':'이용약관','Remember me':'로그인 상태 유지','Connect Wallet':'지갑 연결','Wallet Address':'지갑 주소','Recovery Phrase':'복구 문구'},
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

Object.assign(translations.id,{ 'Leaderboard & Referral':'Papan Peringkat & Referral','Leaderboard':'Papan Peringkat','Referral Event':'Event Referral','Production Leaderboard':'Papan Peringkat Produksi','No production ranking data is available yet. Dummy ranking data is intentionally disabled.':'Data peringkat produksi belum tersedia. Data peringkat dummy sengaja dinonaktifkan.','Referral participation is optional. Use your wallet identity as your referral identifier.':'Partisipasi referral bersifat opsional. Gunakan identitas wallet sebagai identitas referral.','Your Wallet / Referral ID':'Wallet / ID Referral Anda','Wallet not connected':'Wallet belum terhubung','Copy Referral ID':'Salin ID Referral','Live Referral Data':'Data Referral Live','Only verified production activity will be shown here.':'Hanya aktivitas produksi yang terverifikasi yang akan ditampilkan di sini.','Code Copied!':'Kode Disalin!','Referral code copied to clipboard.':'Kode referral berhasil disalin ke clipboard.','Referral':'Referral','No new notifications.':'Tidak ada notifikasi baru.'});
Object.assign(translations.en,{ 'Leaderboard & Referral':'Leaderboard & Referral','Leaderboard':'Leaderboard','Referral Event':'Referral Event','Production Leaderboard':'Production Leaderboard','No production ranking data is available yet. Dummy ranking data is intentionally disabled.':'No production ranking data is available yet. Dummy ranking data is intentionally disabled.','Referral participation is optional. Use your wallet identity as your referral identifier.':'Referral participation is optional. Use your wallet identity as your referral identifier.','Your Wallet / Referral ID':'Your Wallet / Referral ID','Wallet not connected':'Wallet not connected','Copy Referral ID':'Copy Referral ID','Live Referral Data':'Live Referral Data','Only verified production activity will be shown here.':'Only verified production activity will be shown here.','Code Copied!':'Code Copied!','Referral code copied to clipboard.':'Referral code copied to clipboard.','Referral':'Referral','No new notifications.':'No new notifications.'});
Object.assign(translations.es,{ 'Leaderboard & Referral':'Clasificación y referidos','Leaderboard':'Clasificación','Referral Event':'Evento de referidos','Production Leaderboard':'Clasificación de producción','Wallet not connected':'Wallet no conectada','Copy Referral ID':'Copiar ID de referido','Live Referral Data':'Datos de referidos en vivo','Referral':'Referidos','No new notifications.':'No hay notificaciones nuevas.'});
Object.assign(translations.pt,{ 'Leaderboard & Referral':'Ranking e indicações','Leaderboard':'Ranking','Referral Event':'Evento de indicações','Production Leaderboard':'Ranking de produção','Wallet not connected':'Carteira não conectada','Copy Referral ID':'Copiar ID de indicação','Live Referral Data':'Dados de indicações ao vivo','Referral':'Indicação','No new notifications.':'Não há novas notificações.'});
Object.assign(translations.zh,{ 'Leaderboard & Referral':'排行榜与推荐','Leaderboard':'排行榜','Referral Event':'推荐活动','Production Leaderboard':'生产排行榜','Wallet not connected':'钱包未连接','Copy Referral ID':'复制推荐ID','Live Referral Data':'实时推荐数据','Referral':'推荐','No new notifications.':'没有新通知。'});
Object.assign(translations.ja,{ 'Leaderboard & Referral':'ランキングと紹介','Leaderboard':'ランキング','Referral Event':'紹介イベント','Production Leaderboard':'本番ランキング','Wallet not connected':'ウォレット未接続','Copy Referral ID':'紹介IDをコピー','Live Referral Data':'ライブ紹介データ','Referral':'紹介','No new notifications.':'新しい通知はありません。'});
Object.assign(translations.ko,{ 'Leaderboard & Referral':'순위 및 추천','Leaderboard':'순위표','Referral Event':'추천 이벤트','Production Leaderboard':'운영 순위표','Wallet not connected':'지갑이 연결되지 않음','Copy Referral ID':'추천 ID 복사','Live Referral Data':'실시간 추천 데이터','Referral':'추천','No new notifications.':'새 알림이 없습니다.'});
Object.assign(translations.ar,{ 'Leaderboard & Referral':'المتصدرون والإحالات','Leaderboard':'المتصدرون','Referral Event':'حدث الإحالة','Production Leaderboard':'ترتيب الإنتاج','Wallet not connected':'المحفظة غير متصلة','Copy Referral ID':'نسخ معرّف الإحالة','Live Referral Data':'بيانات الإحالة المباشرة','Referral':'الإحالة','No new notifications.':'لا توجد إشعارات جديدة.'});

Object.assign(translations.id, {'Username, Email or Wallet':'Username, Email atau Wallet'});
Object.assign(translations.en, {'Username, Email or Wallet':'Username, Email or Wallet'});
Object.assign(translations.es, {'Username, Email or Wallet':'Usuario, correo o wallet'});
Object.assign(translations.pt, {'Username, Email or Wallet':'Usuário, e-mail ou carteira'});
Object.assign(translations.zh, {'Username, Email or Wallet':'用户名、邮箱或钱包'});
Object.assign(translations.ja, {'Username, Email or Wallet':'ユーザー名、メール、またはウォレット'});
Object.assign(translations.ko, {'Username, Email or Wallet':'사용자 이름, 이메일 또는 지갑'});
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
'Back':'返回','Back to account':'返回账户','Legal':'法律','Please read these terms before creating your SYS STREAM account.':'创建 SYS STREAM 账户前请阅读这些条款。','Account & Security':'账户与安全','Balance & Transactions':'余额与交易','Rules & Acceptance':'规则与接受','Acceptance of Terms':'接受条款','Eligibility & Account':'资格与账户','Deposits & Digital Assets':'充值与数字资产','Available Balance & Locked Balance':'可用余额与锁定余额','Games, Rewards & Settlement':'游戏、奖励与结算','Prohibited Conduct':'禁止行为','Account Review & Suspension':'账户审核与暂停','Service Availability':'服务可用性','Limitation of Liability':'责任限制','Changes to These Terms':'条款变更','Contact':'联系','Important:':'重要：','Privacy Policy':'隐私政策','Scope':'范围','Information We Collect':'我们收集的信息','How We Use Information':'我们如何使用信息','Blockchain and Payment Information':'区块链与支付信息','Sharing of Information':'信息共享','Data Security':'数据安全','Data Retention':'数据保留','Your Choices and Rights':'您的选择与权利','Cookies and Local Storage':'Cookie 与本地存储','Children':'儿童','Changes to This Policy':'政策变更','Last updated:':'最后更新：'
},
ja:{
'Back':'戻る','Back to account':'アカウントに戻る','Legal':'法務','Please read these terms before creating your SYS STREAM account.':'SYS STREAMアカウントを作成する前に、これらの規約をお読みください。','Account & Security':'アカウントとセキュリティ','Balance & Transactions':'残高と取引','Rules & Acceptance':'ルールと同意','Acceptance of Terms':'規約への同意','Eligibility & Account':'利用資格とアカウント','Deposits & Digital Assets':'入金とデジタル資産','Available Balance & Locked Balance':'利用可能残高とロック残高','Games, Rewards & Settlement':'ゲーム・報酬・決済','Prohibited Conduct':'禁止行為','Account Review & Suspension':'アカウント審査と停止','Service Availability':'サービス提供状況','Limitation of Liability':'責任の制限','Changes to These Terms':'規約の変更','Contact':'お問い合わせ','Important:':'重要：','Privacy Policy':'プライバシーポリシー','Scope':'適用範囲','Information We Collect':'収集する情報','How We Use Information':'情報の利用方法','Blockchain and Payment Information':'ブロックチェーンと決済情報','Sharing of Information':'情報の共有','Data Security':'データセキュリティ','Data Retention':'データ保持','Your Choices and Rights':'選択肢と権利','Cookies and Local Storage':'Cookieとローカルストレージ','Children':'子ども','Changes to This Policy':'ポリシーの変更','Last updated:':'最終更新：'
},
ko:{
'Back':'뒤로','Back to account':'계정으로 돌아가기','Legal':'법률','Please read these terms before creating your SYS STREAM account.':'SYS STREAM 계정을 만들기 전에 이 약관을 읽어 주세요.','Account & Security':'계정 및 보안','Balance & Transactions':'잔액 및 거래','Rules & Acceptance':'규칙 및 동의','Acceptance of Terms':'약관 동의','Eligibility & Account':'이용 자격 및 계정','Deposits & Digital Assets':'입금 및 디지털 자산','Available Balance & Locked Balance':'사용 가능 잔액 및 잠금 잔액','Games, Rewards & Settlement':'게임, 보상 및 정산','Prohibited Conduct':'금지 행위','Account Review & Suspension':'계정 검토 및 정지','Service Availability':'서비스 이용 가능성','Limitation of Liability':'책임 제한','Changes to These Terms':'약관 변경','Contact':'문의','Important:':'중요:','Privacy Policy':'개인정보 처리방침','Scope':'범위','Information We Collect':'수집하는 정보','How We Use Information':'정보 이용 방법','Blockchain and Payment Information':'블록체인 및 결제 정보','Sharing of Information':'정보 공유','Data Security':'데이터 보안','Data Retention':'데이터 보관','Your Choices and Rights':'선택 및 권리','Cookies and Local Storage':'쿠키 및 로컬 저장소','Children':'아동','Changes to This Policy':'정책 변경','Last updated:':'최종 업데이트:'
},
ar:{
'Back':'رجوع','Back to account':'العودة إلى الحساب','Legal':'قانوني','Please read these terms before creating your SYS STREAM account.':'يرجى قراءة هذه الشروط قبل إنشاء حساب SYS STREAM.','Account & Security':'الحساب والأمان','Balance & Transactions':'الرصيد والمعاملات','Rules & Acceptance':'القواعد والموافقة','Acceptance of Terms':'الموافقة على الشروط','Eligibility & Account':'الأهلية والحساب','Deposits & Digital Assets':'الإيداعات والأصول الرقمية','Available Balance & Locked Balance':'الرصيد المتاح والرصيد المقفل','Games, Rewards & Settlement':'الألعاب والمكافآت والتسوية','Prohibited Conduct':'السلوك المحظور','Account Review & Suspension':'مراجعة الحساب وتعليقه','Service Availability':'توفر الخدمة','Limitation of Liability':'حدود المسؤولية','Changes to These Terms':'تغييرات الشروط','Contact':'اتصل بنا','Important:':'مهم:','Privacy Policy':'سياسة الخصوصية','Scope':'النطاق','Information We Collect':'المعلومات التي نجمعها','How We Use Information':'كيفية استخدام المعلومات','Blockchain and Payment Information':'معلومات البلوك تشين والدفع','Sharing of Information':'مشاركة المعلومات','Data Security':'أمان البيانات','Data Retention':'الاحتفاظ بالبيانات','Your Choices and Rights':'خياراتك وحقوقك','Cookies and Local Storage':'ملفات تعريف الارتباط والتخزين المحلي','Children':'الأطفال','Changes to This Policy':'تغييرات هذه السياسة','Last updated:':'آخر تحديث:'
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
'Affiliate Partner Program':'联盟合作伙伴计划','Your Personal Affiliate Link':'您的个人推广链接','Direct Invitations':'直接邀请','Active Referees:':'活跃推荐用户：','Network Invites':'网络邀请','Deep Ecosystem':'深度生态','Affiliate Income Calculator':'联盟收益计算器','Active Friends Invited:':'已邀请活跃好友：','Average Weekly Wager per Friend:':'每位好友平均每周投注：','Estimated Monthly Earnings':'预计月收益','Live Referral Feed':'实时推荐动态','Referee Handle':'被推荐人','Date Joined':'加入日期','Commission Tier':'佣金等级','Wager Volume':'投注量','Commission Earned':'已获得佣金','Sign in to join the Live Room':'登录以加入直播间','Your account profile':'您的账户资料','Live Participants':'直播参与者','Loading participants...':'正在加载参与者…','No other participants yet.':'暂无其他参与者。','No participants yet.':'暂无参与者。','Viewer Username Raffle Spinner':'观众用户名抽奖转盘','Live Participants Only':'仅限直播参与者','Spinning for Winner...':'正在抽取获胜者…','Current Viewers on Wheel:':'当前转盘观众：','Recent Raffle Winners':'最近抽奖获胜者','Digital Crypto Card Number Guess':'数字加密卡号码竞猜','Streamer Card Settings':'主播卡片设置','Streamer Card Configurator':'主播卡片配置器','Card Title':'卡片标题','Serial Number':'序列号','Streamer Clue / Note for Viewers':'主播给观众的提示','Concealed':'隐藏','Revealed':'已揭示','Streamer Clue:':'主播提示：','Mode Interaksi':'互动模式','Verifying Cryptographic Seed...':'正在验证加密种子…','Verify Challenge':'验证挑战','Provably Fair Verification':'可验证公平性验证','NOWPayments Crypto Deposit':'NOWPayments 加密货币充值','Instant deposit with zero platform fees':'即时充值，平台零手续费','Create NOWPayments Invoice':'创建 NOWPayments 发票','Order ID:':'订单ID：','Wallet Address':'钱包地址','Recovery Phrase':'恢复短语','Remember me':'记住我','Connect Wallet':'连接钱包','Secured with Web3':'由 Web3 保护','Biometric Login Available':'支持生物识别登录'
},
ja:{
'Affiliate Partner Program':'アフィリエイトパートナープログラム','Your Personal Affiliate Link':'あなたのアフィリエイトリンク','Direct Invitations':'直接招待','Active Referees:':'アクティブ紹介者：','Network Invites':'ネットワーク招待','Deep Ecosystem':'深いエコシステム','Affiliate Income Calculator':'アフィリエイト収益計算機','Active Friends Invited:':'招待したアクティブな友達：','Average Weekly Wager per Friend:':'友達1人あたり平均週間ベット：','Estimated Monthly Earnings':'推定月間収益','Live Referral Feed':'ライブ紹介フィード','Referee Handle':'紹介ユーザー名','Date Joined':'参加日','Commission Tier':'コミッションレベル','Wager Volume':'ベット総額','Commission Earned':'獲得コミッション','Sign in to join the Live Room':'ログインしてライブルームに参加','Your account profile':'あなたのプロフィール','Live Participants':'ライブ参加者','Loading participants...':'参加者を読み込み中…','No other participants yet.':'他の参加者はいません。','No participants yet.':'参加者はいません。','Viewer Username Raffle Spinner':'視聴者ユーザー名抽選スピナー','Live Participants Only':'ライブ参加者のみ','Spinning for Winner...':'当選者を抽選中…','Current Viewers on Wheel:':'現在のスピナー参加者：','Recent Raffle Winners':'最近の当選者','Digital Crypto Card Number Guess':'デジタル暗号カード番号当て','Streamer Card Settings':'ストリーマーカード設定','Streamer Card Configurator':'ストリーマーカード設定ツール','Card Title':'カードタイトル','Serial Number':'シリアル番号','Streamer Clue / Note for Viewers':'視聴者へのストリーマーヒント','Concealed':'非表示','Revealed':'公開','Streamer Clue:':'ストリーマーヒント：','Mode Interaksi':'インタラクションモード','Verifying Cryptographic Seed...':'暗号シードを検証中…','Verify Challenge':'チャレンジを検証','Provably Fair Verification':'検証可能な公平性','NOWPayments Crypto Deposit':'NOWPayments暗号資産入金','Instant deposit with zero platform fees':'プラットフォーム手数料なしの即時入金','Create NOWPayments Invoice':'NOWPayments請求書を作成','Order ID:':'注文ID：','Wallet Address':'ウォレットアドレス','Recovery Phrase':'リカバリーフレーズ','Remember me':'ログイン状態を保持','Connect Wallet':'ウォレットを接続','Secured with Web3':'Web3で保護','Biometric Login Available':'生体認証ログイン対応'
},
ko:{
'Affiliate Partner Program':'제휴 파트너 프로그램','Your Personal Affiliate Link':'개인 제휴 링크','Direct Invitations':'직접 초대','Active Referees:':'활성 추천인:','Network Invites':'네트워크 초대','Deep Ecosystem':'심층 생태계','Affiliate Income Calculator':'제휴 수익 계산기','Active Friends Invited:':'초대한 활성 친구:','Average Weekly Wager per Friend:':'친구당 주간 평균 베팅:','Estimated Monthly Earnings':'예상 월 수익','Live Referral Feed':'실시간 추천 피드','Referee Handle':'추천 사용자','Date Joined':'가입일','Commission Tier':'커미션 등급','Wager Volume':'베팅 규모','Commission Earned':'획득 커미션','Sign in to join the Live Room':'로그인하여 라이브룸 참여','Your account profile':'내 계정 프로필','Live Participants':'라이브 참가자','Loading participants...':'참가자 로드 중...','No other participants yet.':'아직 다른 참가자가 없습니다.','No participants yet.':'참가자가 없습니다.','Viewer Username Raffle Spinner':'시청자 사용자명 추첨 스피너','Live Participants Only':'라이브 참가자만','Spinning for Winner...':'당첨자 추첨 중...','Current Viewers on Wheel:':'현재 스피너 참가자:','Recent Raffle Winners':'최근 추첨 당첨자','Digital Crypto Card Number Guess':'디지털 크립토 카드 번호 맞히기','Streamer Card Settings':'스트리머 카드 설정','Streamer Card Configurator':'스트리머 카드 구성기','Card Title':'카드 제목','Serial Number':'일련번호','Streamer Clue / Note for Viewers':'시청자용 스트리머 힌트','Concealed':'숨김','Revealed':'공개','Streamer Clue:':'스트리머 힌트:','Mode Interaksi':'상호작용 모드','Verifying Cryptographic Seed...':'암호 시드 확인 중...','Verify Challenge':'챌린지 확인','Provably Fair Verification':'검증 가능한 공정성','NOWPayments Crypto Deposit':'NOWPayments 암호화폐 입금','Instant deposit with zero platform fees':'플랫폼 수수료 없는 즉시 입금','Create NOWPayments Invoice':'NOWPayments 인보이스 생성','Order ID:':'주문 ID:','Wallet Address':'지갑 주소','Recovery Phrase':'복구 문구','Remember me':'로그인 기억하기','Connect Wallet':'지갑 연결','Secured with Web3':'Web3로 보호됨','Biometric Login Available':'생체 인증 로그인 지원'
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
zh:{'Referral link berhasil disalin.':'推荐链接已复制。','Withdrawal':'提现','Minimum withdrawal is':'最低提现金额为','Masukkan alamat wallet tujuan.':'请输入目标钱包地址。','Saldo tersedia tidak mencukupi.':'可用余额不足。','Permintaan penarikan berhasil dibuat dan menunggu proses.':'提现请求已创建，等待处理。','Penarikan gagal.':'提现失败。'},
ja:{'Referral link berhasil disalin.':'紹介リンクをコピーしました。','Withdrawal':'出金','Minimum withdrawal is':'最低出金額は','Masukkan alamat wallet tujuan.':'送金先ウォレットアドレスを入力してください。','Saldo tersedia tidak mencukupi.':'利用可能残高が不足しています。','Permintaan penarikan berhasil dibuat dan menunggu proses.':'出金リクエストを作成しました。処理待ちです。','Penarikan gagal.':'出金に失敗しました。'},
ko:{'Referral link berhasil disalin.':'추천 링크가 복사되었습니다.','Withdrawal':'출금','Minimum withdrawal is':'최소 출금액은','Masukkan alamat wallet tujuan.':'대상 지갑 주소를 입력하세요.','Saldo tersedia tidak mencukupi.':'사용 가능 잔액이 부족합니다.','Permintaan penarikan berhasil dibuat dan menunggu proses.':'출금 요청이 생성되었으며 처리 대기 중입니다.','Penarikan gagal.':'출금에 실패했습니다.'},
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
    'Live Room':'直播间','Gagal memuat live room.':'无法加载直播间。','Pesan gagal dikirim.':'消息发送失败。','Like gagal dikirim.':'点赞发送失败。','Masuk untuk bergabung ke Live Room':'登录后加入直播间','Peserta Live':'直播参与者','Memuat peserta...':'正在加载参与者…','Belum ada peserta lain.':'暂无其他参与者。','Belum ada peserta.':'暂无参与者。','Need More Viewers':'需要更多观众','Add at least 2 viewer usernames to spin the raffle wheel.':'至少添加2个观众用户名才能开始抽奖。','Winner Picked!':'已选出获胜者！','Congratulations':'恭喜','Selected as Lucky Viewer!':'被选为幸运观众！','Enter viewer username (e.g. TikTok_User)':'输入观众用户名（例如 TikTok_User）','Spinning for Winner...':'正在抽取获胜者…','Current Viewers on Wheel:':'当前转盘观众：','Recent Raffle Winners':'最近抽奖获胜者','Digital Crypto Card Number Guess':'数字加密卡号码竞猜','Streamer Card Settings':'主播卡片设置','Streamer Card Configurator':'主播卡片配置器','Card Title':'卡片标题','Serial Number':'序列号','Concealed':'隐藏','Revealed':'已揭示','Verify Challenge':'验证挑战','Provably Fair Verification':'可验证公平性','Affiliate Partner Program':'联盟合作伙伴计划','Your Personal Affiliate Link':'您的个人推广链接','Direct Invitations':'直接邀请','Network Invites':'网络邀请','Deep Ecosystem':'深度生态','Affiliate Income Calculator':'联盟收益计算器','Estimated Monthly Earnings':'预计月收益','Live Referral Feed':'实时推荐动态','Referee Handle':'被推荐人','Date Joined':'加入日期','Commission Tier':'佣金等级','Wager Volume':'投注量','Commission Earned':'已获得佣金','Copied Link':'链接已复制','Referral link copied to clipboard!':'推荐链接已复制！','No Pending Rewards':'没有待处理奖励','All referral commissions have already been transferred.':'所有推荐佣金均已转移。','Minimum Deposit':'最低充值','Minimum deposit is $5.00 USD':'最低充值金额为5.00美元','Failed to generate invoice':'生成发票失败','Create NOWPayments Invoice':'创建 NOWPayments 发票','Order ID: ':'订单ID：'
  },
  ja: {
    'Live Room':'ライブ配信ルーム','Gagal memuat live room.':'ライブ配信ルームを読み込めませんでした。','Pesan gagal dikirim.':'メッセージを送信できませんでした。','Like gagal dikirim.':'いいねを送信できませんでした。','Masuk untuk bergabung ke Live Room':'ログインしてライブ配信ルームに参加','Peserta Live':'ライブ参加者','Memuat peserta...':'参加者を読み込み中…','Belum ada peserta lain.':'他の参加者はいません。','Belum ada peserta.':'参加者はいません。','Need More Viewers':'視聴者が足りません','Add at least 2 viewer usernames to spin the raffle wheel.':'抽選を回すには2人以上の視聴者名を追加してください。','Winner Picked!':'当選者が決まりました！','Congratulations':'おめでとうございます','Selected as Lucky Viewer!':'ラッキー視聴者に選ばれました！','Enter viewer username (e.g. TikTok_User)':'視聴者名を入力（例：TikTok_User）','Spinning for Winner...':'当選者を抽選中…','Current Viewers on Wheel:':'現在の参加者：','Recent Raffle Winners':'最近の当選者','Digital Crypto Card Number Guess':'デジタル暗号カード番号当て','Streamer Card Settings':'ストリーマーカード設定','Streamer Card Configurator':'ストリーマーカード設定ツール','Card Title':'カードタイトル','Serial Number':'シリアル番号','Concealed':'非表示','Revealed':'公開','Verify Challenge':'チャレンジを検証','Provably Fair Verification':'検証可能な公平性','Affiliate Partner Program':'アフィリエイトパートナープログラム','Your Personal Affiliate Link':'あなたのアフィリエイトリンク','Direct Invitations':'直接招待','Network Invites':'ネットワーク招待','Deep Ecosystem':'深いエコシステム','Affiliate Income Calculator':'アフィリエイト収益計算機','Estimated Monthly Earnings':'推定月間収益','Live Referral Feed':'ライブ紹介フィード','Referee Handle':'紹介ユーザー名','Date Joined':'参加日','Commission Tier':'コミッションレベル','Wager Volume':'ベット総額','Commission Earned':'獲得コミッション','Copied Link':'リンクをコピーしました','Referral link copied to clipboard!':'紹介リンクをコピーしました！','No Pending Rewards':'保留中の報酬はありません','All referral commissions have already been transferred.':'紹介コミッションはすべて移行済みです。','Minimum Deposit':'最低入金額','Minimum deposit is $5.00 USD':'最低入金額は5.00米ドルです','Failed to generate invoice':'請求書の生成に失敗しました','Create NOWPayments Invoice':'NOWPayments請求書を作成','Order ID: ':'注文ID：'
  },
  ko: {
    'Live Room':'라이브 룸','Gagal memuat live room.':'라이브 룸을 불러오지 못했습니다.','Pesan gagal dikirim.':'메시지를 보내지 못했습니다.','Like gagal dikirim.':'좋아요를 보내지 못했습니다.','Masuk untuk bergabung ke Live Room':'로그인하여 라이브 룸에 참여','Peserta Live':'라이브 참가자','Memuat peserta...':'참가자 로드 중...','Belum ada peserta lain.':'아직 다른 참가자가 없습니다.','Belum ada peserta.':'참가자가 없습니다.','Need More Viewers':'시청자가 더 필요합니다','Add at least 2 viewer usernames to spin the raffle wheel.':'추첨을 돌리려면 시청자 이름을 2명 이상 추가하세요.','Winner Picked!':'당첨자 선정!','Congratulations':'축하합니다','Selected as Lucky Viewer!':'행운의 시청자로 선정되었습니다!','Enter viewer username (e.g. TikTok_User)':'시청자 사용자명 입력(예: TikTok_User)','Spinning for Winner...':'당첨자 추첨 중...','Current Viewers on Wheel:':'현재 스피너 참가자:','Recent Raffle Winners':'최근 추첨 당첨자','Digital Crypto Card Number Guess':'디지털 크립토 카드 번호 맞히기','Streamer Card Settings':'스트리머 카드 설정','Streamer Card Configurator':'스트리머 카드 구성기','Card Title':'카드 제목','Serial Number':'일련번호','Concealed':'숨김','Revealed':'공개','Verify Challenge':'챌린지 확인','Provably Fair Verification':'검증 가능한 공정성','Affiliate Partner Program':'제휴 파트너 프로그램','Your Personal Affiliate Link':'개인 제휴 링크','Direct Invitations':'직접 초대','Network Invites':'네트워크 초대','Deep Ecosystem':'심층 생태계','Affiliate Income Calculator':'제휴 수익 계산기','Estimated Monthly Earnings':'예상 월 수익','Live Referral Feed':'실시간 추천 피드','Referee Handle':'추천 사용자','Date Joined':'가입일','Commission Tier':'커미션 등급','Wager Volume':'베팅 규모','Commission Earned':'획득 커미션','Copied Link':'링크 복사됨','Referral link copied to clipboard!':'추천 링크가 복사되었습니다!','No Pending Rewards':'대기 중인 보상이 없습니다','All referral commissions have already been transferred.':'모든 추천 커미션이 이미 이전되었습니다.','Minimum Deposit':'최소 입금','Minimum deposit is $5.00 USD':'최소 입금액은 5.00 USD입니다','Failed to generate invoice':'인보이스 생성 실패','Create NOWPayments Invoice':'NOWPayments 인보이스 생성','Order ID: ':'주문 ID: '
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
    'Live':'Live','Buka Live Room →':'Buka Live Room →','Tebak Nomor':'Tebak Nomor','Ikuti permainan live.':'Ikuti permainan live.',
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
    'Live':'Live','Buka Live Room →':'Open Live Room →','Tebak Nomor':'Guess the Number','Ikuti permainan live.':'Join the live game.',
    'Spinner':'Spinner','Masuk ke event spinner.':'Enter the spinner event.','Blind Box':'Blind Box','Buka Blind Box dengan saldo akun.':'Open Blind Box using your account balance.',
    'Upload / Create Post':'Upload / Create Post','Tulis sesuatu untuk dibagikan ke komunitas...':'Write something to share with the community...',
    'URL media (opsional)':'Media URL (optional)','Menerbitkan...':'Publishing...','Terbitkan Postingan':'Publish Post',
    'Refresh balance':'Refresh balance','Refresh posts':'Refresh posts','Claim Bonus':'Claim Bonus'
  },
  es: {
    'Setiap user dapat membagikan tulisan dan postingan.':'Cada usuario puede compartir publicaciones y actualizaciones.','Belum ada postingan':'Aún no hay publicaciones','Jadilah pengguna pertama yang membagikan sesuatu.':'Sé el primero en compartir algo.','Buat Postingan':'Crear publicación','Belum ada data live aktif':'No hay datos de transmisiones activas','Room live akan tampil di sini setelah tersedia dari backend produksi.':'Las salas en vivo aparecerán cuando estén disponibles desde el backend de producción.','Live':'En vivo','Buka Live Room →':'Abrir sala en vivo →','Tebak Nomor':'Adivina el número','Ikuti permainan live.':'Participa en el juego en vivo.','Spinner':'Spinner','Masuk ke event spinner.':'Entrar al evento spinner.','Blind Box':'Blind Box','Buka Blind Box dengan saldo akun.':'Abrir Blind Box con el saldo de la cuenta.','Upload / Create Post':'Subir / crear publicación','Tulis sesuatu untuk dibagikan ke komunitas...':'Escribe algo para compartir con la comunidad...','URL media (opsional)':'URL multimedia (opcional)','Menerbitkan...':'Publicando...','Terbitkan Postingan':'Publicar','Refresh balance':'Actualizar saldo','Refresh posts':'Actualizar publicaciones','Claim Bonus':'Reclamar bono'
  },
  pt: {
    'Setiap user dapat membagikan tulisan dan postingan.':'Cada usuário pode compartilhar publicações e atualizações.','Belum ada postingan':'Ainda não há publicações','Jadilah pengguna pertama yang membagikan sesuatu.':'Seja o primeiro a compartilhar algo.','Buat Postingan':'Criar publicação','Belum ada data live aktif':'Não há dados de live ativos','Room live akan tampil di sini setelah tersedia dari backend produksi.':'As salas ao vivo aparecerão quando estiverem disponíveis no backend de produção.','Live':'Ao vivo','Buka Live Room →':'Abrir sala ao vivo →','Tebak Nomor':'Adivinhe o número','Ikuti permainan live.':'Participe do jogo ao vivo.','Spinner':'Spinner','Masuk ke event spinner.':'Entrar no evento spinner.','Blind Box':'Blind Box','Buka Blind Box dengan saldo akun.':'Abrir Blind Box usando o saldo da conta.','Upload / Create Post':'Enviar / criar publicação','Tulis sesuatu untuk dibagikan ke komunitas...':'Escreva algo para compartilhar com a comunidade...','URL media (opsional)':'URL de mídia (opcional)','Menerbitkan...':'Publicando...','Terbitkan Postingan':'Publicar','Refresh balance':'Atualizar saldo','Refresh posts':'Atualizar publicações','Claim Bonus':'Resgatar bônus'
  },
  zh: {
    'Setiap user dapat membagikan tulisan dan postingan.':'每位用户都可以分享帖子和动态。','Belum ada postingan':'暂无帖子','Jadilah pengguna pertama yang membagikan sesuatu.':'成为第一个分享内容的用户。','Buat Postingan':'创建帖子','Belum ada data live aktif':'暂无活跃直播数据','Room live akan tampil di sini setelah tersedia dari backend produksi.':'生产后端提供数据后，直播间会显示在这里。','Live':'直播','Buka Live Room →':'打开直播间 →','Tebak Nomor':'猜数字','Ikuti permainan live.':'参与直播游戏。','Spinner':'转盘','Masuk ke event spinner.':'进入转盘活动。','Blind Box':'盲盒','Buka Blind Box dengan saldo akun.':'使用账户余额打开盲盒。','Upload / Create Post':'上传 / 创建帖子','Tulis sesuatu untuk dibagikan ke komunitas...':'写下要与社区分享的内容...','URL media (opsional)':'媒体链接（可选）','Menerbitkan...':'发布中...','Terbitkan Postingan':'发布帖子','Refresh balance':'刷新余额','Refresh posts':'刷新帖子','Claim Bonus':'领取奖励'
  },
  ja: {
    'Setiap user dapat membagikan tulisan dan postingan.':'すべてのユーザーが投稿や更新を共有できます。','Belum ada postingan':'投稿はまだありません','Jadilah pengguna pertama yang membagikan sesuatu.':'最初に何かを共有しましょう。','Buat Postingan':'投稿を作成','Belum ada data live aktif':'アクティブなライブデータはありません','Room live akan tampil di sini setelah tersedia dari backend produksi.':'本番バックエンドから利用可能になるとライブルームがここに表示されます。','Live':'ライブ','Buka Live Room →':'ライブルームを開く →','Tebak Nomor':'数字を当てる','Ikuti permainan live.':'ライブゲームに参加する。','Spinner':'スピナー','Masuk ke event spinner.':'スピナーイベントに入る。','Blind Box':'ブラインドボックス','Buka Blind Box dengan saldo akun.':'アカウント残高でブラインドボックスを開く。','Upload / Create Post':'アップロード / 投稿を作成','Tulis sesuatu untuk dibagikan ke komunitas...':'コミュニティで共有する内容を入力...','URL media (opsional)':'メディアURL（任意）','Menerbitkan...':'公開中...','Terbitkan Postingan':'投稿を公開','Refresh balance':'残高を更新','Refresh posts':'投稿を更新','Claim Bonus':'ボーナスを受け取る'
  },
  ko: {
    'Setiap user dapat membagikan tulisan dan postingan.':'모든 사용자는 게시물과 업데이트를 공유할 수 있습니다.','Belum ada postingan':'게시물이 없습니다','Jadilah pengguna pertama yang membagikan sesuatu.':'가장 먼저 콘텐츠를 공유해 보세요.','Buat Postingan':'게시물 만들기','Belum ada data live aktif':'활성 라이브 데이터가 없습니다','Room live akan tampil di sini setelah tersedia dari backend produksi.':'프로덕션 백엔드에서 제공되면 라이브 룸이 여기에 표시됩니다.','Live':'라이브','Buka Live Room →':'라이브 룸 열기 →','Tebak Nomor':'숫자 맞히기','Ikuti permainan live.':'라이브 게임에 참여하세요.','Spinner':'스피너','Masuk ke event spinner.':'스피너 이벤트 입장','Blind Box':'블라인드 박스','Buka Blind Box dengan saldo akun.':'계정 잔액으로 블라인드 박스 열기','Upload / Create Post':'업로드 / 게시물 만들기','Tulis sesuatu untuk dibagikan ke komunitas...':'커뮤니티에 공유할 내용을 작성하세요...','URL media (opsional)':'미디어 URL(선택 사항)','Menerbitkan...':'게시 중...','Terbitkan Postingan':'게시물 게시','Refresh balance':'잔액 새로고침','Refresh posts':'게시물 새로고침','Claim Bonus':'보너스 받기'
  },
  ar: {
    'Setiap user dapat membagikan tulisan dan postingan.':'يمكن لكل مستخدم مشاركة المنشورات والتحديثات.','Belum ada postingan':'لا توجد منشورات بعد','Jadilah pengguna pertama yang membagikan sesuatu.':'كن أول مستخدم يشارك شيئًا.','Buat Postingan':'إنشاء منشور','Belum ada data live aktif':'لا توجد بيانات بث مباشر نشطة','Room live akan tampil di sini setelah tersedia dari backend produksi.':'ستظهر غرف البث المباشر هنا عند توفرها من الواجهة الخلفية للإنتاج.','Live':'مباشر','Buka Live Room →':'فتح غرفة البث المباشر →','Tebak Nomor':'خمن الرقم','Ikuti permainan live.':'شارك في اللعبة المباشرة.','Spinner':'العجلة','Masuk ke event spinner.':'الدخول إلى فعالية العجلة.','Blind Box':'الصندوق الغامض','Buka Blind Box dengan saldo akun.':'افتح الصندوق الغامض باستخدام رصيد حسابك.','Upload / Create Post':'رفع / إنشاء منشور','Tulis sesuatu untuk dibagikan ke komunitas...':'اكتب شيئًا لمشاركته مع المجتمع...','URL media (opsional)':'رابط الوسائط (اختياري)','Menerbitkan...':'جارٍ النشر...','Terbitkan Postingan':'نشر المنشور','Refresh balance':'تحديث الرصيد','Refresh posts':'تحديث المنشورات','Claim Bonus':'استلام المكافأة'
  }
};
for (const lang of Object.keys(DASHBOARD_TRANSLATIONS) as LanguageCode[]) {
  Object.assign(translations[lang], DASHBOARD_TRANSLATIONS[lang]);
  PAGE_UI_TRANSLATIONS[lang] = { ...DASHBOARD_TRANSLATIONS[lang], ...PAGE_UI_TRANSLATIONS[lang] };
}

const AUDIT_UI_TRANSLATIONS: Partial<Record<LanguageCode, Record<string,string>>> = {
  id: {'Profile':'Profil','Kelola akun, wallet, dan aktivitas kamu.':'Kelola akun, wallet, dan aktivitas kamu.','User ID = Wallet Address':'User ID = Alamat Wallet','Member':'Anggota','USDT Account':'Akun USDT','EVM Wallet':'Wallet EVM','Wallet belum terhubung':'Wallet belum terhubung','Alamat wallet berhasil disalin.':'Alamat wallet berhasil disalin.','Available':'Tersedia','Locked':'Terkunci','Withdraw':'Tarik Dana','Ajukan penarikan':'Ajukan penarikan','Registration Bonus':'Bonus Registrasi','Bonus tersedia dan belum diklaim.':'Bonus tersedia dan belum diklaim.','Available Balance':'Saldo Tersedia','Locked Balance':'Saldo Terkunci','Referral Link':'Link Referral','Bagikan link ini untuk mengundang user baru.':'Bagikan link ini untuk mengundang user baru.','Event Participation Status':'Status Partisipasi Event','Belum ada event yang diikuti.':'Belum ada event yang diikuti.','Transaction History':'Riwayat Transaksi','Deposit, withdrawal, lock, reward & bonus':'Deposit, penarikan, lock, reward & bonus','Refresh':'Muat Ulang','Loading...':'Memuat...','Belum ada transaksi.':'Belum ada transaksi.','Withdraw USDT':'Tarik USDT','Submit Withdrawal':'Ajukan Penarikan','JPG, PNG, WEBP • photo stays from your device storage':'JPG, PNG, WEBP • foto tetap tersimpan di perangkat Anda','Daily Mystery Blind Box':'Blind Box Misteri Harian','Lock minimal $4 equivalent untuk membuka Blind Box':'Lock minimal setara $4 untuk membuka Blind Box','Lock aktif':'Lock aktif','Aturan claim tetap 1 kali per hari.':'Klaim tetap 1 kali per hari.','LOCK SALDO DIBUTUHKAN':'LOCK SALDO DIBUTUHKAN','1 Box/Day':'1 Box/Hari','Lock Saldo Sekarang':'Lock Saldo Sekarang','Server sedang menentukan reward...':'Server sedang menentukan reward...','Reward Blind Box Harian':'Reward Blind Box Harian','Keep in Vault':'Simpan di Vault','Done':'Selesai','Active Selection':'Pilihan Aktif','Jadwal Durasi Lock':'Jadwal Durasi Lock','Reward harian sesuai pengaturan server':'Reward harian sesuai pengaturan server','Verifying Email':'Memverifikasi Email','Email Verified':'Email Terverifikasi','Verification Failed':'Verifikasi Gagal','SYS STREAM LOADING':'SYS STREAM MEMUAT...','Live Room Aktif':'Live Room Aktif','Live belum aktif':'Live belum aktif'},
  en: {'Profile':'Profile','Kelola akun, wallet, dan aktivitas kamu.':'Manage your account, wallet, and activity.','User ID = Wallet Address':'User ID = Wallet Address','Member':'Member','USDT Account':'USDT Account','EVM Wallet':'EVM Wallet','Wallet belum terhubung':'Wallet not connected','Alamat wallet berhasil disalin.':'Wallet address copied successfully.','Available':'Available','Locked':'Locked','Withdraw':'Withdraw','Ajukan penarikan':'Request withdrawal','Registration Bonus':'Registration Bonus','Bonus tersedia dan belum diklaim.':'Bonus is available and has not been claimed.','Available Balance':'Available Balance','Locked Balance':'Locked Balance','Referral Link':'Referral Link','Bagikan link ini untuk mengundang user baru.':'Share this link to invite a new user.','Event Participation Status':'Event Participation Status','Belum ada event yang diikuti.':'No events joined yet.','Transaction History':'Transaction History','Deposit, withdrawal, lock, reward & bonus':'Deposits, withdrawals, locks, rewards & bonuses','Refresh':'Refresh','Loading...':'Loading...','Belum ada transaksi.':'No transactions yet.','Withdraw USDT':'Withdraw USDT','Submit Withdrawal':'Submit Withdrawal','JPG, PNG, WEBP • photo stays from your device storage':'JPG, PNG, WEBP • photo stays on your device','Daily Mystery Blind Box':'Daily Mystery Blind Box','Lock minimal $4 equivalent untuk membuka Blind Box':'Lock at least the $4 equivalent to open Blind Box','Lock aktif':'Lock active','Aturan claim tetap 1 kali per hari.':'Claim remains limited to once per day.','LOCK SALDO DIBUTUHKAN':'BALANCE LOCK REQUIRED','1 Box/Day':'1 Box/Day','Lock Saldo Sekarang':'Lock Balance Now','Server sedang menentukan reward...':'Server is determining the reward...','Reward Blind Box Harian':'Daily Blind Box Reward','Keep in Vault':'Keep in Vault','Done':'Done','Active Selection':'Active Selection','Jadwal Durasi Lock':'Lock Duration Schedule','Reward harian sesuai pengaturan server':'Daily reward according to server settings','Verifying Email':'Verifying Email','Email Verified':'Email Verified','Verification Failed':'Verification Failed','SYS STREAM LOADING':'SYS STREAM LOADING','Live Room Aktif':'Live Room Active','Live belum aktif':'Live is not active'}
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
    'NOWPayments Crypto Deposit':'NOWPayments 加密货币充值','Instant deposit with zero platform fees':'即时充值，平台零手续费',
    'Deposit Amount (USD)':'充值金额（USD）','Or enter custom USD amount':'或输入自定义 USD 金额',
    'Minimum deposit':'最低充值','Rate is checked live by NOWPayments when the payment is created.':'创建付款时由 NOWPayments 实时检查汇率。',
    'Deposit is credited to your real account balance after payment confirmation.':'付款确认后，充值金额会进入您的真实账户余额。',
    'Select Cryptocurrency':'选择加密货币','Minimum Deposit':'最低充值','Minimum deposit is':'最低充值金额为',
    'Error':'错误','Failed to generate invoice':'创建账单失败','Order ID: ':'订单ID：','Awaiting Deposit':'等待充值',
    'Deposit QR Code':'充值二维码','Send exactly to deposit address:':'请准确发送到充值地址：','Open NOWPayments Payment Page':'打开 NOWPayments 支付页面',
    'Change Currency / Amount':'更改货币 / 金额','Done':'完成'
  },
  ja: {
    'NOWPayments Crypto Deposit':'NOWPayments暗号資産入金','Instant deposit with zero platform fees':'プラットフォーム手数料なしの即時入金',
    'Deposit Amount (USD)':'入金額（USD）','Or enter custom USD amount':'またはUSD金額を入力',
    'Minimum deposit':'最低入金額','Rate is checked live by NOWPayments when the payment is created.':'支払い作成時にNOWPaymentsがレートをリアルタイム確認します。',
    'Deposit is credited to your real account balance after payment confirmation.':'支払い確認後、入金額が実際のアカウント残高に反映されます。',
    'Select Cryptocurrency':'暗号資産を選択','Minimum Deposit':'最低入金額','Minimum deposit is':'最低入金額は',
    'Error':'エラー','Failed to generate invoice':'請求書の作成に失敗しました','Order ID: ':'注文ID：','Awaiting Deposit':'入金待ち',
    'Deposit QR Code':'入金QRコード','Send exactly to deposit address:':'入金アドレスへ正確に送信してください：','Open NOWPayments Payment Page':'NOWPayments支払いページを開く',
    'Change Currency / Amount':'通貨 / 金額を変更','Done':'完了'
  },
  ko: {
    'NOWPayments Crypto Deposit':'NOWPayments 암호화폐 입금','Instant deposit with zero platform fees':'플랫폼 수수료 없는 즉시 입금',
    'Deposit Amount (USD)':'입금 금액(USD)','Or enter custom USD amount':'또는 사용자 지정 USD 금액 입력',
    'Minimum deposit':'최소 입금','Rate is checked live by NOWPayments when the payment is created.':'결제 생성 시 NOWPayments가 환율을 실시간 확인합니다.',
    'Deposit is credited to your real account balance after payment confirmation.':'결제 확인 후 입금액이 실제 계정 잔액에 반영됩니다.',
    'Select Cryptocurrency':'암호화폐 선택','Minimum Deposit':'최소 입금','Minimum deposit is':'최소 입금액은',
    'Error':'오류','Failed to generate invoice':'인보이스 생성 실패','Order ID: ':'주문 ID: ','Awaiting Deposit':'입금 대기',
    'Deposit QR Code':'입금 QR 코드','Send exactly to deposit address:':'입금 주소로 정확히 보내세요:','Open NOWPayments Payment Page':'NOWPayments 결제 페이지 열기',
    'Change Currency / Amount':'통화 / 금액 변경','Done':'완료'
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
    'Login':'登录','Register':'注册','We sent a verification link to ':'我们已将验证链接发送至 ','You must verify it before you can log in.':'登录前必须完成验证。','Terms & Conditions':'条款与条件',
    'LOGIN / REGISTER':'登录 / 注册','Streamer Username Manager':'主播用户名管理','WIN':'获胜','Close':'关闭',
    'Earn Passive Crypto & Gold Coins':'赚取加密货币和金币','Anyone registering with your link receives a free ':'通过您的链接注册的用户可获得 ',' starter bonus.':' 新手奖励。','Unclaimed Commission Balance':'未领取的佣金余额',
    'Upload / Create':'上传 / 创建','Live Room':'直播间','Login Required':'需要登录','Loading...':'加载中...'
  },
  ja: {
    'Login':'ログイン','Register':'登録','We sent a verification link to ':'確認リンクを送信しました：','You must verify it before you can log in.':'ログインする前に確認が必要です。','Terms & Conditions':'利用規約',
    'LOGIN / REGISTER':'ログイン / 登録','Streamer Username Manager':'ストリーマーユーザー名管理','WIN':'勝利','Close':'閉じる',
    'Earn Passive Crypto & Gold Coins':'暗号資産とゴールドコインを獲得','Anyone registering with your link receives a free ':'あなたのリンクから登録した人には無料の ',' starter bonus.':' スターターボーナス。','Unclaimed Commission Balance':'未請求コミッション残高',
    'Upload / Create':'アップロード / 作成','Live Room':'ライブルーム','Login Required':'ログインが必要です','Loading...':'読み込み中...'
  },
  ko: {
    'Login':'로그인','Register':'가입','We sent a verification link to ':'인증 링크를 보냈습니다: ','You must verify it before you can log in.':'로그인하기 전에 이메일을 인증해야 합니다.','Terms & Conditions':'이용약관',
    'LOGIN / REGISTER':'로그인 / 가입','Streamer Username Manager':'스트리머 사용자명 관리','WIN':'승리','Close':'닫기',
    'Earn Passive Crypto & Gold Coins':'암호화폐 및 골드 코인 수익','Anyone registering with your link receives a free ':'회원가입한 사용자는 무료 ',' starter bonus.':' 시작 보너스를 받습니다.','Unclaimed Commission Balance':'미청구 커미션 잔액',
    'Upload / Create':'업로드 / 만들기','Live Room':'라이브 룸','Login Required':'로그인 필요','Loading...':'로드 중...'
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
    'Sign in to continue streaming and gaming':'登录后继续直播和游戏','Username or Email':'用户名或邮箱','Connect Wallet':'连接钱包','Forgot Password?':'忘记密码？',
    "Don't have an account?":"还没有账户？",'Register Now':'立即注册','Secured with Web3':'由 Web3 安全保护','Biometric Login Available':'支持生物识别登录',
    'CREATE ACCOUNT':'创建账户','LOGIN':'登录','or Connect with Crypto Wallet':'或连接加密钱包','EVM Wallet Recovery Phrase':'EVM 钱包恢复短语',
    'Wallet Address':'钱包地址','Recovery Phrase':'恢复短语','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'创建账户前必须阅读并同意条款与条件。',
    'I have read and agree to the':'我已阅读并同意','Terms & Conditions':'条款与条件','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'钱包在您的设备上创建。SYS STREAM 不会接收或存储此恢复短语。',
    'Simpan offline sebelum menutup halaman.':'请在关闭页面前离线保存。','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'我已将恢复短语保存在安全位置，并了解 SYS STREAM 无法恢复该短语。',
    'Loading active tasks...':'正在加载活动任务…','Submitting...':'正在提交…','Open Task':'打开任务','Task':'任务','Save Wallet':'保存钱包','Proof link is required.':'必须提供证明链接。','Submission failed':'提交失败','Login to continue':'登录后继续'
  },
  ja: {
    'Sign in to continue streaming and gaming':'ログインして配信とゲームを続ける','Username or Email':'ユーザー名またはメール','Connect Wallet':'ウォレットを接続','Forgot Password?':'パスワードを忘れましたか？',
    "Don't have an account?":"アカウントをお持ちではありませんか？",'Register Now':'今すぐ登録','Secured with Web3':'Web3で保護されています','Biometric Login Available':'生体認証ログイン対応',
    'CREATE ACCOUNT':'アカウントを作成','LOGIN':'ログイン','or Connect with Crypto Wallet':'または暗号資産ウォレットを接続','EVM Wallet Recovery Phrase':'EVMウォレットのリカバリーフレーズ',
    'Wallet Address':'ウォレットアドレス','Recovery Phrase':'リカバリーフレーズ','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'アカウント作成前に利用規約を読み、同意してください。',
    'I have read and agree to the':'以下を読み、同意します：','Terms & Conditions':'利用規約','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'ウォレットは端末上で作成されます。SYS STREAMはこのリカバリーフレーズを受信・保存しません。',
    'Simpan offline sebelum menutup halaman.':'ページを閉じる前にオフラインで保存してください。','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'リカバリーフレーズを安全な場所に保存し、SYS STREAMでは復元できないことを理解しました。',
    'Loading active tasks...':'アクティブなタスクを読み込み中…','Submitting...':'送信中…','Open Task':'タスクを開く','Task':'タスク','Save Wallet':'ウォレットを保存','Proof link is required.':'証拠リンクが必要です。','Submission failed':'送信に失敗しました','Login to continue':'ログインして続行'
  },
  ko: {
    'Sign in to continue streaming and gaming':'로그인하여 스트리밍과 게임을 계속하세요','Username or Email':'사용자 이름 또는 이메일','Connect Wallet':'지갑 연결','Forgot Password?':'비밀번호를 잊으셨나요?',
    "Don't have an account?":"계정이 없으신가요?",'Register Now':'지금 가입','Secured with Web3':'Web3로 보안됨','Biometric Login Available':'생체 인증 로그인 지원',
    'CREATE ACCOUNT':'계정 만들기','LOGIN':'로그인','or Connect with Crypto Wallet':'또는 암호화폐 지갑 연결','EVM Wallet Recovery Phrase':'EVM 지갑 복구 문구',
    'Wallet Address':'지갑 주소','Recovery Phrase':'복구 문구','Wajib membaca dan menyetujui Terms & Conditions sebelum membuat akun.':'계정을 만들기 전에 이용약관을 읽고 동의해야 합니다.',
    'I have read and agree to the':'다음을 읽고 동의합니다:','Terms & Conditions':'이용약관','Wallet dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan recovery phrase ini.':'지갑은 기기에서 생성됩니다. SYS STREAM은 이 복구 문구를 받거나 저장하지 않습니다.',
    'Simpan offline sebelum menutup halaman.':'페이지를 닫기 전에 오프라인으로 안전하게 저장하세요.','Saya sudah menyimpan recovery phrase di tempat yang aman dan memahami bahwa phrase tidak dapat dipulihkan oleh SYS STREAM.':'복구 문구를 안전한 곳에 저장했으며 SYS STREAM에서 복구할 수 없음을 이해합니다.',
    'Loading active tasks...':'활성 작업을 불러오는 중...','Submitting...':'제출 중...','Open Task':'작업 열기','Task':'작업','Save Wallet':'지갑 저장','Proof link is required.':'증빙 링크가 필요합니다.','Submission failed':'제출 실패','Login to continue':'로그인하여 계속'
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
