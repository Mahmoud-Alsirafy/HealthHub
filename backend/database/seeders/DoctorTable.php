<?php

namespace Database\Seeders;

use App\Models\Doctor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DoctorTable extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('doctors')->delete();
        Doctor::create([
            'name'     => 'Dr. wael El-Sayed',
            'email'    => 'wael@gmail.com',
            'password' => bcrypt('123'),
            'specialty' => 'Cardiologist',
            'facility'  => 'Cairo University Hospital',
            'department' => 'Cardiology',
            'experience_years' => 10,
        ]);
        Doctor::create([
            'name'     => 'Dr. zeyad El-Sayed',
            'email'    => 'zeyad@gmail.com',
            'password' => bcrypt('123'),
            'specialty' => 'Cardiologist',
            'facility'  => 'Cairo University Hospital',
            'department' => 'Cardiology',
            'experience_years' => 10,
        ]);
        Doctor::create([
            'name'     => 'Dr. Sarah El-Sayed',
            'email'    => 'Sarah@gmail.com',
            'password' => bcrypt('123'),
            'specialty' => 'Cardiologist',
            'facility'  => 'Cairo University Hospital',
            'department' => 'Cardiology',
            'experience_years' => 10,
        ]);
        Doctor::create([
            'name'     => 'Dr. Mahmoud Alsirafy',
            'email'    => 'alsirafy123@gmail.com',
            'password' => bcrypt('123'),
            'specialty' => 'Cardiologist',
            'facility'  => 'oi institute',
            'department' => 'Cardiology',
            'experience_years' => 10,
        ]);
    }
}
