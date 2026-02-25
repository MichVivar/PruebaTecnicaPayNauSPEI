import * as fs from 'fs-extra';
import * as path from 'path';
import dayjs from 'dayjs';
import { chromium } from '@playwright/test';

const CICLO_UNICO = process.env.EJECUCION_ID || dayjs().format('[Ejecucion]_DD-MMM_hh-mm-a');

/**
 * Genera un reporte PDF corporativo con las evidencias capturadas.
 */
export async function generateCorporatePDF_V2(
    testInfo: any, 
    plannedSteps: { title: string }[], 
    executedSteps: { title: string, screenshotPath: string, apiInfo?: any, status: string, vitals?: any }[],
    browserNameParam?: string,
    relatedStories: string[] = []
) {
    const date = dayjs().format('DD/MM/YYYY');
    const timestamp = dayjs().format('HH:mm:ss');
    
    const browserName = (browserNameParam || process.env.BROWSER || 'chromium').toLowerCase();
    const isPass = testInfo.status === 'passed';
    const accentColor = isPass ? '#10B981' : '#EF4444';
    const browserColor = browserName.includes('chromium') ? '#4285F4' : browserName.includes('firefox') ? '#FF7139' : '#8E8E93';

    // 🚀 1. Cálculo de Promedio de Performance Global
    const vitalsOnly = executedSteps.filter(s => s.vitals).map(s => s.vitals.loadTime);
    const avgLoad = vitalsOnly.length > 0 
        ? (vitalsOnly.reduce((a, b) => a + b, 0) / vitalsOnly.length).toFixed(2) 
        : "0.00";

    const storiesHtml = relatedStories.length > 0 
    ? `<div style="margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap;">
        ${relatedStories.map(id => `
            <span style="background: #f3f4f6; padding: 4px 10px; border-radius: 4px; font-size: 11px; color: #374151; border: 1px solid #d1d5db; font-weight: 700;">
               📋 REF: ${id}
            </span>`).join('')}
       </div>`
    : '';

    const browserIcons: { [key: string]: string } = {
        chromium: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${browserColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>`,
        firefox: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${browserColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        webkit: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${browserColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`
    };

    const currentIcon = browserName.includes('firefox') ? browserIcons.firefox : 
                    browserName.includes('chrome') || browserName.includes('chromium') ? browserIcons.chromium : 
                    browserIcons.webkit;
    
    const cycleFolder = path.join('./target/Evidencias_PDF', CICLO_UNICO, browserName);
    const scenarioName = testInfo.title.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
    const statusFolder = isPass ? 'PASADOS' : 'FALLIDOS';
    const finalPath = path.join(cycleFolder, scenarioName, statusFolder);
    
    await fs.ensureDir(finalPath);

    const validEvidenceSteps = executedSteps.filter(s => s.screenshotPath && s.screenshotPath !== "");

    const isCI = process.env.CI || process.env.DOCKER_ENV;
    const hostType = isCI ? 'Remote Virtual Machine (MV)' : 'Local Development Workstation';
    const infraType = isCI ? 'Docker Container Runtime' : 'Node.js Native Runtime';
    const nAvg = Number(avgLoad);
    let uxStatus = '';
    if (nAvg < 1.5) { uxStatus = '🟢 Óptimo'; } else if (nAvg < 3.0) { uxStatus = '🟡 Regular'; } else { uxStatus = '🔴 Lento / Crítico'; }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;700&display=swap" rel="stylesheet">
        <style>
            @page { size: A4; margin: 0; }
            html, body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Roboto', sans-serif; 
                font-weight: 400; 
                color: #333; 
                -webkit-font-smoothing: antialiased;
            }

            .cover { height: 297mm; padding: 60px 50px; display: flex; flex-direction: column; box-sizing: border-box; page-break-after: always; }
            
            /* ⚡ Banner con Performance Global */
            .status-banner { 
                border-left: 10px solid ${accentColor}; 
                padding: 20px; 
                background: #fcfcfc; 
                margin-bottom: 30px; 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
            }
            .status-text { font-size: 38px; font-weight: 700; color: ${accentColor}; margin: 0; letter-spacing: -0.5px;}
            .perf-score { text-align: right; border-left: 1px solid #eee; padding-left: 20px; }

            /* 📑 Lógica de Dos Columnas Dinámica */
            .steps-grid { 
                display: block;
                column-count: ${plannedSteps.length > 10 ? 2 : 1}; /* Si hay más de 10 pasos, usa 2 columnas */
                column-gap: 30px;
                margin-top: 15px;
                min-height: 100px; /* Permite que el contenedor crezca */
            }
                .step-item {
                display: flex;
                align-items: baseline;
                gap: 8px;
                font-size: 11px;
                margin-bottom: 6px;
                break-inside: avoid; /* Evita que un paso se parta entre columnas */
            }
            
            .step-text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 180px;
            }

            .tech-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
            .tech-item { display: flex; align-items: center; font-size: 14px; color: #555; gap: 10px; }
            
            .step-page { height: 297mm; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; page-break-after: always; position: relative; background-color: #ffffff !important; }
            .step-header { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            .step-title { font-size: 18px; font-weight: 700; color: #222; }
            .screenshot-img { max-height: 67vh; width: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: block; margin: auto; }
            .footer { position: absolute; bottom: 20px; left: 40px; font-size: 10px; color: #aaa; }

            .vitals-container { display: flex; gap: 10px; margin-top: 5px; }
            .vital-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 700; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(0,0,0,0.05); }
            .vital-good { background: #ECFDF5; color: #065F46; }
            .vital-med { background: #FFFBEB; color: #92400E; }
            .vital-bad { background: #FEF2F2; color: #991B1B; }
        </style>
    </head>
    <body>
        <div class="cover">
            <div style="display: flex; align-items: center; gap: 10px; font-size: 11px; color: ${browserColor}; font-weight: 700; margin-bottom: 20px; letter-spacing: 2.5px;">
                ${currentIcon}
                <span><b>${browserName.toUpperCase()} AUTOMATION SESSION</b></span>
            </div>
            
            <div class="status-banner">
                <div>
                    <p style="font-size: 14px; color: #888; margin-bottom: 5px;">RESULTADO GLOBAL</p>
                    <h1 class="status-text">${isPass ? 'PASADO' : 'FALLIDO'}</h1>
                </div>
                <div class="perf-score">
                    <p style="font-size: 12px; color: #888; margin-bottom: 2px;">AVG LOAD TIME</p>
                    <p style="font-size: 24px; font-weight: 700; color: #444; margin: 0;">${avgLoad}s</p>
                </div>
            </div>

            <div class="tech-grid">
                <div class="tech-item">🐳 <b>Infra:</b> ${infraType}</div>
                <div class="tech-item">☁️ <b>Host:</b> ${hostType}</div>
                <div class="tech-item">🎭 <b>Engine:</b> Playwright Framework</div>
                <div class="tech-item">⏱️ <b>UX Status:</b> ${uxStatus}</div>
            </div>

            <div style="margin: 30px 0;">
                <p style="font-weight: 700; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; font-size: 14px;">ESCENARIO DE PRUEBA:</p>
                <p style="font-size: 18px; color: #222; font-weight: 400; margin-bottom: 10px;">${testInfo.title}</p>
                ${storiesHtml}
                <p style="font-size: 11px; color: #888; margin-top: 15px;"><b>Fecha:</b> ${date} | ${timestamp}</p>
            </div>

            <div style="margin-top: 10px;">
                <p style="font-weight: 700; color: #555; border-bottom: 2px solid #eee; padding-bottom: 8px; font-size: 13px;">🔍 FLUJO DE VALIDACIÓN</p>
                <div class="steps-grid">
                    ${plannedSteps.map((plannedStep, i) => {
                        const execution = executedSteps.find(e => e.title === plannedStep.title);
                        let color = '#D1D5DB'; let icon = '⚪'; let pageInfo = 'PENDIENTE';
                        
                        if (execution) {
                            if (execution.status === 'passed') {
                                color = '#10B981'; icon = '✅';
                                const evIndex = validEvidenceSteps.findIndex(v => v.title === execution.title);
                                pageInfo = evIndex !== -1 ? `Pág. ${evIndex + 2}` : 'OK';
                            } else if (execution.status === 'failed') {
                                color = '#EF4444'; icon = '❌'; pageInfo = 'ERROR';
                            }
                        }

                        return `
                        <div class="step-item">
                            <span style="color: ${color}; font-weight: 700;">${i + 1}.</span>
                            <span class="step-text" style="color: #444;">${icon} ${plannedStep.title}</span>
                            <span style="flex-grow: 1; border-bottom: 1px dotted #ddd; margin: 0 4px;"></span>
                            <span style="color: #999; font-size: 9px;">${pageInfo}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <div style="margin-top: auto; padding: 20px; border-top: 1px dashed #ddd; font-size: 9px; color: #999; text-align: center; font-style: italic;">
                Documento generado automáticamente por el Framework de Prueba Técnica mediante ejecución aislada en contenedores Docker.
            </div>
        </div>

        ${validEvidenceSteps.map((s, i) => {
            if (!fs.existsSync(s.screenshotPath)) return ''; 

            const getVitalClass = (val: number) => val < 1.5 ? 'vital-good' : val < 3 ? 'vital-med' : 'vital-bad';
            const vitalsHtml = s.vitals ? `
                <div class="vitals-container">
                    <div class="vital-badge ${getVitalClass(s.vitals.loadTime)}">⏱️ Load: ${s.vitals.loadTime}s</div>
                    <div class="vital-badge ${getVitalClass(s.vitals.ttfb)}">🖥️ TTFB: ${s.vitals.ttfb}s</div>
                </div>` : '';

            const imgBase64 = fs.readFileSync(s.screenshotPath).toString('base64');
            return `
            <div class="step-page">
                <div class="step-header">
                    <span style="color: ${accentColor}; font-weight: 700;">PASO ${i + 1}</span>
                    <div class="step-title">${s.title}</div>
                    ${vitalsHtml}
                </div>
                <div class="screenshot-container" style="flex-grow: 1; display: flex; justify-content: center; align-items: center;">
                    <img src="data:image/png;base64,${imgBase64}" class="screenshot-img">
                </div>
                ${s.apiInfo ? `<div style="background:#f8f9fa; padding:12px; border-radius:8px; font-size:10px; margin-top:15px; border-left:4px solid #4285F4;"><b>API Response:</b><pre>${JSON.stringify(s.apiInfo, null, 2)}</pre></div>` : ''}
                <div class="footer">Framework de Prueba Técnica | Sesión: ${CICLO_UNICO} | Página ${i + 2}</div>
            </div>`;
        }).join('')}
    </body>
    </html>
    `;

    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 }); 
    await page.setContent(htmlContent, { waitUntil: 'load' });
    
    
    await page.pdf({
        path: path.join(finalPath, `EVIDENCIA_${scenarioName}.pdf`),
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    
    executedSteps.forEach(s => { 
        if (s.screenshotPath && fs.existsSync(s.screenshotPath)) {
            fs.removeSync(s.screenshotPath); 
        }
    });
}