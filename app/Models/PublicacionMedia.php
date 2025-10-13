<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PublicacionMedia extends Model
{
    use HasFactory;

    protected $table = 'publicacion_media';

    protected $fillable = [
        'publicacion_id',
        'tipo',   // 'imagen' | 'video' | 'documento'
        'url',    // ruta en storage
        'orden',
    ];

    // Si querés que te devuelva automáticamente la url pública
    protected $appends = ['url_publica'];

    public function publicacion()
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }

    // Accessor para obtener la URL pública (Storage::url)
    public function getUrlPublicaAttribute()
    {
        return $this->url ? Storage::url($this->url) : null;
    }
}
