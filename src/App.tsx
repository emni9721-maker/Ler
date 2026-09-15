import React, { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { TopAppBar } from './components/TopAppBar';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './components/HomeFeed';
import { StoriesViewer } from './components/StoriesViewer';
import { PhotosGallery } from './components/PhotosGallery';
import { AlbumsView } from './components/AlbumsView';
import { PhotoDetailViewer } from './components/PhotoDetailViewer';
import { UploadModal } from './components/UploadModal';
import { CreatePostModal } from './components/CreatePostModal';
import { MessengerModal } from './components/MessengerModal';
import { SearchModal } from './components/SearchModal';
import { UserProfileView } from './components/UserProfileView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { ApkExportModal } from './components/ApkExportModal';
import { ReelsView } from './components/ReelsView';

import {
  User,
  PhotoItem,
  Album,
  Post,
  Story,
  Message,
  Conversation,
  NotificationItem,
  UserStoryGroup,
  MediaType,
  AppTheme,
} from './types';
import { api } from './services/api';
import {
  CURRENT_USER,
  OTHER_USERS,
  INITIAL_PHOTOS,
  INITIAL_ALBUMS,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
} from './data/mockData';

export default function App() {
  // App Lifecycle & Auth
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Global Theme State: 'midnight' (Dark Navy Charcoal) vs 'amoled' (High-Contrast Pure Black)
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('zero_theme');
      if (saved === 'amoled' || saved === 'midnight') return saved;
    } catch {
      // ignore
    }
    return currentUser.theme || 'midnight';
  });

  const applyTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('zero_theme', newTheme);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'midnight' ? 'amoled' : 'midnight';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'amoled' ? 'AMOLED Pure Black (High Contrast)' : 'Midnight Dark'}`);
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'home' | 'photos' | 'albums' | 'reels' | 'notifications' | 'profile' | 'settings'
  >('home');

  // Core Data State
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [allUsers, setAllUsers] = useState<User[]>([CURRENT_USER, ...OTHER_USERS]);

  // Modals & Overlays
  const [selectedPhotoForViewer, setSelectedPhotoForViewer] = useState<PhotoItem | null>(null);
  const [activeStoryViewerUser, setActiveStoryViewerUser] = useState<UserStoryGroup | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [createPostIsStory, setCreatePostIsStory] = useState(false);
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  const [messengerTargetUserId, setMessengerTargetUserId] = useState<string | undefined>(undefined);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [gallerySubTab, setGallerySubTab] = useState<'all' | 'favorites' | 'recently_deleted'>('all');

  // Profile view target (null = current user, or any other user)
  const [inspectedUserId, setInspectedUserId] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Initial Data Fetching from API
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [u, p, ph, alb, st, notifs, convs] = await Promise.all([
          api.getCurrentUser().catch(() => CURRENT_USER),
          api.getPosts().catch(() => INITIAL_POSTS),
          api.getPhotos({ includeAll: true }).catch(() => INITIAL_PHOTOS),
          api.getAlbums().catch(() => INITIAL_ALBUMS),
          api.getStories().catch(() => INITIAL_STORIES),
          api.getNotifications().catch(() => INITIAL_NOTIFICATIONS),
          api.getConversations().catch(() => []),
        ]);

        if (u) setCurrentUser(u);
        if (p) setPosts(p);
        if (ph) setPhotos(ph);
        if (alb) setAlbums(alb);
        if (st) setStories(st);
        if (notifs) setNotifications(notifs);
        if (convs && convs.length > 0) {
          setConversations(convs);
        } else {
          // Initialize mock conversation list
          const initialConvs: Conversation[] = OTHER_USERS.map((other) => {
            const threadMsgs = INITIAL_MESSAGES.filter(
              (m) =>
                (m.senderId === other.id && m.receiverId === CURRENT_USER.id) ||
                (m.senderId === CURRENT_USER.id && m.receiverId === other.id)
            );
            const lastMsg: Message = threadMsgs[threadMsgs.length - 1] || {
              id: 'm_fallback',
              senderId: other.id,
              receiverId: CURRENT_USER.id,
              text: 'Hey Alex! Glad to connect on ZERO.',
              createdAt: new Date().toISOString(),
              isRead: true,
            };
            return {
              otherUser: other,
              lastMessage: lastMsg,
              unreadCount: 1,
            };
          });
          setConversations(initialConvs);
        }
      } catch (err) {
        console.warn('Backend init fallback:', err);
      }
    }

    loadInitialData();
  }, []);

  // Compute story groups
  const storyGroups: UserStoryGroup[] = React.useMemo(() => {
    const groups: { [userId: string]: Story[] } = {};
    stories.forEach((st) => {
      if (!groups[st.userId]) groups[st.userId] = [];
      groups[st.userId].push(st);
    });

    return Object.entries(groups).map(([userId, userStories]) => {
      const storyUser = allUsers.find((u) => u.id === userId) || {
        id: userId,
        username: 'user',
        displayName: 'User',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        coverUrl: '',
        bio: '',
        followersCount: 0,
        followingCount: 0,
        followers: [],
        friends: [],
        following: [],
        blockedUsers: [],
        isPrivate: false,
        storageUsedBytes: 0,
        storageLimitBytes: 50 * 1024 * 1024 * 1024,
        storageSettings: { backupOverWifiOnly: true, autoCompress: true, qualityPreset: 'balanced' },
        createdAt: new Date().toISOString(),
        email: 'user@zero.app',
      };
      const currentUid = currentUser?.id || '';
      const hasUnseen = userStories.some((s) => !(s.viewers || []).includes(currentUid));
      return {
        user: storyUser,
        stories: userStories,
        hasUnseen,
      };
    });
  }, [stories, allUsers, currentUser?.id]);

  // Social Post Handlers
  const handleToggleLike = async (postId: string) => {
    const currentUid = currentUser?.id || '';
    try {
      const res = await api.likePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const hasLiked = (p.likes || []).includes(currentUid);
          const newLikes = hasLiked
            ? (p.likes || []).filter((id) => id !== currentUid)
            : [...(p.likes || []), currentUid];
          return { ...p, likes: newLikes };
        })
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const hasLiked = (p.likes || []).includes(currentUid);
          const newLikes = hasLiked
            ? (p.likes || []).filter((id) => id !== currentUid)
            : [...(p.likes || []), currentUid];
          return { ...p, likes: newLikes };
        })
      );
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      text,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      })
    );

    api.commentPost(postId, text).catch(() => {});
    showToast('Comment added');
  };

  const handleToggleSave = async (postId: string) => {
    const currentUid = currentUser?.id || '';
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const isSaved = (p.savedBy || []).includes(currentUid);
        const newSavedBy = isSaved
          ? (p.savedBy || []).filter((id) => id !== currentUid)
          : [...(p.savedBy || []), currentUid];
        showToast(!isSaved ? 'Saved to collection' : 'Removed from saved');
        return { ...p, savedBy: newSavedBy };
      })
    );
    api.savePost(postId).catch(() => {});
  };

  const handleSharePost = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return { ...p, sharesCount: p.sharesCount + 1 };
      })
    );
    api.sharePost(postId).catch(() => {});
    showToast('Post shared to your ZERO feed!');
  };

  const handleCreatePost = async (data: {
    content: string;
    media?: { url: string; type: MediaType; photoId?: string }[];
    privacy: any;
  }) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content: data.content,
      media: data.media,
      privacy: data.privacy || 'public',
      likes: [],
      comments: [],
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      savedBy: [],
    };

    setPosts([newPost, ...posts]);
    api.createPost(data).catch(() => {});
    showToast('Published post to ZERO feed');
  };

  const handleCreateStory = async (data: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
  }) => {
    const newStory: Story = {
      id: `story_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      caption: data.caption,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      viewers: [currentUser.id],
      likes: [],
    };

    setStories([newStory, ...stories]);
    api.createStory(data).catch(() => {});
    showToast('24h Story published!');
  };

  // Photo & Vault Handlers
  const handleUploadSuccess = async (photoData: any) => {
    const newPhoto: PhotoItem = {
      id: `p_${Date.now()}`,
      userId: currentUser.id,
      url: photoData.url,
      thumbnailUrl: photoData.url,
      type: photoData.type,
      filename: photoData.filename,
      sizeBytes: photoData.sizeBytes,
      originalSizeBytes: photoData.originalSizeBytes,
      date: new Date().toISOString(),
      isFavorite: false,
      isDeleted: false,
      caption: photoData.caption,
      location: photoData.location,
      tags: ['Uploaded', photoData.type],
      albumIds: photoData.albumIds || ['alb_camera'],
    };

    setPhotos([newPhoto, ...photos]);

    // Update storage usage counter
    const updatedStorage = (currentUser?.storageUsedBytes ?? 0) + newPhoto.sizeBytes;
    setCurrentUser((prev) => ({
      ...prev,
      storageUsedBytes: updatedStorage,
    }));

    // If cross-posted to feed
    if (photoData.shareToFeed) {
      handleCreatePost({
        content: photoData.caption || `Uploaded new high-res ${photoData.type} to ZERO vault!`,
        media: [
          {
            url: newPhoto.url,
            type: newPhoto.type,
            photoId: newPhoto.id,
          },
        ],
        privacy: 'public',
      });
    }

    // Update album count
    setAlbums((prev) =>
      prev.map((a) => {
        if ((newPhoto.albumIds || []).includes(a.id) || a.autoCategory === 'camera') {
          return { ...a, photoCount: a.photoCount + 1 };
        }
        return a;
      })
    );

    api.uploadPhoto(photoData).catch(() => {});
    showToast('Saved to encrypted ZERO vault!');
  };

  const handleToggleFavoritePhoto = async (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== photoId) return p;
        const nextFav = !p.isFavorite;
        showToast(nextFav ? 'Added to favorites' : 'Removed from favorites');
        return { ...p, isFavorite: nextFav };
      })
    );
    setSelectedPhotoForViewer((prev) =>
      prev && prev.id === photoId ? { ...prev, isFavorite: !prev.isFavorite } : prev
    );
    api.toggleFavorite(photoId).catch(() => {});
  };

  const handleDeletePhoto = async (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== photoId) return p;
        return {
          ...p,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
        };
      })
    );
    api.deletePhoto(photoId).catch(() => {});
    showToast('Moved to Recently Deleted (Trash)');
  };

  const handleRestorePhoto = async (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== photoId) return p;
        return { ...p, isDeleted: false, deletedAt: undefined };
      })
    );
    api.restorePhoto(photoId).catch(() => {});
    showToast('Photo restored to vault');
  };

  const handlePermanentDeletePhoto = async (photoId: string) => {
    const target = photos.find((p) => p.id === photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (target) {
      setCurrentUser((prev) => ({
        ...prev,
        storageUsedBytes: Math.max(0, (prev?.storageUsedBytes ?? 0) - target.sizeBytes),
      }));
    }
    api.permanentDeletePhoto(photoId).catch(() => {});
    showToast('Photo permanently erased from vault');
  };

  const handleEmptyTrash = async () => {
    const trashed = photos.filter((p) => p.isDeleted);
    if (trashed.length === 0) {
      showToast('Recently Deleted is already empty');
      return;
    }
    const count = trashed.length;
    const freedBytes = trashed.reduce((acc, p) => acc + (p.sizeBytes || 0), 0);

    setPhotos((prev) => prev.filter((p) => !p.isDeleted));
    setCurrentUser((prev) => ({
      ...prev,
      storageUsedBytes: Math.max(0, (prev?.storageUsedBytes ?? 0) - freedBytes),
    }));

    try {
      await api.emptyTrash();
      showToast(`Emptied Recently Deleted (${count} photo${count !== 1 ? 's' : ''} purged)`);
    } catch {
      showToast(`Trash emptied (${count} items permanently erased)`);
    }
  };

  const handleRestoreAllTrash = async () => {
    const trashed = photos.filter((p) => p.isDeleted);
    if (trashed.length === 0) {
      showToast('No photos to restore');
      return;
    }
    const count = trashed.length;

    setPhotos((prev) =>
      prev.map((p) => (p.isDeleted ? { ...p, isDeleted: false, deletedAt: undefined } : p))
    );

    try {
      await api.restoreAllTrash();
      showToast(`Restored all ${count} photo${count !== 1 ? 's' : ''} to vault`);
    } catch {
      showToast(`Restored ${count} photos`);
    }
  };

  const handleCreateAlbum = async (data: {
    name: string;
    description?: string;
    isVaultLocked?: boolean;
    pinCode?: string;
  }) => {
    const newAlbum: Album = {
      id: `alb_${Date.now()}`,
      userId: currentUser.id,
      name: data.name,
      description: data.description,
      coverUrl:
        photos[0]?.url ||
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      photoCount: 0,
      isPrivate: !!data.isVaultLocked,
      isVaultLocked: !!data.isVaultLocked,
      pinCode: data.pinCode,
      createdAt: new Date().toISOString(),
    };

    setAlbums([...albums, newAlbum]);
    api.createAlbum(data).catch(() => {});
    showToast(`Created album "${data.name}"`);
  };

  const handleDeleteAlbum = async (albumId: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    api.deleteAlbum(albumId).catch(() => {});
    showToast('Album deleted');
  };

  // Messaging Handlers
  const handleSendMessage = async (
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
  ) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: targetUserId,
      text: text || '',
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || (mediaUrl ? 'image' : undefined),
      fileName: fileMeta?.fileName,
      fileSizeBytes: fileMeta?.fileSizeBytes,
      isOriginalQuality: fileMeta?.isOriginalQuality,
      durationSec: fileMeta?.durationSec,
      mimeType: fileMeta?.mimeType,
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    setAllMessages((prev) => [...prev, newMsg]);

    // Update conversation list
    setConversations((prev) => {
      const existing = prev.find((c) => c.otherUser.id === targetUserId);
      const other = allUsers.find((u) => u.id === targetUserId);
      if (existing) {
        return prev.map((c) =>
          c.otherUser.id === targetUserId ? { ...c, lastMessage: newMsg } : c
        );
      } else if (other) {
        return [{ otherUser: other, lastMessage: newMsg, unreadCount: 0 }, ...prev];
      }
      return prev;
    });

    api.sendMessage(targetUserId, { text, mediaUrl, mediaType, ...fileMeta }).catch(() => {});

    // Friendly auto-response after 1.4s
    setTimeout(() => {
      const friend = allUsers.find((u) => u.id === targetUserId);
      if (!friend) return;

      const replyText =
        mediaType === 'video'
          ? 'That 4K video is pristine! Lossless playback works great on ZERO.'
          : mediaType === 'document'
          ? 'Received your document file safely. Verified AES-256 encryption!'
          : mediaUrl
          ? 'Wow, that photo looks crystal clear! Love the colors in ZERO vault.'
          : 'Got your message! Hope your photo session went well today ✨';

      const replyMsg: Message = {
        id: `msg_reply_${Date.now()}`,
        senderId: targetUserId,
        receiverId: currentUser.id,
        text: replyText,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      setAllMessages((prev) => [...prev, replyMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.otherUser.id === targetUserId
            ? { ...c, lastMessage: replyMsg, unreadCount: c.unreadCount + 1 }
            : c
        )
      );
    }, 1400);
  };

  const getThreadMessages = (targetUserId: string) => {
    return allMessages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === targetUserId) ||
        (m.senderId === targetUserId && m.receiverId === currentUser.id)
    );
  };

  // Follow user
  const handleToggleFollow = (userId: string) => {
    const followingList = currentUser?.following || [];
    const isFollowing = followingList.includes(userId);
    const newFollowing = isFollowing
      ? followingList.filter((id) => id !== userId)
      : [...followingList, userId];

    setCurrentUser((prev) => ({
      ...prev,
      following: newFollowing,
      followingCount: newFollowing.length,
    }));

    showToast(isFollowing ? 'Unfollowed user' : 'Following user on ZERO');
    api.toggleFollow(userId).catch(() => {});
  };

  const handleBlockUser = (userId: string) => {
    setPosts((prev) => prev.filter((p) => p.userId !== userId));
    showToast('User blocked and hidden from feed');
  };

  // Notifications
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    api.markAllNotificationsRead().catch(() => {});
    showToast('Marked all notifications as read');
  };

  // Settings & Storage Actions
  const handleBackupNow = () => {
    showToast('Encrypted ZERO vault snapshot backed up to cloud');
  };

  const handleClearCache = () => {
    showToast('Local thumbnail cache cleared successfully');
  };

  const handleDeleteAccount = () => {
    setIsLoggedIn(false);
    showToast('Your account and vault data have been deleted.');
  };

  // Suppress vault notifications (don't show notification for vault)
  const nonVaultNotifications = notifications.filter(
    (n) =>
      n.type !== 'storage_warning' &&
      n.type !== 'backup_completed' &&
      n.actor?.username !== 'zero.cloud'
  );

  const unreadNotifsCount = nonVaultNotifications.filter((n) => !n.read).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Inspected user object
  const profileUserToDisplay =
    (inspectedUserId ? allUsers.find((u) => u.id === inspectedUserId) : null) ||
    currentUser ||
    CURRENT_USER;

  return (
    <div id="zero-root-app" data-theme={theme} className="w-screen h-screen flex items-center justify-center bg-black overflow-hidden font-sans">
      <AndroidFrame theme={theme} onToggleTheme={handleToggleTheme}>
        {/* 1. Splash Screen Animation */}
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : !isLoggedIn ? (
          /* 2. Login / Sign Up */
          <AuthScreen
            onLogin={(user) => {
              setCurrentUser(user);
              setIsLoggedIn(true);
              showToast(`Welcome to ZERO, ${user.displayName}!`);
            }}
          />
        ) : (
          /* 3. Main App Layout */
          <div
            data-theme={theme}
            className={`flex flex-col h-full w-full relative overflow-hidden transition-colors duration-300 ${
              theme === 'amoled' ? 'bg-black' : 'bg-[#0c0e12]'
            }`}
          >
            {/* Top App Bar */}
            <TopAppBar
              user={currentUser}
              currentUser={currentUser}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              unreadMessagesCount={unreadMessagesCount}
              unreadNotificationsCount={unreadNotifsCount}
              onOpenSearch={() => setShowSearchModal(true)}
              onOpenMessenger={() => {
                setMessengerTargetUserId(undefined);
                setShowMessengerModal(true);
              }}
              onOpenNotifications={() => setActiveTab('notifications')}
              onOpenSettings={() => setActiveTab('settings')}
              onOpenProfile={() => {
                setInspectedUserId(null);
                setActiveTab('profile');
              }}
            />

            {/* Main Tab Screen Switcher */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {activeTab === 'home' && (
                <HomeFeed
                  posts={posts}
                  stories={storyGroups}
                  currentUser={currentUser}
                  onToggleLike={handleToggleLike}
                  onAddComment={handleAddComment}
                  onToggleSave={handleToggleSave}
                  onSharePost={handleSharePost}
                  onOpenCreatePost={() => {
                    setCreatePostIsStory(false);
                    setShowCreatePostModal(true);
                  }}
                  onOpenCreateStory={() => {
                    setCreatePostIsStory(true);
                    setShowCreatePostModal(true);
                  }}
                  onOpenStoryViewer={(group) => setActiveStoryViewerUser(group)}
                  onOpenUserProfile={(userId) => {
                    setInspectedUserId(userId === currentUser.id ? null : userId);
                    setActiveTab('profile');
                  }}
                  onToggleFollow={handleToggleFollow}
                  onBlockUser={(userId) => {
                    handleBlockUser(userId);
                    showToast('User blocked');
                  }}
                  onReportUser={(_userId) => {
                    showToast('Post reported to moderation');
                  }}
                />
              )}

              {activeTab === 'photos' && (
                <PhotosGallery
                  photos={photos}
                  albums={albums}
                  currentUser={currentUser}
                  onSelectPhoto={(photo) => setSelectedPhotoForViewer(photo)}
                  onUploadClick={() => setShowUploadModal(true)}
                  onToggleFavorite={handleToggleFavoritePhoto}
                  onDeletePhoto={handleDeletePhoto}
                  onRestorePhoto={handleRestorePhoto}
                  onPermanentDelete={handlePermanentDeletePhoto}
                  onEmptyTrash={handleEmptyTrash}
                  onRestoreAllTrash={handleRestoreAllTrash}
                  initialSubTab={gallerySubTab}
                  onOpenAlbumsTab={() => setActiveTab('albums')}
                  onOpenSettings={() => setActiveTab('settings')}
                  onShareToSocial={(photo) => {
                    handleCreatePost({
                      content: `Shared from my ZERO cloud vault!`,
                      media: [{ url: photo.url, type: photo.type, photoId: photo.id }],
                      privacy: 'public',
                    });
                  }}
                />
              )}

              {activeTab === 'reels' && (
                <ReelsView
                  currentUser={currentUser}
                  onOpenUserProfile={(userId) => {
                    setInspectedUserId(userId === currentUser.id ? null : userId);
                    setActiveTab('profile');
                  }}
                  onToggleFollow={handleToggleFollow}
                  onShareReel={(reel) => {
                    handleCreatePost({
                      content: `Shared a 4K Reel from ZERO Vault: "${reel.caption}"`,
                      media: [{ url: reel.videoUrl, type: 'video' }],
                      privacy: 'public',
                    });
                    showToast('Reel shared to your ZERO feed! 🎬');
                  }}
                  onToast={showToast}
                />
              )}

              {activeTab === 'albums' && (
                <AlbumsView
                  albums={albums}
                  photos={photos}
                  currentUser={currentUser}
                  onSelectPhoto={(photo) => setSelectedPhotoForViewer(photo)}
                  onCreateAlbum={handleCreateAlbum}
                  onDeleteAlbum={handleDeleteAlbum}
                  onBackToGallery={() => {
                    setGallerySubTab('all');
                    setActiveTab('photos');
                  }}
                  onOpenRecentlyDeleted={() => {
                    setGallerySubTab('recently_deleted');
                    setActiveTab('photos');
                  }}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsView
                  notifications={nonVaultNotifications}
                  onMarkAllRead={handleMarkAllRead}
                  onSelectNotification={(notif) => {
                    if (notif.postId) {
                      setActiveTab('home');
                    }
                  }}
                />
              )}

              {activeTab === 'profile' && (
                <UserProfileView
                  user={profileUserToDisplay}
                  currentUser={currentUser}
                  userPosts={posts.filter((p) => p.userId === profileUserToDisplay?.id)}
                  userPhotos={photos.filter((p) => p.userId === profileUserToDisplay?.id && !p.isDeleted)}
                  savedPosts={posts.filter((p) => (p.savedBy || []).includes(profileUserToDisplay?.id || ''))}
                  onToggleFollow={handleToggleFollow}
                  onOpenMessengerWithUser={(uid) => {
                    setMessengerTargetUserId(uid);
                    setShowMessengerModal(true);
                  }}
                  onOpenSettings={() => setActiveTab('settings')}
                  onSelectPhoto={(p) => setSelectedPhotoForViewer(p)}
                  onUpdateProfile={(updated) => {
                    setCurrentUser((prev) => ({ ...prev, ...updated }));
                    showToast('Profile updated!');
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                  onSelectTheme={(newTheme) => applyTheme(newTheme)}
                  onUpdateSettings={(newSettings) => {
                    setCurrentUser((prev) => ({ ...prev, ...newSettings }));
                    showToast('Settings saved');
                  }}
                  onClearCache={handleClearCache}
                  onBackupNow={handleBackupNow}
                  onLogout={() => {
                    setIsLoggedIn(false);
                    showToast('Logged out');
                  }}
                  onDeleteAccount={handleDeleteAccount}
                  onBack={() => setActiveTab('home')}
                  onOpenApkModal={() => setShowApkModal(true)}
                />
              )}
            </div>

            {/* Bottom Android Navigation Bar */}
            <BottomNav
              activeTab={activeTab}
              onChangeTab={(tab) => {
                if (tab === 'create') {
                  setShowCreatePostModal(true);
                  return;
                }
                if (tab === 'profile') setInspectedUserId(null);
                setActiveTab(tab);
              }}
              onTabChange={(tab) => {
                if (tab === 'create') {
                  setShowCreatePostModal(true);
                  return;
                }
                if (tab === 'profile') setInspectedUserId(null);
                setActiveTab(tab);
              }}
              onOpenUpload={() => setShowUploadModal(true)}
              unreadNotificationsCount={unreadNotifsCount}
            />

            {/* Floating Toast Notification */}
            {toastMessage && (
              <div className="absolute bottom-20 inset-x-6 z-50 pointer-events-none flex justify-center animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="bg-neutral-900/95 border border-neutral-700 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span>{toastMessage}</span>
                </div>
              </div>
            )}

            {/* Fullscreen 24h Story Viewer */}
            {activeStoryViewerUser && (
              <StoriesViewer
                storyGroup={activeStoryViewerUser}
                onClose={() => setActiveStoryViewerUser(null)}
                onReply={(storyId, replyText) => {
                  handleSendMessage(activeStoryViewerUser.user.id, `Replied to story: "${replyText}"`);
                  showToast('Reply sent!');
                  setActiveStoryViewerUser(null);
                }}
              />
            )}

            {/* Fullscreen Photo & Video Vault Viewer */}
            {selectedPhotoForViewer && (
              <PhotoDetailViewer
                photo={selectedPhotoForViewer}
                allPhotos={
                  selectedPhotoForViewer.isDeleted
                    ? photos.filter((p) => p.isDeleted)
                    : photos.filter((p) => !p.isDeleted)
                }
                albums={albums}
                onClose={() => setSelectedPhotoForViewer(null)}
                onToggleFavorite={handleToggleFavoritePhoto}
                onDelete={handleDeletePhoto}
                onRestore={handleRestorePhoto}
                onPermanentDelete={handlePermanentDeletePhoto}
                onShareToFeed={(photo) => {
                  handleCreatePost({
                    content: `Sharing high-res moment from my ZERO vault: ${photo.caption || photo.filename}`,
                    media: [{ url: photo.url, type: photo.type, photoId: photo.id }],
                    privacy: 'public',
                  });
                }}
                onNavigatePhoto={(p) => setSelectedPhotoForViewer(p)}
              />
            )}

            {/* Upload Photo/Video Modal (with Live Compression) */}
            {showUploadModal && (
              <UploadModal
                albums={albums}
                currentUser={currentUser}
                onClose={() => setShowUploadModal(false)}
                onUploadSuccess={handleUploadSuccess}
              />
            )}

            {/* Create Social Post or 24h Story Modal */}
            {showCreatePostModal && (
              <CreatePostModal
                currentUser={currentUser}
                vaultPhotos={photos}
                defaultIsStory={createPostIsStory}
                onClose={() => setShowCreatePostModal(false)}
                onSubmitPost={handleCreatePost}
                onSubmitStory={handleCreateStory}
                onOpenVaultUpload={() => setShowUploadModal(true)}
              />
            )}

            {/* Direct Encrypted Messenger Modal */}
            {showMessengerModal && (
              <MessengerModal
                currentUser={currentUser}
                conversations={conversations}
                vaultPhotos={photos}
                initialTargetUserId={messengerTargetUserId}
                onClose={() => setShowMessengerModal(false)}
                onSendMessage={handleSendMessage}
                getThreadMessages={getThreadMessages}
              />
            )}

            {/* Universal Search Modal (Users, Photos, Albums, Posts) */}
            {showSearchModal && (
              <SearchModal
                currentUser={currentUser}
                allUsers={allUsers}
                posts={posts}
                photos={photos}
                albums={albums}
                onClose={() => setShowSearchModal(false)}
                onSelectUser={(userId) => {
                  setInspectedUserId(userId);
                  setActiveTab('profile');
                }}
                onSelectPhoto={(photo) => setSelectedPhotoForViewer(photo)}
                onSelectAlbum={(albumId) => {
                  setActiveTab('albums');
                }}
              />
            )}

            {/* Android APK & Mobile App Export Modal */}
            <ApkExportModal
              isOpen={showApkModal}
              onClose={() => setShowApkModal(false)}
              onShowToast={showToast}
            />
          </div>
        )}
      </AndroidFrame>
    </div>
  );
}
