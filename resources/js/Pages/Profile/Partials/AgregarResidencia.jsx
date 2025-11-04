import { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import {
    geocodeDireccion,
    validarCoordenadasNeuquen,
    ciudadesNeuquen,
} from "@/utils/geocodingUtils";
import toast from "react-hot-toast";

export default function AgregarResidencia({
    className = "",
    residencias = [],
}) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [validandoDireccion, setValidandoDireccion] = useState(false);
    const [direccionValida, setDireccionValida] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: "",
        contacto: "",
        capacidad: "",
        provincia: "Neuquén",
        ciudad: "Neuquén Capital",
        direccion: "",
        info_adicional: "",
        latitud: null,
        longitud: null,
    });

    const validarDireccionCompleta = async () => {
        if (!data.direccion || !data.ciudad) {
            toast.error("Completa la dirección y ciudad antes de validar");
            return;
        }

        setValidandoDireccion(true);
        setDireccionValida(null);

        const loadingToast = toast.loading("Validando dirección...");

        try {
            const resultado = await geocodeDireccion(
                data.direccion,
                data.ciudad,
                data.provincia
            );

            if (resultado.success) {
                const coordsValidas = validarCoordenadasNeuquen(
                    resultado.lat,
                    resultado.lng
                );

                if (coordsValidas) {
                    setData((prevData) => ({
                        ...prevData,
                        latitud: resultado.lat,
                        longitud: resultado.lng,
                    }));
                    setDireccionValida(true);
                    toast.success("¡Dirección válida! Ubicación encontrada", {
                        id: loadingToast,
                    });
                } else {
                    setDireccionValida(false);
                    toast.error("La dirección debe estar en Neuquén", {
                        id: loadingToast,
                    });
                }
            } else {
                setDireccionValida(false);
                toast.error(
                    resultado.error || "No se pudo validar la dirección",
                    {
                        id: loadingToast,
                    }
                );
            }
        } catch (error) {
            console.error("Error:", error);
            setDireccionValida(false);
            toast.error("Error al validar la dirección", {
                id: loadingToast,
            });
        } finally {
            setValidandoDireccion(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        if (!direccionValida) {
            toast.error("Debes validar la dirección antes de guardar");
            return;
        }

        post(route("residencias.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Residencia agregada exitosamente");
                reset();
                setDireccionValida(null);
                setMostrarFormulario(false);

                // Recargar la página después de 1 segundo
                setTimeout(() => {
                    router.reload({ only: ["residencias"] });
                }, 1000);
            },
            onError: (errors) => {
                console.error("Errores:", errors);
                toast.error("Error al guardar la residencia");
            },
        });
    };

    const handleEliminar = (id) => {
        if (confirm("¿Estás seguro de eliminar esta residencia?")) {
            router.delete(route("residencias.destroy", id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Residencia eliminada correctamente");
                    setTimeout(() => {
                        router.reload({ only: ["residencias"] });
                    }, 1000);
                },
                onError: () => {
                    toast.error("Error al eliminar la residencia");
                },
            });
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Sedes o Residencias
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Agrega las diferentes sedes o residencias que pertenecen a
                    tu institución.
                </p>
            </header>

            {/* Lista de residencias existentes */}
            {residencias && residencias.length > 0 && (
                <div className="mt-6 mb-6">
                    <h3 className="text-md font-semibold mb-3">
                        Residencias actuales:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {residencias.map((residencia) => (
                            <div
                                key={residencia.id}
                                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900">
                                        {residencia.nombre}
                                    </h4>
                                    <button
                                        onClick={() =>
                                            handleEliminar(residencia.id)
                                        }
                                        className="text-red-600 hover:text-red-800 transition"
                                        title="Eliminar"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    📍 {residencia.direccion}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    📞 {residencia.contacto}
                                </p>
                                <p className="text-sm text-gray-600">
                                    👥 Capacidad: {residencia.capacidad}
                                </p>
                                {residencia.info_adicional && (
                                    <p className="text-sm text-gray-500 mt-2 italic">
                                        {residencia.info_adicional}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!mostrarFormulario ? (
                <div className="mt-6">
                    <PrimaryButton onClick={() => setMostrarFormulario(true)}>
                        + Agregar Sede/Residencia
                    </PrimaryButton>
                </div>
            ) : (
                <form onSubmit={submit} className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel
                                htmlFor="nombre"
                                value="Nombre de la sede/residencia *"
                            />
                            <TextInput
                                id="nombre"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.nombre}
                                onChange={(e) =>
                                    setData("nombre", e.target.value)
                                }
                                placeholder="Ej: Sede Central, Residencia Norte"
                            />
                            <InputError
                                message={errors.nombre}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="contacto" value="Contacto *" />
                            <TextInput
                                id="contacto"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.contacto}
                                onChange={(e) =>
                                    setData("contacto", e.target.value)
                                }
                                placeholder="Teléfono o email"
                            />
                            <InputError
                                message={errors.contacto}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="capacidad"
                                value="Capacidad *"
                            />
                            <TextInput
                                id="capacidad"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.capacidad}
                                onChange={(e) =>
                                    setData("capacidad", e.target.value)
                                }
                                placeholder="Número de personas"
                                min="1"
                            />
                            <InputError
                                message={errors.capacidad}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            Ubicación *
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Provincia
                                </label>
                                <input
                                    type="text"
                                    value="Neuquén"
                                    disabled
                                    className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 cursor-not-allowed text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Ciudad *
                                </label>
                                <select
                                    value={data.ciudad}
                                    onChange={(e) => {
                                        setData("ciudad", e.target.value);
                                        setDireccionValida(null);
                                    }}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500 text-sm"
                                >
                                    {ciudadesNeuquen.map((ciudad) => (
                                        <option key={ciudad} value={ciudad}>
                                            {ciudad}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Dirección *
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Ingresa calle y número. Ejemplos: "Buenos Aires
                                1400", "Avenida Argentina 1400", "Roca 1070"
                            </p>
                            <input
                                type="text"
                                value={data.direccion}
                                onChange={(e) => {
                                    setData("direccion", e.target.value);
                                    setDireccionValida(null);
                                }}
                                placeholder="Ej: Buenos Aires 1400"
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500 text-sm"
                            />
                            <InputError
                                message={errors.direccion}
                                className="mt-2"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={validarDireccionCompleta}
                            disabled={
                                validandoDireccion ||
                                !data.direccion ||
                                !data.ciudad
                            }
                            className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm ${
                                direccionValida === true
                                    ? "bg-green-600 text-white"
                                    : direccionValida === false
                                    ? "bg-red-600 text-white"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {validandoDireccion ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Validando...
                                </>
                            ) : direccionValida === true ? (
                                <>
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Dirección válida
                                </>
                            ) : direccionValida === false ? (
                                <>
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Dirección inválida - Intenta de nuevo
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                        />
                                    </svg>
                                    Validar dirección
                                </>
                            )}
                        </button>
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="info_adicional"
                            value="Información adicional"
                        />
                        <textarea
                            id="info_adicional"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.info_adicional}
                            onChange={(e) =>
                                setData("info_adicional", e.target.value)
                            }
                            rows="3"
                            placeholder="Servicios, horarios, etc."
                        />
                        <InputError
                            message={errors.info_adicional}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <PrimaryButton
                            disabled={processing || !direccionValida}
                            className="disabled:opacity-50"
                        >
                            {processing ? "Guardando..." : "Guardar Residencia"}
                        </PrimaryButton>

                        <SecondaryButton
                            type="button"
                            onClick={() => {
                                setMostrarFormulario(false);
                                reset();
                                setDireccionValida(null);
                            }}
                        >
                            Cancelar
                        </SecondaryButton>
                    </div>
                </form>
            )}
        </section>
    );
}
