import { HARD_MAX_DIFF_CHARS } from "@/lib/limits";

export {
  DIFF_TOO_LARGE_ERROR,
  HARD_MAX_DIFF_CHARS,
  MAX_TASK_CHARS,
  RECOMMENDED_DIFF_CHARS,
  diffLimitState,
} from "@/lib/limits";

/** Server hard max. MAX_DIFF_CHARS overrides the 50,000 default when it is a positive integer. */
export function readHardMaxDiffChars(): number {
  const raw = process.env["MAX_DIFF_CHARS"];
  if (!raw) return HARD_MAX_DIFF_CHARS;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return HARD_MAX_DIFF_CHARS;
  return parsed;
}

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-flash";

/** Responses API. JSON Schema structured output lives on this endpoint. */
export const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/responses";

export const MAX_OUTPUT_TOKENS = 8_192;
