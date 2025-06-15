import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ErrorPage } from './ErrorPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Показываем 403 ошибку для неавторизованных пользователей
    return <ErrorPage code={403} message="Доступ запрещен. Необходима авторизация." />;
  }

  return <>{children}</>;
}