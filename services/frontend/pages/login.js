import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // 👈 Importamos useRouter
import { signIn } from "next-auth/react";
import Layout from '../components/Layout';

export default function Login() {
  const router = useRouter(); // 👈 Inicializamos el router

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showResendForm, setShowResendForm] = useState(false); // Estado para mostrar el form de reenvío
  const [resendEmail, setResendEmail] = useState(""); // Email para el reenvío
  const [resendMessage, setResendMessage] = useState(""); // Mensaje del reenvío

  // ⚡️ NUEVO: Lógica para manejar errores de la URL (como Token Inválido/Expirado)
  useEffect(() => {
    // Captura el parámetro 'error' de la URL (e.g., /login?error=TokenInválido)
    const { error, email: initialEmail } = router.query; 

    if (error === "TokenInválido") {
      // 🚨 Muestra el error de token expirado y el formulario de reenvío
      setMessage("El enlace de activación ha expirado o es inválido.");
      setShowResendForm(true);
      
      // Si el email viene como parámetro en la URL, lo pre-rellenamos (opcional)
      // Nota: Actualmente tu backend solo redirige con ?error=TokenInválido, 
      // si quisieras enviar el email también, tendrías que modificar el verifyEmail del backend.
      // Por ahora, usamos el estado resendEmail vacío.
    }
  }, [router.query]); // Dependencia para que se ejecute cuando cambie la query

  const handleLogin = async (e) => {
    e.preventDefault();
    // Limpiamos mensajes y ocultamos el formulario de reenvío al intentar login
    setMessage("");
    setShowResendForm(false);

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
        
        // ----------------------------------------------------
        // CAMBIO CRUCIAL: Guarda el token JWT
        if (data.token) {
          localStorage.setItem("jwt", data.token); // <-- Añade esta línea
        }
        // ----------------------------------------------------
        if (data.role) {
            localStorage.setItem("userRole", data.role); // <-- Añade esta línea
        }
        if (data.avatar) {
              localStorage.setItem("avatar", data.avatar);
        }
  
        setMessage("Inicio de sesión exitoso");
  
        // Redirigir a una página protegida (ej. dashboard o perfil)
        window.location.href = "/dashboard"; // o "/perfil" según tu estructura
      } else {
         // 🚨 Manejo de error de cuenta no verificada
        if (data.error && data.error.includes("verifica tu correo")) {
             setMessage(data.error);
             setShowResendForm(true); // Mostrar opción de reenvío si la cuenta no está verificada
             setResendEmail(email); // Usamos el email que intentó hacer login
        } else {
            setMessage(data.error || "Error al iniciar sesión");
        }
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setMessage("Error interno del servidor");
    }
  };

    // ⚡️ NUEVO: Función para reenviar el email de verificación
  const handleResendEmail = async (e) => {
    e.preventDefault();
    setResendMessage("Enviando...");
    
    try {
        const response = await fetch("http://localhost:5000/api/auth/resend-verification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: resendEmail }),
        });

        const data = await response.json();

        if (response.ok) {
            setResendMessage(data.message); // Muestra el mensaje de éxito del backend
            // Podrías ocultar el formulario después de un éxito si lo deseas
        } else {
            setResendMessage(data.message || "Error al reenviar el correo.");
        }
    } catch (error) {
        console.error("Error al reenviar el correo:", error);
        setResendMessage("Error interno del servidor al reenviar.");
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

      {/* 📧 NUEVO: Sección para Reenviar Correo de Activación */}
      {showResendForm && (
        <form onSubmit={handleResendEmail} className="mt-6 bg-yellow-50 p-6 rounded shadow-md w-full max-w-sm border-l-4 border-yellow-500">
          <h2 className="text-lg font-bold mb-3 text-gray-800">Reenviar Activación</h2>
          <p className="text-sm mb-3 text-gray-600">Introduce tu email para recibir un nuevo enlace.</p>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700"
          >
            Reenviar Correo de Activación
          </button>
          {resendMessage && <p className="text-sm text-center mt-3 text-green-700 font-medium">{resendMessage}</p>}
        </form>
      )}



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