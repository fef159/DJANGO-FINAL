from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
import stripe
from .models import Purchase
from .serializers import PurchaseSerializer, CreatePurchaseSerializer

# Configurar Stripe API key
def get_stripe_api_key():
    """Obtener y validar la clave de Stripe"""
    api_key = settings.STRIPE_SECRET_KEY
    if not api_key or api_key == '' or 'placeholder' in str(api_key).lower():
        print(f"❌ ERROR: STRIPE_SECRET_KEY no válida. Valor: '{api_key}'")
        return None
    print(f"✅ Stripe API key válida: {api_key[:20]}...")
    return api_key

# Configurar stripe.api_key al cargar el módulo
stripe.api_key = get_stripe_api_key()
if not stripe.api_key:
    print("⚠️ ADVERTENCIA: stripe.api_key es None al cargar el módulo")


class PurchaseHistoryView(generics.ListAPIView):
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Crear PaymentIntent de Stripe"""
    # DEBUG: Imprimir información de la petición
    print("=" * 80)
    print("🔍 DEBUG create_payment_intent")
    print(f"Usuario: {request.user}")
    print(f"Datos recibidos: {request.data}")
    print(f"Headers: {dict(request.headers)}")
    print("=" * 80)
    
    # Verificar y configurar Stripe
    api_key = get_stripe_api_key()
    if not api_key:
        print("❌ ERROR en create_payment_intent: api_key es None")
        return Response(
            {
                'error': 'Stripe no está configurado. Por favor, configura STRIPE_SECRET_KEY en el archivo .env',
                'help': 'Obtén tus claves de prueba en: https://dashboard.stripe.com/test/apikeys'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Asegurar que stripe.api_key esté configurado ANTES de usar Stripe
    stripe.api_key = api_key
    print(f"✅ stripe.api_key configurado en create_payment_intent: {stripe.api_key[:20] if stripe.api_key else 'None'}...")
    
    try:
        # Obtener y validar el monto total
        total_amount_str = request.data.get('total_amount', '0')
        try:
            total_amount = float(total_amount_str)
        except (ValueError, TypeError) as e:
            return Response(
                {
                    'error': 'Monto inválido',
                    'message': f'El monto debe ser un número válido. Recibido: {total_amount_str}',
                    'details': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if total_amount <= 0:
            return Response(
                {
                    'error': 'El monto debe ser mayor a 0',
                    'message': f'Monto recibido: {total_amount}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar una vez más que stripe.api_key esté configurado
        if not stripe.api_key:
            print("❌ ERROR CRÍTICO: stripe.api_key es None justo antes de crear PaymentIntent")
            stripe.api_key = api_key
            print(f"✅ Reconfigurando stripe.api_key: {stripe.api_key[:20] if stripe.api_key else 'None'}...")
        
        # Crear PaymentIntent en Stripe (monto en centavos)
        amount_in_cents = int(total_amount * 100)
        
        # Verificación final antes de crear PaymentIntent
        if not stripe.api_key or stripe.api_key == '':
            raise ValueError(f"stripe.api_key no está configurado. Valor actual: {stripe.api_key}")
        
        print(f"🔍 Intentando crear PaymentIntent con amount={amount_in_cents}, stripe.api_key={'configurado' if stripe.api_key else 'None'}")
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency='usd',
                metadata={
                    'user_id': str(request.user.id),
                    'user_email': request.user.email,
                },
            )
            print(f"✅ PaymentIntent creado exitosamente: {intent.id}")
        except AttributeError as e:
            if "'NoneType' object has no attribute 'Secret'" in str(e):
                print(f"❌ ERROR: stripe.api_key es None. Reconfigurando...")
                stripe.api_key = api_key
                print(f"✅ Reconfigurado. Intentando nuevamente...")
                intent = stripe.PaymentIntent.create(
                    amount=amount_in_cents,
                    currency='usd',
                    metadata={
                        'user_id': str(request.user.id),
                        'user_email': request.user.email,
                    },
                )
            else:
                raise

        return Response({
            'clientSecret': intent.client_secret,
            'paymentIntentId': intent.id,
        })
    except stripe.error.AuthenticationError as e:
        return Response(
            {
                'error': 'Clave de API de Stripe inválida',
                'message': 'Por favor, verifica que STRIPE_SECRET_KEY sea correcta en el archivo .env',
                'help': 'Obtén tus claves de prueba en: https://dashboard.stripe.com/test/apikeys',
                'details': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except stripe.error.StripeError as e:
        return Response(
            {
                'error': 'Error de Stripe',
                'message': str(e),
                'type': type(e).__name__
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    except ValueError as e:
        return Response(
            {
                'error': 'Error de validación',
                'message': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error al crear payment intent: {error_trace}")
        return Response(
            {
                'error': 'Error al crear el intent de pago',
                'message': str(e),
                'type': type(e).__name__
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_purchase_detail(request, purchase_id):
    """Obtener detalles de una compra específica"""
    try:
        purchase = Purchase.objects.get(id=purchase_id, user=request.user)
        serializer = PurchaseSerializer(purchase)
        return Response(serializer.data)
    except Purchase.DoesNotExist:
        return Response(
            {'error': 'Compra no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )



