import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../pages/index'; 

// Spies para la consola
let consoleErrorSpy;
const originalFetch = global.fetch;

beforeAll(() => {
  // Espiar console.error para evitar que los logs de error de la prueba llenen la consola
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // Restaurar la implementación original de fetch y console.error
  global.fetch = originalFetch;
  consoleErrorSpy.mockRestore();
});


describe('Home Page - Generador de Guiones', () => {

  it('Debe mostrar un mensaje de error de conexión al simular un error 500/Network Failure', async () => {
    // 2. CONFIGURACIÓN DEL MOCK para el error 500 (Simulación de falla de red)
    global.fetch = jest.fn(() => Promise.reject(new Error("Network Error/Simulated 500")));

    const user = userEvent.setup();
    render(<Home />);

    // 3. Simular la entrada del usuario (guion)
    const inputPrompt = screen.getByPlaceholderText(/Un diálogo corto entre un robot/i);
    await user.type(inputPrompt, 'Esta es una idea de guion de más de 10 caracteres.');

    // 4. Simular clic en el botón Generar
    const generateButton = screen.getByRole('button', { name: /Generar Guion/i });
    await user.click(generateButton);
    
    // 5. Esperar a que el proceso termine y el mensaje de error aparezca
    await waitFor(() => {
      // a) Verificar que el botón ha revertido a su estado final de no-carga.
      expect(screen.getByRole('button', { name: 'Generar Guion' })).toBeInTheDocument();
      
      // b) Verificar que se muestre el mensaje de error específico del catch block (evidencia del CP-02.02)
      const errorMessage = "Error de conexión con el Microservicio de IA (Puerto 8000). Asegúrate de que Docker esté levantado.";
      expect(screen.getByText(errorMessage)).toBeInTheDocument();

      // c) Verificar que el mock de fetch fue llamado.
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/generate", expect.any(Object));
    });
  });
  
  it('Debe mostrar el guion generado con éxito', async () => {
    // Mock de éxito: Status 200
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ generated_text: "TÍTULO: Café Cósmico\nPERSONAJE A: ¿Te gusta el café?\n" }),
      })
    );
    
    const user = userEvent.setup();
    render(<Home />);

    const inputPrompt = screen.getByPlaceholderText(/Un diálogo corto entre un robot/i);
    await user.type(inputPrompt, 'Test de éxito.');

    const generateButton = screen.getByRole('button', { name: /Generar Guion/i });
    await user.click(generateButton);

    await waitFor(() => {
        // Verifica el mensaje de éxito (evidencia de caso de éxito)
        const successMessage = '¡Guion generado con éxito! Puedes revisarlo o guardarlo ahora.';
        expect(screen.getByText(successMessage)).toBeInTheDocument();
        
        // Verifica el contenido generado
        expect(screen.getByText(/Café Cósmico/i)).toBeInTheDocument();
    });
  });
});