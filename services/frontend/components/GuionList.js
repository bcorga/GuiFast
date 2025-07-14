export default function GuionList({
  scripts,
  soloFavoritos = false,
  descargar,
  setGuion,
  setTitle,
  setEditando,
  setEditingScriptId,
  setView,
  onDelete,
  renderContent,
  toggleFavorite,
  setHistorial,
}) {
if (!scripts || !Array.isArray(scripts)) return <p className="text-gray-500">No hay guiones.</p>;

const filtrados = soloFavoritos ? scripts.filter(s => s.isFavorite) : scripts;

if (filtrados.length === 0) return <p className="text-gray-500">No hay guiones.</p>;


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filtrados.map((s) => (
        <div key={s.id} className="bg-white border rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-2">{s.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{s.estilo || "general"}</p>

          {renderContent ? (
            <div className="mb-3">{renderContent(s.content)}</div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-2 rounded h-32 overflow-auto mb-3">
              {s.content}
            </pre>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setGuion(s.content);
                setTitle(s.title);
                setEditando(true);
                setEditingScriptId(s.id);
                setView("nuevo");
              }}
              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
            >
              Editar
            </button>
            <button
              onClick={() => toggleFavorite(s.id)}
              className={`px-3 py-1 text-sm rounded ${s.isFavorite ? 'bg-yellow-400 text-black' : 'bg-yellow-100 text-yellow-800'}`}
            >
              {s.isFavorite ? '★ Favorito' : '☆ Añadir a Favoritos'}
            </button>
            <button onClick={() => descargar(s.content, "pdf")} className="px-3 py-1 text-sm bg-purple-600 text-white rounded">PDF</button>
            <button onClick={() => descargar(s.content, "txt")} className="px-3 py-1 text-sm bg-gray-600 text-white rounded">TXT</button>
            <button onClick={() => descargar(s.content, "doc")} className="px-3 py-1 text-sm bg-black text-white rounded">DOC</button>
            {onDelete && (
              <button
                onClick={() => onDelete(s.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded"
              >
                Eliminar
              </button>
            )}
            <button
              onClick={async () => {
                const res = await fetch(`http://localhost:5000/api/scripts/${s.id}/versions`);
                const data = await res.json();
                setHistorial(data.versions || []);
                setView("historial");
              }}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded"
            >
              Ver Historial
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
