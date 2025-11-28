import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";

// footer (eliminar o cambiar a futuro por Footer.jsx)
function FooterLinks() {
    const links = [
        { label: "Condiciones de Servicio", href: "#" },
        { label: "Política de Privacidad", href: "#" },
        { label: "Política de cookies", href: "#" },
        { label: "Accesibilidad", href: "#" },
        {
            label: "Desarrollado por: leandroresler4@gmail.com y dante.avila",
            href: "#",
        },
    ];

    return (
        <div className="pt-4">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
                {links.map((link, index) => (
                    <span key={index} className="flex items-center">
                        <Link
                            href={link.href}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                        >
                            {link.label}
                        </Link>
                        {index < links.length - 1 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                                |
                            </span>
                        )}
                    </span>
                ))}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                © {new Date().getFullYear()} EDUQUÉN
            </p>
        </div>
    );
}

function SkeletonLoader() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Recomendaciones() {
    const [recomendaciones, setRecomendaciones] = useState({
        materiales: [],
        instituciones: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecomendaciones();
    }, []);

    const fetchRecomendaciones = async () => {
        try {
            const response = await fetch("/api/recomendaciones");
            const data = await response.json();
            setRecomendaciones(data);
        } catch (error) {
            console.error("Error al cargar recomendaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    const hasInstituciones = recomendaciones.instituciones.length > 0;
    const hasMateriales = recomendaciones.materiales.length > 0;
    const totalMateriales = recomendaciones.materiales.length;
    const materialesAMostrar = recomendaciones.materiales.slice(0, 3);
    const hayMasMateriales = totalMateriales > 3;

    return (
        <div className="sticky top-1 space-y-2">
            {/* Instituciones Recomendadas */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 transition-colors">
                <h3 className="mb-4 text-gray-500 dark:text-gray-400 font-medium">
                    Te puede interesar
                </h3>

                <hr className="mt-2 mb-6 border-gray-300 dark:border-gray-600" />

                {loading ? (
                    <SkeletonLoader />
                ) : hasInstituciones ? (
                    <div className="space-y-3">
                        {recomendaciones.instituciones.map((institucion) => (
                            <Link
                                key={`institucion-${institucion.id}`}
                                href={`/instituciones/${institucion.id}`}
                                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition group"
                            >
                                <img
                                    src={
                                        institucion.foto ||
                                        "/images/default-avatar.png"
                                    }
                                    alt={institucion.nombre}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                                        {institucion.nombre}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {institucion.tipo_institucion ||
                                            "Institución educativa"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No hay recomendaciones disponibles
                    </p>
                )}
            </div>

            {/* Cursos y Carreras */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 transition-colors">
                <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-4">
                    Cursos y Carreras
                </h3>

                <hr className="mt-2 mb-6 border-gray-300 dark:border-gray-600" />

                {loading ? (
                    <SkeletonLoader />
                ) : hasMateriales ? (
                    <>
                        <div className="space-y-3">
                            {materialesAMostrar.map((material) => (
                                <Link
                                    key={`material-${material.id}`}
                                    href={`/material/${material.id}`}
                                    className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition group"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                                            material.tipo === "curso"
                                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                                : "bg-gradient-to-br from-yellow-500 to-yellow-600"
                                        }`}
                                    >
                                        {material.tipo === "curso" ? (
                                            <BookOpen className="w-5 h-5 text-white" />
                                        ) : (
                                            <GraduationCap className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                                            {material.nombre}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {material.institucion?.user
                                                ?.nombre || "Institución"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {material.tipo === "curso"
                                                    ? "Curso"
                                                    : "Carrera"}
                                                {material.modalidad &&
                                                    ` · ${material.modalidad}`}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Botón Ver más */}
                        {hayMasMateriales && (
                            <Link
                                href="/material"
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors group"
                            >
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Ver más
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No hay cursos o carreras disponibles
                    </p>
                )}
            </div>

            {/* <hr className="mt-2 mb-6 border-gray-300 dark:border-gray-600" /> */}
            {/* Footer */}
            {/* <FooterLinks /> */}
        </div>
    );
}
