<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfInstitucion extends Model
{
    
    protected $fillable = [
        'user_id',
        'tipo_institucion',
        'direccion',
        'url_sitio_web',
        'cantidad_seguidores',
        'descripcion',
        'latitud',
        'longitud',
        'verificado',
        'ano_fundacion'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
