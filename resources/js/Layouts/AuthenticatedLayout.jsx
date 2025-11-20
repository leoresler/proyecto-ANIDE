import { useState, useEffect } from "react";
import Header from "@/Components/Header/Header";
import Sidebar from "@/Components/Sidebard/Sidebard";
import { Toaster } from "react-hot-toast";
import BackButton from "@/Components/BackButton";
import { usePage, router } from '@inertiajs/react'; // <-- uso router
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default function AuthenticatedLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Compatibilidad: acepta unreadCount (viejo) o unreadMessagesCount (backend)
    const pageProps = usePage().props;
    const unreadCount = pageProps.unreadCount ?? pageProps.unreadMessagesCount ?? 0;

    const user = pageProps.auth?.user;

    useEffect(() => {
        if (!user) return;

        // 👉 DEFINIMOS EL USER ID GLOBAL AQUÍ
        window.authUserId = user.id;

        window.Pusher = Pusher;

        window.Echo = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            // authEndpoint, auth headers u otras opciones si las necesitás
        });

        console.log("Echo inicializado para user", user.id);

        // 👉 ESCUCHAMOS LOS MENSAJES QUE LLEGAN AL USUARIO
        const channel = window.Echo.private(`user.${user.id}`);

        channel.subscribed(() => console.log(`Suscripto a user.${user.id}`));
        channel.error((err) => console.error('Error en canal user.:', err));

        channel.listen(".MensajeEnviado", (payload) => {
            console.log("Evento MensajeEnviado (layout) recibido:", payload);

            // 👉 Emitimos el evento global pero con los datos del mensaje
            window.dispatchEvent(new CustomEvent("mensaje-nuevo-chatpage", {
                detail: payload
            }));

            // Esto queda para actualizar el punto rojo
            window.dispatchEvent(new Event("mensaje-recibido"));
        });


        channel.listen(".MensajeLeido", (e) => {
            console.log("📥 Evento MensajeLeido recibido", e);

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

    //actualiza el contador del punto rojo
    useEffect(() => {
        const handler = () => {
            // Usamos router.reload (importado de @inertiajs/react)
            router.reload({ only: ["unreadCount", "unreadMessagesCount"] });
        };

        window.addEventListener("mensaje-recibido", handler);

        return () => {
            window.removeEventListener("mensaje-recibido", handler);
        };
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

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
