import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import { clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '../lib/authStorage';
import { AuthContext } from './authContextBase';

function isAdmin(user) {
  return user?.role === 'admin';
}

function getInitialAuth() {
  const storedToken = getStoredToken();
  const storedUser = getStoredUser();

  if (storedToken && !isAdmin(storedUser)) {
    clearStoredAuth();
    return { token: null, user: null };
  }

  return { token: storedToken, user: storedUser };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getInitialAuth().token);
  const [user, setUser] = useState(() => getInitialAuth().user);

  const login = async ({ email, password }) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });

    const payload = response?.data || response;
    if (!isAdmin(payload?.user)) {
      try {
        await api.post('/api/auth/logout', null, {
          headers: payload?.token ? { Authorization: `Bearer ${payload.token}` } : undefined,
        });
      } catch {
        // Local auth cleanup below is still enough to keep this dashboard admin-only.
      }
      clearStoredAuth();
      setToken(null);
      setUser(null);
      throw new Error('Forbidden: User does not have admin access.');
    }

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

  const updateUser = useCallback(
    (nextUser) => {
      setUser((prev) => {
        const merged = { ...(prev || {}), ...(nextUser || {}) };
        setStoredAuth(token, merged);
        return merged;
      });
    },
    [token],
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: Boolean(token && isAdmin(user)),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
