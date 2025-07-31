import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    role: null,
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');

    if (token && user && role) {
      setAuth({
        isLoggedIn: true,
        user: JSON.parse(user),
        role,
        token,
      });
    }
  }, []);

  const setAuthStatus = (authData) => {
    if (authData.isLoggedIn) {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('role', authData.role);
    } else {
      localStorage.clear();
    }
    setAuth(authData);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
