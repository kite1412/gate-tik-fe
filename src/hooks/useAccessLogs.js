import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useAccessLogs({
  auto = true,
  perPage = 15,
  page = 1,
  sortOrder = 'desc',
  period,
  accessStatus,
  accessMethod,
  action,
  search,
  includeLastOpened = true,
} = {}) {
  const [logs, setLogs] = useState([]);
  const [lastOpened, setLastOpened] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const logsRequest = api.get('/api/access-logs', {
        params: {
          page,
          per_page: perPage,
          sort_order: sortOrder,
          period: period || undefined,
          access_status: accessStatus || undefined,
          access_method: accessMethod || undefined,
          action: action || undefined,
          search: search || undefined,
        },
      });
      const [allLogs, latest] = await Promise.all([
        logsRequest,
        includeLastOpened ? api.get('/api/access-logs/last-opened') : Promise.resolve(null),
      ]);

      const logsPayload = allLogs?.data ?? allLogs;
      const list = logsPayload?.data ?? logsPayload ?? [];
      setLogs(Array.isArray(list) ? list : []);
      setPagination(logsPayload?.pagination ?? allLogs?.pagination ?? null);

      if (includeLastOpened) {
        const lastOpenedPayload = latest?.data ?? latest;
        const lastOpenedData = lastOpenedPayload?.data ?? lastOpenedPayload ?? null;
        setLastOpened(lastOpenedData);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch access logs.');
    } finally {
      setLoading(false);
    }
  }, [
    page,
    perPage,
    sortOrder,
    period,
    accessStatus,
    accessMethod,
    action,
    search,
    includeLastOpened,
  ]);

  const fetchAllLogs = useCallback(
    async ({
      perPage: allPerPage = 200,
      sortOrder: allSortOrder = 'desc',
      period: allPeriod,
      accessStatus: allAccessStatus,
      accessMethod: allAccessMethod,
      action: allAction,
      search: allSearch,
    } = {}) => {
      const first = await api.get('/api/access-logs', {
        params: {
          page: 1,
          per_page: allPerPage,
          sort_order: allSortOrder,
          period: allPeriod || undefined,
          access_status: allAccessStatus || undefined,
          access_method: allAccessMethod || undefined,
          action: allAction || undefined,
          search: allSearch || undefined,
        },
      });

      const firstPayload = first?.data ?? first;
      const firstList = firstPayload?.data ?? firstPayload ?? [];
      const totalRecords = firstPayload?.pagination?.total ?? first?.pagination?.total ?? 0;
      const totalPages = totalRecords ? Math.ceil(totalRecords / allPerPage) : 1;
      const allLogs = Array.isArray(firstList) ? [...firstList] : [];

      for (let i = 2; i <= totalPages; i += 1) {
        const response = await api.get('/api/access-logs', {
          params: {
            page: i,
            per_page: allPerPage,
            sort_order: allSortOrder,
            period: allPeriod || undefined,
            access_status: allAccessStatus || undefined,
            access_method: allAccessMethod || undefined,
            action: allAction || undefined,
            search: allSearch || undefined,
          },
        });
        const payload = response?.data ?? response;
        const list = payload?.data ?? payload ?? [];
        if (Array.isArray(list)) {
          allLogs.push(...list);
        }
      }

      return allLogs;
    },
    [],
  );

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      fetchLogs();
    }, 0);

    return () => clearTimeout(timer);
  }, [auto, fetchLogs]);

  return {
    logs,
    lastOpened,
    pagination,
    loading,
    error,
    fetchLogs,
    fetchAllLogs,
  };
}
