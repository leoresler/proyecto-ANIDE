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
    ];

    protected $casts = [
        'verificado' => 'boolean',
        'cantidad_seguidores' => 'integer',
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function residencias()
    {
        return $this->hasMany(Residencia::class, 'perf_institucion_id');
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
}
