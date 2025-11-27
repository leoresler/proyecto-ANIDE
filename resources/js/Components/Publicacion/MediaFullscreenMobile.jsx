import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
    X,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    FileText,
    Download,
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
} from "lucide-react";
import { router } from "@inertiajs/react";
import axios from "axios";
import toast from "react-hot-toast";

export default function MediaFullscreenMobile({ publicacion, onClose }) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isLiked, setIsLiked] = useState(publicacion.user_has_liked);
    const [likesCount, setLikesCount] = useState(
        Number(publicacion.likes_count) || 0
    );
    const [isFavorite, setIsFavorite] = useState(publicacion.is_favorite);
    const videoRef = useRef(null);
    const volumeTimeoutRef = useRef(null);

    const media = publicacion.media || [];
    const currentMedia = media[currentMediaIndex];
    const comentariosCount = publicacion.comentarios_count || 0;

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

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (volumeTimeoutRef.current) {
                clearTimeout(volumeTimeoutRef.current);
            }
        };
    }, []);

    const handleGoToPublicacion = () => {
        router.visit(`/publicaciones/${publicacion.id}`);
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
            toast.error("No se pudo actualizar el favorito");
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/publicaciones/${publicacion.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: publicacion.titulo,
                    text: publicacion.contenido.substring(0, 100) + "...",
                    url: url,
                });
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error al compartir:", error);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Enlace copiado al portapapeles");
            } catch (error) {
                console.error("Error al copiar:", error);
                toast.error("No se pudo copiar el enlace");
            }
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

    const handleVolumeButtonClick = (e) => {
        e.stopPropagation();
        setShowVolumeSlider(!showVolumeSlider);

        // Auto-ocultar después de 3 segundos
        if (!showVolumeSlider) {
            if (volumeTimeoutRef.current) {
                clearTimeout(volumeTimeoutRef.current);
            }
            volumeTimeoutRef.current = setTimeout(() => {
                setShowVolumeSlider(false);
            }, 3000);
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

        // Reiniciar el timeout
        if (volumeTimeoutRef.current) {
            clearTimeout(volumeTimeoutRef.current);
        }
        volumeTimeoutRef.current = setTimeout(() => {
            setShowVolumeSlider(false);
        }, 3000);
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // se renderiza usando un portal (para que este fuera del layout)
    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
            {/* Header con controles superiores */}
            <div
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-[10000]"
                style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
            >
                <div className="flex items-center justify-between">
                    <button
                        className="bg-white/15 hover:bg-white/20 text-white p-3 rounded-full transition backdrop-blur-sm active:scale-95"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <button
                        className="bg-white/15 hover:bg-white/20 text-white p-3 rounded-full transition backdrop-blur-sm active:scale-95"
                        onClick={handleGoToPublicacion}
                        aria-label="Ir a publicación"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Contenido principal - Media */}
            <div className="flex-1 relative flex items-center justify-center">
                {currentMedia?.tipo === "imagen" && (
                    <img
                        src={currentMedia.url_publica}
                        alt="Vista completa"
                        className="max-w-full max-h-full object-contain"
                    />
                )}

                {currentMedia?.tipo === "video" && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <video
                            key={currentMedia.id || currentMediaIndex}
                            ref={videoRef}
                            src={currentMedia.url_publica}
                            autoPlay
                            playsInline
                            className="max-w-full max-h-full object-contain"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                        />
                    </div>
                )}

                {currentMedia?.tipo === "documento" && (
                    <div className="flex flex-col items-center justify-center p-8 max-w-full">
                        <FileText className="w-24 h-24 sm:w-32 sm:h-32 text-gray-400 mb-6" />
                        <p className="text-white text-sm sm:text-base md:text-lg mb-6 text-center px-4 max-w-md break-words">
                            {currentMedia.url?.split("/").pop() || "Documento"}
                        </p>
                        <a
                            href={currentMedia.url_publica}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition text-base sm:text-lg font-medium active:scale-95"
                        >
                            <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                            Descargar
                        </a>
                    </div>
                )}
            </div>

            {/* Sección inferior con controles y acciones */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent z-20 safe-area-bottom">
                {/* Controles del video */}
                {currentMedia?.tipo === "video" && (
                    <div className="px-4 sm:px-6 pb-4 pt-6">
                        {/* Barra de progreso */}
                        <div
                            className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group"
                            onClick={handleSeek}
                        >
                            <div
                                className="h-full bg-white rounded-full relative group-active:bg-white/90 transition"
                                style={{
                                    width: `${
                                        duration
                                            ? (currentTime / duration) * 100
                                            : 0
                                    }%`,
                                }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                            </div>
                        </div>

                        {/* Controles inferiores */}
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center space-x-3">
                                {/* Play/Pause */}
                                <button
                                    className="hover:bg-white/10 p-2 rounded-full transition active:scale-95"
                                    onClick={togglePlayPause}
                                >
                                    {isPlaying ? (
                                        <svg
                                            className="w-5 h-5 sm:w-6 sm:h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-5 h-5 sm:w-6 sm:h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>

                                {/* Tiempo */}
                                <div className="text-xs sm:text-sm font-medium">
                                    {formatTime(currentTime)} /{" "}
                                    {formatTime(duration)}
                                </div>
                            </div>

                            {/* Volumen con slider */}
                            <div className="relative flex items-center">
                                <button
                                    className="hover:bg-white/10 p-2 rounded-full transition active:scale-95"
                                    onClick={handleVolumeButtonClick}
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

                                {/* Slider de volumen */}
                                {showVolumeSlider && (
                                    <div className="absolute right-0 bottom-full mb-2 bg-black/90 backdrop-blur-sm rounded-full p-3 flex items-center gap-2">
                                        <span className="text-xs font-medium whitespace-nowrap">
                                            {Math.round(volume * 100)}%
                                        </span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                                            style={{
                                                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                                                    volume * 100
                                                }%, rgba(255,255,255,0.2) ${
                                                    volume * 100
                                                }%, rgba(255,255,255,0.2) 100%)`,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navegación entre medias */}
                {media.length > 1 && (
                    <div className="flex items-center justify-center gap-4 sm:gap-8 py-4">
                        <button
                            onClick={prevMedia}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition backdrop-blur-sm active:scale-95"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="bg-white/10 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm font-medium">
                            {currentMediaIndex + 1} / {media.length}
                        </div>
                        <button
                            onClick={nextMedia}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition backdrop-blur-sm active:scale-95"
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Acciones */}
                <div className="px-4 py-3 border-t flex justify-between border-gray-700 bg-white">
                    <div className="flex gap-1">
                        {/* Like */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 sm:gap-2 active:scale-95 transition group ${
                                isLiked ? "text-edu-dark" : "text-gray-600"
                            }`}
                        >
                            <div
                                className={`p-2 rounded-full transition ${
                                    isLiked
                                        ? "bg-edu-dark/10"
                                        : "group-hover:bg-edu-dark/10"
                                }`}
                            >
                                <Heart
                                    className={`w-5 h-5 ${
                                        isLiked ? "fill-current" : ""
                                    }`}
                                />
                            </div>
                            {likesCount > 0 && (
                                <span className="text-sm font-medium">
                                    {likesCount}
                                </span>
                            )}
                        </button>

                        {/* Comentarios */}
                        <button
                            onClick={handleGoToPublicacion}
                            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-700 active:scale-95 transition group"
                        >
                            <div className="p-2 rounded-full group-hover:bg-gray-700/10 transition">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            {comentariosCount > 0 && (
                                <span className="text-sm font-medium">
                                    {comentariosCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex gap-1">
                        {/* Favorito */}
                        <button
                            onClick={handleFavorite}
                            className={`flex items-center gap-1 sm:gap-2 active:scale-95 transition group ${
                                isFavorite ? "text-edu-dark" : "text-gray-600"
                            }`}
                        >
                            <div
                                className={`p-2 rounded-full transition ${
                                    isFavorite
                                        ? "bg-gray-500/10"
                                        : "group-hover:bg-gray-700/10"
                                }`}
                            >
                                <Bookmark
                                    className={`w-5 h-5 ${
                                        isFavorite ? "fill-current" : ""
                                    }`}
                                />
                            </div>
                        </button>

                        {/* Compartir */}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-700 active:scale-95 transition group"
                        >
                            <div className="p-2 rounded-full group-hover:bg-gray-700/10 transition">
                                <Share2 className="w-5 h-5" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
