import { test, expect } from '@playwright/test';

// Define la URL de la página de productos (asumiendo que se monta en /products)
const PRODUCTS_URL = 'http://localhost:3000/products';

test.describe('CP-21.01: Mostrar 3 Packs en la Vista de Productos', () => {

    test('Debe visualizarse la estructura correcta con los 3 paquetes y sus datos clave', async ({ page }) => {
        // 1. Navegar a la página de Productos/Packs
        await page.goto(PRODUCTS_URL);

        // 2. Verificar la presencia del encabezado principal de la página
        await expect(page.getByRole('heading', { name: 'Planes de Suscripción', level: 1 })).toBeVisible();

        // 3. Verificar la cantidad de tarjetas de paquetes (debe haber 3)
        // Usamos el selector CSS que identifica las tarjetas de paquetes de manera única
        const packageCardsLocator = page.locator('.bg-white.p-6.rounded-xl.shadow-lg');
        // Nota: Si el selector es demasiado genérico, podemos usar un selector más específico 
        // como '.grid-cols-3 > div[class*="bg-white p-6 rounded-xl"]' si Tailwind está disponible.
        // Asumiendo que las tarjetas son los divs hijos directos del grid.
        
        await expect(packageCardsLocator).toHaveCount(3);
        const packageCards = await packageCardsLocator.all();

        // 4. Verificar el contenido de cada paquete
        
        // Paquete 1: Inicial
        const package1 = packageCards[0];
        await expect(package1.getByRole('heading', { name: 'Paquete Inicial', level: 2 })).toBeVisible();

        // 🟢 CORRECCIÓN: El precio ($10 / mes) está dividido en dos <p>
        // Verificamos los dos componentes de texto por separado:

        // 1. Verificar la parte del monto ($10)
        await expect(package1.getByText('$10')).toBeVisible(); 

        // 2. Verificar la parte de la frecuencia (/ mes)
        await expect(package1.getByText('/ mes')).toBeVisible(); // <-- SOLUCIÓN

        await expect(package1.getByText('Ideal para creadores que comienzan')).toBeVisible();

        // Paquete 2: Extra (Popular)
        const package2 = packageCards[1];
        await expect(package2.getByRole('heading', { name: 'Paquete Extra', level: 2 })).toBeVisible();

        // Aplicar la misma corrección al Paquete 2
        await expect(package2.getByText('$30')).toBeVisible();
        await expect(package2.getByText('/ mes')).toBeVisible();

        await expect(package2.getByText('Perfecto para usuarios frecuentes')).toBeVisible();
        await expect(package2.getByText('Más Popular')).toBeVisible();

        // Paquete 3: Premium
        const package3 = packageCards[2];
        await expect(package3.getByRole('heading', { name: 'Paquete Premium', level: 2 })).toBeVisible();

        // Aplicar la misma corrección al Paquete 3
        await expect(package3.getByText('$50')).toBeVisible();
        await expect(package3.getByText('/ mes')).toBeVisible();
        
    await expect(package3.getByText('Lo mejor para equipos y profesionales')).toBeVisible();

        // 5. Verificar que el botón de selección esté presente en al menos uno.
        await expect(page.getByRole('button', { name: 'Seleccionar Paquete Extra' })).toBeVisible();

        console.log('Verificación CP-21.01 completada: Los 3 paquetes y sus datos clave son visibles.');
    });
});