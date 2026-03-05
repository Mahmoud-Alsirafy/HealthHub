<?php

namespace Database\Seeders;

use App\Models\Pharma;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PharmaTable extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('pharmas')->delete();
        Pharma::create([
            'name' => 'pharmas',
            'email' => 'wael@gmail.com',
            'password' => Hash::make('1234567890'),
        ]);
    }
}
