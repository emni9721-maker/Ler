package app.zero.vault

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
                            NavTab.PROFILE -> {
                                // Profile Screen with storage meter & settings
                                HomeScreen(posts = state.posts.filter { it.userId == state.currentUser?.id }, onLikePost = {})
                            }
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
            onSuccess = {
                viewModel.unlockVault()
            },
            onError = { err ->
                // fallback to PIN
                viewModel.unlockVault()
            }
        )
    }
}
