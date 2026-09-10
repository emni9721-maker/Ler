import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, Eye, Shield } from 'lucide-react';
import { Story, User, UserStoryGroup } from '../types';

interface StoriesViewerProps {
  stories?: Story[];
  storyGroup?: UserStoryGroup;
  initialIndex?: number;
  currentUser?: User;
  onClose: () => void;
  onReply?: (targetId: string, text: string) => void;
  onReact?: (storyId: string, emoji: string) => void;
}

export const StoriesViewer: React.FC<StoriesViewerProps> = ({
  stories,
  storyGroup,
  initialIndex = 0,
  currentUser,
  onClose,
  onReply,
  onReact,
}) => {
  const resolvedStories = stories || storyGroup?.stories || [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sentToast, setSentToast] = useState(false);
  const [reactedEmoji, setReactedEmoji] = useState<string | null>(null);

  const duration = 6000; // 6 seconds per story
  const currentStory = resolvedStories[currentIndex];

  useEffect(() => {
    if (!currentStory || isPaused) return;

    const interval = 50; // update every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, currentStory]);

  const handleNext = () => {
    if (currentIndex < resolvedStories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      setReactedEmoji(null);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setReactedEmoji(null);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;
    if (onReply) {
      onReply(currentStory.userId, `Replied to your story: "${replyText.trim()}"`);
    }
    setReplyText('');
    setSentToast(true);
    setTimeout(() => setSentToast(false), 2000);
  };

  const handleQuickReaction = (emoji: string) => {
    if (!currentStory) return;
    setReactedEmoji(emoji);
    if (onReact) onReact(currentStory.id, emoji);
    if (onReply) onReply(currentStory.userId, `Reacted ${emoji} to your story`);
    setSentToast(true);
    setTimeout(() => setSentToast(false), 2000);
  };

  if (!currentStory) return null;

  // Calculate hours remaining before 24h expiration
  const hoursLeft = Math.max(1, Math.round((currentStory.expiresAt - Date.now()) / (1000 * 60 * 60)));

  return (
    <div
      id="zero-story-viewer-modal"
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none"
    >
      <div
        className="relative w-full max-w-[430px] h-full sm:h-[90vh] sm:max-h-[850px] bg-neutral-950 sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Story Progress Segments */}
        <div className="absolute top-3 left-0 right-0 z-40 px-3 flex gap-1.5">
          {resolvedStories.map((s, idx) => (
            <div key={s.id || `story-seg-${idx}`} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="absolute top-7 left-0 right-0 z-40 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentStory.user.avatarUrl}
              alt={currentStory.user.displayName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
                  {currentStory.user.displayName}
                </span>
                <span className="text-[10px] text-white/70">@{currentStory.user.username}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                <span className="text-emerald-400 font-medium">Expires in {hoursLeft}h</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[10px] text-white/60">
                  <Shield className="w-2.5 h-2.5" /> ZERO Story
                </span>
              </div>
            </div>
          </div>

          <button
            id="close-story-viewer-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Display Area with Left/Right tap zones */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              muted
              playsInline
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Left / Right touch navigation zones */}
          <div
            className="absolute top-16 bottom-20 left-0 w-1/3 z-20 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          />
          <div
            className="absolute top-16 bottom-20 right-0 w-1/3 z-20 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          />

          {/* Caption Overlay */}
          {currentStory.caption && (
            <div className="absolute bottom-24 left-4 right-4 z-30 bg-black/60 backdrop-blur-md p-3 rounded-2xl text-white text-sm">
              {currentStory.caption}
            </div>
          )}

          {/* Reaction Burst */}
          {reactedEmoji && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-bounce text-6xl">
              {reactedEmoji}
            </div>
          )}
        </div>

        {/* Bottom Reaction & Reply Bar */}
        <div className="absolute bottom-4 left-0 right-0 z-40 px-4 space-y-2">
          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-center gap-4 bg-black/40 backdrop-blur-md py-1.5 px-3 rounded-full mx-auto w-max">
            {['❤️', '🔥', '👏', '😮', '😂', '✨'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleQuickReaction(emoji)}
                className="text-xl hover:scale-125 active:scale-95 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Send message to ${currentStory.user.displayName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              className="flex-1 bg-neutral-900/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {sentToast && (
            <div className="text-center text-xs text-emerald-400 font-medium py-0.5">
              Reply sent via ZERO Messenger!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
