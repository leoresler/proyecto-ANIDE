<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerfPersona extends Model
{
    use HasFactory;

    // Indicar explícitamente el nombre de la tabla
    protected $table = 'perf_persona';

    protected $fillable = ['user_id', 'apellido', 'fecha_nac', 'biografia'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
