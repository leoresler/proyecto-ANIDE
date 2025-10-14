import { useState, useEffect } from "react";

export default function BarraBusqueda() {
  const [query, setQuery] = useState("");
  const [historial, setHistorial] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // 📌 Cargar historial desde localStorage al iniciar
  useEffect(() => {
    const guardadas = JSON.parse(localStorage.getItem("historialBusquedas")) || [];
    setHistorial(guardadas);
  }, []);

  // 📌 Guardar historial en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("historialBusquedas", JSON.stringify(historial));
  }, [historial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Agregar búsqueda al inicio y limitar a 4
    const nuevasBusquedas = [query, ...historial.filter((item) => item !== query)].slice(0, 4);
    setHistorial(nuevasBusquedas);

    // 🔹 Lógica de búsqueda futura
    console.log("Buscando:", query);

    setQuery(""); // limpiar input
  };

  return (
    <div className="w-full max-w-md relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
          <img
            src="/svg/header/Vector-lupa.svg"
            alt="Buscar"
            className="h-4 w-4 text-gray-500 mr-2"
          />
          <input
            type="search"
            placeholder="Buscar en EDUQUÉN"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)} // pequeño delay para poder clickear historial
            className="w-full border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
          />
        </div>
      </form>

      {/* 📌 Mostrar historial solo si el input está enfocado */}
      {isFocused && historial.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white shadow-md rounded-lg p-2 z-10">
          <p className="text-sm text-gray-500 mb-2">Últimas búsquedas:</p>
          <ul className="space-y-1">
            {historial.map((item, i) => (
              <li
                key={i}
                className="text-gray-700 text-sm cursor-pointer hover:underline"
                onClick={() => setQuery(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

