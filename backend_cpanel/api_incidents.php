<?php
// backend_cpanel/api_incidents.php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$zone_id = $_GET['zone_id'] ?? null;

if (!$zone_id) {
    http_response_code(400);
    echo json_encode(["error" => "zone_id requerido"]);
    exit();
}

if ($method === 'GET') {
    // Obtener incidentes
    $stmt = $pdo->prepare("SELECT * FROM incidents WHERE zone_id = ? ORDER BY created_at DESC");
    $stmt->execute([$zone_id]);
    $incidents = $stmt->fetchAll();
    
    // Para simplificar, traemos las confirmaciones de una vez
    $stmtConfirm = $pdo->prepare("SELECT incident_id, user_id, user_name, confirmed_at FROM safety_confirmations WHERE incident_id IN (SELECT id FROM incidents WHERE zone_id = ?)");
    $stmtConfirm->execute([$zone_id]);
    $confirmations = $stmtConfirm->fetchAll();

    foreach ($incidents as &$inc) {
        $inc['safetyConfirmations'] = array_filter($confirmations, function($c) use ($inc) {
            return $c['incident_id'] === $inc['id'];
        });
        $inc['safetyConfirmations'] = array_values($inc['safetyConfirmations']); // re-index
        $inc['isSOS'] = (bool)$inc['is_sos'];
    }

    echo json_encode($incidents);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = 'inc_' . time() . '_' . rand(1000, 9999);
    $type = $data['type'];
    $priority = $data['priority'] ?? 'media';
    $title = $data['title'];
    $description = $data['description'];
    $reporter_id = $data['reporterId'];
    $reporter_name = $data['reporterName'];
    $lat = $data['location']['latitude'] ?? null;
    $lng = $data['location']['longitude'] ?? null;
    $address = $data['address'] ?? null;
    $is_sos = $data['isSOS'] ?? false ? 1 : 0;

    $stmt = $pdo->prepare("INSERT INTO incidents (id, zone_id, type, priority, title, description, reporter_id, reporter_name, latitude, longitude, address, is_sos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $zone_id, $type, $priority, $title, $description, $reporter_id, $reporter_name, $lat, $lng, $address, $is_sos]);

    $data['id'] = $id;
    $data['status'] = 'activo';
    $data['safetyConfirmations'] = [];
    echo json_encode($data);
    exit();
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $incident_id = $data['incident_id'] ?? null;
    $status = $data['status'] ?? null;

    if ($incident_id && $status) {
        $stmt = $pdo->prepare("UPDATE incidents SET status = ? WHERE id = ? AND zone_id = ?");
        $stmt->execute([$status, $incident_id, $zone_id]);
        echo json_encode(["success" => true]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Datos incompletos"]);
    }
    exit();
}
?>
