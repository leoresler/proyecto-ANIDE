import { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Upload, X, FileText, ArrowLeft } from "lucide-react";
import {
    CATEGORIAS,
    MAX_CATEGORIAS_PUBLICACION,
} from "@/utils/categoriasConfig";
import { toast, Toaster } from "react-hot-toast";

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        tipo: "curso",
        nombre: "",
        contenido: "",
        categorias: [],
        duracion: "",
        modalidad: "",
        publicado: true,
        plan_estudios: [],
    });

    const handleAddCategoria = (categoria) => {
        if (data.categorias.includes(categoria)) {
            toast.error("Esta categoría ya está agregada");
            return;
        }

        if (data.categorias.length >= MAX_CATEGORIAS_PUBLICACION) {
            toast.error(`Máximo ${MAX_CATEGORIAS_PUBLICACION} categorías`);
            return;
        }

        setData("categorias", [...data.categorias, categoria]);
        toast.success("Categoría agregada");
    };

    const handleRemoveCategoria = (cat) => {
        setData(
            "categorias",
            data.categorias.filter((c) => c !== cat)
        );
        toast.success("Categoría eliminada");
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        // Validar que sean PDFs
        const invalidFiles = files.filter((f) => f.type !== "application/pdf");
        if (invalidFiles.length > 0) {
            toast.error("Solo se permiten archivos PDF");
            return;
        }

        // Validar tamaño (10MB por archivo)
        const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            toast.error("Los archivos no pueden superar 10MB");
            return;
        }

        setData("plan_estudios", [...data.plan_estudios, ...files]);
        toast.success(`${files.length} archivo(s) agregado(s)`);
    };

    const handleRemoveFile = (index) => {
        setData(
            "plan_estudios",
            data.plan_estudios.filter((_, i) => i !== index)
        );
        toast.success("Archivo eliminado");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validaciones
        if (!data.nombre.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        if (!data.contenido.trim()) {
            toast.error("La descripción es obligatoria");
            return;
        }

        if (data.categorias.length === 0) {
            toast.error("Debes agregar al menos una categoría");
            return;
        }

        if (data.duracion && (isNaN(data.duracion) || data.duracion < 1)) {
            toast.error("La duración debe ser un número positivo");
            return;
        }

        const formData = new FormData();
        formData.append("tipo", data.tipo);
        formData.append("nombre", data.nombre.trim());
        formData.append("contenido", data.contenido.trim());
        formData.append("publicado", data.publicado ? "1" : "0");

        data.categorias.forEach((cat, index) => {
            formData.append(`categorias[${index}]`, cat);
        });

        if (data.duracion) formData.append("duracion", data.duracion);
        if (data.modalidad) formData.append("modalidad", data.modalidad);

        data.plan_estudios.forEach((file, index) => {
            formData.append(`plan_estudios[${index}]`, file);
        });

        const toastId = toast.loading("Creando...");

        post("/material", {
            data: formData,
            onSuccess: () => {
                toast.success("Material creado exitosamente", { id: toastId });
            },
            onError: (errors) => {
                toast.error("Error al crear el material", { id: toastId });
                console.error(errors);
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Crear Curso o Carrera" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href="/material"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a la lista
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Crear Curso o Carrera
                        </h1>
                    </div>

                    {/* Formulario */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg shadow p-6 space-y-6"
                    >
                        {/* Tipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de material *
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData("tipo", "curso")}
                                    className={`p-4 border-2 rounded-lg flex items-center gap-3 transition ${
                                        data.tipo === "curso"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div
                                        className={`w-6 h-6 ${
                                            data.tipo === "curso"
                                                ? "opacity-100"
                                                : "opacity-40"
                                        }`}
                                        style={{
                                            backgroundImage:
                                                "url('/svg/sidebar/courses.svg')",
                                            backgroundSize: "contain",
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "center",
                                        }}
                                    />
                                    <div className="text-left">
                                        <p className="font-semibold">Curso</p>
                                        <p className="text-xs text-gray-500">
                                            Capacitación corta
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setData("tipo", "carrera")}
                                    className={`p-4 border-2 rounded-lg flex items-center gap-3 transition ${
                                        data.tipo === "carrera"
                                            ? "border-yellow-500 bg-yellow-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div
                                        className={`w-6 h-6 ${
                                            data.tipo === "carrera"
                                                ? "opacity-100"
                                                : "opacity-40"
                                        }`}
                                        style={{
                                            backgroundImage:
                                                "url('/svg/sidebar/book.svg')",
                                            backgroundSize: "contain",
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "center",
                                        }}
                                    />
                                    <div className="text-left">
                                        <p className="font-semibold">Carrera</p>
                                        <p className="text-xs text-gray-500">
                                            Formación profesional
                                        </p>
                                    </div>
                                </button>
                            </div>
                            {errors.tipo && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.tipo}
                                </p>
                            )}
                        </div>

                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {" "}
                                {data.tipo === "curso" ? "Curso" : "Carrera"} *
                            </label>
                            <input
                                type="text"
                                value={data.nombre}
                                onChange={(e) =>
                                    setData("nombre", e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Desarrollo Web"
                            />
                            {errors.nombre && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.nombre}
                                </p>
                            )}
                        </div>

                        {/* Contenido */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción *
                            </label>
                            <textarea
                                value={data.contenido}
                                onChange={(e) =>
                                    setData("contenido", e.target.value)
                                }
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describí el contenido, objetivos, requisitos, etc."
                            />
                            {errors.contenido && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.contenido}
                                </p>
                            )}
                        </div>

                        {/* Duración y Modalidad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duración (meses)
                                </label>
                                <input
                                    type="number"
                                    value={data.duracion}
                                    onChange={(e) =>
                                        setData("duracion", e.target.value)
                                    }
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="12"
                                />
                                {errors.duracion && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.duracion}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Modalidad
                                </label>
                                <select
                                    value={data.modalidad}
                                    onChange={(e) =>
                                        setData("modalidad", e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Presencial">
                                        Presencial
                                    </option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="Híbrida">Híbrida</option>
                                </select>
                                {errors.modalidad && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.modalidad}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Categorías */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categorías * (máximo{" "}
                                {MAX_CATEGORIAS_PUBLICACION})
                            </label>

                            {/* Categorías disponibles */}
                            <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-2">
                                    Selecciona las categorías que aplican:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIAS.filter(
                                        (cat) => !data.categorias.includes(cat)
                                    ).map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() =>
                                                handleAddCategoria(cat)
                                            }
                                            disabled={
                                                data.categorias.length >=
                                                MAX_CATEGORIAS_PUBLICACION
                                            }
                                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            + {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Categorías seleccionadas */}
                            {data.categorias.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Categorías seleccionadas:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {data.categorias.map((cat) => (
                                            <span
                                                key={cat}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                {cat}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveCategoria(
                                                            cat
                                                        )
                                                    }
                                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.categorias && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.categorias}
                                </p>
                            )}
                        </div>

                        {/* Plan de estudios */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Plan de estudios (PDF)
                            </label>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Arrastra archivos PDF o haz clic para
                                    seleccionar
                                </p>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="plan-estudios"
                                />
                                <label
                                    htmlFor="plan-estudios"
                                    className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                                >
                                    Seleccionar archivos
                                </label>
                            </div>

                            {/* Archivos seleccionados */}
                            {data.plan_estudios.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {data.plan_estudios.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-700">
                                                    {file.name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveFile(idx)
                                                }
                                                className="text-red-600 hover:bg-red-50 p-1 rounded"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.plan_estudios && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.plan_estudios}
                                </p>
                            )}
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.publicado}
                                    onChange={(e) =>
                                        setData("publicado", e.target.checked)
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Publicar (visible para los usuarios)
                                </span>
                            </label>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Link
                                href="/material"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {processing ? "Creando..." : "Crear"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
