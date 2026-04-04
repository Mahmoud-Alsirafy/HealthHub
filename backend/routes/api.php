<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Doctor\DoctorController;
use App\Http\Controllers\Doctor\DoctorQrCodeController;
use App\Http\Controllers\Lab\LabController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\Paramedic\ParamedicController;
use App\Http\Controllers\Pharma\PharmaController;
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
    Route::post('/patients/verify-access',       [LabController::class, 'verifyAccess']);
    Route::post('/reports/{reportId}/complete',  [LabController::class, 'completeReport']);

    Route::get('/qr', [\App\Http\Controllers\Lab\LabQrCodeController::class, 'show']);
    Route::post('/qr/regenerate', [\App\Http\Controllers\Lab\LabQrCodeController::class, 'regenerate']);
});

// -------------------------------------------------------
// Pharma Routes (Protected)
// -------------------------------------------------------
Route::middleware('auth:pharma')->prefix('pharma')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout'])->name('api.pharma.logout');
    Route::get('/me', [LoginController::class, 'me'])->name('api.pharma.me');
    Route::get('/stats',                        [PharmaController::class, 'stats']);
    Route::post('/patients/search',             [PharmaController::class, 'searchPatient']);
    Route::post('/patients/verify',             [PharmaController::class, 'verifyAccess']);
    Route::post('/prescriptions/{id}/dispense', [PharmaController::class, 'dispense']);
    Route::post('/prescriptions/{id}/cancel',   [PharmaController::class, 'cancel']);

    Route::get('/qr', [\App\Http\Controllers\Pharma\PharmaQrCodeController::class, 'show']);
    Route::post('/qr/regenerate', [\App\Http\Controllers\Pharma\PharmaQrCodeController::class, 'regenerate']);
});

// -------------------------------------------------------
// Paramedics Routes (Protected)
// -------------------------------------------------------
Route::middleware('auth:paramedic')->prefix('paramedic')->group(function () {

    Route::post('/logout', [LoginController::class, 'logout'])->name('api.paramedic.logout');
    Route::get('/me', [LoginController::class, 'me'])->name('api.paramedic.me');

     Route::post('/patients/search', [ParamedicController::class, 'searchPatient']);

    Route::get('/qr', [\App\Http\Controllers\Paramedic\ParamedicQrCodeController::class, 'show']);
    Route::post('/qr/regenerate', [\App\Http\Controllers\Paramedic\ParamedicQrCodeController::class, 'regenerate']);
});


// -------------------------------------------------------
// Qr Routes (Public)
// -------------------------------------------------------
// Public
Route::get('/qr/login/{code}', [QrCodeController::class, 'loginWithQr']);
Route::get('/qr/doctor/login/{code}', [DoctorQrCodeController::class, 'loginWithQr']);
Route::get('/qr/admin/login/{code}', [\App\Http\Controllers\Admin\AdminQrCodeController::class, 'loginWithQr']);
Route::get('/qr/lab/login/{code}', [\App\Http\Controllers\Lab\LabQrCodeController::class, 'loginWithQr']);
Route::get('/qr/paramedic/login/{code}', [\App\Http\Controllers\Paramedic\ParamedicQrCodeController::class, 'loginWithQr']);
Route::get('/qr/pharma/login/{code}', [\App\Http\Controllers\Pharma\PharmaQrCodeController::class, 'loginWithQr']);
// -------------------------------------------------------
// Qr Routes (Protected)
// -------------------------------------------------------
// Protected
Route::middleware('auth:api')->prefix('user')->group(function () {
    Route::get('/qr', [QrCodeController::class, 'show']);
    Route::post('/qr/regenerate', [QrCodeController::class, 'regenerate']);
});

Route::middleware('auth:admin')->prefix('admin')->group(function () {

    Route::get('/qr', [\App\Http\Controllers\Admin\AdminQrCodeController::class, 'show']);
    Route::post('/qr/regenerate', [\App\Http\Controllers\Admin\AdminQrCodeController::class, 'regenerate']);

    Route::middleware('admin.type:doctor')->group(function () {
        Route::get   ('/doctors',      [AdminController::class, 'getDoctors']);
        Route::get   ('/doctors/{id}', [AdminController::class, 'showDoctor']);   // ✅
        Route::post  ('/doctors',      [AdminController::class, 'storeDoctor']);
        Route::post   ('/doctors/{id}', [AdminController::class, 'updateDoctor']);
        Route::delete('/doctors/{id}', [AdminController::class, 'deleteDoctor']);
    });

    Route::middleware('admin.type:lab')->group(function () {
        Route::get   ('/labs',      [AdminController::class, 'getLabs']);
        Route::get   ('/labs/{id}', [AdminController::class, 'showLab']);         // ✅
        Route::post  ('/labs',      [AdminController::class, 'storeLab']);
        Route::post   ('/labs/{id}', [AdminController::class, 'updateLab']);
        Route::delete('/labs/{id}', [AdminController::class, 'deleteLab']);
    });

    Route::middleware('admin.type:pharma')->group(function () {
        Route::get   ('/pharmas',      [AdminController::class, 'getPharmas']);
        Route::get   ('/pharmas/{id}', [AdminController::class, 'showPharma']);   // ✅
        Route::post  ('/pharmas',      [AdminController::class, 'storePharma']);
        Route::post   ('/pharmas/{id}', [AdminController::class, 'updatePharma']);
        Route::delete('/pharmas/{id}', [AdminController::class, 'deletePharma']);
    });

    Route::middleware('admin.type:paramedic')->group(function () {
        Route::get   ('/paramedics',      [AdminController::class, 'getParamedics']);
        Route::get   ('/paramedics/{id}', [AdminController::class, 'showParamedic']); // ✅
        Route::post  ('/paramedics',      [AdminController::class, 'storeParamedic']);
        Route::post   ('/paramedics/{id}', [AdminController::class, 'updateParamedic']);
        Route::delete('/paramedics/{id}', [AdminController::class, 'deleteParamedic']);
    });

});
