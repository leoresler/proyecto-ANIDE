import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Send } from "lucide-react";
import PublicacionHeader from "@/Components/Publicacion/PublicacionHeader";
import PublicacionContent from "@/Components/Publicacion/PublicacionContent";
import PublicacionActions from "@/Components/Publicacion/PublicacionActions";
import ComentarioItem from "@/Components/Publicacion/ComentarioItem";

export default function Show({ auth, publicacion, userType }) {
    const [isLiked, setIsLiked] = useState(publicacion.user_has_liked);
    const [likesCount, setLikesCount] = useState(publicacion.likes_count);
    const [isFavorite, setIsFavorite] = useState(publicacion.is_favorite);
    const [comentarioText, setComentarioText] = useState("");
    const [comentarios, setComentarios] = useState(publicacion.comentarios);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

        router.post(
            "/likes/toggle",
            {
                target_id: publicacion.id,
                target_tipo: "publicacion",
            },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    const handleFavorite = () => {
        if (userType === "persona") {
            setIsFavorite(!isFavorite);

            router.post(
                "/favoritos/toggle",
                {
                    publicacion_id: publicacion.id,
                },
                {
                    preserveScroll: true,
                    preserveState: false,
                }
            );
        }
    };

    const handleComentarioSubmit = (e) => {
        e.preventDefault();

        if (!comentarioText.trim()) return;

        router.post(
            "/comentarios",
            {
                publicacion_id: publicacion.id,
                contenido: comentarioText,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setComentarioText("");
                    router.reload({
                        only: ["publicacion"],
                        preserveScroll: true,
                    });
                },
                onError: (errors) => {
                    console.error("Error al comentar:", errors);
                },
            }
        );
    };

    const canLike = true; // Tanto personas como instituciones
    const canFavorite = userType === "persona";

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={publicacion.titulo} />

            <div className="">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            {/* Header con info de la institución */}
                            <div className="mb-6">
                                <PublicacionHeader
                                    institucion={publicacion.institucion}
                                    createdAt={publicacion.created_at}
                                    size="large"
                                />
                            </div>

                            {/* Contenido completo */}
                            <PublicacionContent
                                titulo={publicacion.titulo}
                                contenido={publicacion.contenido}
                                media={publicacion.media}
                                expandable={false}
                            />

                            {/* Acciones */}
                            <div className="py-4 border-t border-b mt-6">
                                <PublicacionActions
                                    isLiked={isLiked}
                                    likesCount={likesCount}
                                    onLike={handleLike}
                                    canLike={canLike}
                                    comentariosCount={comentarios.length}
                                    isFavorite={isFavorite}
                                    onFavorite={handleFavorite}
                                    canFavorite={canFavorite}
                                    publicacionId={publicacion.id}
                                    layout="spaced"
                                    size="large"
                                />
                            </div>

                            {/* Sección de comentarios */}
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Comentarios
                                </h2>

                                {/* Formulario para nuevo comentario (solo personas) */}
                                {userType === "persona" && (
                                    <form
                                        onSubmit={handleComentarioSubmit}
                                        className="mb-6"
                                    >
                                        <div className="flex space-x-3">
                                            <img
                                                src={
                                                    auth.user.profile_photo_url
                                                }
                                                alt={auth.user.nombre}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <textarea
                                                    value={comentarioText}
                                                    onChange={(e) =>
                                                        setComentarioText(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Escribe un comentario..."
                                                    className="w-full rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                                                    rows="3"
                                                />
                                                <button
                                                    type="submit"
                                                    className="mt-2 inline-flex items-center px-4 py-2 bg-edu-dark border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-black focus:bg-black active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                >
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Comentar
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {/* Lista de comentarios */}
                                <div className="space-y-4">
                                    {comentarios.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">
                                            No hay comentarios aún. ¡Sé el
                                            primero en comentar!
                                        </p>
                                    ) : (
                                        comentarios.map((comentario) => (
                                            <ComentarioItem
                                                key={comentario.id}
                                                comentario={comentario}
                                                userType={userType}
                                                currentUserId={
                                                    userType === "persona"
                                                        ? auth.user.persona?.id
                                                        : null
                                                }
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
