import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
    // config para ver web en movil
    server: {
        host: "0.0.0.0", // Permite conexiones desde cualquier IP de la red
        port: 5173, // Puerto por defecto de Vite
        hmr: {
            host: "192.168.0.249", // Tu IP local (la del APP_URL)
        },
        watch: {
            usePolling: true, // Útil para algunos sistemas de archivos
        },
    },
});
