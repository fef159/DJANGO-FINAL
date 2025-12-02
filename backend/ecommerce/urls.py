"""
URL configuration for ecommerce project.
"""
from django.contrib import admin
from django.urls import path, include
from .views import home, api_info

urlpatterns = [
    path('', home, name='home'),
    path('api/', api_info, name='api_info'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/purchases/', include('purchases.urls')),
]

