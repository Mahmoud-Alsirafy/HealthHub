<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Doctor\DoctorController;
use App\Http\Controllers\Doctor\DoctorQrCodeController;
use App\Http\Controllers\Lab\LabController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\User\MedicalImageAnalysisController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\QrCodeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/



// -------------------------------------------------------
// Auth Routes (Public - No Token Required)
// -------------------------------------------------------
Route::prefix('auth')->group(function () {


    // Login
    Route::post('/login', [LoginController::class, 'login'])->name('api.login');

    // Register (users only)
    Route::post('/register', [\App\Http\Controllers\Auth\registerController::class, 'register'])->name('api.register');
});


Route::get('/otp/{type}/{id}', [OtpController::class, 'index'])
    ->name('otp.index');

Route::post('/otp/verify', [OtpController::class, 'store'])
    ->name('otp.store');

Route::get('/otp/resend/{type}/{id}', [OtpController::class, 'resend'])
    ->name('otp.resend');

// -------------------------------------------------------
// Users Routes (Protected)
// -------------------------------------------------------
Route::middleware('auth:api')->prefix('user')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout'])->name('api.user.logout');
    Route::get('/me', [LoginController::class, 'me'])->name('api.user.me');

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);
    Route::post('/patient-profile', [ProfileController::class, 'updateProfile']);
    Route::get('/appointments', [ProfileController::class, 'appointments']);
    Route::get('/files', [ProfileController::class, 'getFiles']);
    Route::post('/files', [ProfileController::class, 'storeMedicalFile']);
    Route::delete('/files/{id}', [ProfileController::class, 'destroyFile']);

     Route::post('/medical-image/analyze', [MedicalImageAnalysisController::class, 'analyze']);
});

// -------------------------------------------------------
// Doctors Routes (Protected)
// -------------------------------------------------------
Route::middleware('auth:doctor')->prefix('doctor')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout'])->name('api.doctor.logout');
    Route::get('/me', [DoctorController::class, 'me'])->name('api.doctor.me');
    Route::get('/patients', [DoctorController::class, 'myPatients']);
    Route::get('/patients/{id}', [DoctorController::class, 'showPatient']);

    Route::post('/patients/search', [DoctorController::class, 'searchPatient']);
    Route::post('/patients/verify-access', [DoctorController::class, 'verifyAccess']); // ✅ جديد
    Route::get('/patients/qr/{code}', [DoctorController::class, 'searchByQr']);
    Route::post('/reports', [DoctorController::class, 'storeReport']);
    Route::get('/qr', [DoctorQrCodeController::class, 'show']);
    Route::post('/qr/regenerate', [DoctorQrCodeController::class, 'regenerate']);
});

// -------------------------------------------------------
// Labs Routes (Protected)
// -------------------------------------------------------
Route::middleware('auth:lab')->prefix('lab')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout'])->name('api.lab.logout');
    Route::get('/me', [LoginController::class, 'me'])->name('api.lab.me');
    Route::post('/patients/search',              [LabController::class, 'searchPatient']);
    Route::post('/reports/{reportId}/complete',  [LabController::class, 'completeReport']);
});

// -------------------------------------------------------
// Pharma Routes (Protected)
// -------------------------------------------------------
Route::middleware('auth:pharma')->prefix('pharma')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout'])->name('api.pharma.logout');
    Route::get('/me', [LoginController::class, 'me'])->name('api.pharma.me');
});

// -------------------------------------------------------
// Paramedics Routes (Protected)
// -------------------------------------------------------
Route::middleware('auth:paramedic')->prefix('paramedic')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout'])->name('api.paramedic.logout');
    Route::get('/me', [LoginController::class, 'me'])->name('api.paramedic.me');
});


// -------------------------------------------------------
// Qr Routes (Public)
// -------------------------------------------------------
// Public
Route::get('/qr/login/{code}', [QrCodeController::class, 'loginWithQr']);
Route::get('/qr/doctor/login/{code}', [DoctorQrCodeController::class, 'loginWithQr']);
// -------------------------------------------------------
// Qr Routes (Protected)
// -------------------------------------------------------
// Protected
Route::middleware('auth:api')->prefix('user')->group(function () {
    Route::get('/qr', [QrCodeController::class, 'show']);
    Route::post('/qr/regenerate', [QrCodeController::class, 'regenerate']);
});
