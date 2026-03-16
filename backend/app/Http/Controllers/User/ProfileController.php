<?php

namespace App\Http\Controllers\User;

use App\Models\User;
use App\Models\DoctorReport;
use App\Models\PatientProfile;
use App\Traits\AttachFiles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    use AttachFiles;

    // -------------------------------------------------------
    // عرض بيانات المستخدم + الملف الشخصي + الملفات الطبية
    // -------------------------------------------------------
    public function show()
    {
        $user = User::with('profile.images')->find(Auth::guard('api')->id());

        return response()->json([
            'user' => $user,
        ]);
    }

    // -------------------------------------------------------
    // تحديث بيانات المستخدم الأساسية
    // -------------------------------------------------------
    public function update(Request $request)
    {
        $user = User::find(Auth::guard('api')->id());

        $validated = $request->validate([
            'name'        => 'sometimes|nullable|string|max:255',
            'national_id' => 'sometimes|nullable|string|max:14',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Data updated successfully',
            'user'    => $user->fresh(),
        ]);
    }

    // -------------------------------------------------------
    // تحديث الملف الشخصي للمريض
    // -------------------------------------------------------
    public function updateProfile(Request $request)
    {
        $user = User::find(Auth::guard('api')->id());

        $validated = $request->validate([
            'phone'                      => 'sometimes|nullable|string|max:20',
            'phone_alt'                  => 'sometimes|nullable|string|max:20',
            'birth_date'                 => 'sometimes|nullable|date',
            'gender'                     => 'sometimes|nullable|in:male,female',
            'nationality'                => 'sometimes|nullable|string|max:100',
            'marital_status'             => 'sometimes|nullable|string|max:50',
            'occupation'                 => 'sometimes|nullable|string|max:100',
            'governorate'                => 'sometimes|nullable|string|max:100',
            'city'                       => 'sometimes|nullable|string|max:100',
            'address'                    => 'sometimes|nullable|string|max:255',
            'blood_type'                 => 'sometimes|nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'height'                     => 'sometimes|nullable|numeric|min:50|max:250',
            'weight'                     => 'sometimes|nullable|numeric|min:10|max:300',
            'chronic_diseases'           => 'sometimes|nullable|string',
            'allergies'                  => 'sometimes|nullable|string',
            'current_medications'        => 'sometimes|nullable|string',
            'previous_surgeries'         => 'sometimes|nullable|string',
            'family_history'             => 'sometimes|nullable|string',
            'emergency_contact_name'     => 'sometimes|nullable|string|max:255',
            'emergency_contact_phone'    => 'sometimes|nullable|string|max:20',
            'emergency_contact_relation' => 'sometimes|nullable|string|max:100',
        ]);

        // ✅ updateOrCreate - لو مفيش profile هيعمل واحد جديد
        $profile = PatientProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => $profile,
        ]);
    }

    // -------------------------------------------------------
    // رفع ملف طبي على الـ PatientProfile
    // -------------------------------------------------------
    public function storeMedicalFile(Request $request)
    {
        $request->validate([
            'files'   => 'required',
            'files.*' => 'file|mimes:jpg,jpeg,png,pdf|max:10240',
            'type'    => 'required|in:xray,lab_result,prescription,medical_report,vaccine',
            'title'   => 'required|string|max:255',
            'notes'   => 'nullable|string',
            'date'    => 'nullable|date',
        ]);

        $user = User::find(Auth::guard('api')->id());

        // ✅ لو مفيش profile هيعمل واحد فاضي
        $profile = PatientProfile::firstOrCreate(['user_id' => $user->id]);

        $this->uploadFile($request, $profile, 'PatientProfile');

        return response()->json([
            'message' => 'File uploaded successfully',
            'files'   => $profile->images()->latest()->get(),
        ], 201);
    }

    // -------------------------------------------------------
    // عرض الملفات الطبية
    // -------------------------------------------------------
    public function getFiles(Request $request)
    {
        $user = User::find(Auth::guard('api')->id());
        $profile = PatientProfile::firstOrCreate(['user_id' => $user->id]);

        $query = $profile->images();

        if ($request->type) {
            $query->where('type', $request->type);
        }

        return response()->json([
            'files' => $query->latest()->get(),
        ]);
    }

    // -------------------------------------------------------
    // حذف ملف طبي
    // -------------------------------------------------------
    public function destroyFile($id)
    {
        $user = User::find(Auth::guard('api')->id());
        $profile = PatientProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['error' => 'There is no patient profile'], 404);
        }

        // The $id passed here is the ID of the Image record.
        $file = $profile->images()->where('id', $id)->first();

        if (!$file) {
            return response()->json(['error' => 'File not found'], 404);
        }

        // Delete the physical file for this specific record
        $this->deleteFileByRecord($file, 'PatientProfile');
        $file->delete();

        return response()->json([
            'message' => 'File deleted successfully',
        ]);
    }

    // -------------------------------------------------------
    // حذف الحساب
    // -------------------------------------------------------
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = User::find(Auth::guard('api')->id());
        Auth::guard('api')->logout();
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully',
        ]);
    }

    // -------------------------------------------------------
    // عرض مواعيد المتابعة القادمة مع الأطباء (next_visit_date)
    // -------------------------------------------------------
    public function appointments()
    {
        $userId = Auth::guard('api')->id();

        $appointments = DoctorReport::with('doctor')
            ->where('user_id', $userId)
            ->whereNotNull('next_visit_date')
            ->orderBy('next_visit_date')
            ->get()
            ->map(function (DoctorReport $report) {
                return [
                    'id'              => $report->id,
                    'doctor_id'       => $report->doctor_id,
                    'user_id'         => $report->user_id,
                    'doctor_name'     => $report->doctor?->name,
                    'specialty'       => $report->doctor?->specialty,
                    'facility'        => $report->doctor?->facility,
                    'diagnosis'       => $report->diagnosis,
                    'notes'           => $report->notes,
                    'required_tests'  => $report->required_tests,
                    'next_visit_date' => optional($report->next_visit_date)->toDateString(),
                    'created_at'      => optional($report->created_at)->toDateTimeString(),
                    'updated_at'      => optional($report->updated_at)->toDateTimeString(),
                ];
            })
            ->values();

        return response()->json([
            'appointments' => $appointments,
        ]);
    }
}
