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
            // SOLO ocultar si ESTA persona lo borró
            $chats = Chat::where('persona_id', $persona->id)
                ->whereNull('persona_deleted_at')
                ->with(['institucion.user', 'mensajes.emisor'])
                ->get();
        }
        elseif ($institucion) {
            // SOLO ocultar si ESTA institución lo borró
            $chats = Chat::where('institucion_id', $institucion->id)
                ->whereNull('institucion_deleted_at')
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

        $chat = Chat::with(['persona.user', 'institucion.user'])
                    ->findOrFail($id);

        $esPersona = $persona && $chat->persona_id == $persona->id;
        $esInstitucion = $institucion && $chat->institucion_id == $institucion->id;

        if (!$esPersona && !$esInstitucion) {
            abort(403, "No autorizado.");
        }

        // FILTRAR mensajes igual que apiShow
        $deletedAt = $chat->deletedAtFor($user->id);

        $mensajes = $chat->mensajes()
            ->when($deletedAt, function ($q) use ($deletedAt) {
                $q->where('created_at', '>', $deletedAt);
            })
            ->orderBy('created_at', 'asc')
            ->with('emisor')
            ->get();



        // leer mensajes
        Mensaje::where('chat_id', $id)
            ->where('emisor_id', '!=', $user->id)
            ->where('leido', false)
            ->update([
                'leido' => true,
                'leido_en' => now(),
            ]);

        broadcast(new \App\Events\MensajeLeido($id, $user->id))->toOthers();

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

        // Seguridad: validar que el chat realmente pertenece al usuario
        if ($persona && $chat->persona_id !== $persona->id) {
            abort(403, 'No autorizado.');
        }

        if ($institucion && $chat->institucion_id !== $institucion->id) {
            abort(403, 'No autorizado.');
        }

        // Marcar como borrado
        if ($persona) {
            $chat->update(['persona_deleted_at' => now()]);
        } elseif ($institucion) {
            $chat->update(['institucion_deleted_at' => now()]);
        }

        return redirect()->route('chat.index');
    }


    public function apiShow($id)
    {
        $user = Auth::user();

        // Cargar chat con relaciones
        $chat = Chat::with(['persona.user', 'institucion.user'])
                    ->findOrFail($id);

        // Verificar que el usuario es parte del chat
        $esDueno = 
            ($chat->persona && $chat->persona->user_id == $user->id) ||
            ($chat->institucion && $chat->institucion->user_id == $user->id);

        if (!$esDueno) {
            abort(403, "No tiene permiso para ver este chat.");
        }

        // Obtener fecha de borrado específica PARA ESTE usuario
        $deletedAt = $chat->deletedAtFor($user->id);

        // Filtrar mensajes dependiendo de si el usuario borró el chat
        $mensajes = $chat->mensajes()
            ->when($deletedAt, function ($q) use ($deletedAt) {
                $q->where('created_at', '>', $deletedAt);
            })
            ->orderBy('created_at', 'asc')
            ->with('emisor')
            ->get();

        // Sobrescribir la relación mensajes en el objeto Chat
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

        $esPersona = $persona && $chat->persona_id == $persona->id;
        $esInstitucion = $institucion && $chat->institucion_id == $institucion->id;

        if (!$esPersona && !$esInstitucion) {
            return response()->json([
                'ok' => false,
                'revived' => false,
            ], 403);
        }

        // 🔥 1. GUARDÁS EL deleted_at ANTES DE REVIVIR
        $oldDeletedAt = $chat->deletedAtFor($user->id);

        // 🔥 2. FILTRÁS MENSAJES ANTES DE LIMPIAR deleted_at
        $mensajes = $chat->mensajes()
            ->when($oldDeletedAt, fn($q) =>
                $q->where('created_at', '>', $oldDeletedAt)
            )
            ->with('emisor')
            ->orderBy('created_at', 'asc')
            ->get();

        // 🔥 3. REVIVÍS (pero ya guardaste la fecha para filtrar)
        if ($esPersona) {
            $chat->update(['persona_deleted_at' => null]);
        }

        if ($esInstitucion) {
            $chat->update(['institucion_deleted_at' => null]);
        }

        return response()->json([
            'ok' => true,
            'revived' => true,
            'mensajes' => $mensajes,
            'old_deleted_at' => $oldDeletedAt, // 👈 FRONT LA PUEDE USAR
        ]);
    }








}
