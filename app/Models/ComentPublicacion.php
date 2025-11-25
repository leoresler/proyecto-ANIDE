<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComentPublicacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'coment_publicaciones';

    protected $fillable = [
        'publicacion_id',
        'perf_persona_id',
        'perf_institucion_id',
        'contenido',
        'coment_padre_id',
        'eliminado',
    ];

    // cargar relaciones
    protected $with = ['persona.user', 'institucion.user'];

    protected $casts = [
        'eliminado' => 'boolean',
    ];

    public function publicacion()
    {
        return $this->belongsTo(Publicacion::class);
    }

    public function persona()
    {
        return $this->belongsTo(PerfPersona::class, 'perf_persona_id');
    }

    public function institucion()
    {
        return $this->belongsTo(PerfInstitucion::class, 'perf_institucion_id');
    }

    public function respuestas()
    {
        return $this->hasMany(ComentPublicacion::class, 'coment_padre_id')
            ->orderBy('created_at', 'asc');
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'target_id')
            ->where('target_tipo', 'comentario');
    }

    public function comentPadre()
    {
        return $this->belongsTo(ComentPublicacion::class, 'coment_padre_id');
    }


    // metodos GET

    /**
     * obtener el nombre completo del autor
     */
    public function getAuthorNameAttribute()
    {
        if ($this->perf_persona_id && $this->persona) {
            $nombre = $this->persona->user->nombre ?? '';
            $apellido = $this->persona->apellido ?? '';
            return trim("$nombre $apellido") ?: 'Usuario';
        }

        if ($this->perf_institucion_id && $this->institucion) {
            return $this->institucion->user->nombre ?? 'Institución';
        }

        return 'Usuario';
    }

    /**
     * obtener la foto del autor
     */
    public function getAuthorPhotoAttribute()
    {
        if ($this->perf_persona_id && $this->persona) {
            return $this->persona->user->profile_photo_url ?? asset('storage/profile-photos/default.png');
        }

        if ($this->perf_institucion_id && $this->institucion) {
            return $this->institucion->user->profile_photo_url ?? asset('storage/profile-photos/default.png');
        }

        return asset('storage/profile-photos/default.png');
    }
}
