/**
 * Formal V1 diff cap is 30,000 characters.
 * Capacity-test presets remain available via MAX_DIFF_CHARS:
 * 5000 | 15000 | 30000 | 50000
 */
function readMaxDiffChars(): number {
  const raw = process.env.MAX_DIFF_CHARS;
  if (!raw) return 30_000;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return 30_000;
  return parsed;
}

export const MAX_TASK_CHARS = 15_000;
export const MAX_DIFF_CHARS = readMaxDiffChars();

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-flash";

/** Responses API. JSON Schema structured output lives on this endpoint. */
export const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/responses";

export const MAX_OUTPUT_TOKENS = 8_192;
