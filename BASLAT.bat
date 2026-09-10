@echo off
setlocal enabledelayedexpansion
title OYMAPOS Etiket ve Fis Merkezi - Baslatici
cd /d "%~dp0"

echo ================================================================
echo           OYMAPOS Etiket ve Fis Merkezi Baslatiliyor
echo ================================================================
echo.

:: 1. Mevcut Python Kurulumlarini Tara (win7_python, C:\Python38, C:\Python313, sistem PATH)
set "PY_CMD="

if exist "%~dp0win7_python_x86\python.exe" (
    "%~dp0win7_python_x86\python.exe" -c "import sys" >nul 2>&1
    if !ERRORLEVEL! EQU 0 set "PY_CMD=%~dp0win7_python_x86\python.exe"
)
if not defined PY_CMD if exist "%~dp0win7_python\python.exe" (
    "%~dp0win7_python\python.exe" -c "import sys" >nul 2>&1
    if !ERRORLEVEL! EQU 0 set "PY_CMD=%~dp0win7_python\python.exe"
)
if not defined PY_CMD if exist "C:\Python38\python.exe" (
    "C:\Python38\python.exe" -c "import sys" >nul 2>&1
    if !ERRORLEVEL! EQU 0 set "PY_CMD=C:\Python38\python.exe"
)
if not defined PY_CMD if exist "C:\Python313\python.exe" (
    "C:\Python313\python.exe" -c "import sys" >nul 2>&1
    if !ERRORLEVEL! EQU 0 set "PY_CMD=C:\Python313\python.exe"
)
if not defined PY_CMD (
    where py >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        py -c "import sys" >nul 2>&1
        if !ERRORLEVEL! EQU 0 set "PY_CMD=py"
    )
)
if not defined PY_CMD (
    where python >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        python -c "import sys" >nul 2>&1
        if !ERRORLEVEL! EQU 0 set "PY_CMD=python"
    )
)

:: 2. Eger Python bulunamadiysa, Otomatik Akilli Kurulum Baslat
if not defined PY_CMD (
    echo [!] Bilgisayarda Python tespit edilemedi.
    echo [*] Sisteminiz icin en uygun Python surumu otomatik kuruluyor...
    echo.

    :: Mimariyi ve Windows surumunu tespit et
    set "ARCH=32"
    if defined PROCESSOR_ARCHITEW6432 (
        set "ARCH=64"
    ) else if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
        set "ARCH=64"
    )

    :: Tum Windows'lar (Windows 7/8/10/11) ile uyumlu resmi Python 3.8.10 yukleyicisi
    set "PY_URL=https://www.python.org/ftp/python/3.8.10/python-3.8.10.exe"
    if "!ARCH!"=="64" (
        set "PY_URL=https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe"
    )

    echo [*] Python indiriliyor (!ARCH!-bit)...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('!PY_URL!', '%TEMP%\python_installer.exe')" >nul 2>&1

    if exist "%TEMP%\python_installer.exe" (
        echo [*] Sessiz kurulum yapiliyor (C:\Python38)...
        start /wait "" "%TEMP%\python_installer.exe" /quiet InstallAllUsers=1 TargetDir=C:\Python38 PrependPath=1 Include_pip=1
        del /f /q "%TEMP%\python_installer.exe" >nul 2>&1
        if exist "C:\Python38\python.exe" set "PY_CMD=C:\Python38\python.exe"
    )

    :: Yedek olarak py.exe veya sistem python kontrolu
    if not defined PY_CMD (
        where python >nul 2>&1
        if !ERRORLEVEL! EQU 0 set "PY_CMD=python"
    )

    if not defined PY_CMD (
        echo.
        echo [HATA] Python otomatik yuklenemedi.
        echo Lutfen yonetici olarak calistirmayi deneyin veya https://www.python.org adresinden kurun.
        pause
        exit /b 1
    )
    echo [V] Python kurulumu basariyla tamamlandi.
    echo.
)

:: 3. Gerekli Kutuphaneleri (Requirements) Kontrol Et ve Eksikse Yukle
echo [*] Python Motoru: !PY_CMD!
"%PY_CMD%" -c "import fastapi, uvicorn, openpyxl, PIL" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo [*] Gerekli eklentiler eksik veya ilk calistirma. Paketler yukleniyor...
    "%PY_CMD%" -m pip install --upgrade pip --quiet --no-warn-script-location >nul 2>&1
    "%PY_CMD%" -m pip install -r requirements.txt --quiet --no-warn-script-location
    if !ERRORLEVEL! NEQ 0 (
        echo [UYARI] Bazi paketler tam yuklenememis olabilir, uygulama baslatilmaya calisiliyor...
    )
)

:: 4. Calisma Dizinini Guvene Al
if not exist "main.py" (
    if exist "%~dp0Etiket Yazdirici\main.py" cd /d "%~dp0Etiket Yazdirici"
    if exist "%~dp0Etiket Yazdırıcı\main.py" cd /d "%~dp0Etiket Yazdırıcı"
)

echo [*] Sunucu baslatiliyor ve tarayici aciliyor...
echo [i] Bu pencere acik kaldigi surece etiket sistemi aktif kalacaktir.
echo.
"%PY_CMD%" main.py

if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [HATA] Program beklenmeyen bir sekilde sonlandi.
    pause
)
