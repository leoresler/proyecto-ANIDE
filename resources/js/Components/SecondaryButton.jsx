export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `font-medium rounded-lg bg-white border border-gray-400 px-6 py-3 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-50 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}