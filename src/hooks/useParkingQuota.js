import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

const DEFAULT_QUOTA = {
  total_slots: 100,
  used_slots: 0,
  available_slots: 100,
  auto_restrict_student: true,
};

export function useParkingQuota({ auto = true } = {}) {
  const [parkingQuota, setParkingQuota] = useState(DEFAULT_QUOTA);
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState('');

  const fetchParkingQuota = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.get('/api/parking-quota');
      const payload = response?.data ?? response;
      const data = payload?.data ?? payload ?? null;
      if (data) {
        setParkingQuota(data);
      }
    } catch (err) {
      setError(err?.message || 'Gagal memuat parking quota.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateParkingQuota = useCallback(async (payload) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.patch('/api/parking-quota', payload);
      const responsePayload = response?.data ?? response;
      const data = responsePayload?.data ?? responsePayload ?? null;
      if (data) {
        setParkingQuota(data);
      }
      return data;
    } catch (err) {
      setError(err?.message || 'Gagal memperbarui parking quota.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      fetchParkingQuota();
    }, 0);

    return () => clearTimeout(timer);
  }, [auto, fetchParkingQuota]);

  return {
    parkingQuota,
    loading,
    error,
    fetchParkingQuota,
    updateParkingQuota,
  };
}
