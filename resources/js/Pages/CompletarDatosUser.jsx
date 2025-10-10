import { useForm, usePage } from "@inertiajs/react";
import { useRef, useEffect } from "react";
import SecondaryButton from "@/Components/SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function CompletarDatosUser() {
    const { props } = usePage();
    const { type } = props; // persona o institucion

    const allOptions = [
        "Tecnología",
        "Derecho",
        "Medicina",
        "Arte",
        "Deportes",
    ];

    // Referencia para TextInput de foto
    const photoInput = useRef();

    // Formulario
    const { data, setData, post, processing, errors } = useForm({
        profile_photo_path: null,
        nombre: "",
        apellido: type === "persona" ? "" : undefined,
        telefono: "",
        ciudad: "",
        provincia: "",
        // Campos específicos para persona
        fecha_nac: type === "persona" ? "" : undefined,
        biografia: type === "persona" ? "" : undefined,
        interests: [],
        // Campos específicos para institución
        tipo_institucion: type === "institucion" ? "" : undefined,
        direccion: type === "institucion" ? "" : undefined,
        sitio_web: type === "institucion" ? "" : undefined,
        descripcion: type === "institucion" ? "" : undefined,
        documento_identificador: type === 'institucion' ? '' : undefined,
        tipo_documento: type === 'institucion' ? 'CUIT' : undefined,
    });

    // sesion temporal
    useEffect(() => {
        const timeout = setTimeout(() => {
            window.location.href = route("register");
        }, 15 * 60 * 1000); // 15 minutos

        return () => clearTimeout(timeout);
    }, []);

    const toggleInterest = (interest) => {
        if (data.interests.includes(interest)) {
            setData(
                "interests",
                data.interests.filter((i) => i !== interest)
            );
        } else {
            setData("interests", [...data.interests, interest]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("completar.datos.store"), {
            // ruta de backend
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
                            onChange={(e) =>
                                setData("profile_photo_path", e.target.files[0])
                            }
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {errors.profile_photo_path && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.profile_photo_path}
                            </p>
                        )}
                    </div>

                    {/* Campos comunes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel className="block font-medium mb-1">
                                {type === "institucion"
                                    ? "Nombre de la institución"
                                    : "Nombre"}{" "}
                                *
                            </InputLabel>
                            <TextInput
                                type="text"
                                value={data.nombre}
                                onChange={(e) =>
                                    setData("nombre", e.target.value)
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {errors.nombre && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.nombre}
                                </p>
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
                                    onChange={(e) =>
                                        setData("apellido", e.target.value)
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.apellido && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.apellido}
                                    </p>
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
                                onChange={(e) =>
                                    setData("telefono", e.target.value)
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {errors.telefono && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.telefono}
                                </p>
                            )}
                        </div>

                        <div>
                            <InputLabel className="block font-medium mb-1">
                                Ciudad *
                            </InputLabel>
                            <TextInput
                                type="text"
                                value={data.ciudad}
                                onChange={(e) =>
                                    setData("ciudad", e.target.value)
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {errors.ciudad && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.ciudad}
                                </p>
                            )}
                        </div>

                        <div>
                            <InputLabel className="block font-medium mb-1">
                                Provincia *
                            </InputLabel>
                            <TextInput
                                type="text"
                                value={data.provincia}
                                onChange={(e) =>
                                    setData("provincia", e.target.value)
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {errors.provincia && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.provincia}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Campos especificos para persona */}
                    {type === "persona" && (
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Fecha de nacimiento
                                </InputLabel>
                                <TextInput
                                    type="date"
                                    value={data.fecha_nac}
                                    onChange={(e) =>
                                        setData("fecha_nac", e.target.value)
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.fecha_nac && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.fecha_nac}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="font-medium mb-2">
                                    Seleccioná tus intereses:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {allOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                toggleInterest(option)
                                            }
                                            className={`px-4 py-2 rounded-full border transition-colors ${
                                                data.interests.includes(option)
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-white text-black border-gray-300 hover:border-blue-400"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {errors.interests && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.interests}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Campos especificos para institucion */}
                    {type === "institucion" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Tipo de institución *
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={data.tipo_institucion}
                                    onChange={(e) =>
                                        setData(
                                            "tipo_institucion",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Universidad, Terciario, etc."
                                />
                                {errors.tipo_institucion && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.tipo_institucion}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel className="block font-medium mb-1">
                                    Dirección *
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    value={data.direccion}
                                    onChange={(e) =>
                                        setData("direccion", e.target.value)
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.direccion && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.direccion}
                                    </p>
                                )}
                            </div>

                            {/* Documento Identificador */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="font-semibold mb-3">
                                    Documento Identificador *
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Proporciona un documento que identifique a
                                    tu institución (CUIT, CUIL, DNI del
                                    responsable.)
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-medium mb-1">
                                            Tipo de documento *
                                        </label>
                                        <select
                                            value={data.tipo_documento}
                                            onChange={(e) =>
                                                setData(
                                                    "tipo_documento",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="CUIT">CUIT</option>
                                            <option value="CUIL">CUIL</option>
                                            <option value="DNI">
                                                DNI (Responsable)
                                            </option>
                                        </select>
                                        {errors.tipo_documento && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.tipo_documento}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-1">
                                            Número *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.documento_identificador}
                                            onChange={(e) =>
                                                setData(
                                                    "documento_identificador",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 20-12345678-9"
                                            required
                                        />
                                        {errors.documento_identificador && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.documento_identificador}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel className="block font-medium mb-1">
                                    Sitio web
                                </InputLabel>
                                <TextInput
                                    type="url"
                                    value={data.sitio_web}
                                    onChange={(e) =>
                                        setData("sitio_web", e.target.value)
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                                {errors.sitio_web && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.sitio_web}
                                    </p>
                                )}
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
                            className="w-full px-6 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
