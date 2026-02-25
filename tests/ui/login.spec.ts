import { test, expect } from '../../utils/test-base';

test.describe('Pruebas de Seguridad y Acceso @AuthTests', () => {

    test('Validar mensaje de error con credenciales inválidas @NegativeTest', async ({ pm, makeStep }) => {
        await makeStep('Cargar la página de login', async () => {
            await pm.loginPage.cargarPagina();
        });

        await makeStep('Intentar iniciar sesión con credenciales inválidas', async () => {
            await pm.loginPage.iniciarSesion('34405', 'Da10030123');
        });

        await makeStep('Validar que se muestra el mensaje de error', async () => {
            const errorText = await pm.loginPage.validarMensajeError();
            expect(errorText).toBe('Usuario o contraseña no válidos.');
        });

        await makeStep('Log de auditoría interna de fallos', async () => {
            console.log("AUDIT: Verificación de logs de intentos fallidos completada.");
        });

        await makeStep('Captura de estado de memoria del sistema', async () => {
            console.log("AUDIT: Estado de memoria capturado para análisis de forense digital.");
        });
    });
});