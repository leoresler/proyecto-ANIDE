import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ActualizarFotoPerfil from './Partials/ActualizarFotoPerfil';
import ActualizarIntereses from './Partials/ActualizarIntereses';
import AgregarResidencia from './Partials/AgregarResidencia';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
// Formularios específicos
import FormPerfilPersona from './Partials/FormPerfilPersona';
import FormPerfilInstitucion from './Partials/FormPerfilInstitucion';

export default function Edit({ mustVerifyEmail, status, auth, residencias = [] }) {
    const { props } = usePage();
    const esInstitucion = auth.user?.tipo_usuario === 'institucion';
    const [listaResidencias, setListaResidencias] = useState(residencias);
    const tipoUsuario = auth?.user?.tipo_usuario; // 'persona' o 'institucion'

    // Actualizar lista cuando cambien las residencias
    useEffect(() => {
        setListaResidencias(residencias);
    }, [residencias]);

    return (
        <AuthenticatedLayout
        user={auth.user}
        header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                Perfil
            </h2>
        }
    >
        <Head title="Editar Perfil" />

        <div className="py-12">
            <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                {/* Información básica */}
                <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 space-y-6">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />

                    <ActualizarFotoPerfil
                        currentPhoto={auth.user.profile_photo_url}
                        className="max-w-xl"
                    />
                    {!esInstitucion && (
                        <ActualizarIntereses
                            currentInterests={auth.user.interests || []}
                            className="max-w-xl"
                        />
                    )}

                    {/* Campos específicos según el tipo de usuario */}
                    {tipoUsuario === 'persona' ? (
                        <FormPerfilPersona auth={auth} className="max-w-xl" />
                    ) : tipoUsuario === 'institucion' ? (
                        <FormPerfilInstitucion auth={auth} className="max-w-xl" />
                    ) : (
                        <p className="text-gray-600">
                            Tipo de usuario desconocido o no definido.
                        </p>
                    )}
                </div>

                {/* Sección de residencias solo para instituciones */}
                {esInstitucion && (
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <AgregarResidencia 
                            className="max-w-4xl"
                            residencias={listaResidencias}
                        />
                    </div>
                )}

                {/* Contraseña */}
                <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                {/* Eliminar cuenta */}
                <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>

    );
}
