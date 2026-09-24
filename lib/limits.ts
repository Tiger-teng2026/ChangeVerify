/** Small, single-task diffs at or below this size submit with no large-diff warning. */
export const RECOMMENDED_DIFF_CHARS = 30_000;

/** Diffs above this size are rejected. Sizes between the recommendation and this limit can still be submitted. */
export const HARD_MAX_DIFF_CHARS = 50_000;

export const MAX_TASK_CHARS = 15_000;

export const DIFF_TOO_LARGE_ERROR = `This diff is too large for the current verification mode.

Try verifying a smaller, single-task change.`;

export function diffLimitState(
  length: number,
  hardMax: number = HARD_MAX_DIFF_CHARS,
): "ok" | "large" | "too_large" {
  if (length > hardMax) return "too_large";
  if (length > RECOMMENDED_DIFF_CHARS) return "large";
  return "ok";
}
