import { readHardMaxDiffChars } from "@/lib/config";
import { verifyChange } from "@/lib/deepseek";
import { DIFF_TOO_LARGE_ERROR, MAX_TASK_CHARS } from "@/lib/limits";
import { logVerifyEvent } from "@/lib/log";
import { sealReport } from "@/lib/report-token";
import { z } from "zod";

const requestSchema = z
  .object({
    originalTask: z.string(),
    gitDiff: z.string(),
  })
  .strict();

const TEMPORARY_FAILURE = "Verification temporarily failed. Please try again.";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const started = Date.now();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return finish(requestId, started, 400, { error: "Request body must be JSON." }, {
      errorCode: "invalid_json",
      taskCharCount: null,
      diffCharCount: null,
    });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return finish(requestId, started, 400, {
      error: "Request body must contain only originalTask and gitDiff.",
    }, {
      errorCode: "invalid_body",
      taskCharCount: null,
      diffCharCount: null,
    });
  }

  const { originalTask, gitDiff } = parsed.data;
  const taskCharCount = originalTask.length;
  const diffCharCount = gitDiff.length;

  if (originalTask.trim().length === 0) {
    return finish(requestId, started, 400, { error: "Original task is required." }, {
      errorCode: "empty_task",
      taskCharCount,
      diffCharCount,
    });
  }

  if (gitDiff.trim().length === 0) {
    return finish(requestId, started, 400, { error: "Git diff is required." }, {
      errorCode: "empty_diff",
      taskCharCount,
      diffCharCount,
    });
  }

  if (taskCharCount > MAX_TASK_CHARS) {
    return finish(requestId, started, 400, {
      error: `Original task must be ${MAX_TASK_CHARS} characters or fewer.`,
    }, {
      errorCode: "task_too_long",
      taskCharCount,
      diffCharCount,
    });
  }

  if (diffCharCount > readHardMaxDiffChars()) {
    return finish(requestId, started, 400, {
      error: DIFF_TOO_LARGE_ERROR,
    }, {
      errorCode: "diff_too_long",
      taskCharCount,
      diffCharCount,
    });
  }

  const result = await verifyChange({ requestId, originalTask, gitDiff });
  if (!result.ok) {
    const httpStatus = result.errorCode === "missing_api_key" ? 500 : 502;
    return finish(requestId, started, httpStatus, { error: TEMPORARY_FAILURE }, {
      errorCode: result.errorCode,
      taskCharCount,
      diffCharCount,
      model: result.model,
      inputTokens: sum(result.attempts.map((attempt) => attempt.inputTokens)),
      outputTokens: sum(result.attempts.map((attempt) => attempt.outputTokens)),
    });
  }

  let sealed;
  try {
    sealed = sealReport({
      requestId,
      truncated: result.truncated,
      report: result.report,
    });
  } catch {
    return finish(requestId, started, 500, { error: TEMPORARY_FAILURE }, {
      errorCode: "missing_report_secret",
      taskCharCount,
      diffCharCount,
      model: result.model,
    });
  }

  return finish(requestId, started, 200, {
    requestId,
    verificationId: sealed.verificationId,
    reportHash: sealed.reportHash,
    unlockToken: sealed.unlockToken,
    preview: sealed.preview,
    truncated: result.truncated,
  }, {
    taskCharCount,
    diffCharCount,
    model: result.model,
    inputTokens: result.usage.inputTokens,
    outputTokens: result.usage.outputTokens,
    cachedInputTokens: result.usage.cachedInputTokens,
    reasoningTokens: result.usage.reasoningTokens,
    truncated: result.truncated,
    errorCode: null,
  });
}

function sum(values: Array<number | null>): number | null {
  if (values.some((value) => value === null)) return null;
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function finish(
  requestId: string,
  started: number,
  httpStatus: number,
  body: Record<string, unknown>,
  event: Parameters<typeof logVerifyEvent>[0],
) {
  logVerifyEvent({
    requestId,
    httpStatus,
    latencyMs: Date.now() - started,
    ...event,
  });
  return Response.json({ requestId, ...body }, { status: httpStatus });
}
