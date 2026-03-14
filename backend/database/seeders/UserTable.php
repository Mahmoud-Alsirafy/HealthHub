<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserTable extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         DB::table('users')->delete();
        User::create([
            'name' => 'users',
            'email' => 'alsirafy123@gmail.com',
            'password' => Hash::make('123'),
            'national_id'=>"1111111111111"
        ]);
    }
}
