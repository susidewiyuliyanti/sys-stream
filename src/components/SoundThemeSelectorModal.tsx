import React from 'react';
import { useAppConfig } from '../context/AppConfigContext';
import { SoundTheme } from '../types';
import { Volume2, Music, Check, X, Play } from 'lucide-react';
import { sound } from '../services/sound';

interface SoundThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundThemeSelectorModal: React.FC<SoundThemeSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { soundTheme, setSoundTheme, availableSoundThemes, t } = useAppConfig();

  if (!isOpen) return null;

  const handleSelectTheme = (themeId: SoundTheme) => {
    setSoundTheme(themeId);
  };

  const handleTestSound = (themeId: SoundTheme, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.previewTheme(themeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0e1422] border border-amber-500/30 p-5 sm:p-6 shadow-2xl shadow-amber-500/10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {t('sound_theme')}
              </h3>
              <p className="text-xs text-white/60">
                Choose a Web Audio sound effects pack for your live stream interactions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sound Theme Cards */}
        <div className="space-y-2.5 py-1">
          {availableSoundThemes.map((theme) => {
            const isSelected = soundTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{theme.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{theme.name}</h4>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-300 font-semibold">
                      {theme.tagline}
                    </div>
                    <div className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                      {theme.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleTestSound(theme.id, e)}
                    title="Test theme sound"
                    className="p-2 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-black text-white text-xs transition-all flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>Sound effects are synthesized directly without external files</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs"
          >
            Select & Close
          </button>
        </div>
      </div>
    </div>
  );
};
