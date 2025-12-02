from django.shortcuts import render
from django.http import JsonResponse
from products.models import Product


def home(request):
    """Página principal tipo Amazon con productos"""
    products = Product.objects.all()[:12]  # Mostrar primeros 12 productos
    return render(request, 'ecommerce/home.html', {
        'products': products,
        'frontend_url': 'http://localhost:3000'
    })


def api_info(request):
    """Vista simple que muestra información de la API"""
    return JsonResponse({
        'message': 'API E-commerce Django',
        'endpoints': {
            'admin': '/admin/',
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'refresh': '/api/auth/token/refresh/',
                'me': '/api/auth/me/',
            },
            'purchases': {
                'history': '/api/purchases/history/',
                'create': '/api/purchases/create/',
                'create_payment_intent': '/api/purchases/create-payment-intent/',
            }
        },
        'frontend': 'http://localhost:3000',
        'note': 'Accede al frontend en http://localhost:3000 para usar la aplicación'
    })
