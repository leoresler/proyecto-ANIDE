import React, { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from "axios";
import "../../echo.js";
import { throttle } from 'lodash';
import { router } from '@inertiajs/react';
import PersonaProfileModal from "@/Components/ModalPersona/PersonaProfileModal";


export default function ChatDetalle({ chat, mensajes, auth }) {
    const [contenido, setContenido] = useState("");
    const [mensajesState, setMensajes] = useState(mensajes || []);
    const [confirmarBorrado, setConfirmarBorrado] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [usuarioEscribiendo, setUsuarioEscribiendo] = useState(null);
    const timeoutRef = useRef(null);
    const throttledRef = useRef(null);      
    const latestChatIdRef = useRef(chat.id);  
    const mountedRef = useRef(false);
    const userId = auth.user.id;

    // Detectar mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Siempre persona ↔ institución
    const personaUser = chat.persona?.user || null;
    const institucionUser = chat.institucion?.user || null;

    let otraParte = null;
    let otraParteEsPersona = false;
    let otraPartePersonaId = null;

    // Si soy la persona → la otra parte es la institución
    if (personaUser && personaUser.id === userId) {
        otraParte = institucionUser;
        otraParteEsPersona = false;
    }
    // Si soy la institución → la otra parte es la persona
    else if (institucionUser && institucionUser.id === userId) {
        otraParte = personaUser;
        otraParteEsPersona = true;
        otraPartePersonaId = chat.persona?.id;
    }
    // Caso fallback (extra seguridad)
    else {
        otraParte = institucionUser || personaUser;
        otraParteEsPersona = !!personaUser;
        otraPartePersonaId = chat.persona?.id;
    }


    //resetar contador cuando abre mensaje
    useEffect(() => {
        window.dispatchEvent(
        new CustomEvent("chat-abierto", { detail: { chatId: chat.id } })
        );

    }, []);

    // Mantener el chatId actualizado para que la función throttled use siempre el chat actual
    useEffect(() => {
        latestChatIdRef.current = chat.id;
    }, [chat.id]);

    // 🔥 Marcar mensajes como leídos al abrir el chat
    useEffect(() => {
        const marcarComoLeidos = async () => {
            try {
                await axios.post(`/chats/${chat.id}/marcar-leidos`);
                
                // 🔥 Forzar actualización del Sidebar
                window.dispatchEvent(new CustomEvent("mensaje-recibido"));
            } catch (error) {
                console.error("Error al marcar como leídos:", error);
            }
        };

        marcarComoLeidos();
    }, [chat.id]);


    // Crear la función throttled UNA SOLA VEZ (persistente entre renders)
    useEffect(() => {
        // Si ya existe, no la recreamos
        if (!throttledRef.current) {
        // 3s de throttle como tenías (ajustalo si querés 1000 o 2000)
        throttledRef.current = throttle(() => {
            const cid = latestChatIdRef.current;
            // seguridad: si no hay chatId no hacemos nada
            if (!cid) return;
            axios.post(`/chats/${cid}/escribiendo`).catch(() => {});
        }, 3000, { trailing: false }); // trailing:false para no ejecutar al final de burst (opcional)
        }

        // No necesitamos cleanup aquí (lodash throttle se mantiene)
    }, []); // se ejecuta solo una vez

    // handleTyping usa siempre la función persistente
    const handleTyping = () => {
        clearTimeout(timeoutRef.current);

        // Llamamos a la función throttled almacenada
        throttledRef.current && throttledRef.current();

        // Mantenemos la UI local del "está escribiendo" (se limpia a los 3s)
        timeoutRef.current = setTimeout(() => setUsuarioEscribiendo(null), 3000);
    };

    // Escuchar evento "usuario escribiendo" — idempotente y limpio
    useEffect(() => {
        // Evitar doble attach en StrictMode (opcional pero útil)
        if (mountedRef.current) {
        // si ya estaba montado, hacemos el detach del canal anterior (por seguridad)
        try {
            const prevChannel = window.Echo.private(`chat.${chat.id}`);
            prevChannel.stopListening(".usuario.escribiendo");
        } catch (e) { /* ignore */ }
        }
        mountedRef.current = true;

        const channel = window.Echo.private(`chat.${chat.id}`);

        // asegurar que no queden listeners previos en este canal/evento
        try {
        channel.stopListening(".usuario.escribiendo");
        } catch (err) {
        // stopListening puede fallar si no había nada, lo ignoramos
        }

        const callback = (e) => {
        // Debug: verás solo los eventos reales recibidos
        console.log("Evento escribiendo recibido:", e);

        if (e.user?.id === userId) return;

        setUsuarioEscribiendo(e.user?.nombre ?? null);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setUsuarioEscribiendo(null), 3000);
        };

        channel.listen(".usuario.escribiendo", callback);


        // limpiamos al desmontar
        return () => {
            try {
                channel.stopListening(".usuario.escribiendo");
            } catch (e) {
                // ignore
            }
        };
    }, [chat.id]);


    // Scroll automático al final del chat
    const mensajesEndRef = useRef(null);
    const scrollToBottom = () => {
        if (mensajesEndRef.current) {
            mensajesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    useEffect(() => {
        scrollToBottom();
    }, [mensajesState]);

    // Enviar mensaje
    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!contenido.trim()) return;

        try {
            const response = await axios.post(route('chat.enviar', chat.id), { contenido });
            setContenido("");
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        }
    };

    // Escuchar evento "MensajeEnviado"
    useEffect(() => {
        if (!chat?.id) return;

        const channel = window.Echo.private(`chat.${chat.id}`);

        channel.subscribed(() => console.log('✅ Canal suscrito correctamente'));
        channel.error((err) => console.error('❌ Error en canal:', err));

        channel.listen(".MensajeEnviado", async (e) => {
        console.log("📨 Evento recibido:", e);

        try {
            // 1️⃣ Revivir chat si corresponde (y obtener mensajes filtrados)
            const reviveRes = await axios.post(route("chat.recibir", chat.id));

            if (reviveRes.data.revived) {
                // si revivió → usar mensajes filtrados devueltos
                setMensajes(reviveRes.data.mensajes);
            }

            // 2️⃣ Ahora sí refrescar mensajes completos como siempre
            const showRes = await axios.get(route("chat.api.show", chat.id));
            setMensajes(showRes.data.chat.mensajes);

        } catch (err) {
            console.error("❌ Error refrescando mensajes filtrados", err);
        }

        // Avisar al Sidebar
        window.dispatchEvent(
            new CustomEvent("mensaje-nuevo-chatpage", { detail: { mensaje: e.mensaje } })
        );
    });



        return () => channel.stopListening(".MensajeEnviado");
    }, [chat.id]);

    const handleBorrarChat = async () => {
        try {
       
            await axios.post(route("chat.archivar", chat.id));
     
            window.dispatchEvent(
                new CustomEvent("chat-borrado", {
                    detail: { chatId: chat.id }
                })
            );

            router.visit(route("chat.index"));

        } catch (error) {
            console.error("Error al borrar chat:", error);
        }
    };




    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    {otraParteEsPersona && otraPartePersonaId ? (
                        <PersonaProfileModal
                            personaId={otraPartePersonaId}
                            isMobile={isMobile}
                            trigger={
                                <img
                                    src={otraParte?.profile_photo_url || "/images/default-avatar.webp"}
                                    alt={otraParte?.nombre || 'Usuario'}
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                />
                            }
                        />
                    ) : (
                        otraParte && (
                        <Link
                            href={`/instituciones/${chat.institucion?.id}`}
                        >
                            <img
                                src={otraParte.profile_photo_url || "/images/default-avatar.webp"}
                                alt={otraParte.nombre || 'Usuario'}
                                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                            />
                        </Link>
                    )
                    )}
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Chat con {otraParte?.nombre || 'Usuario desconocido'}
                    </h2>
                </div>
            }
        >
            <Head title={`Chat con ${otraParte?.nombre || 'Usuario desconocido'}`} />

            <div className="max-w-4xl mx-auto py-4 px-4 flex flex-col h-[calc(100vh-16rem)]">
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2 bg-white dark:bg-gray-800 dark:border-gray-700">
                    {mensajesState.length === 0 ? (
                        <p className="text-gray-500 text-center">No hay mensajes aún</p>
                    ) : (
                        mensajesState.map((mensaje, index) => {
                            const fecha = new Date(mensaje.created_at);
                            const fechaFormateada = fecha.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
                            const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            const esEmisor = mensaje.emisor_id === auth.user.id;

                            // Separador de fecha si cambia el día
                            let mostrarFecha = false;
                            if (index === 0) {
                                mostrarFecha = true;
                            } else {
                                const fechaAnterior = new Date(mensajesState[index - 1].created_at);
                                const fechaAnteriorFormateada = fechaAnterior.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
                                if (fechaFormateada !== fechaAnteriorFormateada) {
                                    mostrarFecha = true;
                                }
                            }

                            return (
                                <React.Fragment key={mensaje.id}>
                                    {mostrarFecha && (
                                        <div className="text-center text-gray-400 text-sm my-2">
                                            {fechaFormateada}
                                        </div>
                                    )}
                                    <div className={`flex flex-col max-w-xs p-2 rounded-lg mb-2 ${esEmisor ? 'bg-gray-500 text-white ml-auto' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                        <div>{mensaje.contenido}</div>
                                        <div className={`text-xs mt-1 ${esEmisor ? 'text-right text-blue-100' : 'text-left text-gray-500 dark:text-gray-400'}`}>
                                            {hora}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })
                    )}
                    <div ref={mensajesEndRef} />
                </div>

                {/* Indicador de "escribiendo..." */}
                {usuarioEscribiendo && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">
                        {usuarioEscribiendo} está escribiendo...
                    </p>
                )}

                {/* Formulario para enviar mensaje */}
                <form onSubmit={enviarMensaje} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        onInput={handleTyping}
                        placeholder="Escribí un mensaje..."
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        className="bg-edu-dark text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Enviar
                    </button>
                </form>
                <button
                    onClick={() => setConfirmarBorrado(true)}
                    className="text-sm mt-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                    Borrar chat
                </button>

            </div>

            {confirmarBorrado && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">

                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        ¿Deseas borrar este chat?
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Esta acción eliminará este chat de tu bandeja.  
                        El otro usuario seguirá viendo los mensajes.
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setConfirmarBorrado(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                            No
                        </button>

                        <button
                            onClick={() => {
                                setConfirmarBorrado(false);
                                handleBorrarChat();
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Sí, borrar
                        </button>
                    </div>
                </div>
            </div>
        )}

        </AuthenticatedLayout>
    );
}