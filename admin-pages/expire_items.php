<?php
require_once dirname(__DIR__) . '/config/db.php';

// Only the command line (cron / Task Scheduler) or a logged-in admin may run this
if (PHP_SAPI !== 'cli') {
    session_start();
    if (empty($_SESSION['admin_id'])) {
        http_response_code(403);
        exit('Unauthorized');
    }
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    error_log("expire_items: DB connection failed: " . $conn->connect_error);
    exit("Connection failed.");
}

// Run BOTH updates (before, the found_items query overwrote the lost_items one,
// so lost items never expired)
$tables = ['lost_items', 'found_items'];
$ok = true;

foreach ($tables as $table) {
    $sql = "
        UPDATE $table
        SET status = 'Expired'
        WHERE expiration_date IS NOT NULL
          AND expiration_date < CURDATE()
          AND status IN ('Approved', 'Ready for Claim')
    ";

    if ($conn->query($sql)) {
        echo "$table: {$conn->affected_rows} item(s) expired.\n";
    } else {
        $ok = false;
        error_log("expire_items: failed on $table: " . $conn->error);
        echo "$table: update failed.\n";
    }
}

echo $ok ? "Expired items updated successfully.\n" : "Some updates failed. Check the error log.\n";

$conn->close();
?>
