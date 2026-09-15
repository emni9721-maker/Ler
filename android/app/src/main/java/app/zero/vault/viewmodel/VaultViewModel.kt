package app.zero.vault.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.zero.vault.data.api.ZeroApiService
import app.zero.vault.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class VaultUiState(
    val currentUser: User? = null,
    val posts: List<Post> = emptyList(),
    val photos: List<PhotoItem> = emptyList(),
    val albums: List<Album> = emptyList(),
    val stories: List<Story> = emptyList(),
    val reels: List<Reel> = emptyList(),
    val isVaultUnlocked: Boolean = false,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val storageUsedBytes: Long = 15_891_378_995L,
    val storageLimitBytes: Long = 53_687_091_200L
)

class VaultViewModel : ViewModel() {

    private val api = ZeroApiService.create()

    private val _uiState = MutableStateFlow(VaultUiState())
    val uiState: StateFlow<VaultUiState> = _uiState.asStateFlow()

    init {
        loadInitialData()
    }

    fun loadInitialData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                // Fetch current user
                val user = try { api.getCurrentUser() } catch (e: Exception) {
                    User(
                        id = "u_zero_me",
                        username = "kai.vance",
                        displayName = "Kai Vance",
                        avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                        bio = "Visual designer & ambient explorer. Storing moments in ZERO vault. 🌿📸",
                        storageUsedBytes = 15_891_378_995L,
                        storageLimitBytes = 53_687_091_200L
                    )
                }

                // Sample reels
                val sampleReels = listOf(
                    Reel(
                        id = "reel_1",
                        userId = "u_elena",
                        user = User("u_elena", "elena.rostova", "Elena Rostova", null, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"),
                        videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
                        caption = "Breeze through the pines in Yosemite dawn 🌲✨ #vault #nature",
                        audioTrack = "Original Audio - Ambient Echoes",
                        likesCount = 342,
                        commentsCount = 28
                    ),
                    Reel(
                        id = "reel_2",
                        userId = "u_marcus",
                        user = User("u_marcus", "marcus.chen", "Marcus Chen", null, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"),
                        videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
                        caption = "Sunset golden hour flight over the canyons 🚁🌅 4K Lossless RAW",
                        audioTrack = "Chill Lo-Fi Horizons - ZERO Studio",
                        likesCount = 890,
                        commentsCount = 64
                    )
                )

                // Fetch real posts & photos
                val posts = try { api.getFeedPosts() } catch (e: Exception) { emptyList() }
                val photos = try { api.getVaultPhotos() } catch (e: Exception) { emptyList() }
                val albums = try { api.getAlbums() } catch (e: Exception) { emptyList() }

                _uiState.value = _uiState.value.copy(
                    currentUser = user,
                    posts = posts,
                    photos = photos,
                    albums = albums,
                    reels = sampleReels,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.localizedMessage
                )
            }
        }
    }

    fun unlockVault() {
        _uiState.value = _uiState.value.copy(isVaultUnlocked = true)
    }

    fun lockVault() {
        _uiState.value = _uiState.value.copy(isVaultUnlocked = false)
    }

    fun toggleLikePost(postId: String) {
        val updated = _uiState.value.posts.map { p ->
            if (p.id == postId) {
                val next = !p.isLiked
                p.copy(isLiked = next, likesCount = if (next) p.likesCount + 1 else p.likesCount - 1)
            } else p
        }
        _uiState.value = _uiState.value.copy(posts = updated)
        viewModelScope.launch {
            try { api.toggleLikePost(postId) } catch (_: Exception) {}
        }
    }

    fun toggleFavoritePhoto(photoId: String) {
        val updated = _uiState.value.photos.map { p ->
            if (p.id == photoId) p.copy(isFavorite = !p.isFavorite) else p
        }
        _uiState.value = _uiState.value.copy(photos = updated)
        viewModelScope.launch {
            try { api.toggleFavorite(photoId) } catch (_: Exception) {}
        }
    }
}
