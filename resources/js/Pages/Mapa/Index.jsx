import { useEffect, useState, useRef } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useGeolocation } from "@/hooks/useGeolocation";
import toast, { Toaster } from "react-hot-toast";
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

export default function MapaIndex({ auth, instituciones, tiposInstitucion, ubicacionesGuardadas = [] }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayer = useRef(null);
    const userMarker = useRef(null);
    const userCircle = useRef(null);

    const {
        location: userLocation,
        watching,
        getCurrentPosition,
        startWatching,
        stopWatching,
    } = useGeolocation();

    const [filtros, setFiltros] = useState({
        tipoInstitucion: "",
        areaEstudio: "",
        rangoDistancia: 50,
    });

    const [guardadas, setGuardadas] = useState(
        ubicacionesGuardadas.reduce((acc, ug) => {
            acc[ug.institucion_id] = true;
            return acc;
        }, {})
    );

    const [busqueda, setBusqueda] = useState("");
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [institucionesFiltradas, setInstitucionesFiltradas] =
        useState(instituciones);

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

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Actualizar ubicación del usuario en el mapa
    useEffect(() => {
        if (userLocation && mapInstance.current) {
            const coords = [userLocation.lat, userLocation.lng];

            // Remover marcador y circulo anterior
            if (userMarker.current) {
                mapInstance.current.removeLayer(userMarker.current);
            }
            if (userCircle.current) {
                mapInstance.current.removeLayer(userCircle.current);
            }

            // Circulo para la ubicacion del usuario
            const pulsingIcon = L.divIcon({
                className: "user-location-marker",
                html: `
                    <div style="position: relative; width: 20px; height: 20px;">
                        <div style="
                            position: absolute;
                            width: 20px;
                            height: 20px;
                            background: #1e40af;
                            border: 3px solid white;
                            border-radius: 50%;
                            box-shadow: 0 0 10px rgba(30, 64, 175, 0.8);
                            animation: pulse 2s infinite;
                        "></div>
                    </div>
                    <style>
                        @keyframes pulse {
                            0% {
                                box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.7);
                            }
                            70% {
                                box-shadow: 0 0 0 15px rgba(30, 64, 175, 0);
                            }
                            100% {
                                box-shadow: 0 0 0 0 rgba(30, 64, 175, 0);
                            }
                        }
                    </style>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            });

            // Agregar nuevo marcador
            userMarker.current = L.marker(coords, {
                icon: pulsingIcon,
                zIndexOffset: 1000,
            }).addTo(mapInstance.current);

            userMarker.current.bindPopup(`
                <div style="font-family: system-ui; text-align: center;">
                    <p style="margin: 0; font-weight: 600; color: #1e40af;">Tu ubicación</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
                        Precisión: ${Math.round(userLocation.accuracy)}m
                    </p>
                </div>
            `);

            // Agregar circulo de precisión
            userCircle.current = L.circle(coords, {
                radius: userLocation.accuracy,
                color: "#1e40af",
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                weight: 1,
            }).addTo(mapInstance.current);
        }
    }, [userLocation]);

    // Busqueda en tiempo real
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
                const marker = L.marker(
                    [institucion.latitud, institucion.longitud],
                    { icon: iconoInstitucion }
                );

                const popupContent = crearPopupInstitucion(institucion);
                marker.bindPopup(popupContent, { maxWidth: 400 });
                marker.addTo(markersLayer.current);

                if (
                    institucion.residencias &&
                    institucion.residencias.length > 0
                ) {
                    institucion.residencias.forEach((residencia) => {
                        const resMarker = L.marker(
                            [residencia.latitud, residencia.longitud],
                            { icon: iconoResidencia }
                        );

                        const resPopupContent = crearPopupResidencia(
                            residencia,
                            institucion
                        );
                        resMarker.bindPopup(resPopupContent, { maxWidth: 350 });
                        resMarker.addTo(markersLayer.current);
                    });
                }
            });
        }
    }, [institucionesFiltradas, guardadas]);

    const toggleUbicacion = async (institucionId) => {
        try {
            const res = await axios.post(route("ubicaciones.toggle"), {
                institucion_id: institucionId,
            });
            
            setGuardadas(prev => ({
                ...prev,
                [institucionId]: res.data.guardada
            }));
            
            toast.success(
                res.data.guardada 
                    ? "Ubicación guardada" 
                    : "Ubicación eliminada"
            );
        } catch (err) {
            console.error(err);
            toast.error("Error al guardar ubicación");
        }
    };

    const crearPopupInstitucion = (institucion) => {
        const estaGuardada = guardadas[institucion.id] || false;
        const esPropia = auth.user?.id === institucion.user_id;
        
        return `
            <div style="font-family: system-ui; max-width: 350px;">
                ${
                    institucion.foto_perfil
                        ? `<img src="/storage/${institucion.foto_perfil}" alt="${institucion.nombre}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;" />`
                        : ""
                }

                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                    <h3 style="margin:0; font-size:18px; font-weight:600; color:#1f2937;">
                        ${institucion.nombre}
                    </h3>

                    <a href="/instituciones/${institucion.id}"
                    style="color:#2563eb; margin-top: 2px; text-decoration:underline; font-size:14px; font-weight:500; white-space:nowrap;">
                        Perfil →
                    </a>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                    <img src="/svg/mapa/school-sharp.svg" style="width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px;" />
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">${
                        institucion.tipo_institucion || "Sin tipo especificado"
                    }</p>
                </div>
                
                ${
                    institucion.direccion
                        ? `
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                    <img src="/svg/mapa/location-sharp.svg" style="width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px;" />
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">${institucion.direccion}</p>
                </div>
                `
                        : ""
                }
                
                ${
                    institucion.telefono
                        ? `
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px;">
                    <img src="/svg/mapa/call.svg" style="width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px;" />
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">${institucion.telefono}</p>
                </div>
                `
                        : ""
                }
                
                ${
                    !esPropia
                        ? `
                <button 
                    onclick="window.toggleUbicacionMapa(${institucion.id})"
                    style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        background: ${estaGuardada ? '#f3f4f6' : '#1f2937'};
                        color: ${estaGuardada ? '#1f2937' : 'white'};
                        font-weight: 600;
                        padding: 10px 16px;
                        border-radius: 8px;
                        border: none;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                        margin-bottom: 12px;
                    "
                    onmouseover="this.style.background='${estaGuardada ? '#e5e7eb' : '#000000'}'"
                    onmouseout="this.style.background='${estaGuardada ? '#f3f4f6' : '#1f2937'}'"
                >
                    <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    ${estaGuardada ? 'Ubicación guardada' : 'Guardar ubicación'}
                </button>
                `
                        : ""
                }
                
                ${
                    institucion.descripcion
                        ? `<p style="margin: 12px 0 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">${institucion.descripcion.substring(
                            0,
                            100
                        )}${
                            institucion.descripcion.length > 100 ? "..." : ""
                        }</p>`
                        : ""
                }
            </div>
        `;
    };

    useEffect(() => {
        // Exponer la función al scope global para que el popup pueda llamarla
        window.toggleUbicacionMapa = toggleUbicacion;
        
        return () => {
            delete window.toggleUbicacionMapa;
        };
    }, [guardadas]);

    const crearPopupResidencia = (residencia, institucion) => {
        const estaGuardada = guardadas[institucion.id] || false;
        const esPropia = auth.user?.id === institucion.user_id;

        return `
            <div style="font-family: system-ui; max-width: 320px;">
                ${
                    residencia.foto_portada
                        ? `<img src="/storage/${residencia.foto_portada}" alt="${residencia.nombre}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;" />`
                        : ""
                }

                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
                    ${residencia.nombre}
                </h3>

                <div style="display:flex; align-items:center; gap:6px; margin-bottom:10px;">
                    <img src="/svg/mapa/school-sharp.svg" style="width:16px; height:16px;" />
                    <span style="font-size:13px; color:#7c3aed; font-weight:500;">
                        ${institucion.nombre}
                    </span>

                    <a href="/instituciones/${institucion.id}"
                    style=" color:#2563eb; text-decoration:underline; font-size:13px; font-weight:500; white-space:nowrap;">
                        Perfil →
                    </a>
                </div>
                
                ${
                    residencia.direccion
                        ? `
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                    <img src="/svg/mapa/location-sharp.svg" style="width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px;" />
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">${residencia.direccion}</p>
                </div>
                `
                        : ""
                }
                
                ${
                    residencia.contacto
                        ? `
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                    <img src="/svg/mapa/call.svg" style="width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px;" />
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">${residencia.contacto}</p>
                </div>
                `
                        : ""
                }
                
                ${
                    residencia.capacidad
                        ? `
                <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px;">
                    <img src="/svg/mapa/accessibility-sharp.svg" style="width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px;" />
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Capacidad para ${residencia.capacidad} personas</p>
                </div>
                `
                        : ""
                }
                
                ${
                    !esPropia
                        ? `
                <button 
                    onclick="window.toggleUbicacionMapa(${institucion.id})"
                    style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        background: ${estaGuardada ? '#f3f4f6' : '#1f2937'};
                        color: ${estaGuardada ? '#1f2937' : 'white'};
                        font-weight: 600;
                        padding: 10px 16px;
                        border-radius: 8px;
                        border: none;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                        margin-bottom: 12px;
                    "
                    onmouseover="this.style.background='${estaGuardada ? '#e5e7eb' : '#000000'}'"
                    onmouseout="this.style.background='${estaGuardada ? '#f3f4f6' : '#1f2937'}'"
                >
                    <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    ${estaGuardada ? 'Ubicación guardada' : 'Guardar ubicación'}
                </button>
                `
                        : ""
                }
                
                ${
                    residencia.info_adicional
                        ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #374151; line-height: 1.5;">
                            ${
                                residencia.info_adicional.length > 100
                                    ? residencia.info_adicional.substring(0, 100) + "..."
                                    : residencia.info_adicional
                            }
                        </p>`
                        : ""
                }
            </div>
        `;
    };

    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
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

        if (filtros.tipoInstitucion) {
            resultado = resultado.filter(
                (inst) => inst.tipo_institucion === filtros.tipoInstitucion
            );
        }

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

        if (userLocation && filtros.rangoDistancia < 50) {
            resultado = resultado.filter((inst) => {
                const distancia = calcularDistancia(
                    userLocation.lat,
                    userLocation.lng,
                    inst.latitud,
                    inst.longitud
                );
                return distancia <= filtros.rangoDistancia;
            });
        }

        setInstitucionesFiltradas(resultado);
        setMostrarFiltros(false);
        toast.success(`Mostrando ${resultado.length} instituciones`);
    };

    const limpiarFiltros = () => {
        setFiltros({
            tipoInstitucion: "",
            areaEstudio: "",
            rangoDistancia: 50,
        });
        setInstitucionesFiltradas(instituciones);
        toast.success("Filtros limpiados");
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

    const handleMiUbicacion = () => {
        if (!watching) {
            getCurrentPosition();
            if (userLocation) {
                centrarMapa([userLocation.lat, userLocation.lng]);
            }
        } else {
            if (userLocation) {
                centrarMapa([userLocation.lat, userLocation.lng]);
            }
        }
    };

    const toggleSeguimiento = () => {
        if (watching) {
            stopWatching();
        } else {
            startWatching();
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} showRecomendaciones={false} fullWidth={true} maxWidth="w-full" >
            <Head title="Mapa" />

            <div className="relative w-full h-full bg-gray-50 overflow-hidden">
                <div
                    ref={mapRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ zIndex: 0 }}
                />

                {/* Barra de búsqueda */}
                <div
                    className="
                        absolute top-2 sm:top-4 left-0 right-0 z-[10]
                        px-4
                        flex flex-col sm:flex-row
                        items-end sm:items-center
                        justify-end sm:justify-center
                        gap-2
                    "
                >
                    <div className="relative flex-1 max-w-md order-1 sm:order-none">
                        <img
                            src="/svg/mapa/search-circle-sharp.svg"
                            alt="Buscar"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none"
                        />

                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar institución..."
                            className="w-full pl-11 pr-4 py-2 sm:py-2.5 bg-white rounded-full shadow-lg border border-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                        />

                        {/* Resultados */}
                        {mostrarResultados && resultadosBusqueda.length > 0 && (
                            <div className="absolute w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-60 sm:max-h-96 overflow-y-auto">
                                {resultadosBusqueda.map((resultado, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handleResultadoClick(resultado)
                                        }
                                        className="w-full px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                                    >
                                        <div
                                            className={`flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center ${
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
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {resultado.nombre}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {resultado.subtitulo}
                                            </p>
                                        </div>

                                        <svg
                                            className="w-5 h-5 text-gray-400"
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
                    </div>

                    {/* --- BOTONES (filtros + ubicación + seguimiento) --- */}
                    <div
                        className="
        flex flex-col sm:flex-row
        items-end sm:items-center
        gap-2
        order-2 sm:order-none
    "
                    >
                        {/* Filtros */}
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className="bg-white rounded-full shadow-lg p-2 hover:bg-gray-50 transition"
                            title="Filtros"
                        >
                            <img
                                src="/svg/mapa/filter-circle.svg"
                                alt="Filtros"
                                className="w-6 h-6"
                            />
                        </button>

                        {/* Ubicación */}
                        <button
                            onClick={handleMiUbicacion}
                            className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition"
                            title="Mi ubicación"
                        >
                            <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </button>

                        {/* Seguimiento */}
                        <button
                            onClick={toggleSeguimiento}
                            className={`rounded-lg shadow-lg p-2 transition ${
                                watching
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                            title={
                                watching
                                    ? "Desactivar seguimiento"
                                    : "Activar seguimiento"
                            }
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Panel de filtros */}
                {mostrarFiltros && (
                    <>
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-[450] md:hidden"
                            onClick={() => setMostrarFiltros(false)}
                        />

                        <div className="relative md:absolute inset-x-0 bottom-0 md:inset-auto md:top-20 md:right-96 z-[500] bg-white rounded-t-2xl md:rounded-lg shadow-2xl p-4 sm:p-6 w-full md:w-80 max-h-[80vh] md:max-h-[calc(100vh-8rem)] overflow-y-auto">
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
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Por tipo de institución:
                                    </label>
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

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Por área de estudio:
                                    </label>
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

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Por rango de distancia:
                                    </label>
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
                                            disabled={!userLocation}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Mínimo</span>
                                            <span className="font-medium text-gray-900">
                                                {filtros.rangoDistancia < 50
                                                    ? `${filtros.rangoDistancia} km`
                                                    : "Máximo"}
                                            </span>
                                        </div>
                                        {!userLocation && (
                                            <p className="text-xs text-amber-600">
                                                Activa tu ubicación para usar
                                                este filtro
                                            </p>
                                        )}
                                    </div>
                                </div>

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

                {/* Leyenda */}
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
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-900 rounded-full flex-shrink-0 relative">
                                <div className="absolute inset-0 bg-blue-900 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-700">
                                Tu ubicación
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
