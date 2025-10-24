import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import toast from "react-hot-toast";
import { useFlash } from "@/hooks/useFlash";
import { Heart, MessageCircle, Trash2, Edit, Eye } from "lucide-react";

export default function MisPublicaciones({ auth, publicaciones }) {
    useFlash();

    const handleDelete = (publicacionId) => {
        toast(
            (t) => (
                <div className="flex flex-col space-y-3">
                    <p className="font-medium">¿Eliminar esta publicación?</p>
                    <p className="text-sm text-gray-600">
                        Esta acción no se puede deshacer
                    </p>
                    <div className="flex space-x-2 justify-end">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);

                                const loadingToast = toast.loading(
                                    "Eliminando publicación..."
                                );

                                router.delete(
                                    `/publicaciones/${publicacionId}`,
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            toast.dismiss(loadingToast);
                                            toast.success(
                                                "Publicación eliminada correctamente"
                                            );
                                        },
                                        onError: () => {
                                            toast.dismiss(loadingToast);
                                            toast.error(
                                                "No se pudo eliminar la publicación"
                                            );
                                        },
                                    }
                                );
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                style: {
                    background: "#fff",
                    color: "#000",
                    maxWidth: "400px",
                },
            }
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Publicaciones" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Publicaciones
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Administra todas tus publicaciones
                            </p>
                        </div>
                        <Link href="/publicaciones/create">
                            <p className="text-blue-500 text-md font-bold hover:underline">
                                Publicar 🡕
                            </p>
                        </Link>
                    </div>

                    {/* Lista de publicaciones */}
                    {publicaciones.data.length === 0 ? (
                        <div className="bg-white overflow-hidden sm:rounded-xl p-12 text-center">
                            <p className="text-gray-500 text-lg mb-4">
                                No has creado ninguna publicación todavía
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden border sm:rounded-xl">
                            <div className="divide-y divide-gray-200">
                                {publicaciones.data.map((publicacion) => (
                                    <div
                                        key={publicacion.id}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start space-x-4">
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
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <MessageCircle className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        publicacion.comentarios_count
                                                                    }{" "}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Eye className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        publicacion.count_visualizaciones
                                                                    }{" "}
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
                                                        <Link
                                                            href={`/publicaciones/${publicacion.id}/edit`}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Editar publicación"
                                                        >
                                                            <Edit className="w-5 h-5" />
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
                                            ? "bg-edu-dark text-white"
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
