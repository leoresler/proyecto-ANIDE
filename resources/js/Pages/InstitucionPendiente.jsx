import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function InstitucionPendiente({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Verificación Pendiente" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8 text-center">
                            {/* Icono de reloj/espera */}
                            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
                                <svg
                                    className="h-12 w-12 text-yellow-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Verificación Pendiente
                            </h2>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Tu institución está siendo revisada
                                            por nuestro equipo de
                                            administración.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-left space-y-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        Estado actual:
                                    </h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-center">
                                            <svg
                                                className="h-5 w-5 text-yellow-500 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Pendiente de verificación
                                            administrativa
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        ¿Qué sigue?
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Un administrador revisará la información
                                        de tu institución en las próximas 24-48
                                        horas. Recibirás un email cuando tu
                                        cuenta sea aprobada.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-center space-x-4">
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50"
                                >
                                    Cerrar Sesión
                                </Link>
                            </div>

                            <p className="text-sm text-gray-500 mt-6">
                                ¿Tenés alguna pregunta? Contactanos a:{" "}
                                <a
                                    href={`mailto:${
                                        import.meta.env.VITE_ADMIN_EMAIL
                                    }`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {import.meta.env.VITE_ADMIN_EMAIL ||
                                        "ingresar.correo@eduquen.com"}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
