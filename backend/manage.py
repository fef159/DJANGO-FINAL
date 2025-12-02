#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Aplicar parche de compatibilidad para Python 3.14 ANTES de importar Django
if sys.version_info >= (3, 14):
    try:
        # Intentar aplicar el parche antes de que Django cargue
        import importlib.util
        import importlib
        
        # Pre-cargar el módulo de compatibilidad si existe
        try:
            from ecommerce import compatibility_patch
        except ImportError:
            pass
    except Exception:
        pass

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
    try:
        from django.core.management import execute_from_command_line
        # Aplicar parche después de que Django esté disponible (por si acaso)
        try:
            from ecommerce import compatibility_patch
        except ImportError:
            pass
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

