<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InstitucionMaterial extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'institucion_material';

    protected $fillable = [
        'perf_institucion_id',
        'tipo',
        'nombre',
        'contenido',
        'categorias',
        'plan_estudios',
        'publicado',
        'duracion',
        'modalidad',
    ];

    protected $casts = [
        'categorias' => 'array',
        'plan_estudios' => 'array',
        'publicado' => 'boolean',
        'duracion' => 'integer',
    ];

    public function institucion()
    {
        return $this->belongsTo(PerfInstitucion::class, 'perf_institucion_id');
    }

    public function guardados()
    {
        return $this->hasMany(MaterialGuardado::class, 'material_id');
    }

    public function getNombreInstitucionAttribute()
    {
        return $this->institucion?->nombre ?? 'Institución desconocida';
    }

    public function getFotoInstitucionAttribute()
    {
        return $this->institucion?->foto_perfil ??
            $this->institucion?->user?->profile_photo_url ??
            '/images/default-avatar.png';
    }

    // Scope para materiales publicados
    public function scopePublicados($query)
    {
        return $query->where('publicado', true);
    }

    // Scope para filtrar por tipo
    public function scopeTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    // Scope para filtrar por intereses
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

    // Scope para ordenar por más recientes
    public function scopeRecientes($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}