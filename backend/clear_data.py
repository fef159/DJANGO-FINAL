"""
Script para limpiar todos los datos de la base de datos
Ejecutar con: python clear_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from products.models import Product, Category
from cart.models import Cart, CartItem
from purchases.models import Purchase, PurchaseItem
from accounts.models import User

def clear_all_data():
    """Eliminar todos los datos excepto superusuarios"""
    print("=" * 60)
    print("LIMPIANDO DATOS DE LA BASE DE DATOS")
    print("=" * 60)
    
    # Eliminar items de compras
    print("\nEliminando items de compras...")
    PurchaseItem.objects.all().delete()
    print("  ✓ Items de compras eliminados")
    
    # Eliminar compras
    print("Eliminando compras...")
    Purchase.objects.all().delete()
    print("  ✓ Compras eliminadas")
    
    # Eliminar items del carrito
    print("Eliminando items del carrito...")
    CartItem.objects.all().delete()
    print("  ✓ Items del carrito eliminados")
    
    # Eliminar carritos
    print("Eliminando carritos...")
    Cart.objects.all().delete()
    print("  ✓ Carritos eliminados")
    
    # Eliminar productos
    print("Eliminando productos...")
    products_count = Product.objects.count()
    Product.objects.all().delete()
    print(f"  ✓ {products_count} productos eliminados")
    
    # Eliminar categorías
    print("Eliminando categorías...")
    categories_count = Category.objects.count()
    Category.objects.all().delete()
    print(f"  ✓ {categories_count} categorías eliminadas")
    
    # Eliminar usuarios regulares (no superusuarios)
    print("Eliminando usuarios regulares...")
    regular_users = User.objects.filter(is_superuser=False)
    regular_users_count = regular_users.count()
    regular_users.delete()
    print(f"  ✓ {regular_users_count} usuarios regulares eliminados")
    
    print("\n" + "=" * 60)
    print("✓ DATOS LIMPIADOS EXITOSAMENTE")
    print("=" * 60)
    print(f"\nResumen:")
    print(f"  - Categorías restantes: {Category.objects.count()}")
    print(f"  - Productos restantes: {Product.objects.count()}")
    print(f"  - Usuarios restantes: {User.objects.count()} (solo superusuarios)")
    print("\n¡Base de datos limpia! Ahora puedes ejecutar create_sample_data.py")

if __name__ == '__main__':
    confirm = input("\n⚠️  ¿Estás seguro de que quieres eliminar TODOS los datos? (sí/no): ")
    if confirm.lower() in ['sí', 'si', 'yes', 'y', 's']:
        clear_all_data()
    else:
        print("Operación cancelada.")





