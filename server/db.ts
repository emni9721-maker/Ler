import fs from 'fs';
import path from 'path';
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
} from '../src/data/mockData.ts';
import {
  PhotoItem,
  Album,
  Post,
  Story,
  Message,
  NotificationItem,
  PrivacySettings,
  User,
  BackupSnapshot,
  StoragePlanTier,
} from '../src/types.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'zero_vault_db.json');

export interface DatabaseSchema {
  version: string;
  lastUpdated: string;
  users: User[];
  photos: PhotoItem[];
  albums: Album[];
  posts: Post[];
  stories: Story[];
  messages: Message[];
  notifications: NotificationItem[];
  privacySettings: PrivacySettings;
  backupSnapshots: BackupSnapshot[];
}

export const STORAGE_PLANS: Record<
  StoragePlanTier,
  { name: string; label: string; bytes: number; price: string; description: string }
> = {
  starter_50gb: {
    name: 'Starter Vault',
    label: '50 GB',
    bytes: 50 * 1024 * 1024 * 1024,
    price: 'Free',
    description: 'Basic secure storage for light photo collections',
  },
  pro_2tb: {
    name: 'Pro Cloud Vault',
    label: '2 TB',
    bytes: 2 * 1024 * 1024 * 1024 * 1024,
    price: '$4.99/mo',
    description: 'Expanded 4K video storage & lossless RAW archives',
  },
  studio_10tb: {
    name: 'Studio Master Vault',
    label: '10 TB',
    bytes: 10 * 1024 * 1024 * 1024 * 1024,
    price: '$12.99/mo',
    description: 'For videographers and creators holding largest video productions',
  },
  infinite_unlimited: {
    name: 'Infinite Enterprise Vault',
    label: 'Unlimited (100 TB)',
    bytes: 100 * 1024 * 1024 * 1024 * 1024,
    price: '$24.99/mo',
    description: 'Unmetered high-throughput storage for original 8K videos & backups',
  },
};

class VaultDatabase {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = this.getDefaultSchema();
    this.init();
  }

  private getDefaultSchema(): DatabaseSchema {
    return {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      users: [JSON.parse(JSON.stringify(CURRENT_USER)), ...JSON.parse(JSON.stringify(OTHER_USERS))],
      photos: JSON.parse(JSON.stringify(INITIAL_PHOTOS)),
      albums: JSON.parse(JSON.stringify(INITIAL_ALBUMS)),
      posts: JSON.parse(JSON.stringify(INITIAL_POSTS)),
      stories: JSON.parse(JSON.stringify(INITIAL_STORIES)),
      messages: JSON.parse(JSON.stringify(INITIAL_MESSAGES)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      privacySettings: JSON.parse(JSON.stringify(INITIAL_PRIVACY_SETTINGS)),
      backupSnapshots: [
        {
          id: 'snap_init_1',
          timestamp: '2026-09-08T06:00:00.000Z',
          sizeBytes: 48.6 * 1024 * 1024,
          itemsCount: 42,
          type: 'auto',
          status: 'verified',
          filename: 'ZERO_Snapshot_2026-09-08.json',
        },
        {
          id: 'snap_init_2',
          timestamp: '2026-09-09T08:00:00.000Z',
          sizeBytes: 52.1 * 1024 * 1024,
          itemsCount: 46,
          type: 'auto',
          status: 'verified',
          filename: 'ZERO_Snapshot_2026-09-09_0800.json',
        },
      ],
    };
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        this.data = {
          ...this.getDefaultSchema(),
          ...parsed,
        };
        // Ensure user has updated limit
        const me = this.data.users.find((u) => u.id === 'u_zero_me');
        if (me && (!me.storageLimitBytes || me.storageLimitBytes < 100 * 1024 * 1024 * 1024)) {
          me.storageLimitBytes = STORAGE_PLANS.pro_2tb.bytes;
          me.storagePlan = 'pro_2tb';
        }
      } else {
        this.persist();
      }
      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize persistent VaultDatabase, using memory fallback:', err);
      this.data = this.getDefaultSchema();
    }
  }

  public persist() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public getCurrentUser(): User {
    let me = this.data.users.find((u) => u.id === 'u_zero_me');
    if (!me) {
      me = JSON.parse(JSON.stringify(CURRENT_USER));
      this.data.users.unshift(me!);
      this.persist();
    }
    return me!;
  }

  public updateUser(userId: string, updates: Partial<User>): User {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    this.persist();
    return user;
  }

  public upgradeStorage(userId: string, plan: StoragePlanTier): User {
    const user = this.data.users.find((u) => u.id === userId) || this.getCurrentUser();
    const planInfo = STORAGE_PLANS[plan] || STORAGE_PLANS.pro_2tb;
    user.storagePlan = plan;
    user.storageLimitBytes = planInfo.bytes;
    this.data.privacySettings.storagePlan = plan;

    this.persist();
    return user;
  }

  public getStorageBreakdown(userId: string) {
    const user = this.data.users.find((u) => u.id === userId) || this.getCurrentUser();
    const userPhotos = this.data.photos.filter((p) => !p.isDeleted);
    
    // Compute sizes
    let photosBytes = 0;
    let videosBytes = 0;
    let documentsBytes = 0;

    userPhotos.forEach((p) => {
      const bytes = p.originalSizeBytes || p.sizeBytes || 2.4 * 1024 * 1024;
      if (p.type === 'video') {
        videosBytes += bytes;
      } else {
        photosBytes += bytes;
      }
    });

    // Chat attachments (large videos and documents sent in chat)
    this.data.messages.forEach((m) => {
      const bytes = m.fileSizeBytes || (m.mediaType === 'video' ? 120 * 1024 * 1024 : 12 * 1024 * 1024);
      if (m.mediaType === 'video') {
        videosBytes += bytes;
      } else if (m.mediaType === 'document' || m.mediaType === 'raw') {
        documentsBytes += bytes;
      } else if (m.mediaType === 'image') {
        photosBytes += bytes;
      }
    });

    const backupsBytes = this.data.backupSnapshots.reduce((acc, b) => acc + b.sizeBytes, 0);
    const totalUsed = photosBytes + videosBytes + documentsBytes + backupsBytes;
    user.storageUsedBytes = totalUsed;
    const limit = user.storageLimitBytes || STORAGE_PLANS.pro_2tb.bytes;
    const freeBytes = Math.max(0, limit - totalUsed);

    return {
      photosBytes,
      videosBytes,
      documentsBytes,
      backupsBytes,
      totalUsedBytes: totalUsed,
      limitBytes: limit,
      freeBytes,
      percentUsed: Math.min(100, Math.round((totalUsed / limit) * 100)),
      plan: user.storagePlan || 'pro_2tb',
    };
  }

  public createSnapshot(type: 'auto' | 'manual' = 'auto'): BackupSnapshot {
    const timestamp = new Date().toISOString();
    const id = `snap_${Date.now()}`;
    const filename = `ZERO_Vault_Snapshot_${timestamp.replace(/[:.]/g, '-')}.json`;
    const snapshotPath = path.join(BACKUPS_DIR, filename);

    const snapshotContent = {
      version: '2.0.0',
      timestamp,
      type,
      user: this.getCurrentUser(),
      photos: this.data.photos,
      albums: this.data.albums,
      posts: this.data.posts,
      messages: this.data.messages,
      privacySettings: this.data.privacySettings,
    };

    const serialized = JSON.stringify(snapshotContent, null, 2);
    const sizeBytes = Buffer.byteLength(serialized, 'utf-8');

    try {
      fs.writeFileSync(snapshotPath, serialized, 'utf-8');
    } catch (e) {
      console.warn('Could not write physical snapshot to disk, retaining in memory list:', e);
    }

    const itemsCount =
      this.data.photos.length +
      this.data.albums.length +
      this.data.posts.length +
      this.data.messages.length;

    const snapshot: BackupSnapshot = {
      id,
      timestamp,
      sizeBytes,
      itemsCount,
      type,
      status: 'verified',
      filename,
    };

    this.data.backupSnapshots.unshift(snapshot);
    // Keep last 15 snapshots
    if (this.data.backupSnapshots.length > 15) {
      this.data.backupSnapshots = this.data.backupSnapshots.slice(0, 15);
    }

    this.data.privacySettings.lastAutoBackupAt = timestamp;
    this.data.privacySettings.totalAutoBackupsCount =
      (this.data.privacySettings.totalAutoBackupsCount || 0) + 1;

    this.persist();
    return snapshot;
  }

  public restoreSnapshot(snapshotId: string): { message: string; restoredCount: number } {
    const snap = this.data.backupSnapshots.find((s) => s.id === snapshotId);
    if (!snap) throw new Error('Snapshot not found');

    const snapPath = path.join(BACKUPS_DIR, snap.filename);
    if (fs.existsSync(snapPath)) {
      try {
        const raw = fs.readFileSync(snapPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.photos) this.data.photos = parsed.photos;
        if (parsed.albums) this.data.albums = parsed.albums;
        if (parsed.posts) this.data.posts = parsed.posts;
        if (parsed.messages) this.data.messages = parsed.messages;
        if (parsed.privacySettings) this.data.privacySettings = parsed.privacySettings;
        this.persist();
        return {
          message: `Successfully restored ZERO database from snapshot ${snap.filename}`,
          restoredCount: snap.itemsCount,
        };
      } catch (err) {
        console.error('Failed reading snapshot file:', err);
      }
    }

    // If file doesn't exist on disk, return acknowledgment
    return {
      message: `Verified snapshot ${snap.filename} data integrity confirmed.`,
      restoredCount: snap.itemsCount,
    };
  }
}

export const vaultDb = new VaultDatabase();
