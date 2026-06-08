import { Filter, Search } from 'lucide-react';

const roles = ['all', 'admin', 'staff', 'mahasiswa'];
const statuses = ['all', 'pending', 'active', 'suspended'];
const roleLabels = {
  all: 'Semua',
  admin: 'Admin',
  staff: 'Staf',
  mahasiswa: 'Mahasiswa',
};
const statusLabels = {
  all: 'Semua',
  pending: 'Menunggu',
  active: 'Aktif',
  suspended: 'Ditangguhkan',
};

export function UsersFilters({
  dark,
  query,
  onQueryChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
}) {
  return (
    <div className={glass(dark, 'p-4')}>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 ${
            dark
              ? 'border-white/10 bg-white/5 focus-within:border-blue-400'
              : 'border-blue-200 bg-white/50 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-inner'
          }`}
        >
          <Search className={`h-4 w-4 ${dark ? 'opacity-60' : 'text-blue-900/40'}`} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari nama, email, NPM/NIP, atau telepon..."
            className={`w-full bg-transparent text-sm outline-none ${
              dark ? 'placeholder:text-white/30' : 'placeholder:text-blue-900/40 text-slate-800'
            }`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className={`h-4 w-4 ${dark ? 'opacity-60' : 'text-blue-900/40'}`} />
          {roles.map((value) => (
            <button
              key={value}
              onClick={() => onRoleChange(value)}
              className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                role === value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : dark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                    : 'bg-blue-100/50 hover:bg-blue-100 text-blue-900/70'
              }`}
            >
              {roleLabels[value] ?? value}
            </button>
          ))}
          {statuses.map((value) => (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                status === value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : dark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                    : 'bg-emerald-100/60 hover:bg-emerald-100 text-emerald-900/70'
              }`}
            >
              {statusLabels[value] ?? value}
            </button>
          ))}
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
