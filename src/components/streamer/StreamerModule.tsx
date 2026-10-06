import React from 'react';
import { ChevronDown } from 'lucide-react';
import StreamerAbout from './StreamerAbout';
import OfficialStreamerPartner from './OfficialStreamerPartner';
import StreamerGuide from './StreamerGuide';

export default function StreamerModule() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto">
        <details className="mb-7 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden group">
          <summary className="list-none cursor-pointer select-none px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-200 hover:text-cyan-400 transition-colors">
            <span>About</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="border-t border-slate-800 px-4 py-5 grid md:grid-cols-3 gap-6">
            <StreamerAbout />
            <OfficialStreamerPartner />
            <StreamerGuide />
          </div>
        </details>
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
