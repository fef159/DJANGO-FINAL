"""
Configuración personalizada del Admin de Django
"""
from django.contrib import admin

# Personalizar el sitio admin
admin.site.site_header = "La Bodega del Salchichón - Panel de Administración"
admin.site.site_title = "Admin - La Bodega del Salchichón"
admin.site.index_title = "Bienvenido al Panel de Administración"

