import { useState } from "react";
import Layout from '../components/Layout';

export default function Home() {
  const [guion, setGuion] = useState("");
  const [tono, setTono] = useState("neutral");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [estilo, setEstilo] = useState("comico"); // Valor por defecto

  const handleGenerate = async () => {
    setLoading(true);
    setResult(""); // Limpia resultados previos

    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: guion, tone: tono, estilo: estilo }),
      });

      const data = await response.json();
      setResult(data.generated_text);
    } catch (error) {
      console.error("Error generando el guion:", error);
      setResult("Error al generar el guion. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-4xl font-bold">Generador de Guiones</h1>
      </header>
      <main className="container mx-auto p-8">
        <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
          <textarea
            className="w-full p-4 border rounded mb-4"
            placeholder="Escribe tu idea para el guion..."
            value={guion}
            onChange={(e) => setGuion(e.target.value)}
          />
          <label htmlFor="estilo" className="block mt-4 mb-1 font-semibold">Tono del Guion</label>
          <select
            className="w-full p-2 border rounded mb-4"
            value={tono}
            onChange={(e) => setTono(e.target.value)}
          >
            <option value="neutral">Neutral</option>
            <option value="formal">Formal</option>
            <option value="informal">Informal</option>
          </select>

          <label htmlFor="estilo" className="block mt-4 mb-1 font-semibold">Estilo del Guion</label>
          <select
            id="estilo"
            value={estilo}
            onChange={(e) => setEstilo(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="comico">Cómico</option>
            <option value="narrativo">Narrativo</option>
            <option value="publicitario">Publicitario</option>
            <option value="educativo">Educativo</option>
            <option value="general">General</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 text-white w-full p-2 rounded"
          >
            {loading ? "Generando..." : "Generar Guion"}
          </button>
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Guion generado:</h2>
            <div className="bg-gray-100 p-4 rounded">
              {result.split("\n").map((linea, index) => {
                // Si es el título
                if (linea.toLowerCase().startsWith("título:")) {
                  return <h3 key={index} className="text-lg font-bold mb-2">{linea}</h3>;
                }

                // Si es una línea de personaje
                const partes = linea.split(":");
                if (partes.length > 1) {
                  const personaje = partes.shift();
                  const dialogo = partes.join(":");
                  return (
                    <p key={index}>
                      <strong>{personaje}:</strong> {dialogo.trim()}
                    </p>
                  );
                }

                // Línea vacía u otra
                return <p key={index}>{linea}</p>;
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
    </Layout>
  );
}
