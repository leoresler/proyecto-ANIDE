import Dropdown from "@/Components/Dropdown";
import { Link, usePage, router } from "@inertiajs/react";
import BarraBusqueda from "../BarraBusqueda/BarraBusqueda";
import NavLink from "../NavLink";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../echo";

export default function Header({ onToggleSidebar }) {
    const { auth, notificacionesIniciales = [], notificacionesNoLeidasCount = 0 } = usePage().props;
    const user = auth?.user;

    const [notificaciones, setNotificaciones] = useState(notificacionesIniciales);
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const [contadorRojo, setContadorRojo] = useState(notificacionesNoLeidasCount);

    // Abrir dropdown y marcar notificaciones como leídas
    const abrirDropdown = async () => {
        setDropdownAbierto(true);

        if (contadorRojo > 0) {
            try {
                await axios.post(route('notificaciones.marcar-leidas'));
                setContadorRojo(0); // desaparecer punto rojo
            } catch (e) {
                console.error('Error al marcar notificaciones como leídas', e);
            }
        }
    };

    // Escucha nuevas notificaciones en tiempo real
    useEffect(() => {
        if (!user || !window.Echo) return;

        const canal = window.Echo.private(`user.${user.id}`);

        canal.listen('.ComentarioCreado', (data) => {
            setNotificaciones(prev => [data.comentario, ...prev]);
            setContadorRojo(prev => prev + 1); // actualizar contador rojo
        });
        canal.listen('.LikeCreado', (data) => {
            console.log("📌 LIKE RECIBIDO:", data);
            setNotificaciones(prev => [data.like, ...prev]);
            setContadorRojo(prev => prev + 1);
        });

        return () => {
            window.Echo.leave(`user.${user.id}`);
        };
    }, [user]);

    return (
        <header className="bg-[#243746] text-white sticky top-0 z-50">
            <nav className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/inicio" className="flex items-center">
                        <img
                            src="/images/logo-navbar-eduquen.webp"
                            alt="EDUQUÉN"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center space-x-8 gap-2">
                        <NavLink href={route("inicio")} active={route().current("inicio")}>
                            <img src="/svg/header/home1.svg" alt="Inicio" className="h-6 w-6"/>
                        </NavLink>
                        <NavLink href={route("mapa.index")} active={route().current("mapa.index")}>
                            <img src="/svg/header/Map.svg" alt="Mapa" className="h-6 w-6"/>
                        </NavLink>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="hidden md:flex mx-6">
                            <BarraBusqueda variant="global" />
                        </div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    className="relative inline-flex items-center rounded-full p-2"
                                    onClick={abrirDropdown}
                                >
                                    <img src="/svg/header/Vector.svg" alt="Notificaciones" className="h-6 w-6" />
                                    {contadorRojo > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                            {contadorRojo}
                                        </span>
                                    )}
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content className="w-80 max-h-96 overflow-y-auto">
                                <Dropdown.Link href={route("profile.edit")}>Perfil</Dropdown.Link>
                                <Dropdown.Link href={route("logout")} method="post" as="button">
                                    Cerrar sesión
                                </Dropdown.Link>
                                <hr className="my-2 border-gray-300" />

                                <div className="max-h-96 overflow-y-auto">
                                    {notificaciones.length === 0 ? (
                                        <p className="px-4 py-2 text-gray-500">Sin notificaciones</p>
                                    ) : (
                                        // Mapear notificaciones
                                    notificaciones.map(notif => {
                                        // Detectar si es comentario o like
                                        const esComentario = notif.type?.includes("ComentarioCreadoNotification");
                                        const esLike = notif.type?.includes("LikeCreadoNotification");

                                        // Datos de usuario
                                        const usuarioNombre = notif.data?.usuario_nombre ?? notif.data?.name ?? 'Usuario desconocido';
                                        const usuarioFoto = notif.data?.usuario_foto ?? '/images/default-avatar.png';

                                        // Mensaje
                                        const mensaje = esComentario ? "comentó tu publicación" : esLike ? "le gusta tu publicación" : "";

                                        return (
                                            <Link
                                                key={notif.id}
                                                href={`/publicaciones/${notif.data?.publicacion_id ?? notif.data?.like_id}`}
                                                className="block px-4 py-2 border-b last:border-b-0 hover:bg-gray-100"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <img src={usuarioFoto} alt="Foto usuario" className="w-10 h-10 rounded-full object-cover"/>
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 font-semibold text-sm">{usuarioNombre} {mensaje}</p>
                                                        {(esComentario) && (
                                                            <p className="text-gray-700 text-sm truncate">{notif.data?.contenido ?? "Sin contenido"}</p>
                                                        )}
                                                        <p className="text-gray-400 text-xs">
                                                            {notif.created_at ? new Date(notif.created_at).toLocaleString() : new Date().toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })

                                    )}
                                </div>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    {/* Busqueda movil */}
                    <div className="flex-1 px-4 md:hidden">
                        <div className="max-w-xs mx-auto">
                            <BarraBusqueda variant="global" />
                        </div>
                    </div>

                    {/* Botón menú móvil */}
                    <div className="md:hidden">
                        <button
                            onClick={onToggleSidebar}
                            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10"
                        >
                            <img src="/svg/header/Group.svg" alt="Menu" className="h-6 w-6"/>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
);

}
