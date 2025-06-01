import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Products() {
  const router = useRouter();
  const packages = [
    {
      name: "Paquete Inicial",
      description: "Ideal para creadores que comienzan...",
      price: 10,
      buttonLabel: "Seleccionar Paquete Inicial",
    },
    {
      name: "Paquete Extra",
      description: "Perfecto para usuarios frecuentes...",
      price: 30,
      buttonLabel: "Seleccionar Paquete Extra",
    },
    {
      name: "Paquete Premium",
      description: "Lo mejor para equipos y profesionales...",
      price: 50,
      buttonLabel: "Seleccionar Paquete Premium",
    },
  ];

  return (
    <Layout>
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">Nuestros Productos</h1>
        </div>
      </header>
      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center"
            >
              <h2 className="text-2xl font-bold mb-4">{pkg.name}</h2>
              <p className="text-gray-700 mb-4">{pkg.description}</p>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                ${pkg.price}
              </p>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                onClick={() => {
                  // Asegúrate de pasar correctamente los parámetros
                  router.push({
                    pathname: '/checkout',
                    query: { packageName: pkg.name, packagePrice: pkg.price },
                  });
                }}
              >
                {pkg.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </main>
      <footer className="bg-blue-600 text-white p-4 text-center">
        <p>© 2024 GuionPlatform. Todos los derechos reservados.</p>
      </footer>
    </div>
    </Layout>
  );
}