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
    // GET /api/doctor/patients/{id}
    // عرض بيانات مريض محدد (للدكتور اللي اتعامل معاه)
    // -------------------------------------------------------
    public function showPatient($id)
    {
        $doctor = Auth::guard('doctor')->user();

        // ✅ هنا ممكن نسمح للدكتور يشوف أي مريض أو مريضه هو بس
        // يفضل نسمح لو المريض ده Searchable أو فيه تعامل مسبق
        $patient = User::with(['profile.images', 'doctorReports.doctor'])->find($id);

        if (!$patient) {
            return response()->json(['error' => 'المريض غير موجود'], 404);
        }

        return response()->json(['patient' => $this->formatPatient($patient)]);
    }

    // -------------------------------------------------------
    // GET /api/doctor/patients/search?national_id=xxx
    // بحث عن مريض بالرقم القومي
    // -------------------------------------------------------
    // ✅ الطريقة الصح
    public function searchPatient(Request $request)
    {
        $request->validate(['national_id' => 'required|string']);

        $doctor = Auth::guard('doctor')->user();

        $patient = User::where('national_id', $request->national_id)->first();

        if (!$patient) {
            return response()->json(['error' => 'المريض غير موجود'], 404);
        }

        // ✅ ولد OTP وابعته للمريض
        $patient->generate_code();
        $patient->notify(new \App\Notifications\DoctorAccessRequest($doctor, $patient->code));

        return response()->json([
            'status'     => 'pending',
            'patient_id' => $patient->id,
            'patient_name' => $patient->name,
            'message'    => 'OTP sent to patient. Ask them for the code.',
        ]);
    }

    public function verifyAccess(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:users,id',
            'otp'        => 'required|string|size:6',
        ]);

        $patient = User::where('id', $request->patient_id)
            ->where('code', $request->otp)
            ->first();

        // ✅ تحقق من الـ OTP والـ expiry
        if (!$patient) {
            return response()->json(['error' => 'Invalid OTP code'], 422);
        }

        if ($patient->expired_at < now()) {
            return response()->json(['error' => 'OTP expired. Please search again.'], 422);
        }

        // ✅ امسح الـ OTP بعد الاستخدام
        $patient->reset_code();

        // ✅ رجّع البيانات الكاملة
        $patient->load(['profile.images', 'doctorReports.doctor']);
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
            'required_tests'  => 'nullable',
            'next_visit_date' => 'nullable|date',
        ]);

        $doctor = Auth::guard('doctor')->user();

        // ✅ بنحول لـ array في كل الحالات
        $tests = [];
        if ($request->filled('required_tests')) {
            $raw = $request->required_tests;

            if (is_array($raw)) {
                // ✅ جاي كـ array عادي
                $tests = $raw;
            } elseif (str_starts_with(trim($raw), '[')) {
                // ✅ جاي كـ JSON string زي '["CBC","X-Ray"]'
                $tests = json_decode($raw, true) ?? [];
            } else {
                // ✅ جاي كـ string عادي زي 'CBC, X-Ray'
                $tests = array_filter(array_map('trim', explode(',', $raw)));
            }
        }

        $report = DoctorReport::create([
            'doctor_id'       => $doctor->id,
            'user_id'         => $request->patient_id,
            'diagnosis'       => $request->diagnosis,
            'notes'           => $request->notes,
            'required_tests'  => !empty($tests) ? implode(', ', $tests) : null,
            'next_visit_date' => $request->next_visit_date,
        ]);

        foreach ($tests as $test) {
            if (!empty($test)) {
                \App\Models\LabReport::create([
                    'user_id'   => $request->patient_id,
                    'lab_id'    => null,
                    'report_id' => $report->id,
                    'test_name' => $test,
                    'status'    => 'pending',
                ]);
            }
        }

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
