import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { vaultDb, STORAGE_PLANS } from './db.ts';
import { autoBackupScheduler } from './backupScheduler.ts';
import { PhotoItem, Album, Post, Story, Message, NotificationItem, PrivacySettings, User, StoragePlanTier } from '../src/types.ts';

export function createApiRouter() {
  const router = Router();
  const dbData = vaultDb.getData();

  // Helper: auto-update album counts
  function recalculateAlbumCounts() {
    const data = vaultDb.getData();
    for (const alb of data.albums) {
      if (alb.autoCategory === 'camera') {
        alb.photoCount = data.photos.filter((p) => !p.isDeleted).length;
      } else if (alb.autoCategory === 'favorites') {
        alb.photoCount = data.photos.filter((p) => !p.isDeleted && p.isFavorite).length;
      } else if (alb.autoCategory === 'videos') {
        alb.photoCount = data.photos.filter((p) => !p.isDeleted && p.type === 'video').length;
      } else {
        alb.photoCount = data.photos.filter((p) => !p.isDeleted && (p.albumIds || []).includes(alb.id)).length;
      }
    }
  }

  // --- STORAGE BREAKDOWN & UPGRADE ---
  router.get('/storage/breakdown', (req, res) => {
    const me = vaultDb.getCurrentUser();
    const breakdown = vaultDb.getStorageBreakdown(me.id);
    res.json({
      breakdown,
      plans: STORAGE_PLANS,
    });
  });

  router.post('/storage/upgrade', (req, res) => {
    const { plan } = req.body as { plan: StoragePlanTier };
    if (!plan || !STORAGE_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid storage plan tier' });
    }
    const me = vaultDb.getCurrentUser();
    const updatedUser = vaultDb.upgradeStorage(me.id, plan);
    const breakdown = vaultDb.getStorageBreakdown(me.id);
    autoBackupScheduler.notifyDataChange();
    res.json({
      message: `Upgraded to ${STORAGE_PLANS[plan].name}`,
      user: updatedUser,
      breakdown,
    });
  });

  // --- POSTS ENDPOINTS ---
  router.get('/posts', (req, res) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const filter = req.query.filter as string;
    let result = [...data.posts];

    if (filter === 'friends') {
      const friendsList = currentUser?.friends || [];
      result = result.filter((p) => p.userId === currentUser.id || friendsList.includes(p.userId));
    } else if (filter === 'saved') {
      result = result.filter((p) => (p.savedBy || []).includes(currentUser.id));
    } else if (filter === 'user') {
      const targetUserId = req.query.userId as string;
      result = result.filter((p) => p.userId === targetUserId);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(result);
  });

  router.post('/posts', (req, res) => {
    const { content, media, privacy } = req.body;
    if (!content && (!media || media.length === 0)) {
      return res.status(400).json({ error: 'Post must contain text or media' });
    }

    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();

    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
      },
      content: content || '',
      media: media || [],
      privacy: privacy || data.privacySettings.postDefaultPrivacy || 'public',
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      sharesCount: 0,
      savedBy: [],
    };

    data.posts.unshift(newPost);
    vaultDb.persist();
    autoBackupScheduler.notifyDataChange();
    res.status(201).json(newPost);
  });

  router.post('/posts/:id/like', (req, res) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const post = data.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const index = post.likes.indexOf(currentUser.id);
    const liked = index === -1;
    if (liked) {
      post.likes.push(currentUser.id);
    } else {
      post.likes.splice(index, 1);
    }

    vaultDb.persist();
    res.json({ liked, likesCount: post.likes.length });
  });

  router.post('/posts/:id/comment', (req, res) => {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' });

    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const post = data.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
      },
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: [],
    };

    post.comments.push(newComment);
    vaultDb.persist();
    res.status(201).json(newComment);
  });

  router.post('/posts/:id/save', (req, res) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const post = data.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.savedBy) post.savedBy = [];
    const index = post.savedBy.indexOf(currentUser.id);
    const saved = index === -1;
    if (saved) {
      post.savedBy.push(currentUser.id);
    } else {
      post.savedBy.splice(index, 1);
    }

    vaultDb.persist();
    res.json({ saved });
  });

  router.delete('/posts/:id', (req, res) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const index = data.posts.findIndex((p) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Post not found' });

    if (data.posts[index].userId !== currentUser.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    data.posts.splice(index, 1);
    vaultDb.persist();
    res.json({ message: 'Post deleted' });
  });

  // --- STORIES (24h ephemeral) ---
  router.get('/stories', (req, res) => {
    const data = vaultDb.getData();
    const now = Date.now();
    // Filter expired (24h)
    const active = data.stories.filter((s) => s.expiresAt > now);
    res.json(active);
  });

  router.post('/stories', (req, res) => {
    const { mediaUrl, mediaType, caption } = req.body;
    if (!mediaUrl) return res.status(400).json({ error: 'Media URL required' });

    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const now = Date.now();

    const newStory: Story = {
      id: `story_${now}`,
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
      },
      mediaUrl,
      mediaType: mediaType || 'image',
      caption: caption || '',
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
      viewers: [],
      likes: [],
    };

    data.stories.push(newStory);
    vaultDb.persist();
    autoBackupScheduler.notifyDataChange();
    res.status(201).json(newStory);
  });

  router.post('/stories/:id/view', (req, res) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const story = data.stories.find((s) => s.id === req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (!story.viewers.includes(currentUser.id)) {
      story.viewers.push(currentUser.id);
      vaultDb.persist();
    }
    res.json({ viewed: true });
  });

  // --- PHOTOS & VAULT MEDIA ---
  router.get('/photos', (req, res) => {
    const data = vaultDb.getData();
    const includeDeleted = req.query.includeDeleted;
    const includeAll = req.query.includeAll === 'true' || includeDeleted === 'all';
    const albumId = req.query.albumId as string;
    const filter = req.query.filter as string;

    let result = [...data.photos];

    if (!includeAll) {
      if (includeDeleted === 'true' || req.query.view === 'trash') {
        result = result.filter((p) => p.isDeleted);
      } else {
        result = result.filter((p) => !p.isDeleted);
      }
    }

    if (albumId) {
      result = result.filter((p) => (p.albumIds || []).includes(albumId));
    }

    if (filter === 'favorites') {
      result = result.filter((p) => p.isFavorite);
    } else if (filter === 'videos') {
      result = result.filter((p) => p.type === 'video');
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(result);
  });

  router.post('/photos', (req, res) => {
    const { url, thumbnailUrl, type, filename, caption, sizeBytes, originalSizeBytes, albumIds, location, tags, shareToFeed } = req.body;
    if (!url) return res.status(400).json({ error: 'Photo/video URL required' });

    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();

    const newPhoto: PhotoItem = {
      id: `photo_${Date.now()}`,
      userId: currentUser.id,
      url,
      thumbnailUrl: thumbnailUrl || url,
      type: type || 'image',
      filename: filename || `ZERO_${type === 'video' ? 'VID' : 'IMG'}_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`,
      date: new Date().toISOString(),
      caption: caption || '',
      sizeBytes: sizeBytes || 2.4 * 1024 * 1024,
      originalSizeBytes: originalSizeBytes || (sizeBytes ? sizeBytes * 3 : 7.2 * 1024 * 1024),
      isFavorite: false,
      isDeleted: false,
      albumIds: albumIds || ['alb_camera'],
      location: location || 'Stored in ZERO Cloud Vault',
      tags: tags || ['vault', 'cloud-backup'],
      isSharedToSocial: Boolean(shareToFeed),
    };

    data.photos.unshift(newPhoto);
    recalculateAlbumCounts();
    vaultDb.getStorageBreakdown(currentUser.id);
    vaultDb.persist();

    // Cross post to feed if requested
    if (shareToFeed) {
      const socialPost: Post = {
        id: `post_${Date.now()}`,
        userId: currentUser.id,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
        },
        content: caption || 'Uploaded high-fidelity media to ZERO vault.',
        media: [
          {
            url: newPhoto.url,
            type: newPhoto.type,
            photoId: newPhoto.id,
          },
        ],
        privacy: data.privacySettings.postDefaultPrivacy,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        sharesCount: 0,
        savedBy: [],
      };
      data.posts.unshift(socialPost);
      newPhoto.socialPostId = socialPost.id;
      vaultDb.persist();
    }

    autoBackupScheduler.notifyDataChange();
    res.status(201).json(newPhoto);
  });

  router.put('/photos/:id/favorite', (req, res) => {
    const data = vaultDb.getData();
    const photo = data.photos.find((p) => p.id === req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    photo.isFavorite = !photo.isFavorite;
    recalculateAlbumCounts();
    vaultDb.persist();
    res.json({ isFavorite: photo.isFavorite, photo });
  });

  router.delete('/photos/:id', (req, res) => {
    const data = vaultDb.getData();
    const photo = data.photos.find((p) => p.id === req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    photo.isDeleted = true;
    photo.deletedAt = new Date().toISOString();
    recalculateAlbumCounts();
    vaultDb.persist();
    res.json({ message: 'Photo moved to Recently Deleted', photo });
  });

  router.post('/photos/:id/restore', (req, res) => {
    const data = vaultDb.getData();
    const photo = data.photos.find((p) => p.id === req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    photo.isDeleted = false;
    delete photo.deletedAt;
    recalculateAlbumCounts();
    vaultDb.persist();
    res.json({ message: 'Photo restored to vault', photo });
  });

  router.delete('/photos/:id/permanent', (req, res) => {
    const data = vaultDb.getData();
    const index = data.photos.findIndex((p) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Photo not found' });
    const target = data.photos[index];
    data.photos.splice(index, 1);

    const currentUser = vaultDb.getCurrentUser();
    if (currentUser && target) {
      currentUser.storageUsedBytes = Math.max(0, (currentUser.storageUsedBytes || 0) - target.sizeBytes);
    }

    recalculateAlbumCounts();
    vaultDb.persist();
    res.json({ message: 'Permanently wiped from ZERO vault.' });
  });

  // Empty all items in trash / Recently Deleted
  const emptyTrashHandler = (req: any, res: any) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const trashedPhotos = data.photos.filter((p) => p.isDeleted);
    const count = trashedPhotos.length;
    const freedBytes = trashedPhotos.reduce((acc, p) => acc + (p.sizeBytes || 0), 0);

    data.photos = data.photos.filter((p) => !p.isDeleted);
    if (currentUser) {
      currentUser.storageUsedBytes = Math.max(0, (currentUser.storageUsedBytes || 0) - freedBytes);
    }
    recalculateAlbumCounts();
    vaultDb.persist();
    res.json({
      message: `Trash emptied. ${count} item${count !== 1 ? 's' : ''} permanently deleted.`,
      deletedCount: count,
      freedBytes,
      storageUsedBytes: currentUser?.storageUsedBytes || 0,
    });
  };

  router.post('/photos/trash/empty', emptyTrashHandler);
  router.delete('/photos/trash/empty', emptyTrashHandler);

  // Restore all items in trash / Recently Deleted
  router.post('/photos/trash/restore-all', (req, res) => {
    const data = vaultDb.getData();
    const trashedPhotos = data.photos.filter((p) => p.isDeleted);
    const count = trashedPhotos.length;

    data.photos.forEach((p) => {
      if (p.isDeleted) {
        p.isDeleted = false;
        delete p.deletedAt;
      }
    });

    recalculateAlbumCounts();
    vaultDb.persist();
    res.json({
      message: `Restored ${count} photo${count !== 1 ? 's' : ''} to vault.`,
      restoredCount: count,
    });
  });

  // --- ALBUMS ---
  router.get('/albums', (req, res) => {
    recalculateAlbumCounts();
    res.json(vaultDb.getData().albums);
  });

  router.post('/albums', (req, res) => {
    const { name, description, isPrivate, isVaultLocked, pinCode } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Album name required' });

    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();

    const newAlbum: Album = {
      id: `alb_${Date.now()}`,
      userId: currentUser.id,
      name: name.trim(),
      coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      isPrivate: Boolean(isPrivate),
      isVaultLocked: Boolean(isVaultLocked),
      pinCode: pinCode || (isVaultLocked ? '1234' : undefined),
      description: description || '',
      createdAt: new Date().toISOString(),
      photoCount: 0,
    };

    data.albums.push(newAlbum);
    vaultDb.persist();
    res.status(201).json(newAlbum);
  });

  router.delete('/albums/:id', (req, res) => {
    const data = vaultDb.getData();
    const album = data.albums.find((a) => a.id === req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    if (album.autoCategory) {
      return res.status(400).json({ error: 'System albums cannot be deleted' });
    }
    data.albums = data.albums.filter((a) => a.id !== req.params.id);
    vaultDb.persist();
    res.json({ message: 'Album deleted' });
  });

  // --- MESSAGES & CHAT (Original files, 4K/8K largest videos, documents, photos) ---
  router.get('/messages/conversations', (req, res) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();

    const otherUsers = data.users.filter((u) => u.id !== currentUser.id);
    const conversations = otherUsers.map((u) => {
      const userMessages = data.messages.filter(
        (m) =>
          (m.senderId === u.id && m.receiverId === currentUser.id) ||
          (m.senderId === currentUser.id && m.receiverId === u.id)
      );
      const last = userMessages[userMessages.length - 1] || {
        id: `m_init_${u.id}`,
        senderId: u.id,
        receiverId: currentUser.id,
        text: 'Connected on ZERO Secure Messenger',
        createdAt: u.createdAt,
        isRead: true,
      };
      const unreadCount = userMessages.filter((m) => m.senderId === u.id && !m.isRead).length;
      return {
        otherUser: {
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
        },
        lastMessage: last,
        unreadCount,
      };
    });

    res.json(conversations);
  });

  router.get('/messages/:userId', (req, res) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const targetId = req.params.userId;
    const thread = data.messages.filter(
      (m) =>
        (m.senderId === targetId && m.receiverId === currentUser.id) ||
        (m.senderId === currentUser.id && m.receiverId === targetId)
    );
    // Mark as read
    thread.forEach((m) => {
      if (m.senderId === targetId && m.receiverId === currentUser.id) {
        m.isRead = true;
      }
    });
    vaultDb.persist();
    res.json(thread);
  });

  router.post('/messages/:userId', (req, res) => {
    const targetId = req.params.userId;
    const { text, mediaUrl, mediaType, fileName, fileSizeBytes, isOriginalQuality, durationSec, mimeType } = req.body;
    if (!text && !mediaUrl) return res.status(400).json({ error: 'Message content required' });

    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: targetId,
      text: text || '',
      mediaUrl,
      mediaType: mediaType || (mediaUrl ? 'image' : undefined),
      fileName: fileName || (mediaType === 'video' ? 'original_video.mp4' : mediaType === 'document' ? 'document.pdf' : undefined),
      fileSizeBytes: fileSizeBytes || (mediaType === 'video' ? 140 * 1024 * 1024 : mediaType === 'document' ? 18 * 1024 * 1024 : undefined),
      isOriginalQuality: Boolean(isOriginalQuality),
      durationSec,
      mimeType,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    data.messages.push(newMsg);
    vaultDb.getStorageBreakdown(currentUser.id);
    vaultDb.persist();
    autoBackupScheduler.notifyDataChange();

    // Auto reply simulation for demo vitality
    if (targetId === 'u_maya' || targetId === 'u_elena') {
      setTimeout(() => {
        const replies =
          newMsg.mediaType === 'video'
            ? 'That 4K video is pristine! Lossless playback works great.'
            : newMsg.mediaType === 'document'
            ? 'Received your document file safely. Verified AES-256 encryption!'
            : 'Got your message! Looks super clean.';

        data.messages.push({
          id: `m_reply_${Date.now()}`,
          senderId: targetId,
          receiverId: currentUser.id,
          text: replies,
          createdAt: new Date().toISOString(),
          isRead: false,
        });
        vaultDb.persist();
      }, 1200);
    }

    res.status(201).json(newMsg);
  });

  // --- NOTIFICATIONS ---
  router.get('/notifications', (req, res) => {
    // Exclude vault system notifications (don't show notification for vault)
    const notifs = vaultDb
      .getData()
      .notifications.filter(
        (n) =>
          n.type !== 'storage_warning' &&
          n.type !== 'backup_completed' &&
          n.actor.username !== 'zero.cloud'
      );
    res.json(notifs);
  });

  router.put('/notifications/read-all', (req, res) => {
    const data = vaultDb.getData();
    data.notifications.forEach((n) => (n.read = true));
    vaultDb.persist();
    res.json({ message: 'All notifications marked as read' });
  });

  // --- PRIVACY & SETTINGS ---
  router.get('/privacy', (req, res) => {
    res.json({
      privacy: vaultDb.getData().privacySettings,
      user: vaultDb.getCurrentUser(),
    });
  });

  router.put('/privacy', (req, res) => {
    const data = vaultDb.getData();
    data.privacySettings = { ...data.privacySettings, ...req.body };
    const me = vaultDb.getCurrentUser();
    if (req.body.vaultPin) {
      me.vaultPin = req.body.vaultPin;
    }
    if (req.body.autoBackupEnabled !== undefined) {
      data.privacySettings.autoBackupEnabled = Boolean(req.body.autoBackupEnabled);
    }
    if (req.body.autoBackupInterval) {
      data.privacySettings.autoBackupInterval = req.body.autoBackupInterval;
    }
    if (req.body.autoBackupWifiOnly !== undefined) {
      data.privacySettings.autoBackupWifiOnly = Boolean(req.body.autoBackupWifiOnly);
    }
    if (req.body.backupOriginalMedia !== undefined) {
      data.privacySettings.backupOriginalMedia = Boolean(req.body.backupOriginalMedia);
    }

    vaultDb.persist();
    res.json({ message: 'Settings updated', privacy: data.privacySettings });
  });

  // --- AUTOMATIC BACKUP & RESTORE ---
  router.get('/backup/history', (req, res) => {
    const data = vaultDb.getData();
    res.json({
      snapshots: data.backupSnapshots,
      config: {
        autoBackupEnabled: data.privacySettings.autoBackupEnabled,
        autoBackupInterval: data.privacySettings.autoBackupInterval,
        autoBackupWifiOnly: data.privacySettings.autoBackupWifiOnly,
        backupOriginalMedia: data.privacySettings.backupOriginalMedia,
        lastAutoBackupAt: data.privacySettings.lastAutoBackupAt,
        totalAutoBackupsCount: data.privacySettings.totalAutoBackupsCount,
      },
    });
  });

  router.post('/backup/trigger', (req, res) => {
    const snap = vaultDb.createSnapshot('manual');
    res.status(201).json({
      message: 'Full vault backup snapshot generated and encrypted successfully',
      snapshot: snap,
    });
  });

  router.post('/backup/restore-snapshot', (req, res) => {
    const { snapshotId } = req.body;
    if (!snapshotId) return res.status(400).json({ error: 'Snapshot ID required' });
    try {
      const outcome = vaultDb.restoreSnapshot(snapshotId);
      recalculateAlbumCounts();
      res.json(outcome);
    } catch (e: any) {
      res.status(404).json({ error: e.message || 'Failed restoring snapshot' });
    }
  });

  router.put('/backup/config', (req, res) => {
    const data = vaultDb.getData();
    const { autoBackupEnabled, autoBackupInterval, autoBackupWifiOnly, backupOriginalMedia } = req.body;

    if (autoBackupEnabled !== undefined) data.privacySettings.autoBackupEnabled = Boolean(autoBackupEnabled);
    if (autoBackupInterval) data.privacySettings.autoBackupInterval = autoBackupInterval;
    if (autoBackupWifiOnly !== undefined) data.privacySettings.autoBackupWifiOnly = Boolean(autoBackupWifiOnly);
    if (backupOriginalMedia !== undefined) data.privacySettings.backupOriginalMedia = Boolean(backupOriginalMedia);

    vaultDb.persist();
    res.json({
      message: 'Automatic backup configuration updated',
      config: {
        autoBackupEnabled: data.privacySettings.autoBackupEnabled,
        autoBackupInterval: data.privacySettings.autoBackupInterval,
        autoBackupWifiOnly: data.privacySettings.autoBackupWifiOnly,
        backupOriginalMedia: data.privacySettings.backupOriginalMedia,
      },
    });
  });

  router.get('/backup/export', (req, res) => {
    const data = vaultDb.getData();
    const currentUser = vaultDb.getCurrentUser();
    const backup = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      app: 'ZERO Vault & Social',
      user: currentUser,
      photos: data.photos.filter((p) => !p.isDeleted),
      albums: data.albums,
      posts: data.posts,
      messages: data.messages,
      privacy: data.privacySettings,
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=ZERO_Vault_Backup_${Date.now()}.json`);
    res.json(backup);
  });

  router.post('/backup/restore', (req, res) => {
    const { backup } = req.body;
    if (!backup || !backup.photos || !backup.albums) {
      return res.status(400).json({ error: 'Invalid ZERO backup JSON structure' });
    }
    const data = vaultDb.getData();
    data.photos = backup.photos;
    data.albums = backup.albums;
    if (backup.posts) data.posts = backup.posts;
    if (backup.messages) data.messages = backup.messages;
    if (backup.privacy) data.privacySettings = backup.privacy;
    recalculateAlbumCounts();
    vaultDb.persist();
    res.json({ message: 'ZERO vault successfully restored from archive!', count: data.photos.length });
  });

  // --- APK & MOBILE APP DOWNLOAD ROUTES ---
  router.get('/download/apk', (req, res) => {
    const apkFile = path.resolve(process.cwd(), 'public', 'ZERO-v1.0.apk');
    if (fs.existsSync(apkFile)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="ZERO-v1.0.apk"');
      return fs.createReadStream(apkFile).pipe(res);
    }
    res.status(404).json({ error: 'APK file not found' });
  });

  router.get('/download/android-project', (req, res) => {
    const projFile = path.resolve(process.cwd(), 'public', 'ZERO-Android-Project.zip');
    if (fs.existsSync(projFile)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ZERO-Android-Project.zip"');
      return fs.createReadStream(projFile).pipe(res);
    }
    res.status(404).json({ error: 'Android project archive not found' });
  });

  return router;
}
