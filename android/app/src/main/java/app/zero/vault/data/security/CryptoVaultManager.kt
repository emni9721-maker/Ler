package app.zero.vault.data.security

import android.content.Context
import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedFile
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

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

        // 2. EncryptedSharedPreferences for local vault configuration
        encryptedPrefs = EncryptedSharedPreferences.create(
            context,
            "zero_vault_encrypted_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )

        // Seed default PIN if unset
        if (!encryptedPrefs.contains("vault_pin")) {
            encryptedPrefs.edit().putString("vault_pin", "1234").apply()
        }
    }

    fun verifyPin(pin: String): Boolean {
        val stored = encryptedPrefs.getString("vault_pin", "1234")
        return stored == pin
    }

    fun setPin(newPin: String) {
        encryptedPrefs.edit().putString("vault_pin", newPin).apply()
    }

    fun isBiometricEnabled(): Boolean {
        return encryptedPrefs.getBoolean("biometric_enabled", true)
    }

    fun setBiometricEnabled(enabled: Boolean) {
        encryptedPrefs.edit().putBoolean("biometric_enabled", enabled).apply()
    }

    /**
     * Encrypts a raw byte array (photo/video) using AndroidX EncryptedFile.
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
}
