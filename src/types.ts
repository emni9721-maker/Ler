export type MediaType = 'image' | 'video' | 'document' | 'raw' | 'audio';

export type PostPrivacy = 'public' | 'friends' | 'private';

export type StoragePlanTier = 'starter_50gb' | 'pro_2tb' | 'studio_10tb' | 'infinite_unlimited';

export type AppTheme = 'midnight' | 'amoled';

export interface UserPreview {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified?: boolean;
}

export interface User extends UserPreview {
  email: string;
  coverUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  followers: string[]; // user IDs
  following: string[]; // user IDs
  friends: string[]; // mutual user IDs
  storageUsedBytes: number;
  storageLimitBytes: number;
  storagePlan?: StoragePlanTier;
  storageSettings?: {
    backupOverWifiOnly: boolean;
    autoCompress: boolean;
    qualityPreset: 'high' | 'balanced' | 'saver';
    autoBackupEnabled?: boolean;
    autoBackupInterval?: 'realtime' | 'hourly' | 'daily' | 'weekly';
    backupOriginalMedia?: boolean;
    optimizeVideoQuality?: boolean;
  };
  isPrivate: boolean;
  blockedUsers: string[];
  createdAt: string;
  vaultPin?: string;
  theme?: AppTheme;
}

export interface PhotoItem {
  id: string;
  userId: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  filename: string;
  date: string; // ISO string
  formattedDate?: string;
  caption?: string;
  sizeBytes: number;
  originalSizeBytes: number;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  albumIds: string[];
  width?: number;
  height?: number;
  location?: string;
  tags?: string[];
  isSharedToSocial?: boolean;
  socialPostId?: string;
  duration?: string; // For videos, e.g. "0:42"
}

export interface Album {
  id: string;
  userId: string;
  name: string;
  coverUrl: string;
  isPrivate: boolean;
  isVaultLocked: boolean;
  pinCode?: string;
  description?: string;
  createdAt: string;
  photoCount: number;
  autoCategory?: 'camera' | 'favorites' | 'travel' | 'screenshots' | 'portraits' | 'nature' | 'videos';
}

export interface Comment {
  id: string;
  userId: string;
  user: UserPreview;
  text: string;
  createdAt: string;
  likes: string[];
}

export interface Post {
  id: string;
  userId: string;
  user: UserPreview;
  content: string;
  media?: {
    id?: string;
    url: string;
    type: MediaType;
    photoId?: string;
    thumbnailUrl?: string;
  }[];
  privacy: PostPrivacy;
  createdAt: string;
  likes: string[]; // user IDs who liked
  comments: Comment[];
  sharesCount: number;
  savedBy: string[]; // user IDs who saved
}

export interface Story {
  id: string;
  userId: string;
  user: UserPreview;
  mediaUrl: string;
  mediaType: MediaType;
  caption?: string;
  createdAt: number; // timestamp
  expiresAt: number; // timestamp (+24h)
  viewers: string[];
  likes: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  fileName?: string;
  fileSizeBytes?: number;
  isOriginalQuality?: boolean;
  durationSec?: number;
  mimeType?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  otherUser: UserPreview;
  lastMessage: Message;
  unreadCount: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'friend_request' | 'story_reply' | 'storage_warning' | 'backup_completed';
  actor: UserPreview;
  targetId?: string; // post ID, photo ID, etc.
  message: string;
  createdAt: string;
  read: boolean;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  sizeBytes: number;
  itemsCount: number;
  type: 'auto' | 'manual';
  status: 'verified' | 'in_progress';
  filename: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  postDefaultPrivacy: PostPrivacy;
  cloudBackupEnabled: boolean;
  autoBackupEnabled: boolean;
  autoBackupInterval: 'realtime' | 'hourly' | 'daily' | 'weekly';
  autoBackupWifiOnly: boolean;
  backupOriginalMedia: boolean;
  lastAutoBackupAt?: string;
  totalAutoBackupsCount?: number;
  autoCompressUploads: boolean;
  compressionQuality: 'high' | 'balanced' | 'saver';
  requirePinForPrivateVault: boolean;
  vaultPin: string;
  allowTagging: boolean;
  twoFactorAuth: boolean;
  storagePlan?: StoragePlanTier;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  user: User;
  photos: PhotoItem[];
  albums: Album[];
  posts: Post[];
  privacy: PrivacySettings;
}

export interface UserStoryGroup {
  user: User;
  stories: Story[];
  hasUnseen: boolean;
}
