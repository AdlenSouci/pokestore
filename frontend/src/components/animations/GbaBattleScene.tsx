import dracImg from '../../assets/drac.png';
import tortankImg from '../../assets/tortank.png';

interface BattleSpriteProps {
  src: string;
  alt: string;
  size: number;
  flip?: boolean;
  className?: string;
}

function BattleSprite({ src, alt, size, flip = false, className = '' }: BattleSpriteProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] ${className}`}
      style={{
        imageRendering: 'pixelated',
        width: size,
        height: size,
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
      draggable={false}
    />
  );
}

interface GbaBattleSceneProps {
  variant?: 'compact' | 'hero';
  className?: string;
}

export function GbaBattleScene({ variant = 'compact', className = '' }: GbaBattleSceneProps) {
  const isHero = variant === 'hero';
  const spriteSize = isHero ? 96 : 52;

  return (
    <div
      className={`relative battle-scanline overflow-hidden rounded-xl border-2 border-[#1a1a2e] bg-gradient-to-b from-[#7ec8a3]/40 via-[#5a4f99]/20 to-[#2d3561]/60 shadow-inner ${isHero ? 'px-6 py-5 md:px-10 md:py-8' : 'px-3 py-2'} ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#166534]/40 to-transparent" />
        <div className="absolute top-2 right-4 w-16 h-8 rounded-full bg-white/10 blur-md" />
      </div>

      {isHero && (
        <p className="relative z-10 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#7ec8a3] mb-4 pixel-font">
          Combat GBA
        </p>
      )}

      <div
        className={`relative z-10 flex items-end justify-between ${isHero ? 'gap-8 md:gap-16 min-h-[90px] md:min-h-[130px]' : 'gap-4 min-h-[52px]'}`}
      >
        {/* Dracaufeu (gauche, face à droite) */}
        <div className="flex flex-col items-start gap-1">
          <div
            className={`${isHero ? 'w-28 md:w-36' : 'w-16'} h-2 rounded-sm bg-[#1a1a2e]/80 border border-[#7ec8a3]/40 overflow-hidden animate-hp-pulse`}
          >
            <div className="h-full w-[72%] bg-gradient-to-r from-[#f97316] to-[#ef4444] rounded-sm" />
          </div>
          {!isHero && (
            <span className="text-[8px] font-bold text-[#fb923c] uppercase tracking-wide">Dracaufeu</span>
          )}
          <div className="relative animate-battle-left">
            <BattleSprite src={dracImg} alt="Dracaufeu" size={spriteSize} />
            <div className={`absolute ${isHero ? '-right-8 top-2' : '-right-4 top-1'} animate-flame-burst`}>
              <span className={`block ${isHero ? 'text-2xl' : 'text-sm'}`}>🔥</span>
            </div>
          </div>
        </div>

        {/* VS */}
        <div className={`flex flex-col items-center justify-center ${isHero ? 'pb-6' : 'pb-2'}`}>
          <span
            className={`pixel-font text-[#fbbf24] drop-shadow-md ${isHero ? 'text-lg md:text-xl animate-pokeball-wiggle' : 'text-[10px]'}`}
          >
            VS
          </span>
          {isHero && (
            <span className="text-[9px] text-[#a5b4fc]/80 mt-1 font-sans uppercase tracking-wider">
              Lance-Flammes · Hydrocanon
            </span>
          )}
        </div>

        {/* Tortank (droite, face à gauche — image déjà retournée) */}
        <div className="flex flex-col items-end gap-1">
          <div
            className={`${isHero ? 'w-28 md:w-36' : 'w-16'} h-2 rounded-sm bg-[#1a1a2e]/80 border border-[#7ec8a3]/40 overflow-hidden animate-hp-pulse`}
          >
            <div className="h-full w-[85%] bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-sm ml-auto" />
          </div>
          {!isHero && (
            <span className="text-[8px] font-bold text-[#60a5fa] uppercase tracking-wide">Tortank</span>
          )}
          <div className="relative animate-battle-right">
            <BattleSprite src={tortankImg} alt="Tortank" size={spriteSize} flip />
            <div className={`absolute ${isHero ? '-left-8 top-2' : '-left-4 top-1'} animate-water-burst`}>
              <span className={`block ${isHero ? 'text-2xl' : 'text-sm'}`}>💧</span>
            </div>
          </div>
        </div>
      </div>

      {isHero && (
        <div className="relative z-10 mt-4 flex justify-center gap-2">
          {['Lance-Flammes', 'Hydrocanon', 'Éclats Glace'].map((move, i) => (
            <span
              key={move}
              className="px-2 py-1 rounded-md bg-[#1a1f3a]/80 border border-[#5a4f99]/50 text-[9px] md:text-[10px] font-bold text-[#c4b5fd] uppercase"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {move}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
