import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { BookOpen, Calendar, Monitor, FileText } from "lucide-react";

export default function MisCursos({ auth, cursos }) {
    const cursosData = cursos?.data || [];
    const cursosLinks = cursos?.links || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Cursos Guardados" />

            <div className="py-8 mb-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Cursos Guardados
                        </h1>
                    </div>

                    {/* Lista de cursos */}
                    {cursosData.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 mx-auto mb-4 opacity-30 dark:opacity-20">
                                <BookOpen className="w-full h-full text-gray-400 dark:text-gray-200" />
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-300 text-lg mb-2">
                                No hay cursos guardados
                            </h3>
                            <p className="text-gray-400 dark:text-gray-400 text-sm mb-4">
                                Explora el feed y guarda los cursos que te
                                interesen
                            </p>
                            <Link
                                href="/material"
                                className="inline-block px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 transition"
                            >
                                Explorar cursos
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cursosData.map((curso) => (
                                <Link
                                    key={curso.id}
                                    href={`/material/${curso.id}`}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition border dark:border-gray-700 overflow-hidden group"
                                >
                                    {/* Header del card */}
                                    <div className="p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
                                                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                    Curso
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                            {curso.nombre}
                                        </h3>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                            {curso.contenido}
                                        </p>

                                        {/* Info adicional */}
                                        <div className="space-y-2">
                                            {curso.modalidad && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <Monitor className="w-4 h-4 mr-2" />
                                                    {curso.modalidad}
                                                </div>
                                            )}
                                            {curso.duracion && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    {curso.duracion} meses
                                                </div>
                                            )}
                                            {curso.plan_estudios &&
                                                curso.plan_estudios.length >
                                                    0 && (
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        {
                                                            curso.plan_estudios
                                                                .length
                                                        }{" "}
                                                        PDF
                                                        {curso.plan_estudios
                                                            .length > 1
                                                            ? "s"
                                                            : ""}
                                                    </div>
                                                )}
                                        </div>

                                        {/* Categorías */}
                                        {curso.categorias &&
                                            curso.categorias.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {curso.categorias
                                                        .slice(0, 3)
                                                        .map((cat, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                                            >
                                                                {cat}
                                                            </span>
                                                        ))}
                                                    {curso.categorias.length >
                                                        3 && (
                                                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                            +
                                                            {curso.categorias
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
                    {cursosLinks.length > 3 && (
                        <div className="mt-8 flex justify-center space-x-2">
                            {cursosLinks.map((link, index) => (
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
