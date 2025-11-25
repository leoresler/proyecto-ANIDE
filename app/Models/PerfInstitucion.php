<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PerfInstitucion extends Model
{
    use HasFactory;

    protected $table = 'perf_institucion';

    protected $fillable = [
        'user_id',
        'tipo_institucion',
        'direccion',
        'url_sitio_web',
        'cantidad_seguidores',
        'descripcion',
        'foto_perfil',
        'latitud',
        'longitud',
        'verificado',
        'ano_fundacion',
        'interests',
        'doc_identificador',
        'tipo_documento',
    ];

    protected $casts = [
        'verificado' => 'boolean',
        'cantidad_seguidores' => 'integer',
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
        'interests' => 'array',
        'ano_fundacion' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function residencias()
    {
        return $this->hasMany(Residencia::class, 'perf_institucion_id');
    }

    public function institucion_material()
    {
        return $this->hasMany(InstitucionMaterial::class);
    }

    // metodos GET
    public function getNombreAttribute()
    {
        return $this->user?->nombre ?? 'Sin nombre';
    }

    public function getCiudadAttribute()
    {
        return $this->user?->ciudad;
    }

    public function getProvinciaAttribute()
    {
        return $this->user?->provincia;
    }

    public function getTelefonoAttribute()
    {
        return $this->user?->telefono;
    }

    public function getEmailAttribute()
    {
        return $this->user?->email;
    }

    public function publicaciones()
    {
        return $this->hasMany(Publicacion::class, 'perf_institucion_id');
    }

    public function guardadaPorUsuarios()
    {
        return $this->belongsToMany(PerfPersona::class, 'ubicaciones_guardadas', 'institucion_id', 'persona_id')
                    ->join('users', 'users.id', '=', 'perf_persona.user_id') // unir tabla users
                    ->select('perf_persona.*', 'users.id as user_id'); // traer user_id directamente
    }



    protected static function booted()
    {
        static::creating(function ($institucion) {
            if (!$institucion->approval_token) {
                $institucion->approval_token = Str::uuid();
            }
        });
    }

    protected $appends = ['nombre'];

    public function chats()
    {
        return $this->hasMany(Chat::class, 'institucion_id');
    }

    // Accessor: Convierte JSON string a array al leer
    public function getInterestsAttribute($value)
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
    public function setInterestsAttribute($value)
    {
        if (is_null($value)) {
            $this->attributes['interests'] = json_encode([]);
        } elseif (is_array($value)) {
            $this->attributes['interests'] = json_encode($value);
        } else {
            $this->attributes['interests'] = $value;
        }
    }
}
