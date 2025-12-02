import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MyProducts.css';

function MyProducts() {
  const navigate = useNavigate();

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['myProducts'],
    queryFn: async () => {
      const response = await api.get('/api/products/my-products/');
      return response.data.results || response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  if (isLoading) {
    return (
      <div className="my-products-container">
        <div className="loading">Cargando tus productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-products-container">
        <div className="error-message">
          Error al cargar tus productos: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="my-products-container">
      <div className="my-products-header">
        <div>
          <h2>Mis Productos</h2>
          <p className="subtitle">Gestiona los productos que has publicado</p>
        </div>
        <button
          onClick={() => navigate('/sell')}
          className="btn-add-product"
        >
          + Publicar Nuevo Producto
        </button>
      </div>

      {!products || products.length === 0 ? (
        <div className="empty-products">
          <div className="empty-icon">📦</div>
          <h3>No tienes productos publicados</h3>
          <p>Comienza a vender publicando tu primer producto</p>
          <button
            onClick={() => navigate('/sell')}
            className="btn btn-primary"
          >
            Publicar Producto
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="no-image">🛍️</div>
                )}
                <div className={`status-badge status-${product.is_active ? 'active' : 'pending'}`}>
                  {product.is_active ? '✅ Activo' : '⏳ En Revisión'}
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">
                  {product.description.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description}
                </p>
                
                <div className="product-details">
                  <div className="detail-row">
                    <span className="detail-label">Precio:</span>
                    <span className="product-price">
                      {product.has_discount ? (
                        <>
                          <span className="old-price">${parseFloat(product.price).toFixed(2)}</span>
                          <span className="discount-price">${parseFloat(product.final_price).toFixed(2)}</span>
                          <span className="discount-badge">-{product.discount_percentage}%</span>
                        </>
                      ) : (
                        `$${parseFloat(product.price).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Stock:</span>
                    <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? `${product.stock} unidades` : 'Sin stock'}
                    </span>
                  </div>
                  
                  {product.category && (
                    <div className="detail-row">
                      <span className="detail-label">Categoría:</span>
                      <span className="category-name">{product.category.name}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">Publicado:</span>
                    <span className="date">
                      {new Date(product.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="product-actions">
                  <button
                    onClick={() => navigate(`/products/${product.slug}`)}
                    className="btn btn-secondary"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => navigate(`/edit-product/${product.id}`)}
                    className="btn btn-primary"
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProducts;

