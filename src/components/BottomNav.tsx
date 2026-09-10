import React from 'react';
import { Home, Image as ImageIcon, Plus, Bell, User as UserIcon } from 'lucide-react';

export type TabType = 'home' | 'photos' | 'create' | 'notifications' | 'profile';

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
    if (tab === 'create' && onOpenUpload) {
      onOpenUpload();
      return;
    }
    if (typeof onChangeTab === 'function') {
      onChangeTab(tab);
    }
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
  };

  return (
    <nav
      id="zero-bottom-nav"
      className="h-16 px-4 bg-[#0c0e12]/95 backdrop-blur-lg border-t border-neutral-800/80 flex items-center justify-around z-20 shrink-0 select-none relative"
    >
      {/* Home Tab */}
      <button
        id="nav-tab-home"
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
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
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
          activeTab === 'photos' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <ImageIcon className={`w-5 h-5 ${activeTab === 'photos' ? 'stroke-[2.5px] text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium tracking-wide">Photos</span>
      </button>

      {/* Center Create Button */}
      <div className="relative -top-2">
        <button
          id="nav-tab-create"
          onClick={() => handleTabClick('create')}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-[#0c0e12]"
          title="Create Post, Upload Photo, or Add Story"
        >
          <Plus className="w-6 h-6 stroke-[3px]" />
        </button>
      </div>

      {/* Notifications Tab */}
      <button
        id="nav-tab-notifications"
        onClick={() => handleTabClick('notifications')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors relative cursor-pointer ${
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
        className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
          activeTab === 'profile' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <UserIcon className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5px] text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium tracking-wide">Profile</span>
      </button>
    </nav>
  );
};
