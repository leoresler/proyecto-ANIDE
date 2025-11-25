import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Edit2, Trash2, Plus, BookOpen, GraduationCap } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function Index({ auth, materiales }) {
    const materialesData = materiales?.data || [];
    const materialesLinks = materiales?.links || [];

    const handleDelete = (id, tipo, nombre) => {
        toast(
            (t) => (
                <div className="flex flex-col space-y-3">
                    <p className="font-medium">
                        ¿Eliminar {tipo === "curso" ? "el curso" : "la carrera"}{" "}
                        "{nombre}"?
                    </p>

                    <p className="text-sm text-gray-600">
                        Esta acción no se puede deshacer
                    </p>

                    <div className="flex space-x-2 justify-end">
                        {/* Cancelar */}
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                        >
                            Cancelar
                        </button>

                        {/* Eliminar */}
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);

                                const toastId = toast.loading("Eliminando...");

                                router.delete(`/material/${id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success(
                                            "Material eliminado exitosamente",
                                            { id: toastId }
                                        );
                                    },
                                    onError: (errors) => {
                                        toast.error(
                                            "Error al eliminar el material",
                                            { id: toastId }
                                        );
                                        console.error(errors);
                                    },
                                });
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
            <Head title="Mis Cursos y Carreras" />

            <div className="py-8 mb-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Cursos y Carreras
                            </h1>
                            <p className="text-gray-600 mt-1 dark:text-gray-400">
                                Administra tu oferta educativa
                            </p>
                        </div>
                        <Link
                            href="/material/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Material
                        </Link>
                    </div>

                    {/* Lista de materiales */}
                    {materialesData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div
                                    className="w-16 h-16 opacity-30 dark:brightness-0 dark:invert dark:opacity-20"
                                    style={{
                                        backgroundImage:
                                            "url('/svg/sidebar/courses.svg')",
                                        backgroundSize: "contain",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center",
                                    }}
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No hay materiales aún
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Comienza agregando cursos o carreras que ofreces
                            </p>
                            <Link
                                href="/material/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 transition"
                            >
                                <Plus className="w-5 h-5" />
                                Agregar Material
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {materialesData.map((material) => (
                                <div
                                    key={material.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition border dark:border-gray-700"
                                >
                                    {/* Header del card */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-3 rounded-lg ${
                                                        material.tipo ===
                                                        "curso"
                                                            ? "bg-blue-100 dark:bg-blue-900/30"
                                                            : "bg-yellow-100 dark:bg-yellow-900/30"
                                                    }`}
                                                >
                                                    {material.tipo ===
                                                    "curso" ? (
                                                        <BookOpen
                                                            className={`w-6 h-6 ${
                                                                material.tipo ===
                                                                "curso"
                                                                    ? "text-blue-600 dark:text-blue-400"
                                                                    : "text-yellow-600 dark:text-yellow-400"
                                                            }`}
                                                        />
                                                    ) : (
                                                        <GraduationCap
                                                            className={`w-6 h-6 ${
                                                                material.tipo ===
                                                                "curso"
                                                                    ? "text-blue-600 dark:text-blue-400"
                                                                    : "text-yellow-600 dark:text-yellow-400"
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <span
                                                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                                            material.tipo ===
                                                            "curso"
                                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                        }`}
                                                    >
                                                        {material.tipo ===
                                                        "curso"
                                                            ? "Curso"
                                                            : "Carrera"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-1">
                                                <Link
                                                    href={`/material/${material.id}/edit`}
                                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            material.id,
                                                            material.tipo,
                                                            material.nombre
                                                        )
                                                    }
                                                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {material.nombre}
                                        </h3>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                            {material.contenido}
                                        </p>

                                        {/* Info adicional */}
                                        <div className="space-y-2">
                                            {material.modalidad && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium mr-2">
                                                        Modalidad:
                                                    </span>
                                                    {material.modalidad}
                                                </div>
                                            )}
                                            {material.duracion && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium mr-2">
                                                        Duración:
                                                    </span>
                                                    {material.duracion} meses
                                                </div>
                                            )}
                                        </div>

                                        {/* Categorías */}
                                        {material.categorias &&
                                            material.categorias.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {material.categorias.map(
                                                        (cat, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                                            >
                                                                {cat}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex items-center justify-between">
                                        <span
                                            className={`text-xs font-medium ${
                                                material.publicado
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-gray-500 dark:text-gray-400"
                                            }`}
                                        >
                                            {material.publicado
                                                ? "Publicado"
                                                : "Borrador"}
                                        </span>
                                        {material.plan_estudios &&
                                            material.plan_estudios.length >
                                                0 && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {
                                                        material.plan_estudios
                                                            .length
                                                    }{" "}
                                                    PDF
                                                    {material.plan_estudios
                                                        .length > 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Paginación */}
                    {materialesLinks.length > 3 && (
                        <div className="mt-8 flex justify-center space-x-2">
                            {materialesLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    className={`px-4 py-2 rounded ${
                                        link.active
                                            ? "bg-blue-600 text-white dark:bg-blue-500"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-700"
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
