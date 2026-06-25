import { BattleAnim } from './BattleAnim';

interface GbaBattleSceneProps {
  variant?: 'compact' | 'hero';
  className?: string;
}

/** @deprecated alias — utilise BattleAnim */
export function GbaBattleScene({ variant = 'compact', className = '' }: GbaBattleSceneProps) {
  return (
    <BattleAnim
      size={variant === 'hero' ? 'hero' : 'nav'}
      className={className}
    />
  );
}
