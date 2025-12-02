# Frontend React - E-commerce

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar variables de entorno en `.env`:
- `REACT_APP_API_URL`: URL del backend Django (por defecto: http://localhost:8000)
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`: Clave pública de Stripe

4. Ejecutar servidor de desarrollo:
```bash
npm start
```

La aplicación se abrirá en http://localhost:3000

## Características

- **Autenticación**: Registro e inicio de sesión con JWT
- **Pasarela de pago**: Integración con Stripe (Tarjeta, Google Pay, Apple Pay, PayPal)
- **Checkout**: Proceso de pago completo con confirmación
- **Historial de compras**: Vista de todas las compras realizadas
- **React Query**: Navegación fluida con prefetch y cache
- **Sincronización**: Sincronización automática entre frontend y backend

## Estructura

- `src/context/`: Contexto de autenticación
- `src/services/`: Servicios API
- `src/components/`: Componentes reutilizables
- `src/pages/`: Páginas principales
- `src/App.js`: Componente principal con rutas

