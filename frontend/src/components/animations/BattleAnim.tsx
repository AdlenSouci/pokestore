import dracImg from '../../assets/drac.png';
import tortankImg from '../../assets/tortank.png';

interface BattleAnimProps {
  size?: 'nav' | 'hero';
  className?: string;
}

export function BattleAnim({ size = 'nav', className = '' }: BattleAnimProps) {
  const isHero = size === 'hero';
  const sprite = isHero ? 88 : 44;
  const gap = isHero ? 16 : 4;

  return (
    <div
      className={`relative flex items-end justify-center overflow-hidden ${isHero ? 'h-32 md:h-40 w-full max-w-md mx-auto' : 'h-11 w-[130px]'} ${className}`}
      aria-hidden="true"
    >
      {/* Herbe */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#166534]/50 to-transparent" />

      {/* Dracaufeu — gauche, regarde à droite */}
      <div className="relative z-10 battle-drac" style={{ marginRight: gap }}>
        <img
          src={dracImg}
          alt=""
          width={sprite}
          height={sprite}
          className="object-contain drop-shadow-md"
          style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }}
          draggable={false}
        />
        <span className="battle-flame absolute -right-1 top-1 text-sm" aria-hidden="true">
          🔥
        </span>
      </div>

      {/* Effet central */}
      <div className="battle-clash absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="block w-2 h-2 rounded-full bg-white/80 battle-spark" />
      </div>

      {/* Tortank — droite, regarde à gauche (pas de flip) */}
      <div className="relative z-10 battle-tortank" style={{ marginLeft: gap }}>
        <img
          src={tortankImg}
          alt=""
          width={sprite}
          height={sprite}
          className="object-contain drop-shadow-md"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
        <span className="battle-water absolute -left-1 top-1 text-sm" aria-hidden="true">
          💧
        </span>
      </div>
    </div>
  );
}
