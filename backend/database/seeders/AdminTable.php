<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminTable extends Seeder
{
    public function run(): void
    {
        Admin::insert([
            ['name' => 'Doctor Admin',    'email' => 'admin.doctor@gmail.com',    'password' => Hash::make('password'), 'type' => 'doctor',   ],
            ['name' => 'Lab Admin',       'email' => 'admin.lab@gmail.com',       'password' => Hash::make('password'), 'type' => 'lab',      ],
            ['name' => 'Pharma Admin',    'email' => 'admin.pharma@gmail.com',    'password' => Hash::make('password'), 'type' => 'pharma',   ],
            ['name' => 'Paramedic Admin', 'email' => 'admin.paramedic@gmail.com', 'password' => Hash::make('password'), 'type' => 'paramedic',],
        ]);
    }
}
