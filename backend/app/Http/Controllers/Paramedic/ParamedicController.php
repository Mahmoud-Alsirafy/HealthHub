<?php

namespace App\Http\Controllers\Paramedic;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ParamedicController extends Controller
{
    /**
     * البحث بالـ QR أو National ID — بدون OTP
     */
    public function searchPatient(Request $request)
    {
        $request->validate(['search' => 'required|string']);

        // ✅ بيدور بالاتنين فوراً بدون OTP
        $patient = User::where('qr_code', $request->search)
            ->orWhere('national_id', $request->search)
            ->first();

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found.',
            ], 404);
        }

        return $this->patientData($patient);
    }

    /**
     * Helper - بيانات المريض الكاملة
     */
    private function patientData(User $patient)
    {
        $patient->load([
            'profile.images',
            'doctorReports.doctor',
            'labReports.images',
            'prescriptions.doctor',
        ]);

        return response()->json([
            'success' => true,
            'patient' => [
                'id'          => $patient->id,
                'name'        => $patient->name,
                'national_id' => $patient->national_id,
                'qr_code'     => $patient->qr_code,

                'profile' => $patient->profile ? [
                    'blood_type'       => $patient->profile->blood_type,
                    'gender'           => $patient->profile->gender,
                    'birth_date'       => $patient->profile->birth_date,
                    'phone'            => $patient->profile->phone,
                    'allergies'        => $patient->profile->allergies,
                    'chronic_diseases' => $patient->profile->chronic_diseases,
                    'images'           => $patient->profile->images,
                ] : null,

                // ✅ كل التقارير مش بس الأول
                'reports' => $patient->doctorReports->map(fn($r) => [
                    'id'              => $r->id,
                    'diagnosis'       => $r->diagnosis,
                    'notes'           => $r->notes,
                    'required_tests'  => $r->required_tests,
                    'next_visit_date' => $r->next_visit_date,
                    'doctor_name'     => $r->doctor?->name,
                    'date'            => $r->created_at?->toDateString(),
                ]),

                'lab_reports' => $patient->labReports->map(fn($r) => [
                    'test_name'    => $r->test_name,
                    'status'       => $r->status,
                    'result'       => $r->result,
                    'completed_at' => $r->completed_at,
                    'images'       => $r->images,
                ]),

                'prescriptions' => $patient->prescriptions->map(fn($p) => [
                    'id'              => $p->id,
                    'medication_name' => $p->medication_name,
                    'dosage'          => $p->dosage,
                    'frequency'       => $p->frequency,
                    'duration'        => $p->duration,
                    'status'          => $p->status,
                    'doctor_name'     => $p->doctor?->name,
                    'date'            => $p->created_at?->toDateString(),
                ]),
            ],
        ]);
    }
}
