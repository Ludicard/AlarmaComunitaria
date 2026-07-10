<?php
// backend_cpanel/esp_status.php
require_once 'config.php';

// El ESP32 mandará un GET con ?zone_id=1
$zone_id = $_GET['zone_id'] ?? null;
$action = $_GET['action'] ?? 'check';

if (!$zone_id) {
    echo "NO ZONE";
    exit();
}

if ($action === 'check') {
    // Busca si hay comandos activos
    $stmt = $pdo->prepare("SELECT id, audio_to_play FROM esp32_commands WHERE zone_id = ? AND is_active = TRUE ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$zone_id]);
    $cmd = $stmt->fetch();

    if ($cmd) {
        echo "PLAY:" . $cmd['audio_to_play'] . ":" . $cmd['id'];
    } else {
        echo "IDLE";
    }
} else if ($action === 'clear') {
    // El ESP32 dice que ya sonó, así que lo apaga
    $cmd_id = $_GET['cmd_id'] ?? null;
    if ($cmd_id) {
        $stmt = $pdo->prepare("UPDATE esp32_commands SET is_active = FALSE WHERE id = ?");
        $stmt->execute([$cmd_id]);
        echo "CLEARED";
    }
}
?>
