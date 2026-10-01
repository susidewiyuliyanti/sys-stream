import React from 'react';
import { sound } from '../lib/sound';
import { SysLogo } from './SysLogo';

interface Props {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<Props> = ({ navigate }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
        <button
          onClick={() => { sound.playClick(); navigate('/room/main'); }}
          aria-label="Go to SYS STREAM home"
          className="text-left transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <SysLogo size="md" showText={true} />
        </button>
      </div>
    </header>
  );
};
