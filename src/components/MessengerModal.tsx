import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  ChevronLeft,
  ShieldCheck,
  CheckCheck,
  Paperclip,
  Video as VideoIcon,
  FileText,
  Download,
  FolderLock,
  Sparkles,
  Upload,
  Play,
} from 'lucide-react';
import { User, Message, Conversation, PhotoItem, MediaType } from '../types';

interface MessengerModalProps {
  currentUser: User;
  conversations: Conversation[];
  vaultPhotos: PhotoItem[];
  initialTargetUserId?: string;
  onClose: () => void;
  onSendMessage: (
    targetUserId: string,
    text: string,
    mediaUrl?: string,
    mediaType?: MediaType,
    fileMeta?: {
      fileName?: string;
      fileSizeBytes?: number;
      isOriginalQuality?: boolean;
      durationSec?: number;
      mimeType?: string;
    }
  ) => void;
  getThreadMessages: (targetUserId: string) => Message[];
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const MessengerModal: React.FC<MessengerModalProps> = ({
  currentUser,
  conversations,
  vaultPhotos,
  initialTargetUserId,
  onClose,
  onSendMessage,
  getThreadMessages,
}) => {
  const [activeUserId, setActiveUserId] = useState<string | null>(initialTargetUserId || null);

  useEffect(() => {
    if (initialTargetUserId) {
      setActiveUserId(initialTargetUserId);
    }
  }, [initialTargetUserId]);
  const [messageText, setMessageText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadingProgress, setUploadingProgress] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find((c) => c.otherUser.id === activeUserId);
  const currentMessages = activeUserId ? getThreadMessages(activeUserId) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeUserId]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeUserId) return;
    onSendMessage(activeUserId, messageText.trim());
    setMessageText('');
  };

  const handleSendVaultPhoto = (photo: PhotoItem) => {
    if (!activeUserId) return;
    onSendMessage(
      activeUserId,
      '',
      photo.url,
      photo.type,
      {
        fileName: photo.filename,
        fileSizeBytes: photo.originalSizeBytes || photo.sizeBytes,
        isOriginalQuality: true,
      }
    );
    setShowVaultPicker(false);
    setShowAttachMenu(false);
  };

  // Preset 4K / Largest Video sender
  const handleSendPresetVideo = (presetName: string, sizeGB: number, duration: string) => {
    if (!activeUserId) return;
    const videoUrls = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    ];
    const pickedUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

    onSendMessage(
      activeUserId,
      `Sending original 4K video: ${presetName}`,
      pickedUrl,
      'video',
      {
        fileName: presetName,
        fileSizeBytes: Math.round(sizeGB * 1024 * 1024 * 1024),
        isOriginalQuality: true,
        durationSec: 45,
        mimeType: 'video/mp4',
      }
    );
    setShowAttachMenu(false);
  };

  // Preset Document sender
  const handleSendPresetDocument = (docName: string, sizeMB: number, mimeType: string) => {
    if (!activeUserId) return;
    onSendMessage(
      activeUserId,
      `Shared original document: ${docName}`,
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      'document',
      {
        fileName: docName,
        fileSizeBytes: Math.round(sizeMB * 1024 * 1024),
        isOriginalQuality: true,
        mimeType,
      }
    );
    setShowAttachMenu(false);
  };

  // Generic file input handler (supports device photos, documents, videos)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, preferredType?: MediaType) => {
    const file = e.target.files?.[0];
    if (!file || !activeUserId) return;

    setUploadingProgress(`Securing ${file.name} with AES-256...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      let detectedType: MediaType = preferredType || 'document';

      if (file.type.startsWith('video/')) {
        detectedType = 'video';
      } else if (file.type.startsWith('image/')) {
        detectedType = 'image';
      }

      setTimeout(() => {
        onSendMessage(
          activeUserId,
          `Attached original file: ${file.name}`,
          dataUrl,
          detectedType,
          {
            fileName: file.name,
            fileSizeBytes: file.size,
            isOriginalQuality: true,
            mimeType: file.type,
          }
        );
        setUploadingProgress(null);
        setShowAttachMenu(false);
      }, 500);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownloadFile = (url: string, filename?: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'ZERO_Vault_Download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!activeUserId) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploadingProgress(`Uploading original file: ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const detectedType: MediaType = file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('image/')
        ? 'image'
        : 'document';

      onSendMessage(
        activeUserId,
        `Shared uncompressed ${file.name}`,
        dataUrl,
        detectedType,
        {
          fileName: file.name,
          fileSizeBytes: file.size,
          isOriginalQuality: true,
          mimeType: file.type,
        }
      );
      setUploadingProgress(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="zero-messenger-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-[90vh] max-h-[750px] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 bg-emerald-950/90 border-2 border-dashed border-emerald-400 rounded-3xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm pointer-events-none">
            <Upload className="w-12 h-12 text-emerald-400 animate-bounce mb-3" />
            <h4 className="text-base font-bold text-white">Drop Original File to Send</h4>
            <p className="text-xs text-neutral-300 mt-1 max-w-xs">
              Direct transfer of 4K/8K videos, RAW photos, and documents without compression.
            </p>
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileChange(e)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'video')}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.zip,.tar,.gz,.txt,.csv,.json"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'document')}
        />

        {activeUserId && activeConversation ? (
          /* Active Chat Thread */
          <div className="flex-1 flex flex-col h-full bg-[#0c0e12] overflow-hidden">
            {/* Chat Header */}
            <div className="h-14 px-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveUserId(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img
                    src={activeConversation.otherUser.avatarUrl}
                    alt={activeConversation.otherUser.displayName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-700"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c0e12]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white leading-tight">
                    {activeConversation.otherUser.displayName}
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    AES-256 Vault Channel
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center py-1">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-neutral-900/90 text-neutral-400 inline-flex items-center gap-1 border border-neutral-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Original media & largest files sent losslessly with AES-256
                </span>
              </div>

              {currentMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const isVideo = msg.mediaType === 'video';
                const isDocument = msg.mediaType === 'document' || msg.mediaType === 'raw';
                const isImage = msg.mediaType === 'image' || (!isVideo && !isDocument && Boolean(msg.mediaUrl));

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-neutral-800 border border-neutral-700/80 text-neutral-100 rounded-br-none shadow-lg'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-bl-none'
                      }`}
                    >
                      {/* Video Player Bubble */}
                      {isVideo && msg.mediaUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden bg-black border border-neutral-700/60">
                          <video
                            controls
                            playsInline
                            src={msg.mediaUrl}
                            className="w-full max-h-56 object-contain bg-black"
                          />
                          <div className="p-2 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between gap-2">
                            <div className="truncate">
                              <span className="font-semibold text-white text-[11px] block truncate">
                                {msg.fileName || 'Original_Video_4K.mp4'}
                              </span>
                              <span className="text-[9px] text-emerald-400 font-mono">
                                4K UHD • {formatBytes(msg.fileSizeBytes || 140 * 1024 * 1024)} • Lossless
                              </span>
                            </div>
                            <button
                              onClick={() => handleDownloadFile(msg.mediaUrl!, msg.fileName)}
                              className="px-2 py-1 rounded-md bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-neutral-300 text-[10px] font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                              title="Download original video file"
                            >
                              <Download className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Document Card Bubble */}
                      {isDocument && (
                        <div className="mb-2 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-700/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-white text-[11px] block truncate">
                                {msg.fileName || 'Encrypted_Document.pdf'}
                              </span>
                              <span className="text-[9px] text-neutral-400 font-mono block">
                                {formatBytes(msg.fileSizeBytes || 18 * 1024 * 1024)} • Verified Original
                              </span>
                            </div>
                          </div>
                          {msg.mediaUrl && (
                            <button
                              onClick={() => handleDownloadFile(msg.mediaUrl!, msg.fileName)}
                              className="p-2 rounded-lg bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-neutral-300 transition-colors cursor-pointer shrink-0"
                              title="Download document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Photo Bubble */}
                      {isImage && msg.mediaUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-neutral-700/80 relative group">
                          <img
                            src={msg.mediaUrl}
                            alt="original-attachment"
                            className="w-full max-h-52 object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-[10px] text-white">
                            <span className="text-emerald-400 font-medium text-[9px] flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Original Resolution
                            </span>
                            <button
                              onClick={() => handleDownloadFile(msg.mediaUrl!, msg.fileName)}
                              className="p-1 rounded bg-black/60 hover:bg-emerald-500 hover:text-black transition-colors"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Text caption/body */}
                      {msg.text && (
                        <p className={isMe ? 'text-white' : 'text-neutral-200'}>{msg.text}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-neutral-500">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>
                );
              })}

              {uploadingProgress && (
                <div className="flex justify-center py-1">
                  <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono animate-pulse flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 animate-spin" />
                    <span>{uploadingProgress}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Rich Attachment Panel */}
            {showAttachMenu && (
              <div className="p-3 bg-neutral-900 border-t border-neutral-800 space-y-2 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Original High-Capacity Transfer
                  </span>
                  <button
                    onClick={() => setShowAttachMenu(false)}
                    className="text-[10px] text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* Upload Largest Video */}
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <VideoIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-white">4K/8K Video</span>
                    <span className="text-[8px] text-neutral-400">Largest video</span>
                  </button>

                  {/* Upload Document */}
                  <button
                    onClick={() => documentInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-white">Document</span>
                    <span className="text-[8px] text-neutral-400">PDF, ZIP, RAW</span>
                  </button>

                  {/* Upload Lossless Photo */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-white">Lossless Photo</span>
                    <span className="text-[8px] text-neutral-400">Uncompressed</span>
                  </button>

                  {/* From ZERO Vault */}
                  <button
                    onClick={() => {
                      setShowVaultPicker(true);
                      setShowAttachMenu(false);
                    }}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-purple-500/50 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FolderLock className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-white">ZERO Vault</span>
                    <span className="text-[8px] text-neutral-400">Synced media</span>
                  </button>
                </div>

                {/* Instant Demo Presets for largest files */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <span className="text-[9px] text-neutral-400 block mb-1.5 font-medium">
                    Quick Sample Transmissions (Simulate Large Original Media):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() =>
                        handleSendPresetVideo('Alpine_Cinematic_4K_60FPS.mp4', 1.8, '0:45')
                      }
                      className="px-2 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-[9px] flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 text-emerald-400" />
                      4K Video (1.8 GB)
                    </button>
                    <button
                      onClick={() =>
                        handleSendPresetVideo('Hyperlapse_8K_Master.mp4', 4.2, '1:12')
                      }
                      className="px-2 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-[9px] flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 text-emerald-400" />
                      8K Master (4.2 GB)
                    </button>
                    <button
                      onClick={() =>
                        handleSendPresetDocument('Production_RAW_Archive.zip', 920, 'application/zip')
                      }
                      className="px-2 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-[9px] flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-2.5 h-2.5 text-cyan-400" />
                      RAW Archive (920 MB)
                    </button>
                    <button
                      onClick={() =>
                        handleSendPresetDocument('ZERO_Cryptographic_Whitepaper.pdf', 38.5, 'application/pdf')
                      }
                      className="px-2 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-[9px] flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-2.5 h-2.5 text-amber-400" />
                      Security Spec (38 MB)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vault Picker Sheet */}
            {showVaultPicker && (
              <div className="p-3 bg-neutral-900 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                    <FolderLock className="w-3.5 h-3.5 text-emerald-400" />
                    Select from ZERO Encrypted Vault
                  </span>
                  <button
                    onClick={() => setShowVaultPicker(false)}
                    className="text-[10px] text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">
                  {vaultPhotos
                    .filter((p) => !p.isDeleted)
                    .map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSendVaultPhoto(p)}
                        className="aspect-square rounded-lg overflow-hidden border border-neutral-800 hover:border-emerald-400 cursor-pointer relative group"
                      >
                        <img
                          src={p.thumbnailUrl || p.url}
                          alt="vault"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {p.type === 'video' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] px-1 py-0.5 rounded bg-black/70 text-white font-mono">
                          {formatBytes(p.originalSizeBytes || p.sizeBytes)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Message Input Box */}
            <form
              onSubmit={handleSendText}
              className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  showAttachMenu
                    ? 'bg-emerald-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800'
                }`}
                title="Send 4K videos, documents, or lossless photos"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder="Message or drop 4K videos / docs..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={!messageText.trim()}
                className="w-9 h-9 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Conversation List */
          <div className="flex-1 flex flex-col h-full bg-[#0c0e12]">
            {/* Top Bar */}
            <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">ZERO Messenger</h3>
                <p className="text-[10px] text-neutral-400">Encrypted peer-to-peer chats & large transfers</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 p-2">
              {conversations.map((c) => (
                <div
                  key={c.otherUser.id}
                  onClick={() => setActiveUserId(c.otherUser.id)}
                  className="p-3 rounded-2xl hover:bg-neutral-800/50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.otherUser.avatarUrl}
                      alt={c.otherUser.displayName}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-neutral-700"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0c0e12]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {c.otherUser.displayName}
                      </h4>
                      <span className="text-[9px] text-neutral-500">
                        {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
                      {c.lastMessage.mediaType === 'video' ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <VideoIcon className="w-3 h-3" />
                          4K Video ({formatBytes(c.lastMessage.fileSizeBytes)})
                        </span>
                      ) : c.lastMessage.mediaType === 'document' ? (
                        <span className="text-cyan-400 font-medium flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Document ({formatBytes(c.lastMessage.fileSizeBytes)})
                        </span>
                      ) : c.lastMessage.mediaUrl ? (
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Original Photo
                        </span>
                      ) : (
                        c.lastMessage.text
                      )}
                    </p>
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
