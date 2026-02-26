<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\Otp;
use Illuminate\Http\Request;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Auth;

class OtpController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($type, $id)
    {
        // $user = User::where('id', $id)->first();

        // if (!$user) {
        //     return redirect()->route('selection')
        //         ->with('error', 'User not found');
        // }

        return view('pages.otp.verify', compact('id', 'type'));
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
        // return $request;
        if ($request->type == 'users') {
            $user = User::where('id', $request->id)->first();
            if (now()->greaterThan($user->expierd_at)) {
                toastr()->warning(trans('auth.expierd'));
                return redirect()->back();
            }

            if ($request->otp == $user->code) {
                toastr()->success(trans('auth.success_login'));
                $user->reset_code();
                Auth::login($user); // 👈 مهم جدًا            
                return redirect()->route('user.dashboard'); 
            } else {
                toastr()->error(trans('auth.error_OTP'));
                return redirect()->back();
            }
        }
        else{
            toastr()->error(trans('some thing went rong'));
                return redirect()->back();
        }
    }

    public function resend($type, $id)
    {
        // return $type;
        $user = User::find($id);

        if (!$user) {
            toastr()->error('User not found!');
            return redirect()->back();
        }

        // لو الكود لسه شغال بلاش نعيده
        if (now()->lessThan($user->expierd_at)) {
            toastr()->warning(trans('auth.work'));
            return redirect()->route('otp.index', [
                    'type' => $type,
                    'id' => $id
                ]);
        }

        // اعمل كود جديد
        $user->generate_code();
        $user->notify(new Otp());

        toastr()->success(trans('auth.resend'));
        return redirect()->route('otp.index', [
                    'type' => $type,
                    'id' => $id
                ]);
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
