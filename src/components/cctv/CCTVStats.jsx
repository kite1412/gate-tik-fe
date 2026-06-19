import { Wifi, WifiOff } from 'lucide-react';
import { glass } from '../../utils/glass';

export function CCTVStats({ dark, onlineCount, offlineCount }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className={glass(dark, 'flex items-center gap-3 px-5 py-4')}>
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            dark ? 'bg-emerald-500/10' : 'bg-emerald-50'
          }`}
        >
          <Wifi className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs opacity-50">Online</p>
          <p className="text-lg font-semibold leading-tight tracking-tight">{onlineCount} Kamera</p>
        </div>
      </div>

      <div className={glass(dark, 'flex items-center gap-3 px-5 py-4')}>
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            dark ? 'bg-slate-500/10' : 'bg-slate-100'
          }`}
        >
          <WifiOff className="h-5 w-5 text-slate-400" />
        </div>
        <div>
          <p className="text-xs opacity-50">Offline</p>
          <p className="text-lg font-semibold leading-tight tracking-tight">{offlineCount} Kamera</p>
        </div>
      </div>
    </div>
  );
}
