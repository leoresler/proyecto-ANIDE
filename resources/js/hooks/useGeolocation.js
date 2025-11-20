import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [watching, setWatching] = useState(false);
    const [watchId, setWatchId] = useState(null);

    const getCurrentPosition = useCallback(() => {
        if (!navigator.geolocation) {
            const errorMsg =
                "La geolocalización no está disponible en tu navegador";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                };
                setLocation(newLocation);
                setLoading(false);
                toast.success("Ubicación obtenida correctamente");
            },
            (err) => {
                let errorMsg = "Error al obtener tu ubicación";

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMsg = "Debes permitir el acceso a tu ubicación";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMsg = "Tu ubicación no está disponible";
                        break;
                    case err.TIMEOUT:
                        errorMsg = "Tiempo de espera agotado";
                        break;
                }

                setError(errorMsg);
                setLoading(false);
                toast.error(errorMsg);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    const startWatching = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error("La geolocalización no está disponible");
            return;
        }

        if (watching) return;

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                };
                setLocation(newLocation);
                setError(null);
            },
            (err) => {
                console.error("Error en seguimiento:", err);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        setWatchId(id);
        setWatching(true);
        toast.success("Seguimiento de ubicación activado");
    }, [watching]);

    const stopWatching = useCallback(() => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setWatching(false);
            toast.success("Seguimiento de ubicación desactivado");
        }
    }, [watchId]);

    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    return {
        location,
        error,
        loading,
        watching,
        getCurrentPosition,
        startWatching,
        stopWatching,
    };
};
