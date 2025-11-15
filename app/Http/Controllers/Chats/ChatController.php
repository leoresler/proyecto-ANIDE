<?php

namespace App\Http\Controllers\Chats;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Mensaje;
use App\Models\PerfPersona;
use App\Models\PerfInstitucion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\MensajeEnviado;
use App\Events\UsuarioEscribiendo;



class ChatController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $persona = PerfPersona::where('user_id', $user->id)->first();
        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        if ($persona) {
            $chats = Chat::where('persona_id', $persona->id)
                         ->with(['institucion.user', 'mensajes.emisor'])
                         ->get();
        } elseif ($institucion) {
            $chats = Chat::where('institucion_id', $institucion->id)
                         ->with(['persona.user', 'mensajes.emisor'])
                         ->get();
        } else {
            $chats = collect();
        }

        return inertia('Chat/ChatPage', [
            'auth' => ['user' => $user],
            'chats' => $chats,
            'chatIds' => $chats->pluck('id'),
        ]);
    }

    public function show($id)
    {
        $chat = Chat::with(['mensajes.emisor', 'persona.user', 'institucion.user'])
                    ->findOrFail($id);

        // Marcar como leídos los mensajes que no fueron enviados por el usuario actual
        \App\Models\Mensaje::where('chat_id', $id)
        ->where('emisor_id', '!=', auth()->id())
        ->where('leido', false)
        ->update(['leido' => true]);

        return inertia('Chat/ChatDetalle', [
            'chat' => $chat,
            'mensajes' => $chat->mensajes,
            'auth' => ['user' => auth()->user()],
        ]);
    }

    public function iniciarChat(Request $request)
    {
        $request->validate([
            'institucion_id' => 'nullable|exists:perf_institucion,id',
            'persona_id' => 'nullable|exists:perf_persona,id',
        ]);

        $user = Auth::user();

        $persona = PerfPersona::where('user_id', $user->id)->first();
        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        if ($persona) {
            $chat = Chat::firstOrCreate([
                'persona_id' => $persona->id,
                'institucion_id' => $request->institucion_id,
            ]);
        } elseif ($institucion) {
            $chat = Chat::firstOrCreate([
                'persona_id' => $request->persona_id,
                'institucion_id' => $institucion->id,
            ]);
        } else {
            return response()->json(['error' => 'Usuario no asociado a perfil válido'], 400);
        }

        return redirect()->route('chat.show', $chat->id);
    }

    public function enviarMensaje(Request $request, $chatId)
    {
        $request->validate([
            'contenido' => 'required|string|max:1000',
        ]);

        $chat = Chat::findOrFail($chatId);

        $mensaje = Mensaje::create([
            'chat_id' => $chat->id,
            'emisor_id' => auth()->id(),
            'contenido' => $request->contenido,
        ]);

        $mensaje->load('emisor');

        // Emitimos el evento a todos los demás usuarios conectados
        broadcast(new MensajeEnviado($mensaje))->toOthers();

        // Retornamos el mensaje al cliente que lo envió
        return response()->json(['mensaje' => $mensaje]);
    }

    public function escribiendo(Request $request, $chatId)
    {
        broadcast(new UsuarioEscribiendo($chatId, $request->user()))->toOthers();
        return response()->json(['status' => 'ok']);
    }

    public function marcarLeidos(Chat $chat)
    {
        $userId = auth()->id();

        Mensaje::where('chat_id', $chat->id)
            ->where('emisor_id', '!=', $userId)
            ->update(['leido' => true]);

        return response()->json(['ok' => true]);
    }


}
