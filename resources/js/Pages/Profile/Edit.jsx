import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    User,
    Lock,
    Heart,
    FileText,
    Home,
    ThumbsUp,
    UserPlus,
    BookOpen,
} from "lucide-react";

import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import ActualizarIntereses from "./Partials/ActualizarIntereses";
import AgregarResidencia from "./Partials/AgregarResidencia";
import EditarPerfilPersona from "./Partials/EditarPerfilPersona";
import EditarPerfilInstitucion from "./Partials/EditarPerfilInstitucion";
import ActualizarFotoPerfil from "./Partials/ActualizarFotoPerfil";

export default function Edit({ auth, residencias = [] }) {
    const { props } = usePage();
    const esInstitucion = auth.user?.tipo_usuario === "institucion";
    const [seccionAbierta, setSeccionAbierta] = useState(null);

    const toggleSeccion = (seccion) => {
        setSeccionAbierta(seccionAbierta === seccion ? null : seccion);
    };

    const SeccionExpandible = ({ id, titulo, icono: Icono, children }) => {
        const estaAbierta = seccionAbierta === id;

        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <button
                    onClick={() => toggleSeccion(id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Icono className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">
                            {titulo}
                        </span>
                    </div>
                    {estaAbierta ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {estaAbierta && (
                    <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const NavButton = ({ href, icon: Icon, label, isActive }) => (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                    ? "bg-edu-dark text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline">{label}</span>
        </Link>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                        <NavButton
                            href="/profile"
                            icon={User}
                            label="Mi Perfil"
                            isActive={true}
                        />
                        <NavButton
                            href="/likes"
                            icon={Heart}
                            label="Me Gusta"
                            isActive={false}
                        />
                        <NavButton
                            href="/seguidos"
                            icon={UserPlus}
                            label="Seguidos"
                            isActive={false}
                        />
                        {esInstitucion && (
                            <>
                                <NavButton
                                    href="/publicaciones/misPublicaciones"
                                    icon={FileText}
                                    label="Mis Publicaciones"
                                    isActive={false}
                                />
                                <NavButton
                                    href="/material"
                                    icon={BookOpen}
                                    label="Cursos y Carreras"
                                    isActive={false}
                                />
                            </>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Editar Perfil" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                        <ActualizarFotoPerfil
                            currentPhoto={auth.user.profile_photo_url}
                        />
                        <div className="w-full sm:flex-1">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {auth.user.nombre}
                            </h3>
                            {esInstitucion ? (
                                <>
                                    <p className="text-gray-600 font-medium">
                                        {props.institucion?.tipo_institucion ||
                                            "Institución"}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {auth.user.email}
                                    </p>
                                </>
                            ) : (
                                <p className="text-gray-600">
                                    {auth.user.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <SeccionExpandible
                            id="perfil"
                            titulo="Editar mi perfil"
                            icono={User}
                        >
                            {esInstitucion ? (
                                <EditarPerfilInstitucion
                                    auth={auth}
                                    className="max-w-xl"
                                    onCancel={() => setSeccionAbierta(null)}
                                />
                            ) : (
                                <EditarPerfilPersona
                                    auth={auth}
                                    className="max-w-xl"
                                    onCancel={() => setSeccionAbierta(null)}
                                />
                            )}
                        </SeccionExpandible>

                        <SeccionExpandible
                            id="intereses"
                            titulo="Mis intereses"
                            icono={ThumbsUp}
                        >
                            <ActualizarIntereses
                                currentInterests={props.currentInterests || []}
                                className="mx-auto w-full sm:max-w-2xl"
                                onCancel={() => setSeccionAbierta(null)}
                            />
                        </SeccionExpandible>

                        {esInstitucion && (
                            <SeccionExpandible
                                id="residencias"
                                titulo="Agregar facultades"
                                icono={Home}
                            >
                                <AgregarResidencia
                                    className="w-full"
                                    residencias={residencias}
                                />
                            </SeccionExpandible>
                        )}

                        <SeccionExpandible
                            id="password"
                            titulo="Cambiar contraseña"
                            icono={Lock}
                        >
                            <UpdatePasswordForm
                                className="mx-auto w-full sm:max-w-2xl"
                                onCancel={() => setSeccionAbierta(null)}
                            />
                        </SeccionExpandible>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
