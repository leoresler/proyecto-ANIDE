import { useState, useEffect } from "react";
import { X, Calendar, MapPin } from "lucide-react";
import axios from "axios";

export default function PersonaProfileModal({
    personaId,
    trigger,
    isMobile = false,
}) {
    const [showModal, setShowModal] = useState(false);
    const [persona, setPersona] = useState(null);
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [showFullBio, setShowFullBio] = useState(false);
    const [isHoveringTrigger, setIsHoveringTrigger] = useState(false);
    const [isHoveringModal, setIsHoveringModal] = useState(false);

    useEffect(() => {
        if (showModal && !persona && personaId) {
            fetchPersonaData();
        }
    }, [showModal, personaId]);

    // Controlar la visibilidad del modal basado en hover
    useEffect(() => {
        if (isMobile) return;
        
        if (isHoveringTrigger || isHoveringModal) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    }, [isHoveringTrigger, isHoveringModal, isMobile]);

    const fetchPersonaData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/personas/${personaId}`);
            setPersona(response.data);
        } catch (error) {
            console.error("Error al cargar datos de la persona:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMouseEnter = (e) => {
        if (isMobile) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Calcular posición del modal
        let top = rect.bottom + 10;
        let left = rect.left;

        // Si no hay espacio abajo, mostrar arriba
        if (spaceBelow < 300 && spaceAbove > spaceBelow) {
            top = rect.top - 310;
        }

        // Ajustar si se sale por la derecha
        if (left + 320 > window.innerWidth) {
            left = window.innerWidth - 330;
        }

        setPosition({ top, left });
        setIsHoveringTrigger(true);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        setIsHoveringTrigger(false);
    };

    const handleClick = (e) => {
        if (isMobile) {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
        }
    };

    const handleClose = () => {
        setShowModal(false);
    };

    const truncateText = (text, limit = 120) => {
        if (!text) return "";
        if (text.length <= limit) return text;
        return text.substring(0, limit) + "...";
    };

    const calculateAge = (fechaNac) => {
        if (!fechaNac) return null;
        const today = new Date();
        const birthDate = new Date(fechaNac);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return age;
    };

    // Clonar el trigger y añadir eventos
    const triggerWithEvents = trigger ? (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className="inline-block"
        >
            {trigger}
        </div>
    ) : null;

    if (!trigger) return null;

    return (
        <>
            {triggerWithEvents}

            {showModal && (
                <>
                    {/* Overlay para mobile */}
                    {isMobile && (
                        <div
                            className="fixed inset-0 bg-black/50 z-50 md:hidden"
                            onClick={handleClose}
                        />
                    )}

                    {/* Modal */}
                    <div
                        className={`
                            ${
                                isMobile
                                    ? "fixed inset-x-0 bottom-16 rounded-t-3xl md:hidden"
                                    : "fixed hidden md:block"
                            }
                            bg-white dark:bg-gray-800 shadow-2xl z-50 
                            ${isMobile ? "max-h-[80vh]" : "w-80 rounded-2xl max-h-[500px]"}
                            overflow-hidden
                        `}
                        style={
                            !isMobile
                                ? {
                                      top: `${position.top}px`,
                                      left: `${position.left}px`,
                                  }
                                : {}
                        }
                        onMouseEnter={() => !isMobile && setIsHoveringModal(true)}
                        onMouseLeave={() => !isMobile && setIsHoveringModal(false)}
                    >
                        {/* Header mobile */}
                        {isMobile && (
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                    Perfil
                                </h3>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                                >
                                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        )}

                        <div
                            className={`overflow-y-auto ${
                                isMobile
                                    ? "px-4 pb-4 max-h-[calc(80vh-60px)] mx-auto"
                                    : "p-5 max-h-[500px]"
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edu-dark"></div>
                                </div>
                            ) : persona ? (
                                <div className="space-y-4">
                                    {/* Foto y nombre */}
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={
                                                persona.user
                                                    ?.profile_photo_url ||
                                                "/images/default-avatar.webp"
                                            }
                                            alt={`${persona.user?.nombre} ${persona.apellido}`}
                                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 mb-3"
                                        />
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center">
                                            {persona.user?.nombre}{" "}
                                            {persona.apellido}
                                        </h3>
                                    </div>

                                    {/* Información */}
                                    <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                                        {/* Edad */}
                                        {persona.fecha_nac && (
                                            <div className="flex items-start space-x-3">
                                                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Edad
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {calculateAge(
                                                            persona.fecha_nac
                                                        )}{" "}
                                                        años
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ubicación */}
                                        {(persona.user?.ciudad ||
                                            persona.user?.provincia) && (
                                            <div className="flex items-start space-x-3">
                                                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Ubicación
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {persona.user?.ciudad}
                                                        {persona.user?.ciudad &&
                                                            persona.user
                                                                ?.provincia &&
                                                            ", "}
                                                        {
                                                            persona.user
                                                                ?.provincia
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {persona.biografia && (
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Biografía
                                                </p>

                                                <div className={`${showFullBio ? 'max-h-48 overflow-y-auto pr-2' : ''}`}>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {showFullBio
                                                            ? persona.biografia
                                                            : truncateText(
                                                                  persona.biografia,
                                                                  140
                                                              )}
                                                    </p>
                                                </div>

                                                {persona.biografia.length >
                                                    140 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowFullBio(
                                                                !showFullBio
                                                            );
                                                        }}
                                                        className="mt-2 text-edu-dark dark:text-gray-300 font-medium text-sm underline"
                                                    >
                                                        {showFullBio
                                                            ? "Ver menos"
                                                            : "Ver más"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No se pudo cargar la información
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}