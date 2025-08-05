import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Contracts from './pages/Contracts';
import Partners from './pages/Partners';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ClientLogin from './pages/client/Login';
import Unauthorized from './components/Unauthorized';
import ClientDashboard from './pages/client/Dashboard';
import ClientDocuments from './pages/client/Documents';
import ClientFicheConseil from './pages/client/FicheConseil';
import PrivateRoute from './components/PrivateRoute';
import ClientPrivateRoute from './components/client/ClientPrivateRoute';
import ClientLayout from './components/client/ClientLayout';
import DocumentUploaderConnected from './components/DocumentUploaderConnected';
import Clients from './pages/Clients';
import Prospects from './pages/Prospects';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/register"
        element={
          <PrivateRoute roles={['superadmin', 'manager']}>
            <Register />
          </PrivateRoute>
        }
      />


      {/* Client portal routes (PROTÉGÉES) */}
      <Route
        path="/client"
        element={
          <ClientPrivateRoute>
            <ClientLayout />
          </ClientPrivateRoute>
        }
      >
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="documents" element={<ClientDocuments />} />
        <Route path="fiche-conseil" element={<ClientFicheConseil />} />
      </Route>

      {/* Protected admin routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <PrivateRoute>
            <Layout>
              <Contacts />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <PrivateRoute>
            <Layout>
              <Clients />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/prospects"
        element={
          <PrivateRoute>
            <Layout>
              <Prospects />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/contracts"
        element={
          <PrivateRoute>
            <Layout>
              <Contracts />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/partners"
        element={
          <PrivateRoute>
            <Layout>
              <Partners />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <Layout>
              <DocumentUploaderConnected />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
