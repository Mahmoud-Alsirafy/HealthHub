<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    public const USER = '/user';
    public const DOCTOR = '/doctor/dashboard';
    public const LAB = '/lab';
    public const PHARAMAS = '/pharma';
    public const PARAMEDICS = '/paramedics';
    public const ADMINS = '/admins';

}
