import { ArrowUpRight, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

export default function CCTVPage() {
  const { dark } = useTheme();
  const openFullscreen = () => {
    if (!cctvUrl) return;
    window.open(cctvUrl, '_blank', 'noopener,noreferrer');
  };
  const cctvUrl = import.meta.env.VITE_API_CCTV_URL;

  return (
    <div className="space-y-2">
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
  );
}

function glass(dark, extra = '') {
  return `rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(2,8,40,0.25)] ${
    dark ? 'border-white/10 bg-white/4' : 'border-blue-200/50 bg-white/50 shadow-blue-500/5'
  } ${extra}`;
}
