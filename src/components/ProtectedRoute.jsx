// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const session = JSON.parse(localStorage.getItem('userSession'));

  if (!session) return <Navigate to='/login' replace />;
  if (adminOnly && !session.isAdmin)
    return <Navigate to='/unauthorized' replace />;

  return children;
}
