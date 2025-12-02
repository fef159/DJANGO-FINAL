from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = 'Crea productos de ejemplo para la tienda'

    def handle(self, *args, **options):
        products_data = [
            {
                'name': 'Laptop Gaming Pro',
                'description': 'Laptop de alto rendimiento para gaming con procesador Intel i7, 16GB RAM, SSD 512GB y tarjeta gráfica RTX 3060.',
                'price': 1299.99,
                'stock': 15,
            },
            {
                'name': 'Smartphone Ultra',
                'description': 'Teléfono inteligente con pantalla AMOLED de 6.7 pulgadas, cámara de 108MP, 256GB de almacenamiento y carga rápida.',
                'price': 899.99,
                'stock': 30,
            },
            {
                'name': 'Auriculares Inalámbricos',
                'description': 'Auriculares con cancelación de ruido activa, batería de 30 horas y calidad de sonido Hi-Fi.',
                'price': 199.99,
                'stock': 50,
            },
            {
                'name': 'Smartwatch Fitness',
                'description': 'Reloj inteligente con monitor de frecuencia cardíaca, GPS, resistencia al agua y batería de 7 días.',
                'price': 249.99,
                'stock': 25,
            },
            {
                'name': 'Tablet Pro 12"',
                'description': 'Tablet con pantalla de 12 pulgadas, procesador de última generación, 8GB RAM y 256GB de almacenamiento.',
                'price': 699.99,
                'stock': 20,
            },
            {
                'name': 'Cámara Digital 4K',
                'description': 'Cámara profesional con grabación 4K, zoom óptico 20x, estabilización de imagen y pantalla táctil.',
                'price': 599.99,
                'stock': 12,
            },
            {
                'name': 'Teclado Mecánico RGB',
                'description': 'Teclado mecánico con switches Cherry MX, iluminación RGB personalizable y diseño ergonómico.',
                'price': 149.99,
                'stock': 40,
            },
            {
                'name': 'Mouse Gaming',
                'description': 'Mouse inalámbrico con sensor de alta precisión, 6 botones programables y batería recargable.',
                'price': 79.99,
                'stock': 60,
            },
            {
                'name': 'Monitor 4K 27"',
                'description': 'Monitor 4K UHD de 27 pulgadas con HDR, 144Hz de refresco y tecnología FreeSync.',
                'price': 449.99,
                'stock': 18,
            },
            {
                'name': 'Altavoz Bluetooth',
                'description': 'Altavoz portátil con sonido 360°, resistencia al agua IPX7, batería de 20 horas y asistente de voz.',
                'price': 129.99,
                'stock': 35,
            },
            {
                'name': 'Disco Duro Externo 2TB',
                'description': 'Disco duro externo USB 3.0 de 2TB, compatible con PC y Mac, diseño compacto y resistente.',
                'price': 89.99,
                'stock': 45,
            },
            {
                'name': 'Webcam HD 1080p',
                'description': 'Cámara web Full HD con micrófono estéreo integrado, enfoque automático y compatibilidad universal.',
                'price': 69.99,
                'stock': 55,
            },
        ]

        created_count = 0
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults=product_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Creado: {product.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Ya existe: {product.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\nSe crearon {created_count} productos nuevos')
        )

