import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import toast from "react-hot-toast";
import { useFlash } from "@/hooks/useFlash";
import { X, Upload, FileText, AlertCircle, Tag } from "lucide-react";
import {
    validarFormulario,
    validarEnTiempoReal,
    obtenerTipoArchivo,
    CONFIG,
} from "@/utils/validacionesPublicaciones";
import {
    CATEGORIAS,
    MAX_CATEGORIAS_PUBLICACION,
} from "@/utils/categoriasConfig";

export default function Create({ auth }) {
    useFlash();

    const [formState, setFormState] = useState({
        titulo: "",
        contenido: "",
        publicado: true,
        categorias: [],
    });

    const [mediaFiles, setMediaFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [clientErrors, setClientErrors] = useState({
        titulo: [],
        contenido: [],
        media: [],
        categorias: [],
    });
    const [showValidation, setShowValidation] = useState({
        titulo: false,
        contenido: false,
        media: false,
        categorias: false,
    });

    const handleBlur = (campo) => {
        setShowValidation((prev) => ({ ...prev, [campo]: true }));

        let errors = [];
        if (campo === "titulo") {
            errors = validarEnTiempoReal("titulo", formState.titulo);
        } else if (campo === "contenido") {
            errors = validarEnTiempoReal("contenido", formState.contenido);
        } else if (campo === "media") {
            errors = validarEnTiempoReal("media", null, mediaFiles);
        } else if (campo === "categorias") {
            errors = validarCategorias(formState.categorias);
        }

        setClientErrors((prev) => ({ ...prev, [campo]: errors }));
    };

    // Validación de categorías
    const validarCategorias = (categorias) => {
        if (!categorias || categorias.length === 0) {
            return ["Debes seleccionar al menos una categoría"];
        }
        if (categorias.length > MAX_CATEGORIAS_PUBLICACION) {
            return [
                `Puedes seleccionar hasta ${MAX_CATEGORIAS_PUBLICACION} categorías`,
            ];
        }
        return [];
    };

    // Toggle de categorías
    const toggleCategoria = (categoria) => {
        setFormState((prev) => {
            const yaSeleccionada = prev.categorias.includes(categoria);

            if (yaSeleccionada) {
                // Remover
                return {
                    ...prev,
                    categorias: prev.categorias.filter((c) => c !== categoria),
                };
            } else {
                // Verificar límite
                if (prev.categorias.length >= MAX_CATEGORIAS_PUBLICACION) {
                    toast.error(
                        `Solo puedes seleccionar hasta ${MAX_CATEGORIAS_PUBLICACION} categorías`
                    );
                    return prev;
                }
                // Agregar
                return {
                    ...prev,
                    categorias: [...prev.categorias, categoria],
                };
            }
        });

        // Limpiar error si existe
        if (showValidation.categorias) {
            setClientErrors((prev) => ({ ...prev, categorias: [] }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar categorías
        const erroresCategorias = validarCategorias(formState.categorias);
        if (erroresCategorias.length > 0) {
            setClientErrors((prev) => ({
                ...prev,
                categorias: erroresCategorias,
            }));
            setShowValidation((prev) => ({ ...prev, categorias: true }));
            toast.error("Debes seleccionar al menos una categoría");
            return;
        }

        const validation = validarFormulario(formState, mediaFiles);

        if (!validation.isValid) {
            setClientErrors(validation.errors);
            setShowValidation({
                titulo: true,
                contenido: true,
                media: true,
                categorias: true,
            });

            toast.error("Por favor, completa todos los campos requeridos");
            return;
        }

        setProcessing(true);

        const formData = new FormData();
        formData.append("titulo", formState.titulo.trim());
        formData.append("contenido", formState.contenido.trim());
        formData.append("publicado", formState.publicado ? "1" : "0");

        // Agregar categorías al FormData
        formState.categorias.forEach((categoria, index) => {
            formData.append(`categorias[${index}]`, categoria);
        });

        mediaFiles.forEach((media, index) => {
            formData.append(`media[${index}][file]`, media.file);
            formData.append(`media[${index}][tipo]`, media.tipo);
        });

        const loadingToast = toast.loading("Creando publicación...");

        router.post("/publicaciones", formData, {
            forceFormData: true,
            preserveScroll: false,
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success("¡Publicación creada exitosamente!");
                setFormState({
                    titulo: "",
                    contenido: "",
                    publicado: true,
                    categorias: [],
                });
                setMediaFiles([]);
                setProcessing(false);
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);

                if (errors.titulo) {
                    toast.error(errors.titulo[0]);
                } else if (errors.contenido) {
                    toast.error(errors.contenido[0]);
                } else if (errors.media) {
                    toast.error(errors.media[0]);
                } else if (errors.categorias) {
                    toast.error(errors.categorias[0]);
                } else {
                    toast.error("Hubo un error al crear la publicación");
                }

                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        if (mediaFiles.length + files.length > CONFIG.media.maxFiles) {
            toast.error(
                `Solo podés subir hasta ${CONFIG.media.maxFiles} archivos en total`
            );
            setShowValidation((prev) => ({ ...prev, media: true }));
            return;
        }

        const newMedia = files.map((file) => {
            const tipo = obtenerTipoArchivo(file);

            return {
                file,
                tipo,
                preview: URL.createObjectURL(file),
                name: file.name,
            };
        });

        const updatedMedia = [...mediaFiles, ...newMedia];
        setMediaFiles(updatedMedia);

        toast.success(`${files.length} archivo(s) agregado(s)`);

        const errors = validarEnTiempoReal("media", null, updatedMedia);
        setClientErrors((prev) => ({ ...prev, media: errors }));
        if (errors.length > 0) {
            setShowValidation((prev) => ({ ...prev, media: true }));
        }
    };

    const removeMedia = (index) => {
        const newMedia = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(newMedia);
        toast.success("Archivo eliminado");

        const errors = validarEnTiempoReal("media", null, newMedia);
        setClientErrors((prev) => ({ ...prev, media: errors }));
    };

    const getFieldErrors = (field) => {
        const client =
            showValidation[field] && clientErrors[field]?.length > 0
                ? clientErrors[field]
                : [];
        return client;
    };

    return (
        <AuthenticatedLayout user={auth.user} showRecomendaciones={false}>
            <Head title="Crear Publicación" />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Crear Nueva Publicación
                            </h1>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Título */}
                                <div>
                                    <InputLabel
                                        htmlFor="titulo"
                                        value="Título *"
                                    />
                                    <TextInput
                                        id="titulo"
                                        type="text"
                                        value={formState.titulo}
                                        onChange={(e) => {
                                            setFormState({
                                                ...formState,
                                                titulo: e.target.value,
                                            });
                                            if (showValidation.titulo) {
                                                const errors =
                                                    validarEnTiempoReal(
                                                        "titulo",
                                                        e.target.value
                                                    );
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    titulo: errors,
                                                }));
                                            }
                                        }}
                                        onBlur={() => handleBlur("titulo")}
                                        className="mt-1 block w-full rounded-lg"
                                        placeholder="Título de la publicación"
                                        maxLength={CONFIG.titulo.maxLength}
                                    />
                                    <div className="flex justify-between items-start mt-1">
                                        <div className="flex-1">
                                            {getFieldErrors("titulo").map(
                                                (error, idx) => (
                                                    <InputError
                                                        key={idx}
                                                        message={error}
                                                        className="mt-1"
                                                    />
                                                )
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {formState.titulo.length}/
                                            {CONFIG.titulo.maxLength}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div>
                                    <InputLabel
                                        htmlFor="contenido"
                                        value="Contenido *"
                                    />
                                    <textarea
                                        id="contenido"
                                        value={formState.contenido}
                                        onChange={(e) => {
                                            setFormState({
                                                ...formState,
                                                contenido: e.target.value,
                                            });
                                            if (showValidation.contenido) {
                                                const errors =
                                                    validarEnTiempoReal(
                                                        "contenido",
                                                        e.target.value
                                                    );
                                                setClientErrors((prev) => ({
                                                    ...prev,
                                                    contenido: errors,
                                                }));
                                            }
                                        }}
                                        onBlur={() => handleBlur("contenido")}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-lg shadow-sm"
                                        rows="8"
                                        placeholder="Escribe el contenido de tu publicación..."
                                        maxLength={CONFIG.contenido.maxLength}
                                    />
                                    <div className="flex justify-between items-start mt-1">
                                        <div className="flex-1">
                                            {getFieldErrors("contenido").map(
                                                (error, idx) => (
                                                    <InputError
                                                        key={idx}
                                                        message={error}
                                                        className="mt-1"
                                                    />
                                                )
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {formState.contenido.length}/
                                            {CONFIG.contenido.maxLength}
                                        </span>
                                    </div>
                                </div>

                                {/* SECCIÓN DE CATEGORÍAS */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                    Categorías de la publicación
                                                    *
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    Selecciona hasta{" "}
                                                    {MAX_CATEGORIAS_PUBLICACION}{" "}
                                                    categorías
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-lg font-bold ${
                                                formState.categorias.length >=
                                                MAX_CATEGORIAS_PUBLICACION
                                                    ? "text-red-600"
                                                    : "text-blue-600"
                                            }`}
                                        >
                                            {formState.categorias.length}/
                                            {MAX_CATEGORIAS_PUBLICACION}
                                        </span>
                                    </div>

                                    {/* Categorías disponibles */}
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Categorías disponibles:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIAS.filter(
                                                (cat) =>
                                                    !formState.categorias.includes(
                                                        cat
                                                    )
                                            ).map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleCategoria(cat)
                                                    }
                                                    disabled={
                                                        formState.categorias
                                                            .length >=
                                                        MAX_CATEGORIAS_PUBLICACION
                                                    }
                                                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    + {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Categorías seleccionadas */}
                                    {formState.categorias.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Categorías seleccionadas:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {formState.categorias.map(
                                                    (cat) => (
                                                        <span
                                                            key={cat}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm shadow-md"
                                                        >
                                                            {cat}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleCategoria(
                                                                        cat
                                                                    )
                                                                }
                                                                className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {getFieldErrors("categorias").length >
                                        0 && (
                                        <div className="mt-3">
                                            {getFieldErrors("categorias").map(
                                                (error, idx) => (
                                                    <InputError
                                                        key={idx}
                                                        message={error}
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Archivos multimedia */}
                                <div>
                                    <InputLabel value="Archivos multimedia (opcional)" />
                                    <div className="mt-2">
                                        <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 dark:hover:border-gray-400 transition-colors">
                                            <div className="text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    Haz clic para subir
                                                    imágenes, videos o
                                                    documentos
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    PNG, JPG, WEBP, MP4, MOV,
                                                    PDF, DOC (máx.{" "}
                                                    {CONFIG.media.maxSizeMB}MB
                                                    por archivo)
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Máximo{" "}
                                                    {CONFIG.media.maxFiles}{" "}
                                                    archivos
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                multiple
                                                accept="image/*,video/*,.pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>

                                    {/* Errores de media */}
                                    {getFieldErrors("media").length > 0 && (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center">
                                                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    {getFieldErrors(
                                                        "media"
                                                    ).map((error, idx) => (
                                                        <p
                                                            key={idx}
                                                            className="text-sm text-red-600"
                                                        >
                                                            {error}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Vista previa de archivos */}
                                    {mediaFiles.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {mediaFiles.length} archivo(s)
                                                seleccionado(s)
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {mediaFiles.map(
                                                    (media, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
                                                        >
                                                            {/* Preview */}
                                                            {media.tipo ===
                                                                "imagen" && (
                                                                <img
                                                                    src={
                                                                        media.preview
                                                                    }
                                                                    alt={
                                                                        media.name
                                                                    }
                                                                    className="w-full h-32 object-cover"
                                                                />
                                                            )}
                                                            {media.tipo ===
                                                                "video" && (
                                                                <video
                                                                    src={
                                                                        media.preview
                                                                    }
                                                                    className="w-full h-32 object-cover"
                                                                />
                                                            )}
                                                            {media.tipo ===
                                                                "documento" && (
                                                                <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                                                                    <FileText className="w-12 h-12 text-gray-400" />
                                                                </div>
                                                            )}

                                                            {/* Nombre del archivo */}
                                                            <div className="p-2 bg-white dark:bg-gray-700 transition-colors">
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                    {media.name}
                                                                </p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                    {(
                                                                        media
                                                                            .file
                                                                            .size /
                                                                        1024 /
                                                                        1024
                                                                    ).toFixed(
                                                                        2
                                                                    )}{" "}
                                                                    MB
                                                                </p>
                                                            </div>

                                                            {/* Botón eliminar */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeMedia(
                                                                        index
                                                                    )
                                                                }
                                                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Estado de publicación */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="publicado"
                                        type="checkbox"
                                        checked={formState.publicado}
                                        onChange={(e) =>
                                            setFormState({
                                                ...formState,
                                                publicado: e.target.checked,
                                            })
                                        }
                                        className="rounded border-gray-300 text-gray-600 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                    />
                                    <InputLabel
                                        htmlFor="publicado"
                                        value="Publicar"
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <a
                                        href="/publicaciones/misPublicaciones"
                                        className="inline-flex items-center px-6 py-3 bg-white border dark:bg-gray-300 dark:hover:bg-gray-200 border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Cancelar
                                    </a>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? "Creando..." : "Publicar"}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
