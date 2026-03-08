<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\DoctorReport;
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorController extends Controller
{
    public function me()
    {
        $doctor = Auth::guard('doctor')->user();

        // عدد التقارير اللي كتبها النهارده
        $todayReports = DoctorReport::where('doctor_id', $doctor->id)
            ->whereDate('created_at', today())
            ->count();

        // إجمالي المرضى اللي اتعاملوا معاه
        $totalPatients = DoctorReport::where('doctor_id', $doctor->id)
            ->distinct('user_id')
            ->count('user_id');

        return response()->json([
            'doctor' => [
                'id'               => $doctor->id,
                'name'             => $doctor->name,
                'email'            => $doctor->email,
                'specialty'        => $doctor->specialty,
                'facility'         => $doctor->facility,
                'department'       => $doctor->department,
                'phone'            => $doctor->phone,
                'experience_years' => $doctor->experience_years,
                'license_number'   => $doctor->license_number,
            ],
            'stats' => [
                'today_reports'  => $todayReports,
                'total_patients' => $totalPatients,
            ],
        ]);
    }

}
