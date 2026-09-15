import React, { useState } from 'react';
import {
  Settings,
  Edit3,
  UserPlus,
  UserCheck,
  Shield,
  MessageSquare,
  Lock,
  Grid,
  FileText,
  Bookmark,
  Share2,
  HardDrive,
  Check,
} from 'lucide-react';
import { User, Post, PhotoItem } from '../types';

interface UserProfileViewProps {
  user: User;
  currentUser: User;
  userPosts: Post[];
  userPhotos: PhotoItem[];
  savedPosts: Post[];
  onToggleFollow: (userId: string) => void;
  onOpenMessengerWithUser: (userId: string) => void;
  onOpenSettings: () => void;
  onSelectPhoto: (photo: PhotoItem) => void;
  onUpdateProfile: (updated: Partial<User>) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  currentUser,
  userPosts,
  userPhotos,
  savedPosts,
  onToggleFollow,
  onOpenMessengerWithUser,
  onOpenSettings,
  onSelectPhoto,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || '');

  React.useEffect(() => {
    if (user) {
      setEditName(user.displayName || '');
      setEditBio(user.bio || '');
      setEditAvatar(user.avatarUrl || '');
    }
  }, [user]);

  const isMe = user?.id === currentUser?.id;
  const isFollowing = (currentUser?.following || []).includes(user?.id || '');
  const isFriend = (currentUser?.friends || []).includes(user?.id || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: editName.trim() || user.displayName,
      bio: editBio.trim(),
      avatarUrl: editAvatar.trim() || user.avatarUrl,
    });
    setIsEditing(false);
  };

  return (
    <div id="zero-user-profile-view" className="flex-1 overflow-y-auto pb-24 select-none bg-[#0c0e12]">
      {/* 1. Cover Photo */}
      <div className="relative h-40 sm:h-48 w-full bg-neutral-900 overflow-hidden">
        <img
          src={user.coverUrl}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/30 to-transparent" />

        {isMe && (
          <button
            onClick={onOpenSettings}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-colors cursor-pointer"
            title="Settings & Privacy"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Profile Details Header */}
      <div className="px-4 -mt-14 relative z-10">
        <div className="flex items-end justify-between">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[#0c0e12] bg-neutral-800 shadow-xl"
            />
            {user.isPrivate && (
              <span className="absolute bottom-1 right-1 p-1 rounded-full bg-amber-500 text-black shadow">
                <Lock className="w-3 h-3 stroke-[3px]" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            {isMe ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors border border-neutral-700/80 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onToggleFollow(user.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                    isFollowing
                      ? 'bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700'
                      : 'bg-emerald-500 text-black hover:bg-emerald-400'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isFriend ? 'Friends' : 'Following'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenMessengerWithUser(user.id)}
                  className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors border border-neutral-700/80 cursor-pointer"
                  title="Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name & Bio */}
        <div className="mt-2.5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-white leading-tight">
              {user.displayName}
            </h2>
            {user.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-black text-[9px] font-bold flex items-center justify-center">
                ✓
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-400">@{user.username}</span>

          {user.bio && (
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Followers / Following Counter */}
          <div className="flex items-center gap-5 mt-3 text-xs text-neutral-400">
            <div>
              <span className="font-bold text-white font-mono">
                {user.followersCount}
              </span>{' '}
              followers
            </div>
            <div>
              <span className="font-bold text-white font-mono">
                {user.followingCount}
              </span>{' '}
              following
            </div>
            {isMe && (
              <div>
                <span className="font-bold text-emerald-400 font-mono">
                  {user.friends.length}
                </span>{' '}
                friends
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Profile Content Tabs */}
      <div className="mt-5 border-b border-neutral-800/80 flex items-center px-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'posts'
              ? 'border-emerald-400 text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Posts ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'photos'
              ? 'border-emerald-400 text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Vault Photos ({userPhotos.length})</span>
        </button>

        {isMe && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'saved'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* 4. Tab Content */}
      <div className="p-4">
        {activeTab === 'posts' && (
          <div className="space-y-3">
            {userPosts.length === 0 ? (
              <p className="text-center py-12 text-xs text-neutral-500">
                No social posts published yet.
              </p>
            ) : (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-2xl text-xs space-y-2"
                >
                  <p className="text-neutral-200">{post.content}</p>
                  {post.media && post.media.length > 0 && (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                      <img
                        src={post.media[0].url}
                        alt="post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>{post.likes.length} likes • {post.comments.length} comments</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="grid grid-cols-3 gap-1.5">
            {userPhotos.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-xs text-neutral-500">
                No vault photos stored yet.
              </div>
            ) : (
              userPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onSelectPhoto(photo)}
                  className="aspect-square bg-neutral-900 rounded-xl overflow-hidden cursor-pointer shadow hover:opacity-90 transition-opacity"
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-3">
            {savedPosts.length === 0 ? (
              <p className="text-center py-12 text-xs text-neutral-500">
                You haven&apos;t saved any posts yet.
              </p>
            ) : (
              savedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-2xl text-xs space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={post.user.avatarUrl}
                      alt={post.user.displayName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-semibold text-white">{post.user.displayName}</span>
                  </div>
                  <p className="text-neutral-300">{post.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-white mb-3">Edit Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-full bg-neutral-800 text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-emerald-500 text-neutral-950 font-semibold hover:bg-emerald-400 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
