import { ciudadesNeuquen } from "@/utils/geocodingUtils";
import InputError from "@/Components/InputError";

export default function AddressValidation({
    ciudad,
    direccion,
    onCiudadChange,
    onDireccionChange,
    onValidate,
    validandoDireccion,
    direccionValida,
    errors,
    mensajeValidacion,
    esAproximado,
}) {
    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-gray-200 dark:border-blue-800">
            <h3 className="font-semibold mb-3 flex items-center gap-2 dark:text-gray-200">
                <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
                Ubicación de la institución *
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block font-medium mb-1 dark:text-gray-300">
                        Provincia
                    </label>
                    <input
                        type="text"
                        value="Neuquén"
                        disabled
                        className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1 dark:text-gray-300">
                        Ciudad *
                    </label>
                    <select
                        value={ciudad}
                        onChange={onCiudadChange}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    >
                        {ciudadesNeuquen.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-1 dark:text-gray-300">
                    Dirección *
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Ingresa calle y número. Ejemplos: "Buenos Aires 1400",
                    "Avenida Argentina 1400", "Roca 1070"
                </p>
                <input
                    type="text"
                    value={direccion}
                    onChange={onDireccionChange}
                    placeholder="Ej: Buenos Aires 1400"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                />
                {errors && <InputError message={errors} className="mt-1" />}
            </div>

            {/* NUEVO: Mensaje de resultado de validación */}
            {mensajeValidacion && (
                <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                        direccionValida === true
                            ? esAproximado
                                ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
                                : "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                    }`}
                >
                    <div className="flex items-start gap-2">
                        {direccionValida === true ? (
                            esAproximado ? (
                                <svg
                                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            )
                        ) : (
                            <svg
                                className="w-5 h-5 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        )}
                        <div className="flex-1 whitespace-pre-line">
                            {mensajeValidacion}
                        </div>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={onValidate}
                disabled={validandoDireccion || !direccion || !ciudad}
                className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    direccionValida === true
                        ? "bg-green-600 text-white dark:bg-green-500"
                        : direccionValida === false
                        ? "bg-red-600 text-white dark:bg-red-500"
                        : "bg-edu-dark text-white hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {validandoDireccion ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Validando...
                    </>
                ) : direccionValida === true ? (
                    <>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Dirección válida ✓
                    </>
                ) : direccionValida === false ? (
                    <>
                        <svg
                            className="w-5 h-5"
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
                        Intenta de nuevo
                    </>
                ) : (
                    <>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                        Validar dirección
                    </>
                )}
            </button>
        </div>
    );
}
