import Layout from '../components/Layout';
import React, { useState } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';// Se asume el uso de Heroicons

// Datos de Preguntas Frecuentes con Categorías
const allFaqs = [
  // Categoría 1: Uso de la Plataforma y Generación de Guiones
  {
    category: "Generación y Edición de Guiones",
    items: [
      {
        question: "¿Qué tipos de guiones puedo generar con la IA?",
        answer: "La IA está entrenada en guiones estructurados en español y puede generar contenido para diversos fines (historias cortas, scripts de vídeo, diálogos, etc.). Puedes guiarla con los parámetros de **prompt, tono y estilo**."
      },
      {
        question: "¿Cómo genero un guion si el botón 'Generar Guion' no funciona?",
        answer: "Asegúrate de haber ingresado un **prompt de inicio claro** y haber seleccionado el **tono** y **estilo** deseados. Si el problema persiste, verifica tu conexión a internet. Si el backend está en marcha (puerto 5000) y el servicio IA (puerto 8000) responde, recarga la página."
      },
      {
        question: "¿Puedo personalizar los guiones generados más allá de los tonos disponibles?",
        answer: "Sí. Una vez generado el borrador, puedes usar el **ScriptEditor** (función de edición de texto estándar) para modificar el contenido, cambiar el estilo o corregir cualquier parte, y luego guardarlo con el ID original (función **PUT** del Backend)."
      },
      {
        question: "¿Cómo descargo mi guion y en qué formatos?",
        answer: "Desde el editor de guiones o la vista de lista, busca el botón 'Descargar'. El sistema te permitirá exportarlo en **PDF** (usando `jspdf`), **DOC** o **TXT** (usando `Blob`)."
      }
    ]
  },
  // Categoría 2: Cuenta, Seguridad y Acceso
  {
    category: "Cuenta y Acceso",
    items: [
      {
        question: "¿Cómo puedo recuperar mi cuenta si olvidé mi contraseña?",
        answer: "En la pantalla de inicio de sesión, haz clic en **'Olvidé mi contraseña'**. El sistema te pedirá tu correo electrónico y te enviará un enlace de restablecimiento. Recuerda que las contraseñas están **hasheadas con bcrypt** para tu seguridad."
      },
      {
        question: "¿Cómo actualizo mi nombre de usuario o avatar?",
        answer: "Ve a la sección **'Mi Perfil'** dentro del dashboard. Allí encontrarás las opciones para actualizar tu **username** y **avatar**. El Backend tiene un endpoint específico para manejar estos cambios."
      },
      {
        question: "¿Es segura mi información?",
        answer: "Sí. Implementamos **contraseñas hasheadas con bcrypt** y usamos **JWT** para la gestión de sesiones. El acceso a tus guiones y datos de perfil está restringido y protegido por validaciones en el Backend."
      }
    ]
  },
  // Categoría 3: Problemas Técnicos
  {
    category: "Problemas Técnicos y Soporte",
    items: [
      {
        question: "¿Qué hago si la página no carga correctamente o veo errores?",
        answer: "Por favor, verifica tu conexión a internet. Si el problema persiste, intenta recargar la página (**limpiando la caché** de tu navegador). Si el error es persistente, podría ser un problema con la comunicación entre los **microservicios** (Frontend, Backend o IA). Contáctanos indicando el momento del error."
      },
      {
        question: "¿Cómo reporto un error en un guion generado por la IA?",
        answer: "Si el guion generado no cumple con los parámetros ingresados, puede deberse a la **configuración del modelo** (distilgpt2). Edítalo manualmente y, si el problema es recurrente, contáctanos desde la sección 'Contacto' para que podamos ajustar el **fine-tuning** del modelo."
      }
    ]
  }
];

export default function FAQ() {
    // Estado para la funcionalidad de acordeón
    const [openIndex, setOpenIndex] = useState(null);
    // Estado para la búsqueda
    const [searchTerm, setSearchTerm] = useState('');

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Función para filtrar preguntas
    const filteredFaqs = allFaqs.map(category => ({
        ...category,
        items: category.items.filter(faq => 
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.items.length > 0); // Ocultar categorías vacías

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header estilizado similar al About */}
                <header className="bg-blue-600 text-white p-6 shadow-lg">
                    <div className="container mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Preguntas Frecuentes (FAQ) 🧠
                        </h1>
                        <p className="mt-2 text-xl font-light">Encuentra respuestas rápidas sin necesidad de soporte.</p>
                    </div>
                </header>

                <main className="container mx-auto p-4 md:p-12 max-w-4xl">
                    {/* Sección de Búsqueda */}
                    <div className="mb-8 p-4 bg-white rounded-lg shadow-md flex items-center">
                        {/* Se asume Heroicons está instalado: npm install @heroicons/react */}
                        {/*  */}
                        <MagnifyingGlassIcon className="h-6 w-6 text-blue-500 mr-3" /> 
                        <input
                            type="text"
                            placeholder="Buscar preguntas o palabras clave..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <section>
                        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b-2 pb-2">
                            Temas y Categorías
                        </h2>

                        {/* Renderizado de FAQs por Categoría */}
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((category, catIndex) => (
                                <div key={catIndex} className="mb-8">
                                    <h3 className="text-2xl font-bold mb-4 p-2 bg-blue-100 text-blue-800 rounded-md shadow-sm border-l-4 border-blue-500">
                                        {category.category}
                                    </h3>
                                    
                                    {/* Lista de Preguntas con Acordeón */}
                                    <ul className="space-y-3">
                                        {category.items.map((faq, itemIndex) => {
                                            // Creamos un índice único combinando categoría e item
                                            const combinedIndex = `${catIndex}-${itemIndex}`; 
                                            const isOpen = openIndex === combinedIndex;

                                            return (
                                                <li key={itemIndex} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
                                                    {/* Encabezado de la Pregunta (Clickable) */}
                                                    <button
                                                        onClick={() => toggleFAQ(combinedIndex)}
                                                        className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-800 hover:bg-gray-50 focus:outline-none"
                                                    >
                                                        <span>{faq.question}</span>
                                                        <ChevronDownIcon 
                                                            className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-blue-500' : 'text-gray-400'}`}
                                                        />
                                                    </button>

                                                    {/* Respuesta (Desplegable) */}
                                                    {isOpen && (
                                                        <div className="p-4 pt-0 border-t border-gray-200 bg-gray-50 text-gray-700 leading-relaxed">
                                                            <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            // Mensaje si no hay resultados
                            <div className="text-center p-10 bg-white rounded-lg shadow-md">
                                <p className="text-xl text-gray-600">
                                    No se encontraron resultados para **"{searchTerm}"** en ninguna categoría. Intenta otra palabra clave.
                                </p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </Layout>
    );
}