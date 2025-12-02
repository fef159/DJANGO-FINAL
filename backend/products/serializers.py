from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'products_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_products_count(self, obj):
        """Obtener el conteo de productos activos en la categoría"""
        return obj.products.filter(is_active=True).count()


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'discount_price',
            'final_price', 'has_discount', 'discount_percentage',
            'image_url', 'stock', 'category', 'category_id',
            'seller', 'seller_email', 'is_featured', 'is_active', 'is_available',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active', 'seller']
    
    def validate_category_id(self, value):
        """Validar que la categoría existe si se proporciona"""
        if value is not None:
            try:
                Category.objects.get(id=value)
            except Category.DoesNotExist:
                raise serializers.ValidationError(f'La categoría con ID {value} no existe.')
        return value

    def validate(self, attrs):
        """Validar que el precio con descuento sea menor que el precio normal"""
        discount_price = attrs.get('discount_price')
        price = attrs.get('price')
        
        if discount_price is not None and price is not None:
            if discount_price >= price:
                raise serializers.ValidationError({
                    'discount_price': 'El precio con descuento debe ser menor que el precio normal.'
                })
        
        return attrs

    def create(self, validated_data):
        # Remover category_id de validated_data y manejarlo por separado
        category_id = validated_data.pop('category_id', None)
        
        # Generar slug automáticamente si no se proporciona
        if not validated_data.get('slug'):
            from django.utils.text import slugify
            validated_data['slug'] = slugify(validated_data['name'])
        
        # Asignar el usuario actual como vendedor
        validated_data['seller'] = self.context['request'].user
        
        # Asignar categoría si se proporcionó
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
                validated_data['category'] = category
            except Category.DoesNotExist:
                pass  # Si la categoría no existe, se deja como None
        
        # Crear el producto
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Remover category_id de validated_data y manejarlo por separado
        category_id = validated_data.pop('category_id', None)
        
        # Actualizar slug si el nombre cambió
        if 'name' in validated_data:
            new_name = validated_data['name']
            if new_name != instance.name:
                from django.utils.text import slugify
                validated_data['slug'] = slugify(new_name)
        
        # Asignar categoría si se proporcionó
        if category_id is not None:
            try:
                category = Category.objects.get(id=category_id)
                validated_data['category'] = category
            except Category.DoesNotExist:
                pass  # Si la categoría no existe, se deja como None
        
        # Actualizar el producto
        return super().update(instance, validated_data)
