<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\LabReport;
use App\Models\User;
use App\Traits\AttachFiles;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LabController extends Controller
{
    use AttachFiles;
    /**
     * البحث عن المريض بالـ National ID أو الـ QR Code
     */
    public function searchPatient(Request $request)
    {
        $request->validate([
            'search' => 'required|string',
        ]);

        $lab = auth('lab')->user();

        // ✅ نحدد هل هو QR أو National ID
        $patient = User::where('qr_code', $request->search)->first();

        // لو لقيناه بالـ QR → رجّع البيانات فوراً
        if ($patient) {
            return response()->json([
                'success'         => true,
                'patient'         => [
                    'id'          => $patient->id,
                    'name'        => $patient->name,
                    'national_id' => $patient->national_id,
                ],
                'pending_reports' => LabReport::where('user_id', $patient->id)
                    ->where('status', 'pending')
                    ->get(['id', 'test_name', 'notes', 'created_at']),
            ]);
        }

        // لو مش QR → دور بالـ National ID
        $patient = User::where('national_id', $request->search)->first();

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found.',
            ], 404);
        }

        // ✅ بعت OTP زي الدكتور بالظبط
        $patient->generate_code();
        $patient->notify(new \App\Notifications\DoctorAccessRequest($lab, $patient->code));

        return response()->json([
            'success'      => true,
            'status'       => 'pending',
            'patient_id'   => $patient->id,
            'patient_name' => $patient->name,
            'message'      => 'OTP sent to patient. Ask them for the code.',
        ]);
    }

    /**
     * تم التحليل — تحديث الـ status وحفظ النتيجة
     */
    public function completeReport(Request $request, int $reportId)
    {
        $request->validate([
            'result' => 'nullable|string',
            'notes'  => 'nullable|string',
            'files'  => 'nullable|array',
            'files.*' => 'file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $report = LabReport::where('id', $reportId)
            ->where('status', 'pending')
            ->firstOrFail();

        $report->update([
            'lab_id'       => auth('lab')->id(),
            'status'       => 'completed',
            'result'       => $request->result,
            'notes'        => $request->notes,
            'completed_at' => Carbon::now(),
        ]);

        if ($request->hasFile('files')) {
            $this->uploadFile($request, $report, 'lab_result', $report->user_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Report marked as completed.',
            'report'  => $report->fresh()->load('images'),
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
        return response()->json([
            'success'         => true,
            'patient'         => [
                'id'          => $patient->id,
                'name'        => $patient->name,
                'national_id' => $patient->national_id,
            ],
            'pending_reports' => LabReport::where('user_id', $patient->id)
                ->where('status', 'pending')
                ->get(['id', 'test_name', 'notes', 'created_at']),
        ]);
    }
}
