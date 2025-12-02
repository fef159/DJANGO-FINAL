from rest_framework import generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class CategoryListView(generics.ListAPIView):
    """Listar todas las categorías"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Permitir acceso público a las categorías


class ProductListView(generics.ListCreateAPIView):
    """Listar y crear productos con búsqueda y filtrado"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Filtro por categoría
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filtro por featured
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filtro por precio
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(final_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(final_price__lte=max_price)
        
        # Filtro por stock disponible
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        return queryset
    
    def perform_create(self, serializer):
        # Los productos creados por usuarios no autenticados como admin se crean como inactivos
        # para revisión (a menos que el usuario sea staff)
        if not self.request.user.is_staff:
            serializer.save(is_active=False)
        else:
            serializer.save()


class ProductDetailView(generics.RetrieveAPIView):
    """Detalle de un producto"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'


class ProductsByCategoryView(generics.ListAPIView):
    """Listar productos por categoría"""
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Permitir acceso público

    def get_queryset(self):
        category_slug = self.kwargs['slug']
        category = get_object_or_404(Category, slug=category_slug)
        return Product.objects.filter(category=category, is_active=True)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def featured_products(request):
    """Obtener productos destacados"""
    products = Product.objects.filter(is_featured=True, is_active=True)[:8]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def recommended_products(request, product_id):
    """Obtener productos recomendados basados en un producto"""
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        # Recomendar productos de la misma categoría o productos destacados
        recommended = Product.objects.filter(
            Q(category=product.category) | Q(is_featured=True),
            is_active=True
        ).exclude(id=product_id)[:6]
        serializer = ProductSerializer(recommended, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=404)


class MyProductsView(generics.ListAPIView):
    """Listar productos del usuario actual (productos por vender)"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Retornar todos los productos del usuario, activos e inactivos
        return Product.objects.filter(seller=self.request.user).order_by('-created_at')


class MyProductDetailView(generics.RetrieveUpdateAPIView):
    """Obtener y actualizar un producto específico del usuario"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo permitir acceso a productos del usuario actual
        return Product.objects.filter(seller=self.request.user)
