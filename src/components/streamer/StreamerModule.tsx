import React from 'react';
import StreamerAbout from './StreamerAbout';
import OfficialStreamerPartner from './OfficialStreamerPartner';
import StreamerGuide from './StreamerGuide';

export default function StreamerModule() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 mb-7">
          <StreamerAbout />
          <OfficialStreamerPartner />
          <StreamerGuide />
        </div>
        <div className="border-t border-slate-900 pt-5 flex flex-wrap items-center justify-center gap-5">
          <span>© {new Date().getFullYear()} SYS STREAM</span>
          <span className="text-slate-700">•</span>
          <a href="#/terms" className="hover:text-cyan-400 transition-colors">Terms &amp; Conditions</a>
          <span className="text-slate-700">•</span>
          <a href="#/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
