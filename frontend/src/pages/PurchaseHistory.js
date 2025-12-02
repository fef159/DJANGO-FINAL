import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './PurchaseHistory.css';

function PurchaseHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const success = location.state?.success;

  const { data: purchases, isLoading, error, refetch } = useQuery({
    queryKey: ['purchaseHistory'],
    queryFn: async () => {
      const response = await api.get('/api/purchases/history/');
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.results) {
        return response.data.results;
      } else {
        return [];
      }
    },
    staleTime: 0, // Siempre considerar los datos como obsoletos para refrescar
    refetchOnWindowFocus: true, // Refrescar cuando la ventana recupera el foco
    refetchOnMount: true, // Refrescar al montar el componente
  });

  // Refrescar cuando se recibe el estado de éxito
  React.useEffect(() => {
    if (success) {
      refetch();
    }
  }, [success, refetch]);

  if (isLoading) {
    return (
      <div className="history-container">
        <div className="loading">Cargando historial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error-message">
          Error al cargar el historial: {error.message}
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries(['purchaseHistory']);
    refetch();
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Historial de Compras</h2>
        <button onClick={handleRefresh} className="btn-refresh" disabled={isLoading}>
          {isLoading ? '🔄' : '🔄'} Actualizar
        </button>
      </div>
      
      {success && (
        <div className="success-message">
          ¡Compra realizada exitosamente!
        </div>
      )}

      {!purchases || purchases.length === 0 ? (
        <div className="empty-history">
          <p>No tienes compras realizadas aún.</p>
        </div>
      ) : (
        <div className="purchases-list">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="purchase-card">
              <div className="purchase-header">
                <div>
                  <h3>Compra #{purchase.id}</h3>
                  <p className="purchase-date">
                    {new Date(purchase.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="purchase-total">
                  ${parseFloat(purchase.total_amount).toFixed(2)}
                </div>
              </div>
              
              <div className="purchase-details">
                <div className="detail-item">
                  <span className="detail-label">Método de pago:</span>
                  <span className="detail-value">
                    {purchase.payment_method === 'card' && '💳 Tarjeta'}
                    {purchase.payment_method === 'google_pay' && '📱 Google Pay'}
                    {purchase.payment_method === 'apple_pay' && '🍎 Apple Pay'}
                    {purchase.payment_method === 'paypal' && '💼 PayPal'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <span className={`status-badge status-${purchase.status}`}>
                    {purchase.status === 'completed' && '✅ Completada'}
                    {purchase.status === 'pending' && '⏳ Pendiente'}
                    {purchase.status === 'failed' && '❌ Fallida'}
                  </span>
                </div>
                {purchase.stripe_payment_intent_id && (
                  <div className="detail-item">
                    <span className="detail-label">ID de pago:</span>
                    <span className="detail-value small">
                      {purchase.stripe_payment_intent_id}
                    </span>
                  </div>
                )}
              </div>

              {purchase.items && purchase.items.length > 0 && (
                <div className="purchase-items">
                  <h4>Productos:</h4>
                  <ul>
                    {purchase.items.map((item, index) => (
                      <li key={index} className="purchase-item">
                        <span className="item-name">{item.product_name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-subtotal">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="purchase-actions">
                <button
                  onClick={() => navigate(`/receipt/${purchase.id}`)}
                  className="btn-view-receipt"
                >
                  📄 Ver Boleta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PurchaseHistory;

