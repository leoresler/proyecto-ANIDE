import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from "react";
import axios from "axios";


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

    useEffect(() => {
        if (!auth?.user?.id) return;

        const channel = window.Echo.private(`user.${auth.user.id}`);

        const listener = (data) => {
        const mensaje = data.mensaje;
        const chatId = mensaje.chat_id;

        axios.post(route('chat.recibir', chatId))
            .then(async (res) => {

                // 🔥 Si el chat se revivió, refrescamos la lista COMPLETA
                if (res.data.revived) {
                    try {
                        const lista = await axios.get(route('chat.index.api')); 
                        setListaChats(lista.data.chats);
                    } catch (e) {
                        console.error("Error refrescando lista de chats:", e);
                    }
                }

                // ⬇️ Ahora SÍ pedimos el chat completo
                axios.get(route('chat.api.show', chatId))
                    .then(res2 => {
                        const chatCompleto = res2.data.chat;

                        setListaChats(prev => {
                            const existe = prev.some(c => c.id === chatId);
                            if (existe) {
                                return prev.map(c =>
                                    c.id === chatId
                                        ? { ...c, mensajes: [...c.mensajes, mensaje] }
                                        : c
                                );
                            }
                            return [chatCompleto, ...prev];
                        });
                    })
                    .catch(err => {
                        console.error("Error cargando chat desde backend:", err);
                    });
            })
            .catch(err => {
                console.error("Error marcando chat como recibido:", err);
            });
    };


        channel.listen('.MensajeEnviado', listener);

        return () => {
            try {
                channel.stopListening('.MensajeEnviado');
                window.Echo.leave(`user.${auth.user.id}`);
            } catch (e) {
                // ignore
            }
        };
    }, [auth?.user?.id]);




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
    // 3) ESCUCHAR CUANDO SE BORRA UN CHAT
    //    → QUITARLO INSTANTÁNEAMENTE DE LA LISTA
    // ----------------------------------------------
    useEffect(() => {
        const handler = (e) => {
            const { chatId } = e.detail;

            setListaChats(prev =>
                prev.filter(chat => chat.id !== chatId)
            );
        };

        window.addEventListener("chat-borrado", handler);
        return () => window.removeEventListener("chat-borrado", handler);
    }, []);

        useEffect(() => {
        setListaChats(prev =>
            prev.length === 0
                ? chats // primera carga
                : prev.filter(ch => chats.some(c => c.id === ch.id)) // limpiar eliminados
        );
    }, [chats]);

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

                                // Información desde el backend
                                const personaUser = chat.persona?.user || null;
                                const institucionUser = chat.institucion?.user || null;

                                let otroUser = null;

                                // Si soy la persona
                                if (personaUser && personaUser.id === userId) {
                                    otroUser = institucionUser;
                                }
                                // Si soy la institución
                                else if (institucionUser && institucionUser.id === userId) {
                                    otroUser = personaUser;
                                }
                                // fallback por seguridad
                                else {
                                    otroUser = institucionUser || personaUser;
                                }


                                const soyPersona = personaUser?.id === userId;
                                const soyInstitucion = institucionUser?.id === userId;

                               
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
