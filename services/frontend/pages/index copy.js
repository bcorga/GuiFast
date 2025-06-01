import { useState } from 'react';
import Layout from '../components/Layout';

export default function Home() {
  const [guion, setGuion] = useState('');
  const [tono, setTono] = useState('formal');

  const handleGenerate = () => {
    alert('Generando guion...');
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-100">
      <main className="flex justify-center items-center h-[80vh]">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-4">Generador de Guiones</h1>
          <textarea
            className="w-full p-4 border-2 border-gray-300 rounded mb-4"
            placeholder="Escribe tu guion aquí..."
            value={guion}
            onChange={(e) => setGuion(e.target.value)}
          />
          <div className="mb-4">
            <label htmlFor="tono" className="block text-gray-700 mb-2">Selecciona el tono del guion:</label>
            <select
              id="tono"
              className="w-full p-2 border-2 border-gray-300 rounded"
              value={tono}
              onChange={(e) => setTono(e.target.value)}
            >
              <option value="formal">Formal</option>
              <option value="academico">Académico</option>
              <option value="humoristico">Humorístico</option>
            </select>
          </div>
          <button
            className="w-full bg-blue-600 text-white p-2 rounded"
            onClick={handleGenerate}
          >
            Generar Guion
          </button>
        </div>
      </main>
    </div>
    </Layout>
  );
}
