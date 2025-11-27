import { useState, useEffect } from "react";
import Header from "@/Components/Header/Header";
import Sidebar from "@/Components/Sidebard/Sidebard";
import Recomendaciones from "@/Components/Recomendaciones";
import { Toaster } from "react-hot-toast";
import BackButton from "@/Components/BackButton";
import { usePage, router } from '@inertiajs/react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import MobileBottomNav from "@/Components/Header/MobileBottomNav";

export default function AuthenticatedLayout({ 
    header, 
    children, 
    showRecomendaciones = true, // por defecto se muestran
    maxWidth = "max-w-4xl" // opciones: "max-w-3xl", "max-w-4xl", "max-w-5xl", "max-w-6xl", "max-w-7xl", "w-full"
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { auth, notificacionesIniciales = [], unreadCount, unreadMessagesCount } = usePage().props;
    const user = auth?.user;

    const [notificaciones, setNotificaciones] = useState(notificacionesIniciales || []);
    const [contadorRojo, setContadorRojo] = useState(unreadCount || 0);
    const pageProps = usePage().props;
    const userType = pageProps.userType;

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
            } catch (e) {}
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
        <div className="min-h-screen bg-white flex flex-col dark:bg-gray-900 transition-colors">
            <Header
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                notificaciones={notificaciones}
            />

            {/* <BackButton /> */}

            {/* Contenedor principal con 3 columnas */}
            <div className="flex flex-1 bg-gray-50 dark:bg-gray-900">
                {/* Sidebar izquierdo */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    unreadCount={unreadCount}
                />

                {/* Contenido central */}
                <main className="flex-1 overflow-y-auto">
                    {header && (
                        <div>
                            <div className={`${maxWidth === "w-full" ? "w-full" : `mx-auto ${maxWidth} px-4 py-6 sm:px-6 lg:px-8`}`}>
                                {header}
                            </div>
                        </div>
                    )}
                    <div className={`${maxWidth === "w-full" ? "w-full h-full" : `mx-auto ${maxWidth} px-4 py-6 sm:px-6 lg:px-8`}`}>
                        {children}
                    </div>
                </main>

                {/* Sidebar derecho - recomendaciones con condicional */}
                {showRecomendaciones && (
                    <aside className="hidden lg:block w-80 flex-shrink-0 mr-12 p-4 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
                        <Recomendaciones userType={userType} />
                    </aside>
                )}
            </div>

            {/* Navegación móvil inferior */}
            <MobileBottomNav onToggleSidebar={() => setSidebarOpen(true)} />

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
    );
}