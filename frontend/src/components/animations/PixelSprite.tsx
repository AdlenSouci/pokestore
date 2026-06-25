type SpriteKind = 'charizard' | 'blastoise' | 'pikachu';

interface PixelSpriteProps {
  kind: SpriteKind;
  size?: number;
  className?: string;
}

/** Sprites pixel art stylisés (inspirés GBA, pas assets officiels). */
export function PixelSprite({ kind, size = 64, className }: PixelSpriteProps) {
  if (kind === 'charizard') {
    return (
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
        style={{ imageRendering: 'pixelated' }}
      >
        <rect x="10" y="2" width="2" height="1" fill="#f97316" />
        <rect x="11" y="1" width="1" height="1" fill="#fbbf24" />
        <rect x="9" y="3" width="3" height="1" fill="#ea580c" />
        <rect x="8" y="4" width="5" height="2" fill="#fb923c" />
        <rect x="7" y="6" width="6" height="2" fill="#f97316" />
        <rect x="6" y="8" width="2" height="2" fill="#1a1a2e" />
        <rect x="8" y="8" width="1" height="1" fill="#fff" />
        <rect x="6" y="10" width="4" height="2" fill="#ea580c" />
        <rect x="10" y="9" width="3" height="2" fill="#c2410c" />
        <rect x="13" y="8" width="2" height="3" fill="#7c2d12" />
        <rect x="4" y="7" width="2" height="3" fill="#fb923c" />
        <rect x="2" y="5" width="2" height="2" fill="#fdba74" />
        <rect x="1" y="6" width="1" height="1" fill="#fbbf24" />
        <rect x="10" y="11" width="2" height="2" fill="#ea580c" />
        <rect x="5" y="12" width="2" height="2" fill="#c2410c" />
        <rect x="7" y="13" width="2" height="1" fill="#991b1b" />
        <rect x="14" y="6" width="1" height="2" fill="#fbbf24" />
        <rect x="15" y="5" width="1" height="1" fill="#ef4444" />
      </svg>
    );
  }

  if (kind === 'blastoise') {
    return (
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
        style={{ imageRendering: 'pixelated' }}
      >
        <rect x="1" y="7" width="2" height="2" fill="#60a5fa" />
        <rect x="13" y="7" width="2" height="2" fill="#60a5fa" />
        <rect x="0" y="8" width="1" height="1" fill="#93c5fd" />
        <rect x="15" y="8" width="1" height="1" fill="#93c5fd" />
        <rect x="3" y="5" width="10" height="6" fill="#3b82f6" />
        <rect x="4" y="4" width="8" height="1" fill="#2563eb" />
        <rect x="5" y="3" width="6" height="1" fill="#1d4ed8" />
        <rect x="5" y="6" width="2" height="2" fill="#1a1a2e" />
        <rect x="7" y="6" width="1" height="1" fill="#fff" />
        <rect x="9" y="6" width="2" height="2" fill="#1a1a2e" />
        <rect x="10" y="6" width="1" height="1" fill="#fff" />
        <rect x="4" y="11" width="8" height="2" fill="#2563eb" />
        <rect x="3" y="13" width="3" height="2" fill="#1d4ed8" />
        <rect x="10" y="13" width="3" height="2" fill="#1d4ed8" />
        <rect x="6" y="8" width="4" height="3" fill="#bfdbfe" opacity="0.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="5" y="2" width="6" height="2" fill="#fbbf24" />
      <rect x="4" y="4" width="8" height="4" fill="#facc15" />
      <rect x="3" y="5" width="1" height="2" fill="#fbbf24" />
      <rect x="12" y="5" width="1" height="2" fill="#fbbf24" />
      <rect x="6" y="5" width="2" height="2" fill="#1a1a2e" />
      <rect x="7" y="5" width="1" height="1" fill="#fff" />
      <rect x="8" y="6" width="2" height="1" fill="#1a1a2e" />
      <rect x="5" y="8" width="6" height="3" fill="#eab308" />
      <rect x="4" y="11" width="2" height="2" fill="#ca8a04" />
      <rect x="10" y="11" width="2" height="2" fill="#ca8a04" />
      <rect x="2" y="3" width="2" height="1" fill="#ef4444" />
      <rect x="12" y="3" width="2" height="1" fill="#ef4444" />
      <rect x="13" y="9" width="2" height="1" fill="#854d0e" />
    </svg>
  );
}
