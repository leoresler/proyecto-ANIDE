export default function PrimaryButton({
    type = "submit",
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-lg border border-transparent dark:text-gray-300 dark:border-gray-600 bg-edu-dark dark:bg-gray-700 px-6 py-3 text-md text-white transition duration-150 ease-in-out hover:bg-gray-800 dark:hover:bg-gray-600 focus:bg-gray-800 dark:focus:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 active:bg-gray-950 dark:active:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disabled && "opacity-25"
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}