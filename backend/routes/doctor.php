<?php


use App\Http\Controllers\Find\FindUserController;
use App\Models\Doctor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;



//==============================Translate all pages============================
Route::group(
    [
        'prefix' => LaravelLocalization::setLocale(),
        'middleware' => ['localeSessionRedirect', 'localizationRedirect', 'localeViewPath', 'auth:doctor']
    ],
    function () {

        //==============================dashboard============================
        Route::get('/doctor/dashboard', function () {
            $doctors = Doctor::find(Auth::guard('doctor')->user()->id)->get();
            return view('pages.doctor.index', compact('doctors'));
        });

        Route::group(['prefix' => 'Doctor/dashboard'], function () {
        Route::post('find', [FindUserController::class,'find'])->name('find');
        Route::resource('doctor',FindUserController::class);

        });
    }
);
