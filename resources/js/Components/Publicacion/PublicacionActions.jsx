import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";

export function LikeButton({
    isLiked,
    likesCount,
    onLike,
    disabled = false,
    size = "default",
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
                    : "hover:text-black dark:hover:text-white"
            } ${
                isLiked
                    ? "text-edu-dark dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400"
            }`}
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

export function CommentButton({
    comentariosCount,
    onClick,
    href,
    size = "default",
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
        "flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition";

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

export function FavoriteButton({
    isFavorite,
    onFavorite,
    disabled = false,
    size = "default",
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
                    : "hover:text-black dark:hover:text-white"
            } ${
                isFavorite
                    ? "text-edu-dark dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400"
            }`}
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

export function ShareButton({ onShare, publicacionId, size = "default" }) {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-5 h-5",
        large: "w-6 h-6",
    };

    const handleShare = () => {
        if (onShare) {
            onShare(publicacionId);
        } else {
            const url = `${window.location.origin}/publicaciones/${publicacionId}`;
            if (navigator.share) {
                navigator
                    .share({
                        title: "Compartir publicación",
                        url: url,
                    })
                    .catch((err) => console.log("Error al compartir:", err));
            } else {
                navigator.clipboard.writeText(url);
                alert("Enlace copiado al portapapeles");
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            title="Compartir publicación"
        >
            <Share2 className={sizeClasses[size]} />
        </button>
    );
}

export function PublicacionActions({
    isLiked,
    likesCount,
    onLike,
    canLike = true,
    comentariosCount,
    onCommentClick,
    commentHref,
    isFavorite,
    onFavorite,
    canFavorite = false,
    onShare,
    publicacionId,
    showShare = true,
    size = "default",
    className = "",
    layout = "horizontal",
}) {
    const layoutClasses = {
        horizontal: "flex items-center space-x-6",
        spaced: "flex items-center justify-between",
    };

    return (
        <div className={`${layoutClasses[layout]} ${className}`}>
            <div className="flex items-center space-x-6">
                <LikeButton
                    isLiked={isLiked}
                    likesCount={likesCount}
                    onLike={onLike}
                    disabled={!canLike}
                    size={size}
                />

                <CommentButton
                    comentariosCount={comentariosCount}
                    onClick={onCommentClick}
                    href={commentHref}
                    size={size}
                />
            </div>

            <div className="flex items-center space-x-4">
                {canFavorite && (
                    <FavoriteButton
                        isFavorite={isFavorite}
                        onFavorite={onFavorite}
                        size={size}
                    />
                )}

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
