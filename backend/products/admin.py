from django.contrib import admin
from django.utils.html import format_html
from .models import Product, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'products_count', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def products_count(self, obj):
        return obj.products.count()
    products_count.short_description = 'Productos'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price_display', 'stock', 'is_featured', 'is_active', 'created_at')
    list_filter = ('category', 'is_featured', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_featured', 'is_active', 'stock')
    readonly_fields = ('created_at', 'updated_at', 'final_price_display', 'discount_percentage_display')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'slug', 'description', 'category')
        }),
        ('Precios', {
            'fields': ('price', 'discount_price', 'final_price_display', 'discount_percentage_display')
        }),
        ('Inventario', {
            'fields': ('stock', 'is_active')
        }),
        ('Marketing', {
            'fields': ('is_featured', 'image_url')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def price_display(self, obj):
        if obj.has_discount:
            return format_html(
                '<span style="text-decoration: line-through; color: #999;">${}</span> '
                '<span style="color: #e74c3c; font-weight: bold;">${}</span> '
                '<span style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">-{}%</span>',
                obj.price,
                obj.final_price,
                obj.discount_percentage
            )
        return f'${obj.price}'
    price_display.short_description = 'Precio'
    
    def final_price_display(self, obj):
        return f'${obj.final_price}'
    final_price_display.short_description = 'Precio Final'
    
    def discount_percentage_display(self, obj):
        if obj.has_discount:
            return f'{obj.discount_percentage}%'
        return 'Sin descuento'
    discount_percentage_display.short_description = 'Descuento'

