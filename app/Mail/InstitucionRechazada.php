<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InstitucionRechazada extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $motivo;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, $motivo)
    {
        $this->user = $user;
        $this->motivo = $motivo;
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
        return $this->subject('❌ Tu institución fue rechazada')
                    ->view('emails.institucion-rechazada')
                    ->with([
                        'nombre' => $this->user->nombre,
                        'motivo' => $this->motivo,
                    ]);
    }
}
