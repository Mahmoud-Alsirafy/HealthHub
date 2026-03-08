<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\DoctorReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorController extends Controller
{
    // -------------------------------------------------------
    // GET /api/doctor/me
    // بيانات الدكتور + إحصائيات اليوم
    // -------------------------------------------------------
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
    // -------------------------------------------------------
    // GET /api/doctor/patients
    // عرض مرضى الدكتور
    // -------------------------------------------------------
    public function myPatients()
    {
        $doctor = Auth::guard('doctor')->user();

        $patients = User::whereHas('doctorReports', function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id);
            })
            ->with(['profile', 'doctorReports' => function ($query) use ($doctor) {
                $query->where('doctor_id', $doctor->id)->latest();
            }])
            ->get()
            ->map(function ($user) {
                $lastReport = $user->doctorReports->first();
                return [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'national_id' => $user->national_id,
                    'blood_type'  => $user->profile?->blood_type,
                    'condition'   => $lastReport?->diagnosis,
                    'last_visit'  => $lastReport?->created_at?->toDateString(),
                ];
            });

        return response()->json([
            'patients' => $patients,
        ]);

    }
    // -------------------------------------------------------
    // GET /api/doctor/patients/search?national_id=xxx
    // بحث عن مريض بالرقم القومي
    // -------------------------------------------------------
    public function searchPatient(Request $request)
    {
        $request->validate([
            'national_id' => 'required|string',
        ]);

        $patient = User::where('national_id', $request->national_id)
            ->with(['profile.images', 'doctorReports.doctor'])
            ->first();

        if (!$patient) {
            return response()->json(['error' => 'المريض غير موجود'], 404);
        }

        return response()->json(['patient' => $this->formatPatient($patient)]);
    }

    // -------------------------------------------------------
    // GET /api/doctor/patients/qr/{code}
    // بحث عن مريض بالـ QR Code
    // -------------------------------------------------------
    public function searchByQr(string $code)
    {
        $patient = User::where('qr_code', $code)
            ->with(['profile.images', 'doctorReports.doctor'])
            ->first();

        if (!$patient) {
            return response()->json(['error' => 'QR Code غير صالح'], 404);
        }

        return response()->json(['patient' => $this->formatPatient($patient)]);
    }

    // -------------------------------------------------------
    // POST /api/doctor/reports
    // إضافة تقرير طبي
    // -------------------------------------------------------
    public function storeReport(Request $request)
    {
        $request->validate([
            'patient_id'      => 'required|exists:users,id',
            'diagnosis'       => 'required|string',
            'notes'           => 'nullable|string',
            'required_tests'  => 'nullable|string',
            'next_visit_date' => 'nullable|date',
        ]);

        $doctor = Auth::guard('doctor')->user();

        $report = DoctorReport::create([
            'doctor_id'       => $doctor->id,
            'user_id'         => $request->patient_id,
            'diagnosis'       => $request->diagnosis,
            'notes'           => $request->notes,
            'required_tests'  => $request->required_tests,
            'next_visit_date' => $request->next_visit_date,
        ]);

        return response()->json([
            'message' => 'تم حفظ التقرير بنجاح',
            'report'  => $report->load('patient'),
        ], 201);
    }

    // -------------------------------------------------------
    // Helper - تنسيق بيانات المريض
    // -------------------------------------------------------
    private function formatPatient(User $patient): array
    {
        return [
            'id'          => $patient->id,
            'name'        => $patient->name,
            'national_id' => $patient->national_id,
            'profile'     => $patient->profile,
            'reports'     => $patient->doctorReports->map(fn($r) => [
                'id'              => $r->id,
                'diagnosis'       => $r->diagnosis,
                'notes'           => $r->notes,
                'required_tests'  => $r->required_tests,
                'next_visit_date' => $r->next_visit_date,
                'doctor_name'     => $r->doctor?->name,
                'date'            => $r->created_at->toDateString(),
            ]),
        ];
    }
}
