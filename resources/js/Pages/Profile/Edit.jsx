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

export default function Edit({ mustVerifyEmail, status, auth, residencias = [] }) {
    const { props } = usePage();
    const esInstitucion = auth.user?.tipo_usuario === 'institucion';
    const [listaResidencias, setListaResidencias] = useState(residencias);

    // Actualizar lista cuando cambien las residencias
    useEffect(() => {
        setListaResidencias(residencias);
    }, [residencias]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
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

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}