import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './SearchResults.css';

function SearchResults() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [filterFeatured, setFilterFeatured] = useState(false);

  // Leer término de búsqueda de la URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Query para buscar productos
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (filterFeatured) params.append('featured', 'true');
      const response = await api.get(`/api/products/?${params.toString()}`);
      return response.data.results || response.data;
    },
    enabled: !!searchTerm, // Solo ejecutar si hay término de búsqueda
  });

  // Query para el carrito (si está autenticado)
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/api/cart/');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Mutación para agregar al carrito
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }) => {
      const response = await api.post('/api/cart/add/', {
        product_id: productId,
        quantity,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Prefetch producto al pasar el mouse
  const handleProductHover = (productSlug) => {
    queryClient.prefetchQuery({
      queryKey: ['product', productSlug],
      queryFn: async () => {
        const response = await api.get(`/api/products/${productSlug}/`);
        return response.data;
      },
    });
  };

  const filteredAndSortedProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = allProducts;

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.final_price - b.final_price;
        case 'price_desc':
          return b.final_price - a.final_price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProducts, sortBy]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h1>Resultados de búsqueda</h1>
        {searchTerm && (
          <p className="search-query">
            Buscaste: <strong>"{searchTerm}"</strong>
          </p>
        )}
      </div>

      <div className="search-filters-bar">
        <form className="search-box-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar productos, marcas y más..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-large"
          />
          <button type="submit" className="search-button-large">
            🔍 Buscar
          </button>
        </form>
        <div className="filter-controls">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.checked)}
            />
            <span>Mostrar solo destacados</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="-created_at">Más relevantes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_asc">Nombre: A-Z</option>
            <option value="name_desc">Nombre: Z-A</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Buscando productos...</div>
      ) : filteredAndSortedProducts.length > 0 ? (
        <>
          <p className="results-count">
            {filteredAndSortedProducts.length} resultado{filteredAndSortedProducts.length !== 1 ? 's' : ''} encontrado{filteredAndSortedProducts.length !== 1 ? 's' : ''}
          </p>
          <div className="products-grid">
            {filteredAndSortedProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onMouseEnter={() => handleProductHover(product.slug)}
              >
                {product.image_url ? (
                  <div className="product-image" onClick={() => navigate(`/products/${product.slug}`)}>
                    <img src={product.image_url} alt={product.name} />
                    {product.has_discount && (
                      <span className="discount-badge">
                        -{product.discount_percentage}%
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="product-image-placeholder" onClick={() => navigate(`/products/${product.slug}`)}>
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
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.is_available || addToCartMutation.isPending}
                  className="add-to-cart-button"
                >
                  {addToCartMutation.isPending
                    ? 'Agregando...'
                    : product.is_available
                    ? 'Agregar al Carrito'
                    : 'Sin Stock'}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : searchTerm ? (
        <div className="empty-results">
          <p>No se encontraron productos para "{searchTerm}"</p>
          <p className="empty-suggestions">
            Intenta con otros términos de búsqueda o explora nuestras categorías.
          </p>
        </div>
      ) : (
        <div className="empty-results">
          <p>Ingresa un término de búsqueda para comenzar</p>
        </div>
      )}
    </div>
  );
}

export default SearchResults;





