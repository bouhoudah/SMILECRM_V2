// src/components/ClientPrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const ClientPrivateRoute: React.FC<Props> = ({ children }) => {
  const clientId = sessionStorage.getItem('clientId');

  return clientId ? <>{children}</> : <Navigate to="/client/login" />;
};

export default ClientPrivateRoute;
