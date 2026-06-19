export const CCTV_GRADIENTS = [
  ['#0f1d3a', '#0a3060'],
  ['#1a1040', '#2d1b69'],
  ['#0a2e1a', '#0f4c2a'],
  ['#2a0a0a', '#4a1010'],
  ['#1a2a0a', '#2a4010'],
  ['#2a1a0a', '#4a3010'],
];

export function normalizePath(path = '') {
  return String(path || '').trim().replace(/^\/+|\/+$/g, '');
}

export function normalizeCctvItem(item = {}, index = 0) {
  return {
    id: item.id ?? null,
    camera_name: item.camera_name || '',
    path: normalizePath(item.path),
    stream_url: item.stream_url || '',
    is_active: Boolean(item.is_active),
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
    is_active: Boolean(form.is_active),
  };
}

export function buildCctvFeedUrl(path = '') {
  const rawBase = import.meta.env.VITE_API_CCTV_URL || '';
  const normalizedPath = normalizePath(path);

  if (!rawBase) return '';

  const trimmedBase = rawBase.replace(/\/+$/, '');
  if (!normalizedPath) return trimmedBase;

  try {
    const parsed = new URL(trimmedBase);
    return `${parsed.origin}/${normalizedPath}`;
  } catch {
    return `${trimmedBase}/${normalizedPath}`;
  }
}

export function truncateText(text = '', max = 42) {
  const value = String(text || '');
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export function formatShortDate(value) {
  if (!value) return '-';
  return String(value).split('T')[0] || '-';
}
