import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SecondaryButton from "@/Components/SecondaryButton";
import { Heart, MessageCircle, Trash2, Edit, Eye } from "lucide-react";

export default function MisPublicaciones({ auth, publicaciones }) {
    const handleDelete = (publicacionId) => {
        if (
            confirm("¿Estás seguro de que quieres eliminar esta publicación?")
        ) {
            router.delete(`/publicaciones/${publicacionId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Publicaciones" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Mis Publicaciones
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Administra todas tus publicaciones
                            </p>
                        </div>
                        <Link href="/publicaciones/create">
                            <SecondaryButton className="py-2 px-4 rounded-xl bg-edu-dark text-white hover:bg-gray-600 text-sm">
                                Crear Nueva Publicacion
                            </SecondaryButton>
                        </Link>
                    </div>

                    {/* Lista de publicaciones */}
                    {publicaciones.data.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12 text-center">
                            <p className="text-gray-500 text-lg mb-4">
                                No has creado ninguna publicación todavía
                            </p>
                            <Link href="/publicaciones/create">
                                <SecondaryButton className="py-2 px-4 rounded-xl bg-edu-dark text-white hover:bg-gray-600 text-sm">
                                    Creá tu primera publicacion
                                </SecondaryButton>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="divide-y divide-gray-200">
                                {publicaciones.data.map((publicacion) => (
                                    <div
                                        key={publicacion.id}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start space-x-4">
                                            {/* Thumbnail si tiene media */}
                                            {publicacion.media &&
                                                publicacion.media.length >
                                                    0 && (
                                                    <div className="flex-shrink-0">
                                                        {publicacion.media[0]
                                                            .tipo ===
                                                            "imagen" && (
                                                            <img
                                                                src={
                                                                    publicacion
                                                                        .media[0]
                                                                        .url_publica
                                                                }
                                                                alt="Thumbnail"
                                                                className="w-32 h-32 object-cover rounded-lg"
                                                            />
                                                        )}
                                                        {publicacion.media[0]
                                                            .tipo ===
                                                            "video" && (
                                                            <video
                                                                src={
                                                                    publicacion
                                                                        .media[0]
                                                                        .url_publica
                                                                }
                                                                className="w-32 h-32 object-cover rounded-lg"
                                                            />
                                                        )}
                                                    </div>
                                                )}

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                            {publicacion.titulo}
                                                        </h3>
                                                        <p className="text-gray-600 line-clamp-2 mb-3">
                                                            {
                                                                publicacion.contenido
                                                            }
                                                        </p>

                                                        {/* Estadísticas */}
                                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <Heart className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        publicacion.likes_count
                                                                    }{" "}
                                                                    likes
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <MessageCircle className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        publicacion.comentarios_count
                                                                    }{" "}
                                                                    comentarios
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Eye className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        publicacion.count_visualizaciones
                                                                    }{" "}
                                                                    vistas
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-400">
                                                                •
                                                            </span>
                                                            <span>
                                                                {new Date(
                                                                    publicacion.created_at
                                                                ).toLocaleDateString(
                                                                    "es-AR"
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Acciones */}
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <Link
                                                            href={`/publicaciones/${publicacion.id}`}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Ver publicación"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    publicacion.id
                                                                )
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar publicación"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Estado de publicación */}
                                                <div className="mt-3">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                            publicacion.publicado
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {publicacion.publicado
                                                            ? "Publicado"
                                                            : "Borrador"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Paginación */}
                    {publicaciones.links.length > 3 && (
                        <div className="mt-6 flex justify-center space-x-2">
                            {publicaciones.links.map((link, index) => (
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
