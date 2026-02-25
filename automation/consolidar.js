const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const root = process.cwd();
const manifiestoPath = path.join(root, 'config', 'audit-manifest.json');
const rutaEvidenciasPadre = path.join(root, 'target', 'Evidencias_PDF');

async function consolidarAuditoria() {
    console.log(`\n🚀 [AUDITORÍA] Verificando generación de evidencias...`);

    if (!fs.existsSync(manifiestoPath)) {
        console.error("❌ No existe audit-manifest.json.");
        return;
    }

    const manifiesto = fs.readJsonSync(manifiestoPath);

    for (const [tituloTest] of Object.entries(manifiesto)) {
        // BUSCAMOS EL PDF EN TU RUTA DE SIEMPRE
        const pdfPath = buscarPdfRecursivo(rutaEvidenciasPadre, tituloTest);
        
        if (!pdfPath) {
            console.log(`⏭️ No se encontró PDF para: "${tituloTest}" en target/Evidencias_PDF`);
            continue;
        }

        console.log(`✅ Evidencia encontrada en su ruta original:`);
        console.log(`   📂 ${path.relative(root, pdfPath)}`);
    }
    
    console.log(`\n🏁 Validación completada.`);
}

function buscarPdfRecursivo(dir, tituloTest) {
    if (!fs.existsSync(dir)) return null;
    const cleanSearch = tituloTest.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            const found = buscarPdfRecursivo(fullPath, tituloTest);
            if (found) return found;
        } else if (item.toLowerCase().endsWith('.pdf')) {
            const cleanFile = item.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            if (cleanFile.includes(cleanSearch)) return fullPath;
        }
    }
    return null;
}

consolidarAuditoria().catch(err => console.error("❌ Error Crítico:", err));