import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../pages/index';

// Mock del resultado de la API que verifica el payload enviado.
// En lugar de devolver un guion, devolveremos una confirmación de qué estilo se usó y qué tono se usó.
const MOCKED_RESULT_FUNCTION = (style, tone) => `El sistema usó el estilo: ${style} y el tono: ${tone}.`;

// Mock de la función global fetch para simular la respuesta de la API
global.fetch = jest.fn((url, options) => {
  const payload = JSON.parse(options.body);
  // CORRECCIÓN: Leer el valor del payload usando la clave 'estilo' y 'tone' (como se envía desde App.js)
  const selectedStyle = payload.estilo; 
  const selectedTone = payload.tone; // <--- CORREGIDO: Usar la clave 'tone' (la que envía el componente)
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ generated_text: MOCKED_RESULT_FUNCTION(selectedStyle, selectedTone) }),
  });
});

// Mock del componente de ícono
jest.mock('lucide-react', () => ({
  AlertTriangle: (props) => <div data-testid="MockedComponent" {...props} />,
  Lightbulb: (props) => <div data-testid="MockedComponent" {...props} />,
}));

// Función utilitaria para seleccionar una opción por su valor (mejora la legibilidad)
const selectOptionByValue = (selectElement, value) => {
    fireEvent.change(selectElement, { target: { value: value } });
};

describe('Lógica de Cambio de Estilo (onChange)', () => {
  
  beforeEach(() => {
    fetch.mockClear();
    document.body.innerHTML = '';
  });

  // Test 1: El estado debe actualizarse solo con el último valor seleccionado, descartando los anteriores.
  test('La generación debe utilizar el ÚLTIMO estilo seleccionado y el estado de tono actual', async () => {
    // 1. Renderizar el componente
    render(<App />);

    // 2. Obtener elementos necesarios
    const promptTextarea = screen.getByLabelText(/idea inicial \(prompt\)/i);
    const tonoSelect = screen.getByLabelText(/Tono del Guion/i);
    const estiloSelect = screen.getByLabelText(/Estilo del Guion/i);
    const generateButton = screen.getByRole('button', { name: /Generar Guion/i });

    // 3. Simular cambios secuenciales en el select de Estilo, y asegurar un Tono.

    // a) Establecer el Tono a 'formal' (Valor que se espera recibir en el payload)
    const expectedTone = 'formal';
    selectOptionByValue(tonoSelect, expectedTone);
    expect(tonoSelect).toHaveValue(expectedTone);

    // b) Simular cambios secuenciales en el select de Estilo: Cómico (default) → Narrativo → Publicitario (FINAL)
    
    // i) El valor inicial es 'comico' (punto de partida)
    expect(estiloSelect).toHaveValue('comico');

    // ii) Cambiar a 'narrativo' (intermedio, debe ser descartado)
    selectOptionByValue(estiloSelect, 'narrativo');
    expect(estiloSelect).toHaveValue('narrativo');

    // iii) Cambiar a 'publicitario' (FINAL: Este debe ser el valor que la API reciba)
    const expectedStyle = 'publicitario';
    selectOptionByValue(estiloSelect, expectedStyle);
    // Verificamos que el cambio se refleje en el DOM
    expect(estiloSelect).toHaveValue(expectedStyle);

    // 4. Completar el campo de prompt para pasar la validación y disparar la generación
    const validPrompt = 'Una idea publicitaria para un nuevo tipo de café orgánico.';
    fireEvent.change(promptTextarea, { target: { value: validPrompt } });
    
    // 5. Disparar el evento de generación
    fireEvent.click(generateButton);

    // 6. Aserciones
    await waitFor(() => {
        // a) Verificar que fetch fue llamado una vez
        expect(fetch).toHaveBeenCalledTimes(1);

        // b) Verificar el payload de la llamada a la API
        const fetchCallArgs = fetch.mock.calls[0][1]; 
        const payload = JSON.parse(fetchCallArgs.body);

        // DEBUGGING: Imprimimos el payload para que el usuario vea exactamente qué se envió.
        //console.log("Payload recibido en fetch:", payload);
        
        // Verificamos que el estilo sea el último seleccionado (usando la clave 'estilo')
        expect(payload.estilo).toBe(expectedStyle); // 'publicitario'
        
        // Verificamos que el tono también esté en el payload (usando la clave 'tone').
        expect(payload.tone).toBe(expectedTone); // <--- CORREGIDO: Usar 'tone' en la aserción

        expect(payload.prompt).toBe(validPrompt);

        // c) Verificar que el resultado renderizado en la UI confirma que se usó el estilo correcto
        const expectedText = MOCKED_RESULT_FUNCTION(expectedStyle, expectedTone);
        expect(screen.getByText(expectedText, { exact: false })).toBeInTheDocument();
    }, { timeout: 4000 }); // Aumento el timeout por si el problema es de sincronización

    // Comprobación de depuración: Si el error persiste, el problema está en App.js
    if (fetch.mock.calls.length > 0) {
        const payloadCheck = JSON.parse(fetch.mock.calls[0][1].body);
        
        // Comprobación de depuración para estilo
        if (payloadCheck.estilo !== expectedStyle) {
             console.error(`DEBUG: El estilo capturado por la app es '${payloadCheck.estilo}', se esperaba '${expectedStyle}'. Asegúrate de que el componente App.js tiene un 'onChange' correcto para el select de estilo.`);
        }

        // Comprobación de depuración para tono
        if (payloadCheck.tone !== expectedTone) {
             console.error(`DEBUG: El tono capturado por la app es '${payloadCheck.tone}', se esperaba '${expectedTone}'. Asegúrate de que el componente App.js tiene un 'onChange' correcto para el select de tono, y que el estado se actualizó antes de llamar a handleGenerate.`);
        }
    }
  });
});