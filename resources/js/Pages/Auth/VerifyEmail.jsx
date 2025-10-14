import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const { auth } = usePage().props;
    
    // Detectar si es institución
    const esInstitucion = auth?.user?.tipo_usuario === 'institucion';

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verificación de Email" />

            <div className="max-w-md p-6">
                <div className="mb-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Verificá tu email
                    </h2>
                </div>

                <div className="mb-4 text-sm text-gray-600 text-center">
                    ¡Gracias por registrarte! Antes de comenzar, por favor verificá tu dirección de email 
                    haciendo clic en el enlace que acabamos de enviarte.
                </div>

                {esInstitucion && (
                    <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Institución:</strong> Después de verificar tu email, 
                                    podrás completar los datos de tu institución. Tu cuenta será 
                                    revisada por un administrador antes de tener acceso completo.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'verification-link-sent' && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm font-medium text-green-600">
                            ¡Un nuevo enlace de verificación fue enviado a tu email!
                        </p>
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mt-6 flex flex-col gap-4 items-center">
                        <PrimaryButton 
                            disabled={processing}
                            className="w-full justify-center"
                        >
                            {processing ? 'Enviando...' : 'Reenviar Email de Verificación'}
                        </PrimaryButton>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Cerrar Sesión
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>¿No recibiste el email? Revisá tu carpeta de spam</p>
                </div>
            </div>
        </GuestLayout>
    );
}