import logoSrc from '../assets/logo.png';

const HEIGHTS = {
  nav: 52,
  sm: 80,
  md: 100,
  lg: 128,
  hero: 200,
} as const;

const RADIUS = {
  nav: 10,
  sm: 12,
  md: 14,
  lg: 16,
  hero: 20,
} as const;

export type LogoSize = keyof typeof HEIGHTS;

export type LogoProps = {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  'aria-label'?: string;
};

export function Logo({
  size = 'md',
  showText = false,
  className = '',
  imageClassName = '',
  onClick,
  'aria-label': ariaLabel = 'PokéStore',
}: LogoProps) {
  const height = HEIGHTS[size];
  const radius = RADIUS[size];

  const img = (
    <img
      src={logoSrc}
      alt="PokéStore"
      className={`block w-auto max-w-none object-contain shrink-0 ${imageClassName}`}
      style={{ height, borderRadius: radius }}
      decoding="async"
    />
  );

  const content = (
    <>
      {img}
      {showText && (
        <span className="pixel-font text-lg md:text-2xl text-white tracking-tighter whitespace-nowrap">
          PokéStore
        </span>
      )}
    </>
  );

  const baseClass = `inline-flex items-center gap-2 ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} cursor-pointer hover:opacity-95 transition-opacity text-left`}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={baseClass} aria-label={ariaLabel}>
      {content}
    </div>
  );
}
