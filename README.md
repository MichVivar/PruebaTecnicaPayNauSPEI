# 🧬 Project: TeonCred-QA-Engine (Experimental Lab)

### **[🔒 PRIVATE ARCHITECTURE - SDET RESEARCH MODULE]**

Este repositorio no es un boilerplate de automatización convencional. Es un **entorno de laboratorio** para la experimentación de arquitecturas de **Gobernanza de Calidad Automática** y **Orquestación de Ciclo de Vida (ALM)**. 

El sistema está diseñado como un **Motor de Inferencia de Calidad** que opera sobre la API de Jira y el análisis del árbol AST de TypeScript, eliminando la capa administrativa del proceso de Testing mediante **Burocracia Cero**.

---

## ☣️ Advertencia de Laboratorio (Read Before Browsing)

* **High Coupling:** La arquitectura está profundamente ligada a flujos de trabajo de Jira Cloud y esquemas de metadatos específicos. No es un sistema "Plug & Play".
* **State Persistence:** El sistema utiliza un motor de *Locking* local que persiste estados de ejecución. La manipulación manual de los archivos `.json` en la carpeta `config/` puede corromper la integridad de la suite.
* **Dockerized Core:** La ejecución fuera del contenedor orquestado puede resultar en comportamientos inconsistentes debido a la gestión crítica de memoria compartida (`shm_size`) y dependencias binarias de los motores de renderizado.

---

## 🔬 Módulos de Investigación Integrados

### 1. Motor de Sincronía AST (Static Analysis)
Utilizamos **Abstract Syntax Tree (AST)** mediante `ts-morph` para auditar el código fuente en tiempo de compilación. El script de sincronía no busca coincidencias de texto simples; analiza la estructura semántica de los tests para garantizar que cada unidad de código esté mapeada inequívocamente a una entidad de negocio en Jira.
* *Status:* **Operativo / Blindado.**

### 2. Orquestador de Contexto (The Butler)
Módulo de pre-ejecución que funciona como un **Director de Escena**. Realiza un *handshake* con la API de Jira para validar el "hambre de ejecución" de la suite. Si el contexto del Sprint no requiere la validación de un nodo específico, el orquestador lo purga del flujo de ejecución antes de inicializar los drivers de Playwright.
* *Status:* **Optimización Dinámica.**

### 3. Notario de Evidencias & Auto-Lock
El sistema finaliza con un proceso de **Consolidación de Evidencia Atómica**.
* **Immutable Evidence:** Generación de PDF-Layers que se inyectan mediante *streams* en la API de Jira, vinculando trazas, videos y capturas.
* **Smart Lock:** Sistema de persistencia que actúa como una "memoria caché" de calidad, impidiendo la re-ejecución de nodos ya validados y cerrados en ciclos previos.

---

## 📊 Arquitectura de Flujo (Internal Logic)

1.  **Auditoría:** El motor analiza los archivos `.spec.ts` buscando metadatos de Jira.
2.  **Sincronización:** Se asegura de que existan los tickets correspondientes y mapea la relación ID-Test.
3.  **Filtrado:** Se consultan los estados en Jira (To Do, In Progress, Done) para filtrar la suite.
4.  **Ejecución:** Playwright ejecuta solo los nodos necesarios dentro de un entorno Docker aislado.
5.  **Consolidación:** El "Notario" recolecta evidencias, las sube a Jira, actualiza estados y bloquea el test localmente.

---

## 🏁 Estado del Proyecto

Este framework representa una evolución constante en mi **Portafolio de Arquitectura SDET**. Es la materialización de la transición de "Scripts de Prueba" a "Sistemas de Gobierno de Calidad".

> **Nota:** La documentación técnica sobre la orquestación de contenedores y los tokens de acceso al Laboratorio están restringidos. Si intentas ejecutar este motor sin la configuración de variables de entorno propietaria, el sistema activará el freno de mano automático (Exit Code 1).

---

**Arquitecto:** Mich Vivar  
**Fase Actual:** V2.0 - Evolución de Multi-ID & Testware Logic  
**Tecnologías:** Playwright, TypeScript, Docker, Jira API, TS-Morph.

---