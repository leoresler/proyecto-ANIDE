<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorito extends Model
{
    use HasFactory;

    protected $table = 'favoritos';

    protected $fillable = [
        'perf_persona_id',
        'perf_institucion_id',
        'publicacion_id',
    ];

    // Relaciones
    public function persona()
    {
        return $this->belongsTo(PerfPersona::class, 'perf_persona_id');
    }

    public function publicacion()
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }
}
