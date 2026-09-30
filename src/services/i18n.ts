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
  'KUNCI JAWABAN HOST ONLY': { en: 'HOST ANSWER KEY ONLY', id: 'KUNCI JAWABAN HOST SAJA', ms: 'KUNCI JAWAPAN HOST SAHAJA', ja: 'ホスト専用回答キー', zh: '仅限主播答案密钥', ar: 'مفتاح إجابة المضيف فقط', tl: 'ANSWER KEY PARA SA HOST LANG', th: 'คีย์คำตอบสำหรับโฮสต์เท่านั้น', vi: 'CHỈ DÀNH CHO CHÌA KHÓA ĐÁP ÁN HOST', ko: '호스트 전용 정답 키', es: 'CLAVE DE RESPUESTA SOLO PARA HOST', pt: 'CHAVE DE RESPOSTA SOMENTE PARA HOST', ru: 'КЛЮЧ ОТВЕТА ТОЛЬКО ДЛЯ ХОСТА', tr: 'YALNIZCA HOST CEVAP ANAHTARI', hi: 'केवल होस्ट उत्तर कुंजी' },
  'Close Peek (H)': { en: 'Close Peek (H)', id: 'Tutup Pratinjau (H)', ms: 'Tutup Pratonton (H)', ja: 'プレビューを閉じる (H)', zh: '关闭预览 (H)', ar: 'إغلاق المعاينة (H)', tl: 'Isara ang Preview (H)', th: 'ปิดการดูตัวอย่าง (H)', vi: 'Đóng xem trước (H)', ko: '미리보기 닫기 (H)', es: 'Cerrar vista previa (H)', pt: 'Fechar prévia (H)', ru: 'Закрыть просмотр (H)', tr: 'Önizlemeyi kapat (H)', hi: 'पूर्वावलोकन बंद करें (H)' },
  'Peek Answer (H)': { en: 'Peek Answer (H)', id: 'Lihat Jawaban (H)', ms: 'Lihat Jawapan (H)', ja: '回答を表示 (H)', zh: '查看答案 (H)', ar: 'معاينة الإجابة (H)', tl: 'Silipin ang Sagot (H)', th: 'ดูคำตอบ (H)', vi: 'Xem đáp án (H)', ko: '답안 보기 (H)', es: 'Ver respuesta (H)', pt: 'Ver resposta (H)', ru: 'Посмотреть ответ (H)', tr: 'Cevabı görüntüle (H)', hi: 'उत्तर देखें (H)' },
  'For streamer / host only': { en: 'For streamer / host only', id: 'Khusus streamer / host', ms: 'Untuk streamer / hos sahaja', ja: 'ストリーマー / ホスト専用', zh: '仅供主播使用', ar: 'للمذيع / المضيف فقط', tl: 'Para sa streamer / host lamang', th: 'สำหรับสตรีมเมอร์ / โฮสต์เท่านั้น', vi: 'Chỉ dành cho streamer / host', ko: '스트리머 / 호스트 전용', es: 'Solo para streamer / host', pt: 'Apenas para streamer / host', ru: 'Только для стримера / хоста', tr: 'Yalnızca yayıncı / host için', hi: 'केवल स्ट्रीमर / होस्ट के लिए' },
  'MATCH! This viewer\'s guess is 100% CORRECT!': { en: 'MATCH! This viewer\'s guess is 100% CORRECT!', id: 'COCOK! Tebakan penonton ini 100% BENAR!', ms: 'PADAN! Teka-teki penonton ini 100% BETUL!', ja: '一致！この視聴者の予想は100%正解です！', zh: '匹配！该观众的猜测100%正确！', ar: 'تطابق! تخمين هذا المشاهد صحيح 100٪!', tl: 'MATCH! 100% TAMA ang hula ng viewer na ito!', th: 'ตรงกัน! คำตอบของผู้ชมคนนี้ถูกต้อง 100%!', vi: 'KHỚP! Dự đoán của người xem này ĐÚNG 100%!', ko: '일치! 이 시청자의 추측이 100% 정답입니다!', es: '¡COINCIDE! ¡La predicción de este espectador es 100% CORRECTA!', pt: 'CORRESPONDE! O palpite deste espectador está 100% CORRETO!', ru: 'СОВПАДЕНИЕ! Ответ этого зрителя на 100% ПРАВИЛЬНЫЙ!', tr: 'EŞLEŞME! Bu izleyicinin tahmini %100 DOĞRU!', hi: 'मिलान! इस दर्शक का अनुमान 100% सही है!' },
  'Base Reward (@5,000 IDR)': { en: 'Base Reward (@5,000 IDR)', id: 'Hadiah Dasar (@5.000 IDR)', ms: 'Ganjaran Asas (@5,000 IDR)', ja: '基本報酬（5,000 IDR）', zh: '基础奖励（5,000 IDR）', ar: 'المكافأة الأساسية (5,000 IDR)', tl: 'Base Reward (@5,000 IDR)', th: 'รางวัลพื้นฐาน (@5,000 IDR)', vi: 'Thưởng cơ bản (@5.000 IDR)', ko: '기본 보상 (@5,000 IDR)', es: 'Recompensa base (@5.000 IDR)', pt: 'Recompensa base (@5.000 IDR)', ru: 'Базовая награда (@5 000 IDR)', tr: 'Temel ödül (@5.000 IDR)', hi: 'बेस रिवॉर्ड (@5,000 IDR)' },
  'Milestone Bonus': { en: 'Milestone Bonus', id: 'Bonus Pencapaian', ms: 'Bonus Pencapaian', ja: 'マイルストーンボーナス', zh: '里程碑奖励', ar: 'مكافأة الإنجاز', tl: 'Milestone Bonus', th: 'โบนัสตามเป้าหมาย', vi: 'Thưởng cột mốc', ko: '마일스톤 보너스', es: 'Bono por hito', pt: 'Bônus por marco', ru: 'Бонус за достижение', tr: 'Kilometre taşı bonusu', hi: 'माइलस्टोन बोनस' },
  'Event Grand Prize': { en: 'Event Grand Prize', id: 'Hadiah Utama Event', ms: 'Hadiah Utama Acara', ja: 'イベント大賞', zh: '活动大奖', ar: 'الجائزة الكبرى للفعالية', tl: 'Grand Prize ng Event', th: 'รางวัลใหญ่ของอีเวนต์', vi: 'Giải thưởng lớn sự kiện', ko: '이벤트 대상', es: 'Gran premio del evento', pt: 'Grande prêmio do evento', ru: 'Главный приз события', tr: 'Etkinlik büyük ödülü', hi: 'इवेंट ग्रैंड प्राइज़' },
  'VIP Access': { en: 'VIP Access', id: 'Akses VIP', ms: 'Akses VIP', ja: 'VIPアクセス', zh: 'VIP 权限', ar: 'وصول VIP', tl: 'VIP Access', th: 'สิทธิ์ VIP', vi: 'Quyền truy cập VIP', ko: 'VIP 액세스', es: 'Acceso VIP', pt: 'Acesso VIP', ru: 'VIP-доступ', tr: 'VIP erişimi', hi: 'VIP एक्सेस' },
  'Total Cash Reward': { en: 'Total Cash Reward', id: 'Total Hadiah Tunai', ms: 'Jumlah Ganjaran Tunai', ja: '現金報酬合計', zh: '现金奖励总额', ar: 'إجمالي المكافأة النقدية', tl: 'Kabuuang Cash Reward', th: 'รางวัลเงินสดรวม', vi: 'Tổng phần thưởng tiền mặt', ko: '총 현금 보상', es: 'Recompensa total en efectivo', pt: 'Recompensa total em dinheiro', ru: 'Общая денежная награда', tr: 'Toplam nakit ödül', hi: 'कुल नकद पुरस्कार' },
  'Manual Count Input:': { en: 'Manual Count Input:', id: 'Input Jumlah Manual:', ms: 'Input Kiraan Manual:', ja: '手動カウント入力:', zh: '手动数量输入：', ar: 'إدخال العدد يدويًا:', tl: 'Manwal na Bilang:', th: 'ป้อนจำนวนด้วยตนเอง:', vi: 'Nhập số lượng thủ công:', ko: '수동 수량 입력:', es: 'Entrada de cantidad manual:', pt: 'Entrada de contagem manual:', ru: 'Ручной ввод количества:', tr: 'Manuel sayı girişi:', hi: 'मैनुअल गिनती इनपुट:' },
  'Your Current Referrals': { en: 'Your Current Referrals', id: 'Referral Anda Saat Ini', ms: 'Rujukan Semasa Anda', ja: '現在の紹介数', zh: '您当前的推荐数', ar: 'إحالاتك الحالية', tl: 'Iyong Kasalukuyang Referral', th: 'การแนะนำปัจจุบันของคุณ', vi: 'Lượt giới thiệu hiện tại', ko: '현재 추천 수', es: 'Tus referidos actuales', pt: 'Suas indicações atuais', ru: 'Ваши текущие рефералы', tr: 'Mevcut referanslarınız', hi: 'आपके वर्तमान रेफरल' },
  'Total Accumulated Cash': { en: 'Total Accumulated Cash', id: 'Total Uang Tunai Terkumpul', ms: 'Jumlah Tunai Terkumpul', ja: '累計現金合計', zh: '累计现金总额', ar: 'إجمالي النقد المتراكم', tl: 'Kabuuang Naipong Cash', th: 'เงินสดสะสมทั้งหมด', vi: 'Tổng tiền mặt tích lũy', ko: '누적 현금 합계', es: 'Efectivo total acumulado', pt: 'Total de dinheiro acumulado', ru: 'Общая накопленная сумма', tr: 'Toplam biriken nakit', hi: 'कुल संचित नकद' },
  'First Step': { en: 'First Step', id: 'Langkah Pertama', ms: 'Langkah Pertama', ja: '最初のステップ', zh: '第一步', ar: 'الخطوة الأولى', tl: 'Unang Hakbang', th: 'ขั้นแรก', vi: 'Bước đầu tiên', ko: '첫 단계', es: 'Primer paso', pt: 'Primeiro passo', ru: 'Первый шаг', tr: 'İlk adım', hi: 'पहला कदम' },
  'Standard': { en: 'Standard', id: 'Standar', ms: 'Standard', ja: '標準', zh: '标准', ar: 'قياسي', tl: 'Standard', th: 'มาตรฐาน', vi: 'Tiêu chuẩn', ko: '표준', es: 'Estándar', pt: 'Padrão', ru: 'Стандарт', tr: 'Standart', hi: 'मानक' },
  'Special Event Prize': { en: 'Special Event Prize', id: 'Hadiah Khusus Event', ms: 'Hadiah Khas Acara', ja: '特別イベント賞', zh: '特别活动奖', ar: 'جائزة الفعالية الخاصة', tl: 'Special Event Prize', th: 'รางวัลพิเศษของอีเวนต์', vi: 'Giải thưởng sự kiện đặc biệt', ko: '특별 이벤트 상금', es: 'Premio especial del evento', pt: 'Prêmio especial do evento', ru: 'Специальный приз события', tr: 'Özel etkinlik ödülü', hi: 'विशेष इवेंट पुरस्कार' },

};


// Broad legacy labels still rendered directly by older screens.
const LEGACY_COMMON_TRANSLATIONS: Record<string, Record<string, string>> = {
  'Profile': {en:'Profile',id:'Profil',ms:'Profil',ja:'プロフィール',zh:'个人资料',ar:'الملف الشخصي',tl:'Profile',th:'โปรไฟล์',vi:'Hồ sơ',ko:'프로필',es:'Perfil',pt:'Perfil',ru:'Профиль',tr:'Profil',hi:'प्रोफ़ाइल'},
  'Logout': {en:'Logout',id:'Keluar',ms:'Log Keluar',ja:'ログアウト',zh:'退出登录',ar:'تسجيل الخروج',tl:'Mag-log out',th:'ออกจากระบบ',vi:'Đăng xuất',ko:'로그아웃',es:'Cerrar sesión',pt:'Sair',ru:'Выйти',tr:'Çıkış',hi:'लॉग आउट'},
  'Login': {en:'Login',id:'Masuk',ms:'Log Masuk',ja:'ログイン',zh:'登录',ar:'تسجيل الدخول',tl:'Mag-login',th:'เข้าสู่ระบบ',vi:'Đăng nhập',ko:'로그인',es:'Iniciar sesión',pt:'Entrar',ru:'Войти',tr:'Giriş',hi:'लॉगिन'},
  'Register': {en:'Register',id:'Daftar',ms:'Daftar',ja:'登録',zh:'注册',ar:'تسجيل',tl:'Magrehistro',th:'สมัครสมาชิก',vi:'Đăng ký',ko:'회원가입',es:'Registrarse',pt:'Cadastrar',ru:'Регистрация',tr:'Kayıt',hi:'पंजीकरण'},
  'Email': {en:'Email',id:'Email',ms:'E-mel',ja:'メール',zh:'电子邮件',ar:'البريد الإلكتروني',tl:'Email',th:'อีเมล',vi:'Email',ko:'이메일',es:'Correo electrónico',pt:'E-mail',ru:'Электронная почта',tr:'E-posta',hi:'ईमेल'},
  'Password': {en:'Password',id:'Kata Sandi',ms:'Kata Laluan',ja:'パスワード',zh:'密码',ar:'كلمة المرور',tl:'Password',th:'รหัสผ่าน',vi:'Mật khẩu',ko:'비밀번호',es:'Contraseña',pt:'Senha',ru:'Пароль',tr:'Şifre',hi:'पासवर्ड'},
  'Username': {en:'Username',id:'Nama Pengguna',ms:'Nama Pengguna',ja:'ユーザー名',zh:'用户名',ar:'اسم المستخدم',tl:'Username',th:'ชื่อผู้ใช้',vi:'Tên người dùng',ko:'사용자 이름',es:'Nombre de usuario',pt:'Nome de usuário',ru:'Имя пользователя',tr:'Kullanıcı adı',hi:'उपयोगकर्ता नाम'},
  'Balance': {en:'Balance',id:'Saldo',ms:'Baki',ja:'残高',zh:'余额',ar:'الرصيد',tl:'Balanse',th:'ยอดคงเหลือ',vi:'Số dư',ko:'잔액',es:'Saldo',pt:'Saldo',ru:'Баланс',tr:'Bakiye',hi:'शेष राशि'},
  'Available Balance': {en:'Available Balance',id:'Saldo Tersedia',ms:'Baki Tersedia',ja:'利用可能残高',zh:'可用余额',ar:'الرصيد المتاح',tl:'Available na Balanse',th:'ยอดคงเหลือที่ใช้ได้',vi:'Số dư khả dụng',ko:'사용 가능 잔액',es:'Saldo disponible',pt:'Saldo disponível',ru:'Доступный баланс',tr:'Kullanılabilir bakiye',hi:'उपलब्ध शेष राशि'},
  'Current Balance': {en:'Current Balance',id:'Saldo Saat Ini',ms:'Baki Semasa',ja:'現在の残高',zh:'当前余额',ar:'الرصيد الحالي',tl:'Kasalukuyang Balanse',th:'ยอดคงเหลือปัจจุบัน',vi:'Số dư hiện tại',ko:'현재 잔액',es:'Saldo actual',pt:'Saldo atual',ru:'Текущий баланс',tr:'Mevcut bakiye',hi:'वर्तमान शेष राशि'},
  'Deposit': {en:'Deposit',id:'Deposit',ms:'Deposit',ja:'入金',zh:'充值',ar:'إيداع',tl:'Deposito',th:'ฝากเงิน',vi:'Nạp tiền',ko:'입금',es:'Depósito',pt:'Depósito',ru:'Пополнение',tr:'Para yatırma',hi:'जमा'},
  'Withdraw': {en:'Withdraw',id:'Tarik',ms:'Pengeluaran',ja:'出金',zh:'提现',ar:'سحب',tl:'Mag-withdraw',th:'ถอนเงิน',vi:'Rút tiền',ko:'출금',es:'Retirar',pt:'Sacar',ru:'Вывод',tr:'Para çekme',hi:'निकासी'},
  'History': {en:'History',id:'Riwayat',ms:'Sejarah',ja:'履歴',zh:'历史记录',ar:'السجل',tl:'Kasaysayan',th:'ประวัติ',vi:'Lịch sử',ko:'내역',es:'Historial',pt:'Histórico',ru:'История',tr:'Geçmiş',hi:'इतिहास'},
  'Status': {en:'Status',id:'Status',ms:'Status',ja:'ステータス',zh:'状态',ar:'الحالة',tl:'Status',th:'สถานะ',vi:'Trạng thái',ko:'상태',es:'Estado',pt:'Status',ru:'Статус',tr:'Durum',hi:'स्थिति'},
  'Active': {en:'Active',id:'Aktif',ms:'Aktif',ja:'有効',zh:'活跃',ar:'نشط',tl:'Aktibo',th:'ใช้งานอยู่',vi:'Đang hoạt động',ko:'활성',es:'Activo',pt:'Ativo',ru:'Активен',tr:'Aktif',hi:'सक्रिय'},
  'Pending': {en:'Pending',id:'Menunggu',ms:'Menunggu',ja:'保留中',zh:'待处理',ar:'قيد الانتظار',tl:'Nakabinbin',th:'รอดำเนินการ',vi:'Đang chờ',ko:'대기 중',es:'Pendiente',pt:'Pendente',ru:'Ожидание',tr:'Beklemede',hi:'लंबित'},
  'Success': {en:'Success',id:'Berhasil',ms:'Berjaya',ja:'成功',zh:'成功',ar:'نجاح',tl:'Tagumpay',th:'สำเร็จ',vi:'Thành công',ko:'성공',es:'Éxito',pt:'Sucesso',ru:'Успешно',tr:'Başarılı',hi:'सफल'},
  'Failed': {en:'Failed',id:'Gagal',ms:'Gagal',ja:'失敗',zh:'失敗',ar:'فشل',tl:'Nabigo',th:'ล้มเหลว',vi:'Thất bại',ko:'실패',es:'Fallido',pt:'Falhou',ru:'Не удалось',tr:'Başarısız',hi:'विफल'},
  'Error': {en:'Error',id:'Kesalahan',ms:'Ralat',ja:'エラー',zh:'错误',ar:'خطأ',tl:'Error',th:'ข้อผิดพลาด',vi:'Lỗi',ko:'오류',es:'Error',pt:'Erro',ru:'Ошибка',tr:'Hata',hi:'त्रुटि'},
  'Copy': {en:'Copy',id:'Salin',ms:'Salin',ja:'コピー',zh:'复制',ar:'نسخ',tl:'Kopyahin',th:'คัดลอก',vi:'Sao chép',ko:'복사',es:'Copiar',pt:'Copiar',ru:'Копировать',tr:'Kopyala',hi:'कॉपी'},
  'Share': {en:'Share',id:'Bagikan',ms:'Kongsi',ja:'共有',zh:'分享',ar:'مشاركة',tl:'Ibahagi',th:'แชร์',vi:'Chia sẻ',ko:'공유',es:'Compartir',pt:'Compartilhar',ru:'Поделиться',tr:'Paylaş',hi:'साझा करें'},
  'Invite': {en:'Invite',id:'Undang',ms:'Jemput',ja:'招待',zh:'邀请',ar:'دعوة',tl:'Imbitahan',th:'เชิญ',vi:'Mời',ko:'초대',es:'Invitar',pt:'Convidar',ru:'Пригласить',tr:'Davet et',hi:'आमंत्रित करें'},
  'Reward': {en:'Reward',id:'Hadiah',ms:'Ganjaran',ja:'報酬',zh:'奖励',ar:'مكافأة',tl:'Gantimpala',th:'รางวัล',vi:'Phần thưởng',ko:'보상',es:'Recompensa',pt:'Recompensa',ru:'Награда',tr:'Ödül',hi:'इनाम'},
  'Bonus': {en:'Bonus',id:'Bonus',ms:'Bonus',ja:'ボーナス',zh:'奖励',ar:'مكافأة',tl:'Bonus',th:'โบนัส',vi:'Thưởng',ko:'보너스',es:'Bono',pt:'Bônus',ru:'Бонус',tr:'Bonus',hi:'बोनस'},
  'Winner': {en:'Winner',id:'Pemenang',ms:'Pemenang',ja:'勝者',zh:'获胜者',ar:'الفائز',tl:'Nanalo',th:'ผู้ชนะ',vi:'Người chiến thắng',ko:'우승자',es:'Ganador',pt:'Vencedor',ru:'Победитель',tr:'Kazanan',hi:'विजेता'},
  'Game': {en:'Game',id:'Game',ms:'Permainan',ja:'ゲーム',zh:'游戏',ar:'لعبة',tl:'Laro',th:'เกม',vi:'Trò chơi',ko:'게임',es:'Juego',pt:'Jogo',ru:'Игра',tr:'Oyun',hi:'गेम'},
  'Host': {en:'Host',id:'Host',ms:'Hos',ja:'ホスト',zh:'主播',ar:'المضيف',tl:'Host',th:'โฮสต์',vi:'Host',ko:'호스트',es:'Anfitrión',pt:'Host',ru:'Хост',tr:'Sunucu',hi:'होस्ट'},
  'Viewer': {en:'Viewer',id:'Penonton',ms:'Penonton',ja:'視聴者',zh:'观众',ar:'المشاهد',tl:'Manonood',th:'ผู้ชม',vi:'Người xem',ko:'시청자',es:'Espectador',pt:'Espectador',ru:'Зритель',tr:'İzleyici',hi:'दर्शक'},
  'Round': {en:'Round',id:'Putaran',ms:'Pusingan',ja:'ラウンド',zh:'回合',ar:'جولة',tl:'Round',th:'รอบ',vi:'Vòng',ko:'라운드',es:'Ronda',pt:'Rodada',ru:'Раунд',tr:'Tur',hi:'राउंड'},
  'Weekly': {en:'Weekly',id:'Mingguan',ms:'Mingguan',ja:'毎週',zh:'每周',ar:'أسبوعي',tl:'Lingguhan',th:'รายสัปดาห์',vi:'Hàng tuần',ko:'주간',es:'Semanal',pt:'Semanal',ru:'Еженедельный',tr:'Haftalık',hi:'साप्ताहिक'},
  'Monthly': {en:'Monthly',id:'Bulanan',ms:'Bulanan',ja:'毎月',zh:'每月',ar:'شهري',tl:'Buwanan',th:'รายเดือน',vi:'Hàng tháng',ko:'월간',es:'Mensual',pt:'Mensal',ru:'Ежемесячный',tr:'Aylık',hi:'मासिक'},
  'Daily': {en:'Daily',id:'Harian',ms:'Harian',ja:'毎日',zh:'每日',ar:'يومي',tl:'Araw-araw',th:'รายวัน',vi:'Hàng ngày',ko:'일일',es:'Diario',pt:'Diário',ru:'Ежедневный',tr:'Günlük',hi:'दैनिक'},
  'Today': {en:'Today',id:'Hari Ini',ms:'Hari Ini',ja:'今日',zh:'今天',ar:'اليوم',tl:'Ngayon',th:'วันนี้',vi:'Hôm nay',ko:'오늘',es:'Hoy',pt:'Hoje',ru:'Сегодня',tr:'Bugün',hi:'आज'},
  'Download': {en:'Download',id:'Unduh',ms:'Muat Turun',ja:'ダウンロード',zh:'下载',ar:'تنزيل',tl:'I-download',th:'ดาวน์โหลด',vi:'Tải xuống',ko:'다운로드',es:'Descargar',pt:'Baixar',ru:'Скачать',tr:'İndir',hi:'डाउनलोड'},
  'Upload': {en:'Upload',id:'Unggah',ms:'Muat Naik',ja:'アップロード',zh:'上传',ar:'رفع',tl:'I-upload',th:'อัปโหลด',vi:'Tải lên',ko:'업로드',es:'Subir',pt:'Carregar',ru:'Загрузить',tr:'Yükle',hi:'अपलोड'},
  'Refresh': {en:'Refresh',id:'Segarkan',ms:'Muat Semula',ja:'更新',zh:'刷新',ar:'تحديث',tl:'I-refresh',th:'รีเฟรช',vi:'Làm mới',ko:'새로고침',es:'Actualizar',pt:'Actualizar',ru:'Обновить',tr:'Yenile',hi:'रीफ़्रेश'},
  'Start': {en:'Start',id:'Mulai',ms:'Mula',ja:'開始',zh:'开始',ar:'بدء',tl:'Magsimula',th:'เริ่ม',vi:'Bắt đầu',ko:'시작',es:'Iniciar',pt:'Iniciar',ru:'Начать',tr:'Başlat',hi:'शुरू करें'},
  'Stop': {en:'Stop',id:'Berhenti',ms:'Berhenti',ja:'停止',zh:'停止',ar:'إيقاف',tl:'Itigil',th:'หยุด',vi:'Dừng',ko:'중지',es:'Detener',pt:'Parar',ru:'Остановить',tr:'Durdur',hi:'रोकें'},
  'Play': {en:'Play',id:'Putar',ms:'Mainkan',ja:'再生',zh:'播放',ar:'تشغيل',tl:'I-play',th:'เล่น',vi:'Phát',ko:'재생',es:'Reproducir',pt:'Reproduzir',ru:'Воспроизвести',tr:'Oynat',hi:'चलाएं'},
  'Pause': {en:'Pause',id:'Jeda',ms:'Jeda',ja:'一時停止',zh:'暂停',ar:'إيقاف مؤقت',tl:'I-pause',th:'หยุดชั่วคราว',vi:'Tạm dừng',ko:'일시정지',es:'Pausar',pt:'Pausar',ru:'Пауза',tr:'Duraklat',hi:'रोकें'},
  'Spin': {en:'Spin',id:'Putar',ms:'Pusing',ja:'スピン',zh:'旋转',ar:'تدوير',tl:'Paikutin',th:'หมุน',vi:'Quay',ko:'돌리기',es:'Girar',pt:'Girar',ru:'Крутить',tr:'Çevir',hi:'घुमाएँ'},
  'Lock': {en:'Lock',id:'Kunci',ms:'Kunci',ja:'ロック',zh:'锁定',ar:'قفل',tl:'I-lock',th:'ล็อก',vi:'Khóa',ko:'잠금',es:'Bloquear',pt:'Bloquear',ru:'Заблокировать',tr:'Kilitle',hi:'लॉक'},
  'Unlock': {en:'Unlock',id:'Buka Kunci',ms:'Buka Kunci',ja:'ロック解除',zh:'解锁',ar:'فتح القفل',tl:'I-unlock',th:'ปลดล็อก',vi:'Mở khóa',ko:'잠금 해제',es:'Desbloquear',pt:'Desbloquear',ru:'Разблокировать',tr:'Kilidi aç',hi:'अनलॉक'},
  'Claim': {en:'Claim',id:'Klaim',ms:'Tuntut',ja:'受け取る',zh:'领取',ar:'استلام',tl:'Kunin',th:'รับรางวัล',vi:'Nhận',ko:'받기',es:'Reclamar',pt:'Resgatar',ru:'Получить',tr:'Al',hi:'प्राप्त करें'},
  'Amount': {en:'Amount',id:'Nominal',ms:'Jumlah',ja:'金額',zh:'金额',ar:'المبلغ',tl:'Halaga',th:'จำนวนเงิน',vi:'Số tiền',ko:'금액',es:'Importe',pt:'Valor',ru:'Сумма',tr:'Tutar',hi:'राशि'},
  'Duration': {en:'Duration',id:'Durasi',ms:'Tempoh',ja:'期間',zh:'时长',ar:'المدة',tl:'Tagal',th:'ระยะเวลา',vi:'Thời lượng',ko:'기간',es:'Duración',pt:'Duração',ru:'Продолжительность',tr:'Süre',hi:'अवधि'},
  'Language': {en:'Language',id:'Bahasa',ms:'Bahasa',ja:'言語',zh:'语言',ar:'اللغة',tl:'Wika',th:'ภาษา',vi:'Ngôn ngữ',ko:'언어',es:'Idioma',pt:'Idioma',ru:'Язык',tr:'Dil',hi:'भाषा'},
  'Country': {en:'Country',id:'Negara',ms:'Negara',ja:'国',zh:'国家',ar:'البلد',tl:'Bansa',th:'ประเทศ',vi:'Quốc gia',ko:'국가',es:'País',pt:'País',ru:'Страна',tr:'Ülke',hi:'देश'},
  'Referral': {en:'Referral',id:'Referral',ms:'Rujukan',ja:'紹介',zh:'推荐',ar:'إحالة',tl:'Referral',th:'การแนะนำ',vi:'Giới thiệu',ko:'추천',es:'Referido',pt:'Indicação',ru:'Реферал',tr:'Referans',hi:'रेफरल'},
  'Commission': {en:'Commission',id:'Komisi',ms:'Komisen',ja:'コミッション',zh:'佣金',ar:'العمولة',tl:'Komisyon',th:'ค่าคอมมิชชัน',vi:'Hoa hồng',ko:'수수료',es:'Comisión',pt:'Comissão',ru:'Комиссия',tr:'Komisyon',hi:'कमीशन'},
  'Leaderboard': {en:'Leaderboard',id:'Papan Peringkat',ms:'Papan Pendahulu',ja:'ランキング',zh:'排行榜',ar:'لوحة المتصدرين',tl:'Leaderboard',th:'กระดานผู้นำ',vi:'Bảng xếp hạng',ko:'리더보드',es:'Clasificación',pt:'Ranking',ru:'Таблица лидеров',tr:'Liderlik tablosu',hi:'लीडरबोर्ड'},
  'Live': {en:'Live',id:'Live',ms:'Siaran Langsung',ja:'ライブ',zh:'直播',ar:'مباشر',tl:'Live',th:'ไลฟ์',vi:'Trực tiếp',ko:'라이브',es:'En vivo',pt:'Ao vivo',ru:'В эфире',tr:'Canlı',hi:'लाइव'},
  'Stream': {en:'Stream',id:'Siaran',ms:'Strim',ja:'配信',zh:'直播',ar:'بث',tl:'Stream',th:'สตรีม',vi:'Luồng phát',ko:'스트림',es:'Stream',pt:'Transmissão',ru:'Стрим',tr:'Yayın',hi:'स्ट्रीम'},
  'Users': {en:'Users',id:'Pengguna',ms:'Pengguna',ja:'ユーザー',zh:'用户',ar:'المستخدمون',tl:'Mga User',th:'ผู้ใช้',vi:'Người dùng',ko:'사용자',es:'Usuarios',pt:'Usuários',ru:'Пользователи',tr:'Kullanıcılar',hi:'उपयोगकर्ता'},
  'Admin': {en:'Admin',id:'Admin',ms:'Pentadbir',ja:'管理者',zh:'管理员',ar:'المسؤول',tl:'Admin',th:'ผู้ดูแลระบบ',vi:'Quản trị viên',ko:'관리자',es:'Administrador',pt:'Administrador',ru:'Администратор',tr:'Yönetici',hi:'व्यवस्थापक'},
  'Owner': {en:'Owner',id:'Owner',ms:'Pemilik',ja:'オーナー',zh:'所有者',ar:'المالك',tl:'May-ari',th:'เจ้าของ',vi:'Chủ sở hữu',ko:'소유자',es:'Propietario',pt:'Proprietário',ru:'Владелец',tr:'Sahip',hi:'मालिक'},
  'Account': {en:'Account',id:'Akun',ms:'Akaun',ja:'アカウント',zh:'账户',ar:'الحساب',tl:'Account',th:'บัญชี',vi:'Tài khoản',ko:'계정',es:'Cuenta',pt:'Conta',ru:'Аккаунт',tr:'Hesap',hi:'खाता'},
  'Notification': {en:'Notification',id:'Notifikasi',ms:'Pemberitahuan',ja:'通知',zh:'通知',ar:'الإشعار',tl:'Abiso',th:'การแจ้งเตือน',vi:'Thông báo',ko:'알림',es:'Notificación',pt:'Notificação',ru:'Уведомление',tr:'Bildirim',hi:'सूचना'},
  'No data': {en:'No data',id:'Tidak ada data',ms:'Tiada data',ja:'データなし',zh:'暂无数据',ar:'لا توجد بيانات',tl:'Walang data',th:'ไม่มีข้อมูล',vi:'Không có dữ liệu',ko:'데이터 없음',es:'Sin datos',pt:'Sem dados',ru:'Нет данных',tr:'Veri yok',hi:'कोई डेटा नहीं'},
  'No results': {en:'No results',id:'Tidak ada hasil',ms:'Tiada hasil',ja:'結果なし',zh:'无结果',ar:'لا توجد نتائج',tl:'Walang resulta',th:'ไม่พบผลลัพธ์',vi:'Không có kết quả',ko:'결과 없음',es:'Sin resultados',pt:'Sem resultados',ru:'Нет результатов',tr:'Sonuç yok',hi:'कोई परिणाम नहीं'},
  'Welcome': {en:'Welcome',id:'Selamat Datang',ms:'Selamat Datang',ja:'ようこそ',zh:'欢迎',ar:'مرحبًا',tl:'Maligayang pagdating',th:'ยินดีต้อนรับ',vi:'Chào mừng',ko:'환영합니다',es:'Bienvenido',pt:'Bem-vindo',ru:'Добро пожаловать',tr:'Hoş geldiniz',hi:'स्वागत है'},
  'Choose': {en:'Choose',id:'Pilih',ms:'Pilih',ja:'選択',zh:'选择',ar:'اختر',tl:'Pumili',th:'เลือก',vi:'Chọn',ko:'선택',es:'Elegir',pt:'Escolher',ru:'Выбрать',tr:'Seç',hi:'चुनें'},
  'Select': {en:'Select',id:'Pilih',ms:'Pilih',ja:'選択',zh:'选择',ar:'تحديد',tl:'Piliin',th:'เลือก',vi:'Chọn',ko:'선택',es:'Seleccionar',pt:'Selecionar',ru:'Выбрать',tr:'Seç',hi:'चुनें'},
  'Enter': {en:'Enter',id:'Masukkan',ms:'Masukkan',ja:'入力',zh:'输入',ar:'أدخل',tl:'Ilagay',th:'ป้อน',vi:'Nhập',ko:'입력',es:'Introducir',pt:'Inserir',ru:'Введите',tr:'Gir',hi:'दर्ज करें'},
  'Required': {en:'Required',id:'Wajib',ms:'Diperlukan',ja:'必須',zh:'必填',ar:'مطلوب',tl:'Kinakailangan',th:'จำเป็น',vi:'Bắt buộc',ko:'필수',es:'Obligatorio',pt:'Obrigatório',ru:'Обязательно',tr:'Gerekli',hi:'आवश्यक'},
  'Optional': {en:'Optional',id:'Opsional',ms:'Pilihan',ja:'任意',zh:'可选',ar:'اختياري',tl:'Opsyonal',th:'ไม่บังคับ',vi:'Tùy chọn',ko:'선택 사항',es:'Opcional',pt:'Opcional',ru:'Необязательно',tr:'İsteğe bağlı',hi:'वैकल्पिक'},
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

  Object.entries(LEGACY_COMMON_TRANSLATIONS).forEach(([sourceText, translationsByLanguage]) => {\n    const translated = translationsByLanguage[targetLanguage];\n    if (translated && translated !== sourceText && !map.has(sourceText)) map.set(sourceText, translated);\n  });\n\n  Object.entries(LEGACY_UI_TRANSLATIONS).forEach(([sourceText, translationsByLanguage]) => {
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
