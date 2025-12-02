# Script PowerShell para iniciar el servidor Django con el entorno virtual correcto
Set-Location $PSScriptRoot
.\.venv\Scripts\Activate.ps1
python manage.py runserver

