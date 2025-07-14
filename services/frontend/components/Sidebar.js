import { LogOut, FileText, Star, PlusCircle, User } from "lucide-react";

export default function Sidebar({ user, setView, view, showProfileLink }) {
  const navButton = (label, icon, targetView) => {
    const isActive = view === targetView;
    return (
      <button
        onClick={() => setView(targetView)}
        className={`flex items-center gap-2 p-2 rounded w-full text-left ${
          isActive ? "bg-blue-700" : "hover:bg-blue-700"
        }`}
      >
        {icon} {label}
      </button>
    );
  };

  return (
    <aside className="w-64 h-screen bg-blue-900 text-white flex flex-col p-4">
      <div className="flex items-center space-x-4 mb-10">
        <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
        <div>
          <p className="text-lg font-semibold">{user.username}</p>
          <p className="text-sm text-blue-300">Usuario</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navButton("Mis Guiones", <FileText size={18} />, "mis-guiones")}
        {navButton("Favoritos", <Star size={18} />, "favoritos")}
        {navButton("Nuevo Guion", <PlusCircle size={18} />, "nuevo")}
        {showProfileLink && navButton("Mi Perfil", <User size={18} />, "perfil")}
      </nav>

      <button
          onClick={() => {
            localStorage.clear(); // ✅ Limpia todos los datos de la sesión, incluyendo 'isLoggedIn'
            window.location.href = "/login"; // redirige al login
          }}
          className="mt-auto flex items-center gap-2 text-red-300 hover:text-white"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>

    </aside>
  );
}