from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product
from decimal import Decimal

User = get_user_model()


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Carrito de {self.user.email}"

    @property
    def total_items(self):
        """Retorna el total de items en el carrito"""
        from django.db.models import Sum
        return self.items.aggregate(total=Sum('quantity'))['total'] or 0

    @property
    def total_amount(self):
        """Calcula el total del carrito"""
        total = Decimal('0.00')
        for item in self.items.all():
            total += item.subtotal
        return total

    @classmethod
    def get_or_create_cart(cls, user):
        """Obtiene o crea un carrito para el usuario"""
        cart, created = cls.objects.get_or_create(user=user)
        return cart


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['cart', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def subtotal(self):
        """Calcula el subtotal del item"""
        return Decimal(self.quantity) * self.product.final_price

    def clean(self):
        """Valida que haya stock disponible"""
        from django.core.exceptions import ValidationError
        if not self.product.is_available(self.quantity):
            raise ValidationError(f'Stock insuficiente. Disponible: {self.product.stock}')

    def save(self, *args, **kwargs):
        """Valida stock antes de guardar"""
        if not self.product.is_available(self.quantity):
            raise ValueError(f'Stock insuficiente. Disponible: {self.product.stock}')
        super().save(*args, **kwargs)
