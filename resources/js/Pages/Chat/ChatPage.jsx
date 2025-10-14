import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ChatPage({ auth, chats }) {
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
                            {chats.map((chat) => (
                                <Link
                                    href={route('chat.show', chat.id)}
                                    key={chat.id}
                                    className="block bg-white shadow p-4 rounded hover:bg-gray-50 transition"
                                >
                                    {chat.persona ? (
                                        <p>👤 {chat.persona.user.name}</p>
                                    ) : (
                                        <p>🏫 {chat.institucion.user.name}</p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Último mensaje: {chat.mensajes?.[chat.mensajes.length - 1]?.contenido || 'Sin mensajes'}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
