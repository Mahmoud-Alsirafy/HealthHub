<?php

namespace App\Models;


use Illuminate\Foundation\Auth\User as Authenticatable;

class Doctor extends Authenticatable
{
    protected $fillable = ['name','email', 'password'];

    public function generate_code() {
        $this->timestamps = false;
        $this->code = rand(100000 , 999999);
        $this->expierd_at = now()->addMinute(15);
        $this->save();
    }
    public function reset_code() {
        $this->timestamps = false;
        $this->code = null;
        $this->expierd_at = null;
        $this->save();
    }
}
