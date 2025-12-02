from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.URLField(blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products_sold', null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['seller', 'is_active']),
        ]

    def __str__(self):
        return self.name

    @property
    def final_price(self):
        """Retorna el precio final (con descuento si existe)"""
        return self.discount_price if self.discount_price else self.price

    @property
    def has_discount(self):
        """Verifica si el producto tiene descuento"""
        return self.discount_price is not None and self.discount_price < self.price

    @property
    def discount_percentage(self):
        """Calcula el porcentaje de descuento"""
        if self.has_discount:
            return int(((self.price - self.discount_price) / self.price) * 100)
        return 0

    def is_available(self, quantity=1):
        """Verifica si hay stock disponible"""
        return self.stock >= quantity and self.is_active

