import {
  DEEPSEEK_ENDPOINT,
  DEEPSEEK_MODEL,
  MAX_OUTPUT_TOKENS,
} from "@/lib/config";
import { logVerifyEvent } from "@/lib/log";
import { estimateCostUsd } from "@/lib/pricing";
import { buildVerifierInput, VERIFIER_INSTRUCTIONS } from "@/lib/prompt";
import { verificationJsonSchema, verificationReportSchema, type VerificationReport } from "@/lib/schema";

export type AttemptLog = {
  attempt: number;
  outcome: "ok" | "empty_response" | "json_parse_failed" | "schema_invalid" | "upstream_error";
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  reasoningTokens: number | null;
  truncated: boolean;
  upstreamStatus: number | null;
};

export type VerifySuccess = {
  ok: true;
  report: VerificationReport;
  model: string;
  endpoint: string;
  attempts: AttemptLog[];
  retried: boolean;
  truncated: boolean;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    cachedInputTokens: number | null;
    reasoningTokens: number | null;
  };
  estimatedCostUsd: number | null;
  costBasis: string | null;
};

export type VerifyFailure = {
  ok: false;
  errorCode: AttemptLog["outcome"] | "missing_api_key";
  model: string;
  endpoint: string;
  attempts: AttemptLog[];
  retried: boolean;
};

type Usage = {
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  reasoningTokens: number | null;
};

type UpstreamCall = {
  status: number;
  content: string;
  model: string;
  truncated: boolean;
  usage: Usage;
};

function emptyUsage(): Usage {
  return {
    inputTokens: null,
    outputTokens: null,
    cachedInputTokens: null,
    reasoningTokens: null,
  };
}

function readUsage(usage: unknown): Usage {
  if (!usage || typeof usage !== "object") return emptyUsage();
  const record = usage as Record<string, unknown>;
  const inputTokens = numberOrNull(record.input_tokens);
  const outputTokens = numberOrNull(record.output_tokens);
  const details = record.input_tokens_details;
  const outputDetails = record.output_tokens_details;
  const cachedInputTokens =
    details && typeof details === "object"
      ? numberOrNull((details as Record<string, unknown>).cached_tokens)
      : null;
  const reasoningTokens =
    outputDetails && typeof outputDetails === "object"
      ? numberOrNull((outputDetails as Record<string, unknown>).reasoning_tokens)
      : null;
  return { inputTokens, outputTokens, cachedInputTokens, reasoningTokens };
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractOutputText(payload: Record<string, unknown>): string {
  const output = payload.output;
  if (!Array.isArray(output)) return "";
  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (record.type !== "message" || !Array.isArray(record.content)) continue;
    for (const part of record.content) {
      if (!part || typeof part !== "object") continue;
      const content = part as Record<string, unknown>;
      if (content.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("");
}

async function callDeepSeek(originalTask: string, gitDiff: string): Promise<UpstreamCall> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("missing_api_key");
  }

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      instructions: VERIFIER_INSTRUCTIONS,
      input: buildVerifierInput(originalTask, gitDiff),
      reasoning: { effort: "none" },
      temperature: 0,
      max_output_tokens: MAX_OUTPUT_TOKENS,
      text: {
        format: {
          type: "json_schema",
          name: "verification_report",
          schema: verificationJsonSchema,
        },
      },
    }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!response.ok) {
    const error = new Error("upstream_error") as Error & { upstreamStatus: number };
    error.upstreamStatus = response.status;
    throw error;
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const incomplete =
    payload.incomplete_details &&
    typeof payload.incomplete_details === "object" &&
    (payload.incomplete_details as Record<string, unknown>).reason === "max_output_tokens";
  const status = typeof payload.status === "string" ? payload.status : "";
  if (status === "failed") {
    const error = new Error("upstream_error") as Error & { upstreamStatus: number };
    error.upstreamStatus = response.status;
    throw error;
  }

  return {
    status: response.status,
    content: extractOutputText(payload),
    model: typeof payload.model === "string" && payload.model.trim() ? payload.model : DEEPSEEK_MODEL,
    truncated: Boolean(incomplete) || status === "incomplete",
    usage: readUsage(payload.usage),
  };
}

function sumUsage(attempts: AttemptLog[]): Usage {
  let inputTokens = 0;
  let outputTokens = 0;
  let cachedInputTokens = 0;
  let reasoningTokens = 0;
  let sawInput = false;
  let sawOutput = false;
  let sawCached = false;
  let sawReasoning = false;
  for (const attempt of attempts) {
    if (attempt.inputTokens !== null) {
      inputTokens += attempt.inputTokens;
      sawInput = true;
    }
    if (attempt.outputTokens !== null) {
      outputTokens += attempt.outputTokens;
      sawOutput = true;
    }
    if (attempt.cachedInputTokens !== null) {
      cachedInputTokens += attempt.cachedInputTokens;
      sawCached = true;
    }
    if (attempt.reasoningTokens !== null) {
      reasoningTokens += attempt.reasoningTokens;
      sawReasoning = true;
    }
  }
  return {
    inputTokens: sawInput ? inputTokens : null,
    outputTokens: sawOutput ? outputTokens : null,
    cachedInputTokens: sawCached ? cachedInputTokens : null,
    reasoningTokens: sawReasoning ? reasoningTokens : null,
  };
}

function costForAttempts(model: string, attempts: AttemptLog[], at: Date) {
  let usd = 0;
  let basis: string | null = null;
  for (const attempt of attempts) {
    if (
      attempt.inputTokens === null ||
      attempt.outputTokens === null ||
      attempt.cachedInputTokens === null
    ) {
      return { estimatedCostUsd: null, costBasis: null };
    }
    const estimate = estimateCostUsd({
      model,
      at,
      inputTokens: attempt.inputTokens,
      cachedInputTokens: attempt.cachedInputTokens,
      outputTokens: attempt.outputTokens,
    });
    if (!estimate) return { estimatedCostUsd: null, costBasis: null };
    usd += estimate.usd;
    basis = estimate.basis;
  }
  return { estimatedCostUsd: Math.round(usd * 1e8) / 1e8, costBasis: basis };
}

export async function verifyChange(input: {
  requestId: string;
  originalTask: string;
  gitDiff: string;
}): Promise<VerifySuccess | VerifyFailure> {
  const attempts: AttemptLog[] = [];
  let lastCode: AttemptLog["outcome"] = "empty_response";
  let model = DEEPSEEK_MODEL;
  const startedAt = new Date();

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const started = Date.now();
    try {
      const upstream = await callDeepSeek(input.originalTask, input.gitDiff);
      model = upstream.model;
      const latencyMs = Date.now() - started;
      if (!upstream.content.trim()) {
        lastCode = "empty_response";
        const log = baseAttempt(attempt, "empty_response", latencyMs, upstream);
        attempts.push(log);
        logAttempt(input.requestId, model, log);
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(upstream.content);
      } catch {
        lastCode = "json_parse_failed";
        const log = baseAttempt(attempt, "json_parse_failed", latencyMs, upstream);
        attempts.push(log);
        logAttempt(input.requestId, model, log);
        continue;
      }

      const validated = verificationReportSchema.safeParse(parsed);
      if (!validated.success) {
        lastCode = "schema_invalid";
        const log = baseAttempt(attempt, "schema_invalid", latencyMs, upstream);
        attempts.push(log);
        logAttempt(input.requestId, model, log);
        continue;
      }

      const log = baseAttempt(attempt, "ok", latencyMs, upstream);
      attempts.push(log);
      logAttempt(input.requestId, model, log);
      const usage = sumUsage(attempts);
      const cost = costForAttempts(model, attempts, startedAt);
      return {
        ok: true,
        report: validated.data,
        model,
        endpoint: DEEPSEEK_ENDPOINT,
        attempts,
        retried: attempt > 1,
        truncated: upstream.truncated,
        usage,
        estimatedCostUsd: cost.estimatedCostUsd,
        costBasis: cost.costBasis,
      };
    } catch (error) {
      const latencyMs = Date.now() - started;
      if (error instanceof Error && error.message === "missing_api_key") {
        return {
          ok: false,
          errorCode: "missing_api_key",
          model,
          endpoint: DEEPSEEK_ENDPOINT,
          attempts,
          retried: false,
        };
      }
      const upstreamStatus =
        error && typeof error === "object" && "upstreamStatus" in error
          ? Number((error as { upstreamStatus?: number }).upstreamStatus) || null
          : null;
      lastCode = "upstream_error";
      const log: AttemptLog = {
        attempt,
        outcome: "upstream_error",
        latencyMs,
        ...emptyUsage(),
        truncated: false,
        upstreamStatus,
      };
      attempts.push(log);
      logAttempt(input.requestId, model, log);
    }
  }

  return {
    ok: false,
    errorCode: lastCode,
    model,
    endpoint: DEEPSEEK_ENDPOINT,
    attempts,
    retried: attempts.length > 1,
  };
}

function baseAttempt(
  attempt: number,
  outcome: AttemptLog["outcome"],
  latencyMs: number,
  upstream: UpstreamCall,
): AttemptLog {
  return {
    attempt,
    outcome,
    latencyMs,
    inputTokens: upstream.usage.inputTokens,
    outputTokens: upstream.usage.outputTokens,
    cachedInputTokens: upstream.usage.cachedInputTokens,
    reasoningTokens: upstream.usage.reasoningTokens,
    truncated: upstream.truncated,
    upstreamStatus: upstream.status,
  };
}

function logAttempt(requestId: string, model: string, attempt: AttemptLog) {
  logVerifyEvent({
    requestId,
    model,
    attempt: attempt.attempt,
    latencyMs: attempt.latencyMs,
    inputTokens: attempt.inputTokens,
    outputTokens: attempt.outputTokens,
    cachedInputTokens: attempt.cachedInputTokens,
    reasoningTokens: attempt.reasoningTokens,
    errorCode: attempt.outcome === "ok" ? null : attempt.outcome,
    truncated: attempt.truncated,
    upstreamStatus: attempt.upstreamStatus,
  });
}
