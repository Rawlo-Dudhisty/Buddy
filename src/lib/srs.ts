// SM-2 Spaced Repetition Algorithm
export function calculateNextReview(
  quality: number, // 0-5 (0=blackout, 5=perfect)
  repetitions: number,
  easeFactor: number,
  interval: number
): { interval: number; easeFactor: number; nextReview: Date } {
  let newInterval: number;
  let newEase = easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  if (newEase < 1.3) newEase = 1.3;

  if (quality < 3) {
    newInterval = 1;
  } else if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * easeFactor);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return { interval: newInterval, easeFactor: newEase, nextReview };
}

export function xpForQuality(quality: number): number {
  const map: Record<number, number> = { 5: 20, 4: 15, 3: 10, 2: 5, 1: 2, 0: 0 };
  return map[quality] ?? 5;
}
