import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft,
    BookOpen,
    GraduationCap,
    Calendar,
    Monitor,
    Download,
    Bookmark,
    BookmarkCheck,
    MapPin,
    Globe,
    Phone,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

export default function Show({ auth, material, guardado, esOwner }) {
    const [isGuardado, setIsGuardado] = useState(guardado);
    const [loading, setLoading] = useState(false);

    const handleToggleGuardado = async () => {
        setLoading(true);

        try {
            const response = await fetch(
                `/material/${material.id}/toggle-guardado`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector(
                            'meta[name="csrf-token"]'
                        ).content,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setIsGuardado(data.guardado);
                toast.success(data.message);
            } else {
                toast.error(data.error || "Error al guardar");
            }
        } catch (error) {
            toast.error("Error al procesar la solicitud");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (pdfPath) => {
        window.open(`/storage/${pdfPath}`, "_blank");
    };

    const truncate = (str, max = 40) =>
        str.length > max ? str.substring(0, max) + "..." : str;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={material.nombre} />

            <div className="py-8 mb-8">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        {/* Hero section */}
                        <div
                            className={`p-8 ${
                                material.tipo === "curso"
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                    : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        {material.tipo === "curso" ? (
                                            <BookOpen className="w-8 h-8 text-white" />
                                        ) : (
                                            <GraduationCap className="w-8 h-8 text-white" />
                                        )}
                                        <span className="inline-block px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm font-semibold">
                                            {material.tipo === "curso"
                                                ? "Curso"
                                                : "Carrera"}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {material.nombre}
                                    </h1>
                                    {material.institucion && (
                                        <div className="flex items-center gap-2 text-white text-opacity-90">
                                            <img
                                                src={material.foto_institucion}
                                                alt={
                                                    material.nombre_institucion
                                                }
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span className="font-medium">
                                                {material.nombre_institucion}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {!esOwner && (
                                    <button
                                        onClick={handleToggleGuardado}
                                        disabled={loading}
                                        className={`p-3 rounded-full transition ${
                                            isGuardado
                                                ? "bg-white text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-200"
                                                : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                                        } disabled:opacity-50`}
                                    >
                                        {isGuardado ? (
                                            <BookmarkCheck className="w-6 h-6" />
                                        ) : (
                                            <Bookmark className="w-6 h-6" />
                                        )}
                                    </button>
                                )}

                                {esOwner && (
                                    <Link
                                        href={`/material/${material.id}/edit`}
                                        className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition font-medium"
                                    >
                                        Editar
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Información principal */}
                        <div className="p-8">
                            {/* Detalles rápidos */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                {material.duracion && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Duración
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {material.duracion} meses
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {material.modalidad && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Modalidad
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {material.modalidad}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Publicado
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {new Date(
                                                material.created_at
                                            ).toLocaleDateString("es-ES")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Descripción
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                    {material.contenido}
                                </p>
                            </div>

                            {/* Categorías */}
                            {material.categorias &&
                                material.categorias.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                            Categorías
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {material.categorias.map(
                                                (cat, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium"
                                                    >
                                                        {cat}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Plan de estudios */}
                            {material.plan_estudios &&
                                material.plan_estudios.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                            Plan de estudios
                                        </h2>
                                        <div className="space-y-2">
                                            {material.plan_estudios.map(
                                                (pdf, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() =>
                                                            handleDownload(pdf)
                                                        }
                                                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-red-100 rounded">
                                                                <Download className="w-5 h-5 text-red-600" />
                                                            </div>
                                                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[220px]">
                                                                {pdf
                                                                    .split("/")
                                                                    .pop()}
                                                            </span>
                                                        </div>
                                                        <Download className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Información de la institución */}
                            {material.institucion && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                        Sobre la institución
                                    </h2>
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={material.foto_institucion}
                                            alt={material.nombre_institucion}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                                                {material.nombre_institucion}
                                            </h3>
                                            {material.institucion
                                                .descripcion && (
                                                <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                    {
                                                        material.institucion
                                                            .descripcion
                                                    }
                                                </p>
                                            )}
                                            <div className="space-y-2">
                                                {material.institucion.user
                                                    ?.ciudad && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <MapPin className="w-4 h-4" />
                                                        {
                                                            material.institucion
                                                                .user.ciudad
                                                        }
                                                        ,{" "}
                                                        {
                                                            material.institucion
                                                                .user.provincia
                                                        }
                                                    </div>
                                                )}
                                                {material.institucion
                                                    .url_sitio_web && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                        <a
                                                            href={
                                                                material
                                                                    .institucion
                                                                    .url_sitio_web
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                                        >
                                                            Sitio web
                                                        </a>
                                                    </div>
                                                )}
                                                {material.institucion.user
                                                    ?.telefono && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <Phone className="w-4 h-4" />
                                                        {
                                                            material.institucion
                                                                .user.telefono
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                            <Link
                                                href={`/instituciones/${material.institucion.id}`}
                                                className="inline-block mt-4 px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-900 transition"
                                            >
                                                Ver perfil completo
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
