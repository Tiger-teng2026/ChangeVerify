"use client";

import type { VerificationReport } from "@/lib/schema";

type AttemptLog = {
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

export type StoredReport = {
  requestId: string;
  endpoint: string;
  model: string;
  report: VerificationReport;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    cachedInputTokens: number | null;
    reasoningTokens: number | null;
  };
  latencyMs: number;
  retried: boolean;
  attempts: AttemptLog[];
  truncated: boolean;
  estimatedCostUsd: number | null;
  costBasis: string | null;
};

let current: StoredReport | null = null;

export function setStoredReport(report: StoredReport) {
  current = report;
}

export function getStoredReport() {
  return current;
}

export function clearStoredReport() {
  current = null;
}
