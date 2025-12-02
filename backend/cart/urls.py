from django.urls import path
from .views import (
    CartDetailView,
    add_to_cart,
    update_cart_item,
    remove_from_cart,
    clear_cart
)

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart_detail'),
    path('add/', add_to_cart, name='add_to_cart'),
    path('items/<int:item_id>/', update_cart_item, name='update_cart_item'),
    path('items/<int:item_id>/remove/', remove_from_cart, name='remove_from_cart'),
    path('clear/', clear_cart, name='clear_cart'),
]




