import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import { clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '../lib/authStorage';
import { AuthContext } from './authContextBase';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());

  const login = async ({ email, password }) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });

    const payload = response?.data || response;
    setToken(payload?.token ?? null);
    setUser(payload?.user ?? null);
    setStoredAuth(payload?.token, payload?.user);

    return response;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      clearStoredAuth();
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = useCallback((nextUser) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...(nextUser || {}) };
      setStoredAuth(token, merged);
      return merged;
    });
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
