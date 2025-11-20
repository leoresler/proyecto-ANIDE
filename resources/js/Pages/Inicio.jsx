import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PublicacionCard from "@/Components/Publicacion/PublicacionCard";
import Recomendaciones from "@/Components/Recomendaciones";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";

export default function Inicio({ auth, publicaciones, userType }) {
    const publicacionesData = publicaciones?.data || [];
    const publicacionesLinks = publicaciones?.links || [];
    
    // Obtener la URL de la siguiente página
    const nextPageUrl = publicacionesLinks.find(link => link.label === '&raquo;')?.url;
    
    const { loaderRef, isLoading } = useInfiniteScroll({
        nextPageUrl
    });

    // Accesos estáticos
    const accesos = [
        { nombre: "UTN - FRN", img: "/images/utn.png" },
        { nombre: "UNCo", img: "/images/unco.png" },
        { nombre: "FaIN - UNCo", img: "/images/fain.png" },
        { nombre: "CREUZA", img: "/images/creuza.png" },
        { nombre: "CETU", img: "/images/cetu.png" },
    ];

    const handleLike = (publicacionId) => {
        router.post(
            "/likes/toggle",
            {
                target_id: publicacionId,
                target_tipo: "publicacion",
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleFavorite = (publicacionId) => {
        router.post(
            "/favoritos/toggle",
            {
                publicacion_id: publicacionId,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Inicio" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna principal - Publicaciones (2/3) */}
                        <div className="lg:col-span-2">
                            {userType === "persona" && (
                                <div>
                                    <div className="flex items-center gap-3 text-gray-500 mb-3">
                                        <img
                                            src="/svg/accesoDirect.svg"
                                            alt="Accesos"
                                            className="h-6 w-6"
                                        />
                                        <p className="text-gray-500 font-medium">
                                            Accesos Directos
                                        </p>
                                    </div>

                                    <hr className="mt-2 mb-6 border-gray-500" />

                                    <div className="flex justify-center gap-6 overflow-x-auto pb-3 mb-4">
                                        {accesos.map((a, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="bg-white shadow-md hover:shadow-lg rounded-full p-2 transition">
                                                    <img
                                                        src={a.img}
                                                        alt={a.nombre}
                                                        className="h-14 w-14 rounded-full object-contain"
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {a.nombre}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {userType === "institucion" && (
                                <div className="flex items-center mb-6 justify-between gap-2">
                                    <p>
                                        Enterate de lo que pasa en otras
                                        instituciones.
                                    </p>
                                    <Link href="/publicaciones/create">
                                        <p className="text-edu-dark text-md font-bold">
                                            Compartí tus últimas novedades
                                        </p>
                                        <hr className="border-gray-500" />
                                    </Link>
                                </div>
                            )}

                            {/* Lista de publicaciones */}
                            <div className="space-y-6">
                                {publicacionesData.length === 0 ? (
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8 text-center">
                                        <p className="text-gray-500">
                                            No hay publicaciones disponibles
                                        </p>
                                    </div>
                                ) : (
                                    publicacionesData.map((publicacion) => {
                                        return (
                                            <PublicacionCard
                                                key={publicacion.id}
                                                publicacion={publicacion}
                                                userType={userType}
                                                onLike={handleLike}
                                                onFavorite={handleFavorite}
                                                variant="card"
                                                auth={auth}
                                            />
                                        );
                                    })
                                )}
                            </div>

                            {/* Loader para scroll infinito */}
                            {nextPageUrl && (
                                <div ref={loaderRef}>
                                    {isLoading && <LoadingSpinner />}
                                </div>
                            )}
                        </div>

                        {/* Columna lateral - Recomendaciones (1/3) - Solo en desktop */}
                        <div className="hidden lg:block">
                            <Recomendaciones userType={userType} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}