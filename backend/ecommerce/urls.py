"""
URL configuration for ecommerce project.
"""
# Aplicar parche de compatibilidad para Python 3.14 antes de importar admin
from . import compatibility_patch

from django.contrib import admin
from django.urls import path, include
from .views import home, api_info
from . import admin_config  # Importar configuración personalizada del admin

urlpatterns = [
    path('', home, name='home'),
    path('api/', api_info, name='api_info'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/purchases/', include('purchases.urls')),
]

