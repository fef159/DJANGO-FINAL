import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import './Sell.css';

function Sell() {
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

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/api/products/categories/');
      return response.data;
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/products/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      alert('Producto creado exitosamente. Será revisado antes de ser publicado.');
      setFormData({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        stock: '',
        category: '',
        image_url: '',
        is_featured: false,
      });
    },
    onError: (error) => {
      alert('Error al crear el producto: ' + (error.response?.data?.detail || error.message));
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
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      stock: parseInt(formData.stock),
      category_id: formData.category ? parseInt(formData.category) : null,
    };

    createProductMutation.mutate(productData);
  };

  return (
    <div className="sell-container">
      <h2>Vender Producto</h2>
      <p className="sell-subtitle">
        Publica tu producto en nuestra plataforma y llega a miles de compradores
      </p>

      <div className="sell-card">
        <form onSubmit={handleSubmit} className="sell-form">
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
                {categories?.map((cat) => (
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
              type="submit"
              className="btn btn-primary btn-large"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? 'Publicando...' : 'Publicar Producto'}
            </button>
          </div>

          <p className="form-note">
            * Campos obligatorios. Tu producto será revisado antes de ser publicado.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Sell;




