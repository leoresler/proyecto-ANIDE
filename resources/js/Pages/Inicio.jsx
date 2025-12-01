import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PublicacionCard from "@/Components/Publicacion/PublicacionCard";
import AccesosDirectos from "@/Components/AccesosDirectos";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";

export default function Inicio({
    auth,
    publicaciones,
    userType,
    institucionesVisitadas = [],
}) {
    const publicacionesData = publicaciones?.data || [];
    const publicacionesLinks = publicaciones?.links || [];

    const nextPageUrl = publicacionesLinks.find(
        (link) => link.label === "&raquo;"
    )?.url;

    const { loaderRef, isLoading } = useInfiniteScroll({ nextPageUrl });

    const handleLike = (publicacionId) => {
        router.post(
            "/likes/toggle",
            { target_id: publicacionId, target_tipo: "publicacion" },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleFavorite = (publicacionId) => {
        router.post(
            "/favoritos/toggle",
            { publicacion_id: publicacionId },
            { preserveScroll: true, preserveState: true }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            showRecomendaciones={true}
            maxWidth="max-w-4xl"
        >
            <Head title="Inicio" />

            <div className="py-4 mb-8">
                {userType === "persona" && (
                    <AccesosDirectos instituciones={institucionesVisitadas} />
                )}

                {userType === "institucion" && (
                    <div className="flex items-center mb-6 justify-between gap-2">
                        <div className="w-full bg-gradient-to-r dark:from-edu-dark dark:to-edu-mid from-gray-300 to-gray-100 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-3xl p-5 shadow-md">
                            <Link
                                href="/publicaciones/create"
                                className="flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-lg font-bold">
                                        Compartí tus novedades
                                    </p>
                                    <p className="text-sm opacity-90">
                                        Publicá noticias, eventos o avisos
                                        importantes
                                    </p>
                                </div>

                                <div className="bg-edu-dark text-white dark:bg-white dark:text-black font-bold px-4 py-2 rounded-lg">
                                    Crear
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {publicacionesData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-8 text-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                No hay publicaciones disponibles
                            </p>
                        </div>
                    ) : (
                        publicacionesData.map((publicacion) => (
                            <PublicacionCard
                                key={publicacion.id}
                                publicacion={publicacion}
                                userType={userType}
                                onLike={handleLike}
                                onFavorite={handleFavorite}
                                variant="card"
                                auth={auth}
                            />
                        ))
                    )}
                </div>

                {nextPageUrl && (
                    <div ref={loaderRef}>{isLoading && <LoadingSpinner />}</div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
