<?php
header('Content-Type: application/json');

$otpFile = __DIR__ . '/otp.txt';
$currentOtp = file_exists($otpFile) ? trim(file_get_contents($otpFile)) : '';

$data = json_decode(file_get_contents('php://input'), true);
$submittedOtp = isset($data['otp']) ? trim($data['otp']) : '';

echo json_encode(['valid' => ($submittedOtp === $currentOtp)]);
?>