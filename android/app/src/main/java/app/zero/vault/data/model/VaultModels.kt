package app.zero.vault.data.model

import com.google.gson.annotations.SerializedName

enum class MediaType {
    @SerializedName("image") IMAGE,
    @SerializedName("video") VIDEO
}

data class User(
    val id: String,
    val username: String,
    val displayName: String,
    val email: String? = null,
    val avatarUrl: String,
    val coverUrl: String? = null,
    val bio: String? = null,
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val storageUsedBytes: Long = 0L,
    val storageLimitBytes: Long = 53_687_091_200L, // 50GB Starter
    val isPrivate: Boolean = false,
    val vaultPin: String = "1234"
)

data class PhotoItem(
    val id: String,
    val userId: String,
    val url: String,
    val thumbnailUrl: String? = null,
    val type: MediaType = MediaType.IMAGE,
    val filename: String,
    val sizeBytes: Long,
    val originalSizeBytes: Long,
    val date: String,
    val isFavorite: Boolean = false,
    val isDeleted: Boolean = false,
    val deletedAt: String? = null,
    val caption: String? = null,
    val location: String? = null,
    val tags: List<String> = emptyList(),
    val albumIds: List<String> = emptyList()
)

data class Album(
    val id: String,
    val userId: String,
    val name: String,
    val description: String? = null,
    val coverUrl: String,
    val photoCount: Int = 0,
    val isPrivate: Boolean = false,
    val isVaultLocked: Boolean = false,
    val pinCode: String? = null,
    val createdAt: String
)

data class PostComment(
    val id: String,
    val userId: String,
    val user: User,
    val text: String,
    val createdAt: String
)

data class PostMedia(
    val url: String,
    val type: MediaType,
    val photoId: String? = null
)

data class Post(
    val id: String,
    val userId: String,
    val user: User,
    val content: String,
    val media: List<PostMedia> = emptyList(),
    val likesCount: Int = 0,
    val isLiked: Boolean = false,
    val comments: List<PostComment> = emptyList(),
    val sharesCount: Int = 0,
    val privacy: String = "public",
    val createdAt: String,
    val savedBy: List<String> = emptyList()
)

data class Story(
    val id: String,
    val userId: String,
    val user: User,
    val mediaUrl: String,
    val mediaType: MediaType = MediaType.IMAGE,
    val caption: String? = null,
    val createdAt: Long,
    val expiresAt: Long
)

data class Reel(
    val id: String,
    val userId: String,
    val user: User,
    val videoUrl: String,
    val caption: String,
    val audioTrack: String,
    val likesCount: Int = 0,
    val commentsCount: Int = 0,
    val isLiked: Boolean = false,
    val durationSec: Int = 15
)

data class StorageBreakdown(
    val photosBytes: Long,
    val videosBytes: Long,
    val documentsBytes: Long,
    val backupsBytes: Long,
    val totalUsedBytes: Long,
    val limitBytes: Long,
    val freeBytes: Long,
    val percentUsed: Int,
    val plan: String
)
