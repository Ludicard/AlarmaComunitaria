<?php
// backend_cpanel/esp_trigger.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $zone_id = $data['zone_id'] ?? null;
    $audio = $data['audio'] ?? null;

    if ($zone_id && $audio) {
        // Limpiamos los comandos anteriores de esa zona
        $stmt = $pdo->prepare("UPDATE esp32_commands SET is_active = FALSE WHERE zone_id = ?");
        $stmt->execute([$zone_id]);

        // Insertamos el nuevo comando
        $stmt = $pdo->prepare("INSERT INTO esp32_commands (zone_id, audio_to_play, is_active) VALUES (?, ?, TRUE)");
        $stmt->execute([$zone_id, $audio]);

        echo json_encode(["success" => true]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Faltan datos"]);
    }
}
?>
