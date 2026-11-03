@echo off
chcp 65001 >nul
echo ========================================================
echo KHOI CHAY HE THONG TITAN GYM (CHE DO PRODUCTION)
echo ========================================================

echo [1/4] Dang khoi chay Backend API o cong 3000 (Production)...
start "TitanGym Backend API - Prod" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd API && npm run start"

echo.
echo [2/4] Dang khoi chay Admin Web o cong 3002 (Next.js Production)...
start "TitanGym Admin Web - Prod" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd admin-web && npm run start"

echo.
echo [3/4] Dang khoi chay Unified Mobile App (Expo Production Mode)...
start "TitanGym Mobile App - Prod" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd mobile-app && npx expo start --no-dev --minify"

echo.
echo [4/4] Dang khoi chay tunnel ngrok o cong 3000...
start "TitanGym Ngrok Tunnel" cmd /k ".\ngrok.exe http 3000"

echo.
echo ========================================================
echo KHOI CHAY THANH CONG CAC PHAN HE PRODUCTION!
echo.
echo 🌐 Admin Web (Production): http://localhost:3002
echo 🔌 Backend API (Production): http://localhost:3000
echo 📲 Android App: Tai ung dung "Expo Go" tren dien thoai Android,
echo    sau do quet ma QR trong cua so Terminal de chay phat.
echo.
echo *Luu y: Ngrok dang chay o cong 3000 de anh xa den URL tinh:
echo  https://robert-leafiest-kristen.ngrok-free.dev
echo ========================================================
pause
