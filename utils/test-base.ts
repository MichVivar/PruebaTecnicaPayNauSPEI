import { test as base, expect, TestInfo } from '@playwright/test';
import { PageManager } from '../pages/page-manager';
import { generateCorporatePDF_V2 } from '../automation/evidence-generator-v2';
import * as fs from 'fs-extra';
import * as path from 'path';

let auditManifest: any = {};

const MANIFEST_PATH = path.resolve(__dirname, '../config/audit-manifest.json');

// 3. Intentamos cargarlo dinámicamente
if (fs.existsSync(MANIFEST_PATH)) {
    auditManifest = fs.readJsonSync(MANIFEST_PATH);
} else {
    // Si no existe, dejamos un objeto vacío para que el QA sepa que debe hacer "sync"
    console.warn('⚠️ [Aviso] No se encontró audit-manifest.json. Corre el script de sync para generarlo.');
}

interface StepReport {
    title: string;
    screenshotPath: string;
    status: 'passed' | 'failed' | 'skipped' | 'pending';
    apiInfo?: any;
    vitals?: any;
}

export interface MyFixtures {
    pm: PageManager;
    // 🎯 Se inyecta una función de auditoría local en lugar de Jira
    makeStep: (title: string, task: () => Promise<void>, apiData?: any) => Promise<void>;
}

// 📁 Carpeta para memoria de estructuras (Útil para depuración local)
const MEMORY_DIR = path.join(process.cwd(), 'config', 'test-structures');

async function captureWebVitals(page: any) {
    try {
        return await page.evaluate(() => {
            const [entry] = performance.getEntriesByType("navigation") as any;
            if (!entry) return null;
            return {
                loadTime: Number((entry.loadEventEnd / 1000).toFixed(2)),
                ttfb: Number((entry.responseStart / 1000).toFixed(2)),
                domReady: Number((entry.domContentLoadedEventEnd / 1000).toFixed(2))
            };
        });
    } catch (e) { return null; }
}

export const test = base.extend<MyFixtures>({
    pm: async ({ page }, use) => { await use(new PageManager(page)); },

    makeStep: async ({ page }, use, testInfo: TestInfo) => {
        const currentAttemptSteps: StepReport[] = [];
        const testKey = testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const makeStep = async (title: string, task: () => Promise<void>, apiData?: any) => {
            const stepEntry: StepReport = { title, screenshotPath: '', apiInfo: apiData, status: 'skipped' };
            currentAttemptSteps.push(stepEntry);

            await base.step(title, async () => {
                try {
                    stepEntry.status = 'pending';
                    await task();
                    stepEntry.status = 'passed';
                    
                    if (!page.isClosed()) {
                        const metrics = await captureWebVitals(page);
                        if (metrics) stepEntry.vitals = metrics;
                        
                        const ssPath = path.join('test-results', `ss_${testKey}_${Date.now()}.png`);
                        await fs.ensureDir('test-results');
                        await page.screenshot({ path: ssPath, scale: 'css' });
                        stepEntry.screenshotPath = ssPath;
                    }
                } catch (error) {
                    stepEntry.status = 'failed';
                    // Captura de error siempre activa para auditoría
                    if (!page.isClosed()) {
                        const errPath = path.join('test-results', `ERROR_${testKey}_${Date.now()}.png`);
                        await fs.ensureDir('test-results');
                        await page.screenshot({ path: errPath, scale: 'css' });
                        stepEntry.screenshotPath = errPath;
                    }
                    throw error;
                }
            });
        };

        await use(makeStep);

        // --- GENERACIÓN DE EVIDENCIA CORPORATIVA (CIERRE) ---
        const isLastRetry = testInfo.retry === testInfo.project.retries;

        if (isLastRetry) {
            const rawProjectName = testInfo.project.name.toLowerCase();
            const browserName = rawProjectName.includes('firefox') ? 'firefox' : 'chromium';

            // 📜 Buscamos en el Manifiesto de Auditoría
            const masterData = (auditManifest as any)[testInfo.title];
            
            let finalShell = currentAttemptSteps.map(s => ({ title: s.title }));
            let relatedStories: string[] = [];

            if (masterData) {
                finalShell = masterData.steps.map((s: string) => ({ title: s }));
                relatedStories = masterData.relatedStories || [];
            }

            // 📄 Generación del PDF (Mantenemos tu generador V2)
            await generateCorporatePDF_V2(
                testInfo, 
                finalShell, 
                currentAttemptSteps, 
                browserName,
                relatedStories
            );
        }
    },
});

// 🧹 AfterEach simplificado: Solo loguea el resultado técnico localmente
test.afterEach(async ({}, testInfo) => {
    const statusIcon = testInfo.status === 'passed' ? '✅' : '❌';
    console.log(`${statusIcon} [AUDITORÍA]: Test "${testInfo.title}" finalizado con estado: ${testInfo.status?.toUpperCase()}`);
    console.log(`📂 Evidencia técnica disponible en: ./test-results/ y ./target/Evidencias_PDF/`);
});

export { expect };