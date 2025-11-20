import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function RoundedInputText(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 ' +
                className
            }
            ref={localRef}
        />
    );
});