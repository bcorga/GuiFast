import { useState } from "react";

export default function ProfileSettings({ user, setUser }) {
  const [username, setUsername] = useState(user.username || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
  if (!username || !avatar) return setMessage("Nombre y avatar son obligatorios.");

  try {
    const email = localStorage.getItem("userEmail");

    const response = await fetch("http://localhost:5000/api/user/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, avatar, newPassword: password }),
    });

    const data = await response.json();
    if (response.ok) {
      setUser({ username: data.username, avatar: data.avatar });
      localStorage.setItem("username", data.username);
      localStorage.setItem("avatar", data.avatar);
      setMessage("Perfil actualizado con éxito.");
    } else {
      setMessage(data.error || "Error al actualizar.");
    }
  } catch (err) {
    console.error("Error actualizando perfil:", err);
    setMessage("Error del servidor.");
  }
};

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg">
      <div className="mb-4">
        <label className="block font-medium mb-1">Nombre de usuario</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Avatar (URL de imagen)</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
        />
        {avatar && (
          <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full mt-2" />
        )}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Cambiar contraseña</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña"
        />
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Guardar cambios
      </button>

      {message && <p className="text-green-600 mt-4">{message}</p>}
    </div>
  );
}
