import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { api } from '../lib/api';

export const emptyProfile = {
  id: null,
  full_name: '',
  email: '',
  npm_nip: '',
  phone_number: '',
  role: '',
  status: '',
  last_login_at: null,
  created_at: null,
  updated_at: null,
};

export function useProfile({ auto = true } = {}) {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(() => ({ ...emptyProfile, ...(user || {}) }));
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState('');

  const syncProfile = useCallback(
    (data) => {
      setProfile(data);
      updateUser?.(data);
      return data;
    },
    [updateUser],
  );

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/profile');
      const payload = response?.data ?? response;
      const data = payload?.data ?? payload ?? null;
      if (data) {
        syncProfile(data);
      }
      return data;
    } catch (err) {
      setError(err?.message || 'Gagal memuat profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [syncProfile]);

  const updateProfile = useCallback(
    async (payload) => {
      const response = await api.patch('/api/profile', payload);
      const responsePayload = response?.data ?? response;
      const data = responsePayload?.data ?? responsePayload ?? null;
      if (data) {
        syncProfile(data);
      }
      return data;
    },
    [syncProfile],
  );

  const updatePassword = useCallback(async (payload) => {
    return api.patch('/api/profile/password', payload);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      fetchProfile().catch(() => {});
    }, 0);

    return () => clearTimeout(timer);
  }, [auto, fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updatePassword,
  };
}
