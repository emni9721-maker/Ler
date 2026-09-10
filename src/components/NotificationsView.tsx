import React, { useState } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  onSelectNotification,
}) => {
  const [filter, setFilter] = useState<'all' | 'mentions'>('all');

  // Suppress vault notifications completely per user preference
  const nonVaultNotifications = notifications.filter(
    (n) =>
      n.type !== 'storage_warning' &&
      n.type !== 'backup_completed' &&
      n.actor?.username !== 'zero.cloud'
  );

  const filtered = nonVaultNotifications.filter((n) => {
    if (filter === 'mentions') return ['comment', 'friend_request'].includes(n.type);
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-cyan-400" />;
      case 'follow':
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div id="zero-notifications-view" className="flex-1 overflow-y-auto pb-24 select-none bg-[#0c0e12]">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Activity & Alerts</h2>
          <p className="text-xs text-neutral-400">Social interactions, comments, and requests</p>
        </div>

        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-medium"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-neutral-800/60 flex items-center gap-1.5 text-xs">
        {(['all', 'mentions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab === 'all' ? 'All Activity' : 'Mentions & Requests'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-neutral-800/60">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-xs">
            <Bell className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
            <p className="text-neutral-300 font-medium">All caught up!</p>
            <p className="text-neutral-600 text-[11px] mt-0.5">
              No new alerts in this section.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectNotification(item)}
              className={`p-3.5 flex items-start gap-3 hover:bg-neutral-900/50 transition-colors cursor-pointer ${
                !item.read ? 'bg-neutral-900/30' : ''
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={item.actor.avatarUrl}
                  alt={item.actor.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-700"
                />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#0c0e12] ring-1 ring-neutral-800 shadow">
                  {getIcon(item.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-200 leading-snug">
                  <span className="font-semibold text-white mr-1">
                    {item.actor.displayName}
                  </span>
                  {item.message}
                </p>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
