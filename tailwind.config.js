import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                "edu-dark": "#2A3A47", // fondo superior oscuro
                "edu-mid": "#3E4B59", // transición
                "edu-gold": "#F5DFA6", // dorado claro
                "edu-accent": "#EAC77C",
            },
        },
    },

    plugins: [forms],
};
