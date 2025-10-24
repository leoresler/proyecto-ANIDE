import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PublicacionCard from "@/Components/Publicacion/PublicacionCard";

export default function Favoritos({ auth, favoritos, userType }) {
    const favoritosData = favoritos?.data || [];
    const favoritosLinks = favoritos?.links || [];

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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Favoritos" />

            <div className="py-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                        buscador
                    </h1>

                    {/* Lista de publicaciones favoritas */}
                    <div className="space-y-6">
                        {favoritosData.length === 0 ? (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8 text-center">
                                <p className="text-gray-500">
                                    No tenés publicaciones guardadas todavía.
                                </p>
                                <Link
                                    href="/"
                                    className="mt-3 inline-block text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Ir al inicio
                                </Link>
                            </div>
                        ) : (
                            favoritosData.map((publicacion) => {
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

                    {/* Paginación */}
                    {favoritosLinks.length > 3 && (
                        <div className="mt-6 flex justify-center space-x-2">
                            {favoritosLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    className={`px-4 py-2 rounded ${
                                        link.active
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    } ${
                                        !link.url
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
