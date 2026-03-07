<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientProfile extends Model
{
    protected $fillable = [
        'user_id',
        'phone', 'phone_alt', 'birth_date', 'gender',
        'nationality', 'marital_status', 'occupation',
        'governorate', 'city', 'address',
        'blood_type', 'height', 'weight',
        'chronic_diseases', 'allergies', 'current_medications',
        'previous_surgeries', 'family_history',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ✅ الملفات الطبية
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }
}
