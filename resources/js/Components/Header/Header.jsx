import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import BarraBusqueda from "../BarraBusqueda/BarraBusqueda";
import NavLink from "../NavLink";
import { useEffect, useState, memo} from "react";
import axios from "axios";
import "../../echo";

export default function Header({ onToggleSidebar }) {
    const {
        auth,
        notificacionesIniciales = [],
        notificacionesNoLeidasCount = 0,
    } = usePage().props;
    // console.log("📦 NOTIFICACIONES INICIALES:", notificacionesIniciales);
    const user = auth?.user;

    const [notificaciones, setNotificaciones] = useState(
        notificacionesIniciales
    );
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const [contadorRojo, setContadorRojo] = useState(
        notificacionesNoLeidasCount
    );

    // Abrir dropdown y marcar notificaciones como leídas
    const abrirDropdown = async () => {
        setDropdownAbierto(true);

        if (contadorRojo > 0) {
            try {
                await axios.post(route("notificaciones.marcar-leidas"));
                setContadorRojo(0); // desaparecer punto rojo
            } catch (e) {
                console.error("Error al marcar notificaciones como leídas", e);
            }
        }
    };

    // Escucha nuevas notificaciones en tiempo real
    useEffect(() => {
        if (!user || !window.Echo) return;

        const canal = window.Echo.private(`user.${user.id}`);

        canal.listen(".ComentarioCreado", (data) => {
            console.log("📌 COMENTARIO RECIBIDO:", data);
            setNotificaciones((prev) => [
                {
                    id: data.comentario.id,
                    type: "App\\Notifications\\ComentarioCreadoNotification",
                    created_at: data.comentario.created_at,
                    data: {
                        tipo: "comentario",
                        publicacion_id: data.comentario.publicacion_id,
                        contenido: data.comentario.contenido,
                        usuario: data.comentario.usuario,
                    },
                },
                ...prev,
            ]);

            setContadorRojo((prev) => prev + 1); // actualizar contador rojo
        });

        canal.listen(".LikeCreado", (data) => {
            setNotificaciones((prev) => [
                {
                    id: data.like.id,
                    type: "App\\Notifications\\LikeCreadoNotification",
                    created_at: data.like.created_at,
                    data: {
                        tipo: "like",
                        publicacion_id: data.like.publicacion_id,
                        target_tipo: data.like.target_tipo,
                        usuario: data.like.usuario,
                    },
                },
                ...prev,
            ]);

            setContadorRojo((prev) => prev + 1);
        });

        canal.listen(".RespuestaComentario", (data) => {

            setNotificaciones((prev) => [
                {
                    id: data.comentario.id,
                    type: "App\\Notifications\\RespuestaComentarioNotification",
                    created_at: data.comentario.created_at,
                    data: {
                        tipo: "respuesta",
                        publicacion_id: data.comentario.publicacion_id,
                        contenido: data.comentario.contenido,
                        usuario: data.comentario.usuario,
                        coment_padre_id: data.comentario.coment_padre_id,
                    },
                },
                ...prev,
            ]);

            setContadorRojo((prev) => prev + 1);
        });

        canal.listen(".UbicacionGuardada", (data) => {
            setNotificaciones((prev) => [
                {
                    id: data.publicacion_id, // usar id de la publicación como identificador
                    type: "App\\Notifications\\UbicacionGuardadaNotification",
                    created_at: data.created_at,
                    data: {
                        tipo: "publicacion",
                        publicacion_id: data.publicacion_id,
                        institucion_id: data.institucion_id,
                        mensaje: data.mensaje,
                        usuario: data.usuario,
                    },
                },
                ...prev,
            ]);

            setContadorRojo((prev) => prev + 1);
        });

        return () => {
            window.Echo.leave(`user.${user.id}`);
        };
    }, [user]);

    // Componente reutilizable para renderizar una notificación
    const NotificacionItem = memo(({ notif }) => {
        // Determinar tipo de notificación
        let tipo = notif.data?.tipo ?? null;
        if (!tipo && notif.type) {
            if (notif.type.includes("LikeCreadoNotification")) tipo = "like";
            else if (notif.type.includes("ComentarioCreadoNotification"))
                tipo = "comentario";
            else if (notif.type.includes("RespuestaComentarioNotification"))
                tipo = "respuesta";
        }

        const esLike = tipo === "like";
        const esComentario = tipo === "comentario";
        const esRespuesta = tipo === "respuesta";
        const esPublicacion = tipo === "publicacion";

        const usuario = notif.data?.usuario ?? {};
        const usuarioNombre =
            usuario.nombre ?? usuario.name ?? "Usuario desconocido";
        const usuarioFoto = usuario.foto && usuario.foto.trim() !== "" 
        ? usuario.foto 
        : "/storage/profile-photos/default-avatar.webp";

        // Mensaje según tipo
        let mensaje = "";
        if (esComentario) {
            mensaje = "comentó tu publicación";
        } else if (esLike) {
            const targetTipo = notif.data?.target_tipo;
            if (targetTipo === 'comentario') {
                mensaje = "le gusta tu comentario";
            } else {
                mensaje = "le gusta tu publicación";
            }
        } else if (esRespuesta) {
            mensaje = "respondió a tu comentario";
        } else if (esPublicacion) {
            mensaje = notif.data?.mensaje ?? "ha publicado algo";
        }

        return (
            <Link
                href={`/publicaciones/${
                    notif.data?.publicacion_id ?? notif.data?.like_id
                }`}
                className="block px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-start gap-3">
                    <img
                        src={usuarioFoto}
                        alt="Foto usuario"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-semibold text-sm">
                            {usuarioNombre}{" "}
                            <span className="font-normal text-gray-700 dark:text-gray-300">
                                {mensaje}
                            </span>
                        </p>
                        {(esComentario || esRespuesta) && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm truncate mt-1">
                                "{notif.data?.contenido ?? "Sin contenido"}"
                            </p>
                        )}
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                            {notif.created_at
                                ? new Date(notif.created_at).toLocaleString(
                                      "es-AR",
                                      {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      }
                                  )
                                : new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            </Link>
        );
    });

    // Agregar displayName para debugging
    NotificacionItem.displayName = 'NotificacionItem';

    return (
        <header className="bg-edu-dark text-white sticky top-0 z-50">
            <nav className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/inicio" className="flex items-center">
                        <img
                            src="/images/logo-navbar-eduquen.webp"
                            alt="EDUQUÉN"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Links para desktop */}
                    <div className="hidden md:flex items-center space-x-8 gap-2">
                        <NavLink
                            href={route("inicio")}
                            active={route().current("inicio")}
                        >
                            <img
                                src="/svg/header/home1.svg"
                                alt="Inicio"
                                className="h-6 w-6"
                            />
                        </NavLink>
                        <NavLink
                            href={route("mapa.index")}
                            active={route().current("mapa.index")}
                        >
                            <img
                                src="/svg/header/Map.svg"
                                alt="Mapa"
                                className="h-6 w-6"
                            />
                        </NavLink>
                    </div>

                    {/* Acciones desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="hidden md:flex mx-6">
                            <BarraBusqueda variant="global" />
                        </div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    className="relative inline-flex items-center rounded-full p-2 hover:bg-white/10 transition-colors"
                                    onClick={abrirDropdown}
                                >
                                    <img
                                        src="/svg/header/Vector.svg"
                                        alt="Notificaciones"
                                        className="h-6 w-6"
                                    />
                                    {contadorRojo > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                            {contadorRojo}
                                        </span>
                                    )}
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content className="w-80 max-h-96 overflow-y-auto">
                                <div className="py-2">
                                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-900 border-b border-gray-300">
                                        Notificaciones
                                    </h3>
                                    {notificaciones.length === 0 ? (
                                        <p className="px-4 py-8 text-center text-gray-600 text-sm">
                                            No tenés notificaciones
                                        </p>
                                    ) : (
                                        <div className="max-h-80 overflow-y-auto">
                                            {notificaciones.map((notif) => (
                                                <NotificacionItem
                                                    key={notif.id}
                                                    notif={notif}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    {/* Mobile: solo logo y notificaciones */}
                    <div className="flex md:hidden items-center gap-2">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    className="relative inline-flex items-center rounded-full p-2 hover:bg-white/10 transition-colors"
                                    onClick={abrirDropdown}
                                >
                                    <img
                                        src="/svg/header/Vector.svg"
                                        alt="Notificaciones"
                                        className="h-6 w-6"
                                    />
                                    {contadorRojo > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                            {contadorRojo}
                                        </span>
                                    )}
                                </button>
                            </Dropdown.Trigger>

                            {/* Dropdown mobile */}
                            <Dropdown.Content className="w-[calc(100vw-2rem)] max-w-md right-0 left-auto">
                                <div className="py-2">
                                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">
                                        Notificaciones
                                    </h3>
                                    {notificaciones.length === 0 ? (
                                        <p className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            No tienes notificaciones
                                        </p>
                                    ) : (
                                        <div className="max-h-[70vh] overflow-y-auto">
                                            {notificaciones.map((notif) => (
                                                <NotificacionItem
                                                    key={notif.id}
                                                    notif={notif}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </nav>
        </header>
    );
}