import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";

export function useInfiniteScroll({ nextPageUrl, onLoadMore }) {
    const [isLoading, setIsLoading] = useState(false);
    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && nextPageUrl && !isLoading) {
                    setIsLoading(true);

                    router.visit(nextPageUrl, {
                        preserveScroll: true,
                        preserveState: true,
                        only: ["publicaciones", "favoritos", "instituciones"],
                        onSuccess: () => {
                            setIsLoading(false);
                            if (onLoadMore) onLoadMore();
                        },
                        onError: () => {
                            setIsLoading(false);
                        },
                    });
                }
            },
            {
                root: null,
                rootMargin: "100px",
                threshold: 0.1,
            }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [nextPageUrl, isLoading]);

    return { loaderRef, isLoading };
}
