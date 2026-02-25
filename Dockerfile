# @file Dockerfile
# @version 1.58.1-noble

FROM mcr.microsoft.com/playwright:v1.58.1-noble

WORKDIR /app

# Instalación de dependencias
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copia del código fuente
COPY . .


# Esto evita que Docker lo vea como un "fantasma" al montar el volumen
RUN touch .test_filter && chmod 777 .test_filter

# 2. Infraestructura de salida y permisos
RUN mkdir -p target/Evidencias_PDF && chmod -R 777 target

# 3. Configuración de entorno
ENV BROWSER=chromium
ENV REPORT_JIRA=true

# Ejecución
CMD ["npm", "run", "report:full"]