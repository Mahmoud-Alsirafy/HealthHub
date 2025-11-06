<?php

namespace App\Http\Controllers;

use App\Notifications\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OtpController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('pages.otp.verify');
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
        $user = Auth::user();
        if (now()->greaterThan($user->expierd_at)) {
            toastr()->warning(trans('auth.expierd'));
            return redirect()->back();
        }

        if ($request->otp == $user->code) {
            toastr()->success(trans('auth.success_login'));
            $user->reset_code();
            return redirect()->route("dashboard");
        } else {
            toastr()->error(trans('auth.error_OTP'));
            return redirect()->back();
        }
    }

    public function resend()
    {
        $user = Auth::user();

        // لو الكود لسه شغال بلاش نعيده
        if (now()->lessThan($user->expierd_at)) {
            toastr()->warning(trans('auth.work'));
            return redirect()->route('OTP.index');
        }

        // اعمل كود جديد
        $user->generate_code();
        $user->notify(new Otp());

        toastr()->success(trans('auth.resend'));
        return redirect()->route('OTP.index');
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
