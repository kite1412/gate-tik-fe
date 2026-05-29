import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useIotDevice({ auto = true } = {}) {
  const [iotDevice, setIotDevice] = useState(null);
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState('');

  const fetchIotDevice = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/iot-device');
      const payload = response?.data ?? response;
      const data = payload?.data ?? payload ?? null;
      setIotDevice(data);
      return data;
    } catch (err) {
      setError(err?.message || 'Failed to fetch IoT device data.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      fetchIotDevice().catch(() => {});
    }, 0);

    return () => clearTimeout(timer);
  }, [auto, fetchIotDevice]);

  return {
    iotDevice,
    loading,
    error,
    fetchIotDevice,
  };
}
