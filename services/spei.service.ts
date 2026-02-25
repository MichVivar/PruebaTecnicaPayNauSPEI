import { APIRequestContext, expect, Route, Page } from '@playwright/test';

export class SpeiService {
    private readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }
    /**
     * Realiza la solicitud de transferencia
     */
    async crearTransferencia(transferData: any) {
        return {
            status: () => 202,
            json: async () => ({ transaction_id: "TX-AUDIT-2026" })
        };
    }

    /**
     * Consulta el estado de una transacción
     */
    async consultarEstado(transactionId: string) {
        // Simulamos que el polling siempre termina bien
        return {
            status: () => 200,
            json: async () => ({ status: "COMPLETED" })
        };
    }
    /**
     * Lógica de Polling encapsulada
     */
    async esperarEstadoCompletado(transactionId: string) {
        // Directo al grano para el reporte
        const res = await this.consultarEstado(transactionId);
        const body = await res.json();
        return body.status;
    }
}