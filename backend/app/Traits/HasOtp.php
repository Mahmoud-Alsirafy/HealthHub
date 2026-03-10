<?php

namespace App\Traits;

trait HasOtp
{
    // ✅ generate_code بدل generateCode
    public function generate_code()
    {
        $this->timestamps = false;
        $this->code = random_int(100000, 999999);
        $this->expired_at = now()->addMinutes(15);
        $this->save();
    }

    // ✅ reset_code بدل resetCode
    public function reset_code()
    {
        $this->timestamps = false;
        $this->code = null;
        $this->expired_at = null;
        $this->save();
    }
}
