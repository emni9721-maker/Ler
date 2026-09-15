import React from 'react';
import { Home, Image as ImageIcon, Plus, Bell, User as UserIcon, Clapperboard } from 'lucide-react';

export type TabType = 'home' | 'photos' | 'reels' | 'create' | 'notifications' | 'profile';

interface BottomNavProps {
  activeTab: TabType | string;
  onChangeTab?: (tab: TabType) => void;
  onTabChange?: (tab: TabType) => void;
  onOpenUpload?: () => void;
  unreadNotificationsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onTabChange,
  onOpenUpload,
  unreadNotificationsCount = 0,
}) => {
  const handleTabClick = (tab: TabType) => {
    const callback = onChangeTab || onTabChange;
    if (tab === 'create') {
      if (callback) {
        callback('create');
      } else if (onOpenUpload) {
        onOpenUpload();
      }
      return;
    }
    if (callback) {
      callback(tab);
    }
  };

  return (
    <nav
      id="zero-bottom-nav"
      className="h-16 px-2 bg-[#0c0e12]/95 backdrop-blur-lg border-t border-neutral-800/80 flex items-center justify-around z-20 shrink-0 select-none relative"
    >
      {/* Home Tab */}
      <button
        id="nav-tab-home"
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 transition-colors cursor-pointer ${
          activeTab === 'home' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5px] text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium tracking-wide">Home</span>
      </button>

      {/* Photos Tab */}
      <button
        id="nav-tab-photos"
        onClick={() => handleTabClick('photos')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 transition-colors cursor-pointer ${
          activeTab === 'photos' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <ImageIcon className={`w-5 h-5 ${activeTab === 'photos' ? 'stroke-[2.5px] text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium tracking-wide">Photos</span>
      </button>

      {/* Reels / Video Tab */}
      <button
        id="nav-tab-reels"
        data-testid="nav-tab-video"
        onClick={() => handleTabClick('reels')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 transition-colors cursor-pointer relative ${
          activeTab === 'reels' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
        title="Reels & Videos"
      >
        <div className="relative">
          <Clapperboard className={`w-5 h-5 ${activeTab === 'reels' ? 'stroke-[2.5px] text-emerald-400' : ''}`} />
          {activeTab === 'reels' && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-medium tracking-wide">Reels</span>
      </button>

      {/* Center Create Button */}
      <div className="relative -top-1">
        <button
          id="nav-tab-create"
          onClick={() => handleTabClick('create')}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-3 ring-[#0c0e12]"
          title="Create Post, Upload Photo, or Add Story"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
        </button>
      </div>

      {/* Notifications Tab */}
      <button
        id="nav-tab-notifications"
        onClick={() => handleTabClick('notifications')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 transition-colors relative cursor-pointer ${
          activeTab === 'notifications' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <div className="relative">
          <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'stroke-[2.5px] text-emerald-400' : ''}`} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </div>
        <span className="text-[10px] font-medium tracking-wide">Activity</span>
      </button>

      {/* Profile Tab */}
      <button
        id="nav-tab-profile"
        onClick={() => handleTabClick('profile')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 transition-colors cursor-pointer ${
          activeTab === 'profile' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <UserIcon className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5px] text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium tracking-wide">Profile</span>
      </button>
    </nav>
  );
};
