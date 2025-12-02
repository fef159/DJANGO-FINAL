# 🔧 Configuración de Stripe para Chio E-commerce

## ⚠️ Problema Actual
El error **"'NoneType' object has no attribute 'secret'"** ocurre porque las claves de Stripe no están configuradas.

## ✅ Solución Paso a Paso

### 1️⃣ Obtener Claves de Stripe

1. Ve a [Stripe Dashboard - API Keys](https://dashboard.stripe.com/test/apikeys)
2. Si no tienes cuenta, créala gratis
3. Copia las siguientes claves:
   - **Secret key** (comienza con `sk_test_...`)
   - **Publishable key** (comienza con `pk_test_...`)

### 2️⃣ Configurar Backend

Crea un archivo `.env` en la carpeta `backend/`:

```env
# Django Settings
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI

# Frontend URL
FRONTEND_URL=http://localhost:3000

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**⚠️ IMPORTANTE:** Reemplaza `TU_CLAVE_SECRETA_AQUI` y `TU_CLAVE_PUBLICA_AQUI` con tus claves reales de Stripe.

### 3️⃣ Configurar Frontend

Crea un archivo `.env` en la carpeta `frontend/`:

```env
# Stripe Publishable Key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI

# Backend API URL
REACT_APP_API_URL=http://localhost:8000
```

**⚠️ IMPORTANTE:** Usa la misma clave pública (`pk_test_...`) que usaste en el backend.

### 4️⃣ Reiniciar Servidores

Después de crear los archivos `.env`:

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm start
```

### 5️⃣ Verificar Configuración

Cuando inicies el backend, deberías ver:
```
✅ STRIPE_SECRET_KEY cargada correctamente: sk_test_51...
```

Si ves:
```
⚠️ ADVERTENCIA: STRIPE_SECRET_KEY no está configurada
```

Significa que el archivo `.env` no existe o las claves no están configuradas correctamente.

## 🧪 Probar Pagos

Una vez configurado, puedes usar las siguientes tarjetas de prueba:

- **Pago exitoso:** `4242 4242 4242 4242`
- **Pago rechazado:** `4000 0000 0000 0002`
- **Requiere autenticación:** `4000 0025 0000 3155`

**Fecha de expiración:** Cualquier fecha futura (ej: 12/25)
**CVC:** Cualquier 3 dígitos (ej: 123)
**ZIP:** Cualquier 5 dígitos (ej: 12345)

## 📚 Recursos

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Documentación de Stripe](https://stripe.com/docs)
- [Tarjetas de Prueba](https://stripe.com/docs/testing)

## 🔒 Seguridad

- **NUNCA** compartas tu clave secreta (`sk_test_...` o `sk_live_...`)
- **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
- La clave pública (`pk_test_...`) es segura para usar en el frontend
