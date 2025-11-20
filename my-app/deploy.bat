@echo off
REM KarirKit Deployment Helper Script for Windows

echo 🚀 KarirKit Deployment Helper
echo ================================
echo.

REM Check if in my-app directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the my-app directory
    exit /b 1
)

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Vercel CLI not found. Installing...
    npm install -g vercel
)

echo ✅ Vercel CLI is installed
echo.

REM Menu
echo Choose deployment option:
echo 1. First time deployment (interactive)
echo 2. Deploy to production
echo 3. Deploy preview (branch deployment)
echo 4. View logs
echo 5. Open Vercel dashboard
echo 6. Check deployment status
echo.
set /p option="Enter option (1-6): "

if "%option%"=="1" (
    echo.
    echo 🎯 Starting first-time deployment...
    echo.
    echo ⚠️  Important reminders:
    echo    1. Make sure all environment variables are ready
    echo    2. Root directory should be 'my-app'
    echo    3. Framework preset: Next.js
    echo.
    pause
    vercel
) else if "%option%"=="2" (
    echo.
    echo 🚀 Deploying to production...
    vercel --prod
) else if "%option%"=="3" (
    echo.
    echo 👀 Creating preview deployment...
    vercel
) else if "%option%"=="4" (
    echo.
    echo 📋 Fetching logs...
    vercel logs
) else if "%option%"=="5" (
    echo.
    echo 🌐 Opening Vercel dashboard...
    vercel open
) else if "%option%"=="6" (
    echo.
    echo 📊 Checking deployment status...
    vercel list
) else (
    echo ❌ Invalid option
    exit /b 1
)

echo.
echo ✅ Done!
pause
