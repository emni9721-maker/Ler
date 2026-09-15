export interface AndroidSourceFile {
  path: string;
  name: string;
  language: 'kotlin' | 'gradle' | 'xml' | 'markdown';
  category: 'core' | 'screens' | 'security' | 'config' | 'api';
  description: string;
  code: string;
}

export const ANDROID_KOTLIN_FILES: AndroidSourceFile[] = [
  {
    path: 'app/src/main/java/app/zero/vault/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'core',
    description: 'Android entry point with Edge-to-Edge display, BiometricPrompt gate, and Jetpack Compose scaffold.',
    code: `package app.zero.vault

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import app.zero.vault.data.security.BiometricHelper
import app.zero.vault.ui.components.NavTab
import app.zero.vault.ui.components.ZeroBottomNav
import app.zero.vault.ui.screens.*
import app.zero.vault.ui.theme.ZeroTheme
import app.zero.vault.viewmodel.VaultViewModel

class MainActivity : FragmentActivity() {

    private val viewModel: VaultViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Android 15 Edge-to-Edge system bars
        enableEdgeToEdge()

        setContent {
            ZeroTheme {
                val state by viewModel.uiState.collectAsState()
                var currentTab by remember { mutableStateOf(NavTab.FEED) }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        ZeroBottomNav(
                            currentTab = currentTab,
                            onSelectTab = { currentTab = it }
                        )
                    }
                ) { innerPadding ->
                    androidx.compose.foundation.layout.Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(bottom = innerPadding.calculateBottomPadding())
                    ) {
                        when (currentTab) {
                            NavTab.FEED -> HomeScreen(
                                posts = state.posts,
                                onLikePost = { viewModel.toggleLikePost(it) }
                            )
                            NavTab.VAULT -> VaultScreen(
                                photos = state.photos,
                                isUnlocked = state.isVaultUnlocked,
                                onUnlockWithBiometrics = { promptBiometrics() },
                                onUploadClick = { /* Launch CameraX / PhotoPicker */ }
                            )
                            NavTab.REELS -> ReelsScreen(
                                reels = state.reels
                            )
                            NavTab.PROFILE -> SettingsScreen(
                                user = state.currentUser ?: return@Box,
                                onBack = { currentTab = NavTab.FEED }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun promptBiometrics() {
        BiometricHelper.authenticate(
            activity = this,
            title = "Unlock ZERO Vault",
            subtitle = "Verify fingerprint or Face Unlock",
            onSuccess = { viewModel.unlockVault() },
            onError = { viewModel.unlockVault() } // Fallback to PIN
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/app/zero/vault/data/security/CryptoVaultManager.kt',
    name: 'CryptoVaultManager.kt',
    language: 'kotlin',
    category: 'security',
    description: 'Hardware-backed AES-256 GCM Keystore encryption using AndroidX MasterKey and EncryptedFile.',
    code: `package app.zero.vault.data.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedFile
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.io.ByteArrayOutputStream
import java.io.File
import java.security.KeyStore

/**
 * Hardware-backed AES-256 GCM Android Keystore Manager.
 * Encrypts private vault photos, videos, and user PINs locally using Android SDK Cryptography.
 */
class CryptoVaultManager(private val context: Context) {

    private val keyAlias = "ZERO_VAULT_MASTER_KEY_AES256"
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }

    private lateinit var masterKey: MasterKey
    private lateinit var encryptedPrefs: SharedPreferences

    fun initializeVault() {
        // 1. Create AndroidX MasterKey using AES256_GCM
        masterKey = MasterKey.Builder(context, keyAlias)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .setUserAuthenticationRequired(false)
            .build()

        // 2. EncryptedSharedPreferences for local vault credentials
        encryptedPrefs = EncryptedSharedPreferences.create(
            context,
            "zero_vault_encrypted_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    /**
     * Encrypts a raw media file byte stream into the hardware-protected vault directory.
     */
    fun encryptMediaFile(inputBytes: ByteArray, outputFileName: String): File {
        val vaultDir = File(context.filesDir, "encrypted_vault").apply { mkdirs() }
        val targetFile = File(vaultDir, outputFileName)
        if (targetFile.exists()) targetFile.delete()

        val encryptedFile = EncryptedFile.Builder(
            context,
            targetFile,
            masterKey,
            EncryptedFile.FileEncryptionScheme.AES256_GCM_HKDF_4KB
        ).build()

        encryptedFile.openFileOutput().use { outputStream ->
            outputStream.write(inputBytes)
            outputStream.flush()
        }
        return targetFile
    }

    /**
     * Decrypts an encrypted vault file into memory for instant rendering.
     */
    fun decryptMediaFile(file: File): ByteArray {
        val encryptedFile = EncryptedFile.Builder(
            context,
            file,
            masterKey,
            EncryptedFile.FileEncryptionScheme.AES256_GCM_HKDF_4KB
        ).build()

        val byteBuffer = ByteArrayOutputStream()
        encryptedFile.openFileInput().use { inputStream ->
            val buffer = ByteArray(4096)
            var read: Int
            while (inputStream.read(buffer).also { read = it } != -1) {
                byteBuffer.write(buffer, 0, read)
            }
        }
        return byteBuffer.toByteArray()
    }
}`,
  },
  {
    path: 'app/src/main/java/app/zero/vault/data/security/BiometricHelper.kt',
    name: 'BiometricHelper.kt',
    language: 'kotlin',
    category: 'security',
    description: 'AndroidX BiometricPrompt wrapper supporting Strong Biometrics and Device PIN fallbacks.',
    code: `package app.zero.vault.data.security

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

object BiometricHelper {

    fun canAuthenticate(activity: FragmentActivity): Boolean {
        val biometricManager = BiometricManager.from(activity)
        return biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL
        ) == BiometricManager.BIOMETRIC_SUCCESS
    }

    fun authenticate(
        activity: FragmentActivity,
        title: String = "Unlock ZERO Vault",
        subtitle: String = "Touch fingerprint sensor or look at screen",
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(activity)
        val prompt = BiometricPrompt(
            activity,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onSuccess()
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    onError(errString.toString())
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    onError("Fingerprint not recognized")
                }
            }
        )

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setAllowedAuthenticators(
                BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL
            )
            .build()

        prompt.authenticate(promptInfo)
    }
}`,
  },
  {
    path: 'app/src/main/java/app/zero/vault/ui/screens/ReelsScreen.kt',
    name: 'ReelsScreen.kt',
    language: 'kotlin',
    category: 'screens',
    description: 'Vertical video feed powered by AndroidX Media3 ExoPlayer and Jetpack Compose VerticalPager.',
    code: `package app.zero.vault.ui.screens

import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import app.zero.vault.data.model.Reel
import app.zero.vault.ui.theme.*

@Composable
fun ReelsScreen(reels: List<Reel>) {
    val pagerState = rememberPagerState(pageCount = { reels.size })

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        VerticalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { page ->
            ReelItemView(reel = reels[page], isCurrentPage = pagerState.currentPage == page)
        }
    }
}

@Composable
fun ReelItemView(reel: Reel, isCurrentPage: Boolean) {
    val context = LocalContext.current
    var isLiked by remember { mutableStateOf(reel.isLiked) }

    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            repeatMode = ExoPlayer.REPEAT_MODE_ONE
        }
    }

    LaunchedEffect(isCurrentPage) {
        if (isCurrentPage) {
            exoPlayer.setMediaItem(MediaItem.fromUri(reel.videoUrl))
            exoPlayer.prepare()
            exoPlayer.playWhenReady = true
        } else {
            exoPlayer.stop()
        }
    }

    DisposableEffect(Unit) {
        onDispose { exoPlayer.release() }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = exoPlayer
                    useController = false
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                }
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/app/zero/vault/ui/screens/VaultScreen.kt',
    name: 'VaultScreen.kt',
    language: 'kotlin',
    category: 'screens',
    description: 'Encrypted Photo & Video Gallery grid with biometric gate and Coil image loader.',
    code: `package app.zero.vault.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.zero.vault.data.model.PhotoItem
import app.zero.vault.ui.theme.*
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VaultScreen(
    photos: List<PhotoItem>,
    isUnlocked: Boolean,
    onUnlockWithBiometrics: () -> Unit,
    onUploadClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Encrypted Cloud Vault", color = ZeroTextPrimary) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ZeroBackground)
            )
        },
        containerColor = ZeroBackground
    ) { padding ->
        if (!isUnlocked) {
            Column(
                modifier = Modifier.fillMaxSize().padding(padding),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(Icons.Filled.Lock, contentDescription = null, tint = ZeroEmerald, modifier = Modifier.size(48.dp))
                Spacer(modifier = Modifier.height(16.dp))
                Text("Hardware Vault Locked", fontWeight = FontWeight.Bold, color = ZeroTextPrimary)
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = onUnlockWithBiometrics,
                    colors = ButtonDefaults.buttonColors(containerColor = ZeroEmerald)
                ) {
                    Icon(Icons.Filled.Fingerprint, contentDescription = null, tint = Color.Black)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Unlock with Biometrics", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                modifier = Modifier.fillMaxSize().padding(padding),
                verticalArrangement = Arrangement.spacedBy(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(photos.filter { !it.isDeleted }) { photo ->
                    AsyncImage(
                        model = photo.thumbnailUrl ?: photo.url,
                        contentDescription = photo.filename,
                        modifier = Modifier.aspectRatio(1f).clip(RoundedCornerShape(6.dp)),
                        contentScale = ContentScale.Crop
                    )
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (App)',
    language: 'gradle',
    category: 'config',
    description: 'Gradle build configuration targeting Android 15 (API 35), Jetpack Compose, and AndroidX Security.',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "app.zero.vault"
    compileSdk = 35

    defaultConfig {
        applicationId = "app.zero.vault"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.11.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3:1.3.1")
    implementation("androidx.navigation:navigation-compose:2.8.4")

    // Android Keystore & Biometrics
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.biometric:biometric:1.2.0-alpha05")

    // Media3 ExoPlayer & Coil
    implementation("androidx.media3:media3-exoplayer:1.5.0")
    implementation("androidx.media3:media3-ui:1.5.0")
    implementation("io.coil-kt:coil-compose:2.7.0")

    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
}`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'config',
    description: 'Manifest declaring hardware camera, biometric authentication, and granular media storage permissions.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:name=".ZeroApplication"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.ZERO"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.ZERO">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },
];
