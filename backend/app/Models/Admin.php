<?php

namespace App\Models;

use App\Traits\HasOtp; // ✅
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable; // ✅
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Admin extends Authenticatable implements JWTSubject
{
    use HasOtp, Notifiable; // ✅

    public $timestamps = false;
    
    protected $fillable = ['name', 'email', 'password', 'type', 'qr_code'];

    protected $hidden = ['password'];

    protected $visible = ['id', 'name', 'email', 'type'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
