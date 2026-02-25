# 🛡️ SPEI Certification Framework (Auditoría Técnica)

Este proyecto es un **Framework de Automatización de Pruebas** de alto rendimiento diseñado para la certificación técnica de flujos asíncronos en servicios SPEI. El sistema está optimizado para cumplir con normativas de **Auditoría**, automatizando la recolección de evidencias y la generación de reportes ejecutivos.

## 🚀 Justificación Tecnológica

* **Playwright**: Motor principal elegido por su capacidad nativa de interceptación de red (Network Mocking) y su robustez para manejar procesos asíncronos complejos. Permite validar tanto la capa de API como la de UI en una misma suite.
* **Docker**: El framework corre sobre contenedores para garantizar que el entorno de ejecución (versiones de Node, navegadores y dependencias) sea idéntico en cualquier máquina, eliminando conflictos de configuración.
* **TypeScript**: Implementado para asegurar un código fuertemente tipado, facilitando el mantenimiento y reduciendo errores lógicos durante el desarrollo de los scripts.

## 🏗️ Metodología de Diseño (POM & Service Layer)

El framework implementa una arquitectura **Page Object Model (POM)** extendida con una **Capa de Servicios**:

1.  **Service Layer (`services/`)**: Centraliza la lógica de negocio. El `SpeiService` encapsula las peticiones HTTP y la lógica de "Polling" para verificar el estado de las transferencias.
2.  **Test Layer (`tests/`)**: Scripts de prueba desacoplados de la implementación técnica, enfocados en el flujo funcional.
3.  **Fixtures Customizados (`utils/test-base.ts`)**: Extensión del núcleo de Playwright que automatiza la creación de pasos de auditoría (`makeStep`), captura métricas de rendimiento y gestiona el ciclo de vida del reporte PDF.

## ✨ Extras y Valor Agregado

* **Evidencia Corporativa Automática**: Genera un PDF formal que incluye: portada, tabla de pasos con estatus de cumplimiento, marcas de tiempo e identificadores de sesión.
* **Gestión de Flujos Asíncronos**: Implementa algoritmos de reintento (Polling) para validar la transición de estados en transferencias que no son inmediatas (ej. `PENDING` -> `COMPLETED`).
* **Resiliencia mediante Stubs**: El framework permite simular respuestas del servidor (Stubs), lo que garantiza que la suite de pruebas pueda ejecutarse y certificarse incluso si los servicios externos están en mantenimiento.
* **Doble Reporteo de Evidencia**:
    * **Reporte Ejecutivo (PDF)**: Para cumplimiento y auditoría de procesos.
    * **Reporte Técnico (HTML)**: Para depuración profunda, logs de red y trazas de ejecución.

## 🛠️ Instalación y Ejecución

El framework está diseñado para ejecutarse sin necesidad de instalar dependencias locales, haciendo uso de **Docker Compose**.

### Requisitos:
* Docker y Docker Compose instalados.

### Comandos de ejecución:

1.  **Construir el entorno**:
    ```bash
    docker compose build
    ```

2.  **Lanzar Suite de Certificación Completa**:
    ```bash
    ./run-test.sh
    ```
    *Este script automatiza el ciclo de vida completo: Sincronización del Manifiesto -> Ejecución de Tests -> Consolidación de Evidencias.*

## 📂 Estructura de Salida (Entregables)

Al finalizar la prueba, los resultados se consolidan en la carpeta `target/Evidencias_PDF/`. La entrega certificada incluye:

* **`Reporte_Tecnico_SPEI.pdf`**: Documento oficial para auditoría con la secuencia de pasos.
* **`Anexo_Tecnico_Detallado.pdf`**: Logs de bajo nivel generados por Playwright.
* **`Reporte_Tecnico_HTML/`**: Carpeta interactiva con el detalle granular de la ejecución (abrir `index.html`).

---

> **Nota de Auditoría:** En pruebas de API pura (Headless), el framework omite capturas de pantalla de interfaces inexistentes para evitar ruido visual, priorizando la integridad de los logs y el resultado de las aserciones de datos en el reporte final.