<?php
// backend_cpanel/api_chat.php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$incident_id = $_GET['incident_id'] ?? null;

if (!$incident_id && $method === 'GET') {
    http_response_code(400);
    echo json_encode(["error" => "incident_id requerido"]);
    exit();
}

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE incident_id = ? ORDER BY created_at ASC");
    $stmt->execute([$incident_id]);
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = 'msg_' . time() . '_' . rand(1000, 9999);
    $incident_id = $data['incidentId'];
    $user_id = $data['userId'];
    $user_name = $data['userName'];
    $text = $data['text'];

    $stmt = $pdo->prepare("INSERT INTO messages (id, incident_id, user_id, user_name, text) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id, $incident_id, $user_id, $user_name, $text]);

    $data['id'] = $id;
    echo json_encode($data);
    exit();
}
?>
