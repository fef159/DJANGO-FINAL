import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Offers.css';

function Offers() {
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'offers'],
    queryFn: async () => {
      const response = await api.get('/api/products/');
      const allProducts = response.data.results || response.data;
      // Filtrar solo productos con descuento
      return allProducts.filter((product) => product.has_discount);
    },
  });

  const handleProductHover = (productSlug) => {
    // Prefetch producto
    api.get(`/api/products/${productSlug}/`);
  };

  if (isLoading) {
    return (
      <div className="offers-container">
        <div className="loading">Cargando ofertas...</div>
      </div>
    );
  }

  return (
    <div className="offers-container">
      <div className="offers-header">
        <h2>🔥 Ofertas Especiales</h2>
        <p className="offers-subtitle">
          Aprovecha nuestros mejores descuentos y ahorra en tus compras favoritas
        </p>
      </div>

      {products && products.length > 0 ? (
        <>
          <div className="offers-banner">
            <div className="banner-content">
              <h3>🎉 ¡Descuentos de hasta {Math.max(...products.map(p => p.discount_percentage))}%!</h3>
              <p>No te pierdas estas increíbles ofertas por tiempo limitado</p>
            </div>
          </div>

          <div className="offers-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="offer-card"
                onMouseEnter={() => handleProductHover(product.slug)}
                onClick={() => navigate(`/products/${product.slug}`)}
              >
                {product.image_url ? (
                  <div className="offer-image">
                    <img src={product.image_url} alt={product.name} />
                    <div className="discount-badge-large">
                      -{product.discount_percentage}% OFF
                    </div>
                  </div>
                ) : (
                  <div className="offer-image-placeholder">
                    <span>📦</span>
                    <div className="discount-badge-large">
                      -{product.discount_percentage}% OFF
                    </div>
                  </div>
                )}
                <div className="offer-info">
                  <h3 className="offer-name">{product.name}</h3>
                  <p className="offer-description">{product.description}</p>
                  <div className="offer-prices">
                    <span className="price-original">${product.price}</span>
                    <span className="price-final">${product.final_price}</span>
                    <span className="savings">
                      Ahorras ${(product.price - product.final_price).toFixed(2)}
                    </span>
                  </div>
                  <div className="offer-stock">
                    {product.is_available ? (
                      <span className="stock-available">
                        ✓ En stock ({product.stock} disponibles)
                      </span>
                    ) : (
                      <span className="stock-unavailable">✗ Sin stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-offers">
          <p>No hay ofertas disponibles en este momento</p>
        </div>
      )}
    </div>
  );
}

export default Offers;




