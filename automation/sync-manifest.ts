import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs-extra'; 
import path from 'path';
import { glob } from 'glob';

/**
 * @description Generador de Manifiesto Simplificado.
 * Lee los tests y extrae Título + Pasos para el PDF.
 */

const project = new Project();
const CONFIG_DIR = path.join(process.cwd(), 'config');
const MANIFEST_PATH = path.join(CONFIG_DIR, 'audit-manifest.json'); 
const FILES_TO_SCAN = glob.sync('./tests/**/*.spec.ts'); 

if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR);

async function sincronizarEstructuraAuditoria() {
    console.log(`🚀 [SYNC]: Extrayendo escenarios y pasos...`);

    const manifiesto: any = {};

    for (const fileRoute of FILES_TO_SCAN) {
        // Añadimos el archivo al proyecto de ts-morph para analizarlo
        const sourceFile = project.addSourceFileAtPath(fileRoute);
        
        // Buscamos todas las funciones test('titulo', ...)
        const testCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter(call => {
                const expr = call.getExpression().getText();
                return (expr === 'test' || expr.startsWith('test.')) && expr !== 'test.describe';
            });

        for (const call of testCalls) {
            // 1. Extraer el Título del Test
            const title = call.getArguments()[0]?.getText().replace(/['"`]/g, '');
            
            // 2. Extraer los nombres de los makeStep
            const steps: string[] = [];
            call.getDescendantsOfKind(SyntaxKind.CallExpression)
                .filter(c => c.getExpression().getText() === 'makeStep')
                .forEach(c => {
                    const stepTitle = c.getArguments()[0]?.getText().replace(/['"`]/g, '');
                    if (stepTitle) steps.push(stepTitle);
                });

            // 3. Guardar solo si hay pasos (para que el JSON esté limpio)
            if (title && steps.length > 0) {
                manifiesto[title] = {
                    steps: steps
                };
            }
        }
    }

    if (Object.keys(manifiesto).length === 0) {
        return console.warn('\n⚠️ No se encontraron tests con la función makeStep.');
    }

    // Guardar el JSON (Formato super sencillo)
    fs.writeJsonSync(MANIFEST_PATH, manifiesto, { spaces: 4 });

    console.log(`\n✅ [ÉXITO]: Manifiesto generado en config/audit-manifest.json`);
    console.table(Object.keys(manifiesto).map(t => ({ 
        'Test': t.substring(0, 50), 
        'Total Pasos': manifiesto[t].steps.length 
    })));
}

sincronizarEstructuraAuditoria().catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
});