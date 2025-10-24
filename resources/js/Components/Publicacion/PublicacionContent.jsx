import { useState } from "react";
import { FileText, Download, X } from "lucide-react";

/**
 * Componente para mostrar el contenido de una publicación
 */
export default function PublicacionContent({
    titulo,
    contenido,
    media = [],
    expandable = true,
    maxLength = 300,
    showTitle = true,
}) {
    const [isExpanded, setIsExpanded] = useState(!expandable);

    const shouldTruncate = expandable && contenido.length > maxLength;
    const displayContent =
        shouldTruncate && !isExpanded
            ? contenido.substring(0, maxLength) + "..."
            : contenido;

    return (
        <div className="space-y-4">
            {/* Título */}
            {showTitle && titulo && (
                <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
            )}

            {/* Contenido */}
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {displayContent}
            </p>

            {/* Botón "Ver más" */}
            {shouldTruncate && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    {isExpanded ? "Ver menos" : "Ver más"}
                </button>
            )}

            {/* Media Gallery */}
            {media && media.length > 0 && <PublicacionMedia media={media} />}
        </div>
    );
}

/**
 * Componente para mostrar los archivos multimedia
 */
function PublicacionMedia({ media }) {
    if (!media || media.length === 0) return null;

    // Diferentes layouts según cantidad de media
    if (media.length === 1) {
        return (
            <div className="mt-4">
                <MediaItem media={media[0]} size="large" />
            </div>
        );
    }

    if (media.length === 2) {
        return (
            <div className="mt-4 grid grid-cols-2 gap-2">
                {media.map((item) => (
                    <MediaItem key={item.id} media={item} size="medium" />
                ))}
            </div>
        );
    }

    if (media.length === 3) {
        return (
            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="row-span-2">
                    <MediaItem media={media[0]} size="large" />
                </div>
                {media.slice(1).map((item) => (
                    <MediaItem key={item.id} media={item} size="small" />
                ))}
            </div>
        );
    }

    // 4 o más items
    return (
        <div className="mt-4 grid grid-cols-2 gap-2">
            {media.slice(0, 4).map((item, index) => (
                <div key={item.id} className="relative">
                    <MediaItem media={item} size="medium" />
                    {index === 3 && media.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                            <span className="text-white text-3xl font-bold">
                                +{media.length - 4}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Componente para cada item de media individual
 */
function MediaItem({ media, size = "medium" }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const sizeClasses = {
        small: "h-48",
        medium: "h-64",
        large: "h-96",
    };

    if (!media || !media.url_publica) {
        console.error("Media sin URL pública:", media);
        return (
            <div className={`${sizeClasses[size]} bg-gray-200 rounded-lg flex items-center justify-center`}>
                <p className="text-gray-500 text-sm">Media no disponible</p>
            </div>
        );
    }

    const handleImageClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (media.tipo === "imagen") {
            setIsFullscreen(true);
        }
    };

    const handleDownload = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(media.url_publica, "_blank");
    };

    return (
        <>
            <div className="relative group rounded-lg overflow-hidden bg-gray-100">
                {/* IMAGEN */}
                {media.tipo === "imagen" && (
                    <img
                        src={media.url_publica}
                        alt="Imagen de publicación"
                        className={`w-full ${sizeClasses[size]} object-cover cursor-pointer hover:opacity-90 transition`}
                        onClick={handleImageClick}
                        loading="lazy"
                        onError={(e) => {
                            console.error("Error cargando imagen:", media.url_publica);
                            e.target.src = "/images/default-avatar.png";
                        }}
                    />
                )}

                {/* VIDEO */}
                {media.tipo === "video" && (
                    <video
                        src={media.url_publica}
                        controls
                        className={`w-full ${sizeClasses[size]} object-cover bg-black`}
                        preload="metadata"
                        onClick={(e) => e.stopPropagation()}
                        onError={(e) => {
                            console.error("Error cargando video:", media.url_publica);
                        }}
                    >
                        Tu navegador no soporta el elemento de video.
                    </video>
                )}

                {/* DOCUMENTO */}
                {media.tipo === "documento" && (
                    <div className={`w-full ${sizeClasses[size]} flex flex-col items-center justify-center p-4`}>
                        <FileText className="w-16 h-16 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 text-center break-words px-2">
                            {media.url?.split("/").pop() || "Documento"}
                        </p>
                        <button
                            onClick={handleDownload}
                            className="mt-3 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Descargar</span>
                        </button>
                    </div>
                )}

                {/* Overlay para hover */}
                {(media.tipo === "imagen" || media.tipo === "video") && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all pointer-events-none" />
                )}
            </div>

            {/* Modal fullscreen para imágenes */}
            {isFullscreen && media.tipo === "imagen" && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsFullscreen(false);
                    }}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsFullscreen(false);
                        }}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={media.url_publica}
                        alt="Vista completa"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}