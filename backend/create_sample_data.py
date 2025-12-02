"""
Script para crear datos de prueba en la base de datos
Ejecutar con: python manage.py shell < create_sample_data.py
O mejor: python create_sample_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from products.models import Category, Product
from accounts.models import User
from decimal import Decimal

def create_categories():
    """Crear categorías de ejemplo"""
    print("Creando categorías...")
    
    categories_data = [
        {
            'name': 'Electrónica',
            'slug': 'electronica',
            'description': 'Dispositivos electrónicos y gadgets de última generación',
            'image_url': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
        },
        {
            'name': 'Ropa',
            'slug': 'ropa',
            'description': 'Ropa y accesorios de moda para todas las edades',
            'image_url': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'
        },
        {
            'name': 'Hogar',
            'slug': 'hogar',
            'description': 'Artículos para el hogar, decoración y muebles',
            'image_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
        },
        {
            'name': 'Deportes',
            'slug': 'deportes',
            'description': 'Equipamiento deportivo, fitness y actividades al aire libre',
            'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
        },
        {
            'name': 'Libros',
            'slug': 'libros',
            'description': 'Libros, novelas, guías y material de lectura',
            'image_url': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
        },
        {
            'name': 'Juguetes',
            'slug': 'juguetes',
            'description': 'Juguetes educativos y de entretenimiento para niños',
            'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
        },
        {
            'name': 'Belleza',
            'slug': 'belleza',
            'description': 'Productos de belleza, cuidado personal y cosméticos',
            'image_url': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400'
        },
        {
            'name': 'Alimentos',
            'slug': 'alimentos',
            'description': 'Alimentos gourmet, snacks y productos especiales',
            'image_url': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
        },
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        categories[cat_data['slug']] = category
        if created:
            print(f"  ✓ Categoría creada: {category.name}")
        else:
            print(f"  - Categoría ya existe: {category.name}")
    
    return categories

def create_products(categories):
    """Crear productos de ejemplo"""
    print("\nCreando productos...")
    
    products_data = [
        # Electrónica
        {
            'name': 'Smartphone Pro Max',
            'slug': 'smartphone-pro-max',
            'description': 'Smartphone de última generación con pantalla AMOLED de 6.7 pulgadas, 256GB de almacenamiento y cámara de 108MP.',
            'price': Decimal('899.99'),
            'discount_price': Decimal('749.99'),
            'stock': 50,
            'category': categories['electronica'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
        },
        {
            'name': 'Laptop Ultrabook',
            'slug': 'laptop-ultrabook',
            'description': 'Laptop ultradelgada con procesador Intel i7, 16GB RAM, SSD 512GB y pantalla 14 pulgadas Full HD.',
            'price': Decimal('1299.99'),
            'discount_price': Decimal('1099.99'),
            'stock': 30,
            'category': categories['electronica'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
        },
        {
            'name': 'Auriculares Inalámbricos',
            'slug': 'auriculares-inalambricos',
            'description': 'Auriculares Bluetooth con cancelación de ruido activa y batería de 30 horas.',
            'price': Decimal('199.99'),
            'discount_price': Decimal('149.99'),
            'stock': 100,
            'category': categories['electronica'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
        },
        {
            'name': 'Smartwatch Fitness',
            'slug': 'smartwatch-fitness',
            'description': 'Reloj inteligente con monitor de frecuencia cardíaca, GPS y resistencia al agua.',
            'price': Decimal('299.99'),
            'stock': 75,
            'category': categories['electronica'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
        },
        {
            'name': 'Tablet 10 pulgadas',
            'slug': 'tablet-10-pulgadas',
            'description': 'Tablet con pantalla de 10 pulgadas, 128GB de almacenamiento y soporte para lápiz digital.',
            'price': Decimal('449.99'),
            'discount_price': Decimal('399.99'),
            'stock': 40,
            'category': categories['electronica'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'
        },
        
        # Ropa
        {
            'name': 'Camiseta Premium',
            'slug': 'camiseta-premium',
            'description': 'Camiseta de algodón orgánico 100%, cómoda y transpirable. Disponible en varios colores.',
            'price': Decimal('29.99'),
            'discount_price': Decimal('24.99'),
            'stock': 200,
            'category': categories['ropa'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
        },
        {
            'name': 'Jeans Clásicos',
            'slug': 'jeans-clasicos',
            'description': 'Jeans de corte clásico, talle regular, material denim de alta calidad.',
            'price': Decimal('79.99'),
            'discount_price': Decimal('59.99'),
            'stock': 150,
            'category': categories['ropa'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'
        },
        {
            'name': 'Zapatillas Deportivas',
            'slug': 'zapatillas-deportivas',
            'description': 'Zapatillas cómodas para running y entrenamiento, con tecnología de amortiguación.',
            'price': Decimal('89.99'),
            'discount_price': Decimal('69.99'),
            'stock': 120,
            'category': categories['ropa'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
        },
        
        # Hogar
        {
            'name': 'Set de Sábanas Premium',
            'slug': 'set-sabanas-premium',
            'description': 'Set de sábanas de algodón egipcio, incluye sábana bajera, sábana encimera y 2 fundas de almohada.',
            'price': Decimal('59.99'),
            'discount_price': Decimal('49.99'),
            'stock': 80,
            'category': categories['hogar'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400'
        },
        {
            'name': 'Lámpara de Mesa LED',
            'slug': 'lampara-mesa-led',
            'description': 'Lámpara de escritorio con luz LED regulable, diseño moderno y eficiencia energética.',
            'price': Decimal('39.99'),
            'stock': 90,
            'category': categories['hogar'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1507473885765-e6ed557f814b?w=400'
        },
        {
            'name': 'Juego de Ollas Antiadherentes',
            'slug': 'juego-ollas-antiadherentes',
            'description': 'Set de 5 ollas y sartenes con recubrimiento antiadherente de cerámica.',
            'price': Decimal('129.99'),
            'discount_price': Decimal('99.99'),
            'stock': 60,
            'category': categories['hogar'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400'
        },
        
        # Deportes
        {
            'name': 'Pelota de Fútbol Oficial',
            'slug': 'pelota-futbol-oficial',
            'description': 'Pelota de fútbol tamaño 5, material sintético de alta calidad, ideal para cancha.',
            'price': Decimal('34.99'),
            'discount_price': Decimal('29.99'),
            'stock': 100,
            'category': categories['deportes'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400'
        },
        {
            'name': 'Mancuernas Ajustables',
            'slug': 'mancuernas-ajustables',
            'description': 'Par de mancuernas ajustables de 2.5kg a 20kg cada una, con barra de seguridad.',
            'price': Decimal('149.99'),
            'stock': 50,
            'category': categories['deportes'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
        },
        {
            'name': 'Bicicleta de Montaña',
            'slug': 'bicicleta-montana',
            'description': 'Bicicleta de montaña con 21 velocidades, suspensión delantera y frenos de disco.',
            'price': Decimal('599.99'),
            'discount_price': Decimal('499.99'),
            'stock': 25,
            'category': categories['deportes'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
        },
        
        # Libros
        {
            'name': 'El Arte de la Programación',
            'slug': 'arte-programacion',
            'description': 'Guía completa para aprender programación desde cero hasta nivel avanzado.',
            'price': Decimal('49.99'),
            'discount_price': Decimal('39.99'),
            'stock': 150,
            'category': categories['libros'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
        },
        {
            'name': 'Novela de Ciencia Ficción',
            'slug': 'novela-ciencia-ficcion',
            'description': 'Aventura espacial épica en un futuro distante, bestseller internacional.',
            'price': Decimal('19.99'),
            'stock': 200,
            'category': categories['libros'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'
        },
        {
            'name': 'Guía de Cocina Internacional',
            'slug': 'guia-cocina-internacional',
            'description': 'Recetas de todo el mundo con fotografías a todo color y técnicas paso a paso.',
            'price': Decimal('34.99'),
            'discount_price': Decimal('29.99'),
            'stock': 80,
            'category': categories['libros'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
        },
        
        # Más productos de Electrónica
        {
            'name': 'Cámara Mirrorless 4K',
            'slug': 'camara-mirrorless-4k',
            'description': 'Cámara sin espejo con grabación 4K, sensor de 24MP y estabilización de imagen.',
            'price': Decimal('1299.99'),
            'discount_price': Decimal('1099.99'),
            'stock': 20,
            'category': categories['electronica'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400'
        },
        {
            'name': 'Monitor Curvo Gaming',
            'slug': 'monitor-curvo-gaming',
            'description': 'Monitor curvo de 27 pulgadas, 144Hz, resolución 1440p, ideal para gaming.',
            'price': Decimal('449.99'),
            'discount_price': Decimal('399.99'),
            'stock': 35,
            'category': categories['electronica'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
        },
        {
            'name': 'Teclado Mecánico RGB',
            'slug': 'teclado-mecanico-rgb',
            'description': 'Teclado mecánico con switches Cherry MX, iluminación RGB y diseño ergonómico.',
            'price': Decimal('129.99'),
            'discount_price': Decimal('99.99'),
            'stock': 80,
            'category': categories['electronica'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'
        },
        
        # Más productos de Ropa
        {
            'name': 'Chaqueta Impermeable',
            'slug': 'chaqueta-impermeable',
            'description': 'Chaqueta resistente al agua y al viento, ideal para actividades al aire libre.',
            'price': Decimal('119.99'),
            'discount_price': Decimal('89.99'),
            'stock': 60,
            'category': categories['ropa'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
        },
        {
            'name': 'Vestido Casual',
            'slug': 'vestido-casual',
            'description': 'Vestido cómodo y elegante, perfecto para el día a día, disponible en varios colores.',
            'price': Decimal('49.99'),
            'discount_price': Decimal('39.99'),
            'stock': 90,
            'category': categories['ropa'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'
        },
        {
            'name': 'Gorra Deportiva',
            'slug': 'gorra-deportiva',
            'description': 'Gorra ajustable con protección UV, diseño moderno y transpirable.',
            'price': Decimal('24.99'),
            'stock': 150,
            'category': categories['ropa'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'
        },
        
        # Más productos de Hogar
        {
            'name': 'Aspiradora Robot',
            'slug': 'aspiradora-robot',
            'description': 'Aspiradora robótica inteligente con mapeo de habitaciones y control por app.',
            'price': Decimal('299.99'),
            'discount_price': Decimal('249.99'),
            'stock': 25,
            'category': categories['hogar'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
        },
        {
            'name': 'Cafetera Express',
            'slug': 'cafetera-express',
            'description': 'Cafetera espresso automática con molinillo integrado y espumador de leche.',
            'price': Decimal('399.99'),
            'discount_price': Decimal('349.99'),
            'stock': 15,
            'category': categories['hogar'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400'
        },
        {
            'name': 'Almohada Memory Foam',
            'slug': 'almohada-memory-foam',
            'description': 'Almohada ortopédica de espuma viscoelástica, soporte cervical y funda lavable.',
            'price': Decimal('39.99'),
            'discount_price': Decimal('29.99'),
            'stock': 120,
            'category': categories['hogar'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'
        },
        
        # Más productos de Deportes
        {
            'name': 'Cinta de Correr Plegable',
            'slug': 'cinta-correr-plegable',
            'description': 'Cinta de correr eléctrica plegable con pantalla LCD y programas de entrenamiento.',
            'price': Decimal('599.99'),
            'discount_price': Decimal('499.99'),
            'stock': 10,
            'category': categories['deportes'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'
        },
        {
            'name': 'Yoga Mat Premium',
            'slug': 'yoga-mat-premium',
            'description': 'Mat de yoga antideslizante, extra grueso y ecológico, incluye correa de transporte.',
            'price': Decimal('34.99'),
            'discount_price': Decimal('24.99'),
            'stock': 200,
            'category': categories['deportes'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'
        },
        {
            'name': 'Raqueta de Tenis Profesional',
            'slug': 'raqueta-tenis-profesional',
            'description': 'Raqueta de tenis de fibra de carbono, balance perfecto y grip ergonómico.',
            'price': Decimal('149.99'),
            'discount_price': Decimal('119.99'),
            'stock': 40,
            'category': categories['deportes'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1622163642993-4586248f0e4e?w=400'
        },
        
        # Más productos de Libros
        {
            'name': 'Diccionario Enciclopédico',
            'slug': 'diccionario-enciclopedico',
            'description': 'Diccionario completo con más de 50,000 entradas y actualizaciones recientes.',
            'price': Decimal('59.99'),
            'discount_price': Decimal('49.99'),
            'stock': 100,
            'category': categories['libros'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
        },
        {
            'name': 'Biografía Inspiradora',
            'slug': 'biografia-inspiradora',
            'description': 'Historia de vida de una personalidad destacada, motivadora y llena de lecciones.',
            'price': Decimal('24.99'),
            'stock': 150,
            'category': categories['libros'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'
        },
        
        # Juguetes
        {
            'name': 'Lego Set Constructor',
            'slug': 'lego-set-constructor',
            'description': 'Set de construcción con más de 1000 piezas, incluye instrucciones detalladas.',
            'price': Decimal('79.99'),
            'discount_price': Decimal('64.99'),
            'stock': 50,
            'category': categories['juguetes'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
        },
        {
            'name': 'Muñeca Interactiva',
            'slug': 'muneca-interactiva',
            'description': 'Muñeca que habla, canta y responde a comandos, incluye accesorios.',
            'price': Decimal('49.99'),
            'discount_price': Decimal('39.99'),
            'stock': 80,
            'category': categories['juguetes'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
        },
        {
            'name': 'Puzzle 1000 Piezas',
            'slug': 'puzzle-1000-piezas',
            'description': 'Puzzle de alta calidad con 1000 piezas, imagen de paisaje natural.',
            'price': Decimal('19.99'),
            'stock': 120,
            'category': categories['juguetes'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400'
        },
        
        # Belleza
        {
            'name': 'Kit de Maquillaje Profesional',
            'slug': 'kit-maquillaje-profesional',
            'description': 'Set completo con 24 sombras, labiales, rubor y brochas de alta calidad.',
            'price': Decimal('89.99'),
            'discount_price': Decimal('69.99'),
            'stock': 60,
            'category': categories['belleza'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400'
        },
        {
            'name': 'Perfume Fragancia Premium',
            'slug': 'perfume-fragancia-premium',
            'description': 'Perfume de larga duración con notas florales y amaderadas, 100ml.',
            'price': Decimal('79.99'),
            'discount_price': Decimal('64.99'),
            'stock': 45,
            'category': categories['belleza'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'
        },
        {
            'name': 'Crema Facial Hidratante',
            'slug': 'crema-facial-hidratante',
            'description': 'Crema facial con ácido hialurónico y vitamina C, para todo tipo de piel.',
            'price': Decimal('34.99'),
            'discount_price': Decimal('24.99'),
            'stock': 200,
            'category': categories['belleza'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'
        },
        
        # Alimentos
        {
            'name': 'Café Gourmet en Grano',
            'slug': 'cafe-gourmet-grano',
            'description': 'Café de origen único, tostado artesanalmente, paquete de 500g.',
            'price': Decimal('24.99'),
            'discount_price': Decimal('19.99'),
            'stock': 100,
            'category': categories['alimentos'],
            'is_featured': True,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
        },
        {
            'name': 'Chocolate Artesanal',
            'slug': 'chocolate-artesanal',
            'description': 'Chocolate premium con 70% cacao, sin azúcares añadidos, paquete de 200g.',
            'price': Decimal('14.99'),
            'stock': 150,
            'category': categories['alimentos'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1606312619070-d48b4fbc4b8a?w=400'
        },
        {
            'name': 'Aceite de Oliva Extra Virgen',
            'slug': 'aceite-oliva-extra-virgen',
            'description': 'Aceite de oliva de primera prensada en frío, botella de 500ml.',
            'price': Decimal('19.99'),
            'discount_price': Decimal('16.99'),
            'stock': 80,
            'category': categories['alimentos'],
            'is_featured': False,
            'is_active': True,
            'image_url': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'
        },
    ]
    
    created_count = 0
    updated_count = 0
    for prod_data in products_data:
        product, created = Product.objects.get_or_create(
            slug=prod_data['slug'],
            defaults=prod_data
        )
        if created:
            created_count += 1
            print(f"  ✓ Producto creado: {product.name} - ${product.final_price} ({product.category.name if product.category else 'Sin categoría'})")
        else:
            # Actualizar categoría si el producto ya existe pero no tiene categoría
            if not product.category and prod_data.get('category'):
                product.category = prod_data['category']
                product.save()
                updated_count += 1
                print(f"  ↻ Producto actualizado: {product.name} - Categoría asignada")
            else:
                print(f"  - Producto ya existe: {product.name}")
    
    print(f"\n✓ {created_count} productos nuevos creados")
    if updated_count > 0:
        print(f"✓ {updated_count} productos actualizados con categorías")

def create_test_users():
    """Crear usuarios de prueba"""
    print("\nCreando usuarios de prueba...")
    
    users_data = [
        {
            'email': 'cliente1@example.com',
            'username': 'cliente1',
            'password': 'cliente123',
            'first_name': 'Juan',
            'last_name': 'Pérez',
        },
        {
            'email': 'cliente2@example.com',
            'username': 'cliente2',
            'password': 'cliente123',
            'first_name': 'María',
            'last_name': 'García',
        },
    ]
    
    for user_data in users_data:
        password = user_data.pop('password')
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults=user_data
        )
        if created:
            user.set_password(password)
            user.save()
            print(f"  ✓ Usuario creado: {user.email}")
        else:
            print(f"  - Usuario ya existe: {user.email}")

def assign_categories_to_existing_products(categories):
    """Asignar categorías a productos existentes que no tienen categoría"""
    print("\nAsignando categorías a productos existentes...")
    
    products_without_category = Product.objects.filter(category__isnull=True, is_active=True)
    updated = 0
    
    for product in products_without_category:
        # Intentar asignar categoría basándose en el nombre del producto
        name_lower = product.name.lower()
        
        if any(word in name_lower for word in ['phone', 'laptop', 'tablet', 'camera', 'monitor', 'teclado', 'auricular', 'smartwatch']):
            product.category = categories.get('electronica')
        elif any(word in name_lower for word in ['camiseta', 'jeans', 'zapatilla', 'vestido', 'chaqueta', 'gorra', 'ropa']):
            product.category = categories.get('ropa')
        elif any(word in name_lower for word in ['sábana', 'lámpara', 'olla', 'aspiradora', 'cafetera', 'almohada', 'hogar']):
            product.category = categories.get('hogar')
        elif any(word in name_lower for word in ['pelota', 'mancuerna', 'bicicleta', 'cinta', 'yoga', 'raqueta', 'deporte']):
            product.category = categories.get('deportes')
        elif any(word in name_lower for word in ['libro', 'novela', 'guía', 'diccionario', 'biografía', 'programación']):
            product.category = categories.get('libros')
        elif any(word in name_lower for word in ['lego', 'muñeca', 'puzzle', 'juguete']):
            product.category = categories.get('juguetes')
        elif any(word in name_lower for word in ['maquillaje', 'perfume', 'crema', 'belleza']):
            product.category = categories.get('belleza')
        elif any(word in name_lower for word in ['café', 'chocolate', 'aceite', 'alimento']):
            product.category = categories.get('alimentos')
        else:
            # Asignar a una categoría por defecto
            product.category = categories.get('hogar')
        
        product.save()
        updated += 1
        print(f"  ✓ Categoría asignada a: {product.name} → {product.category.name}")
    
    if updated > 0:
        print(f"\n✓ {updated} productos actualizados con categorías")
    else:
        print("  - Todos los productos ya tienen categorías asignadas")

def main():
    print("=" * 60)
    print("CREANDO DATOS DE PRUEBA")
    print("=" * 60)
    
    # Crear categorías
    categories = create_categories()
    
    # Crear productos
    create_products(categories)
    
    # Asignar categorías a productos existentes sin categoría
    assign_categories_to_existing_products(categories)
    
    # Crear usuarios de prueba
    create_test_users()
    
    print("\n" + "=" * 60)
    print("✓ DATOS DE PRUEBA CREADOS EXITOSAMENTE")
    print("=" * 60)
    print(f"\nResumen:")
    print(f"  - Categorías: {Category.objects.count()}")
    print(f"  - Productos: {Product.objects.count()}")
    print(f"  - Productos con categoría: {Product.objects.exclude(category__isnull=True).count()}")
    print(f"  - Productos destacados: {Product.objects.filter(is_featured=True).count()}")
    print(f"  - Productos con descuento: {Product.objects.exclude(discount_price__isnull=True).count()}")
    print(f"  - Usuarios: {User.objects.count()}")
    
    # Mostrar productos por categoría
    print(f"\nProductos por categoría:")
    for slug, category in categories.items():
        count = Product.objects.filter(category=category, is_active=True).count()
        print(f"  - {category.name}: {count} productos")
    
    print("\n¡Listo para probar la aplicación!")

if __name__ == '__main__':
    main()

