<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Lap;
use App\Models\Pharma;
use App\Models\Paramedic;
use App\Notifications\Otp;
use App\Traits\AuthTrait;
use Illuminate\Http\Request;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Auth;

class OtpController extends Controller
{
    use AuthTrait;

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

    protected function getModel($type)
    {
        $models = [
            'users' => User::class,
            'doctors' => Doctor::class,
            'laps' => Lap::class,
            'pharmas' => Pharma::class,
            'paramedics' => Paramedic::class,
        ];

        return $models[$type] ?? null;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $modelClass = $this->getModel($request->type);
        if (!$modelClass) {
            toastr()->error(trans('auth.failed'));
            return redirect()->back();
        }

        $user = $modelClass::where('id', $request->id)->first();

        if (!$user) {
            toastr()->error(trans('auth.failed'));
            return redirect()->back();
        }

        if (now()->greaterThan($user->expierd_at)) {
            toastr()->warning(trans('auth.expierd'));
            return redirect()->back();
        }

        if ($request->otp == $user->code) {
            toastr()->success(trans('auth.success_login'));
            $user->reset_code();
            Auth::guard($this->checkGuard($request))->login($user);
            return $this->redirect($request);
        } else {
            toastr()->error(trans('auth.error_OTP'));
            return redirect()->back();
        }
    }

    public function resend($type, $id)
    {
        $modelClass = $this->getModel($type);
        if (!$modelClass) {
            toastr()->error('User not found!');
            return redirect()->back();
        }

        $user = $modelClass::find($id);

        if (!$user) {
            toastr()->error('User not found!');
            return redirect()->back();
        }

        // لو الكود لسه شغال بلاش نعيده
        if ($user->expierd_at && now()->lessThan($user->expierd_at)) {
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
