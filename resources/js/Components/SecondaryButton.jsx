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
                `bg-blue-600 hover:bg-blue-700 font-medium rounded-lg ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
