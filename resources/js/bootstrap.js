import axios from "axios";

window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Para evitar errores de primera carga, usar onDOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
    } else {
        console.error("CSRF token not found!");
    }
});


axios.defaults.withCredentials = true;
axios.defaults.baseURL = window.location.origin;
