import React from 'react';
import { Head, Link } from '@inertiajs/react';
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
