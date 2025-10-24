import toast from 'react-hot-toast';

/**
 * Utilidades centralizadas para mostrar notificaciones toast
 */
export const showToast = {
    /**
     * Toast de éxito
     */
    success: (message, options = {}) => {
        return toast.success(message, {
            duration: 3000,
            ...options,
        });
    },

    /**
     * Toast de error
     */
    error: (message, options = {}) => {
        return toast.error(message, {
            duration: 4000,
            ...options,
        });
    },

    /**
     * Toast informativo
     */
    info: (message, options = {}) => {
        return toast(message, {
            icon: 'ℹ️',
            duration: 3000,
            ...options,
        });
    },

    /**
     * Toast de advertencia
     */
    warning: (message, options = {}) => {
        return toast(message, {
            icon: '⚠️',
            duration: 4000,
            style: {
                background: '#f59e0b',
                color: '#fff',
            },
            ...options,
        });
    },

    /**
     * Toast de carga
     */
    loading: (message = 'Cargando...', options = {}) => {
        return toast.loading(message, options);
    },

    /**
     * Cerrar un toast específico
     */
    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },

    /**
     * Cerrar todos los toasts
     */
    dismissAll: () => {
        toast.dismiss();
    },

    /**
     * Toast con Promise automático
     */
    promise: (promise, messages) => {
        return toast.promise(promise, {
            loading: messages.loading || 'Cargando...',
            success: messages.success || '¡Completado!',
            error: messages.error || 'Error',
        });
    },

    /**
     * Toast de confirmación con acciones
     */
    confirm: (message, onConfirm, options = {}) => {
        const { 
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            description = null,
            confirmClassName = 'px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium',
            cancelClassName = 'px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium'
        } = options;

        toast((t) => (
            <div className="flex flex-col space-y-3">
                <div>
                    <p className="font-medium text-gray-900">{message}</p>
                    {description && (
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    )}
                </div>
                <div className="flex space-x-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className={cancelClassName}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            onConfirm();
                        }}
                        className={confirmClassName}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: { 
                background: '#fff', 
                color: '#000',
                maxWidth: '400px',
            },
        });
    },

    /**
     * Toast de confirmación de eliminación
     */
    confirmDelete: (message, onConfirm) => {
        showToast.confirm(message, onConfirm, {
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            description: 'Esta acción no se puede deshacer',
            confirmClassName: 'px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium',
        });
    },

    /**
     * Toast personalizado para validaciones
     */
    validation: (errors) => {
        if (Array.isArray(errors)) {
            errors.forEach(error => toast.error(error, { duration: 3000 }));
        } else if (typeof errors === 'object') {
            Object.values(errors).flat().forEach(error => {
                toast.error(error, { duration: 3000 });
            });
        } else {
            toast.error(errors, { duration: 3000 });
        }
    },

    /**
     * Toast para palabras prohibidas/moderación
     */
    moderation: (count, message = null) => {
        const defaultMessage = count === 1
            ? 'Tu mensaje contiene una palabra prohibida. Por favor, usa un lenguaje apropiado.'
            : `Tu mensaje contiene ${count} palabras prohibidas. Por favor, usa un lenguaje apropiado.`;
        
        return toast.error(message || defaultMessage, {
            duration: 5000,
            icon: '⚠️',
            style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
            },
        });
    },

    /**
     * Toast de progreso (manual)
     */
    progress: (initialMessage = 'Procesando... 0%') => {
        const toastId = toast.loading(initialMessage);
        
        return {
            update: (progress, message = null) => {
                const msg = message || `Procesando... ${progress}%`;
                if (progress < 100) {
                    toast.loading(msg, { id: toastId });
                } else {
                    toast.success('¡Completado!', { id: toastId });
                }
            },
            success: (message = '¡Completado!') => {
                toast.success(message, { id: toastId });
            },
            error: (message = 'Error') => {
                toast.error(message, { id: toastId });
            },
            dismiss: () => {
                toast.dismiss(toastId);
            }
        };
    },
};

/**
 * Configuración por defecto para toda la aplicación
 */
export const toastConfig = {
    position: 'top-right',
    duration: 4000,
    style: {
        background: '#363636',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
    },
    success: {
        duration: 3000,
        iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
        },
    },
    error: {
        duration: 4000,
        iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
        },
    },
    loading: {
        iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
        },
    },
};

export default showToast;