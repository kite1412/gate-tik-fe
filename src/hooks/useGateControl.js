import { useCallback, useState } from 'react';
import { api } from '../lib/api';

export function useGateControl() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestGate = useCallback(async (path, payload) => {
    setLoading(true);
    setError('');
    try {
      return await api.post(path, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      setError(err?.message || 'Gagal mengirim perintah gate.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const openGate = useCallback(
    (payload) => requestGate('/api/gate/open', payload),
    [requestGate],
  );

  const closeGate = useCallback(
    (payload) => requestGate('/api/gate/close', payload),
    [requestGate],
  );

  const fetchMainGate = useCallback(async () => {
    const response = await api.get('/api/gate/main');
    const payload = response?.data ?? response;
    return payload?.data ?? payload ?? null;
  }, []);

  const updateGate = useCallback(async (payload) => {
    const response = await api.patch('/api/gate', payload);
    const responsePayload = response?.data ?? response;
    return responsePayload?.data ?? responsePayload ?? null;
  }, []);

  return {
    loading,
    error,
    openGate,
    closeGate,
    fetchMainGate,
    updateGate,
  };
}
