import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, Minimize2, Moon, Contrast } from 'lucide-react';
import { AppTheme } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme?: AppTheme;
  onToggleTheme?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  theme = 'midnight',
  onToggleTheme,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');
  const [isDeviceFramed, setIsDeviceFramed] = useState(true);
  const isAmoled = theme === 'amoled';

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      data-theme={theme}
      className={`w-full min-h-screen text-neutral-100 flex flex-col items-center justify-center relative overflow-hidden font-sans transition-colors duration-300 ${
        isAmoled ? 'bg-black' : 'bg-neutral-950'
      }`}
    >
      {/* Background ambient lighting */}
      <div className={`absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 ${
        isAmoled ? 'bg-emerald-500/5 opacity-40' : 'bg-emerald-600/10'
      }`} />
      <div className={`absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 ${
        isAmoled ? 'bg-cyan-500/5 opacity-40' : 'bg-cyan-600/10'
      }`} />

      {/* Frame Mode Floating Switcher (Desktop utility) */}
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-800/80 px-3 py-1.5 rounded-full shadow-lg text-xs">
        {onToggleTheme && (
          <button
            id="frame-theme-toggle-btn"
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
              isAmoled
                ? 'text-[#00ff88] bg-black border border-[#27272a] hover:border-[#00ff88]'
                : 'text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700'
            }`}
            title={`Current theme: ${theme.toUpperCase()}. Click to switch.`}
          >
            {isAmoled ? <Contrast className="w-3.5 h-3.5 text-[#00ff88]" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="text-[11px]">{isAmoled ? 'AMOLED' : 'Midnight'}</span>
          </button>
        )}

        <div className="w-px h-3.5 bg-neutral-700 mx-0.5" />

        <button
          id="toggle-device-frame-btn"
          onClick={() => setIsDeviceFramed(!isDeviceFramed)}
          className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Toggle Android Device Frame / Full Window"
        >
          {isDeviceFramed ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">Expand Full Window</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">Android Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {isDeviceFramed ? (
        /* Android Phone Frame */
        <div
          id="android-phone-container"
          data-theme={theme}
          className={`my-3 sm:my-6 w-full max-w-[430px] h-[92vh] max-h-[920px] rounded-[48px] border-[6px] relative flex flex-col overflow-hidden transition-all duration-300 ${
            isAmoled
              ? 'bg-black border-[#27272a] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-neutral-800'
              : 'bg-[#0c0e12] border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-neutral-700/50'
          }`}
        >
          {/* Android Status Bar */}
          <div className={`h-9 px-7 pt-2 flex items-center justify-between text-[13px] font-semibold select-none z-30 shrink-0 transition-colors duration-300 ${
            isAmoled ? 'bg-black text-white' : 'bg-[#0c0e12] text-neutral-300'
          }`}>
            <span>{currentTime}</span>

            {/* Front Camera Punch Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 shadow-inner" />

            <div className="flex items-center gap-1.5 text-neutral-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono">98%</span>
                <BatteryMedium className={`w-4 h-4 ${isAmoled ? 'text-[#00ff88]' : 'text-emerald-400'}`} />
              </div>
            </div>
          </div>

          {/* Main App Content Viewport */}
          <div className={`flex-1 w-full overflow-hidden relative flex flex-col transition-colors duration-300 ${
            isAmoled ? 'bg-black' : 'bg-[#0f1218]'
          }`}>
            {children}
          </div>

          {/* Android Navigation Gesture Bar */}
          <div className={`h-4 w-full flex items-center justify-center shrink-0 z-30 pb-1 transition-colors duration-300 ${
            isAmoled ? 'bg-black' : 'bg-[#0f1218]'
          }`}>
            <div className={`w-32 h-1 rounded-full ${isAmoled ? 'bg-neutral-600' : 'bg-neutral-600/70'}`} />
          </div>
        </div>
      ) : (
        /* Expanded Responsive Edge-to-Edge Container */
        <div
          id="full-window-container"
          data-theme={theme}
          className={`w-full h-screen max-w-5xl mx-auto flex flex-col overflow-hidden border-x shadow-2xl relative transition-colors duration-300 ${
            isAmoled ? 'bg-black border-[#27272a]' : 'bg-[#0f1218] border-neutral-800/80'
          }`}
        >
          {/* Slim Status / Context strip */}
          <div className={`h-7 px-4 flex items-center justify-between text-xs border-b shrink-0 transition-colors duration-300 ${
            isAmoled ? 'bg-black text-neutral-300 border-[#27272a]' : 'bg-neutral-900/90 text-neutral-400 border-neutral-800/60'
          }`}>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isAmoled ? 'bg-[#00ff88]' : 'bg-emerald-500'}`} />
              <span className="font-semibold text-neutral-300 font-mono">ZERO OS v2.6.4</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-neutral-400">Cloud Storage Synced</span>
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex-1 w-full overflow-hidden relative flex flex-col">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
