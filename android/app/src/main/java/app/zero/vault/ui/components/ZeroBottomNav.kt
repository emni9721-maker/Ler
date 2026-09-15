package app.zero.vault.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import app.zero.vault.ui.theme.*

enum class NavTab(val title: String, val selectedIcon: ImageVector, val unselectedIcon: ImageVector) {
    FEED("Feed", Icons.Filled.Home, Icons.Outlined.Home),
    VAULT("Vault", Icons.Filled.PhotoLibrary, Icons.Outlined.PhotoLibrary),
    REELS("Reels", Icons.Filled.Movie, Icons.Outlined.Movie),
    PROFILE("Profile", Icons.Filled.Person, Icons.Outlined.Person)
}

@Composable
fun ZeroBottomNav(
    currentTab: NavTab,
    onSelectTab: (NavTab) -> Unit
) {
    NavigationBar(
        containerColor = ZeroSurface,
        contentColor = ZeroTextPrimary
    ) {
        NavTab.values().forEach { tab ->
            val isSelected = currentTab == tab
            NavigationBarItem(
                selected = isSelected,
                onClick = { onSelectTab(tab) },
                icon = {
                    Icon(
                        imageVector = if (isSelected) tab.selectedIcon else tab.unselectedIcon,
                        contentDescription = tab.title,
                        tint = if (isSelected) ZeroEmerald else ZeroTextSecondary
                    )
                },
                label = {
                    Text(
                        text = tab.title,
                        color = if (isSelected) ZeroEmerald else ZeroTextSecondary
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = ZeroSurfaceVariant
                )
            )
        }
    }
}
