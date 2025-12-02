from rest_framework import serializers
from .models import Purchase, PurchaseItem
from products.models import Product
from django.db import transaction


class PurchaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
        fields = ('id', 'product_name', 'quantity', 'price', 'subtotal')


class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Purchase
        fields = (
            'id', 'user', 'user_email', 'total_amount', 'stripe_payment_intent_id',
            'payment_method', 'status', 'created_at', 'updated_at', 'items'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class CreatePurchaseSerializer(serializers.Serializer):
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    stripe_payment_intent_id = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=[
        ('card', 'Tarjeta'),
        ('paypal', 'PayPal'),
    ], default='card')
    items = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )

    def validate(self, attrs):
        """Validar stock antes de crear la compra"""
        items_data = attrs.get('items', [])
        
        if not items_data:
            raise serializers.ValidationError({'items': 'La compra debe tener al menos un item'})
        
        # Validar stock para cada item
        errors = {}
        for idx, item_data in enumerate(items_data):
            product_id = item_data.get('product_id')
            product_name = item_data.get('product_name')
            quantity = item_data.get('quantity')
            
            if not quantity or quantity <= 0:
                errors[f'items.{idx}'] = 'quantity debe ser mayor a 0'
                continue
            
            # Buscar el producto por ID (preferido) o por nombre
            product = None
            if product_id:
                try:
                    product = Product.objects.get(id=product_id, is_active=True)
                except Product.DoesNotExist:
                    errors[f'items.{idx}'] = f'Producto con ID {product_id} no encontrado'
                    continue
            elif product_name:
                try:
                    product = Product.objects.get(name=product_name, is_active=True)
                except Product.DoesNotExist:
                    errors[f'items.{idx}'] = f'Producto "{product_name}" no encontrado'
                    continue
                except Product.MultipleObjectsReturned:
                    product = Product.objects.filter(name=product_name, is_active=True).first()
            else:
                errors[f'items.{idx}'] = 'product_id o product_name es requerido'
                continue
            
            # Validar stock disponible
            if product and not product.is_available(quantity):
                errors[f'items.{idx}'] = f'Stock insuficiente para "{product.name}". Disponible: {product.stock}, solicitado: {quantity}'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Si no hay stripe_payment_intent_id, no lo incluir en la creación
        stripe_id = validated_data.pop('stripe_payment_intent_id', None)
        
        # Crear la compra
        purchase = Purchase.objects.create(
            user=self.context['request'].user,
            stripe_payment_intent_id=stripe_id,
            **validated_data,
            status='completed'
        )
        
        # Crear items y actualizar stock
        for item_data in items_data:
            product_id = item_data.get('product_id')
            product_name = item_data.get('product_name')
            quantity = item_data['quantity']
            
            # Buscar el producto por ID (preferido) o por nombre
            if product_id:
                product = Product.objects.get(id=product_id, is_active=True)
            else:
                try:
                    product = Product.objects.get(name=product_name, is_active=True)
                except Product.MultipleObjectsReturned:
                    product = Product.objects.filter(name=product_name, is_active=True).first()
            
            # Validar stock nuevamente (por si acaso cambió entre validación y creación)
            if not product.is_available(quantity):
                raise serializers.ValidationError(
                    f'Stock insuficiente para "{product.name}". Disponible: {product.stock}, solicitado: {quantity}'
                )
            
            # Crear el item de compra
            PurchaseItem.objects.create(
                purchase=purchase,
                product_name=product.name,
                quantity=quantity,
                price=item_data['price'],
            )
            
            # Actualizar stock del producto
            product.stock -= quantity
            if product.stock < 0:
                product.stock = 0
            product.save()
        
        return purchase

