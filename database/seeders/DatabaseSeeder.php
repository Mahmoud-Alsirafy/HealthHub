<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Database\Seeders\LapTable;
use Database\Seeders\UserTable;
use Illuminate\Database\Seeder;
use Database\Seeders\DoctorTable;
use Database\Seeders\PharmaTable;
use Database\Seeders\ParamedicTable;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserTable::class);
        $this->call(DoctorTable::class);
        $this->call(PharmaTable::class);
        $this->call(ParamedicTable::class);
        $this->call(LapTable::class);

    }
}
