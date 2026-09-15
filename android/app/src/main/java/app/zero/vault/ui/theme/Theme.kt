package app.zero.vault.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = ZeroEmerald,
    onPrimary = Color.Black,
    secondary = ZeroCyan,
    onSecondary = Color.Black,
    tertiary = ZeroEmeraldLight,
    background = ZeroBackground,
    onBackground = ZeroTextPrimary,
    surface = ZeroSurface,
    onSurface = ZeroTextPrimary,
    surfaceVariant = ZeroSurfaceVariant,
    onSurfaceVariant = ZeroTextSecondary,
    outline = ZeroBorder
)

@Composable
fun ZeroTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
