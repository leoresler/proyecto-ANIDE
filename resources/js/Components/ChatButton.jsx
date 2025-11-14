import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function ChatButton() {
    const { props } = usePage();
    const initialCount = props.unreadMessagesCount ?? 0;

    const [unread, setUnread] = useState(initialCount);

    useEffect(() => {
        setUnread(initialCount);
    }, [initialCount]);

    // Opcional: escuchar evento en tiempo real (ver punto 6 abajo)
    useEffect(() => {
        if (!window.Echo) return;
        const userId = props.auth?.user?.id;
        if (!userId) return;

        const channel = window.Echo.private(`usuario.${userId}`);

        channel.listen('.NuevoMensaje', (e) => {
            // aumenta contador o simplemente lo fija como 1/true
            setUnread(prev => prev + 1);
        });

        return () => {
            try { channel.stopListening('.NuevoMensaje'); } catch (e) {}
        };
    }, []);

    return (
        <a href={route('chat.index')} className="relative inline-flex items-center">
            <svg className="w-6 h-6" /* icono */ />
            {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow" />
            )}
        </a>
    );
}
