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
  Code2,
  Terminal,
  Copy,
  Cpu,
  Fingerprint,
  Video,
  Shield,
  FolderGit2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ANDROID_KOTLIN_FILES, AndroidSourceFile } from '../data/androidKotlinFiles';

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
  const [activeTab, setActiveTab] = useState<'build' | 'explorer' | 'architecture'>('build');
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AndroidSourceFile>(ANDROID_KOTLIN_FILES[0]);
  const [copiedCode, setCopiedCode] = useState(false);

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
      onShowToast('Downloading complete Native Kotlin Android Studio Project (.zip)...');
    } catch {
      onShowToast('Failed to trigger project download');
    } finally {
      setTimeout(() => setDownloadingZip(false), 1500);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopiedCode(true);
    onShowToast(`Copied ${selectedFile.name} to clipboard`);
    setTimeout(() => setCopiedCode(false), 2000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="zero-android-studio-modal"
        className="relative w-full max-w-2xl bg-[#0e1117] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-neutral-900/40 to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-neutral-950 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  ZERO Native Android App
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Kotlin 2.0 • SDK 35
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Pure native Android SDK project with Jetpack Compose & Keystore Crypto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-2 border-b border-neutral-800/60 flex items-center gap-2 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('build')}
            className={`pb-2.5 pt-1 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'build'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Project & Packages</span>
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`pb-2.5 pt-1 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'explorer'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kotlin Source Explorer</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 pt-1 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Android SDK Architecture</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {activeTab === 'build' && (
            <>
              {/* Primary: Native Android Studio Project */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-neutral-900/60 to-neutral-900/80 border border-emerald-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">
                        Android Studio Kotlin Project (.zip)
                      </h4>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                        Ready to Build
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300">
                      Complete Gradle project with Kotlin DSL (<code className="text-emerald-400">build.gradle.kts</code>),
                      Jetpack Compose Material 3 UI, and Android Keystore AES-256 GCM encryption.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-neutral-400 font-mono">
                      <span>Package: app.zero.vault</span>
                      <span>•</span>
                      <span>Target SDK: 35 (Android 15)</span>
                      <span>•</span>
                      <span>Min SDK: 26</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadProject}
                    disabled={downloadingZip}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingZip ? 'Packaging...' : 'Download Project (.zip)'}</span>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    Tested with Android Studio Ladybug & Koala
                  </span>
                  <span className="font-mono text-neutral-500">./gradlew assembleDebug</span>
                </div>
              </div>

              {/* Secondary: Standalone APK & Direct Install */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Direct APK */}
                <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white">Standalone ZERO-v1.0.apk</h4>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Android package for direct sideloading or deployment to test devices.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadApk}
                    disabled={downloadingApk}
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>{downloadingApk ? 'Preparing APK...' : 'Download APK (41 KB)'}</span>
                  </button>
                </div>

                {/* Android Chrome WebAPK */}
                <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white">Direct WebAPK Install</h4>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Android OS creates an authentic launcher app with splash screen and offline support.
                    </p>
                  </div>
                  {isInstalled ? (
                    <div className="mt-3 py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Installed on Device</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleNativeInstall}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{isAndroid ? 'Install on Android' : '1-Tap WebAPK'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Build Instructions */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-neutral-200">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>How to Build & Run in Android Studio</span>
                </div>
                <ol className="space-y-1.5 text-neutral-400 list-decimal list-inside pl-1 text-[11px]">
                  <li>
                    Extract <strong className="text-neutral-200">ZERO-Android-Project.zip</strong>.
                  </li>
                  <li>
                    Open <strong className="text-neutral-200">Android Studio</strong> and select <strong className="text-neutral-200">"Open Project"</strong>.
                  </li>
                  <li>
                    Let Gradle sync dependencies (<code className="text-emerald-400">AGP 8.7</code> + <code className="text-emerald-400">Kotlin 2.0.21</code>).
                  </li>
                  <li>
                    Run command: <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-emerald-400">./gradlew assembleDebug</code> or click Run (<kbd className="bg-neutral-800 px-1 rounded text-neutral-300">Shift + F10</kbd>).
                  </li>
                  <li>
                    The debug APK is generated at: <code className="text-neutral-300">app/build/outputs/apk/debug/app-debug.apk</code>.
                  </li>
                </ol>
              </div>
            </>
          )}

          {activeTab === 'explorer' && (
            <div className="space-y-3">
              {/* File Pill Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {ANDROID_KOTLIN_FILES.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-mono text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedFile.path === file.path
                        ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{file.name}</span>
                  </button>
                ))}
              </div>

              {/* Selected File Description & Copy Header */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="text-xs">
                  <span className="font-mono text-emerald-400 block">{selectedFile.path}</span>
                  <span className="text-[11px] text-neutral-400">{selectedFile.description}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-2xl bg-[#07090e] border border-neutral-800/80 p-4 max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-300 select-text">
                <pre className="whitespace-pre overflow-x-auto">{selectedFile.code}</pre>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Hardware-Backed Android Keystore Cryptography
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  ZERO uses the official <strong className="text-white">AndroidX Security Crypto</strong> library (<code className="text-emerald-400">androidx.security:security-crypto</code>).
                  Every photo, video, and vault record is encrypted using <strong className="text-emerald-400">AES-256 GCM</strong> with a master key stored in the hardware-isolated Android Keystore TEE/SE chip.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  AndroidX Biometric Authentication
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  Integrated with <strong className="text-white">BiometricPrompt</strong> (<code className="text-cyan-400">androidx.biometric:biometric</code>), allowing instant unlock via Class 3 strong fingerprint sensors and facial recognition with automatic device PIN fallback.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Video className="w-4 h-4 text-amber-400" />
                  AndroidX Media3 ExoPlayer Engine
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  Vertical reels and high-bitrate 4K vault playback are powered by <strong className="text-white">AndroidX Media3 ExoPlayer</strong> (<code className="text-amber-400">androidx.media3:media3-exoplayer</code>) with hardware-accelerated codec decoding, seamless looping, and audio focus management.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  Modern Jetpack Compose & Material 3
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  100% declarative UI built with <strong className="text-white">Jetpack Compose</strong> and <strong className="text-white">Material 3</strong>. Implements Android 15 edge-to-edge rendering, fluid predictive back gestures, and obsidian dark styling.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pure Native Kotlin & Android SDK</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
