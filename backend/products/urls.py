from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    ProductsByCategoryView,
    featured_products,
    recommended_products
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/<slug:slug>/products/', ProductsByCategoryView.as_view(), name='products_by_category'),
    path('', ProductListView.as_view(), name='product_list'),
    path('featured/', featured_products, name='featured_products'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product_detail'),
    path('<int:product_id>/recommended/', recommended_products, name='recommended_products'),
]




