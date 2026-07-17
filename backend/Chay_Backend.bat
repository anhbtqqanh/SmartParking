@echo off
title KHOI DONG BACKEND SMART PARKING
color 0A

echo =======================================================
echo          KHOI DONG HE THONG SMART PARKING BACKEND
echo =======================================================
echo.

cd /d "%~dp0"

:: Kiem tra node.js da duoc cai dat chua
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js chua duoc cai dat tren may tinh nay!
    echo Vui long tai va cai dat tai: https://nodejs.org/
    pause
    exit /b 1
)

:: Kiem tra file package.json
if not exist package.json (
    echo [INFO] Chua co package.json. Dang khoi tao...
    call npm init -y
)

:: Kiem tra va cai dat dependencies
if not exist node_modules (
    echo [INFO] Dang cai dat cac thu vien can thiet: express, socket.io, cors, uuid, qrcode...
    call npm install express socket.io cors uuid qrcode
) else (
    echo [INFO] Da co thu muc node_modules. Kiem tra thu vien...
    :: Dam bao cac package deu duoc cai dat
    call npm install express socket.io cors uuid qrcode --no-audit --no-fund
)

echo.
echo [SUCCESS] Da chuan bi xong moi truong. Dang khoi dong Server...
echo =======================================================
echo.

node server.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server bi loi hoac dung dot ngot!
    pause
)
