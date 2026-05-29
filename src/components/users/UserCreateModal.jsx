import { useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';

export function UserCreateModal({ dark, open, onClose, onCreate }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    npm_nip: '',
    phone_number: '',
    role: 'mahasiswa',
    status: 'pending',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onCreate({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        npm_nip: form.npm_nip,
        phone_number: form.phone_number || null,
        role: form.role,
        status: form.status,
      });
      setForm({
        full_name: '',
        email: '',
        password: '',
        npm_nip: '',
        phone_number: '',
        role: 'mahasiswa',
        status: 'pending',
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal membuat user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className={glass(dark, 'w-full p-6')}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="tracking-tight">Create New User</h2>
            <p className="text-sm opacity-60">Masukkan data user baru.</p>
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

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Full Name"
              value={form.full_name}
              onChange={handleChange('full_name')}
              dark={dark}
              required
            />
            <InputField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              dark={dark}
              required
            />
            <InputField
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              dark={dark}
              required
            />
            <InputField
              label="NPM/NIP"
              value={form.npm_nip}
              onChange={handleChange('npm_nip')}
              dark={dark}
              required
            />
            <InputField
              label="Phone"
              value={form.phone_number}
              onChange={handleChange('phone_number')}
              dark={dark}
            />
            <SelectField
              label="Role"
              value={form.role}
              onChange={handleChange('role')}
              options={['admin', 'staff', 'mahasiswa']}
              dark={dark}
            />
            <SelectField
              label="Status"
              value={form.status}
              onChange={handleChange('status')}
              options={['pending', 'active', 'suspended']}
              dark={dark}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm text-white shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </Modal>
  );
}

function InputField({ label, value, onChange, dark, type = 'text', required = false }) {
  return (
    <label className="space-y-1 text-sm flex flex-col gap-1">
      <span className="text-xs uppercase tracking-widest opacity-60 pl-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
          dark
            ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30'
            : 'border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400'
        }`}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, dark }) {
  return (
    <label className="space-y-1 text-sm flex flex-col gap-1">
      <span className="text-xs uppercase tracking-widest opacity-60 pl-1">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none capitalize ${
          dark
            ? 'border-white/10 bg-white/5 text-white'
            : 'border-slate-200 bg-white/90 text-slate-900'
        }`}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className={dark ? 'bg-slate-900/70 text-white' : 'bg-white text-slate-900'}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function glass(dark, extra = '') {
  return `rounded-2xl border  ${
    dark
      ? 'border-white/10 bg-[#071230]/60 backdrop-blur-sm shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)]'
      : 'border-white/75 bg-white/50 backdrop-blur-sm shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)]'
  } ${extra}`;
}
