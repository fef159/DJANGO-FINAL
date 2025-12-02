import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🛒 E-commerce
        </Link>
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/" className="nav-link">Inicio</Link>
              <Link to="/checkout" className="nav-link">Carrito</Link>
              <Link to="/history" className="nav-link">Mis Compras</Link>
              <span className="nav-user">Hola, {user?.email}</span>
              <button onClick={handleLogout} className="nav-button">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Iniciar Sesión</Link>
              <Link to="/register" className="nav-button">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

