import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 p-4 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-white text-gray-900 focus:border-yellow-600'
                    : 'border-transparent text-gray-500 hover:border-white hover:text-gray-700 focus:border-gray-300 focus:text-gray-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
