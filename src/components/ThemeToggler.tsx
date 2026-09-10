import React from 'react';
import { Moon, Sparkles, Check, Zap, Eye, Contrast } from 'lucide-react';
import { AppTheme } from '../types';

interface ThemeTogglerProps {
  theme: AppTheme;
  onToggleTheme: () => void;
  onSelectTheme?: (theme: AppTheme) => void;
  variant?: 'compact' | 'pill' | 'cards' | 'switch';
  className?: string;
}

export const ThemeToggler: React.FC<ThemeTogglerProps> = ({
  theme,
  onToggleTheme,
  onSelectTheme,
  variant = 'compact',
  className = '',
}) => {
  const isAmoled = theme === 'amoled';

  // 1. Compact button variant (for TopAppBar)
  if (variant === 'compact') {
    return (
      <button
        id="top-theme-toggler-btn"
        onClick={onToggleTheme}
        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer select-none ${
          isAmoled
            ? 'bg-black text-[#00ff88] border border-[#27272a] hover:border-[#00ff88]/60 shadow-[0_0_12px_rgba(0,255,136,0.2)]'
            : 'bg-neutral-900/90 text-neutral-300 border border-neutral-700/60 hover:text-white hover:border-neutral-500'
        } ${className}`}
        title={isAmoled ? 'Switch to Midnight Dark Theme' : 'Switch to High-Contrast AMOLED Black Theme'}
        aria-label="Toggle between Midnight and AMOLED themes"
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {isAmoled ? (
            <Contrast className="w-3.5 h-3.5 text-[#00ff88] animate-in zoom-in duration-200" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-cyan-300 animate-in zoom-in duration-200" />
          )}
        </div>
        <span className="text-[11px] font-bold tracking-tight">
          {isAmoled ? 'AMOLED' : 'Midnight'}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            isAmoled ? 'bg-[#00ff88] shadow-[0_0_6px_#00ff88]' : 'bg-cyan-400'
          }`}
        />
      </button>
    );
  }

  // 2. Pill Switch variant
  if (variant === 'pill' || variant === 'switch') {
    return (
      <div
        id="theme-toggler-pill"
        className={`flex items-center p-1 bg-neutral-950/80 border border-neutral-800 rounded-full select-none ${className}`}
      >
        <button
          onClick={() => onSelectTheme ? onSelectTheme('midnight') : (isAmoled && onToggleTheme())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            !isAmoled
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Midnight</span>
        </button>
        <button
          onClick={() => onSelectTheme ? onSelectTheme('amoled') : (!isAmoled && onToggleTheme())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isAmoled
              ? 'bg-black text-[#00ff88] border border-[#27272a] shadow-[0_0_10px_rgba(0,255,136,0.25)]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Contrast className="w-3.5 h-3.5 text-[#00ff88]" />
          <span>AMOLED Black</span>
        </button>
      </div>
    );
  }

  // 3. Rich Cards variant (for SettingsView)
  const handleSelect = (selectedTheme: AppTheme) => {
    if (onSelectTheme) {
      onSelectTheme(selectedTheme);
    } else if (selectedTheme !== theme) {
      onToggleTheme();
    }
  };

  return (
    <div id="theme-toggler-cards-container" className={`space-y-3.5 ${className}`}>
      {/* 2 Interactive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card 1: Midnight Dark */}
        <div
          id="theme-option-midnight"
          onClick={() => handleSelect('midnight')}
          className={`relative p-4 rounded-3xl border transition-all cursor-pointer overflow-hidden ${
            !isAmoled
              ? 'bg-gradient-to-br from-[#12151c] to-[#0c0e12] border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          {/* Active indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-cyan-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-none">Midnight Dark</h4>
                <span className="text-[10px] text-neutral-400 font-medium">Deep Navy Charcoal</span>
              </div>
            </div>
            {!isAmoled ? (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full border border-neutral-700 shrink-0" />
            )}
          </div>

          {/* Mini preview illustration */}
          <div className="rounded-xl bg-[#0c0e12] border border-neutral-800 p-2.5 space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-2 rounded bg-neutral-700" />
              <div className="w-4 h-2 rounded-full bg-emerald-500/50" />
            </div>
            <div className="w-full h-5 rounded bg-[#161b24] border border-[#202632] flex items-center px-2">
              <div className="w-16 h-1.5 rounded bg-neutral-600" />
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Balanced midnight charcoal with ambient soft glow and comfortable contrast for day-to-day browsing.
          </p>

          <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>Base: #0C0E12</span>
            <span>Contrast: 1,200:1</span>
          </div>
        </div>

        {/* Card 2: AMOLED Pure Black */}
        <div
          id="theme-option-amoled"
          onClick={() => handleSelect('amoled')}
          className={`relative p-4 rounded-3xl border transition-all cursor-pointer overflow-hidden ${
            isAmoled
              ? 'bg-black border-[#00ff88] shadow-lg shadow-[#00ff88]/10 ring-1 ring-[#00ff88]/50'
              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          {/* Active indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black border border-[#27272a] flex items-center justify-center text-[#00ff88]">
                <Contrast className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-none flex items-center gap-1.5">
                  AMOLED Black
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40">
                    OLED
                  </span>
                </h4>
                <span className="text-[10px] text-neutral-400 font-medium">True Pitch Black</span>
              </div>
            </div>
            {isAmoled ? (
              <span className="w-5 h-5 rounded-full bg-[#00ff88] text-black flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_0_8px_#00ff88]">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full border border-neutral-700 shrink-0" />
            )}
          </div>

          {/* Mini preview illustration */}
          <div className="rounded-xl bg-black border border-[#27272a] p-2.5 space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-2 rounded bg-neutral-500" />
              <div className="w-4 h-2 rounded-full bg-[#00ff88]" />
            </div>
            <div className="w-full h-5 rounded bg-black border border-[#27272a] flex items-center px-2">
              <div className="w-16 h-1.5 rounded bg-neutral-300" />
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            100% pure black pixels turn off completely on OLED/AMOLED displays, providing infinite contrast and maximum battery preservation.
          </p>

          <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span className="text-[#00ff88]">Base: #000000</span>
            <span className="text-[#00ff88]">Contrast: ∞:1</span>
          </div>
        </div>
      </div>

      {/* OLED Performance & Display Telemetry Widget */}
      <div className="rounded-2xl bg-neutral-950/90 border border-neutral-800/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isAmoled ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30' : 'bg-neutral-800 text-neutral-300'
          }`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">OLED Power State:</span>
              <span className={`font-mono text-[11px] font-bold ${isAmoled ? 'text-[#00ff88]' : 'text-neutral-400'}`}>
                {isAmoled ? 'Pixels Inactive (0 Nits)' : 'Active Backlight (1.2 Nits)'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500">
              {isAmoled ? 'Saves up to 38% battery power on OLED smartphones & monitors' : 'Standard power profile'}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            isAmoled
              ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white border border-neutral-700'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isAmoled ? (
            <>
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Switch to Midnight</span>
            </>
          ) : (
            <>
              <Contrast className="w-3.5 h-3.5" />
              <span>Switch to AMOLED</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
