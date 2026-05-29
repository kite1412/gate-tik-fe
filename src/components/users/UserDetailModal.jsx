import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';
import { formatDate } from '../../utils/formatDate';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function UserDetailModal({ dark, open, onClose, user, token }) {
  const [ktmUrl, setKtmUrl] = useState('');
  const [loadingKtm, setLoadingKtm] = useState(false);
  const [error, setError] = useState('');
  const ktmUrlRef = useRef('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!open || !user || user.role !== 'mahasiswa') {
        setKtmUrl('');
        setError('');
        setLoadingKtm(false);
        return;
      }

      try {
        setLoadingKtm(true);
        setError('');
        const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/ktm`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'image/*',
          },
        });
        if (!response.ok) {
          throw new Error('KTM not found');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (ktmUrlRef.current) {
          URL.revokeObjectURL(ktmUrlRef.current);
        }
        ktmUrlRef.current = url;
        setKtmUrl(url);
      } catch (err) {
        setError(err?.message || 'Gagal memuat KTM.');
      } finally {
        setLoadingKtm(false);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (ktmUrlRef.current) {
        URL.revokeObjectURL(ktmUrlRef.current);
        ktmUrlRef.current = '';
      }
    };
  }, [open, user, token]);

  if (!open || !user) return null;

  return (
    <Modal onClose={onClose}>
      <div className={glass(dark, 'w-full p-6')}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="tracking-tight">User Detail</h2>
            <p className="text-sm opacity-60">Detail informasi user.</p>
          </div>
          <button
            onClick={onClose}
            className={`grid h-8 w-8 place-items-center rounded-lg border ${
              dark ? 'border-white/10 bg-white/5' : 'border-slate-200/80 bg-white/85'
            }`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <DetailRow label="Full Name" value={user.full_name} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="NPM/NIP" value={user.npm_nip} />
          <DetailRow label="Phone" value={user.phone_number || '-'} />
          <DetailRow label="Role" value={user.role} className="capitalize" />
          <DetailRow label="Status" value={user.status} className="capitalize" />
          <DetailRow
            label="Registered"
            value={user.created_at ? formatDate(user.created_at) : '-'}
          />
          <DetailRow
            label="Last Login"
            value={user.last_login_at ? formatDate(user.last_login_at) : '-'}
          />
        </div>

        {user.role === 'mahasiswa' ? (
          <div className="mt-5 space-y-2">
            <p className="text-xs uppercase tracking-widest opacity-60">KTM Preview</p>
            <div className="overflow-hidden rounded-xl border border-current/10">
              {loadingKtm ? (
                <div className="flex h-64 items-center justify-center text-sm opacity-60">
                  Loading KTM...
                </div>
              ) : error ? (
                <div className="flex h-64 items-center justify-center text-sm text-red-500">
                  {error}
                </div>
              ) : ktmUrl ? (
                <img src={ktmUrl} alt="KTM Preview" className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm opacity-60">
                  KTM not found
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function DetailRow({ label, value, className = '' }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-current/10 pb-2 text-sm">
      <span className="text-xs uppercase tracking-widest opacity-60">{label}</span>
      <span className={`text-right ${className}`}>{value}</span>
    </div>
  );
}

function glass(dark, extra = '') {
  return `rounded-2xl border  ${
    dark
      ? 'border-white/10 bg-[#071230]/60 backdrop-blur-sm shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)]'
      : 'border-white/75 bg-white/50 backdrop-blur-sm shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)]'
  } ${extra}`;
}
