import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../pages/index';

// Test simple para verificar que el select 'Tono' tenga el valor 'neutral' por defecto.

describe('Valores Iniciales del Formulario', () => {
  
  // Test 1: El campo Tono debe tener "Neutral" seleccionado por defecto.
  test('Debe inicializar el campo "Tono del Guion" con el valor "neutral" seleccionado', () => {
    // 1. Renderizar el componente
    render(<App />);

    // 2. Obtener el elemento <select>
    // Usamos getByLabelText para encontrar el select asociado a la etiqueta 'Tono del Guion'
    const tonoSelect = screen.getByLabelText(/Tono del Guion/i);

    // 3. Aserciones
    
    // a) Verificar que el elemento exista
    expect(tonoSelect).toBeInTheDocument();
    
    // b) Verificar que el valor por defecto (default value) del select sea 'neutral'
    expect(tonoSelect).toHaveValue('neutral');

    // c) Opcional: Verificar que la opción "Neutral" esté seleccionada
    const neutralOption = screen.getByRole('option', { name: 'Neutral' });
    expect(neutralOption.selected).toBe(true);
  });
});