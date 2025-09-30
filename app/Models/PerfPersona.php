<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfPersona extends Model
{

    protected $fillable = ['user_id', 'apellido', 'fecha_nac', 'biografia'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
