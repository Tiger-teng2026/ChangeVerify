"use client";

import type { ReportPreview } from "@/lib/report-token";
import type { VerificationReport } from "@/lib/schema";

const SESSION_KEY = "changeverify.payment";

export type StoredPreview = {
  access: "preview";
  requestId: string;
  verificationId: string;
  reportHash: string;
  unlockToken: string;
  truncated: boolean;
  preview: ReportPreview;
};

export type StoredFull = {
  access: "full";
  requestId: string;
  verificationId: string;
  truncated: boolean;
  report: VerificationReport;
};

export type StoredReport = StoredPreview | StoredFull;

export type PaymentSession = {
  unlockToken: string;
};

let current: StoredReport | null = null;

export function setStoredPreview(report: StoredPreview) {
  current = report;
  if (typeof window === "undefined") return;
  const session: PaymentSession = { unlockToken: report.unlockToken };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function setStoredFullReport(report: StoredFull) {
  current = report;
}

export function getStoredReport() {
  return current;
}

export function readPaymentSession(): PaymentSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PaymentSession;
    if (!parsed || typeof parsed.unlockToken !== "string" || parsed.unlockToken.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredReport() {
  current = null;
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
