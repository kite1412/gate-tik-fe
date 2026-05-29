import { X } from 'lucide-react';
import { Modal } from './Modal';

export function ConfirmDeleteModal({ dark, open, user, onClose, onConfirm, loading, error }) {
  if (!open || !user) return null;

  return (
    <Modal onClose={onClose}>
      <div className={glass(dark, 'w-full max-w-md p-6')}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="tracking-tight">Delete User</h2>
            <p className="mt-2 text-sm opacity-60">
              Yakin mau hapus user <strong>{user.full_name}</strong>?
            </p>
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
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm ${
              dark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-900'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function glass(dark, extra = '') {
  return `rounded-2xl border  ${
    dark
      ? 'border-white/10 bg-[#071230]/60 backdrop-blur-sm shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)]'
      : 'border-white/75 bg-white/50 backdrop-blur-sm shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)]'
  } ${extra}`;
}
