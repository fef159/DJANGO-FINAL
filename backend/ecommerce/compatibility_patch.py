"""
Parche de compatibilidad para Python 3.14 y Django 4.2.7
Soluciona el error: 'super' object has no attribute 'dicts'
Este parche se aplica automáticamente cuando se importa este módulo.
"""
import sys
import copy
import types

def apply_patch():
    """Aplicar el parche de compatibilidad"""
    # Aplicar el parche solo si estamos en Python 3.14+
    if sys.version_info >= (3, 14):
        try:
            import django.template.context as context_module
            
            # Guardar el método original si existe
            original_context_copy = getattr(context_module.Context, '__copy__', None)
            
            def patched_context_copy(self):
                """Versión parcheada de __copy__ para Context - compatibilidad con Python 3.14"""
                # Crear nuevo contexto usando el constructor normal
                # pero evitando el uso de super() que causa problemas en Python 3.14
                import copy as copy_module
                
                # Obtener los dicts del contexto original
                dicts_to_copy = []
                try:
                    if hasattr(self, 'dicts') and self.dicts:
                        if isinstance(self.dicts, (list, tuple)):
                            dicts_to_copy = [copy_module.copy(d) if isinstance(d, dict) else dict(d) for d in self.dicts]
                        elif isinstance(self.dicts, dict):
                            dicts_to_copy = [copy_module.copy(self.dicts)]
                        else:
                            dicts_to_copy = [dict(self.dicts)]
                    else:
                        dicts_to_copy = [{}]
                except (AttributeError, TypeError, ValueError):
                    dicts_to_copy = [{}]
                
                # Crear nuevo contexto con el primer dict (si existe) o vacío
                if dicts_to_copy and dicts_to_copy[0]:
                    context = context_module.Context(dicts_to_copy[0])
                else:
                    context = context_module.Context()
                
                # Si hay múltiples dicts, agregarlos
                if len(dicts_to_copy) > 1:
                    for d in dicts_to_copy[1:]:
                        context.update(d)
                
                # Copiar otros atributos importantes
                for attr in ['autoescape', 'use_l10n', 'use_tz', 'current_app']:
                    try:
                        if hasattr(self, attr):
                            value = getattr(self, attr)
                            setattr(context, attr, value)
                    except (AttributeError, TypeError):
                        pass
                
                return context
            
            # Aplicar el parche al Context de forma forzada
            try:
                # Forzar la reasignación del método, incluso si ya existe
                context_module.Context.__copy__ = patched_context_copy
                # Marcar como parcheado
                try:
                    context_module.Context.__copy__._patched = True
                except (AttributeError, TypeError):
                    # Si no se puede asignar el atributo, no importa
                    pass
            except Exception as e:
                # Si falla, intentar métodos alternativos
                try:
                    # Intentar usar setattr
                    setattr(context_module.Context, '__copy__', patched_context_copy)
                except:
                    # Si todo falla, registrar el error
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"No se pudo aplicar parche a Context.__copy__: {e}")
            
            # Parchear RequestContext si existe
            try:
                if hasattr(context_module, 'RequestContext'):
                    RequestContext = context_module.RequestContext
                    original_request_copy = getattr(RequestContext, '__copy__', None)
                    
                    def patched_request_copy(self):
                        """Versión parcheada de __copy__ para RequestContext"""
                        import copy as copy_module
                        
                        # Obtener el request
                        request = getattr(self, 'request', None)
                        
                        # Obtener los dicts del contexto original
                        dicts_to_copy = []
                        try:
                            if hasattr(self, 'dicts') and self.dicts:
                                if isinstance(self.dicts, (list, tuple)):
                                    dicts_to_copy = [copy_module.copy(d) if isinstance(d, dict) else dict(d) for d in self.dicts]
                                elif isinstance(self.dicts, dict):
                                    dicts_to_copy = [copy_module.copy(self.dicts)]
                                else:
                                    dicts_to_copy = [dict(self.dicts)]
                            else:
                                dicts_to_copy = [{}]
                        except (AttributeError, TypeError, ValueError):
                            dicts_to_copy = [{}]
                        
                        # Crear nuevo RequestContext usando el constructor normal
                        # para que se inicialicen todos los atributos internos
                        if dicts_to_copy and dicts_to_copy[0]:
                            context = RequestContext(request, dicts_to_copy[0])
                        else:
                            context = RequestContext(request)
                        
                        # Si hay múltiples dicts, agregarlos
                        if len(dicts_to_copy) > 1:
                            for d in dicts_to_copy[1:]:
                                context.update(d)
                        
                        # Copiar TODOS los atributos del RequestContext original
                        # Esto incluye atributos internos como _processors_index, processors, etc.
                        try:
                            # Intentar copiar todos los atributos usando __dict__
                            if hasattr(self, '__dict__'):
                                for attr_name, attr_value in self.__dict__.items():
                                    # Saltar atributos que ya fueron copiados o que no se pueden copiar
                                    if attr_name in ['dicts', 'request']:
                                        continue
                                    try:
                                        # Copiar el valor de forma segura
                                        if attr_name.startswith('_') or attr_name in ['processors', 'autoescape', 'use_l10n', 'use_tz', 'current_app']:
                                            setattr(context, attr_name, attr_value)
                                    except (AttributeError, TypeError):
                                        pass
                        except (AttributeError, TypeError):
                            # Si no podemos usar __dict__, copiar atributos conocidos manualmente
                            attrs_to_copy = [
                                'autoescape', 'use_l10n', 'use_tz', 'current_app',
                                '_processors_index', 'processors'
                            ]
                            for attr in attrs_to_copy:
                                try:
                                    if hasattr(self, attr):
                                        value = getattr(self, attr)
                                        setattr(context, attr, value)
                                except (AttributeError, TypeError):
                                    pass
                        
                        # Asegurar que _processors_index existe y tiene un valor válido
                        if not hasattr(context, '_processors_index'):
                            try:
                                # Inicializar _processors_index basado en processors
                                processors = getattr(context, 'processors', None)
                                if processors and hasattr(processors, '__len__'):
                                    context._processors_index = len(processors)
                                else:
                                    context._processors_index = 0
                            except (AttributeError, TypeError):
                                try:
                                    context._processors_index = 0
                                except:
                                    pass
                        elif getattr(context, '_processors_index', None) is None:
                            try:
                                processors = getattr(context, 'processors', None)
                                if processors and hasattr(processors, '__len__'):
                                    context._processors_index = len(processors)
                                else:
                                    context._processors_index = 0
                            except (AttributeError, TypeError):
                                context._processors_index = 0
                        
                        return context
                    
                    # Forzar la reasignación del método
                    RequestContext.__copy__ = patched_request_copy
                    try:
                        RequestContext.__copy__._patched = True
                    except (AttributeError, TypeError):
                        pass
            except Exception:
                pass
                
        except ImportError:
            # Django no está disponible aún
            pass
        except Exception as e:
            # Ignorar otros errores pero registrar para debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error aplicando parche de compatibilidad: {e}")

# Aplicar el parche cuando se importa el módulo
apply_patch()

