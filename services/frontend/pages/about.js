import Layout from '../components/Layout';

export default function About() {
    return (
        // Fondo más profesional y suave
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header con un color más corporativo y sombra */}
                <header className="bg-blue-600 text-white p-6 shadow-lg">
                    <div className="container mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Sobre Nosotros: La Plataforma de GuiFast
                        </h1>
                        <p className="mt-2 text-xl font-light">Tu copiloto creativo impulsado por IA</p>
                    </div>
                </header>

                {/* Contenido principal con padding y ancho máximo */}
                <main className="container mx-auto p-4 md:p-12 max-w-4xl">
                    
                    {/* Sección Introductoria - Equipo */}
                    <section className="mb-10 bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                        <p className="text-gray-700 text-lg leading-relaxed">
                            ¡Bienvenido/a a nuestra plataforma! Detrás de este proyecto está un <b>equipo de desarrollo multidisciplinar</b>, apasionado por la <b>creatividad</b> y la <b>tecnología</b>. 
                            Somos una mezcla de <b>Desarrolladores Frontend, Backend y Expertos en IA</b>, unidos por la visión de <b>democratizar la generación de ideas y la creación de guiones</b>.
                        </p>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                        {/* Misión */}
                        <section className="p-6 bg-white rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-3 text-blue-600 border-b-2 pb-1">
                                Nuestra Misión
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Ofrecer una plataforma intuitiva basada en <b>IA</b> para ayudar a los creadores de contenido a producir guiones personalizados de manera <b>rápida y eficiente</b>, permitiéndoles dedicar más tiempo a la <b>creatividad</b> y menos a la escritura manual.
                            </p>
                        </section>

                        {/* Visión */}
                        <section className="p-6 bg-white rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-3 text-blue-600 border-b-2 pb-1">
                                Nuestra Visión
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Ser conocidos como un <b>referente</b> en la creación de soluciones tecnológicas para la <b>generación automatizada de guiones</b>, brindando apoyo a creadores de contenido independiente en su búsqueda de eficiencia y competitividad en el mercado digital.
                            </p>
                        </section>
                    </div>

                    {/* Propósito y Uso */}
                    <section className="mb-10 bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-extrabold mb-4 text-gray-800">
                            ¿Por qué y Para Qué Existimos?
                        </h2>
                        <div className="border-l-4 border-indigo-500 pl-4">
                            <h3 className="text-xl font-semibold mb-2 text-indigo-700">Propósito: Democratizar la Creación</h3>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                Nuestra principal motivación fue simple: <b>democratizar la generación de ideas y la creación de guiones.</b> Entendemos que empezar un proyecto creativo o estructurar una idea puede ser un desafío. Por eso, diseñamos una herramienta que combina la <b>eficiencia de la Inteligencia Artificial</b> con la <b>flexibilidad de la edición manual.</b>
                            </p>

                            <h3 className="text-xl font-semibold mb-2 text-indigo-700">Utilidad: Tu Copiloto Creativo</h3>
                            <p className="text-gray-700 mb-3 leading-relaxed">
                                El propósito es ser tu <b>copiloto creativo</b>. Esta plataforma te permite:
                            </p>
                            {/* Uso de lista ul/li para un mejor formato visual */}
                            <ul className="list-disc pl-8 text-gray-700 space-y-2">
                                <li>Superar el <b>bloqueo del escritor</b> generando borradores de guiones instantáneos.</li>
                                <li><b>Ahorrar tiempo</b> en la estructuración básica.</li>
                                <li><b>Personalizar</b> el tono y el estilo de tus textos.</li>
                                <li><b>Gestionar</b> tu flujo de trabajo de guiones desde un único lugar.</li>
                            </ul>
                        </div>
                    </section>
                    
                    {/* Propuesta de Valor */}
                    <section className="mb-10 bg-green-50 p-8 rounded-lg shadow-xl border-t-8 border-green-500">
                        <h2 className="text-3xl font-extrabold mb-5 text-green-700">
                            Nuestra Propuesta de Valor
                        </h2>
                        <p className="text-gray-700 mb-5 leading-relaxed">
                            Ofrecemos una solución <b>integral y potente</b> para creadores de contenido, escritores, guionistas y profesionales que necesiten textos estructurados. Nuestra propuesta de valor se basa en:
                        </p>
                        
                        {/* Uso de lista de características con formato destacado */}
                        <div className="space-y-4">
                            <p className="text-gray-800 font-medium">
                                <span className="text-2xl text-red-500 mr-2">•</span> <b>Tecnología de Vanguardia:</b> Usamos un Microservicio de IA basado en modelos de lenguaje avanzados (<b>distilgpt2</b> con *fine-tuning*), garantizando guiones <b>relevantes y coherentes</b> en español.
                            </p>
                            <p className="text-gray-800 font-medium">
                                <span className="text-2xl text-red-500 mr-2">•</span> <b>Facilidad de Uso:</b> Una interfaz limpia y rápida (<b>Next.js/React</b>) que permite generar, editar, guardar y <b>descargar</b> tus creaciones en formatos clave (.PDF, .DOC, .TXT).
                            </p>
                            <p className="text-gray-800 font-medium">
                                <span className="text-2xl text-red-500 mr-2">•</span> <b>Organización Total:</b> Un <b>dashboard intuitivo</b> para gestionar todos tus guiones y favoritos, asegurando que tus ideas más importantes estén siempre a mano.
                            </p>
                        </div>

                        <p className="mt-8 text-xl text-center font-bold text-green-800">
                            En resumen, estamos aquí para <b>agilizar tu proceso creativo</b> y ayudarte a convertir tus ideas en guiones terminados, listos para ser usados.
                        </p>
                    </section>

                    {/* Nuestro Equipo */}
                    <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                            Conoce al Equipo (Roles Clave)
                        </h2>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>
                                <strong>Director de Tecnología (CTO):</strong> Lidera la visión técnica, arquitectura de microservicios y el desarrollo de los modelos de IA.
                            </li>
                            <li>
                                <strong>Director de Producto (CPO):</strong> Define la estrategia de producto, diseña la experiencia de usuario y coordina la llegada al mercado.
                            </li>
                        </ul>
                    </section>

                </main>
            </div>
        </Layout>
    );
}