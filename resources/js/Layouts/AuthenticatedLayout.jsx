import { useState } from "react";
import Header from "@/Components/Header/Header";
import Sidebar from "@/Components/Sidebard/Sidebard";
// import Footer from "@/Components/Footer";
import { Toaster } from "react-hot-toast";
import { usePage } from '@inertiajs/react';
import ChatButton from '@/Components/ChatButton';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const unreadCount = usePage().props.unreadCount ?? 0;

    const user = usePage().props.auth.user;

    useEffect(() => {
        if (!user) return;

        window.Pusher = Pusher;

        window.Echo = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
        });

        window.Echo.private(`user.${user.id}`)
            .listen('.MensajeEnviado', () => {
                // Actualizar contador global
                window.dispatchEvent(new CustomEvent("mensaje-recibido"));
            });
    }, [user]);
    
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex flex-1">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    unreadCount={unreadCount}
                />

                {/* contenido */}
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

                    {/* <Footer /> */}

                    {/* libreria 'react-hot-toast' para mensajes en pantalla al usuario */}
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
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: "#10b981",
                                    secondary: "#fff",
                                },
                            },
                            error: {
                                duration: 4000,
                                iconTheme: {
                                    primary: "#ef4444",
                                    secondary: "#fff",
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
