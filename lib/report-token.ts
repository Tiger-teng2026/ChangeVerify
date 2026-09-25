import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { VerificationReport } from "@/lib/schema";

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

export type ReportPreview = {
  verdict: VerificationReport["verdict"];
  summary: string;
  filesChanged: number;
  reviewFocus: string[];
};

type TokenPayload = {
  verificationId: string;
  reportHash: string;
  requestId: string;
  truncated: boolean;
  exp: number;
  report: VerificationReport;
};

export type SealedReport = {
  verificationId: string;
  reportHash: string;
  unlockToken: string;
  preview: ReportPreview;
};

function tokenKey(): Buffer {
  const secret = process.env.REPORT_TOKEN_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("missing_report_secret");
  }
  return createHash("sha256").update(secret).digest();
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableJson(item)).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function hashReport(report: VerificationReport): string {
  return createHash("sha256").update(stableJson(report)).digest("hex");
}

export function buildPreview(report: VerificationReport): ReportPreview {
  return {
    verdict: report.verdict,
    summary: report.summary,
    filesChanged: report.filesChanged,
    reviewFocus: report.reviewFocus.slice(0, 3),
  };
}

export function sealReport(input: {
  requestId: string;
  truncated: boolean;
  report: VerificationReport;
}): SealedReport {
  const verificationId = crypto.randomUUID();
  const reportHash = hashReport(input.report);
  const payload: TokenPayload = {
    verificationId,
    reportHash,
    requestId: input.requestId,
    truncated: input.truncated,
    exp: Date.now() + TOKEN_TTL_MS,
    report: input.report,
  };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const unlockToken = [
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
  return {
    verificationId,
    reportHash,
    unlockToken,
    preview: buildPreview(input.report),
  };
}

export function openReportToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const iv = Buffer.from(parts[0] ?? "", "base64url");
    const tag = Buffer.from(parts[1] ?? "", "base64url");
    const ciphertext = Buffer.from(parts[2] ?? "", "base64url");
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) return null;
    const decipher = createDecipheriv("aes-256-gcm", tokenKey(), iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    const payload = JSON.parse(json) as TokenPayload;
    if (!payload || typeof payload !== "object") return null;
    if (typeof payload.verificationId !== "string" || typeof payload.reportHash !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (!payload.report || hashReport(payload.report) !== payload.reportHash) return null;
    return payload;
  } catch {
    return null;
  }
}
