import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    BookOpen,
    GraduationCap,
    Calendar,
    Monitor,
    Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";

export default function ListarMaterial({
    auth,
    materiales: materialesIniciales,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("todos");

    const [materialesFiltrados, setMaterialesFiltrados] = useState([]);

    const nextPageUrl = materialesIniciales.links?.find(
        (link) => link.label === "&raquo;"
    )?.url;
    const { loaderRef, isLoading } = useInfiniteScroll({ nextPageUrl });

    useEffect(() => {
        filtrarMateriales();
    }, [searchTerm, tipoFiltro, materialesIniciales.data]);

    const filtrarMateriales = () => {
        let filtrados = materialesIniciales.data;

        // Filtrar por tipo
        if (tipoFiltro !== "todos") {
            filtrados = filtrados.filter((m) => m.tipo === tipoFiltro);
        }

        // Filtrar por búsqueda
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            filtrados = filtrados.filter(
                (m) =>
                    m.nombre?.toLowerCase().includes(query) ||
                    m.contenido?.toLowerCase().includes(query) ||
                    m.categorias?.some((cat) =>
                        cat.toLowerCase().includes(query)
                    )
            );
        }

        setMaterialesFiltrados(filtrados);
    };

    const totalCursos = materialesIniciales.data.filter(
        (m) => m.tipo === "curso"
    ).length;
    const totalCarreras = materialesIniciales.data.filter(
        (m) => m.tipo === "carrera"
    ).length;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cursos y Carreras" />

            <div className="py-8 mb-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">
                            Cursos y Carreras
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Explora las opciones educativas disponibles
                        </p>
                    </div>

                    {/* Búsqueda y Filtros */}
                    <div className="bg-white dark:bg-edu-dark rounded-lg shadow-sm p-6 mb-6">
                        {/* Buscador */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Buscar por título, contenido o categorías..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filtros por tipo */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setTipoFiltro("todos")}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    tipoFiltro === "todos"
                                        ? "bg-edu-dark dark:bg-gray-500 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Todos ({materialesIniciales.data.length})
                            </button>
                            <button
                                onClick={() => setTipoFiltro("curso")}
                                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                                    tipoFiltro === "curso"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <BookOpen className="w-4 h-4" />
                                Cursos ({totalCursos})
                            </button>
                            <button
                                onClick={() => setTipoFiltro("carrera")}
                                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                                    tipoFiltro === "carrera"
                                        ? "bg-yellow-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <GraduationCap className="w-4 h-4" />
                                Carreras ({totalCarreras})
                            </button>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {materialesFiltrados.length === 0 ? (
                            <p>No se encontraron resultados</p>
                        ) : (
                            <p>
                                Mostrando {materialesFiltrados.length} de{" "}
                                {materialesIniciales.data.length} resultados
                            </p>
                        )}
                    </div>

                    {/* Grid de Materiales */}
                    {materialesFiltrados.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">
                                No se encontraron resultados
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Intenta con otros términos de búsqueda o cambia
                                los filtros
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {materialesFiltrados.map((material) => (
                                    <Link
                                        key={material.id}
                                        href={`/material/${material.id}`}
                                        className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
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
                                            {/* Institución */}
                                            {material.institucion && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <img
                                                        src={
                                                            material.foto_institucion
                                                        }
                                                        alt={
                                                            material.nombre_institucion
                                                        }
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-400 line-clamp-1">
                                                        {
                                                            material.nombre_institucion
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {/* Descripción */}
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                                {material.contenido}
                                            </p>

                                            {/* Detalles */}
                                            <div className="space-y-2 mb-4">
                                                {material.duracion && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {material.duracion}{" "}
                                                            meses
                                                        </span>
                                                    </div>
                                                )}
                                                {material.modalidad && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <Monitor className="w-4 h-4" />
                                                        <span>
                                                            {material.modalidad}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Categorías */}
                                            {material.categorias &&
                                                material.categorias.length >
                                                    0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {material.categorias
                                                            .slice(0, 3)
                                                            .map((cat, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-block px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs"
                                                                >
                                                                    {cat}
                                                                </span>
                                                            ))}
                                                        {material.categorias
                                                            .length > 3 && (
                                                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                                +
                                                                {material
                                                                    .categorias
                                                                    .length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-4 pb-4">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Publicado el{" "}
                                                {new Date(
                                                    material.created_at
                                                ).toLocaleDateString("es-ES")}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Loader para scroll infinito */}
                            {nextPageUrl && (
                                <div ref={loaderRef} className="mt-8">
                                    {isLoading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500">
                                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                                            <span className="text-sm">
                                                Scroll para cargar más
                                            </span>
                                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
