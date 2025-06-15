import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Симуляция базы данных пользователей в localStorage
const USERS_KEY = 'weather_app_users';
const TOKEN_KEY = 'weather_app_token';

interface StoredUser {
  id: string;
  username: string;
  email: string;
  password: string; // В реальном приложении пароли должны быть хешированы
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Инициализация пользователей по умолчанию
  useEffect(() => {
    const existingUsers = localStorage.getItem(USERS_KEY);
    if (!existingUsers) {
      const defaultUsers: StoredUser[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@weather.com',
          password: 'admin123'
        }
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }

    // Проверка существующего токена при загрузке
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const userData = JSON.parse(atob(token));
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const foundUser = users.find(u => u.username === username && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email
        };
        
        // Создание простого токена (в реальном приложении используйте JWT)
        const token = btoa(JSON.stringify(userData));
        localStorage.setItem(TOKEN_KEY, token);
        
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      // Проверка на существование пользователя
      if (users.some(u => u.username === username || u.email === email)) {
        return false;
      }
      
      const newUser: StoredUser = {
        id: Date.now().toString(),
        username,
        email,
        password
      };
      
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Автоматический вход после регистрации
      const userData: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      };
      
      const token = btoa(JSON.stringify(userData));
      localStorage.setItem(TOKEN_KEY, token);
      
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}