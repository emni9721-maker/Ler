# ProGuard configuration for ZERO Vault
-keep class app.zero.vault.data.model.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
