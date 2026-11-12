<?php
require_once dirname(__DIR__) . '/config/db.php';
session_start();
header('Content-Type: application/json');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed'
    ]);
    exit;
}

require_once dirname(__DIR__) . '/config/audit.php';

$data = json_decode(file_get_contents('php://input'), true);

$item_id       = intval($data['item_id'] ?? 0);
$description   = trim($data['description'] ?? '');
$item_type     = strtolower(trim($data['item_type'] ?? ''));
$student_db_id = $_SESSION['student_db_id'] ?? null;

if (!$student_db_id) {
    echo json_encode([
        'success' => false,
        'error' => 'Not logged in'
    ]);
    exit;
}

if (!$item_id) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid item'
    ]);
    exit;
}

if (!in_array($item_type, ['found', 'lost'], true)) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid item type'
    ]);
    exit;
}

if ($description === '') {
    echo json_encode([
        'success' => false,
        'error' => 'Claim description is required'
    ]);
    exit;
}

// --- Server-side checks (the "Your Item" button in browse-items.php is only a UI hint
//     and can be bypassed with DevTools or a direct request) ---

// 1. The item must exist
if ($item_type === 'found') {
    $itemStmt = $conn->prepare("
        SELECT staff_employee_id AS owner_id, status, expiration_date
        FROM found_items
        WHERE id = ?
    ");
} else {
    $itemStmt = $conn->prepare("
        SELECT user_id AS owner_id, status, expiration_date
        FROM lost_items
        WHERE id = ?
    ");
}
$itemStmt->bind_param("i", $item_id);
$itemStmt->execute();
$item = $itemStmt->get_result()->fetch_assoc();
$itemStmt->close();

if (!$item) {
    echo json_encode([
        'success' => false,
        'error' => 'Item not found'
    ]);
    exit;
}

// 2. Students cannot claim an item they reported themselves
//    (same owner rule used by browse-items.php)
$sessionStudentID = $_SESSION['student_id'] ?? '';
if ($sessionStudentID !== '' && (string)$item['owner_id'] === (string)$sessionStudentID) {
    echo json_encode([
        'success' => false,
        'error' => 'You cannot claim your own item'
    ]);
    exit;
}

// 3. The item must still be claimable (not Claimed, Expired, Rejected or Pending)
if (!in_array($item['status'], ['Approved', 'Ready for Claim'], true)) {
    echo json_encode([
        'success' => false,
        'error' => 'This item can no longer be claimed (status: ' . $item['status'] . ')'
    ]);
    exit;
}

if (!empty($item['expiration_date']) && $item['expiration_date'] < date('Y-m-d')) {
    echo json_encode([
        'success' => false,
        'error' => 'This item has already expired'
    ]);
    exit;
}

$check = $conn->prepare("
    SELECT id
    FROM claims_table
    WHERE item_id = ?
      AND student_db_id = ?
      AND item_type = ?
");

if (!$check) {
    echo json_encode([
        'success' => false,
        'error' => $conn->error
    ]);
    exit;
}

$check->bind_param(
    "iis",
    $item_id,
    $student_db_id,
    $item_type
);

$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'error' => 'You already claimed this item'
    ]);

    $check->close();
    $conn->close();
    exit;
}

$check->close();

$stmt = $conn->prepare("
    INSERT INTO claims_table
    (
        item_id,
        item_type,
        student_db_id,
        claim_description,
        status,
        claimed_at
    )
    VALUES (?, ?, ?, ?, 'pending', NOW())
");

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => $conn->error
    ]);
    exit;
}

$stmt->bind_param(
    "isis",
    $item_id,
    $item_type,
    $student_db_id,
    $description
);

if ($stmt->execute()) {

    logAudit($conn, 'CLAIM_SUBMITTED', $item_type, $item_id, 'claim_id=' . $stmt->insert_id);

    echo json_encode([
        'success' => true,
        'message' => 'Claim submitted successfully',
        'item_id' => $item_id,
        'item_type' => $item_type
    ]);

} else {

    echo json_encode([
        'success' => false,
        'error' => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>