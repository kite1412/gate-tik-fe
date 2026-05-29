import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Moon, Sun, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../hooks/useTheme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dark, toggle } = useTheme();
  const isMobile = useMediaQuery('(max-width: 640px)');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onToggleDark = () => toggle();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${
        dark
          ? 'bg-linear-to-br from-[#06122b] via-[#0a1f4d] to-[#020617] text-white'
          : 'bg-linear-to-br from-[#e0e7ff] via-[#eff6ff] to-[#dbeafe] text-slate-900'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${dark ? 'opacity-30' : 'opacity-20'}`}
        style={{
          backgroundImage: dark
            ? 'linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)'
            : 'linear-gradient(rgba(37,99,235,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.2) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      <motion.div
        className={`pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl ${
          dark ? 'bg-blue-500/30' : 'bg-blue-400/40'
        }`}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className={`pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl ${
          dark ? 'bg-indigo-500/30' : 'bg-blue-500/30'
        }`}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <button
        onClick={onToggleDark}
        className={`absolute right-5 top-5 z-50 rounded-full border p-2.5 backdrop-blur-md transition ${
          dark
            ? 'border-white/15 bg-white/5 hover:bg-white/10'
            : 'border-blue-200/50 bg-white/50 text-blue-800 hover:bg-white/80 shadow-sm'
        }`}
        aria-label="toggle theme"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative z-0 flex min-h-screen items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} rounded-3xl border p-8 backdrop-blur-2xl ${
            dark
              ? 'border-white/15 bg-white/6 shadow-[0_20px_60px_-15px_rgba(2,8,40,0.7)]'
              : 'border-blue-200/60 bg-white/60 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)]'
          }`}
        >
          <div className="mb-7 flex flex-col items-center text-center">
            <div
              className={`mb-4 grid h-14 w-14 p-2 place-items-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg ${
                dark ? 'shadow-blue-500/40' : 'shadow-blue-500/30 text-white'
              }`}
            >
              <img src="/app-icon.svg" alt="Logo" />
            </div>
            <h1 className="tracking-tight">{import.meta.env.VITE_APP_NAME}</h1>
            <p className={`mt-1.5 text-sm ${dark ? 'text-white/60' : 'text-blue-900/60'}`}>
              Smart Gate & Monitoring System
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label="Email / NPM" dark={dark}>
              <input
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`w-full bg-transparent text-sm outline-none ${
                  dark
                    ? 'placeholder:text-white/30 text-white'
                    : 'placeholder:text-blue-900/30 text-slate-900'
                }`}
                placeholder="you@campus.edu"
                required
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password" dark={dark}>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full bg-transparent text-sm outline-none ${
                  dark
                    ? 'placeholder:text-white/30 text-white'
                    : 'placeholder:text-blue-900/30 text-slate-900'
                }`}
                placeholder="••••••••"
                required
              />
            </Field>

            {error ? (
              <p className={`text-sm ${dark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 text-white transition active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>Sign In</>
              )}
              <span
                className={`absolute inset-0 -translate-x-full transition group-hover:translate-x-0 ${
                  dark ? 'bg-white/15' : 'bg-white/20'
                }`}
              />
            </button>

            <p
              className={`pt-2 text-center text-xs ${dark ? 'text-white/50' : 'text-blue-900/50'}`}
            >
              Don't have an account?{' '}
              <a className={`hover:underline ${dark ? 'text-blue-300' : 'text-blue-600'}`} href="#">
                Register
              </a>
            </p>
            <p className={`text-center text-[11px] ${dark ? 'text-white/30' : 'text-blue-900/40'}`}>
              Hint: try <code>admin@</code>, <code>staff@</code>, or <code>student@</code>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ icon, label, children, dark }) {
  return (
    <label className="block">
      <span
        className={`mb-1.5 block text-xs uppercase tracking-wider ${
          dark ? 'text-white/50' : 'text-blue-900/50 font-medium'
        }`}
      >
        {label}
      </span>
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition ${
          dark
            ? 'border-white/15 bg-white/4 focus-within:border-blue-400/60 focus-within:bg-white/7 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] text-white/50'
            : 'border-blue-200/60 bg-white/50 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.1)] text-blue-900/50 shadow-inner'
        }`}
      >
        <span>{icon}</span>
        {children}
      </div>
    </label>
  );
}
