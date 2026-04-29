<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Traits\AuthTrait;
use App\Notifications\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class registerController extends Controller
{
    use AuthTrait;

    public function reg_form(Request $request)
    {
        return response()->json([
            'message' => 'Registration Form',
            'type'    => $request->type,
        ]);
    }

    public function register(Request $request)
    {
        $guard = $this->checkGuard($request);
        $modelClass = $this->getModelFromGuard($guard);
        $tableName = (new $modelClass)->getTable();

        DB::beginTransaction();

        $validator = Validator::make($request->all(), [
            'type'        => 'required|in:users,doctors,labs,pharmas,paramedics',
            'name'        => 'required|string|max:255',
            'email'       => "required|string|lowercase|email|max:255|unique:{$tableName}",
            'password'    => ['required'],
            'national_id' => 'required_if:type,users,doctors',
        ]);

        if ($validator->fails()) {
            DB::rollBack();
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ];

            if (in_array($request->type, ['users', 'doctors'], true)) {
                $data['national_id'] = $request->national_id;
            }

            $user = $modelClass::create($data);
            $user->generate_code();

            DB::commit();
            $user->notify(new Otp());

            return response()->json([
                'message' => 'Registration successful',
                'type'    => $request->type,
                'user'    => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Registration failed', 'details' => $e->getMessage()], 500);
        }
    }
}
