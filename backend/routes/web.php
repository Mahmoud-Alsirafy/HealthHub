<?php

use App\Http\Controllers\Google\GoogleController;
use App\Http\Controllers\Image\ImageController;
use Illuminate\Support\Facades\Route;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

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



// require __DIR__ . '/auth.php';
