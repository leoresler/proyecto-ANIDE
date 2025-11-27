import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";

export default function PersonaFormFields({
    data,
    errors,
    clientErrors,
    onDataChange,
    onFieldValidation,
    clearFieldError,
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Nombre *
                </InputLabel>
                <TextInput
                    type="text"
                    value={data.nombre}
                    onChange={(e) => {
                        onDataChange("nombre", e.target.value);
                        clearFieldError("nombre");
                    }}
                    onBlur={(e) => onFieldValidation("nombre", e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {(clientErrors.nombre || errors.nombre) && (
                    <InputError
                        message={clientErrors.nombre || errors.nombre}
                        className="mt-1"
                    />
                )}
            </div>

            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Apellido *
                </InputLabel>
                <TextInput
                    type="text"
                    value={data.apellido}
                    onChange={(e) => {
                        onDataChange("apellido", e.target.value);
                        clearFieldError("apellido");
                    }}
                    onBlur={(e) =>
                        onFieldValidation("apellido", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {(clientErrors.apellido || errors.apellido) && (
                    <InputError
                        message={clientErrors.apellido || errors.apellido}
                        className="mt-1"
                    />
                )}
            </div>

            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Teléfono *
                </InputLabel>
                <TextInput
                    type="text"
                    value={data.telefono}
                    onChange={(e) => {
                        onDataChange("telefono", e.target.value);
                        clearFieldError("telefono");
                    }}
                    onBlur={(e) =>
                        onFieldValidation("telefono", e.target.value)
                    }
                    placeholder="Ej: 299 123 4567"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {(clientErrors.telefono || errors.telefono) && (
                    <InputError
                        message={clientErrors.telefono || errors.telefono}
                        className="mt-1"
                    />
                )}
            </div>

            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Ciudad *
                </InputLabel>
                <TextInput
                    type="text"
                    value={data.ciudad}
                    onChange={(e) => {
                        onDataChange("ciudad", e.target.value);
                        clearFieldError("ciudad");
                    }}
                    onBlur={(e) => onFieldValidation("ciudad", e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {(clientErrors.ciudad || errors.ciudad) && (
                    <InputError
                        message={clientErrors.ciudad || errors.ciudad}
                        className="mt-1"
                    />
                )}
            </div>

            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Provincia *
                </InputLabel>
                <TextInput
                    type="text"
                    value={data.provincia}
                    onChange={(e) => {
                        onDataChange("provincia", e.target.value);
                        clearFieldError("provincia");
                    }}
                    onBlur={(e) =>
                        onFieldValidation("provincia", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {(clientErrors.provincia || errors.provincia) && (
                    <InputError
                        message={clientErrors.provincia || errors.provincia}
                        className="mt-1"
                    />
                )}
            </div>

            <div>
                <InputLabel className="block font-medium mb-1 dark:text-gray-300">
                    Fecha de nacimiento *
                </InputLabel>
                <TextInput
                    type="date"
                    value={data.fecha_nac}
                    onChange={(e) => {
                        onDataChange("fecha_nac", e.target.value);
                        clearFieldError("fecha_nac");
                    }}
                    onBlur={(e) =>
                        onFieldValidation("fecha_nac", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {(clientErrors.fecha_nac || errors.fecha_nac) && (
                    <InputError
                        message={clientErrors.fecha_nac || errors.fecha_nac}
                        className="mt-1"
                    />
                )}
            </div>
        </div>
    );
}
