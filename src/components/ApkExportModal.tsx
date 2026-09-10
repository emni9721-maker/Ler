import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Check,
  ExternalLink,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Info,
  X,
  FileCode,
  ArrowDownToLine,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        onShowToast('Android WebAPK installation initiated!');
        onClose();
      }
    } else {
      onShowToast('Install option is accessible in Chrome: Menu (⋮) -> Add to Home screen');
    }
  };

  const handleDownloadApk = () => {
    setDownloadingApk(true);
    try {
      const link = document.createElement('a');
      link.href = '/api/download/apk';
      link.download = 'ZERO-v1.0.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Downloading ZERO-v1.0.apk package...');
    } catch {
      onShowToast('Failed to trigger APK download');
    } finally {
      setTimeout(() => setDownloadingApk(false), 1500);
    }
  };

  const handleDownloadProject = () => {
    setDownloadingZip(true);
    try {
      const link = document.createElement('a');
      link.href = '/api/download/android-project';
      link.download = 'ZERO-Android-Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Downloading ZERO Android Studio Project (.zip)...');
    } catch {
      onShowToast('Failed to trigger project download');
    } finally {
      setTimeout(() => setDownloadingZip(false), 1500);
    }
  };

  const handleOpenPwaBuilder = () => {
    const currentUrl = window.location.origin;
    window.open(
      `https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="zero-apk-export-modal"
        className="relative w-full max-w-lg bg-[#10141d] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between bg-gradient-to-r from-emerald-950/30 via-transparent to-cyan-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">ZERO Android App & APK</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-neutral-400">Install native WebAPK or download Android package</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* 1. Android Direct WebAPK Installation */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-white">1-Tap Direct WebAPK Installation</h4>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Android Chrome / Edge generates an authentic system WebAPK directly on your phone with native launcher icon, full screen, and offline cache.
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              {isInstalled ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                  <Check className="w-4 h-4" />
                  <span>Installed as Native App</span>
                </div>
              ) : (
                <button
                  onClick={handleNativeInstall}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-neutral-950" />
                  <span>{isAndroid ? 'Install WebAPK on this Device' : 'Install ZERO App (PWA / WebAPK)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Download ZERO-v1.0.apk */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-800 text-cyan-400 mt-0.5">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Download ZERO-v1.0.apk</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Standalone Android package for manual sideloading or deployment.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700/60">
                      Package: app.zero.vault
                    </span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700/60">
                      Target: Android 8.0+ (API 34)
                    </span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700/60">
                      41 KB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleDownloadApk}
                disabled={downloadingApk}
                className="flex-1 py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>{downloadingApk ? 'Preparing APK...' : 'Download ZERO-v1.0.apk'}</span>
              </button>

              <button
                onClick={handleDownloadProject}
                disabled={downloadingZip}
                title="Download complete Android Studio Gradle project"
                className="py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>Android Studio Source (.zip)</span>
              </button>
            </div>
          </div>

          {/* 3. PWABuilder Signed Play Store APK / AAB */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-neutral-800 text-amber-400 mt-0.5">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Signed Play Store APK / AAB</h4>
                  <button
                    onClick={handleOpenPwaBuilder}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <span>PWABuilder</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Convert this PWA into a production signed Google Play APK / Android App Bundle (.aab) with 1 click using Microsoft PWABuilder.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Manual Android Chrome Installation Guide */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 mb-2">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>How to install on any Android phone right now:</span>
            </div>
            <ol className="space-y-1.5 text-xs text-neutral-400 list-decimal list-inside pl-1">
              <li>Open this website in <strong className="text-neutral-200">Google Chrome</strong> on Android.</li>
              <li>Tap the three-dots menu <strong className="text-neutral-200">(⋮)</strong> in the top right.</li>
              <li>Select <strong className="text-neutral-200">"Install app"</strong> or <strong className="text-neutral-200">"Add to Home screen"</strong>.</li>
              <li>Android will automatically assemble and install the native <strong className="text-emerald-400">ZERO WebAPK</strong> onto your phone!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Encrypted Vault Shell</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
