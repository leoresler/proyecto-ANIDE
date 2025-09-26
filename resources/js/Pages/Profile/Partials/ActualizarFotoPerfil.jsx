import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function ActualizarFotoPerfil({ className = '', currentPhoto }) {

    const photoInput = useRef();

    const { data, setData, errors, post, progress, processing } = useForm({
        photo: null,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.photo.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setData('photo', null);
                if (photoInput.current) {
                    photoInput.current.value = null;
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Foto de perfil
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Sube una imagen para personalizar tu perfil.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                    <img
                        src={currentPhoto}
                        alt="Foto de perfil"
                        className="h-20 w-20 rounded-full object-cover"
                    />

                    <input
                        ref={photoInput}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={(e) => setData('photo', e.target.files[0])}
                        className="block w-full text-sm text-gray-600"
                    />
                </div>

                <InputError message={errors.photo} className="mt-2" />

                {progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progress.percentage}%` }}
                        ></div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        Guardar
                    </PrimaryButton>
                </div>
            </form>
            <PrimaryButton
            type="button"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
                if (confirm("¿Querés borrar tu foto de perfil?")) {
                    Inertia.delete(route('profile.photo.destroy'), {
                        preserveScroll: true,
                        onSuccess: () => console.log("Foto borrada"),
                    });
                }
            }}

            >
                Borrar foto
            </PrimaryButton>

        </section>
    );
}
