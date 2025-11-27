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

            <div className="py-4">
                {userType === "persona" && (
                    <AccesosDirectos instituciones={institucionesVisitadas} />
                )}

                {userType === "institucion" && (
                    <div className="flex items-center mb-6 justify-between gap-2">
                        <Link href="/publicaciones/create">
                            <p className="text-edu-dark dark:text-white text-md font-bold">
                                Compartí tus últimas novedades
                            </p>
                            <hr className="border-gray-500" />
                        </Link>
                    </div>
                )}

                <div className="space-y-6">
                    {publicacionesData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
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
