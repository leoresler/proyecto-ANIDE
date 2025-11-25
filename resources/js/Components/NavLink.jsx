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
                    ? 'border-white dark:border-gray-400 text-gray-900 dark:text-white focus:border-yellow-600 dark:focus:border-yellow-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-white dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:border-gray-300 dark:focus:border-gray-600 focus:text-gray-700 dark:focus:text-gray-300') +
                className
            }
        >
            {children}
        </Link>
    );
}