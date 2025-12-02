import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import './EditProduct.css';

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    category: '',
    image_url: '',
    is_featured: false,
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar categorías
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/api/products/categories/');
      return response.data.results || response.data || [];
    },
  });

  // Cargar producto
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['myProduct', productId],
    queryFn: async () => {
      const response = await api.get(`/api/products/my-products/${productId}/`);
      return response.data;
    },
    enabled: !!productId,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || '',
          discount_price: data.discount_price || '',
          stock: data.stock || '',
          category: data.category?.id || '',
          image_url: data.image_url || '',
          is_featured: data.is_featured || false,
        });
      }
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch(`/api/products/my-products/${productId}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myProducts']);
      queryClient.invalidateQueries(['myProduct', productId]);
      queryClient.invalidateQueries(['products']);
      setSuccessMessage('✅ Producto actualizado exitosamente.');
      setErrorMessage('');
      setTimeout(() => {
        navigate('/my-products');
      }, 2000);
    },
    onError: (error) => {
      const errorData = error.response?.data;
      let errorMsg = 'Error al actualizar el producto';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else {
          const validationErrors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMsg = validationErrors || error.message;
        }
      } else {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setSuccessMessage('');
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setSuccessMessage('');
    setErrorMessage('');

    const price = parseFloat(formData.price);
    const discountPrice = formData.discount_price ? parseFloat(formData.discount_price) : null;
    const stock = parseInt(formData.stock);

    if (isNaN(price) || price <= 0) {
      setErrorMessage('El precio debe ser un número mayor a 0');
      return;
    }

    if (discountPrice !== null && (isNaN(discountPrice) || discountPrice < 0)) {
      setErrorMessage('El precio con descuento debe ser un número mayor o igual a 0');
      return;
    }

    if (discountPrice !== null && discountPrice >= price) {
      setErrorMessage('El precio con descuento debe ser menor que el precio normal');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setErrorMessage('El stock debe ser un número mayor o igual a 0');
      return;
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: price,
      discount_price: discountPrice,
      stock: stock,
      image_url: formData.image_url.trim() || null,
      is_featured: formData.is_featured,
    };

    if (formData.category) {
      const categoryId = parseInt(formData.category);
      if (!isNaN(categoryId)) {
        productData.category_id = categoryId;
      }
    }

    updateProductMutation.mutate(productData);
  };

  if (productLoading) {
    return (
      <div className="edit-product-container">
        <div className="loading">Cargando producto...</div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="edit-product-container">
        <div className="error-message">
          Error al cargar el producto: {productError.message}
        </div>
        <button onClick={() => navigate('/my-products')} className="btn btn-primary">
          Volver a Mis Productos
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="edit-product-container">
        <div className="error-message">Producto no encontrado</div>
        <button onClick={() => navigate('/my-products')} className="btn btn-primary">
          Volver a Mis Productos
        </button>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      <div className="edit-product-header">
        <h2>Editar Producto</h2>
        <button onClick={() => navigate('/my-products')} className="btn-back">
          ← Volver
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <div className="edit-product-card">
        <form onSubmit={handleSubmit} className="edit-product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre del Producto *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Ej: Smartphone Pro Max"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Seleccionar categoría</option>
                {categories && Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-input form-textarea"
              rows="4"
              placeholder="Describe tu producto en detalle..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Precio ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-input"
                placeholder="99.99"
              />
            </div>

            <div className="form-group">
              <label htmlFor="discount_price">Precio con Descuento ($)</label>
              <input
                type="number"
                id="discount_price"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="form-input"
                placeholder="79.99 (opcional)"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">Stock Disponible *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="form-input"
                placeholder="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_url">URL de Imagen</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="form-input"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
              />
              <span>Marcar como producto destacado</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/my-products')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

          <p className="form-note">
            * Campos obligatorios. Los cambios serán revisados antes de ser publicados.
          </p>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;

