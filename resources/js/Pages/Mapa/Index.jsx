import { useEffect, useState, useRef } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapaIndex({ auth, instituciones, tiposInstitucion }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayer = useRef(null);

    const [filtros, setFiltros] = useState({
        tipoInstitucion: "",
        areaEstudio: "",
        rangoDistancia: 50,
    });

    const [busqueda, setBusqueda] = useState("");
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [institucionesFiltradas, setInstitucionesFiltradas] =
        useState(instituciones);
    const [ubicacionUsuario, setUbicacionUsuario] = useState(null);

    // Coordenadas del centro de Neuquén
    const NEUQUEN_CENTER = [-38.9516, -68.0591];

    // Iconos personalizados
    const iconoInstitucion = L.icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const iconoResidencia = L.icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    // Inicializar mapa
    useEffect(() => {
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView(
                NEUQUEN_CENTER,
                12
            );

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
                maxZoom: 19,
            }).addTo(mapInstance.current);

            markersLayer.current = L.layerGroup().addTo(mapInstance.current);
        }

        // Obtener ubicación del usuario
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = [
                        position.coords.latitude,
                        position.coords.longitude,
                    ];
                    setUbicacionUsuario(userLocation);
                },
                (error) => {
                    console.log("No se pudo obtener la ubicación del usuario");
                }
            );
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Búsqueda en tiempo real
    useEffect(() => {
        if (busqueda.length < 2) {
            setResultadosBusqueda([]);
            setMostrarResultados(false);
            return;
        }

        const busquedaLower = busqueda.toLowerCase();
        const resultados = [];

        institucionesFiltradas.forEach((inst) => {
            if (
                inst.nombre?.toLowerCase().includes(busquedaLower) ||
                inst.tipo_institucion?.toLowerCase().includes(busquedaLower) ||
                inst.direccion?.toLowerCase().includes(busquedaLower) ||
                inst.ciudad?.toLowerCase().includes(busquedaLower)
            ) {
                resultados.push({
                    tipo: "institucion",
                    data: inst,
                    nombre: inst.nombre,
                    subtitulo: `${inst.tipo_institucion || ""} - ${
                        inst.direccion || ""
                    }`,
                });
            }

            inst.residencias?.forEach((res) => {
                if (
                    res.nombre?.toLowerCase().includes(busquedaLower) ||
                    res.direccion?.toLowerCase().includes(busquedaLower)
                ) {
                    resultados.push({
                        tipo: "residencia",
                        data: res,
                        institucion: inst,
                        nombre: res.nombre,
                        subtitulo: `Residencia de ${inst.nombre}`,
                    });
                }
            });
        });

        setResultadosBusqueda(resultados.slice(0, 10));
        setMostrarResultados(true);
    }, [busqueda, institucionesFiltradas]);

    // Actualizar marcadores cuando cambien las instituciones filtradas
    useEffect(() => {
        if (markersLayer.current) {
            markersLayer.current.clearLayers();

            institucionesFiltradas.forEach((institucion) => {
                // Marcador de institución
                const marker = L.marker(
                    [institucion.latitud, institucion.longitud],
                    {
                        icon: iconoInstitucion,
                    }
                );

                const popupContent = crearPopupInstitucion(institucion);
                marker.bindPopup(popupContent, { maxWidth: 400 });
                marker.addTo(markersLayer.current);

                // Marcadores de residencias
                if (
                    institucion.residencias &&
                    institucion.residencias.length > 0
                ) {
                    institucion.residencias.forEach((residencia) => {
                        const resMarker = L.marker(
                            [residencia.latitud, residencia.longitud],
                            {
                                icon: iconoResidencia,
                            }
                        );

                        const resPopupContent = crearPopupResidencia(
                            residencia,
                            institucion
                        );
                        resMarker.bindPopup(resPopupContent, { maxWidth: 400 });
                        resMarker.addTo(markersLayer.current);
                    });
                }
            });
        }
    }, [institucionesFiltradas]);

    const crearPopupInstitucion = (institucion) => {
        return `
            <div style="font-family: system-ui; max-width: 350px;">
                ${
                    institucion.foto_perfil
                        ? `<img src="/storage/${institucion.foto_perfil}" alt="${institucion.nombre}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />`
                        : ""
                }
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${
                    institucion.nombre
                }</h3>
                ${
                    institucion.tipo_institucion
                        ? `<p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>Tipo:</strong> ${institucion.tipo_institucion}</p>`
                        : ""
                }
                ${
                    institucion.direccion
                        ? `<p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>📍 Dirección:</strong> ${institucion.direccion}</p>`
                        : ""
                }
                ${
                    institucion.telefono
                        ? `<p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>📞 Teléfono:</strong> ${institucion.telefono}</p>`
                        : ""
                }
                ${
                    institucion.descripcion
                        ? `<p style="margin: 8px 0 4px 0; font-size: 13px; color: #374151;">${institucion.descripcion.substring(
                              0,
                              150
                          )}${
                              institucion.descripcion.length > 150 ? "..." : ""
                          }</p>`
                        : ""
                }
                ${
                    institucion.url_sitio_web
                        ? `<a href="${institucion.url_sitio_web}" target="_blank" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">Visitar sitio web</a>`
                        : ""
                }
            </div>
        `;
    };

    const crearPopupResidencia = (residencia, institucion) => {
        return `
            <div style="font-family: system-ui; max-width: 350px;">
                ${
                    residencia.foto_portada
                        ? `<img src="/storage/${residencia.foto_portada}" alt="${residencia.nombre}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />`
                        : ""
                }
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${
                    residencia.nombre
                }</h3>
                <p style="margin: 4px 0; font-size: 12px; color: #7c3aed; font-weight: 500;">🏛️ ${
                    institucion.nombre
                }</p>
                ${
                    residencia.direccion
                        ? `<p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>📍 Dirección:</strong> ${residencia.direccion}</p>`
                        : ""
                }
                ${
                    residencia.contacto
                        ? `<p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>📞 Contacto:</strong> ${residencia.contacto}</p>`
                        : ""
                }
                ${
                    residencia.capacidad
                        ? `<p style="margin: 4px 0; font-size: 13px; color: #6b7280;"><strong>👥 Capacidad:</strong> ${residencia.capacidad} personas</p>`
                        : ""
                }
                ${
                    residencia.info_adicional
                        ? `<p style="margin: 8px 0 4px 0; font-size: 13px; color: #374151;">${residencia.info_adicional}</p>`
                        : ""
                }
            </div>
        `;
    };

    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const aplicarFiltros = () => {
        let resultado = [...instituciones];

        // Filtro por tipo de institución
        if (filtros.tipoInstitucion) {
            resultado = resultado.filter(
                (inst) => inst.tipo_institucion === filtros.tipoInstitucion
            );
        }

        // Filtro por área de estudio
        if (filtros.areaEstudio) {
            resultado = resultado.filter(
                (inst) =>
                    inst.descripcion
                        ?.toLowerCase()
                        .includes(filtros.areaEstudio.toLowerCase()) ||
                    inst.tipo_institucion
                        ?.toLowerCase()
                        .includes(filtros.areaEstudio.toLowerCase())
            );
        }

        // Filtro por distancia
        if (ubicacionUsuario && filtros.rangoDistancia < 50) {
            resultado = resultado.filter((inst) => {
                const distancia = calcularDistancia(
                    ubicacionUsuario[0],
                    ubicacionUsuario[1],
                    inst.latitud,
                    inst.longitud
                );
                return distancia <= filtros.rangoDistancia;
            });
        }

        setInstitucionesFiltradas(resultado);
        setMostrarFiltros(false);
    };

    const limpiarFiltros = () => {
        setFiltros({
            tipoInstitucion: "",
            areaEstudio: "",
            rangoDistancia: 50,
        });
        setInstitucionesFiltradas(instituciones);
    };

    const centrarMapa = (coords) => {
        if (mapInstance.current) {
            mapInstance.current.setView(coords, 16);
        }
    };

    const handleResultadoClick = (resultado) => {
        const coords =
            resultado.tipo === "institucion"
                ? [resultado.data.latitud, resultado.data.longitud]
                : [resultado.data.latitud, resultado.data.longitud];

        centrarMapa(coords);
        setBusqueda("");
        setMostrarResultados(false);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mapa" />

            <div className="relative w-full h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
                <div
                    ref={mapRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ zIndex: 0 }}
                />

                {/* Barra de búsqueda - Responsive */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-1/2 sm:transform sm:-translate-x-1/2 right-2 sm:right-auto w-auto sm:w-full sm:max-w-md z-[10] px-0 sm:px-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar institución..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 bg-white rounded-full shadow-lg border border-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <svg
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>

                        {/* Resultados de búsqueda */}
                        {mostrarResultados && resultadosBusqueda.length > 0 && (
                            <div className="absolute w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-60 sm:max-h-96 overflow-y-auto">
                                {resultadosBusqueda.map((resultado, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handleResultadoClick(resultado)
                                        }
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 flex items-start gap-2 sm:gap-3"
                                    >
                                        <div
                                            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center ${
                                                resultado.tipo === "institucion"
                                                    ? "bg-blue-100 text-blue-600"
                                                    : "bg-purple-100 text-purple-600"
                                            }`}
                                        >
                                            {resultado.tipo ===
                                            "institucion" ? (
                                                <svg
                                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                {resultado.nombre}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {resultado.subtitulo}
                                            </p>
                                        </div>

                                        <svg
                                            className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Sin resultados */}
                        {mostrarResultados &&
                            resultadosBusqueda.length === 0 &&
                            busqueda.length >= 2 && (
                                <div className="absolute w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-4 sm:py-6 text-center">
                                    <svg
                                        className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        No se encontraron resultados para "
                                        {busqueda}"
                                    </p>
                                </div>
                            )}
                    </div>
                </div>

                {/* Botón de filtros - Responsive */}
                <button
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 z-[10] bg-white rounded-lg shadow-lg px-3 sm:px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition text-sm sm:text-base"
                >
                    <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                    </svg>
                    <span className="hidden sm:inline">Filtros</span>
                </button>

                {/* Panel de filtros - Responsive */}
                {mostrarFiltros && (
                    <>
                        {/* Overlay para móvil */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-[450] md:hidden"
                            onClick={() => setMostrarFiltros(false)}
                        />

                        <div className="fixed md:absolute inset-x-0 bottom-0 md:inset-auto md:top-4 md:right-4 z-[500] bg-white rounded-t-2xl md:rounded-lg shadow-2xl p-4 sm:p-6 w-full md:w-80 max-h-[80vh] md:max-h-[calc(100vh-8rem)] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                    Filtros
                                </h3>
                                <button
                                    onClick={() => setMostrarFiltros(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Tipo de institución */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Por tipo de institución:
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Buscar universidades, terciarios y
                                        centro de formación en la Provincia
                                    </p>
                                    <select
                                        value={filtros.tipoInstitucion}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                tipoInstitucion: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                                    >
                                        <option value="">
                                            Tipo de institución
                                        </option>
                                        {tiposInstitucion.map((tipo) => (
                                            <option key={tipo} value={tipo}>
                                                {tipo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Área de estudio */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Por área de estudio:
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Filtra las instituciones según la
                                        disciplina que quieres estudiar.
                                    </p>
                                    <input
                                        type="text"
                                        value={filtros.areaEstudio}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                areaEstudio: e.target.value,
                                            })
                                        }
                                        placeholder="Área de estudio"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                                    />
                                </div>

                                {/* Rango de distancia */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Por rango de distancia:
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Muestra instituciones dentro de un radio
                                        determinado desde tu ubicación.
                                    </p>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={filtros.rangoDistancia}
                                            onChange={(e) =>
                                                setFiltros({
                                                    ...filtros,
                                                    rangoDistancia: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-edu-dark"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Mínimo</span>
                                            <span className="font-medium text-gray-900">
                                                {filtros.rangoDistancia < 50
                                                    ? `${filtros.rangoDistancia} km`
                                                    : "Máximo"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={aplicarFiltros}
                                        className="flex-1 bg-edu-dark text-white py-2 px-4 rounded-full hover:bg-black transition font-medium text-sm"
                                    >
                                        Aplicar
                                    </button>
                                    <button
                                        onClick={limpiarFiltros}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-300 transition font-medium text-sm"
                                    >
                                        Limpiar
                                    </button>
                                </div>

                                {/* Resultados */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Mostrando{" "}
                                        <span className="font-semibold text-gray-900">
                                            {institucionesFiltradas.length}
                                        </span>{" "}
                                        de {instituciones.length} instituciones
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Leyenda - Responsive */}
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-[10] bg-white rounded-lg shadow-lg p-3 sm:p-4">
                    <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span className="text-xs sm:text-sm text-gray-700">
                                Institución
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <span className="text-xs sm:text-sm text-gray-700">
                                Residencia
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
