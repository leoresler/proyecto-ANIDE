import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import {
    validarFormulario,
    validarEnTiempoReal,
    obtenerTipoArchivo,
    CONFIG,
} from "@/utils/validacionesPublicaciones";

export default function Create({ auth }) {
    const {
        data,
        setData,
        post,
        processing,
        errors: serverErrors,
        reset,
    } = useForm({
        titulo: "",
        contenido: "",
        publicado: true,
    });

    const [mediaFiles, setMediaFiles] = useState([]);
    const [clientErrors, setClientErrors] = useState({
        titulo: [],
        contenido: [],
        media: [],
    });
    const [showValidation, setShowValidation] = useState({
        titulo: false,
        contenido: false,
        media: false,
    });

    // Validar campo en tiempo real
    const handleBlur = (campo) => {
        setShowValidation((prev) => ({ ...prev, [campo]: true }));

        let errors = [];
        if (campo === "titulo") {
            errors = validarEnTiempoReal("titulo", data.titulo);
        } else if (campo === "contenido") {
            errors = validarEnTiempoReal("contenido", data.contenido);
        } else if (campo === "media") {
            errors = validarEnTiempoReal("media", null, mediaFiles);
        }

        setClientErrors((prev) => ({ ...prev, [campo]: errors }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar todo el formulario antes de enviar
        const validation = validarFormulario(data, mediaFiles);

        if (!validation.isValid) {
            setClientErrors(validation.errors);
            setShowValidation({
                titulo: true,
                contenido: true,
                media: true,
            });
            return;
        }

        // Si las validaciones pasan, preparar y enviar datos
        const formData = new FormData();
        formData.append("titulo", data.titulo.trim());
        formData.append("contenido", data.contenido.trim());
        formData.append("publicado", data.publicado ? "1" : "0");

        // Agregar archivos media
        mediaFiles.forEach((media, index) => {
            formData.append(`media[${index}][file]`, media.file);
            formData.append(`media[${index}][tipo]`, media.tipo);
        });

        post("/publicaciones", {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                // Limpiar el formulario si es exitoso
                reset();
                setMediaFiles([]);
            },
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Validar cantidad total de archivos
        if (mediaFiles.length + files.length > CONFIG.media.maxFiles) {
            setClientErrors((prev) => ({
                ...prev,
                media: [
                    `Solo puedes subir hasta ${CONFIG.media.maxFiles} archivos en total`,
                ],
            }));
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

        // Validar los archivos agregados
        const errors = validarEnTiempoReal("media", null, updatedMedia);
        setClientErrors((prev) => ({ ...prev, media: errors }));
        if (errors.length > 0) {
            setShowValidation((prev) => ({ ...prev, media: true }));
        }
    };

    const removeMedia = (index) => {
        const newMedia = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(newMedia);

        // Revalidar después de eliminar
        const errors = validarEnTiempoReal("media", null, newMedia);
        setClientErrors((prev) => ({ ...prev, media: errors }));
    };

    // Combinar errores del cliente y del servidor
    const getFieldErrors = (field) => {
        const client =
            showValidation[field] && clientErrors[field]?.length > 0
                ? clientErrors[field]
                : [];
        const server = serverErrors[field] ? [serverErrors[field]] : [];
        return [...client, ...server];
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Crear Publicación" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-6">
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
                                        value={data.titulo}
                                        onChange={(e) => {
                                            setData("titulo", e.target.value);
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
                                        className="mt-1 block w-full"
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
                                            {data.titulo.length}/
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
                                        value={data.contenido}
                                        onChange={(e) => {
                                            setData(
                                                "contenido",
                                                e.target.value
                                            );
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
                                        className="mt-1 block w-full border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md shadow-sm"
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
                                            {data.contenido.length}/
                                            {CONFIG.contenido.maxLength}
                                        </span>
                                    </div>
                                </div>

                                {/* Archivos multimedia */}
                                <div>
                                    <InputLabel value="Archivos multimedia (opcional)" />
                                    <div className="mt-2">
                                        <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-colors">
                                            <div className="text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-600">
                                                    Haz clic para subir
                                                    imágenes, videos o
                                                    documentos
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    PNG, JPG, WEBP, MP4, MOV,
                                                    PDF, DOC (máx.{" "}
                                                    {CONFIG.media.maxSizeMB}MB
                                                    por archivo)
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
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
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <div className="flex items-start">
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
                                            <p className="text-sm text-gray-600 mb-2">
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
                                                            <div className="p-2 bg-white">
                                                                <p className="text-xs text-gray-600 truncate">
                                                                    {media.name}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
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
                                        checked={data.publicado}
                                        onChange={(e) =>
                                            setData(
                                                "publicado",
                                                e.target.checked
                                            )
                                        }
                                        className="rounded border-gray-300 text-gray-600 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                    />
                                    <InputLabel
                                        htmlFor="publicado"
                                        value="Publicar inmediatamente"
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <a
                                        href="/publicaciones/misPublicaciones"
                                        className="inline-flex items-center px-14 py-4 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Cancelar
                                    </a>
                                    <PrimaryButton disabled={processing} className="px-4 rounded-md">
                                        {processing
                                            ? "Creando..."
                                            : "Crear Publicación"}
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
