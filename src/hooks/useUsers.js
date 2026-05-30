import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

const KTM_NOT_FOUND_MESSAGE = 'KTM file not found.';

export function useUsers({
  auto = true,
  page = 1,
  role,
  status,
  search,
  perPage = 15,
  sortOrder = 'desc',
} = {}) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/users', {
        params: {
          page,
          role,
          status,
          search,
          per_page: perPage,
          sort_order: sortOrder,
        },
      });
      const payload = response?.data ?? response;
      const list = payload?.data ?? payload ?? [];
      setUsers(Array.isArray(list) ? list : []);
      setPagination(payload?.pagination ?? response?.pagination ?? null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [page, role, status, search, perPage, sortOrder]);

  const createUser = useCallback(
    async (payload) => {
      const response = await api.post('/api/users', payload);
      await fetchUsers();
      return response;
    },
    [fetchUsers],
  );

  const updateUser = useCallback(
    async (userId, payload) => {
      const response = await api.patch(`/api/users/${userId}`, payload);
      await fetchUsers();
      return response;
    },
    [fetchUsers],
  );

  const deleteUser = useCallback(
    async (userId) => {
      const response = await api.del(`/api/users/${userId}`);
      await fetchUsers();
      return response;
    },
    [fetchUsers],
  );

  const verifyUser = useCallback(
    async (userId) => updateUser(userId, { status: 'active' }),
    [updateUser],
  );

  const fetchUserKtm = useCallback(async (userId) => {
    if (!userId) {
      throw new Error('User ID is required.');
    }

    try {
      const blob = await api.get(`/api/users/${userId}/ktm`, {
        headers: {
          Accept: 'image/*',
        },
        responseType: 'blob',
      });

      if (!blob || blob.size === 0) {
        throw new Error(KTM_NOT_FOUND_MESSAGE);
      }

      return blob;
    } catch (err) {
      const isNotFoundError =
        err?.status === 404 ||
        (typeof err?.message === 'string' &&
          err.message.toLowerCase().includes('resource not found'));

      if (isNotFoundError) {
        throw new Error(KTM_NOT_FOUND_MESSAGE);
      }

      throw err;
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);

    return () => clearTimeout(timer);
  }, [auto, fetchUsers]);

  return {
    users,
    pagination,
    loading,
    error,
    setError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    verifyUser,
    fetchUserKtm,
  };
}
