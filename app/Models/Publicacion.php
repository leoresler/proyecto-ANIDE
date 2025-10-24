<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publicacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'publicaciones';

    protected $fillable = [
        'perf_institucion_id',
        'titulo',
        'contenido',
        'publicado'
    ];

    public function institucion()
    {
        return $this->belongsTo(PerfInstitucion::class, 'perf_institucion_id');
    }

    public function comentarios()
    {
        return $this->hasMany(ComentPublicacion::class);
    }

    public function media()
    {
        return $this->hasMany(PublicacionMedia::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'target_id')
            ->where('target_tipo', 'publicacion');
    }

    public function favoritos()
    {
        return $this->hasMany(Favorito::class, 'publicacion_id');
    }

    public function getNombreInstitucionAttribute()
    {
        return $this->institucion?->nombre ?? 'Institución desconocida';
    }

    // Scope para publicaciones publicadas
    public function scopePublicadas($query)
    {
        return $query->where('publicado', true);
    }

    // Scope para ordenar por más recientes
    public function scopeRecientes($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
