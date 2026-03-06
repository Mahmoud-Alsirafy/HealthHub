<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    protected $fillable = [
        'filename',
        'imageable_id',
        'imageable_type',
        'type',
        'title',
        'notes',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function imageable()
    {
        return $this->morphTo();
    }
}
