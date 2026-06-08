export function LoadingIndicator({
  label = 'Memuat...',
  size = 'sm',
  className = '',
  textClassName = '',
}) {
  const sizeMap = {
    sm: 'h-3.5 w-3.5 border-2',
    md: 'h-4 w-4 border-2',
    lg: 'h-5 w-5 border-[3px]',
  };
  const spinnerSize = sizeMap[size] ?? sizeMap.sm;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`inline-block rounded-full border-current/30 border-t-current ${spinnerSize} animate-spin`}
        aria-hidden="true"
      />
      <span className={textClassName}>{label}</span>
    </span>
  );
}
