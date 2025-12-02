import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import './Checkout.css';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  
  const [cart, setCart] = useState(location.state?.cart || []);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    } else if (stripe && !clientSecret) {
      // Crear PaymentIntent cuando se carga el componente y stripe está listo
      createPaymentIntent();
    }
  }, [cart, navigate, stripe, clientSecret]);

  useEffect(() => {
    if (stripe && clientSecret && !paymentRequest) {
      setupPaymentRequest();
    }
  }, [stripe, clientSecret, paymentRequest]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const createPaymentIntent = async () => {
    try {
      const response = await api.post('/api/purchases/create-payment-intent/', {
        total_amount: total.toFixed(2),
      });
      const secret = response.data.clientSecret;
      setClientSecret(secret);
      
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.help) {
        setError(`${errorData.error}: ${errorData.message || ''}. ${errorData.help}`);
      } else {
        setError('Error al crear el intent de pago: ' + (errorData?.error || errorData?.message || err.message));
      }
    }
  };

  const setupPaymentRequest = () => {
    if (!stripe || !clientSecret) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Total',
        amount: Math.round(total * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        
        pr.on('paymentmethod', async (ev) => {
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmError) {
            ev.complete('fail');
            setError(confirmError.message);
          } else {
            ev.complete('success');
            if (paymentIntent && paymentIntent.status === 'succeeded') {
              // Determinar el método de pago basado en el método disponible
              const method = result.applePay ? 'apple_pay' : 'google_pay';
              await handlePaymentSuccess(paymentIntent.id, method);
            }
          }
        });
      }
    });
  };

  const handlePayment = async (paymentMethodType = 'card') => {
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;

      if (paymentMethodType === 'card') {
        result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/history`,
          },
          redirect: 'if_required',
        });
      } else if (paymentMethodType === 'paypal') {
        // PayPal se maneja como un método de pago alternativo
        // En producción, usarías Stripe Connect o una integración directa con PayPal
        setError('PayPal está en desarrollo. Por favor, usa tarjeta de crédito.');
        setLoading(false);
        return;
      }

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Guardar compra en el backend
        await handlePaymentSuccess(result.paymentIntent.id, paymentMethodType);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId, method) => {
    await savePurchase({ id: paymentIntentId }, method);
  };

  const savePurchase = async (paymentIntent, method) => {
    try {
      const purchaseData = {
        total_amount: total.toFixed(2),
        stripe_payment_intent_id: paymentIntent.id,
        payment_method: method || paymentMethod,
        items: cart.map((item) => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price.toFixed(2),
        })),
      };

      await api.post('/api/purchases/create/', purchaseData);
      
      // Invalidar cache para refrescar historial
      queryClient.invalidateQueries(['purchaseHistory']);
      
      // Prefetch del historial para navegación fluida
      queryClient.prefetchQuery({
        queryKey: ['purchaseHistory'],
        queryFn: async () => {
          const response = await api.get('/api/purchases/history/');
          return response.data;
        },
      });

      navigate('/history', { state: { success: true } });
    } catch (err) {
      setError('Error al guardar la compra: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      <div className="checkout-content">
        <div className="order-summary">
          <h3>Resumen del Pedido</h3>
          {cart.map((item) => (
            <div key={item.id} className="order-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
              <span className="item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="order-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="payment-section">
          <h3>Método de Pago</h3>
          
          <div className="payment-methods">
            <button
              className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              Tarjeta
            </button>
            <button
              className={`payment-method-btn ${paymentMethod === 'google_pay' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('google_pay')}
            >
              Google Pay
            </button>
            <button
              className={`payment-method-btn ${paymentMethod === 'apple_pay' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('apple_pay')}
            >
              Apple Pay
            </button>
            <button
              className={`payment-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('paypal')}
            >
              PayPal
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {paymentMethod === 'card' && clientSecret && (
            <div className="card-payment">
              <PaymentElement 
                options={{
                  clientSecret: clientSecret,
                }}
              />
              <button
                onClick={() => handlePayment('card')}
                disabled={!stripe || !elements || loading}
                className="pay-button"
              >
                {loading ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
              </button>
            </div>
          )}

          {paymentMethod === 'card' && !clientSecret && (
            <div className="card-payment">
              <p>Cargando formulario de pago...</p>
            </div>
          )}

          {(paymentMethod === 'google_pay' || paymentMethod === 'apple_pay') && paymentRequest && (
            <div className="wallet-payment">
              <PaymentRequestButtonElement
                options={{
                  paymentRequest: paymentRequest,
                  style: {
                    paymentRequestButton: {
                      theme: 'dark',
                      height: '48px',
                    },
                  },
                }}
              />
            </div>
          )}

          {(paymentMethod === 'google_pay' || paymentMethod === 'apple_pay') && !paymentRequest && (
            <div className="wallet-payment">
              <p>Este método de pago no está disponible en tu dispositivo.</p>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="wallet-payment">
              <button
                onClick={() => handlePayment('paypal')}
                disabled={!stripe || loading}
                className="pay-button"
              >
                {loading ? 'Procesando...' : `Pagar con PayPal $${total.toFixed(2)}`}
              </button>
              <p className="paypal-note">
                Nota: La integración completa de PayPal requiere configuración adicional.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;

