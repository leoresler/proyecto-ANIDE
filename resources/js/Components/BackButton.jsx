import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
    const [visible, setVisible] = useState(true);
    const [lastScroll, setLastScroll] = useState(0);
    const { url } = usePage();

    // rutas donde NO queremos mostrar el boton
    const hiddenRoutes = ["/inicio", "/"];

    // rutas donde NO debe aparecer el boton
    const shouldHide = hiddenRoutes.some(
        (route) => url === route || url.startsWith(route + "?")
    );

    const canGoBack =
        typeof window !== "undefined" && window.history.length > 1;

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;

            // si scrollea hacia abajo, se oculta
            if (currentScroll > lastScroll && currentScroll > 50) {
                setVisible(false);
            }
            // si scrollea hacia arriba, aparece
            else {
                setVisible(true);
            }

            setLastScroll(currentScroll);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScroll]);

    // ocultar boton
    if (!canGoBack || shouldHide) return null;

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <button
            onClick={handleGoBack}
            className={`
                md:hidden
                flex items-center gap-2 px-3 py-1.5 bg-white shadow-md rounded-full 
                text-gray-700 hover:bg-gray-100 transition-all duration-300 
                fixed left-4 top-20 z-50
                ${
                    visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                }
            `}
            aria-label="Volver"
        >
            <ArrowLeft size={18} />
            <span>Volver</span>
        </button>
    );
}