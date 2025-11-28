import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PublicacionCard from "@/Components/Publicacion/PublicacionCard";
import BarraBusqueda from "@/Components/BarraBusqueda/BarraBusqueda";
import { useState } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";

export default function Favoritos({ auth, favoritos, userType }) {
    const favoritosData = favoritos?.data || [];
    const favoritosLinks = favoritos?.links || [];
    const [publicacionesFiltradas, setPublicacionesFiltradas] = useState(null);

    const nextPageUrl = favoritosLinks.find(
        (link) => link.label === "&raquo;"
    )?.url;
    const { loaderRef, isLoading } = useInfiniteScroll({
        nextPageUrl: publicacionesFiltradas === null ? nextPageUrl : null, // Deshabilitar si hay filtro
    });

    const handleLike = (publicacionId) => {
        router.post(
            "/likes/toggle",
            {
                target_id: publicacionId,
                target_tipo: "publicacion",
            },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleFavorite = (publicacionId) => {
        router.post(
            "/favoritos/toggle",
            {
                publicacion_id: publicacionId,
            },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleBusquedaFavoritos = (resultados) => {
        setPublicacionesFiltradas(resultados);
    };

    const handleLimpiarFiltro = () => {
        setPublicacionesFiltradas(null);
    };

    // Determinar qué publicaciones mostrar
    const publicacionesAMostrar =
        publicacionesFiltradas !== null
            ? publicacionesFiltradas
            : favoritosData;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Favoritos" />

            <div className="py-6 mb-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        
                        {/* Barra de búsqueda para favoritos */}
                        <div className="flex justify-center shadow-md border rounded-full">
                            <BarraBusqueda
                                variant="favoritos"
                                publicaciones={favoritosData}
                                onBusqueda={handleBusquedaFavoritos}
                            />
                        </div>
                    </div>

                    {/* Indicador de filtro activo */}
                    {publicacionesFiltradas !== null && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                    />
                                </svg>
                                <span className="text-blue-800 font-medium text-sm">
                                    Mostrando {publicacionesAMostrar.length}{" "}
                                    {publicacionesAMostrar.length === 1
                                        ? "resultado"
                                        : "resultados"}
                                </span>
                            </div>
                            <button
                                onClick={handleLimpiarFiltro}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Limpiar filtro
                            </button>
                        </div>
                    )}

                    {/* Lista de publicaciones favoritas */}
                    <div className="space-y-6">
                        {publicacionesAMostrar.length === 0 &&
                        publicacionesFiltradas === null ? (
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                    />
                                </svg>
                                <p className="text-gray-500 dark:text-gray-300 text-lg mb-2">
                                    No tenés publicaciones guardadas todavía.
                                </p>
                                <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">
                                    Guardá publicaciones para verlas más tarde
                                </p>
                                <Link
                                    href="/inicio"
                                    className="mt-3 inline-block px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 font-medium dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Explorar publicaciones
                                </Link>
                            </div>
                        ) : publicacionesAMostrar.length === 0 &&
                          publicacionesFiltradas !== null ? (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <p className="text-gray-500 text-lg mb-2">
                                    No se encontraron resultados
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Intentá con otros términos de búsqueda
                                </p>
                            </div>
                        ) : (
                            publicacionesAMostrar.map((publicacion) => {
                                if (!publicacion) return null;
                                return (
                                    <PublicacionCard
                                        key={publicacion.id}
                                        publicacion={publicacion}
                                        userType={userType}
                                        onLike={handleLike}
                                        onFavorite={handleFavorite}
                                    />
                                );
                            })
                        )}
                    </div>

                    {/* Loader para scroll infinito - solo si no hay filtro activo */}
                    {publicacionesFiltradas === null && nextPageUrl && (
                        <div ref={loaderRef}>
                            {isLoading && <LoadingSpinner />}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
