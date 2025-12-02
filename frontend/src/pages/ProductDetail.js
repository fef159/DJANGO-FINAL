import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import './ProductDetail.css';

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/api/products/${slug}/`);
      return response.data;
    },
  });

  const { data: recommendedProducts } = useQuery({
    queryKey: ['recommended', product?.id],
    queryFn: async () => {
      const response = await api.get(`/api/products/${product.id}/recommended/`);
      return response.data;
    },
    enabled: !!product?.id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (quantity = 1) => {
      const response = await api.post('/api/cart/add/', {
        product_id: product.id,
        quantity,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      alert('Producto agregado al carrito');
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Error al agregar al carrito');
    },
  });

  const handleAddToCart = (quantity = 1) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCartMutation.mutate(quantity);
  };

  if (isLoading) {
    return (
      <div className="product-detail-container">
        <div className="loading">Cargando producto...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-message">
          {error?.message || 'Producto no encontrado'}
        </div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Volver
      </button>

      <div className="product-detail-content">
        <div className="product-detail-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="image-placeholder-large">
              <span>📦</span>
            </div>
          )}
          {product.has_discount && (
            <div className="discount-badge-large">
              -{product.discount_percentage}% OFF
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          {product.category && (
            <div className="product-category">
              <span>Categoría: </span>
              <button
                onClick={() => navigate(`/categories/${product.category.slug}`)}
                className="category-link"
              >
                {product.category.name}
              </button>
            </div>
          )}

          <div className="product-price-detail">
            {product.has_discount && (
              <span className="price-original-large">${product.price}</span>
            )}
            <span className="price-final-large">${product.final_price}</span>
            {product.has_discount && (
              <span className="savings">
                Ahorras ${(product.price - product.final_price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="product-stock-detail">
            {product.is_available ? (
              <span className="stock-available-large">
                ✓ En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="stock-unavailable-large">✗ Sin stock</span>
            )}
          </div>

          <div className="product-description-detail">
            <h3>Descripción</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-actions">
            <button
              onClick={() => handleAddToCart(1)}
              disabled={!product.is_available || addToCartMutation.isPending}
              className="btn-add-to-cart btn btn-primary"
            >
              {addToCartMutation.isPending
                ? 'Agregando...'
                : product.is_available
                ? 'Agregar al Carrito'
                : 'Sin Stock'}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="btn-view-cart btn btn-secondary"
            >
              Ver Carrito
            </button>
          </div>
        </div>
      </div>

      {recommendedProducts && recommendedProducts.length > 0 && (
        <div className="recommended-section">
          <h2>Productos Recomendados</h2>
          <div className="recommended-grid">
            {recommendedProducts.map((recProduct) => (
              <div
                key={recProduct.id}
                className="recommended-card"
                onClick={() => navigate(`/products/${recProduct.slug}`)}
              >
                {recProduct.image_url ? (
                  <div className="recommended-image">
                    <img src={recProduct.image_url} alt={recProduct.name} />
                  </div>
                ) : (
                  <div className="recommended-image-placeholder">📦</div>
                )}
                <div className="recommended-info">
                  <h4>{recProduct.name}</h4>
                  <div className="recommended-price">
                    {recProduct.has_discount && (
                      <span className="price-original">${recProduct.price}</span>
                    )}
                    <span className="price-final">${recProduct.final_price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;




