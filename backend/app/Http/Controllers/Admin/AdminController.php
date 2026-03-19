<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Lab;
use App\Models\Paramedic;
use App\Models\Pharma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    // ================================================
    // DOCTORS
    // ================================================
    public function getDoctors()
    {
        return response()->json(Doctor::paginate(10));
    }

    public function showDoctor(int $id)
    {
        return response()->json(Doctor::findOrFail($id));
    }

    public function storeDoctor(Request $request)
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|unique:doctors,email',
            'password'         => 'required|string|min:6',
            'specialty'        => 'nullable|string',
            'facility'         => 'nullable|string',
            'department'       => 'nullable|string',
            'phone'            => 'nullable|string',
            'experience_years' => 'nullable|integer',
            'license_number'   => 'nullable|string',
        ]);

        $doctor = Doctor::create([
            'name'             => $request->name,
            'email'            => $request->email,
            'password'         => Hash::make($request->password),
            'specialty'        => $request->specialty,
            'facility'         => $request->facility,
            'department'       => $request->department,
            'phone'            => $request->phone,
            'experience_years' => $request->experience_years,
            'license_number'   => $request->license_number,
        ]);

        return response()->json(['success' => true, 'doctor' => $doctor], 201);
    }

    public function updateDoctor(Request $request, int $id)
    {
        $doctor = Doctor::findOrFail($id);

        $request->validate([
            'name'             => 'sometimes|string|max:255',
            'email'            => ['sometimes', 'email', Rule::unique('doctors', 'email')->ignore($id)], // ✅ ignore نفسه
            'password'         => 'sometimes|string|min:6',
            'specialty'        => 'nullable|string',
            'facility'         => 'nullable|string',
            'department'       => 'nullable|string',
            'phone'            => 'nullable|string',
            'experience_years' => 'nullable|integer',
            'license_number'   => 'nullable|string',
        ]);

        $doctor->update([
            'name'             => $request->name             ?? $doctor->name,
            'email'            => $request->email            ?? $doctor->email,
            'specialty'        => $request->specialty        ?? $doctor->specialty,
            'facility'         => $request->facility         ?? $doctor->facility,
            'department'       => $request->department       ?? $doctor->department,
            'phone'            => $request->phone            ?? $doctor->phone,
            'experience_years' => $request->experience_years ?? $doctor->experience_years,
            'license_number'   => $request->license_number   ?? $doctor->license_number,
            ...($request->filled('password') ? ['password' => Hash::make($request->password)] : []),
        ]);

        return response()->json(['success' => true, 'doctor' => $doctor->fresh()]);
    }

    public function deleteDoctor(int $id)
    {
        Doctor::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Doctor deleted.']);
    }

    // ================================================
    // LABS
    // ================================================
    public function getLabs()
    {
        return response()->json(Lab::paginate(10));
    }

    public function showLab(int $id)
    {
        return response()->json(Lab::findOrFail($id));
    }

    public function storeLab(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:labs,email',
            'password' => 'required|string|min:6',
        ]);

        $lab = Lab::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['success' => true, 'lab' => $lab], 201);
    }

    public function updateLab(Request $request, int $id)
    {
        $lab = Lab::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('labs', 'email')->ignore($id)],
            'password' => 'sometimes|string|min:6',
        ]);

        $lab->update([
            'name'  => $request->name  ?? $lab->name,
            'email' => $request->email ?? $lab->email,
            ...($request->filled('password') ? ['password' => Hash::make($request->password)] : []),
        ]);

        return response()->json(['success' => true, 'lab' => $lab->fresh()]);
    }

    public function deleteLab(int $id)
    {
        Lab::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Lab deleted.']);
    }

    // ================================================
    // PHARMAS
    // ================================================
    public function getPharmas()
    {
        return response()->json(Pharma::paginate(10));
    }

    public function showPharma(int $id)
    {
        return response()->json(Pharma::findOrFail($id));
    }

    public function storePharma(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:pharmas,email',
            'password' => 'required|string|min:6',
        ]);

        $pharma = Pharma::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['success' => true, 'pharma' => $pharma], 201);
    }

    public function updatePharma(Request $request, int $id)
    {
        $pharma = Pharma::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('pharmas', 'email')->ignore($id)],
            'password' => 'sometimes|string|min:6',
        ]);

        $pharma->update([
            'name'  => $request->name  ?? $pharma->name,
            'email' => $request->email ?? $pharma->email,
            ...($request->filled('password') ? ['password' => Hash::make($request->password)] : []),
        ]);

        return response()->json(['success' => true, 'pharma' => $pharma->fresh()]);
    }

    public function deletePharma(int $id)
    {
        Pharma::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Pharma deleted.']);
    }

    // ================================================
    // PARAMEDICS
    // ================================================
    public function getParamedics()
    {
        return response()->json(Paramedic::paginate(10));
    }

    public function showParamedic(int $id)
    {
        return response()->json(Paramedic::findOrFail($id));
    }

    public function storeParamedic(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:paramedics,email',
            'password' => 'required|string|min:6',
        ]);

        $paramedic = Paramedic::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['success' => true, 'paramedic' => $paramedic], 201);
    }

    public function updateParamedic(Request $request, int $id)
    {
        $paramedic = Paramedic::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('paramedics', 'email')->ignore($id)],
            'password' => 'sometimes|string|min:6',
        ]);

        $paramedic->update([
            'name'  => $request->name  ?? $paramedic->name,
            'email' => $request->email ?? $paramedic->email,
            ...($request->filled('password') ? ['password' => Hash::make($request->password)] : []),
        ]);

        return response()->json(['success' => true, 'paramedic' => $paramedic->fresh()]);
    }

    public function deleteParamedic(int $id)
    {
        Paramedic::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Paramedic deleted.']);
    }
}
