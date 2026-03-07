<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Image\ImageController;
use App\Http\Controllers\Google\GoogleController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QR_CODE\Qr_codeController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

// -----------------------------------------------------------------------------
// Public
// -----------------------------------------------------------------------------



// Route::group(['namespace' => 'Auth'], function () {
//     Route::get('/', [HomeController::class, 'index'])->name('selection');
//     Route::get('/login/{type}', [LoginController::class, 'loginFom'])->middleware('guest')->name('login.show');
//     Route::post('/login', [LoginController::class, 'login'])->name('login');
//     Route::get('/login', function () {
//         return redirect()->route('selection');
//     })->name('login');
//     Route::post('/logout/{type}', [LoginController::class, 'logout'])->name('logout');
// });


// -----------------------------------------------------------------------------
// Dashboard routes (post-login redirect targets) — each protected by its guard
// -----------------------------------------------------------------------------

Route::get('/user', function () {
    $users = User::find(Auth::guard('web')->user()->id)->get();
    return response()->json(['users' => $users]);
})->middleware('auth:web')->name('user.dashboard');









Route::get('/lap', function () {
    return response()->json(['message' => 'Lap Dashboard']);
})->middleware('auth:lap')->name('lap.dashboard');

Route::get('/pharma', function () {
    return response()->json(['message' => 'Pharma Dashboard']);
})->middleware('auth:pharma')->name('pharma.dashboard');

Route::get('/paramedics', function () {
    return response()->json(['message' => 'Paramedics Dashboard']);
})->middleware('auth:paramedic')->name('paramedics.dashboard');

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------







Route::post('reg_form', [\App\Http\Controllers\Auth\registerController::class, 'reg_form'])->name('reg_form');
Route::post('register', [\App\Http\Controllers\Auth\registerController::class, 'register'])->name('register');

// -----------------------------------------------------------------------------
// Google Auth (Stable URLs for Frontend)
// -----------------------------------------------------------------------------
Route::get('auth/google', [GoogleController::class, 'googlepage'])->name('google.login');
Route::get('auth/google/callback', [GoogleController::class, 'googlepagecallback'])->name('google.callback');

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
            return response()->json(['message' => 'Dashboard']);
        })->middleware(['auth', 'verified', 'Otp'])->name('dashboard');






        // OTP


        // QR
        Route::resource('qrcode', Qr_codeController::class);
        Route::post('qrcode', [Qr_codeController::class, 'generate'])->name('generate');
        Route::get('/qr-login', [Qr_codeController::class, 'loginByQr'])->name('qr.login');


        // Image (extract text from image)
        Route::prefix('image')->group(function () {
            Route::resource('image', ImageController::class);
        });
    }
);



// require __DIR__ . '/auth.php';
