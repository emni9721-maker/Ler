package app.zero.vault

import android.app.Application
import app.zero.vault.data.security.CryptoVaultManager

/**
 * Android Application Entry Point for ZERO.
 * Initializes hardware-backed Keystore crypto and cache directories.
 */
class ZeroApplication : Application() {

    lateinit var cryptoVaultManager: CryptoVaultManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        cryptoVaultManager = CryptoVaultManager(this)
        cryptoVaultManager.initializeVault()
    }

    companion object {
        lateinit var instance: ZeroApplication
            private set
    }
}
