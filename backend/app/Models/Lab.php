<?php

namespace App\Models;

use App\Traits\HasOtp;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Lab extends Authenticatable implements JWTSubject
{
     use HasFactory, Notifiable, HasOtp;

    protected $fillable = ['name', 'email', 'password', 'qr_code'];

    protected $visible = ['id', 'name', 'email'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
    public function reports()
    {
        return $this->hasMany(LabReport::class, 'lab_id');
    }
}
