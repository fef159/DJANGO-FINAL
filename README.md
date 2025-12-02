# E-commerce con Django y React

Sistema completo de comercio electrónico con backend Django REST Framework y frontend React.

## Características

### Backend (Django)
- ✅ Autenticación con JWT (registro y login)
- ✅ Modelo de historial de compras
- ✅ Endpoints REST para compras
- ✅ Integración con Stripe

### Frontend (React)
- ✅ Formularios de registro e inicio de sesión
- ✅ Pasarela de pago Stripe (Tarjeta, Google Pay, Apple Pay, PayPal)
- ✅ Checkout y confirmación de pago
- ✅ Historial de compras
- ✅ Navegación fluida con React Query y prefetch
- ✅ Sincronización automática frontend-backend

## Instalación

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Crear entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

5. Ejecutar migraciones:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Crear superusuario (opcional):
```bash
python manage.py createsuperuser
```

7. Ejecutar servidor:
```bash
python manage.py runserver
```

El backend estará disponible en http://localhost:8000

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales de Stripe
```

4. Ejecutar servidor de desarrollo:
```bash
npm start
```

El frontend estará disponible en http://localhost:3000

## Configuración de Stripe

1. Crear una cuenta en [Stripe](https://stripe.com)
2. Obtener las claves de API (modo test)
3. Configurar las claves en los archivos `.env`:
   - Backend: `STRIPE_SECRET_KEY` y `STRIPE_PUBLISHABLE_KEY`
   - Frontend: `REACT_APP_STRIPE_PUBLISHABLE_KEY`

## Uso

1. Iniciar el backend Django
2. Iniciar el frontend React
3. Registrar un nuevo usuario
4. Agregar productos al carrito
5. Proceder al checkout
6. Realizar un pago de prueba
7. Ver el historial de compras

## Tecnologías

- **Backend**: Django 4.2, Django REST Framework, JWT, Stripe
- **Frontend**: React 18, React Router, React Query, Stripe.js
- **Base de datos**: SQLite (desarrollo)

## Notas

- El proyecto usa SQLite por defecto para desarrollo
- Para producción, configurar una base de datos PostgreSQL o MySQL
- Las claves de Stripe deben ser de modo test para desarrollo
- El diseño usa colores inspirados en Dragon Ball (azul y naranja)

