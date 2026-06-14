import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user] = useState(null);
  const value = { user, isAuthenticated: false, profile: null };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, isAuthenticated: false, profile: null };
  }
  return context;
}
