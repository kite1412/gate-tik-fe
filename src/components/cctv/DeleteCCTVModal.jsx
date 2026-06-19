import { Trash2, X } from 'lucide-react';
import { Modal } from '../users/Modal';

export function DeleteCCTVModal({ dark, open, camera, onClose, onConfirm, loading, error }) {
  if (!open || !camera) return null;

  return (
    <Modal onClose={onClose}>
      <div className={glass(dark, 'w-full max-w-md p-6')}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="tracking-tight">Hapus Kamera</h2>
            <p className="mt-2 text-sm opacity-60">
              Yakin ingin menghapus <strong>{camera.camera_name}</strong>?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`grid h-8 w-8 place-items-center rounded-lg border ${
              dark ? 'border-white/10 bg-white/5' : 'border-slate-200/80 bg-white/85'
            }`}
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm ${
              dark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-900'
            }`}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? 'Menghapus...' : 'Hapus'}
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
