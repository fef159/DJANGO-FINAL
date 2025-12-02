import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Cart.css';

function Cart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query para obtener el carrito
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/api/cart/');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Mutación para actualizar cantidad (con optimistic update)
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const response = await api.put(`/api/cart/items/${itemId}/`, { quantity });
      return response.data;
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error || 'Error al actualizar la cantidad';
      alert(errorMsg);
    },
    onMutate: async ({ itemId, quantity }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot del valor anterior
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistic update
      queryClient.setQueryData(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback en caso de error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      // Invalidar para refrescar datos del servidor
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutación para eliminar item (con optimistic update)
  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      await api.delete(`/api/cart/items/${itemId}/remove/`);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.id !== itemId),
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutación para vaciar carrito
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/api/cart/clear/');
    },
    onSuccess: () => {
      queryClient.setQueryData(['cart'], (old) => ({
        ...old,
        items: [],
        total_items: 0,
        total_amount: '0.00',
      }));
    },
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemMutation.mutate(itemId);
    } else {
      updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <p>Por favor, inicia sesión para ver tu carrito</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="cart-container">
        <div className="loading">Cargando carrito...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error-message">
          Error al cargar el carrito: {error.message}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <h2>Mi Carrito</h2>
        <div className="cart-empty">
          <p>Tu carrito está vacío</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Ir a Comprar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Mi Carrito</h2>
        <button
          onClick={() => clearCartMutation.mutate()}
          className="btn-clear-cart"
          disabled={clearCartMutation.isPending}
        >
          {clearCartMutation.isPending ? 'Limpiando...' : 'Vaciar Carrito'}
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} />
                ) : (
                  <div className="image-placeholder">📦</div>
                )}
              </div>
              <div className="cart-item-info">
                <h3
                  onClick={() => navigate(`/products/${item.product.slug}`)}
                  className="cart-item-name"
                >
                  {item.product.name}
                </h3>
                <p className="cart-item-description">{item.product.description}</p>
                <div className="cart-item-price">
                  {item.product.has_discount && (
                    <span className="price-original">${item.product.price}</span>
                  )}
                  <span className="price-final">
                    ${item.product.final_price}
                  </span>
                  {item.product.has_discount && (
                    <span className="discount-badge">
                      -{item.product.discount_percentage}%
                    </span>
                  )}
                </div>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={updateQuantityMutation.isPending || removeItemMutation.isPending}
                    className="quantity-btn"
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={
                      updateQuantityMutation.isPending ||
                      !item.product.is_available ||
                      item.quantity >= (item.product.stock || 0)
                    }
                    className="quantity-btn"
                    title={
                      item.quantity >= (item.product.stock || 0)
                        ? 'Stock insuficiente'
                        : 'Aumentar cantidad'
                    }
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-stock">
                  {item.product.stock !== undefined && (
                    <span className={`stock-info ${item.product.stock === 0 ? 'out-of-stock' : item.product.stock <= 5 ? 'low-stock' : ''}`}>
                      Stock: {item.product.stock}
                    </span>
                  )}
                </div>
                <div className="cart-item-subtotal">
                  ${item.subtotal}
                </div>
                {item.quantity > (item.product.stock || 0) && (
                  <div className="stock-warning">
                    ⚠️ Cantidad excede el stock disponible
                  </div>
                )}
                <button
                  onClick={() => removeItemMutation.mutate(item.id)}
                  disabled={removeItemMutation.isPending}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Resumen del Pedido</h3>
          <div className="summary-row">
            <span>Total de items:</span>
            <span>{cart.total_items}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span className="total-amount">${cart.total_amount}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="btn-checkout btn btn-secondary"
          >
            Proceder al Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;




