import logoSrc from '../assets/logo.png';

const HEIGHTS = {
  nav: 40,
  sm: 56,
  md: 72,
  lg: 96,
  hero: 160,
} as const;

export type LogoSize = keyof typeof HEIGHTS;

export type LogoProps = {
  size?: LogoSize;
  /** Affiche « PokéStore » à côté — désactivé par défaut car le visuel contient déjà le nom */
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

  const content = (
    <>
      <img
        src={logoSrc}
        alt=""
        aria-hidden={showText}
        height={height}
        className={`w-auto object-contain shrink-0 drop-shadow-md ${imageClassName}`}
        style={{ height }}
      />
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
        className={`${baseClass} cursor-pointer hover:scale-[1.02] transition-transform text-left`}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClass} aria-label={ariaLabel}>{content}</div>;
}
