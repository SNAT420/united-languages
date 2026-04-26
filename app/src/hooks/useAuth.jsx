import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('ul_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  function login(token, userData) {
    localStorage.setItem('ul_token', token);
    localStorage.setItem('ul_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('ul_token');
    localStorage.removeItem('ul_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
