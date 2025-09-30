/* script para validaciones en la vista, como un extra para guiar al usuario. Validaciones importantes las hacemos en el backend */
export const validationRules = {
    email: (value) => {
        if (!value?.trim()) return "El correo electrónico es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingresa un correo electrónico válido";
        return null;
    },
    
    password: (value) => {
        if (!value?.trim()) return "La contraseña es obligatoria";
        if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
        return null;
    },
    
    confirmPassword: (value, originalPassword) => {
        if (!value?.trim()) return "Confirma tu contraseña";
        if (value !== originalPassword) return "Las contraseñas no coinciden";
        return null;
    },
};

export const useValidation = () => {
    const validateField = (fieldName, value, extraParams = {}) => {
        const validator = validationRules[fieldName];
        if (!validator) return null;
        
        return validator(value, extraParams);
    };
    
    const validateForm = (data, fields) => {
        const errors = {};
        
        fields.forEach(fieldName => {
            const error = validateField(fieldName, data[fieldName], data);
            if (error) errors[fieldName] = error;
        });
        
        return {
            errors,
            isValid: Object.keys(errors).length === 0
        };
    };
    
    return { validateField, validateForm };
};