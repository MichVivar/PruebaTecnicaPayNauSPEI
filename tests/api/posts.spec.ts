// import { test, expect } from '../../utils/test-base';

// test.describe('Pruebas de Integración - JSONPlaceholder @API', () => {
    
//     test('Debería crear un nuevo post exitosamente', async ({ request, makeStep }) => {
//         const postData = {
//             title: 'Nuevo Post Teon',
//             body: 'Contenido de prueba para API',
//             userId: 7
//         };

//         // Declaramos la variable fuera para poder pasarla al makeStep después de la ejecución
//         let responseBody;

//         await makeStep('Enviar petición POST para crear un recurso', async () => {
//             const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
//                 data: postData
//             });

//             expect(response.status()).toBe(201);
//             responseBody = await response.json(); // Guardamos la respuesta
            
//             expect(responseBody.title).toBe(postData.title);
//             console.log('ID Generado:', responseBody.id);
//         }, { request: postData, response: responseBody }); // 👈 PASAMOS LA DATA AQUÍ
//     });

//     test('Debería obtener la lista de posts', async ({ request, makeStep }) => {
//         let posts;

//         await makeStep('Consultar todos los posts vía GET', async () => {
//             const response = await request.get('https://jsonplaceholder.typicode.com/posts');
//             expect(response.ok()).toBeTruthy();
//             posts = await response.json();
//             expect(posts.length).toBeGreaterThan(0);
//         }, { total_posts: 'Se recuperaron posts exitosamente', data_sample: 'Consultar PDF' }); // 👈 O puedes pasar un resumen
//     });
// });