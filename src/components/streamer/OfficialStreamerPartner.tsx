import React from 'react';
import { useLanguage } from '../../i18n';

export default function OfficialStreamerPartner() {
  const { t } = useLanguage();
  return (
    <div>
      <div className="text-sm font-black text-slate-200 mb-2">{t('Official Streamer Partner')}</div>
      <p className="leading-5">{t('SYS STREAM bekerja sama dengan streamer terpilih. Official Streamer Partner menggunakan akun platform mereka untuk membuat dan mengelola room sesuai hak akses yang diberikan.')}</p>
    </div>
  );
}
