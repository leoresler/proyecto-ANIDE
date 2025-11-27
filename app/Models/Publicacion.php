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
        'publicado',
        'categorias'
    ];

    protected $casts = [
        'categorias' => 'array',
        'publicado' => 'boolean',
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

    public function scopePorIntereses($query, array $interesesUsuario)
    {
        if (empty($interesesUsuario)) {
            return $query;
        }

        return $query->whereNotNull('categorias')
            ->where(function ($q) use ($interesesUsuario) {
                foreach ($interesesUsuario as $interes) {
                    $q->orWhere('categorias', 'LIKE', '%' . $interes . '%');
                }
            });
    }

    // Accessor: Convierte JSON string a array al leer
    public function getCategoriasAttribute($value)
    {
        if (is_null($value)) {
            return [];
        }

        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : [];
    }

    // Mutator: Convierte array a JSON string al guardar
    public function setCategoriasAttribute($value)
    {
        if (is_null($value)) {
            $this->attributes['categorias'] = json_encode([]);
        } elseif (is_array($value)) {
            $this->attributes['categorias'] = json_encode($value);
        } else {
            $this->attributes['categorias'] = $value;
        }
    }

    public function user()
    {
        // Si la publicación pertenece a una institución
        if ($this->perf_institucion_id) {
            return $this->institucion?->user;
        }

        // Si en el futuro agregás publicaciones de personas:
        if ($this->perf_persona_id ?? false) {
            return $this->persona?->user;
        }

        return null;
    }
    public function ownerUser()
    {
        return $this->institucion?->user ?? null;
    }


}
