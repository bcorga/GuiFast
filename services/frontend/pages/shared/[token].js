import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function SharedScript() {
    const router = useRouter();
    const { token } = router.query;
    const [script, setScript] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        const fetchSharedScript = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/public/shared-link/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || 'Error al cargar el guion.');
                } else {
                    setScript(data.script);
                }
            } catch (err) {
                setError('No se pudo conectar con el servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchSharedScript();
    }, [token]);

    if (loading) {
        return <div className="p-8 text-center">Cargando guion...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    if (!script) {
        return <div className="p-8 text-center text-gray-500">Guion no encontrado.</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">{script.title}</h1>
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{script.content}</pre>
        </div>
    );
}