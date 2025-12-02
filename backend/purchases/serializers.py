from rest_framework import serializers
from .models import Purchase, PurchaseItem


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

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Si no hay stripe_payment_intent_id, no lo incluir en la creación
        stripe_id = validated_data.pop('stripe_payment_intent_id', None)
        
        purchase = Purchase.objects.create(
            user=self.context['request'].user,
            stripe_payment_intent_id=stripe_id,
            **validated_data,
            status='completed'
        )
        
        for item_data in items_data:
            PurchaseItem.objects.create(
                purchase=purchase,
                product_name=item_data['product_name'],
                quantity=item_data['quantity'],
                price=item_data['price'],
            )
        
        return purchase

