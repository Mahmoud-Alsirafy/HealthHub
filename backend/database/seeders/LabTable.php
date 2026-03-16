<?php

namespace Database\Seeders;

use App\Models\Lab;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LabTable extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('labs')->delete();
        Lab::create([
            'name' => 'lab',
            'email' => 'wael@gmail.com',
            'password' => Hash::make('123'),
        ]);
    }
}
