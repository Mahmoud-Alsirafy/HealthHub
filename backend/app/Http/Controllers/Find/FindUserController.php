<?php

namespace App\Http\Controllers\Find;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\AttachFiles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FindUserController extends Controller
{
    use AttachFiles;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // show the info of the user
        $user = User::findorFail($id);
        return view('pages.doctor.find.index', compact('user'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // form to update the user's data
        $user = User::findorFail($id);
        return view('pages.doctor.find.edite', compact('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        // !!  update User Info by The Doctor
        DB::beginTransaction();
        try {
            $user = User::findorfail($request->id);
            $user->update([
                'email' => $request->email,
            ]);
            if ($request->hasFile('file_name')) {
                $this->uploadFile(
                    $request->file('file_name'),$user,'User'
                );
            }
            DB::commit();
            toastr()->success(trans('message.update'));
            return redirect()->route('doctor.show',$user->id);
        } catch (\Throwable $e) {
            DB::rollBack();
            toastr()->error(trans('message.error'));
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    // Find user Info by type the right email and pass
    public function find(Request $request)
    {
        $user = User::where('email', $request->email)->first();
        if ($user && Hash::check($request->password, $user->password)) {
            return redirect()->route('doctor.show', $user->id);
        } else {
            return back()->withErrors([
                'email' => 'بيانات الدخول غير صحيحة',
            ]);
        }
    }
}
