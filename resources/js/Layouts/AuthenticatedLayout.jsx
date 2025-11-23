import { useState, useEffect } from "react";
import Header from "@/Components/Header/Header";
import Sidebar from "@/Components/Sidebard/Sidebard";
import { Toaster } from "react-hot-toast";
import BackButton from "@/Components/BackButton";
import { usePage, router } from '@inertiajs/react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default function AuthenticatedLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Asegúrate de que las props se pasen correctamente desde el backend
    const { auth, notificacionesIniciales = [], unreadCount, unreadMessagesCount } = usePage().props;
    const user = auth?.user;

    const [notificaciones, setNotificaciones] = useState(notificacionesIniciales || []);
    const [contadorRojo, setContadorRojo] = useState(unreadCount || 0);


    // useEffect(() => {
    //     const handler = (data) => {

    //     console.log('Notificación recibida:', data); // Verifica la notificación completa
    //     // Verificar si el nombre del usuario está presente
    //     console.log('Nombre del usuario:', data.comentario.usuario.name);


    //     setNotificaciones(prev => {
    //         const updatedNotificaciones = [data.comentario, ...prev];
    //         console.log('Notificaciones actualizadas:', updatedNotificaciones); // Verifica el estado actualizado
    //         return updatedNotificaciones;
    //     });
    //     setContadorRojo(prev => prev + 1); // Actualizar el contador rojo
    // };

        
    //     if (user && window.Echo) {
    //         const canal = window.Echo.private(`user.${user.id}`);
    //         canal.listen(".ComentarioCreado", handler);
    //     }

    //     return () => {
    //         // Limpiar al salir del componente
    //         if (user && window.Echo) {
    //             const canal = window.Echo.private(`user.${user.id}`);
    //             canal.stopListening(".ComentarioCreado");
    //         }
    //     };
    // }, [user]);


    // Definimos Pusher/Echo y eventos globales
    useEffect(() => {
        if (!user) return;

        window.authUserId = user.id;
        window.Pusher = Pusher;

        window.Echo = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
        });

        const channel = window.Echo.private(`user.${user.id}`);
        channel.subscribed(() => console.log(`Suscripto a user.${user.id}`));
        channel.error(err => console.error('Error en canal user:', err));

        channel.listen(".MensajeEnviado", payload => {
            window.dispatchEvent(new CustomEvent("mensaje-nuevo-chatpage", {
                detail: payload
            }));
            window.dispatchEvent(new Event("mensaje-recibido"));
        });

        channel.listen(".MensajeLeido", e => {
            if (window.__setChatPageRerender) {
                window.__setChatPageRerender(Date.now());
            }
        });

        return () => {
            try {
                channel.stopListening(".MensajeEnviado");
                channel.unsubscribe && channel.unsubscribe();
            } catch (e) {
                console.warn("Error al limpiar canal user:", e);
            }
        };
    }, [user]);

    // Actualiza el contador rojo del Header al recibir mensajes
    useEffect(() => {
        const handler = () => {
            router.reload({ only: ["unreadCount", "unreadMessagesCount"] });
        };
        window.addEventListener("mensaje-recibido", handler);
        return () => window.removeEventListener("mensaje-recibido", handler);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                notificaciones={notificaciones} // Pasar las notificaciones al Header
            />

            <BackButton />

            <div className="flex flex-1">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    unreadCount={unreadCount}
                />

                <div className="flex-1 flex flex-col">
                    {header && (
                        <div className="bg-white shadow-sm">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </div>
                    )}

                    <main className="flex-1 overflow-y-auto">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>

                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#363636",
                                color: "#fff",
                                borderRadius: "12px",
                                padding: "16px",
                                fontSize: "14px",
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
