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
const CATALOG_TRANSLATION_PATCHES: Record<string, Record<string, string>> = {
  'Dashboard': { en:'Dashboard', id:'Dasbor', ms:'Papan Pemuka', ja:'ダッシュボード', zh:'仪表盘', ar:'لوحة التحكم', tl:'Dashboard', th:'แดชบอร์ด', vi:'Bảng điều khiển', ko:'대시보드', es:'Panel', pt:'Painel', ru:'Панель управления', tr:'Kontrol Paneli', hi:'डैशबोर्ड' },
  'Settings': { en:'Settings', id:'Pengaturan', ms:'Tetapan', ja:'設定', zh:'设置', ar:'الإعدادات', tl:'Mga Setting', th:'การตั้งค่า', vi:'Cài đặt', ko:'설정', es:'Configuración', pt:'Configurações', ru:'Настройки', tr:'Ayarlar', hi:'सेटिंग्स' },
  'Language': { en:'Language', id:'Bahasa', ms:'Bahasa', ja:'言語', zh:'语言', ar:'اللغة', tl:'Wika', th:'ภาษา', vi:'Ngôn ngữ', ko:'언어', es:'Idioma', pt:'Idioma', ru:'Язык', tr:'Dil', hi:'भाषा' },
  'Log Out': { en:'Log Out', id:'Keluar', ms:'Log Keluar', ja:'ログアウト', zh:'退出登录', ar:'تسجيل الخروج', tl:'Mag-log out', th:'ออกจากระบบ', vi:'Đăng xuất', ko:'로그아웃', es:'Cerrar sesión', pt:'Sair', ru:'Выйти', tr:'Çıkış yap', hi:'लॉग आउट' },
  'Deposit': { en:'Deposit', id:'Deposit', ms:'Deposit', ja:'入金', zh:'充值', ar:'إيداع', tl:'Deposit', th:'ฝากเงิน', vi:'Nạp tiền', ko:'입금', es:'Depósito', pt:'Depósito', ru:'Пополнение', tr:'Yatırma', hi:'जमा' },
  'Withdrawal': { en:'Withdrawal', id:'Penarikan', ms:'Pengeluaran', ja:'出金', zh:'提现', ar:'سحب', tl:'Pag-withdraw', th:'ถอนเงิน', vi:'Rút tiền', ko:'출금', es:'Retiro', pt:'Saque', ru:'Вывод', tr:'Çekim', hi:'निकासी' },
  'Profile & History': { en:'Profile & History', id:'Profil & Riwayat', ms:'Profil & Sejarah', ja:'プロフィールと履歴', zh:'个人资料与记录', ar:'الملف والسجل', tl:'Profile at Kasaysayan', th:'โปรไฟล์และประวัติ', vi:'Hồ sơ & lịch sử', ko:'프로필 및 기록', es:'Perfil e historial', pt:'Perfil e histórico', ru:'Профиль и история', tr:'Profil ve geçmiş', hi:'प्रोफ़ाइल और इतिहास' },
  'Current Viewers': { en:'Current Viewers', id:'Penonton Saat Ini', ms:'Penonton Semasa', ja:'現在の視聴者', zh:'当前观众', ar:'المشاهدون الحاليون', tl:'Kasalukuyang Manonood', th:'ผู้ชมปัจจุบัน', vi:'Người xem hiện tại', ko:'현재 시청자', es:'Espectadores actuales', pt:'Espectadores atuais', ru:'Текущие зрители', tr:'Mevcut izleyiciler', hi:'वर्तमान दर्शक' },
  'Total Comments': { en:'Total Comments', id:'Total Komentar', ms:'Jumlah Komen', ja:'コメント総数', zh:'评论总数', ar:'إجمالي التعليقات', tl:'Kabuuang Komento', th:'ความคิดเห็นทั้งหมด', vi:'Tổng bình luận', ko:'총 댓글', es:'Total de comentarios', pt:'Total de comentários', ru:'Всего комментариев', tr:'Toplam yorum', hi:'कुल टिप्पणियाँ' },
  'Total Gifts (Roses)': { en:'Total Gifts (Roses)', id:'Total Gift (Mawar)', ms:'Jumlah Gift (Mawar)', ja:'ギフト合計（バラ）', zh:'礼物总数（玫瑰）', ar:'إجمالي الهدايا (ورود)', tl:'Kabuuang Gift (Roses)', th:'ของขวัญทั้งหมด (กุหลาบ)', vi:'Tổng quà tặng (Hoa hồng)', ko:'총 선물 (장미)', es:'Total de regalos (Rosas)', pt:'Total de presentes (Rosas)', ru:'Всего подарков (розы)', tr:'Toplam hediye (Güller)', hi:'कुल उपहार (गुलाब)' },
  'Incoming Orders': { en:'Incoming Orders', id:'Pesanan Masuk', ms:'Pesanan Masuk', ja:'受注', zh:'进单', ar:'الطلبات الواردة', tl:'Mga Papasok na Order', th:'คำสั่งซื้อเข้า', vi:'Đơn hàng đến', ko:'들어오는 주문', es:'Pedidos entrantes', pt:'Pedidos recebidos', ru:'Входящие заказы', tr:'Gelen siparişler', hi:'आने वाले ऑर्डर' },
  'All': { en:'All', id:'Semua', ms:'Semua', ja:'すべて', zh:'全部', ar:'الكل', tl:'Lahat', th:'ทั้งหมด', vi:'Tất cả', ko:'전체', es:'Todos', pt:'Todos', ru:'Все', tr:'Tümü', hi:'सभी' },
  'Comments': { en:'Comments', id:'Komentar', ms:'Komen', ja:'コメント', zh:'评论', ar:'التعليقات', tl:'Mga Komento', th:'ความคิดเห็น', vi:'Bình luận', ko:'댓글', es:'Comentarios', pt:'Comentários', ru:'Комментарии', tr:'Yorumlar', hi:'टिप्पणियाँ' },
  'Winner': { en:'Winner', id:'Pemenang', ms:'Pemenang', ja:'勝者', zh:'获胜者', ar:'الفائز', tl:'Nanalo', th:'ผู้ชนะ', vi:'Người chiến thắng', ko:'우승자', es:'Ganador', pt:'Vencedor', ru:'Победитель', tr:'Kazanan', hi:'विजेता' },
  'Prize': { en:'Prize', id:'Hadiah', ms:'Hadiah', ja:'賞品', zh:'奖品', ar:'الجائزة', tl:'Premyo', th:'รางวัล', vi:'Giải thưởng', ko:'상품', es:'Premio', pt:'Prêmio', ru:'Приз', tr:'Ödül', hi:'पुरस्कार' },
  'Start Game': { en:'Start Game', id:'Mulai Game', ms:'Mula Permainan', ja:'ゲーム開始', zh:'开始游戏', ar:'بدء اللعبة', tl:'Simulan ang Laro', th:'เริ่มเกม', vi:'Bắt đầu trò chơi', ko:'게임 시작', es:'Iniciar juego', pt:'Iniciar jogo', ru:'Начать игру', tr:'Oyunu başlat', hi:'गेम शुरू करें' },
  'Quick Game': { en:'Quick Game', id:'Game Cepat', ms:'Permainan Pantas', ja:'クイックゲーム', zh:'快速游戏', ar:'لعبة سريعة', tl:'Mabilis na Laro', th:'เกมด่วน', vi:'Trò chơi nhanh', ko:'빠른 게임', es:'Juego rápido', pt:'Jogo rápido', ru:'Быстрая игра', tr:'Hızlı oyun', hi:'त्वरित गेम' },
  'Set Duration': { en:'Set Duration', id:'Atur Durasi', ms:'Tetapkan Tempoh', ja:'期間を設定', zh:'设置时长', ar:'تعيين المدة', tl:'Itakda ang Tagal', th:'ตั้งระยะเวลา', vi:'Đặt thời lượng', ko:'기간 설정', es:'Establecer duración', pt:'Definir duração', ru:'Установить длительность', tr:'Süreyi ayarla', hi:'अवधि सेट करें' },
  'Participants List': { en:'Participants List', id:'Daftar Peserta', ms:'Senarai Peserta', ja:'参加者リスト', zh:'参与者列表', ar:'قائمة المشاركين', tl:'Listahan ng mga Kalahok', th:'รายชื่อผู้เข้าร่วม', vi:'Danh sách người tham gia', ko:'참가자 목록', es:'Lista de participantes', pt:'Lista de participantes', ru:'Список участников', tr:'Katılımcı listesi', hi:'प्रतिभागियों की सूची' },
  'Empty Seat': { en:'Empty Seat', id:'Kursi Kosong', ms:'Tempat Duduk Kosong', ja:'空席', zh:'空座位', ar:'مقعد فارغ', tl:'Bakanteng Upuan', th:'ที่นั่งว่าง', vi:'Ghế trống', ko:'빈 좌석', es:'Asiento vacío', pt:'Assento vazio', ru:'Свободное место', tr:'Boş koltuk', hi:'खाली सीट' },
  'No Results': { en:'No Results', id:'Tidak Ada Hasil', ms:'Tiada Hasil', ja:'結果なし', zh:'无结果', ar:'لا توجد نتائج', tl:'Walang Resulta', th:'ไม่พบผลลัพธ์', vi:'Không có kết quả', ko:'결과 없음', es:'Sin resultados', pt:'Sem resultados', ru:'Нет результатов', tr:'Sonuç yok', hi:'कोई परिणाम नहीं' },
  'No Data': { en:'No Data', id:'Tidak Ada Data', ms:'Tiada Data', ja:'データなし', zh:'暂无数据', ar:'لا توجد بيانات', tl:'Walang Data', th:'ไม่มีข้อมูล', vi:'Không có dữ liệu', ko:'데이터 없음', es:'Sin datos', pt:'Sem dados', ru:'Нет данных', tr:'Veri yok', hi:'कोई डेटा नहीं' },
  'Search': { en:'Search', id:'Cari', ms:'Cari', ja:'検索', zh:'搜索', ar:'بحث', tl:'Maghanap', th:'ค้นหา', vi:'Tìm kiếm', ko:'검색', es:'Buscar', pt:'Pesquisar', ru:'Поиск', tr:'Ara', hi:'खोजें' },
  'Close': { en:'Close', id:'Tutup', ms:'Tutup', ja:'閉じる', zh:'关闭', ar:'إغلاق', tl:'Isara', th:'ปิด', vi:'Đóng', ko:'닫기', es:'Cerrar', pt:'Fechar', ru:'Закрыть', tr:'Kapat', hi:'बंद करें' },
  'Cancel': { en:'Cancel', id:'Batal', ms:'Batal', ja:'キャンセル', zh:'取消', ar:'إلغاء', tl:'Kanselahin', th:'ยกเลิก', vi:'Hủy', ko:'취소', es:'Cancelar', pt:'Cancelar', ru:'Отмена', tr:'İptal', hi:'रद्द करें' },
  'Confirm': { en:'Confirm', id:'Konfirmasi', ms:'Sahkan', ja:'確認', zh:'确认', ar:'تأكيد', tl:'Kumpirmahin', th:'ยืนยัน', vi:'Xác nhận', ko:'확인', es:'Confirmar', pt:'Confirmar', ru:'Подтвердить', tr:'Onayla', hi:'पुष्टि करें' },
  'Save': { en:'Save', id:'Simpan', ms:'Simpan', ja:'保存', zh:'保存', ar:'حفظ', tl:'I-save', th:'บันทึก', vi:'Lưu', ko:'저장', es:'Guardar', pt:'Salvar', ru:'Сохранить', tr:'Kaydet', hi:'सहेजें' },
  'Delete': { en:'Delete', id:'Hapus', ms:'Padam', ja:'削除', zh:'删除', ar:'حذف', tl:'Tanggalin', th:'ลบ', vi:'Xóa', ko:'삭제', es:'Eliminar', pt:'Excluir', ru:'Удалить', tr:'Sil', hi:'हटाएं' },
  'Reset': { en:'Reset', id:'Reset', ms:'Tetapkan Semula', ja:'リセット', zh:'重置', ar:'إعادة تعيين', tl:'I-reset', th:'รีเซ็ต', vi:'Đặt lại', ko:'초기화', es:'Restablecer', pt:'Redefinir', ru:'Сбросить', tr:'Sıfırla', hi:'रीसेट' },
  'Copy': { en:'Copy', id:'Salin', ms:'Salin', ja:'コピー', zh:'复制', ar:'نسخ', tl:'Kopyahin', th:'คัดลอก', vi:'Sao chép', ko:'복사', es:'Copiar', pt:'Copiar', ru:'Копировать', tr:'Kopyala', hi:'कॉपी' },
  'Share': { en:'Share', id:'Bagikan', ms:'Kongsi', ja:'共有', zh:'分享', ar:'مشاركة', tl:'Ibahagi', th:'แชร์', vi:'Chia sẻ', ko:'공유', es:'Compartir', pt:'Compartilhar', ru:'Поделиться', tr:'Paylaş', hi:'साझा करें' },
  'Start': { en:'Start', id:'Mulai', ms:'Mula', ja:'開始', zh:'开始', ar:'بدء', tl:'Simulan', th:'เริ่ม', vi:'Bắt đầu', ko:'시작', es:'Iniciar', pt:'Iniciar', ru:'Начать', tr:'Başlat', hi:'शुरू करें' },
  'Stop': { en:'Stop', id:'Berhenti', ms:'Berhenti', ja:'停止', zh:'停止', ar:'إيقاف', tl:'Itigil', th:'หยุด', vi:'Dừng', ko:'중지', es:'중지', pt:'Parar', ru:'Остановить', tr:'Durdur', hi:'रोकें' },
  'Play': { en:'Play', id:'Mainkan', ms:'Main', ja:'再生', zh:'播放', ar:'تشغيل', tl:'I-play', th:'เล่น', vi:'Phát', ko:'재생', es:'Reproducir', pt:'Reproduzir', ru:'Воспроизвести', tr:'Oynat', hi:'चलाएँ' },
  'Pause': { en:'Pause', id:'Jeda', ms:'Jeda', ja:'一時停止', zh:'暂停', ar:'إيقاف مؤقت', tl:'I-pause', th:'หยุดชั่วคราว', vi:'Tạm dừng', ko:'일시정지', es:'Pausar', pt:'Pausar', ru:'Пауза', tr:'Duraklat', hi:'रोकें' },
  'Spin': { en:'Spin', id:'Putar', ms:'Pusing', ja:'回す', zh:'旋转', ar:'تدوير', tl:'Paikutin', th:'หมุน', vi:'Quay', ko:'돌리기', es:'Girar', pt:'Girar', ru:'Крутить', tr:'Çevir', hi:'घुमाएँ' },
  'Claim': { en:'Claim', id:'Klaim', ms:'Tuntut', ja:'受け取る', zh:'领取', ar:'استلام', tl:'Kunin', th:'รับรางวัล', vi:'Nhận', ko:'수령', es:'Reclamar', pt:'Resgatar', ru:'Получить', tr:'Talep et', hi:'प्राप्त करें' },
  'Amount': { en:'Amount', id:'Jumlah', ms:'Jumlah', ja:'金額', zh:'金额', ar:'المبلغ', tl:'Halaga', th:'จำนวนเงิน', vi:'Số tiền', ko:'금액', es:'Cantidad', pt:'Valor', ru:'Сумма', tr:'Tutar', hi:'राशि' },
  'Duration': { en:'Duration', id:'Durasi', ms:'Tempoh', ja:'期間', zh:'时长', ar:'المدة', tl:'Tagal', th:'ระยะเวลา', vi:'Thời lượng', ko:'기간', es:'Duración', pt:'Duração', ru:'Длительность', tr:'Süre', hi:'अवधि' },

  'Select your country to automatically change display language and prize currency.': { en:'Select your country to automatically change display language and prize currency.', id:'Pilih negara Anda untuk otomatis mengubah bahasa tampilan dan mata uang hadiah.', ms:'Pilih negara anda untuk menukar bahasa paparan dan mata wang hadiah secara automatik.', ja:'国を選択すると表示言語と賞金通貨が自動的に切り替わります。', zh:'选择国家将自动切换显示语言和奖励货币。', ar:'اختر بلدك لتغيير لغة العرض وعملة الجائزة تلقائيًا.', tl:'Piliin ang iyong bansa upang awtomatikong baguhin ang wika at currency ng premyo.', th:'เลือกประเทศของคุณเพื่อเปลี่ยนภาษาที่แสดงและสกุลเงินรางวัลโดยอัตโนมัติ', vi:'Chọn quốc gia để tự động thay đổi ngôn ngữ hiển thị và tiền tệ giải thưởng.', ko:'국가를 선택하면 표시 언어와 상금 통화가 자동으로 변경됩니다.', es:'Selecciona tu país para cambiar automáticamente el idioma de visualización y la moneda de los premios.', pt:'Selecione seu país para alterar automaticamente o idioma de exibição e a moeda dos prêmios.', ru:'Выберите страну, чтобы автоматически изменить язык интерфейса и валюту призов.', tr:'Görüntüleme dilini ve ödül para birimini otomatik değiştirmek için ülkenizi seçin.', hi:'प्रदर्शित भाषा और पुरस्कार मुद्रा को स्वचालित रूप से बदलने के लिए अपना देश चुनें।' },
  'Search country, language, or currency (USD, EUR, GBP, JPY)...': { en:'Search country, language, or currency (USD, EUR, GBP, JPY)...', id:'Cari negara, bahasa, atau mata uang (USD, EUR, GBP, JPY)...', ms:'Cari negara, bahasa atau mata wang (USD, EUR, GBP, JPY)...', ja:'国、言語、通貨を検索 (USD, EUR, GBP, JPY)...', zh:'搜索国家、语言或货币（USD、EUR、GBP、JPY）...', ar:'ابحث عن الدولة أو اللغة أو العملة (USD، EUR، GBP، JPY)...', tl:'Maghanap ng bansa, wika, o currency (USD, EUR, GBP, JPY)...', th:'ค้นหาประเทศ ภาษา หรือสกุลเงิน (USD, EUR, GBP, JPY)...', vi:'Tìm quốc gia, ngôn ngữ hoặc tiền tệ (USD, EUR, GBP, JPY)...', ko:'국가, 언어 또는 통화 검색 (USD, EUR, GBP, JPY)...', es:'Buscar país, idioma o moneda (USD, EUR, GBP, JPY)...', pt:'Pesquisar país, idioma ou moeda (USD, EUR, GBP, JPY)...', ru:'Поиск страны, языка или валюты (USD, EUR, GBP, JPY)...', tr:'Ülke, dil veya para birimi ara (USD, EUR, GBP, JPY)...', hi:'देश, भाषा या मुद्रा खोजें (USD, EUR, GBP, JPY)...' },
  'EVM Crypto Payment': { en:'EVM Crypto Payment', id:'Pembayaran Kripto EVM', ms:'Pembayaran Kripto EVM', ja:'EVM暗号資産決済', zh:'EVM 加密货币支付', ar:'دفع العملات المشفرة عبر EVM', tl:'EVM Crypto Payment', th:'ชำระเงินคริปโต EVM', vi:'Thanh toán crypto EVM', ko:'EVM 암호화폐 결제', es:'Pago cripto EVM', pt:'Pagamento cripto EVM', ru:'Криптоплатёж EVM', tr:'EVM kripto ödemesi', hi:'EVM क्रिप्टो भुगतान' },
  'Official Static QRIS (GPN)': { en:'Official Static QRIS (GPN)', id:'QRIS Statis Resmi (GPN)', ms:'QRIS Statik Rasmi (GPN)', ja:'公式静的QRIS（GPN）', zh:'官方静态 QRIS（GPN）', ar:'QRIS ثابت رسمي (GPN)', tl:'Opisyal na Static QRIS (GPN)', th:'QRIS แบบคงที่อย่างเป็นทางการ (GPN)', vi:'QRIS tĩnh chính thức (GPN)', ko:'공식 정적 QRIS (GPN)', es:'QRIS estático oficial (GPN)', pt:'QRIS estático oficial (GPN)', ru:'Официальный статический QRIS (GPN)', tr:'Resmi statik QRIS (GPN)', hi:'आधिकारिक स्टैटिक QRIS (GPN)' },
  'Copy Address': { en:'Copy Address', id:'Salin Alamat', ms:'Salin Alamat', ja:'アドレスをコピー', zh:'复制地址', ar:'نسخ العنوان', tl:'Kopyahin ang Address', th:'คัดลอกที่อยู่', vi:'Sao chép địa chỉ', ko:'주소 복사', es:'Copiar dirección', pt:'Copiar endereço', ru:'Скопировать адрес', tr:'Adresi kopyala', hi:'पता कॉपी करें' },
  'Copied!': { en:'Copied!', id:'Berhasil Disalin!', ms:'Berjaya disalin!', ja:'コピーしました！', zh:'已复制！', ar:'تم النسخ!', tl:'Nakopya!', th:'คัดลอกแล้ว!', vi:'Đã sao chép!', ko:'복사됨!', es:'¡Copiado!', pt:'Copiado!', ru:'Скопировано!', tr:'Kopyalandı!', hi:'कॉपी हो गया!' },
  'Enter Transaction Hash (TxID) after payment': { en:'Enter Transaction Hash (TxID) after payment', id:'Masukkan Transaction Hash (TxID) setelah pembayaran', ms:'Masukkan Transaction Hash (TxID) selepas pembayaran', ja:'支払い後にトランザクションハッシュ（TxID）を入力', zh:'付款后输入交易哈希（TxID）', ar:'أدخل هاش المعاملة (TxID) بعد الدفع', tl:'Ilagay ang Transaction Hash (TxID) pagkatapos magbayad', th:'ป้อน Transaction Hash (TxID) หลังชำระเงิน', vi:'Nhập Transaction Hash (TxID) sau khi thanh toán', ko:'결제 후 트랜잭션 해시(TxID)를 입력하세요', es:'Introduce el hash de transacción (TxID) después del pago', pt:'Digite o hash da transação (TxID) após o pagamento', ru:'Введите хеш транзакции (TxID) после оплаты', tr:'Ödemeden sonra işlem hashini (TxID) girin', hi:'भुगतान के बाद Transaction Hash (TxID) दर्ज करें' },
  'Confirm & Activate Plan': { en:'Confirm & Activate Plan', id:'Konfirmasi & Aktifkan Paket', ms:'Sahkan & Aktifkan Pelan', ja:'確認してプランを有効化', zh:'确认并激活套餐', ar:'تأكيد وتفعيل الخطة', tl:'Kumpirmahin at I-activate ang Plan', th:'ยืนยันและเปิดใช้งานแพ็กเกจ', vi:'Xác nhận & kích hoạt gói', ko:'확인 및 플랜 활성화', es:'Confirmar y activar plan', pt:'Confirmar e ativar plano', ru:'Подтвердить и активировать план', tr:'Planı onayla ve etkinleştir', hi:'पुष्टि करें और प्लान सक्रिय करें' },
  'Open any supported QRIS e-wallet or banking app, then scan the code above.': { en:'Open any supported QRIS e-wallet or banking app, then scan the code above.', id:'Buka e-wallet atau aplikasi perbankan QRIS yang didukung, lalu pindai kode di atas.', ms:'Buka e-dompet atau aplikasi perbankan QRIS yang disokong, kemudian imbas kod di atas.', ja:'対応するQRISウォレットまたは銀行アプリを開き、上のコードをスキャンしてください。', zh:'打开支持 QRIS 的电子钱包或银行应用，然后扫描上方二维码。', ar:'افتح أي محفظة إلكترونية أو تطبيق مصرفي يدعم QRIS ثم امسح الرمز أعلاه.', tl:'Buksan ang anumang suportadong QRIS e-wallet o banking app, pagkatapos ay i-scan ang code sa itaas.', th:'เปิด e-wallet หรือแอปธนาคารที่รองรับ QRIS แล้วสแกนโค้ดด้านบน', vi:'Mở ví điện tử hoặc ứng dụng ngân hàng hỗ trợ QRIS rồi quét mã ở trên.', ko:'지원되는 QRIS 전자지갑 또는 뱅킹 앱을 열고 위 코드를 스캔하세요.', es:'Abre una billetera electrónica o app bancaria compatible con QRIS y escanea el código de arriba.', pt:'Abra uma carteira digital ou app bancário compatível com QRIS e escaneie o código acima.', ru:'Откройте поддерживаемый QRIS-кошелёк или банковское приложение и отсканируйте код выше.', tr:'Desteklenen bir QRIS e-cüzdanı veya bankacılık uygulamasını açıp yukarıdaki kodu tarayın.', hi:'किसी समर्थित QRIS ई-वॉलेट या बैंकिंग ऐप को खोलें और ऊपर दिए गए कोड को स्कैन करें।' },
  'CORRECT! (V)': { en:'CORRECT! (V)', id:'BENAR! (V)', ms:'BETUL! (V)', ja:'正解！ (V)', zh:'正确！(V)', ar:'صحيح! (V)', tl:'TAMA! (V)', th:'ถูกต้อง! (V)', vi:'CHÍNH XÁC! (V)', ko:'정답! (V)', es:'¡CORRECTO! (V)', pt:'CORRETO! (V)', ru:'ПРАВИЛЬНО! (V)', tr:'DOĞRU! (V)', hi:'सही! (V)' },
  'HINT (B)': { en:'HINT (B)', id:'PETUNJUK (B)', ms:'PETUNJUK (B)', ja:'ヒント (B)', zh:'提示 (B)', ar:'تلميح (B)', tl:'PAHIWATIG (B)', th:'คำใบ้ (B)', vi:'GỢI Ý (B)', ko:'힌트 (B)', es:'PISTA (B)', pt:'DICA (B)', ru:'ПОДСКАЗКА (B)', tr:'İPUCU (B)', hi:'संकेत (B)' },
  'SKIP': { en:'SKIP', id:'LEWATI', ms:'LANGKAU', ja:'スキップ', zh:'跳过', ar:'تخطي', tl:'LUMAKTAWAN', th:'ข้าม', vi:'BỎ QUA', ko:'건너뛰기', es:'SALTAR', pt:'PULAR', ru:'ПРОПУСТИТЬ', tr:'ATLA', hi:'छोड़ें' },
  'SHUFFLE SERIAL (A)': { en:'SHUFFLE SERIAL (A)', id:'ACAK NOMOR SERI (A)', ms:'KOCOK NOMBOR SIRI (A)', ja:'シリアルをシャッフル (A)', zh:'随机打乱序列号 (A)', ar:'خلط الرقم التسلسلي (A)', tl:'I-shuffle ang Serial (A)', th:'สุ่มซีเรียล (A)', vi:'XÁO TRỘN SỐ SÊ-RI (A)', ko:'일련번호 섞기 (A)', es:'MEZCLAR SERIE (A)', pt:'EMBARALHAR SÉRIE (A)', ru:'ПЕРЕМЕШАТЬ СЕРИЙНЫЙ НОМЕР (A)', tr:'SERİYİ KARIŞTIR (A)', hi:'सीरियल शफल करें (A)' },
  'Zoom': { en:'Zoom', id:'Perbesar', ms:'Zum', ja:'ズーム', zh:'缩放', ar:'تكبير', tl:'I-zoom', th:'ซูม', vi:'Thu phóng', ko:'확대/축소', es:'Zoom', pt:'Zoom', ru:'Масштаб', tr:'Yakınlaştır', hi:'ज़ूम' },
  'SCORE': { en:'SCORE', id:'SKOR', ms:'SKOR', ja:'スコア', zh:'得分', ar:'النتيجة', tl:'ISKOR', th:'คะแนน', vi:'ĐIỂM', ko:'점수', es:'PUNTUACIÓN', pt:'PONTUAÇÃO', ru:'СЧЁТ', tr:'SKOR', hi:'स्कोर' },
  'SERIAL NO': { en:'SERIAL NO', id:'NO. SERI', ms:'NO. SIRI', ja:'シリアル番号', zh:'序列号', ar:'الرقم التسلسلي', tl:'SERIAL NO', th:'หมายเลขซีเรียล', vi:'SỐ SÊ-RI', ko:'일련번호', es:'N.º DE SERIE', pt:'Nº DE SÉRIE', ru:'СЕРИЙНЫЙ НОМЕР', tr:'SERİ NO', hi:'सीरियल नंबर' },
  'REVEALED!': { en:'REVEALED!', id:'TERUNGKAP!', ms:'DIDEDAHKAN!', ja:'公開！', zh:'已揭晓！', ar:'تم الكشف!', tl:'NAIBUNYAG!', th:'เปิดเผยแล้ว!', vi:'ĐÃ TIẾT LỘ!', ko:'공개됨!', es:'¡REVELADO!', pt:'REVELADO!', ru:'РАСКРЫТО!', tr:'AÇIKLANDI!', hi:'खुलासा!' },
  'UNIQUE RANDOM': { en:'UNIQUE RANDOM', id:'ACAK UNIK', ms:'RAWAK UNIK', ja:'ユニークランダム', zh:'独特随机', ar:'عشوائي فريد', tl:'NATATANGING RANDOM', th:'สุ่มแบบไม่ซ้ำ', vi:'NGẪU NHIÊN ĐỘC NHẤT', ko:'고유 랜덤', es:'ALEATORIO ÚNICO', pt:'ALEATÓRIO ÚNICO', ru:'УНИКАЛЬНЫЙ СЛУЧАЙНЫЙ', tr:'BENZERSİZ RASTGELE', hi:'विशिष्ट रैंडम' },
  'LEVEL': { en:'LEVEL', id:'LEVEL', ms:'TAHAP', ja:'レベル', zh:'等级', ar:'المستوى', tl:'LEVEL', th:'ระดับ', vi:'CẤP ĐỘ', ko:'레벨', es:'NIVEL', pt:'NÍVEL', ru:'УРОВЕНЬ', tr:'SEVİYE', hi:'स्तर' },
  'HIDE': { en:'HIDE', id:'SEMBUNYIKAN', ms:'SEMBUNYIKAN', ja:'非表示', zh:'隐藏', ar:'إخفاء', tl:'ITAGO', th:'ซ่อน', vi:'ẨN', ko:'숨기기', es:'OCULTAR', pt:'OCULTAR', ru:'СКРЫТЬ', tr:'GİZLE', hi:'छिपाएँ' },
  'Timer': { en:'Timer', id:'Timer', ms:'Pemasa', ja:'タイマー', zh:'计时器', ar:'المؤقت', tl:'Timer', th:'ตัวจับเวลา', vi:'Hẹn giờ', ko:'타이머', es:'Temporizador', pt:'Temporizador', ru:'Таймер', tr:'Zamanlayıcı', hi:'टाइमर' },
  'SPIN WHEEL': { en:'SPIN WHEEL', id:'PUTAR RODA', ms:'PUSING RODA', ja:'ホイールを回す', zh:'旋转转盘', ar:'أدر العجلة', tl:'PAIKUTIN ANG GULONG', th:'หมุนวงล้อ', vi:'QUAY VÒNG QUAY', ko:'휠 돌리기', es:'GIRAR RULETA', pt:'GIRAR RODA', ru:'КРУТИТЬ КОЛЕСО', tr:'ÇARKI ÇEVİR', hi:'व्हील घुमाएँ' },
  'STOP NOW': { en:'STOP NOW', id:'HENTIKAN SEKARANG', ms:'BERHENTI SEKARANG', ja:'今すぐ停止', zh:'立即停止', ar:'توقف الآن', tl:'HUMINTO NGAYON', th:'หยุดทันที', vi:'DỪNG NGAY', ko:'지금 중지', es:'DETENER AHORA', pt:'PARAR AGORA', ru:'ОСТАНОВИТЬ СЕЙЧАС', tr:'ŞİMDİ DURDUR', hi:'अभी रोकें' },
  'From Score': { en:'From Score', id:'Dari Skor', ms:'Daripada Skor', ja:'スコアから', zh:'按分数', ar:'من النتيجة', tl:'Mula sa Score', th:'จากคะแนน', vi:'Từ điểm', ko:'점수 기준', es:'Por puntuación', pt:'Por pontuação', ru:'По счёту', tr:'Skordan', hi:'स्कोर से' },
  'Paste Bulk': { en:'Paste Bulk', id:'Tempel Massal', ms:'Tampal Pukal', ja:'一括貼り付け', zh:'批量粘贴', ar:'لصق جماعي', tl:'I-paste nang maramihan', th:'วางแบบกลุ่ม', vi:'Dán hàng loạt', ko:'일괄 붙여넣기', es:'Pegar en bloque', pt:'Colar em massa', ru:'Массовая вставка', tr:'Toplu yapıştır', hi:'बल्क पेस्ट' },
  'Live Challenge': { en:'Live Challenge', id:'Tantangan Live', ms:'Cabaran Langsung', ja:'ライブチャレンジ', zh:'直播挑战', ar:'تحدي مباشر', tl:'Live Challenge', th:'ชาเลนจ์ไลฟ์', vi:'Thử thách trực tiếp', ko:'라이브 챌린지', es:'Desafío en vivo', pt:'Desafio ao vivo', ru:'Прямой эфир — испытание', tr:'Canlı meydan okuması', hi:'लाइव चुनौती' },
  'Add': { en:'Add', id:'Tambah', ms:'Tambah', ja:'追加', zh:'添加', ar:'إضافة', tl:'Idagdag', th:'เพิ่ม', vi:'Thêm', ko:'추가', es:'Añadir', pt:'Adicionar', ru:'Добавить', tr:'Ekle', hi:'जोड़ें' },
  'LUCKY WINNER!': { en:'LUCKY WINNER!', id:'PEMENANG BERUNTUNG!', ms:'PEMENANG BERTUAH!', ja:'ラッキーチャンピオン！', zh:'幸运赢家！', ar:'الفائز المحظوظ!', tl:'MASUWERTENG NANALO!', th:'ผู้โชคดี!', vi:'NGƯỜI CHIẾN THẮNG MAY MẮN!', ko:'행운의 당첨자!', es:'¡GANADOR AFORTUNADO!', pt:'VENCEDOR SORTUDO!', ru:'СЧАСТЛИВЫЙ ПОБЕДИТЕЛЬ!', tr:'ŞANSLI KAZANAN!', hi:'भाग्यशाली विजेता!' },
  'Award Prize': { en:'Award Prize', id:'Berikan Hadiah', ms:'Berikan Hadiah', ja:'賞金を付与', zh:'发放奖品', ar:'منح الجائزة', tl:'Ibigay ang Premyo', th:'มอบรางวัล', vi:'Trao giải thưởng', ko:'상금 지급', es:'Otorgar premio', pt:'Conceder prêmio', ru:'Выдать приз', tr:'Ödülü ver', hi:'पुरस्कार दें' },
  'Remove Winner': { en:'Remove Winner', id:'Hapus Pemenang', ms:'Alih Keluar Pemenang', ja:'当選者を削除', zh:'移除赢家', ar:'إزالة الفائز', tl:'Alisin ang Nanalo', th:'ลบผู้ชนะ', vi:'Xóa người chiến thắng', ko:'당첨자 제거', es:'Eliminar ganador', pt:'Remover vencedor', ru:'Удалить победителя', tr:'Kazananı kaldır', hi:'विजेता हटाएँ' },
  'SPINNING': { en:'SPINNING', id:'BERPUTAR', ms:'BERPUSING', ja:'回転中', zh:'旋转中', ar:'يدور', tl:'UMIINOG', th:'กำลังหมุน', vi:'ĐANG QUAY', ko:'회전 중', es:'GIRANDO', pt:'GIRANDO', ru:'ВРАЩЕНИЕ', tr:'DÖNÜYOR', hi:'घूम रहा है' },
  'TikTok Live': { en:'TikTok Live', id:'TikTok Live', ms:'TikTok Live', ja:'TikTok Live', zh:'TikTok 直播', ar:'TikTok مباشر', tl:'TikTok Live', th:'TikTok Live', vi:'TikTok Live', ko:'TikTok Live', es:'TikTok Live', pt:'TikTok Live', ru:'TikTok Live', tr:'TikTok Live', hi:'TikTok Live' },
  'Shopee Live': { en:'Shopee Live', id:'Shopee Live', ms:'Shopee Live', ja:'Shopee Live', zh:'Shopee 直播', ar:'Shopee مباشر', tl:'Shopee Live', th:'Shopee Live', vi:'Shopee Live', ko:'Shopee Live', es:'Shopee Live', pt:'Shopee Live', ru:'Shopee Live', tr:'Shopee Live', hi:'Shopee Live' },
  'Winner Fanfare': { en:'Winner Fanfare', id:'Musik Kemenangan', ms:'Fanfare Kemenangan', ja:'勝者ファンファーレ', zh:'胜利号角', ar:'موسيقى فوز', tl:'Fanfare ng Panalo', th:'เสียงประกาศชัยชนะ', vi:'Nhạc chiến thắng', ko:'승자 팡파르', es:'Fanfarria del ganador', pt:'Fanfarra do vencedor', ru:'Фанфара победителя', tr:'Kazanan fanfarı', hi:'विजेता फैनफेयर' },
  'Boss Enrage Alert': { en:'Boss Enrage Alert', id:'Peringatan Boss Mengamuk', ms:'Amaran Boss Mengamuk', ja:'ボス激怒アラート', zh:'Boss 狂暴警报', ar:'تنبيه غضب الزعيم', tl:'Babala ng Galit na Boss', th:'แจ้งเตือนบอสคลั่ง', vi:'Cảnh báo boss nổi giận', ko:'보스 분노 알림', es:'Alerta de enfurecimiento del jefe', pt:'Alerta de fúria do chefe', ru:'Оповещение о ярости босса', tr:'Boss öfke uyarısı', hi:'बॉस एनरेज अलर्ट' },
  'Drumroll Suspense': { en:'Drumroll Suspense', id:'Tegang Drumroll', ms:'Debaran Drumroll', ja:'ドラムロールの緊張感', zh:'鼓点悬念', ar:'تشويق قرع الطبول', tl:'Nakakakabang Drumroll', th:'เสียงกลองลุ้นระทึก', vi:'Trống hồi hộp', ko:'긴장감 있는 드럼롤', es:'Redoble de suspenso', pt:'Rufar de suspense', ru:'Напряжённая барабанная дробь', tr:'Gerilim davul sesi', hi:'रोमांचक ड्रमरोल' },
  'Wheel Spin Sound': { en:'Wheel Spin Sound', id:'Suara Putaran Roda', ms:'Bunyi Pusingan Roda', ja:'ホイール回転音', zh:'转盘旋转音效', ar:'صوت دوران العجلة', tl:'Tunog ng Pag-ikot ng Gulong', th:'เสียงหมุนวงล้อ', vi:'Âm thanh quay vòng', ko:'휠 회전음', es:'Sonido de giro de rueda', pt:'Som da roleta girando', ru:'Звук вращения колеса', tr:'Çark dönüş sesi', hi:'व्हील घूमने की ध्वनि' },
  'HOST': { en:'HOST', id:'HOST', ms:'HOS', ja:'ホスト', zh:'主播', ar:'المضيف', tl:'HOST', th:'โฮสต์', vi:'HOST', ko:'호스트', es:'ANFITRIÓN', pt:'APRESENTADOR', ru:'ВЕДУЩИЙ', tr:'SUNUCU', hi:'होस्ट' },
  'Host Streamer (You)': { en:'Host Streamer (You)', id:'Host Streamer (Anda)', ms:'Hos Strim (Anda)', ja:'ホストストリーマー（あなた）', zh:'主播（你）', ar:'مضيف البث (أنت)', tl:'Host Streamer (Ikaw)', th:'สตรีมเมอร์โฮสต์ (คุณ)', vi:'Host streamer (Bạn)', ko:'호스트 스트리머 (나)', es:'Streamer anfitrión (tú)', pt:'Streamer anfitrião (você)', ru:'Ведущий-стример (вы)', tr:'Yayıncı sunucu (Siz)', hi:'होस्ट स्ट्रीमर (आप)' },
  'Owner Admin Panel': { en:'Owner Admin Panel', id:'Panel Admin Owner', ms:'Panel Admin Pemilik', ja:'オーナー管理パネル', zh:'所有者管理面板', ar:'لوحة إدارة المالك', tl:'Admin Panel ng May-ari', th:'แผงผู้ดูแลเจ้าของ', vi:'Bảng quản trị chủ sở hữu', ko:'소유자 관리자 패널', es:'Panel de administración del propietario', pt:'Painel administrativo do proprietário', ru:'Панель администратора владельца', tr:'Sahip yönetici paneli', hi:'ओनर एडमिन पैनल' }
};

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
  'Add viewer name / @username...': { en: 'Add viewer name / @username...', id: 'Tambah nama penonton / @username...', ms: 'Tambah nama penonton / @username...', ja: '視聴者名 / @ユーザー名を追加...', zh: '添加观众姓名 / @用户名...', ar: 'أضف اسم المشاهد / @اسم المستخدم...', tl: 'Magdagdag ng pangalan / @username...', th: 'เพิ่มชื่อผู้ชม / @username...', vi: 'Thêm tên người xem / @username...', ko: '시청자 이름 / @username 추가...', es: 'Añadir nombre del espectador / @username...', pt: 'Adicionar nome do espectador / @username...', ru: 'Добавить имя зрителя / @username...', tr: 'İzleyici adı / @username ekle...', hi: 'दर्शक का नाम / @username जोड़ें...' },
  'Blind Box 3D': { en: 'Blind Box 3D', id: 'Blind Box 3D', ms: 'Blind Box 3D', ja: 'ブラインドボックス 3D', zh: '盲盒 3D', ar: 'الصندوق الغامض 3D', tl: 'Blind Box 3D', th: 'Blind Box 3D', vi: 'Blind Box 3D', ko: '블라인드 박스 3D', es: 'Blind Box 3D', pt: 'Blind Box 3D', ru: 'Blind Box 3D', tr: 'Blind Box 3D', hi: 'ब्लाइंड बॉक्स 3D' },
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


const LEGACY_ADMIN_TRANSLATIONS: Record<string, Record<string, string>> = {
  'Total User': {en:'Total Users',id:'Total Pengguna',ms:'Jumlah Pengguna',ja:'総ユーザー数',zh:'用户总数',ar:'إجمالي المستخدمين',tl:'Kabuuang User',th:'ผู้ใช้ทั้งหมด',vi:'Tổng người dùng',ko:'총 사용자',es:'Usuarios totales',pt:'Total de usuários',ru:'Всего пользователей',tr:'Toplam kullanıcı',hi:'कुल उपयोगकर्ता'},
  'Saldo Terbuka': {en:'Available Balance',id:'Saldo Terbuka',ms:'Baki Tersedia',ja:'利用可能残高',zh:'可用余额',ar:'الرصيد المتاح',tl:'Available na Balanse',th:'ยอดคงเหลือที่ใช้ได้',vi:'Số dư khả dụng',ko:'사용 가능 잔액',es:'Saldo disponible',pt:'Saldo disponível',ru:'Доступный баланс',tr:'Kullanılabilir bakiye',hi:'उपलब्ध शेष राशि'},
  'Saldo Terkunci': {en:'Locked Balance',id:'Saldo Terkunci',ms:'Baki Dikunci',ja:'ロック残高',zh:'锁定余额',ar:'الرصيد المقفل',tl:'Naka-lock na Balanse',th:'ยอดคงเหลือที่ล็อก',vi:'Số dư đã khóa',ko:'잠긴 잔액',es:'Saldo bloqueado',pt:'Saldo bloqueado',ru:'Заблокированный баланс',tr:'Kilitli bakiye',hi:'लॉक्ड बैलेंस'},
  'Total Saldo System': {en:'Total System Balance',id:'Total Saldo Sistem',ms:'Jumlah Baki Sistem',ja:'システム残高合計',zh:'系统总余额',ar:'إجمالي رصيد النظام',tl:'Kabuuang Balanse ng System',th:'ยอดคงเหลือระบบทั้งหมด',vi:'Tổng số dư hệ thống',ko:'시스템 총 잔액',es:'Saldo total del sistema',pt:'Saldo total do sistema',ru:'Общий баланс системы',tr:'Toplam sistem bakiyesi',hi:'कुल सिस्टम बैलेंस'},
  'Jackpot Pool': {en:'Jackpot Pool',id:'Pool Jackpot',ms:'Pool Jackpot',ja:'ジャックポットプール',zh:'大奖池',ar:'مجمع الجاكبوت',tl:'Jackpot Pool',th:'กองแจ็กพอต',vi:'Quỹ jackpot',ko:'잭팟 풀',es:'Fondo del jackpot',pt:'Fundo do jackpot',ru:'Пул джекпота',tr:'Jackpot havuzu',hi:'जैकपॉट पूल'},
  'Notifikasi': {en:'Notifications',id:'Notifikasi',ms:'Pemberitahuan',ja:'通知',zh:'通知',ar:'الإشعارات',tl:'Mga Notification',th:'การแจ้งเตือน',vi:'Thông báo',ko:'알림',es:'Notificaciones',pt:'Notificações',ru:'Уведомления',tr:'Bildirimler',hi:'सूचनाएं'},
  'Pengelolaan Akun & Admin': {en:'Account & Admin Management',id:'Pengelolaan Akun & Admin',ms:'Pengurusan Akaun & Admin',ja:'アカウントと管理者の管理',zh:'账户与管理员管理',ar:'إدارة الحسابات والمسؤولين',tl:'Pamamahala ng Account at Admin',th:'การจัดการบัญชีและผู้ดูแล',vi:'Quản lý tài khoản & quản trị viên',ko:'계정 및 관리자 관리',es:'Gestión de cuentas y administradores',pt:'Gerenciamento de contas e administradores',ru:'Управление аккаунтами и администраторами',tr:'Hesap ve yönetici yönetimi',hi:'खाता और व्यवस्थापक प्रबंधन'},
  'Deposit User': {en:'User Deposits',id:'Deposit User',ms:'Deposit Pengguna',ja:'ユーザー入金',zh:'用户充值',ar:'إيداعات المستخدمين',tl:'Mga Deposit ng User',th:'การฝากของผู้ใช้',vi:'Tiền nạp của người dùng',ko:'사용자 입금',es:'Depósitos de usuarios',pt:'Depósitos de usuários',ru:'Пополнения пользователей',tr:'Kullanıcı yatırımları',hi:'उपयोगकर्ता जमा'},
  'Penarikan (WD)': {en:'Withdrawals (WD)',id:'Penarikan (WD)',ms:'Pengeluaran (WD)',ja:'出金 (WD)',zh:'提现 (WD)',ar:'عمليات السحب (WD)',tl:'Withdrawals (WD)',th:'การถอน (WD)',vi:'Rút tiền (WD)',ko:'출금 (WD)',es:'Retiros (WD)',pt:'Saques (WD)',ru:'Вывод средств (WD)',tr:'Para çekme (WD)',hi:'निकासी (WD)'},
  'Semua Aktifitas User': {en:'All User Activity',id:'Semua Aktivitas User',ms:'Semua Aktiviti Pengguna',ja:'すべてのユーザーアクティビティ',zh:'所有用户活动',ar:'كل أنشطة المستخدمين',tl:'Lahat ng Aktibidad ng User',th:'กิจกรรมผู้ใช้ทั้งหมด',vi:'Tất cả hoạt động người dùng',ko:'모든 사용자 활동',es:'Toda la actividad de usuarios',pt:'Todas as atividades dos usuários',ru:'Вся активность пользователей',tr:'Tüm kullanıcı etkinlikleri',hi:'सभी उपयोगकर्ता गतिविधियां'},
  'Tidak Ada Notifikasi': {en:'No Notifications',id:'Tidak Ada Notifikasi',ms:'Tiada Pemberitahuan',ja:'通知なし',zh:'没有通知',ar:'لا توجد إشعارات',tl:'Walang Notification',th:'ไม่มีการแจ้งเตือน',vi:'Không có thông báo',ko:'알림 없음',es:'Sin notificaciones',pt:'Sem notificações',ru:'Нет уведомлений',tr:'Bildirim yok',hi:'कोई सूचना नहीं'},
  'Tinjau Sekarang': {en:'Review Now',id:'Tinjau Sekarang',ms:'Semak Sekarang',ja:'今すぐ確認',zh:'立即查看',ar:'راجع الآن',tl:'Suriin Ngayon',th:'ตรวจสอบตอนนี้',vi:'Xem xét ngay',ko:'지금 검토',es:'Revisar ahora',pt:'Revisar agora',ru:'Проверить сейчас',tr:'Şimdi incele',hi:'अभी समीक्षा करें'},
  'Daftar Akun Administrator': {en:'Administrator Accounts',id:'Daftar Akun Administrator',ms:'Senarai Akaun Pentadbir',ja:'管理者アカウント一覧',zh:'管理员账户列表',ar:'قائمة حسابات المسؤولين',tl:'Mga Account ng Administrator',th:'รายการบัญชีผู้ดูแลระบบ',vi:'Danh sách tài khoản quản trị viên',ko:'관리자 계정 목록',es:'Lista de cuentas de administrador',pt:'Lista de contas de administrador',ru:'Список аккаунтов администраторов',tr:'Yönetici hesapları',hi:'व्यवस्थापक खातों की सूची'},
  'Tambah Akun Admin Baru': {en:'Add New Admin Account',id:'Tambah Akun Admin Baru',ms:'Tambah Akaun Admin Baharu',ja:'新しい管理者アカウントを追加',zh:'添加新管理员账户',ar:'إضافة حساب مسؤول جديد',tl:'Magdagdag ng Bagong Admin Account',th:'เพิ่มบัญชีผู้ดูแลใหม่',vi:'Thêm tài khoản quản trị viên mới',ko:'새 관리자 계정 추가',es:'Añadir nueva cuenta de administrador',pt:'Adicionar nova conta de administrador',ru:'Добавить аккаунт администратора',tr:'Yeni yönetici hesabı ekle',hi:'नया व्यवस्थापक खाता जोड़ें'},
  'Ubah Saldo': {en:'Adjust Balance',id:'Ubah Saldo',ms:'Ubah Baki',ja:'残高を変更',zh:'调整余额',ar:'تعديل الرصيد',tl:'Baguhin ang Balanse',th:'ปรับยอดคงเหลือ',vi:'Điều chỉnh số dư',ko:'잔액 조정',es:'Ajustar saldo',pt:'Ajustar saldo',ru:'Изменить баланс',tr:'Bakiyeyi ayarla',hi:'शेष राशि समायोजित करें'},
  'Daftar Pengajuan Deposit Pengguna': {en:'User Deposit Requests',id:'Daftar Pengajuan Deposit Pengguna',ms:'Senarai Permohonan Deposit Pengguna',ja:'ユーザー入金申請',zh:'用户充值申请',ar:'طلبات إيداع المستخدمين',tl:'Mga Kahilingan sa Deposit ng User',th:'คำขอฝากเงินของผู้ใช้',vi:'Yêu cầu nạp tiền của người dùng',ko:'사용자 입금 요청',es:'Solicitudes de depósito de usuarios',pt:'Solicitações de depósito de usuários',ru:'Заявки на пополнение пользователей',tr:'Kullanıcı para yatırma talepleri',hi:'उपयोगकर्ता जमा अनुरोध'},
  'Status Persetujuan': {en:'Approval Status',id:'Status Persetujuan',ms:'Status Kelulusan',ja:'承認ステータス',zh:'审批状态',ar:'حالة الموافقة',tl:'Status ng Pag-apruba',th:'สถานะการอนุมัติ',vi:'Trạng thái phê duyệt',ko:'승인 상태',es:'Estado de aprobación',pt:'Status de aprovação',ru:'Статус одобрения',tr:'Onay durumu',hi:'अनुमोदन स्थिति'},
  'Riwayat': {en:'History',id:'Riwayat',ms:'Sejarah',ja:'履歴',zh:'历史记录',ar:'السجل',tl:'Kasaysayan',th:'ประวัติ',vi:'Lịch sử',ko:'내역',es:'Historial',pt:'Histórico',ru:'История',tr:'Geçmiş',hi:'इतिहास'},
  'Buka Explorer Blockchain': {en:'Open Blockchain Explorer',id:'Buka Explorer Blockchain',ms:'Buka Penjelajah Blockchain',ja:'ブロックチェーンエクスプローラーを開く',zh:'打开区块链浏览器',ar:'فتح مستكشف البلوكشين',tl:'Buksan ang Blockchain Explorer',th:'เปิด Blockchain Explorer',vi:'Mở trình khám phá blockchain',ko:'블록체인 탐색기 열기',es:'Abrir explorador blockchain',pt:'Abrir explorador de blockchain',ru:'Открыть обозреватель блокчейна',tr:'Blockchain Explorerı aç',hi:'ब्लॉकचेन एक्सप्लोरर खोलें'},
  'Transfer Balance Between Users': {en:'Transfer Balance Between Users',id:'Transfer Saldo Antar Pengguna',ms:'Pindah Baki Antara Pengguna',ja:'ユーザー間残高送金',zh:'用户间余额转账',ar:'تحويل الرصيد بين المستخدمين',tl:'Maglipat ng Balanse sa Pagitan ng User',th:'โอนยอดระหว่างผู้ใช้',vi:'Chuyển số dư giữa người dùng',ko:'사용자 간 잔액 이체',es:'Transferir saldo entre usuarios',pt:'Transferir saldo entre usuários',ru:'Перевод баланса между пользователями',tr:'Kullanıcılar arasında bakiye transferi',hi:'उपयोगकर्ताओं के बीच बैलेंस ट्रांसफर'},
  'Send Balance': {en:'Send Balance',id:'Kirim Saldo',ms:'Hantar Baki',ja:'残高を送る',zh:'发送余额',ar:'إرسال الرصيد',tl:'Magpadala ng Balanse',th:'ส่งยอดคงเหลือ',vi:'Gửi số dư',ko:'잔액 보내기',es:'Enviar saldo',pt:'Enviar saldo',ru:'Отправить баланс',tr:'Bakiye gönder',hi:'बैलेंस भेजें'},
};

const LEGACY_REFERRAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  'Total Earnings': {en:'Total Earnings',id:'Total Penghasilan',ms:'Jumlah Pendapatan',ja:'総収益',zh:'总收益',ar:'إجمالي الأرباح',tl:'Kabuuang Kita',th:'รายได้รวม',vi:'Tổng thu nhập',ko:'총 수익',es:'Ganancias totales',pt:'Ganhos totais',ru:'Общий доход',tr:'Toplam kazanç',hi:'कुल आय'},
  'Invited Hosts': {en:'Invited Hosts',id:'Host yang Diundang',ms:'Hos Dijemput',ja:'招待したホスト',zh:'已邀请主播',ar:'المضيفون المدعوون',tl:'Mga Host na Na-invite',th:'โฮสต์ที่เชิญ',vi:'Host đã mời',ko:'초대한 호스트',es:'Hosts invitados',pt:'Hosts convidados',ru:'Приглашённые хосты',tr:'Davet edilen hostlar',hi:'आमंत्रित होस्ट'},
  'Tier Level': {en:'Tier Level',id:'Tingkat Tier',ms:'Tahap Tier',ja:'ティアレベル',zh:'等级',ar:'مستوى الفئة',tl:'Antas ng Tier',th:'ระดับ Tier',vi:'Cấp độ',ko:'등급',es:'Nivel de categoría',pt:'Nível de categoria',ru:'Уровень',tr:'Kademe seviyesi',hi:'टियर स्तर'},
  'New Member': {en:'New Member',id:'Member Baru',ms:'Ahli Baharu',ja:'新規メンバー',zh:'新成员',ar:'عضو جديد',tl:'Bagong Miyembro',th:'สมาชิกใหม่',vi:'Thành viên mới',ko:'신규 회원',es:'Nuevo miembro',pt:'Novo membro',ru:'Новый участник',tr:'Yeni üye',hi:'नया सदस्य'},
  'Welcome balance': {en:'Welcome balance',id:'Saldo selamat datang',ms:'Baki alu-aluan',ja:'ウェルカム残高',zh:'欢迎余额',ar:'رصيد الترحيب',tl:'Welcome balance',th:'ยอดต้อนรับ',vi:'Số dư chào mừng',ko:'웰컴 잔액',es:'Saldo de bienvenida',pt:'Saldo de boas-vindas',ru:'Приветственный баланс',tr:'Hoş geldin bakiyesi',hi:'वेलकम बैलेंस'},
  'Per Member Invited': {en:'Per Member Invited',id:'Per Member yang Diundang',ms:'Setiap Ahli Dijemput',ja:'招待メンバーごと',zh:'每位受邀成员',ar:'لكل عضو مدعو',tl:'Bawat Member na Na-invite',th:'ต่อสมาชิกที่เชิญ',vi:'Mỗi thành viên được mời',ko:'초대한 회원당',es:'Por miembro invitado',pt:'Por membro convidado',ru:'За приглашённого участника',tr:'Davet edilen üye başına',hi:'प्रति आमंत्रित सदस्य'},
  'Instant credit': {en:'Instant credit',id:'Kredit instan',ms:'Kredit segera',ja:'即時付与',zh:'即时到账',ar:'رصيد فوري',tl:'Instant credit',th:'เครดิตทันที',vi:'Cộng ngay',ko:'즉시 적립',es:'Crédito instantáneo',pt:'Crédito instantâneo',ru:'Мгновенное начисление',tr:'Anında kredi',hi:'तुरंत क्रेडिट'},
  'Commission Share': {en:'Commission Share',id:'Bagian Komisi',ms:'Bahagian Komisen',ja:'コミッション分配',zh:'佣金分成',ar:'حصة العمولة',tl:'Bahagi ng Komisyon',th:'ส่วนแบ่งค่าคอมมิชชัน',vi:'Phần hoa hồng',ko:'커미션 배분',es:'Parte de comisión',pt:'Parcela da comissão',ru:'Доля комиссии',tr:'Komisyon payı',hi:'कमीशन हिस्सा'},
  'Cash Milestone Bonus': {en:'Cash Milestone Bonus',id:'Bonus Pencapaian Tunai',ms:'Bonus Pencapaian Tunai',ja:'現金マイルストーンボーナス',zh:'现金里程碑奖励',ar:'مكافأة إنجاز نقدية',tl:'Cash Milestone Bonus',th:'โบนัสเงินสดตามเป้าหมาย',vi:'Thưởng tiền theo cột mốc',ko:'현금 마일스톤 보너스',es:'Bono en efectivo por hito',pt:'Bônus em dinheiro por marco',ru:'Денежный бонус за достижение',tr:'Nakit kilometre taşı bonusu',hi:'कैश माइलस्टोन बोनस'},
  'Minimum Withdrawal': {en:'Minimum Withdrawal',id:'Penarikan Minimum',ms:'Pengeluaran Minimum',ja:'最低出金額',zh:'最低提现',ar:'الحد الأدنى للسحب',tl:'Minimum na Withdrawal',th:'ถอนขั้นต่ำ',vi:'Rút tối thiểu',ko:'최소 출금액',es:'Retiro mínimo',pt:'Saque mínimo',ru:'Минимальная сумма вывода',tr:'Minimum çekim',hi:'न्यूनतम निकासी'},
  'List of Invited Host Streamers': {en:'List of Invited Host Streamers',id:'Daftar Host Streamer yang Diundang',ms:'Senarai Hos Streamer yang Dijemput',ja:'招待したホスト配信者一覧',zh:'受邀主播列表',ar:'قائمة المضيفين المدعوين',tl:'Listahan ng mga Na-invite na Host Streamer',th:'รายชื่อโฮสต์สตรีมเมอร์ที่เชิญ',vi:'Danh sách host streamer đã mời',ko:'초대한 호스트 스트리머 목록',es:'Lista de hosts streamers invitados',pt:'Lista de hosts streamers convidados',ru:'Список приглашённых хост-стримеров',tr:'Davet edilen host yayıncılar',hi:'आमंत्रित होस्ट स्ट्रीमर सूची'},
  'No streamers have joined yet': {en:'No streamers have joined yet',id:'Belum ada streamer yang bergabung',ms:'Tiada streamer menyertai lagi',ja:'まだ参加したストリーマーはいません',zh:'暂无主播加入',ar:'لم ينضم أي ستريمر بعد',tl:'Wala pang streamer na sumali',th:'ยังไม่มีสตรีมเมอร์เข้าร่วม',vi:'Chưa có streamer nào tham gia',ko:'아직 참여한 스트리머가 없습니다',es:'Aún no se ha unido ningún streamer',pt:'Nenhum streamer entrou ainda',ru:'Пока ни один стример не присоединился',tr:'Henüz hiçbir yayıncı katılmadı',hi:'अभी तक कोई स्ट्रीमर शामिल नहीं हुआ'},
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

  Object.entries(LEGACY_COMMON_TRANSLATIONS).forEach(([sourceText, translationsByLanguage]) => {
    const translated = translationsByLanguage[targetLanguage];
    if (translated && translated !== sourceText && !map.has(sourceText)) map.set(sourceText, translated);
  });

  Object.entries(LEGACY_ADMIN_TRANSLATIONS).forEach(([sourceText, translationsByLanguage]) => {
    const translated = translationsByLanguage[targetLanguage];
    if (translated && translated !== sourceText && !map.has(sourceText)) map.set(sourceText, translated);
  });

  Object.entries(LEGACY_REFERRAL_TRANSLATIONS).forEach(([sourceText, translationsByLanguage]) => {
    const translated = translationsByLanguage[targetLanguage];
    if (translated && translated !== sourceText && !map.has(sourceText)) map.set(sourceText, translated);
  });

  Object.entries(LEGACY_UI_TRANSLATIONS).forEach(([sourceText, translationsByLanguage]) => {
    const translated = translationsByLanguage[targetLanguage];
    if (translated && translated !== sourceText && !map.has(sourceText)) map.set(sourceText, translated);
  });

  Object.entries(CATALOG_TRANSLATION_PATCHES).forEach(([sourceText, translationsByLanguage]) => {
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
