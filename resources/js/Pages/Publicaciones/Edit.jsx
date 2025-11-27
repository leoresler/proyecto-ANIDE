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

export default function Edit({ auth, publicacion }) {
    useFlash();

    const isPublicado = publicacion.publicado;

    const [formState, setFormState] = useState({
        titulo: publicacion.titulo,
        contenido: publicacion.contenido,
        publicado: publicacion.publicado,
        categorias: publicacion.categorias || [],
    });

    const [existingMedia, setExistingMedia] = useState(publicacion.media || []);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [deletedMedia, setDeletedMedia] = useState([]);
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
            errors = validarEnTiempoReal("media", null, [
                ...existingMedia,
                ...mediaFiles,
            ]);
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
                return {
                    ...prev,
                    categorias: prev.categorias.filter((c) => c !== categoria),
                };
            } else {
                if (prev.categorias.length >= MAX_CATEGORIAS_PUBLICACION) {
                    toast.error(
                        `Solo puedes seleccionar hasta ${MAX_CATEGORIAS_PUBLICACION} categorías`
                    );
                    return prev;
                }
                return {
                    ...prev,
                    categorias: [...prev.categorias, categoria],
                };
            }
        });

        if (showValidation.categorias) {
            setClientErrors((prev) => ({ ...prev, categorias: [] }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isPublicado) {
            const errors = validarEnTiempoReal(
                "contenido",
                formState.contenido
            );
            if (errors.length > 0) {
                setClientErrors({ ...clientErrors, contenido: errors });
                setShowValidation({ ...showValidation, contenido: true });
                toast.error("El contenido no puede estar vacío");
                return;
            }

            setProcessing(true);
            const loadingToast = toast.loading("Actualizando publicación...");

            const formData = new FormData();
            formData.append("contenido", formState.contenido.trim());
            formData.append("_method", "POST");

            router.post(`/publicaciones/${publicacion.id}`, formData, {
                forceFormData: true,
                preserveScroll: false,
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success("¡Publicación actualizada correctamente!");
                    setProcessing(false);
                },
                onError: (errors) => {
                    toast.dismiss(loadingToast);
                    toast.error("No se pudo actualizar la publicación");
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            // Validar categorías en borradores
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

            const validation = validarFormulario(formState, [
                ...existingMedia,
                ...mediaFiles,
            ]);

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
            const loadingToast = toast.loading("Actualizando publicación...");

            const formData = new FormData();
            formData.append("titulo", formState.titulo.trim());
            formData.append("contenido", formState.contenido.trim());
            formData.append("publicado", formState.publicado ? "1" : "0");
            formData.append("_method", "POST");

            // Agregar categorías
            formState.categorias.forEach((categoria, index) => {
                formData.append(`categorias[${index}]`, categoria);
            });

            deletedMedia.forEach((mediaId, index) => {
                formData.append(`deleted_media[${index}]`, mediaId);
            });

            mediaFiles.forEach((media, index) => {
                formData.append(`media[${index}][file]`, media.file);
                formData.append(`media[${index}][tipo]`, media.tipo);
            });

            router.post(`/publicaciones/${publicacion.id}`, formData, {
                forceFormData: true,
                preserveScroll: false,
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success("¡Publicación actualizada correctamente!");
                    setProcessing(false);
                },
                onError: (errors) => {
                    toast.dismiss(loadingToast);
                    toast.error("No se pudo actualizar la publicación");
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const totalFiles =
            existingMedia.length + mediaFiles.length + files.length;

        if (totalFiles > CONFIG.media.maxFiles) {
            setClientErrors((prev) => ({
                ...prev,
                media: [
                    `Solo podés subir hasta ${CONFIG.media.maxFiles} archivos en total`,
                ],
            }));
            setShowValidation((prev) => ({ ...prev, media: true }));
            toast.error("Solo podés subir hasta 6 archivos en total");
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

        const errors = validarEnTiempoReal("media", null, [
            ...existingMedia,
            ...updatedMedia,
        ]);
        setClientErrors((prev) => ({ ...prev, media: errors }));
        if (errors.length > 0) {
            setShowValidation((prev) => ({ ...prev, media: true }));
        }
    };

    const removeMedia = (index) => {
        const newMedia = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(newMedia);

        const errors = validarEnTiempoReal("media", null, [
            ...existingMedia,
            ...newMedia,
        ]);
        setClientErrors((prev) => ({ ...prev, media: errors }));
    };

    const removeExistingMedia = (mediaId) => {
        setExistingMedia(existingMedia.filter((m) => m.id !== mediaId));
        setDeletedMedia([...deletedMedia, mediaId]);
        toast.success("Archivo marcado para eliminar");

        const remainingMedia = existingMedia.filter((m) => m.id !== mediaId);
        const errors = validarEnTiempoReal("media", null, [
            ...remainingMedia,
            ...mediaFiles,
        ]);
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
            <Head title="Editar Publicación" />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Editar Publicación
                            </h1>

                            {isPublicado && (
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        Esta publicación ya está publicada. Solo
                                        podés editar el contenido.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Título - solo si es borrador */}
                                {!isPublicado && (
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
                                            className="mt-1 block w-full rounded-md"
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
                                )}

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
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-md shadow-sm"
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

                                {/* CATEGORÍAS - solo si es borrador */}
                                {!isPublicado && (
                                    <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-5 h-5 text-blue-600" />
                                                <InputLabel
                                                    value="Categorías de la publicación *"
                                                    className="text-lg font-bold dark:text-white"
                                                />
                                            </div>
                                            <span
                                                className={`text-lg font-bold ${
                                                    formState.categorias
                                                        .length >=
                                                    MAX_CATEGORIAS_PUBLICACION
                                                        ? "text-red-600"
                                                        : "text-blue-600"
                                                }`}
                                            >
                                                {formState.categorias.length}/
                                                {MAX_CATEGORIAS_PUBLICACION}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Selecciona hasta{" "}
                                            {MAX_CATEGORIAS_PUBLICACION}{" "}
                                            categorías que describan tu
                                            publicación.
                                        </p>

                                        {/* Categorías seleccionadas */}
                                        {formState.categorias.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Categorías seleccionadas:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {formState.categorias.map(
                                                        (categoria) => (
                                                            <button
                                                                key={categoria}
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleCategoria(
                                                                        categoria
                                                                    )
                                                                }
                                                                className="px-4 py-2 bg-blue-600 text-white border-2 border-blue-700 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md"
                                                            >
                                                                {categoria}
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Grid de todas las categorías */}
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {CATEGORIAS.map((categoria) => (
                                                    <button
                                                        key={categoria}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleCategoria(
                                                                categoria
                                                            )
                                                        }
                                                        className={`px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                                                            formState.categorias.includes(
                                                                categoria
                                                            )
                                                                ? "bg-blue-600 text-white border-blue-700 shadow-md"
                                                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                        }`}
                                                    >
                                                        {categoria}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {getFieldErrors("categorias").length >
                                            0 && (
                                            <div className="mt-3">
                                                {getFieldErrors(
                                                    "categorias"
                                                ).map((error, idx) => (
                                                    <InputError
                                                        key={idx}
                                                        message={error}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Archivos multimedia - solo si es borrador */}
                                {!isPublicado && (
                                    <div>
                                        <InputLabel value="Archivos multimedia (opcional)" />

                                        {/* Media existente */}
                                        {existingMedia.length > 0 && (
                                            <div className="mt-2 mb-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    Archivos actuales (
                                                    {existingMedia.length})
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {existingMedia.map(
                                                        (media) => (
                                                            <div
                                                                key={media.id}
                                                                className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
                                                            >
                                                                {media.tipo ===
                                                                    "imagen" && (
                                                                    <img
                                                                        src={
                                                                            media.url_publica
                                                                        }
                                                                        alt="Media"
                                                                        className="w-full h-32 object-cover"
                                                                    />
                                                                )}
                                                                {media.tipo ===
                                                                    "video" && (
                                                                    <video
                                                                        src={
                                                                            media.url_publica
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
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeExistingMedia(
                                                                            media.id
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

                                        {/* Subir nuevos archivos */}
                                        <div className="mt-2">
                                            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 dark:hover:border-gray-400 transition-colors">
                                                <div className="text-center">
                                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        Haz clic para subir más
                                                        archivos
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                        PNG, JPG, WEBP, MP4,
                                                        MOV, PDF, DOC (máx.{" "}
                                                        {CONFIG.media.maxSizeMB}
                                                        MB por archivo)
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
                                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
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

                                        {/* Vista previa nuevos archivos */}
                                        {mediaFiles.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Nuevos archivos (
                                                    {mediaFiles.length})
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {mediaFiles.map(
                                                        (media, index) => (
                                                            <div
                                                                key={index}
                                                                className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
                                                            >
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
                                                                <div className="p-2 bg-white">
                                                                    <p className="text-xs text-gray-600 truncate">
                                                                        {
                                                                            media.name
                                                                        }
                                                                    </p>
                                                                </div>
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
                                )}

                                {/* Estado de publicación - solo si es borrador */}
                                {!isPublicado && (
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
                                )}

                                {/* Botones */}
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <a
                                        href="/publicaciones/misPublicaciones"
                                        className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Cancelar
                                    </a>
                                    <PrimaryButton
                                        disabled={processing}
                                        className="px-4 rounded-full"
                                    >
                                        {processing
                                            ? "Guardando..."
                                            : "Guardar"}
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
