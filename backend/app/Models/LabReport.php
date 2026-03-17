<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class LabReport extends Model
{
    protected $guarded = [];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lab()
    {
        return $this->belongsTo(Lab::class, 'lab_id');
    }
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }
    public function doctorReport()
{
    return $this->belongsTo(DoctorReport::class, 'report_id');
}
}
