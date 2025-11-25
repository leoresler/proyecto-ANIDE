<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\CustomVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'password',
        'profile_photo_path',
        'nombre',
        'telefono',
        'ciudad',
        'provincia',
        'tipo_usuario',
        'estado',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Los accessors que deben incluirse al serializar el modelo.
     */
    protected $appends = ['profile_photo_url'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }

    /**
     * Retorna la URL de la foto de perfil.
     * Si no tiene foto, retorna la foto por defecto.
     */
    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo_path) {
            return asset('storage/' . $this->profile_photo_path);
        }

        return asset('storage/profile-photos/default-avatar.webp');
    }

    public function persona()
    {
        return $this->hasOne(PerfPersona::class);
    }

    public function institucion()
    {
        return $this->hasOne(PerfInstitucion::class);
    }

    /**
     * Verifica si el usuario tiene acceso completo
     * - Persona: email verificado + estado activo
     * - Institución: email verificado + estado activo + verificado manual (verificado = 1)
     */
    public function tieneAccesoCompleto(): bool
    {
        if ($this->estado !== 'activo') {
            return false;
        }

        if (!$this->hasVerifiedEmail()) {
            return false;
        }

        if ($this->tipo_usuario === 'institucion') {
            return $this->institucion && $this->institucion->verificado == 1;
        }

        return true;
    }
}
