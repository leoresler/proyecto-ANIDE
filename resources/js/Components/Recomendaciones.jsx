import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { BookOpen, GraduationCap } from "lucide-react";

export default function Recomendaciones({ userType }) {
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

    // Si no hay recomendaciones, no mostrar nada
    if (
        !loading &&
        recomendaciones.materiales.length === 0 &&
        recomendaciones.instituciones.length === 0
    ) {
        return null;
    }

    return (
        <div className="bg-white rounded-3xl border shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                Te puede interesar
            </h3>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-start gap-3 animate-pulse"
                        >
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Materiales (Cursos y Carreras) */}
                    {recomendaciones.materiales.map((material) => (
                        <Link
                            key={`material-${material.id}`}
                            href={`/instituciones/${material.perf_institucion_id}`}
                            className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition group"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                                {material.tipo === "curso" ? (
                                    <BookOpen className="w-8 h-8 text-white" />
                                ) : (
                                    <GraduationCap className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition truncate">
                                    {material.nombre}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {material.institucion?.user?.nombre ||
                                        "Institución"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {material.tipo === "curso"
                                            ? "Curso"
                                            : "Carrera"}
                                    </span>
                                    {material.modalidad && (
                                        <span className="text-xs text-gray-400">
                                            {material.modalidad}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Instituciones */}
                    {recomendaciones.instituciones.map((institucion) => (
                        <Link
                            key={`institucion-${institucion.id}`}
                            href={`/instituciones/${institucion.id}`}
                            className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition group"
                        >
                            <img
                                src={
                                    institucion.foto ||
                                    "/images/default-avatar.png"
                                }
                                alt={institucion.nombre}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition truncate">
                                    {institucion.nombre}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                    {institucion.descripcion ||
                                        "Institución educativa"}
                                </p>
                                {institucion.tipo_institucion && (
                                    <span className="inline-block mt-1 text-xs text-gray-400">
                                        {institucion.tipo_institucion}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading &&
                (recomendaciones.materiales.length > 0 ||
                    recomendaciones.instituciones.length > 0) && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-400 text-center">
                            Basado en tus intereses
                        </p>
                    </div>
                )}
        </div>
    );
}
