import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ProductsByCategory.css';

function ProductsByCategory() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', 'category', slug],
    queryFn: async () => {
      const response = await api.get(`/api/products/categories/${slug}/products/`);
      // Manejar respuesta paginada o directa
      return response.data.results || response.data || [];
    },
  });

  const handleProductHover = (productSlug) => {
    // Prefetch detalle del producto
    api.get(`/api/products/${productSlug}/`).then(() => {
      // Prefetch también productos recomendados si es necesario
    });
  };

  const filteredAndSortedProducts = React.useMemo(() => {
    // Asegurar que products sea un array
    if (!products) return [];
    
    // Manejar diferentes formatos de respuesta
    let productsArray = [];
    if (Array.isArray(products)) {
      productsArray = products;
    } else if (products && Array.isArray(products.results)) {
      productsArray = products.results;
    } else if (products && typeof products === 'object') {
      // Si es un objeto, intentar extraer un array
      productsArray = Object.values(products).find(Array.isArray) || [];
    }

    // Si aún no es un array, retornar vacío
    if (!Array.isArray(productsArray)) {
      return [];
    }

    let filtered = productsArray;

    // Filtrar por búsqueda
    if (searchTerm && Array.isArray(filtered)) {
      filtered = filtered.filter(
        (product) => {
          if (!product) return false;
          const nameMatch = product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase());
          const descMatch = product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase());
          return nameMatch || descMatch;
        }
      );
    }

    // Asegurar que filtered sea un array antes de ordenar
    if (!Array.isArray(filtered)) {
      return [];
    }

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.final_price || 0) - (b.final_price || 0);
        case 'price_desc':
          return (b.final_price || 0) - (a.final_price || 0);
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="products-category-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-category-container">
        <div className="error-message">
          Error al cargar productos: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="products-category-container">
      <div className="category-header">
        <h2>Productos de la Categoría</h2>
        <Link to="/categories" className="back-link">
          ← Volver a Categorías
        </Link>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-box">
          <label htmlFor="sort">Ordenar por:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="-created_at">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_asc">Nombre: A-Z</option>
            <option value="name_desc">Nombre: Z-A</option>
          </select>
        </div>
      </div>

      {filteredAndSortedProducts.length > 0 ? (
        <>
          <p className="results-count">
            {filteredAndSortedProducts.length} producto{filteredAndSortedProducts.length !== 1 ? 's' : ''} encontrado{filteredAndSortedProducts.length !== 1 ? 's' : ''}
          </p>
          <div className="products-grid">
            {filteredAndSortedProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onMouseEnter={() => handleProductHover(product.slug)}
              >
                {product.image_url ? (
                  <div className="product-image">
                    <img src={product.image_url} alt={product.name} />
                    {product.has_discount && (
                      <span className="discount-badge">
                        -{product.discount_percentage}%
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="product-image-placeholder">
                    <span>📦</span>
                  </div>
                )}
                <div className="product-info">
                  <h3
                    onClick={() => navigate(`/products/${product.slug}`)}
                    className="product-name"
                  >
                    {product.name}
                  </h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">
                    {product.has_discount && (
                      <span className="price-original">${product.price}</span>
                    )}
                    <span className="price-final">${product.final_price}</span>
                  </div>
                  <div className="product-stock">
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
        <div className="empty-products">
          <p>No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}

export default ProductsByCategory;
