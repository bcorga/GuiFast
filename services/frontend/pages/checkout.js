// pages/checkout.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function Checkout() {
  const router = useRouter();
  const { packageName, packagePrice } = router.query;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleConfirmPurchase = async () => {
    setLoading(true);
    try {
      //const userId = localStorage.getItem("userId"); // Usuario logueado
      //const token = localStorage.getItem("jwt");
      //const email = localStorage.getItem("userEmail");

      const token = localStorage.getItem("jwt");
      if (!token) {
        setMessage("Error: No se pudo obtener el ID del usuario del token.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ packageName }),
      });

          // --- CAMBIO CLAVE AQUÍ ---
    if (response.status === 401) {
        // Si el token es inválido o ha expirado, forzamos el logout.
        localStorage.clear();
        router.push("/login?expired=true");
        return;
    }
    // --- FIN DEL CAMBIO ---

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        // Guardar rol en localStorage
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("userRole", data.role);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setMessage(data.error || "Error en la compra.");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Error procesando la compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Confirmar Compra</h1>
          <p className="mb-2">Plan seleccionado: <strong>{packageName}</strong></p>
          <p className="mb-4">Precio: <strong>${packagePrice}</strong></p>

          <button
            onClick={handleConfirmPurchase}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Confirmar Compra"}
          </button>

          {message && <p className="mt-4 text-blue-600">{message}</p>}
        </div>
      </div>
    </Layout>
  );
}