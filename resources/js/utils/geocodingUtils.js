import toast from "react-hot-toast";

/**
 * Convierte una dirección en coordenadas usando Nominatim (OpenStreetMap)
 * Mejorado para soportar todas las ciudades de Neuquén con fallback a ciudad
 */
export const geocodeDireccion = async (direccion, ciudad, provincia) => {
    try {
        // Normalizar nombres de ciudades
        const ciudadNormalizada = ciudad.includes("Capital")
            ? ciudad.replace(" Capital", "")
            : ciudad;

        // Normalizar la dirección para búsquedas
        const direccionSimplificada = direccion
            .replace(/^(av\.|avenida|av|calle|c\.|c)\s*/gi, "")
            .trim();

        // Crear múltiples estrategias de búsqueda progresivamente más amplias
        const estrategiasBusqueda = [
            // Estrategia 1: Búsqueda muy específica con ciudad y provincia
            {
                query: `${direccion}, ${ciudadNormalizada}, Neuquén, Argentina`,
                peso: 10,
            },
            // Estrategia 2: Sin "Argentina" para resultados locales
            {
                query: `${direccion}, ${ciudadNormalizada}, Neuquén`,
                peso: 9,
            },
            // Estrategia 3: Solo dirección y ciudad (para ciudades pequeñas)
            {
                query: `${direccion}, ${ciudadNormalizada}, Argentina`,
                peso: 8,
            },
            // Estrategia 4: Dirección simplificada (sin "Av.", "Calle", etc)
            {
                query: `${direccionSimplificada}, ${ciudadNormalizada}, Neuquén, Argentina`,
                peso: 9,
            },
            // Estrategia 5: Búsqueda invertida (ciudad primero)
            {
                query: `${ciudadNormalizada}, ${direccion}, Neuquén, Argentina`,
                peso: 7,
            },
            // Estrategia 6: Solo ciudad y provincia (como fallback)
            {
                query: `${ciudadNormalizada}, Neuquén, Argentina`,
                peso: 5,
            },
            // Estrategia 7: Dirección con código postal (si es Neuquén Capital)
            ...(ciudadNormalizada.toLowerCase() === "neuquén"
                ? [
                      {
                          query: `${direccion}, 8300, Neuquén, Argentina`,
                          peso: 9,
                      },
                  ]
                : []),
        ];

        let mejorResultado = null;
        let mejorPuntuacion = 0;

        // Probar cada estrategia
        for (const estrategia of estrategiasBusqueda) {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                        `q=${encodeURIComponent(estrategia.query)}` +
                        `&format=json` +
                        `&limit=20` + // Aumentamos aún más para tener más opciones
                        `&countrycodes=ar` +
                        `&addressdetails=1` +
                        `&bounded=0` + // No limitamos a un área específica
                        `&dedupe=0`, // No eliminar duplicados para tener más resultados
                    {
                        headers: {
                            Accept: "application/json",
                            "User-Agent": "EduConnect-App",
                        },
                    }
                );

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    // Evaluar cada resultado
                    for (const result of data) {
                        const puntuacion = evaluarResultado(
                            result,
                            direccion,
                            ciudadNormalizada,
                            estrategia.peso
                        );

                        if (puntuacion > mejorPuntuacion) {
                            mejorPuntuacion = puntuacion;
                            mejorResultado = result;
                        }
                    }
                }

                // Si encontramos un resultado excelente, no seguir buscando
                if (mejorPuntuacion >= 18) {
                    break;
                }

                // Pausa entre requests para respetar límites de la API
                await new Promise((resolve) => setTimeout(resolve, 600));
            } catch (error) {
                console.error(
                    `Error en estrategia "${estrategia.query}":`,
                    error
                );
                continue;
            }
        }

        // FALLBACK: Si no encontramos la dirección exacta o la puntuación es baja,
        // buscar solo la ciudad como ubicación aproximada
        if (!mejorResultado || mejorPuntuacion < 10) {
            console.log("Intentando fallback: buscar solo ciudad");

            try {
                const responseCiudad = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                        `q=${encodeURIComponent(
                            ciudadNormalizada + ", Neuquén, Argentina"
                        )}` +
                        `&format=json` +
                        `&limit=10` +
                        `&countrycodes=ar` +
                        `&addressdetails=1`,
                    {
                        headers: {
                            Accept: "application/json",
                            "User-Agent": "EduConnect-App",
                        },
                    }
                );

                if (responseCiudad.ok) {
                    const dataCiudad = await responseCiudad.json();

                    if (dataCiudad && dataCiudad.length > 0) {
                        // Buscar el mejor resultado de ciudad
                        for (const result of dataCiudad) {
                            const displayName =
                                result.display_name.toLowerCase();
                            const displayNameNormalizado = displayName
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "");
                            const ciudadLowerNormalizado = ciudadNormalizada
                                .toLowerCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "");

                            if (
                                displayNameNormalizado.includes(
                                    ciudadLowerNormalizado
                                ) &&
                                (displayName.includes("neuquén") ||
                                    displayName.includes("neuquen"))
                            ) {
                                const coords = {
                                    lat: parseFloat(result.lat),
                                    lng: parseFloat(result.lon),
                                };

                                if (
                                    validarCoordenadasNeuquen(
                                        coords.lat,
                                        coords.lng,
                                        false
                                    )
                                ) {
                                    // Mostrar advertencia de que es aproximado
                                    toast.warning(
                                        `⚠️ No se encontró la dirección exacta.\n\nSe usará el centro de ${ciudad} como ubicación aproximada.\n\nPuedes ajustar la ubicación más tarde desde tu perfil.`,
                                        {
                                            duration: 7000,
                                            style: {
                                                maxWidth: "400px",
                                                whiteSpace: "pre-line",
                                            },
                                        }
                                    );

                                    return {
                                        success: true,
                                        lat: coords.lat,
                                        lng: coords.lng,
                                        displayName: result.display_name,
                                        boundingBox: result.boundingbox,
                                        ciudad: extraerCiudad(result),
                                        esAproximado: true, // Flag para indicar que es aproximado
                                        direccionOriginal: direccion, // Guardar la dirección original
                                    };
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error en fallback de ciudad:", error);
            }
        }

        if (mejorResultado) {
            // Verificar que esté en Neuquén
            const coords = {
                lat: parseFloat(mejorResultado.lat),
                lng: parseFloat(mejorResultado.lon),
            };

            if (!validarCoordenadasNeuquen(coords.lat, coords.lng, false)) {
                return {
                    success: false,
                    error: `La dirección encontrada no está en Neuquén. Verifica que la ciudad "${ciudad}" y la dirección "${direccion}" sean correctas.`,
                };
            }

            return {
                success: true,
                lat: coords.lat,
                lng: coords.lng,
                displayName: mejorResultado.display_name,
                boundingBox: mejorResultado.boundingbox,
                ciudad: extraerCiudad(mejorResultado),
                esAproximado: false,
            };
        } else {
            return {
                success: false,
                error: `No se pudo encontrar ni la dirección "${direccion}" ni la ciudad "${ciudad}" en Neuquén.
                
Consejos:
• Verifica que la ciudad sea correcta
• Usa el formato: "Nombre de calle + Número" (Ej: "Avenida Argentina 1400")
• Para calles sin número, intenta solo el nombre de la calle
• Prueba abreviaturas: "Av." en vez de "Avenida", "Gral." en vez de "General"
• Si la dirección es muy nueva, el sistema usará una ubicación aproximada`,
            };
        }
    } catch (error) {
        console.error("Error en geocodificación:", error);
        return {
            success: false,
            error: "Error al buscar la dirección. Verifica tu conexión e intenta nuevamente.",
        };
    }
};

/**
 * Evalúa la calidad de un resultado de geocodificación
 */
const evaluarResultado = (
    result,
    direccionBuscada,
    ciudadBuscada,
    pesoEstrategia
) => {
    const displayName = result.display_name.toLowerCase();
    const address = result.address || {};
    let puntuacion = pesoEstrategia;

    // Verificar que contenga "neuquen" (provincia)
    if (displayName.includes("neuquén") || displayName.includes("neuquen")) {
        puntuacion += 10;
    } else {
        // Dar una oportunidad si está en los límites geográficos
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        if (validarCoordenadasNeuquen(lat, lng, false)) {
            puntuacion += 8; // Menos puntos pero no descartamos
        } else {
            return 0; // Si no está en Neuquén, se descarta
        }
    }

    // Verificar que contenga la ciudad buscada (normalizado y sin tildes)
    const ciudadLower = ciudadBuscada
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const displayNameNormalizado = displayName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (displayNameNormalizado.includes(ciudadLower)) {
        puntuacion += 10;
    }

    // Verificar coincidencias en la direccion
    const ciudad = (
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        ""
    )
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (ciudad === ciudadLower || ciudad.includes(ciudadLower)) {
        puntuacion += 8;
    }

    // Bonus por tener número de calle
    if (address.house_number) {
        puntuacion += 4;
    }

    // Verificar que la calle coincida (más flexible)
    const calleBuscada = direccionBuscada
        .toLowerCase()
        .replace(/^(av\.|avenida|av|calle|c\.|c)\s*/gi, "")
        .split(/\d/)[0]
        .trim();
    const calleResultado = (address.road || "").toLowerCase();

    if (calleResultado && calleBuscada) {
        // Coincidencia exacta
        if (calleResultado.includes(calleBuscada)) {
            puntuacion += 8;
        }
        // Coincidencia parcial (primeras palabras)
        else if (calleBuscada.length > 5) {
            const palabrasCalle = calleBuscada.split(" ");
            const primerasPalabras = palabrasCalle.slice(0, 2).join(" ");
            if (calleResultado.includes(primerasPalabras)) {
                puntuacion += 5;
            }
        }
    }

    // Preferir tipos específicos de lugares
    const tiposPreferidos = [
        "building",
        "house",
        "residential",
        "university",
        "school",
        "college",
        "amenity",
        "highway",
    ];
    if (tiposPreferidos.includes(result.type)) {
        puntuacion += 3;
    }

    // Bonus si el resultado está dentro de Neuquén geográficamente
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (validarCoordenadasNeuquen(lat, lng, false)) {
        puntuacion += 5;
    }

    return puntuacion;
};

/**
 * Extrae el nombre de la ciudad del resultado de geocodificación
 */
const extraerCiudad = (result) => {
    const address = result.address || {};
    return (
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "Neuquén"
    );
};

/**
 * Valida que las coordenadas estén dentro de Neuquén
 */
export const validarCoordenadasNeuquen = (lat, lng, mostrarToast = true) => {
    // Límites más precisos de la provincia de Neuquén
    const limites = {
        latMin: -41.0, // Sur
        latMax: -36.0, // Norte
        lngMin: -71.5, // Oeste
        lngMax: -68.0, // Este
    };

    const dentroLimites =
        lat >= limites.latMin &&
        lat <= limites.latMax &&
        lng >= limites.lngMin &&
        lng <= limites.lngMax;

    if (!dentroLimites && mostrarToast) {
        toast.error(
            "La dirección debe estar dentro de la provincia de Neuquén"
        );
    }

    return dentroLimites;
};

/**
 * Lista completa de ciudades de Neuquén (ordenadas alfabéticamente)
 */
export const ciudadesNeuquen = [
    "Añelo",
    "Aluminé",
    "Andacollo",
    "Bajada del Agrio",
    "Buta Ranquil",
    "Caviahue",
    "Centenario",
    "Chos Malal",
    "Copahue",
    "Cutral Có",
    "El Cholar",
    "El Huecú",
    "Junín de los Andes",
    "Las Lajas",
    "Las Ovejas",
    "Loncopué",
    "Los Catutos",
    "Los Chihuidos",
    "Manzano Amargo",
    "Mariano Moreno",
    "Neuquén Capital",
    "Picún Leufú",
    "Piedra del Águila",
    "Plaza Huincul",
    "Plottier",
    "Rincón de los Sauces",
    "San Martín de los Andes",
    "San Patricio del Chañar",
    "Santo Tomás",
    "Senillosa",
    "Tricao Malal",
    "Villa El Chocón",
    "Villa La Angostura",
    "Villa Pehuenia",
    "Villa Traful",
    "Vista Alegre",
    "Zapala",
];

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
