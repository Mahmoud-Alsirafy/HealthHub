<?php

namespace Database\Seeders;

use App\Models\Paramedic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ParamedicTable extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('paramedics')->delete();
        Paramedic::create([
            'name' => 'paramedics',
            'email' => 'wael@gmail.com',
            'password' => Hash::make('1234567890'),
        ]);
    }
}
