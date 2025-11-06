<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Google\GoogleController;
use App\Http\Controllers\QR_CODE\Qr_codeController;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;



Route::group(
    [
        'prefix' => LaravelLocalization::setLocale(),
        'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath',]
    ],
    function () {


        Route::get('/', function () {
            return view('welcome');
        });

        Route::get('/dashboard', function () {
            return view('dashboard');
        })->middleware(['auth', 'verified','Otp'])->name('dashboard');

        Route::middleware('auth')->group(function () {
            Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
            Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
            Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
        });

        // ============================OTP=====================

        Route::resource('OTP', OtpController::class);
        Route::get('/resend', [OtpController::class, 'resend'])->name('OTP.resend');

        // ============================QR=====================

        Route::resource('qrcode', Qr_codeController::class);
        Route::post('qrcode', [Qr_codeController::class, 'generate'])->name("generate");

        // ✅ مسار الدخول من خلال QR
        Route::get('/qr-login', [Qr_codeController::class, 'loginByQr'])->name('qr.login');


        // ?  ==========================GOOGLE AUTH=================

        Route::get('auth/google',[GoogleController::class,'googlepage']);
        Route::get('auth/google/callback',[GoogleController::class,'googlepagecallback']);
        Route::get('auth/google/check',[GoogleController::class,'googlepagecheck']);
    }

);





require __DIR__ . '/auth.php';
