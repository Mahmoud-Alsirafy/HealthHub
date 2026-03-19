<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorReport extends Model
{
    protected $fillable = [
        'doctor_id',
        'user_id',
        'diagnosis',
        'notes',
        'required_tests',
        'next_visit_date',
    ];

    protected function casts(): array
    {
        return [
            'next_visit_date' => 'date',
        ];
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function labReports()
    {
        return $this->hasMany(LabReport::class, 'report_id');
    }
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'report_id');
    }
}
