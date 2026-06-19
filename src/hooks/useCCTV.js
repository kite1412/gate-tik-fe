import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { normalizeCctvItem, toCctvPayload } from '../utils/cctv';

export function useCCTV({ auto = true } = {}) {
  const [cameras, setCameras] = useState([]);
  const [mainCamera, setMainCamera] = useState(null);
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState('');

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/cctv');
      const payload = response?.data ?? response;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      const normalized = list.map((item, index) => normalizeCctvItem(item, index));
      setCameras(normalized);
      return normalized;
    } catch (err) {
      setError(err?.message || 'Gagal memuat data CCTV.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMainCamera = useCallback(async () => {
    const response = await api.get('/api/cctv/main');
    const payload = response?.data ?? response;
    const data = payload?.data ?? payload ?? null;
    const normalized = data ? normalizeCctvItem(data) : null;
    setMainCamera(normalized);
    return normalized;
  }, []);

  const createCamera = useCallback(
    async (payload) => {
      const response = await api.post('/api/cctv', toCctvPayload(payload));
      await fetchCameras();
      return response;
    },
    [fetchCameras],
  );

  const updateCamera = useCallback(
    async (cameraId, payload) => {
      const response = await api.patch(`/api/cctv/${cameraId}`, toCctvPayload(payload));
      await fetchCameras();
      return response;
    },
    [fetchCameras],
  );

  const deleteCamera = useCallback(
    async (cameraId) => {
      const response = await api.del(`/api/cctv/${cameraId}`);
      await fetchCameras();
      return response;
    },
    [fetchCameras],
  );

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      fetchCameras();
    }, 0);

    return () => clearTimeout(timer);
  }, [auto, fetchCameras]);

  return {
    cameras,
    cctvs: cameras,
    mainCamera,
    loading,
    error,
    setError,
    fetchCameras,
    fetchCCTVs: fetchCameras,
    fetchMainCamera,
    createCamera,
    createCCTV: createCamera,
    updateCamera,
    updateCCTV: updateCamera,
    deleteCamera,
    deleteCCTV: deleteCamera,
  };
}
