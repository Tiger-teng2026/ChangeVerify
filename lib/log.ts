const ALLOWED_LOG_KEYS = [
  "requestId",
  "taskCharCount",
  "diffCharCount",
  "model",
  "latencyMs",
  "httpStatus",
  "inputTokens",
  "outputTokens",
  "cachedInputTokens",
  "reasoningTokens",
  "errorCode",
  "attempt",
  "truncated",
  "upstreamStatus",
] as const;

type AllowedKey = (typeof ALLOWED_LOG_KEYS)[number];

export function logVerifyEvent(
  event: Partial<Record<AllowedKey, string | number | boolean | null>>,
) {
  const safe: Partial<Record<AllowedKey, string | number | boolean | null>> = {};
  for (const key of ALLOWED_LOG_KEYS) {
    if (key in event) safe[key] = event[key];
  }
  console.log(JSON.stringify(safe));
}
