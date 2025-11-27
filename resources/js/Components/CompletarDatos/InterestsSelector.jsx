import InputError from "@/Components/InputError";
import { CATEGORIAS, MAX_INTERESES_USUARIO } from "@/utils/categoriasConfig";

export default function InterestsSelector({
    selectedInterests,
    onToggleInterest,
    error,
}) {
    const availableCategories = CATEGORIAS.filter(
        (cat) => !selectedInterests.includes(cat)
    );

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        Seleccioná tus intereses *
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Elegí hasta {MAX_INTERESES_USUARIO} categorías que te
                        interesen
                    </p>
                </div>
                <div className="text-right">
                    <span
                        className={`text-lg font-bold ${
                            selectedInterests.length >= MAX_INTERESES_USUARIO
                                ? "text-red-600 dark:text-red-400"
                                : "text-blue-600 dark:text-blue-400"
                        }`}
                    >
                        {selectedInterests.length}/{MAX_INTERESES_USUARIO}
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categorías disponibles:
                </p>
                <div className="flex flex-wrap gap-2">
                    {availableCategories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => onToggleInterest(cat)}
                            disabled={
                                selectedInterests.length >=
                                MAX_INTERESES_USUARIO
                            }
                            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            + {cat}
                        </button>
                    ))}
                </div>
            </div>

            {selectedInterests.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tus intereses seleccionados:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {selectedInterests.map((interest) => (
                            <span
                                key={interest}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm shadow-md"
                            >
                                {interest}
                                <button
                                    type="button"
                                    onClick={() => onToggleInterest(interest)}
                                    className="hover:bg-blue-700 dark:hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
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
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
}
