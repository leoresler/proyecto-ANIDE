<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitaInstitucion extends Model
{
    protected $table = 'visitas_institucion';

    protected $fillable = [
        'user_id',
        'perf_institucion_id',
        'visited_at',
    ];

    protected $casts = [
        'visited_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function institucion()
    {
        return $this->belongsTo(PerfInstitucion::class, 'perf_institucion_id');
    }

    /**
     * Registra o actualiza una visita a una institución
     */
    public static function registrarVisita(int $userId, int $institucionId): self
    {
        return self::updateOrCreate(
            [
                'user_id' => $userId,
                'perf_institucion_id' => $institucionId,
            ],
            [
                'visited_at' => now(),
            ]
        );
    }

    /**
     * Obtiene las últimas instituciones visitadas por un usuario
     */
    public static function ultimasVisitadas(int $userId, int $limite = 5)
    {
        return self::where('user_id', $userId)
            ->with(['institucion.user'])
            ->orderBy('visited_at', 'desc')
            ->limit($limite)
            ->get()
            ->pluck('institucion')
            ->filter();
    }
}
