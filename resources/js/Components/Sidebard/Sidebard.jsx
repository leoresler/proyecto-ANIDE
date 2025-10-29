import { Link } from "@inertiajs/react";
import { ChevronDown, X } from "lucide-react";
import BotonSidebar from "./botonSidebard";

export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* sidebard desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white p-4 h-[calc(100vh-64px)] sticky top-16">
                <nav className="space-y-2">
                    <BotonSidebar href="/profile" label="Perfil" />
                    <hr className="bg-black" />

                    <BotonSidebar
                        href="#"
                        icon="/svg/sidebar/book.svg"
                        label="Carreras"
                    />
                    <BotonSidebar
                        href="/favoritos"
                        icon="/svg/sidebar/bookmark.svg"
                        label="Elementos Guardados"
                    />
                    <BotonSidebar
                        href="#"
                        icon="/svg/sidebar/location.svg"
                        label="Ubicaciones Guardadas"
                    />
                    <BotonSidebar
                        href="#"
                        icon="/svg/sidebar/courses.svg"
                        label="Cursos"
                    />
                    <BotonSidebar
                        href="#"
                        icon="/svg/sidebar/clock.svg"
                        label="Actividad"
                    />
                    <hr className="bg-black" />
                    <Link
                        href="#"
                        className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded"
                    >
                        {" "}
                        <ChevronDown size={18} /> <span>Ver más</span>{" "}
                    </Link>
                </nav>
            </aside>

            {/* sidebard movil */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Fondo oscuro */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    ></div>

                    {/* Panel lateral */}
                    <aside className="relative w-64 bg-white h-full shadow-xl z-50 p-4 overflow-y-auto">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <nav className="space-y-2 mt-8">
                            <BotonSidebar href="#" label="Perfil" />
                            <hr className="bg-black" />

                            <BotonSidebar
                                href="#"
                                icon="/svg/sidebar/book.svg"
                                label="Carreras"
                            />
                            <BotonSidebar
                                href="#"
                                icon="/svg/sidebar/bookmark.svg"
                                label="Elementos Guardados"
                            />
                            <BotonSidebar
                                href="#"
                                icon="/svg/sidebar/location.svg"
                                label="Ubicaciones Guardadas"
                            />
                            <BotonSidebar
                                href="#"
                                icon="/svg/sidebar/courses.svg"
                                label="Cursos"
                            />
                            <BotonSidebar
                                href="#"
                                icon="/svg/sidebar/clock.svg"
                                label="Actividad"
                            />
                            <hr className="bg-black" />
                            <Link
                                href="#"
                                className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded"
                            >
                                {" "}
                                <ChevronDown size={18} /> <span>Ver más</span>{" "}
                            </Link>
                        </nav>
                    </aside>
                </div>
            )}
        </>
    );
}
