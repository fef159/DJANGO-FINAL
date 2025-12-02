import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (!isAuthenticated) {
    return null; // No mostrar navbar si no está autenticado
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🌭🐕</span>
          <span className="brand-name">La Bodega del Salchichón</span>
        </Link>
        
        {/* Barra de búsqueda prominente */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar productos, marcas y más..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-navbar"
          />
          <button type="submit" className="search-button-navbar">
            🔍
          </button>
        </form>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/categories" className="nav-link">Categorías</Link>
          <Link to="/offers" className="nav-link">Ofertas</Link>
          <Link to="/sell" className="nav-link">Vender</Link>
          <Link to="/help" className="nav-link">Ayuda</Link>
          <Link to="/cart" className="nav-link cart-link">
            🛒 Carrito
          </Link>
          <div className="profile-menu-container" ref={profileMenuRef}>
            <button
              className="nav-user"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              👤 {user?.first_name || user?.email?.split('@')[0]}
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link
                  to="/profile"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Mi Perfil
                </Link>
                <Link
                  to="/history"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Mis Compras
                </Link>
                <Link
                  to="/my-products"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Mis Productos
                </Link>
                <div className="profile-dropdown-divider"></div>
                <button
                  onClick={handleLogout}
                  className="profile-dropdown-item logout-item"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

