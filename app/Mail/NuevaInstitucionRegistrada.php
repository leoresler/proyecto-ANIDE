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

    public function __construct(User $user, $urlAprobar, $urlRechazar)
    {
        $this->user = $user;
        $this->urlAprobar = $urlAprobar;
        $this->urlRechazar = $urlRechazar;
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