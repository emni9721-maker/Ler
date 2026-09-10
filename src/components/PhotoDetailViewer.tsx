import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  Trash2,
  Download,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  HardDrive,
  Tag,
  Check,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { PhotoItem, Album } from '../types';

interface PhotoDetailViewerProps {
  photo: PhotoItem;
  allPhotos: PhotoItem[];
  albums: Album[];
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onShareToFeed: (photo: PhotoItem) => void;
  onNavigatePhoto: (photo: PhotoItem) => void;
}

export const PhotoDetailViewer: React.FC<PhotoDetailViewerProps> = ({
  photo,
  allPhotos,
  albums,
  onClose,
  onToggleFavorite,
  onDelete,
  onRestore,
  onPermanentDelete,
  onShareToFeed,
  onNavigatePhoto,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);

  const currentIndex = allPhotos.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allPhotos.length - 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPrev) onNavigatePhoto(allPhotos[currentIndex - 1]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNext) onNavigatePhoto(allPhotos[currentIndex + 1]);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDaysRemaining = (deletedAt?: string) => {
    if (!deletedAt) return 30;
    const deletedTime = new Date(deletedAt).getTime();
    const diffDays = Math.floor((Date.now() - deletedTime) / (1000 * 60 * 60 * 24));
    return Math.max(1, 30 - diffDays);
  };

  const compressionSavings =
    photo.originalSizeBytes > photo.sizeBytes
      ? Math.round(((photo.originalSizeBytes - photo.sizeBytes) / photo.originalSizeBytes) * 100)
      : 0;

  const photoAlbums = albums.filter((a) => (photo.albumIds || []).includes(a.id));

  return (
    <div
      id="zero-photo-fullscreen-viewer"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none text-white"
    >
      {/* 1. Top Bar */}
      <div className="h-14 px-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-30 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-neutral-900/60 hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold text-neutral-200 truncate max-w-[200px]">
            {photo.filename}
          </p>
          <p className="text-[10px] text-neutral-400">
            {currentIndex + 1} of {allPhotos.length}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showInfo ? 'bg-emerald-500 text-black font-semibold' : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-200'
            }`}
            title="Photo Info & Cloud Metadata"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Deleted Notice Banner (if item is in Recently Deleted) */}
      {photo.isDeleted && (
        <div className="bg-rose-950/80 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-rose-300">
            <Clock className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>In Recently Deleted</strong> • Pending permanent deletion ({getDaysRemaining(photo.deletedAt)} days remaining)
            </span>
          </div>
          <button
            onClick={() => {
              onRestore(photo.id);
              onClose();
            }}
            className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[11px] font-bold hover:bg-emerald-400 transition-colors cursor-pointer shrink-0 ml-2"
          >
            Restore
          </button>
        </div>
      )}

      {/* 2. Main Media Stage */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden px-2">
        {photo.type === 'video' ? (
          <video
            src={photo.url}
            controls
            autoPlay
            playsInline
            className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        ) : (
          <img
            src={photo.url}
            alt={photo.filename}
            className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        )}

        {/* Prev / Next navigation arrows */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-900/70 border border-neutral-700/60 flex items-center justify-center text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-900/70 border border-neutral-700/60 flex items-center justify-center text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 3. Bottom Actions Bar */}
      <div className="h-16 px-6 bg-gradient-to-t from-black/90 via-black/80 to-transparent flex items-center justify-around z-30 shrink-0 border-t border-neutral-800/40">
        {photo.isDeleted ? (
          <>
            <button
              onClick={() => {
                onRestore(photo.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore to Vault</span>
            </button>
            <button
              onClick={() => setShowPermanentDeleteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Permanently</span>
            </button>
          </>
        ) : (
          <>
            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(photo.id)}
              className="flex flex-col items-center gap-1 text-xs cursor-pointer group"
            >
              <Heart
                className={`w-5 h-5 transition-transform group-active:scale-125 ${
                  photo.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-neutral-300'
                }`}
              />
              <span className="text-[10px] text-neutral-400">
                {photo.isFavorite ? 'Starred' : 'Favorite'}
              </span>
            </button>

            {/* Share to ZERO Social Feed */}
            <button
              onClick={() => {
                onShareToFeed(photo);
                onClose();
              }}
              className="flex flex-col items-center gap-1 text-xs cursor-pointer hover:text-emerald-400 transition-colors"
            >
              <Share2 className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Post to Social</span>
            </button>

            {/* Download */}
            <a
              href={photo.url}
              download={photo.filename}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 text-xs cursor-pointer hover:text-white transition-colors"
            >
              <Download className="w-5 h-5 text-neutral-300" />
              <span className="text-[10px] text-neutral-400">Download</span>
            </a>

            {/* Move to Trash */}
            <button
              onClick={() => {
                onDelete(photo.id);
                onClose();
              }}
              className="flex flex-col items-center gap-1 text-xs cursor-pointer text-neutral-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-[10px]">Trash</span>
            </button>
          </>
        )}
      </div>

      {/* 4. Metadata Drawer */}
      {showInfo && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-700/80 rounded-t-3xl p-5 max-h-[60vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom"
        >
          <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ZERO Vault Cloud Details
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Done
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Caption */}
            {photo.caption && (
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                  Caption
                </span>
                <p className="text-neutral-200">{photo.caption}</p>
              </div>
            )}

            {/* Storage & Compression breakdown */}
            <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> Stored Vault Size
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {formatBytes(photo.sizeBytes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Original Camera RAW/File</span>
                <span className="font-mono text-neutral-300">
                  {formatBytes(photo.originalSizeBytes)}
                </span>
              </div>
              {compressionSavings > 0 && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-700/40 text-emerald-400">
                  <span>ZERO Smart Compression Saved:</span>
                  <span className="font-semibold">{compressionSavings}% bandwidth & vault quota</span>
                </div>
              )}
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-neutral-400 flex items-center gap-1.5 mb-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date Taken
                </span>
                <p className="text-neutral-200 font-medium">
                  {new Date(photo.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-neutral-400 flex items-center gap-1.5 mb-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Location
                </span>
                <p className="text-neutral-200 font-medium truncate">
                  {photo.location || 'Encrypted Geo Location'}
                </p>
              </div>
            </div>

            {/* Albums */}
            {photoAlbums.length > 0 && (
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1.5">
                  Organized in Albums
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {photoAlbums.map((alb) => (
                    <span
                      key={alb.id}
                      className="px-2.5 py-1 rounded-full bg-neutral-700/60 text-[11px] text-neutral-200 font-medium"
                    >
                      {alb.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showPermanentDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">Permanently Delete Photo?</h3>
            <p className="text-xs text-neutral-400 text-center mt-2 truncate px-2">
              &quot;{photo.filename}&quot;
            </p>
            <p className="text-[11px] text-neutral-500 text-center mt-1">
              This photo will be permanently purged from your ZERO vault. This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setShowPermanentDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPermanentDeleteModal(false);
                  onPermanentDelete(photo.id);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
