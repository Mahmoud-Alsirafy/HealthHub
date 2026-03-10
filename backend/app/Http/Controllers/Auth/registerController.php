<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
        return response()->json(['error' => 'Registration is only available for users'], 403);
    }

    DB::beginTransaction();

    $validator = Validator::make($request->all(), [
        'name'        => 'required|string|max:255',
        'email'       => 'required|string|lowercase|email|max:255|unique:users',
        'password'    => ['required'],
        'national_id' => 'required',
    ]);

    if ($validator->fails()) {
        DB::rollBack();
        return response()->json(['errors' => $validator->errors()], 422);
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
            'message' => 'Registration successful',
            'user'    => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
        ], 201);

    } catch (\Throwable $e) {
        DB::rollBack();
        return response()->json(['error' => 'Registration failed', 'details' => $e->getMessage()], 500);
    }
}
}
