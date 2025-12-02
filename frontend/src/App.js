import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import PurchaseHistory from './pages/PurchaseHistory';
import './App.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <CheckoutWrapper />
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
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;

