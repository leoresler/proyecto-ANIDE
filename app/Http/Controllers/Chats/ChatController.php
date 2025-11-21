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

        $revived = session('revived_chats', []);

        if ($persona) {
            $chats = Chat::where('persona_id', $persona->id)
                        ->where(function($q) use ($revived) {
                            $q->whereNull('persona_deleted_at')
                            ->orWhereIn('id', $revived);
                        })
                        ->with(['institucion.user', 'mensajes.emisor'])
                        ->get();
        } 
        elseif ($institucion) {
            $chats = Chat::where('institucion_id', $institucion->id)
                        ->where(function($q) use ($revived) {
                            $q->whereNull('institucion_deleted_at')
                            ->orWhereIn('id', $revived);
                        })
                        ->with(['persona.user', 'mensajes.emisor'])
                        ->get();
        }
        else {
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
        $user = auth()->user();

        $persona = PerfPersona::where('user_id', $user->id)->first();
        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        $chat = Chat::with(['mensajes.emisor', 'persona.user', 'institucion.user'])
                    ->findOrFail($id);

        // Detectamos si este usuario "borró" el chat
        if ($persona && $chat->persona_deleted_at) {
            $mensajes = $chat->mensajes()
                ->where('created_at', '>', $chat->persona_deleted_at)
                ->get();
        } elseif ($institucion && $chat->institucion_deleted_at) {
            $mensajes = $chat->mensajes()
                ->where('created_at', '>', $chat->institucion_deleted_at)
                ->get();
        } else {
            $mensajes = $chat->mensajes;
        }

        // Marcar como leídos los mensajes que no fueron enviados por el usuario actual
        Mensaje::where('chat_id', $id)
            ->where('emisor_id', '!=', auth()->id())
            ->where('leido', false)
            ->update([
                'leido' => true,
                'leido_en' => now(),
            ]);

        broadcast(new \App\Events\MensajeLeido($id, auth()->id()))->toOthers();

        return inertia('Chat/ChatDetalle', [
            'chat' => $chat,
            'mensajes' => $mensajes,
            'auth' => ['user' => $user],
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

        // Detectar tipo de usuario
        $esPersona = PerfPersona::where('user_id', auth()->id())->exists();
        $esInstitucion = PerfInstitucion::where('user_id', auth()->id())->exists();

        // Si el chat estaba borrado para este usuario, lo "revivimos"
        if ($esPersona && $chat->persona_deleted_at) {
            $chat->update(['persona_deleted_at' => null]);
        }

        if ($esInstitucion && $chat->institucion_deleted_at) {
            $chat->update(['institucion_deleted_at' => null]);
        }

        $mensaje = Mensaje::create([
            'chat_id' => $chat->id,
            'emisor_id' => auth()->id(),
            'contenido' => $request->contenido,
        ]);

        $mensaje->load('emisor');

        // Emitimos el evento a todos los demás usuarios conectados
        broadcast(new MensajeEnviado($mensaje))->toOthers();

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

    public function archivar(Chat $chat)
    {
        $user = Auth::user();

        $persona = PerfPersona::where('user_id', $user->id)->first();
        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        if ($persona) {
            $chat->update(['persona_deleted_at' => now()]);
        } elseif ($institucion) {
            $chat->update(['institucion_deleted_at' => now()]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function apiShow($id)
    {
        $chat = Chat::with(['persona.user', 'institucion.user'])
                    ->findOrFail($id);

        $userId = auth()->id();

        // Saber si el usuario actual es persona o institución
        $esPersona = $chat->persona && $chat->persona->user_id == $userId;
        $esInstitucion = $chat->institucion && $chat->institucion->user_id == $userId;

        if (!$esPersona && !$esInstitucion) {
            abort(403, "No tiene permiso para ver este chat.");
        }

        // FILTRO: mensajes posteriores a persona_deleted_at o institucion_deleted_at
        $mensajes = $chat->mensajes()
            ->when($esPersona && $chat->persona_deleted_at, function ($q) use ($chat) {
                $q->where('created_at', '>', $chat->persona_deleted_at);
            })
            ->when($esInstitucion && $chat->institucion_deleted_at, function ($q) use ($chat) {
                $q->where('created_at', '>', $chat->institucion_deleted_at);
            })
            ->orderBy('created_at', 'asc')
            ->with('emisor')
            ->get();

        // Añadimos los mensajes filtrados manualmente
        $chat->setRelation('mensajes', $mensajes);

        return response()->json([
            'chat' => $chat
        ]);
    }


    /**
 * Marca el chat como visible (desarchiva) para el usuario autenticado receptor.
 * Si el usuario ya no lo tenía marcado como eliminado, no hace nada.
 */
    public function recibir(Chat $chat)
    {
        $user = Auth::user();

        $persona = PerfPersona::where('user_id', $user->id)->first();
        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        $revived = false;

        if ($persona && $chat->persona_id == $persona->id) {

            // No tocamos persona_deleted_at -> mantiene el "corte"
            session()->push('revived_chats', $chat->id);
            $revived = true;
        }

        if ($institucion && $chat->institucion_id == $institucion->id) {

            // No tocamos institucion_deleted_at -> mantiene el "corte"
            session()->push('revived_chats', $chat->id);
            $revived = true;
        }

        return response()->json([
            'ok' => true,
            'revived' => $revived,
        ]);
    }




}
