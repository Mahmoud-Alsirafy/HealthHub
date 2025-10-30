<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>بيانات المريض</title>
</head>
<body>

    <p>مرحبًا {{ $user }} 👋</p>
    <p>تم توليد كود QR خاص بك.</p>

    @if(!empty($encryptedData))
        <p><strong>البيانات المشفرة:</strong> {{ $encryptedData }}</p>
    @endif






</body>
</html>
