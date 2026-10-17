import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// Asegúrate de que esta ruta sea correcta para importar ProfileSettings
import ProfileSettings from '../components/ProfileSettings'; 

// --- Configuración de Mocks ---

// 1. Mock de la función global fetch para evitar llamadas de red reales
global.fetch = jest.fn();

// 2. Mock de localStorage, ya que ProfileSettings.js lo usa para obtener el email y guardar los datos actualizados
const localStorageMock = {
    getItem: jest.fn((key) => {
        // Simular que el email está en localStorage
        if (key === "userEmail") return "test@example.com";
        return null;
    }),
    setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de las props iniciales
const mockSetUser = jest.fn();
const initialUser = {
    username: "TestUser",
    avatar: "http://example.com/test.jpg"
};

// --- Grupo de Pruebas ---

describe('Validación y Envío de ProfileSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // CRITERIO CUMPLIDO: Validación cuando falta el nombre de usuario
    test('No debe enviar la solicitud si falta el nombre de usuario y debe mostrar mensaje de error', async () => {
        render(<ProfileSettings user={initialUser} setUser={mockSetUser} />);

        // 1. Obtener elementos
        // CORRECCIÓN: Usar getAllByRole('textbox') y seleccionar por índice
        const textboxes = screen.getAllByRole('textbox');
        const usernameInput = textboxes[0]; // El primer input de texto es el Nombre de usuario
        const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });

        // 2. Simular borrar el nombre de usuario
        fireEvent.change(usernameInput, { target: { value: '' } });

        // 3. Disparar la actualización
        fireEvent.click(saveButton);

        // 4. Aserciones de validación
        // La función fetch NO debe ser llamada
        expect(fetch).not.toHaveBeenCalled();

        // El mensaje de error debe ser visible
        await waitFor(() => {
            expect(screen.getByText('Nombre y avatar son obligatorios.')).toBeInTheDocument();
        });
    });

    // CRITERIO CUMPLIDO: Validación cuando falta la URL del avatar
    test('No debe enviar la solicitud si falta la URL del avatar y debe mostrar mensaje de error', async () => {
        render(<ProfileSettings user={initialUser} setUser={mockSetUser} />);

        // 1. Obtener elementos
        // CORRECCIÓN: Usar getAllByRole('textbox') y seleccionar por índice
        const textboxes = screen.getAllByRole('textbox');
        const avatarInput = textboxes[1]; // El segundo input de texto es el Avatar
        const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });

        // 2. Simular borrar la URL del avatar
        fireEvent.change(avatarInput, { target: { value: '' } });

        // 3. Disparar la actualización
        fireEvent.click(saveButton);

        // 4. Aserciones de validación
        // La función fetch NO debe ser llamada
        expect(fetch).not.toHaveBeenCalled();

        // El mensaje de error debe ser visible
        await waitFor(() => {
            expect(screen.getByText('Nombre y avatar son obligatorios.')).toBeInTheDocument();
        });
    });
    
    // Test de confirmación: Éxito en la validación y envío al servidor
    test('Debe enviar la solicitud al servidor si los campos son válidos', async () => {
        // Mockear respuesta exitosa del fetch
        const newUsername = "NewTestUser";
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ username: newUsername, avatar: initialUser.avatar }),
        });
        
        render(<ProfileSettings user={initialUser} setUser={mockSetUser} />);

        // 1. Obtener elementos
        // CORRECCIÓN: Usar getAllByRole('textbox') y seleccionar por índice
        const textboxes = screen.getAllByRole('textbox');
        const usernameInput = textboxes[0];
        const saveButton = screen.getByRole('button', { name: /Guardar cambios/i });
        
        // 2. Simular un cambio válido
        fireEvent.change(usernameInput, { target: { value: newUsername } });

        // 3. Disparar la actualización
        fireEvent.click(saveButton);

        // 4. Aserciones de éxito
        await waitFor(() => {
            // La función fetch DEBE ser llamada
            expect(fetch).toHaveBeenCalledTimes(1);
            
            // El mensaje de éxito debe ser visible
            expect(screen.getByText('Perfil actualizado con éxito.')).toBeInTheDocument();

            // Los items de localStorage deben actualizarse
            expect(localStorageMock.setItem).toHaveBeenCalledWith("username", newUsername);
        });
    });
});