<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UbicacionGuardada extends Model
{
    protected $table = 'ubicaciones_guardadas';
    protected $fillable = [
        'persona_id',
        'institucion_id'
    ];

    public function institucion() {
        return $this->belongsTo(PerfInstitucion::class, 'institucion_id');
    }

    public function persona() {
        return $this->belongsTo(PerfPersona::class, 'persona_id');
    }
}
