import React, { useState, useEffect } from "react";
import { Head, router, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PublicacionCard from "@/Components/Publicacion/PublicacionCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";
import {
    MapPin,
    Globe,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    BookOpen,
    GraduationCap,
    Building2,
    FileText,
    Calendar,
    Users,
} from "lucide-react";
import axios from "axios";

// Componente para la info de la institución
function InfoTab({ institucion, auth, guardada, toggleUbicacion }) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const descripcion = institucion.descripcion || "Sin descripción disponible";
    const descripcionCorta =
        descripcion.length > 300 ? descripcion.substring(0, 300) + "..." : descripcion;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Card principal con información destacada */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-6">
                    {/* Foto de perfil */}
                    <div className="flex-shrink-0">
                        <img
                            src={
                                institucion.user?.profile_photo_url ||
                                "/profile-photos/default-avatar.webp"
                            }
                            alt={`Foto de perfil de ${institucion.nombre}`}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl shadow-lg border-4 border-white dark:border-gray-700"
                        />
                    </div>

                    {/* Información principal */}
                    <div className="flex-1 w-full text-center sm:text-left">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {institucion.nombre}
                                </h1>
                                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                                    {institucion.tipo_institucion || "Institución educativa"}
                                </p>
                            </div>

                            {/* Información de contacto */}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                                {institucion.direccion && (
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center justify-center w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm break-words">{institucion.direccion}</span>
                                    </div>
                                )}

                                {institucion.url_sitio_web && (
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <div className="flex items-center justify-center w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                                            <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                        </div>
                                        <a
                                            href={institucion.url_sitio_web}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                                        >
                                            Visitar sitio web
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Botones de acción */}
                            {auth.user?.id !== institucion.user_id && (
                                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                    <button
                                        onClick={toggleUbicacion}
                                        className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition w-full sm:w-auto"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm sm:text-base">
                                            {guardada ? "Ubicación guardada" : "Guardar ubicación"}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            router.post(route("chat.iniciar"), {
                                                institucion_id: institucion.id,
                                            });
                                        }}
                                        className="flex items-center justify-center gap-2 bg-edu-dark hover:bg-black text-white font-semibold px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition w-full sm:w-auto"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-sm sm:text-base">Iniciar chat</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Card de descripción */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Acerca de la institución
                </h2>
                <div className={`relative ${showFullDescription ? "max-h-96 overflow-y-auto pr-2 custom-scroll" : ""}`}>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {showFullDescription ? descripcion : descripcionCorta}
                    </p>
                </div>

                {descripcion.length > 300 && (
                    <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-4 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition"
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
    );
}

// Componente para mostrar publicaciones
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Sin publicaciones
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    Esta institución aún no ha compartido ninguna publicación
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
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
                <div ref={loaderRef}>
                    {isLoading && <LoadingSpinner />}
                </div>
            )}
        </div>
    );
}

// Componente para mostrar materiales (cursos y carreras)
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Sin cursos o carreras
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    Esta institución aún no ha publicado cursos o carreras
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                        <span>{material.duracion} meses</span>
                                    </div>
                                )}
                                {material.modalidad && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Users className="w-4 h-4 flex-shrink-0" />
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

// Componente para mostrar sedes
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
                <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Sin facultades o sedes
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    Esta institución aún no ha registrado facultades o sedes
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

// Componente Show (único export default)
export default function Show({
    institucion,
    publicaciones = [],
    residencias = [],
    materiales = [],
    auth,
    guardada: initialGuardada = false,
}) {
    const [activeTab, setActiveTab] = useState("info");
    const [guardada, setGuardada] = useState(initialGuardada);

    const toggleUbicacion = async () => {
        try {
            const res = await axios.post(route("ubicaciones.toggle"), {
                institucion_id: institucion.id,
            });
            setGuardada(res.data.guardada);
        } catch (err) {
            console.error(err);
        }
    };

    const tabs = [
        { id: "info", label: "Información", icon: FileText },
        { id: "publicaciones", label: "Publicaciones", icon: FileText },
        { id: "material", label: "Cursos y Carreras", icon: BookOpen },
        { id: "sedes", label: "Facultades / Sedes", icon: Building2 },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === tab.id
                                            ? "bg-edu-dark text-white shadow-md"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            }
        >
            <Head title={institucion.nombre} />

            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mb-8">
                {activeTab === "info" && (
                    <InfoTab
                        institucion={institucion}
                        auth={auth}
                        guardada={guardada}
                        toggleUbicacion={toggleUbicacion}
                    />
                )}

                {activeTab === "publicaciones" && (
                    <PublicacionesTab publicacionesInitial={publicaciones} auth={auth} />
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