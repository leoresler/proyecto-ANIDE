import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Heart, MessageCircle } from 'lucide-react';

export default function Show({ institucion, publicaciones = [], auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {institucion.nombre}
                </h2>
            }
        >
            <div className="max-w-4xl mx-auto py-10 px-4">
                <Head title={institucion.nombre} />

                {/* 🔹 Imagen de perfil */}
                <div className="text-center mb-10">
                    <img
                        src={
                            institucion.profile_photo_url
                                ? institucion.profile_photo_url
                                : '/storage/profile-photos/default.png'
                        }
                        alt={`Foto de perfil de ${institucion.nombre}`}
                        className="w-40 h-40 object-cover rounded-full shadow-lg border-4 border-white mx-auto"
                    />
                    <p className="text-gray-700 mt-4 max-w-2xl mx-auto">{institucion.descripcion}</p>
                </div>

                {/* 🔹 Botón para iniciar chat */}
                {auth.user?.id !== institucion.user_id && (
                    <div className="text-center mt-6">
                        <button
                            onClick={() => {
                                router.post(route('chat.iniciar'), {
                                    institucion_id: institucion.id,
                                });
                            }}
                            className="bg-edu-dark hover:bg-edu-darker text-white font-semibold px-5 py-2 rounded-lg shadow transition"
                        >
                            💬 Iniciar chat
                        </button>
                    </div>
                )}

                {/* 🔹 Información */}
                <div className="text-gray-700 mb-8 text-center space-y-2">
                    <p>
                        <strong>Tipo:</strong> {institucion.tipo_institucion || 'Sin especificar'}
                    </p>
                    <p>
                        <strong>Dirección:</strong> {institucion.direccion || 'No indicada'}
                    </p>
                    <p>
                        <strong>Sitio web:</strong>{' '}
                        {institucion.url_sitio_web ? (
                            <a
                                href={institucion.url_sitio_web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                {institucion.url_sitio_web}
                            </a>
                        ) : (
                            'No disponible'
                        )}
                    </p>
                </div>

                {/* 🔹 Publicaciones */}
                <div className="mt-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Publicaciones recientes
                    </h3>

                    {publicaciones.length === 0 ? (
                        <p className="text-gray-500 text-center">
                            Esta institución aún no tiene publicaciones.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {publicaciones.map((pub) => (
                                <div
                                    key={pub.id}
                                    className="bg-white rounded-2xl shadow border p-5 flex flex-col justify-between"
                                >
                                    {/* Título */}
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                        {pub.titulo}
                                    </h4>

                                    {/* Contenido (resumen) */}
                                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                                        {pub.contenido}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-gray-500 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <span className="flex items-center">
                                                <Heart className="w-4 h-4 mr-1 text-red-500" />
                                                {pub.likes?.length || 0}
                                            </span>
                                            <span className="flex items-center">
                                                <MessageCircle className="w-4 h-4 mr-1" />
                                                {pub.comentarios?.length || 0}
                                            </span>
                                        </div>
                                        <Link
                                            href={route('publicaciones.show', pub.id)}
                                            className="text-edu-dark font-medium hover:underline"
                                        >
                                            Ver más →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 🔹 Residencias */}
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Residencias
                    </h3>

                    {institucion.residencias?.length === 0 ? (
                        <p className="text-gray-500 text-center">
                            Esta institución aún no tiene residencias registradas.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {institucion.residencias.map((res) => (
                                <div
                                    key={res.id}
                                    className="bg-white rounded-2xl shadow-md overflow-hidden"
                                >
                                    <img
                                        src={
                                            res.foto_portada
                                                ? `/storage/${res.foto_portada}`
                                                : '/images/residencia-default.jpg'
                                        }
                                        alt={res.nombre}
                                        className="w-full h-40 object-cover"
                                    />

                                    <div className="p-4">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                            {res.nombre}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {res.direccion || 'Dirección no especificada'}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <strong>Capacidad:</strong> {res.capacidad || 'N/A'}
                                        </p>
                                        {res.contacto && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                <strong>Contacto:</strong> {res.contacto}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 mb-2">
                                            <strong>Información adicional: </strong> 
                                            {res.info_adicional || 'Sin información adicional'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                <div className="mt-10 text-center">
                    <Link
                        href={route('inicio')}
                        className="text-sm text-gray-600 underline"
                    >
                        Volver
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
