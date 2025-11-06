import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import PublicacionActions from "./PublicacionActions";
import { FileText } from "lucide-react";

/**
 * Componente principal para mostrar una tarjeta de publicación
 * Diseño: Nombre institución -> Contenido -> Título sobre imagen -> Acciones
 */
export default function PublicacionCard({ publicacion, userType }) {
    const [isLiked, setIsLiked] = useState(publicacion.user_has_liked);
    const [likesCount, setLikesCount] = useState(Number(publicacion.likes_count) || 0);
    const [isFavorite, setIsFavorite] = useState(publicacion.is_favorite);

    useEffect(() => {
        setIsLiked(publicacion.user_has_liked);
        setLikesCount(publicacion.likes_count);
        setIsFavorite(publicacion.is_favorite);
    }, [publicacion.id]);

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

        // Si no es persona, no hacemos nada
        if (userType !== "persona") {
            // opcional: mostrar mensaje con toast si querés
            return;
        }

        const prevFav = isFavorite;

        // Cambio visual instantáneo (optimistic UI)
        setIsFavorite(!isFavorite);

        try {
            const res = await axios.post("/favoritos/toggle", {
                publicacion_id: publicacion.id,
            });

            // Si backend responde success=false, revertimos
            if (!res.data.success) {
                setIsFavorite(prevFav);
            }
            // NO llamamos a onFavorite(...) para evitar que el padre recargue props
        } catch (error) {
            // Revertimos en caso de error
            setIsFavorite(prevFav);
            console.error("Error al togglear favorito:", error);
        }
    };

    const canLike = true;
    const canFavorite = userType === "persona";

    // Obtener la primera media para mostrar como destacada
    const primeraMedia =
        publicacion.media && publicacion.media.length > 0
            ? publicacion.media[0]
            : null;

    return (
        <div className="bg-white rounded-3xl border shadow-lg transition-shadow overflow-hidden">
            {/* Header - Nombre de la institución */}
            <Link href={`/instituciones/${publicacion.institucion.user.id}`}>
                <div className="p-4 flex items-center space-x-3">
                <img
                    src={
                        publicacion.institucion?.user?.profile_photo_url ||
                        "/images/default-avatar.png"
                    }
                    alt={publicacion.institucion?.user?.nombre || "Institución"}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">
                        {publicacion.institucion?.user?.nombre || "Institución"}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {new Date(publicacion.created_at).toLocaleDateString(
                            "es-AR",
                            {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}
                    </p>
                </div>
            </div>
            </Link>
            

            <Link href={`/publicaciones/${publicacion.id}`}>
                {/* Contenido de texto */}
                <div className="px-4 pb-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {publicacion.contenido.length > 200
                            ? publicacion.contenido.substring(0, 200) + "..."
                            : publicacion.contenido}
                    </p>
                </div>

                {/* Imagen destacada con título superpuesto */}
                {primeraMedia && (
                    <div className="relative w-full h-80 bg-gray-900">
                        {/* Imagen o video de fondo */}
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
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <FileText className="w-24 h-24 text-gray-400" />
                            </div>
                        )}

                        {/* Overlay con gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Título superpuesto */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h2 className="text-white text-2xl font-bold leading-tight drop-shadow-lg">
                                {publicacion.titulo}
                            </h2>
                        </div>

                        {/* Indicador de más imágenes */}
                        {publicacion.media.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                                +{publicacion.media.length - 1}
                            </div>
                        )}
                    </div>
                )}

                {/* Si no hay media, mostrar solo el título */}
                {!primeraMedia && (
                    <div className="px-4 pb-3">
                        <h2 className="text-xl font-bold text-gray-900">
                            {publicacion.titulo}
                        </h2>
                    </div>
                )}
            </Link>

            {/* Acciones */}
            <div className="px-4 py-3 border-t">
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
    );
}
