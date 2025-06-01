import Layout from '../components/Layout';

export default function FAQ() {
    const faqs = [
      {
        question: "¿Qué hago si la página no carga correctamente?",
        answer: "Por favor, verifica tu conexión a internet. Si el problema persiste, intenta recargar la página o borrar la caché de tu navegador."
      },
      {
        question: "¿Cómo genero un guion si el botón 'Generar Guion' no funciona?",
        answer: "Asegúrate de haber ingresado texto en la caja de redacción y haber seleccionado un tono. Si el problema persiste, verifica tu conexión a internet y recarga la página."
      },
      {
        question: "¿Cómo puedo recuperar mi cuenta si olvidé mi contraseña?",
        answer: "Haz clic en el botón 'Acceder' y luego selecciona 'Olvidé mi contraseña'. Sigue los pasos para restablecerla."
      },
      {
        question: "¿Qué debo hacer si el guion generado tiene errores?",
        answer: "Revise los parámetros que ingresó, como el tono y el texto inicial. Si el problema persiste, contáctenos a través de la sección de 'Contacto'."
      },
      {
        question: "¿Puedo personalizar los guiones generados más allá de los tonos disponibles?",
        answer: "En la versión gratuita no es posible. Sin embargo, nuestra versión premium incluye opciones avanzadas de personalización."
      }
    ];
  
    return (
        <Layout>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold">Preguntas y Respuestas</h1>
          </div>
        </header>
        <main className="container mx-auto p-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Preguntas Frecuentes</h2>
            <ul className="space-y-4">
              {faqs.map((faq, index) => (
                <li key={index} className="bg-white p-4 shadow-md rounded">
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
      </Layout>
    );
  }
  