<?php
// Allow only POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

// Set proper headers
header('Content-Type: application/json');

$uploadDir = __DIR__ . '/uploads/';  
$uploadsFile = __DIR__ . '/uploads.json';  

// Check if directory exists before deleting files
if (is_dir($uploadDir)) {
    foreach (glob($uploadDir . '*') as $file) {
        unlink($file);
    }
}

// Clear the uploads.json file
file_put_contents($uploadsFile, json_encode([]));

// Send a JSON response
echo json_encode(["status" => "success"]);
exit;
?>
