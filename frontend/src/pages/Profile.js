import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/api/auth/me/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setSuccessMessage('Perfil actualizado exitosamente');
      setErrorMessage('');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.detail || 'Error al actualizar el perfil');
      setSuccessMessage('');
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      username: user?.username || '',
    });
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <div className="profile-card">
        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <h3>
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.email}
                </h3>
                <p className="profile-email">{user?.email}</p>
                {user?.username && (
                  <p className="profile-username">@{user.username}</p>
                )}
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">
                  {user?.first_name || 'No especificado'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Apellido:</span>
                <span className="detail-value">
                  {user?.last_name || 'No especificado'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Usuario:</span>
                <span className="detail-value">{user?.username || 'No especificado'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Miembro desde:</span>
                <span className="detail-value">
                  {user?.date_joined
                    ? new Date(user.date_joined).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit">
            <div className="form-group">
              <label htmlFor="first_name">Nombre</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Apellido</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                disabled
              />
              <small className="form-help">El email no se puede cambiar</small>
            </div>

            <div className="form-group">
              <label htmlFor="username">Nombre de Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={updateProfileMutation.isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
