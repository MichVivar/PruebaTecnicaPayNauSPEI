#!/bin/bash
# @file run-test.sh
# @description Ejecutor independiente (Sin dependencias externas)

set -e

# 1️⃣ ID de sesión único para esta corrida
export EJECUCION_ID="Ejecucion_$(date +%d-%b_%H-%M)"

echo "--------------------------------------------------------"
echo "🚀 INICIANDO SUITE DE AUDITORÍA TÉCNICA"
echo "🆔 ID SESIÓN: $EJECUCION_ID"
echo "--------------------------------------------------------"

# 2️⃣ Ejecución del contenedor
# Nota: 'report:full' ya corre sync, test y build:evidence en orden.
docker compose run --rm playwright-app npm run report:full

# 3️⃣ Limpieza de contenedores huérfanos
docker compose down --remove-orphans

echo "--------------------------------------------------------"
echo "✅ EJECUCIÓN FINALIZADA"
echo "📂 Reportes disponibles en: target/ENTREGA_CERTIFICADA"
echo "--------------------------------------------------------"