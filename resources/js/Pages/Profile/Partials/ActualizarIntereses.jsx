import { useEffect } from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';

export default function ActualizarIntereses({ className = '', currentInterests = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        interests: [],
    });

    // Inicializa los intereses con los del usuario logueado
    useEffect(() => {
        setData('interests', currentInterests);
    }, [currentInterests]);

    const handleChange = (e) => {
        const { value, checked } = e.target;
        let updated = [...data.interests];

        if (checked && !updated.includes(value)) {
            updated.push(value);
        } else if (!checked && updated.includes(value)) {
            updated = updated.filter((i) => i !== value);
        }

        setData('interests', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('profile.interests.update'), {
            preserveScroll: true,
        });
    };

    const allOptions = ['Tecnología', 'Derecho', 'Medicina', 'Arte', 'Deportes'];

    return (
        <section className={className}>
            <header className="mt-10">
                <h2 className="text-lg font-medium text-gray-900">Tus intereses</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Selecciona los temas que más te interesan.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="space-y-2">
                    {allOptions.map((option) => (
                        <label key={option} className="flex items-center">
                            <input
                                type="checkbox"
                                value={option}
                                checked={data.interests.includes(option)}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            {option}
                        </label>
                    ))}
                </div>

                <InputError message={errors.interests} className="mt-2" />

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                </div>
            </form>
        </section>
    );
}
