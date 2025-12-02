import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import './Receipt.css';

function Receipt() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Invalidar el historial cuando se carga la boleta para asegurar que esté actualizado
  React.useEffect(() => {
    queryClient.invalidateQueries(['purchaseHistory']);
  }, [purchaseId, queryClient]);

  const { data: purchase, isLoading, error } = useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: async () => {
      const response = await api.get(`/api/purchases/${purchaseId}/`);
      return response.data;
    },
    enabled: !!purchaseId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="receipt-container">
        <div className="loading">Cargando boleta...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receipt-container">
        <div className="error-message">
          Error al cargar la boleta: {error.message}
        </div>
        <button onClick={() => navigate('/history')} className="btn btn-primary">
          Volver al Historial
        </button>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="receipt-container">
        <div className="error-message">Boleta no encontrada</div>
        <button onClick={() => navigate('/history')} className="btn btn-primary">
          Volver al Historial
        </button>
      </div>
    );
  }

  const purchaseDate = new Date(purchase.created_at);
  const formattedDate = purchaseDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="receipt-container">
      <div className="receipt-actions">
        <button onClick={() => navigate('/history')} className="btn btn-secondary">
          ← Volver al Historial
        </button>
        <button onClick={handlePrint} className="btn btn-primary">
          🖨️ Imprimir
        </button>
      </div>

      <div className="receipt">
        <div className="receipt-header">
          <div className="receipt-logo">
            <h1>🌭🐕 La Bodega del Salchichón</h1>
          </div>
          <div className="receipt-title">
            <h2>BOLETA DE COMPRA</h2>
            <p className="receipt-number">N° {purchase.id}</p>
          </div>
        </div>

        <div className="receipt-info">
          <div className="info-section">
            <h3>Información de la Compra</h3>
            <div className="info-row">
              <span className="info-label">Fecha:</span>
              <span className="info-value">{formattedDate}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cliente:</span>
              <span className="info-value">{purchase.user_email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Método de Pago:</span>
              <span className="info-value">
                {purchase.payment_method === 'card' && '💳 Tarjeta de Crédito/Débito'}
                {purchase.payment_method === 'paypal' && '💼 PayPal'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Estado:</span>
              <span className={`status-badge status-${purchase.status}`}>
                {purchase.status === 'completed' && '✅ Completada'}
                {purchase.status === 'pending' && '⏳ Pendiente'}
                {purchase.status === 'failed' && '❌ Fallida'}
              </span>
            </div>
          </div>
        </div>

        <div className="receipt-items">
          <h3>Productos</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items && purchase.items.map((item, index) => (
                <tr key={index}>
                  <td className="item-name">{item.product_name}</td>
                  <td className="item-quantity">{item.quantity}</td>
                  <td className="item-price">${parseFloat(item.price).toFixed(2)}</td>
                  <td className="item-subtotal">${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-total">
          <div className="total-row">
            <span className="total-label">TOTAL:</span>
            <span className="total-amount">${parseFloat(purchase.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="receipt-footer">
          <p>¡Gracias por tu compra!</p>
          <p className="footer-note">
            Esta es una boleta digital. Puedes imprimirla o guardarla como referencia.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Receipt;

