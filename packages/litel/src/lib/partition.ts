export function partition<const INPUT, const REFINED extends INPUT>(
  array: INPUT[],
  predicate: (t: INPUT) => t is REFINED
): { pass: REFINED[]; fail: Exclude<INPUT, REFINED>[] };
export function partition<const INPUT>(
  array: INPUT[],
  predicate: (t: INPUT) => boolean
): { pass: INPUT[]; fail: INPUT[] };
export function partition<T>(array: T[], predicate: (t: T) => boolean): { pass: T[]; fail: T[] } {
  const pass: T[] = [];
  const fail: T[] = [];
  array.forEach((e) => (predicate(e) ? pass.push(e) : fail.push(e)));
  return { pass, fail };
}

export default partition;
