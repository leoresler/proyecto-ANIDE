/* Validaciones completas para frontend */

export const validationRules = {
    email: (value) => {
        if (!value?.trim()) return "El correo electrónico es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) 
            return "Ingresa un correo electrónico válido";
        return null;
    },
    
    password: (value) => {
        if (!value?.trim()) return "La contraseña es obligatoria";
        if (value.length < 8) 
            return "La contraseña debe tener al menos 8 caracteres";
        return null;
    },
    
    confirmPassword: (value, originalPassword) => {
        if (!value?.trim()) return "Confirma tu contraseña";
        if (value !== originalPassword) return "Las contraseñas no coinciden";
        return null;
    },

    nombre: (value) => {
        if (!value?.trim()) return "El nombre es obligatorio";
        if (value.trim().length < 2) 
            return "El nombre debe tener al menos 2 caracteres";
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) 
            return "El nombre solo puede contener letras";
        return null;
    },

    apellido: (value) => {
        if (!value?.trim()) return "El apellido es obligatorio";
        if (value.trim().length < 2) 
            return "El apellido debe tener al menos 2 caracteres";
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) 
            return "El apellido solo puede contener letras";
        return null;
    },

    telefono: (value) => {
        if (!value?.trim()) return "El teléfono es obligatorio";
        // Acepta formatos: +54, 0, números con espacios, guiones o paréntesis
        const cleanedValue = value.replace(/[\s\-()]/g, '');
        if (!/^(\+?54)?[0-9]{8,13}$/.test(cleanedValue)) 
            return "Ingresa un teléfono válido (mínimo 8 dígitos)";
        return null;
    },

    ciudad: (value) => {
        if (!value?.trim()) return "La ciudad es obligatoria";
        if (value.trim().length < 2) 
            return "La ciudad debe tener al menos 2 caracteres";
        return null;
    },

    provincia: (value) => {
        if (!value?.trim()) return "La provincia es obligatoria";
        if (value.trim().length < 2) 
            return "La provincia debe tener al menos 2 caracteres";
        return null;
    },

    fecha_nac: (value) => {
        if (!value?.trim()) return "La fecha de nacimiento es obligatoria";
        const date = new Date(value);
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
        
        if (date > today) return "La fecha no puede ser futura";
        if (date < minDate) return "La fecha no es válida";
        if (date > maxDate) return "Debes tener al menos 13 años";
        return null;
    },

    interests: (value) => {
        if (!value || value.length === 0) return "Debes seleccionar al menos un interés";
        return null;
    },

    biografia: (value) => {
        if (!value) return null; // Es opcional
        if (value.length > 500) 
            return "La biografía no puede exceder 500 caracteres";
        return null;
    },

    tipo_institucion: (value) => {
        if (!value?.trim()) return "El tipo de institución es obligatorio";
        if (value.trim().length < 3) 
            return "El tipo de institución debe tener al menos 3 caracteres";
        return null;
    },

    tipo_institucion_otro: (value) => {
        if (!value?.trim()) return "El tipo de institución es obligatorio";
        if (value.trim().length < 3) 
            return "El tipo de institución debe tener al menos 3 caracteres";
        return null;
    },

    direccion: (value) => {
        if (!value?.trim()) return "La dirección es obligatoria";
        if (value.trim().length < 5) 
            return "La dirección debe tener al menos 5 caracteres";
        return null;
    },

    url_sitio_web: (value) => {
        if (!value) return null; // Es opcional
        if (!/^https?:\/\/.+\..+/.test(value)) 
            return "Ingresa una URL válida (ej: https://ejemplo.com)";
        return null;
    },

    descripcion: (value) => {
        if (!value) return null; // Es opcional
        if (value.length > 1000) 
            return "La descripción no puede exceder 1000 caracteres";
        return null;
    },

    dni: (value) => {
        if (!value?.trim()) return "El DNI es obligatorio";
        const cleanedValue = value.replace(/[.\s]/g, '');
        if (!/^[0-9]{7,8}$/.test(cleanedValue)) 
            return "El DNI debe tener 7 u 8 dígitos";
        return null;
    },

    cuit: (value) => {
        if (!value?.trim()) return "El CUIT es obligatorio";
        const cleanedValue = value.replace(/[-\s]/g, '');
        if (!/^[0-9]{11}$/.test(cleanedValue)) 
            return "El CUIT debe tener 11 dígitos (formato: 20-12345678-9)";
        return null;
    },

    cuil: (value) => {
        if (!value?.trim()) return "El CUIL es obligatorio";
        const cleanedValue = value.replace(/[-\s]/g, '');
        if (!/^[0-9]{11}$/.test(cleanedValue)) 
            return "El CUIL debe tener 11 dígitos (formato: 20-12345678-9)";
        return null;
    },

    documento_identificador: (value, tipoDocumento) => {
        if (!value?.trim()) return "El documento identificador es obligatorio";
        
        const cleanedValue = value.replace(/[.\-\s]/g, '');
        
        switch(tipoDocumento) {
            case 'DNI':
                if (!/^[0-9]{7,8}$/.test(cleanedValue)) 
                    return "El DNI debe tener 7 u 8 dígitos";
                break;
            case 'CUIT':
            case 'CUIL':
                if (!/^[0-9]{11}$/.test(cleanedValue)) 
                    return `El ${tipoDocumento} debe tener 11 dígitos`;
                break;
            default:
                return "Tipo de documento no válido";
        }
        return null;
    },

    profile_photo: (file) => {
        if (!file) return null; // Es opcional
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        if (!allowedTypes.includes(file.type)) 
            return "Solo se permiten imágenes (JPG, PNG, WEBP)";
        if (file.size > maxSize) 
            return "La imagen no puede superar los 2MB";
        return null;
    }
};

export const useValidation = () => {
    const validateField = (fieldName, value, extraParams = {}) => {
        const validator = validationRules[fieldName];
        if (!validator) return null;
        
        return validator(value, extraParams);
    };
    
    const validateForm = (data, fields) => {
        const errors = {};
        
        fields.forEach(fieldConfig => {
            let fieldName, extraParams;
            
            if (typeof fieldConfig === 'string') {
                fieldName = fieldConfig;
                extraParams = {};
            } else {
                fieldName = fieldConfig.name;
                extraParams = fieldConfig.params || {};
            }
            
            const error = validateField(fieldName, data[fieldName], extraParams);
            if (error) errors[fieldName] = error;
        });
        
        return {
            errors,
            isValid: Object.keys(errors).length === 0
        };
    };
    
    return { validateField, validateForm };
};