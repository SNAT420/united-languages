import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ul_admin_user')); } catch { return null; }
  });

  function login(token, userData) {
    localStorage.setItem('ul_admin_token', token);
    localStorage.setItem('ul_admin_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('ul_admin_token');
    localStorage.removeItem('ul_admin_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
