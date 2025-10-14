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
        'doc_identificador',
        'tipo_documento',
        'direccion',
        'sitio_web',
        'cantidad_seguidores',
        'descripcion',
        'foto_perfil',
        'latitud',
        'longitud',
        'verificado',
        'approval_token',
        'ano_fundacion',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::creating(function ($institucion) {
            $institucion->approval_token = Str::uuid();
        });
    }

    public function chats()
    {
    return $this->hasMany(Chat::class, 'institucion_id');
    }
}
