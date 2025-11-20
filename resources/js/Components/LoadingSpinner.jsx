export default function LoadingSpinner({ size = "md", color = "blue" }) {
    const sizes = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    const colors = {
        blue: "border-blue-600",
        gray: "border-gray-600",
        white: "border-white",
    };

    return (
        <div className="flex justify-center items-center py-4">
            <div
                className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full animate-spin`}
                role="status"
                aria-label="Cargando"
            >
                <span className="sr-only">Cargando...</span>
            </div>
        </div>
    );
}
