import React from 'react';
import { useLanguage } from '../../i18n';

export default function StreamerAbout() {
  const { t } = useLanguage();
  return (
    <div>
      <div className="text-sm font-black text-slate-200 mb-2">{t('About Us')}</div>
      <p className="leading-5">{t('SYS STREAM adalah platform live, social interaction, dan game/event yang menghubungkan streamer dengan komunitas secara real-time.')}</p>
    </div>
  );
}
