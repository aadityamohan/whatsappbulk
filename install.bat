@echo off
setlocal enabledelayedexpansion

REM WhatsApp Bulk Sender - Installation Script for Windows
REM This script installs and sets up the WhatsApp Bulk Sender application

echo 🚀 WhatsApp Bulk Sender - Installation Script
echo ==============================================

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or higher from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [INFO] Node.js found: %NODE_VERSION%

REM Check if npm is installed
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [INFO] npm found: %NPM_VERSION%

REM Check if MongoDB is installed
echo [INFO] Checking MongoDB installation...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB is not installed. The application requires MongoDB to run.
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    echo Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest
    set /p CONTINUE="Do you want to continue without MongoDB? (y/N): "
    if /i not "!CONTINUE!"=="y" (
        pause
        exit /b 1
    )
) else (
    echo [INFO] MongoDB found
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "sessions" mkdir sessions
if not exist "backend\logs" mkdir backend\logs
if not exist "backend\uploads" mkdir backend\uploads
echo [INFO] Directories created successfully

REM Install dependencies
echo [INFO] Installing dependencies...

REM Install root dependencies
echo [INFO] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo [INFO] Dependencies installed successfully

REM Setup environment file
echo [INFO] Setting up environment configuration...
if not exist ".env" (
    if exist "env.example" (
        copy "env.example" ".env" >nul
        echo [INFO] Environment file created from template
    ) else (
        echo [WARNING] No environment template found. Creating basic .env file...
        (
            echo PORT=3000
            echo NODE_ENV=production
            echo MONGODB_URI=mongodb://localhost:27017/whatsapp_bulk
            echo RATE_LIMIT_WINDOW=15
            echo RATE_LIMIT_MAX_REQUESTS=100
            echo MAX_FILE_SIZE=5242880
            echo DEFAULT_MESSAGE_DELAY=10
            echo MAX_RETRY_ATTEMPTS=3
        ) > .env
    )
) else (
    echo [INFO] Environment file already exists
)

echo.
echo [INFO] Installation completed successfully! 🎉
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Start the application with: npm start
echo 3. Open your browser to: http://localhost:3000
echo.
echo For development mode, use: npm run dev
echo.
echo [WARNING] Remember: This is an educational application only!
echo Do not use for actual bulk messaging or spam.
echo.
pause
