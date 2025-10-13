import React, { useState } from "react";
import { FileText, Download } from "lucide-react";

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
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    {isExpanded ? "Ver menos" : "Ver más"}
                </button>
            )}

            {/* Media */}
            {media && media.length > 0 && <PublicacionMedia media={media} />}
        </div>
    );
}

/**
 * Componente para mostrar los archivos multimedia
 */
function PublicacionMedia({ media }) {
    if (media.length === 0) return null;

    const getGridClasses = () => {
        if (media.length === 1) return "grid-cols-1";
        if (media.length === 2) return "grid-cols-2";
        return "grid-cols-2 md:grid-cols-3";
    };

    return (
        <div className={`grid ${getGridClasses()} gap-2`}>
            {media.map((item, index) => (
                <MediaItem key={item.id || index} media={item} />
            ))}
        </div>
    );
}

/**
 * Componente para cada item de media individual
 */
function MediaItem({ media }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleImageClick = () => {
        if (media.tipo === "imagen") {
            setIsFullscreen(true);
        }
    };

    const handleDownload = () => {
        window.open(media.url_publica, "_blank");
    };

    return (
        <>
            <div className="relative group rounded-lg overflow-hidden bg-gray-100">
                {media.tipo === "imagen" && (
                    <img
                        src={media.url_publica}
                        alt="Media de publicación"
                        className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={handleImageClick}
                        loading="lazy"
                    />
                )}

                {media.tipo === "video" && (
                    <video
                        src={media.url_publica}
                        controls
                        className="w-full h-64 object-cover"
                        preload="metadata"
                    >
                        Tu navegador no soporta el elemento de video.
                    </video>
                )}

                {media.tipo === "documento" && (
                    <div className="w-full h-64 flex flex-col items-center justify-center p-4">
                        <FileText className="w-16 h-16 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 text-center break-words">
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

                {/* Overlay para hover en imágenes/videos */}
                {(media.tipo === "imagen" || media.tipo === "video") && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                )}
            </div>

            {/* Modal fullscreen para imágenes */}
            {isFullscreen && media.tipo === "imagen" && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
                    onClick={() => setIsFullscreen(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
                        onClick={() => setIsFullscreen(false)}
                    >
                        ×
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
