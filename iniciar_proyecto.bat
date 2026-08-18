@echo off
:: Configura codificación UTF-8 para mostrar caracteres con acentos correctamente
chcp 65001 > nul
title Detectives del Tacto - Servidor de Inicio

echo ===================================================
echo       INICIANDO DETECTIVES DEL TACTO
echo ===================================================
echo.

:: 1. Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado en este equipo.
    echo Por favor, instala Node.js antes de continuar.
    echo Puedes descargarlo gratis desde: https://nodejs.org/
    echo.
    pause
    exit /b
)

:: 2. Recordar el requisito de MongoDB
echo [INFO] Asegúrate de tener MongoDB instalado y corriendo en tu equipo.
echo Si el programa se cierra inmediatamente o muestra errores de conexión,
echo comprueba que el servicio de MongoDB esté iniciado.
echo.

:: 3. Instalar dependencias si no existen (útil para cuando descompriman el ZIP)
if not exist "backend\node_modules\" (
    echo [INFO] Carpeta node_modules no encontrada. Instalando dependencias de Node.js...
    cd backend
    call npm install --production
    cd ..
    echo.
)

:: 4. Abrir el juego en el navegador predeterminado
echo [INFO] Iniciando el servidor...
echo El juego se abrirá automáticamente en tu navegador predeterminado.
echo Si no se abre, ingresa a: http://localhost:5000
echo.

start "" http://localhost:5000

:: 5. Correr el servidor Node.js
cd backend
node server.js

pause
