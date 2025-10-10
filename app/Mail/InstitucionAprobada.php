<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InstitucionAprobada extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    public function build()
    {
        return $this->subject('🎉 ¡Tu institución fue aprobada!')
                    ->view('emails.institucion-aprobada')
                    ->with([
                        'nombre' => $this->user->nombre,
                        'institucion' => optional($this->user->institucion)->tipo_institucion,
                    ]);
    }
}
