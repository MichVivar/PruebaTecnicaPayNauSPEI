/**
 * @file consolidar.js
 * @description Centraliza todas las evidencias dentro de la carpeta de la sesión en Evidencias_PDF.
 */

const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const root = process.cwd();
const EJECUCION_ID = process.env.EJECUCION_ID || process.env.RUN_ID;
const baseEvidencias = path.join(root, 'target', 'Evidencias_PDF');

async function consolidarEnRutaUnica() {
    console.log(`\n🚀 [CONSOLIDACIÓN] Unificando reportes técnicos...`);

    // 1. Identificar la carpeta de la sesión más reciente
    let carpetaSesion = path.join(baseEvidencias, EJECUCION_ID || '');
    
    if (!EJECUCION_ID || !fs.existsSync(carpetaSesion)) {
        const carpetas = fs.readdirSync(baseEvidencias)
            .filter(name => fs.statSync(path.join(baseEvidencias, name)).isDirectory())
            .map(name => ({ name, time: fs.statSync(path.join(baseEvidencias, name)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);
        
        if (carpetas.length === 0) return console.error("❌ No se encontraron carpetas de evidencia.");
        carpetaSesion = path.join(baseEvidencias, carpetas[0].name);
    }

    console.log(`📂 Carpeta de destino: ${path.relative(root, carpetaSesion)}`);

    // 2. Rutas de origen (Playwright Nativo)
    const rutaPlaywrightHTML = path.join(root, 'playwright-report');
    const rutaPlaywrightPDF = path.join(rutaPlaywrightHTML, 'pdf', 'test-report.pdf');

    // 3. MOVER REPORTES TÉCNICOS AL INTERIOR DE LA EVIDENCIA
    try {
        if (fs.existsSync(rutaPlaywrightHTML)) {
            const destinoTecnico = path.join(carpetaSesion, 'Reporte_Tecnico_HTML');
            await fs.copy(rutaPlaywrightHTML, destinoTecnico);
            console.log(`   ✅ Reporte HTML integrado en la sesión.`);
        }

        if (fs.existsSync(rutaPlaywrightPDF)) {
            // Lo renombramos para que sea claro en la raíz de la carpeta de evidencia
            await fs.copy(rutaPlaywrightPDF, path.join(carpetaSesion, 'Anexo_Tecnico_Detallado.pdf'));
            console.log(`   ✅ Anexo PDF técnico integrado.`);
        }
    } catch (err) {
        console.warn(`   ⚠️ Error al mover reportes técnicos: ${err.message}`);
    }

    console.log(`\n🏁 Proceso finalizado. Todo vive en Evidencias_PDF.`);
}

consolidarEnRutaUnica().catch(err => console.error("❌ Error Crítico:", err));