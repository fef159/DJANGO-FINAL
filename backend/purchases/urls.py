from django.urls import path
from .views import (
    PurchaseHistoryView, 
    create_purchase, 
    create_payment_intent,
    get_purchase_detail,
)

urlpatterns = [
    path('history/', PurchaseHistoryView.as_view(), name='purchase_history'),
    path('create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('create/', create_purchase, name='create_purchase'),
    path('<int:purchase_id>/', get_purchase_detail, name='purchase_detail'),
]

