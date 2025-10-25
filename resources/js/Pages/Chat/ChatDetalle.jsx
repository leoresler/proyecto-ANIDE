import React, { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from "axios";
import "../../echo.js";


export default function ChatDetalle({ chat, mensajes, auth }) {
    const [contenido, setContenido] = useState("");
    const [mensajesState, setMensajes] = useState(mensajes || []);

    const [usuarioEscribiendo, setUsuarioEscribiendo] = useState(null);
    const timeoutRef = useRef(null);

    // Emitir evento cuando se escribe algo
    const handleTyping = async () => {
    clearTimeout(timeoutRef.current);
    await axios.post(`/chats/${chat.id}/escribiendo`);
    timeoutRef.current = setTimeout(() => {
        setUsuarioEscribiendo(null);
    }, 3000);
    };

    // Escuchar evento desde el otro usuario
    useEffect(() => {
    const channel = window.Echo.private(`chat.${chat.id}`);
    channel.listen(".usuario.escribiendo", (e) => {
        console.log("Evento escribiendo recibido:", e);
        setUsuarioEscribiendo(e.user.nombre);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setUsuarioEscribiendo(null);
        }, 3000);
    });

    return () => channel.stopListening(".usuario.escribiendo");
}, [chat.id]);


    // Referencia para el contenedor de mensajes, para hacer scroll automático
    const mensajesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (mensajesEndRef.current) {
            mensajesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajesState]);

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!contenido.trim()) return;

        try {
            const response = await axios.post(route('chat.enviar', chat.id), { contenido });

            // Si tu endpoint devuelve el mensaje recién creado:
            const nuevoMensaje = response.data.mensaje;

            setMensajes((prev) => [...prev, nuevoMensaje]);

            setContenido("");
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        }
    };


    useEffect(() => {
        if (!chat?.id) return;

        const channel = window.Echo.private(`chat.${chat.id}`);

        channel.subscribed(() => console.log('✅ Canal suscrito correctamente'));
        channel.error((err) => console.error('❌ Error en canal:', err));

        channel.listen(".MensajeEnviado", (e) => {
            console.log("📨 Evento recibido:", e);
            setMensajes((prev) => [...prev, e.mensaje]);
        });

        return () => {
            channel.stopListening(".MensajeEnviado");
        };
    }, [chat.id]);



    const otraParte = chat.persona ? chat.persona.user : chat.institucion.user;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat con {otraParte.name}</h2>}
        >
            <Head title={`Chat con ${otraParte.name}`} />

            <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col h-[calc(100vh-16rem)]">
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto border rounded p-4 space-y-2 bg-gray-50">
                    {mensajesState.length === 0 ? (
                <p className="text-gray-500 text-center">No hay mensajes aún</p>
            ) : (
                mensajesState.map((mensaje, index) => {
                    const fecha = new Date(mensaje.created_at);
                    const fechaFormateada = fecha.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const esEmisor = mensaje.emisor_id === auth.user.id;

                    // Revisar si hay que mostrar separador de fecha
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
                            <div className={`flex flex-col max-w-xs p-2 rounded mb-2 ${esEmisor ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-800'}`}>
                                <div>{mensaje.contenido}</div>
                                <div className={`text-xs mt-1 ${esEmisor ? 'text-right text-blue-100' : 'text-left text-gray-500'}`}>
                                    {hora}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })
            )}

                </div>

                {/* Indicador de "escribiendo..." */}
                {usuarioEscribiendo && (
                    <p className="text-sm text-gray-500 italic mt-1">
                        {usuarioEscribiendo} está escribiendo...
                    </p>
                )}    
                    
                {/* Formulario para enviar mensaje */}
                <form onSubmit={enviarMensaje} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        onInput={handleTyping} // 👈 dispara evento escribiendo
                        placeholder="Escribí un mensaje..."
                        className="flex-1 border rounded px-3 py-2 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Enviar
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
