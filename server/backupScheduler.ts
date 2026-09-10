import { vaultDb } from './db.ts';

class AutoBackupScheduler {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs = 60 * 60 * 1000; // 1 hour default check
  private isRunning = false;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[AutoBackupScheduler] Automatic Backup Engine started.');

    // Check if we should perform an initial backup if more than 6 hours since last
    const privacy = vaultDb.getData().privacySettings;
    if (privacy.autoBackupEnabled) {
      const last = privacy.lastAutoBackupAt ? new Date(privacy.lastAutoBackupAt).getTime() : 0;
      const now = Date.now();
      if (now - last > 6 * 60 * 60 * 1000) {
        console.log('[AutoBackupScheduler] Taking routine background snapshot...');
        vaultDb.createSnapshot('auto');
      }
    }

    // Set recurring timer
    this.timer = setInterval(() => {
      this.tick();
    }, 15 * 60 * 1000); // Check every 15 minutes
  }

  public tick() {
    try {
      const privacy = vaultDb.getData().privacySettings;
      if (!privacy.autoBackupEnabled) return;

      const last = privacy.lastAutoBackupAt ? new Date(privacy.lastAutoBackupAt).getTime() : 0;
      const now = Date.now();
      let thresholdMs = 24 * 60 * 60 * 1000; // Daily

      if (privacy.autoBackupInterval === 'hourly') {
        thresholdMs = 60 * 60 * 1000;
      } else if (privacy.autoBackupInterval === 'weekly') {
        thresholdMs = 7 * 24 * 60 * 60 * 1000;
      } else if (privacy.autoBackupInterval === 'realtime') {
        thresholdMs = 15 * 60 * 1000; // Fallback routine for realtime
      }

      if (now - last >= thresholdMs) {
        console.log(`[AutoBackupScheduler] Interval triggered (${privacy.autoBackupInterval}). Generating snapshot.`);
        vaultDb.createSnapshot('auto');
      }
    } catch (err) {
      console.error('[AutoBackupScheduler] Error running automatic backup tick:', err);
    }
  }

  public notifyDataChange() {
    const privacy = vaultDb.getData().privacySettings;
    if (privacy.autoBackupEnabled && privacy.autoBackupInterval === 'realtime') {
      // Debounce slightly or create snapshot immediately
      setTimeout(() => {
        console.log('[AutoBackupScheduler] Real-time auto-backup triggered on data change.');
        vaultDb.createSnapshot('auto');
      }, 500);
    }
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }
}

export const autoBackupScheduler = new AutoBackupScheduler();
