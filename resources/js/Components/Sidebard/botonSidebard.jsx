import { Link } from "@inertiajs/react";

export default function BotonSidebar({ href, icon, label, onClick }) {
    const Content = (
        <div className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded">
            {icon && <img src={icon} alt={label} className="h-5 w-5" />}
            <span>{label}</span>
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
