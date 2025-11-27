import { useState, useEffect, useRef } from "react";
import {
    X,
    Heart,
    MessageCircle,
    Bookmark,
    FileText,
    ChevronLeft,
    ChevronRight,
    Send,
    Download,
} from "lucide-react";
import { Link, router } from "@inertiajs/react";
import PublicacionActions from "./PublicacionActions";
import ComentarioItem from "./ComentarioItem";
import toast from "react-hot-toast";
import axios from "axios";

export default function PublicacionModal({
    publicacion,
    userType,
    auth,
    onClose,
}) {
    const [isLiked, setIsLiked] = useState(publicacion.user_has_liked);
    const [likesCount, setLikesCount] = useState(
        Number(publicacion.likes_count) || 0
    );
    const [isFavorite, setIsFavorite] = useState(publicacion.is_favorite);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [comentario, setComentario] = useState("");
    const [comentarios, setComentarios] = useState(
        publicacion.comentarios || []
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const modalRef = useRef(null);
    const videoRef = useRef(null);

    const media = publicacion.media || [];
    const currentMedia = media[currentMediaIndex];

    // Obtener el ID del usuario actual según el tipo
    const currentUserId =
        userType === "persona"
            ? auth.user.persona?.id
            : auth.user.institucion?.id;

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleClickOutside = (e) => {
        if (modalRef.current === e.target) {
            onClose();
        }
    };

    const handleLike = async () => {
        const prevLiked = isLiked;
        const prevCount = likesCount;

        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

        try {
            const res = await axios.post("/likes/toggle", {
                target_id: publicacion.id,
                target_tipo: "publicacion",
            });

            if (!res.data.success) {
                setIsLiked(prevLiked);
                setLikesCount(prevCount);
            }
        } catch (error) {
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
            console.error("Error al togglear like:", error);
            toast.error("No se pudo actualizar el like");
        }
    };

    const handleFavorite = async () => {
        const prevFav = isFavorite;
        setIsFavorite(!isFavorite);

        try {
            const res = await axios.post("/favoritos/toggle", {
                publicacion_id: publicacion.id,
            });

            if (!res.data.success) {
                setIsFavorite(prevFav);
            }
        } catch (error) {
            setIsFavorite(prevFav);
            console.error("Error al togglear favorito:", error);
        }
    };

    const handleSubmitComentario = async (e) => {
        e.preventDefault();
        if (!comentario.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage("");

        const loadingToast = toast.loading("Publicando comentario...");

        try {
            const response = await axios.post("/comentarios", {
                publicacion_id: publicacion.id,
                contenido: comentario,
            });

            if (response.data.success) {
                toast.dismiss(loadingToast);
                toast.success("¡Comentario publicado!");
                setComentario("");

                // Agregar el nuevo comentario al inicio de la lista
                setComentarios([response.data.comentario, ...comentarios]);

                // Recargar para obtener los datos actualizados
                router.reload({
                    only: ["publicacion"],
                    preserveScroll: true,
                });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error al comentar:", error);

            if (error.response && error.response.status === 422) {
                const data = error.response.data;

                if (data.blocked) {
                    const count = data.detected_words_count || 0;
                    const mensaje =
                        count === 1
                            ? "Tu comentario contiene una palabra prohibida. Por favor, usa un lenguaje apropiado y vuelve a intentarlo."
                            : `Tu comentario contiene ${count} palabras prohibidas. Por favor, usa un lenguaje apropiado y vuelve a intentarlo.`;

                    setErrorMessage(data.message || mensaje);
                    toast.error(
                        "Comentario bloqueado por contenido inapropiado ⚠️",
                        { duration: 5000 }
                    );
                } else if (data.errors) {
                    const errores = Object.values(data.errors).flat();
                    setErrorMessage(errores.join(", "));
                    toast.error(errores[0]);
                } else {
                    setErrorMessage(
                        data.message || "Error al publicar el comentario"
                    );
                    toast.error("No se pudo publicar el comentario");
                }
            } else {
                setErrorMessage(
                    "Hubo un error al publicar tu comentario. Por favor, inténtalo de nuevo."
                );
                toast.error("Error de conexión. Inténtalo de nuevo.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextMedia = () => {
        setCurrentMediaIndex((prev) => (prev + 1) % media.length);
        setCurrentTime(0);
        setIsPlaying(true);
    };

    const prevMedia = () => {
        setCurrentMediaIndex(
            (prev) => (prev - 1 + media.length) % media.length
        );
        setCurrentTime(0);
        setIsPlaying(true);
    };

    const togglePlayPause = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        if (!videoRef.current || !duration) return;

        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = Math.max(0, Math.min(pos * duration, duration));

        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e) => {
        e.stopPropagation();
        const newVolume = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const canLike = true;
    const canFavorite = true;
    const canComment = true;

    return (
        <div
            ref={modalRef}
            onClick={handleClickOutside}
            className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4 backdrop-blur-sm"
        >
            <div className="bg-white border border-edu-dark dark:bg-gray-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl mt-10">
                {/* Sección Izquierda - Media */}
                <div className="md:w-3/5 bg-black relative flex items-center justify-center h-[450px] md:h-auto">
                    {media.length > 0 ? (
                        <>
                            <div className="w-full h-full flex items-center justify-center">
                                {currentMedia?.tipo === "imagen" && (
                                    <img
                                        src={currentMedia.url_publica}
                                        alt={publicacion.titulo}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}

                                {currentMedia?.tipo === "video" && (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <video
                                            key={
                                                currentMedia.id ||
                                                currentMediaIndex
                                            }
                                            ref={videoRef}
                                            src={currentMedia.url_publica}
                                            autoPlay
                                            className="max-w-full max-h-full object-contain"
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onTimeUpdate={handleTimeUpdate}
                                            onLoadedMetadata={
                                                handleLoadedMetadata
                                            }
                                        />
                                    </div>
                                )}

                                {currentMedia?.tipo === "documento" && (
                                    <div className="flex flex-col items-center justify-center p-8 bg-gray-900">
                                        <FileText className="w-24 h-24 text-gray-400 mb-4" />
                                        <p className="text-white text-center mb-4 font-medium">
                                            {currentMedia.url
                                                ?.split("/")
                                                .pop() || "Documento"}
                                        </p>
                                        <a
                                            href={currentMedia.url_publica}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-6 py-3 bg-edu-dark text-white rounded-lg hover:bg-gray-700 transition"
                                        >
                                            <Download className="w-5 h-5 mr-2" />
                                            Descargar documento
                                        </a>
                                    </div>
                                )}
                            </div>

                            {media.length > 1 && (
                                <>
                                    <button
                                        onClick={prevMedia}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextMedia}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>

                                    <div className="absolute top-3 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs z-10">
                                        {currentMediaIndex + 1} / {media.length}
                                    </div>
                                </>
                            )}

                            {currentMedia?.tipo === "video" && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20">
                                    <div
                                        className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group"
                                        onClick={handleSeek}
                                    >
                                        <div
                                            className="h-full bg-white rounded-full relative transition"
                                            style={{
                                                width: `${
                                                    duration
                                                        ? (currentTime /
                                                              duration) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                className="hover:bg-white/10 p-2 rounded-full transition"
                                                onClick={togglePlayPause}
                                            >
                                                {isPlaying ? (
                                                    <svg
                                                        className="w-6 h-6"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="w-6 h-6"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                )}
                                            </button>

                                            <div className="text-sm">
                                                {formatTime(currentTime)} /{" "}
                                                {formatTime(duration)}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="hover:bg-white/10 p-2 rounded-full transition"
                                                onClick={toggleMute}
                                            >
                                                {isMuted || volume === 0 ? (
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                                                    </svg>
                                                )}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                                                style={{
                                                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                                                        volume * 100
                                                    }%, rgba(255,255,255,0.2) ${
                                                        volume * 100
                                                    }%, rgba(255,255,255,0.2) 100%)`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>Sin multimedia</p>
                        </div>
                    )}
                </div>

                {/* Sección Derecha - Info y Comentarios */}
                <div className="md:w-2/5 flex flex-col max-h-[90vh]">
                    {/* Header con botón cerrar */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <Link
                            href={`/instituciones/${publicacion.institucion.id}`}
                            className="flex items-center gap-3 flex-1"
                        >
                            <img
                                src={
                                    publicacion.institucion?.user
                                        ?.profile_photo_url ||
                                    "/profile-photos/default-avatar.webp"
                                }
                                alt={publicacion.institucion?.user?.nombre}
                                className="w-14 h-14 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {publicacion.institucion?.user?.nombre}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(
                                        publicacion.created_at
                                    ).toLocaleDateString("es-AR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition flex-shrink-0"
                        >
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Título y Contenido */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            {publicacion.titulo}
                        </h1>
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[240px] overflow-y-auto pr-2 custom-scroll">
                            {publicacion.contenido}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                            size="default"
                        />
                    </div>

                    {/* Comentarios con Scroll usando ComentarioItem */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll bg-gray-50 dark:bg-gray-900">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Comentarios ({comentarios.length})
                        </h2>

                        {comentarios.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
                                Aún no hay comentarios. ¡Sé el primero en
                                comentar!
                            </p>
                        ) : (
                            [...comentarios]
                                .sort(
                                    (a, b) =>
                                        new Date(b.created_at) -
                                        new Date(a.created_at)
                                )
                                .map((comentario) => (
                                    <ComentarioItem
                                        key={comentario.id}
                                        comentario={comentario}
                                        userType={userType}
                                        currentUserId={currentUserId}
                                        publicacionInstitucionId={
                                            publicacion.perf_institucion_id
                                        }
                                        level={0}
                                    />
                                ))
                        )}
                    </div>

                    {/* Input de Comentario */}
                    {canComment && (
                        <form
                            onSubmit={handleSubmitComentario}
                            className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                            <div className="flex space-x-3">
                                <img
                                    src={
                                        auth?.user?.profile_photo_url ||
                                        "/profile-photos/default-avatar.webp"
                                    }
                                    alt={auth?.user?.nombre}
                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <textarea
                                        value={comentario}
                                        onChange={(e) => {
                                            setComentario(e.target.value);
                                            if (errorMessage)
                                                setErrorMessage("");
                                        }}
                                        placeholder="Escribe un comentario..."
                                        className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 resize-none ${
                                            errorMessage
                                                ? "border-red-300 dark:border-red-600"
                                                : ""
                                        }`}
                                        rows="3"
                                        maxLength={500}
                                        disabled={isSubmitting}
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <span
                                            className={`text-xs ${
                                                comentario.length > 950
                                                    ? "text-red-500 font-medium"
                                                    : "text-gray-500 dark:text-gray-400"
                                            }`}
                                        >
                                            {comentario.length}/500
                                        </span>
                                        <button
                                            type="submit"
                                            disabled={
                                                isSubmitting ||
                                                !comentario.trim()
                                            }
                                            className="inline-flex items-center px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            {isSubmitting
                                                ? "Enviando..."
                                                : "Comentar"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
