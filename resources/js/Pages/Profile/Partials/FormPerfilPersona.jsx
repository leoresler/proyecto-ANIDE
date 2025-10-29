import ActualizarIntereses from './ActualizarIntereses';
import { usePage } from '@inertiajs/react';

export default function FormPerfilPersona({ user, currentInterests = [] }) {

    const { persona } = usePage().props; // Esto viene del ProfileController

    console.log('FormPerfilPersona recibe intereses: ', persona?.interests || []);

    return (
        <div className="space-y-10">
            <div className="p-6 bg-white shadow rounded-lg">
                <ActualizarIntereses
                    className="max-w-xl"
                    currentInterests={persona?.interests || []}
                />
            </div>
        </div>
    );
}
