<?php

namespace App\Models;

use App\Models\Doctor;
use App\Models\DoctorReport;
use App\Models\Pharma;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $fillable = [
        'user_id',
        'doctor_id',
        'report_id',
        'pharmacy_id',
        'medication_name',
        'dosage',
        'frequency',
        'duration',
        'notes',
        'status',
        'dispensed_at',
    ];

    protected $casts = [
        'dispensed_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function doctorReport()
    {
        return $this->belongsTo(DoctorReport::class, 'report_id');
    }

    public function pharma()
    {
        return $this->belongsTo(Pharma::class, 'pharmacy_id');
    }
}
