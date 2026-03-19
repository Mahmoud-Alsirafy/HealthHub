<?php

namespace App\Http\Controllers\Pharma;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PharmaController extends Controller
{
    public function searchPatient(Request $request)
    {
        $request->validate(['search' => 'required|string']);

        $pharma = auth('pharma')->user();

        // ✅ QR → فوري بدون OTP
        $patient = User::where('qr_code', $request->search)->first();

        if ($patient) {
            return $this->patientWithPrescriptions($patient);
        }

        // ✅ National ID → OTP
        $patient = User::where('national_id', $request->search)->first();

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found.',
            ], 404);
        }

        $patient->generate_code();
        $patient->notify(new \App\Notifications\DoctorAccessRequest($pharma, $patient->code));

        return response()->json([
            'success'      => true,
            'status'       => 'pending',
            'patient_id'   => $patient->id,
            'patient_name' => $patient->name,
            'message'      => 'OTP sent to patient.',
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

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP.',
            ], 422);
        }

        if ($patient->expired_at < now()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired. Please search again.',
            ], 422);
        }

        $patient->reset_code();

        return $this->patientWithPrescriptions($patient);
    }

    public function dispense(Request $request, int $prescriptionId)
    {
        $prescription = Prescription::where('id', $prescriptionId)
            ->where('status', 'pending')
            ->firstOrFail();

        $prescription->update([
            'pharmacy_id'  => auth('pharma')->id(),
            'status'       => 'dispensed',
            'dispensed_at' => Carbon::now(),
        ]);

        return response()->json([
            'success'      => true,
            'message'      => 'Medication dispensed successfully.',
            'prescription' => $prescription->fresh()->load('doctor:id,name,specialty'),
        ]);
    }

    private function patientWithPrescriptions(User $patient)
    {
        $prescriptions = Prescription::where('user_id', $patient->id)
            ->with('doctor:id,name,specialty')
            ->get()
            ->map(fn($p) => [
                'id'               => $p->id,
                'medication_name'  => $p->medication_name,
                'dosage'           => $p->dosage,
                'frequency'        => $p->frequency,
                'duration'         => $p->duration,
                'notes'            => $p->notes,
                'status'           => $p->status,
                'dispensed_at'     => $p->dispensed_at,
                'doctor_name'      => $p->doctor?->name,
                'doctor_specialty' => $p->doctor?->specialty,
                'visit_date'       => $p->created_at->toDateString(),
            ]);

        return response()->json([
            'success' => true,
            'patient' => [
                'id'          => $patient->id,
                'name'        => $patient->name,
                'national_id' => $patient->national_id,
            ],
            'prescriptions' => $prescriptions,
        ]);
    }
}
