

const Recomendaciones = ({ recomendaciones = [] }) => {
    return (
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 w-full">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">
                Te puede interesar
            </h2>

            <div className="space-y-4">
                {recomendaciones.length > 0 ? (
                    recomendaciones.map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                            <img
                                src={item.imagen}
                                alt={item.titulo}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-800 leading-tight">
                                    {item.titulo}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    {item.descripcion}
                                </p>
                            </div>
                        </a>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center">
                        No hay recomendaciones disponibles.
                    </p>
                )}
            </div>
        </aside>
    );
};

export default Recomendaciones;
