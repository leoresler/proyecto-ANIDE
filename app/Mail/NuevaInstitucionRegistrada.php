<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevaInstitucionRegistrada extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $urlAprobar;
    public $urlRechazar;

    public function __construct(User $user)
    {
        $this->user = $user;
        
        // Generar URLs con el token de aprobación
        $token = $user->institucion->approval_token;
        
        $this->urlAprobar = route('institucion.aprobar', ['token' => $token]);
        $this->urlRechazar = route('institucion.rechazar', ['token' => $token]);
    }

    public function build()
    {
        return $this->subject('📩 Nueva institución registrada - Requiere verificación')
            ->view('emails.nueva-institucion')
            ->with([
                'user' => $this->user,
                'urlAprobar' => $this->urlAprobar,
                'urlRechazar' => $this->urlRechazar,
            ]);
    }
}