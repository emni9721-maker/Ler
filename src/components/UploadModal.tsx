import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Sparkles,
  ShieldCheck,
  Check,
  Share2,
  FolderPlus,
  Sliders,
  HardDrive,
  Camera,
  Layers,
} from 'lucide-react';
import { Album, User } from '../types';
import { compressImage } from '../services/api';

interface UploadModalProps {
  albums: Album[];
  currentUser: User;
  onClose: () => void;
  onUploadSuccess: (photoData: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  albums,
  currentUser,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [qualityMode, setQualityMode] = useState<'high' | 'balanced' | 'saver'>('balanced');
  const [compressedResult, setCompressedResult] = useState<{
    dataUrl: string;
    compressedSize: number;
    originalSize: number;
    savingsPercent: number;
  } | null>(null);

  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('ZERO Cloud Vault');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('alb_camera');
  const [shareToFeed, setShareToFeed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample curated library for instant 1-click test upload if user doesn't have local photo
  const samplePicks = [
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      name: 'Yosemite_Alpine_Mirror.jpg',
      size: 4.8 * 1024 * 1024,
      type: 'image',
    },
    {
      url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
      name: 'Barcelona_Geometric_Arch.jpg',
      size: 3.6 * 1024 * 1024,
      type: 'image',
    },
    {
      url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
      name: 'Pacific_Ocean_Surf_4K.mp4',
      size: 14.2 * 1024 * 1024,
      type: 'video',
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    setMediaType(isVideo ? 'video' : 'image');
    setSelectedFile(file);

    if (isVideo) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCompressedResult({
        dataUrl: url,
        compressedSize: file.size,
        originalSize: file.size,
        savingsPercent: 0,
      });
    } else {
      setIsProcessing(true);
      try {
        const compressed = await compressImage(file, qualityMode);
        setPreviewUrl(compressed.compressedDataUrl);
        setCompressedResult({
          dataUrl: compressed.compressedDataUrl,
          compressedSize: compressed.compressedSize,
          originalSize: compressed.originalSize,
          savingsPercent: compressed.compressionRatio,
        });
      } catch (err) {
        console.error('Compression failed:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSelectSample = (sample: typeof samplePicks[0]) => {
    setMediaType(sample.type as any);
    setPreviewUrl(sample.url);
    const compressedSize = Math.round(sample.size * (qualityMode === 'saver' ? 0.35 : qualityMode === 'balanced' ? 0.55 : 0.8));
    setCompressedResult({
      dataUrl: sample.url,
      compressedSize,
      originalSize: sample.size,
      savingsPercent: Math.round(((sample.size - compressedSize) / sample.size) * 100),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;

    setIsProcessing(true);

    const finalSize = compressedResult ? compressedResult.compressedSize : 2.5 * 1024 * 1024;
    const origSize = compressedResult ? compressedResult.originalSize : finalSize * 2;

    const photoPayload = {
      url: previewUrl,
      type: mediaType,
      filename: selectedFile ? selectedFile.name : `ZERO_${mediaType === 'video' ? 'VID' : 'IMG'}_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`,
      caption,
      location,
      sizeBytes: finalSize,
      originalSizeBytes: origSize,
      albumIds: [selectedAlbumId],
      shareToFeed,
    };

    onUploadSuccess(photoPayload);
    setIsProcessing(false);
    onClose();
  };

  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  return (
    <div
      id="zero-upload-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload to Vault</h3>
              <p className="text-[10px] text-neutral-400">With client-side auto compression</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Picker / Drop Area */}
          {!previewUrl ? (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-neutral-700 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-950/60 group"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-800 group-hover:bg-emerald-500/20 text-neutral-300 group-hover:text-emerald-400 flex items-center justify-center transition-colors mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-white">
                  Tap to browse photo or video
                </p>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Supports JPG, PNG, WEBP, MP4 • Camera roll
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Quick Sample Selector */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-1.5">
                  Or pick sample high-res media:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {samplePicks.map((sample, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSample(sample)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-neutral-800 hover:border-emerald-500/60 cursor-pointer shadow"
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white/90 bg-black/60 backdrop-blur-sm rounded px-1 truncate">
                        {sample.name.slice(0, 12)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Media Preview & Compression Meter */
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow">
                {mediaType === 'video' ? (
                  <video src={previewUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setCompressedResult(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Compression Engine stats */}
              {compressedResult && mediaType === 'image' && (
                <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Quality Mode:
                    </span>
                    <div className="flex gap-1">
                      {(['saver', 'balanced', 'high'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setQualityMode(mode)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize transition-colors cursor-pointer ${
                            qualityMode === mode
                              ? 'bg-emerald-500 text-black'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800/60">
                    <span className="text-neutral-500">
                      Original: {formatMB(compressedResult.originalSize)} MB
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Compressed: {formatMB(compressedResult.compressedSize)} MB (
                      {compressedResult.savingsPercent}% saved)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="text-[11px] text-neutral-400 font-medium block mb-1">
              Caption (Optional)
            </label>
            <input
              type="text"
              placeholder="What moment does this capture?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Album Selector */}
          <div>
            <label className="text-[11px] text-neutral-400 font-medium block mb-1">
              Organize into Album
            </label>
            <select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {albums.map((alb) => (
                <option key={alb.id} value={alb.id}>
                  {alb.name} {alb.isVaultLocked ? '🔒' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Social Cross-post toggle */}
          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white">Share to Social Feed</span>
                <p className="text-[10px] text-neutral-400">Post simultaneously to your ZERO followers</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={shareToFeed}
              onChange={(e) => setShareToFeed(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

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
              disabled={!previewUrl || isProcessing}
              className="flex-1 py-2 rounded-full bg-emerald-500 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Securing...' : 'Save to Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
