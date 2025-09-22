import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Constraints from './components/Constraints/Constraints';
import CreateConstraint from './components/Constraints/CreateConstraint';
import EditConstraint from './components/Constraints/EditConstraint';
import Analytics from './components/Analytics/Analytics';
import TradeHistory from './components/TradeHistory/TradeHistory';
import Backtest from './components/Backtest/Backtest';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="constraints" element={<Constraints />} />
        <Route path="constraints/new" element={<CreateConstraint />} />
        <Route path="constraints/edit/:id" element={<EditConstraint />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="trades" element={<TradeHistory />} />
        <Route path="backtest" element={<Backtest />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;