import { Link, router } from "@inertiajs/react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState, useEffect } from "react";
import BotonSidebar from "./botonSidebard";

export default function Sidebar({ isOpen, onClose, unreadCount }) {

    const [count, setCount] = useState(unreadCount);
    const [showMore, setShowMore] = useState(false);

    // Actualiza cuando Laravel manda nuevo unreadCount
    useEffect(() => {
        setCount(unreadCount);
    }, [unreadCount]);

    // Cuando llega un mensaje → recargar unreadCount desde backend
    useEffect(() => {
        const actualizar = () => {
            console.log("🔄 Recalculando unread...");
            router.reload({ only: ["unreadCount"] });
        };

        window.addEventListener("mensaje-recibido", actualizar);

        return () => {
            window.removeEventListener("mensaje-recibido", actualizar);
        };
    }, []);

    return (
        <>
            {/* sidebar desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white p-4 h-[calc(100vh-64px)] sticky top-16">
                <nav className="space-y-2">
                    <BotonSidebar href="/profile" label="Perfil" />
                    <hr className="bg-black" />

                    <BotonSidebar href="#" icon="/svg/sidebar/book.svg" label="Carreras" />
                    <BotonSidebar href="/favoritos" icon="/svg/sidebar/bookmark.svg" label="Elementos Guardados" />
                    <BotonSidebar href="#" icon="/svg/sidebar/location.svg" label="Ubicaciones Guardadas" />
                    <BotonSidebar href="#" icon="/svg/sidebar/courses.svg" label="Cursos" />
                    <BotonSidebar href="#" icon="/svg/sidebar/clock.svg" label="Actividad" />

                    <BotonSidebar
                        href="/chats"
                        icon="/svg/sidebar/chat.svg"
                        label="Chat"
                        unreadCount={count}
                    />

                    <hr className="bg-black mt-3" />

                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="flex items-center space-x-2 hover:bg-gray-100 pl-2 rounded w-full"
                    >
                        {showMore ? (
                            <>
                                <ChevronUp size={18} /> <span>Ver menos</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown size={18} /> <span>Ver más</span>
                            </>
                        )}
                    </button>
                </nav>
            </aside>

            {/* sidebar móvil */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    ></div>

                    <aside className="relative w-64 bg-white h-full shadow-xl z-50 p-4 overflow-y-auto">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <nav className="space-y-2 mt-8">
                            <BotonSidebar href="/profile" label="Perfil" />
                            <hr className="bg-black" />

                            <BotonSidebar href="#" icon="/svg/sidebar/book.svg" label="Carreras" />
                            <BotonSidebar href="/favoritos" icon="/svg/sidebar/bookmark.svg" label="Elementos Guardados" />
                            <BotonSidebar href="#" icon="/svg/sidebar/location.svg" label="Ubicaciones Guardadas" />
                            <BotonSidebar href="#" icon="/svg/sidebar/courses.svg" label="Cursos" />
                            <BotonSidebar href="#" icon="/svg/sidebar/clock.svg" label="Actividad" />

                            <BotonSidebar
                                href="/chats"
                                icon="/svg/sidebar/chat.svg"
                                label="Chat"
                                unreadCount={count}
                            />

                            <hr className="bg-black" />

                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="flex items-center space-x-2 hover:bg-gray-100 pl-2 rounded w-full"
                            >
                                {showMore ? (
                                    <>
                                        <ChevronUp size={18} /> <span>Ver menos</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={18} /> <span>Ver más</span>
                                    </>
                                )}
                            </button>
                        </nav>
                    </aside>
                </div>
            )}
        </>
    );
}
