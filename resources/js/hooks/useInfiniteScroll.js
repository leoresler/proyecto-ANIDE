import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";

export function useInfiniteScroll({ nextPageUrl, onLoadMore }) {
    const [isLoading, setIsLoading] = useState(false);
    const loaderRef = useRef(null);
    const isLoadingRef = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (
                    target.isIntersecting &&
                    nextPageUrl &&
                    !isLoadingRef.current
                ) {
                    isLoadingRef.current = true;
                    setIsLoading(true);

                    router.visit(nextPageUrl, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            isLoadingRef.current = false;
                            setIsLoading(false);
                            if (onLoadMore) onLoadMore();
                        },
                        onError: () => {
                            isLoadingRef.current = false;
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
    }, [nextPageUrl, onLoadMore]);

    return { loaderRef, isLoading };
}
