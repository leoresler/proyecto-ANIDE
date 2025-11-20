import toast from 'react-hot-toast';

/**
 * Convierte una dirección en coordenadas usando Nominatim (OpenStreetMap)
 */
export const geocodeDireccion = async (direccion, ciudad, provincia) => {
    try {
        // Normalizar nombres de ciudades comunes
        const ciudadNormalizada = ciudad.includes('Capital') 
            ? ciudad.replace(' Capital', '') 
            : ciudad;

        // Intentar múltiples formatos de búsqueda para mayor precisión
        const formatos = [
            // Formato 1: Dirección completa estructurada
            `${direccion}, ${ciudadNormalizada}, Neuquén, Argentina`,
            // Formato 2: Con código postal aproximado (Neuquén Capital: 8300)
            ciudadNormalizada === 'Neuquén' 
                ? `${direccion}, 8300, Neuquén, Argentina` 
                : `${direccion}, ${ciudadNormalizada}, Neuquén, Argentina`,
            // Formato 3: Solo calle y ciudad
            `${direccion}, ${ciudadNormalizada}, Argentina`,
        ];

        let mejorResultado = null;
        let mejorPuntuacion = 0;

        // Intentar con cada formato
        for (const formato of formatos) {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(formato)}` +
                `&format=json` +
                `&limit=5` + // Aumentamos el límite para tener más opciones
                `&countrycodes=ar` +
                `&addressdetails=1`, // Agregar detalles de dirección
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'EduConnect-App'
                    }
                }
            );

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            if (data && data.length > 0) {
                // Buscar el mejor resultado que contenga Neuquén
                for (const result of data) {
                    const displayName = result.display_name.toLowerCase();
                    const address = result.address || {};
                    
                    // Calcular puntuación de relevancia
                    let puntuacion = 0;
                    
                    // Verificar que contenga Neuquén
                    if (displayName.includes('neuquén') || displayName.includes('neuquen')) {
                        puntuacion += 10;
                    }
                    
                    // Verificar que contenga la ciudad
                    if (displayName.includes(ciudadNormalizada.toLowerCase())) {
                        puntuacion += 5;
                    }
                    
                    // Preferir resultados con número de calle
                    if (address.house_number) {
                        puntuacion += 3;
                    }
                    
                    // Preferir resultados de tipo calle/edificio
                    if (['building', 'house', 'residential', 'university', 'school'].includes(result.type)) {
                        puntuacion += 2;
                    }

                    if (puntuacion > mejorPuntuacion) {
                        mejorPuntuacion = puntuacion;
                        mejorResultado = result;
                    }
                }
            }

            // Si encontramos un buen resultado, no seguir buscando
            if (mejorPuntuacion >= 10) {
                break;
            }

            // Pequeña pausa entre requests para respetar límites de la API
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (mejorResultado) {
            return {
                success: true,
                lat: parseFloat(mejorResultado.lat),
                lng: parseFloat(mejorResultado.lon),
                displayName: mejorResultado.display_name,
                boundingBox: mejorResultado.boundingbox
            };
        } else {
            return {
                success: false,
                error: 'No se encontró la dirección. Intenta con: "Nombre de la calle + Número" (Ej: Avenida Argentina 1400)'
            };
        }
    } catch (error) {
        console.error('Error en geocodificación:', error);
        return {
            success: false,
            error: 'Error al buscar la dirección. Verifica tu conexión e intenta nuevamente.'
        };
    }
};

/**
 * Valida que las coordenadas estén dentro de Neuquén (aproximado)
 */
export const validarCoordenadasNeuquen = (lat, lng) => {
    // Límites aproximados de la provincia de Neuquén
    const limites = {
        latMin: -41.0,
        latMax: -36.0,
        lngMin: -71.5,
        lngMax: -68.0
    };

    const dentroLimites = 
        lat >= limites.latMin && 
        lat <= limites.latMax && 
        lng >= limites.lngMin && 
        lng <= limites.lngMax;

    if (!dentroLimites) {
        toast.error('La dirección debe estar dentro de la provincia de Neuquén');
    }

    return dentroLimites;
};

/**
 * Lista de ciudades de Neuquén
 */
export const ciudadesNeuquen = [
    'Neuquén Capital',
    'Plottier',
    'Centenario',
    'Cutral Có',
    'Plaza Huincul',
    'Zapala',
    'San Martín de los Andes',
    'Junín de los Andes',
    'Chos Malal',
    'Añelo',
    'Aluminé',
    'Andacollo',
    'Bajada del Agrio',
    'Buta Ranquil',
    'Caviahue',
    'Copahue',
    'El Cholar',
    'El Huecú',
    'Las Lajas',
    'Las Ovejas',
    'Loncopué',
    'Los Catutos',
    'Los Chihuidos',
    'Manzano Amargo',
    'Mariano Moreno',
    'Picún Leufú',
    'Piedra del Águila',
    'Rincón de los Sauces',
    'San Patricio del Chañar',
    'Santo Tomás',
    'Senillosa',
    'Tricao Malal',
    'Villa El Chocón',
    'Villa La Angostura',
    'Villa Pehuenia',
    'Villa Traful',
    'Vista Alegre'
].sort();

/**
 * Debounce para búsquedas
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};