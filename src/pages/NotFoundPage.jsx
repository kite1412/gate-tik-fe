import { motion } from 'motion/react';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function NotFoundPage() {
  const { dark } = useTheme();
  const navigate = useNavigate();

  const onNavigateHome = () => navigate('/dashboard');

  return (
    <div className="relative min-h-[calc(100vh-120px)] px-4 py-8">
      <div
        className={`fixed inset-0 -z-10 ${
          dark
            ? 'bg-linear-to-br from-[#040816] via-[#071230] to-[#040816]'
            : 'bg-linear-to-br from-[#e6f0ff] via-[#f0f5ff] to-[#e0edff]'
        }`}
      />
      <div className="flex min-h-[calc(100vh-120px)] items-end justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-2xl"
        >
          <div className={glass(dark, 'p-8 text-center sm:p-12')}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mx-auto mb-6 flex items-center justify-center"
            >
              <div
                className={`relative flex h-28 w-28 items-center justify-center rounded-full sm:h-32 sm:w-32 ${
                  dark
                    ? 'bg-linear-to-br from-blue-600/20 to-indigo-600/20'
                    : 'bg-linear-to-br from-blue-100/80 to-indigo-100/80'
                }`}
              >
                <div
                  className={`absolute inset-4 rounded-full ${
                    dark
                      ? 'bg-linear-to-br from-blue-500/30 to-indigo-500/30'
                      : 'bg-linear-to-br from-blue-200/60 to-indigo-200/60'
                  }`}
                />
                <AlertTriangle
                  className={`relative z-10 h-10 w-10 sm:h-12 sm:w-12 ${
                    dark ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4"
            >
              <h1
                className={`mb-2 bg-linear-to-r ${
                  dark ? 'from-blue-400 to-indigo-400' : 'from-blue-600 to-indigo-600'
                } bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-8xl`}
              >
                404
              </h1>
              <h2 className={dark ? 'text-2xl text-slate-100' : 'text-2xl text-slate-900'}>
                Page Not Found
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={dark ? 'mb-8 text-base text-slate-400' : 'mb-8 text-base text-slate-600'}
            >
              The page you're looking for doesn't exist or has been moved.
              <br />
              Please check the URL or return to the dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                onClick={onNavigateHome}
                className={`group flex items-center gap-2 rounded-xl px-6 py-3 shadow-lg transition-all ${
                  dark
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30'
                    : 'bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-500/40'
                }`}
              >
                <Home className="h-4 w-4" />
                Back to Dashboard
              </button>

              <button
                onClick={() => window.history.back()}
                className={`group flex items-center gap-2 rounded-xl border px-6 py-3 transition-all ${
                  dark
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                    : 'border-blue-200/60 bg-white/60 text-blue-900 hover:border-blue-300/80 hover:bg-white hover:shadow-md hover:shadow-blue-500/10'
                }`}
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Go Back
              </button>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div
              className={`absolute left-1/2 top-1/2 h-128 w-lg -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
                dark ? 'bg-blue-600/10' : 'bg-blue-400/20'
              }`}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function glass(dark, extra = '') {
  return `rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(2,8,40,0.25)] ${
    dark ? 'border-white/10 bg-white/4' : 'border-blue-200/50 bg-white/50 shadow-blue-500/5'
  } ${extra}`;
}
