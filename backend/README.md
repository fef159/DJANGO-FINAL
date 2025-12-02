# Backend Django - E-commerce

## Instalación

1. Crear un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configurar variables de entorno en `.env`:
- `SECRET_KEY`: Clave secreta de Django
- `DEBUG`: True para desarrollo
- `STRIPE_SECRET_KEY`: Clave secreta de Stripe
- `STRIPE_PUBLISHABLE_KEY`: Clave pública de Stripe

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

## Endpoints

### Autenticación
- `POST /api/auth/register/` - Registrar usuario
- `POST /api/auth/login/` - Iniciar sesión
- `GET /api/auth/me/` - Obtener usuario actual (requiere autenticación)

### Compras
- `GET /api/purchases/history/` - Historial de compras del usuario autenticado
- `POST /api/purchases/create/` - Crear nueva compra (requiere autenticación)

