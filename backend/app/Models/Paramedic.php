<?php

namespace App\Models;


use App\Traits\HasOtp;
use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
class Paramedic extends Authenticatable implements JWTSubject
{
    use HasOtp;

    protected $fillable = ['name','email', 'password'];
    protected $visible = [
    'id',
    'name',
    'email',
];
     public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
