import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState } from "react";

export default function Ubicaciones({ auth, ubicaciones }) {
    const [lista, setLista] = useState(ubicaciones?.data || []);

    const quitarUbicacion = async (institucionId) => {
        try {
            await axios.post(route("ubicaciones.toggle"), { institucion_id: institucionId });
            setLista((prev) =>
                prev.filter((u) => u.institucion.id !== institucionId)
            );
        } catch (err) {
            console.error("Error al quitar ubicación:", err);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Ubicaciones Guardadas" />

            <div className="py-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-center mb-6">
                        Ubicaciones Guardadas
                    </h1>

                    {lista.length === 0 && (
                        <div className="text-center text-gray-500">
                            No tienes ubicaciones guardadas.
                        </div>
                    )}

                    <div className="space-y-5">
                        {lista.map((u) => (
                            <div
                                key={u.id}
                                className="bg-white shadow border rounded-xl p-4 flex gap-4"
                            >
                                <img
                                    src={u.institucion?.avatar_url || "/img/default.jpg"}
                                    alt="avatar institución"
                                    className="w-20 h-20 rounded-lg object-cover border"
                                />

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">
                                        {u.institucion?.nombre}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {u.institucion?.direccion || "Dirección no disponible"}
                                    </p>

                                    <div className="flex gap-3 mt-3">
                                        <Link
                                            href={route("instituciones.show", u.institucion.id)}
                                            className="text-blue-600 font-medium hover:underline"
                                        >
                                            Ver perfil
                                        </Link>

                                        <button
                                            onClick={() => quitarUbicacion(u.institucion.id)}
                                            className="text-red-600 font-medium hover:underline"
                                        >
                                            Quitar ubicación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
