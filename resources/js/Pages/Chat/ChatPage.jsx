import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ChatPage({ auth, chats = [] }) {
    const userId = auth.user.id;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat</h2>}
        >
            <Head title="Chat" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {chats.length === 0 ? (
                        <p className="text-gray-600 text-center">
                            No tenés chats abiertos todavía.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {chats.map((chat) => {
                                const personaUser = chat.persona?.user;
                                const institucionUser = chat.institucion?.user;

                                const soyPersona = personaUser?.id === userId;
                                const soyInstitucion = institucionUser?.id === userId;

                                let otroUser = null;
                                if (soyPersona) otroUser = institucionUser;
                                else if (soyInstitucion) otroUser = personaUser;
                                else otroUser = personaUser || institucionUser;

                                const nombre = otroUser?.nombre || 'Usuario desconocido';
                                const foto = otroUser?.profile_photo_url || '/storage/profile-photos/default.png';
                                const ultimoMensaje = chat.mensajes?.[chat.mensajes.length - 1];

                                return (
                                    <Link
                                        href={route('chat.show', chat.id)}
                                        key={chat.id}
                                        className="flex items-center bg-white shadow p-4 rounded hover:bg-gray-50 transition"
                                    >
                                        <img
                                            src={foto}
                                            alt={nombre}
                                            className="w-12 h-12 rounded-full object-cover mr-4 border"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{nombre}</p>
                                            <p className="text-sm text-gray-500 truncate">
                                                Último mensaje: {ultimoMensaje?.contenido || 'Sin mensajes'}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
