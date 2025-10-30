<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <title>كود QR</title>
</head>
<body>
    <p>مرحبًا {{ Auth::user()->name }},</p>
    <p>هذا هو الكود الخاص بالرقم القومي: {{ $nationality_id }}</p>
    <p>مرفق صورة QR مع الإيميل.</p>
</body>
</html>

