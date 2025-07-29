import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    role: null,
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setAuth({
            isLoggedIn: true,
            user: { id: decoded.id },
            role: decoded.role,
            token: token,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const setAuthStatus = (authData) => {
    if (authData.token) {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('role', authData.role);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    setAuth(authData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuth({ isLoggedIn: false, user: null, role: null, token: null });
  };

  const value = {
    ...auth,
    setAuthStatus,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
