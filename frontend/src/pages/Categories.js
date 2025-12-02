import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Categories.css';

function Categories() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/products/categories/');
        // Si la respuesta es una lista, devolverla directamente
        // Si tiene results (paginación), devolver results
        return response.data.results || response.data || [];
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const handleCategoryHover = (categorySlug) => {
    // Prefetch productos de la categoría al pasar el mouse
    queryClient.prefetchQuery({
      queryKey: ['products', 'category', categorySlug],
      queryFn: async () => {
        const response = await api.get(`/api/products/categories/${categorySlug}/products/`);
        return response.data;
      },
    });
  };

  if (isLoading) {
    return (
      <div className="categories-container">
        <div className="loading">Cargando categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-container">
        <div className="error-message">
          Error al cargar categorías: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <h2>Categorías</h2>
      {categories && Array.isArray(categories) && categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className="category-card"
              onMouseEnter={() => handleCategoryHover(category.slug)}
            >
              {category.image_url ? (
                <div className="category-image">
                  <img src={category.image_url} alt={category.name} />
                </div>
              ) : (
                <div className="category-image-placeholder">
                  <span className="category-icon">📦</span>
                </div>
              )}
              <div className="category-info">
                <h3>{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                {category.products_count !== undefined && category.products_count > 0 && (
                  <span className="category-count">
                    {category.products_count} producto{category.products_count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : !isLoading && (!categories || categories.length === 0) ? (
        <div className="empty-categories">
          <p>No hay categorías disponibles</p>
          <p className="empty-suggestions">
            Las categorías aparecerán aquí una vez que se agreguen productos al sistema.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default Categories;
