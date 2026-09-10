import React, { useState } from 'react';
import {
  FolderPlus,
  Lock,
  Unlock,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  ShieldCheck,
  ChevronLeft,
  KeyRound,
  Plus,
  AlertCircle,
  Eye,
  FolderArchive,
} from 'lucide-react';
import { Album, PhotoItem, User } from '../types';

interface AlbumsViewProps {
  albums: Album[];
  photos: PhotoItem[];
  currentUser: User;
  onSelectPhoto: (photo: PhotoItem) => void;
  onCreateAlbum: (data: { name: string; description?: string; isPrivate?: boolean; isVaultLocked?: boolean; pinCode?: string }) => void;
  onDeleteAlbum: (albumId: string) => void;
  onBackToGallery: () => void;
  onOpenRecentlyDeleted?: () => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({
  albums,
  photos,
  currentUser,
  onSelectPhoto,
  onCreateAlbum,
  onDeleteAlbum,
  onBackToGallery,
  onOpenRecentlyDeleted,
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pinPromptAlbum, setPinPromptAlbum] = useState<Album | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [unlockedAlbumIds, setUnlockedAlbumIds] = useState<string[]>([]);

  // Create album form state
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [newAlbumPin, setNewAlbumPin] = useState('');

  const deletedPhotos = photos.filter((p) => p.isDeleted);

  const handleAlbumClick = (album: Album) => {
    if (album.isVaultLocked && !(unlockedAlbumIds || []).includes(album.id)) {
      setPinPromptAlbum(album);
      setEnteredPin('');
      setPinError(false);
    } else {
      setSelectedAlbumId(album.id);
    }
  };

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptAlbum) return;

    const correctPin = pinPromptAlbum.pinCode || currentUser.vaultPin || '1234';
    if (enteredPin === correctPin || enteredPin === '1234') {
      setUnlockedAlbumIds([...unlockedAlbumIds, pinPromptAlbum.id]);
      setSelectedAlbumId(pinPromptAlbum.id);
      setPinPromptAlbum(null);
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    onCreateAlbum({
      name: newAlbumName.trim(),
      description: newAlbumDesc.trim(),
      isVaultLocked,
      pinCode: isVaultLocked ? newAlbumPin || '1234' : undefined,
    });

    setNewAlbumName('');
    setNewAlbumDesc('');
    setIsVaultLocked(false);
    setNewAlbumPin('');
    setShowCreateModal(false);
  };

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);

  // Photos for selected album
  const albumPhotos = selectedAlbum
    ? photos.filter((p) => {
        if (p.isDeleted) return false;
        if (selectedAlbum.autoCategory === 'camera') return true;
        if (selectedAlbum.autoCategory === 'favorites') return p.isFavorite;
        if (selectedAlbum.autoCategory === 'videos') return p.type === 'video';
        return (p.albumIds || []).includes(selectedAlbum.id);
      })
    : [];

  return (
    <div id="zero-albums-view" className="flex-1 overflow-y-auto pb-24 select-none bg-[#0c0e12]">
      {selectedAlbum ? (
        /* Inside Single Album View */
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedAlbumId(null)}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Albums</span>
            </button>
            {!selectedAlbum.autoCategory && (
              <button
                onClick={() => {
                  if (confirm(`Delete album "${selectedAlbum.name}"? Photos will remain in your vault.`)) {
                    onDeleteAlbum(selectedAlbum.id);
                    setSelectedAlbumId(null);
                  }
                }}
                className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete Album"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{selectedAlbum.name}</h2>
              {selectedAlbum.isVaultLocked && (
                <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            {selectedAlbum.description && (
              <p className="text-xs text-neutral-400 mt-0.5">{selectedAlbum.description}</p>
            )}
            <p className="text-[11px] text-neutral-500 mt-1 font-mono">
              {albumPhotos.length} item{albumPhotos.length !== 1 ? 's' : ''} stored
            </p>
          </div>

          {/* Album Photos Grid */}
          {albumPhotos.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/30 rounded-3xl border border-neutral-800/50">
              <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-300">This album is empty</p>
              <p className="text-xs text-neutral-500 mt-1">Upload photos to organize them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {albumPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onSelectPhoto(photo)}
                  className="aspect-square bg-neutral-900 rounded-xl overflow-hidden cursor-pointer shadow hover:opacity-90 transition-opacity"
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Albums Grid Overview */
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Vault Albums</h2>
              <p className="text-xs text-neutral-400">Auto-organized & encrypted collections</p>
            </div>
            <button
              id="create-new-album-btn"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-semibold transition-colors border border-neutral-700/80 cursor-pointer shadow-sm"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Album</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {albums.map((album) => {
              const isLocked = album.isVaultLocked && !(unlockedAlbumIds || []).includes(album.id);

              return (
                <div
                  key={album.id}
                  id={`album-card-${album.id}`}
                  onClick={() => handleAlbumClick(album)}
                  className="group bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] shadow-sm flex flex-col"
                >
                  {/* Cover thumbnail */}
                  <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden">
                    <img
                      src={album.coverUrl}
                      alt={album.name}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        isLocked ? 'blur-md brightness-50' : ''
                      }`}
                    />

                    {/* Lock Overlay if locked */}
                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white gap-1">
                        <div className="p-2 rounded-full bg-neutral-900/80 border border-neutral-700 text-emerald-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400">
                          PIN Protected
                        </span>
                      </div>
                    )}

                    {album.autoCategory && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-semibold text-neutral-300 uppercase tracking-wider">
                        Smart Album
                      </span>
                    )}
                  </div>

                  {/* Album info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {album.name}
                      </h3>
                      {album.isVaultLocked && !isLocked && (
                        <Unlock className="w-3 h-3 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Recently Deleted Folder Card */}
            <div
              id="album-card-recently-deleted"
              onClick={() => {
                if (onOpenRecentlyDeleted) {
                  onOpenRecentlyDeleted();
                } else {
                  onBackToGallery();
                }
              }}
              className="group bg-gradient-to-br from-neutral-900/80 via-neutral-900/60 to-rose-950/20 border border-neutral-800/80 hover:border-rose-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] shadow-sm flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden flex flex-col items-center justify-center p-3 text-center">
                {deletedPhotos[0] && (
                  <img
                    src={deletedPhotos[0].thumbnailUrl || deletedPhotos[0].url}
                    alt="Recently Deleted"
                    className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="relative z-10 w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-1">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <span className="relative z-10 text-[9px] font-bold tracking-wider uppercase text-rose-400">
                  Trash Folder
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
                    Recently Deleted
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    {deletedPhotos.length}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">30-day retention</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Unlock Prompt Modal */}
      {pinPromptAlbum && (
        <div
          id="pin-unlock-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPinPromptAlbum(null)}
        >
          <div
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-center text-white">Unlock ZERO Vault</h3>
            <p className="text-xs text-center text-neutral-400 mt-1">
              Enter 4-digit PIN for &quot;{pinPromptAlbum.name}&quot; (Demo PIN: 1234)
            </p>

            <form onSubmit={handleUnlockPin} className="mt-4 space-y-3">
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="• • • •"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                className="w-full text-center tracking-[0.6em] text-lg font-mono bg-neutral-950 border border-neutral-800 rounded-2xl py-2.5 text-emerald-400 focus:outline-none focus:border-emerald-500"
              />

              {pinError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Incorrect PIN code. Try 1234.</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinPromptAlbum(null)}
                  className="flex-1 py-2 rounded-full bg-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-emerald-500 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 cursor-pointer"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Album Modal */}
      {showCreateModal && (
        <div
          id="create-album-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-white mb-1">Create New Vault Album</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Group photos with custom encryption and privacy controls.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 font-medium block mb-1">
                  Album Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Memories 2026"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 font-medium block mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Short note or expedition summary"
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Private Vault PIN lock toggle */}
              <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    PIN Lock Vault
                  </span>
                  <p className="text-[10px] text-neutral-400">
                    Require PIN code to open this album
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isVaultLocked}
                  onChange={(e) => setIsVaultLocked(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {isVaultLocked && (
                <div>
                  <label className="text-[11px] text-neutral-400 font-medium block mb-1">
                    Set 4-Digit Album PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={newAlbumPin}
                    onChange={(e) => setNewAlbumPin(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-full bg-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAlbumName.trim()}
                  className="flex-1 py-2 rounded-full bg-emerald-500 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
