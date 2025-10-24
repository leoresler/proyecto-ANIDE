import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Heart,
    MessageCircle,
    Trash2,
    ChevronDown,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function ComentarioItem({
    comentario,
    userType,
    currentUserId,
    publicacionInstitucionId,
    level = 0,
}) {
    const [isLiked, setIsLiked] = useState(
        comentario.likes?.some(
            (like) =>
                (like.perf_persona_id &&
                    like.perf_persona_id === currentUserId) ||
                (like.perf_institucion_id &&
                    like.perf_institucion_id === currentUserId)
        ) || false
    );
    const [likesCount, setLikesCount] = useState(comentario.likes?.length || 0);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [replyErrorMessage, setReplyErrorMessage] = useState("");

    const REPLIES_PREVIEW_COUNT = 1;
    const respuestas = comentario.respuestas || [];
    const displayedReplies = showAllReplies
        ? respuestas
        : respuestas.slice(0, REPLIES_PREVIEW_COUNT);

    const getAuthorName = () => {
        if (comentario.perf_persona_id && comentario.persona?.user) {
            const nombre = comentario.persona.user.nombre || "";
            const apellido = comentario.persona.apellido || "";
            return `${nombre} ${apellido}`.trim() || "Usuario desconocido";
        }

        if (comentario.perf_institucion_id && comentario.institucion?.user) {
            return comentario.institucion.user.nombre || "Institución";
        }

        return "Usuario desconocido";
    };

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

    const handleLike = async () => {
        const nuevoEstado = !isLiked;
        const previousLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(nuevoEstado);
        setLikesCount(nuevoEstado ? likesCount + 1 : likesCount - 1);

        try {
            await axios.post("/likes/toggle", {
                target_id: comentario.id,
                target_tipo: "comentario",
            });
        } catch (error) {
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
            toast.error("No se pudo actualizar el like");
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();

        if (!replyText.trim() || isSubmittingReply) return;

        if (respuestas.length >= 20) {
            const errorMsg =
                "Se alcanzó el límite máximo de 20 respuestas para este comentario.";
            setReplyErrorMessage(errorMsg);
            toast.error(errorMsg, { duration: 4000 });
            return;
        }

        setIsSubmittingReply(true);
        setReplyErrorMessage("");

        const loadingToast = toast.loading("Enviando respuesta...");

        try {
            const response = await axios.post("/comentarios", {
                publicacion_id: comentario.publicacion_id,
                contenido: replyText,
                coment_padre_id: comentario.id,
            });

            if (response.data.success) {
                toast.dismiss(loadingToast);
                toast.success("¡Respuesta publicada!");

                const nuevaRespuesta = response.data.comentario;
                comentario.respuestas = [nuevaRespuesta, ...respuestas];
                setShowReplyForm(false);
                setReplyText("");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error al responder:", error);

            if (error.response && error.response.status === 422) {
                const data = error.response.data;

                if (data.blocked) {
                    // Respuesta bloqueada por palabras prohibidas
                    const count = data.detected_words_count || 0;
                    const mensaje =
                        count === 1
                            ? "Tu respuesta contiene una palabra prohibida. Por favor, usa un lenguaje apropiado."
                            : `Tu respuesta contiene ${count} palabras prohibidas. Por favor, usa un lenguaje apropiado.`;

                    setReplyErrorMessage(data.message || mensaje);

                    // Toast de error destacado
                    toast.error(
                        "Respuesta bloqueada por contenido inapropiado ⚠️",
                        {
                            duration: 5000,
                            style: {
                                background: "#fef2f2",
                                color: "#991b1b",
                                border: "1px solid #fecaca",
                            },
                        }
                    );
                } else if (data.errors) {
                    // Errores de validación
                    const errores = Object.values(data.errors).flat();
                    const errorMsg = errores.join(", ");
                    setReplyErrorMessage(errorMsg);
                    toast.error(errores[0] || "Error de validación");
                } else {
                    const errorMsg =
                        data.message || "Error al publicar la respuesta";
                    setReplyErrorMessage(errorMsg);
                    toast.error("No se pudo publicar la respuesta");
                }
            } else {
                const errorMsg =
                    "Hubo un error al publicar tu respuesta. Por favor, inténtalo de nuevo.";
                setReplyErrorMessage(errorMsg);
                toast.error("Error de conexión. Inténtalo de nuevo.");
            }
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleDelete = () => {
        // Toast de confirmación personalizado
        toast(
            (t) => (
                <div className="flex flex-col space-y-3">
                    <div>
                        <p className="font-medium text-gray-900">
                            ¿Eliminar este comentario?
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Esta acción no se puede deshacer
                        </p>
                    </div>
                    <div className="flex space-x-2 justify-end">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);

                                const loadingToast = toast.loading(
                                    "Eliminando comentario..."
                                );

                                axios
                                    .delete(`/comentarios/${comentario.id}`)
                                    .then(() => {
                                        toast.dismiss(loadingToast);
                                        toast.success(
                                            "Comentario eliminado correctamente"
                                        );

                                        router.visit(window.location.pathname, {
                                            preserveScroll: true,
                                            preserveState: false,
                                            only: ["publicacion"],
                                        });

                                        // window.location.reload();

                                        // router.reload({
                                        //     only: ["publicacion"],
                                        //     preserveScroll: true,
                                        // });
                                    })
                                    .catch(() => {
                                        toast.dismiss(loadingToast);
                                        toast.error(
                                            "No se pudo eliminar el comentario"
                                        );
                                    });
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                style: {
                    background: "#fff",
                    color: "#000",
                    maxWidth: "400px",
                    padding: "16px",
                },
            }
        );
    };

    // Puede eliminar si:
    // - Persona: su propio comentario
    // - Institución: su comentario o cualquier comentario de su publicación
    const canDelete =
        !comentario.eliminado &&
        ((userType === "persona" &&
            currentUserId === comentario.perf_persona_id) ||
            (userType === "institucion" &&
                (currentUserId === comentario.perf_institucion_id ||
                    currentUserId === publicacionInstitucionId)));

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
                        <p
                            className={`whitespace-pre-wrap ${
                                comentario.eliminado
                                    ? "italic text-gray-500"
                                    : "text-gray-700"
                            }`}
                        >
                            {comentario.eliminado
                                ? "La persona o institución ha borrado el mensaje."
                                : comentario.contenido}
                        </p>
                    </div>

                    {/* Acciones del comentario */}
                    {!comentario.eliminado && (
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                            <button
                                onClick={handleLike}
                                className={`flex items-center space-x-1 transition ${
                                    isLiked ? "text-edu-dark" : "text-gray-600"
                                } hover:text-black`}
                            >
                                <Heart
                                    className={`w-4 h-4 ${
                                        isLiked ? "fill-current" : ""
                                    }`}
                                />
                                <span>{likesCount}</span>
                            </button>

                            {level === 0 && (
                                <button
                                    onClick={() => {
                                        setShowReplyForm(!showReplyForm);
                                        setReplyErrorMessage(""); // Limpiar error al abrir
                                    }}
                                    className="flex items-center space-x-1 text-edu-dark hover:text-black transition"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Responder</span>
                                </button>
                            )}

                            <span className="text-gray-500 text-xs">
                                {new Date(
                                    comentario.created_at
                                ).toLocaleDateString("es-AR", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    )}

                    {/* Formulario de respuesta */}
                    {showReplyForm && (
                        <form onSubmit={handleReplySubmit} className="mt-3">
                            {/* Alerta de error inline */}
                            {replyErrorMessage && (
                                <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">
                                        {replyErrorMessage}
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-2">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => {
                                        setReplyText(e.target.value);
                                        if (replyErrorMessage)
                                            setReplyErrorMessage("");
                                    }}
                                    placeholder="Escribe una respuesta..."
                                    className={`flex-1 rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm ${
                                        replyErrorMessage
                                            ? "border-red-300"
                                            : ""
                                    }`}
                                    rows="2"
                                    maxLength={1000}
                                    autoFocus
                                    disabled={isSubmittingReply}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span
                                    className={`text-xs ${
                                        replyText.length > 950
                                            ? "text-red-500 font-medium"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {replyText.length}/1000
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={
                                            !replyText.trim() ||
                                            isSubmittingReply
                                        }
                                        className="px-3 py-1 bg-edu-dark text-white rounded-md text-sm hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {isSubmittingReply
                                            ? "Enviando..."
                                            : "Responder"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReplyForm(false);
                                            setReplyErrorMessage("");
                                            setReplyText("");
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition"
                                        disabled={isSubmittingReply}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Respuestas anidadas */}
                    {respuestas.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {/* Mostrar las respuestas según el estado */}
                            {displayedReplies.map((respuesta) => (
                                <ComentarioItem
                                    key={respuesta.id}
                                    comentario={respuesta}
                                    userType={userType}
                                    currentUserId={currentUserId}
                                    publicacionInstitucionId={
                                        publicacionInstitucionId
                                    }
                                    level={level + 1}
                                />
                            ))}

                            {/* Botón para ver más respuestas */}
                            {!showAllReplies &&
                                respuestas.length > REPLIES_PREVIEW_COUNT && (
                                    <button
                                        onClick={() => {
                                            setShowAllReplies(true);
                                        }}
                                        className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition ml-12"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                        <span>
                                            Ver{" "}
                                            {respuestas.length -
                                                REPLIES_PREVIEW_COUNT}{" "}
                                            respuesta
                                            {respuestas.length -
                                                REPLIES_PREVIEW_COUNT !==
                                            1
                                                ? "s"
                                                : ""}{" "}
                                            más
                                        </span>
                                    </button>
                                )}

                            {/* Botón para ocultar respuestas */}
                            {showAllReplies &&
                                respuestas.length > REPLIES_PREVIEW_COUNT && (
                                    <button
                                        onClick={() => setShowAllReplies(false)}
                                        className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition ml-12"
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
