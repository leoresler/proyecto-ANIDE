import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from "react";

export default function ChatPage({ auth, chats = [] }) {
    const userId = auth.user.id;

    // 🎯 Estado único con todos los chats (incluyendo mensajes)
    const [listaChats, setListaChats] = useState(chats);

    // ----------------------------------------------
    // 1) ESCUCHAR MENSAJES NUEVOS EN TIEMPO REAL
    // ----------------------------------------------
    useEffect(() => {
        const handler = (e) => {
            const mensaje = e.detail.mensaje;
            const { chat_id } = mensaje;

            setListaChats(prev =>
                prev.map(chat =>
                    chat.id === chat_id
                        ? { ...chat, mensajes: [...chat.mensajes, mensaje] }
                        : chat
                )
            );
        };

        window.addEventListener("mensaje-nuevo-chatpage", handler);
        return () => window.removeEventListener("mensaje-nuevo-chatpage", handler);
    }, []);

    // ----------------------------------------------
    // 2) ESCUCHAR CUANDO EL USUARIO ABRE UN CHAT
    //    → QUITAR EL FONDO ROJO INSTANTÁNEAMENTE
    // ----------------------------------------------
    useEffect(() => {
        const handler = (e) => {
            const { chatId } = e.detail;

            setListaChats(prev =>
                prev.map(chat =>
                    chat.id === chatId
                        ? { 
                            ...chat, 
                            mensajes: chat.mensajes.map(m => ({
                                ...m,
                                leido: true
                            }))
                          }
                        : chat
                )
            );
        };

        window.addEventListener("chat-abierto", handler);
        return () => window.removeEventListener("chat-abierto", handler);
    }, []);

    // ----------------------------------------------
    // RENDER
    // ----------------------------------------------
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat</h2>}
        >
            <Head title="Chat" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {listaChats.length === 0 ? (
                        <p className="text-gray-600 text-center">
                            No tenés chats abiertos todavía.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {listaChats.map((chat) => {

                                const personaUser = chat.persona?.user;
                                const institucionUser = chat.institucion?.user;

                                const soyPersona = personaUser?.id === userId;
                                const soyInstitucion = institucionUser?.id === userId;

                                let otroUser = null;
                                if (soyPersona) otroUser = institucionUser;
                                else if (soyInstitucion) otroUser = personaUser;
                                else otroUser = personaUser || institucionUser;

                                const nombre = otroUser?.nombre || 'Usuario desconocido';
                                const foto = otroUser?.profile_photo_url || '/storage/profile-photos/default.png';

                                const ultimoMensaje =
                                    chat.mensajes?.[chat.mensajes.length - 1];

                                const tieneNoLeidos = chat.mensajes?.some(
                                    (m) => m.emisor_id !== userId && !m.leido
                                );

                                return (
                                    <Link
                                        href={route('chat.show', chat.id)}
                                        key={chat.id}
                                        className={`
                                            flex items-center shadow p-4 rounded transition 
                                            ${tieneNoLeidos
                                                ? "bg-red-300 hover:bg-red-200"
                                                : "bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        <img
                                            src={foto}
                                            alt={nombre}
                                            className="w-12 h-12 rounded-full object-cover mr-4 border"
                                        />

                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{nombre}</p>

                                            <p className="text-sm text-gray-500 truncate">
                                                Último mensaje: {ultimoMensaje?.contenido || 'Sin mensajes'}
                                            </p>

                                            {ultimoMensaje && (
                                                <p className="text-xs text-gray-400">
                                                    {new Date(ultimoMensaje.created_at).toLocaleTimeString(
                                                        "es-AR",
                                                        { hour: "2-digit", minute: "2-digit" }
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
