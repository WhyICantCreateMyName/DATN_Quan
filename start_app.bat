@echo off
chcp 65001 >nul
echo =========================================
echo KHOI CHAY HE THONG TITAN GYM
echo =========================================

echo [1/5] Dang danh thuc Backend API o cong 3000...
start "TitanGym Backend API" cmd /k "cd API && npm run dev"

echo [2/5] Dang danh thuc Guest Web o cong 3001...
start "TitanGym Guest Web" cmd /k "cd guest-web && npm run dev"

echo.
echo [3/5] Dang danh thuc Admin Web o cong 3002...
start "TitanGym Admin Web" cmd /k "cd admin-web && npm run dev"

echo.
echo [4/5] Dang danh thuc PT (Trainer App) o cong 3003...
start "TitanGym PT App" cmd /k "cd trainer-app && npm run start"

echo.
echo Da phat lenh khoi chay thanh cong. 
echo He thong da tu dong mo 3 cua so Terminal rieng biet de quan ly cac ung dung.
echo.
echo Web thu nghiem: http://localhost:3001
echo API: http://localhost:3000
echo Phan he Quan tri / Le tan: http://localhost:3002
echo =========================================
pause
