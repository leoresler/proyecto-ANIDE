import { usePage } from "@inertiajs/react";

export default function CompletarDatosUser() {
    const { props } = usePage();
    const { type } = props; // persona o institucion

    return (
        <div className="bg-white text-black p-6">
            {type === "institucion" ? (
                <div>
                    <h2 className="text-xl font-bold">completar datos institucion</h2>
                    
                </div>
            ) : (
                <div>
                    <h2 className="text-xl font-bold">completar datos persona</h2>
                    
                </div>
            )}
        </div>
    );
}
