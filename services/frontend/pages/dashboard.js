import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import Sidebar from "../components/Sidebar";
import GuionList from "../components/GuionList";
import ScriptEditor from "../components/ScriptEditor";
import ProfileSettings from "../components/ProfileSettings";
import PrintPreview from "../components/PrintPreview";

export default function Dashboard() {
  const email = typeof window !== 'undefined' ? localStorage.getItem("userEmail") : "";

  const [scripts, setScripts] = useState([]);
  const [view, setView] = useState("mis-guiones");
  const [guion, setGuion] = useState("");
  const [title, setTitle] = useState("");
  const [tono, setTono] = useState("neutral");
  const [estilo, setEstilo] = useState("comico");
  const [editando, setEditando] = useState(false);
  const [editingScriptId, setEditingScriptId] = useState(null);
  const [user, setUser] = useState({ username: "", avatar: "" });
  const [historial, setHistorial] = useState([]);
  const [showPDF, setShowPDF] = useState(false);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);

  const showToast = (msg, type = "success") => {
    const colors = { success: "bg-green-600", error: "bg-red-600", info: "bg-blue-600", warning: "bg-yellow-600" };
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded shadow z-50`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:5000/api/scripts/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => setScripts(data.scripts || []))
      .catch(console.error);

    const storedName = localStorage.getItem("username") || "Usuario";
    const storedAvatar = localStorage.getItem("avatar") || `https://ui-avatars.com/api/?name=${storedName}`;
    setUser({ username: storedName, avatar: storedAvatar });
  }, [email]);

  const toggleFavorite = async (id) => {
    if (!email) return;
    try {
      await fetch(`http://localhost:5000/api/scripts/${id}/favorite`, { method: "PUT" });
      const res = await fetch(`http://localhost:5000/api/scripts/${encodeURIComponent(email)}`);
      const data = await res.json();
      setScripts(data.scripts || []);
      showToast("Favorito actualizado", "info");
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar favorito", "error");
    }
  };

  const handleGenerar = async () => {
    try {
      const resp = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: guion, tone: tono, estilo })
      });
      const json = await resp.json();
      setGuion(json.generated_text);
    } catch {
      showToast("Error generando guion", "error");
    }
  };

 /* const handleGuardar = async () => {
    if (!title || !guion) return showToast("Título y contenido son requeridos", "warning");
    const url = editingScriptId ?
      `http://localhost:5000/api/scripts/${editingScriptId}` :
      `http://localhost:5000/api/scripts`;
    const method = editingScriptId ? "PUT" : "POST";
    const payload = { email, title, content: guion, estilo };
    try {
      const resp = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const json = await resp.json();
      showToast(json.message, "success");
      setEditando(false); setEditingScriptId(null); setTitle(""); setGuion("");
      const r2 = await fetch(`http://localhost:5000/api/scripts/${encodeURIComponent(email)}`);
      const d2 = await r2.json(); setScripts(d2.scripts || []);
    } catch {
      showToast("Error guardando guion", "error");
    }
  };*/

  const handleGuardar = async () => {
    if (!title || !guion) return showToast("Título y contenido son requeridos.", "warning");

    const payload = { email, title, content: guion };
    const url = editingScriptId
      ? `http://localhost:5000/api/scripts/${editingScriptId}`
      : "http://localhost:5000/api/scripts";

    const method = editingScriptId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    alert(data.message || "Guion guardado.");

    // Cargar historial si es edición
    if (editingScriptId) {
      const versionRes = await fetch(`http://localhost:5000/api/scripts/${editingScriptId}/versions`);
      const versionData = await versionRes.json();
      setHistorial(versionData.versions || []);
    }

    setEditando(false);
    setEditingScriptId(null);
    setTitle("");
    setGuion("");

    const refresh = await fetch(`http://localhost:5000/api/scripts/${encodeURIComponent(email)}`);
    const refreshedData = await refresh.json();
    setScripts(refreshedData.scripts);
  }; 

  const descargar = (contenido, formato) => {
    if (!contenido) return;
    const nombre = `${title || 'guion'}.${formato}`;
    if (formato === 'txt') {
      const blob = new Blob([contenido], { type: 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; a.click();
    } else if (formato === 'pdf') {
      const doc = new jsPDF(); doc.text(doc.splitTextToSize(contenido, 180), 10, 10); doc.save(nombre);
    } else if (formato === 'doc') {
      const blob = new Blob([contenido], { type: 'application/msword' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; a.click();
    }
  };

  return (
    <div className="flex">
      <Sidebar user={user} setView={setView} view={view} showProfileLink />
      <main className="flex-1 p-8 bg-gray-100 min-h-screen">
        {view === "historial" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Historial de versiones</h1>
            <ul className="space-y-4">
              {historial.map((version, index) => (
                <li key={version.id} className="p-4 border bg-white rounded shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        setGuion(version.content);
                        setView("nuevo");
                        showToast("Versión restaurada", "info");
                      }}
                    >
                      Restaurar esta versión
                    </button>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded">
                    {version.content}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        )}

        {view === 'mis-guiones' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Mis Guiones</h1>
            <GuionList
              scripts={scripts}
              soloFavoritos={false}
              toggleFavorite={toggleFavorite}
              descargar={descargar}
              setGuion={setGuion}
              setTitle={setTitle}
              setEditando={setEditando}
              setEditingScriptId={setEditingScriptId}
              setView={setView}
              setHistorial={setHistorial}
              onDelete={async (id) => {
                if (window.confirm("¿Seguro?")) {
                  await fetch(`http://localhost:5000/api/scripts/${id}`, { method: 'DELETE' });
                  const r3 = await fetch(`http://localhost:5000/api/scripts/${encodeURIComponent(email)}`);
                  const d3 = await r3.json(); setScripts(d3.scripts || []);
                  showToast("Guion eliminado", "info");
                }
              }}
              renderContent={(content) => <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{content}</pre>}
            />
          </>
        )}
        {view === 'favoritos' && (
          <>
            <h1 className="text-2xl font-bold mb-4">⭐ Mis Favoritos</h1>
            <GuionList
              scripts={scripts}
              soloFavoritos={true}
              toggleFavorite={toggleFavorite}
              descargar={descargar}
              setGuion={setGuion}
              setTitle={setTitle}
              setEditando={setEditando}
              setEditingScriptId={setEditingScriptId}
              setView={setView}
              setHistorial={setHistorial}
              onDelete={async (id) => {
                if (window.confirm("¿Seguro?")) {
                  await fetch(`http://localhost:5000/api/scripts/${id}`, { method: 'DELETE' });
                  const r4 = await fetch(`http://localhost:5000/api/scripts/${encodeURIComponent(email)}`);
                  const d4 = await r4.json(); setScripts(d4.scripts || []);
                  showToast("Guion eliminado", "info");
                }
              }}
              renderContent={(content) => <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{content}</pre>}
            />
          </>
        )}
        {view === 'nuevo' && (
          <>
            <h1 className="text-2xl font-bold mb-4">{editando ? `Editar: ${title}` : "Nuevo Guion"}</h1>
            <div className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto">
              <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border mb-4 rounded" />
              <textarea value={guion} onChange={e => setGuion(e.target.value)} rows={8} className="w-full p-2 border mb-4 rounded" />
              <label>Tono:</label>
              <select value={tono} onChange={e => setTono(e.target.value)} className="p-2 border mb-4 rounded w-full">
                <option value="neutral">Neutral</option><option value="formal">Formal</option><option value="informal">Informal</option>
              </select>
              <label>Estilo:</label>
              <select value={estilo} onChange={e => setEstilo(e.target.value)} className="p-2 border mb-4 rounded w-full">
                <option value="comico">Cómico</option><option value="narrativo">Narrativo</option><option value="publicitario">Publicitario</option><option value="educativo">Educativo</option><option value="general">General</option>
              </select>
              <div className="flex gap-3">
                <button onClick={handleGenerar} className="bg-blue-600 text-white px-4 py-2 rounded">Generar</button>
                <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded">Guardar</button>
                <button onClick={() => setMostrarVistaPrevia(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">Vista Previa PDF</button>
              </div>
            </div>
          </>
        )}
        {view === 'perfil' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
            <ProfileSettings user={user} setUser={setUser} />
          </>
        )}
        {mostrarVistaPrevia && (
            <PrintPreview
              content={guion}
              title={title}
              onClose={() => setMostrarVistaPrevia(false)}
            />
          )}
      </main>
    </div>
  );
}