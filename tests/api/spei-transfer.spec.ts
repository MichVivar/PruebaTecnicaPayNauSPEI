import { test, expect } from '../../utils/test-base';
import { SpeiService } from '../../services/spei.service';
import speiData from '../../data/spei-data.json';

test.describe('Certificación SPEI', () => {

    test('Certificación SPEI: Flujo Asíncrono Completo @api', async ({ request, makeStep }) => {
        const spei = new SpeiService(request);
        const data = speiData.transferencia_exitosa;
        let response: any;
        let idObtenido: string = "";
        let bodyJSON: any;

        await makeStep('1. Consumir endpoint POST /api/v1/transfer/spei-out', async () => {
            console.log(`🚀 Enviando transferencia a: ${data.beneficiario}`);
            response = await spei.crearTransferencia(data);
            bodyJSON = await response.json();
        });

        await makeStep('2. Validar que el código de respuesta sea 202 Accepted', async () => {
            expect(response.status()).toBe(202);
        }, bodyJSON); 

        await makeStep('3. Validar presencia de transaction_id', async () => {
            idObtenido = bodyJSON.transaction_id;
            expect(idObtenido).toBeDefined();
        }, { transaction_id: idObtenido });

        await makeStep('4. Ejecutar Polling para esperar estado COMPLETED', async () => {
            const finalStatus = await spei.esperarEstadoCompletado(idObtenido);
            expect(finalStatus).toBe('COMPLETED');
        }, { status_final: "COMPLETED", polly_check: "SUCCESS" });
    });
});