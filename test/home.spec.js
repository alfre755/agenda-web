const { test, expect } = require('@playwright/test');

// test 1: Verificar que la página principal carga correctamente y contiene los elementos esperados
test('La página principal carga correctamente', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Agenda/);

  // Botón "Iniciar sesión" dentro del main
  const loginButton = page.locator('main >> text=Iniciar sesión');

  // Botón "Contacto" dentro del main (solo botón)
  const contactButton = page.getByRole('button', { name: 'Contacto', exact: true });

  await expect(loginButton).toBeVisible();
  await expect(contactButton).toBeVisible();
});

// test 2: Verificar que al hacer click en "Iniciar sesión" se navega a la página de login
test('Navegación al login desde HomePage', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const loginButton = page.locator('main >> text=Iniciar sesión');

  // Hacer click en el botón correcto
  await loginButton.click();
  await expect(page).toHaveURL(/\/auth/);
});
