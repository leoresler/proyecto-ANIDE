import { Link } from "@inertiajs/react";

export default function BotonSidebar({ href, icon, label, onClick, unreadCount = 0 }) {
    const Content = (
        <div className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded mt-2">
            {icon && <img src={icon} alt={label} className="h-5 w-5" />}
            <span className="relative inline-flex items-center">
            {label}
            {unreadCount > 0 && (
                <span className="ml-2 w-2.5 h-2.5 rounded-full bg-red-600" />
            )}
            </span>

        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="w-full text-left">
                {Content}
            </button>
        );
    }

    return <Link href={href || "#"}>{Content}</Link>;
}
