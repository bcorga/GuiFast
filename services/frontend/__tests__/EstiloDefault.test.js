import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../pages/index';

// Test simple para verificar que el select 'Estilo' tenga el valor 'comico' por defecto.

describe('Valores Iniciales del Formulario', () => {
  
  // Test 1: El campo Estilo debe tener "Cómico" seleccionado por defecto.
  test('Debe inicializar el campo "Estilo del Guion" con el valor "comico" seleccionado', () => {
    // 1. Renderizar el componente
    render(<App />);

    // 2. Obtener el elemento <select>
    // Usamos getByLabelText para encontrar el select asociado a la etiqueta 'Estilo del Guion'
    const estiloSelect = screen.getByLabelText(/Estilo del Guion/i);

    // 3. Aserciones
    
    // a) Verificar que el elemento exista
    expect(estiloSelect).toBeInTheDocument();
    
    // b) Verificar que el valor por defecto (default value) del select sea 'comico'
    expect(estiloSelect).toHaveValue('comico');

    // c) Opcional: Verificar que la opción "Cómico" esté seleccionada
    const comicoOption = screen.getByRole('option', { name: 'Cómico' });
    expect(comicoOption.selected).toBe(true);
  });
});