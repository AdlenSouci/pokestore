import { useMemo } from 'react';
import { PixelSprite } from './PixelSprite';

interface PokemonBackgroundProps {
  intensity?: 'subtle' | 'full';
}

export function PokemonBackground({ intensity = 'full' }: PokemonBackgroundProps) {
  const pokeballs = useMemo(
    () =>
      Array.from({ length: intensity === 'subtle' ? 4 : 8 }, (_, i) => ({
        top: `${(i * 23 + 8) % 85}%`,
        left: `${(i * 41 + 5) % 90}%`,
        delay: `${i * 1.8}s`,
        duration: `${12 + (i % 5) * 2}s`,
        scale: 0.6 + (i % 3) * 0.2,
      })),
    [intensity],
  );

  const stars = useMemo(
    () =>
      Array.from({ length: intensity === 'subtle' ? 12 : 30 }, (_, i) => ({
        top: `${(i * 37 + 11) % 100}%`,
        left: `${(i * 53 + 7) % 100}%`,
        delay: `${(i % 6) * 0.7}s`,
        duration: `${3 + (i % 4)}s`,
      })),
    [intensity],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden pokemon-bg-aurora" aria-hidden="true">
      {/* Nuages doux */}
      <div className="absolute top-[8%] left-[5%] w-32 h-12 rounded-full bg-white/5 blur-xl animate-poke-float" />
      <div className="absolute top-[18%] right-[10%] w-40 h-14 rounded-full bg-[#8b7ec8]/10 blur-2xl animate-poke-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-[25%] left-[15%] w-24 h-10 rounded-full bg-[#7ec8a3]/8 blur-xl animate-poke-float" style={{ animationDelay: '2.8s' }} />

      {/* Étoiles */}
      {stars.map((s, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white/50 rounded-full star-twinkle"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {/* Pokéballs flottantes */}
      {pokeballs.map((p, i) => (
        <div
          key={`ball-${i}`}
          className="absolute animate-poke-drift opacity-20"
          style={{
            top: p.top,
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `scale(${p.scale})`,
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#fff" stroke="#1a1a2e" strokeWidth="2" />
            <path d="M2 12 A10 10 0 0 1 22 12 Z" fill="#ef4444" />
            <rect x="2" y="10.5" width="20" height="3" fill="#1a1a2e" />
            <circle cx="12" cy="12" r="3.5" fill="#fff" stroke="#1a1a2e" strokeWidth="1.5" />
          </svg>
        </div>
      ))}

      {/* Pikachu qui traverse (discret) */}
      <div
        className="absolute bottom-[18%] opacity-[0.12] animate-poke-drift hidden sm:block"
        style={{ left: '8%', animationDuration: '22s', animationDelay: '3s' }}
      >
        <PixelSprite kind="pikachu" size={48} />
      </div>
      <div
        className="absolute top-[35%] opacity-[0.08] animate-poke-drift hidden md:block"
        style={{ right: '6%', animationDuration: '26s', animationDelay: '7s' }}
      >
        <PixelSprite kind="pikachu" size={36} />
      </div>

      {/* Herbe en bas (style route GBA) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24">
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
          <rect x="0" y="40" width="400" height="20" fill="#166534" opacity="0.35" />
          <rect x="0" y="48" width="400" height="12" fill="#14532d" opacity="0.45" />
          {Array.from({ length: 40 }, (_, i) => (
            <rect
              key={i}
              x={i * 10}
              y={38 + (i % 3) * 2}
              width="3"
              height={8 + (i % 4) * 3}
              fill="#22c55e"
              opacity={0.3 + (i % 5) * 0.08}
              className="animate-grass-sway"
              style={{ animationDelay: `${(i % 7) * 0.2}s`, transformOrigin: 'bottom' }}
            />
          ))}
        </svg>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1428]/30 via-transparent to-[#0f1428]/50" />
    </div>
  );
}
