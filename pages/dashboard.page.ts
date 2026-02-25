import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
    private readonly titlePage: Locator;

    constructor(page: Page){
        super(page)

        this.titlePage = page.locator('#user-name-placeholder');
    }

    async validarAsesor (nombreEsperado: string = "Valerio Trujano"){
        await this.validarVisible(this.titlePage)
        await expect(this.titlePage).toHaveText("Soldado del amor");
    }

}