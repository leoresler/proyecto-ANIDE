import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

export default function BarraBusqueda({
    variant = "global",
    publicaciones = [],
    onBusqueda = null,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [resultados, setResultados] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const debounceTimeout = useRef(null);

    // Cargar historial del localStorage al montar
    useEffect(() => {
        if (variant === "global") {
            const historialGuardado =
                localStorage.getItem("historial_busqueda");
            if (historialGuardado) {
                setHistorial(JSON.parse(historialGuardado));
            }
        }
    }, [variant]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Buscar en tiempo real con debounce
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (searchTerm.trim().length > 0) {
            setIsLoading(true);
            debounceTimeout.current = setTimeout(() => {
                buscarEnTiempoReal(searchTerm);
            }, 300);
        } else {
            setResultados([]);
            setIsLoading(false);
            if (variant === "favoritos" && onBusqueda) {
                onBusqueda(null);
            }
        }

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchTerm]);

    const buscarEnTiempoReal = (query) => {
        const queryLower = query.toLowerCase();

        if (variant === "favoritos") {
            const publicacionesFiltradas = publicaciones.filter(
                (pub) =>
                    pub.titulo?.toLowerCase().includes(queryLower) ||
                    pub.contenido?.toLowerCase().includes(queryLower)
            );

            setResultados({
                publicaciones: publicacionesFiltradas.slice(0, 15),
            });
            setIsLoading(false);

            if (onBusqueda) {
                onBusqueda(publicacionesFiltradas);
            }
        } else {
            fetch(`/api/buscar?q=${encodeURIComponent(query)}`, {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            })
                .then((res) => res.json())
                .then((data) => {
                    setResultados(data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Error en búsqueda:", error);
                    setResultados({ publicaciones: [], instituciones: [] });
                    setIsLoading(false);
                });
        }
    };

    const guardarEnHistorial = (termino) => {
        if (variant !== "global" || !termino.trim()) return;

        let nuevoHistorial = [
            termino,
            ...historial.filter((h) => h !== termino),
        ];
        nuevoHistorial = nuevoHistorial.slice(0, 5);

        setHistorial(nuevoHistorial);
        localStorage.setItem(
            "historial_busqueda",
            JSON.stringify(nuevoHistorial)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim() && variant === "global") {
            guardarEnHistorial(searchTerm);
            router.visit(`/busqueda?q=${encodeURIComponent(searchTerm)}`);
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    const handleHistorialClick = (termino) => {
        setSearchTerm(termino);
        guardarEnHistorial(termino);
        router.visit(`/busqueda?q=${encodeURIComponent(termino)}`);
        setIsOpen(false);
    };

    const handleResultClick = (resultado, tipo) => {
        if (variant === "global") {
            guardarEnHistorial(searchTerm);
        }

        if (tipo === "publicacion") {
            router.visit(`/publicaciones/${resultado.id}`);
        } else if (tipo === "institucion") {
            router.visit(`/instituciones/${resultado.id}`);
        }
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleVerTodo = () => {
        if (searchTerm.trim()) {
            guardarEnHistorial(searchTerm);
            router.visit(`/busqueda?q=${encodeURIComponent(searchTerm)}`);
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    const limpiarHistorial = () => {
        setHistorial([]);
        localStorage.removeItem("historial_busqueda");
    };

    const publicacionesResultado = resultados.publicaciones || [];
    const institucionesResultado = resultados.instituciones || [];
    const hayResultados =
        publicacionesResultado.length > 0 || institucionesResultado.length > 0;

    return (
        <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-2xl"
            ref={searchRef}
        >
            <div className="flex items-center bg-white rounded-full px-4 py-1 shadow-sm">
                <img
                    src="/svg/mapa/search-circle-sharp.svg"
                    alt="Buscar"
                    className="h-7 w-7 text-gray-500 flex-shrink-0"
                />
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={
                        variant === "global"
                            ? "Buscar en EDUQUÉN"
                            : "Ingresá título o contenido"
                    }
                    className="w-full border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
                />
            </div>

            {/* Dropdown de resultados - SOLO para global */}
            {isOpen && variant === "global" && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg max-h-[500px] overflow-hidden z-50">
                    {/* Historial de búsquedas (cuando NO hay búsqueda activa) */}
                    {searchTerm.length === 0 && historial.length > 0 && (
                        <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Búsquedas recientes
                                </span>
                                <button
                                    type="button"
                                    onClick={limpiarHistorial}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Limpiar
                                </button>
                            </div>
                            {historial.map((termino, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() =>
                                        handleHistorialClick(termino)
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-3 group"
                                >
                                    <svg
                                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                        {termino}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Resultados de búsqueda */}
                    {searchTerm.length > 0 && (
                        <>
                            <div className="max-h-[420px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-8 text-center">
                                        <svg
                                            className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Buscando...
                                        </p>
                                    </div>
                                ) : !hayResultados ? (
                                    <div className="p-8 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
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
                                        <p className="text-sm text-gray-600 mt-2">
                                            No se encontraron resultados
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {/* Publicaciones */}
                                        {publicacionesResultado.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 sticky top-0">
                                                    Publicaciones (
                                                    {
                                                        publicacionesResultado.length
                                                    }
                                                    )
                                                </div>
                                                {publicacionesResultado.map(
                                                    (pub) => (
                                                        <button
                                                            key={`pub-${pub.id}`}
                                                            type="button"
                                                            onClick={() =>
                                                                handleResultClick(
                                                                    pub,
                                                                    "publicacion"
                                                                )
                                                            }
                                                            className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded transition-colors border-b border-gray-100 last:border-0"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <svg
                                                                        className="w-5 h-5 text-blue-600"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                                                                        {pub.titulo ||
                                                                            "Sin título"}
                                                                    </div>
                                                                    {pub.contenido && (
                                                                        <div className="text-xs text-gray-600 line-clamp-2">
                                                                            {
                                                                                pub.contenido
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Instituciones */}
                                        {institucionesResultado.map((inst) => (
                                            <button
                                                key={`inst-${inst.id}`}
                                                type="button"
                                                onClick={() =>
                                                    handleResultClick(
                                                        inst,
                                                        "institucion"
                                                    )
                                                }
                                                className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded transition-colors border-b border-gray-100 last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {inst.foto_perfil ? (
                                                        <img
                                                            src={
                                                                inst.foto_perfil
                                                            }
                                                            alt={inst.nombre}
                                                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <svg
                                                                className="w-5 h-5 text-blue-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                            {inst.nombre}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Botón Ver todos los resultados */}
                            {hayResultados && !isLoading && (
                                <div className="border-t border-gray-200 p-3 bg-gray-50">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-edu-dark hover:bg-black rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>Ver todos los resultados</span>
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </form>
    );
}
