import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import PurchaseHistory from './pages/PurchaseHistory';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import ProductsByCategory from './pages/ProductsByCategory';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Offers from './pages/Offers';
import Sell from './pages/Sell';
import Help from './pages/Help';
import SearchResults from './pages/SearchResults';
import Receipt from './pages/Receipt';
import MyProducts from './pages/MyProducts';
import EditProduct from './pages/EditProduct';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  return user ? <Navigate to="/" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories/:slug"
        element={
          <PrivateRoute>
            <ProductsByCategory />
          </PrivateRoute>
        }
      />
      <Route
        path="/products/:slug"
        element={
          <PrivateRoute>
            <ProductDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <PurchaseHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/receipt/:purchaseId"
        element={
          <PrivateRoute>
            <Receipt />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/offers"
        element={
          <PrivateRoute>
            <Offers />
          </PrivateRoute>
        }
      />
      <Route
        path="/sell"
        element={
          <PrivateRoute>
            <Sell />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-products"
        element={
          <PrivateRoute>
            <MyProducts />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-product/:productId"
        element={
          <PrivateRoute>
            <EditProduct />
          </PrivateRoute>
        }
      />
      <Route
        path="/help"
        element={
          <PrivateRoute>
            <Help />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <SearchResults />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

