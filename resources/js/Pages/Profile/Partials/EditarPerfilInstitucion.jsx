import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";

export default function EditarPerfilInstitucion({ className = "", onCancel }) {
    const { props } = usePage();
    const institucion = props.institucion || {};

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            tipo_institucion: institucion.tipo_institucion || "",
            direccion: institucion.direccion || "",
            url_sitio_web: institucion.url_sitio_web || "",
            descripcion: institucion.descripcion || "",
            ano_fundacion: institucion.ano_fundacion || "",
        });

    const submit = (e) => {
        e.preventDefault();
        const toastId = toast.loading("Actualizando perfil...");

        patch(route("profile.institucion.update"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss(toastId);
                toast.success("Perfil actualizado correctamente.");
            },
            onError: () => {
                toast.dismiss(toastId);
                toast.error("Hubo un error al actualizar tu perfil.");
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    const handleCancel = () => {
        setData({
            tipo_institucion: institucion.tipo_institucion || "",
            direccion: institucion.direccion || "",
            url_sitio_web: institucion.url_sitio_web || "",
            descripcion: institucion.descripcion || "",
            ano_fundacion: institucion.ano_fundacion || "",
        });
        if (onCancel) onCancel();
    };

    return (
        <section className={`${className} w-full`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">
                    Datos institucionales
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Actualiza los datos de tu institución.
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Para actualizar su correo electrónico, comuníquese con el
                    soporte técnico.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel
                            htmlFor="tipo_institucion"
                            value="Tipo de institución *"
                        />
                        <select
                            id="tipo_institucion"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            value={data.tipo_institucion}
                            onChange={(e) =>
                                setData("tipo_institucion", e.target.value)
                            }
                            required
                        >
                            <option value="">Seleccionar tipo...</option>
                            <option value="Universidad">Universidad</option>
                            <option value="Terciario">Terciario</option>
                            <option value="Establecimiento de educación superior">
                                Establecimiento de educación superior
                            </option>
                            <option value="Otro">Otro</option>
                        </select>
                        <InputError
                            message={errors.tipo_institucion}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="direccion" value="Dirección *" />
                        <TextInput
                            id="direccion"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.direccion}
                            onChange={(e) =>
                                setData("direccion", e.target.value)
                            }
                            required
                            placeholder="Calle, número, ciudad"
                        />
                        <InputError
                            message={errors.direccion}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="url_sitio_web" value="Sitio web" />
                        <TextInput
                            id="url_sitio_web"
                            type="url"
                            className="mt-1 block w-full"
                            value={data.url_sitio_web}
                            onChange={(e) =>
                                setData("url_sitio_web", e.target.value)
                            }
                            placeholder="https://www.mi-institucion.com"
                        />
                        <InputError
                            message={errors.url_sitio_web}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="ano_fundacion"
                            value="Año de fundación"
                        />
                        <TextInput
                            id="ano_fundacion"
                            type="number"
                            className="mt-1 block w-full"
                            value={data.ano_fundacion}
                            onChange={(e) =>
                                setData("ano_fundacion", e.target.value)
                            }
                            placeholder="Ej: 1985"
                            min="1800"
                            max={new Date().getFullYear()}
                        />
                        <InputError
                            message={errors.ano_fundacion}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="descripcion" value="Descripción (es recomendable añadir las carreras o cursos disponibles)" />
                    <textarea
                        id="descripcion"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm resize-vertical"
                        value={data.descripcion}
                        onChange={(e) => setData("descripcion", e.target.value)}
                        rows="4"
                        maxLength="1000"
                        placeholder="Describí tu institución..."
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {data.descripcion?.length || 0}/1000 caracteres
                    </p>
                    <InputError message={errors.descripcion} className="mt-2" />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                        className="w-full sm:w-auto"
                    >
                        Guardar
                    </PrimaryButton>

                    <SecondaryButton
                        type="button"
                        onClick={handleCancel}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </SecondaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Guardado correctamente.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
