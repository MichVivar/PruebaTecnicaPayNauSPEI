import fs from 'fs';
import path from 'path';

/**
 * Global Setup optimizado para Certificación SPEI.
 * Ahora se encarga de preparar el entorno local y validar la Bóveda de Secretos ($0 costo).
 */
async function globalSetup() {
    console.log('--- 🏗️ PREPARANDO ENTORNO DE CERTIFICACIÓN SPEI ---');
    const start = Date.now();

    const baseDir = path.resolve(__dirname, '../'); 
    const dirsToClean = [
        path.join(baseDir, 'allure-results'),
        path.join(baseDir, 'playwright-report'),
        path.join(baseDir, 'test-results')
    ]
    
    // 1. Limpieza de evidencias locales (para no mezclar ejecuciones)
    dirsToClean.forEach(dir => {
        if (fs.existsSync(dir)) {
            // Borra y recrea para asegurar limpieza total antes del examen
            fs.rmSync(dir, { recursive: true, force: true });
        }
        fs.mkdirSync(dir, { recursive: true });
    });

    // 2. Validación de la Bóveda de Secretos (Variables de Entorno)
    // Esto asegura que el framework no falle a mitad de camino por falta de credenciales
    const requiredSecrets = ['BASE_URL', 'API_KEY_SPEI', 'DB_PASSWORD'];
    const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);

    if (missingSecrets.length > 0) {
        console.error('❌ ERROR DE SEGURIDAD: Faltan secretos en la bóveda:', missingSecrets);
        // En un examen, esto demuestra que tu framework protege la integridad de la prueba
        process.exit(1); 
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ Entorno listo y Secretos validados en ${duration}s.\n`);
}

export default globalSetup;