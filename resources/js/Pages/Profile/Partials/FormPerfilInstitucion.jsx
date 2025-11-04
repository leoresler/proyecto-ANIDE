import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function FormPerfilInstitucion({ className = '' }) {
    const { props } = usePage();
    const institucion = props.institucion || {};

    // Estado inicial del formulario
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        tipo_institucion: institucion.tipo_institucion || '',
        direccion: institucion.direccion || '',
        url_sitio_web: institucion.url_sitio_web || '',
    });

    // Manejar envío del formulario
    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.institucion.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Datos institucionales
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Actualizá los datos de tu institución.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Tipo de institución */}
                <div>
                    <InputLabel htmlFor="tipo_institucion" value="Tipo de institución" />
                    <TextInput
                        id="tipo_institucion"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.tipo_institucion}
                        onChange={(e) => setData('tipo_institucion', e.target.value)}
                        required
                    />
                    <InputError message={errors.tipo_institucion} className="mt-2" />
                </div>

                {/* Dirección */}
                <div>
                    <InputLabel htmlFor="direccion" value="Dirección" />
                    <TextInput
                        id="direccion"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.direccion}
                        onChange={(e) => setData('direccion', e.target.value)}
                        required
                    />
                    <InputError message={errors.direccion} className="mt-2" />
                </div>

                {/* URL del sitio web */}
                <div>
                    <InputLabel htmlFor="url_sitio_web" value="Sitio web (opcional)" />
                    <TextInput
                        id="url_sitio_web"
                        type="url"
                        className="mt-1 block w-full"
                        value={data.url_sitio_web}
                        onChange={(e) => setData('url_sitio_web', e.target.value)}
                        placeholder="https://www.mi-institucion.com"
                    />
                    <InputError message={errors.url_sitio_web} className="mt-2" />
                </div>

                {/* Botón de guardar */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Guardado correctamente.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

