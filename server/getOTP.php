<?php
$otpFile = __DIR__ . '/otp.txt';

if (!file_exists($otpFile)) {
    $otp = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
    file_put_contents($otpFile, $otp);
} else {
    $otp = trim(file_get_contents($otpFile));
}

header('Content-Type: application/json');
echo json_encode(['otp' => $otp]);
?>