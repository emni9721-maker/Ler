package app.zero.vault.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.zero.vault.data.model.User
import app.zero.vault.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    user: User,
    onBack: () -> Unit
) {
    var biometricEnabled by remember { mutableStateOf(true) }
    var wifiOnly by remember { mutableStateOf(true) }
    val usedGB = (user.storageUsedBytes.toDouble() / (1024 * 1024 * 1024)).toFloat()
    val limitGB = (user.storageLimitBytes.toDouble() / (1024 * 1024 * 1024)).toFloat()
    val progress = (usedGB / limitGB).coerceIn(0f, 1f)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Vault Security", color = ZeroTextPrimary) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = ZeroTextSecondary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ZeroBackground)
            )
        },
        containerColor = ZeroBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Storage Meter Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = ZeroSurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Cloud Vault Storage", color = ZeroTextPrimary, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        String.format("%.1f GB used of %.0f GB", usedGB, limitGB),
                        color = ZeroTextSecondary,
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = ZeroEmerald,
                        trackColor = ZeroSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Biometric Security Section
            Text("Access & Keystore Protection", color = ZeroTextSecondary, fontSize = 12.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = ZeroSurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Biometric Authentication", color = ZeroTextPrimary, fontSize = 14.sp)
                            Text("Fingerprint / Face Unlock", color = ZeroTextSecondary, fontSize = 11.sp)
                        }
                        Switch(
                            checked = biometricEnabled,
                            onCheckedChange = { biometricEnabled = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = ZeroEmerald)
                        )
                    }

                    HorizontalDivider(color = ZeroBorder)

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Sync Over Wi-Fi Only", color = ZeroTextPrimary, fontSize = 14.sp)
                            Text("Conserve mobile data", color = ZeroTextSecondary, fontSize = 11.sp)
                        }
                        Switch(
                            checked = wifiOnly,
                            onCheckedChange = { wifiOnly = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = ZeroEmerald)
                        )
                    }
                }
            }
        }
    }
}
