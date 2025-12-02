import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: 'Producto 1', price: 29.99, description: 'Descripción del producto 1' },
    { id: 2, name: 'Producto 2', price: 39.99, description: 'Descripción del producto 2' },
    { id: 3, name: 'Producto 3', price: 49.99, description: 'Descripción del producto 3' },
    { id: 4, name: 'Producto 4', price: 59.99, description: 'Descripción del producto 4' },
  ];

  const addToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const goToCheckout = () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    navigate('/checkout', { state: { cart } });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="home">
      <h1 className="home-title">Bienvenido a nuestro E-commerce</h1>
      
      {cart.length > 0 && (
        <div className="cart-summary">
          <p>Carrito: {cart.length} producto(s) - Total: ${total.toFixed(2)}</p>
          <button onClick={goToCheckout} className="checkout-button">
            Ir al Checkout
          </button>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => addToCart(product)}
              className="add-to-cart-button"
            >
              Agregar al Carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;

