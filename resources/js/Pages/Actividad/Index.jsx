import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Heart,
    MessageCircle,
    Eye,
    Bookmark,
    BookmarkX,
    ThumbsDown,
    Share2,
    Clock,
    BookOpen,
    GraduationCap,
    FileText,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import LoadingSpinner from "@/Components/LoadingSpinner";

// Configuración de iconos y colores según tipo de actividad
const activityConfig = {
    like: {
        icon: Heart,
        color: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        label: "Te gustó",
    },
    unlike: {
        icon: ThumbsDown,
        color: "text-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-800",
        label: "Quitaste like",
    },
    comentario: {
        icon: MessageCircle,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        label: "Comentaste",
    },
    vista: {
        icon: Eye,
        color: "text-purple-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        label: "Viste",
    },
    favorito: {
        icon: Bookmark,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        label: "Guardaste en favoritos",
    },
    dejar_favorito: {
        icon: BookmarkX,
        color: "text-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-800",
        label: "Quitaste de favoritos",
    },
    guardado: {
        icon: Bookmark,
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        label: "Guardaste",
    },
    quitar_guardado: {
        icon: BookmarkX,
        color: "text-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-800",
        label: "Quitaste de guardados",
    },
    compartido: {
        icon: Share2,
        color: "text-indigo-500",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        label: "Compartiste",
    },
};

// Componente para cada tarjeta de actividad
function ActividadCard({ actividad }) {
    const config = activityConfig[actividad.tipo] || activityConfig.vista;
    const Icon = config.icon;

    const getUrl = () => {
        if (actividad.modelo === "publicacion") {
            return `/publicaciones/${actividad.modelo_id}`;
        } else if (actividad.modelo === "material") {
            return `/material/${actividad.modelo_id}`;
        } else if (actividad.modelo === "institucion") {
            return `/instituciones/${actividad.modelo_id}`;
        }
        return "#";
    };

    const getTitulo = () => {
        if (actividad.objeto) {
            if (actividad.modelo === "publicacion") {
                return actividad.objeto.titulo || "Publicación";
            } else if (actividad.modelo === "material") {
                return actividad.objeto.nombre || "Curso/Carrera";
            } else if (actividad.modelo === "institucion") {
                return actividad.objeto.nombre || "Institución";
            }
        }
        return "Contenido eliminado";
    };

    const getInstitucion = () => {
        if (actividad.objeto && actividad.objeto.institucion) {
            return (
                actividad.objeto.institucion.user?.nombre ||
                actividad.objeto.institucion.nombre
            );
        }
        return null;
    };

    const getTipoIcono = () => {
        if (actividad.modelo === "material") {
            return actividad.objeto?.tipo === "curso"
                ? BookOpen
                : GraduationCap;
        }
        return FileText;
    };

    const TipoIcono = getTipoIcono();

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const ahora = new Date();
        const diff = ahora - date;
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(diff / 3600000);
        const dias = Math.floor(diff / 86400000);

        if (minutos < 1) return "Justo ahora";
        if (minutos < 60) return `Hace ${minutos}m`;
        if (horas < 24) return `Hace ${horas}h`;
        if (dias < 7) return `Hace ${dias}d`;
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
        });
    };

    if (!actividad.objeto) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 opacity-60">
                <div className="flex items-start gap-3">
                    <div
                        className={`p-2 rounded-full ${config.bgColor} flex-shrink-0`}
                    >
                        <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {config.label} • Contenido eliminado
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatearFecha(actividad.created_at)}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={getUrl()}
            className="block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
        >
            <div className="flex items-start gap-3">
                {/* Icono de tipo de actividad */}
                <div
                    className={`p-2 rounded-full ${config.bgColor} flex-shrink-0`}
                >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {config.label}
                            </p>
                            <div className="flex items-center gap-2 mb-1">
                                <TipoIcono className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                    {getTitulo()}
                                </h4>
                            </div>
                            {getInstitucion() && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {getInstitucion()}
                                </p>
                            )}
                            {actividad.tipo === "comentario" &&
                                actividad.metadata?.comentario && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 italic">
                                        "{actividad.metadata.comentario}"
                                    </p>
                                )}
                        </div>

                        {/* Fecha */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{formatearFecha(actividad.created_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Index({ auth, actividades: actividadesIniciales }) {
    const [actividades, setActividades] = useState(actividadesIniciales.data);
    const [nextPageUrl, setNextPageUrl] = useState(
        actividadesIniciales.next_page_url
    );
    const [isLoading, setIsLoading] = useState(false);
    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextPageUrl && !isLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [nextPageUrl, isLoading]);

    const loadMore = async () => {
        if (!nextPageUrl || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(nextPageUrl);
            const data = await response.json();

            setActividades((prev) => [...prev, ...data.data]);
            setNextPageUrl(data.next_page_url);
        } catch (error) {
            console.error("Error al cargar más actividades:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mi Actividad" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Mi Actividad
                        </h1>
                    </div>

                    {/* Lista de actividades */}
                    {actividades.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
                            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-gray-500 dark:text-gray-300 text-lg mb-2">
                                Aún no tenés actividad
                            </h3>
                            <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">
                                Comenzá a explorar contenido para ver tu
                                historial acá
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {actividades.map((actividad) => (
                                <ActividadCard
                                    key={actividad.id}
                                    actividad={actividad}
                                />
                            ))}

                            {/* Loader para scroll infinito */}
                            {nextPageUrl && (
                                <div ref={loaderRef} className="py-4">
                                    {isLoading && <LoadingSpinner />}
                                </div>
                            )}

                            {!nextPageUrl && actividades.length > 0 && (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Llegaste al final de tu actividad
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
