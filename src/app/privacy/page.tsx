import React from 'react';
import { useLanguage } from '../../i18n';

interface Props { navigate?: (path: string) => void; }

const CONTENT = {
  id: [
    ['Ruang Lingkup','Kebijakan Privasi ini menjelaskan bagaimana SYS STREAM dapat mengumpulkan, menggunakan, menyimpan, dan melindungi informasi saat Anda menggunakan platform.'],
    ['Informasi yang Kami Kumpulkan','Kami dapat mengumpulkan informasi akun seperti username dan email; informasi autentikasi dan keamanan; data transaksi seperti jumlah deposit, aset, jaringan, status transaksi, dan pengenal terkait; aktivitas game dan reward; informasi profil yang Anda berikan; serta informasi teknis seperti IP, perangkat/browser, log, dan waktu.'],
    ['Cara Kami Menggunakan Informasi','Informasi digunakan untuk membuat dan mengautentikasi akun, memproses deposit dan transaksi, menjaga saldo dan catatan game, memberikan reward, mencegah fraud dan penyalahgunaan, mengamankan platform, memberi dukungan, meningkatkan layanan, dan memenuhi kewajiban hukum.'],
    ['Informasi Blockchain dan Pembayaran','Transaksi blockchain dapat terlihat publik pada jaringan terkait dan mungkin tidak dapat dihapus atau dibatalkan. SYS STREAM dapat menerima ID transaksi dan status pembayaran dari penyedia pembayaran atau layanan blockchain untuk memverifikasi deposit.'],
    ['Berbagi Informasi','Kami dapat berbagi informasi dengan penyedia layanan untuk autentikasi, hosting, database, pembayaran, keamanan, analitik, atau dukungan. Informasi juga dapat diberikan jika diwajibkan hukum atau untuk melindungi pengguna, platform, atau pihak lain. Kami tidak menjual informasi pribadi hanya karena Anda menggunakan SYS STREAM.'],
    ['Keamanan Data','Kami menggunakan perlindungan teknis dan organisasi yang wajar untuk melindungi informasi akun dan transaksi. Tidak ada layanan internet yang dapat menjamin keamanan absolut; lindungi password, token autentikasi, dan kredensial Anda.'],
    ['Penyimpanan Data','Informasi dapat disimpan selama diperlukan untuk menyediakan layanan, menjaga catatan transaksi dan keamanan, menyelesaikan sengketa, mencegah fraud, serta memenuhi kewajiban hukum atau akuntansi.'],
    ['Pilihan dan Hak Anda','Bergantung pada yurisdiksi, Anda mungkin memiliki hak meminta akses, koreksi, penghapusan, pembatasan, atau perlakuan lain atas informasi pribadi. Sebagian catatan tetap dapat disimpan jika diwajibkan untuk hukum, keamanan, pencegahan fraud, atau catatan transaksi.'],
    ['Cookie dan Penyimpanan Lokal','SYS STREAM dapat menggunakan penyimpanan browser, cookie, atau teknologi serupa untuk autentikasi, preferensi bahasa, keamanan, dan fungsi aplikasi penting.'],
    ['Anak-anak','SYS STREAM tidak ditujukan bagi pengguna yang secara hukum tidak diperbolehkan menggunakan layanan finansial atau gaming di yurisdiksinya. Kami tidak dengan sengaja mengumpulkan informasi anak yang melanggar hukum.'],
    ['Perubahan Kebijakan','Kebijakan ini dapat diperbarui ketika layanan, persyaratan hukum, atau praktik data berubah. Versi terbaru akan dipublikasikan di halaman ini dengan tanggal baru.'],
    ['Kontak','Untuk pertanyaan atau permintaan terkait privasi, gunakan kanal kontak resmi yang disediakan SYS STREAM.']
  ],
  en: [
    ['Scope','This Privacy Policy explains how SYS STREAM may collect, use, store, and protect information when you use the platform.'],
    ['Information We Collect','We may collect account information such as username and email; authentication and security information; transaction data such as deposit amount, asset, network, status and identifiers; game and reward records; profile information you provide; and technical information such as IP, device/browser, logs and timestamps.'],
    ['How We Use Information','Information may be used to create and authenticate accounts, process deposits and transactions, maintain balances and game records, provide rewards, prevent fraud and abuse, secure the platform, provide support, improve services, and comply with legal obligations.'],
    ['Blockchain and Payment Information','Blockchain transactions may be publicly visible and may not be erasable or reversible. SYS STREAM may receive transaction identifiers and payment-status information from payment or blockchain services to verify deposits.'],
    ['Sharing of Information','We may share information with service providers supporting authentication, hosting, databases, payments, security, analytics, or support. Information may also be disclosed when required by law or to protect users, the platform, or others. We do not sell personal information merely because you use SYS STREAM.'],
    ['Data Security','We use reasonable technical and organizational safeguards to protect account and transaction information. No internet service guarantees absolute security; protect your passwords, authentication tokens, and credentials.'],
    ['Data Retention','Information may be retained as reasonably necessary to provide services, maintain transaction and security records, resolve disputes, prevent fraud, and satisfy legal or accounting obligations.'],
    ['Your Choices and Rights','Depending on your jurisdiction, you may have rights to request access, correction, deletion, restriction, or other treatment of personal information. Some records may need to be retained for legal, security, fraud-prevention, or transaction-record purposes.'],
    ['Cookies and Local Storage','SYS STREAM may use browser storage, cookies, or similar technologies for authentication, language preferences, security, and essential application functionality.'],
    ['Children','SYS STREAM is not intended for users who are not legally permitted to use financial or gaming-related services in their jurisdiction. We do not knowingly collect information from children in violation of applicable law.'],
    ['Changes to This Policy','This Privacy Policy may be updated when services, legal requirements, or data practices change. The updated version will be published here with a revised date.'],
    ['Contact','For privacy questions or requests, please use the official contact channel provided by SYS STREAM.']
  ]
} as const;

const TITLES: Record<string,string[]> = {
 es:['Alcance','Información que recopilamos','Cómo usamos la información','Información de blockchain y pagos','Compartir información','Seguridad de datos','Conservación de datos','Tus opciones y derechos','Cookies y almacenamiento local','Menores','Cambios en esta política','Contacto'],
 pt:['Escopo','Informações coletadas','Como usamos as informações','Informações de blockchain e pagamentos','Compartilhamento de informações','Segurança de dados','Retenção de dados','Suas escolhas e direitos','Cookies e armazenamento local','Crianças','Alterações desta política','Contato'],
 zh:['范围','我们收集的信息','我们如何使用信息','区块链与支付信息','信息共享','数据安全','数据保留','您的选择与权利','Cookie 与本地存储','儿童','政策变更','联系'],
 ja:['適用範囲','収集する情報','情報の利用方法','ブロックチェーンと決済情報','情報の共有','データセキュリティ','データ保持','選択肢と権利','Cookieとローカルストレージ','子ども','ポリシーの変更','お問い合わせ'],
 ko:['범위','수집하는 정보','정보 이용 방법','블록체인 및 결제 정보','정보 공유','데이터 보안','데이터 보관','선택 및 권리','쿠키 및 로컬 저장소','아동','정책 변경','문의'],
 ar:['النطاق','المعلومات التي نجمعها','كيفية استخدام المعلومات','معلومات البلوك تشين والدفع','مشاركة المعلومات','أمان البيانات','الاحتفاظ بالبيانات','خياراتك وحقوقك','ملفات تعريف الارتباط والتخزين المحلي','الأطفال','تغييرات هذه السياسة','اتصل بنا']
};

export default function PrivacyPage({ navigate }: Props) {
  const { language, t } = useLanguage();
  const base = CONTENT[language === 'id' ? 'id' : 'en'];
  const rows = language === 'en' || language === 'id' ? base : base.map(([_,body],i) => [TITLES[language]?.[i] || base[i][0], body] as [string,string]);
  return <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
    <article className="max-w-4xl mx-auto">
      <button onClick={() => navigate?.('/login')} className="text-cyan-400 hover:text-cyan-300 text-sm mb-8">← {t('Back')}</button>
      <h1 className="text-3xl font-black mb-2">{t('Privacy Policy')}</h1>
      <p className="text-slate-500 text-sm mb-8">{t('Last updated:')} October 1, 2026</p>
      <div className="space-y-7 text-sm leading-7 text-slate-300">
        {rows.map(([title,body],i)=><section key={title}><h2 className="text-lg font-bold text-white mb-2">{i+1}. {title}</h2><p>{body}</p></section>)}
      </div>
    </article>
  </div>;
}
