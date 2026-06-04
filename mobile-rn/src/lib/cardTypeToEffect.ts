/** Même logique que `frontend/src/components/CardDetailModal.tsx` — `getAnimationType`. */
export type EffectType = 'water' | 'fire' | 'electric' | 'psy' | 'flying' | 'dragon';

export function categoryToEffectType(category: string): EffectType | null {
  const type = category.toLowerCase();

  if (type.includes('water') || type.includes('eau')) return 'water';
  if (type.includes('fire') || type.includes('feu')) return 'fire';
  if (
    type.includes('lightning') ||
    type.includes('electric') ||
    type.includes('électr') ||
    type.includes('electrik')
  ) {
    return 'electric';
  }
  if (type.includes('psychic') || type.includes('psy')) return 'psy';
  if (type.includes('flying') || type.includes('colorless') || type.includes('normal')) return 'flying';
  if (type.includes('dragon')) return 'dragon';

  return null;
}
