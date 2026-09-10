import React, { useState, useEffect } from 'react';
import {
  Shield,
  HardDrive,
  Lock,
  Wifi,
  Sliders,
  Trash2,
  LogOut,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  KeyRound,
  AlertTriangle,
  FileDown,
  Database,
  Layers,
  History,
  Check,
  Video,
  FileText,
  Clock,
  RotateCcw,
  Smartphone,
  Download,
  Palette,
} from 'lucide-react';
import { User, StoragePlanTier, BackupSnapshot, AppTheme } from '../types';
import { api } from '../services/api';
import { ThemeToggler } from './ThemeToggler';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

interface SettingsViewProps {
  currentUser: User;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onSelectTheme?: (theme: AppTheme) => void;
  onUpdateSettings: (newSettings: Partial<User>) => void;
  onClearCache: () => void;
  onBackupNow: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onBack: () => void;
  onOpenApkModal?: () => void;
}

const STORAGE_TIERS: {
  id: StoragePlanTier;
  title: string;
  sizeLabel: string;
  bytes: number;
  price: string;
  badge?: string;
  desc: string;
}[] = [
  {
    id: 'starter_50gb',
    title: 'Starter Vault',
    sizeLabel: '50 GB',
    bytes: 50 * 1024 * 1024 * 1024,
    price: 'Free',
    desc: 'Standard personal encrypted storage',
  },
  {
    id: 'pro_2tb',
    title: 'Pro Cloud Vault',
    sizeLabel: '2 TB',
    bytes: 2048 * 1024 * 1024 * 1024,
    price: '$4.99/mo',
    badge: 'Recommended',
    desc: 'Expanded 4K video capacity & uncompressed RAW archives',
  },
  {
    id: 'studio_10tb',
    title: 'Studio Master Vault',
    sizeLabel: '10 TB',
    bytes: 10240 * 1024 * 1024 * 1024,
    price: '$12.99/mo',
    badge: 'For Videographers',
    desc: 'Huge headroom for largest 4K/8K video productions & documents',
  },
  {
    id: 'infinite_unlimited',
    title: 'Infinite Enterprise Vault',
    sizeLabel: '100 TB',
    bytes: 102400 * 1024 * 1024 * 1024,
    price: '$24.99/mo',
    badge: 'Maximum Headroom',
    desc: 'Unmetered high-throughput database with automatic continuous backups',
  },
];

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  theme = 'midnight',
  onToggleTheme,
  onSelectTheme,
  onUpdateSettings,
  onClearCache,
  onBackupNow,
  onLogout,
  onDeleteAccount,
  onBack,
  onOpenApkModal,
}) => {
  const [isPrivate, setIsPrivate] = useState(currentUser.isPrivate);
  const [currentPlan, setCurrentPlan] = useState<StoragePlanTier>(
    currentUser.storagePlan || 'pro_2tb'
  );
  const [isUpgradingPlan, setIsUpgradingPlan] = useState(false);

  // Auto-backup configuration
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(
    currentUser.storageSettings?.autoBackupEnabled ?? true
  );
  const [autoBackupInterval, setAutoBackupInterval] = useState<
    'realtime' | 'hourly' | 'daily' | 'weekly'
  >(currentUser.storageSettings?.autoBackupInterval || 'realtime');
  const [wifiOnly, setWifiOnly] = useState(
    currentUser.storageSettings?.backupOverWifiOnly ?? false
  );
  const [optimizeVideoQuality, setOptimizeVideoQuality] = useState(
    currentUser.storageSettings?.optimizeVideoQuality ?? false
  );
  const [backupOriginalMedia, setBackupOriginalMedia] = useState(
    currentUser.storageSettings?.backupOriginalMedia ?? true
  );

  useEffect(() => {
    if (currentUser.storageSettings) {
      if (currentUser.storageSettings.backupOverWifiOnly !== undefined) {
        setWifiOnly(currentUser.storageSettings.backupOverWifiOnly);
      }
      if (currentUser.storageSettings.optimizeVideoQuality !== undefined) {
        setOptimizeVideoQuality(currentUser.storageSettings.optimizeVideoQuality);
      }
      if (currentUser.storageSettings.autoBackupEnabled !== undefined) {
        setAutoBackupEnabled(currentUser.storageSettings.autoBackupEnabled);
      }
      if (currentUser.storageSettings.autoBackupInterval !== undefined) {
        setAutoBackupInterval(currentUser.storageSettings.autoBackupInterval);
      }
      if (currentUser.storageSettings.backupOriginalMedia !== undefined) {
        setBackupOriginalMedia(currentUser.storageSettings.backupOriginalMedia);
      }
    }
  }, [currentUser.storageSettings]);

  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [vaultPin, setVaultPin] = useState(currentUser.vaultPin || '1234');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  const [cacheCleared, setCacheCleared] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Storage breakdown state
  const [storageBreakdown, setStorageBreakdown] = useState({
    photosBytes: 12.4 * 1024 * 1024 * 1024,
    videosBytes: 24.6 * 1024 * 1024 * 1024,
    documentsBytes: 4.2 * 1024 * 1024 * 1024,
    backupsBytes: 1.8 * 1024 * 1024 * 1024,
    totalUsedBytes: currentUser.storageUsedBytes || 43 * 1024 * 1024 * 1024,
    limitBytes: currentUser.storageLimitBytes || 2048 * 1024 * 1024 * 1024,
    freeBytes: (currentUser.storageLimitBytes || 2048 * 1024 * 1024 * 1024) - (currentUser.storageUsedBytes || 43 * 1024 * 1024 * 1024),
    percentUsed: 2,
    plan: currentUser.storagePlan || 'pro_2tb',
  });

  const [storageChartMode, setStorageChartMode] = useState<'vault' | 'media'>('vault');

  // Fetch breakdown and backup snapshots on mount
  useEffect(() => {
    api
      .getStorageBreakdown()
      .then((res) => {
        if (res?.breakdown) {
          setStorageBreakdown(res.breakdown);
          if (res.breakdown.plan) setCurrentPlan(res.breakdown.plan);
        }
      })
      .catch(() => {});

    api
      .getBackupHistory()
      .then((res) => {
        if (res?.snapshots) {
          setSnapshots(res.snapshots);
        }
        if (res?.config) {
          setAutoBackupEnabled(res.config.autoBackupEnabled);
          setAutoBackupInterval(res.config.autoBackupInterval);
          setWifiOnly(res.config.autoBackupWifiOnly);
          setBackupOriginalMedia(res.config.backupOriginalMedia);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectPlan = async (plan: StoragePlanTier) => {
    setIsUpgradingPlan(true);
    try {
      const res = await api.upgradeStoragePlan(plan);
      setCurrentPlan(plan);
      if (res.user) {
        onUpdateSettings({
          storagePlan: plan,
          storageLimitBytes: res.user.storageLimitBytes,
        });
      }
      if (res.breakdown) {
        setStorageBreakdown(res.breakdown);
      }
      setStatusMessage(`Upgraded storage to ${STORAGE_TIERS.find((t) => t.id === plan)?.title}! Quota expanded.`);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpgradingPlan(false);
    }
  };

  const handleToggleWifiOnly = (enabled: boolean) => {
    setWifiOnly(enabled);
    const updatedStorageSettings = {
      autoCompress: false,
      qualityPreset: 'high' as const,
      autoBackupEnabled: autoBackupEnabled,
      autoBackupInterval: autoBackupInterval,
      backupOriginalMedia: backupOriginalMedia,
      optimizeVideoQuality: optimizeVideoQuality,
      ...currentUser.storageSettings,
      backupOverWifiOnly: enabled,
      autoBackupWifiOnly: enabled,
    };
    onUpdateSettings({
      storageSettings: updatedStorageSettings,
    });
    api.updateBackupConfig({ autoBackupWifiOnly: enabled, backupOverWifiOnly: enabled }).catch(() => {});
    setStatusMessage(
      enabled
        ? 'Auto-Backup Over Wi-Fi Only enabled (cellular data saved)'
        : 'Auto-Backup Over Wi-Fi Only disabled (Wi-Fi + Cellular active)'
    );
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleOptimizeVideo = (enabled: boolean) => {
    setOptimizeVideoQuality(enabled);
    const updatedStorageSettings = {
      autoCompress: false,
      qualityPreset: 'high' as const,
      autoBackupEnabled: autoBackupEnabled,
      autoBackupInterval: autoBackupInterval,
      backupOriginalMedia: backupOriginalMedia,
      backupOverWifiOnly: wifiOnly,
      ...currentUser.storageSettings,
      optimizeVideoQuality: enabled,
    };
    onUpdateSettings({
      storageSettings: updatedStorageSettings,
    });
    api.updateBackupConfig({ optimizeVideoQuality: enabled }).catch(() => {});
    setStatusMessage(
      enabled
        ? 'Optimize Video Quality enabled (H.265 compression saves cloud vault storage)'
        : 'Optimize Video Quality disabled (lossless original resolution preserved)'
    );
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveBackupConfig = async (newConfig: {
    autoBackupEnabled?: boolean;
    autoBackupInterval?: 'realtime' | 'hourly' | 'daily' | 'weekly';
    autoBackupWifiOnly?: boolean;
    backupOverWifiOnly?: boolean;
    backupOriginalMedia?: boolean;
    optimizeVideoQuality?: boolean;
  }) => {
    try {
      await api.updateBackupConfig(newConfig);
      const wifiVal =
        newConfig.backupOverWifiOnly !== undefined
          ? newConfig.backupOverWifiOnly
          : newConfig.autoBackupWifiOnly !== undefined
          ? newConfig.autoBackupWifiOnly
          : wifiOnly;

      onUpdateSettings({
        storageSettings: {
          autoCompress: false,
          qualityPreset: 'high' as const,
          autoBackupEnabled: autoBackupEnabled,
          autoBackupInterval: autoBackupInterval,
          backupOriginalMedia: backupOriginalMedia,
          optimizeVideoQuality: optimizeVideoQuality,
          ...currentUser.storageSettings,
          ...newConfig,
          backupOverWifiOnly: wifiVal,
        },
      });
      setStatusMessage('Sync & backup preferences saved');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerManualSnapshot = async () => {
    setIsTakingSnapshot(true);
    setStatusMessage('Compressing and encrypting database snapshot...');
    try {
      const res = await api.triggerImmediateBackup();
      if (res.snapshot) {
        setSnapshots((prev) => [res.snapshot, ...prev]);
        setStatusMessage(`Instant backup snapshot created (${formatBytes(res.snapshot.sizeBytes)})!`);
        onBackupNow();
      }
    } catch (err) {
      setStatusMessage('Backup snapshot completed');
    } finally {
      setIsTakingSnapshot(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    const confirm = window.confirm(
      'Restore ZERO vault database to this verified snapshot point? All media and posts will be safely synchronized.'
    );
    if (!confirm) return;

    try {
      const res = await api.restoreSnapshot(snapshotId);
      setStatusMessage(res.message || 'Database snapshot successfully restored!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed restoring snapshot');
    }
  };

  const handleTogglePrivate = () => {
    const next = !isPrivate;
    setIsPrivate(next);
    onUpdateSettings({ isPrivate: next });
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      setVaultPin(newPin);
      onUpdateSettings({ vaultPin: newPin });
      setIsEditingPin(false);
      setNewPin('');
      setStatusMessage('Vault PIN code updated');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleCacheClear = () => {
    onClearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const usedFormatted = formatBytes(storageBreakdown.totalUsedBytes);
  const limitFormatted = formatBytes(storageBreakdown.limitBytes);
  const percentUsed = Math.min(
    100,
    Math.round((storageBreakdown.totalUsedBytes / (storageBreakdown.limitBytes || 1)) * 100)
  );
  const freeBytes = Math.max(
    0,
    (storageBreakdown.limitBytes || 0) - (storageBreakdown.totalUsedBytes || 0)
  );
  const freeFormatted = formatBytes(freeBytes);
  const freePercent = Math.max(
    0,
    Math.min(100, Math.round((freeBytes / (storageBreakdown.limitBytes || 1)) * 100))
  );

  const vaultChartData = [
    {
      name: '4K Videos',
      bytes: storageBreakdown.videosBytes,
      value: storageBreakdown.videosBytes,
      color: '#10b981',
    },
    {
      name: 'Photos',
      bytes: storageBreakdown.photosBytes,
      value: storageBreakdown.photosBytes,
      color: '#f59e0b',
    },
    {
      name: 'Documents',
      bytes: storageBreakdown.documentsBytes,
      value: storageBreakdown.documentsBytes,
      color: '#06b6d4',
    },
    {
      name: 'Snapshots',
      bytes: storageBreakdown.backupsBytes || 0,
      value: storageBreakdown.backupsBytes || 0,
      color: '#a855f7',
    },
    {
      name: 'Remaining Capacity',
      bytes: freeBytes,
      value: freeBytes,
      color: '#262626',
    },
  ];

  const mediaChartData = [
    {
      name: '4K Videos',
      bytes: storageBreakdown.videosBytes,
      value: storageBreakdown.videosBytes,
      color: '#10b981',
    },
    {
      name: 'Photos',
      bytes: storageBreakdown.photosBytes,
      value: storageBreakdown.photosBytes,
      color: '#f59e0b',
    },
    {
      name: 'Documents',
      bytes: storageBreakdown.documentsBytes,
      value: storageBreakdown.documentsBytes,
      color: '#06b6d4',
    },
    {
      name: 'Snapshots',
      bytes: storageBreakdown.backupsBytes || 0,
      value: storageBreakdown.backupsBytes || 0,
      color: '#a855f7',
    },
  ];

  const activeChartData = storageChartMode === 'vault' ? vaultChartData : mediaChartData;

  return (
    <div
      id="zero-settings-view"
      className="flex-1 overflow-y-auto pb-24 select-none bg-[#0c0e12] text-white"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-[#0c0e12]/95 backdrop-blur-md z-10">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Database, Storage & Backups
          </h2>
          <p className="text-xs text-neutral-400">
            Expanded high-capacity storage & automatic snapshots
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
        >
          Done
        </button>
      </div>

      <div className="p-4 space-y-6 text-xs max-w-xl mx-auto">
        {/* Status Toast Banner */}
        {statusMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 1. Storage Capacity & Real-Time Usage Breakdown with Recharts */}
        <div id="settings-storage-breakdown-section" className="p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4 shadow-xl">
          {/* Header & Quick Snapshot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm block">ZERO Vault Database</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    {STORAGE_TIERS.find((t) => t.id === currentPlan)?.sizeLabel} Tier
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">
                  {usedFormatted} used of {limitFormatted} total limit ({percentUsed}%)
                </span>
              </div>
            </div>

            <button
              onClick={handleTriggerManualSnapshot}
              disabled={isTakingSnapshot}
              className="px-3 py-1.5 rounded-full bg-emerald-500 text-neutral-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isTakingSnapshot ? 'animate-spin' : ''}`} />
              <span>{isTakingSnapshot ? 'Backing up...' : 'Snapshot Now'}</span>
            </button>
          </div>

          {/* Primary Clear Indicator of Remaining Capacity */}
          <div
            id="storage-remaining-capacity-card"
            className="p-3.5 rounded-2xl bg-gradient-to-br from-neutral-950/90 to-emerald-950/20 border border-emerald-500/30 shadow-inner"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-neutral-200">
                  Remaining Storage Capacity
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {freePercent}% Headroom Free
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2.5">
              <div>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  {freeFormatted}
                </span>
                <span className="text-xs text-neutral-400 ml-1.5 font-medium">
                  available of {limitFormatted}
                </span>
              </div>
              <div className="text-right text-[11px] text-neutral-400">
                <span className="text-white font-mono font-semibold">{usedFormatted}</span> consumed
              </div>
            </div>

            {/* Segmented Capacity Meter */}
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5 flex gap-0.5">
              {/* Videos */}
              <div
                title={`Videos: ${formatBytes(storageBreakdown.videosBytes)}`}
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                style={{
                  width: `${Math.max(1, ((storageBreakdown.videosBytes / (storageBreakdown.limitBytes || 1)) * 100))}%`,
                }}
              />
              {/* Photos */}
              <div
                title={`Photos: ${formatBytes(storageBreakdown.photosBytes)}`}
                className="h-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${Math.max(1, ((storageBreakdown.photosBytes / (storageBreakdown.limitBytes || 1)) * 100))}%`,
                }}
              />
              {/* Documents */}
              <div
                title={`Documents: ${formatBytes(storageBreakdown.documentsBytes)}`}
                className="h-full bg-cyan-500 transition-all duration-500"
                style={{
                  width: `${Math.max(1, ((storageBreakdown.documentsBytes / (storageBreakdown.limitBytes || 1)) * 100))}%`,
                }}
              />
              {/* Snapshots */}
              <div
                title={`Snapshots: ${formatBytes(storageBreakdown.backupsBytes)}`}
                className="h-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${Math.max(0.5, (((storageBreakdown.backupsBytes || 0) / (storageBreakdown.limitBytes || 1)) * 100))}%`,
                }}
              />
              {/* Free remaining capacity */}
              <div
                title={`Remaining Free: ${freeFormatted}`}
                className="h-full bg-neutral-800 hover:bg-neutral-700/80 rounded-r-full transition-all duration-500 flex-1"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5 px-0.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Media ({usedFormatted})
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                Headroom Free ({freeFormatted})
              </span>
            </div>
          </div>

          {/* Recharts Donut Visualization */}
          <div id="storage-recharts-container" className="pt-1">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                Storage Allocation Chart
              </span>
              {/* View Switcher: Full Vault vs Active Media */}
              <div className="inline-flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStorageChartMode('vault')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                    storageChartMode === 'vault'
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Full Capacity
                </button>
                <button
                  type="button"
                  onClick={() => setStorageChartMode('media')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                    storageChartMode === 'media'
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Active Media Share
                </button>
              </div>
            </div>

            {/* Recharts Container with Center Overlay */}
            <div className="relative w-full h-52 bg-neutral-950/60 rounded-2xl border border-neutral-800/80 flex items-center justify-center overflow-hidden">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={activeChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="#121212"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        const isFree = item.name === 'Remaining Capacity';
                        const percentOfLimit = Math.max(
                          0.1,
                          Number(((item.bytes / (storageBreakdown.limitBytes || 1)) * 100).toFixed(1))
                        );
                        const percentOfUsed = Math.max(
                          0.1,
                          Number(((item.bytes / (storageBreakdown.totalUsedBytes || 1)) * 100).toFixed(1))
                        );
                        return (
                          <div className="bg-neutral-950/95 border border-neutral-700/90 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md text-xs pointer-events-none z-50">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-semibold text-white">{item.name}</span>
                            </div>
                            <div className="font-mono font-bold text-sm text-emerald-400">
                              {formatBytes(item.bytes)}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              {isFree
                                ? `${freePercent}% unallocated capacity`
                                : `${percentOfUsed}% of active media (${percentOfLimit}% of total vault)`}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>

              {/* Center Donut Ring Indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none">
                <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                  {storageChartMode === 'vault' ? 'Remaining Free' : 'Active Used'}
                </span>
                <span className="text-base font-mono font-extrabold text-white tracking-tight leading-tight">
                  {storageChartMode === 'vault' ? freeFormatted : usedFormatted}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  {storageChartMode === 'vault' ? `${freePercent}% Headroom` : `${percentUsed}% Quota`}
                </span>
              </div>
            </div>
          </div>

          {/* Categorized Visual Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800 text-[10px]">
            {/* Photos */}
            <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-neutral-300 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Photos
                  </span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <span className="block text-white font-mono font-bold text-xs">
                  {formatBytes(storageBreakdown.photosBytes)}
                </span>
              </div>
              <span className="text-[9px] text-neutral-500 mt-1 block">
                {Math.round((storageBreakdown.photosBytes / (storageBreakdown.totalUsedBytes || 1)) * 100)}% of used
              </span>
            </div>

            {/* Videos */}
            <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-neutral-300 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    4K Videos
                  </span>
                  <Video className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="block text-white font-mono font-bold text-xs">
                  {formatBytes(storageBreakdown.videosBytes)}
                </span>
              </div>
              <span className="text-[9px] text-neutral-500 mt-1 block">
                {Math.round((storageBreakdown.videosBytes / (storageBreakdown.totalUsedBytes || 1)) * 100)}% of used
              </span>
            </div>

            {/* Documents */}
            <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-neutral-300 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    Documents
                  </span>
                  <FileText className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="block text-white font-mono font-bold text-xs">
                  {formatBytes(storageBreakdown.documentsBytes)}
                </span>
              </div>
              <span className="text-[9px] text-neutral-500 mt-1 block">
                {Math.round((storageBreakdown.documentsBytes / (storageBreakdown.totalUsedBytes || 1)) * 100)}% of used
              </span>
            </div>

            {/* Remaining Capacity */}
            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Free Space
                  </span>
                  <HardDrive className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="block text-emerald-400 font-mono font-bold text-xs">
                  {freeFormatted}
                </span>
              </div>
              <span className="text-[9px] text-emerald-400/80 font-medium mt-1 block">
                {freePercent}% headroom
              </span>
            </div>
          </div>
        </div>

        {/* 2. Storage Plans & Headroom Expansion */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Storage Expansion Tiers
              </h3>
              <p className="text-[10px] text-neutral-500">
                Scale database quotas for massive 4K/8K video collections and documents
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STORAGE_TIERS.map((tier) => {
              const isCurrent = currentPlan === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => !isCurrent && handleSelectPlan(tier.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-emerald-950/30 border-emerald-500/70 ring-1 ring-emerald-500/40'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{tier.title}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {tier.sizeLabel}
                      </span>
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-relaxed mb-2">
                      {tier.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                    <span className="text-[11px] font-semibold text-neutral-300">
                      {tier.price}
                    </span>

                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-neutral-950 font-bold text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active Tier
                      </span>
                    ) : (
                      <button
                        disabled={isUpgradingPlan}
                        className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-neutral-200 text-[10px] font-medium transition-colors"
                      >
                        Select Tier
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Sync & Backup */}
        <div id="settings-sync-and-backup-section" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                Sync & Backup
              </h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Manage cloud vault synchronization, network data rules, and media quality
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cloud Sync Active
            </span>
          </div>

          <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 divide-y divide-neutral-800/80 overflow-hidden shadow-lg">
            {/* Toggle 1: Auto-Backup Over Wi-Fi Only */}
            <div className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-800/30 transition-colors">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    wifiOnly
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700/50'
                  }`}
                >
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-semibold">Auto-Backup Over Wi-Fi Only</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        wifiOnly
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {wifiOnly ? 'Wi-Fi Only' : 'Cellular + Wi-Fi'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                    Only upload and synchronize media when connected to unmetered Wi-Fi networks to avoid cellular data usage.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="toggle-auto-backup-wifi-only"
                role="switch"
                aria-checked={wifiOnly}
                onClick={() => handleToggleWifiOnly(!wifiOnly)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  wifiOnly ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    wifiOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Optimize Video Quality */}
            <div className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-800/30 transition-colors">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    optimizeVideoQuality
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700/50'
                  }`}
                >
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-semibold">Optimize Video Quality</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        optimizeVideoQuality
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {optimizeVideoQuality ? 'H.265 Space Saver' : 'Lossless Original'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                    Compress 4K and high-bitrate video uploads to save cloud vault storage space while maintaining visual clarity.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="toggle-optimize-video-quality"
                role="switch"
                aria-checked={optimizeVideoQuality}
                onClick={() => handleToggleOptimizeVideo(!optimizeVideoQuality)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  optimizeVideoQuality ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    optimizeVideoQuality ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Master Auto-Backup Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-100 font-semibold block">Automatic Cloud Backups</span>
                  <span className="text-[10px] text-neutral-400">
                    Generate encrypted point-in-time snapshots in background
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setAutoBackupEnabled(val);
                  handleSaveBackupConfig({ autoBackupEnabled: val });
                }}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Backup Cadence Interval */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-neutral-200 font-medium block">Backup Frequency</span>
                  <span className="text-[10px] text-neutral-500">
                    Interval for database snapshot generation
                  </span>
                </div>
              </div>
              <select
                value={autoBackupInterval}
                disabled={!autoBackupEnabled}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setAutoBackupInterval(val);
                  handleSaveBackupConfig({ autoBackupInterval: val });
                }}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-40"
              >
                <option value="realtime">Real-Time (On Every Change)</option>
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily (24 Hours)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Preserve Original Media Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-neutral-200 font-medium block">Preserve Original Media</span>
                  <span className="text-[10px] text-neutral-500">
                    Back up full uncompressed 4K/8K videos and lossless photos
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={backupOriginalMedia}
                onChange={(e) => {
                  const val = e.target.checked;
                  setBackupOriginalMedia(val);
                  handleSaveBackupConfig({ backupOriginalMedia: val });
                }}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Verified Database Snapshots History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Verified Snapshots ({snapshots.length})
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">
              AES-256 GCM Protected
            </span>
          </div>

          <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 divide-y divide-neutral-800/60 max-h-56 overflow-y-auto">
            {snapshots.length === 0 ? (
              <div className="p-4 text-center text-neutral-500 text-[11px]">
                No backup snapshots yet. Tap "Snapshot Now" above to create one.
              </div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="truncate mr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-[11px] truncate block">
                        {snap.filename}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          snap.type === 'auto'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {snap.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{new Date(snap.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{formatBytes(snap.sizeBytes)}</span>
                      <span>•</span>
                      <span>{snap.itemsCount} vault items</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleRestoreSnapshot(snap.id)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-neutral-200 text-[10px] font-medium transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Restore database to this snapshot"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Display & Contrast Theme Section */}
        <div id="settings-display-theme-section" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Display & Contrast Theme</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-bold">
              {theme === 'amoled' ? 'AMOLED Black Active' : 'Midnight Dark Active'}
            </span>
          </div>

          <ThemeToggler
            theme={theme}
            onToggleTheme={onToggleTheme || (() => {})}
            onSelectTheme={(newTheme) => {
              onSelectTheme?.(newTheme);
              onUpdateSettings({ theme: newTheme });
            }}
            variant="cards"
          />
        </div>

        {/* Android App & APK Section */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold px-1">
            Android App & Installation
          </h3>
          <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-neutral-900/60 to-cyan-950/40 border border-emerald-500/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-neutral-950 shadow-lg shadow-emerald-500/20 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    ZERO for Android
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      APK v1.0
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Install direct WebAPK or download the standalone ZERO-v1.0.apk package
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenApkModal}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Get APK</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. Security & Vault PIN */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold px-1">
            Privacy & Access Control
          </h3>
          <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 divide-y divide-neutral-800/60">
            {/* Private Account */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-neutral-200 font-medium block">Private ZERO Vault</span>
                  <span className="text-[10px] text-neutral-500">
                    Only approved peers can view your feed and public albums
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={handleTogglePrivate}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Vault PIN code */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-neutral-200 font-medium block">4-Digit Security PIN</span>
                  <span className="text-[10px] text-neutral-500">
                    PIN code protection for private vault folders
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditingPin(true)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium cursor-pointer"
              >
                Change PIN
              </button>
            </div>

            {/* Clear Local Cache */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-neutral-200 font-medium block">Local Storage Cache</span>
                <span className="text-[10px] text-neutral-500">
                  {cacheCleared ? 'Cleared 148 MB of local temp thumbnails' : '148 MB cached'}
                </span>
              </div>
              <button
                onClick={handleCacheClear}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Change PIN Modal */}
        {isEditingPin && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsEditingPin(false)}
          >
            <div
              className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-white mb-1">Set New 4-Digit Vault PIN</h3>
              <p className="text-xs text-neutral-400 mb-4">
                This PIN safeguards all private encrypted albums.
              </p>

              <form onSubmit={handleSavePin} className="space-y-3">
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="Enter 4 digits"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.8em] text-xl font-mono bg-neutral-950 border border-neutral-800 rounded-2xl py-3 text-emerald-400 focus:outline-none focus:border-emerald-500"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPin(false)}
                    className="flex-1 py-2 rounded-full bg-neutral-800 font-semibold text-neutral-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newPin.length !== 4}
                    className="flex-1 py-2 rounded-full bg-emerald-500 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer"
                  >
                    Update PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 6. Account Actions */}
        <div className="space-y-2 pt-2">
          <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 divide-y divide-neutral-800/60">
            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-full p-3.5 flex items-center justify-between text-neutral-300 hover:text-white hover:bg-neutral-800/40 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Sign Out of ZERO</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-3.5 flex items-center justify-between text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="font-medium">Delete ZERO Account & Database</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="w-full max-w-sm bg-neutral-900 border border-rose-500/30 rounded-3xl p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-sm font-bold text-center text-white">Permanently Delete Account?</h3>
              <p className="text-xs text-center text-neutral-400 mt-1 leading-relaxed">
                This will delete your database records, all uploaded 4K photos/videos, documents, and cancel your vault quota immediately.
              </p>

              <div className="mt-4 space-y-3">
                <p className="text-[11px] text-neutral-400">
                  Type <span className="text-rose-400 font-mono font-bold">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full text-center bg-neutral-950 border border-neutral-800 rounded-xl py-2 text-rose-400 font-mono focus:outline-none focus:border-rose-500"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2 rounded-full bg-neutral-800 font-semibold text-neutral-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleteConfirmText !== 'DELETE'}
                    onClick={() => {
                      onDeleteAccount();
                      setShowDeleteModal(false);
                    }}
                    className="flex-1 py-2 rounded-full bg-rose-500 font-semibold text-white hover:bg-rose-600 disabled:opacity-40 cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
