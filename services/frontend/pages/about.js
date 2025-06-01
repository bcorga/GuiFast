import Layout from '../components/Layout';

export default function About() {
    return (
        <Layout>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold">Sobre Nosotros</h1>
          </div>
        </header>
        <main className="container mx-auto p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
            <p className="text-gray-700">
              Ofrecer una plataforma intuitiva basada en IA para ayudar a los creadores de contenido a producir guiones personalizados de manera rápida y eficiente, permitiéndoles dedicar más tiempo a la creatividad y menos a la escritura manual.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Nuestra Visión</h2>
            <p className="text-gray-700">
              Ser conocidos como un referente en la creación de soluciones tecnológicas para la generación automatizada de guiones, brindando apoyo a creadores de contenido independiente en su búsqueda de eficiencia y competitividad en el mercado digital.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Nuestro Equipo</h2>
            <ul className="list-disc pl-5 text-gray-700">
              <li><strong>Director de Tecnología (CTO):</strong> Responsable del desarrollo técnico de la plataforma y los modelos de IA.</li>
              <li><strong>Director de Producto (CPO):</strong> Diseña el producto, realiza pruebas de usuario y lidera el marketing.</li>
            </ul>
          </section>
        </main>
      </div>
      </Layout>
    );
  }
  