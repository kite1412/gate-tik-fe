export const CCTV_GRADIENTS = [
  ['#0f1d3a', '#0a3060'],
  ['#1a1040', '#2d1b69'],
  ['#0a2e1a', '#0f4c2a'],
  ['#2a0a0a', '#4a1010'],
  ['#1a2a0a', '#2a4010'],
  ['#2a1a0a', '#4a3010'],
];

export const CCTV_TYPES = ['monitor', 'intercom'];

export const CCTV_TYPE_LABELS = {
  monitor: 'Monitor',
  intercom: 'Interkom',
};

export function normalizePath(path = '') {
  return String(path || '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
}

export function normalizeCctvType(type = 'monitor') {
  return CCTV_TYPES.includes(type) ? type : 'monitor';
}

export function formatCctvType(type = 'monitor') {
  return CCTV_TYPE_LABELS[normalizeCctvType(type)];
}

export function normalizeCctvItem(item = {}, index = 0) {
  return {
    id: item.id ?? null,
    camera_name: item.camera_name || '',
    path: normalizePath(item.path),
    stream_url: item.stream_url || '',
    type: normalizeCctvType(item.type),
    created_at: item.created_at ?? null,
    updated_at: item.updated_at ?? null,
    _gradient: CCTV_GRADIENTS[index % CCTV_GRADIENTS.length],
  };
}

export function toCctvPayload(form = {}) {
  return {
    camera_name: String(form.camera_name || '').trim(),
    path: normalizePath(form.path),
    stream_url: String(form.stream_url || '').trim(),
    type: normalizeCctvType(form.type),
  };
}

export function buildCctvFeedUrl(cameraOrPath = '') {
  const rawBase = import.meta.env.VITE_GO2RTC_URL || '';
  const camera =
    typeof cameraOrPath === 'object' ? cameraOrPath : { path: cameraOrPath, type: 'monitor' };

  const path = normalizePath(camera.path);
  if (!rawBase || !path) return '';

  const base = rawBase.replace(/\/+$/, '');

  if (camera.type === 'intercom') {
    return `${base}/webrtc.html?src=${encodeURIComponent(path)}&media=video+audio+microphone`;
  }

  return `${base}/stream.html?src=${encodeURIComponent(path)}&mode=webrtc`;
}

export function truncateText(text = '', max = 42) {
  const value = String(text || '');
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export function formatShortDate(value) {
  if (!value) return '-';
  return String(value).split('T')[0] || '-';
}
