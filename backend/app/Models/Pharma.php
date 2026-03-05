<?php

namespace App\Models;

use App\Traits\HasOtp;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Pharma extends Authenticatable
{
    use HasOtp;

    protected $fillable = ['name','email','password'];
}
