import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function ChatDetalle({ chat, mensajes, auth }) {
    const { data, setData, post, reset } = useForm({
        contenido: ''
    });

    // Referencia para el contenedor de mensajes, para hacer scroll automático
    const mensajesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (mensajesEndRef.current) {
            mensajesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    const enviarMensaje = (e) => {
        e.preventDefault();
        if (!data.contenido.trim()) return;

        post(route('chat.enviar', chat.id), {
            onSuccess: () => reset('contenido'),
        });
    };

    const otraParte = chat.persona ? chat.persona.user : chat.institucion.user;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat con {otraParte.name}</h2>}
        >
            <Head title={`Chat con ${otraParte.name}`} />

            <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col h-[calc(100vh-16rem)]">
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto border rounded p-4 space-y-2 bg-gray-50">
                    {mensajes.length === 0 ? (
                        <p className="text-gray-500 text-center">No hay mensajes aún</p>
                    ) : (
                        mensajes.map((mensaje) => (
                            <div
                                key={mensaje.id}
                                className={`p-2 rounded max-w-xs ${
                                    mensaje.emisor_id === auth.user.id
                                        ? 'bg-blue-500 text-white ml-auto'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                {mensaje.contenido}
                            </div>
                        ))
                    )}
                    <div ref={mensajesEndRef} />
                </div>

                {/* Formulario para enviar mensaje */}
                <form onSubmit={enviarMensaje} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={data.contenido}
                        onChange={(e) => setData('contenido', e.target.value)}
                        placeholder="Escribí un mensaje..."
                        className="flex-1 border rounded px-3 py-2 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Enviar
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
