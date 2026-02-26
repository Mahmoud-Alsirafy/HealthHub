<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Image\ImageController;
use App\Http\Controllers\Auth\registerController;
use App\Http\Controllers\Google\GoogleController;
use App\Http\Controllers\QR_CODE\Qr_codeController;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

// -----------------------------------------------------------------------------
// Public
// -----------------------------------------------------------------------------



Route::group(['namespace' => 'Auth'], function () {
    Route::get('/', [HomeController::class, 'index'])->name('selection');
    Route::get('/login/{type}', [LoginController::class, 'loginFom'])->middleware('guest')->name('login.show');
    Route::post('/login', [LoginController::class, 'login'])->name('login');
    Route::get('/login', function () {
        return redirect()->route('selection');
    })->name('login');
    Route::post('/logout/{type}', [LoginController::class, 'logout'])->name('logout');
});


// -----------------------------------------------------------------------------
// Dashboard routes (post-login redirect targets) — each protected by its guard
// -----------------------------------------------------------------------------

Route::get('/user', function () {
    return view('dashboard');
})->middleware('auth:web')->name('user.dashboard');

Route::get('/doctor', function () {
    return view('dashboard');
})->middleware('auth:doctor')->name('doctor.dashboard');

Route::get('/lap', function () {
    return view('dashboard');
})->middleware('auth:lap')->name('lap.dashboard');

Route::get('/pharma', function () {
    return view('dashboard');
})->middleware('auth:pharma')->name('pharma.dashboard');

Route::get('/paramedics', function () {
    return view('dashboard');
})->middleware('auth:paramedic')->name('paramedics.dashboard');

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------







Route::post('reg_form', [registerController::class, 'reg_form'])->name('reg_form');
Route::post('register', [registerController::class, 'register'])->name('register');

// -----------------------------------------------------------------------------
// Commented / Localization (for reference)
// -----------------------------------------------------------------------------
//



Route::group(
    [
        'prefix' => LaravelLocalization::setLocale(),
        'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath']
    ],
    function () {

        Route::get('/dashboard', function () {
            return view('dashboard');
        })->middleware(['auth', 'verified', 'Otp'])->name('dashboard');

        Route::middleware('auth')->group(function () {
            Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
            Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
            Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
        });


        

        // OTP
        

        // QR
        Route::resource('qrcode', Qr_codeController::class);
        Route::post('qrcode', [Qr_codeController::class, 'generate'])->name('generate');
        Route::get('/qr-login', [Qr_codeController::class, 'loginByQr'])->name('qr.login');

        // Google Auth
        Route::get('auth/google', [GoogleController::class, 'googlepage']);
        Route::get('auth/google/callback', [GoogleController::class, 'googlepagecallback']);
        Route::get('auth/google/check', [GoogleController::class, 'googlepagecheck']);

        // Image (extract text from image)
        Route::prefix('image')->group(function () {
            Route::resource('image', ImageController::class);
        });
    }
);

Route::get('/otp/{type}/{id}', [OtpController::class, 'index'])
    ->name('otp.index');

Route::post('/otp/verify', [OtpController::class, 'store'])
    ->name('otp.store');

Route::get('/otp/resend/{type}/{id}', [OtpController::class, 'resend'])
    ->name('otp.resend');

// require __DIR__ . '/auth.php';
