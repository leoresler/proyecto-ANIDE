<?php

namespace App\Http\Controllers\Chats;


use App\Http\Controllers\Controller; // <-- IMPORTAR EL CONTROLLER BASE
use App\Models\Chat;
use App\Models\Mensaje;
use App\Models\PerfPersona;
use App\Models\PerfInstitucion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Muestra todos los chats del usuario autenticado
     */
    public function index()
    {
        $user = Auth::user();

        // Determinar si el usuario es persona o institución
        $persona = PerfPersona::where('user_id', $user->id)->first();
        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        if ($persona) {
            $chats = Chat::where('persona_id', $persona->id)
                         ->with(['institucion.user', 'mensajes'])
                         ->get();
        } elseif ($institucion) {
            $chats = Chat::where('institucion_id', $institucion->id)
                         ->with(['persona.user', 'mensajes'])
                         ->get();
        } else {
            $chats = collect();
        }

        return inertia('Chat/ChatPage', [
            'auth' => ['user' => $user],
            'chats' => $chats,
        ]);
    }

    /**
     * Muestra los mensajes de un chat específico
     */
    public function show($id)
    {
        $chat = Chat::with(['mensajes.emisor', 'persona.user', 'institucion.user'])
                    ->findOrFail($id);

        return inertia('Chat/ChatDetalle', [
            'chat' => $chat,
            'mensajes' => $chat->mensajes,
        ]);
    }

    /**
     * Inicia un nuevo chat (si no existe) entre una persona y una institución
     */
    public function iniciarChat(Request $request)
    {
        $request->validate([
            'institucion_id' => 'nullable|exists:perf_institucion,id',
            'persona_id' => 'nullable|exists:perf_persona,id',
        ]);

        $user = Auth::user();

        // Identificar quién está iniciando el chat
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

    /**
     * Envía un mensaje dentro de un chat
     */
    public function enviarMensaje(Request $request, $id)
    {
        $request->validate([
            'contenido' => 'required|string|max:1000',
        ]);

        $chat = Chat::findOrFail($id);

        $mensaje = Mensaje::create([
            'chat_id' => $chat->id,
            'emisor_id' => Auth::id(),
            'contenido' => $request->contenido,
        ]);

        // Más adelante se puede emitir un evento broadcast aquí (para tiempo real)
        // event(new MensajeEnviado($mensaje));

        return response()->json(['mensaje' => $mensaje]);
    }
}
