import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// 🔐 Cargamos la Bóveda de Secretos local (.env)
dotenv.config();

// Simplificamos el ID de ejecución para que sea local y no dependa de integraciones externas
const REPORT_NAME = process.env.REPORT_NAME || 'Certificacion_SPEI';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/api/*.spec.ts', '**/ui/*.spec.ts'],

  timeout: 60 * 1000,
  expect: { timeout: 10000 },

  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  globalSetup: './global-setup.ts',

  reporter: [
    ['list'], 
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    [
      'playwright-pdf-reporter',
      {
        // 📁 Ruta limpia y profesional para evidencias locales
        outputFolder: `./target/Evidencias_PDF/${REPORT_NAME}`,
        filename: `Reporte_Tecnico_SPEI`,
        aggregate: true
      }
    ]
  ],

  use: {
    // 💡 URL desde variable de entorno para no "quemar" ambientes
    baseURL: process.env.BASE_URL || 'https://sandbox-api.tu-fintech.com', 
    actionTimeout: 15000,
    screenshot: 'on',
    video: 'on',
    trace: 'on', // Fundamental para el análisis de fallos en SPEI
    headless: true,
  },

  projects: [
    {
      name: 'Chromium-Desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    // Dejamos uno mobile por si el examen pide validar la UI del comprobante
    {
      name: 'Mobile-Pixel7',
      use: { ...devices['Pixel 7'] },
    },
  ],
});