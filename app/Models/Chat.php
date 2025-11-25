<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'persona_id',
        'institucion_id',
        'persona_deleted_at',
        'institucion_deleted_at',
    ];


    public function persona()
    {
        return $this->belongsTo(PerfPersona::class, 'persona_id');
    }

    public function institucion()
    {
        return $this->belongsTo(PerfInstitucion::class, 'institucion_id');
    }

    public function mensajes()
    {
        return $this->hasMany(Mensaje::class);
    }

    public function deletedAtFor($userId)
    {
        if ($this->persona && $this->persona->user_id === $userId) {
            return $this->persona_deleted_at;
        }

        if ($this->institucion && $this->institucion->user_id === $userId) {
            return $this->institucion_deleted_at;
        }

        return null;
    }

}
