import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MessageCircle, Clock, Circle } from "lucide-react";

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

            setListaChats((prev) =>
                prev.map((chat) =>
                    chat.id === chat_id
                        ? { ...chat, mensajes: [...chat.mensajes, mensaje] }
                        : chat
                )
            );
        };

        window.addEventListener("mensaje-nuevo-chatpage", handler);
        return () =>
            window.removeEventListener("mensaje-nuevo-chatpage", handler);
    }, []);

    useEffect(() => {
        if (!auth?.user?.id) return;

        const channel = window.Echo.private(`user.${auth.user.id}`);

        const listener = (data) => {
            const mensaje = data.mensaje;
            const chatId = mensaje.chat_id;

            axios
                .post(route("chat.recibir", chatId))
                .then(async (res) => {
                    //  Si el chat se revivió, refrescamos la lista COMPLETA
                    if (res.data.revived) {
                        try {
                            const lista = await axios.get(
                                route("chat.index.api")
                            );
                            setListaChats(lista.data.chats);
                        } catch (e) {
                            console.error(
                                "Error refrescando lista de chats:",
                                e
                            );
                        }
                    }

                    //  Ahora SÍ pedimos el chat completo
                    axios
                        .get(route("chat.api.show", chatId))
                        .then((res2) => {
                            const chatCompleto = res2.data.chat;

                            setListaChats((prev) => {
                                const existe = prev.some(
                                    (c) => c.id === chatId
                                );
                                if (existe) {
                                    return prev.map((c) =>
                                        c.id === chatId
                                            ? {
                                                  ...c,
                                                  mensajes: [
                                                      ...c.mensajes,
                                                      mensaje,
                                                  ],
                                              }
                                            : c
                                    );
                                }
                                return [chatCompleto, ...prev];
                            });
                        })
                        .catch((err) => {
                            console.error(
                                "Error cargando chat desde backend:",
                                err
                            );
                        });
                })
                .catch((err) => {
                    console.error("Error marcando chat como recibido:", err);
                });
        };

        channel.listen(".MensajeEnviado", listener);

        return () => {
            try {
                channel.stopListening(".MensajeEnviado");
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

            setListaChats((prev) =>
                prev.map((chat) =>
                    chat.id === chatId
                        ? {
                              ...chat,
                              mensajes: chat.mensajes.map((m) => ({
                                  ...m,
                                  leido: true,
                              })),
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

            setListaChats((prev) => prev.filter((chat) => chat.id !== chatId));
        };

        window.addEventListener("chat-borrado", handler);
        return () => window.removeEventListener("chat-borrado", handler);
    }, []);

    // Función auxiliar para formatear fecha
    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const ahora = new Date();
        const diff = ahora - date;
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(diff / 3600000);
        const dias = Math.floor(diff / 86400000);

        if (minutos < 1) return "Justo ahora";
        if (minutos < 60) return `Hace ${minutos}m`;
        if (horas < 24) return `Hace ${horas}h`;
        if (dias < 7) return `Hace ${dias}d`;
        return date.toLocaleDateString("es-AR", {
            day: "numeric",
            month: "short",
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Chat" />

            <div className="py-8 mb-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Mensajes
                        </h1>
                    </div>

                    {/* Lista de chats */}
                    <div className="space-y-4">
                        {listaChats.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                                <p className="text-gray-500 dark:text-gray-300 text-lg mb-2">
                                    No tenés chats abiertos todavía.
                                </p>
                                <p className="text-gray-400 dark:text-gray-400 text-sm">
                                    Cuando envíes o recibas mensajes, aparecerán
                                    acá
                                </p>
                            </div>
                        ) : (
                            listaChats.map((chat) => {
                                // Información desde el backend
                                const personaUser = chat.persona?.user || null;
                                const institucionUser =
                                    chat.institucion?.user || null;

                                let otroUser = null;

                                // Si soy la persona
                                if (personaUser && personaUser.id === userId) {
                                    otroUser = institucionUser;
                                }
                                // Si soy la institución
                                else if (
                                    institucionUser &&
                                    institucionUser.id === userId
                                ) {
                                    otroUser = personaUser;
                                }
                                // fallback por seguridad
                                else {
                                    otroUser = institucionUser || personaUser;
                                }

                                const soyPersona = personaUser?.id === userId;
                                const soyInstitucion =
                                    institucionUser?.id === userId;

                                if (soyPersona) otroUser = institucionUser;
                                else if (soyInstitucion) otroUser = personaUser;
                                else otroUser = personaUser || institucionUser;

                                const nombre =
                                    otroUser?.nombre || "Usuario desconocido";
                                const foto =
                                    otroUser?.profile_photo_url ||
                                    "/profile-photos/default-avatar.webp";

                                const ultimoMensaje =
                                    chat.mensajes?.[chat.mensajes.length - 1];

                                const tieneNoLeidos = chat.mensajes?.some(
                                    (m) => m.emisor_id !== userId && !m.leido
                                );

                                return (
                                    <Link
                                        href={route("chat.show", chat.id)}
                                        key={chat.id}
                                        className={`
                                            block bg-white dark:bg-gray-800 rounded-3xl border 
                                            shadow-md transition-all overflow-hidden hover:shadow-lg
                                            ${
                                                tieneNoLeidos
                                                    ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10"
                                                    : "border-gray-200 dark:border-gray-700"
                                            }
                                        `}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center gap-4">
                                                {/* Avatar con indicador de no leídos */}
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={foto}
                                                        alt={nombre}
                                                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                                    />
                                                    {tieneNoLeidos && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                            <Circle className="w-2 h-2 fill-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Contenido del chat */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h3
                                                            className={`font-bold line-clamp-1 ${
                                                                tieneNoLeidos
                                                                    ? "text-blue-900 dark:text-blue-100"
                                                                    : "text-gray-900 dark:text-white"
                                                            }`}
                                                        >
                                                            {nombre}
                                                        </h3>

                                                        {/* Fecha */}
                                                        {ultimoMensaje && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                                                <Clock className="w-3 h-3" />
                                                                <span>
                                                                    {formatearFecha(
                                                                        ultimoMensaje.created_at
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Último mensaje */}
                                                    <p
                                                        className={`text-sm truncate ${
                                                            tieneNoLeidos
                                                                ? "text-blue-700 dark:text-blue-300 font-medium"
                                                                : "text-gray-600 dark:text-gray-400"
                                                        }`}
                                                    >
                                                        {ultimoMensaje?.contenido ||
                                                            "Sin mensajes"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Barra inferior para mensajes no leídos */}
                                        {tieneNoLeidos && (
                                            <div className="bg-blue-600 dark:bg-blue-500 px-4 py-2">
                                                <p className="text-white text-xs font-medium flex items-center gap-2">
                                                    <Circle className="w-2 h-2 fill-white" />
                                                    Mensajes nuevos
                                                </p>
                                            </div>
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Footer con contador */}
                    {listaChats.length > 0 && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <MessageCircle className="w-4 h-4 inline-block mr-1" />
                                {listaChats.length}{" "}
                                {listaChats.length === 1
                                    ? "conversación"
                                    : "conversaciones"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
