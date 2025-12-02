# 🐍 Cómo usar el entorno virtual

## ✅ **Configuración completada**

Tu proyecto ahora usa **Python 3.13.5** en un entorno virtual (`.venv`), que es más compatible con Django 4.2.7 que Python 3.14.

---

## 🚀 **Cómo activar el entorno virtual**

### En PowerShell:

```powershell
cd C:\Users\ander\Desktop\Chio\backend
.\.venv\Scripts\activate
```

Verás `(.venv)` al inicio de tu prompt cuando esté activado.

---

## ✅ **Verificar que funciona**

```powershell
python --version
# Debe mostrar: Python 3.13.5

python manage.py check
# Debe mostrar: System check identified no issues
```

---

## 🏃 **Ejecutar el servidor**

```powershell
python manage.py runserver
```

Luego accede a:
- **Admin**: http://127.0.0.1:8000/admin/
- **API**: http://127.0.0.1:8000/api/

---

## 📝 **Notas importantes**

1. **Siempre activa el entorno virtual** antes de ejecutar comandos de Django
2. El entorno virtual está en `.venv/` (no se sube a git)
3. Si instalas nuevas dependencias, actualiza `requirements.txt`:
   ```powershell
   pip freeze > requirements.txt
   ```

---

## 🔧 **Si necesitas Python 3.12 (más compatible)**

Si Python 3.13 aún da problemas, puedes instalar Python 3.12:

1. Descarga desde: https://www.python.org/downloads/release/python-3120/
2. Instala marcando "Add to PATH"
3. Crea nuevo venv:
   ```powershell
   py -3.12 -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```

---

## ❌ **Desactivar el entorno virtual**

```powershell
deactivate
```

