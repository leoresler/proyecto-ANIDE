import "../css/app.css";
import "./bootstrap";
import './echo';


import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";

const appName = "EDUQUÉN";

createInertiaApp({
    title: () => appName,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});

// manejar errores 419 (CSRF token expired)
router.on("error", (event) => {
    // si es un error 419, recargar la página para obtener un nuevo token
    if (event.detail.response?.status === 419) {
        console.warn("Sesión expirada. Recargando página...");
        window.location.reload();
    }
});

// alternativa
router.on("before", () => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token && window.axios) {
        window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
    }
});
