import { useForm, usePage } from "@inertiajs/react";
import { useRef } from "react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function CompletarDatosUser() {
    const { props } = usePage();
    const { type, auth } = props; // persona o institucion, y datos del usuario actual

    const allOptions = ['Tecnología', 'Derecho', 'Medicina', 'Arte', 'Deportes'];

    // Referencia para input de foto
    const photoInput = useRef();

    // Formulario con Inertia
    const { data, setData, post, processing, errors } = useForm({
        profile_photo_path: null, // foto de perfil
        // persona
        nombre: auth.user.nombre || '',
        apellido: '', 
        telefono: auth.user.telefono || '',
        ciudad: auth.user.ciudad || '',
        provincia: auth.user.provincia || '',
        interests: auth.user.interests || [],

        // institucion
        tipo_institucion: '',
        direccion: '',
        url_sitio_web: '',
        ano_fundacion: '',
    });

    const toggleInterest = (interest) => {
        if (data.interests.includes(interest)) {
            setData('interests', data.interests.filter(i => i !== interest));
        } else {
            setData('interests', [...data.interests, interest]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('completar.datos.store'), { // ruta de backend
            preserveScroll: true,
            forceFormData: true, // importante para enviar archivo
            onSuccess: () => {
                if (photoInput.current) photoInput.current.value = null;
            }
        });
    };

    return (
        <GuestLayout>

        <div className="bg-white text-black p-6 max-w-lg mx-auto">
            {type === "institucion" ? (
                 <div>
                        <h2 className="text-xl font-bold mb-4">Completar datos institución</h2>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Foto de perfil */}
                            <div>
                                <p className="font-medium mb-2">Logo o foto de perfil:</p>
                                <input
                                    ref={photoInput}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('profile_photo_path', e.target.files[0])}
                                    className="block w-full text-sm text-gray-600"
                                />
                                {errors.profile_photo_path && <p className="text-red-600">{errors.profile_photo_path}</p>}
                            </div>

                            {/* Nombre y tipo de institución */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block font-medium">Nombre</label>
                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    />
                                    {errors.nombre && <p className="text-red-600">{errors.nombre}</p>}
                                </div>
                                <div className="flex-1">
                                    <label className="block font-medium">Tipo de institución</label>
                                    <input
                                        type="text"
                                        value={data.tipo_institucion}
                                        onChange={(e) => setData('tipo_institucion', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    />
                                    {errors.tipo_institucion && <p className="text-red-600">{errors.tipo_institucion}</p>}
                                </div>
                            </div>

                            {/* Dirección */}
                            <div>
                                <label className="block font-medium">Dirección</label>
                                <input
                                    type="text"
                                    value={data.direccion}
                                    onChange={(e) => setData('direccion', e.target.value)}
                                    className="w-full border px-2 py-1 rounded"
                                />
                                {errors.direccion && <p className="text-red-600">{errors.direccion}</p>}
                            </div>

                            {/* Sitio web y año de fundación */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block font-medium">URL del sitio web</label>
                                    <input
                                        type="url"
                                        value={data.url_sitio_web}
                                        onChange={(e) => setData('url_sitio_web', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    />
                                    {errors.url_sitio_web && <p className="text-red-600">{errors.url_sitio_web}</p>}
                                </div>
                                <div className="flex-1">
                                    <label className="block font-medium">Año de fundación</label>
                                    <input
                                        type="number"
                                        value={data.ano_fundacion}
                                        onChange={(e) => setData('ano_fundacion', e.target.value)}
                                        className="w-full border px-2 py-1 rounded"
                                    />
                                    {errors.ano_fundacion && <p className="text-red-600">{errors.ano_fundacion}</p>}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
            ) : (
                <div>
                    <h2 className="text-xl font-bold mb-4">Completar datos persona</h2>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Foto de perfil */}
                        <div>
                            <p className="font-medium mb-2">Foto de perfil:</p>
                            <input
                                ref={photoInput}
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('profile_photo_path', e.target.files[0])}
                                className="block w-full text-sm text-gray-600"
                            />
                            {errors.profile_photo_path && <p className="text-red-600">{errors.profile_photo_path}</p>}
                        </div>

                        {/* Nombre y apellido */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block font-medium">Nombre</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className="w-full border px-2 py-1 rounded"
                                />
                                {errors.nombre && <p className="text-red-600">{errors.nombre}</p>}
                            </div>
                            <div className="flex-1">
                                <label className="block font-medium">Apellido</label>
                                <input
                                    type="text"
                                    value={data.apellido}
                                    onChange={(e) => setData('apellido', e.target.value)}
                                    className="w-full border px-2 py-1 rounded"
                                />
                                {errors.apellido && <p className="text-red-600">{errors.apellido}</p>}
                            </div>
                        </div>

                        {/* Teléfono, Ciudad, Provincia */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block font-medium">Teléfono</label>
                                <input
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    className="w-full border px-2 py-1 rounded"
                                />
                                {errors.telefono && <p className="text-red-600">{errors.telefono}</p>}
                            </div>
                            <div className="flex-1">
                                <label className="block font-medium">Ciudad</label>
                                <input
                                    type="text"
                                    value={data.ciudad}
                                    onChange={(e) => setData('ciudad', e.target.value)}
                                    className="w-full border px-2 py-1 rounded"
                                />
                                {errors.ciudad && <p className="text-red-600">{errors.ciudad}</p>}
                            </div>
                            <div className="flex-1">
                                <label className="block font-medium">Provincia</label>
                                <input
                                    type="text"
                                    value={data.provincia}
                                    onChange={(e) => setData('provincia', e.target.value)}
                                    className="w-full border px-2 py-1 rounded"
                                />
                                {errors.provincia && <p className="text-red-600">{errors.provincia}</p>}
                            </div>
                        </div>

                        {/* Intereses */}
                        <div>
                            <p className="font-medium mb-2">Seleccioná tus intereses:</p>
                            <div className="flex flex-wrap gap-2">
                                {allOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => toggleInterest(option)}
                                        className={`px-3 py-1 rounded-full border ${
                                            data.interests.includes(option)
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-black border-gray-300'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            {errors.interests && <p className="text-red-600 mt-1">{errors.interests}</p>}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
        </GuestLayout>
    );
}
