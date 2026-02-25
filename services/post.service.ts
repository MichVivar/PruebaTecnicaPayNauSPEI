import { APIRequestContext } from '@playwright/test';

export class PostService {
    private readonly request: APIRequestContext;
    private readonly endpoint = 'https://jsonplaceholder.typicode.com/posts';

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async getAllPosts() {
        return await this.request.get(this.endpoint);
    }

    async createPost(title: string, body: string, userId: number) {
        return await this.request.post(this.endpoint, {
            data: { title, body, userId }
        });
    }
}