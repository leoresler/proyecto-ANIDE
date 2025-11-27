import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useValidation } from "@/utils/validaciones";
import {
    geocodeDireccion,
    validarCoordenadasNeuquen,
} from "@/utils/geocodingUtils";
import toast from "react-hot-toast";
import ProfilePhotoInput from "@/Components/CompletarDatos/ProfilePhotoInput";
import InterestsSelector from "@/Components/CompletarDatos/InterestsSelector";
import InstitucionFormFields from "@/Components/CompletarDatos/InstitucionFormFields";
import PersonaFormFields from "@/Components/CompletarDatos/PersonaFormFields";
import { MAX_INTERESES_USUARIO } from "@/utils/categoriasConfig";

export default function CompletarDatosUser() {
    const { props } = usePage();
    const { type } = props;

    const { validateField } = useValidation();
    const [clientErrors, setClientErrors] = useState({});
    const [validandoDireccion, setValidandoDireccion] = useState(false);
    const [direccionValida, setDireccionValida] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [esAproximado, setEsAproximado] = useState(false);
    const [mensajeValidacion, setMensajeValidacion] = useState("");

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

    const normalizarTexto = (texto) => {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const dataNormalizada = {
        ...data,
        ciudad: normalizarTexto(data.ciudad),
    };

    // Timeout para redirigir después de 15 minutos
    useEffect(() => {
        const timeout = setTimeout(() => {
            window.location.href = route("register");
        }, 15 * 60 * 1000);

        return () => clearTimeout(timeout);
    }, []);

    const toggleInterest = (interest) => {
        if (data.interests.includes(interest)) {
            setData(
                "interests",
                data.interests.filter((i) => i !== interest)
            );
        } else {
            if (data.interests.length >= MAX_INTERESES_USUARIO) {
                toast.error(
                    `Podés seleccionar hasta ${MAX_INTERESES_USUARIO} intereses como máximo`
                );
                return;
            }
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

    const handlePhotoChange = (file) => {
        setData("profile_photo_path", file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            handleFieldValidation("profile_photo", file);
        } else {
            setPhotoPreview(null);
        }
    };

    const handlePhotoRemove = () => {
        setPhotoPreview(null);
        setData("profile_photo_path", null);
        clearFieldError("profile_photo_path");
    };

    const validarDireccionCompleta = async () => {
        if (!data.direccion || !data.ciudad) {
            toast.error("Completa la dirección y ciudad antes de validar");
            return;
        }

        setValidandoDireccion(true);
        setDireccionValida(null);
        setMensajeValidacion("");
        setEsAproximado(false);

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
                    resultado.lng,
                    false
                );

                if (coordsValidas) {
                    setData((prevData) => ({
                        ...prevData,
                        latitud: resultado.lat,
                        longitud: resultado.lng,
                    }));
                    setDireccionValida(true);

                    if (resultado.esAproximado) {
                        setEsAproximado(true);
                        setMensajeValidacion(
                            `⚠️ No se encontró la dirección exacta.\n\nSe usará el centro de ${data.ciudad} como ubicación aproximada.\n\nPodrás ajustar la ubicación más tarde desde tu perfil.`
                        );
                        toast.warning("Ubicación aproximada encontrada", {
                            id: loadingToast,
                        });
                    } else {
                        setEsAproximado(false);
                        setMensajeValidacion(
                            `✓ Dirección encontrada: ${resultado.displayName}`
                        );
                        toast.success(
                            "¡Dirección válida! Ubicación encontrada",
                            {
                                id: loadingToast,
                            }
                        );
                    }
                } else {
                    setDireccionValida(false);
                    setMensajeValidacion(
                        resultado.error || "La dirección debe estar en Neuquén"
                    );
                    toast.error(
                        resultado.error || "La dirección debe estar en Neuquén",
                        { id: loadingToast }
                    );
                }
            } else {
                setDireccionValida(false);
                setEsAproximado(false);
                setMensajeValidacion(
                    resultado.error || "No se pudo encontrar la dirección"
                );
                toast.error(
                    resultado.error || "No se pudo validar la dirección",
                    { id: loadingToast }
                );
            }
        } catch (error) {
            setDireccionValida(false);
            setEsAproximado(false);
            setMensajeValidacion(
                "Error al validar la dirección. Intenta nuevamente."
            );
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
            data: dataNormalizada,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success("Datos completados exitosamente");
            },
            onError: (errors) => {
                // console.error("Errores:", errors);
                toast.error("Error al guardar los datos");
            },
        });
    };

    const handleDataChange = (field, value) => {
        setData(field, value);
    };

    return (
        <AuthenticatedLayout showRecomendaciones={false}>
            <div className="mb-8 bg-white dark:bg-gray-800 text-black border border-gray-200 dark:border-edu-dark rounded-lg dark:text-gray-100 p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">
                    {type === "institucion"
                        ? "Completá los datos de tu institución"
                        : "Completá tus datos personales"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Este es el último paso para crear tu cuenta
                </p>

                <form onSubmit={submit} className="space-y-4">
                    <ProfilePhotoInput
                        photoPreview={photoPreview}
                        onPhotoChange={handlePhotoChange}
                        onPhotoRemove={handlePhotoRemove}
                        error={
                            clientErrors.profile_photo_path ||
                            errors.profile_photo_path
                        }
                    />

                    {type === "institucion" ? (
                        <InstitucionFormFields
                            data={data}
                            errors={errors}
                            clientErrors={clientErrors}
                            onDataChange={handleDataChange}
                            onFieldValidation={handleFieldValidation}
                            clearFieldError={clearFieldError}
                            validandoDireccion={validandoDireccion}
                            direccionValida={direccionValida}
                            onValidarDireccion={validarDireccionCompleta}
                            setDireccionValida={setDireccionValida}
                        />
                    ) : (
                        <PersonaFormFields
                            data={data}
                            errors={errors}
                            clientErrors={clientErrors}
                            onDataChange={handleDataChange}
                            onFieldValidation={handleFieldValidation}
                            clearFieldError={clearFieldError}
                        />
                    )}

                    {errors.error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                            {errors.error}
                        </div>
                    )}

                    <InterestsSelector
                        selectedInterests={data.interests}
                        onToggleInterest={(interest) => {
                            toggleInterest(interest);
                            clearFieldError("interests");
                        }}
                        error={clientErrors.interests || errors.interests}
                    />

                    <div className="pt-4">
                        <PrimaryButton
                            type="submit"
                            disabled={
                                processing ||
                                (type === "institucion" && !direccionValida)
                            }
                            className="w-full"
                        >
                            {processing
                                ? "Creando cuenta..."
                                : "Crear mi cuenta"}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}