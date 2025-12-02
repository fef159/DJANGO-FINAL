from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    payment_method = models.CharField(max_length=50, choices=[
        ('card', 'Tarjeta'),
        ('google_pay', 'Google Pay'),
        ('apple_pay', 'Apple Pay'),
        ('paypal', 'PayPal'),
    ])
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pendiente'),
        ('completed', 'Completada'),
        ('failed', 'Fallida'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Compra #{self.id} - {self.user.email} - ${self.total_amount}"


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.subtotal = Decimal(self.quantity) * Decimal(self.price)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} x{self.quantity} - ${self.subtotal}"

