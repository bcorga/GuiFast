import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-8">{children}</main>
      <footer className="bg-blue-600 text-white p-4 text-center">
        <p>© 2024 GuionPlatform. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}