<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Actividad extends Model
{
    use HasFactory;

    protected $table = 'actividades';

    protected $fillable = [
        'user_id',
        'tipo',
        'modelo',
        'modelo_id',
        'descripcion',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación polimórfica para obtener el objeto relacionado
    public function getObjetoAttribute()
    {
        switch ($this->modelo) {
            case 'publicacion':
                return Publicacion::with(['institucion.user'])->find($this->modelo_id);
            case 'material':
                return InstitucionMaterial::with(['institucion.user'])->find($this->modelo_id);
            case 'institucion':
                return PerfInstitucion::with('user')->find($this->modelo_id);
            default:
                return null;
        }
    }
}