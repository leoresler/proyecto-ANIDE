import { Link } from "@inertiajs/react";

export default function AccesosDirectos({ instituciones = [] }) {
    if (instituciones.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 text-gray-500 mb-3">
                <img
                    src="/svg/accesoDirect.svg"
                    alt="Accesos"
                    className="h-6 w-6 dark:brightness-100 dark:invert"
                />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Accesos Directos
                </p>
            </div>

            <hr className="mt-2 mb-6 border-gray-300 dark:border-gray-600" />

            <div className="flex justify-center gap-6 overflow-x-auto pb-3">
                {instituciones.map((institucion) => (
                    <Link
                        key={institucion.id}
                        href={`/instituciones/${institucion.id}`}
                        className="flex flex-col items-center group"
                    >
                        <div className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-full p-2 transition">
                            <img
                                src={
                                    institucion.foto_perfil ||
                                    institucion.user?.profile_photo_url ||
                                    "/images/default-avatar.png"
                                }
                                alt={institucion.nombre}
                                className="h-14 w-14 rounded-full object-cover"
                            />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 text-center max-w-[80px] truncate group-hover:text-edu-primary transition">
                            {institucion.nombre}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
