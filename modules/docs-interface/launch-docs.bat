@echo off
REM ============================================================================
REM Documentation Interface Launcher (Windows)
REM 
REM This script launches the documentation interface test environment on Windows.
REM 
REM Usage:
REM   launch-docs.bat              Launch in current terminal
REM 
REM Dependencies:
REM   - Node.js (v18+)
REM   - npm
REM ============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "APP_DIR=%SCRIPT_DIR%"
set "URL_PATH=/docs"

REM Verify module is self-contained
if not exist "%APP_DIR%\package.json" (
    echo [ERROR] Module is not properly configured. Missing package.json.
    exit /b 1
)
if not exist "%APP_DIR%\app" (
    echo [ERROR] Module is not properly configured. Missing app/ directory.
    exit /b 1
)

REM Read configuration from package.json if available
if exist "%APP_DIR%\package.json" (
    REM Try using PowerShell to parse JSON (available on Windows 7+)
    for /f "delims=" %%i in ('powershell -Command "$json = Get-Content '%APP_DIR%\package.json' | ConvertFrom-Json; if ($json.docsInterface) { if ($json.docsInterface.port) { Write-Output $json.docsInterface.port } }" 2^>nul') do (
        if not defined PORT set "PORT=%%i"
    )
    
    for /f "delims=" %%i in ('powershell -Command "$json = Get-Content '%APP_DIR%\package.json' | ConvertFrom-Json; if ($json.docsInterface) { if ($json.docsInterface.urlPath) { Write-Output $json.docsInterface.urlPath } }" 2^>nul') do (
        set "URL_PATH=%%i"
    )
)

REM Fallback to defaults
if "%PORT%"=="" set "PORT=3000"
if "%URL_PATH%"=="" set "URL_PATH=/docs"

echo ==========================================
echo    Documentation Interface Launcher
echo ==========================================
echo.

REM Check Node.js
echo [INFO] Checking system requirements...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18 or higher.
    exit /b 1
)
echo [SUCCESS] Node.js version: 
node -v
echo.

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed.
    exit /b 1
)
echo [SUCCESS] npm version:
npm -v
echo.

REM Check if port is in use
echo [INFO] Checking port availability...
netstat -ano | find ":%PORT%" | find "LISTENING" >nul
if %ERRORLEVEL% equ 0 (
    echo [WARNING] Port %PORT% is already in use.
    set /p REPLY="Do you want to kill the process using port %PORT%? (y/n): "
    if /i "!REPLY!"=="y" (
        echo [INFO] Attempting to free port %PORT%...
        for /f "tokens=5" %%a in ('netstat -ano ^| find ":%PORT%" ^| find "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 1 /nobreak >nul
        echo [SUCCESS] Port %PORT% is now available.
    ) else (
        echo [ERROR] Cannot start - port %PORT% is in use.
        exit /b 1
    )
) else (
    echo [SUCCESS] Port %PORT% is available.
)
echo.

REM Install dependencies
echo [INFO] Setting up test environment...
if not exist "%APP_DIR%\node_modules" (
    echo [INFO] Installing dependencies (this may take a minute)...
    cd /d "%APP_DIR%"
    call npm install
    echo [SUCCESS] Dependencies installed.
) else (
    echo [SUCCESS] Dependencies already installed.
)
echo.

REM Create docs folder
set "DOCS_DIR=%SCRIPT_DIR%..\..\docs"
if not exist "%DOCS_DIR%" (
    echo [WARNING] No /docs folder found. Creating sample documentation...
    mkdir "%DOCS_DIR%"
    (
        echo ---
        echo title: Documentation Home
        echo description: Welcome to the documentation
        echo created: 2025-12-01
        echo lastUpdated: 2025-12-01
        echo version: 1.0
        echo ---
        echo.
        echo # Documentation Home
        echo.
        echo Welcome to the documentation interface!
        echo.
        echo ## Getting Started
        echo.
        echo This is a sample documentation file.
    ) > "%DOCS_DIR%\README.md"
    echo [SUCCESS] Created sample documentation in /docs
) else (
    echo [SUCCESS] Found existing /docs folder.
)
echo.

REM Check git
git rev-parse --git-dir >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Git repository detected - version history enabled.
) else (
    echo [WARNING] Not a git repository - version history will be disabled.
    echo [INFO] To enable version history, run: git init
)
echo.

echo [SUCCESS] All checks passed! Starting server...
echo.

REM Prompt for background mode
set /p BACKGROUND_MODE="Run server in background? (y/n) [n]: "
if /i "%BACKGROUND_MODE%"=="y" (
    echo [INFO] Starting server in background...
    echo [INFO] Configuration: Port=%PORT%, Path=%URL_PATH%
    echo [INFO] Starting documentation interface on http://localhost:%PORT%%URL_PATH%
    echo.
    
    cd /d "%APP_DIR%"
    set PORT=%PORT%
    
    REM Start server in background
    start /b npm run dev >nul 2>&1
    
    REM Wait and open browser
    timeout /t 3 /nobreak >nul
    start http://localhost:%PORT%%URL_PATH%
    
    echo [SUCCESS] Server started in background
    echo [INFO] Browser opened to http://localhost:%PORT%%URL_PATH%
    echo [INFO] To stop the server, find the process and kill it, or restart your terminal.
    pause
) else (
    echo [INFO] Configuration: Port=%PORT%, Path=%URL_PATH%
    echo [INFO] Starting documentation interface on http://localhost:%PORT%%URL_PATH%
    echo [INFO] Press Ctrl+C to stop the server.
    echo.
    
    cd /d "%APP_DIR%"
    set PORT=%PORT%
    
    REM Start server and open browser after delay
    start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:%PORT%%URL_PATH%"
    
    REM Start the server (this will run in foreground)
    call npm run dev
)

endlocal

