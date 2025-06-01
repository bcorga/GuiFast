import { useState } from "react";
import Layout from '../components/Layout';

export default function Home() {
  const [guion, setGuion] = useState("");
  const [tono, setTono] = useState("neutral");
  const [result, setResult] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(""); // Limpia los resultados previos
    setImage(null); // Limpia la imagen previa

    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: guion, tone: tono }),
      });

      const data = await response.json();
      setResult(data.generated_text);

      // Llamar al endpoint para generar la imagen
      const imageResponse = await fetch("http://localhost:8000/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: guion }),
      });

      const imageData = await imageResponse.json();
      setImage(`data:image/png;base64,${imageData.image}`);
    } catch (error) {
      console.error("Error generando el guion o la imagen:", error);
      setResult("Error al generar el guion o la imagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-4xl font-bold">Generador de Guiones e Imágenes</h1>
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
            className="bg-blue-600 text-white w-full p-2 rounded"
          >
            {loading ? "Generando..." : "Generar Guion e Imagen"}
          </button>
          <div className="mt-4">
            <h2 className="text-xl font-bold">Resultado:</h2>
            <p className="mt-2 text-gray-700 whitespace-pre-line">{result}</p>
            {image && <img src={image} alt="Generated" className="mt-4" />}
          </div>
        </div>
      </main>
    </div>
    </Layout>
  );
}