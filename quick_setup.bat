@echo off
chcp 65001 >nul
echo =========================================
echo TITAN GYM - KICH HOAT SETUP HE THONG
echo =========================================

echo [1/6] Dang cai dat cac goi thu vien cho Backend API...
cd API
call npm install

echo.
echo [2/6] Khoi tao Database CSDL (Prisma)...
call npx prisma generate
call npx prisma migrate dev --name init
call npx prisma db seed

echo.
echo [3/6] Dang cai dat cac goi thu vien cho Frontend (Guest Web)...
cd ../guest-web
call npm install

echo.
echo [4/6] Dang cai dat cac goi thu vien cho Quan tri (Admin Web)...
cd ../admin-web
call npm install

echo.
echo [5/6] Dang cai dat cac goi thu vien cho PT (Trainer App)...
cd ../trainer-app
call npm install

echo.
echo [6/6] Dang cai dat cac goi thu vien cho Hoi vien (Member App)...
cd ../member-app
call npm install

echo.
echo =========================================
echo HOAN TAT SETUP! TAT CA DA SAN SANG.
echo Ban bay gio da co the nhay vao file start_app.bat de khoi chay.
echo =========================================
pause
