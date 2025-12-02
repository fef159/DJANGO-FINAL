@echo off
REM Script para iniciar el servidor Django con el entorno virtual correcto
cd /d "%~dp0"
call .venv\Scripts\activate.bat
python manage.py runserver
pause

