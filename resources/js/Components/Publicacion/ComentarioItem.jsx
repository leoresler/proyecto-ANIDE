import { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Heart,
    MessageCircle,
    Trash2,
    ChevronDown,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import PersonaProfileModal from "@/Components/ModalPersona/PersonaProfileModal";

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
    const [isExpanded, setIsExpanded] = useState(false);
    const [localRespuestas, setLocalRespuestas] = useState(
        comentario.respuestas || []
    );
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const REPLIES_PREVIEW_COUNT = 1;
    const MAX_CHARS = 200;

    const displayedReplies = showAllReplies
        ? localRespuestas
        : localRespuestas.slice(0, REPLIES_PREVIEW_COUNT);

    const contenido = comentario.eliminado
        ? "La persona o institución ha borrado el mensaje."
        : comentario.contenido;

    const shouldShowExpandButton =
        !comentario.eliminado && contenido.length > MAX_CHARS;

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
                "/images/default-avatar.webp"
            );
        }

        if (comentario.perf_institucion_id && comentario.institucion?.user) {
            return (
                comentario.institucion.user.profile_photo_url ||
                "/images/default-avatar.webp"
            );
        }

        return "/images/default-avatar.webp";
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

        if (localRespuestas.length >= 20) {
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

                setLocalRespuestas([nuevaRespuesta, ...localRespuestas]);

                setShowReplyForm(false);
                setReplyText("");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error al responder:", error);

            if (error.response && error.response.status === 422) {
                const data = error.response.data;

                if (data.blocked) {
                    const count = data.detected_words_count || 0;
                    const mensaje =
                        count === 1
                            ? "Tu respuesta contiene una palabra prohibida. Por favor, usa un lenguaje apropiado."
                            : `Tu respuesta contiene ${count} palabras prohibidas. Por favor, usa un lenguaje apropiado.`;

                    setReplyErrorMessage(data.message || mensaje);
                    toast.error(
                        "Respuesta bloqueada por contenido inapropiado ⚠️",
                        { duration: 5000 }
                    );
                } else if (data.errors) {
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
                    background: "var(--toast-bg, #fff)",
                    color: "var(--toast-color, #000)",
                    maxWidth: "400px",
                    padding: "16px",
                },
            }
        );
    };

    const canDelete =
        !comentario.eliminado &&
        ((userType === "persona" &&
            currentUserId === comentario.perf_persona_id) ||
            (userType === "institucion" &&
                (currentUserId === comentario.perf_institucion_id ||
                    currentUserId === publicacionInstitucionId)));

    const esPersona = comentario.perf_persona_id && comentario.persona;

    return (
        <div className={`${level > 0 ? "ml-8" : ""}`}>
            <div className="flex gap-3">
                {/* Avatar con modal para personas */}
                {esPersona ? (
                    <PersonaProfileModal
                        personaId={comentario.persona.id}
                        isMobile={isMobile}
                        trigger={
                            <img
                                src={getAuthorPhoto()}
                                alt={getAuthorName()}
                                className="w-10 h-10 rounded-full flex-shrink-0 object-cover cursor-pointer"
                            />
                        }
                    />
                ) : comentario.institucion ? (
                    <Link href={`/instituciones/${comentario.institucion.id}`}>
                        <img
                            src={getAuthorPhoto()}
                            alt={getAuthorName()}
                            className="w-10 h-10 rounded-full flex-shrink-0 object-cover cursor-pointer"
                        />
                    </Link>
                ) : (
                    <img
                        src={getAuthorPhoto()}
                        alt={getAuthorName()}
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                    />
                )}

                <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {getAuthorName()}
                            </span>

                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                                    title="Eliminar comentario"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Contenido del comentario */}
                        <div className="break-words">
                            <p
                                className={`whitespace-pre-wrap ${
                                    comentario.eliminado
                                        ? "italic text-gray-500 dark:text-gray-400"
                                        : "text-gray-700 dark:text-gray-300"
                                }`}
                                style={{
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                }}
                            >
                                {isExpanded || !shouldShowExpandButton
                                    ? contenido
                                    : `${contenido.substring(0, MAX_CHARS)}...`}
                            </p>

                            {shouldShowExpandButton && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition mt-2 flex items-center gap-1"
                                >
                                    {isExpanded ? (
                                        <>
                                            Ver menos
                                            <ChevronDown className="w-3 h-3 transform rotate-180" />
                                        </>
                                    ) : (
                                        <>
                                            Ver más
                                            <ChevronDown className="w-3 h-3" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Acciones del comentario */}
                    {!comentario.eliminado && (
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                            <button
                                onClick={handleLike}
                                className={`flex items-center space-x-1 transition ${
                                    isLiked
                                        ? "text-edu-dark"
                                        : "text-gray-600 dark:text-gray-400"
                                } hover:text-black dark:hover:text-white`}
                            >
                                <Heart
                                    className={`w-4 h-4 dark:text-gray-200 ${
                                        isLiked ? "fill-current" : ""
                                    }`}
                                />
                                <span className="dark:text-gray-200">
                                    {likesCount}
                                </span>
                            </button>

                            {level === 0 && (
                                <button
                                    onClick={() => {
                                        setShowReplyForm(!showReplyForm);
                                        setReplyErrorMessage("");
                                    }}
                                    className="flex items-center space-x-1 text-edu-dark hover:text-black dark:text-gray-400 dark:hover:text-white transition"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Responder</span>
                                </button>
                            )}

                            <span className="text-gray-500 dark:text-gray-400 text-xs">
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
                            {replyErrorMessage && (
                                <div className="mb-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 dark:text-red-300">
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
                                    className={`flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 text-sm ${
                                        replyErrorMessage
                                            ? "border-red-300 dark:border-red-600"
                                            : ""
                                    }`}
                                    rows="2"
                                    maxLength={500}
                                    autoFocus
                                    disabled={isSubmittingReply}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span
                                    className={`text-xs ${
                                        replyText.length > 950
                                            ? "text-red-500 font-medium"
                                            : "text-gray-500 dark:text-gray-400"
                                    }`}
                                >
                                    {replyText.length}/500
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={
                                            !replyText.trim() ||
                                            isSubmittingReply
                                        }
                                        className="px-3 py-1 bg-edu-dark text-white rounded-md text-sm hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                        disabled={isSubmittingReply}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Respuestas anidadas */}
                    {localRespuestas.length > 0 && (
                        <div className="mt-4 space-y-4">
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

                            {!showAllReplies &&
                                localRespuestas.length >
                                    REPLIES_PREVIEW_COUNT && (
                                    <button
                                        onClick={() => {
                                            setShowAllReplies(true);
                                        }}
                                        className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition ml-8"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                        <span>
                                            Ver{" "}
                                            {localRespuestas.length -
                                                REPLIES_PREVIEW_COUNT}{" "}
                                            respuesta
                                            {localRespuestas.length -
                                                REPLIES_PREVIEW_COUNT !==
                                            1
                                                ? "s"
                                                : ""}{" "}
                                            más
                                        </span>
                                    </button>
                                )}

                            {showAllReplies &&
                                localRespuestas.length >
                                    REPLIES_PREVIEW_COUNT && (
                                    <button
                                        onClick={() => setShowAllReplies(false)}
                                        className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition ml-8"
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