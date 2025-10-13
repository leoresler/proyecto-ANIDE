import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Heart, MessageCircle, Trash2, ChevronDown } from "lucide-react";

export default function ComentarioItem({
    comentario,
    userType,
    currentUserId,
    level = 0,
}) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comentario.likes?.length || 0);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showAllReplies, setShowAllReplies] = useState(false);

    const REPLIES_PREVIEW_COUNT = 2; // Mostrar solo 2 respuestas inicialmente
    const respuestas = comentario.respuestas || [];
    const hasMoreReplies = respuestas.length > REPLIES_PREVIEW_COUNT;
    const displayedReplies = showAllReplies
        ? respuestas
        : respuestas.slice(0, REPLIES_PREVIEW_COUNT);
    const hiddenRepliesCount = respuestas.length - REPLIES_PREVIEW_COUNT;

    // Obtener el nombre completo del autor
    const getAuthorName = () => {
        // Si es una persona
        if (comentario.perf_persona_id && comentario.persona?.user) {
            const nombre = comentario.persona.user.nombre || "";
            const apellido = comentario.persona.apellido || "";
            return `${nombre} ${apellido}`.trim() || "Usuario desconocido";
        }

        // Si es una institución
        if (comentario.perf_institucion_id && comentario.institucion?.user) {
            return comentario.institucion.user.nombre || "Institución";
        }

        return "Usuario desconocido";
    };

    // Obtener la foto de perfil del autor
    const getAuthorPhoto = () => {
        if (comentario.perf_persona_id && comentario.persona?.user) {
            return (
                comentario.persona.user.profile_photo_url ||
                "/storage/profile-photos/default.png"
            );
        }

        if (comentario.perf_institucion_id && comentario.institucion?.user) {
            return (
                comentario.institucion.user.profile_photo_url ||
                "/storage/profile-photos/default.png"
            );
        }

        return "/storage/profile-photos/default.png";
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

        router.post(
            "/likes/toggle",
            {
                target_id: comentario.id,
                target_tipo: "comentario",
            },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    const handleReplySubmit = (e) => {
        e.preventDefault();

        if (!replyText.trim()) return;

        router.post(
            "/comentarios",
            {
                publicacion_id: comentario.publicacion_id,
                contenido: replyText,
                coment_padre_id: comentario.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyText("");
                    setShowReplyForm(false);
                    router.reload({ only: ["publicacion"] });
                },
            }
        );
    };

    const handleDelete = () => {
        if (confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
            router.delete(`/comentarios/${comentario.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ["publicacion"] });
                },
            });
        }
    };

    const canDelete =
        userType === "persona" && currentUserId === comentario.perf_persona_id;
    const maxLevel = 2; // Máximo nivel de anidación

    return (
        <div className={`${level > 0 ? "ml-12" : ""}`}>
            <div className="flex space-x-3">
                <img
                    src={getAuthorPhoto()}
                    alt={getAuthorName()}
                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                />

                <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">
                                {getAuthorName()}
                            </span>
                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-800 transition"
                                    title="Eliminar comentario"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {comentario.contenido}
                        </p>
                    </div>

                    {/* Acciones del comentario */}
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-1 transition ${
                                isLiked ? "text-red-600" : "text-gray-600"
                            } hover:text-red-600`}
                        >
                            <Heart
                                className={`w-4 h-4 ${
                                    isLiked ? "fill-current" : ""
                                }`}
                            />
                            <span>{likesCount}</span>
                        </button>

                        {userType === "persona" && level < maxLevel && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Responder</span>
                            </button>
                        )}

                        <span className="text-gray-500 text-xs">
                            {new Date(comentario.created_at).toLocaleDateString(
                                "es-AR",
                                {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </span>
                    </div>

                    {/* Formulario de respuesta */}
                    {showReplyForm && (
                        <form onSubmit={handleReplySubmit} className="mt-3">
                            <div className="flex space-x-2">
                                <textarea
                                    value={replyText}
                                    onChange={(e) =>
                                        setReplyText(e.target.value)
                                    }
                                    placeholder="Escribe una respuesta..."
                                    className="flex-1 rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm"
                                    rows="2"
                                    autoFocus
                                />
                            </div>
                            <div className="flex space-x-2 mt-2">
                                <button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    className="px-3 py-1 bg-edu-dark text-white rounded-md text-sm hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Responder
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReplyForm(false)}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Respuestas anidadas */}
                    {respuestas.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {displayedReplies.map((respuesta) => (
                                <ComentarioItem
                                    key={respuesta.id}
                                    comentario={respuesta}
                                    userType={userType}
                                    currentUserId={currentUserId}
                                    level={level + 1}
                                />
                            ))}

                            {/* Botón "Ver más respuestas" */}
                            {hasMoreReplies && !showAllReplies && (
                                <button
                                    onClick={() => setShowAllReplies(true)}
                                    className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition ml-12"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                    <span>
                                        Ver {hiddenRepliesCount} respuesta
                                        {hiddenRepliesCount !== 1 ? "s" : ""}{" "}
                                        más
                                    </span>
                                </button>
                            )}

                            {/* Botón "Ocultar respuestas" */}
                            {showAllReplies && hasMoreReplies && (
                                <button
                                    onClick={() => setShowAllReplies(false)}
                                    className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-700 transition ml-12"
                                >
                                    <ChevronDown className="w-4 h-4 transform rotate-180" />
                                    <span>Ocultar respuestas</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
