<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerfPersona extends Model
{
    use HasFactory;

    // Indicar explícitamente el nombre de la tabla
    protected $table = 'perf_persona';

    protected $fillable = ['user_id', 'apellido', 'interests', 'fecha_nac', 'biografia'];

    protected $casts = [
        'interests' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chats()
    {
    return $this->hasMany(Chat::class, 'persona_id');
    }
}
