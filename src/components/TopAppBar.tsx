import React, { useState } from 'react';
import { Search, MessageSquare, Cloud, HardDrive, Settings } from 'lucide-react';
import { User, AppTheme } from '../types';
import { ThemeToggler } from './ThemeToggler';

interface TopAppBarProps {
  user?: User;
  currentUser?: User;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onOpenSearch: () => void;
  onOpenMessenger: () => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  onOpenApkModal?: () => void;
  unreadMessagesCount?: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  user,
  currentUser,
  theme = 'midnight',
  onToggleTheme,
  onOpenSearch,
  onOpenMessenger,
  onOpenSettings,
  onOpenProfile,
  unreadMessagesCount = 1,
}) => {
  const activeUser = user || currentUser;
  const [showStorageTooltip, setShowStorageTooltip] = useState(false);

  const storageUsed = activeUser?.storageUsedBytes ?? 0;
  const storageLimit = activeUser?.storageLimitBytes || (50 * 1024 * 1024 * 1024);
  const usedGB = (storageUsed / (1024 * 1024 * 1024)).toFixed(1);
  const totalGB = (storageLimit / (1024 * 1024 * 1024)).toFixed(0);
  const percentUsed = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

  return (
    <header
      id="zero-top-appbar"
      className="h-14 px-4 bg-[#0c0e12]/95 backdrop-blur-md border-b border-neutral-800/80 flex items-center justify-between z-20 shrink-0 select-none relative"
    >
      {/* Brand & Cloud Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-900 border border-neutral-700/60 flex items-center justify-center font-['Space_Grotesk'] font-bold text-base text-white shadow-sm">
            0
          </div>
          <span className="font-['Space_Grotesk'] font-bold tracking-[0.2em] text-lg text-white">
            ZERO
          </span>
        </div>

        {/* Cloud Sync Pill */}
        <div className="relative">
          <button
            id="cloud-storage-indicator-btn"
            onClick={() => setShowStorageTooltip(!showStorageTooltip)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-medium text-emerald-400 hover:bg-emerald-900/40 transition-colors cursor-pointer"
            title="Cloud Vault Backup Status"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Synced</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Storage mini dropdown */}
          {showStorageTooltip && (
            <div className="absolute top-8 left-0 w-60 bg-neutral-900 border border-neutral-800 rounded-2xl p-3 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  Cloud Storage
                </span>
                <span className="text-neutral-400 font-mono">{usedGB} / {totalGB} GB</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>{percentUsed}% capacity used</span>
                <button
                  onClick={() => {
                    setShowStorageTooltip(false);
                    onOpenSettings();
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Manage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-1.5">
        {/* Theme Toggler (Midnight ⇄ AMOLED) */}
        {onToggleTheme && (
          <ThemeToggler
            theme={theme}
            onToggleTheme={onToggleTheme}
            variant="compact"
            className="mr-0.5"
          />
        )}

        {/* Search */}
        <button
          id="top-search-btn"
          onClick={onOpenSearch}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
          title="Search users, posts, photos"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Messenger */}
        <button
          id="top-messenger-btn"
          onClick={onOpenMessenger}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors relative cursor-pointer"
          title="Direct Messenger"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Settings & Privacy */}
        <button
          id="top-settings-btn"
          onClick={onOpenSettings}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
          title="Settings & Privacy"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        {onOpenProfile && activeUser && (
          <button
            id="top-profile-btn"
            onClick={onOpenProfile}
            className="w-7 h-7 ml-1 rounded-full overflow-hidden ring-1 ring-neutral-700 hover:ring-emerald-400 transition-all cursor-pointer"
            title="My Profile"
          >
            <img
              src={activeUser.avatarUrl}
              alt={activeUser.displayName}
              className="w-full h-full object-cover"
            />
          </button>
        )}
      </div>
    </header>
  );
};
