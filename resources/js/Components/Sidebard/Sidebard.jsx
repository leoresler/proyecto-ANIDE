import { router, usePage } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
import { ChevronDown, ChevronUp, X, Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import BotonSidebar from "./botonSidebard";

export default function Sidebar({ isOpen, onClose, unreadCount }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [count, setCount] = useState(unreadCount);
    const [showMore, setShowMore] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("darkMode") === "true";
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    useEffect(() => {
        setCount(unreadCount);
    }, [unreadCount]);

    useEffect(() => {
        const actualizar = () => {
            router.reload({ only: ["unreadCount"] });
        };

        window.addEventListener("mensaje-recibido", actualizar);
        window.addEventListener("nuevo-mensaje", actualizar);

        return () => {
            window.removeEventListener("mensaje-recibido", actualizar);
            window.removeEventListener("nuevo-mensaje", actualizar);
        };
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const UserProfile = () => (
        <a
            href="/profile"
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
            <img
                src={
                    user?.profile_photo_url ||
                    "/profile-photos/default-avatar.webp"
                }
                alt={user?.nombre || "Usuario"}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <span className="font-medium text-gray-900 dark:text-white">
                {(user?.nombre?.length > 20
                    ? user.nombre.substring(0, 20) + "..."
                    : user?.nombre) || "Mi Perfil"}
            </span>
        </a>
    );

    const DropdownContent = () => (
        <div className={`space-y-1 pl-4 mt-2 ${showMore ? "block" : "hidden"}`}>
            <button
                onClick={toggleDarkMode}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
                {darkMode ? (
                    <>
                        <Sun size={18} />
                        <span>Modo claro</span>
                    </>
                ) : (
                    <>
                        <Moon size={18} />
                        <span>Modo oscuro</span>
                    </>
                )}
            </button>

            <Dropdown.Link
                href={route("logout")}
                method="post"
                as="button"
                onClick={(e) => {
                    e.preventDefault();
                    router.post(
                        route("logout"),
                        {},
                        {
                            onFinish: () => window.location.reload(),
                        }
                    );
                }}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-600 dark:text-red-400"
            >
                <LogOut size={18} />
                <span>Cerrar sesión</span>
            </Dropdown.Link>
        </div>
    );

    return (
        <>
            {/* sidebar desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-gray-50 dark:bg-gray-800 p-4 h-[calc(100vh-64px)] sticky top-16 transition-colors">
                <nav className="space-y-2">
                    <UserProfile />
                    <hr className="mt-2 mb-6 border-gray-300 dark:border-gray-600" />

                    <BotonSidebar
                        href="/mis-carreras"
                        icon="/svg/sidebar/book.svg"
                        label="Carreras"
                    />
                    <BotonSidebar
                        href="/favoritos"
                        icon="/svg/sidebar/bookmark.svg"
                        label="Elementos Guardados"
                    />
                    <BotonSidebar
                        href="/ubicaciones"
                        icon="/svg/sidebar/location.svg"
                        label="Ubicaciones Guardadas"
                    />
                    <BotonSidebar
                        href="/mis-cursos"
                        icon="/svg/sidebar/courses.svg"
                        label="Cursos"
                    />
                    <BotonSidebar
                        href={route("actividad.index")}
                        icon="/svg/sidebar/clock.svg"
                        label="Actividad"
                    />
                    <BotonSidebar
                        href="/chats"
                        icon="/svg/sidebar/chat.svg"
                        label="Chat"
                        unreadCount={count}
                    />

                    <hr className="mt-2 mb-6 border-gray-300 dark:border-gray-600" />

                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg w-full text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        {showMore ? (
                            <>
                                <ChevronUp size={18} />
                                <span>Ver menos</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown size={18} />
                                <span>Ver más</span>
                            </>
                        )}
                    </button>

                    <DropdownContent />
                </nav>
            </aside>

            {/* sidebar móvil */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    ></div>

                    <aside className="relative w-64 bg-white dark:bg-gray-800 h-full shadow-xl z-50 p-4 overflow-y-auto transition-colors">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <nav className="space-y-2 mt-8">
                            <UserProfile />
                            <hr className="border-gray-200 dark:border-gray-600" />

                            <BotonSidebar
                                href="/mis-carreras"
                                icon="/svg/sidebar/book.svg"
                                label="Carreras"
                            />
                            <BotonSidebar
                                href="/favoritos"
                                icon="/svg/sidebar/bookmark.svg"
                                label="Elementos Guardados"
                            />
                            <BotonSidebar
                                href="/ubicaciones"
                                icon="/svg/sidebar/location.svg"
                                label="Ubicaciones Guardadas"
                            />
                            <BotonSidebar
                                href="/mis-cursos"
                                icon="/svg/sidebar/courses.svg"
                                label="Cursos"
                            />
                            <BotonSidebar
                                href={route("actividad.index")}
                                icon="/svg/sidebar/clock.svg"
                                label="Actividad"
                            />
                            <BotonSidebar
                                href="/chats"
                                icon="/svg/sidebar/chat.svg"
                                label="Chat"
                                unreadCount={count}
                            />

                            <hr className="border-gray-200 dark:border-gray-600" />

                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg w-full text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                {showMore ? (
                                    <>
                                        <ChevronUp size={18} />
                                        <span>Ver menos</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={18} />
                                        <span>Ver más</span>
                                    </>
                                )}
                            </button>

                            <DropdownContent />
                        </nav>
                    </aside>
                </div>
            )}
        </>
    );
}
