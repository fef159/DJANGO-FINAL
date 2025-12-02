from django.contrib import admin
from django.utils.html import format_html
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('subtotal', 'created_at', 'updated_at')
    fields = ('product', 'quantity', 'subtotal', 'created_at')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items_display', 'total_amount_display', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at', 'total_items_display', 'total_amount_display')
    inlines = [CartItemInline]
    
    fieldsets = (
        ('Usuario', {
            'fields': ('user',)
        }),
        ('Resumen', {
            'fields': ('total_items_display', 'total_amount_display')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_items_display(self, obj):
        return obj.total_items
    total_items_display.short_description = 'Total Items'
    
    def total_amount_display(self, obj):
        return format_html('<strong style="color: #27ae60;">${}</strong>', obj.total_amount)
    total_amount_display.short_description = 'Total'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'product', 'quantity', 'subtotal_display', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('cart__user__email', 'product__name')
    readonly_fields = ('subtotal', 'created_at', 'updated_at')
    
    def subtotal_display(self, obj):
        return format_html('<strong>${}</strong>', obj.subtotal)
    subtotal_display.short_description = 'Subtotal'
