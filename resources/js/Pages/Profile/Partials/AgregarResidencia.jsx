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
    const [previsualizacionFoto, setPrevisualizacionFoto] = useState(null);

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
        foto_portada: null,
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
                    { id: loadingToast }
                );
            }
        } catch (error) {
            console.error("Error:", error);
            setDireccionValida(false);
            toast.error("Error al validar la dirección", { id: loadingToast });
        } finally {
            setValidandoDireccion(false);
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Validar tamaño (maximo 4MB)
            if (file.size > 4 * 1024 * 1024) {
                toast.error("La imagen no puede superar los 4MB");
                e.target.value = "";
                return;
            }

            // Validar tipo de archivo
            const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!validTypes.includes(file.type)) {
                toast.error("Solo se permiten archivos JPG, PNG");
                e.target.value = "";
                return;
            }

            // Crear previsualización
            const reader = new FileReader();
            reader.onloadend = () => {
                setPrevisualizacionFoto(reader.result);
            };
            reader.readAsDataURL(file);

            setData("foto_portada", file);
        }
    };

    const eliminarFoto = () => {
        setPrevisualizacionFoto(null);
        setData("foto_portada", null);
        const fileInput = document.getElementById("foto_portada");
        if (fileInput) fileInput.value = "";
    };

    const submit = (e) => {
        e.preventDefault();

        if (!direccionValida) {
            toast.error("Debes validar la dirección antes de guardar");
            return;
        }

        // Crear FormData para enviar archivos
        const formData = new FormData();
        formData.append("nombre", data.nombre);
        formData.append("contacto", data.contacto);
        formData.append("provincia", data.provincia);
        formData.append("ciudad", data.ciudad);
        formData.append("direccion", data.direccion);
        formData.append("latitud", data.latitud);
        formData.append("longitud", data.longitud);

        if (data.capacidad) {
            formData.append("capacidad", data.capacidad);
        }

        if (data.info_adicional) {
            formData.append("info_adicional", data.info_adicional);
        }

        if (data.foto_portada) {
            formData.append("foto_portada", data.foto_portada);
        }

        router.post(route("residencias.store"), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success("Residencia agregada exitosamente");
                reset();
                setDireccionValida(null);
                setPrevisualizacionFoto(null);
                setMostrarFormulario(false);

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
        toast(
            (t) => (
                <div className="flex flex-col space-y-3">
                    <p className="font-medium">
                        ¿Esta seguro que desea eliminar?
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Esta acción no se puede deshacer
                    </p>

                    <div className="flex space-x-2 justify-end">
                        {/* Cancelar */}
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                        >
                            Cancelar
                        </button>

                        {/* Eliminar */}
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);

                                const loadingToast =
                                    toast.loading("Eliminando...");

                                router.delete(
                                    route("residencias.destroy", id),
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            toast.dismiss(loadingToast);
                                            toast.success(
                                                "Eliminado correctamente"
                                            );
                                            setTimeout(() => {
                                                router.reload({
                                                    only: ["residencias"],
                                                });
                                            }, 1000);
                                        },
                                        onError: () => {
                                            toast.dismiss(loadingToast);
                                            toast.error("Error al eliminar");
                                        },
                                    }
                                );
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                style: {
                    background: "#fff",
                    color: "#000",
                    maxWidth: "400px",
                },
            }
        );
    };

    return (
        <section className={`${className} w-full`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Facultades, Sedes o Alojamientos
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Agrega las diferentes facultades, sedes o residencias que
                    pertenecen a tu institución.
                </p>
            </header>

            {residencias && residencias.length > 0 && (
                <div className="mt-6 mb-6">
                    <h3 className="text-md font-semibold mb-3 text-gray-900 dark:text-gray-200">
                        Residencias actuales:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {residencias.map((residencia) => (
                            <div
                                key={residencia.id}
                                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 transition"
                            >
                                {residencia.foto_portada && (
                                    <img
                                        src={`/storage/${residencia.foto_portada}`}
                                        alt={residencia.nombre}
                                        className="w-full h-40 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {residencia.nombre}
                                    </h4>
                                    <button
                                        onClick={() =>
                                            handleEliminar(residencia.id)
                                        }
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
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
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    📍 {residencia.direccion}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    📞 {residencia.contacto}
                                </p>
                                {residencia.capacidad && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        👥 Capacidad: {residencia.capacidad}
                                    </p>
                                )}
                                {residencia.info_adicional && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                                        {residencia.info_adicional.length > 50
                                            ? residencia.info_adicional.substring(
                                                  0,
                                                  50
                                              ) + "..."
                                            : residencia.info_adicional}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!mostrarFormulario ? (
                <div className="mt-6">
                    <PrimaryButton
                        onClick={() => setMostrarFormulario(true)}
                        className="w-full sm:w-auto"
                    >
                        + Agregar
                    </PrimaryButton>
                </div>
            ) : (
                <form onSubmit={submit} className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="nombre" value="Nombre *" />
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
                            <InputLabel htmlFor="capacidad" value="Capacidad" />
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
                            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                Si no ingresas capacidad, no se mostrará en el
                                mapa
                            </p>
                        </div>
                    </div>

                    {/* Foto de portada */}
                    <div className="bg-blue-50 dark:bg-edu-dark p-4 rounded-lg border border-blue-200 dark:border-gray-600">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            Foto de portada
                        </h3>

                        {previsualizacionFoto ? (
                            <div className="relative">
                                <img
                                    src={previsualizacionFoto}
                                    alt="Previsualización"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={eliminarFoto}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-blue-300 dark:border-gray-500 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-gray-400 transition">
                                <svg
                                    className="mx-auto h-12 w-12 text-blue-400 dark:text-blue-500"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="mt-4">
                                    <label
                                        htmlFor="foto_portada"
                                        className="cursor-pointer"
                                    >
                                        <span className="inline-block px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer">
                                            Seleccionar imagen
                                        </span>
                                        <input
                                            id="foto_portada"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleFotoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        JPG, PNG hasta 4MB
                                    </p>
                                </div>
                            </div>
                        )}
                        <InputError
                            message={errors.foto_portada}
                            className="mt-2"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-edu-dark p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">
                                    Provincia
                                </label>
                                <input
                                    type="text"
                                    value="Neuquén"
                                    disabled
                                    className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">
                                    Ciudad *
                                </label>
                                <select
                                    value={data.ciudad}
                                    onChange={(e) => {
                                        setData("ciudad", e.target.value);
                                        setDireccionValida(null);
                                    }}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-gray-500 text-sm"
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
                            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">
                                Dirección *
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
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
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm"
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
                                    : "bg-edu-dark text-white hover:bg-gray-800 dark:bg-gray-500 dark:hover:bg-gray-600"
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
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm resize-vertical"
                            value={data.info_adicional}
                            onChange={(e) =>
                                setData("info_adicional", e.target.value)
                            }
                            rows="3"
                            placeholder="Carreras, Servicios, horarios, etc."
                        />
                        <InputError
                            message={errors.info_adicional}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <PrimaryButton
                            disabled={processing || !direccionValida}
                            className="w-full sm:w-auto"
                        >
                            {processing ? "Guardando..." : "Guardar Residencia"}
                        </PrimaryButton>

                        <SecondaryButton
                            onClick={() => {
                                setMostrarFormulario(false);
                                reset();
                                setDireccionValida(null);
                                setPrevisualizacionFoto(null);
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </SecondaryButton>
                    </div>
                </form>
            )}
        </section>
    );
}
