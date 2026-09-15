import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music2,
  Plus,
  Check,
  ChevronUp,
  ChevronDown,
  Send,
  X,
  Upload,
  Sparkles,
  MapPin,
  Film
} from 'lucide-react';
import { ReelItem, User, Comment } from '../types';

export const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel_1',
    userId: 'u_zero_me',
    user: {
      id: 'u_zero_me',
      username: 'kai.vance',
      displayName: 'Kai Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Tidal swell along Big Sur at 60fps. Lossless 4K stored directly in ZERO cloud vault 🌊✨ #BigSur #OceanTide #4KVault #Nature',
    audioTrack: 'Kai Vance • Pacific Ocean Ambient Resonance',
    location: 'Big Sur Coast, California',
    likesCount: 1842,
    commentsCount: 48,
    sharesCount: 230,
    isLiked: false,
    isSaved: false,
    tags: ['ocean', 'waves', 'california', 'cinematic'],
    createdAt: '2026-09-09T16:00:00.000Z',
    comments: [
      {
        id: 'rc_1',
        userId: 'u_maya',
        user: {
          id: 'u_maya',
          username: 'maya.chen',
          displayName: 'Maya Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        },
        text: 'The color grading of that emerald water is perfection! What bitrate did you upload at?',
        createdAt: '2026-09-09T16:30:00.000Z',
        likes: ['u_zero_me'],
      },
      {
        id: 'rc_2',
        userId: 'u_elena',
        user: {
          id: 'u_elena',
          username: 'elena_rostova',
          displayName: 'Elena Rostova',
          avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        },
        text: 'Instantly puts me in a zen trance. Keep them coming Kai! 🌊',
        createdAt: '2026-09-09T17:15:00.000Z',
        likes: [],
      },
    ],
  },
  {
    id: 'reel_2',
    userId: 'u_maya',
    user: {
      id: 'u_maya',
      username: 'maya.chen',
      displayName: 'Maya Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    caption: 'Mountain sunlight cutting through cedar branches and mossy rocks. The dynamic range here is insane 🌿☀️ #Kyoto #Arashiyama #MorningLight',
    audioTrack: 'Maya Chen • Forest Soundscape (Binaural 96kHz)',
    location: 'Arashiyama, Kyoto 🇯🇵',
    likesCount: 2490,
    commentsCount: 89,
    sharesCount: 412,
    isLiked: true,
    isSaved: true,
    tags: ['kyoto', 'japan', 'nature', 'sunlight'],
    createdAt: '2026-09-08T11:20:00.000Z',
    comments: [
      {
        id: 'rc_3',
        userId: 'u_zero_me',
        user: {
          id: 'u_zero_me',
          username: 'kai.vance',
          displayName: 'Kai Vance',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        text: 'The sun rays shimmering on the water surface... outstanding capture Maya!',
        createdAt: '2026-09-08T12:00:00.000Z',
        likes: ['u_maya'],
      },
    ],
  },
  {
    id: 'reel_3',
    userId: 'u_marcus',
    user: {
      id: 'u_marcus',
      username: 'marcus.v',
      displayName: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
    caption: 'Midnight neon traffic arteries in Shibuya after the storm. Shot on cinema drone with anamorphic streak filters 🏙️⚡ #TokyoReels #Cyberpunk #Drone',
    audioTrack: 'Marcus Vance • Tokyo Cyber City (Lo-Fi Drive)',
    location: 'Shinjuku & Shibuya, Tokyo',
    likesCount: 3710,
    commentsCount: 142,
    sharesCount: 580,
    isLiked: false,
    isSaved: false,
    tags: ['tokyo', 'neon', 'nightlife', 'drone'],
    createdAt: '2026-09-07T22:45:00.000Z',
    comments: [
      {
        id: 'rc_4',
        userId: 'u_elena',
        user: {
          id: 'u_elena',
          username: 'elena_rostova',
          displayName: 'Elena Rostova',
          avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        },
        text: 'That smooth tilt-down transition at the overpass is crazy good 🔥',
        createdAt: '2026-09-07T23:10:00.000Z',
        likes: ['u_marcus'],
      },
    ],
  },
  {
    id: 'reel_4',
    userId: 'u_elena',
    user: {
      id: 'u_elena',
      username: 'elena_rostova',
      displayName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-1186-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    caption: '3-hour celestial rotation above the Arctic tundra. Minus 12 degrees Celsius, zero light pollution 🌌❄️ #Aurora #AstroPhotography #SubZero',
    audioTrack: 'Elena Rostova • Cosmic Polar Drift (Binaural Ambient)',
    location: 'Abisko National Park, Sweden',
    likesCount: 4120,
    commentsCount: 195,
    sharesCount: 780,
    isLiked: true,
    isSaved: true,
    tags: ['stars', 'sky', 'arctic', 'timelapse'],
    createdAt: '2026-09-06T03:30:00.000Z',
    comments: [],
  },
  {
    id: 'reel_5',
    userId: 'u_zero_me',
    user: {
      id: 'u_zero_me',
      username: 'kai.vance',
      displayName: 'Kai Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    caption: 'Golden hour canyon flyby. The red sandstone formations glowing in the dusk light 🏜️🦅 #Sedona #RedRocks #DroneCinematography',
    audioTrack: 'Original Sound • Desert Twilight Symphony',
    location: 'Sedona, Arizona',
    likesCount: 1930,
    commentsCount: 62,
    sharesCount: 310,
    isLiked: false,
    isSaved: false,
    tags: ['canyon', 'sunset', 'drone', 'redrocks'],
    createdAt: '2026-09-05T19:00:00.000Z',
    comments: [],
  },
];

interface ReelsViewProps {
  currentUser: User;
  onOpenUserProfile?: (userId: string) => void;
  onToggleFollow?: (userId: string) => void;
  onShareReel?: (reel: ReelItem) => void;
  onToast?: (message: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  currentUser,
  onOpenUserProfile,
  onToggleFollow,
  onShareReel,
  onToast,
}) => {
  const [reels, setReels] = useState<ReelItem[]>(INITIAL_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'for_you' | 'vault' | 'trending' | 'following'>('for_you');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReelCaption, setNewReelCaption] = useState('');
  const [newReelAudio, setNewReelAudio] = useState('Original Audio • ZERO Sound Vault');
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentReel = reels[currentIndex] || reels[0];

  // Auto-play / restart video on index change
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Fallback to muted autoplay if browser blocks audio
        setIsMuted(true);
        videoRef.current?.play().catch(() => {});
      });
    }
  }, [currentIndex]);

  // Update playback progress
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Toggle Mute / Unmute
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (onToast) {
      onToast(!isMuted ? 'Muted' : 'Audio Unmuted 🔊');
    }
  };

  // Double tap to like
  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);

    if (!currentReel.isLiked) {
      handleToggleLike();
    }
  };

  // Toggle Like
  const handleToggleLike = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReels((prev) =>
      prev.map((r, i) => {
        if (i === currentIndex) {
          const nowLiked = !r.isLiked;
          return {
            ...r,
            isLiked: nowLiked,
            likesCount: nowLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
          };
        }
        return r;
      })
    );
  };

  // Toggle Save to Vault
  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReels((prev) =>
      prev.map((r, i) => {
        if (i === currentIndex) {
          const nowSaved = !r.isSaved;
          if (onToast) {
            onToast(nowSaved ? 'Reel saved to Vault Bookmarks 🔖' : 'Removed from Bookmarks');
          }
          return { ...r, isSaved: nowSaved };
        }
        return r;
      })
    );
  };

  // Share Reel
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareReel) {
      onShareReel(currentReel);
    } else {
      navigator.clipboard?.writeText?.(window.location.href);
      if (onToast) {
        onToast('Reel link copied to clipboard! 🔗');
      }
    }
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: `rc_${Date.now()}`,
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
      },
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      likes: [],
    };

    setReels((prev) =>
      prev.map((r, i) => {
        if (i === currentIndex) {
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [...(r.comments || []), newComment],
          };
        }
        return r;
      })
    );

    setNewCommentText('');
    if (onToast) {
      onToast('Comment posted! 💬');
    }
  };

  // Next / Previous Reel Navigation
  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop back to first reel
      setCurrentIndex(0);
    }
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(reels.length - 1);
    }
  };

  // Publish new Reel
  const handlePublishReel = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
      const createdReel: ReelItem = {
        id: `reel_${Date.now()}`,
        userId: currentUser.id,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
        },
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        caption: newReelCaption || 'Fresh 4K clip uploaded to ZERO cloud vault! 🎥✨',
        audioTrack: newReelAudio || 'Original Audio • ZERO Sound Vault',
        location: 'Cloud Vault Studio',
        likesCount: 1,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: true,
        isSaved: false,
        tags: ['vault', 'reels', '4k'],
        createdAt: new Date().toISOString(),
        comments: [],
      };

      setReels([createdReel, ...reels]);
      setCurrentIndex(0);
      setIsUploading(false);
      setShowCreateModal(false);
      setNewReelCaption('');
      if (onToast) {
        onToast('New Reel published to ZERO feed! 🎬✨');
      }
    }, 900);
  };

  // Format numbers (1.8K, etc.)
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const isFollowingCreator =
    currentUser.following?.includes(currentReel.userId) || currentReel.userId === currentUser.id;

  return (
    <div
      id="zero-reels-container"
      className="relative w-full h-full bg-black select-none overflow-hidden flex flex-col justify-between"
    >
      {/* Top Header Overlay: Category Filters & Quick Actions */}
      <div className="absolute top-0 inset-x-0 z-30 pt-3 pb-6 px-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
        {/* Title and Filter Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white font-bold tracking-tight text-base mr-1">
            <Film className="w-5 h-5 text-emerald-400" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Reels
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs bg-black/40 backdrop-blur-md p-0.5 rounded-full border border-neutral-800/80">
            <button
              onClick={() => setActiveFilter('for_you')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                activeFilter === 'for_you' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              For You
            </button>
            <button
              onClick={() => setActiveFilter('vault')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                activeFilter === 'vault' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vault 4K
            </button>
            <button
              onClick={() => setActiveFilter('trending')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                activeFilter === 'trending' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Trending
            </button>
          </div>
        </div>

        {/* Right Top Actions: Add Reel & Sound Toggle */}
        <div className="flex items-center gap-2">
          {/* Upload Reel Button */}
          <button
            id="reels-create-btn"
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title="Create / Upload Reel"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            id="reels-audio-toggle-btn"
            onClick={handleToggleMute}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div
        id="reels-viewport-area"
        onClick={handleTogglePlay}
        onDoubleClick={handleDoubleTap}
        className="relative w-full h-full flex items-center justify-center cursor-pointer bg-neutral-950"
      >
        <video
          ref={videoRef}
          src={currentReel.videoUrl}
          poster={currentReel.thumbnailUrl}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
        />

        {/* Play / Pause Indicator (Center Flash) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/25">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl scale-110 transition-transform">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Double-Tap Heart Burst Animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-out fade-out zoom-out duration-700">
            <div className="w-24 h-24 rounded-full bg-rose-500/20 backdrop-blur-sm flex items-center justify-center border border-rose-500/40">
              <Heart className="w-16 h-16 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-bounce" />
            </div>
          </div>
        )}

        {/* Up / Down Navigation Controls (Floated in the center-right) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          <button
            id="reel-prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevReel();
            }}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-neutral-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Previous Reel"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            id="reel-next-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNextReel();
            }}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-neutral-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Next Reel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Right Engagement Actions Bar */}
        <div
          id="reels-actions-sidebar"
          className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-4 text-white"
        >
          {/* Creator Avatar with Follow Button */}
          <div className="relative flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenUserProfile) onOpenUserProfile(currentReel.userId);
              }}
              className="w-11 h-11 rounded-full ring-2 ring-emerald-400/80 overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={currentReel.user.avatarUrl}
                alt={currentReel.user.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
            {currentReel.userId !== currentUser.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleFollow) onToggleFollow(currentReel.userId);
                }}
                className={`absolute -bottom-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 ${
                  isFollowingCreator ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/50' : 'bg-emerald-500 text-black font-bold'
                }`}
                title={isFollowingCreator ? 'Following' : 'Follow Creator'}
              >
                {isFollowingCreator ? <Check className="w-3 h-3 stroke-[3px]" /> : <Plus className="w-3.5 h-3.5 stroke-[3px]" />}
              </button>
            )}
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              id="reel-like-btn"
              onClick={handleToggleLike}
              className={`p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-90 ${
                currentReel.isLiked ? 'text-rose-500' : 'text-white'
              }`}
              title="Like Reel"
            >
              <Heart className={`w-6 h-6 ${currentReel.isLiked ? 'fill-rose-500 stroke-rose-500' : 'stroke-[2px]'}`} />
            </button>
            <span className="text-[11px] font-semibold text-neutral-200 drop-shadow">
              {formatCount(currentReel.likesCount)}
            </span>
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              id="reel-comment-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentsModal(true);
              }}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer hover:scale-110 active:scale-90"
              title="View & Add Comments"
            >
              <MessageCircle className="w-6 h-6 stroke-[2px]" />
            </button>
            <span className="text-[11px] font-semibold text-neutral-200 drop-shadow">
              {formatCount(currentReel.commentsCount)}
            </span>
          </div>

          {/* Bookmark / Vault Save Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              id="reel-save-btn"
              onClick={handleToggleSave}
              className={`p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 transition-all cursor-pointer hover:scale-110 active:scale-90 ${
                currentReel.isSaved ? 'text-amber-400' : 'text-white'
              }`}
              title="Save to Vault Bookmarks"
            >
              <Bookmark className={`w-6 h-6 ${currentReel.isSaved ? 'fill-amber-400 stroke-amber-400' : 'stroke-[2px]'}`} />
            </button>
            <span className="text-[11px] font-semibold text-neutral-200 drop-shadow">
              Save
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              id="reel-share-btn"
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer hover:scale-110 active:scale-90"
              title="Share Reel"
            >
              <Share2 className="w-6 h-6 stroke-[2px]" />
            </button>
            <span className="text-[11px] font-semibold text-neutral-200 drop-shadow">
              {formatCount(currentReel.sharesCount)}
            </span>
          </div>

          {/* Animated Vinyl Sound Disc */}
          <div className="pt-2">
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-900 to-neutral-700 border-2 border-neutral-600/80 p-1 flex items-center justify-center shadow-lg ${
                isPlaying ? 'animate-spin [animation-duration:4s]' : ''
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 border border-black flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Left Information Overlay */}
        <div
          id="reels-info-overlay"
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 bottom-3 right-16 z-20 p-4 text-white bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-auto"
        >
          {/* Creator Tag & Verified Badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => {
                if (onOpenUserProfile) onOpenUserProfile(currentReel.userId);
              }}
              className="font-bold text-sm tracking-wide hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>@{currentReel.user.username}</span>
              {currentReel.user.isVerified && (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-black text-[9px] font-bold flex items-center justify-center">
                  ✓
                </span>
              )}
            </button>
            <span className="text-[11px] text-neutral-400 font-medium">• 4K HDR</span>
          </div>

          {/* Location Tag */}
          {currentReel.location && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium mb-2">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{currentReel.location}</span>
            </div>
          )}

          {/* Caption */}
          <p className="text-xs text-neutral-100 leading-relaxed mb-2.5 line-clamp-2 hover:line-clamp-none transition-all drop-shadow">
            {currentReel.caption}
          </p>

          {/* Audio Ticker Marquee */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-300 bg-neutral-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 w-fit max-w-full">
            <Music2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate max-w-[210px] font-medium">{currentReel.audioTrack}</span>
          </div>
        </div>

        {/* Video Playback Progress Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Slide-Up Comments Drawer */}
      {showCommentsModal && (
        <div
          id="reels-comments-drawer"
          onClick={() => setShowCommentsModal(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[70vh] bg-neutral-900 border-t border-neutral-800 rounded-t-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
          >
            {/* Drawer Header */}
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
              <div className="w-8" />
              <div className="flex flex-col items-center">
                <div className="w-8 h-1 rounded-full bg-neutral-700 mb-2" />
                <span className="text-sm font-bold text-white">
                  Comments ({currentReel.comments?.length || 0})
                </span>
              </div>
              <button
                onClick={() => setShowCommentsModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {(currentReel.comments || []).length === 0 ? (
                <div className="py-10 text-center text-neutral-500 text-xs">
                  No comments yet. Be the first to start the conversation!
                </div>
              ) : (
                currentReel.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 items-start">
                    <img
                      src={comment.user.avatarUrl}
                      alt={comment.user.displayName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 bg-neutral-800/60 rounded-xl px-3 py-2 border border-neutral-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">
                          @{comment.user.username}
                        </span>
                        <span className="text-[10px] text-neutral-400">Just now</span>
                      </div>
                      <p className="text-xs text-neutral-200">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sticky New Comment Input */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-neutral-800 bg-neutral-950 flex gap-2">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`Comment as @${currentUser.username}...`}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-4 py-1.5 rounded-full bg-emerald-500 text-black font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload / Create New Reel Modal */}
      {showCreateModal && (
        <div
          id="reels-upload-modal"
          onClick={() => setShowCreateModal(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">New Reel / Video</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishReel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Reel Caption & Hashtags
                </label>
                <textarea
                  value={newReelCaption}
                  onChange={(e) => setNewReelCaption(e.target.value)}
                  placeholder="Tell your story... #4K #Vault #Cinematic"
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Audio Track
                </label>
                <input
                  type="text"
                  value={newReelAudio}
                  onChange={(e) => setNewReelAudio(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Lossless 4K preview will be stored in your ZERO cloud vault.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !newReelCaption.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-opacity disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Post Reel</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
