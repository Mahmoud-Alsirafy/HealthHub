<?php

namespace App\Models;

use App\Models\Image;
use App\Traits\HasOtp;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, HasOtp;

    protected $fillable = [
        'name', 'email', 'password', 'national_id', 'code', 'expierd_at',
        'phone', 'phone_alt', 'birth_date', 'gender',
        'nationality', 'marital_status', 'occupation',
        'governorate', 'city', 'address',
        'blood_type', 'height', 'weight',
        'chronic_diseases', 'allergies', 'current_medications',
        'previous_surgeries', 'family_history',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
    ];

    protected $hidden = [
        'password', 'remember_token', 'code', 'expierd_at',
    ];

    protected $visible = [
        'id', 'name', 'email', 'national_id',
        'phone', 'phone_alt', 'birth_date', 'gender',
        'nationality', 'marital_status', 'occupation',
        'governorate', 'city', 'address',
        'blood_type', 'height', 'weight',
        'chronic_diseases', 'allergies', 'current_medications',
        'previous_surgeries', 'family_history',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
        'medical_files',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'expierd_at'        => 'datetime',
            'birth_date'        => 'date',
        ];
    }

    public function images()
{
    return $this->morphMany(Image::class, 'imageable');
}

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
