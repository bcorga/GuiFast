import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Icono para cerrar

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // 1. Fondo semi-transparente que cubre toda la pantalla
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      
      {/* 2. Contenedor principal del Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 transform transition-all duration-300 scale-100">
        
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          
          {/* Botón de Cerrar */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Contenido (El detalle del paquete) */}
        <div className="text-gray-700 max-h-96 overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;