import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import PublicacionHeader from "./PublicacionHeader";
import PublicacionContent from "./PublicacionContent";
import PublicacionActions from "./PublicacionActions";

/**
 * Componente principal para mostrar una tarjeta de publicación
 */
export default function PublicacionCard({
    publicacion,
    userType,
    onLike,
    onFavorite,
    variant = "card", // 'card' | 'compact' | 'full'
}) {
    const [isLiked, setIsLiked] = useState(publicacion.user_has_liked);
    const [likesCount, setLikesCount] = useState(publicacion.likes_count);
    const [isFavorite, setIsFavorite] = useState(publicacion.is_favorite);

    const handleLike = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        onLike(publicacion.id);
    };

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (userType === "persona") {
            setIsFavorite(!isFavorite);
            onFavorite(publicacion.id);
        }
    };

    // Variantes de diseño
    const variants = {
        card: {
            wrapper:
                "bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow",
            padding: "p-6",
            border: "border-b",
            actions: "px-6 py-4 border-t",
        },
        compact: {
            wrapper:
                "bg-white rounded-lg shadow-sm hover:shadow transition-shadow",
            padding: "p-4",
            border: "border-b",
            actions: "px-4 py-3 border-t",
        },
        full: {
            wrapper: "bg-white",
            padding: "p-8",
            border: "py-4 border-t border-b",
            actions: "",
        },
    };

    const config = variants[variant];
    const canLike = true; // Tanto personas como instituciones pueden dar like
    const canFavorite = userType === "persona";

    return (
        <div className={config.wrapper}>
            {/* Header - Información de la institución */}
            <div className={config.padding}>
                <Link href={`/publicaciones/${publicacion.id}`}>
                    <div className={`${config.border} pb-4 mb-4`}>
                        <PublicacionHeader
                            institucion={publicacion.institucion}
                            createdAt={publicacion.created_at}
                            size={variant === "full" ? "large" : "default"}
                        />
                    </div>

                    {/* Contenido */}
                    <PublicacionContent
                        titulo={publicacion.titulo}
                        contenido={publicacion.contenido}
                        media={publicacion.media}
                        expandable={variant !== "full"}
                        maxLength={variant === "compact" ? 150 : 300}
                    />
                </Link>
            </div>

            {/* Acciones */}
            <div className={config.actions || `${config.padding} border-t`}>
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
                    size={variant === "compact" ? "small" : "default"}
                />
            </div>
        </div>
    );
}
