package app.zero.vault.data.api

import app.zero.vault.data.model.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface ZeroApiService {

    @GET("/api/auth/me")
    suspend fun getCurrentUser(): User

    @GET("/api/posts")
    suspend fun getFeedPosts(): List<Post>

    @POST("/api/posts")
    suspend fun createPost(@Body body: Map<String, Any>): Post

    @POST("/api/posts/{id}/like")
    suspend fun toggleLikePost(@Path("id") postId: String): Map<String, Any>

    @POST("/api/posts/{id}/comment")
    suspend fun addComment(
        @Path("id") postId: String,
        @Body body: Map<String, String>
    ): Map<String, Any>

    @GET("/api/photos")
    suspend fun getVaultPhotos(): List<PhotoItem>

    @POST("/api/photos")
    suspend fun uploadPhoto(@Body body: Map<String, Any>): PhotoItem

    @POST("/api/photos/{id}/favorite")
    suspend fun toggleFavorite(@Path("id") photoId: String): Map<String, Any>

    @DELETE("/api/photos/{id}")
    suspend fun deletePhoto(@Path("id") photoId: String): Map<String, Any>

    @POST("/api/photos/{id}/restore")
    suspend fun restorePhoto(@Path("id") photoId: String): Map<String, Any>

    @GET("/api/albums")
    suspend fun getAlbums(): List<Album>

    @GET("/api/stories")
    suspend fun getStories(): List<Story>

    @GET("/api/storage/breakdown")
    suspend fun getStorageBreakdown(): Map<String, Any>

    companion object {
        // Base URL pointing to ZERO cloud API backend
        private const val BASE_URL = "https://ais-dev-yfusltdivtl2dh3dybq7dm-356056572445.asia-southeast1.run.app/"

        fun create(): ZeroApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            val client = OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(logging)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ZeroApiService::class.java)
        }
    }
}
