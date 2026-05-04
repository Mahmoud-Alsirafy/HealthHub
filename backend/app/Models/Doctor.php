<?php

namespace App\Models;

use App\Models\DoctorReport;
use App\Traits\HasOtp;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Doctor extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, HasOtp;

    protected $fillable = [
        'name',
        'email',
        'password',
        'code',
        'expired_at',
        'qr_code',
        'phone',
        'national_id',
        'birth_date',
        'gender',
        'specialty',
        'facility',
        'department',
        'license_number',
        'experience_years',
        'admin_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'code',
        'expired_at',
    ];

    protected $visible = [
        'id',
        'name',
        'email',
        'phone',
        'national_id',
        'birth_date',
        'gender',
        'qr_code',
        'specialty',
        'facility',
        'department',
        'license_number',
        'experience_years',
    ];

    protected function casts(): array
    {
        return [
            'password'   => 'hashed',
            'expired_at' => 'datetime',
            'birth_date' => 'date',
        ];
    }

    // -------------------------------------------------------
    // Relations
    // -------------------------------------------------------

    // التقارير اللي كتبها الدكتور
    public function reports()
    {
        return $this->hasMany(DoctorReport::class);
    }

    // -------------------------------------------------------
    // JWT
    // -------------------------------------------------------
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
