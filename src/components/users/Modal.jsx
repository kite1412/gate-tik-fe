export function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog">
      <button
        type="button"
        className="absolute inset-0  backdrop-blur-[2px] "
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className="relative z-10 mx-auto w-full max-w-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
