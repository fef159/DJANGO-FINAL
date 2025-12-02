# 🔑 Configuración de Stripe

## Problema Actual
Estás viendo un error porque las claves de Stripe no están configuradas correctamente.

## Solución Rápida

### Paso 1: Crear cuenta en Stripe (si no tienes una)
1. Ve a https://stripe.com
2. Crea una cuenta gratuita
3. Activa el modo de prueba (Test Mode)

### Paso 2: Obtener las claves de API
1. Ve al Dashboard de Stripe: https://dashboard.stripe.com/test/apikeys
2. Copia la **Secret key** (empieza con `sk_test_...`)
3. Copia la **Publishable key** (empieza con `pk_test_...`)

### Paso 3: Configurar en el Backend
1. Abre el archivo `backend/.env`
2. Agrega o actualiza estas líneas:
```env
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
```

### Paso 4: Configurar en el Frontend
1. Abre el archivo `frontend/.env`
2. Agrega o actualiza esta línea:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
```

### Paso 5: Reiniciar los servidores
1. Detén el servidor Django (Ctrl+C)
2. Detén el servidor React (Ctrl+C)
3. Reinicia ambos servidores

## Ejemplo de archivo .env del Backend
```env
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

## Ejemplo de archivo .env del Frontend
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

## Notas Importantes
- ✅ Usa siempre claves de **prueba** (test) para desarrollo
- ✅ Las claves de prueba empiezan con `sk_test_` y `pk_test_`
- ✅ Nunca compartas tus claves secretas públicamente
- ✅ Las claves de prueba no procesan pagos reales

## Tarjetas de Prueba de Stripe
Para probar pagos, usa estas tarjetas de prueba:
- **Tarjeta exitosa**: `4242 4242 4242 4242`
- **Fecha de expiración**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Código postal**: Cualquier código válido (ej: 12345)

## ¿Necesitas ayuda?
- Documentación de Stripe: https://stripe.com/docs
- Dashboard de Stripe: https://dashboard.stripe.com

