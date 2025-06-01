import { useState } from "react";

export default function Home() {
  const [guion, setGuion] = useState("");
  const [tono, setTono] = useState("neutral");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoURL, setVideoURL] = useState(""); // URL del video generado

  // Generar guion con IA
  const handleGenerate = async () => {
    setLoading(true);
    setResult(""); // Limpia resultados previos
    setVideoURL(""); // Resetea el enlace del video generado

    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: guion, tone: tono }),
      });

      if (!response.ok) {
        throw new Error("Error en la generación del guion");
      }

      const data = await response.json();
      setResult(data.generated_text);
    } catch (error) {
      console.error("Error generando el guion:", error);
      setResult("Error al generar el guion. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Generar video basado en el guion
  const handleGenerateVideo = async () => {
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:8001/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guion: result }),
      });
  
      if (!response.ok) {
        throw new Error("Error al generar el video");
      }
  
      const data = await response.json();
      const videoUrl = `http://localhost:8001${data.video_url}`;
      setVideoURL(videoUrl);  // Establecer la URL correcta del video
    } catch (error) {
      console.error("Error generando el video:", error);
      alert("Error al generar el video. Por favor, revisa los logs del backend.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-4xl font-bold">Generador de Guiones y Videos</h1>
      </header>
      <main className="container mx-auto p-8">
        <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
          <textarea
            className="w-full p-4 border rounded mb-4"
            placeholder="Escribe tu idea para el guion..."
            value={guion}
            onChange={(e) => setGuion(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded mb-4"
            value={tono}
            onChange={(e) => setTono(e.target.value)}
          >
            <option value="neutral">Neutral</option>
            <option value="formal">Formal</option>
            <option value="informal">Informal</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 text-white w-full p-2 rounded mb-4 hover:bg-blue-700"
          >
            {loading ? "Generando Guion..." : "Generar Guion"}
          </button>
          {result && (
            <div>
              <h2 className="text-xl font-bold mt-4">Guion Generado:</h2>
              <p className="mt-2 text-gray-700 whitespace-pre-line">{result}</p>
              <button
                onClick={handleGenerateVideo}
                disabled={loading}
                className="bg-green-600 text-white w-full p-2 rounded mt-4 hover:bg-green-700"
              >
                {loading ? "Generando Video..." : "Generar Video"}
              </button>
            </div>
          )}
          {videoURL && (
            <div className="mt-4">
              <h2 className="text-xl font-bold">Video Generado:</h2>
              <video controls className="w-full mt-2">
                <source src={videoURL} type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>
              <a
                href={videoURL}
                download
                className="block mt-2 text-blue-600 hover:underline"
              >
                Descargar Video
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}