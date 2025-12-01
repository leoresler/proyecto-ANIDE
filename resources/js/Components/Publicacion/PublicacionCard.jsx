import { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import PublicacionActions from "./PublicacionActions";
import PublicacionModal from "./PublicacionModal";
import MediaFullscreenMobile from "./MediaFullscreenMobile";
import { FileText } from "lucide-react";

export default function PublicacionCard({
    publicacion,
    userType,
    auth,
    disableModal = false,
    disableFavorite = false,
}) {
    const [isLiked, setIsLiked] = useState(publicacion.user_has_liked);
    const [likesCount, setLikesCount] = useState(
        Number(publicacion.likes_count) || 0
    );
    const [isFavorite, setIsFavorite] = useState(publicacion.is_favorite);
    const [showModal, setShowModal] = useState(false);
    const [showMobileFullscreen, setShowMobileFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsLiked(publicacion.user_has_liked);
        setLikesCount(publicacion.likes_count);
        setIsFavorite(publicacion.is_favorite);
    }, [publicacion.id]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();

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
        }
    };

    const handleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

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

    const handleMediaClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // No hacer nada si el modal está deshabilitado
        if (disableModal) {
            return;
        }

        if (isMobile) {
            setShowMobileFullscreen(true);
        } else {
            setShowModal(true);
        }
    };

    const handleContentClick = (e) => {
        if (
            e.target.closest("button") ||
            e.target.closest("a[href^='/instituciones']")
        ) {
            return;
        }

        // // No navegar si el modal está deshabilitado
        // if (disableModal) {
        //     return;
        // }

        if (!e.target.closest(".media-container")) {
            router.visit(`/publicaciones/${publicacion.id}`);
        }
    };

    const canLike = true;
    const canFavorite = !disableFavorite;

    const primeraMedia =
        publicacion.media && publicacion.media.length > 0
            ? publicacion.media[0]
            : null;

    return (
        <>
            <div
                onClick={handleContentClick}
                className={`bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md transition-all overflow-hidden ${
                    disableModal
                        ? "cursor-default"
                        : "cursor-pointer hover:shadow-lg"
                }`}
            >
                {/* Header - Nombre de la institución */}
                <Link
                    href={`/instituciones/${publicacion.institucion.id}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <img
                            src={
                                publicacion.institucion?.user
                                    ?.profile_photo_url ||
                                "/profile-photos/default-avatar.webp"
                            }
                            alt={
                                publicacion.institucion?.user?.nombre ||
                                "Institución"
                            }
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                                {publicacion.institucion?.user?.nombre ||
                                    "Institución"}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(
                                    publicacion.created_at
                                ).toLocaleDateString("es-AR", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Contenido de texto */}
                <div className="px-4 pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-edu-mid hover:opacity-80">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {publicacion.contenido.length > 200
                            ? publicacion.contenido.substring(0, 200) + "..."
                            : publicacion.contenido}
                    </p>
                </div>

                {/* Imagen destacada con título superpuesto */}
                {primeraMedia && (
                    <div
                        className={`media-container relative w-full h-80 bg-gray-900 ${
                            disableModal ? "cursor-default" : "cursor-zoom-in"
                        }`}
                        onClick={handleMediaClick}
                    >
                        {primeraMedia.tipo === "imagen" && (
                            <img
                                src={primeraMedia.url_publica}
                                alt={publicacion.titulo}
                                className="w-full h-full object-cover"
                            />
                        )}

                        {primeraMedia.tipo === "video" && (
                            <video
                                src={primeraMedia.url_publica}
                                className="w-full h-full object-cover"
                                muted
                            />
                        )}

                        {primeraMedia.tipo === "documento" && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <FileText className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                            <h2 className="text-white text-2xl font-bold leading-tight drop-shadow-lg">
                                {publicacion.titulo}
                            </h2>
                        </div>

                        {publicacion.media.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium pointer-events-none">
                                +{publicacion.media.length - 1}
                            </div>
                        )}
                    </div>
                )}

                {/* Si no hay media, mostrar solo el título */}
                {!primeraMedia && (
                    <div className="px-4 pb-3">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {publicacion.titulo}
                        </h2>
                    </div>
                )}

                {/* Acciones */}
                <div
                    className="px-4 py-3 border-t border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    <PublicacionActions
                        isLiked={isLiked}
                        likesCount={likesCount}
                        onLike={handleLike}
                        canLike={canLike}
                        comentariosCount={publicacion.comentarios_count}
                        commentHref={`/publicaciones/${publicacion.id}`}
                        isFavorite={isFavorite}
                        onFavorite={handleFavorite}
                        canFavorite={canFavorite}
                        publicacionId={publicacion.id}
                        layout="spaced"
                        size="default"
                    />
                </div>
            </div>

            {showModal && !isMobile && (
                <PublicacionModal
                    publicacion={publicacion}
                    userType={userType}
                    auth={auth}
                    onClose={() => setShowModal(false)}
                />
            )}

            {showMobileFullscreen && isMobile && (
                <MediaFullscreenMobile
                    publicacion={publicacion}
                    onClose={() => setShowMobileFullscreen(false)}
                />
            )}
        </>
    );
}
