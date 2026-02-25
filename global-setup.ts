import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv'; // 👈 Importante para leer el .env local

async function globalSetup() {
    console.log('--- 🏗️ PREPARANDO ENTORNO DE CERTIFICACIÓN SPEI ---');
    const start = Date.now();

    // 1. Cargar la Bóveda Local (.env) 
    // En GitHub Actions no hará nada (porque no hay .env), pero en local es vital.
    dotenv.config();

    // Ajustamos la ruta para que siempre apunte a la raíz real del proyecto
    const baseDir = process.cwd(); 
    const dirsToClean = [
        path.join(baseDir, 'allure-results'),
        path.join(baseDir, 'playwright-report'),
        path.join(baseDir, 'test-results'),
        path.join(baseDir, 'target') // 👈 Agregamos target para limpiar tus PDFs anteriores
    ];
    
    // 2. Limpieza de evidencias
    if (process.env.CI) {
        dirsToClean.forEach(dir => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    fs.rmSync(path.join(dir, file), { recursive: true, force: true });
                }
            }
        });
        console.log('🧹 [CI] Entorno limpiado para ejecución fresca.');
    } else {
        console.log('📚 [LOCAL] Manteniendo historial de evidencias.');
    }

    // 3. Validación de la Bóveda (Inyección de Secretos)
    const requiredSecrets = ['BASE_URL', 'API_KEY_SPEI', 'DB_PASSWORD'];
    const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);

    if (missingSecrets.length > 0) {
        console.error('--------------------------------------------------------');
        console.error('❌ ERROR DE SEGURIDAD: Bóveda incompleta.');
        console.error('Faltan los siguientes secretos:', missingSecrets.join(', '));
        console.error('--------------------------------------------------------');
        process.exit(1); 
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ Bóveda validada y entorno limpio en ${duration}s.\n`);
}

export default globalSetup;