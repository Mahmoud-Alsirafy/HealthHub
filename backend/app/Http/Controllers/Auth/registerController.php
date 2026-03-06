<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Notifications\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;  // ✅ هنا مش جوه الـ class

class registerController extends Controller
{
    public function reg_form(Request $request)
    {
        return response()->json([
            'message' => 'Registration Form',
            'type'    => $request->type,
        ]);
    }

    public function register(Request $request)
    {
        if ($request->type !== 'users') {
            return response()->json([
                'error' => 'التسجيل متاح للمستخدمين فقط',
            ], 403);
        }

        DB::beginTransaction();

        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'email'       => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password'    => ['required'],
            'national_id' => 'required',
        ]);

        if ($validator->fails()) {
            DB::rollBack();
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::create([
                'name'        => $request->name,
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'national_id' => $request->national_id,
            ]);

            $user->generate_code();

            DB::commit();
            $user->notify(new Otp());

            return response()->json([
                'message'  => trans('message.success'),
                'user'     => $user,
                'redirect' => route('otp.index', [
                    'type' => $request->type,
                    'id'   => $user->id,
                ]),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'error'   => 'فشل التسجيل',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
