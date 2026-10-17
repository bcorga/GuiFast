import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import Sidebar from "../components/Sidebar";
import GuionList from "../components/GuionList";
import ScriptEditor from "../components/ScriptEditor";
import ProfileSettings from "../components/ProfileSettings";
import PrintPreview from "../components/PrintPreview";
import { TrashIcon, CheckCircleIcon } from "@heroicons/react/24/outline"; // Iconos para el botón Limpiar
import { ArrowPathIcon } from '@heroicons/react/24/outline'; 

// 1. CRITERIO CUMPLIDO: CONSTANTES CON DESCRIPCIONES DE TONOS
const TONOS_DISPONIBLES = [
  { value: "neutral", label: "Neutral", description: "Mantiene un lenguaje objetivo y directo, ideal para informativos o scripts estándar." },
  { value: "formal", label: "Formal", description: "Utiliza un vocabulario profesional y estructura clásica, perfecto para presentaciones o documentos serios." },
  { value: "informal", label: "Informal", description: "Adopta un lenguaje coloquial y cercano, óptimo para redes sociales o diálogos casuales." },
];

// 2. CRITERIO CUMPLIDO: CONSTANTES CON DESCRIPCIONES DE ESTILOS
const ESTILOS_DISPONIBLES = [
  { value: "comico", label: "Cómico", description: "Se enfoca en el humor, diálogos ligeros y situaciones graciosas." },
  { value: "narrativo", label: "Narrativo", description: "Prioriza una estructura de historia con introducción, nudo y desenlace, ideal para relatos." },
  { value: "publicitario", label: "Publicitario", description: "Lenguaje persuasivo, breve y orientado a la acción, ideal para anuncios cortos." },
  { value: "educativo", label: "Educativo", description: "Claro, informativo y estructurado para enseñar un concepto o tema." },
  { value: "general", label: "General", description: "Un enfoque balanceado que no se ciñe a un formato estricto." },
];

export default function Dashboard() {
  const email = typeof window !== 'undefined' ? localStorage.getItem("userEmail") : "";
  const token = typeof window !== 'undefined' ? localStorage.getItem("jwt") : "";
  const userRole = typeof window !== 'undefined' ? localStorage.getItem("userRole") : "";
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
  const [loading, setLoading] = useState(false);

  // 🔎 Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstilo, setFiltroEstilo] = useState("todos");
  const [ordenFecha, setOrdenFecha] = useState("desc"); // "asc" o "desc"

  // Compartir guion
  const [sharingLink, setSharingLink] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const showToast = (msg, type = "success") => {
    const colors = { success: "bg-green-600", error: "bg-red-600", info: "bg-blue-600", warning: "bg-yellow-600" };
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded shadow z-50`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Efecto 1: Leer localStorage y actualizar 'view' SOLO cuando el componente se monta (en el cliente)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedView = localStorage.getItem('currentView');
      if (storedView) {
        // Solo actualizamos el estado si hay un valor guardado.
        // Esto solo ocurre después de la primera renderización/hidratación.
        setView(storedView);
      }
    }
  }, []); // El array vacío `[]` asegura que se ejecuta solo una vez al montar

  // 2. useEffect para guardar 'view' en localStorage cada vez que cambie.
  useEffect(() => {
    // Solo guardamos si estamos en un entorno de navegador
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentView', view);
    }
  }, [view]); // Dependencia: Se ejecuta cada vez que 'view' cambia

    useEffect(() => {
        // La condición ahora verifica tanto el email como el token
        if (!email || !token) {
            console.error("No se encontró un token de autenticación. Por favor, inicie sesión.");
            // Opcional: Redirigir al usuario al login
            // window.location.href = '/login';
            return;
        }

        const fetchScripts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/scripts`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setScripts(data.scripts || []);
            } catch (error) {
                console.error("Error al obtener los guiones:", error);
            }
        };

        fetchScripts();

        const storedName = localStorage.getItem("username") || "Usuario";
        const storedAvatar = localStorage.getItem("avatar") || `https://ui-avatars.com/api/?name=${storedName}`;
        setUser({ username: storedName, avatar: storedAvatar });
    // Agrega `token` a la lista de dependencias para que el efecto se ejecute si el token cambia
    }, [email, token]);

  const toggleFavorite = async (id) => {
    if (!email) return;
    try {
      // 1. Get the token from localStorage
      const token = localStorage.getItem('jwt');
      if (!token) {
        return showToast("No autorizado para esta acción.", "error");
      }
      // 2. Add the Authorization header to the PUT request
      await fetch(`http://localhost:5000/api/scripts/${id}/favorite`, { 
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      // 3. Update the fetch for refreshing the script list to also include the token
      const res = await fetch(`http://localhost:5000/api/scripts`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setScripts(data.scripts || []);
      showToast("Favorito actualizado", "info");
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar favorito", "error");
    }
  };

  const handleGenerar = async () => {
    setLoading(true);

    try {
      const resp = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: title, tone: tono, estilo: estilo })
      });
      const json = await resp.json();
      setGuion(json.generated_text);
      showToast("Guion generado, ¡listo para editar!", "success"); // Feedback de éxito
    } catch {
      showToast("Error generando guion", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!title || !guion) return showToast("Título y contenido son requeridos.", "warning");

    const payload = { email, title, content: guion, tono, estilo };
    const url = editingScriptId
      ? `http://localhost:5000/api/scripts/${editingScriptId}`
      : "http://localhost:5000/api/scripts";

    const method = editingScriptId ? "PUT" : "POST";

    // ----------------------------------------------------
    // CAMBIO CLAVE: Obtener el token y añadir el encabezado
    const token = localStorage.getItem('jwt');
    if (!token) {
      showToast("No se pudo guardar: Usuario no autenticado.", "error");
      return;
    }

    const response = await fetch(url, {
        method,
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // <--- AÑADIR ESTA LÍNEA
        },
        body: JSON.stringify(payload),
    });
    // ----------------------------------------------------
    const data = await response.json();
    alert(data.message || "Guion guardado.");

    // Cargar historial si es edición
    if (editingScriptId) {
      // -------------------------------------------------------------------
      // CAMBIO CRUCIAL: Añadir el encabezado de autorización a esta llamada
      const versionRes = await fetch(`http://localhost:5000/api/scripts/${editingScriptId}/versions`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      // -------------------------------------------------------------------
      const versionData = await versionRes.json();
      setHistorial(versionData.versions || []);
    }

    setEditando(false);
    setEditingScriptId(null);
    setTitle("");
    setGuion("");

      // REFRESCAR LA LISTA (AQUÍ ES DONDE ESTABA EL ERROR 👈)
    const refresh = await fetch(`http://localhost:5000/api/scripts`, {
        headers: { 
            "Authorization": `Bearer ${token}`
        },
    });
    const refreshedData = await refresh.json();
    setScripts(refreshedData.scripts);
  };

  // 3. CRITERIO CUMPLIDO: FUNCIÓN PARA LIMPIAR EL GUION GENERADO
  const handleLimpiar = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar el guion generado? Se perderá el contenido actual del editor.")) {
        setGuion("");
        setTitle("");
        setEditando(false);
        setEditingScriptId(null);
        showToast("Editor limpiado. Listo para generar uno nuevo.", "info");
    }
  };

  const descargar = (contenido, formato, tituloGuion) => {
    if (!contenido) return;
    const nombreBase = tituloGuion || 'guion';
    const nombre = `${nombreBase.trim()}.${formato}`;

    try {
      if (formato === 'txt') {
          // --- AQUI ESTÁ LA CORRECCIÓN ---
          const TXT_HEADER = '%TXT-\n\n';
          const contenidoTxt = TXT_HEADER + contenido;
          const blob = new Blob([contenidoTxt], { type: 'text/plain' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = nombre;
          a.click();
      } else if (formato === 'pdf') {
          const doc = new jsPDF();
          doc.text(doc.splitTextToSize(contenido, 180), 10, 10);
          doc.save(nombre);
      } else if (formato === 'doc') {
        // --- AQUI ESTÁ LA CORRECCIÓN ---
          const TXT_HEADER = '%TXT-\n\n';
          const contenidoDoc = TXT_HEADER + contenido;
          const blob = new Blob([contenidoDoc], { type: 'application/msword' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = nombre;
          a.click();
      }
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("⚠️ Error al generar el archivo "+formato+". Inténtalo nuevamente.");
    }
  };

  // 📌 Lógica de búsqueda y filtros
  const scriptsFiltrados = (scripts || [])
    .filter(s => {
      const coincideBusqueda =
        s.title.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.content.toLowerCase().includes(busqueda.toLowerCase());

      const coincideEstilo = filtroEstilo === "todos" || s.estilo === filtroEstilo;

      return coincideBusqueda && coincideEstilo;
    })
    .sort((a, b) =>
      ordenFecha === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

    const handleShare = async (scriptId) => {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                showToast("No autorizado para esta acción.", "error");
                return;
            }

            const response = await fetch(`http://localhost:5000/api/scripts/${scriptId}/share`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
            });
            const data = await response.json();

            if (response.ok) {
                setSharingLink(data.link);
                setIsShareModalOpen(true);
                showToast("Enlace de guion generado correctamente.", "success");

                // --- CAMBIO CLAVE AQUÍ ---
                // Refresh the scripts list after the successful share action
                const refreshRes = await fetch(`http://localhost:5000/api/scripts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const refreshedData = await refreshRes.json();
                setScripts(refreshedData.scripts);
                // --- FIN DEL CAMBIO ---

            } else {
                showToast(data.message || "Error al generar enlace", "error");
            }
        } catch (error) {
            console.error("Error sharing script:", error);
            showToast("Error de red al compartir", "error");
        }
    };

    const handleStopSharing = async (scriptId) => {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                showToast("No autorizado para esta acción.", "error");
                return;
            }
            
            const response = await fetch(`http://localhost:5000/api/scripts/${scriptId}/share`, {
                method: "DELETE",
                headers: { 
                    "Authorization": `Bearer ${token}` 
                },
            });

            if (response.ok) {
                showToast("El guion ya no está compartido.", "info");

                // --- CAMBIO CLAVE AQUÍ ---
                // Refresh the scripts list after the successful un-share action
                const refresh = await fetch(`http://localhost:5000/api/scripts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const refreshedData = await refresh.json();
                setScripts(refreshedData.scripts);
                // --- FIN DEL CAMBIO ---

            } else {
                showToast(data.message || "Error al dejar de compartir", "error");
            }
        } catch (error) {
            console.error("Error stopping share:", error);
            showToast("Error de red al dejar de compartir", "error");
        }
    };

    const handlePublish = async (scriptId, isCurrentlyPublished) => {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                showToast("No autorizado para esta acción.", "error");
                return;
            }

            // CAMBIO CRUCIAL: Eliminar el body del fetch
            const response = await fetch(`http://localhost:5000/api/scripts/${scriptId}/publish`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                showToast(data.message, "success");
                // Refrescar la lista para que el botón se actualice
                const refresh = await fetch(`http://localhost:5000/api/scripts`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const refreshedData = await refresh.json();
                setScripts(refreshedData.scripts);
            } else {
                showToast(data.error, "error");
            }
        } catch (error) {
            console.error("Error al publicar:", error);
            showToast("Error de red al publicar guion.", "error");
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

        {(view === "mis-guiones" || view === "favoritos") && (
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Buscar por título o contenido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="p-2 border rounded flex-1"
            />
            <select
              value={filtroEstilo}
              onChange={(e) => setFiltroEstilo(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="todos">Todos los estilos</option>
              <option value="comico">Cómico</option>
              <option value="narrativo">Narrativo</option>
              <option value="publicitario">Publicitario</option>
              <option value="educativo">Educativo</option>
              <option value="general">General</option>
            </select>
            <select
              value={ordenFecha}
              onChange={(e) => setOrdenFecha(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="desc">Más recientes</option>
              <option value="asc">Más antiguos</option>
            </select>
          </div>
        )}

        {view === 'mis-guiones' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Mis Guiones</h1>
            {scriptsFiltrados.length === 0 ? (
              <p className="text-gray-500">No ha guardado ningún guión.</p>
            ) : (
            <GuionList
              scripts={scriptsFiltrados}
              soloFavoritos={false}
              toggleFavorite={toggleFavorite}
              descargar={descargar}
              setGuion={setGuion}
              setTitle={setTitle}
              setEditando={setEditando}
              setEditingScriptId={setEditingScriptId}
              setView={setView}
              setHistorial={setHistorial}
              handleShare={handleShare}
              handleStopSharing={handleStopSharing}
              userRole={userRole}
              handlePublish={handlePublish}
              onDelete={async (id) => {
                if (window.confirm("¿Seguro?")) {
                  const token = typeof window !== 'undefined' ? localStorage.getItem("jwt") : "";
                  if (!token) {
                    showToast("No autorizado para esta acción.", "error");
                    return;
                  }
                  try {
                    // Add the token to the DELETE request
                    await fetch(`http://localhost:5000/api/scripts/${id}`, {
                      method: 'DELETE',
                      headers: {
                        "Authorization": `Bearer ${token}`
                      }
                    });
                    showToast("Guion eliminado", "info");

                    // Add the token to the GET request that refreshes the list
                    const r3 = await fetch(`http://localhost:5000/api/scripts`, {
                      headers: {
                        "Authorization": `Bearer ${token}`
                      }
                    });
                    const d3 = await r3.json();
                    setScripts(d3.scripts || []);
                  } catch (error) {
                    console.error("Error eliminando guion:", error);
                    showToast("Error al eliminar el guion.", "error");
                  }
                  
                }
              }}
              renderContent={(content) => <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{content}</pre>}
            />
            )}
          </>
        )}
        {view === 'favoritos' && (
          <>
            <h1 className="text-2xl font-bold mb-4">⭐ Mis Favoritos</h1>
            <GuionList
              scripts={scriptsFiltrados}
              soloFavoritos={true}
              toggleFavorite={toggleFavorite}
              descargar={descargar}
              setGuion={setGuion}
              setTitle={setTitle}
              setEditando={setEditando}
              setEditingScriptId={setEditingScriptId}
              setView={setView}
              setHistorial={setHistorial}
              handleShare={handleShare}
              handleStopSharing={handleStopSharing}
              userRole={userRole}
              handlePublish={handlePublish} 
              onDelete={async (id) => {
                if (window.confirm("¿Seguro?")) {
                  const token = typeof window !== 'undefined' ? localStorage.getItem("jwt") : "";
                  if (!token) {
                    showToast("No autorizado para esta acción.", "error");
                    return;
                  }

                  try {
                    // Add the token to the DELETE request
                    await fetch(`http://localhost:5000/api/scripts/${id}`, {
                      method: 'DELETE',
                      headers: {
                        "Authorization": `Bearer ${token}`
                      }
                    });
                    showToast("Guion eliminado", "info");

                    // Add the token to the GET request that refreshes the list
                    const r4 = await fetch(`http://localhost:5000/api/scripts`, {
                      headers: {
                        "Authorization": `Bearer ${token}`
                      }
                    });
                    const d4 = await r4.json();
                    setScripts(d4.scripts || []);
                  } catch (error) {
                    console.error("Error eliminando guion:", error);
                    showToast("Error al eliminar el guion.", "error");
                  }
                }
              }}
              renderContent={(content) => <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{content}</pre>}
            />
          </>
        )}
        {view === 'nuevo' && (
          <>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{editando ? `Editar: ${title}` : "Generador y Editor de Guiones"}</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl mx-auto border border-gray-200">
              
              <input type="text" placeholder="Título del Guion (Requerido para guardar)" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 mb-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-medium" />
              
              <textarea value={guion} onChange={e => setGuion(e.target.value)} rows={10} className="w-full p-3 border border-gray-300 mb-6 rounded-lg font-mono text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Escribe tu prompt o edita el contenido generado..." />
              
              {/* Controles de Tono y Estilo con Descripciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Selector de Tono con Descripción */}
                <div>
                  <label className="block mb-2 font-bold text-gray-700">Tono del Guion</label>
                  <select value={tono} onChange={e => setTono(e.target.value)} className="p-3 border border-gray-300 rounded-lg w-full mb-2">
                    {TONOS_DISPONIBLES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 italic">
                      {TONOS_DISPONIBLES.find(t => t.value === tono)?.description}
                  </p>
                </div>
                
                {/* Selector de Estilo con Descripción */}
                <div>
                  <label className="block mb-2 font-bold text-gray-700">Estilo del Guion</label>
                  <select value={estilo} onChange={e => setEstilo(e.target.value)} className="p-3 border border-gray-300 rounded-lg w-full mb-2">
                    {ESTILOS_DISPONIBLES.map(e => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 italic">
                      {ESTILOS_DISPONIBLES.find(e => e.value === estilo)?.description}
                  </p>
                </div>
              </div>

              {/* Botones de Acción (Generar, Guardar, Limpiar, Vista Previa) */}
              <div className="flex flex-wrap gap-3 mt-4">
                
                {/* Botón Generar (Llama a IA) */}
                <button 
                  onClick={handleGenerar} 
                  disabled={loading} 
                  className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${loading || !title ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? "Generando..." : "Generar IA"}
                </button>
                
                {/* Botón Guardar (Guarda en Backend) */}
                <button 
                  onClick={handleGuardar} 
                  disabled={!title || !guion}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${!title || !guion ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    <CheckCircleIcon className="w-5 h-5 mr-2" /> Guardar
                </button>
                
                {/* Botón Limpiar (CRITERIO CUMPLIDO) */}
                <button 
                  onClick={handleLimpiar} 
                  disabled={!guion && !title}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${!guion && !title ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    <TrashIcon className="w-5 h-5 mr-2" /> Limpiar
                </button>
                
                {/* Botón de Vista Previa */}
                <button 
                  onClick={() => setMostrarVistaPrevia(true)} 
                  disabled={!guion}
                  className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${!guion ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    Vista Previa PDF
                </button>
              </div>
               {/* NUEVO: Indicador de carga que se muestra solo si loading es true */}
              {loading && (
                <div className="flex items-center justify-center mt-4">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-lg font-medium text-gray-700">Generando guion...</span>
                </div>
              )}
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
          {isShareModalOpen && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                  <h2 className="text-xl font-bold mb-4">Guion compartido</h2>
                  <p className="mb-4">
                    Copia el enlace de solo lectura para compartir tu guion:
                  </p>
                  <div className="flex items-center space-x-2 border rounded-lg p-2 bg-gray-100">
                    <input
                      type="text"
                      value={sharingLink}
                      readOnly
                      className="flex-1 bg-transparent border-none outline-none text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sharingLink);
                        showToast("Enlace copiado al portapapeles", "success");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                    >
                      Copiar
                    </button>
                  </div>
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
      </main>
    </div>
  );
}