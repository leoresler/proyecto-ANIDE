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
