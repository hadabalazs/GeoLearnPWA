import { seededShuffle } from './challenge';

// Build `count` multiple-choice options including the correct item, deterministically.
export function buildOptions(correct, all, seed, count = 4, idKey = 'id') {
  const others = all.filter((x) => x[idKey] !== correct[idKey]);
  const shuffled = seededShuffle(others, seed);
  const picks = shuffled.slice(0, count - 1);
  return seededShuffle([correct, ...picks], seed + 7);
}