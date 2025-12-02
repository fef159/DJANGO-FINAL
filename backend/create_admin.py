import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from accounts.models import User

# Eliminar superusuario existente si hay problema
try:
    old_admin = User.objects.filter(email='admin@example.com').first()
    if old_admin:
        old_admin.delete()
        print("Superusuario anterior eliminado")
except:
    pass

# Crear nuevo superusuario
try:
    admin = User.objects.create_superuser(
        email='admin@example.com',
        username='admin',
        password='admin123'
    )
    print("✅ Superusuario creado exitosamente!")
    print(f"Email: {admin.email}")
    print(f"Username: {admin.username}")
    print("Contraseña: admin123")
except Exception as e:
    print(f"Error: {e}")
    # Si ya existe, intentar resetear la contraseña
    try:
        admin = User.objects.get(email='admin@example.com')
        admin.set_password('admin123')
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()
        print("✅ Contraseña del superusuario actualizada!")
    except Exception as e2:
        print(f"Error al actualizar: {e2}")

