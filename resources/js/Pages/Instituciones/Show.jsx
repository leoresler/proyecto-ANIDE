import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PublicacionCard from "@/Components/Publicacion/PublicacionCard";
import {
    MapPin,
    Globe,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    BookOpen,
    GraduationCap,
    Calendar,
    Monitor,
} from "lucide-react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";

// componente para la info de la institucion
function InfoTab({ institucion, auth }) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const descripcion = institucion.descripcion || "Sin descripción disponible";
    const descripcionCorta =
        descripcion.length > 200
            ? descripcion.substring(0, 200) + "..."
            : descripcion;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Columna izquierda - Foto y datos */}
                <div className="flex flex-col items-center md:items-start md:w-1/3">
                    <img
                        src={
                            institucion.user?.profile_photo_url ||
                            "/profile-photos/default-avatar.webp"
                        }
                        alt={`Foto de perfil de ${institucion.nombre}`}
                        className="w-32 h-32 object-cover rounded-full shadow-lg border-4 border-white dark:border-gray-700"
                    />

                    <div className="mt-4 text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {institucion.nombre}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {institucion.tipo_institucion ||
                                "Institución educativa"}
                        </p>
                    </div>

                    <div className="mt-4 space-y-2 text-center md:text-left w-full">
                        {institucion.direccion && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{institucion.direccion}</span>
                            </div>
                        )}

                        {institucion.url_sitio_web && (
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                                <a
                                    href={institucion.url_sitio_web}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Sitio Web
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Botón de chat */}
                    {auth.user?.id !== institucion.user_id && (
                        <button
                            onClick={() => {
                                router.post(route("chat.iniciar"), {
                                    institucion_id: institucion.id,
                                });
                            }}
                            className="mt-4 w-full md:w-auto flex items-center justify-center gap-2 bg-edu-dark hover:bg-black text-white font-semibold px-5 py-2 rounded-lg shadow transition"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Iniciar chat
                        </button>
                    )}
                </div>

                {/* Columna derecha - Descripción */}
                <div className="flex-1 md:w-2/3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Acerca de
                    </h4>
                    <div
                        className={`relative ${
                            showFullDescription
                                ? "max-h-60 overflow-y-auto pr-2 custom-scroll"
                                : ""
                        }`}
                    >
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {showFullDescription
                                ? descripcion
                                : descripcionCorta}
                        </p>
                    </div>

                    {descripcion.length > 200 && (
                        <button
                            onClick={() =>
                                setShowFullDescription(!showFullDescription)
                            }
                            className="mt-3 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition"
                        >
                            {showFullDescription ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    Mostrar menos
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    Mostrar más
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// componente para las publicaciones
function PublicacionesTab({ publicacionesInitial, auth }) {
    const [publicaciones, setPublicaciones] = useState(
        publicacionesInitial?.data || []
    );

    useEffect(() => {
        setPublicaciones(publicacionesInitial?.data || []);
    }, [publicacionesInitial]);

    const { loaderRef, isLoading } = useInfiniteScroll({
        nextPageUrl: publicacionesInitial?.next_page_url,
        onLoadMore: () => {
            if (publicacionesInitial?.data) {
                setPublicaciones((prev) => {
                    const newItems = publicacionesInitial.data.filter(
                        (newItem) =>
                            !prev.some((item) => item.id === newItem.id)
                    );
                    return [...prev, ...newItems];
                });
            }
        },
    });

    if (publicaciones.length === 0 && !isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors">
                <p className="text-gray-500 dark:text-gray-400">
                    Esta institución aún no tiene publicaciones.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {publicaciones.map((publicacion) => (
                <PublicacionCard
                    key={publicacion.id}
                    publicacion={publicacion}
                    userType={auth.user?.tipo_usuario}
                    auth={auth}
                />
            ))}

            {/* Loader para scroll infinito */}
            {publicacionesInitial?.next_page_url && (
                <div ref={loaderRef}>{isLoading && <LoadingSpinner />}</div>
            )}
        </div>
    );
}

// componente para sedes, residencias, etc.
function SedesTab({ residenciasInitial }) {
    const [residencias, setResidencias] = useState(
        residenciasInitial?.data || []
    );
    const [expandedCards, setExpandedCards] = useState({});

    useEffect(() => {
        setResidencias(residenciasInitial?.data || []);
    }, [residenciasInitial]);

    const { loaderRef, isLoading } = useInfiniteScroll({
        nextPageUrl: residenciasInitial?.next_page_url,
        onLoadMore: () => {
            if (residenciasInitial?.data) {
                setResidencias((prev) => {
                    const newItems = residenciasInitial.data.filter(
                        (newItem) =>
                            !prev.some((item) => item.id === newItem.id)
                    );
                    return [...prev, ...newItems];
                });
            }
        },
    });

    const toggleExpanded = (id) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    if (residencias.length === 0 && !isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors">
                <p className="text-gray-500 dark:text-gray-400">
                    Esta institución aún no tiene sedes o facultades
                    registradas.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {residencias.map((res) => {
                    const isExpanded = expandedCards[res.id];
                    const infoTooLong =
                        res.info_adicional && res.info_adicional.length > 100;

                    return (
                        <div
                            key={res.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors hover:shadow-lg"
                        >
                            <img
                                src={
                                    res.foto_portada
                                        ? `/storage/${res.foto_portada}`
                                        : "/images/residencia-default.jpg"
                                }
                                alt={res.nombre}
                                className="w-full h-40 object-cover"
                            />

                            <div className="p-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    {res.nombre}
                                </h4>

                                <div className="space-y-2 mb-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            📍 Dirección:
                                        </span>
                                        <br />
                                        {res.direccion ||
                                            "Dirección no especificada"}
                                    </p>

                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            👥 Capacidad:
                                        </span>
                                        <br />
                                        {res.capacidad || "N/A"}
                                    </p>

                                    {res.contacto && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                📞 Contacto:
                                            </span>
                                            <br />
                                            {res.contacto}
                                        </p>
                                    )}
                                </div>

                                {res.info_adicional && (
                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">
                                                ℹ️ Información adicional:
                                            </span>
                                            <span
                                                className={
                                                    !isExpanded && infoTooLong
                                                        ? "line-clamp-3"
                                                        : "block break-words"
                                                }
                                            >
                                                {res.info_adicional}
                                            </span>
                                        </p>

                                        {infoTooLong && (
                                            <button
                                                onClick={() =>
                                                    toggleExpanded(res.id)
                                                }
                                                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors mt-2"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        Ver menos
                                                        <ChevronUp className="w-4 h-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Ver más
                                                        <ChevronDown className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Loader para scroll infinito */}
            {residenciasInitial?.next_page_url && (
                <div ref={loaderRef} className="mt-6">
                    {isLoading && <LoadingSpinner />}
                </div>
            )}
        </>
    );
}

// componente para cursos y carreras
function MaterialTab({ materialesInitial }) {
    const [materiales, setMateriales] = useState(materialesInitial?.data || []);

    useEffect(() => {
        setMateriales(materialesInitial?.data || []);
    }, [materialesInitial]);

    const { loaderRef, isLoading } = useInfiniteScroll({
        nextPageUrl: materialesInitial?.next_page_url,
        onLoadMore: () => {
            if (materialesInitial?.data) {
                setMateriales((prev) => {
                    const newItems = materialesInitial.data.filter(
                        (newItem) =>
                            !prev.some((item) => item.id === newItem.id)
                    );
                    return [...prev, ...newItems];
                });
            }
        },
    });

    if (materiales.length === 0 && !isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors">
                <p className="text-gray-500 dark:text-gray-400">
                    Esta institución aún no tiene cursos o carreras publicados.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materiales.map((material) => (
                    <Link
                        key={material.id}
                        href={`/material/${material.id}`}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg group"
                    >
                        {/* Header con color según tipo */}
                        <div
                            className={`p-4 ${
                                material.tipo === "curso"
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                    : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {material.tipo === "curso" ? (
                                    <BookOpen className="w-5 h-5 text-white" />
                                ) : (
                                    <GraduationCap className="w-5 h-5 text-white" />
                                )}
                                <span className="text-xs font-semibold text-white uppercase">
                                    {material.tipo}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:underline">
                                {material.nombre}
                            </h3>
                        </div>

                        {/* Contenido */}
                        <div className="p-4">
                            {/* Descripción */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                {material.contenido}
                            </p>

                            {/* Detalles */}
                            <div className="space-y-2 mb-4">
                                {material.duracion && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>{material.duracion} meses</span>
                                    </div>
                                )}
                                {material.modalidad && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Monitor className="w-4 h-4" />
                                        <span>{material.modalidad}</span>
                                    </div>
                                )}
                            </div>

                            {/* Categorías */}
                            {material.categorias &&
                                material.categorias.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {material.categorias
                                            .slice(0, 3)
                                            .map((cat, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                        {material.categorias.length > 3 && (
                                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                +
                                                {material.categorias.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Loader para scroll infinito */}
            {materialesInitial?.next_page_url && (
                <div ref={loaderRef} className="mt-6">
                    {isLoading && <LoadingSpinner />}
                </div>
            )}
        </>
    );
}

export default function Show({
    institucion,
    publicaciones = [],
    residencias = [],
    materiales = [],
    auth,
}) {
    const [activeTab, setActiveTab] = useState("info");

    const tabs = [
        { id: "info", label: "Información" },
        { id: "publicaciones", label: "Publicaciones" },
        { id: "material", label: "Cursos y Carreras" },
        { id: "sedes", label: "Facultades / Sedes" },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? "bg-edu-dark text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <Head title={institucion.nombre} />

            <div className="max-w-4xl mx-auto py-6 mb-8">
                {/* Contenido según tab activo */}
                {activeTab === "info" && (
                    <InfoTab institucion={institucion} auth={auth} />
                )}

                {activeTab === "publicaciones" && (
                    <PublicacionesTab
                        publicacionesInitial={publicaciones}
                        auth={auth}
                        institucionId={institucion.id}
                    />
                )}

                {activeTab === "material" && (
                    <MaterialTab materialesInitial={materiales} />
                )}

                {activeTab === "sedes" && (
                    <SedesTab residenciasInitial={residencias} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
