import { useRef } from "react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";

export default function ProfilePhotoInput({
    photoPreview,
    onPhotoChange,
    onPhotoRemove,
    error,
}) {
    const photoInput = useRef();

    return (
        <div>
            <InputLabel className="block font-medium mb-2 dark:text-gray-300">
                Foto de perfil:
            </InputLabel>

            <div className="flex items-center gap-4">
                {photoPreview && (
                    <div className="flex-shrink-0 relative">
                        <img
                            src={photoPreview}
                            alt="Vista previa"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                onPhotoRemove();
                                if (photoInput.current) {
                                    photoInput.current.value = null;
                                }
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-colors"
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

                <div className="flex-1">
                    <TextInput
                        ref={photoInput}
                        type="file"
                        accept="image/*"
                        onChange={(e) => onPhotoChange(e.target.files[0])}
                        className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-gray-600"
                    />
                </div>
            </div>

            {error && <InputError message={error} className="mt-1" />}
        </div>
    );
}
