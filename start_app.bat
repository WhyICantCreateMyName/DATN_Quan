@echo off
chcp 65001 >nul
echo =========================================
echo KHOI CHAY HE THONG TITAN GYM
echo =========================================

echo [1/2] Dang danh thuc Backend API o cong 3000...
start "TitanGym Backend API" cmd /k "cd API && npm run dev"

echo [2/2] Dang danh thuc Guest Web o cong 3001...
start "TitanGym Guest Web" cmd /k "cd guest-web && npm run dev"

echo.
echo Da phat lenh khoi chay thanh cong. 
echo He thong da tu dong mo 2 cua so Terminal rieng biet de quan ly API va Web.
echo.
echo Web thu nghiem: http://localhost:3001
echo API: http://localhost:3000
echo =========================================
pause
