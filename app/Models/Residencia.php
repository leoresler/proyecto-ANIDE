<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Residencia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'residencias';

    protected $fillable = [
        'perf_institucion_id',
        'nombre',
        'direccion',
        'contacto',
        'latitud',
        'longitud',
        'capacidad',
        'foto_portada',
        'info_adicional',
    ];

    protected $casts = [
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
        'capacidad' => 'integer',
    ];

    public function institucion()
    {
        return $this->belongsTo(PerfInstitucion::class, 'perf_institucion_id');
    }

    // metodos GET

    public function getFotoPortadaUrlAttribute()
    {
        if ($this->foto_portada) {
            return asset('storage/' . $this->foto_portada);
        }

        return asset('storage/residencias/default.jpg');
    }

    public function getNombreInstitucionAttribute()
    {
        return $this->institucion?->nombre ?? 'Sin institución';
    }

    protected $appends = ['foto_portada_url', 'nombre_institucion'];
}
