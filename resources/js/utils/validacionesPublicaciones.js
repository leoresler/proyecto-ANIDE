/**
 * Validaciones para Publicaciones
 * Archivo: resources/js/Utils/validacionesPublicaciones.js
 */

// Configuración de límites - EXPORTADA
export const CONFIG = {
    titulo: {
        minLength: 5,
        maxLength: 100,
    },
    contenido: {
        minLength: 10,
        maxLength: 2000,
    },
    media: {
        maxFiles: 6,
        maxSizeMB: 20,
        allowedImageTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ],
        allowedVideoTypes: [
            "video/mp4",
            "video/mov",
            "video/avi",
            "video/quicktime",
        ],
        allowedDocTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
    },
};

/**
 * Valida el título de la publicación
 */
export const validarTitulo = (titulo) => {
    const errors = [];

    if (!titulo || titulo.trim() === "") {
        errors.push("El título es obligatorio");
        return errors;
    }

    const tituloTrimmed = titulo.trim();

    if (tituloTrimmed.length < CONFIG.titulo.minLength) {
        errors.push(
            `El título debe tener al menos ${CONFIG.titulo.minLength} caracteres`
        );
    }

    if (tituloTrimmed.length > CONFIG.titulo.maxLength) {
        errors.push(
            `El título no puede exceder ${CONFIG.titulo.maxLength} caracteres`
        );
    }

    // Validar que no sea solo espacios o caracteres especiales
    if (!/[a-zA-Z0-9]/.test(tituloTrimmed)) {
        errors.push("El título debe contener al menos letras o números");
    }

    return errors;
};

/**
 * Valida el contenido de la publicación
 */
export const validarContenido = (contenido) => {
    const errors = [];

    if (!contenido || contenido.trim() === "") {
        errors.push("El contenido es obligatorio");
        return errors;
    }

    const contenidoTrimmed = contenido.trim();

    if (contenidoTrimmed.length < CONFIG.contenido.minLength) {
        errors.push(
            `El contenido debe tener al menos ${CONFIG.contenido.minLength} caracteres`
        );
    }

    if (contenidoTrimmed.length > CONFIG.contenido.maxLength) {
        errors.push(
            `El contenido no puede exceder ${CONFIG.contenido.maxLength} caracteres`
        );
    }

    return errors;
};

/**
 * Valida un archivo individual
 */
export const validarArchivo = (file) => {
    const errors = [];

    // Manejar archivos inexistentes o medias sin archivo
    if (!file || !file.size) {
        return errors; // ignoramos medias existentes
    }

    const maxSizeBytes = CONFIG.media.maxSizeMB * 1024 * 1024;

    // Validar tamaño
    if (file.size > maxSizeBytes) {
        errors.push(
            `${file.name}: El archivo excede el tamaño máximo de ${CONFIG.media.maxSizeMB}MB`
        );
    }

    // Validar tipo de archivo
    const allAllowedTypes = [
        ...CONFIG.media.allowedImageTypes,
        ...CONFIG.media.allowedVideoTypes,
        ...CONFIG.media.allowedDocTypes,
    ];

    if (!allAllowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Tipo de archivo no permitido`);
    }

    // Validaciones específicas por tipo
    if (CONFIG.media.allowedImageTypes.includes(file.type)) {
        // Validaciones adicionales para imágenes si es necesario
    } else if (CONFIG.media.allowedVideoTypes.includes(file.type)) {
        const maxVideoSizeMB = 50;
        if (file.size > maxVideoSizeMB * 1024 * 1024) {
            errors.push(
                `${file.name}: Los videos no pueden exceder ${maxVideoSizeMB}MB`
            );
        }
    }

    return errors;
};

/**
 * Valida todos los archivos multimedia
 */
export const validarMedia = (mediaFiles) => {
    const errors = [];

    if (!Array.isArray(mediaFiles)) return errors;

    // Validar cantidad de archivos
    if (mediaFiles.length > CONFIG.media.maxFiles) {
        errors.push(
            `Solo puedes subir hasta ${CONFIG.media.maxFiles} archivos`
        );
    }

    // Validar cada archivo (solo los que tengan file)
    mediaFiles.forEach((media) => {
        const fileToValidate = media.file || media; // por compatibilidad
        if (fileToValidate && fileToValidate.size) {
            const fileErrors = validarArchivo(fileToValidate);
            errors.push(...fileErrors);
        }
    });

    return errors;
};

/**
 * Valida el formulario completo antes de enviar
 */
export const validarFormulario = (data, mediaFiles) => {
    const errors = {
        titulo: [],
        contenido: [],
        media: [],
    };

    // Validar título
    errors.titulo = validarTitulo(data.titulo);

    // Validar contenido
    errors.contenido = validarContenido(data.contenido);

    // Validar media (opcional)
    if (mediaFiles.length > 0) {
        errors.media = validarMedia(mediaFiles);
    }

    // Retornar solo los errores que existen
    const hasErrors = Object.values(errors).some(
        (errorArray) => errorArray.length > 0
    );

    return {
        isValid: !hasErrors,
        errors: hasErrors ? errors : null,
    };
};

/**
 * Formatea los errores para mostrar en el frontend
 */
export const formatearErrores = (errors) => {
    const formattedErrors = {};

    Object.keys(errors).forEach((key) => {
        if (errors[key].length > 0) {
            formattedErrors[key] = errors[key].join(". ");
        }
    });

    return formattedErrors;
};

/**
 * Valida en tiempo real mientras el usuario escribe
 */
export const validarEnTiempoReal = (campo, valor, mediaFiles = []) => {
    switch (campo) {
        case "titulo":
            return validarTitulo(valor);
        case "contenido":
            return validarContenido(valor);
        case "media":
            return validarMedia(mediaFiles);
        default:
            return [];
    }
};

/**
 * Obtiene el tipo MIME correcto según la extensión
 */
export const obtenerTipoArchivo = (file) => {
    if (CONFIG.media.allowedImageTypes.includes(file.type)) {
        return "imagen";
    } else if (CONFIG.media.allowedVideoTypes.includes(file.type)) {
        return "video";
    } else if (CONFIG.media.allowedDocTypes.includes(file.type)) {
        return "documento";
    }
    return "desconocido";
};

/**
 * Verifica si un archivo es válido para previsualización
 */
export const puedePrevisualizar = (file) => {
    return (
        CONFIG.media.allowedImageTypes.includes(file.type) ||
        CONFIG.media.allowedVideoTypes.includes(file.type)
    );
};

// Exportar todo como default también
export default {
    validarTitulo,
    validarContenido,
    validarArchivo,
    validarMedia,
    validarFormulario,
    formatearErrores,
    validarEnTiempoReal,
    obtenerTipoArchivo,
    puedePrevisualizar,
    CONFIG,
};
