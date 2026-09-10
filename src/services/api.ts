import {
  User,
  PhotoItem,
  Album,
  Post,
  Story,
  Message,
  Conversation,
  NotificationItem,
  PrivacySettings,
  BackupData,
  BackupSnapshot,
  StoragePlanTier,
  MediaType,
  PostPrivacy,
} from '../types';

import {
  INITIAL_PHOTOS,
  INITIAL_ALBUMS,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PRIVACY_SETTINGS,
  CURRENT_USER,
  OTHER_USERS,
} from '../data/mockData';

// Image compression utility using HTMLCanvasElement
export async function compressImage(
  file: File,
  qualityMode: 'high' | 'balanced' | 'saver' = 'balanced'
): Promise<{ compressedDataUrl: string; compressedSize: number; originalSize: number; compressionRatio: number }> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let quality = 0.7;
        let scale = 1;

        if (qualityMode === 'high') {
          quality = 0.85;
          scale = 0.9;
        } else if (qualityMode === 'balanced') {
          quality = 0.7;
          scale = 0.75;
        } else if (qualityMode === 'saver') {
          quality = 0.45;
          scale = 0.55;
        }

        canvas.width = Math.max(img.width * scale, 320);
        canvas.height = Math.max(img.height * scale, 240);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            compressedDataUrl: e.target?.result as string,
            compressedSize: originalSize,
            originalSize,
            compressionRatio: 0,
          });
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Approximate byte size of base64
        const stringLength = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
        const compressedSize = Math.round((stringLength * 3) / 4);
        const ratio = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

        resolve({
          compressedDataUrl,
          compressedSize,
          originalSize,
          compressionRatio: ratio,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Resilient API Fetcher with automatic fallback to memory/localStorage
const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call ${endpoint} failed or offline, using fallback state:`, error);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<User> {
    return request<User>('/auth/me', { method: 'GET' }, CURRENT_USER);
  },

  async login(emailOrUsername: string, password: string): Promise<{ token: string; user: User }> {
    return request<{ token: string; user: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password }),
      },
      { token: 'mock_jwt_token', user: CURRENT_USER }
    );
  },

  async register(data: { username: string; email: string; password: string; displayName?: string }): Promise<{ token: string; user: User }> {
    return request<{ token: string; user: User }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      {
        token: 'mock_jwt_token_new',
        user: {
          ...CURRENT_USER,
          username: data.username,
          displayName: data.displayName || data.username,
          email: data.email,
        },
      }
    );
  },

  async deleteAccount(): Promise<{ message: string }> {
    return request('/auth/account', { method: 'DELETE' }, { message: 'Account deleted' });
  },

  // Posts
  async getPosts(filter?: 'all' | 'friends' | 'saved' | 'user', userId?: string): Promise<Post[]> {
    const q = new URLSearchParams();
    if (filter) q.set('filter', filter);
    if (userId) q.set('userId', userId);
    return request<Post[]>(`/posts?${q.toString()}`, { method: 'GET' }, INITIAL_POSTS);
  },

  async createPost(data: {
    content: string;
    media?: { url: string; type: MediaType; photoId?: string }[];
    privacy?: PostPrivacy;
  }): Promise<Post> {
    return request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async likePost(postId: string): Promise<{ liked: boolean; likesCount: number; post: Post }> {
    return request(`/posts/${postId}/like`, { method: 'POST' });
  },

  async commentPost(postId: string, text: string): Promise<{ comment: any; post: Post }> {
    return request(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async savePost(postId: string): Promise<{ saved: boolean; post: Post }> {
    return request(`/posts/${postId}/save`, { method: 'POST' });
  },

  async sharePost(postId: string): Promise<{ sharesCount: number }> {
    return request(`/posts/${postId}/share`, { method: 'POST' });
  },

  async deletePost(postId: string): Promise<{ message: string }> {
    return request(`/posts/${postId}`, { method: 'DELETE' });
  },

  // Photos & Vault
  async getPhotos(params?: { view?: 'all' | 'favorites' | 'trash'; albumId?: string; search?: string; type?: string; includeAll?: boolean }): Promise<PhotoItem[]> {
    const q = new URLSearchParams();
    if (params?.view) q.set('view', params.view);
    if (params?.albumId) q.set('albumId', params.albumId);
    if (params?.search) q.set('search', params.search);
    if (params?.type) q.set('type', params.type);
    if (params?.includeAll) q.set('includeAll', 'true');
    return request<PhotoItem[]>(`/photos?${q.toString()}`, { method: 'GET' }, INITIAL_PHOTOS);
  },

  async uploadPhoto(data: Partial<PhotoItem> & { shareToFeed?: boolean }): Promise<PhotoItem> {
    return request<PhotoItem>('/photos/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleFavorite(photoId: string): Promise<{ isFavorite: boolean; photo: PhotoItem }> {
    return request(`/photos/${photoId}/favorite`, { method: 'PUT' });
  },

  async deletePhoto(photoId: string): Promise<{ message: string; photo: PhotoItem }> {
    return request(`/photos/${photoId}`, { method: 'DELETE' });
  },

  async restorePhoto(photoId: string): Promise<{ message: string; photo: PhotoItem }> {
    return request(`/photos/${photoId}/restore`, { method: 'POST' });
  },

  async permanentDeletePhoto(photoId: string): Promise<{ message: string }> {
    return request(`/photos/${photoId}/permanent`, { method: 'DELETE' });
  },

  async emptyTrash(): Promise<{ message: string; deletedCount: number; freedBytes: number; storageUsedBytes?: number }> {
    return request('/photos/trash/empty', { method: 'POST' });
  },

  async restoreAllTrash(): Promise<{ message: string; restoredCount: number }> {
    return request('/photos/trash/restore-all', { method: 'POST' });
  },

  // Albums
  async getAlbums(): Promise<Album[]> {
    return request<Album[]>('/albums', { method: 'GET' }, INITIAL_ALBUMS);
  },

  async createAlbum(data: { name: string; description?: string; isPrivate?: boolean; isVaultLocked?: boolean; pinCode?: string }): Promise<Album> {
    return request<Album>('/albums', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteAlbum(albumId: string): Promise<{ message: string }> {
    return request(`/albums/${albumId}`, { method: 'DELETE' });
  },

  async unlockVault(albumId: string, pin: string): Promise<{ unlocked: boolean }> {
    return request(`/albums/${albumId}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  // Stories
  async getStories(): Promise<Story[]> {
    return request<Story[]>('/stories', { method: 'GET' }, INITIAL_STORIES);
  },

  async createStory(data: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }): Promise<Story> {
    return request<Story>('/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async viewStory(storyId: string): Promise<{ viewed: boolean }> {
    return request(`/stories/${storyId}/view`, { method: 'POST' });
  },

  // Messages
  async getConversations(): Promise<Conversation[]> {
    return request<Conversation[]>('/messages/conversations', { method: 'GET' });
  },

  async getMessages(userId: string): Promise<Message[]> {
    return request<Message[]>(`/messages/${userId}`, { method: 'GET' }, INITIAL_MESSAGES);
  },

  async sendMessage(
    userId: string,
    data: {
      text?: string;
      mediaUrl?: string;
      mediaType?: MediaType;
      fileName?: string;
      fileSizeBytes?: number;
      isOriginalQuality?: boolean;
      durationSec?: number;
      mimeType?: string;
    }
  ): Promise<Message> {
    return request<Message>(`/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Storage Breakdown & Expansion Plans
  async getStorageBreakdown(): Promise<{
    breakdown: {
      photosBytes: number;
      videosBytes: number;
      documentsBytes: number;
      backupsBytes: number;
      totalUsedBytes: number;
      limitBytes: number;
      freeBytes: number;
      percentUsed: number;
      plan: StoragePlanTier;
    };
    plans: Record<StoragePlanTier, { name: string; label: string; bytes: number; price: string; description: string }>;
  }> {
    return request('/storage/breakdown', { method: 'GET' });
  },

  async upgradeStoragePlan(plan: StoragePlanTier): Promise<{
    message: string;
    user: User;
    breakdown: any;
  }> {
    return request('/storage/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  // Automated Cloud Backup & Restore
  async getBackupHistory(): Promise<{
    snapshots: BackupSnapshot[];
    config: {
      autoBackupEnabled: boolean;
      autoBackupInterval: 'realtime' | 'hourly' | 'daily' | 'weekly';
      autoBackupWifiOnly: boolean;
      backupOriginalMedia: boolean;
      lastAutoBackupAt?: string;
      totalAutoBackupsCount?: number;
    };
  }> {
    return request('/backup/history', { method: 'GET' });
  },

  async triggerImmediateBackup(): Promise<{ message: string; snapshot: BackupSnapshot }> {
    return request('/backup/trigger', { method: 'POST' });
  },

  async restoreSnapshot(snapshotId: string): Promise<{ message: string; restoredCount: number }> {
    return request('/backup/restore-snapshot', {
      method: 'POST',
      body: JSON.stringify({ snapshotId }),
    });
  },

  async updateBackupConfig(config: {
    autoBackupEnabled?: boolean;
    autoBackupInterval?: 'realtime' | 'hourly' | 'daily' | 'weekly';
    autoBackupWifiOnly?: boolean;
    backupOverWifiOnly?: boolean;
    backupOriginalMedia?: boolean;
    optimizeVideoQuality?: boolean;
  }): Promise<{ message: string; config: any }> {
    return request('/backup/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/notifications', { method: 'GET' }, INITIAL_NOTIFICATIONS);
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return request('/notifications/read-all', { method: 'PUT' });
  },

  // Users & Profiles
  async getUserProfile(userId: string): Promise<User> {
    if (userId === CURRENT_USER.id) return CURRENT_USER;
    const found = OTHER_USERS.find(u => u.id === userId);
    return request<User>(`/users/${userId}`, { method: 'GET' }, found || CURRENT_USER);
  },

  async toggleFollow(userId: string): Promise<{ following: boolean; user: User }> {
    return request(`/users/${userId}/follow`, { method: 'POST' });
  },

  async blockUser(userId: string): Promise<{ message: string; blockedUsers: string[] }> {
    return request(`/users/${userId}/block`, { method: 'POST' });
  },

  async reportUser(userId: string, reason: string): Promise<{ message: string }> {
    return request(`/users/${userId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Privacy & Settings
  async getPrivacySettings(): Promise<{ privacy: PrivacySettings; user: User }> {
    return request('/privacy', { method: 'GET' }, { privacy: INITIAL_PRIVACY_SETTINGS, user: CURRENT_USER });
  },

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<{ message: string; privacy: PrivacySettings }> {
    return request('/privacy', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Cloud Backup & Restore
  async exportBackup(): Promise<BackupData> {
    return request<BackupData>('/backup/export', { method: 'GET' });
  },

  async restoreBackup(backup: any): Promise<{ message: string; count: number }> {
    return request('/backup/restore', {
      method: 'POST',
      body: JSON.stringify({ backup }),
    });
  },
};
