<?php

namespace Database\Seeders;

use App\Models\Lap;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class LapTable extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('laps')->delete();
        Lap::create([
            'name' => 'Admin',
            'email' => 'wael@gmail.com',
            'password' => Hash::make('1234567890'),
        ]);
    }
}
