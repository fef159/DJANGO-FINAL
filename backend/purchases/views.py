from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import stripe
from .models import Purchase
from .serializers import PurchaseSerializer, CreatePurchaseSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


class PurchaseHistoryView(generics.ListAPIView):
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Crear PaymentIntent de Stripe"""
    # Verificar si Stripe está configurado
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == '' or 'placeholder' in settings.STRIPE_SECRET_KEY.lower():
        return Response(
            {
                'error': 'Stripe no está configurado. Por favor, configura STRIPE_SECRET_KEY en el archivo .env',
                'help': 'Obtén tus claves de prueba en: https://dashboard.stripe.com/test/apikeys'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    try:
        total_amount = float(request.data.get('total_amount', 0))
        if total_amount <= 0:
            return Response(
                {'error': 'El monto debe ser mayor a 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear PaymentIntent en Stripe (monto en centavos)
        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),
            currency='usd',
            metadata={
                'user_id': request.user.id,
                'user_email': request.user.email,
            },
        )

        return Response({
            'clientSecret': intent.client_secret,
            'paymentIntentId': intent.id,
        })
    except stripe.error.AuthenticationError as e:
        return Response(
            {
                'error': 'Clave de API de Stripe inválida',
                'message': 'Por favor, verifica que STRIPE_SECRET_KEY sea correcta en el archivo .env',
                'help': 'Obtén tus claves de prueba en: https://dashboard.stripe.com/test/apikeys'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except stripe.error.StripeError as e:
        return Response(
            {
                'error': 'Error de Stripe',
                'message': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {
                'error': 'Error al crear el intent de pago',
                'message': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_purchase(request):
    serializer = CreatePurchaseSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        purchase = serializer.save()
        return Response(
            PurchaseSerializer(purchase).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

