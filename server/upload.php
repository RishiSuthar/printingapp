<?php

ini_set('upload_max_filesize', '100M');
ini_set('post_max_size', '100M');
ini_set('max_execution_time', '300');
ini_set('max_input_time', '300');
ini_set('memory_limit', '256M');

// This is a basic example. In production, you should add validations and error handling.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadDir = 'uploads/';
    $basePath = '/server/' . $uploadDir; // Base path to prepend to the file path
    
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $uploadedFiles = [];
    foreach ($_FILES['photos']['tmp_name'] as $key => $tmpName) {
        $fileName = basename($_FILES['photos']['name'][$key]);
        $targetFile = $uploadDir . $fileName;
        if (move_uploaded_file($tmpName, $targetFile)) {
            // Prepend the base path to the file path
            $uploadedFiles[] = ['url' => $basePath . $fileName];
        }
    }
    
    // Read existing uploads and merge new ones
    $uploadsFile = 'uploads.json';
    $existingUploads = file_exists($uploadsFile) ? json_decode(file_get_contents($uploadsFile), true) : [];
    $allUploads = array_merge($existingUploads, $uploadedFiles);
    file_put_contents($uploadsFile, json_encode($allUploads));
    
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
}
?>
