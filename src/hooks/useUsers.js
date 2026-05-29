import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

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
  };
}
