import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PublicacionCard from "@/Components/Publicacion/PublicacionCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll.js";

export default function BusquedaIndex({
    auth,
    query,
    publicaciones: publicacionesInitial,
    instituciones: institucionesInitial,
    userType,
}) {
    // Estado para acumular resultados
    const [publicacionesData, setPublicacionesData] = useState(
        publicacionesInitial?.data || []
    );
    const [institucionesData, setInstitucionesData] = useState(
        institucionesInitial?.data || []
    );

    // Actualizar cuando cambien los props (por ejemplo, nueva búsqueda)
    useEffect(() => {
        setPublicacionesData(publicacionesInitial?.data || []);
        setInstitucionesData(institucionesInitial?.data || []);
    }, [query]);

    // Hook para scroll infinito de publicaciones
    const { loaderRef: pubLoaderRef, isLoading: isLoadingPub } =
        useInfiniteScroll({
            nextPageUrl: publicacionesInitial?.next_page_url,
            onLoadMore: () => {
                // Agregar nuevas publicaciones sin duplicar
                if (publicacionesInitial?.data) {
                    setPublicacionesData((prev) => {
                        const newItems = publicacionesInitial.data.filter(
                            (newItem) =>
                                !prev.some((item) => item.id === newItem.id)
                        );
                        return [...prev, ...newItems];
                    });
                }
            },
        });

    // Hook para scroll infinito de instituciones
    const { loaderRef: instLoaderRef, isLoading: isLoadingInst } =
        useInfiniteScroll({
            nextPageUrl: institucionesInitial?.next_page_url,
            onLoadMore: () => {
                // Agregar nuevas instituciones sin duplicar
                if (institucionesInitial?.data) {
                    setInstitucionesData((prev) => {
                        const newItems = institucionesInitial.data.filter(
                            (newItem) =>
                                !prev.some((item) => item.id === newItem.id)
                        );
                        return [...prev, ...newItems];
                    });
                }
            },
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

    const totalResultados = publicacionesData.length + institucionesData.length;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Buscar: ${query}`} />

            <div className="py-4 bg-white dark:bg-gray-800 min-h-screen mb-8 border dark:border-gray-700 rounded-lg">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Encabezado */}
                    <div className="mb-8 bg-white dark:bg-gray-700 border-b-2 dark:border-gray-500 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <svg
                                className="w-6 h-6 text-blue-600 flex-shrink-0"
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
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                Resultados de búsqueda
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-9">
                            Buscando:{" "}
                            <span className="font-semibold text-blue-600">
                                "{query}"
                            </span>
                        </p>
                        <div className="mt-3 ml-9">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    totalResultados > 0
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {totalResultados}{" "}
                                {totalResultados === 1
                                    ? "resultado encontrado"
                                    : "resultados encontrados"}
                            </span>
                        </div>
                    </div>

                    {/* Resultados */}
                    {totalResultados === 0 ? (
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <svg
                                    className="mx-auto h-16 w-16 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    No se encontraron resultados
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    No pudimos encontrar nada para "{query}"
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Intentá con otros términos de búsqueda o
                                    revisá la ortografía
                                </p>
                                <div className="mt-6 flex gap-3 justify-center">
                                    <Link
                                        href="/inicio"
                                        className="inline-flex items-center px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                            />
                                        </svg>
                                        Volver al inicio
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Publicaciones */}
                            {publicacionesData.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                            Publicaciones
                                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                ({publicacionesData.length})
                                            </span>
                                        </h2>
                                    </div>
                                    <div className="space-y-6">
                                        {publicacionesData.map(
                                            (publicacion) => (
                                                <PublicacionCard
                                                    key={publicacion.id}
                                                    publicacion={publicacion}
                                                    userType={userType}
                                                    onLike={handleLike}
                                                    onFavorite={handleFavorite}
                                                />
                                            )
                                        )}
                                    </div>

                                    {/* Loader para scroll infinito de publicaciones */}
                                    {publicacionesInitial?.next_page_url && (
                                        <div
                                            ref={pubLoaderRef}
                                            className="flex justify-center py-8"
                                        >
                                            {isLoadingPub && (
                                                <div className="flex flex-col items-center gap-3">
                                                    <svg
                                                        className="animate-spin h-8 w-8 text-blue-600"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    <p className="text-sm text-gray-600">
                                                        Cargando más
                                                        publicaciones...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Instituciones */}
                            {institucionesData.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                            Instituciones
                                            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                ({institucionesData.length})
                                            </span>
                                        </h2>
                                    </div>
                                    <div className="space-y-3">
                                        {institucionesData.map(
                                            (institucion) => (
                                                <Link
                                                    key={institucion.id}
                                                    href={`/instituciones/${institucion.id}`}
                                                    className="block bg-white dark:bg-edu-dark rounded-lg shadow-sm hover:shadow-md transition-all p-5 border border-gray-100 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-700 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {institucion.foto_perfil ? (
                                                            <img
                                                                src={
                                                                    institucion.foto_perfil
                                                                }
                                                                alt={
                                                                    institucion.nombre
                                                                }
                                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <svg
                                                                    className="w-8 h-8 text-blue-600"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 group-hover:text-edu-dark dark:group-hover:text-gray-100 transition-colors">
                                                                {
                                                                    institucion.nombre
                                                                }
                                                            </h3>
                                                            {institucion.descripcion && (
                                                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                                                                    {
                                                                        institucion.descripcion
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <svg
                                                            className="w-6 h-6 text-gray-400 group-hover:text-edu-dark transition-colors flex-shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )
                                        )}
                                    </div>

                                    {/* Loader para scroll infinito de instituciones */}
                                    {institucionesInitial?.next_page_url && (
                                        <div
                                            ref={instLoaderRef}
                                            className="flex justify-center py-8"
                                        >
                                            {isLoadingInst && (
                                                <div className="flex flex-col items-center gap-3">
                                                    <svg
                                                        className="animate-spin h-8 w-8 text-blue-600"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    <p className="text-sm text-gray-600">
                                                        Cargando más
                                                        instituciones...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
