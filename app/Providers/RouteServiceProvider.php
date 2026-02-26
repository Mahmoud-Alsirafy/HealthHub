<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    public const USER = '/user';
    public const DOCTOR = '/doctor';
    public const LAP = '/lap';
    public const PHARAMAS = '/pharma';
    public const PARAMEDICS = '/paramedics';

}
