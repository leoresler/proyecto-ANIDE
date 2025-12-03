import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState } from "react";
import { MapPin, X, ExternalLink, Bookmark } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Ubicaciones({ auth, ubicaciones }) {
    const [lista, setLista] = useState(ubicaciones?.data || []);
    const [isRemoving, setIsRemoving] = useState(null);

    const quitarUbicacion = async (institucionId) => {
        setIsRemoving(institucionId);

        try {
            await axios.post(route("ubicaciones.toggle"), {
                institucion_id: institucionId,
            });

            setLista((prev) =>
                prev.filter((u) => u.institucion.id !== institucionId)
            );

            toast.success("Ubicación eliminada de tus guardados");
        } catch (err) {
            console.error("Error al quitar ubicación:", err);
            toast.error("No se pudo eliminar la ubicación");
        } finally {
            setIsRemoving(null);
        }
    };

    const getNombreInstitucion = (institucion) => {
        // Manejar tanto el caso de persona como de institución
        return institucion?.nombre || 
               institucion?.user?.nombre || 
               "Institución sin nombre";
    };

    const getFotoInstitucion = (institucion) => {
        // Priorizar foto_perfil (instituciones) sobre profile_photo_url (usuarios)
        if (institucion?.foto_perfil) {
            return `/storage/${institucion.foto_perfil}`;
        }
        if (institucion?.user?.profile_photo_url) {
            return institucion.user.profile_photo_url;
        }
        return "/profile-photos/default-avatar.webp";
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Ubicaciones Guardadas" />

            <div className="py-8 mb-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Ubicaciones Guardadas
                        </h1>
                    </div>

                    {/* Lista de ubicaciones */}
                    <div className="space-y-6">
                        {lista.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                                <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                                <p className="text-gray-500 dark:text-gray-300 text-lg mb-2">
                                    No tenés ubicaciones guardadas todavía.
                                </p>
                                <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">
                                    Guardá instituciones para encontrarlas más
                                    fácilmente
                                </p>
                                <Link
                                    href="/mapa"
                                    className="mt-3 inline-block px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 font-medium dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Explorar mapa
                                </Link>
                            </div>
                        ) : (
                            lista.map((u) => (
                                <div
                                    key={u.id}
                                    className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md transition-all overflow-hidden hover:shadow-lg"
                                >
                                    <div className="p-6">
                                        <div className="flex gap-4">
                                            {/* Avatar de la institución */}
                                            <Link
                                                href={route(
                                                    "instituciones.show",
                                                    u.institucion.id
                                                )}
                                                className="flex-shrink-0"
                                            >
                                                <img
                                                    src={
                                                        u.institucion?.user
                                                            ?.profile_photo_url ||
                                                        "/profile-photos/default-avatar.webp"
                                                    }
                                                    alt={
                                                        u.institucion?.user
                                                            ?.nombre ||
                                                        "Institución"
                                                    }
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                                />
                                            </Link>

                                            {/* Información de la institución */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={route(
                                                                "instituciones.show",
                                                                u.institucion.id
                                                            )}
                                                            className="hover:underline"
                                                        >
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                                                                {u.institucion
                                                                    ?.user
                                                                    ?.nombre ||
                                                                    "Institución sin nombre"}
                                                            </h3>
                                                        </Link>

                                                        {u.institucion
                                                            ?.direccion && (
                                                            <div className="flex items-start gap-2 mt-1">
                                                                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                    {
                                                                        u
                                                                            .institucion
                                                                            .direccion
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Botón quitar */}
                                                    <button
                                                        onClick={() =>
                                                            quitarUbicacion(
                                                                u.institucion.id
                                                            )
                                                        }
                                                        disabled={
                                                            isRemoving ===
                                                            u.institucion.id
                                                        }
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Quitar de ubicaciones guardadas"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex items-center gap-4 mt-4">
                                                    <Link
                                                        href={route(
                                                            "instituciones.show",
                                                            u.institucion.id
                                                        )}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Ver perfil
                                                    </Link>

                                                    {u.institucion?.latitud &&
                                                        u.institucion
                                                            ?.longitud && (
                                                            <a
                                                                href={`https://www.google.com/maps?q=${u.institucion.latitud},${u.institucion.longitud}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                                            >
                                                                <MapPin className="w-4 h-4" />
                                                                Ver en mapa
                                                            </a>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer con contador */}
                    {lista.length > 0 && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <Bookmark className="w-4 h-4 inline-block mr-1" />
                                {lista.length}{" "}
                                {lista.length === 1
                                    ? "ubicación guardada"
                                    : "ubicaciones guardadas"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
