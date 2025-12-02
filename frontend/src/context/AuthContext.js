import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!token) return null;
      const response = await api.get('/api/auth/me/');
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login/', { email, password });
      const { access, refresh } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      setToken(access);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      // Invalidar y refetch inmediatamente
      await queryClient.invalidateQueries(['currentUser']);
      await queryClient.refetchQueries(['currentUser']);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register/', userData);
      
      // Si el registro devuelve tokens directamente, usarlos
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        setToken(response.data.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        // Invalidar y refetch inmediatamente
        await queryClient.invalidateQueries(['currentUser']);
        await queryClient.refetchQueries(['currentUser']);
        return { success: true };
      }
      
      // Si no hay tokens, intentar login automático
      if (response.data.user) {
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      } else {
        // Si no retorna user, hacer login manual
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.message || error.response?.data || 'Error al registrar usuario',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    queryClient.clear();
  };

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const value = {
    user,
    loading: isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

