<?php

use App\Http\Controllers\Image\ImageController;
use App\Http\Controllers\Google\GoogleController;
use Illuminate\Support\Facades\Route;









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
