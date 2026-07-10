<?php
// backend_cpanel/api_auth.php
require_once 'config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'create_community') {
        $community_name = $data['community'] ?? '';
        $user_name = $data['name'] ?? '';

        if (!$community_name || !$user_name) {
            http_response_code(400);
            echo json_encode(["error" => "Faltan datos"]);
            exit();
        }

        // Generar un codigo de invitacion aleatorio de 6 caracteres
        $invite_code = strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO zones (name, invite_code) VALUES (?, ?)");
            $stmt->execute([$community_name, $invite_code]);
            $zone_id = $pdo->lastInsertId();

            $user_id = 'usr_' . time() . '_' . rand(1000, 9999);
            $stmt = $pdo->prepare("INSERT INTO users (id, zone_id, name, role) VALUES (?, ?, ?, 'admin')");
            $stmt->execute([$user_id, $zone_id, $user_name]);

            $pdo->commit();

            echo json_encode([
                "user" => [
                    "id" => $user_id,
                    "zone_id" => $zone_id,
                    "name" => $user_name,
                    "role" => "admin",
                    "community" => $community_name,
                    "invite_code" => $invite_code
                ]
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Error al crear la comunidad"]);
        }
        exit();
    }

    if ($action === 'join_community') {
        $invite_code = $data['invite_code'] ?? '';
        $user_name = $data['name'] ?? '';

        if (!$invite_code || !$user_name) {
            http_response_code(400);
            echo json_encode(["error" => "Faltan datos"]);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id, name FROM zones WHERE invite_code = ?");
        $stmt->execute([strtoupper($invite_code)]);
        $zone = $stmt->fetch();

        if (!$zone) {
            http_response_code(404);
            echo json_encode(["error" => "Código de invitación no válido"]);
            exit();
        }

        $user_id = 'usr_' . time() . '_' . rand(1000, 9999);
        $stmt = $pdo->prepare("INSERT INTO users (id, zone_id, name, role) VALUES (?, ?, ?, 'residente')");
        $stmt->execute([$user_id, $zone['id'], $user_name]);

        echo json_encode([
            "user" => [
                "id" => $user_id,
                "zone_id" => $zone['id'],
                "name" => $user_name,
                "role" => "residente",
                "community" => $zone['name']
            ]
        ]);
        exit();
    }
}
?>
