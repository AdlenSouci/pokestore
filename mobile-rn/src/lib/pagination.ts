/** Identique à `buildPageNumbers` dans `frontend/src/Pages/Shop.tsx`. */
export function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 0) {
    return [1];
  }
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let d = -2; d <= 2; d++) {
    const p = current + d;
    if (p >= 1 && p <= total) {
      set.add(p);
    }
  }
  const arr = [...set].sort((a, b) => a - b);
  const out: (number | 'ellipsis')[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (i > 0 && arr[i] - arr[i - 1] > 1) {
      out.push('ellipsis');
    }
    out.push(arr[i]);
  }
  return out;
}
