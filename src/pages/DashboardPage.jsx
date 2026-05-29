import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DoorOpen,
  Car,
  Cpu,
  PhoneCall,
  TrendingUp,
  ArrowUpRight,
  Wifi,
  Lock,
  Video,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/useAuth';
import { useAccessLogs } from '../hooks/useAccessLogs';
import { useGateControl } from '../hooks/useGateControl';
import { useParkingQuota } from '../hooks/useParkingQuota';
import { useUsers } from '../hooks/useUsers';
import { formatDate } from '../utils/formatDate';

const initialChartData = Array.from({ length: 24 }).map((_, i) => ({
  id: `hour-${i}`,
  hour: `${i.toString().padStart(2, '0')}:00`,
  access: 0,
}));

export default function DashboardPage() {
  const { dark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gate, setGate] = useState('closed');
  const [cooldown, setCooldown] = useState(false);
  const cooldownRef = useRef(null);
  const [chartLogs, setChartLogs] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartError, setChartError] = useState('');
  const {
    logs,
    lastOpened,
    pagination: accessPagination,
    loading: loadingLogs,
    error: logError,
    fetchLogs,
    fetchAllLogs,
  } = useAccessLogs({ perPage: 10, sortOrder: 'desc' });
  const {
    loading: loadingGate,
    openGate: sendOpenGate,
    closeGate: sendCloseGate,
  } = useGateControl();
  const { parkingQuota, error: parkingError } = useParkingQuota();
  const { pagination: userPagination } = useUsers({ status: 'active', perPage: 1 });
  const parkingUsed = parkingQuota?.used_slots ?? 0;
  const parkingTotal = parkingQuota?.total_slots ?? 0;
  const parkingLabel = `${parkingUsed}/${parkingTotal}`;
  const cctvUrl = import.meta.env.VITE_API_CCTV_URL;

  const pct = parkingTotal ? Math.round((parkingUsed / parkingTotal) * 100) : 0;
  const activeUsersTotal = userPagination?.total ?? 0;
  const gateTriggersTotal = accessPagination?.total ?? logs.length;

  const stats = [
    {
      label: 'Active Users',
      value: activeUsersTotal,
      delta: '+4.2%',
      icon: <Users className="h-5 w-5" />,
      tone: 'blue',
    },
    {
      label: 'Gate Triggers',
      value: gateTriggersTotal,
      delta: '+12%',
      icon: <DoorOpen className="h-5 w-5" />,
      tone: 'emerald',
    },
    {
      label: 'Parking (Student)',
      value: parkingLabel,
      delta: `${pct}%`,
      icon: <Car className="h-5 w-5" />,
      tone: 'amber',
    },
    {
      label: 'IoT Device',
      value: 'Online',
      delta: 'Gate Ctrl',
      icon: <Cpu className="h-5 w-5" />,
      tone: 'indigo',
    },
    {
      label: 'Visitor Call',
      value: 'Active',
      delta: 'In progress',
      icon: <PhoneCall className="h-5 w-5" />,
      tone: 'rose',
    },
  ];

  const chartData = useMemo(() => {
    if (!chartLogs.length) return initialChartData;
    const now = new Date();
    const buckets = Array.from({ length: 24 }).map((_, index) => {
      const bucketDate = new Date(now);
      bucketDate.setMinutes(0, 0, 0);
      bucketDate.setHours(bucketDate.getHours() - (23 - index));
      return {
        id: `hour-${index}`,
        ts: bucketDate.getTime(),
        hour: `${bucketDate.getHours().toString().padStart(2, '0')}:00`,
        access: 0,
      };
    });

    const startTs = buckets[0].ts;
    const endTs = buckets[buckets.length - 1].ts + 60 * 60 * 1000;

    chartLogs.forEach((entry) => {
      if (!entry?.created_at) return;
      const ts = new Date(entry.created_at).getTime();
      if (Number.isNaN(ts) || ts < startTs || ts >= endTs) return;
      const bucketIndex = Math.floor((ts - startTs) / (60 * 60 * 1000));
      if (bucketIndex >= 0 && bucketIndex < buckets.length) {
        buckets[bucketIndex].access += 1;
      }
    });

    return buckets.map((bucket) => ({
      id: bucket.id,
      hour: bucket.hour,
      access: bucket.access,
    }));
  }, [chartLogs]);

  const lastOpenedText = lastOpened?.created_at
    ? `Last opened ${formatDistanceToNow(new Date(lastOpened.created_at), {
        addSuffix: true,
      })}`
    : 'Last opened —';

  const latestOperator = lastOpened?.user?.full_name || user?.full_name || user?.name;
  const recentLogs = logs.slice(0, 10);

  const fetchChartLogs24h = useCallback(async () => {
    setLoadingChart(true);
    setChartError('');
    try {
      const allLogs = await fetchAllLogs({ period: '24h' });
      setChartLogs(allLogs);
    } catch (err) {
      setChartError(err?.message || 'Gagal memuat chart logs 24 jam terakhir.');
      setChartLogs([]);
    } finally {
      setLoadingChart(false);
    }
  }, [fetchAllLogs]);

  const startCooldown = () => {
    setCooldown(true);
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
    }
    cooldownRef.current = setTimeout(() => setCooldown(false), 3000);
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChartLogs24h();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchChartLogs24h]);

  const openGate = async () => {
    if (loadingGate || cooldown) return;
    setGate('opening');
    try {
      await sendOpenGate({
        gate_id: 1,
        access_method: 'web',
        notes: 'Open gate requested from dashboard',
      });
      await fetchLogs();
      setGate('open');
      setTimeout(() => setGate('closed'), 4000);
      startCooldown();
    } catch {
      setGate('closed');
    }
  };

  const closeGate = async () => {
    if (loadingGate || cooldown) return;
    try {
      await sendCloseGate({
        gate_id: 1,
        access_method: 'Web',
        notes: 'Close gate requested from dashboard',
      });
      await fetchLogs();
      setGate('closed');
      startCooldown();
    } catch {
      setGate('closed');
    }
  };

  const openFullscreen = () => {
    if (!cctvUrl) return;
    window.open(cctvUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-2xl tracking-tight">Welcome back, {displayName}</h1>
        <p className="text-sm opacity-60">Real-time overview of campus access & monitoring</p>
      </div> */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((item) => (
          <motion.div key={item.label} whileHover={{ y: -3 }} className={glass(dark, 'p-5')}>
            <div className="flex items-start justify-between">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${toneBg(item.tone, dark)}`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] opacity-60">{item.delta}</span>
            </div>
            <p className="mt-3 text-2xl tracking-tight">{item.value}</p>
            <p className="text-xs opacity-60">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
          <div className={glass(dark, 'flex flex-col p-6')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest opacity-60">Main Gate</p>
                {/* <h3 className="tracking-tight">
                {gate === 'open' ? 'OPEN' : gate === 'opening' ? 'OPENING' : 'CLOSED'}
              </h3> */}
              </div>
              <motion.span
                className={`h-3 w-3 rounded-full ${gate === 'open' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs opacity-70">
              <Wifi className="h-3.5 w-3.5 text-emerald-500" /> Online · {lastOpenedText}
            </div>
            <p className="mt-0.5 text-xs opacity-50">Operator: {latestOperator || '-'}</p>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
              <button
                onClick={openGate}
                disabled={loadingGate || cooldown}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <DoorOpen className="h-4 w-4" /> Open
              </button>
              <button
                onClick={closeGate}
                disabled={loadingGate || cooldown}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500/90 text-white shadow-lg shadow-red-500/30 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Lock className="h-4 w-4" /> Lock
              </button>
            </div>
          </div>

          <div className={glass(dark, 'p-6 text-left flex flex-col justify-between')}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest opacity-60">
                  Parking Occupancy
                </p>
                <h3 className="tracking-tight">
                  {parkingUsed} <span className="opacity-50">/ {parkingTotal} slots</span>
                </h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  pct >= 90
                    ? 'bg-red-500/15 text-red-500'
                    : pct >= 70
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-emerald-500/15 text-emerald-500'
                }`}
              >
                {pct >= 90 ? 'Critical' : pct >= 70 ? 'Nearly Full' : 'Available'}
              </span>
            </div>
            <div
              className={`h-4 w-full overflow-hidden rounded-full ${dark ? 'bg-white/5' : 'bg-blue-100/50 shadow-inner'}`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${
                  pct >= 90
                    ? 'bg-linear-to-r from-red-500 to-rose-500'
                    : pct >= 70
                      ? 'bg-linear-to-r from-amber-400 to-orange-500'
                      : 'bg-linear-to-r from-emerald-400 to-blue-500'
                }`}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs opacity-60">Total</p>
                <p>{parkingTotal}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Used</p>
                <p>{parkingUsed}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Free</p>
                <p>{parkingTotal - parkingUsed}</p>
              </div>
            </div>
            {parkingError ? <p className="mt-3 text-xs text-red-500">{parkingError}</p> : null}
            <div className="mt-3 w-full flex justify-end">
              <button
                className=" text-xs text-blue-500 flex gap-1 items-center hover:underline"
                onClick={() => navigate('/parking')}
              >
                <span>View Details</span> <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className={glass(dark, 'overflow-hidden lg:col-span-2')}>
          <div className="relative aspect-video w-full overflow-hidden bg-[radial-gradient(circle_at_30%_30%,#1f2937,#000)]">
            {cctvUrl ? (
              <iframe
                title="CCTV Feed"
                src={cctvUrl}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)',
              }}
            />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-white"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Live
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white">
              <Video className="h-3.5 w-3.5" /> CAM-01 · Main Gate
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <p className="text-[11px] uppercase tracking-widest opacity-60">Live Camera</p>
            <button
              onClick={openFullscreen}
              disabled={!cctvUrl}
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fullscreen <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={glass(dark, 'flex flex-col p-6 lg:col-span-3')}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest opacity-60">Access Trend</p>
              <h3 className="tracking-tight">Last 24 hours</h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="h-3.5 w-3.5" /> +12.4%
            </div>
          </div>
          <div className="h-56 min-h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardAccessGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={dark ? '#1f2937' : '#e5e7eb'}
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  stroke={dark ? '#64748b' : '#94a3b8'}
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                />
                <YAxis
                  stroke={dark ? '#64748b' : '#94a3b8'}
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: dark ? '#0b1226' : '#fff',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="access"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#dashboardAccessGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {loadingChart ? <p className="mt-3 text-xs opacity-60">Memuat trend 24 jam...</p> : null}
          {chartError ? <p className="mt-3 text-xs text-red-500">{chartError}</p> : null}
        </div>
      </div>

      <div className={glass(dark, 'p-6')}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="tracking-tight">Recent Access Activity</h3>
          <button
            type="button"
            onClick={() => navigate('/logs')}
            className="text-xs text-blue-500 hover:underline"
          >
            View all
          </button>
        </div>
        <div className="overflow-hidden rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className={dark ? 'text-slate-400' : 'text-slate-500'}>
              <tr className="text-[11px] uppercase tracking-wider">
                <th className="py-2 font-normal">User</th>
                <th className="py-2 font-normal">Role</th>
                <th className="py-2 font-normal">Action</th>
                <th className="py-2 font-normal">Method</th>
                <th className="py-2 font-normal">Status</th>
                <th className="py-2 font-normal">Notes</th>
                <th className="py-2 font-normal text-center">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {loadingLogs ? (
                <tr>
                  <td className="py-4 text-center opacity-70" colSpan={7}>
                    Memuat access logs...
                  </td>
                </tr>
              ) : logError ? (
                <tr>
                  <td className="py-4 text-center text-red-500/90" colSpan={7}>
                    {logError}
                  </td>
                </tr>
              ) : !recentLogs.length ? (
                <tr>
                  <td className="py-4 text-center opacity-70" colSpan={7}>
                    Belum ada data access log.
                  </td>
                </tr>
              ) : (
                recentLogs.map((entry) => {
                  const timestamp = entry?.created_at ? formatDate(entry.created_at) : '-';
                  const isSuccess = entry?.access_status === 'success';
                  return (
                    <tr key={entry.id} className="hover:bg-current/3">
                      <td className="py-3">{entry?.user?.full_name || '-'}</td>
                      <td className="py-3 opacity-70 capitalize">{entry?.user?.role || '-'}</td>
                      <td className="py-3 opacity-70 capitalize">{entry?.action || '-'}</td>
                      <td className="py-3 opacity-70 capitalize">{entry?.access_method || '-'}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                            isSuccess
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-red-500/15 text-red-500'
                          }`}
                        >
                          {entry?.access_status || '-'}
                        </span>
                      </td>
                      <td className="py-3 opacity-70">{entry?.notes || '-'}</td>
                      <td className="py-3 tabular-nums opacity-70 text-center">{timestamp}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function glass(dark, extra = '') {
  return `rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(2,8,40,0.25)] ${
    dark ? 'border-white/10 bg-white/4' : 'border-blue-200/50 bg-white/50 shadow-blue-500/5'
  } ${extra}`;
}

function toneBg(tone, dark) {
  const map = {
    blue: dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/15 text-blue-600',
    emerald: dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500/15 text-emerald-600',
    amber: dark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-500/15 text-amber-600',
    indigo: dark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-500/15 text-indigo-600',
    rose: dark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-500/15 text-rose-600',
  };
  return map[tone];
}
