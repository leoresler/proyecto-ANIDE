<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['web', 'auth']]);

Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    $chat = \App\Models\Chat::find($chatId);
    if (!$chat) return false;

    if (($chat->persona_id && optional($user->persona)->id === $chat->persona_id) ||
        ($chat->institucion_id && optional($user->institucion)->id === $chat->institucion_id)) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    return false;
});


Broadcast::channel('user.{id}', function ($user, $id) {
    return intval($user->id) === intval($id);
});

Broadcast::channel('notificaciones.{userId}', function ($user, $userId) {
    return (int)$user->id === (int)$userId;
});

 Broadcast::channel('user.{id}', function ($user, $id) {
        return (int) $user->id === (int) $id;
});

