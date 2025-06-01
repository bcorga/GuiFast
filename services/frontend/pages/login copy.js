import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
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
        setMessage("Inicio de sesión exitoso");
        console.log("Usuario autenticado:", data);
      } else {
        setMessage(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setMessage("Error interno del servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Iniciar sesión</h1>
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
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mb-4">
          Iniciar sesión
        </button>

        {message && <p className="text-red-500 text-center">{message}</p>}

        <div className="text-center">
          <button
            onClick={() => signIn("google")}
            className="bg-red-500 text-white p-2 rounded mb-4 w-full"
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
      </form>
    </div>
  );
}