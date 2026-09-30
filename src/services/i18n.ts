import { CountryCurrencyConfig } from '../types';

export const DEFAULT_COUNTRY_CODE = 'US';

export const COUNTRIES_CONFIG: CountryCurrencyConfig[] = [
  {
    code: 'US',
    name: 'United States',
    nameEn: 'United States',
    flag: '🇺🇸',
    languageCode: 'en',
    languageName: 'English (US)',
    currencyCode: 'USD',
    currencySymbol: '$',
    rateFromIdr: 1 / 16000,
    decimals: 2,
    banknotePrefix: 'USD '
  },
  {
    code: 'ID',
    name: 'Indonesia',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    languageCode: 'id',
    languageName: 'Bahasa Indonesia',
    currencyCode: 'IDR',
    currencySymbol: 'Rp',
    rateFromIdr: 1,
    decimals: 0,
    banknotePrefix: 'IDR '
  },
  {
    code: 'MY',
    name: 'Malaysia',
    nameEn: 'Malaysia',
    flag: '🇲🇾',
    languageCode: 'ms',
    languageName: 'Bahasa Melayu',
    currencyCode: 'MYR',
    currencySymbol: 'RM',
    rateFromIdr: 1 / 3600,
    decimals: 2,
    banknotePrefix: 'MYR '
  },
  {
    code: 'SG',
    name: 'Singapore',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    languageCode: 'en',
    languageName: 'English (SG)',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    rateFromIdr: 1 / 12300,
    decimals: 2,
    banknotePrefix: 'SGD '
  },
  {
    code: 'JP',
    name: '日本 (Japan)',
    nameEn: 'Japan',
    flag: '🇯🇵',
    languageCode: 'ja',
    languageName: '日本語',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    rateFromIdr: 1 / 105,
    decimals: 0,
    banknotePrefix: 'JPY '
  },
  {
    code: 'KR',
    name: '대한민국 (South Korea)',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    languageCode: 'ko',
    languageName: '한국어',
    currencyCode: 'KRW',
    currencySymbol: '₩',
    rateFromIdr: 1 / 12,
    decimals: 0,
    banknotePrefix: 'KRW '
  },
  {
    code: 'CN',
    name: '中国 (China)',
    nameEn: 'China',
    flag: '🇨🇳',
    languageCode: 'zh',
    languageName: '简体中文',
    currencyCode: 'CNY',
    currencySymbol: '¥',
    rateFromIdr: 1 / 2250,
    decimals: 2,
    banknotePrefix: 'CNY '
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    languageCode: 'en',
    languageName: 'English (UK)',
    currencyCode: 'GBP',
    currencySymbol: '£',
    rateFromIdr: 1 / 21000,
    decimals: 2,
    banknotePrefix: 'GBP '
  },
  {
    code: 'EU',
    name: 'European Union (Euro)',
    nameEn: 'European Union',
    flag: '🇪🇺',
    languageCode: 'en',
    languageName: 'European (EUR)',
    currencyCode: 'EUR',
    currencySymbol: '€',
    rateFromIdr: 1 / 17500,
    decimals: 2,
    banknotePrefix: 'EUR '
  },
  {
    code: 'SA',
    name: 'المملكة العربية السعودية (Saudi Arabia)',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    languageCode: 'ar',
    languageName: 'العربية',
    currencyCode: 'SAR',
    currencySymbol: 'ر.س',
    rateFromIdr: 1 / 4300,
    decimals: 2,
    banknotePrefix: 'SAR '
  },
  {
    code: 'AE',
    name: 'الإمارات (United Arab Emirates)',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    languageCode: 'ar',
    languageName: 'العربية (الإمارات)',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    rateFromIdr: 1 / 4350,
    decimals: 2,
    banknotePrefix: 'AED '
  },
  {
    code: 'PH',
    name: 'Pilipinas (Philippines)',
    nameEn: 'Philippines',
    flag: '🇵🇭',
    languageCode: 'tl',
    languageName: 'Tagalog / Filipino',
    currencyCode: 'PHP',
    currencySymbol: '₱',
    rateFromIdr: 1 / 285,
    decimals: 2,
    banknotePrefix: 'PHP '
  },
  {
    code: 'TH',
    name: 'ประเทศไทย (Thailand)',
    nameEn: 'Thailand',
    flag: '🇹🇭',
    languageCode: 'th',
    languageName: 'ภาษาไทย',
    currencyCode: 'THB',
    currencySymbol: '฿',
    rateFromIdr: 1 / 480,
    decimals: 2,
    banknotePrefix: 'THB '
  },
  {
    code: 'VN',
    name: 'Việt Nam (Vietnam)',
    nameEn: 'Vietnam',
    flag: '🇻🇳',
    languageCode: 'vi',
    languageName: 'Tiếng Việt',
    currencyCode: 'VND',
    currencySymbol: '₫',
    rateFromIdr: 1 / 0.65,
    decimals: 0,
    banknotePrefix: 'VND '
  },
  {
    code: 'IN',
    name: 'भारत (India)',
    nameEn: 'India',
    flag: '🇮🇳',
    languageCode: 'hi',
    languageName: 'हिन्दी / English',
    currencyCode: 'INR',
    currencySymbol: '₹',
    rateFromIdr: 1 / 190,
    decimals: 2,
    banknotePrefix: 'INR '
  },
  {
    code: 'AU',
    name: 'Australia',
    nameEn: 'Australia',
    flag: '🇦🇺',
    languageCode: 'en',
    languageName: 'English (AU)',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    rateFromIdr: 1 / 10600,
    decimals: 2,
    banknotePrefix: 'AUD '
  },
  {
    code: 'BR',
    name: 'Brasil (Brazil)',
    nameEn: 'Brazil',
    flag: '🇧🇷',
    languageCode: 'pt',
    languageName: 'Português (Brasil)',
    currencyCode: 'BRL',
    currencySymbol: 'R$',
    rateFromIdr: 1 / 3200,
    decimals: 2,
    banknotePrefix: 'BRL '
  },
  {
    code: 'RU',
    name: 'Россия (Russia)',
    nameEn: 'Russia',
    flag: '🇷🇺',
    languageCode: 'ru',
    languageName: 'Русский',
    currencyCode: 'RUB',
    currencySymbol: '₽',
    rateFromIdr: 1 / 175,
    decimals: 0,
    banknotePrefix: 'RUB '
  },
  {
    code: 'TR',
    name: 'Türkiye (Turkey)',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    languageCode: 'tr',
    languageName: 'Türkçe',
    currencyCode: 'TRY',
    currencySymbol: '₺',
    rateFromIdr: 1 / 460,
    decimals: 2,
    banknotePrefix: 'TRY '
  },
  {
    code: 'CA',
    name: 'Canada',
    nameEn: 'Canada',
    flag: '🇨🇦',
    languageCode: 'en',
    languageName: 'English (CA)',
    currencyCode: 'CAD',
    currencySymbol: 'C$',
    rateFromIdr: 1 / 11800,
    decimals: 2,
    banknotePrefix: 'CAD '
  },
  {
    code: 'MX',
    name: 'México (Mexico)',
    nameEn: 'Mexico',
    flag: '🇲🇽',
    languageCode: 'es',
    languageName: 'Español (México)',
    currencyCode: 'MXN',
    currencySymbol: 'Mex$',
    rateFromIdr: 1 / 950,
    decimals: 2,
    banknotePrefix: 'MXN '
  }
];

import { TRANSLATIONS } from '../locales';

export { TRANSLATIONS };

/**
 * Format IDR base amount to target country's currency accurately
 */
export function formatCurrencyAmount(
  amountInIdr: number,
  country: CountryCurrencyConfig
): string {
  const safeAmount = typeof amountInIdr === 'number' && !isNaN(amountInIdr) ? amountInIdr : 0;
  if (!country || country.code === 'ID') {
    return `Rp ${Math.round(safeAmount).toLocaleString('id-ID')}`;
  }

  const converted = safeAmount * (country.rateFromIdr || 1);

  if (country.decimals === 0) {
    const rounded = Math.round(converted);
    if (country.code === 'JP') return `¥${rounded.toLocaleString('ja-JP')}`;
    if (country.code === 'KR') return `₩${rounded.toLocaleString('ko-KR')}`;
    if (country.code === 'VN') return `${rounded.toLocaleString('vi-VN')} ₫`;
    if (country.code === 'RU') return `${rounded.toLocaleString('ru-RU')} ₽`;
    return `${country.currencySymbol}${rounded.toLocaleString()}`;
  }

  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: country.decimals,
    maximumFractionDigits: country.decimals
  });

  if (country.code === 'SA') return `${formatted} ر.س`;
  if (country.code === 'AE') return `${formatted} د.إ`;
  if (country.code === 'MY') return `RM ${formatted}`;
  if (country.code === 'SG') return `S$ ${formatted}`;
  if (country.code === 'AU') return `A$ ${formatted}`;
  if (country.code === 'CA') return `C$ ${formatted}`;
  if (country.code === 'MX') return `Mex$ ${formatted}`;
  if (country.code === 'BR') return `R$ ${formatted}`;
  if (country.code === 'TR') return `₺${formatted}`;
  if (country.code === 'IN') return `₹${formatted}`;
  if (country.code === 'TH') return `฿${formatted}`;
  if (country.code === 'PH') return `₱${formatted}`;
  if (country.code === 'US') return `$${formatted}`;
  if (country.code === 'GB') return `£${formatted}`;
  if (country.code === 'EU') return `€${formatted}`;
  if (country.code === 'CN') return `¥${formatted}`;

  return `${country.currencySymbol}${formatted}`;
}

/**
 * Translate helper
 */
export function translate(key: string, languageCode: string, fallback?: string): string {
  const lang = (languageCode || 'en').toLowerCase().split('-')[0];
  const langDict = TRANSLATIONS[lang] || TRANSLATIONS['en'] || TRANSLATIONS['id'];
  if (langDict && langDict[key]) {
    return langDict[key];
  }
  if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
    return TRANSLATIONS['en'][key];
  }
  if (TRANSLATIONS['id'] && TRANSLATIONS['id'][key]) {
    return TRANSLATIONS['id'][key];
  }
  return fallback || key;
}

/**
 * Helper to get country by code
 */
export function getCountryByCode(code: string): CountryCurrencyConfig {
  const found = COUNTRIES_CONFIG.find(
    (c) => c.code.toUpperCase() === (code || '').toUpperCase()
  );
  return found || COUNTRIES_CONFIG[0];
}


/**
 * Global UI translation safety net.
 * Existing components should still prefer t(), but this catches exact
 * catalog strings rendered directly by legacy components.
 */
const LEGACY_UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  Loading: { en: 'Loading', id: 'Memuat', ms: 'Memuatkan', ja: '読み込み中', zh: '加载中', ar: 'جارٍ التحميل', tl: 'Naglo-load', th: 'กำลังโหลด', vi: 'Đang tải', ko: '로딩 중', es: 'Cargando', pt: 'Carregando', ru: 'Загрузка', tr: 'Yükleniyor', hi: 'लोड हो रहा है' },
  Search: { en: 'Search', id: 'Cari', ms: 'Cari', ja: '検索', zh: '搜索', ar: 'بحث', tl: 'Maghanap', th: 'ค้นหา', vi: 'Tìm kiếm', ko: '검색', es: 'Buscar', pt: 'Pesquisar', ru: 'Поиск', tr: 'Ara', hi: 'खोजें' },
  Settings: { en: 'Settings', id: 'Pengaturan', ms: 'Tetapan', ja: '設定', zh: '设置', ar: 'الإعدادات', tl: 'Mga Setting', th: 'การตั้งค่า', vi: 'Cài đặt', ko: '설정', es: 'Configuración', pt: 'Configurações', ru: 'Настройки', tr: 'Ayarlar', hi: 'सेटिंग्स' },
  Menu: { en: 'Menu', id: 'Menu', ms: 'Menu', ja: 'メニュー', zh: '菜单', ar: 'القائمة', tl: 'Menu', th: 'เมนู', vi: 'Menu', ko: '메뉴', es: 'Menú', pt: 'Menu', ru: 'Меню', tr: 'Menü', hi: 'मेनू' },
  Add: { en: 'Add', id: 'Tambah', ms: 'Tambah', ja: '追加', zh: '添加', ar: 'إضافة', tl: 'Idagdag', th: 'เพิ่ม', vi: 'Thêm', ko: '추가', es: 'Añadir', pt: 'Adicionar', ru: 'Добавить', tr: 'Ekle', hi: 'जोड़ें' },
  Close: { en: 'Close', id: 'Tutup', ms: 'Tutup', ja: '閉じる', zh: '关闭', ar: 'إغلاق', tl: 'Isara', th: 'ปิด', vi: 'Đóng', ko: '닫기', es: 'Cerrar', pt: 'Fechar', ru: 'Закрыть', tr: 'Kapat', hi: 'बंद करें' },
  Cancel: { en: 'Cancel', id: 'Batal', ms: 'Batal', ja: 'キャンセル', zh: '取消', ar: 'إلغاء', tl: 'Kanselahin', th: 'ยกเลิก', vi: 'Hủy', ko: '취소', es: 'Cancelar', pt: 'Cancelar', ru: 'Отмена', tr: 'İptal', hi: 'रद्द करें' },
  Confirm: { en: 'Confirm', id: 'Konfirmasi', ms: 'Sahkan', ja: '確認', zh: '确认', ar: 'تأكيد', tl: 'Kumpirmahin', th: 'ยืนยัน', vi: 'Xác nhận', ko: '확인', es: 'Confirmar', pt: 'Confirmar', ru: 'Подтвердить', tr: 'Onayla', hi: 'पुष्टि करें' },
  Save: { en: 'Save', id: 'Simpan', ms: 'Simpan', ja: '保存', zh: '保存', ar: 'حفظ', tl: 'I-save', th: 'บันทึก', vi: 'Lưu', ko: '저장', es: 'Guardar', pt: 'Salvar', ru: 'Сохранить', tr: 'Kaydet', hi: 'सहेजें' },
  Delete: { en: 'Delete', id: 'Hapus', ms: 'Padam', ja: '削除', zh: '删除', ar: 'حذف', tl: 'Tanggalin', th: 'ลบ', vi: 'Xóa', ko: '삭제', es: 'Eliminar', pt: 'Excluir', ru: 'Удалить', tr: 'Sil', hi: 'हटाएं' },
  Reset: { en: 'Reset', id: 'Atur Ulang', ms: 'Tetapkan Semula', ja: 'リセット', zh: '重置', ar: 'إعادة ضبط', tl: 'I-reset', th: 'รีเซ็ต', vi: 'Đặt lại', ko: '초기화', es: 'Restablecer', pt: 'Redefinir', ru: 'Сбросить', tr: 'Sıfırla', hi: 'रीसेट' },
  Open: { en: 'Open', id: 'Buka', ms: 'Buka', ja: '開く', zh: '打开', ar: 'فتح', tl: 'Buksan', th: 'เปิด', vi: 'Mở', ko: '열기', es: 'Abrir', pt: 'Abrir', ru: 'Открыть', tr: 'Aç', hi: 'खोलें' },
  Remove: { en: 'Remove', id: 'Hapus', ms: 'Alih Keluar', ja: '削除', zh: '移除', ar: 'إزالة', tl: 'Alisin', th: 'ลบออก', vi: 'Xóa', ko: '제거', es: 'Quitar', pt: 'Remover', ru: 'Удалить', tr: 'Kaldır', hi: 'हटाएं' },
  'Weekly Leaderboard': { en: 'Weekly Leaderboard', id: 'Papan Peringkat Mingguan', ms: 'Papan Pendahulu Mingguan', ja: '週間ランキング', zh: '每周排行榜', ar: 'لوحة المتصدرين الأسبوعية', tl: 'Lingguhang Leaderboard', th: 'กระดานผู้นำรายสัปดาห์', vi: 'Bảng xếp hạng hàng tuần', ko: '주간 리더보드', es: 'Clasificación semanal', pt: 'Ranking semanal', ru: 'Еженедельный рейтинг', tr: 'Haftalık Liderlik Tablosu', hi: 'साप्ताहिक लीडरबोर्ड' },
  'Sign In as Streamer': { en: 'Sign In as Streamer', id: 'Masuk sebagai Streamer', ms: 'Log Masuk sebagai Streamer', ja: 'ストリーマーとしてログイン', zh: '以主播身份登录', ar: 'تسجيل الدخول كستريمر', tl: 'Mag-sign In bilang Streamer', th: 'เข้าสู่ระบบในฐานะสตรีมเมอร์', vi: 'Đăng nhập với tư cách Streamer', ko: '스트리머로 로그인', es: 'Iniciar sesión como streamer', pt: 'Entrar como streamer', ru: 'Войти как стример', tr: 'Streamer olarak giriş yap', hi: 'स्ट्रीमर के रूप में साइन इन करें' },
  'Set Timer': { en: 'Set Timer', id: 'Atur Timer', ms: 'Tetapkan Pemasa', ja: 'タイマー設定', zh: '设置计时器', ar: 'ضبط المؤقت', tl: 'Itakda ang Timer', th: 'ตั้งเวลา', vi: 'Đặt hẹn giờ', ko: '타이머 설정', es: 'Configurar temporizador', pt: 'Definir temporizador', ru: 'Установить таймер', tr: 'Zamanlayıcıyı ayarla', hi: 'टाइमर सेट करें' },
  'Apply Timer': { en: 'Apply Timer', id: 'Terapkan Timer', ms: 'Gunakan Pemasa', ja: 'タイマーを適用', zh: '应用计时器', ar: 'تطبيق المؤقت', tl: 'Ilapat ang Timer', th: 'ใช้ตัวจับเวลา', vi: 'Áp dụng hẹn giờ', ko: '타이머 적용', es: 'Aplicar temporizador', pt: 'Aplicar temporizador', ru: 'Применить таймер', tr: 'Zamanlayıcıyı uygula', hi: 'टाइमर लागू करें' },
  'DIGITAL BROADCAST TIMER': { en: 'DIGITAL BROADCAST TIMER', id: 'TIMER SIARAN DIGITAL', ms: 'PEMASA SIARAN DIGITAL', ja: 'デジタル配信タイマー', zh: '数字直播计时器', ar: 'مؤقت البث الرقمي', tl: 'DIGITAL BROADCAST TIMER', th: 'ตัวจับเวลาการถ่ายทอดดิจิทัล', vi: 'BỘ HẸN GIỜ PHÁT SÓNG KỸ THUẬT SỐ', ko: '디지털 방송 타이머', es: 'TEMPORIZADOR DE TRANSMISIÓN DIGITAL', pt: 'TEMPORIZADOR DE TRANSMISSÃO DIGITAL', ru: 'ЦИФРОВОЙ ТАЙМЕР ТРАНСЛЯЦИИ', tr: 'DİJİTAL YAYIN ZAMANLAYICI', hi: 'डिजिटल ब्रॉडकास्ट टाइमर' },
  'ON AIR': { en: 'ON AIR', id: 'SEDANG SIARAN', ms: 'SEDANG BERSIARAN', ja: '放送中', zh: '直播中', ar: 'على الهواء', tl: 'ON AIR', th: 'กำลังออกอากาศ', vi: 'ĐANG PHÁT SÓNG', ko: '방송 중', es: 'EN VIVO', pt: 'NO AR', ru: 'В ЭФИРЕ', tr: 'YAYINDA', hi: 'लाइव' },
  'Secret Digits:': { en: 'Secret Digits:', id: 'Digit Rahasia:', ms: 'Digit Rahsia:', ja: '秘密の数字:', zh: '秘密数字：', ar: 'الأرقام السرية:', tl: 'Lihim na Digit:', th: 'ตัวเลขลับ:', vi: 'Chữ số bí mật:', ko: '비밀 숫자:', es: 'Dígitos secretos:', pt: 'Dígitos secretos:', ru: 'Секретные цифры:', tr: 'Gizli rakamlar:', hi: 'गुप्त अंक:' },
  'Key Details': { en: 'Key Details', id: 'Detail Kunci', ms: 'Butiran Kunci', ja: 'キーの詳細', zh: '密钥详情', ar: 'تفاصيل المفتاح', tl: 'Mga Detalye ng Key', th: 'รายละเอียดคีย์', vi: 'Chi tiết khóa', ko: '키 세부정보', es: 'Detalles de clave', pt: 'Detalhes da chave', ru: 'Детали ключа', tr: 'Anahtar ayrıntıları', hi: 'कुंजी विवरण' },
  'Live Screen Safe': { en: 'Live Screen Safe', id: 'Layar Live Aman', ms: 'Skrin Langsung Selamat', ja: 'ライブ画面は安全', zh: '直播画面安全', ar: 'شاشة البث آمنة', tl: 'Ligtas ang Live Screen', th: 'หน้าจอไลฟ์ปลอดภัย', vi: 'Màn hình trực tiếp an toàn', ko: '라이브 화면 안전', es: 'Pantalla en vivo segura', pt: 'Tela ao vivo segura', ru: 'Безопасный экран трансляции', tr: 'Canlı ekran güvenli', hi: 'लाइव स्क्रीन सुरक्षित' },
  'Full Serial Number:': { en: 'Full Serial Number:', id: 'Nomor Seri Lengkap:', ms: 'Nombor Siri Penuh:', ja: '完全なシリアル番号:', zh: '完整序列号：', ar: 'الرقم التسلسلي الكامل:', tl: 'Buong Serial Number:', th: 'หมายเลขซีเรียลทั้งหมด:', vi: 'Số sê-ri đầy đủ:', ko: '전체 일련번호:', es: 'Número de serie completo:', pt: 'Número de série completo:', ru: 'Полный серийный номер:', tr: 'Tam seri numarası:', hi: 'पूरा सीरियल नंबर:' },
  'Currency:': { en: 'Currency:', id: 'Mata Uang:', ms: 'Mata Wang:', ja: '通貨:', zh: '货币：', ar: 'العملة:', tl: 'Pera:', th: 'สกุลเงิน:', vi: 'Tiền tệ:', ko: '통화:', es: 'Moneda:', pt: 'Moeda:', ru: 'Валюта:', tr: 'Para birimi:', hi: 'मुद्रा:' },
  'Figure / Design:': { en: 'Figure / Design:', id: 'Figur / Desain:', ms: 'Tokoh / Reka Bentuk:', ja: '図柄 / デザイン:', zh: '图案/设计：', ar: 'الشكل / التصميم:', tl: 'Larawan / Disenyo:', th: 'รูปภาพ / การออกแบบ:', vi: 'Hình / Thiết kế:', ko: '인물 / 디자인:', es: 'Figura / Diseño:', pt: 'Figura / Design:', ru: 'Фигура / дизайн:', tr: 'Figür / Tasarım:', hi: 'चित्र / डिज़ाइन:' },
  'Validate Correct!': { en: 'Validate Correct!', id: 'Validasi Benar!', ms: 'Sahkan Betul!', ja: '正解を検証！', zh: '验证正确！', ar: 'تحقق من صحة الإجابة!', tl: 'Patunayan ang Tama!', th: 'ตรวจสอบว่าถูกต้อง!', vi: 'Xác nhận đúng!', ko: '정답 확인!', es: '¡Validar correcto!', pt: 'Validar correto!', ru: 'Проверить правильность!', tr: 'Doğruluğu doğrula!', hi: 'सही होने की पुष्टि करें!' },
  'Add viewer name / @username...': { en: 'Add viewer name / @username...', id: 'Tambah nama penonton / @username...', ms: 'Tambah nama penonton / @username...', ja: '視聴者名 / @ユーザー名を追加...', zh: '添加观众姓名 / @用户名...', ar: 'أضف اسم المشاهد / @اسم المستخدم...', tl: 'Magdagdag ng pangalan / @username...', th: 'เพิ่มชื่อผู้ชม / @username...', vi: 'Thêm tên người xem / @username...', ko: '시청자 이름 / @username 추가...', es: 'Añadir nombre del espectador / @username...', pt: 'Adicionar nome do espectador / @username...', ru: 'Добавить имя зрителя / @username...', tr: 'İzleyici adı / @username ekle...', hi: 'दर्शक का नाम / @username जोड़ें...' }  'Blind Box 3D': { en: 'Blind Box 3D', id: 'Blind Box 3D', ms: 'Blind Box 3D', ja: 'ブラインドボックス 3D', zh: '盲盒 3D', ar: 'الصندوق الغامض 3D', tl: 'Blind Box 3D', th: 'Blind Box 3D', vi: 'Blind Box 3D', ko: '블라인드 박스 3D', es: 'Blind Box 3D', pt: 'Blind Box 3D', ru: 'Blind Box 3D', tr: 'Blind Box 3D', hi: 'ब्लाइंड बॉक्स 3D' },
  'OBS Overlay': { en: 'OBS Overlay', id: 'Overlay OBS', ms: 'Tindanan OBS', ja: 'OBSオーバーレイ', zh: 'OBS叠加层', ar: 'تراكب OBS', tl: 'OBS Overlay', th: 'OBS Overlay', vi: 'Lớp phủ OBS', ko: 'OBS 오버레이', es: 'Superposición OBS', pt: 'Sobreposição OBS', ru: 'Оверлей OBS', tr: 'OBS Katmanı', hi: 'OBS ओवरले' },
  'Dark': { en: 'Dark', id: 'Gelap', ms: 'Gelap', ja: 'ダーク', zh: '深色', ar: 'داكن', tl: 'Madilim', th: 'มืด', vi: 'Tối', ko: '어두운', es: 'Oscuro', pt: 'Escuro', ru: 'Тёмный', tr: 'Koyu', hi: 'डार्क' },
  'Weekly Leaderboard (Top Referrals)': { en: 'Weekly Leaderboard (Top Referrals)', id: 'Papan Peringkat Mingguan (Referral Teratas)', ms: 'Papan Pendahulu Mingguan (Rujukan Teratas)', ja: '週間ランキング（紹介上位）', zh: '每周排行榜（顶级推荐）', ar: 'لوحة المتصدرين الأسبوعية (أفضل الإحالات)', tl: 'Lingguhang Leaderboard (Nangungunang Referral)', th: 'กระดานผู้นำรายสัปดาห์ (ผู้แนะนำสูงสุด)', vi: 'Bảng xếp hạng hàng tuần (Giới thiệu hàng đầu)', ko: '주간 리더보드 (상위 추천)', es: 'Clasificación semanal (mejores referidos)', pt: 'Ranking semanal (principais indicações)', ru: 'Еженедельный рейтинг (лучшие рефералы)', tr: 'Haftalık Liderlik Tablosu (En Çok Referans)', hi: 'साप्ताहिक लीडरबोर्ड (शीर्ष रेफरल)' },
  'Weekly Leaderboard is Empty': { en: 'Weekly Leaderboard is Empty', id: 'Papan Peringkat Mingguan Masih Kosong', ms: 'Papan Pendahulu Mingguan Masih Kosong', ja: '週間ランキングは空です', zh: '每周排行榜为空', ar: 'لوحة المتصدرين الأسبوعية فارغة', tl: 'Walang laman ang Lingguhang Leaderboard', th: 'กระดานผู้นำรายสัปดาห์ว่างเปล่า', vi: 'Bảng xếp hạng hàng tuần đang trống', ko: '주간 리더보드가 비어 있습니다', es: 'La clasificación semanal está vacía', pt: 'O ranking semanal está vazio', ru: 'Еженедельный рейтинг пуст', tr: 'Haftalık liderlik tablosu boş', hi: 'साप्ताहिक लीडरबोर्ड खाली है' },
  'Season Champion Podium': { en: 'Season Champion Podium', id: 'Podium Juara Musim', ms: 'Podium Juara Musim', ja: 'シーズンチャンピオン表彰台', zh: '赛季冠军领奖台', ar: 'منصة بطل الموسم', tl: 'Podium ng Season Champion', th: 'โพเดียมแชมป์ประจำฤดูกาล', vi: 'Bục vinh danh nhà vô địch mùa', ko: '시즌 챔피언 시상대', es: 'Podio del campeón de temporada', pt: 'Pódio do campeão da temporada', ru: 'Подиум чемпиона сезона', tr: 'Sezon Şampiyonu Podyumu', hi: 'सीज़न चैंपियन पोडियम' },
  'Custom Input:': { en: 'Custom Input:', id: 'Input Kustom:', ms: 'Input Tersuai:', ja: 'カスタム入力:', zh: '自定义输入：', ar: 'إدخال مخصص:', tl: 'Custom Input:', th: 'อินพุตกำหนดเอง:', vi: 'Nhập tùy chỉnh:', ko: '사용자 지정 입력:', es: 'Entrada personalizada:', pt: 'Entrada personalizada:', ru: 'Пользовательский ввод:', tr: 'Özel giriş:', hi: 'कस्टम इनपुट:' },
  'HOURS': { en: 'HOURS', id: 'JAM', ms: 'JAM', ja: '時間', zh: '小时', ar: 'ساعات', tl: 'ORAS', th: 'ชั่วโมง', vi: 'GIỜ', ko: '시간', es: 'HORAS', pt: 'HORAS', ru: 'ЧАСЫ', tr: 'SAAT', hi: 'घंटे' },
  'MINS': { en: 'MINS', id: 'MENIT', ms: 'MIN', ja: '分', zh: '分钟', ar: 'دقائق', tl: 'MIN', th: 'นาที', vi: 'PHÚT', ko: '분', es: 'MIN', pt: 'MIN', ru: 'МИН', tr: 'DAK', hi: 'मिनट' },
  'SECS': { en: 'SECS', id: 'DETIK', ms: 'SAAT', ja: '秒', zh: '秒', ar: 'ثوانٍ', tl: 'SEG', th: 'วินาที', vi: 'GIÂY', ko: '초', es: 'SEG', pt: 'SEG', ru: 'СЕК', tr: 'SN', hi: 'सेकंड' },
  'Data automatically synchronized to local session': { en: 'Data automatically synchronized to local session', id: 'Data otomatis disinkronkan ke sesi lokal', ms: 'Data disegerakkan secara automatik ke sesi tempatan', ja: 'データはローカルセッションに自動同期されます', zh: '数据会自动同步到本地会话', ar: 'تتم مزامنة البيانات تلقائيًا مع الجلسة المحلية', tl: 'Awtomatikong sini-sync ang data sa lokal na session', th: 'ข้อมูลจะซิงค์กับเซสชันในเครื่องโดยอัตโนมัติ', vi: 'Dữ liệu tự động đồng bộ với phiên cục bộ', ko: '데이터가 로컬 세션에 자동 동기화됩니다', es: 'Los datos se sincronizan automáticamente con la sesión local', pt: 'Os dados são sincronizados automaticamente com a sessão local', ru: 'Данные автоматически синхронизируются с локальным сеансом', tr: 'Veriler yerel oturumla otomatik olarak senkronize edilir', hi: 'डेटा स्थानीय सत्र में स्वचालित रूप से सिंक होता है' },
  'Terms & Conditions of Service': { en: 'Terms & Conditions of Service', id: 'Syarat & Ketentuan Layanan', ms: 'Terma & Syarat Perkhidmatan', ja: 'サービス利用規約', zh: '服务条款', ar: 'الشروط والأحكام', tl: 'Mga Tuntunin at Kundisyon ng Serbisyo', th: 'ข้อกำหนดและเงื่อนไขการให้บริการ', vi: 'Điều khoản dịch vụ', ko: '서비스 이용약관', es: 'Términos y condiciones del servicio', pt: 'Termos e condições de serviço', ru: 'Условия использования сервиса', tr: 'Hizmet Şartları ve Koşulları', hi: 'सेवा की शर्तें और नियम' },
  'Please read carefully before accessing and using the application': { en: 'Please read carefully before accessing and using the application', id: 'Harap baca dengan saksama sebelum mengakses dan menggunakan aplikasi', ms: 'Sila baca dengan teliti sebelum mengakses dan menggunakan aplikasi', ja: 'アプリケーションにアクセスして使用する前によくお読みください', zh: '访问和使用应用前请仔细阅读', ar: 'يرجى القراءة بعناية قبل الوصول إلى التطبيق واستخدامه', tl: 'Mangyaring basahin nang mabuti bago gamitin ang application', th: 'โปรดอ่านอย่างละเอียดก่อนเข้าถึงและใช้แอปพลิเคชัน', vi: 'Vui lòng đọc kỹ trước khi truy cập và sử dụng ứng dụng', ko: '애플리케이션에 접근하고 사용하기 전에 주의 깊게 읽어주세요', es: 'Lee atentamente antes de acceder y usar la aplicación', pt: 'Leia atentamente antes de acessar e usar o aplicativo', ru: 'Внимательно прочитайте перед доступом и использованием приложения', tr: 'Uygulamaya erişmeden ve kullanmadan önce dikkatlice okuyun', hi: 'एप्लिकेशन को एक्सेस और उपयोग करने से पहले ध्यान से पढ़ें' },

};

const globalTextSources = new WeakMap<Text, string>();
const globalAttributeSources = new WeakMap<Element, Record<string, string>>();

const GLOBAL_TRANSLATABLE_ATTRIBUTES = [
  'placeholder',
  'title',
  'aria-label',
  'aria-placeholder'
] as const;

function normalizeTranslationText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[0-9]+(?:[.,][0-9]+)*/g, '#')
    .replace(/[^\p{L}#]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function translationSimilarity(a: string, b: string): number {
  const left = normalizeTranslationText(a);
  const right = normalizeTranslationText(b);
  if (!left || !right) return 0;
  if (left === right) return 1;

  const aWords = new Set(left.split(' '));
  const bWords = new Set(right.split(' '));
  const intersection = [...aWords].filter((word) => bWords.has(word)).length;
  const union = new Set([...aWords, ...bWords]).size;
  const jaccard = union ? intersection / union : 0;

  // Prefer contained phrases, but require enough content to avoid translating
  // arbitrary user text accidentally.
  const containment =
    left.length >= 8 && (left.includes(right) || right.includes(left)) ? 0.82 : 0;

  return Math.max(jaccard, containment);
}

function buildGlobalTranslationMap(languageCode: string): Map<string, string> {
  const targetLanguage = (languageCode || 'en').toLowerCase().split('-')[0];
  const target = TRANSLATIONS[targetLanguage] || TRANSLATIONS.en || TRANSLATIONS.id;
  const map = new Map<string, string>();
  const sourceEntries: Array<{ text: string; target: string }> = [];

  Object.keys(TRANSLATIONS).forEach((sourceLanguage) => {
    const source = TRANSLATIONS[sourceLanguage];
    Object.keys(source).forEach((key) => {
      const sourceText = source[key];
      const targetText = target?.[key];
      if (!sourceText || !targetText || sourceText === targetText) return;
      sourceEntries.push({ text: sourceText, target: targetText });
      if (!map.has(sourceText)) map.set(sourceText, targetText);
    });
  });

  Object.entries(LEGACY_UI_TRANSLATIONS).forEach(([sourceText, translationsByLanguage]) => {
    const translated = translationsByLanguage[targetLanguage];
    if (translated && translated !== sourceText && !map.has(sourceText)) map.set(sourceText, translated);
  });

  // Legacy UI contains some phrases which pre-date the translation catalog.
  // Add conservative fuzzy aliases for those phrases. A high threshold and
  // word-overlap requirement prevent usernames, chat messages and free-form
  // user content from being translated accidentally.
  const aliases = new Map<string, string>();
  const candidates = [...new Map(sourceEntries.map((entry) => [entry.text, entry])).values()];

  const addAlias = (sourceText: string) => {
    if (map.has(sourceText) || aliases.has(sourceText)) return;
    const normalized = normalizeTranslationText(sourceText);
    if (normalized.length < 6 || normalized.split(' ').length < 2) return;

    let best: { text: string; target: string; score: number } | null = null;
    for (const candidate of candidates) {
      const score = translationSimilarity(sourceText, candidate.text);
      if (!best || score > best.score) {
        best = { ...candidate, score };
      }
    }

    if (best && best.score >= 0.78) {
      aliases.set(sourceText, best.target);
    }
  };

  // Only strings that are already present in the rendered DOM are considered.
  // This keeps the catalog authoritative while allowing legacy labels to catch up.
  if (typeof document !== 'undefined') {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    while (node) {
      const text = (node.nodeValue || '').trim();
      if (text) addAlias(text);
      node = walker.nextNode();
    }

    document.body.querySelectorAll('*').forEach((element) => {
      GLOBAL_TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
        const text = element.getAttribute(attribute)?.trim();
        if (text) addAlias(text);
      });
    });
  }

  aliases.forEach((value, key) => map.set(key, value));
  return map;
}

function translateTextNode(node: Text, translations: Map<string, string>): void {
  const parent = node.parentElement;
  if (!parent) return;

  const tag = parent.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA' || tag === 'INPUT') {
    return;
  }

  const original = globalTextSources.get(node) ?? node.nodeValue ?? '';
  if (!original.trim()) return;
  if (!globalTextSources.has(node)) globalTextSources.set(node, original);

  let translated = translations.get(original.trim());

  // Dynamic legacy nodes can be mounted after the observer starts. Reuse the
  // same conservative similarity rules against the known catalog aliases.
  if (!translated) {
    const normalized = normalizeTranslationText(original.trim());
    if (normalized.length >= 6 && normalized.split(' ').length >= 2) {
      let best: { target: string; score: number } | null = null;
      translations.forEach((target, source) => {
        const score = translationSimilarity(original.trim(), source);
        if (!best || score > best.score) best = { target, score };
      });
      if (best && best.score >= 0.84) translated = best.target;
    }
  }

  if (!translated) return;

  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  const nextValue = leading + translated + trailing;
  if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
}

function translateElementAttributes(element: Element, translations: Map<string, string>): void {
  if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'NOSCRIPT') return;

  let originals = globalAttributeSources.get(element);
  if (!originals) {
    originals = {};
    globalAttributeSources.set(element, originals);
  }

  GLOBAL_TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    if (!element.hasAttribute(attribute)) return;
    const current = element.getAttribute(attribute) || '';
    const original = originals[attribute] ?? current;
    if (originals[attribute] === undefined) originals[attribute] = original;

    const translated = translations.get(original);
    if (translated && current !== translated) element.setAttribute(attribute, translated);
  });
}

export function installGlobalTranslationObserver(languageCode: string): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => undefined;
  }

  const translations = buildGlobalTranslationMap(languageCode);
  let stopped = false;

  const apply = (root: Node) => {
    if (stopped) return;

    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root as Text, translations);
      return;
    }

    const element = root as Element;
    if (element.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(element, translations);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    while (node) {
      translateTextNode(node as Text, translations);
      node = walker.nextNode();
    }

    if (element.querySelectorAll) {
      element.querySelectorAll('*').forEach((child) => {
        translateElementAttributes(child, translations);
      });
    }
  };

  if (document.body) apply(document.body);

  const observer = new MutationObserver((mutations) => {
    if (stopped) return;

    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') {
        translateTextNode(mutation.target as Text, translations);
      }

      mutation.addedNodes.forEach((node) => apply(node));

      if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
        translateElementAttributes(mutation.target as Element, translations);
      }
    });
  });

  if (document.body) {
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...GLOBAL_TRANSLATABLE_ATTRIBUTES]
    });
  }

  return () => {
    stopped = true;
    observer.disconnect();
  };
}
