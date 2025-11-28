import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { GraduationCap, Calendar, Monitor, FileText } from "lucide-react";

export default function MisCarreras({ auth, carreras }) {
    const carrerasData = carreras?.data || [];
    const carrerasLinks = carreras?.links || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Carreras Guardadas" />

            <div className="py-8 mb-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Carreras Guardadas
                        </h1>
                    </div>

                    {/* Lista de carreras */}
                    {carrerasData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 mx-auto mb-4 opacity-30 dark:opacity-20">
                                <GraduationCap className="w-full h-full text-gray-400 dark:text-gray-200" />
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-300 text-lg mb-2">
                                No hay carreras guardadas
                            </h3>
                            <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">
                                Explora el feed y guarda las carreras que te
                                interesen
                            </p>
                            <Link
                                href="/material"
                                className="inline-block px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 transition"
                            >
                                Explorar carreras
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {carrerasData.map((carrera) => (
                                <Link
                                    key={carrera.id}
                                    href={`/material/${carrera.id}`}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition border dark:border-gray-700 overflow-hidden group"
                                >
                                    {/* Header del card */}
                                    <div className="p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition">
                                                <GraduationCap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                                    Carrera
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition">
                                            {carrera.nombre}
                                        </h3>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                            {carrera.contenido}
                                        </p>

                                        {/* Info adicional */}
                                        <div className="space-y-2">
                                            {carrera.modalidad && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <Monitor className="w-4 h-4 mr-2" />
                                                    {carrera.modalidad}
                                                </div>
                                            )}
                                            {carrera.duracion && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    {carrera.duracion} meses
                                                </div>
                                            )}
                                            {carrera.plan_estudios &&
                                                carrera.plan_estudios.length >
                                                    0 && (
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        {
                                                            carrera
                                                                .plan_estudios
                                                                .length
                                                        }{" "}
                                                        PDF
                                                        {carrera.plan_estudios
                                                            .length > 1
                                                            ? "s"
                                                            : ""}
                                                    </div>
                                                )}
                                        </div>

                                        {/* Categorías */}
                                        {carrera.categorias &&
                                            carrera.categorias.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {carrera.categorias
                                                        .slice(0, 3)
                                                        .map((cat, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                                            >
                                                                {cat}
                                                            </span>
                                                        ))}
                                                    {carrera.categorias.length >
                                                        3 && (
                                                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                            +
                                                            {carrera.categorias
                                                                .length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Paginación */}
                    {carrerasLinks.length > 3 && (
                        <div className="mt-8 flex justify-center space-x-2">
                            {carrerasLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || "#"}
                                    className={`px-4 py-2 rounded ${
                                        link.active
                                            ? "bg-yellow-600 text-white dark:bg-yellow-500"
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
