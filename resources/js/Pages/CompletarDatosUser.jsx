import { useForm, usePage } from "@inertiajs/react";
import { useRef, useEffect, useState } from "react";
import SecondaryButton from "@/Components/SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useValidation } from "@/utils/validaciones";

export default function CompletarDatosUser() {
    const { props } = usePage();
    const { type } = props;

    const allOptions = [
        "Tecnología",
        "Derecho",
        "Medicina",
        "Arte",
        "Deportes",
    ];

    const photoInput = useRef();
    const { validateField } = useValidation();
    const [clientErrors, setClientErrors] = useState({});

    const { data, setData, post, processing, errors } = useForm({
        profile_photo_path: null,
        nombre: "",
        apellido: type === "persona" ? "" : undefined,
        telefono: "",
        ciudad: "",
        provincia: "",
        fecha_nac: type === "persona" ? "" : undefined,
        biografia: type === "persona" ? "" : undefined,
        interests: type === "persona" ? [] : undefined,
        tipo_institucion: type === "institucion" ? "" : undefined,
        direccion: type === "institucion" ? "" : undefined,
        url_sitio_web: type === "institucion" ? "" : undefined,
        descripcion: type === "institucion" ? "" : undefined,
        doc_identificador: "",
        tipo_documento: "CUIT",
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            window.location.href = route("register");
        }, 15 * 60 * 1000);

        return () => clearTimeout(timeout);
    }, []);

    const toggleInterest = (interest) => {
        if (data.interests.includes(interest)) {
            setData("interests", data.interests.filter((i) => i !== interest));
        } else {
            setData("interests", [...data.interests, interest]);
        }
    };

    // Validar campo individual
    const handleFieldValidation = (fieldName, value, extraParams = {}) => {
        const error = validateField(fieldName, value, extraParams);
        setClientErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };

    // Limpiar error cuando el usuario empieza a escribir
    const clearFieldError = (fieldName) => {
        if (clientErrors[fieldName]) {
            setClientErrors(prev => ({
                ...prev,
                [fieldName]: null
            }));
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Validar todos los campos según el tipo
        const fieldsToValidate = [
            'nombre',
            'telefono',
            'ciudad',
            'provincia'
        ];

        if (type === 'persona') {
            fieldsToValidate.push(
                'apellido',
                'fecha_nac',
                'biografia',
                'interests'
            );
        } else {
            fieldsToValidate.push(
                'tipo_institucion',
                'direccion',
                'url_sitio_web',
                { name: 'doc_identificador', params: data.tipo_documento }
            );
        }

        // Validar foto si existe
        if (data.profile_photo_path) {
            const photoError = validateField('profile_photo', data.profile_photo_path);
            if (photoError) {
                setClientErrors(prev => ({ ...prev, profile_photo_path: photoError }));
            }
        }

        const newErrors = {};
        fieldsToValidate.forEach(field => {
            let fieldName, extraParams;
            
            if (typeof field === 'string') {
                fieldName = field;
                extraParams = {};
            } else {
                fieldName = field.name;
                extraParams = field.params;
            }

            const error = validateField(fieldName, data[fieldName], extraParams);
            if (error) newErrors[fieldName] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            return;
        }

        setClientErrors({});

        post(route("completar.datos.store"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                if (photoInput.current) photoInput.current.value = null;
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
                        <TextInput
                            ref={photoInput}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setData("profile_photo_path", file);
                                if (file) {
                                    handleFieldValidation('profile_photo', file);
                                }
                            }}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                        />
                        {(clientErrors.profile_photo_path || errors.profile_photo_path) && (
                            <InputError message={clientErrors.profile_photo_path || errors.profile_photo_path} className="mt-1" />
                        )}
                    </div>

                    {/* Campos comunes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel className="block font-medium mb-1">
                                {type === "institucion" ? "Nombre de la institución" : "Nombre"} *
                            </InputLabel>
                            <TextInput
                                type="text"
                                value={data.nombre}
                                onChange={(e) => {
                                    setData("nombre", e.target.value);
                                    clearFieldError('nombre');
                                }}
                                onBlur={(e) => handleFieldValidation('nombre', e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                
                            />
                            {(clientErrors.nombre || errors.nombre) && (
                                <InputError message={clientErrors.nombre || errors.nombre} className="mt-1" />
                            )}
                        </div>

                        {type === "persona" && (
                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Apellido *
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={data.apellido}
                                    onChange={(e) => {
                                        setData("apellido", e.target.value);
                                        clearFieldError('apellido');
                                    }}
                                    onBlur={(e) => handleFieldValidation('apellido', e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                    
                                />
                                {(clientErrors.apellido || errors.apellido) && (
                                    <InputError message={clientErrors.apellido || errors.apellido} className="mt-1" />
                                )}
                            </div>
                        )}

                        <div>
                            <InputLabel className="block font-medium mb-1">
                                Teléfono *
                            </InputLabel>
                            <TextInput
                                type="text"
                                value={data.telefono}
                                onChange={(e) => {
                                    setData("telefono", e.target.value);
                                    clearFieldError('telefono');
                                }}
                                onBlur={(e) => handleFieldValidation('telefono', e.target.value)}
                                placeholder="Ej: 299 123 4567"
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                
                            />
                            {(clientErrors.telefono || errors.telefono) && (
                                <InputError message={clientErrors.telefono || errors.telefono} className="mt-1" />
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
                                    clearFieldError('ciudad');
                                }}
                                onBlur={(e) => handleFieldValidation('ciudad', e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                
                            />
                            {(clientErrors.ciudad || errors.ciudad) && (
                                <InputError message={clientErrors.ciudad || errors.ciudad} className="mt-1" />
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
                                    setData("provincia", e.target.value);
                                    clearFieldError('provincia');
                                }}
                                onBlur={(e) => handleFieldValidation('provincia', e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                
                            />
                            {(clientErrors.provincia || errors.provincia) && (
                                <InputError message={clientErrors.provincia || errors.provincia} className="mt-1" />
                            )}
                        </div>
                    </div>

                    {/* Campos específicos para persona */}
                    {type === "persona" && (
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Fecha de nacimiento *
                                </InputLabel>
                                <TextInput
                                    type="date"
                                    value={data.fecha_nac}
                                    onChange={(e) => {
                                        setData("fecha_nac", e.target.value);
                                        clearFieldError('fecha_nac');
                                    }}
                                    onBlur={(e) => handleFieldValidation('fecha_nac', e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                    
                                />
                                {(clientErrors.fecha_nac || errors.fecha_nac) && (
                                    <InputError message={clientErrors.fecha_nac || errors.fecha_nac} className="mt-1" />
                                )}
                            </div>

                            {/* <div>
                                <InputLabel className="block font-medium mb-1">
                                    Biografía
                                </InputLabel>
                                <textarea
                                    value={data.biografia || ''}
                                    onChange={(e) => {
                                        setData("biografia", e.target.value);
                                        clearFieldError('biografia');
                                    }}
                                    onBlur={(e) => handleFieldValidation('biografia', e.target.value)}
                                    maxLength="500"
                                    rows="3"
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                    placeholder="Cuéntanos sobre ti..."
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {data.biografia?.length || 0}/500 caracteres
                                </p>
                                {(clientErrors.biografia || errors.biografia) && (
                                    <InputError message={clientErrors.biografia || errors.biografia} className="mt-1" />
                                )}
                            </div> */}

                            <div>
                                <p className="font-medium mb-2">
                                    Seleccioná tus intereses: *
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {allOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                toggleInterest(option);
                                                clearFieldError('interests');
                                            }}
                                            className={`px-4 py-2 rounded-full border transition-colors ${
                                                data.interests.includes(option)
                                                    ? "bg-gray-600 text-white border-gray-600"
                                                    : "bg-white text-black border-gray-300 hover:border-gray-400"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {(clientErrors.interests || errors.interests) && (
                                    <InputError message={clientErrors.interests || errors.interests} className="mt-1" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Campos específicos para institución */}
                    {type === "institucion" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Tipo de institución *
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={data.tipo_institucion}
                                    onChange={(e) => {
                                        setData("tipo_institucion", e.target.value);
                                        clearFieldError('tipo_institucion');
                                    }}
                                    onBlur={(e) => handleFieldValidation('tipo_institucion', e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                    placeholder="Ej: Universidad, Terciario, etc."
                                />
                                {(clientErrors.tipo_institucion || errors.tipo_institucion) && (
                                    <InputError message={clientErrors.tipo_institucion || errors.tipo_institucion} className="mt-1" />
                                )}
                            </div>

                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Dirección *
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={data.direccion}
                                    onChange={(e) => {
                                        setData("direccion", e.target.value);
                                        clearFieldError('direccion');
                                    }}
                                    onBlur={(e) => handleFieldValidation('direccion', e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                />
                                {(clientErrors.direccion || errors.direccion) && (
                                    <InputError message={clientErrors.direccion || errors.direccion} className="mt-1" />
                                )}
                            </div>

                            {/* Documento Identificador */}
                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-semibold mb-3">
                                    Documento Identificador *
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Proporciona un documento que te identifique (CUIT, CUIL, DNI del responsable)
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-medium mb-1">
                                            Tipo de documento *
                                        </label>
                                        <select
                                            value={data.tipo_documento}
                                            onChange={(e) => {
                                                setData("tipo_documento", e.target.value);
                                                // Limpiar error del documento cuando cambia el tipo
                                                clearFieldError('doc_identificador');
                                            }}
                                            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                            
                                        >
                                            <option value="CUIT">CUIT</option>
                                            <option value="CUIL">CUIL</option>
                                            <option value="DNI">DNI (Responsable)</option>
                                        </select>
                                        {errors.tipo_documento && (
                                            <InputError message={errors.tipo_documento} className="mt-1" />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-1">
                                            Número *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.doc_identificador}
                                            onChange={(e) => {
                                                setData("doc_identificador", e.target.value);
                                                clearFieldError('doc_identificador');
                                            }}
                                            onBlur={(e) => handleFieldValidation(
                                                'doc_identificador', 
                                                e.target.value, 
                                                data.tipo_documento
                                            )}
                                            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-gray-500"
                                            placeholder={
                                                data.tipo_documento === 'DNI' 
                                                    ? "Ej: 12345678" 
                                                    : "Ej: 20-12345678-9"
                                            }
                                            
                                        />
                                        {(clientErrors.doc_identificador || errors.doc_identificador) && (
                                            <InputError message={clientErrors.doc_identificador || errors.doc_identificador} className="mt-1" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error general */}
                    {errors.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {errors.error}
                        </div>
                    )}

                    {/* Botón de envío */}
                    <div className="pt-4">
                        <SecondaryButton
                            type="submit"
                            disabled={processing}
                            className="w-full px-6 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-edu-dark hover:bg-black"
                        >
                            {processing ? "Creando cuenta..." : "Crear mi cuenta"}
                        </SecondaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}