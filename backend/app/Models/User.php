<?php

namespace App\Models;

use App\Models\DoctorReport;
use App\Models\LabReport;
use App\Traits\HasOtp;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, HasOtp;

    protected $fillable = [
        'name',
        'email',
        'password',
        'national_id',
        'code',
        'qr_code',
        'expired_at',
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
        'national_id',
        'profile',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'expired_at'        => 'datetime',
        ];
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------
    public function profile()
    {
        return $this->hasOne(PatientProfile::class);
    }


    public function doctorReports()
    {
        return $this->hasMany(DoctorReport::class);
    }

    public function labReports()
    {
        return $this->hasMany(LabReport::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
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

    protected static function booted(): void
    {
        static::deleting(function (User $user) {
            if ($user->profile) {
                // حذف الصور من الـ storage
                foreach ($user->profile->images as $image) {
                    \Illuminate\Support\Facades\Storage::disk('upload_attachments')
                        ->delete('attachments/PatientProfile/' . $user->profile->id . '/' . $image->filename);
                    $image->delete();
                }
                $user->profile->delete();
            }
        });
    }
}
