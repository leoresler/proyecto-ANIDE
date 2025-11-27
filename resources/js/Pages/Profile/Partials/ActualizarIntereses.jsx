import { useEffect } from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { CATEGORIAS, MAX_INTERESES_USUARIO } from "@/utils/categoriasConfig";

export default function ActualizarIntereses({
    className = "",
    onCancel,
    currentInterests = [],
}) {
    const { data, setData, put, processing, errors } = useForm({
        interests: [],
    });

    useEffect(() => {
        setData("interests", currentInterests);
    }, [currentInterests]);

    const toggleInterest = (interest) => {
        if (data.interests.includes(interest)) {
            // Remover interés
            setData(
                "interests",
                data.interests.filter((i) => i !== interest)
            );
        } else {
            // Verificar límite
            if (data.interests.length >= MAX_INTERESES_USUARIO) {
                toast.error(
                    `Podés seleccionar hasta ${MAX_INTERESES_USUARIO} intereses como máximo`
                );
                return;
            }
            // Agregar interés
            setData("interests", [...data.interests, interest]);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Validar que haya al menos un interés
        if (data.interests.length === 0) {
            toast.error("Debes seleccionar al menos un interés");
            return;
        }

        const toastId = toast.loading("Actualizando intereses...");

        put(route("profile.interests.update"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss(toastId);
                toast.success("Intereses actualizados correctamente.");
                if (onCancel) onCancel();
            },
            onError: () => {
                toast.dismiss(toastId);
                toast.error("Hubo un error al actualizar los intereses.");
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    const handleCancel = () => {
        setData("interests", currentInterests);
        if (onCancel) onCancel();
    };

    return (
        <section className={`${className} w-full`}>
            <header className="mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Tus intereses
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Selecciona los temas que más te interesan (máximo{" "}
                    {MAX_INTERESES_USUARIO}).
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 dark:bg-edu-dark">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Selecciona tus intereses
                        </p>
                        <span
                            className={`text-lg font-bold ${
                                data.interests.length >= MAX_INTERESES_USUARIO
                                    ? "text-red-600"
                                    : "text-blue-600 dark:text-gray-300"
                            }`}
                        >
                            {data.interests.length}/{MAX_INTERESES_USUARIO}
                        </span>
                    </div>

                    {/* Categorías disponibles para seleccionar */}
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">
                            Categorías disponibles:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIAS.filter(
                                (cat) => !data.interests.includes(cat)
                            ).map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleInterest(cat)}
                                    disabled={
                                        data.interests.length >=
                                        MAX_INTERESES_USUARIO
                                    }
                                    className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    + {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Intereses seleccionados */}
                    {data.interests.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                                Tus intereses seleccionados:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {data.interests.map((interest) => (
                                    <span
                                        key={interest}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white dark:bg-gray-900 dark:text-gray-200 rounded-lg text-sm shadow-md"
                                    >
                                        {interest}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleInterest(interest)
                                            }
                                            className="hover:bg-blue-700 dark:hover:bg-gray-5yt00 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.interests.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                            No has seleccionado ningún interés aún.
                        </p>
                    )}
                </div>

                <InputError message={errors.interests} className="mt-2" />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                    <PrimaryButton
                        type="submit"
                        disabled={processing || data.interests.length === 0}
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
                </div>
            </form>
        </section>
    );
}
