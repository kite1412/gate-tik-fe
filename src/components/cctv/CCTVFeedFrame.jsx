export function CCTVFeedFrame({ title, src, className = '', interactive = true }) {
  return (
    <iframe
      title={title}
      src={src}
      className={`absolute inset-0 block h-full w-full border-0 ${className}`}
      style={{ overflow: 'hidden' }}
      scrolling="no"
      allow="camera *; microphone *; autoplay *; fullscreen *"
      allowFullScreen
      referrerPolicy="no-referrer"
      tabIndex={interactive ? 0 : -1}
    />
  );
}
