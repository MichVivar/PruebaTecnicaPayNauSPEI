/**
 * @file consolidar-evidencia.ts
 * @description Orquestador de evidencias técnico-funcionales.
 * Consolida los PDFs generados y los resultados de Playwright en un reporte de auditoría local.
 */

const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// --- 1. CONFIGURACIÓN DE RUTAS ---
const browserName = (process.env.BROWSER || 'chromium').toLowerCase();
const root = process.cwd();
const jsonReportPath = path.join(root, 'test-results.json');
const manifiestoPath = path.join(root, 'config', 'audit-manifest.json');
const carpetaFinalCertificados = path.join(root, 'target', 'ENTREGA_CERTIFICADA');

/**
 * Función Principal de Consolidación Local
 */
async function consolidarAuditoria() {
    console.log(`\n🚀 [AUDITORÍA] Iniciando consolidación de evidencias para: ${browserName.toUpperCase()}`);

    if (!fs.existsSync(manifiestoPath)) {
        console.error("❌ No existe audit-manifest.json. Ejecuta el sync primero.");
        return;
    }

    const manifiesto = fs.readJsonSync(manifiestoPath);
    const reportData = fs.existsSync(jsonReportPath) ? fs.readJsonSync(jsonReportPath) : null;

    // Asegurar que exista la carpeta de entrega
    await fs.ensureDir(carpetaFinalCertificados);

    for (const [tituloTest, info] of Object.entries(manifiesto)) {
        // Buscamos el PDF que generó el test-base
        const pdfPath = buscarPdfRecursivo(path.join(root, 'target', 'Evidencias_PDF'), tituloTest);
        
        if (!pdfPath) {
            console.log(`⏭️ No se encontró PDF para: "${tituloTest}"`);
            continue;
        }

        // Determinar estado desde el JSON de Playwright
        let estadoReal = "passed";
        if (reportData && reportData.suites) {
            const spec = buscarSpecPorProyecto(reportData.suites, tituloTest, browserName);
            if (spec && spec.tests[0].results) {
                estadoReal = spec.tests[0].results[spec.tests[0].results.length - 1].status;
            }
        }

        console.log(`\n🔎 Procesando: ${tituloTest} -> [${estadoReal.toUpperCase()}]`);
        
        // --- 📂 ORGANIZACIÓN DE ENTREGA ---
        // Copiamos los PDFs aprobados a una carpeta limpia de "Entrega"
        const nombreArchivoFinal = `${estadoReal.toUpperCase()}_${tituloTest.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        const destinoFinal = path.join(carpetaFinalCertificados, nombreArchivoFinal);
        
        await fs.copy(pdfPath, destinoFinal);
        console.log(`   ✅ Evidencia certificada y movida a: ${nombreArchivoFinal}`);
    }
    
    console.log(`\n🏁 Certificación local completada. Carpeta lista para entrega: /target/ENTREGA_CERTIFICADA`);
}

/**
 * Busca un archivo PDF de forma recursiva
 */
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

/**
 * Busca el spec en el reporte JSON
 */
const buscarSpecPorProyecto = (suites, tituloTest, proyectoEsperado) => {
    for (const item of suites) {
        if (item.specs) {
            const spec = item.specs.find(s => s.title === tituloTest);
            if (spec) {
                const testCorrecto = spec.tests.find(t => 
                    t.projectName.toLowerCase().includes(proyectoEsperado.toLowerCase())
                );
                if (testCorrecto) return { ...spec, tests: [testCorrecto] };
            }
        }
        if (item.suites) {
            const found = buscarSpecPorProyecto(item.suites, tituloTest, proyectoEsperado);
            if (found) return found;
        }
    }
    return null;
};

consolidarAuditoria().catch(err => console.error("❌ Error Crítico:", err));