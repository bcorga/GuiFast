import { useState } from "react";
import Layout from '../components/Layout';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'; // Iconos para estética

export default function Home() {
  const [guion, setGuion] = useState("");
  const [tono, setTono] = useState("neutral");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [estilo, setEstilo] = useState("comico");
  
  // Nuevo estado para mensajes de confirmación o error
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' }); 

  const handleGenerate = async () => {
    setLoading(true);
    setResult(""); // Limpia resultados previos
    setStatusMessage({ type: '', text: '' }); // Limpia mensajes de estado

    if (guion.trim().length < 10) {
        setStatusMessage({ type: 'error', text: 'Por favor, introduce una idea más detallada para el guion.' });
        setLoading(false);
        return;
    }

    try {
      // Nota: Mantener el fetch a localhost:8000/generate (Microservicio de IA)
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: guion, tone: tono, estilo: estilo }),
      });

      const data = await response.json();
      
      if (response.ok && data.generated_text) {
        setResult(data.generated_text);
        // CRITERIO CUMPLIDO: Mensaje de confirmación de éxito
        setStatusMessage({
            type: 'success',
            text: '¡Guion generado con éxito! Puedes revisarlo o guardarlo ahora.'
        });
      } else {
        // Manejo de errores específicos del backend
        setStatusMessage({
            type: 'error',
            text: `Error de la IA: ${data.message || 'No se pudo generar el texto.'}`
        });
      }
    } catch (error) {
      console.error("Error generando el guion:", error);
      setStatusMessage({
        type: 'error',
        text: "Error de conexión con el Microservicio de IA (Puerto 8000). Asegúrate de que Docker esté levantado."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-6 text-center shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-tight">Generador Inteligente de Guiones</h1>
        <p className="mt-1 text-lg font-light">Tu punto de partida creativo asistido por IA</p>
      </header>
      
      <main className="container mx-auto p-8 max-w-5xl">
        
        {/* CRITERIO CUMPLIDO: Mensaje de bienvenida al inicio de la página */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-800 p-4 mb-8 rounded-md shadow-md flex items-start">
            <SparklesIcon className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="font-bold text-lg">Bienvenido/a a la Plataforma</h3>
                <p className="text-sm">
                    Para comenzar, ingresa tu idea o *prompt* en el recuadro, ajusta el **tono** y el **estilo**, y haz clic en "Generar Guion". Nuestro modelo IA (`distilgpt2`) creará el borrador de tu guion al instante.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Panel de Entrada (Input y Controles) */}
            <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">1. Define tu Guion</h2>
                
                <label htmlFor="prompt" className="block mb-1 font-semibold text-gray-700">Idea Inicial (Prompt)</label>
                <textarea
                    id="prompt"
                    className="w-full p-4 border border-gray-300 rounded-lg mb-4 h-32 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Un diálogo corto entre un robot pesimista y un humano optimista sobre el café matutino."
                    value={guion}
                    onChange={(e) => setGuion(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="tono" className="block mb-1 font-semibold text-gray-700">Tono del Guion</label>
                        <select
                            id="tono"
                            className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
                            value={tono}
                            onChange={(e) => setTono(e.target.value)}
                        >
                            <option value="neutral">Neutral</option>
                            <option value="formal">Formal</option>
                            <option value="informal">Informal</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="estilo" className="block mb-1 font-semibold text-gray-700">Estilo del Guion</label>
                        <select
                            id="estilo"
                            value={estilo}
                            onChange={(e) => setEstilo(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="comico">Cómico</option>
                            <option value="narrativo">Narrativo</option>
                            <option value="publicitario">Publicitario</option>
                            <option value="educativo">Educativo</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`w-full p-3 rounded-lg font-bold text-white transition-colors duration-300 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generando Borrador...
                        </span>
                    ) : "Generar Guion"}
                </button>

            </div>

            {/* Panel de Resultados y Mensajes */}
            <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold mb-0 text-gray-800">2. Resultado</h2>
                
                {/* Visualización del Mensaje de Estado (Éxito/Error) */}
                {statusMessage.text && (
                    <div className={`p-4 rounded-lg shadow-md flex items-start ${
                        statusMessage.type === 'success' 
                        ? 'bg-green-100 border-l-4 border-green-500 text-green-800' 
                        : 'bg-red-100 border-l-4 border-red-500 text-red-800'
                    }`}>
                        {statusMessage.type === 'success' && <CheckCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" />}
                        <p className="text-sm font-medium">{statusMessage.text}</p>
                    </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-lg flex-grow">
                    <h3 className="text-xl font-bold mb-3 text-gray-700">Contenido Generado:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {/* Estructuración del Guion (mantenida del original, pero mejor estilizada) */}
                    {result.split("\n").map((linea, index) => {
                        const partes = linea.split(":");
                        
                        // Si es el título
                        if (linea.toLowerCase().startsWith("título:")) {
                            return <h3 key={index} className="text-xl font-extrabold text-blue-800 mb-3 mt-4">{linea}</h3>;
                        }

                        // Si es una línea de personaje
                        if (partes.length > 1 && partes[0].trim().toUpperCase() === partes[0].trim()) {
                            const personaje = partes.shift();
                            const dialogo = partes.join(":");
                            return (
                                <div key={index} className="my-2 ml-4">
                                    <p className="font-semibold text-indigo-700 uppercase mb-0.5">{personaje.trim()}</p>
                                    <p className="pl-4 border-l-2 border-indigo-300 italic text-gray-700">{dialogo.trim()}</p>
                                </div>
                            );
                        }

                        // Línea vacía o acotación
                        return <p key={index} className="my-1 text-gray-600">{linea}</p>;
                    })}
                    {result === "" && !loading && (
                        <p className="text-gray-400 italic">El guion generado aparecerá aquí.</p>
                    )}
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
    </Layout>
  );
}