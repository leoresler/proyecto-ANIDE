import { useState } from "react";
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
                            <div className="bg-white rounded-3xl border overflow-hidden h-[450px]">
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
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={nextMedia}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>

                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
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

                                            <div className="absolute top-3 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
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
                    <div className="mt-6 bg-white rounded-3xl border p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
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
                                        {/* Alerta de error inline */}
                                        {/* {errorMessage && (
                                            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-700">
                                                    {errorMessage}
                                                </p>
                                            </div>
                                        )} */}

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
                                            className={`w-full rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500 resize-none ${
                                                errorMessage
                                                    ? "border-red-300"
                                                    : ""
                                            }`}
                                            rows="3"
                                            maxLength={1000}
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
                                                {comentarioText.length}/1000
                                            </span>
                                            <button
                                                type="submit"
                                                disabled={
                                                    isSubmitting ||
                                                    !comentarioText.trim()
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

                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {comentarios.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
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
                                        isPublicacionOwner={isOwner}
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
                    media={media[currentMediaIndex]}
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
        <div className="bg-white rounded-3xl border p-6 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center space-x-3 mb-4">
                    <img
                        src={publicacion.institucion?.user?.profile_photo_url}
                        alt={publicacion.institucion?.user?.nombre}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                            {publicacion.institucion?.user?.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">
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

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {publicacion.titulo}
                </h1>

                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4 max-h-[240px] overflow-y-auto pr-2 custom-scroll">
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
                className="w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    src={media.url_publica}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-contain"
                />
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
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Descargar documento
                </a>
            </div>
        );
    }

    return null;
}

function FullscreenModal({ media, onClose }) {
    if (media.tipo !== "imagen") return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            >
                <X className="w-10 h-10" />
            </button>
            <img
                src={media.url_publica}
                alt="Vista completa"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
