import { useState } from "react";
import Layout from "../components/Layout";

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    asunto: "",
    motivo: "Soporte Técnico",
    mensaje: ""
  });
  const [confirmacion, setConfirmacion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmacion("Tu mensaje ha sido enviado exitosamente.");
        setForm({ nombre: "", email: "", asunto: "", motivo: "Soporte Técnico", mensaje: "" });
      } else {
        setConfirmacion(data.error || "Error al enviar el mensaje.");
      }
    } catch (err) {
      setConfirmacion("Error del servidor.");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Contacto</h1>
        <p className="mb-4">Puedes escribirnos a contacto@plataforma.com o llamarnos al +51 999 999 999. Horario de atención: Lun-Vie, 9am - 6pm.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Asunto"
            value={form.asunto}
            onChange={(e) => setForm({ ...form, asunto: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <select
            value={form.motivo}
            onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option>Soporte Técnico</option>
            <option>Consultas de Ventas</option>
            <option>Sugerencias</option>
            <option>Otros</option>
          </select>
          <textarea
            placeholder="Mensaje"
            value={form.mensaje}
            onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            rows="5"
            className="w-full border p-2 rounded"
            required
          ></textarea>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Enviar Mensaje
          </button>
        </form>

        {confirmacion && <p className="mt-4 text-green-600">{confirmacion}</p>}
      </div>
    </Layout>
  );
}