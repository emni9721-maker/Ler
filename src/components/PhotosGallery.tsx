import React, { useState } from 'react';
import {
  Grid,
  Heart,
  Trash2,
  FolderPlus,
  Play,
  Share2,
  Download,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Filter,
  Search,
  Check,
  Shield,
  UploadCloud,
  Sparkles,
  Lock,
  FolderArchive,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
} from 'lucide-react';
import { PhotoItem, Album, User } from '../types';

interface PhotosGalleryProps {
  photos: PhotoItem[];
  albums: Album[];
  currentUser: User;
  onSelectPhoto: (photo: PhotoItem) => void;
  onUploadClick: () => void;
  onToggleFavorite: (photoId: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onRestorePhoto: (photoId: string) => void;
  onPermanentDelete: (photoId: string) => void;
  onEmptyTrash?: () => void;
  onRestoreAllTrash?: () => void;
  onOpenAlbumsTab: () => void;
  onOpenSettings: () => void;
  onShareToSocial: (photo: PhotoItem) => void;
  initialSubTab?: 'all' | 'favorites' | 'recently_deleted';
}

export const PhotosGallery: React.FC<PhotosGalleryProps> = ({
  photos,
  albums,
  currentUser,
  onSelectPhoto,
  onUploadClick,
  onToggleFavorite,
  onDeletePhoto,
  onRestorePhoto,
  onPermanentDelete,
  onEmptyTrash,
  onRestoreAllTrash,
  onOpenAlbumsTab,
  onOpenSettings,
  onShareToSocial,
  initialSubTab = 'all',
}) => {
  const [subTab, setSubTab] = useState<'all' | 'favorites' | 'recently_deleted'>(
    initialSubTab
  );
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Modals for confirmation (replaces native window.confirm for iframe safety)
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [itemPendingPermanentDelete, setItemPendingPermanentDelete] = useState<PhotoItem | null>(null);
  const [batchPendingPermanentDelete, setBatchPendingPermanentDelete] = useState(false);

  // Filter calculations
  const deletedPhotos = photos.filter((p) => p.isDeleted);
  const activePhotos = photos.filter((p) => !p.isDeleted);

  const filteredPhotos = photos.filter((p) => {
    // 1. Recently Deleted vs Active
    if (subTab === 'recently_deleted') {
      if (!p.isDeleted) return false;
    } else {
      if (p.isDeleted) return false;
      if (subTab === 'favorites' && !p.isFavorite) return false;
    }

    // 2. Media type
    if (mediaTypeFilter !== 'all' && p.type !== mediaTypeFilter) {
      return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.filename || '').toLowerCase().includes(q);
      const matchCaption = p.caption?.toLowerCase().includes(q);
      const matchLocation = p.location?.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => (t || '').toLowerCase().includes(q));
      if (!matchName && !matchCaption && !matchLocation && !matchTags) return false;
    }

    return true;
  });

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getDaysRemaining = (deletedAt?: string) => {
    if (!deletedAt) return 30;
    const deletedTime = new Date(deletedAt).getTime();
    const diffDays = Math.floor((Date.now() - deletedTime) / (1000 * 60 * 60 * 24));
    return Math.max(1, 30 - diffDays);
  };

  const trashedBytes = deletedPhotos.reduce((acc, p) => acc + (p.sizeBytes || 0), 0);

  const storageUsed = currentUser?.storageUsedBytes ?? 0;
  const storageLimit = currentUser?.storageLimitBytes || 50 * 1024 * 1024 * 1024;
  const usedGB = (storageUsed / (1024 * 1024 * 1024)).toFixed(1);
  const totalGB = (storageLimit / (1024 * 1024 * 1024)).toFixed(0);
  const percentUsed = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

  const toggleSelectPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ((selectedPhotoIds || []).includes(id)) {
      setSelectedPhotoIds(selectedPhotoIds.filter((pid) => pid !== id));
    } else {
      setSelectedPhotoIds([...(selectedPhotoIds || []), id]);
    }
  };

  const handleBatchDelete = () => {
    selectedPhotoIds.forEach((id) => onDeletePhoto(id));
    setSelectedPhotoIds([]);
    setIsSelectMode(false);
  };

  const handleBatchRestore = () => {
    selectedPhotoIds.forEach((id) => onRestorePhoto(id));
    setSelectedPhotoIds([]);
    setIsSelectMode(false);
  };

  const handleConfirmBatchPermanentDelete = () => {
    selectedPhotoIds.forEach((id) => onPermanentDelete(id));
    setSelectedPhotoIds([]);
    setIsSelectMode(false);
    setBatchPendingPermanentDelete(false);
  };

  const handleConfirmSinglePermanentDelete = () => {
    if (itemPendingPermanentDelete) {
      onPermanentDelete(itemPendingPermanentDelete.id);
      setItemPendingPermanentDelete(null);
    }
  };

  const handleConfirmEmptyTrash = () => {
    if (onEmptyTrash) {
      onEmptyTrash();
    } else {
      deletedPhotos.forEach((p) => onPermanentDelete(p.id));
    }
    setShowEmptyTrashConfirm(false);
    setSelectedPhotoIds([]);
    setIsSelectMode(false);
  };

  const handleRestoreAll = () => {
    if (onRestoreAllTrash) {
      onRestoreAllTrash();
    } else {
      deletedPhotos.forEach((p) => onRestorePhoto(p.id));
    }
    setSelectedPhotoIds([]);
    setIsSelectMode(false);
  };

  return (
    <div id="zero-photos-gallery-view" className="flex-1 overflow-y-auto pb-24 select-none bg-[#0c0e12]">
      {/* 1. Cloud Storage Banner */}
      <div className="p-4 bg-gradient-to-b from-neutral-900/90 to-[#0c0e12] border-b border-neutral-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">ZERO Cloud Vault</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800/50">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {usedGB} GB of {totalGB} GB used • End-to-end encrypted
              </p>
            </div>
          </div>
          <button
            id="gallery-upload-btn"
            onClick={onUploadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-neutral-950 text-xs font-semibold hover:bg-emerald-400 transition-colors shadow cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>

        {/* Storage Bar */}
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* 2. Gallery Sub-Tabs Bar */}
      <div className="px-4 pt-3 flex items-center justify-between border-b border-neutral-800/60 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            id="tab-all-photos"
            onClick={() => {
              setSubTab('all');
              setSelectedPhotoIds([]);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'all'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({activePhotos.length})
          </button>
          <button
            id="tab-albums"
            onClick={onOpenAlbumsTab}
            className="px-3 py-1 rounded-full text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Albums ({albums.length})
          </button>
          <button
            id="tab-favorites"
            onClick={() => {
              setSubTab('favorites');
              setSelectedPhotoIds([]);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'favorites'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Starred ({activePhotos.filter((p) => p.isFavorite).length})
          </button>
          <button
            id="tab-recently-deleted"
            onClick={() => {
              setSubTab('recently_deleted');
              setSelectedPhotoIds([]);
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'recently_deleted'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                : 'text-neutral-400 hover:text-rose-300'
            }`}
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Recently Deleted ({deletedPhotos.length})</span>
          </button>
        </div>

        {/* Selection mode toggle */}
        <button
          id="toggle-select-mode-btn"
          onClick={() => {
            setIsSelectMode(!isSelectMode);
            setSelectedPhotoIds([]);
          }}
          className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-1 ${
            isSelectMode
              ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          {isSelectMode ? 'Done' : 'Select'}
        </button>
      </div>

      {/* 3. Search & Type Filter Strip */}
      <div className="px-4 py-2.5 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder={
              subTab === 'recently_deleted'
                ? 'Search recently deleted items...'
                : 'Search date, filename, tags, or location...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        {/* Media filter */}
        <select
          value={mediaTypeFilter}
          onChange={(e) => setMediaTypeFilter(e.target.value as any)}
          className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-full px-2.5 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="all">All Media</option>
          <option value="image">Photos Only</option>
          <option value="video">Videos Only</option>
        </select>
      </div>

      {/* 4. 'Recently Deleted' Folder Quick Access Tile in Gallery Overview (when in 'all' subTab) */}
      {subTab === 'all' && deletedPhotos.length > 0 && (
        <div className="px-4 mb-3">
          <div
            id="recently-deleted-folder-tile"
            onClick={() => {
              setSubTab('recently_deleted');
              setSelectedPhotoIds([]);
              setIsSelectMode(false);
            }}
            className="p-3 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-rose-950/20 border border-neutral-800 hover:border-rose-500/40 transition-all cursor-pointer flex items-center justify-between group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                    Recently Deleted Folder
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    {deletedPhotos.length} item{deletedPhotos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                  <span>{formatBytes(trashedBytes)} pending permanent deletion</span>
                  <span>•</span>
                  <span className="text-neutral-500">Auto-purges after 30 days</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-rose-300 transition-colors font-medium">
              <span>View Folder</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* 5. Dedicated 'Recently Deleted' Folder Header (when inside Recently Deleted view) */}
      {subTab === 'recently_deleted' && (
        <div id="recently-deleted-folder-header" className="px-4 mb-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/20 via-neutral-900/80 to-neutral-900 border border-rose-500/30 shadow-lg">
            {/* Folder breadcrumbs & Back to gallery */}
            <div className="flex items-center justify-between mb-2.5">
              <button
                id="back-to-gallery-from-trash"
                onClick={() => {
                  setSubTab('all');
                  setSelectedPhotoIds([]);
                  setIsSelectMode(false);
                }}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Vault Photos</span>
              </button>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] text-neutral-400 font-medium">30-Day Retention</span>
              </div>
            </div>

            {/* Folder Title & Stats */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Recently Deleted
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
                      {deletedPhotos.length}
                    </span>
                  </h2>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Items are pending permanent deletion. Storage ({formatBytes(trashedBytes)}) will be freed once emptied.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Empty Trash & Restore All */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
              <button
                id="empty-trash-btn"
                onClick={() => setShowEmptyTrashConfirm(true)}
                disabled={deletedPhotos.length === 0}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  deletedPhotos.length > 0
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-500/60'
                    : 'bg-neutral-800/50 text-neutral-600 border border-neutral-800 cursor-not-allowed'
                }`}
                title="Permanently erase all items in Recently Deleted"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Empty Trash</span>
              </button>

              <button
                id="restore-all-trash-btn"
                onClick={handleRestoreAll}
                disabled={deletedPhotos.length === 0}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  deletedPhotos.length > 0
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-500/60'
                    : 'bg-neutral-800/50 text-neutral-600 border border-neutral-800 cursor-not-allowed'
                }`}
                title="Restore all items back to active vault"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restore All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Actions Floating Bar */}
      {isSelectMode && selectedPhotoIds.length > 0 && (
        <div className="mx-4 mb-3 p-2.5 bg-neutral-900 border border-neutral-700/80 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-top-2 text-xs">
          <span className="font-semibold text-emerald-400 ml-1">
            {selectedPhotoIds.length} item{selectedPhotoIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            {subTab === 'recently_deleted' ? (
              <>
                <button
                  onClick={handleBatchRestore}
                  className="px-3 py-1 bg-emerald-500 text-black font-semibold rounded-full hover:bg-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore ({selectedPhotoIds.length})
                </button>
                <button
                  onClick={() => setBatchPendingPermanentDelete(true)}
                  className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full hover:bg-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                </button>
              </>
            ) : (
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full hover:bg-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Move to Trash
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Photo Grid */}
      <div className="px-4">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-neutral-800/50 mt-2">
            {subTab === 'recently_deleted' ? (
              <div className="w-12 h-12 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-neutral-500" />
              </div>
            ) : (
              <Sparkles className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
            )}
            <p className="text-sm font-semibold text-neutral-300">
              {subTab === 'recently_deleted'
                ? 'Recently Deleted is empty'
                : subTab === 'favorites'
                ? 'No starred photos yet'
                : 'No photos found in ZERO vault'}
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              {subTab === 'recently_deleted'
                ? 'Items moved to trash stay here for 30 days before being permanently purged.'
                : 'Upload RAW files, photos, or 4K videos with automatic encryption.'}
            </p>
            {subTab === 'recently_deleted' ? (
              <button
                onClick={() => setSubTab('all')}
                className="mt-4 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer border border-neutral-700"
              >
                Return to Photos
              </button>
            ) : subTab === 'all' ? (
              <button
                onClick={onUploadClick}
                className="mt-4 px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Upload First Photo
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {filteredPhotos.map((photo) => {
              const isSelected = (selectedPhotoIds || []).includes(photo.id);
              const daysRemaining = photo.isDeleted ? getDaysRemaining(photo.deletedAt) : 30;

              return (
                <div
                  key={photo.id}
                  id={`photo-grid-item-${photo.id}`}
                  onClick={() => {
                    if (isSelectMode) {
                      toggleSelectPhoto(photo.id, {} as any);
                    } else {
                      onSelectPhoto(photo);
                    }
                  }}
                  className={`group relative aspect-square bg-neutral-900 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:opacity-95 transition-all ${
                    isSelected ? 'ring-3 ring-emerald-400 scale-[0.96]' : ''
                  }`}
                >
                  {/* Image/Thumbnail */}
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Video Badge */}
                  {photo.type === 'video' && (
                    <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] text-white flex items-center gap-1 font-mono font-bold">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      {photo.duration || '0:15'}
                    </div>
                  )}

                  {/* Recently Deleted: Days Remaining Badge */}
                  {photo.isDeleted && (
                    <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-md border border-neutral-700/50 px-1.5 py-0.5 rounded-md text-[9px] text-rose-300 flex items-center gap-1 font-semibold">
                      <Clock className="w-2.5 h-2.5 text-rose-400" />
                      <span>{daysRemaining}d left</span>
                    </div>
                  )}

                  {/* Starred Badge (when not deleted) */}
                  {!photo.isDeleted && photo.isFavorite && (
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md p-1 rounded-full text-amber-400">
                      <Heart className="w-3 h-3 fill-amber-400" />
                    </div>
                  )}

                  {/* Selection Checkbox Overlay */}
                  {isSelectMode && (
                    <div
                      onClick={(e) => toggleSelectPhoto(photo.id, e)}
                      className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-black'
                          : 'bg-black/50 border-white/70 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </div>
                  )}

                  {/* Quick Action bar on Hover (Desktop) */}
                  {!isSelectMode && (
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white">
                      {photo.isDeleted ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestorePhoto(photo.id);
                            }}
                            className="p-1 hover:text-emerald-400 transition-colors flex items-center gap-1 text-[10px] font-semibold"
                            title="Restore item to vault"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemPendingPermanentDelete(photo);
                            }}
                            className="p-1 hover:text-rose-400 transition-colors flex items-center gap-1 text-[10px] font-semibold"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Delete</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(photo.id);
                            }}
                            className="p-1 hover:text-rose-400 transition-colors"
                            title="Star / Favorite"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                photo.isFavorite ? 'text-rose-500 fill-rose-500' : ''
                              }`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShareToSocial(photo);
                            }}
                            className="p-1 hover:text-emerald-400 transition-colors"
                            title="Share to ZERO Social Feed"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Empty Trash Confirmation Modal */}
      {showEmptyTrashConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">Empty Recently Deleted?</h3>
            <p className="text-xs text-neutral-400 text-center mt-2 leading-relaxed">
              All <strong className="text-rose-300 font-semibold">{deletedPhotos.length} items</strong> ({formatBytes(trashedBytes)}) will be permanently erased from your ZERO vault.
            </p>
            <p className="text-[11px] text-neutral-500 text-center mt-1">
              This action cannot be undone. Storage will be reclaimed immediately.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setShowEmptyTrashConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-empty-trash-btn"
                onClick={handleConfirmEmptyTrash}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Single Item Permanent Delete Confirmation Modal */}
      {itemPendingPermanentDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">Permanently Delete Item?</h3>
            <p className="text-xs text-neutral-400 text-center mt-2 truncate px-2">
              &quot;{itemPendingPermanentDelete.filename}&quot;
            </p>
            <p className="text-[11px] text-neutral-500 text-center mt-1">
              This file will be permanently removed from your encrypted ZERO vault. This cannot be undone.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setItemPendingPermanentDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-single-permanent-delete-btn"
                onClick={handleConfirmSinglePermanentDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Batch Permanent Delete Confirmation Modal */}
      {batchPendingPermanentDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">
              Permanently Delete {selectedPhotoIds.length} Items?
            </h3>
            <p className="text-xs text-neutral-400 text-center mt-2 leading-relaxed">
              These selected items will be completely purged from your vault. This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setBatchPendingPermanentDelete(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-batch-permanent-delete-btn"
                onClick={handleConfirmBatchPermanentDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedPhotoIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
