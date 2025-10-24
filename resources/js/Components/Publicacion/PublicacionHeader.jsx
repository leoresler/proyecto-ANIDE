import { MoreVertical } from "lucide-react";
import { Link } from "@inertiajs/react";

/**
 * Componente para mostrar info de la institucion en una publicación
 */
export default function PublicacionHeader({
    institucion,
    createdAt,
    showMenu = false,
    onMenuClick,
    size = "default", // 'small' | 'default' | 'large'
}) {
    const sizeConfig = {
        small: {
            avatar: "w-10 h-10",
            title: "text-sm",
            date: "text-xs",
        },
        default: {
            avatar: "w-12 h-12",
            title: "text-base",
            date: "text-sm",
        },
        large: {
            avatar: "w-16 h-16",
            title: "text-lg",
            date: "text-sm",
        },
    };

    const config = sizeConfig[size];

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            ...(size === "large" && { hour: "2-digit", minute: "2-digit" }),
        });
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <img
                    src={
                        institucion?.user?.profile_photo_url ||
                        "/images/default-avatar.png"
                    }
                    alt={institucion?.user?.nombre || "Institución"}
                    className={`${config.avatar} rounded-full object-cover`}
                />
                <div>
                    <h3
                        className={`font-semibold text-gray-900 ${config.title}`}
                    >
                        {institucion?.user?.nombre || "Institución"}
                    </h3>
                    <p className={`text-gray-500 ${config.date}`}>
                        {formatDate(createdAt)}
                    </p>
                </div>
            </div>

            {showMenu && (
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Más opciones"
                >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
            )}
        </div>
    );
}
