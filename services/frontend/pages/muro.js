// pages/muro.js
import { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import Link from 'next/link';

export default function MuroDeGuiones() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 📌 NUEVOS ESTADOS para los filtros
  const [busqueda, setBusqueda] = useState(''); // Para el input de búsqueda por título
  const [filtroEstilo, setFiltroEstilo] = useState('todos'); // Para el filtro por estilo

  // 📌 Obtener la lista única de estilos para el dropdown de filtro
  const estilosUnicos = useMemo(() => {
    const estilos = scripts.map(s => s.estilo).filter(Boolean);
    return ['todos', ...new Set(estilos)];
  }, [scripts]);

  useEffect(() => {
    const fetchPublishedScripts = async () => {
      try {
        const response = await fetch("https://thriving-love-production-4611.up.railway.app/api/public/scripts/published");
        const data = await response.json();
        if (!response.ok) {
          // Asumiendo que el backend devuelve un objeto con un campo 'error' si algo sale mal
          throw new Error(data.error || 'Error al obtener los guiones.');
        }
        // Asumiendo que el backend devuelve los guiones dentro de 'scripts'
        setScripts(data.scripts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPublishedScripts();
  }, []);

  // 📌 Lógica de filtrado y búsqueda
  const scriptsFiltrados = useMemo(() => {
    return (scripts || [])
      .filter(s => {
        // Asumo que 's.title' y 's.estilo' existen. Añadimos comprobaciones por si acaso.
        const title = s.title || '';
        const estilo = s.estilo || '';
        
        // 1. Coincidencia de búsqueda por título
        const coincideBusqueda = 
          title.toLowerCase().includes(busqueda.toLowerCase());
          // NOTA: No incluí la búsqueda en 'content' como en tu ejemplo 
          // porque el listado aquí solo muestra 'title' y 'extracto'.
          // Si quieres incluir 'extracto' añade: 
          // || (s.extracto || '').toLowerCase().includes(busqueda.toLowerCase());

        // 2. Coincidencia de estilo
        const coincideEstilo = 
          filtroEstilo === "todos" || estilo === filtroEstilo;

        return coincideBusqueda && coincideEstilo;
      });
  }, [scripts, busqueda, filtroEstilo]);

  if (loading) return <Layout><p className="text-center p-8">Cargando Muro de Guiones...</p></Layout>;
  if (error) return <Layout><p className="text-center p-8 text-red-500">Error: {error}</p></Layout>;

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Muro de Guiones</h1>

        {/* 📌 Controles de Filtro y Búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Input de Búsqueda */}
          <input
            type="text"
            placeholder="Buscar por título..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:w-2/3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Selector de Estilo */}
          <select
            value={filtroEstilo}
            onChange={(e) => setFiltroEstilo(e.target.value)}
            className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {estilosUnicos.map((estilo) => (
              <option key={estilo} value={estilo}>
                {estilo.charAt(0).toUpperCase() + estilo.slice(1)} 
              </option>
            ))}
          </select>
        </div>
        {/* FIN Controles de Filtro y Búsqueda */}

        {scripts.length === 0 && !loading ? (
          <p className="text-gray-500">Aún no hay guiones publicados.</p>
        ) : (
          scriptsFiltrados.length === 0 ? (
            <p className="text-gray-500">No se encontraron guiones que coincidan con los filtros.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scriptsFiltrados.map((script) => ( // 📌 Usamos scriptsFiltrados aquí
                <div key={script.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300 ease-in-out">
                  <h2 className="text-xl font-bold mb-2">{script.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">Autor: {script.autor}</p>
                  {/* Asumo que 'estilo' es un campo existente y lo muestro */}
                  {script.estilo && <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">{script.estilo}</span>}
                  <p className="text-sm text-gray-500 mt-2 mb-4 line-clamp-3">{script.extracto}</p> 
                  <Link href={`/guion/${script.id}`} className="text-blue-600 hover:underline font-medium">
                    Leer guion completo
                  </Link>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Layout>
  );
}
