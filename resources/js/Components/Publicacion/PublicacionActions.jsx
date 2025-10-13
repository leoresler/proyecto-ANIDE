import React from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";

/**
 * Componente para el boton de Like
 */
export function LikeButton({
    isLiked,
    likesCount,
    onLike,
    disabled = false,
    size = "default", // 'small' | 'default' | 'large'
}) {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-5 h-5",
        large: "w-6 h-6",
    };

    const textSizeClasses = {
        small: "text-sm",
        default: "text-base",
        large: "text-lg",
    };

    return (
        <button
            onClick={onLike}
            disabled={disabled}
            className={`flex items-center space-x-2 transition ${
                disabled
                    ? "cursor-not-allowed opacity-50"
                    : "hover:text-black"
            } ${isLiked ? "text-edu-dark" : "text-gray-600"}`}
        >
            <Heart
                className={`${sizeClasses[size]} ${
                    isLiked ? "fill-current" : ""
                }`}
            />
            <span className={`font-medium ${textSizeClasses[size]}`}>
                {likesCount}
            </span>
        </button>
    );
}

/**
 * Componente para el boton de Comentarios
 */
export function CommentButton({
    comentariosCount,
    onClick,
    href,
    size = "default", // 'small' | 'default' | 'large'
}) {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-5 h-5",
        large: "w-6 h-6",
    };

    const textSizeClasses = {
        small: "text-sm",
        default: "text-base",
        large: "text-lg",
    };

    const baseClasses =
        "flex items-center space-x-2 text-gray-600 hover:text-black transition";

    const content = (
        <>
            <MessageCircle className={sizeClasses[size]} />
            <span className={`font-medium ${textSizeClasses[size]}`}>
                {comentariosCount}
            </span>
        </>
    );

    if (href) {
        return (
            <a href={href} className={baseClasses}>
                {content}
            </a>
        );
    }

    return (
        <button onClick={onClick} className={baseClasses}>
            {content}
        </button>
    );
}

/**
 * Componente para el boton de Favoritos
 */
export function FavoriteButton({
    isFavorite,
    onFavorite,
    disabled = false,
    size = "default", // 'small' | 'default' | 'large'
}) {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-5 h-5",
        large: "w-6 h-6",
    };

    return (
        <button
            onClick={onFavorite}
            disabled={disabled}
            className={`transition ${
                disabled
                    ? "cursor-not-allowed opacity-50"
                    : "hover:text-black"
            } ${isFavorite ? "text-edu-dark" : "text-gray-600"}`}
            title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
            <Bookmark
                className={`${sizeClasses[size]} ${
                    isFavorite ? "fill-current" : ""
                }`}
            />
        </button>
    );
}

/**
 * Componente para el boton de Compartir
 */
export function ShareButton({
    onShare,
    publicacionId,
    size = "default", // 'small' | 'default' | 'large'
}) {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-5 h-5",
        large: "w-6 h-6",
    };

    const handleShare = () => {
        if (onShare) {
            onShare(publicacionId);
        } else {
            // Compartir nativo del navegador
            const url = `${window.location.origin}/publicaciones/${publicacionId}`;
            if (navigator.share) {
                navigator
                    .share({
                        title: "Compartir publicación",
                        url: url,
                    })
                    .catch((err) => console.log("Error al compartir:", err));
            } else {
                // Fallback: copiar al portapapeles
                navigator.clipboard.writeText(url);
                alert("Enlace copiado al portapapeles");
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="text-gray-600 hover:text-gray-900 transition"
            title="Compartir publicación"
        >
            <Share2 className={sizeClasses[size]} />
        </button>
    );
}

/**
 * Componente contenedor para todas las acciones de publicación
 */
export function PublicacionActions({
    // Props para Like
    isLiked,
    likesCount,
    onLike,
    canLike = true,

    // Props para Comentarios
    comentariosCount,
    onCommentClick,
    commentHref,

    // Props para Favoritos
    isFavorite,
    onFavorite,
    canFavorite = false,

    // Props para Compartir
    onShare,
    publicacionId,
    showShare = true,

    // Props generales
    size = "default",
    className = "",
    layout = "horizontal", // 'horizontal' | 'spaced'
}) {
    const layoutClasses = {
        horizontal: "flex items-center space-x-6",
        spaced: "flex items-center justify-between",
    };

    return (
        <div className={`${layoutClasses[layout]} ${className}`}>
            <div className="flex items-center space-x-6">
                {/* Like */}
                <LikeButton
                    isLiked={isLiked}
                    likesCount={likesCount}
                    onLike={onLike}
                    disabled={!canLike}
                    size={size}
                />

                {/* Comentarios */}
                <CommentButton
                    comentariosCount={comentariosCount}
                    onClick={onCommentClick}
                    href={commentHref}
                    size={size}
                />
            </div>

            <div className="flex items-center space-x-4">
                {/* Favoritos */}
                {canFavorite && (
                    <FavoriteButton
                        isFavorite={isFavorite}
                        onFavorite={onFavorite}
                        size={size}
                    />
                )}

                {/* Compartir */}
                {showShare && (
                    <ShareButton
                        onShare={onShare}
                        publicacionId={publicacionId}
                        size={size}
                    />
                )}
            </div>
        </div>
    );
}

export default PublicacionActions;
