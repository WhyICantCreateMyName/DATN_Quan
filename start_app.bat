@echo off
chcp 65001 >nul
echo =========================================
echo KHOI CHAY HE THONG TITAN GYM
echo =========================================

echo [1/3] Dang danh thuc Backend API o cong 3000...
start "TitanGym Backend API" cmd /k "cd API && npm run dev"

echo.
echo [2/3] Dang danh thuc Admin Web (Landing + Admin) o cong 3002...
start "TitanGym Admin Web" cmd /k "cd admin-web && npm run dev"

echo.
echo [3/3] Dang danh thuc Unified Mobile App (Member + PT)...
start "TitanGym Mobile App" cmd /k "cd mobile-app && npx expo start"

start cmd /k ".\ngrok.exe http 3000"

echo.
echo Da phat lenh khoi chay thanh cong. 
echo He thong da tu dong mo cac cua so Terminal rieng biet de quan ly ung dung.
echo.
echo Landing Page ^& Quan tri / Le tan: http://localhost:3002
echo API Backend: http://localhost:3000
echo Mobile App: Quet ma QR qua Expo Go de khoi chay.
echo ==============================================
pause
