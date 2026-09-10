import React, { useState } from 'react';
import {
  X,
  Search,
  User as UserIcon,
  Image as ImageIcon,
  Folder,
  FileText,
  Lock,
  ArrowRight,
  Clock,
  History,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { User, Post, PhotoItem, Album } from '../types';

const RECENT_SEARCHES_KEY = 'zero_recent_searches';
const DEFAULT_RECENT_SEARCHES = ['Tokyo', 'Maya Chen', 'Architecture', 'Sunset'];

function getInitialRecentSearches(): string[] {
  if (typeof window === 'undefined') return DEFAULT_RECENT_SEARCHES;
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(DEFAULT_RECENT_SEARCHES));
      return DEFAULT_RECENT_SEARCHES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    return DEFAULT_RECENT_SEARCHES;
  } catch {
    return DEFAULT_RECENT_SEARCHES;
  }
}

interface SearchModalProps {
  currentUser: User;
  allUsers: User[];
  posts: Post[];
  photos: PhotoItem[];
  albums: Album[];
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  onSelectPhoto: (photo: PhotoItem) => void;
  onSelectAlbum: (albumId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  currentUser: _currentUser,
  allUsers,
  posts,
  photos,
  albums,
  onClose,
  onSelectUser,
  onSelectPhoto,
  onSelectAlbum,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'photos' | 'posts' | 'albums'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(getInitialRecentSearches);

  const q = query.trim().toLowerCase();

  const saveRecentSearchesToStorage = (searches: string[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      }
    } catch (err) {
      console.warn('Failed to save recent searches', err);
    }
  };

  const addRecentSearch = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, 10);
      saveRecentSearchesToStorage(updated);
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== termToRemove.toLowerCase());
      saveRecentSearchesToStorage(updated);
      return updated;
    });
  };

  const clearAllRecentSearches = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentSearches([]);
    saveRecentSearchesToStorage([]);
  };

  const handleSelectRecentSearch = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
  };

  const matchingUsers = allUsers.filter(
    (u) =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.bio || '').toLowerCase().includes(q)
  );

  const matchingPhotos = photos.filter(
    (p) =>
      !p.isDeleted &&
      ((p.filename || '').toLowerCase().includes(q) ||
        (p.caption || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        p.tags?.some((t) => (t || '').toLowerCase().includes(q)))
  );

  const matchingPosts = posts.filter(
    (post) =>
      (post.content || '').toLowerCase().includes(q) ||
      (post.user?.displayName || '').toLowerCase().includes(q) ||
      (post.user?.username || '').toLowerCase().includes(q)
  );

  const matchingAlbums = albums.filter(
    (a) => (a.name || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
  );

  return (
    <div
      id="zero-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-[85vh] max-h-[700px] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                addRecentSearch(query.trim());
              }
            }}
            className="flex-1 flex items-center"
          >
            <input
              type="text"
              autoFocus
              placeholder="Search users, posts, photos, albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  addRecentSearch(query.trim());
                }
              }}
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
          </form>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-500 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white pl-2 cursor-pointer font-medium"
          >
            Done
          </button>
        </div>

        {/* Tab Filter Chips */}
        <div className="px-3 py-2 bg-neutral-900 border-b border-neutral-800/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {(['all', 'users', 'photos', 'posts', 'albums'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-colors cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-emerald-500 text-black'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results / Recents Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!q ? (
            <div className="space-y-4">
              {recentSearches.length > 0 ? (
                <div id="recent-searches-container" className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-emerald-400" />
                      Recent Searches
                    </span>
                    <button
                      id="clear-recent-searches-button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] text-neutral-400 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg hover:bg-neutral-800/80 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear History
                    </button>
                  </div>

                  {/* Quick-tap Pill Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, index) => (
                      <div
                        key={`chip-${term}-${index}`}
                        onClick={() => handleSelectRecentSearch(term)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-950/80 border border-neutral-800 hover:border-emerald-500/60 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white cursor-pointer transition-all shadow-sm"
                      >
                        <Clock className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{term}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${term}`}
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="p-0.5 ml-0.5 rounded-full hover:bg-neutral-700 text-neutral-500 hover:text-neutral-200 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Recents List */}
                  <div id="recent-searches-list" className="space-y-1 pt-1">
                    {recentSearches.map((term, index) => (
                      <div
                        key={`item-${term}-${index}`}
                        id={`recent-search-item-${index}`}
                        onClick={() => handleSelectRecentSearch(term)}
                        className="group p-2.5 rounded-2xl bg-neutral-950/50 hover:bg-neutral-800/80 border border-neutral-800/60 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-colors shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs text-neutral-200 group-hover:text-white font-medium truncate">
                            {term}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-neutral-500 group-hover:text-neutral-400 hidden sm:inline mr-1">
                            Search
                          </span>
                          <button
                            type="button"
                            id={`remove-recent-search-${index}`}
                            aria-label={`Remove search query ${term}`}
                            onClick={(e) => removeRecentSearch(term, e)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-700/60 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-2xl bg-neutral-950/40 border border-neutral-800/60 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800/80 flex items-center justify-center mx-auto text-neutral-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-300">No Recent Searches</p>
                    <p className="text-[11px] text-neutral-500 mt-1 max-w-xs mx-auto">
                      Searches you perform will be saved here for instant one-tap access.
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Suggested Searches
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {['Tokyo', 'Maya Chen', 'Architecture', 'Sunset'].map((suggested) => (
                        <button
                          key={suggested}
                          onClick={() => handleSelectRecentSearch(suggested)}
                          className="px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 hover:text-emerald-400 border border-neutral-800 transition-colors cursor-pointer"
                        >
                          {suggested}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tips Banner */}
              <div className="p-3 rounded-2xl bg-neutral-950/30 border border-neutral-800/40 text-neutral-500 text-[11px] flex items-center gap-2.5">
                <Search className="w-4 h-4 text-emerald-500/70 shrink-0" />
                <span>Search across users, lossless photos, albums, and encrypted posts.</span>
              </div>
            </div>
          ) : (
            <>
              {/* Users Results */}
              {(activeTab === 'all' || activeTab === 'users') && matchingUsers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" /> Users (
                    {matchingUsers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          if (query.trim()) addRecentSearch(query.trim());
                          onSelectUser(user.id);
                          onClose();
                        }}
                        className="p-2 rounded-2xl bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800/80 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-700"
                          />
                          <div>
                            <span className="text-xs font-semibold text-white block leading-tight">
                              {user.displayName}
                            </span>
                            <span className="text-[10px] text-neutral-400">@{user.username}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-500 mr-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos Results */}
              {(activeTab === 'all' || activeTab === 'photos') && matchingPhotos.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Photos & Videos (
                    {matchingPhotos.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {matchingPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => {
                          if (query.trim()) addRecentSearch(query.trim());
                          onSelectPhoto(photo);
                          onClose();
                        }}
                        className="aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 hover:border-emerald-400 cursor-pointer relative"
                      >
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Albums Results */}
              {(activeTab === 'all' || activeTab === 'albums') && matchingAlbums.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-amber-400" /> Albums (
                    {matchingAlbums.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {matchingAlbums.map((album) => (
                      <div
                        key={album.id}
                        onClick={() => {
                          if (query.trim()) addRecentSearch(query.trim());
                          onSelectAlbum(album.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 cursor-pointer flex items-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                          <img
                            src={album.coverUrl}
                            alt={album.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-white truncate">
                              {album.name}
                            </span>
                            {album.isVaultLocked && (
                              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-500">
                            {album.photoCount} photos
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {(activeTab === 'all' || activeTab === 'posts') && matchingPosts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" /> Social Posts (
                    {matchingPosts.length})
                  </h4>
                  <div className="space-y-2">
                    {matchingPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => {
                          if (query.trim()) addRecentSearch(query.trim());
                        }}
                        className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <img
                            src={post.user.avatarUrl}
                            alt={post.user.displayName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-semibold text-neutral-200">
                            {post.user.displayName}
                          </span>
                        </div>
                        <p className="text-neutral-300 line-clamp-2">{post.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingUsers.length === 0 &&
                matchingPhotos.length === 0 &&
                matchingAlbums.length === 0 &&
                matchingPosts.length === 0 && (
                  <div className="text-center py-12 text-neutral-500 text-xs">
                    No results found matching &quot;{query}&quot;.
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
