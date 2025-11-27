import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: false,
    encrypted: false,

    wsHost: `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
    wsPort: 80,
    wssPort: 443,

    enabledTransports: ['ws'],
});

// Debug opcional
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('📡 Conectado a Pusher');
});
window.Echo.connector.pusher.connection.bind('error', (err) => {
    console.error('❌ Error en Pusher:', err);
});
