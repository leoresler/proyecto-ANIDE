import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import toast from "react-hot-toast";

export function useFlash() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }

        if (flash?.info) {
            toast(flash.info, {
                icon: "ℹ️",
            });
        }

        if (flash?.warning) {
            toast(flash.warning, {
                icon: "⚠️",
                style: {
                    background: "#f59e0b",
                    color: "#fff",
                },
            });
        }
    }, [flash]);
}
