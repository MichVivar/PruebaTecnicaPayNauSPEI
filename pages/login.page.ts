import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
    
    //Objetos (Locators) de la página de Login
    private readonly userInput: Locator;
    private readonly pwInput: Locator;
    private readonly loginBtn: Locator;
    readonly errorMsg: Locator;

    constructor(page: Page) {
        super(page);

        //Locators
        this.userInput = page.getByPlaceholder('Usuario');
        this.pwInput = page.getByPlaceholder('Contraseña');
        this.loginBtn = page.getByRole('button', { name: 'Acceder' });
        this.errorMsg = page.getByText('Usuario o contraseña no válidos');
    }

    //Método para cargar la página de Login
    async cargarPagina() {
        await this.navegarA('/');
        await this.userInput.waitFor({ state: 'visible' });
    }

    //Método para realizar login
    async iniciarSesion(user: string, password: string) {
        await this.escribir(this.userInput, user);
        await this.escribir(this.pwInput, password);
        await this.clickear(this.loginBtn);
    }

    //Método para validar mensaje de error
    async validarMensajeError() {
        await this.validarVisible(this.errorMsg);
        return await this.obtenerTexto(this.errorMsg);
    }
}