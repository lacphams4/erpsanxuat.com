@echo off
rem Dong goi Trumbo 3 thanh file .nsp bang khoa (prod.keys) cua chinh may Switch.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [!] Chua cai Node.js. Tai ban LTS tai https://nodejs.org roi chay lai file nay.
  pause
  exit /b 1
)
if not exist prod.keys (
  echo [!] Chua co file prod.keys trong thu muc nay.
  echo     Dump khoa tu may Switch bang Lockpick_RCM, roi chep prod.keys vao day.
  pause
  exit /b 1
)
call npm install --no-audit --no-fund || goto :err
call npm run build || goto :err
call npx nxjs-nsp --fat -k prod.keys || goto :err
echo.
echo Xong! File trumbo-3.nsp nam trong thu muc nay. Cai bang DBI, Tinfoil hoac Goldleaf.
pause
exit /b 0
:err
echo.
echo [!] Co loi, xem thong bao phia tren.
pause
exit /b 1
