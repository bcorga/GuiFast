// pages/guion/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

export default function ScriptDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return; // Wait for the id to be available

    const fetchScript = async () => {
      try {
        // Fetch the published script by its ID using your new backend endpoint
        const response = await fetch(`http://localhost:5000/api/public/scripts/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar el guion.');
        }

        setScript(data.script);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [id]);

  if (loading) {
    return <Layout><p className="text-center p-8">Cargando guion...</p></Layout>;
  }

  if (error) {
    return <Layout><p className="text-center p-8 text-red-500">Error: {error}</p></Layout>;
  }

  if (!script) {
    return <Layout><p className="text-center p-8 text-gray-500">Guion no encontrado o no está publicado.</p></Layout>;
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10">
        <h1 className="text-3xl font-bold mb-4">{script.title}</h1>
        <p className="text-gray-600 mb-4">Autor: {script.User ? script.User.username : 'Anónimo'}</p>
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm">{script.content}</pre>
      </div>
    </Layout>
  );
}