interface Props {
  className?: string;
  size?: number;
}

export function PokeballIcon({ className, size = 28 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#1a1a2e" strokeWidth="5" />
      <path d="M4 50 A46 46 0 0 1 96 50 Z" fill="#ef4444" stroke="#1a1a2e" strokeWidth="5" />
      <rect x="4" y="46" width="92" height="8" fill="#1a1a2e" />
      <circle cx="50" cy="50" r="14" fill="#fff" stroke="#1a1a2e" strokeWidth="5" />
      <circle cx="50" cy="50" r="6" fill="#fff" stroke="#1a1a2e" strokeWidth="3" />
    </svg>
  );
}
