<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\AttachFiles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    use AttachFiles;

    // -------------------------------------------------------
    // عرض بيانات المستخدم + الملفات الطبية
    // -------------------------------------------------------
    public function show()
    {
        $user = User::with('images')->find(Auth::guard('api')->id());

        return response()->json([
            'user' => $user,
        ]);
    }

    // -------------------------------------------------------
    // تحديث بيانات المستخدم
    // -------------------------------------------------------
    public function update(Request $request)
    {
        $user = User::find(Auth::guard('api')->id());

        $validated = $request->validate([
            'name'                       => 'sometimes|nullable|string|max:255',
            'phone'                      => 'sometimes|nullable|string|max:20',
            'phone_alt'                  => 'sometimes|nullable|string|max:20',
            'national_id'                => 'sometimes|nullable|string|max:14',
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

        $user->update($validated);

        return response()->json([
            'message' => 'تم تحديث البيانات بنجاح',
            'user'    => User::find($user->id),
        ]);
    }

    // -------------------------------------------------------
    // رفع ملف طبي
    // ✅ بنرفع على الـ User مباشرة عن طريق morphMany
    // -------------------------------------------------------
    public function storeMedicalFile(Request $request)
    {
        $request->validate([
            'files'   => 'required|array',
            'files.*' => 'file|mimes:jpg,jpeg,png,pdf|max:10240',
            'type'    => 'required|in:xray,lab_result,prescription,medical_report,vaccine',
            'title'   => 'required|string|max:255',
            'notes'   => 'nullable|string',
            'date'    => 'nullable|date',
        ]);

        $user = User::find(Auth::guard('api')->id());

        foreach ($request->file('files') as $file) {
            $fileName = $file->getClientOriginalName();
            $file->storeAs('attachments/users/' . $user->id, $fileName, 'upload_attachments');

            // ✅ بنحفظ في images table مع الـ type والـ title
            $user->images()->create([
                'filename' => $fileName,
                'type'     => $request->type,
                'title'    => $request->title,
                'notes'    => $request->notes,
                'date'     => $request->date,
            ]);
        }

        return response()->json([
            'message' => 'تم رفع الملف بنجاح',
            'files'   => $user->images()->latest()->get(),
        ], 201);
    }

    // -------------------------------------------------------
    // عرض الملفات الطبية (مع فلترة اختيارية)
    // -------------------------------------------------------
    public function getFiles(Request $request)
    {
        $user = User::find(Auth::guard('api')->id());

        $query = $user->images();

        // فلترة حسب النوع لو موجود ?type=xray
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

        // ✅ نتأكد إن الملف بيتبع الـ user ده
        $file = $user->images()->where('id', $id)->first();

        if (!$file) {
            return response()->json(['error' => 'الملف غير موجود'], 404);
        }

        $this->deleteFile($user->id, 'users');
        $file->delete();

        return response()->json([
            'message' => 'تم حذف الملف بنجاح',
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
            'message' => 'تم حذف الحساب بنجاح',
        ]);
    }
}
