<?php

namespace App\Models;


use App\Traits\HasOtp;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Paramedic extends Authenticatable
{
    use HasOtp;

    protected $fillable = ['name','email', 'password'];
}
