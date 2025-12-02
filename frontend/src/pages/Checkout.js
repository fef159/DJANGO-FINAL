import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/api/cart/');
      return response.data;
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Datos del formulario de tarjeta
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  const total = cart ? parseFloat(cart.total_amount) : 0;

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    // Validar número de tarjeta (16 dígitos)
    const cardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      errors.cardNumber = 'Ingrese un número de tarjeta válido (16 dígitos)';
    }
    
    // Validar nombre
    if (!cardData.cardName || cardData.cardName.trim().length < 3) {
      errors.cardName = 'Ingrese el nombre del titular de la tarjeta';
    }
    
    // Validar fecha de expiración (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!cardData.expiryDate || !expiryRegex.test(cardData.expiryDate)) {
      errors.expiryDate = 'Ingrese una fecha válida (MM/AA)';
    } else {
      // Validar que no esté expirada
      const [month, year] = cardData.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiry < now) {
        errors.expiryDate = 'La tarjeta está expirada';
      }
    }
    
    // Validar CVV (3 o 4 dígitos)
    if (!cardData.cvv || (cardData.cvv.length !== 3 && cardData.cvv.length !== 4) || !/^\d+$/.test(cardData.cvv)) {
      errors.cvv = 'Ingrese un CVV válido (3 o 4 dígitos)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Formatear fecha de expiración (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Manejar cambios en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      setCardData({ ...cardData, [name]: formatCardNumber(value) });
    } else if (name === 'expiryDate') {
      setCardData({ ...cardData, [name]: formatExpiryDate(value) });
    } else if (name === 'cvv') {
      setCardData({ ...cardData, [name]: value.replace(/\D/g, '').substring(0, 4) });
    } else {
      setCardData({ ...cardData, [name]: value });
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Mutación para crear la compra
  const createPurchaseMutation = useMutation({
    mutationFn: async () => {
      const purchaseData = {
        total_amount: total.toFixed(2),
        payment_method: 'card',
        items: cart.items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.final_price,
        })),
      };

      const response = await api.post('/api/purchases/create/', purchaseData);
      return response.data;
    },
    onSuccess: async (data) => {
      // Limpiar el carrito después de la compra exitosa
      await api.delete('/api/cart/clear/');
      
      // Invalidar y refrescar cache para historial y carrito
      queryClient.invalidateQueries(['purchaseHistory']);
      queryClient.invalidateQueries(['cart']);
      
      // Forzar refetch del historial para asegurar que se actualice
      await queryClient.refetchQueries(['purchaseHistory']);

      // Redirigir a la boleta de la compra recién creada
      const purchaseId = data?.id;
      if (purchaseId) {
        navigate(`/receipt/${purchaseId}`);
      } else {
        navigate('/history', { state: { success: true } });
      }
    },
    onError: (err) => {
      const errorData = err.response?.data;
      let errorMsg = 'Error al procesar la compra';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (errorData.items) {
          // Errores de validación de items
          const itemErrors = Object.entries(errorData.items)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          errorMsg = 'Error en los productos:\n' + itemErrors;
        } else {
          errorMsg = JSON.stringify(errorData);
        }
      } else {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setLoading(false);
    },
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (total <= 0) {
      setError('El total debe ser mayor a 0');
      return;
    }

    // Validar stock antes de procesar el pago
    if (cart && cart.items) {
      const stockErrors = [];
      for (const item of cart.items) {
        if (item.quantity > (item.product.stock || 0)) {
          stockErrors.push(
            `${item.product.name}: cantidad solicitada (${item.quantity}) excede el stock disponible (${item.product.stock || 0})`
          );
        }
      }
      
      if (stockErrors.length > 0) {
        setError('Stock insuficiente:\n' + stockErrors.join('\n'));
        return;
      }
    }

    setLoading(true);
    setError('');
    createPurchaseMutation.mutate();
  };

  if (cartLoading) {
    return (
      <div className="checkout-container">
        <div className="loading">Cargando carrito...</div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="error-message">Tu carrito está vacío</div>
        <button onClick={() => navigate('/cart')} className="btn btn-primary">
          Volver al Carrito
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      <div className="checkout-content">
        <div className="order-summary">
          <h3>Resumen del Pedido</h3>
          {cart.items.map((item) => (
            <div key={item.id} className="order-item">
              <div className="item-info">
                <span className="item-name">{item.product.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
              <span className="item-price">
                ${item.subtotal}
              </span>
            </div>
          ))}
          <div className="order-total">
            <span>Total:</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="payment-section">
          <h3>Información de Pago</h3>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label htmlFor="cardNumber">Número de Tarjeta</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={formErrors.cardNumber ? 'error' : ''}
              />
              {formErrors.cardNumber && (
                <span className="field-error">{formErrors.cardNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cardName">Nombre del Titular</label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={cardData.cardName}
                onChange={handleInputChange}
                placeholder="JUAN PEREZ"
                className={formErrors.cardName ? 'error' : ''}
              />
              {formErrors.cardName && (
                <span className="field-error">{formErrors.cardName}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Fecha de Expiración</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/AA"
                  maxLength="5"
                  className={formErrors.expiryDate ? 'error' : ''}
                />
                {formErrors.expiryDate && (
                  <span className="field-error">{formErrors.expiryDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  className={formErrors.cvv ? 'error' : ''}
                />
                {formErrors.cvv && (
                  <span className="field-error">{formErrors.cvv}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || createPurchaseMutation.isPending}
              className="pay-button"
            >
              {loading || createPurchaseMutation.isPending 
                ? 'Procesando...' 
                : `Pagar $${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
