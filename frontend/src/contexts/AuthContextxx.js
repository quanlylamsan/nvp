// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { setAuthToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    // Mỗi khi token thay đổi, cập nhật header của axios
    setAuthToken(token);
  }, [token]);

  const login = (newToken, newUserInfo) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUserInfo));
    setToken(newToken);
    setUser(newUserInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tiện ích để sử dụng context
export const useAuth = () => {
    return useContext(AuthContext);
}