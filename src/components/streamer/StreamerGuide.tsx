import React from 'react';
import { useLanguage } from '../../i18n';

export default function StreamerGuide() {
  const { t } = useLanguage();
  return (
    <div>
      <div className="text-sm font-black text-slate-200 mb-2">{t('Untuk Streamer')}</div>
      <p className="leading-5 mb-3">{t('Streamer yang ingin bekerja sama dengan SYS STREAM dapat menghubungi tim platform untuk proses seleksi dan kerja sama.')}</p>
      <details className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <summary className="cursor-pointer select-none font-bold text-slate-200">{t('Cara kerja & setting streamer')}</summary>
        <div className="mt-3 space-y-3 leading-5">
          <div><b className="text-slate-300">1. {t('Aktivasi')}</b><br />{t('Akun harus disetujui sebagai Official Streamer Partner oleh Admin/Owner sebelum dapat membuat Live Room.')}</div>
          <div><b className="text-slate-300">2. {t('Buat Live Room')}</b><br />{t('Masuk ke Live Room, buat room dengan judul dan deskripsi, lalu room menjadi milik akun streamer tersebut.')}</div>
          <div><b className="text-slate-300">3. {t('Setting streaming')}</b><br />{t('Di kontrol streamer, buat Live Input Cloudflare lalu salin RTMPS Server dan Stream Key ke OBS. Gunakan Service: Custom.')}</div>
          <div><b className="text-slate-300">4. {t('Mulai live')}</b><br />{t('Klik Start Streaming di OBS, kemudian periksa status streaming pada room. Video produksi akan tampil setelah stream aktif.')}</div>
          <div><b className="text-slate-300">5. {t('Kelola room')}</b><br />{t('Pemilik room dapat memantau peserta, chat, like, dan aktivitas live. Data peserta harus berasal dari pengguna yang benar-benar bergabung.')}</div>
          <div><b className="text-slate-300">6. {t('Keamanan')}</b><br />{t('Jangan membagikan Stream Key. Jika Stream Key bocor, buat ulang Live Input agar kredensial lama tidak dapat digunakan.')}</div>
        </div>
      </details>
    </div>
  );
}
