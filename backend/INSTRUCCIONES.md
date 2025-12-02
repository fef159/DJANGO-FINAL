# 🚨 IMPORTANTE: Cómo ejecutar el servidor correctamente

## ❌ **PROBLEMA**

Si ves este error:
```
'RequestContext' object has no attribute '_processors_index'
Python Executable: C:\Python314\python.exe
Python Version: 3.14.0
```

**Significa que estás usando Python 3.14 en lugar del entorno virtual.**

---

## ✅ **SOLUCIÓN: Siempre activa el entorno virtual**

### **Opción 1: Usar el script (RECOMENDADO)**

**Windows (PowerShell):**
```powershell
cd C:\Users\ander\Desktop\Chio\backend
.\run_server.ps1
```

**Windows (CMD):**
```cmd
cd C:\Users\ander\Desktop\Chio\backend
run_server.bat
```

---

### **Opción 2: Activación manual**

**PowerShell:**
```powershell
cd C:\Users\ander\Desktop\Chio\backend
.\.venv\Scripts\activate
python manage.py runserver
```

**CMD:**
```cmd
cd C:\Users\ander\Desktop\Chio\backend
.venv\Scripts\activate
python manage.py runserver
```

---

## ✅ **Verificar que estás usando el Python correcto**

Después de activar el entorno virtual, verifica:

```powershell
python --version
# Debe mostrar: Python 3.13.5

python -c "import sys; print(sys.executable)"
# Debe mostrar una ruta que incluya: .venv\Scripts\python.exe
```

**NO debe mostrar:**
- `C:\Python314\python.exe`
- `C:\Python313\python.exe` (a menos que sea del venv)

---

## 🔧 **Configurar VS Code para usar el venv automáticamente**

1. Abre VS Code en la carpeta `backend`
2. Presiona `Ctrl+Shift+P`
3. Escribe: `Python: Select Interpreter`
4. Selecciona: `.venv\Scripts\python.exe`

VS Code recordará esta configuración para este proyecto.

---

## 📝 **Resumen**

- ✅ **SIEMPRE** activa el entorno virtual antes de ejecutar Django
- ✅ Usa los scripts `run_server.bat` o `run_server.ps1`
- ✅ Verifica que `python --version` muestre `Python 3.13.5`
- ❌ **NUNCA** ejecutes `python manage.py runserver` sin activar el venv primero

---

## 🆘 **Si el error persiste**

1. Detén todos los procesos de Python:
   ```powershell
   Get-Process python* | Stop-Process -Force
   ```

2. Activa el entorno virtual:
   ```powershell
   cd C:\Users\ander\Desktop\Chio\backend
   .\.venv\Scripts\activate
   ```

3. Verifica la versión:
   ```powershell
   python --version
   ```

4. Inicia el servidor:
   ```powershell
   python manage.py runserver
   ```

