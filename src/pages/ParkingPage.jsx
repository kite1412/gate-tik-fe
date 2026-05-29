import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Car, Settings2, Users, LocateFixed } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useGateControl } from '../hooks/useGateControl';
import { useParkingQuota } from '../hooks/useParkingQuota';

export default function ParkingPage() {
  const { dark } = useTheme();
  const { parkingQuota, loading, error, updateParkingQuota } = useParkingQuota();
  const { fetchMainGate, updateGate } = useGateControl();
  const [quota, setQuota] = useState(parkingQuota?.total_slots ?? 0);
  const [autoBlock, setAutoBlock] = useState(parkingQuota?.auto_restrict_student ?? true);
  const [saving, setSaving] = useState(false);
  const [allowedRadius, setAllowedRadius] = useState(0);
  const [radiusSaving, setRadiusSaving] = useState(false);
  const [radiusError, setRadiusError] = useState('');
  const radiusSteps = [0, 25, 50, 100, 200];

  const used = parkingQuota?.used_slots ?? 0;
  const pct = quota > 0 ? Math.round((used / quota) * 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuota(parkingQuota?.total_slots ?? 0);
      setAutoBlock(parkingQuota?.auto_restrict_student ?? true);
    }, 0);

    return () => clearTimeout(timer);
  }, [parkingQuota]);

  useEffect(() => {
    const loadGateRadius = async () => {
      setRadiusError('');
      try {
        const data = await fetchMainGate();
        if (data?.allowed_radius_meter !== undefined && data?.allowed_radius_meter !== null) {
          setAllowedRadius(Number(data.allowed_radius_meter));
        }
      } catch (err) {
        setRadiusError(err?.message || 'Failed to load gate radius.');
      }
    };

    loadGateRadius();
  }, [fetchMainGate]);

  const stats = useMemo(
    () => [
      { label: 'Total', val: quota },
      { label: 'Used', val: used },
      { label: 'Free', val: Math.max(quota - used, 0) },
    ],
    [quota, used],
  );

  const saveSettings = async () => {
    setSaving(true);
    try {
      await updateParkingQuota({
        total_slots: quota,
        // auto_restrict_student: autoBlock,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAutoBlock = async () => {
    const next = !autoBlock;
    setAutoBlock(next);
    setSaving(true);
    try {
      await updateParkingQuota({
        // total_slots: quota,
        auto_restrict_student: next,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateAllowedRadius = async (value) => {
    setRadiusSaving(true);
    try {
      await updateGate({ allowed_radius_meter: value });
    } finally {
      setRadiusSaving(false);
    }
  };

  const onRadiusChange = (event) => {
    const value = Number(event.target.value);
    setAllowedRadius(value);
    updateAllowedRadius(value);
  };

  const radiusTrackClass =
    allowedRadius === 0
      ? 'bg-blue-500/40'
      : 'bg-linear-to-r from-red-500/70 via-amber-400/70 to-emerald-500/70';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={glass(dark, 'p-6')}>
          <p className="text-[11px] uppercase tracking-widest opacity-60">Student Capacity</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="number"
              min={0}
              value={quota}
              onChange={(event) => setQuota(Number(event.target.value))}
              className={`w-full rounded-xl border bg-transparent px-3 py-2 text-2xl outline-none transition focus-within:border-blue-400 ${
                dark ? 'border-white/10' : 'border-blue-200'
              }`}
            />
            <button
              onClick={saveSettings}
              disabled={saving || loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <p className="mt-2 text-xs opacity-60">Maximum student vehicles allowed</p>
          {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
        </div>

        <div className={glass(dark, 'p-6 lg:col-span-2')}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest opacity-60">Occupancy</p>
            <span className="text-sm">
              {used} / {quota} ({pct}%)
            </span>
          </div>
          <div
            className={`h-6 w-full overflow-hidden rounded-full ${
              dark ? 'bg-white/5' : 'bg-blue-100/50 shadow-inner'
            }`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              className={`h-full rounded-full ${
                pct >= 90
                  ? 'bg-linear-to-r from-red-500 to-rose-500'
                  : pct >= 70
                    ? 'bg-linear-to-r from-amber-400 to-orange-500'
                    : 'bg-linear-to-r from-emerald-400 to-blue-500'
              }`}
            />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className={`rounded-xl border p-3 text-center ${
                  dark ? 'border-white/10' : 'border-blue-200/50 bg-white/40 shadow-sm'
                }`}
              >
                <p className="text-xs opacity-60">{item.label}</p>
                <p className="text-xl tracking-tight">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={glass(dark, 'p-6')}>
        <h3 className="mb-3 tracking-tight">Settings</h3>
        <div className="space-y-3">
          <div
            className={`flex items-center justify-between rounded-xl border p-4 ${
              dark ? 'border-white/10 bg-white/5' : 'border-blue-200/50 bg-white/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings2 className="h-4 w-4" />
              <div>
                <p>Auto Restriction</p>
                <p className="text-xs opacity-60">
                  Block student access automatically when parking is full
                </p>
              </div>
            </div>
            <button
              onClick={toggleAutoBlock}
              disabled={saving || loading}
              className={`relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-70 ${
                autoBlock
                  ? 'bg-blue-600 shadow-md shadow-blue-500/30'
                  : dark
                    ? 'bg-white/10'
                    : 'bg-blue-200/50 shadow-inner'
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                  autoBlock ? 'left-[1.4rem]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          <div
            className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              dark ? 'border-white/10 bg-white/5' : 'border-blue-200/50 bg-white/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <LocateFixed className="h-4 w-4" />
              <div>
                <p>Allowed Radius Meter</p>
                <p className="text-xs opacity-60">
                  Define the radius within which students can access parking
                </p>
                <p className="text-xs opacity-60">
                  {allowedRadius === 0
                    ? 'Disabled (0 meter)'
                    : `Current radius: ${allowedRadius} meter`}
                </p>
                {radiusError ? <p className="text-xs text-red-500">{radiusError}</p> : null}
              </div>
            </div>

            <div className="w-full sm:w-44">
              <div className={`relative h-2 w-full rounded-full ${radiusTrackClass}`}>
                <div className="absolute inset-0 grid grid-cols-5 px-1">
                  {radiusSteps.map((step) => (
                    <span key={step} className="flex items-center justify-center">
                      <span
                        className={`h-2 w-2 rounded-full border ${
                          allowedRadius === step
                            ? 'bg-white border-white'
                            : dark
                              ? 'border-white/40 bg-transparent'
                              : 'border-blue-200 bg-transparent'
                        }`}
                      />
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1 text-[10px]">
                {radiusSteps.map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => onRadiusChange({ target: { value: step } })}
                    disabled={radiusSaving}
                    className={`rounded-md px-1 py-0.5 transition ${
                      allowedRadius === step
                        ? 'bg-blue-600 text-white'
                        : dark
                          ? 'text-white/60 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={glass(dark, 'p-6')}>
        <h3 className="mb-3 tracking-tight">Parking Notes</h3>
        <div className="space-y-3">
          <div
            className={`rounded-xl border p-4 ${
              dark ? 'border-white/10 bg-white/5' : 'border-blue-200/50 bg-white/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <Car className="mt-0.5 h-5 w-5 text-blue-500" />
              <div>
                <p className={dark ? 'font-medium text-slate-100' : 'font-medium text-slate-800'}>
                  Student Quota System
                </p>
                <p className="mt-1 text-sm opacity-70">
                  Parking slots are limited for students based on the capacity quota. Auto
                  restriction will block student access when full.
                </p>
              </div>
            </div>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              dark ? 'border-white/10 bg-white/5' : 'border-blue-200/50 bg-white/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-emerald-500" />
              <div>
                <p className={dark ? 'font-medium text-slate-100' : 'font-medium text-slate-800'}>
                  Staff & Admin Access
                </p>
                <p className="mt-1 text-sm opacity-70">
                  Staff and admin have unlimited parking access and are not subject to capacity
                  restrictions.
                </p>
              </div>
            </div>
          </div>
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
