export default function FancyButton({ text }) {
  return (
    <button
      className={`relative px-6 py-3 font-medium text-white transition-all duration-300 rounded-lg shadow-md 
      bg-[var(--color-primary-500)] 
      hover:bg-[var(--color-primary-600)] 
      active:scale-95 
      disabled:opacity-60 
      disabled:pointer-events-none
      overflow-hidden`}
    >
      <span className="absolute inset-0 w-full h-full transform scale-0 opacity-30 transition-all duration-300 
        bg-[var(--color-primary-300)] 
        rounded-lg group-hover:scale-100 
        peer-hover:scale-100"></span>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {text}
      </span>
    </button>
  );
}