export default function BarraBusqueda() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="relative w-full max-w-md">
      <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
        <img
          src="/svg/header/Vector-lupa.svg"
          alt="Buscar"
          className="h-4 w-4 text-gray-500 mr-2"
        />
        <input
          type="search"
          placeholder="Buscar en EDUQUÉN"
          className="w-full border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
        />
      </div>
    </form>
  );
}
