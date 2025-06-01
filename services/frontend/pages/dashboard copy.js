import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [email, setEmail] = useState(null);
  const [guion, setGuion] = useState("");
  const [editando, setEditando] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [editingScriptId, setEditingScriptId] = useState(null);
  const [title, setTitle] = useState("");
  const [expandedGuiones, setExpandedGuiones] = useState({});
  const [filtroEstilo, setFiltroEstilo] = useState("todos");
  const estilosDisponibles = [...new Set(scripts.map(s => s.estilo).filter(Boolean))];


  useEffect(() => {
    // Solo corre en el cliente
    const storedEmail = localStorage.getItem("userEmail");
    const guionGuardado = localStorage.getItem("lastGuionGenerado");

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (guionGuardado) {
      setGuion(guionGuardado);
    }
  }, []);

  useEffect(() => {
    const storedScripts = localStorage.getItem("userScripts");
    if (storedScripts) {
      try {
        const parsed = JSON.parse(storedScripts);
        setScripts(parsed);
      } catch (err) {
        console.error("Error parseando guiones desde localStorage:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:5000/api/guiones/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.scripts) setScripts(data.scripts);
        localStorage.setItem("userScripts", JSON.stringify(data.scripts));
      })
      .catch(err => console.error("Error al cargar guiones:", err));
  }, [email]);

  const handleGuardar = async () => {
    try {
      const finalTitle = title || prompt("Título del guion:");
      if (!finalTitle) return;
  
      const payload = {
        email,
        title: finalTitle,
        content: guion,
      };
  
      const url = editingScriptId
        ? `http://localhost:5000/api/guiones/${editingScriptId}`
        : "http://localhost:5000/api/guiones";
  
      const method = editingScriptId ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      alert(data.message || "Guion guardado.");
  
      // Limpiar estados
      setEditingScriptId(null);
      setEditando(false);
      setTitle("");
  
      // Refrescar scripts
      const refresh = await fetch(`http://localhost:5000/api/guiones/${encodeURIComponent(email)}`);
      const refreshedData = await refresh.json();
      setScripts(refreshedData.scripts);
    } catch (error) {
      console.error("Error guardando guion:", error);
    }
  };  
 
  const descargar = (formato) => {
    if (!guion) return;

    if (formato === "txt") {
      const blob = new Blob([guion], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "guion.txt";
      link.click();
    } else if (formato === "pdf") {
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(guion, 180);
      doc.text(lines, 10, 10);
      doc.save("guion.pdf");
    } else if (formato === "doc") {
      const blob = new Blob([guion], { type: "application/msword" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "guion.doc";
      link.click();
    }
  };


  const cargarGuion = (contenido, id, titulo) => {
    setGuion(contenido);
    setEditando(true);
    setEditingScriptId(id);
    setTitle(titulo); // NUEVO estado para el título
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const eliminarGuion = async (id) => {
    const confirmacion = confirm("¿Estás seguro de eliminar este guion?");
    if (!confirmacion) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/guiones/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      alert(data.message || "Guion eliminado.");
  
      // Refrescar lista
      const refresh = await fetch(`http://localhost:5000/api/guiones/${encodeURIComponent(email)}`);
      const refreshedData = await refresh.json();
      setScripts(refreshedData.scripts);
    } catch (error) {
      console.error("Error al eliminar guion:", error);
    }
  };


  const descargarGuion = (contenido, titulo, formato) => {
    if (!contenido) return;
  
    const nombreArchivo = `${titulo || "guion"}.${formato}`;
  
    if (formato === "txt") {
      const blob = new Blob([contenido], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = nombreArchivo;
      link.click();
    } else if (formato === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(contenido, 180);
      doc.text(lines, 10, 10);
      doc.save(nombreArchivo);
    } else if (formato === "doc") {
      const blob = new Blob([contenido], { type: "application/msword" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = nombreArchivo;
      link.click();
    }
  };

  const toggleExpand = (id) => {
    setExpandedGuiones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  const toggleFavorito = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/guiones/${id}/favorite`, {
        method: "PUT",
      });
  
      const data = await res.json();
      if (data.isFavorite !== undefined) {
        // ✅ Actualiza el estado local inmediatamente
        const updatedScripts = scripts.map((s) =>
          s.id === id ? { ...s, isFavorite: data.isFavorite } : s
        );
        setScripts(updatedScripts);
  
        // ✅ Guarda en localStorage también
        localStorage.setItem("userScripts", JSON.stringify(updatedScripts));
      }
  
      alert(data.message || "Actualizado");
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
    }
  };
  
  const scriptsFiltrados = filtroEstilo === "todos"
  ? scripts
  : scripts.filter(s => s.estilo === filtroEstilo);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Guion Generado</h1>

        {editando ? (
          <textarea
            className="w-full h-80 border p-2 mb-4"
            value={guion}
            onChange={(e) => setGuion(e.target.value)}
          />
        ) : (
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 mb-4 rounded">{guion}</pre>
        )}

        <div className="space-x-4">
          <button
            onClick={() => setEditando(!editando)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            {editando ? "Dejar de Editar" : "Editar Guion"}
          </button>

          <button
            onClick={handleGuardar}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Guardar en mi cuenta
          </button>

          <button
            onClick={() => descargar("txt")}
            className="bg-blue-500 text-white px-3 py-2 rounded"
          >
            Descargar TXT
          </button>

          <button
            onClick={() => descargar("pdf")}
            className="bg-purple-600 text-white px-3 py-2 rounded"
          >
            Descargar PDF
          </button>

          <button
            onClick={() => descargar("doc")}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            Descargar DOC
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="mr-2 font-semibold">Filtrar por tipo:</label>
        <pre>{JSON.stringify(estilosDisponibles)}</pre>
        <select
          value={filtroEstilo}
          onChange={(e) => setFiltroEstilo(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="todos">Todos</option>
          {estilosDisponibles.map((estilo) => (
            <option key={estilo} value={estilo}>{estilo.charAt(0).toUpperCase() + estilo.slice(1)}</option>
          ))}
        </select>
      </div>

      {scriptsFiltrados.length === 0 ? (
        <p>No hay guiones de este tipo.</p>
      ) : (
        <ul className="space-y-4">
          {scriptsFiltrados.map((s) => (
            <li key={s.id} className="border p-4 rounded">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-gray-500">Tipo: {s.estilo}</p>
              <pre className="whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded">
                {s.content.length > 500 ? s.content.slice(0, 500) + "..." : s.content}
              </pre>
              {/* Botones aquí */}
            </li>
          ))}
        </ul>
      )}



      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Mis Guiones Guardados</h2>
        {scripts.length === 0 ? (
          <p>No tienes guiones guardados.</p>
        ) : (
        <ul className="space-y-4">
          {scripts.map((s) => (
            <li key={s.id} className="border p-4 rounded">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-gray-500">
                Creado: {new Date(s.createdAt).toLocaleString()}
              </p>
              <pre className="whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded max-h-48 overflow-hidden relative">
                {expandedGuiones[s.id] ? s.content : s.content.slice(0, 500) + (s.content.length > 500 ? "..." : "")}
              </pre>

              { s.content.length > 500 && (
                <button
                  onClick={() => toggleExpand(s.id)}
                  className="text-blue-600 text-sm mt-1"
                >
                  {expandedGuiones[s.id] ? "Ver menos ▲" : "Ver más ▼"}
                </button>
              )}

              <button
                onClick={() => cargarGuion(s.content, s.id, s.title)}
                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Cargar para editar
              </button>
              <button
                onClick={() => eliminarGuion(s.id)}
                className="mt-2 ml-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Eliminar
              </button>

              <button
                onClick={() => descargarGuion(s.content, s.title, "txt")}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Descargar TXT
              </button>

              <button
                onClick={() => descargarGuion(s.content, s.title, "pdf")}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              >
                Descargar PDF
              </button>

              <button
                onClick={() => descargarGuion(s.content, s.title, "doc")}
                className="bg-black text-white px-3 py-1 rounded hover:bg-black/80"
              >
                Descargar DOC
              </button>

              <button
                onClick={() => toggleFavorito(s.id)}
                className={`bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500`}
              >
                {s.isFavorite ? "★ Quitar de favoritos" : "☆ Marcar como favorito"}
              </button>

            </li>
          ))}
        </ul>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-4">⭐ Mis Favoritos</h2>
        {scripts.filter(s => s.isFavorite).length === 0 ? (
          <p>No tienes guiones marcados como favoritos.</p>
        ) : (
          <ul className="space-y-4">
            {scripts.filter(s => s.isFavorite).map((s) => (
              <li key={s.id} className="border p-4 rounded">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-500">
                  Creado: {new Date(s.createdAt).toLocaleString()}
                </p>
                <pre className="whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded">
                  {s.content.slice(0, 300)}...
                </pre>
                <button
                  onClick={() => cargarGuion(s.content, s.id, s.title)}
                  className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  Cargar para editar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
