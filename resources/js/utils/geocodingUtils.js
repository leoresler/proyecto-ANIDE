import toast from "react-hot-toast";

/**
 * Convierte una dirección en coordenadas usando Nominatim (OpenStreetMap)
 * Mejorado para obtener coordenadas más precisas en Neuquén
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

        // Crear estrategias de búsqueda ordenadas por precisión
        const estrategiasBusqueda = [
            // Estrategia 1: Más específica - dirección completa con todos los datos
            {
                query: `${direccion}, ${ciudadNormalizada}, Neuquén, Argentina`,
                peso: 10,
                esEspecifica: true,
            },
            // Estrategia 2: Dirección simplificada (sin prefijos como "Av.", "Calle")
            {
                query: `${direccionSimplificada}, ${ciudadNormalizada}, Neuquén, Argentina`,
                peso: 10,
                esEspecifica: true,
            },
            // Estrategia 3: Con código postal (solo para Neuquén Capital)
            ...(ciudadNormalizada.toLowerCase() === "neuquén" ||
            ciudadNormalizada.toLowerCase() === "neuquen"
                ? [
                      {
                          query: `${direccion}, ${ciudadNormalizada}, 8300, Argentina`,
                          peso: 10,
                          esEspecifica: true,
                      },
                  ]
                : []),
            // Estrategia 4: Solo ciudad y provincia (sin Argentina)
            {
                query: `${direccion}, ${ciudadNormalizada}, Neuquén`,
                peso: 9,
                esEspecifica: true,
            },
            // Estrategia 5: Solo dirección y ciudad
            {
                query: `${direccion}, ${ciudadNormalizada}`,
                peso: 8,
                esEspecifica: true,
            },
        ];

        let mejorResultado = null;
        let mejorPuntuacion = 0;
        let resultadosEvaluados = [];

        // Probar cada estrategia
        for (const estrategia of estrategiasBusqueda) {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                        `q=${encodeURIComponent(estrategia.query)}` +
                        `&format=json` +
                        `&limit=10` +
                        `&countrycodes=ar` +
                        `&addressdetails=1` +
                        `&bounded=0` +
                        `&dedupe=1`, // Activar deduplicación para evitar resultados repetidos
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
                            direccionSimplificada,
                            ciudadNormalizada,
                            estrategia.peso
                        );

                        resultadosEvaluados.push({
                            result,
                            puntuacion,
                            estrategia: estrategia.query,
                        });

                        if (puntuacion > mejorPuntuacion) {
                            mejorPuntuacion = puntuacion;
                            mejorResultado = result;
                        }
                    }
                }

                // Si encontramos un resultado excelente (con número de calle exacto), no seguir buscando
                if (mejorPuntuacion >= 50) {
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

        // Log para debugging (puedes comentar en producción)
        console.log("=== RESULTADOS DE GEOCODIFICACIÓN ===");
        console.log("Dirección buscada:", direccion);
        console.log("Ciudad:", ciudad);
        console.log("\nTop 5 resultados evaluados:");
        resultadosEvaluados
            .sort((a, b) => b.puntuacion - a.puntuacion)
            .slice(0, 5)
            .forEach((r, i) => {
                console.log(`\n${i + 1}. Puntuación: ${r.puntuacion.toFixed(2)}`);
                console.log(`   Dirección: ${r.result.display_name}`);
                console.log(`   Número: ${r.result.address?.house_number || "Sin número"}`);
                console.log(`   Calle: ${r.result.address?.road || "Sin calle"}`);
                console.log(`   Coordenadas: ${r.result.lat}, ${r.result.lon}`);
                console.log(`   Estrategia: ${r.estrategia}`);
            });
        console.log("\n=== MEJOR RESULTADO SELECCIONADO ===");
        console.log("Mejor resultado:", mejorResultado);
        console.log("Mejor puntuación:", mejorPuntuacion);
        
        // DEBUG: Verificar si se debe activar interpolación
        const numeroEnDireccion = direccion.match(/\d+/);
        console.log(`\n🔍 DEBUG Interpolación:`);
        console.log(`   - Hay número en dirección? ${numeroEnDireccion ? 'SÍ (' + numeroEnDireccion[0] + ')' : 'NO'}`);
        console.log(`   - Puntuación < 50? ${mejorPuntuacion < 50 ? 'SÍ (' + mejorPuntuacion + ')' : 'NO (' + mejorPuntuacion + ')'}`);
        console.log(`   - ¿Número exacto encontrado? ${mejorResultado?.address?.house_number === numeroEnDireccion?.[0] ? 'SÍ ✅' : 'NO ❌'}`);
        console.log(`   - ¿Debe interpolar? ${numeroEnDireccion && mejorPuntuacion < 50 && mejorResultado?.address?.house_number !== numeroEnDireccion?.[0] ? 'SÍ ✅' : 'NO ❌'}`);

        // NUEVO: Si no encontramos el número exacto, intentar interpolar
        if (numeroEnDireccion && mejorPuntuacion < 50 && mejorResultado?.address?.house_number !== numeroEnDireccion[0]) {
            console.log("\n🔍 Activando sistema de interpolación...");
            
            const numeroBuscado = parseInt(numeroEnDireccion[0]);
            console.log(`   Número buscado: ${numeroBuscado}`);
            
            // Extraer la calle de la dirección buscada (mejorado)
            // Remover prefijos comunes y el número
            let calleBuscada = direccion
                .replace(/^(centro este|centro oeste|centro|área|barrio)[,\s]*/gi, '') // Remover nombres de zona
                .split(/\d/)[0] // Separar por número
                .replace(/^(av\.|avenida|av|calle|c\.|c)\s*/gi, '') // Remover prefijos
                .replace(/[,\s]+$/, '') // Remover comas y espacios finales
                .trim();
            
            const calleBuscadaNormalizada = normalizarTexto(calleBuscada);
            
            console.log(`   Dirección completa: "${direccion}"`);
            console.log(`   Calle extraída: "${calleBuscada}"`);
            console.log(`   Calle normalizada: "${calleBuscadaNormalizada}"`);
            
            const resultadosConNumero = resultadosEvaluados
                .filter(r => {
                    if (!r.result.address?.house_number || !r.result.address?.road) {
                        return false;
                    }
                    
                    const calleResultado = normalizarTexto(r.result.address.road);
                    const numeroResultado = parseInt(r.result.address.house_number);
                    
                    console.log(`   Comparando: "${calleResultado}" con "${calleBuscadaNormalizada}"`);
                    
                    // Verificar que sea la misma calle (más flexible)
                    const mismaCalle = 
                        calleResultado.includes(calleBuscadaNormalizada) || 
                        calleBuscadaNormalizada.includes(calleResultado) ||
                        calleResultado === calleBuscadaNormalizada;
                    
                    // Verificar que esté dentro de un rango razonable
                    const dentroRango = Math.abs(numeroResultado - numeroBuscado) < 2000;
                    
                    if (mismaCalle && dentroRango) {
                        console.log(`   ✓ Match: ${r.result.address.road} ${numeroResultado}`);
                    }
                    
                    return mismaCalle && dentroRango;
                })
                .map(r => ({
                    ...r,
                    numero: parseInt(r.result.address.house_number),
                }));

            console.log(`   \n📊 Resultados con número en la misma calle: ${resultadosConNumero.length}`);
            
            if (resultadosConNumero.length > 0) {
                const numerosUnicos = [...new Set(resultadosConNumero.map(r => r.numero))].sort((a,b) => a-b);
                console.log(`   Números únicos encontrados: [${numerosUnicos.join(', ')}]`);
            }

            if (resultadosConNumero.length >= 2) {
                const coordenadas = interpolarDireccion(numeroBuscado, resultadosConNumero);
                
                if (coordenadas) {
                    console.log(`✅ Interpolación exitosa:`);
                    console.log(`   Coordenadas: ${coordenadas.lat}, ${coordenadas.lng}`);
                    console.log(`   Basado en números: ${coordenadas.numeroMenor} ↔ ${coordenadas.numeroMayor}`);
                    console.log("=======================================\n");
                    
                    return {
                        success: true,
                        lat: coordenadas.lat,
                        lng: coordenadas.lng,
                        displayName: `${direccion}, ${ciudad}, Neuquén (interpolado)`,
                        boundingBox: mejorResultado?.boundingbox,
                        ciudad: ciudadNormalizada,
                        esAproximado: true,
                        esInterpolado: true,
                        puntuacion: mejorPuntuacion,
                    };
                } else {
                    console.log("❌ No se pudo interpolar");
                }
            } else {
                console.log("❌ No hay suficientes puntos para interpolar");
            }
        }
        
        console.log("=======================================\n");

        // FALLBACK: Si no encontramos la dirección exacta o la puntuación es baja,
        // buscar solo la ciudad como ubicación aproximada
        if (!mejorResultado || mejorPuntuacion < 20) {
            console.log("Intentando fallback: buscar solo ciudad");

            try {
                const responseCiudad = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                        `q=${encodeURIComponent(
                            ciudadNormalizada + ", Neuquén, Argentina"
                        )}` +
                        `&format=json` +
                        `&limit=5` +
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

                            // Verificar que sea realmente la ciudad que buscamos
                            const address = result.address || {};
                            const esCiudadCorrecta =
                                displayNameNormalizado.includes(
                                    ciudadLowerNormalizado
                                ) &&
                                (displayName.includes("neuquén") ||
                                    displayName.includes("neuquen")) &&
                                (result.type === "city" ||
                                    result.type === "town" ||
                                    result.type === "village" ||
                                    result.type === "administrative");

                            if (esCiudadCorrecta) {
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
                                    return {
                                        success: true,
                                        lat: coords.lat,
                                        lng: coords.lng,
                                        displayName: result.display_name,
                                        boundingBox: result.boundingbox,
                                        ciudad: extraerCiudad(result),
                                        esAproximado: true,
                                        direccionOriginal: direccion,
                                    };
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error en fallback de ciudad:", error);
            }

            // Si llegamos aquí y no encontramos nada, retornar error
            return {
                success: false,
                error: `No se pudo encontrar la dirección "${direccion}" en ${ciudad}, Neuquén.
                
Consejos:
• Verifica que la ciudad sea correcta
• Usa el formato: "Nombre de calle + Número" (Ej: "Avenida Argentina 1400")
• Prueba con diferentes formatos: "Buenos Aires 1400" o "Av. Buenos Aires 1400"
• Si la dirección es muy nueva, intenta sin número o con el nombre de una calle cercana`,
            };
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

            // Determinar si es una dirección exacta o aproximada
            const esExacta = mejorResultado.address?.house_number && 
                           mejorResultado.address.house_number === direccion.match(/\d+/)?.[0] &&
                           mejorPuntuacion >= 50;

            return {
                success: true,
                lat: coords.lat,
                lng: coords.lng,
                displayName: mejorResultado.display_name,
                boundingBox: mejorResultado.boundingbox,
                ciudad: extraerCiudad(mejorResultado),
                esAproximado: !esExacta,
                puntuacion: mejorPuntuacion, // Para debugging
            };
        }

        return {
            success: false,
            error: `No se pudo encontrar la dirección. Intenta con un formato diferente.`,
        };
    } catch (error) {
        console.error("Error en geocodificación:", error);
        return {
            success: false,
            error: "Error al buscar la dirección. Verifica tu conexión e intenta nuevamente.",
        };
    }
};

/**
 * Interpola coordenadas para un número de calle basándose en números cercanos conocidos
 */
const interpolarDireccion = (numeroBuscado, resultados) => {
    try {
        console.log(`   🧮 Iniciando interpolación para número ${numeroBuscado}`);
        
        // Ordenar resultados por número de casa
        const ordenados = resultados
            .map(r => ({
                numero: parseInt(r.result.address.house_number),
                lat: parseFloat(r.result.lat),
                lng: parseFloat(r.result.lon),
            }))
            .sort((a, b) => a.numero - b.numero);

        console.log(`   Números ordenados: ${ordenados.map(o => o.numero).join(', ')}`);

        // Encontrar el número menor más cercano (antes del buscado)
        const numerosMenores = ordenados.filter(r => r.numero < numeroBuscado);
        const numerosMayores = ordenados.filter(r => r.numero > numeroBuscado);

        console.log(`   Menores que ${numeroBuscado}: ${numerosMenores.map(n => n.numero).join(', ') || 'ninguno'}`);
        console.log(`   Mayores que ${numeroBuscado}: ${numerosMayores.map(n => n.numero).join(', ') || 'ninguno'}`);

        if (numerosMenores.length === 0 && numerosMayores.length === 0) {
            console.log("   ❌ No hay números para comparar");
            return null;
        }

        // Si solo hay números mayores, usar extrapolación
        if (numerosMenores.length === 0 && numerosMayores.length >= 2) {
            console.log("   📍 Extrapolando hacia números menores");
            const [p1, p2] = numerosMayores.slice(0, 2);
            return extrapolar(numeroBuscado, p1, p2, "menor");
        }

        // Si solo hay números menores, usar extrapolación
        if (numerosMayores.length === 0 && numerosMenores.length >= 2) {
            console.log("   📍 Extrapolando hacia números mayores");
            const [p1, p2] = numerosMenores.slice(-2);
            return extrapolar(numeroBuscado, p1, p2, "mayor");
        }

        // Si hay ambos, usar interpolación
        if (numerosMenores.length > 0 && numerosMayores.length > 0) {
            console.log("   📍 Interpolando entre números conocidos");
            const puntoMenor = numerosMenores[numerosMenores.length - 1];
            const puntoMayor = numerosMayores[0];

            // Calcular la proporción
            const rangoNumeros = puntoMayor.numero - puntoMenor.numero;
            const diferenciaBuscado = numeroBuscado - puntoMenor.numero;
            const proporcion = diferenciaBuscado / rangoNumeros;

            console.log(`   Interpolando ${(proporcion * 100).toFixed(1)}% entre ${puntoMenor.numero} y ${puntoMayor.numero}`);

            // Interpolar coordenadas
            const latInterpolada = puntoMenor.lat + (puntoMayor.lat - puntoMenor.lat) * proporcion;
            const lngInterpolada = puntoMenor.lng + (puntoMayor.lng - puntoMenor.lng) * proporcion;

            return {
                lat: latInterpolada,
                lng: lngInterpolada,
                numeroMenor: puntoMenor.numero,
                numeroMayor: puntoMayor.numero,
            };
        }

        console.log("   ❌ No se pudo determinar método de interpolación");
        return null;
    } catch (error) {
        console.error("   ❌ Error en interpolación:", error);
        return null;
    }
};

/**
 * Extrapola coordenadas cuando solo hay números mayores o menores
 */
const extrapolar = (numeroBuscado, p1, p2, direccion) => {
    try {
        // Calcular el vector de dirección entre p1 y p2
        const rangoNumeros = Math.abs(p2.numero - p1.numero);
        const vectorLat = (p2.lat - p1.lat) / rangoNumeros;
        const vectorLng = (p2.lng - p1.lng) / rangoNumeros;

        // Calcular distancia del número buscado al punto más cercano
        const puntoBase = direccion === "menor" ? p1 : p2;
        const distancia = Math.abs(numeroBuscado - puntoBase.numero);

        // Extrapolar
        const factorDireccion = direccion === "menor" ? -1 : 1;
        const latExtrapolada = puntoBase.lat + (vectorLat * distancia * factorDireccion);
        const lngExtrapolada = puntoBase.lng + (vectorLng * distancia * factorDireccion);

        console.log(`   Extrapolando ${direccion} del número ${puntoBase.numero}`);

        return {
            lat: latExtrapolada,
            lng: lngExtrapolada,
            numeroMenor: direccion === "menor" ? numeroBuscado : p1.numero,
            numeroMayor: direccion === "mayor" ? numeroBuscado : p2.numero,
        };
    } catch (error) {
        console.error("Error en extrapolación:", error);
        return null;
    }
};

/**
 * Normaliza texto (sin tildes, minúsculas)
 */
const normalizarTexto = (texto) =>
    texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

/**
 * Evalúa la calidad de un resultado de geocodificación
 * Sistema de puntuación mejorado para priorizar resultados precisos
 */
const evaluarResultado = (
    result,
    direccionOriginal,
    direccionSimplificada,
    ciudadBuscada,
    pesoEstrategia
) => {
    const displayName = result.display_name.toLowerCase();
    const address = result.address || {};
    let puntuacion = pesoEstrategia;

    const ciudadNormalizada = normalizarTexto(ciudadBuscada);
    const displayNameNormalizado = normalizarTexto(displayName);

    // 1. Verificar coordenadas dentro de Neuquén (CRÍTICO)
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (!validarCoordenadasNeuquen(lat, lng, false)) {
        return 0; // Descartar completamente si no está en Neuquén
    }
    puntuacion += 10; // Bonus por estar en Neuquén

    // 2. Verificar que contenga "Neuquén" en el display_name
    if (displayNameNormalizado.includes("neuquen")) {
        puntuacion += 8;
    }

    // 3. Verificar ciudad (MUY IMPORTANTE)
    const ciudadResultado = normalizarTexto(
        address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            ""
    );

    if (ciudadResultado === ciudadNormalizada) {
        puntuacion += 15; // Coincidencia exacta de ciudad
    } else if (ciudadResultado.includes(ciudadNormalizada)) {
        puntuacion += 12; // Coincidencia parcial
    } else if (displayNameNormalizado.includes(ciudadNormalizada)) {
        puntuacion += 8; // Al menos aparece en el display name
    } else {
        puntuacion -= 10; // Penalizar si no coincide la ciudad
    }

    // 4. Verificar número de casa (MUY IMPORTANTE para precisión)
    const numeroEnDireccion = direccionOriginal.match(/\d+/);
    
    if (numeroEnDireccion) {
        const numeroIngresado = parseInt(numeroEnDireccion[0]);
        
        if (address.house_number) {
            const numeroResultado = parseInt(address.house_number);
            
            if (numeroResultado === numeroIngresado) {
                puntuacion += 30; // Coincidencia EXACTA de número - máxima prioridad
            } else {
                // Calcular diferencia
                const diff = Math.abs(numeroResultado - numeroIngresado);
                
                if (diff <= 10) {
                    puntuacion += 15; // Muy cercano (dentro de 10 números)
                } else if (diff <= 50) {
                    puntuacion += 5; // Cercano (dentro de 50)
                } else if (diff <= 100) {
                    puntuacion += 2; // Mismo bloque
                } else {
                    // Si la diferencia es grande, PENALIZAR FUERTEMENTE
                    puntuacion -= 15; // Penalización por número incorrecto
                }
            }
        } else {
            // Penalizar si buscamos un número específico pero no lo encontró
            puntuacion -= 10;
        }
    } else {
        // No se especificó número en la búsqueda
        if (address.house_number) {
            puntuacion += 5; // Bonus menor si tiene número aunque no lo pedimos
        }
    }

    // 5. Verificar coincidencia de calle
    const calleResultado = normalizarTexto(address.road || "");
    const calleBuscada = normalizarTexto(
        direccionSimplificada.split(/\d/)[0].trim()
    );

    if (calleResultado && calleBuscada) {
        if (calleResultado === calleBuscada) {
            puntuacion += 15; // Coincidencia exacta
        } else if (calleResultado.includes(calleBuscada)) {
            puntuacion += 12; // Contiene la calle
        } else if (calleBuscada.includes(calleResultado)) {
            puntuacion += 10; // La calle buscada contiene el resultado
        } else {
            // Verificar coincidencia de palabras clave
            const palabrasCalle = calleBuscada.split(" ");
            const palabrasResultado = calleResultado.split(" ");
            let palabrasCoincidentes = 0;

            palabrasCalle.forEach((palabra) => {
                if (palabra.length > 3 && palabrasResultado.some((p) => p.includes(palabra))) {
                    palabrasCoincidentes++;
                }
            });

            if (palabrasCoincidentes > 0) {
                puntuacion += palabrasCoincidentes * 3;
            } else {
                puntuacion -= 8; // Penalizar si la calle no coincide
            }
        }
    }

    // 6. Preferir tipos específicos de lugares
    const tiposPreferidos = {
        building: 5,
        house: 6,
        residential: 4,
        university: 5,
        school: 5,
        college: 5,
        amenity: 3,
        highway: 2,
        road: 3,
    };

    if (tiposPreferidos[result.type]) {
        puntuacion += tiposPreferidos[result.type];
    }

    // 7. Preferir resultados con más detalles en address
    const detallesAddress = [
        address.house_number,
        address.road,
        address.suburb,
        address.postcode,
    ].filter(Boolean).length;

    puntuacion += detallesAddress * 2;

    // 8. Penalizar si el resultado es muy genérico
    if (
        result.type === "administrative" ||
        result.type === "state" ||
        result.type === "province"
    ) {
        puntuacion -= 8;
    }

    // 9. Bonus por importancia del resultado (importance en Nominatim)
    if (result.importance) {
        puntuacion += result.importance * 2;
    }

    return Math.max(0, puntuacion); // No permitir puntuaciones negativas
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