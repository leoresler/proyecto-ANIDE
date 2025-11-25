import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { useRef, useEffect, useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { toast } from "react-hot-toast";
import { X, Camera, Trash2, Upload } from "lucide-react";

// Componente Modal
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default function ActualizarFotoPerfil({ currentPhoto, className = "" }) {
    const photoInput = useRef();
    const { data, setData, errors, post, progress, processing, reset } =
        useForm({
            photo: null,
        });

    const [displayPhoto, setDisplayPhoto] = useState(currentPhoto);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState(null);

    useEffect(() => {
        setDisplayPhoto(currentPhoto);
    }, [currentPhoto]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("photo", file);
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        const toastId = toast.loading("Subiendo foto...");

        post(route("profile.photo.update"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.dismiss(toastId);
                toast.success("Foto actualizada correctamente.");
                setData("photo", null);
                setPreviewPhoto(null);
                if (photoInput.current) photoInput.current.value = null;
                setIsModalOpen(false);
                Inertia.reload();
            },
            onError: () => {
                toast.dismiss(toastId);
                toast.error("Hubo un error al actualizar la foto.");
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    const handleDelete = () => {
        const toastId = toast.custom((t) => (
            <div
                className={`bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all ${
                    t.visible ? "opacity-100" : "opacity-0"
                }`}
            >
                <div>
                    <p className="font-semibold text-gray-800">
                        ¿Querés borrar tu foto de perfil?
                    </p>
                    <p className="text-sm text-gray-500">
                        Esta acción no se puede deshacer.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(toastId);
                            const loadingId =
                                toast.loading("Eliminando foto...");

                            Inertia.delete(route("profile.photo.destroy"), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    toast.dismiss(loadingId);
                                    toast.success(
                                        "Foto eliminada correctamente."
                                    );
                                    setDisplayPhoto(
                                        "/storage/profile-photos/default-avatar.webp"
                                    );
                                    setPreviewPhoto(null);
                                    setData("photo", null);
                                    if (photoInput.current)
                                        photoInput.current.value = null;
                                    setIsModalOpen(false);
                                },
                                onError: () => {
                                    toast.dismiss(loadingId);
                                    toast.error("No se pudo eliminar la foto.");
                                },
                            });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                        Sí, borrar
                    </button>
                    <button
                        onClick={() => toast.dismiss(toastId)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ));
    };

    const handleCancel = () => {
        reset();
        setPreviewPhoto(null);
        if (photoInput.current) photoInput.current.value = null;
        setIsModalOpen(false);
    };

    const currentDisplayPhoto =
        previewPhoto || displayPhoto || "/storage/profile-photos/default-avatar.webp";

    return (
        <>
            {/* Foto de perfil con ícono de edición */}
            <div className={`relative inline-block ${className}`}>
                <img
                    src={displayPhoto || "/storage/profile-photos/default-avatar.webp"}
                    alt="Foto de perfil"
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full shadow-lg border-4 border-gray-200"
                />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-edu-dark hover:bg-edu-dark/90 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110"
                    title="Editar foto de perfil"
                >
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCancel}>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Foto de perfil
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Preview de la foto */}
                        <div className="flex justify-center">
                            <img
                                src={currentDisplayPhoto}
                                alt="Vista previa"
                                className="h-40 w-40 rounded-full object-cover border-4 border-gray-200 shadow-md"
                            />
                        </div>

                        {/* Input de archivo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar nueva foto
                            </label>
                            <input
                                ref={photoInput}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <InputError
                                message={errors.photo}
                                className="mt-2"
                            />
                        </div>

                        {/* Barra de progreso */}
                        {progress && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-edu-dark transition-all"
                                    style={{
                                        width: `${progress.percentage}%`,
                                    }}
                                />
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex flex-col gap-3">
                            <PrimaryButton
                                onClick={handleSubmit}
                                disabled={processing || !data.photo}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {data.photo
                                    ? "Guardar nueva foto"
                                    : "Selecciona una foto"}
                            </PrimaryButton>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar foto actual
                            </button>

                            <SecondaryButton
                                onClick={handleCancel}
                                className="w-full"
                            >
                                Cancelar
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
