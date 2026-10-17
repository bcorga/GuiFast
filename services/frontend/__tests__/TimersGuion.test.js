import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../pages/index';

// Mensaje de resultado simulado de la API
const MOCKED_RESULT_FULL = "ACTO 1. ESCENA 1: Dos astronautas perdidos en el tiempo encuentran una reliquia antigua.";
// Separamos el texto en dos partes porque la aplicación lo renderiza en dos elementos distintos:
const MOCKED_HEADER = "ACTO 1. ESCENA 1";
const MOCKED_BODY = "Dos astronautas perdidos en el tiempo encuentran una reliquia antigua.";

// Mock de la función global fetch para simular la respuesta exitosa de la API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ generated_text: MOCKED_RESULT_FULL }),
  })
);

// Mock del componente de ícono
jest.mock('lucide-react', () => ({
  AlertTriangle: (props) => <div data-testid="MockedComponent" {...props} />,
  Lightbulb: (props) => <div data-testid="MockedComponent" {...props} />,
}));

describe('Gestión de Estado y Timers del Guion', () => {
  // Habilitar los timers simulados de Jest
  jest.useFakeTimers();

  // Configuración de mock antes de cada test
  beforeEach(() => {
    fetch.mockClear();
    document.body.innerHTML = '';
  });

  // Test 1: Verificar que el contenido generado persiste después de 5 minutos
  test('El contenido generado debe persistir en la pantalla después de la expiración de un timer (5 minutos)', async () => {
    // 1. Renderizar el componente
    render(<App />);

    // 2. Obtener elementos
    const promptTextarea = screen.getByLabelText(/idea inicial \(prompt\)/i);
    const generateButton = screen.getByRole('button', { name: /Generar Guion/i });
    
    // 3. Generar el contenido (simulación de éxito)
    fireEvent.change(promptTextarea, { target: { value: 'Una idea muy detallada con más de 10 caracteres.' } });
    fireEvent.click(generateButton);

    // Esperar a que la generación finalice y el resultado se muestre
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      // CORRECCIÓN: Verificamos las dos partes del guion por separado
      expect(screen.getByText(MOCKED_HEADER, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(MOCKED_BODY, { exact: false })).toBeInTheDocument();
    });

    // 4. Simular el paso del tiempo (5 minutos)
    const fiveMinutesInMs = 5 * 60 * 1000;
    // Jest avanza el reloj simulado instantáneamente
    jest.advanceTimersByTime(fiveMinutesInMs);
    
    // 5. Aserción final
    // Verificar que, después de 5 minutos, ambas partes del contenido AÚN estén en el DOM.
    await waitFor(() => {
        expect(screen.getByText(MOCKED_HEADER, { exact: false })).toBeInTheDocument();
        expect(screen.getByText(MOCKED_BODY, { exact: false })).toBeInTheDocument();
    });
    
    // Verificar que el mensaje placeholder no haya reaparecido
    expect(screen.queryByText(/El guion generado aparecerá aquí\./i)).not.toBeInTheDocument();
  });
});