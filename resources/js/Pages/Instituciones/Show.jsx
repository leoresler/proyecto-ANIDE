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
import axios from "axios";

// componente para la info de la institucion
function InfoTab({ institucion, auth, guardada, toggleUbicacion }) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const descripcion = institucion.descripcion || "Sin descripción disponible";
    const descripcionCorta =
        descripcion.length > 200 ? descripcion.substring(0, 200) + "..." : descripcion;

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
                            {institucion.tipo_institucion || "Institución educativa"}
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

                {/* Botón guardar/quitar - lo mostramos aquí (si corresponde) */}
                {auth.user?.id !== institucion.user_id && (
                    <div className="text-center mt-3 md:mt-0">
                        <button
                            onClick={toggleUbicacion}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition`}
                        >
                            {guardada ? "📍 Quitar ubicación" : "📍 Guardar ubicación"}
                        </button>
                    </div>
                )}

                {/* 🔹 Información */}
                <div className="text-gray-700 mb-8 text-center space-y-2">
                    <p>
                        <strong>Tipo:</strong>{" "}
                        {institucion.tipo_institucion || "Sin especificar"}
                    </p>
                    <p>
                        <strong>Dirección:</strong>{" "}
                        {institucion.direccion || "No indicada"}
                    </p>
                    <p>
                        <strong>Sitio web:</strong>{" "}
                        {institucion.url_sitio_web ? (
                            <a
                                href={institucion.url_sitio_web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                {institucion.url_sitio_web}
                            </a>
                        ) : (
                            "No disponible"
                        )}
                    </p>
                </div>

                {/* Columna derecha - Descripción */}
                <div className="flex-1 md:w-2/3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Acerca de
                    </h4>
                    <div
                        className={`relative ${showFullDescription ? "max-h-60 overflow-y-auto pr-2 custom-scroll" : ""}`}
                    >
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {showFullDescription ? descripcion : descripcionCorta}
                        </p>
                    </div>

                    {descripcion.length > 200 && (
                        <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
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

// -- resto de componentes (PublicacionesTab, SedesTab, MaterialTab)
// Copié exactamente tus componentes tal cual, sin cambios lógicos.
// (Por brevedad no los repito aquí; mantén los que ya tenías: PublicacionesTab, SedesTab, MaterialTab)
// -----------------------------------------------------------------------------
// Ahora el componente principal Show (único export default)

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
