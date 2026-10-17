import { useEffect } from "react";

export default function PrintPreview({ content, title, onClose }) {
  useEffect(() => {
    document.title = `Vista previa - ${title}`;
  }, [title]);

  return (
    <div className="print-preview bg-white p-8 max-w-3xl mx-auto relative">
      <style>
        {`
          @media print {
            body::before {
              content: "";
              position: fixed;
              top: 30%;
              left: 50%;
              width: 400px;
              height: 400px;
              background-image: url('../public/images/marca-agua.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              opacity: 0.1;
              transform: translate(-50%, -50%);
              z-index: -1;
              pointer-events: none;
            }
          }
        `}
      </style>
      <div className="mb-6 flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold">Vista previa de impresión</h1>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Imprimir
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-4"
        >
          Cerrar
        </button>
      </div>
      <div className="prose max-w-none">
  {(content || "").split("\n").map((line, index) => {
    if (line.toLowerCase().startsWith("título:")) {
      return <h2 key={index} className="text-xl font-bold mb-4">{line}</h2>;
    }
    const partes = line.split(":");
    if (partes.length > 1) {
      const personaje = partes.shift();
      const dialogo = partes.join(":");
      return (
        <p key={index}>
          <strong>{personaje}:</strong> {dialogo.trim()}
        </p>
      );
    }
    return <p key={index}>{line}</p>;
  })}
</div>
<div className="watermark hidden print:block">
  <img src="../images/LogoGuiFast.png" alt="GuiFast" />
</div>
    </div>
  );
}