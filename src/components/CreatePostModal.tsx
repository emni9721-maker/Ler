import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Globe,
  Users,
  Lock,
  Sparkles,
  Camera,
  Play,
  HardDrive,
  Upload,
} from 'lucide-react';
import { User, PhotoItem, PostPrivacy } from '../types';

interface CreatePostModalProps {
  currentUser: User;
  vaultPhotos: PhotoItem[];
  defaultIsStory?: boolean;
  onClose: () => void;
  onSubmitPost: (data: { content: string; media?: { url: string; type: 'image' | 'video'; photoId?: string }[]; privacy: PostPrivacy }) => void;
  onSubmitStory: (data: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }) => void;
  onOpenVaultUpload?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  vaultPhotos,
  defaultIsStory = false,
  onClose,
  onSubmitPost,
  onSubmitStory,
  onOpenVaultUpload,
}) => {
  const [isStoryMode, setIsStoryMode] = useState(defaultIsStory);
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PostPrivacy>('public');
  const [selectedVaultPhoto, setSelectedVaultPhoto] = useState<PhotoItem | null>(null);
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedVaultPhoto({
        id: `local_${Date.now()}`,
        userId: currentUser.id,
        url: result,
        type: isVid ? 'video' : 'image',
        filename: file.name,
        sizeBytes: file.size,
        originalSizeBytes: file.size,
        date: new Date().toISOString(),
        isFavorite: false,
        isDeleted: false,
      });
      setShowVaultPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isStoryMode) {
      if (!selectedVaultPhoto) return;
      onSubmitStory({
        mediaUrl: selectedVaultPhoto.url,
        mediaType: selectedVaultPhoto.type,
        caption: content.trim() || undefined,
      });
    } else {
      if (!content.trim() && !selectedVaultPhoto) return;
      onSubmitPost({
        content: content.trim(),
        media: selectedVaultPhoto
          ? [
              {
                url: selectedVaultPhoto.url,
                type: selectedVaultPhoto.type,
                photoId: selectedVaultPhoto.id,
              },
            ]
          : undefined,
        privacy,
      });
    }

    onClose();
  };

  return (
    <div
      id="zero-create-post-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Switcher Tab: Feed Post vs 24h Story */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setIsStoryMode(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                !isStoryMode ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Social Post
            </button>
            <button
              type="button"
              onClick={() => setIsStoryMode(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isStoryMode ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              24h Story
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Author Header */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-700"
            />
            <div>
              <span className="text-xs font-semibold text-white block">
                {currentUser.displayName}
              </span>
              {!isStoryMode ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
                    className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-[10px] rounded-md px-2 py-0.5 focus:outline-none cursor-pointer"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="friends">👥 Friends Only</option>
                    <option value="private">🔒 Only Me</option>
                  </select>
                </div>
              ) : (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Disappears after 24h
                </span>
              )}
            </div>
          </div>

          {/* Text Input */}
          <textarea
            placeholder={
              isStoryMode
                ? 'Add an optional story caption...'
                : "What's on your mind? Share thoughts, updates or moments..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={isStoryMode ? 2 : 3}
            className="w-full bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/70 resize-none"
          />

          {/* Attached Media from Vault or Device */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleDeviceFileSelect}
            accept="image/*,video/*"
            className="hidden"
          />

          {selectedVaultPhoto ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-neutral-800">
              {selectedVaultPhoto.type === 'video' ? (
                <video
                  src={selectedVaultPhoto.url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={selectedVaultPhoto.url}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setSelectedVaultPhoto(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowVaultPicker(true)}
                  className="py-2.5 px-3 rounded-2xl border border-neutral-800 hover:border-emerald-500/70 text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer bg-neutral-950/60"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span className="truncate">From ZERO Vault</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-2xl border border-neutral-800 hover:border-emerald-500/70 text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer bg-neutral-950/60"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">From Device/Camera</span>
                </button>
              </div>

              {onOpenVaultUpload && !isStoryMode && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVaultUpload();
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-neutral-800/80 hover:border-neutral-700 text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-neutral-950/30"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload & Compress Media directly to Vault</span>
                </button>
              )}
            </div>
          )}

          {/* Vault Picker Modal Sheet */}
          {showVaultPicker && (
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">
                  Pick from ZERO Vault ({vaultPhotos.filter((p) => !p.isDeleted).length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowVaultPicker(false)}
                  className="text-[10px] text-neutral-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">
                {vaultPhotos
                  .filter((p) => !p.isDeleted)
                  .map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => {
                        setSelectedVaultPhoto(photo);
                        setShowVaultPicker(false);
                      }}
                      className="aspect-square rounded-lg overflow-hidden border border-neutral-800 hover:border-emerald-400 cursor-pointer"
                    >
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt="pick"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-full bg-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isStoryMode ? !selectedVaultPhoto : !content.trim() && !selectedVaultPhoto}
              className="flex-1 py-2 rounded-full bg-emerald-500 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isStoryMode ? 'Publish Story' : 'Post to Feed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
