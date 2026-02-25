import { test as base, expect, TestInfo } from '@playwright/test';
import { PageManager } from '../pages/page-manager';
import { generateCorporatePDF_V2 } from '../automation/evidence-generator-v2';
import * as fs from 'fs-extra';
import * as path from 'path';

let auditManifest: any = {};
const MANIFEST_PATH = path.resolve(__dirname, '../config/audit-manifest.json');

if (fs.existsSync(MANIFEST_PATH)) {
    auditManifest = fs.readJsonSync(MANIFEST_PATH);
}

interface StepReport {
    title: string;
    screenshotPath: string;
    status: 'passed' | 'failed' | 'skipped' | 'pending';
    apiInfo?: any; // 👈 Aquí guardaremos el JSON de la API
    vitals?: any;
}

export interface MyFixtures {
    pm: PageManager;
    makeStep: (title: string, task: () => Promise<void>, apiData?: any) => Promise<void>;
}

async function captureWebVitals(page: any) {
    try {
        return await page.evaluate(() => {
            const [entry] = performance.getEntriesByType("navigation") as any;
            if (!entry || entry.name === 'about:blank') return null; // 👈 No vitals en páginas vacías
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
            // 🎯 Guardamos apiData si viene en la llamada
            const stepEntry: StepReport = { 
                title, 
                screenshotPath: '', 
                apiInfo: apiData ? JSON.stringify(apiData, null, 2) : null, 
                status: 'skipped' 
            };
            currentAttemptSteps.push(stepEntry);

            await base.step(title, async () => {
                try {
                    stepEntry.status = 'pending';
                    await task();
                    stepEntry.status = 'passed';
                    
                    // 📸 LÓGICA INTELIGENTE DE CAPTURA
                    const isAboutBlank = page.url() === 'about:blank';
                    
                    if (!page.isClosed() && !isAboutBlank) {
                        const metrics = await captureWebVitals(page);
                        if (metrics) stepEntry.vitals = metrics;
                        
                        const ssPath = path.join('test-results', `ss_${testKey}_${Date.now()}.png`);
                        await fs.ensureDir('test-results');
                        await page.screenshot({ path: ssPath, scale: 'css' });
                        stepEntry.screenshotPath = ssPath;
                    } else if (isAboutBlank && apiData) {
                        // Si no hay foto pero hay API, el generador usará apiInfo en lugar de imagen
                        console.log(`ℹ️ [Info] Paso de API detectado: ${title}. Omitiendo captura blanca.`);
                    }
                } catch (error) {
                    stepEntry.status = 'failed';
                    if (!page.isClosed() && page.url() !== 'about:blank') {
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

        const isLastRetry = testInfo.retry === testInfo.project.retries;
        if (isLastRetry) {
            const rawProjectName = testInfo.project.name.toLowerCase();
            const browserName = rawProjectName.includes('firefox') ? 'firefox' : 'chromium';
            const masterData = (auditManifest as any)[testInfo.title];
            
            let finalShell = currentAttemptSteps.map(s => ({ title: s.title }));
            let relatedStories: string[] = [];

            if (masterData) {
                finalShell = masterData.steps.map((s: string) => ({ title: s }));
                relatedStories = masterData.relatedStories || [];
            }

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

test.afterEach(async ({}, testInfo) => {
    const statusIcon = testInfo.status === 'passed' ? '✅' : '❌';
    console.log(`${statusIcon} [AUDITORÍA]: Test "${testInfo.title}" finalizado con estado: ${testInfo.status?.toUpperCase()}`);
});

export { expect };