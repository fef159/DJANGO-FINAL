# 🔑 Guía Paso a Paso: Configurar Stripe

## ⚠️ Problema Actual
Tus archivos `.env` tienen valores placeholder (`sk_test_placeholder`). Necesitas reemplazarlos con tus claves reales de Stripe.

---

## 📋 Paso 1: Crear cuenta en Stripe (si no tienes una)

1. Ve a: **https://stripe.com**
2. Haz clic en "Sign up" (Registrarse)
3. Completa el formulario (es gratis)
4. Verifica tu email

---

## 🔑 Paso 2: Obtener las claves de API

1. **Inicia sesión** en Stripe: https://dashboard.stripe.com/login

2. **Asegúrate de estar en modo TEST** (modo de prueba):
   - En la parte superior derecha, verás un toggle que dice "Test mode"
   - Debe estar **activado** (azul)

3. **Ve a las claves de API**:
   - En el menú lateral izquierdo, haz clic en **"Developers"**
   - Luego haz clic en **"API keys"**
   - O ve directamente a: https://dashboard.stripe.com/test/apikeys

4. **Copia las claves**:
   - **Secret key**: Empieza con `sk_test_...`
     - Haz clic en "Reveal test key" para verla
     - Copia toda la clave (ejemplo: `sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`)
   
   - **Publishable key**: Empieza con `pk_test_...`
     - Esta está visible directamente
     - Copia toda la clave (ejemplo: `pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`)

---

## 📝 Paso 3: Configurar Backend

1. **Abre el archivo**: `backend/.env`

2. **Reemplaza estas líneas**:
   ```env
   STRIPE_SECRET_KEY=sk_test_placeholder
   STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
   ```
   
   **Por tus claves reales**:
   ```env
   STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
   STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
   ```

3. **Guarda el archivo**

---

## 📝 Paso 4: Configurar Frontend

1. **Abre el archivo**: `frontend/.env`

2. **Reemplaza esta línea**:
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
   ```
   
   **Por tu clave pública real**:
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
   ```

3. **Guarda el archivo**

---

## 🔄 Paso 5: Reiniciar los servidores

### Detener servidores actuales:
1. Ve a las terminales donde están corriendo Django y React
2. Presiona `Ctrl + C` en cada una para detenerlos

### Reiniciar Backend:
```bash
cd backend
python manage.py runserver
```

### Reiniciar Frontend (en otra terminal):
```bash
cd frontend
npm start
```

---

## ✅ Paso 6: Verificar que funciona

1. Recarga la página del checkout en tu navegador
2. El error de Stripe debería desaparecer
3. Deberías poder ver el formulario de pago con tarjeta

---

## 🧪 Probar un pago (con tarjeta de prueba)

Stripe proporciona tarjetas de prueba para desarrollo:

**Tarjeta de prueba exitosa:**
- **Número**: `4242 4242 4242 4242`
- **Fecha de expiración**: Cualquier fecha futura (ej: `12/25`)
- **CVC**: Cualquier 3 dígitos (ej: `123`)
- **Código postal**: Cualquier código válido (ej: `12345`)

**Otras tarjetas de prueba:**
- Declinada: `4000 0000 0000 0002`
- Requiere autenticación: `4000 0025 0000 3155`

---

## ⚠️ Notas Importantes

✅ **Siempre usa claves de TEST** para desarrollo
- Las claves de test empiezan con `sk_test_` y `pk_test_`
- No procesan pagos reales
- Son seguras de compartir en código (pero no en producción)

❌ **Nunca uses claves de producción** en desarrollo
- Las claves de producción empiezan con `sk_live_` y `pk_live_`
- Procesan pagos reales
- Son muy sensibles y no deben compartirse

---

## 🆘 ¿Problemas?

### Error: "Invalid API Key"
- Verifica que copiaste las claves completas (sin espacios)
- Asegúrate de que estás usando claves de TEST (no LIVE)
- Verifica que reiniciaste los servidores después de cambiar el .env

### Error: "Stripe no está configurado"
- Verifica que los archivos .env existen
- Verifica que las claves no tienen espacios extra
- Asegúrate de reiniciar los servidores

### ¿No encuentras las claves?
- Ve a: https://dashboard.stripe.com/test/apikeys
- Asegúrate de estar en modo TEST (no LIVE)
- Si no ves las claves, crea una nueva cuenta de Stripe

---

## 📚 Recursos

- Dashboard de Stripe: https://dashboard.stripe.com
- Documentación de Stripe: https://stripe.com/docs
- Tarjetas de prueba: https://stripe.com/docs/testing

---

¡Listo! Una vez configurado, podrás procesar pagos de prueba en tu aplicación. 🎉

