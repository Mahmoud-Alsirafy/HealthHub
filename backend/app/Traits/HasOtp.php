<?php

namespace App\Traits;

trait HasOtp
{
    public function generateCode()
    {
        $this->timestamps = false;
        $this->code = random_int(100000, 999999);
        $this->expired_at = now()->addMinutes(15);
        $this->save();
    }

    public function resetCode()
    {
        $this->timestamps = false;

        $this->code = null;
        $this->expired_at = null;

        $this->save();
    }
}
