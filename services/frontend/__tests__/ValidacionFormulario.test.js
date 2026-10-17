import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../pages/index';

// Mock the fetch API (Fundamental: debe verificarse que NUNCA se llame)
global.fetch = jest.fn();

// Mock del componente de ícono
jest.mock('lucide-react', () => ({
  AlertTriangle: (props) => <div data-testid="MockedComponent" {...props} />,
  Lightbulb: (props) => <div data-testid="MockedComponent" {...props} />,
}));

describe('Formulario de Generación - Validación de Campos', () => {
  // Configuración de mock antes de cada test
  beforeEach(() => {
    fetch.mockClear();
    document.body.innerHTML = '';
  });

  // Test 1: Validación de campo requerido (Prompt muy corto)
  test('Debe mostrar un mensaje de error y NO llamar a la API si el prompt es muy corto', async () => {
    // 1. Renderizar el componente
    render(<App />);

    // 2. Obtener elementos necesarios
    const promptTextarea = screen.getByLabelText(/idea inicial \(prompt\)/i);
    // Usamos getByRole para apuntar específicamente al botón.
    const generateButton = screen.getByRole('button', { name: /Generar Guion/i });

    // 3. Ingresar un valor inválido (menor a 10 caracteres)
    fireEvent.change(promptTextarea, { target: { value: 'corto' } });

    // 4. Hacer clic en el botón de generación
    fireEvent.click(generateButton);

    // 5. Aserciones
    await waitFor(() => {
        // a) Se ajusta el mensaje de error esperado para coincidir con el DOM.
        expect(screen.getByText(/Por favor, introduce una idea más detallada para el guion\./i)).toBeInTheDocument();
        
        // b) ¡La aserción MÁS IMPORTANTE! Verificar que la función fetch NUNCA fue llamada.
        expect(fetch).not.toHaveBeenCalled();
        
        // c) Verificamos el botón real.
        expect(generateButton).toBeInTheDocument();
    });
  });
  
  // Test 2: Verificación del estado inicial (Placeholder)
  test('Debe mostrar el mensaje placeholder inicial en una sesión limpia/nueva', () => {
    // 1. Renderizar el componente
    render(<App />);

    // 2. Aserción
    // Verificar que el mensaje placeholder de la sección de resultados esté visible
    expect(screen.getByText(/El guion generado aparecerá aquí\./i)).toBeInTheDocument();
  });
});