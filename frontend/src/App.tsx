import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationContainer } from './components/Notification';
import { setErrorNotificationCallback, setUnauthorizedCallback } from './services/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Veiculos from './pages/Veiculos';
import Locacoes from './pages/Locacoes';
import Relatorios from './pages/Relatorios';
import './App.css';

function AppContent() {
  const { addNotification } = useNotification();
  const { logout } = useAuth();

  // Setup error callback para o API
  useEffect(() => {
    setErrorNotificationCallback((notification) => {
      addNotification(notification);
    });

    // Setup unauthorized callback - quando token expirar ou for inválido
    setUnauthorizedCallback(() => {
      logout();
      addNotification({
        message: 'Sessão expirada. Faça login novamente.',
        type: 'warning',
      });
      window.location.href = '/login';
    });
  }, [addNotification, logout]);

  return (
    <>
      <NotificationContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/veiculos" element={<Veiculos />} />
            <Route path="/locacoes" element={<Locacoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
