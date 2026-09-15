# ZERO: Encrypted Cloud Vault & Social Platform
## Native Android SDK (Kotlin & Jetpack Compose)

This directory contains the complete, production-grade native Android project for ZERO built with Kotlin and modern Android SDK architecture.

### Architecture & Tech Stack
- **Language**: 100% Kotlin with Coroutines & Flow
- **UI Toolkit**: Jetpack Compose with Material 3 Dynamic Dark Theme
- **Local Vault Security**: AndroidX Security Crypto (`MasterKey` with AES-256 GCM hardware-backed Android Keystore)
- **Biometric Gate**: AndroidX Biometric (`BiometricPrompt` with Strong Biometrics / Device Credential)
- **Video & Reels Engine**: AndroidX Media3 ExoPlayer (`androidx.media3:media3-exoplayer`)
- **Networking**: Retrofit 2 + OkHttp3 with automatic JSON parsing
- **Image Pipeline**: Coil 2 with video-frame thumbnail decoding
- **Target SDK**: Android 15 (API 35), Min SDK 26 (Android 8.0+)

### How to Open & Build in Android Studio
1. Launch **Android Studio** (Koala, Ladybug, or Meerkat).
2. Choose **Open Project** and select this `android` folder.
3. Allow Gradle to sync dependencies.
4. Connect an Android device with USB debugging enabled, or launch an Android Virtual Device (AVD).
5. Click **Run 'app'** (`Shift + F10`) or run from terminal:
   ```bash
   ./gradlew assembleDebug
   ```
6. The debug APK will be generated at:
   `app/build/outputs/apk/debug/app-debug.apk`
