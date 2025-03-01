<?php
// Path to the uploads directory and uploads.json file
$uploadDir = 'https://printingapp.vercel.app/server/uploads/';
$uploadsFile = 'https://printingapp.vercel.app/server/uploads.json';

// Delete all files in the uploads directory
foreach (glob($uploadDir . '*') as $file) {
    unlink($file);
}

// Clear the uploads.json file
file_put_contents($uploadsFile, json_encode([]));

echo json_encode(['status' => 'success']);
?>
