<?php

namespace App\Http\Controllers\QR_CODE;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class Qr_codeController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'QR Code Generate Page']);
    }

    public function generate()
    {
        $user = Auth::user();
        $name = $user->name;
        $email = $user->email;
        $national_id = $user->national_id;



        // 🔐 1) نولّد "بيانات الدخول" اللي هنشفّرها (الإيميل + الباسورد)
        $payload = json_encode([
            'email' => $user->email,
            'password' => $user->password, // مش ال raw password, ده الهاش اللي متخزن
            'generated_at' => now()->toDateTimeString(),
        ]);

        // 🔒 2) نعمل تشفير للبيانات دي باستخدام مفتاح Laravel
        $encryptedData = Crypt::encryptString($payload);

        // 🌐 3) نولّد لينك مخصص فيه الداتا المشفّرة
        $link = url("qr-login?data=" . urlencode($encryptedData));

        // 🎨 4) نولّد QR عالي الجودة باللينك المشفر
        $qrImage = QrCode::format('png')
            ->merge(public_path('assets/images/logo.png'), 0.2, true)
            ->size(800)
            ->errorCorrection('H')
            ->margin(2)
            ->generate($link);

        // 📂 5) فولدر العميل
        $folderPath = storage_path("app/QR/Clint/$national_id");
        if (!file_exists($folderPath)) {
            mkdir($folderPath, 0755, true);
        }

        $fileName = 'qr_code.png';
        $filePath = "$folderPath/$fileName";

        file_put_contents($filePath, $qrImage);

        // 📧 6) إرسال الإيميل بالمرفق
        Mail::to($email)->send(new \App\Mail\SendQrMail(
            "QR/Clint/$national_id/$fileName",
            $national_id,
            $name
        ));

        return response()->json([
            'message' => trans('qr.success_create'),
            'file_path' => "$folderPath/$fileName"
        ]);
    }

    public function loginByQr(Request $request)
    {
        try {
            // 📥 1) ناخد الداتا المشفرة من الرابط
            $encryptedData = $request->query('data');

            // 🔓 2) نفك التشفير
            $decryptedData = Crypt::decryptString($encryptedData);

            // 🧩 3) نفك JSON ونحوّله لمصفوفة
            $payload = json_decode($decryptedData, true);

            // 📧 4) نجيب المستخدم عن طريق الإيميل
            $user = User::where('email', $payload['email'])->first();

            if (!$user) {
                return response()->json(['error' => trans('qr.!User')], 404);
            }

            // ✅ تسجيل الدخول مباشرة بدون كلمة مرور
            Auth::login($user);

            return response()->json([
                'message' => trans('qr.success_read'), 
                'redirect' => route('dashboard')
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => trans('qr.error'), 'details' => $e->getMessage()], 400);
        }
    }


}
