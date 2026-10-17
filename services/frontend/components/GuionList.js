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
  handleShare,
  handleStopSharing,
  userRole,
  handlePublish,
}) {
if (!scripts || !Array.isArray(scripts)) return <p className="text-gray-500">No hay guiones.</p>;

const filtrados = soloFavoritos ? scripts.filter(s => s.isFavorite) : scripts;

if (filtrados.length === 0) return <p className="text-gray-500">No hay guiones.</p>;


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filtrados.map((s) => (
        <div key={s.id} className="bg-white border rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-2">{s.title}</h3><p className="text-gray-600 text-sm mb-2">{new Date(s.createdAt).toLocaleString()}</p>
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
            <button onClick={() => descargar(s.content, "pdf", s.title)} className="px-3 py-1 text-sm bg-purple-600 text-white rounded">PDF</button>
            <button onClick={() => descargar(s.content, "txt", s.title)} className="px-3 py-1 text-sm bg-gray-600 text-white rounded">TXT</button>
            <button onClick={() => descargar(s.content, "doc", s.title)} className="px-3 py-1 text-sm bg-black text-white rounded">DOC</button>
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
                    const token = localStorage.getItem('jwt');
                if (!token) {
                    showToast("Error: No estás autorizado para ver el historial.", "error");
                    return;
                }
                try {
                    const res = await fetch(`http://localhost:5000/api/scripts/${s.id}/versions`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    
                    if (!res.ok) {
                        throw new Error('Failed to fetch history');
                    }
                      const data = await res.json();
                      setHistorial(data.versions || []);
                      setTitle(s.title);
                      setEditingScriptId(s.id);
                      setView("historial");
                    } catch (error) {
                        console.error("Error fetching history:", error);
                        showToast("Error al cargar el historial del guion.", "error");
                    }
              }}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded"
            >
              Ver Historial
            </button>
            {/* Botón de Compartir */}
            {s.isShared ? (
                // Si ya está compartido, muestra el botón para dejar de compartir
                <button
                    onClick={() => handleStopSharing(s.id)}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Dejar de Compartir
                </button>
            ) : (
                // Si no está compartido, muestra el botón para compartir
                <button
                    onClick={() => handleShare(s.id)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Compartir
                </button>
            )}
                    {userRole === "Premium" && (
                  <button
                      onClick={() => handlePublish(s.id, s.isPublished)}
                      className={`px-3 py-1 text-sm rounded ${s.isPublished ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                  >
                      {s.isPublished ? "Despublicar" : "Publicar en el Muro"}
                  </button>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
