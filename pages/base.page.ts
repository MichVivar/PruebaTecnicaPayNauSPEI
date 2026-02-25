import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
    // Definimos el objeto 'page' que es el que controla el navegador
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Método para escribir 
    async escribir(locator: Locator, texto: string){
        await locator.fill(texto);
    }

    // Método para hacer click
    async clickear(locator: Locator){
        await locator.click();
    }

    // Método para validar visibilidad
    async validarVisible(locator: Locator){
        await expect(locator).toBeVisible({timeout: 5000});
    }

    // Método para obtener texto 
    async obtenerTexto(locator: Locator): Promise<string> {
        return await locator.innerText();
    }

    // Método para Selects (Listas desplegables)
    async seleccionarOpcion(locator: Locator, valor: string){
        await locator.selectOption(valor);
    }

    // Método para navegar a una URL
    async navegarA(url: string) {
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
    }
}