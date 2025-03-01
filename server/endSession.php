<?php
// Use a LOCAL path instead of a URL
$uploadDir = __DIR__ . '/uploads/';  // Local directory
$uploadsFile = __DIR__ . '/uploads.json';  // Local JSON file

// Check if directory exists before deleting files
if (is_dir($uploadDir)) {
    foreach (glob($uploadDir . '*') as $file) {
        unlink($file);
    }
}

// Clear the uploads.json file
file_put_contents($uploadsFile, json_encode([]));

header('Content-Type: application/json');  // Ensure JSON response
echo json_encode(['status' => 'success']);
?>
