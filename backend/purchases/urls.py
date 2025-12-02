from django.urls import path
from .views import PurchaseHistoryView, create_purchase, create_payment_intent

urlpatterns = [
    path('history/', PurchaseHistoryView.as_view(), name='purchase_history'),
    path('create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('create/', create_purchase, name='create_purchase'),
]

