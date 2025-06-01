import { useState } from "react";
import { signIn } from "next-auth/react";
import Layout from '../components/Layout';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // ✅ Paso 1: guardar datos en localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("username", data.username);
  
        setMessage("Inicio de sesión exitoso");
  
        // Redirigir a una página protegida (ej. dashboard o perfil)
        window.location.href = "/dashboard"; // o "/perfil" según tu estructura
      } else {
        setMessage(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setMessage("Error interno del servidor");
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Iniciar Sesión</h1>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Iniciar Sesión
        </button>
        {message && <p className="text-red-500 text-center">{message}</p>}
      </form>
      <div className="flex flex-col items-center mt-6">
        <button
          onClick={() => signIn("google")}
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 mb-4"
        >
          Iniciar sesión con Google
        </button>
        <button
            onClick={() => signIn("facebook")}
            className="bg-blue-600 text-white p-2 rounded w-full"
          >
            Iniciar sesión con Facebook
          </button>
      </div>
    </div>
    </Layout>
  );
}