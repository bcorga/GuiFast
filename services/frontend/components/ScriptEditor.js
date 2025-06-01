export default function ScriptEditor({ title, setTitle, guion, setGuion, handleGuardar }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 mb-4 border rounded"
      />
      <textarea
        value={guion}
        onChange={(e) => setGuion(e.target.value)}
        className="w-full h-64 p-3 border rounded mb-4"
        placeholder="Escribe tu guion aquí..."
      ></textarea>
      <button
        onClick={handleGuardar}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Guardar Guion
      </button>
    </div>
  );
}