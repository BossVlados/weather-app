import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  code: number;
  message: string;
}

export function ErrorPage({ code, message }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-24 h-24 text-red-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-800 mb-4">{code}</h1>
        <p className="text-xl text-gray-600 mb-8">{message}</p>
        <Link
          to="/login"
          className="btn-primary inline-flex items-center"
        >
          Перейти к авторизации
        </Link>
      </div>
    </div>
  );
}