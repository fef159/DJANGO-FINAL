from django.contrib import admin
from django.utils.html import format_html
from .models import Purchase, PurchaseItem


class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 0
    readonly_fields = ('subtotal',)
    fields = ('product_name', 'quantity', 'price', 'subtotal')


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount_display', 'payment_method_display', 'status_display', 'items_count', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('user__email', 'user__username', 'stripe_payment_intent_id')
    inlines = [PurchaseItemInline]
    readonly_fields = ('created_at', 'updated_at', 'items_count')
    
    fieldsets = (
        ('Información de Compra', {
            'fields': ('user', 'total_amount', 'status', 'payment_method')
        }),
        ('Pago', {
            'fields': ('stripe_payment_intent_id',)
        }),
        ('Resumen', {
            'fields': ('items_count',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_amount_display(self, obj):
        return format_html('<strong style="color: #27ae60; font-size: 14px;">${}</strong>', obj.total_amount)
    total_amount_display.short_description = 'Total'
    
    def payment_method_display(self, obj):
        icons = {
            'card': '💳',
            'google_pay': '📱',
            'apple_pay': '🍎',
            'paypal': '💼'
        }
        icon = icons.get(obj.payment_method, '💳')
        return f'{icon} {obj.get_payment_method_display()}'
    payment_method_display.short_description = 'Método de Pago'
    
    def status_display(self, obj):
        colors = {
            'completed': '#27ae60',
            'pending': '#f39c12',
            'failed': '#e74c3c'
        }
        icons = {
            'completed': '✅',
            'pending': '⏳',
            'failed': '❌'
        }
        color = colors.get(obj.status, '#999')
        icon = icons.get(obj.status, '❓')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_status_display()
        )
    status_display.short_description = 'Estado'
    
    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = 'Items'


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'purchase', 'product_name', 'quantity', 'price', 'subtotal_display')
    list_filter = ('purchase__created_at',)
    search_fields = ('product_name', 'purchase__user__email', 'purchase__id')
    readonly_fields = ('subtotal',)
    
    def subtotal_display(self, obj):
        return format_html('<strong>${}</strong>', obj.subtotal)
    subtotal_display.short_description = 'Subtotal'

