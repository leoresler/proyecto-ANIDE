import { useForm, usePage } from "@inertiajs/react";
import { useRef, useEffect, useState } from "react";
import SecondaryButton from "@/Components/SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useValidation } from "@/utils/validaciones";
import {
    geocodeDireccion,
    validarCoordenadasNeuquen,
    ciudadesNeuquen,
} from "@/utils/geocodingUtils";
import toast from "react-hot-toast";
import { CATEGORIAS, MAX_INTERESES_USUARIO } from "@/utils/categoriasConfig";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CompletarDatosUser() {
    const { props } = usePage();
    const { type } = props;

    const photoInput = useRef();
    const { validateField } = useValidation();
    const [clientErrors, setClientErrors] = useState({});
    const [validandoDireccion, setValidandoDireccion] = useState(false);
    const [direccionValida, setDireccionValida] = useState(null);

    const [photoPreview, setPhotoPreview] = useState(null);

    const [mostrarIntereses, setMostrarIntereses] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        profile_photo_path: null,
        nombre: "",
        apellido: type === "persona" ? "" : undefined,
        telefono: "",
        ciudad: type === "institucion" ? "Neuquén Capital" : "",
        provincia: type === "institucion" ? "Neuquén" : "",
        direccion: type === "institucion" ? "" : undefined,
        latitud: type === "institucion" ? null : undefined,
        longitud: type === "institucion" ? null : undefined,
        fecha_nac: type === "persona" ? "" : undefined,
        biografia: type === "persona" ? "" : undefined,
        interests: [],
        tipo_institucion: type === "institucion" ? "" : undefined,
        url_sitio_web: type === "institucion" ? "" : undefined,
        descripcion: type === "institucion" ? "" : undefined,
        doc_identificador: type === "institucion" ? "" : undefined,
        tipo_documento: type === "institucion" ? "CUIT" : undefined,
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            window.location.href = route("register");
        }, 15 * 60 * 1000);

        return () => clearTimeout(timeout);
    }, []);

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

    const handleFieldValidation = (fieldName, value, extraParams = {}) => {
        const error = validateField(fieldName, value, extraParams);
        setClientErrors((prev) => ({
            ...prev,
            [fieldName]: error,
        }));
    };

    const clearFieldError = (fieldName) => {
        if (clientErrors[fieldName]) {
            setClientErrors((prev) => ({
                ...prev,
                [fieldName]: null,
            }));
        }
    };

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
                    toast.error(
                        resultado.error || "La dirección debe estar en Neuquén",
                        {
                            id: loadingToast,
                        }
                    );
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

        if (type === "institucion" && !direccionValida) {
            toast.error("Debes validar la dirección antes de continuar");
            return;
        }

        const fieldsToValidate = ["nombre", "telefono"];

        if (type === "persona") {
            fieldsToValidate.push(
                "apellido",
                "fecha_nac",
                "interests",
                "ciudad",
                "provincia"
            );
        } else {
            fieldsToValidate.push("tipo_institucion", "direccion", {
                name: "doc_identificador",
                params: data.tipo_documento,
            });
            if (data.tipo_institucion === "Otro") {
                fieldsToValidate.push("tipo_institucion_otro");
            }
        }

        if (data.profile_photo_path) {
            const photoError = validateField(
                "profile_photo",
                data.profile_photo_path
            );
            if (photoError) {
                setClientErrors((prev) => ({
                    ...prev,
                    profile_photo_path: photoError,
                }));
            }
        }

        const newErrors = {};
        fieldsToValidate.forEach((field) => {
            let fieldName, extraParams;

            if (typeof field === "string") {
                fieldName = field;
                extraParams = {};
            } else {
                fieldName = field.name;
                extraParams = field.params;
            }

            const error = validateField(
                fieldName,
                data[fieldName],
                extraParams
            );
            if (error) newErrors[fieldName] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            toast.error("Por favor corrige los errores en el formulario");
            return;
        }

        setClientErrors({});

        post(route("completar.datos.store"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                if (photoInput.current) photoInput.current.value = null;
                toast.success("Datos completados exitosamente");
            },
            onError: (errors) => {
                console.error("Errores:", errors);
                toast.error("Error al guardar los datos");
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="bg-white text-black p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-2">
                    {type === "institucion"
                        ? "Completá los datos de tu institución"
                        : "Completá tus datos personales"}
                </h2>
                <p className="text-gray-600 mb-6">
                    Este es el último paso para crear tu cuenta
                </p>

                <form onSubmit={submit} className="space-y-4">
                    {/* Foto de perfil */}
                    <div>
                        <InputLabel className="block font-medium mb-2">
                            Foto de perfil:
                        </InputLabel>

                        {/* Contenedor flex para input y preview */}
                        <div className="flex items-center gap-4">
                            {/* Preview circular con botón X */}
                            {photoPreview && (
                                <div className="flex-shrink-0 relative">
                                    <img
                                        src={photoPreview}
                                        alt="Vista previa"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                                    />
                                    {/* Botón X para eliminar */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhotoPreview(null);
                                            setData("profile_photo_path", null);
                                            if (photoInput.current) {
                                                photoInput.current.value = null;
                                            }
                                            clearFieldError(
                                                "profile_photo_path"
                                            );
                                        }}
                                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-colors"
                                        title="Eliminar foto"
                                    >
                                        <svg
                                            className="w-4 h-4"
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
                            )}

                            {/* Input de archivo */}
                            <div className="flex-1">
                                <TextInput
                                    ref={photoInput}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setData("profile_photo_path", file);

                                        // Crear preview de la imagen
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setPhotoPreview(reader.result);
                                            };
                                            reader.readAsDataURL(file);

                                            handleFieldValidation(
                                                "profile_photo",
                                                file
                                            );
                                        } else {
                                            setPhotoPreview(null);
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                />
                            </div>
                        </div>

                        {(clientErrors.profile_photo_path ||
                            errors.profile_photo_path) && (
                            <InputError
                                message={
                                    clientErrors.profile_photo_path ||
                                    errors.profile_photo_path
                                }
                                className="mt-1"
                            />
                        )}
                    </div>

                    {/* Campos para institución */}
                    {type === "institucion" && (
                        <>
                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Nombre de la institución *
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => {
                                        setData("nombre", e.target.value);
                                        clearFieldError("nombre");
                                    }}
                                    onBlur={(e) =>
                                        handleFieldValidation(
                                            "nombre",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                />
                                {(clientErrors.nombre || errors.nombre) && (
                                    <InputError
                                        message={
                                            clientErrors.nombre || errors.nombre
                                        }
                                        className="mt-1"
                                    />
                                )}
                            </div>

                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Tipo de institución *
                                </InputLabel>
                                <select
                                    value={data.tipo_institucion}
                                    onChange={(e) => {
                                        setData(
                                            "tipo_institucion",
                                            e.target.value
                                        );
                                        clearFieldError("tipo_institucion");
                                    }}
                                    onBlur={(e) =>
                                        handleFieldValidation(
                                            "tipo_institucion",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                >
                                    <option value="">
                                        Seleccionar tipo...
                                    </option>
                                    <option value="Universidad">
                                        Universidad
                                    </option>
                                    <option value="Instituto Universitario">
                                        Instituto Universitario
                                    </option>
                                    <option value="Terciario">Terciario</option>
                                    <option value="Establecimiento de educación superior">
                                        Establecimiento de educación superior
                                    </option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {(clientErrors.tipo_institucion ||
                                    errors.tipo_institucion) && (
                                    <InputError
                                        message={
                                            clientErrors.tipo_institucion ||
                                            errors.tipo_institucion
                                        }
                                        className="mt-1"
                                    />
                                )}

                                {/* Campo de texto que aparece si selecciona "Otro" */}
                                {data.tipo_institucion === "Otro" && (
                                    <div className="mt-3">
                                        <InputLabel className="block font-medium mb-1">
                                            Especificar tipo de institución *
                                        </InputLabel>
                                        <TextInput
                                            type="text"
                                            value={
                                                data.tipo_institucion_otro || ""
                                            }
                                            onChange={(e) => {
                                                setData(
                                                    "tipo_institucion_otro",
                                                    e.target.value
                                                );
                                                clearFieldError(
                                                    "tipo_institucion_otro"
                                                );
                                            }}
                                            onBlur={(e) =>
                                                handleFieldValidation(
                                                    "tipo_institucion_otro",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                            placeholder="Ej: Instituto técnico, Centro de formación..."
                                        />
                                        {(clientErrors.tipo_institucion_otro ||
                                            errors.tipo_institucion_otro) && (
                                            <InputError
                                                message={
                                                    clientErrors.tipo_institucion_otro ||
                                                    errors.tipo_institucion_otro
                                                }
                                                className="mt-1"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Teléfono *
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) => {
                                        setData("telefono", e.target.value);
                                        clearFieldError("telefono");
                                    }}
                                    onBlur={(e) =>
                                        handleFieldValidation(
                                            "telefono",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ej: 299 123 4567"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                />
                                {(clientErrors.telefono || errors.telefono) && (
                                    <InputError
                                        message={
                                            clientErrors.telefono ||
                                            errors.telefono
                                        }
                                        className="mt-1"
                                    />
                                )}
                            </div>

                            {/* Documento Identificador */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-semibold mb-3">
                                    Documento Identificador *
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Proporciona un documento que te identifique
                                    (CUIT, CUIL, DNI del responsable)
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-medium mb-1">
                                            Tipo de documento *
                                        </label>
                                        <select
                                            value={data.tipo_documento}
                                            onChange={(e) => {
                                                setData(
                                                    "tipo_documento",
                                                    e.target.value
                                                );
                                                clearFieldError(
                                                    "doc_identificador"
                                                );
                                            }}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                        >
                                            <option value="CUIT">CUIT</option>
                                            <option value="CUIL">CUIL</option>
                                            <option value="DNI">
                                                DNI (Responsable)
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-1">
                                            Número *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.doc_identificador}
                                            onChange={(e) => {
                                                setData(
                                                    "doc_identificador",
                                                    e.target.value
                                                );
                                                clearFieldError(
                                                    "doc_identificador"
                                                );
                                            }}
                                            onBlur={(e) =>
                                                handleFieldValidation(
                                                    "doc_identificador",
                                                    e.target.value,
                                                    data.tipo_documento
                                                )
                                            }
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                            placeholder={
                                                data.tipo_documento === "DNI"
                                                    ? "Ej: 12345678"
                                                    : "Ej: 20-12345678-9"
                                            }
                                        />
                                        {(clientErrors.doc_identificador ||
                                            errors.doc_identificador) && (
                                            <InputError
                                                message={
                                                    clientErrors.doc_identificador ||
                                                    errors.doc_identificador
                                                }
                                                className="mt-1"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-gray-200">
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
                                    Ubicación de la institución *
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block font-medium mb-1">
                                            Provincia
                                        </label>
                                        <input
                                            type="text"
                                            value="Neuquén"
                                            disabled
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-1">
                                            Ciudad *
                                        </label>
                                        <select
                                            value={data.ciudad}
                                            onChange={(e) => {
                                                setData(
                                                    "ciudad",
                                                    e.target.value
                                                );
                                                setDireccionValida(null);
                                            }}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                        >
                                            {ciudadesNeuquen.map((ciudad) => (
                                                <option
                                                    key={ciudad}
                                                    value={ciudad}
                                                >
                                                    {ciudad}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block font-medium mb-1">
                                        Dirección *
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Ingresa calle y número. Ejemplos:
                                        "Buenos Aires 1400", "Avenida Argentina
                                        1400", "Roca 1070"
                                    </p>
                                    <input
                                        type="text"
                                        value={data.direccion}
                                        onChange={(e) => {
                                            setData(
                                                "direccion",
                                                e.target.value
                                            );
                                            setDireccionValida(null);
                                            clearFieldError("direccion");
                                        }}
                                        placeholder="Ej: Buenos Aires 1400"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                    />
                                    {(clientErrors.direccion ||
                                        errors.direccion) && (
                                        <InputError
                                            message={
                                                clientErrors.direccion ||
                                                errors.direccion
                                            }
                                            className="mt-1"
                                        />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={validarDireccionCompleta}
                                    disabled={
                                        validandoDireccion ||
                                        !data.direccion ||
                                        !data.ciudad
                                    }
                                    className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                                        direccionValida === true
                                            ? "bg-green-600 text-white"
                                            : direccionValida === false
                                            ? "bg-red-600 text-white"
                                            : "bg-edu-dark text-white hover:bg-gray-800"
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
                                            Dirección inválida - Intenta de
                                            nuevo
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
                        </>
                    )}

                    {/* Campos para persona */}
                    {type === "persona" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel className="block font-medium mb-1">
                                        Nombre *
                                    </InputLabel>
                                    <TextInput
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => {
                                            setData("nombre", e.target.value);
                                            clearFieldError("nombre");
                                        }}
                                        onBlur={(e) =>
                                            handleFieldValidation(
                                                "nombre",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                    />
                                    {(clientErrors.nombre || errors.nombre) && (
                                        <InputError
                                            message={
                                                clientErrors.nombre ||
                                                errors.nombre
                                            }
                                            className="mt-1"
                                        />
                                    )}
                                </div>

                                <div>
                                    <InputLabel className="block font-medium mb-1">
                                        Apellido *
                                    </InputLabel>
                                    <TextInput
                                        type="text"
                                        value={data.apellido}
                                        onChange={(e) => {
                                            setData("apellido", e.target.value);
                                            clearFieldError("apellido");
                                        }}
                                        onBlur={(e) =>
                                            handleFieldValidation(
                                                "apellido",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                    />
                                    {(clientErrors.apellido ||
                                        errors.apellido) && (
                                        <InputError
                                            message={
                                                clientErrors.apellido ||
                                                errors.apellido
                                            }
                                            className="mt-1"
                                        />
                                    )}
                                </div>

                                <div>
                                    <InputLabel className="block font-medium mb-1">
                                        Teléfono *
                                    </InputLabel>
                                    <TextInput
                                        type="text"
                                        value={data.telefono}
                                        onChange={(e) => {
                                            setData("telefono", e.target.value);
                                            clearFieldError("telefono");
                                        }}
                                        onBlur={(e) =>
                                            handleFieldValidation(
                                                "telefono",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ej: 299 123 4567"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                    />
                                    {(clientErrors.telefono ||
                                        errors.telefono) && (
                                        <InputError
                                            message={
                                                clientErrors.telefono ||
                                                errors.telefono
                                            }
                                            className="mt-1"
                                        />
                                    )}
                                </div>

                                <div>
                                    <InputLabel className="block font-medium mb-1">
                                        Ciudad *
                                    </InputLabel>
                                    <TextInput
                                        type="text"
                                        value={data.ciudad}
                                        onChange={(e) => {
                                            setData("ciudad", e.target.value);
                                            clearFieldError("ciudad");
                                        }}
                                        onBlur={(e) =>
                                            handleFieldValidation(
                                                "ciudad",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                    />
                                    {(clientErrors.ciudad || errors.ciudad) && (
                                        <InputError
                                            message={
                                                clientErrors.ciudad ||
                                                errors.ciudad
                                            }
                                            className="mt-1"
                                        />
                                    )}
                                </div>

                                <div>
                                    <InputLabel className="block font-medium mb-1">
                                        Provincia *
                                    </InputLabel>
                                    <TextInput
                                        type="text"
                                        value={data.provincia}
                                        onChange={(e) => {
                                            setData(
                                                "provincia",
                                                e.target.value
                                            );
                                            clearFieldError("provincia");
                                        }}
                                        onBlur={(e) =>
                                            handleFieldValidation(
                                                "provincia",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                    />
                                    {(clientErrors.provincia ||
                                        errors.provincia) && (
                                        <InputError
                                            message={
                                                clientErrors.provincia ||
                                                errors.provincia
                                            }
                                            className="mt-1"
                                        />
                                    )}
                                </div>

                                <div>
                                    <InputLabel className="block font-medium mb-1">
                                        Fecha de nacimiento *
                                    </InputLabel>
                                    <TextInput
                                        type="date"
                                        value={data.fecha_nac}
                                        onChange={(e) => {
                                            setData(
                                                "fecha_nac",
                                                e.target.value
                                            );
                                            clearFieldError("fecha_nac");
                                        }}
                                        onBlur={(e) =>
                                            handleFieldValidation(
                                                "fecha_nac",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500"
                                    />
                                    {(clientErrors.fecha_nac ||
                                        errors.fecha_nac) && (
                                        <InputError
                                            message={
                                                clientErrors.fecha_nac ||
                                                errors.fecha_nac
                                            }
                                            className="mt-1"
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Error general */}
                    {errors.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {errors.error}
                        </div>
                    )}

                    {/* SECCIÓN DE INTERESES */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-bold text-lg text-gray-900">
                                    Seleccioná tus intereses *
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Elegí hasta {MAX_INTERESES_USUARIO}{" "}
                                    categorías que te interesen
                                </p>
                            </div>
                            <div className="text-right">
                                <span
                                    className={`text-lg font-bold ${
                                        data.interests.length >=
                                        MAX_INTERESES_USUARIO
                                            ? "text-red-600"
                                            : "text-blue-600"
                                    }`}
                                >
                                    {data.interests.length}/
                                    {MAX_INTERESES_USUARIO}
                                </span>
                            </div>
                        </div>

                        {/* Categorías disponibles para seleccionar */}
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Categorías disponibles:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIAS.filter(
                                    (cat) => !data.interests.includes(cat)
                                ).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            toggleInterest(cat);
                                            clearFieldError("interests");
                                        }}
                                        disabled={
                                            data.interests.length >=
                                            MAX_INTERESES_USUARIO
                                        }
                                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        + {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Intereses seleccionados */}
                        {data.interests.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Tus intereses seleccionados:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {data.interests.map((interest) => (
                                        <span
                                            key={interest}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm shadow-md"
                                        >
                                            {interest}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    toggleInterest(interest);
                                                    clearFieldError(
                                                        "interests"
                                                    );
                                                }}
                                                className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                                            >
                                                <svg
                                                    className="w-3.5 h-3.5"
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
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(clientErrors.interests || errors.interests) && (
                            <InputError
                                message={
                                    clientErrors.interests || errors.interests
                                }
                                className="mt-2"
                            />
                        )}
                    </div>

                    {/* Botón de envío */}
                    <div className="pt-4">
                        <SecondaryButton
                            type="submit"
                            disabled={
                                processing ||
                                (type === "institucion" && !direccionValida)
                            }
                            className="w-full px-6 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-edu-dark hover:bg-gray-800"
                        >
                            {processing
                                ? "Creando cuenta..."
                                : "Crear mi cuenta"}
                        </SecondaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
