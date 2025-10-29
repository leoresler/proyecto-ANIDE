import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';
import { useRef, useEffect, useState } from 'react';

export default function ActualizarFotoPerfil({ className = '', currentPhoto }) {
    const photoInput = useRef();
    const { data, setData, errors, post, progress, processing } = useForm({
        photo: null,
    });

    // estado local para mostrar la foto (permite actualizar inmediatamente tras borrar)
    const [displayPhoto, setDisplayPhoto] = useState(currentPhoto);

    // cada vez que la prop cambie (por recarga Inertia), actualizamos el estado local
    useEffect(() => {
        setDisplayPhoto(currentPhoto);
    }, [currentPhoto]);

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.photo.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setData('photo', null);
                if (photoInput.current) photoInput.current.value = null;
                // opcional: recargar props para estar seguros
                Inertia.reload();
            },
        });
    };

    const handleDelete = () => {
        if (!confirm("¿Querés borrar tu foto de perfil?")) return;

        Inertia.delete(route('profile.photo.destroy'), {
        preserveScroll: true,
        onSuccess: () => {
            setDisplayPhoto('/storage/profile-photos/default.png');
        },
        });

    };

    return (
        <section className={className}>
            <header className="mt-10">
                <h2 className="text-lg font-medium text-gray-900">Foto de perfil</h2>
                <p className="mt-1 text-sm text-gray-600">Sube una imagen para personalizar tu perfil.</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                    <img
                        src={displayPhoto || '/storage/profile-photos/default.png'}
                        alt="Foto de perfil"
                        className="h-20 w-20 rounded-full object-cover"
                    />

                    <input
                        ref={photoInput}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setData('photo', e.target.files[0])}
                        className="block w-full text-sm text-gray-600"
                    />
                </div>

                <InputError message={errors.photo} className="mt-2" />

                {progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-2 rounded-full"
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>

                    <PrimaryButton
                        type="button"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDelete}
                    >
                        Borrar foto
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}
