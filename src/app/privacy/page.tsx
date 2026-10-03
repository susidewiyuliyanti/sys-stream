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

const BODY_TRANSLATIONS: Record<string,string[]> = {
es:[
'Esta Política de Privacidad explica cómo SYS STREAM puede recopilar, usar, almacenar y proteger información cuando utilizas la plataforma.',
'Podemos recopilar datos de cuenta, autenticación y seguridad, transacciones, actividad y recompensas de juegos, información de perfil y datos técnicos como IP, dispositivo, navegador, registros y marcas de tiempo.',
'La información puede utilizarse para crear y autenticar cuentas, procesar depósitos y transacciones, mantener saldos y registros, proporcionar recompensas, prevenir fraude y abuso, proteger la plataforma, prestar soporte, mejorar servicios y cumplir obligaciones legales.',
'Las transacciones de blockchain pueden ser públicas y no siempre pueden eliminarse o revertirse. SYS STREAM puede recibir identificadores de transacción y estados de pago para verificar depósitos.',
'Podemos compartir información con proveedores que ayudan con autenticación, alojamiento, bases de datos, pagos, seguridad, análisis y soporte, o cuando la ley lo exige. No vendemos información personal simplemente por usar SYS STREAM.',
'Aplicamos medidas técnicas y organizativas razonables. Ningún servicio de Internet garantiza seguridad absoluta; protege tus contraseñas, tokens y credenciales.',
'La información puede conservarse mientras sea razonablemente necesaria para prestar servicios, mantener registros, resolver disputas, prevenir fraude y cumplir obligaciones legales o contables.',
'Según tu jurisdicción, puedes tener derechos de acceso, corrección, eliminación o restricción. Algunos registros pueden conservarse por motivos legales, de seguridad, prevención de fraude o transacciones.',
'Podemos usar almacenamiento del navegador, cookies o tecnologías similares para autenticación, idioma, seguridad y funciones esenciales.',
'SYS STREAM no está destinado a personas que no puedan utilizar legalmente servicios financieros o de juegos en su jurisdicción. No recopilamos conscientemente datos de niños en contra de la ley.',
'Esta política puede actualizarse cuando cambien los servicios, requisitos legales o prácticas de datos. La versión actualizada se publicará con una nueva fecha.',
'Para consultas de privacidad, utiliza el canal de contacto oficial de SYS STREAM.'
],
pt:[
'Esta Política de Privacidade explica como a SYS STREAM pode coletar, usar, armazenar e proteger informações quando você utiliza a plataforma.',
'Podemos coletar dados da conta, autenticação e segurança, transações, atividades e recompensas de jogos, informações de perfil e dados técnicos como IP, dispositivo, navegador, registros e horários.',
'As informações podem ser usadas para criar e autenticar contas, processar depósitos e transações, manter saldos e registros, fornecer recompensas, prevenir fraude e abuso, proteger a plataforma, oferecer suporte, melhorar serviços e cumprir obrigações legais.',
'Transações de blockchain podem ser públicas e podem não ser apagáveis ou reversíveis. A SYS STREAM pode receber identificadores de transação e status de pagamento para verificar depósitos.',
'Podemos compartilhar informações com fornecedores de autenticação, hospedagem, bancos de dados, pagamentos, segurança, análise e suporte, ou quando exigido por lei. Não vendemos informações pessoais apenas porque você usa a SYS STREAM.',
'Usamos medidas técnicas e organizacionais razoáveis. Nenhum serviço de Internet garante segurança absoluta; proteja suas senhas, tokens e credenciais.',
'As informações podem ser mantidas pelo tempo razoavelmente necessário para prestar serviços, manter registros, resolver disputas, prevenir fraude e cumprir obrigações legais ou contábeis.',
'Dependendo da jurisdição, você pode ter direitos de acesso, correção, exclusão ou restrição. Alguns registros podem ser mantidos por motivos legais, de segurança, prevenção de fraude ou transações.',
'A SYS STREAM pode usar armazenamento do navegador, cookies ou tecnologias semelhantes para autenticação, idioma, segurança e funções essenciais.',
'A SYS STREAM não se destina a pessoas que não possam usar legalmente serviços financeiros ou de jogos em sua jurisdição. Não coletamos conscientemente dados de crianças em violação da lei.',
'Esta política pode ser atualizada quando serviços, requisitos legais ou práticas de dados mudarem. A versão atual será publicada com nova data.',
'Para dúvidas de privacidade, use o canal oficial de contato da SYS STREAM.'
],
zh:[
'本隐私政策说明您使用平台时 SYS STREAM 如何收集、使用、存储和保护信息。',
'我们可能收集账户、身份验证和安全信息、交易数据、游戏活动和奖励记录、您提供的资料，以及 IP、设备、浏览器、日志和时间戳等技术信息。',
'信息可用于创建和验证账户、处理充值和交易、维护余额和记录、发放奖励、防止欺诈和滥用、保护平台、提供支持、改进服务并履行法律义务。',
'区块链交易可能公开可见，并且可能无法删除或撤销。SYS STREAM 可能从支付或区块链服务获取交易标识和支付状态以验证充值。',
'我们可能与提供认证、托管、数据库、支付、安全、分析或客服服务的供应商共享信息，也可能依法披露。仅因您使用 SYS STREAM，我们不会出售个人信息。',
'我们采用合理的技术和组织措施保护账户及交易信息。任何互联网服务都不能保证绝对安全，请保护密码、认证令牌和账户凭证。',
'信息可在提供服务、保存交易和安全记录、解决争议、防止欺诈及履行法律或会计义务所需的合理期限内保存。',
'根据所在地法律，您可能享有访问、更正、删除或限制处理个人信息的权利。部分记录可能因法律、安全、防欺诈或交易记录要求而继续保存。',
'SYS STREAM 可能使用浏览器存储、Cookie 或类似技术，用于身份验证、语言偏好、安全和必要功能。',
'SYS STREAM 不面向在其司法辖区依法不得使用金融或游戏服务的人员。我们不会明知地违法收集儿童信息。',
'当服务、法律要求或数据实践发生变化时，本政策可能更新。更新版本会在本页公布并标注新日期。',
'如有隐私问题或请求，请使用 SYS STREAM 提供的官方联系渠道。'
],
ja:[
'このプライバシーポリシーは、プラットフォーム利用時にSYS STREAMが情報を収集、利用、保存、保護する方法を説明します。',
'アカウント、認証・セキュリティ、取引、ゲーム活動と報酬、プロフィール情報、IP、端末、ブラウザ、ログ、時刻などの技術情報を収集する場合があります。',
'情報はアカウント作成・認証、入金と取引、残高と記録、報酬、不正防止、セキュリティ、サポート、サービス改善、法的義務のために利用されます。',
'ブロックチェーン取引は公開され、削除や取消しができない場合があります。入金確認のため取引IDや決済状態を取得する場合があります。',
'認証、ホスティング、データベース、決済、セキュリティ、分析、サポートの提供者と情報を共有する場合があります。法律上必要な開示も行います。利用しただけで個人情報を販売することはありません。',
'合理的な技術的・組織的対策を使用します。絶対的な安全を保証できるインターネットサービスはないため、パスワードや認証情報を保護してください。',
'サービス提供、取引・セキュリティ記録、紛争解決、不正防止、法務・会計上の義務に必要な期間、情報を保持する場合があります。',
'地域の法律により、個人情報へのアクセス、訂正、削除、利用制限などの権利を持つ場合があります。法令や安全上必要な記録は保持されることがあります。',
'認証、言語設定、セキュリティ、必要な機能のため、ブラウザ保存、Cookieなどを使用する場合があります。',
'SYS STREAMは、地域の法律で金融・ゲームサービスを利用できない人を対象としません。法律に反して子どもの情報を故意に収集しません。',
'サービス、法的要件、データ運用の変更に応じて本ポリシーを更新する場合があります。更新版と日付をこのページに掲載します。',
'プライバシーに関する質問は、SYS STREAMの公式連絡窓口をご利用ください。'
],
ko:[
'이 개인정보처리방침은 플랫폼 이용 시 SYS STREAM이 정보를 수집, 사용, 저장 및 보호하는 방법을 설명합니다.',
'계정, 인증 및 보안, 거래, 게임 활동과 보상, 프로필 정보와 IP, 기기, 브라우저, 로그, 시간 등의 기술 정보를 수집할 수 있습니다.',
'정보는 계정 생성과 인증, 입금 및 거래, 잔액과 기록 관리, 보상, 사기 방지, 보안, 지원, 서비스 개선 및 법적 의무 이행에 사용될 수 있습니다.',
'블록체인 거래는 공개될 수 있으며 삭제 또는 취소가 불가능할 수 있습니다. 입금 확인을 위해 거래 식별자와 결제 상태를 받을 수 있습니다.',
'인증, 호스팅, 데이터베이스, 결제, 보안, 분석 및 지원 제공업체와 정보를 공유하거나 법률에 따라 공개할 수 있습니다. SYS STREAM 이용만을 이유로 개인정보를 판매하지 않습니다.',
'합리적인 기술적·조직적 보호조치를 사용합니다. 인터넷 서비스는 절대적인 보안을 보장할 수 없으므로 비밀번호와 인증 정보를 보호하세요.',
'서비스 제공, 거래 및 보안 기록, 분쟁 해결, 사기 방지, 법률 또는 회계 의무에 필요한 기간 동안 정보를 보관할 수 있습니다.',
'관할 법률에 따라 개인정보의 접근, 수정, 삭제 또는 제한을 요청할 권리가 있을 수 있습니다. 법률·보안·사기 방지·거래 기록을 위해 일부 기록은 보관될 수 있습니다.',
'인증, 언어 설정, 보안 및 필수 기능을 위해 브라우저 저장소, 쿠키 또는 유사 기술을 사용할 수 있습니다.',
'SYS STREAM은 관할 지역에서 금융 또는 게임 서비스를 합법적으로 이용할 수 없는 사람을 대상으로 하지 않습니다. 법을 위반하여 아동 정보를 고의로 수집하지 않습니다.',
'서비스, 법적 요구사항 또는 데이터 관행이 변경되면 이 정책을 업데이트할 수 있습니다. 업데이트 버전은 새 날짜와 함께 게시됩니다.',
'개인정보 문의는 SYS STREAM 공식 연락 채널을 이용하세요.'
],
ar:[
'توضح سياسة الخصوصية هذه كيفية جمع SYS STREAM للمعلومات واستخدامها وتخزينها وحمايتها عند استخدام المنصة.',
'قد نجمع معلومات الحساب والمصادقة والأمان والمعاملات ونشاط الألعاب والمكافآت ومعلومات الملف الشخصي وبيانات تقنية مثل عنوان IP والجهاز والمتصفح والسجلات والطوابع الزمنية.',
'قد تُستخدم المعلومات لإنشاء الحسابات والمصادقة عليها، ومعالجة الإيداعات والمعاملات، وإدارة الأرصدة والسجلات، وتقديم المكافآت، ومنع الاحتيال وإساءة الاستخدام، وتأمين المنصة، وتقديم الدعم، وتحسين الخدمات والامتثال للقانون.',
'قد تكون معاملات البلوك تشين مرئية للعامة وقد لا يمكن حذفها أو عكسها. قد تتلقى SYS STREAM معرّفات المعاملات وحالة الدفع للتحقق من الإيداعات.',
'قد نشارك المعلومات مع مزودي المصادقة والاستضافة وقواعد البيانات والدفع والأمان والتحليلات والدعم، أو عندما يطلب القانون ذلك. لا نبيع المعلومات الشخصية لمجرد استخدام SYS STREAM.',
'نستخدم ضمانات تقنية وتنظيمية معقولة. لا يمكن لأي خدمة إنترنت ضمان الأمان المطلق؛ احمِ كلمات المرور ورموز المصادقة وبيانات الحساب.',
'قد نحتفظ بالمعلومات بالقدر اللازم لتقديم الخدمات وحفظ سجلات المعاملات والأمان وحل النزاعات ومنع الاحتيال والوفاء بالالتزامات القانونية أو المحاسبية.',
'بحسب الولاية القضائية قد تكون لك حقوق الوصول والتصحيح والحذف أو التقييد. قد يلزم الاحتفاظ ببعض السجلات لأسباب قانونية أو أمنية أو لمنع الاحتيال أو لحفظ سجلات المعاملات.',
'قد تستخدم SYS STREAM تخزين المتصفح وملفات تعريف الارتباط وتقنيات مشابهة للمصادقة واللغة والأمان والوظائف الأساسية.',
'لا تستهدف SYS STREAM الأشخاص غير المسموح لهم قانونياً باستخدام الخدمات المالية أو خدمات الألعاب في ولايتهم القضائية. لا نجمع معلومات الأطفال عن علم بما يخالف القانون.',
'قد يتم تحديث هذه السياسة عند تغير الخدمات أو المتطلبات القانونية أو ممارسات البيانات. سيتم نشر النسخة المحدثة مع تاريخ جديد.',
'للاستفسارات المتعلقة بالخصوصية، استخدم قناة الاتصال الرسمية التي توفرها SYS STREAM.'
]
};

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
  const translatedBodies = BODY_TRANSLATIONS[language];
  const rows = language === 'en' || language === 'id'
    ? base
    : base.map(([_,body],i) => [TITLES[language]?.[i] || base[i][0], translatedBodies?.[i] || body] as [string,string]);
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
