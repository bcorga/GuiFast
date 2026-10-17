import { useRouter } from 'next/router';
import React, { useState } from 'react'; // ¡Importar useState!
import Layout from '../components/Layout';
import Modal from '../components/Modal'; // ¡Importar el nuevo Modal!
import { CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function Products() {
  const router = useRouter();
  
  // 1. Nuevos estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const packages = [
    // Definición de paquetes (mantenemos los datos con features)
    {
      name: "Paquete Inicial",
      description: "Ideal para creadores que comienzan y necesitan un flujo de trabajo asistido básico.",
      price: 10,
      buttonLabel: "Seleccionar Inicial",
      isPopular: false,
      features: [
        "100 Guiones/mes",
        "Tono y estilo básico",
        "Descarga en TXT y PDF",
        "1 Usuario activo",
        "Soporte por email (24h)"
      ],
      // 3. Detalles adicionales para el modal
      details: "El Paquete Inicial está limitado a un volumen mensual y ofrece las funciones principales de generación de guiones con IA. Ideal para probar la plataforma y gestionar proyectos personales.",
    },
    {
      name: "Paquete Extra",
      description: "Perfecto para usuarios frecuentes, pequeños equipos o proyectos con alta demanda.",
      price: 30,
      buttonLabel: "Seleccionar Paquete Extra",
      isPopular: true,
      features: [
        "Ilimitado Guiones/mes",
        "Tono y estilo avanzado (custom)",
        "Descarga en DOC, PDF y TXT",
        "3 Usuarios activos",
        "Soporte prioritario (1h)"
      ],
      details: "El Paquete Extra ofrece uso ilimitado y acceso a la personalización de tonos. Es la mejor opción para equipos que necesitan un alto rendimiento y soporte rápido.",
    },
    {
      name: "Paquete Premium",
      description: "Lo mejor para equipos y profesionales con necesidades de integración y volumen masivo.",
      price: 50,
      buttonLabel: "Seleccionar Paquete Premium",
      isPopular: false,
      features: [
        "Ilimitado Guiones/mes",
        "Tono y estilo avanzado (custom)",
        "Descarga en DOC, PDF y TXT",
        "5 Usuarios activos",
        "Soporte 24/7 y chat directo"
      ],
      details: "El Paquete Premium incluye todas las funcionalidades del Extra, además de un mayor número de usuarios activos y el nivel más alto de soporte disponible (24/7).",
    },
  ];

  const handleSelectPackage = (pkg) => {
    // Redirigir directamente al checkout
    router.push({
      pathname: '/checkout',
      query: { packageName: pkg.name, packagePrice: pkg.price },
    });
  };

  // 2. Nueva función para abrir el modal
  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };
  
  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* ... (Header y Main son iguales) ... */}
        <header className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white p-10 shadow-xl">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-extrabold mb-2">Planes de Suscripción</h1>
            <p className="text-xl font-light opacity-90">Potencia tu creatividad con la IA, sin límites.</p>
          </div>
        </header>

        <main className="container mx-auto p-8 lg:p-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {packages.map((pkg, index) => {
              const baseClasses = "bg-white p-6 rounded-xl shadow-lg flex flex-col transition-all duration-300 transform hover:scale-[1.02] border-2";
              const popularClasses = "border-indigo-500 shadow-2xl relative";
              const standardClasses = "border-gray-200";

              return (
                <div
                  key={index}
                  className={`${baseClasses} ${pkg.isPopular ? popularClasses : standardClasses}`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-3 right-4 bg-indigo-500 text-white text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider shadow-md">
                      Más Popular
                    </div>
                  )}

                  <h2 className="text-3xl font-extrabold mb-2 text-gray-900">{pkg.name}</h2>
                  <p className="text-gray-500 mb-6 flex-grow">{pkg.description}</p>
                  
                  <div className="mb-8 text-center">
                    <p className="text-5xl font-bold text-indigo-600">
                      ${pkg.price}
                    </p>
                    <p className="text-sm text-gray-500">/ mes</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {pkg.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start text-gray-700">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto space-y-3">
                    {/* Botón de selección/compra */}
                    <button
                      className={`w-full text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors ${pkg.isPopular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      {pkg.buttonLabel}
                    </button>
                    
                    {/* 4. Asignar la función handleViewDetails al botón */}
                    <button
                      className="w-full flex items-center justify-center text-sm text-gray-600 px-6 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100"
                      onClick={() => handleViewDetails(pkg)} // ¡Cambio importante!
                    >
                        <InformationCircleIcon className="h-4 w-4 mr-1" />
                        Ver Más Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* 5. Implementación del componente Modal */}
      {selectedPackage && (
          <Modal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              title={`Detalles del ${selectedPackage.name}`}
          >
              <p className="text-lg mb-4">{selectedPackage.details}</p>
              
              <h3 className="text-xl font-semibold mb-3 border-b pb-1 text-indigo-600">
                  Beneficios Adicionales
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                  {selectedPackage.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                  ))}
              </ul>

              <div className="mt-6 border-t pt-4">
                <p className="text-center font-bold text-lg">
                    ¿Convencido? <span className="text-indigo-600">${selectedPackage.price}/mes</span>
                </p>
                <button
                    className={`w-full text-white px-6 py-3 rounded-lg font-semibold shadow-md mt-3 transition-colors ${selectedPackage.isPopular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => {
                        handleCloseModal();
                        handleSelectPackage(selectedPackage);
                    }}
                >
                    Comprar {selectedPackage.buttonLabel}
                </button>
              </div>

          </Modal>
      )}
    </Layout>
  );
}