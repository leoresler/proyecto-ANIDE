import { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Send,
    ChevronLeft,
    ChevronRight,
    Download,
    X,
    FileText,
} from "lucide-react";
import PublicacionActions from "@/Components/Publicacion/PublicacionActions";
import ComentarioItem from "@/Components/Publicacion/ComentarioItem";
import toast from "react-hot-toast";
import axios from "axios";

export default function Show({ auth, publicacion, userType }) {
    const [isLiked, setIsLiked] = useState(publicacion.user_has_liked);
    const [likesCount, setLikesCount] = useState(publicacion.likes_count);
    const [isFavorite, setIsFavorite] = useState(publicacion.is_favorite);
    const [comentarioText, setComentarioText] = useState("");
    const [comentarios, setComentarios] = useState(publicacion.comentarios);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const media = publicacion.media || [];

    const handleLike = async () => {
        const previousLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

        try {
            const response = await axios.post("/likes/toggle", {
                target_id: publicacion.id,
                target_tipo: "publicacion",
            });

            if (response.data.success) {
                // agregar msj si se quiere
            }
        } catch (error) {
            setIsLiked(previousLiked);
            setLikesCount(previousCount);

            console.error("Error al dar like:", error);
            toast.error("No se pudo actualizar el like");
        }
    };

    const handleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (userType !== "persona") {
            toast.error("Solo las personas pueden guardar favoritos");
            return;
        }

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

    const handleComentarioSubmit = async (e) => {
        e.preventDefault();
        if (!comentarioText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage("");

        const loadingToast = toast.loading("Publicando comentario...");

        try {
            const response = await axios.post("/comentarios", {
                publicacion_id: publicacion.id,
                contenido: comentarioText,
            });

            if (response.data.success) {
                toast.dismiss(loadingToast);
                toast.success("¡Comentario publicado!");

                setComentarioText("");
                setComentarios([response.data.comentario, ...comentarios]);

                // Recargar
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
                    // Comentario bloqueado por palabras prohibidas
                    const count = data.detected_words_count || 0;
                    const mensaje =
                        count === 1
                            ? "Tu comentario contiene una palabra prohibida. Por favor, usa un lenguaje apropiado y vuelve a intentarlo."
                            : `Tu comentario contiene ${count} palabras prohibidas. Por favor, usa un lenguaje apropiado y vuelve a intentarlo.`;

                    setErrorMessage(data.message || mensaje);
                    toast.error(
                        "Comentario bloqueado por contenido inapropiado ⚠️",
                        {
                            duration: 5000,
                        }
                    );
                } else if (data.errors) {
                    // Errores de validación
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

    const nextMedia = () =>
        setCurrentMediaIndex((prev) => (prev + 1) % media.length);
    const prevMedia = () =>
        setCurrentMediaIndex(
            (prev) => (prev - 1 + media.length) % media.length
        );

    const canLike = true;
    const canFavorite = userType === "persona";
    const canComment = true;
    const isOwner =
        userType === "institucion" &&
        auth.user.institucion?.id === publicacion.perf_institucion_id;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={publicacion.titulo} />

            <div className="py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {media.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* IZQUIERDA - Slider */}
                            <div className="bg-white rounded-3xl border border-gray-700 overflow-hidden h-[450px]">
                                <div className="relative bg-black h-full flex items-center justify-center">
                                    <MediaSlide
                                        media={media[currentMediaIndex]}
                                        onFullscreen={() =>
                                            setShowFullscreen(true)
                                        }
                                    />

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

                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                                                {media.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() =>
                                                            setCurrentMediaIndex(
                                                                index
                                                            )
                                                        }
                                                        className={`w-2 h-2 rounded-full transition ${
                                                            index ===
                                                            currentMediaIndex
                                                                ? "bg-white w-5"
                                                                : "bg-white/40"
                                                        }`}
                                                    />
                                                ))}
                                            </div>

                                            <div className="absolute top-3 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs z-10">
                                                {currentMediaIndex + 1} /{" "}
                                                {media.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* DERECHA - info */}
                            <PublicacionInfo
                                publicacion={publicacion}
                                comentarios={comentarios}
                                isLiked={isLiked}
                                likesCount={likesCount}
                                isFavorite={isFavorite}
                                handleLike={handleLike}
                                handleFavorite={handleFavorite}
                                canLike={canLike}
                                canFavorite={canFavorite}
                            />
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-full max-w-6xl">
                                <PublicacionInfo
                                    publicacion={publicacion}
                                    comentarios={comentarios}
                                    isLiked={isLiked}
                                    likesCount={likesCount}
                                    isFavorite={isFavorite}
                                    handleLike={handleLike}
                                    handleFavorite={handleFavorite}
                                    canLike={canLike}
                                    canFavorite={canFavorite}
                                />
                            </div>
                        </div>
                    )}

                    {/* COMENTARIOS */}
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Comentarios ({comentarios.length})
                        </h2>

                        {canComment && (
                            <form
                                onSubmit={handleComentarioSubmit}
                                className="mb-6"
                            >
                                <div className="flex space-x-3">
                                    <img
                                        src={auth.user.profile_photo_url}
                                        alt={auth.user.nombre}
                                        className="w-10 h-10 rounded-full flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <textarea
                                            value={comentarioText}
                                            onChange={(e) => {
                                                setComentarioText(
                                                    e.target.value
                                                );
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
                                                    comentarioText.length > 950
                                                        ? "text-red-500 font-medium"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {comentarioText.length}/500
                                            </span>
                                            <button
                                                type="submit"
                                                disabled={
                                                    isSubmitting ||
                                                    !comentarioText.trim()
                                                }
                                                className="inline-flex items-center px-4 py-2 bg-edu-dark text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

                        <div className="space-y-4">
                            {comentarios.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    Aún no hay comentarios. ¡Sé el primero en
                                    comentar!
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
                                                : auth.user.institucion?.id
                                        }
                                        publicacionInstitucionId={
                                            publicacion.perf_institucion_id
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FULLSCREEN */}
            {showFullscreen && media[currentMediaIndex] && (
                <FullscreenModal
                    allMedia={media}
                    initialIndex={currentMediaIndex}
                    onClose={() => setShowFullscreen(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}

/* ----------------------------- COMPONENTES ----------------------------- */

function PublicacionInfo({
    publicacion,
    comentarios,
    isLiked,
    likesCount,
    isFavorite,
    handleLike,
    handleFavorite,
    canLike,
    canFavorite,
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between h-full transition-colors">
            <div>
                <div className="flex items-center space-x-3 mb-4">
                    <img
                        src={publicacion.institucion?.user?.profile_photo_url}
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
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {publicacion.titulo}
                </h1>

                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4 max-h-[240px] overflow-y-auto pr-2 custom-scroll">
                    {publicacion.contenido}
                </div>
            </div>

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
    );
}

function MediaSlide({ media, onFullscreen }) {
    if (!media || !media.url_publica) return null;

    if (media.tipo === "imagen")
        return (
            <img
                src={media.url_publica}
                alt="Imagen"
                className="w-full h-full object-contain cursor-pointer"
                onClick={onFullscreen}
            />
        );

    if (media.tipo === "video")
        return (
            <div
                className="w-full h-full flex items-center justify-center cursor-pointer"
                onClick={onFullscreen}
            >
                <video
                    src={media.url_publica}
                    className="w-full h-full object-contain"
                    preload="metadata"
                />
                {/* Indicador de video */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black bg-opacity-50 rounded-full p-4">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>
        );

    if (media.tipo === "documento") {
        const fileName = media.url?.split("/").pop() || "Documento";
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
                <FileText className="w-24 h-24 text-gray-400 mb-4" />
                <p className="text-gray-700 text-center mb-4 font-medium">
                    {fileName}
                </p>
                <a
                    href={media.url_publica}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-edu-dark text-white rounded-lg hover:bg-gray-800 transition"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Descargar documento
                </a>
            </div>
        );
    }

    return null;
}

function FullscreenModal({ allMedia, initialIndex, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef(null);

    const currentMedia = allMedia[currentIndex];
    const hasMultiple = allMedia.length > 1;

    // Manejar tecla ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handlePrevious = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
        setCurrentTime(0);
        setIsPlaying(true);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
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

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header con controles superiores */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-20">
                <div className="flex items-center justify-between">
                    {/* Botones de navegación */}
                    <div className="flex items-center space-x-2">
                        {hasMultiple && (
                            <>
                                <button
                                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition backdrop-blur-sm"
                                    onClick={handlePrevious}
                                    aria-label="Anterior"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition backdrop-blur-sm"
                                    onClick={handleNext}
                                    aria-label="Siguiente"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Contador central */}
                    {hasMultiple && (
                        <div className="bg-white/10 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                            {currentIndex + 1} / {allMedia.length}
                        </div>
                    )}

                    {/* Botón cerrar */}
                    <button
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition backdrop-blur-sm"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-24">
                {currentMedia.tipo === "imagen" && (
                    <img
                        src={currentMedia.url_publica}
                        alt="Vista completa"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                )}

                {currentMedia.tipo === "video" && (
                    <div className="relative max-w-full max-h-full">
                        <video
                            key={currentMedia.id || currentIndex}
                            ref={videoRef}
                            src={currentMedia.url_publica}
                            autoPlay
                            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                        >
                            Tu navegador no soporta el elemento de video.
                        </video>
                    </div>
                )}

                {currentMedia.tipo === "documento" && (
                    <div className="bg-gray-900 rounded-lg p-12 text-center">
                        <FileText className="w-32 h-32 text-gray-400 mx-auto mb-6" />
                        <p className="text-white text-xl mb-6">
                            {currentMedia.url?.split("/").pop() || "Documento"}
                        </p>
                        <a
                            href={currentMedia.url_publica}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg"
                        >
                            <Download className="w-6 h-6 mr-3" />
                            Descargar documento
                        </a>
                    </div>
                )}
            </div>

            {/* Controles de video personalizados - solo para videos */}
            {currentMedia.tipo === "video" && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20">
                    {/* Barra de progreso */}
                    <div
                        className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-blue-500 rounded-full relative group-hover:bg-blue-400 transition"
                            style={{
                                width: `${
                                    duration
                                        ? (currentTime / duration) * 100
                                        : 0
                                }%`,
                            }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition"></div>
                        </div>
                    </div>

                    {/* Controles inferiores */}
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                            {/* Play/Pause */}
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

                            {/* Tiempo */}
                            <div className="text-sm">
                                {formatTime(currentTime)} /{" "}
                                {formatTime(duration)}
                            </div>
                        </div>

                        {/* Volumen */}
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
                                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
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
        </div>
    );
}