import React from "react";
import ErrorLayout from "@/Layouts/ErrorLayout";

export default function ErrorPage({ status = 500, message = "" }) {
    const titles = {
        401: "No autenticado",
        403: "Acceso denegado",
        404: "Página no encontrada",
        419: "Sesión expirada",
        500: "Error del servidor",
    };

    const descriptions = {
        401: "Necesitás iniciar sesión para continuar.",
        403: "No tenés permisos suficientes para acceder a esta sección.",
        404: "La página que estás buscando no existe o fue movida.",
        419: "Tu sesión expiró. Iniciá sesión nuevamente.",
        500: "Tuvimos un problema interno. Estamos trabajando en ello.",
    };

    const title = titles[status] || "Error";
    const text =
        message || descriptions[status] || "Ocurrió un error inesperado.";

    return (
        <ErrorLayout>
            <div className="flex flex-col items-center gap-6">
                {/* error */}
                <h1 className="text-7xl font-extrabold text-white drop-shadow-lg tracking-wider">
                    {status}
                </h1>

                {/* titulo */}
                <h2 className="text-3xl font-bold text-white/90">{title}</h2>

                {/*descripcion */}
                <p className="text-lg text-white/70 max-w-xl">{text}</p>

                {/* img */}
                <div className="mt-6">
                    <img
                        src="/images/logo-eduquen.webp"
                        alt="Error Illustration"
                        className="w-52 opacity-90"
                    />
                </div>

                {/* botones */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <a
                        href={route("inicio")}
                        className="px-6 py-3 rounded-lg bg-edu-dark text-white font-semibold shadow-lg hover:bg-gray-700 transition duration-200"
                    >
                        Volver al inicio
                    </a>

                    <a
                        href={route("login")}
                        className="px-6 py-3 rounded-lg bg-white/20 text-white font-semibold shadow-lg border border-white/30 hover:bg-white/30 transition duration-200"
                    >
                        Iniciar sesión
                    </a>
                </div>
            </div>
        </ErrorLayout>
    );
}
