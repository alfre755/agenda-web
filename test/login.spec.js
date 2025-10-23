/*const { test, expect } = require('@playwright/test');

test('Inicio de sesión con credenciales válidas', async ({ page }) => {
  await page.goto('http://localhost:3000/login'); // Ajusta la URL según tu ruta de login

  await page.fill('input[name="email"]', 'usuario@ejemplo.com');
  await page.fill('input[name="password"]', '123456');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/dashboard/); // Ajusta según la URL de tu dashboard
  await expect(page.locator('h1')).toContainText('Bienvenido'); // Ajusta el texto esperado
});

test('Inicio de sesión con credenciales inválidas muestra error', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('input[name="email"]', 'usuario@ejemplo.com');
  await page.fill('input[name="password"]', 'incorrecta');
  await page.click('button[type="submit"]');

  await expect(page.locator('.error')).toHaveText('Usuario o contraseña incorrectos'); // Ajusta el selector y el mensaje
});
*/