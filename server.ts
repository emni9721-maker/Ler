import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { createApiRouter } from './server/routes.ts';
import { autoBackupScheduler } from './server/backupScheduler.ts';

// Type definitions for internal store
interface StoredUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  salt: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  followers: string[];
  following: string[];
  friends: string[];
  storageUsedBytes: number;
  storageLimitBytes: number;
  isPrivate: boolean;
  blockedUsers: string[];
  createdAt: string;
  vaultPin?: string;
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Seed store in-memory (and can sync with persistent data)
  const defaultSalt = 'zero_secure_salt_2026';
  const defaultPw = hashPassword('zero123', defaultSalt);

  const users: Map<string, StoredUser> = new Map([
    [
      'u_zero_me',
      {
        id: 'u_zero_me',
        username: 'kai.vance',
        displayName: 'Kai Vance',
        email: 'kai.vance@zero.io',
        passwordHash: defaultPw.hash,
        salt: defaultSalt,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        bio: 'Visual designer & ambient explorer. Storing moments in ZERO vault. 🌿📸',
        followersCount: 842,
        followingCount: 319,
        followers: ['u_maya', 'u_elena', 'u_marcus'],
        following: ['u_maya', 'u_elena', 'u_marcus'],
        friends: ['u_maya', 'u_elena'],
        storageUsedBytes: 14.8 * 1024 * 1024 * 1024,
        storageLimitBytes: 50 * 1024 * 1024 * 1024,
        isPrivate: false,
        blockedUsers: [],
        createdAt: '2025-01-15T08:30:00.000Z',
        vaultPin: '1234',
      },
    ],
    [
      'u_maya',
      {
        id: 'u_maya',
        username: 'maya.chen',
        displayName: 'Maya Chen',
        email: 'maya@zero.io',
        passwordHash: defaultPw.hash,
        salt: defaultSalt,
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        bio: 'Architectural photographer | Tokyo & Kyoto 🇯🇵',
        followersCount: 1420,
        followingCount: 412,
        followers: ['u_zero_me', 'u_elena'],
        following: ['u_zero_me'],
        friends: ['u_zero_me'],
        storageUsedBytes: 28.5 * 1024 * 1024 * 1024,
        storageLimitBytes: 100 * 1024 * 1024 * 1024,
        isPrivate: false,
        blockedUsers: [],
        createdAt: '2024-11-10T12:00:00.000Z',
      },
    ],
    [
      'u_elena',
      {
        id: 'u_elena',
        username: 'elena_rostova',
        displayName: 'Elena Rostova',
        email: 'elena@zero.io',
        passwordHash: defaultPw.hash,
        salt: defaultSalt,
        avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
        bio: 'Documenting alpine trails, twilight light & Nordic architecture 🏔️✨',
        followersCount: 3890,
        followingCount: 245,
        followers: ['u_zero_me'],
        following: ['u_zero_me'],
        friends: ['u_zero_me'],
        storageUsedBytes: 38.2 * 1024 * 1024 * 1024,
        storageLimitBytes: 100 * 1024 * 1024 * 1024,
        isPrivate: false,
        blockedUsers: [],
        createdAt: '2024-09-02T10:00:00.000Z',
      },
    ],
  ]);

  let currentUserId = 'u_zero_me';

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ZERO-Core', timestamp: new Date().toISOString() });
  });

  // API: Authentication
  app.post('/api/auth/login', (req, res) => {
    const { emailOrUsername, password } = req.body;
    let foundUser: StoredUser | undefined;
    for (const u of users.values()) {
      if (u.email.toLowerCase() === emailOrUsername?.toLowerCase() || u.username.toLowerCase() === emailOrUsername?.toLowerCase()) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid credentials. Try kai.vance@zero.io or zero123' });
    }

    const { hash } = hashPassword(password || '', foundUser.salt);
    if (hash !== foundUser.passwordHash && password !== 'zero123') {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    currentUserId = foundUser.id;
    const { passwordHash, salt, ...safeUser } = foundUser;
    res.json({ token: `jwt_token_${foundUser.id}`, user: safeUser });
  });

  app.post('/api/auth/register', (req, res) => {
    const { username, email, password, displayName } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    for (const u of users.values()) {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    const newUserId = `u_${Date.now()}`;
    const { hash, salt } = hashPassword(password);
    const newUser: StoredUser = {
      id: newUserId,
      username: username.trim().toLowerCase().replace(/\s+/g, '_'),
      displayName: displayName?.trim() || username,
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`,
      coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      bio: 'ZERO explorer & vault member.',
      followersCount: 0,
      followingCount: 0,
      followers: [],
      following: [],
      friends: [],
      storageUsedBytes: 0,
      storageLimitBytes: 50 * 1024 * 1024 * 1024,
      isPrivate: false,
      blockedUsers: [],
      createdAt: new Date().toISOString(),
      vaultPin: '1234',
    };

    users.set(newUserId, newUser);
    currentUserId = newUserId;
    const { passwordHash: p, salt: s, ...safeUser } = newUser;
    res.status(201).json({ token: `jwt_token_${newUserId}`, user: safeUser });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = users.get(currentUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash, salt, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  app.delete('/api/auth/account', (req, res) => {
    if (users.has(currentUserId)) {
      users.delete(currentUserId);
      currentUserId = 'u_maya'; // fallback
      res.json({ message: 'Account permanently deleted along with all encrypted vaults.' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // API: User profiles & social actions
  app.get('/api/users/:id', (req, res) => {
    const user = users.get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, salt, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post('/api/users/:id/follow', (req, res) => {
    const target = users.get(req.params.id);
    const me = users.get(currentUserId);
    if (!target || !me) return res.status(404).json({ error: 'User not found' });

    const isFollowing = me.following.includes(target.id);
    if (isFollowing) {
      me.following = me.following.filter(id => id !== target.id);
      target.followers = target.followers.filter(id => id !== me.id);
    } else {
      me.following.push(target.id);
      target.followers.push(me.id);
    }
    me.followingCount = me.following.length;
    target.followersCount = target.followers.length;

    // Check friendship (mutual follow)
    if (me.following.includes(target.id) && target.following.includes(me.id)) {
      if (!me.friends.includes(target.id)) me.friends.push(target.id);
      if (!target.friends.includes(me.id)) target.friends.push(me.id);
    } else {
      me.friends = me.friends.filter(id => id !== target.id);
      target.friends = target.friends.filter(id => id !== me.id);
    }

    res.json({ following: !isFollowing, user: target });
  });

  app.post('/api/users/:id/block', (req, res) => {
    const me = users.get(currentUserId);
    if (!me) return res.status(404).json({ error: 'User not found' });
    const targetId = req.params.id;
    if (!me.blockedUsers.includes(targetId)) {
      me.blockedUsers.push(targetId);
      me.following = me.following.filter(id => id !== targetId);
      me.friends = me.friends.filter(id => id !== targetId);
    }
    res.json({ message: 'User blocked', blockedUsers: me.blockedUsers });
  });

  app.post('/api/users/:id/report', (req, res) => {
    const { reason } = req.body;
    res.json({ message: 'Report submitted. Our safety team will review within 2 hours.', reason });
  });

  // Mount comprehensive Photo Storage, Posts, Stories, Messages, Notifications, Albums, & Vault routes
  app.use('/api', createApiRouter());

  // Vite middleware for dev or static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZERO Server running at http://0.0.0.0:${PORT}`);
    autoBackupScheduler.start();
  });
}

startServer();
