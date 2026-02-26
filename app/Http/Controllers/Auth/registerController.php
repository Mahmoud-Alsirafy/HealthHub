<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Notifications\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;



class registerController extends Controller
{

    // !!register
    public function reg_form(Request $request)
    {
        $type = $request->type;
        return view('auth.register', compact('type'));
    }


    public function register(Request $request)
    {
        if ($request->type == 'users') {
            $type = $request->type;
            DB::beginTransaction();
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
                'password' => ['required', 'confirmed'],
                'national_id' => 'required'
            ]);
            try {

                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'national_id' => $request->national_id,
                ]);

                $user = User::where('email', $request->email)->first();

                // ! Genrate OTP Code

                $user->generate_code();

                // ! Email OTP

                $user->notify(new Otp());

                // // ! SMS OTP
                // $message = "Your OTP Code IS " . $user->code;

                // $account_sid   = env('TWILIO_SID');
                // $account_token = env('TWILIO_TOKEN');
                // $account_from  = env('TWILIO_FROM');

                // $client = new Client($account_sid, $account_token);

                // $client->messages->create(
                //     '+201068492403', // رقم المستلم
                //     [
                //         'from' => $account_from,
                //         'body' => $message,
                //     ]
                // );
                DB::commit();
                toastr()->success(trans('message.success'));
                return redirect()->route('otp.index', [
                    'type' => $type,
                    'id'   => $user->id
                ]);
                
                

                // return redirect()->route('OTP.index', ['type' => $type, 'id' => $user->id]);
            } catch (\Throwable $e) {
                DB::rollBack();
                return redirect()->route('selection');
            }
        } else {
            toastr()->error('you can be added form respalsn company');
            return redirect()->route('selection');
        }
    }
    // !!register
}
