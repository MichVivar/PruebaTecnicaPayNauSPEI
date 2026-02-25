import { Page } from '@playwright/test';
import { LoginPage } from './login.page';
import { DashboardPage } from './dashboard.page';

export class PageManager {
    private readonly page: Page;
    private readonly _loginPage: LoginPage;
    private readonly _dashboardPage: DashboardPage;

    constructor(page: Page) {
        this.page = page;
        this._loginPage = new LoginPage(this.page);
        this._dashboardPage = new DashboardPage(this.page);
    }

    get loginPage() {
        return this._loginPage;
    }

    get dashboardPage() {
        return this._dashboardPage
    }

    get urlActual(): string {
        return this.page.url();
    }
}